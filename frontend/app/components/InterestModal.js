"use client";
import { useState } from "react";

export default function InterestModal({ post, onClose, onSubmit }) {
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ contact: contact.trim(), message: message.trim() });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(6, 13, 31, 0.62)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto",
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-scale-in hm-pad"
        style={{
          background: "rgba(252, 253, 255, 0.97)",
          border: "1px solid rgba(12, 26, 58, 0.1)",
          borderRadius: 22,
          padding: "30px 28px 26px",
          width: "100%", maxWidth: 460,
          boxShadow: "0 28px 70px rgba(6,13,31,0.25)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Gold accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0f2158, #c8922a, #0f2158)", borderRadius: "22px 22px 0 0" }} />

        {/* Close */}
        <button type="button" onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, width: 30, height: 30,
            borderRadius: "50%", border: "none",
            background: "rgba(15,33,88,0.07)", color: "#0f2158",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem", fontWeight: 300, transition: "background 0.18s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(15,33,88,0.13)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(15,33,88,0.07)"}
        >
          ×
        </button>

        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: "linear-gradient(145deg, #0f2158, #1d3a8a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, boxShadow: "0 6px 18px rgba(15,33,88,0.3)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#c8922a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.3rem", color: "#0c1a3a", margin: "0 0 4px 0" }}>
          Join {post.hackathon}
        </h2>
        <p style={{ fontSize: "0.81rem", color: "#8696b0", margin: "0 0 22px 0" }}>
          🔒 Only <strong style={{ color: "#0f2158" }}>{post.ownerName}</strong> will see your contact details.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: "0.73rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Your Contact *
            </label>
            <input className="form-input" placeholder="WhatsApp / LinkedIn / GitHub URL" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} required />
          </div>

          <div>
            <label style={{ fontSize: "0.73rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Message (optional)
            </label>
            <textarea className="form-input" rows={3} placeholder="Your skills, past projects, why you'd be a great fit..." value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} style={{ resize: "none", lineHeight: 1.6 }} />
            <div style={{ textAlign: "right", fontSize: "0.72rem", color: "#b0bcd0", marginTop: 3 }}>{message.length}/300</div>
          </div>

          {error && (
            <div style={{ background: "rgba(185,28,28,0.07)", border: "1px solid rgba(185,28,28,0.22)", borderRadius: 10, padding: "10px 14px", fontSize: "0.81rem", color: "#b91c1c" }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: "10px 20px" }}>
              Cancel
            </button>
            <button disabled={loading} className="btn-gold" style={{ padding: "10px 24px" }}>
              {loading ? "Sending..." : "Send Interest →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}