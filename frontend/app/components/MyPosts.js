"use client";
import { useState } from "react";
import { api, timeAgo } from "../lib/api";

export default function MyPosts({ posts, user, token, reload, onAuthError, onNewPost, notify }) {
  const mine = posts.filter((p) => p.ownerEmail === user.email);
  const [openId, setOpenId] = useState(null);
  const [interests, setInterests] = useState({});

  async function guard(fn) {
    try {
      await fn();
    } catch (err) {
      if (err.status === 401) onAuthError();
      else notify(err.message, "error");
    }
  }

  const toggleInterests = (p) =>
    guard(async () => {
      if (openId === p.id) return setOpenId(null);
      const list = await api(`/posts/${p.id}/interests`, { token });
      setInterests((cur) => ({ ...cur, [p.id]: list }));
      setOpenId(p.id);
    });

  const toggleStatus = (p) =>
    guard(async () => {
      const status = p.status === "open" ? "closed" : "open";
      await api(`/posts/${p.id}`, { method: "PATCH", token, body: { status } });
      await reload();
      notify(status === "closed" ? "Post closed" : "Post reopened");
    });

  const remove = (p) =>
    guard(async () => {
      if (!confirm(`Delete "${p.hackathon}"? This cannot be undone.`)) return;
      await api(`/posts/${p.id}`, { method: "DELETE", token });
      await reload();
      notify("Post deleted");
    });

  if (mine.length === 0)
    return (
      <div className="glass-card animate-fade-in" style={{ textAlign: "center", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: "2.4rem" }}>📋</div>
        <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0c1a3a", margin: 0 }}>No posts yet</h4>
        <p style={{ color: "#8696b0", fontSize: "0.88rem", margin: 0 }}>Post your hackathon and let teammates come to you.</p>
        {onNewPost && (
          <button onClick={onNewPost} className="btn-gold" style={{ padding: "10px 22px", marginTop: 4 }}>
            + New Post
          </button>
        )}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {mine.map((p) => {
        const list = interests[p.id] || [];
        const isOpen = openId === p.id;

        return (
          <div key={p.id} className="glass-card animate-fade-in-up" style={{ padding: "18px 20px" }}>
            {/* Header */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.02rem", color: "#0c1a3a", margin: "0 0 4px 0", overflowWrap: "anywhere" }}>
                  {p.hackathon}
                </h4>
                <p style={{ fontSize: "0.78rem", color: "#8696b0", margin: 0, lineHeight: 1.5 }}>
                  {timeAgo(p.createdAt)} · needs {p.teamSize} teammate{p.teamSize !== 1 ? "s" : ""} ·{" "}
                  <span style={{ color: "#8a5a00", fontWeight: 600 }}>{p.skills.join(", ")}</span>
                </p>
              </div>
              <span className={p.status === "open" ? "badge-open" : "badge-closed"}>{p.status === "open" ? "Open" : "Closed"}</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              <button onClick={() => toggleInterests(p)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
                {isOpen ? "Hide" : "👥 Interested"} ({p.interestCount || 0})
              </button>
              <button onClick={() => toggleStatus(p)} className="btn-ghost" style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
                {p.status === "open" ? "🔒 Close post" : "🔓 Reopen"}
              </button>
              <button onClick={() => remove(p)} className="btn-danger" style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
                🗑️ Delete
              </button>
            </div>

            {/* Interested people */}
            {isOpen && (
              <div className="animate-slide-down" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(12,26,58,0.08)" }}>
                {list.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>🕐</div>
                    <p style={{ fontSize: "0.85rem", color: "#8696b0", margin: 0 }}>No one has shown interest yet. Share your post!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {list.map((i) => (
                      <div key={i.userEmail} style={{ background: "rgba(15,33,88,0.04)", border: "1px solid rgba(15,33,88,0.1)", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: "#0c1a3a", fontSize: "0.9rem" }}>👤 {i.name}</span>
                          <span style={{ fontSize: "0.74rem", color: "#8696b0" }}>{timeAgo(i.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: "0.83rem", color: "#4a5878", marginBottom: i.message ? 8 : 0, overflowWrap: "anywhere" }}>
                          <span style={{ color: "#8696b0" }}>Contact: </span>
                          {/^https?:\/\//.test(i.contact) ? (
                            <a href={i.contact} target="_blank" rel="noopener noreferrer" style={{ color: "#0f2158", fontWeight: 700, textDecoration: "underline" }}>
                              {i.contact}
                            </a>
                          ) : (
                            <strong style={{ color: "#0f2158" }}>{i.contact}</strong>
                          )}
                        </div>
                        {i.message && (
                          <p style={{ fontSize: "0.82rem", color: "#4a5878", margin: 0, background: "rgba(200,146,42,0.07)", borderRadius: 8, padding: "8px 10px", fontStyle: "italic", overflowWrap: "anywhere" }}>
                            "{i.message}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}