const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const USERS = process.env.USERS_TABLE;
const POSTS = process.env.POSTS_TABLE;
const INTERESTS = process.env.INTERESTS_TABLE;
const BUCKET = process.env.PHOTO_BUCKET;
const SECRET = process.env.JWT_SECRET;

const res = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function getUser(event) {
  const h = event.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

// NEW: scan a table fully (follows pagination)
async function scanAll(params) {
  let items = [], key;
  do {
    const out = await db.send(new ScanCommand({ ...params, ExclusiveStartKey: key }));
    items = items.concat(out.Items || []);
    key = out.LastEvaluatedKey;
  } while (key);
  return items;
}

async function getOwnedPost(id, user) {
  const out = await db.send(new GetCommand({ TableName: POSTS, Key: { id } }));
  if (!out.Item) return { error: res(404, { error: "Post not found" }) };
  if (out.Item.ownerEmail !== user.email)
    return { error: res(403, { error: "Not your post" }) };
  return { post: out.Item };
}

exports.handler = async (event) => {
  try {
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    let body = {};
    if (event.body) {
      const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
      body = JSON.parse(raw);
    }

    // ---------- PUBLIC ROUTES ----------
    if (method === "POST" && path === "/register") {
      const { name, email, password } = body;
      if (!name || !email || !password || password.length < 6)
        return res(400, { error: "Name, email and password (min 6 chars) required" });
      const passwordHash = await bcrypt.hash(password, 10);
      try {
        await db.send(new PutCommand({
          TableName: USERS,
          Item: { email: email.toLowerCase(), name, passwordHash, createdAt: Date.now() },
          ConditionExpression: "attribute_not_exists(email)",
        }));
      } catch (e) {
        if (e.name === "ConditionalCheckFailedException")
          return res(409, { error: "Email already registered" });
        throw e;
      }
      return res(201, { message: "Registered" });
    }

    if (method === "POST" && path === "/login") {
      const { email, password } = body;
      const out = await db.send(new GetCommand({
        TableName: USERS, Key: { email: (email || "").toLowerCase() },
      }));
      const user = out.Item;
      if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
        return res(401, { error: "Invalid email or password" });
      const token = jwt.sign({ email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });
      return res(200, { token, user: { email: user.email, name: user.name } });
    }

    if (method === "GET" && path === "/posts") {
      const out = await db.send(new ScanCommand({ TableName: POSTS }));
      const posts = (out.Items || []).sort((a, b) => b.createdAt - a.createdAt);
      return res(200, posts);
    }

    // ---------- PROTECTED ROUTES ----------
    const user = getUser(event);
    if (!user) return res(401, { error: "Login required" });

    // NEW: Delete own account (password required)
    if (method === "DELETE" && path === "/me") {
      const u = await db.send(new GetCommand({ TableName: USERS, Key: { email: user.email } }));
      if (!u.Item || !(await bcrypt.compare(body.password || "", u.Item.passwordHash)))
        return res(403, { error: "Wrong password" });

      // 1. user's own posts + the interests on them
      const myPosts = await scanAll({
        TableName: POSTS,
        FilterExpression: "ownerEmail = :e",
        ExpressionAttributeValues: { ":e": user.email },
      });
      for (const p of myPosts) {
        const q = await db.send(new QueryCommand({
          TableName: INTERESTS,
          KeyConditionExpression: "postId = :p",
          ExpressionAttributeValues: { ":p": p.id },
        }));
        for (const it of q.Items || []) {
          await db.send(new DeleteCommand({ TableName: INTERESTS, Key: { postId: p.id, userEmail: it.userEmail } }));
        }
        await db.send(new DeleteCommand({ TableName: POSTS, Key: { id: p.id } }));
      }

      // 2. interests this user sent on other people's posts
      const sent = await scanAll({
        TableName: INTERESTS,
        FilterExpression: "userEmail = :e",
        ExpressionAttributeValues: { ":e": user.email },
      });
      for (const it of sent) {
        await db.send(new DeleteCommand({ TableName: INTERESTS, Key: { postId: it.postId, userEmail: user.email } }));
        try {
          await db.send(new UpdateCommand({
            TableName: POSTS, Key: { id: it.postId },
            UpdateExpression: "ADD interestCount :m",
            ConditionExpression: "attribute_exists(id)",
            ExpressionAttributeValues: { ":m": -1 },
          }));
        } catch (e) {
          if (e.name !== "ConditionalCheckFailedException") throw e;
        }
      }

      // 3. the user itself
      await db.send(new DeleteCommand({ TableName: USERS, Key: { email: user.email } }));
      return res(200, { message: "Account deleted" });
    }

    // Create post
    if (method === "POST" && path === "/posts") {
      const { hackathon, description, skills, teamSize, imageUrl } = body;
      const size = Number(teamSize);
      if (!hackathon || !Array.isArray(skills) || skills.length === 0 || !(size >= 1 && size <= 10))
        return res(400, { error: "hackathon, skills[] and teamSize (1-10) required" });
      if (imageUrl && !imageUrl.startsWith(`https://${BUCKET}.s3.`))
        return res(400, { error: "Invalid image URL" });
      const post = {
        id: crypto.randomUUID(),
        hackathon: String(hackathon).slice(0, 100),
        description: String(description || "").slice(0, 500),
        skills: skills.slice(0, 8).map((s) => String(s).slice(0, 30)),
        teamSize: size,
        imageUrl: imageUrl || "",
        status: "open",
        interestCount: 0,
        ownerEmail: user.email,
        ownerName: user.name,
        createdAt: Date.now(),
      };
      await db.send(new PutCommand({ TableName: POSTS, Item: post }));
      return res(201, post);
    }

    // Presigned URL for optional poster image (S3)
    if (method === "POST" && path === "/upload-url") {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[body.contentType];
      if (!ext) return res(400, { error: "Only jpeg/png/webp allowed" });
      const key = `uploads/${crypto.randomUUID()}.${ext}`;
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: body.contentType }),
        { expiresIn: 300 }
      );
      return res(200, {
        uploadUrl,
        imageUrl: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      });
    }

    // Show interest: POST /posts/{id}/interest
    let m = path.match(/^\/posts\/([\w-]+)\/interest$/);
    if (m && method === "POST") {
      const id = m[1];
      const found = await db.send(new GetCommand({ TableName: POSTS, Key: { id } }));
      const post = found.Item;
      if (!post) return res(404, { error: "Post not found" });
      if (post.status !== "open") return res(400, { error: "This post is closed" });
      if (post.ownerEmail === user.email)
        return res(400, { error: "You can't show interest in your own post" });
      const { message, contact } = body;
      if (!contact) return res(400, { error: "Contact is required" });
      try {
        await db.send(new PutCommand({
          TableName: INTERESTS,
          Item: {
            postId: id, userEmail: user.email, name: user.name,
            message: String(message || "").slice(0, 300),
            contact: String(contact).slice(0, 100),
            createdAt: Date.now(),
          },
          ConditionExpression: "attribute_not_exists(postId)",
        }));
      } catch (e) {
        if (e.name === "ConditionalCheckFailedException")
          return res(409, { error: "You already showed interest" });
        throw e;
      }
      await db.send(new UpdateCommand({
        TableName: POSTS, Key: { id },
        UpdateExpression: "ADD interestCount :one",
        ExpressionAttributeValues: { ":one": 1 },
      }));
      return res(201, { message: "Interest sent" });
    }

    // See interested people (owner only): GET /posts/{id}/interests
    m = path.match(/^\/posts\/([\w-]+)\/interests$/);
    if (m && method === "GET") {
      const id = m[1];
      const { error } = await getOwnedPost(id, user);
      if (error) return error;
      const out = await db.send(new QueryCommand({
        TableName: INTERESTS,
        KeyConditionExpression: "postId = :p",
        ExpressionAttributeValues: { ":p": id },
      }));
      return res(200, out.Items || []);
    }

    // Close/reopen or delete post (owner only): /posts/{id}
    m = path.match(/^\/posts\/([\w-]+)$/);
    if (m && (method === "PATCH" || method === "DELETE")) {
      const id = m[1];
      const { error } = await getOwnedPost(id, user);
      if (error) return error;

      if (method === "DELETE") {
        const q = await db.send(new QueryCommand({
          TableName: INTERESTS,
          KeyConditionExpression: "postId = :p",
          ExpressionAttributeValues: { ":p": id },
        }));
        for (const it of q.Items || []) {
          await db.send(new DeleteCommand({
            TableName: INTERESTS, Key: { postId: id, userEmail: it.userEmail },
          }));
        }
        await db.send(new DeleteCommand({ TableName: POSTS, Key: { id } }));
        return res(200, { message: "Deleted" });
      }

      const status = body.status === "open" ? "open" : "closed";
      await db.send(new UpdateCommand({
        TableName: POSTS, Key: { id },
        UpdateExpression: "SET #s = :s",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":s": status },
      }));
      return res(200, { message: `Post ${status}` });
    }

    return res(404, { error: "Route not found" });
  } catch (e) {
    console.error(e);
    return res(500, { error: "Server error" });
  }
};