"use client";
import { useState } from "react";
import { api } from "../lib/api";
import MyPosts from "./MyPosts";

export default function Profile({ user, token, posts, reload, onAuthError, onLogout, onDeleted, onNewPost, notify }) {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mine = posts.filter((p) => p.ownerEmail === user.email);
  const openCount = mine.filter((p) => p.status === "open").length;
  const totalInterested = mine.reduce((n, p) => n + (p.interestCount || 0), 0);

  async function deleteAccount(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/me", { method: "DELETE", token, body: { password } });
      onDeleted();
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message);
      setLoading(false);
    }
  }

  const stat = (n, label) => (
    <div style={{ background: "rgba(15,33,88,0.04)", border: "1px solid rgba(15,33,88,0.1)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f2158", lineHeight: 1.1 }}>{n}</div>
      <div style={{ fontSize: "0.72rem", color: "#8696b0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 0 0", display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in-up">
      {/* Profile card */}
      <section className="glass-card hm-pad" style={{ padding: "26px 28px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0f2158, #c8922a, #0f2158)", borderRadius: "18px 18px 0 0" }} />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(145deg, #0f2158, #1d3a8a)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: "1.6rem",
              fontWeight: 800,
              boxShadow: "0 6px 18px rgba(15,33,88,0.3), 0 0 0 3px rgba(200,146,42,0.5)",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: "1 1 180px", minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.5rem", color: "#0c1a3a", margin: 0, wordBreak: "break-word" }}>
              {user.name}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#8696b0", margin: "3px 0 0", wordBreak: "break-all" }}>{user.email}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button onClick={onLogout} className="btn-ghost" style={{ padding: "9px 18px", fontSize: "0.85rem" }}>
              Logout
            </button>
            <button onClick={() => setConfirming(true)} className="btn-danger" style={{ padding: "9px 18px", fontSize: "0.85rem" }}>
              Delete account
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 22 }}>
          {stat(mine.length, "Posts")}
          {stat(openCount, "Open")}
          {stat(totalInterested, "Interested")}
        </div>
      </section>

      {/* My posts */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.3rem", color: "#0c1a3a", margin: 0 }}>My Posts</h3>
          <p style={{ color: "#8696b0", margin: "3px 0 0", fontSize: "0.84rem" }}>
            Manage your listings and see who wants to join your team.
          </p>
        </div>
        <MyPosts posts={posts} user={user} token={token} reload={reload} onAuthError={onAuthError} onNewPost={onNewPost} notify={notify} />
      </section>

      {/* Delete account modal */}
      {confirming && (
        <div
          className="animate-fade-in"
          onClick={() => !loading && setConfirming(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            overflowY: "auto",
            background: "rgba(6, 13, 31, 0.62)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={deleteAccount}
            className="animate-scale-in hm-pad"
            style={{
              background: "rgba(252, 253, 255, 0.98)",
              border: "1px solid rgba(12, 26, 58, 0.1)",
              borderRadius: 22,
              padding: "28px 26px 24px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 28px 70px rgba(6,13,31,0.25)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #b91c1c, #c8922a, #b91c1c)", borderRadius: "22px 22px 0 0" }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.3rem", color: "#b91c1c", margin: 0 }}>
              Delete your account?
            </h3>
            <p style={{ fontSize: "0.84rem", color: "#4a5878", margin: 0, lineHeight: 1.6 }}>
              This permanently deletes your account, all your posts, the interests on them, and the interests you sent to others. This cannot be undone.
            </p>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div style={{ background: "rgba(185,28,28,0.07)", border: "1px solid rgba(185,28,28,0.22)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "#b91c1c" }}>
                ⚠ {error}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" disabled={loading} onClick={() => setConfirming(false)} className="btn-ghost" style={{ padding: "10px 20px" }}>
                Cancel
              </button>
              <button disabled={loading} className="btn-danger" style={{ padding: "10px 22px" }}>
                {loading ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}