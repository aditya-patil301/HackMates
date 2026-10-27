"use client";
import { useState } from "react";
import { api } from "../lib/api";

export default function AuthForm({ mode, onLoggedIn, onSwitch }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) await api("/register", { method: "POST", body: form });
      const data = await api("/login", { method: "POST", body: { email: form.email, password: form.password } });
      onLoggedIn(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "62vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }} className="animate-fade-in">
      {/* Orbs */}
      <div className="hero-orb" style={{ width: 350, height: 350, background: "#0f2158", top: "5%", left: "2%", opacity: 0.06 }} />
      <div className="hero-orb" style={{ width: 280, height: 280, background: "#c8922a", bottom: "5%", right: "3%", opacity: 0.06 }} />

      <form onSubmit={submit} className="glass-card animate-scale-in hm-pad" style={{ width: "100%", maxWidth: 420, padding: "36px 32px", position: "relative", zIndex: 1 }}>
        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0f2158, #c8922a, #0f2158)", borderRadius: "18px 18px 0 0" }} />

        {/* Icon badge */}
        <div style={{
          width: 50, height: 50, borderRadius: 13,
          background: "linear-gradient(145deg, #0f2158, #1d3a8a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20, boxShadow: "0 6px 20px rgba(15,33,88,0.3)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {isRegister ? (
              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.55rem", color: "#0c1a3a", margin: "0 0 4px 0" }}>
          {isRegister ? "Create your account" : "Welcome back"}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#8696b0", margin: "0 0 26px 0" }}>
          {isRegister ? "Find teammates for your next hackathon." : "Sign in to manage your hackathon posts."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Full Name
              </label>
              <input className="form-input" placeholder="John Doe" value={form.name} onChange={set("name")} required />
            </div>
          )}
          <div>
            <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Email
            </label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "#1e2d45", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Password
            </label>
            <input className="form-input" type="password" placeholder={isRegister ? "Min. 6 characters" : "Your password"} value={form.password} onChange={set("password")} minLength={6} required />
          </div>

          {error && (
            <div style={{ background: "rgba(185,28,28,0.07)", border: "1px solid rgba(185,28,28,0.22)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "#b91c1c" }}>
              ⚠ {error}
            </div>
          )}

          <button disabled={loading} className="btn-gold" style={{ width: "100%", padding: "12px", fontSize: "0.9rem", marginTop: 4 }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ width: 15, height: 15, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #060d1f", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Please wait...
              </span>
            ) : isRegister ? "Create Account" : "Sign In"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.84rem", color: "#8696b0", marginTop: 20 }}>
          {isRegister ? "Already have an account? " : "New to HackMates? "}
          <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: "#c8922a", fontWeight: 700, cursor: "pointer", fontSize: "inherit" }}>
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </p>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}