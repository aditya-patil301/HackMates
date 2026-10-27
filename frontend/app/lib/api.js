export const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export const SKILLS = ["React", "Node.js", "Python", "Java", "UI/UX", "ML/AI", "Flutter", "Android", "Cloud/AWS", "DevOps", "Data Science", "Cybersecurity"];

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} day(s) ago`;
}

// Resize + compress before upload (faster upload, faster page load)
export function compressImage(file, maxW = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image compress failed"))), "image/jpeg", 0.8);
    };
    img.onerror = () => reject(new Error("Invalid image file"));
    img.src = url;
  });
}

// Browser -> presigned URL -> S3 directly
export async function uploadImage(file, token) {
  const blob = await compressImage(file);
  const { uploadUrl, imageUrl } = await api("/upload-url", { method: "POST", token, body: { contentType: "image/jpeg" } });
  const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: blob });
  if (!put.ok) throw new Error("Image upload failed");
  return imageUrl;
}