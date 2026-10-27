"use client";
import { useState } from "react";
import { api, uploadImage, SKILLS } from "../lib/api";

export default function PostForm({ token, onCreated, onAuthError }) {
  const [hackathon, setHackathon] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [teamSize, setTeamSize] = useState(1);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (s) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.length < 8 ? [...cur, s] : cur));

  async function submit(e) {
    e.preventDefault();
    if (!hackathon.trim()) return setError("Hackathon name is required");
    if (skills.length === 0) return setError("Select at least one skill");
    setError("");
    setLoading(true);
    try {
      const imageUrl = file ? await uploadImage(file, token) : "";
      await api("/posts", { method: "POST", token, body: { hackathon: hackathon.trim(), description: description.trim(), skills, teamSize, imageUrl } });
      onCreated();
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "8px 0 40px" }} className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, rgba(15,33,88,0.07), rgba(200,146,42,0.07))",
          border: "1px solid rgba(200,146,42,0.28)", borderRadius: 12, padding: "7px 18px",
          marginBottom: 16, fontSize: "0.82rem", fontWeight: 600, color: "#8a5a00", letterSpacing: "0.03em",
        }}>
          ✦ New Post
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.8rem", color: "#0c1a3a", margin: 0, letterSpacing: "-0.02em" }}>
          Post your hackathon
        </h2>
        <p style={{ color: "#8696b0", marginTop: 7, fontSize: "0.875rem" }}>
          Tell us about your project and attract the right teammates.
        </p>
      </div>

      {/* Gold divider */}
      <hr style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(200,146,42,0.4), transparent)", border: "none", marginBottom: 28 }} />

      <form onSubmit={submit} className="glass-card hm-pad" style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Hackathon name */}
        <div>
          <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Hackathon Name *
          </label>
          <input className="form-input" placeholder="e.g. Smart India Hackathon 2026" value={hackathon} onChange={(e) => setHackathon(e.target.value)} maxLength={100} />
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Description
          </label>
          <textarea className="form-input" rows={4} placeholder="What are you building? Your vision, tech stack, any details for potential teammates..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} style={{ resize: "vertical", lineHeight: 1.6 }} />
          <div style={{ textAlign: "right", fontSize: "0.73rem", color: "#b0bcd0", marginTop: 4 }}>{description.length}/500</div>
        </div>

        {/* Skills */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e2d45", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Skills Needed *
            </label>
            <span style={{ fontSize: "0.74rem", color: "#c8922a", fontWeight: 700, background: "rgba(200,146,42,0.1)", padding: "2px 10px", borderRadius: 999, border: "1px solid rgba(200,146,42,0.22)" }}>
              {skills.length}/8
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SKILLS.map((s) => (
              <button type="button" key={s} onClick={() => toggle(s)} className={`skill-pill${skills.includes(s) ? " active" : ""}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Team size */}
        <div>
          <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Teammates Needed
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setTeamSize(n)}
                style={{
                  width: 42, height: 42, borderRadius: 10,
                  border: teamSize === n ? "2px solid #0f2158" : "1.5px solid rgba(12,26,58,0.15)",
                  background: teamSize === n ? "linear-gradient(135deg, #0f2158, #1d3a8a)" : "rgba(255,255,255,0.7)",
                  color: teamSize === n ? "white" : "#1e2d45",
                  fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: teamSize === n ? "0 4px 12px rgba(15,33,88,0.28)" : "none",
                  fontFamily: "inherit",
                }}>
                {n}
              </button>
            ))}
            <span style={{ fontSize: "0.78rem", color: "#b0bcd0" }}>or</span>
            <input className="form-input" type="number" min={1} max={10} value={teamSize}
              onChange={(e) => setTeamSize(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} style={{ width: 80 }} />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Poster / Banner (optional)
          </label>
          <label
            style={{
              display: "block", border: "2px dashed rgba(200,146,42,0.3)", borderRadius: 12,
              padding: "18px", textAlign: "center", cursor: "pointer",
              background: "rgba(200,146,42,0.02)", transition: "all 0.18s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c8922a"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,146,42,0.3)"}
          >
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} style={{ display: "none" }} />
            {file ? (
              <span style={{ fontSize: "0.84rem", color: "#8a5a00", fontWeight: 700 }}>📎 {file.name}</span>
            ) : (
              <>
                <div style={{ fontSize: "1.4rem", marginBottom: 5 }}>🖼</div>
                <span style={{ fontSize: "0.81rem", color: "#8696b0" }}>Click to upload PNG, JPG or WebP</span>
              </>
            )}
          </label>
          {file && <img src={URL.createObjectURL(file)} alt="preview" style={{ marginTop: 10, height: 120, width: "100%", objectFit: "cover", borderRadius: 12 }} />}
        </div>

        {error && (
          <div style={{ background: "rgba(185,28,28,0.07)", border: "1px solid rgba(185,28,28,0.22)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "#b91c1c" }}>
            ⚠ {error}
          </div>
        )}

        <button disabled={loading} className="btn-gold" style={{ width: "100%", padding: "13px", fontSize: "0.95rem" }}>
          {loading ? "Publishing..." : "Publish Post →"}
        </button>
      </form>
    </div>
  );
}