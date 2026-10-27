"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, SKILLS } from "./lib/api";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import PostCard from "./components/PostCard";
import PostForm from "./components/PostForm";
import Profile from "./components/Profile";
import InterestModal from "./components/InterestModal";

export default function Home() {
  const [view, setView] = useState("feed");
  const [auth, setAuth] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [interestPost, setInterestPost] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      setLoadError("");
      setPosts(await api("/posts"));
    } catch {
      setLoadError("Could not load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hm_auth"));
      if (saved && saved.token) setAuth(saved);
    } catch {}
    loadPosts();
  }, [loadPosts]);

  const handleLoggedIn = (data) => {
    setAuth(data);
    try { localStorage.setItem("hm_auth", JSON.stringify(data)); } catch {}
    setView("feed");
    notify(`Welcome, ${data.user.name}!`);
  };

  const logout = (msg) => {
    setAuth(null);
    try { localStorage.removeItem("hm_auth"); } catch {}
    setView(msg ? "login" : "feed");
    if (msg) notify(msg, "error");
  };
  const onAuthError = () => logout("Session expired. Please login again.");

  const onDeleted = () => {
    setAuth(null);
    try { localStorage.removeItem("hm_auth"); } catch {}
    setView("feed");
    loadPosts();
    notify("Your account has been deleted");
  };

  const openInterest = (post) => {
    if (!auth) { setView("login"); return notify("Please login to show interest", "error"); }
    setInterestPost(post);
  };

  const submitInterest = async ({ contact, message }) => {
    try {
      await api(`/posts/${interestPost.id}/interest`, {
        method: "POST", token: auth.token, body: { contact, message },
      });
    } catch (err) {
      if (err.status === 401) { setInterestPost(null); return onAuthError(); }
      throw err;
    }
    setInterestPost(null);
    notify("Interest sent! The creator will reach out.");
    loadPosts();
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (!onlyOpen || p.status === "open") &&
        (!skill || p.skills.includes(skill)) &&
        (!q || p.hackathon.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
    );
  }, [posts, search, skill, onlyOpen]);

  // Real numbers computed from the posts loaded from the API
  const stats = [
    { value: posts.length, label: "Posts" },
    { value: posts.filter((p) => p.status === "open").length, label: "Open now" },
    { value: posts.reduce((n, p) => n + (p.interestCount || 0), 0), label: "Interested" },
  ];

  const needLogin = (view === "new" || view === "profile") && !auth;

  return (
    <>
      <Navbar user={auth?.user} view={view} setView={setView} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* ── FEED ── */}
        {view === "feed" && (
          <>
            {/* ── Hero ── */}
            <section style={{ position: "relative", textAlign: "center", padding: "60px 20px 48px", overflow: "hidden" }}>
              {/* Orbs */}
              <div className="hero-orb" style={{ width: 500, height: 500, background: "#0f2158", top: -160, left: -120, opacity: 0.06 }} />
              <div className="hero-orb" style={{ width: 350, height: 350, background: "#c8922a", top: -80, right: -80, opacity: 0.06 }} />
              <div className="hero-orb" style={{ width: 250, height: 250, background: "#1d3a8a", bottom: 0, left: "38%", opacity: 0.05 }} />

              {/* Eyebrow badge */}
              <div
                className="animate-fade-in-up"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, rgba(15,33,88,0.07), rgba(200,146,42,0.07))",
                  border: "1px solid rgba(200,146,42,0.3)",
                  borderRadius: 999,
                  padding: "6px 18px",
                  marginBottom: 22,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#8a5a00",
                  backdropFilter: "blur(10px)",
                  letterSpacing: "0.03em",
                }}
              >
                <span className="animate-float" style={{ display: "inline-block" }}>✦</span>
                The premier platform for hackathon team-building
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-in-up"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.1rem, 5.5vw, 3.6rem)",
                  lineHeight: 1.1,
                  color: "#0c1a3a",
                  margin: "0 0 18px 0",
                  animationDelay: "0.08s",
                  letterSpacing: "-0.02em",
                }}
              >
                Find your hackathon{" "}
                <span className="gold-text">dream team</span>
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-in-up"
                style={{
                  color: "#4a5878",
                  fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                  maxWidth: 520,
                  margin: "0 auto 32px",
                  lineHeight: 1.7,
                  animationDelay: "0.16s",
                  fontWeight: 400,
                }}
              >
                Post your hackathon, define the skills you need, and let the right teammates discover you.
              </p>

              {/* CTAs */}
              <div
                className="animate-fade-in-up"
                style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 44, animationDelay: "0.22s" }}
              >
                {auth ? (
                  <button className="btn-gold" style={{ padding: "13px 30px", fontSize: "0.95rem" }} onClick={() => setView("new")}>
                    + Post a Hackathon
                  </button>
                ) : (
                  <>
                    <button className="btn-gold" style={{ padding: "13px 30px", fontSize: "0.95rem" }} onClick={() => setView("register")}>
                      Get Started Free
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ padding: "13px 26px", fontSize: "0.95rem" }}
                      onClick={() => document.getElementById("posts-grid")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Browse Posts ↓
                    </button>
                  </>
                )}
              </div>

              {/* Gold divider */}
              <hr className="gold-divider animate-fade-in-up" style={{ maxWidth: 200, margin: "0 auto 32px", animationDelay: "0.28s" }} />

              {/* Stats */}
              <div
                className="animate-fade-in-up"
                style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", animationDelay: "0.32s" }}
              >
                {stats.map(({ value, label }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 800,
                        fontSize: "1.7rem",
                        background: "linear-gradient(135deg, #0f2158, #c8922a)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {value}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#8696b0", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Filter Bar ── */}
            <div
              className="glass-card animate-fade-in-up"
              style={{ padding: "18px 22px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 14, animationDelay: "0.1s" }}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                {/* Search */}
                <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8696b0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search hackathons..."
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                  />
                </div>

                {/* Open-only toggle */}
                <label style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  fontSize: "0.84rem", fontWeight: 600,
                  color: onlyOpen ? "#0f2158" : "#4a5878",
                  background: onlyOpen ? "rgba(15,33,88,0.07)" : "rgba(248,250,252,0.8)",
                  border: `1.5px solid ${onlyOpen ? "rgba(15,33,88,0.25)" : "rgba(12,26,58,0.12)"}`,
                  borderRadius: 10, padding: "9px 14px", transition: "all 0.18s ease", userSelect: "none", flexShrink: 0,
                }}>
                  <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)}
                    style={{ accentColor: "#0f2158", width: 15, height: 15 }} />
                  Open only
                </label>
              </div>

              {/* Skill pills */}
              <div className="hm-chips">
                {["", ...SKILLS].map((s) => (
                  <button key={s || "all"} onClick={() => setSkill(s)} className={`skill-pill${skill === s ? " active" : ""}`}>
                    {s || "✦ All Skills"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Results count ── */}
            {!loading && !loadError && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 2px" }}>
                <p style={{ fontSize: "0.82rem", color: "#8696b0", fontWeight: 500 }}>
                  {visible.length === 0 ? "No posts found" : `${visible.length} post${visible.length !== 1 ? "s" : ""} found`}
                  {skill && <> · <span style={{ color: "#0f2158", fontWeight: 700 }}>{skill}</span></>}
                </p>
                {skill && (
                  <button onClick={() => setSkill("")} style={{
                    fontSize: "0.78rem", color: "#c8922a", background: "none", border: "none",
                    cursor: "pointer", fontWeight: 700, padding: "2px 6px",
                  }}>
                    Clear ×
                  </button>
                )}
              </div>
            )}

            {/* ── Grid ── */}
            <div id="posts-grid">
              {loading ? (
                <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              ) : loadError ? (
                <div className="glass-card animate-fade-in" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>⚠</div>
                  <p style={{ color: "#4a5878", marginBottom: 16, fontSize: "0.92rem" }}>{loadError}</p>
                  <button onClick={loadPosts} className="btn-primary" style={{ padding: "10px 24px" }}>Try Again</button>
                </div>
              ) : visible.length === 0 ? (
                <div className="glass-card animate-fade-in" style={{
                  textAlign: "center", padding: "72px 20px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                }}>
                  <div style={{ fontSize: "2.8rem" }}>🔍</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.15rem", color: "#0c1a3a", margin: 0 }}>
                    No posts found
                  </h3>
                  <p style={{ color: "#8696b0", fontSize: "0.875rem", margin: 0, maxWidth: 300 }}>
                    {search || skill ? "Try adjusting your filters." : "Be the first to post a hackathon!"}
                  </p>
                  {auth && (
                    <button className="btn-gold" style={{ marginTop: 8, padding: "10px 24px" }} onClick={() => setView("new")}>
                      + Post a Hackathon
                    </button>
                  )}
                </div>
              ) : (
                <div className="stagger" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
                  {visible.map((p) => (
                    <PostCard key={p.id} post={p} user={auth?.user} onInterest={openInterest} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── AUTH ── */}
        {(view === "login" || view === "register") && (
          <AuthForm key={view} mode={view} onLoggedIn={handleLoggedIn} onSwitch={() => setView(view === "login" ? "register" : "login")} />
        )}

        {/* ── NEED LOGIN ── */}
        {needLogin && (
          <div className="glass-card animate-scale-in" style={{
            textAlign: "center", padding: "70px 20px", maxWidth: 400,
            margin: "40px auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{ fontSize: "2.5rem" }}>🔐</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.2rem", color: "#0c1a3a", margin: 0 }}>
              Login Required
            </h3>
            <p style={{ color: "#4a5878", fontSize: "0.875rem", margin: 0 }}>Please sign in to continue.</p>
            <button onClick={() => setView("login")} className="btn-primary" style={{ marginTop: 8, padding: "11px 28px" }}>
              Sign In
            </button>
          </div>
        )}

        {/* ── NEW POST ── */}
        {view === "new" && auth && (
          <PostForm token={auth.token} onAuthError={onAuthError} onCreated={() => { loadPosts(); setView("feed"); notify("Post published!"); }} />
        )}

        {/* ── PROFILE (my posts + interested people + logout/delete) ── */}
        {view === "profile" && auth && (
          <Profile
            user={auth.user}
            token={auth.token}
            posts={posts}
            reload={loadPosts}
            onAuthError={onAuthError}
            onLogout={() => logout()}
            onDeleted={onDeleted}
            onNewPost={() => setView("new")}
            notify={notify}
          />
        )}
      </main>

      {/* ── Modal ── */}
      {interestPost && (
        <InterestModal post={interestPost} onClose={() => setInterestPost(null)} onSubmit={submitInterest} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className="animate-slide-down"
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 100, display: "flex", alignItems: "center", gap: 10,
            padding: "12px 22px", borderRadius: 12, fontSize: "0.875rem", fontWeight: 600, color: "white",
            background: toast.type === "error"
              ? "linear-gradient(135deg, #7f1d1d, #b91c1c)"
              : "linear-gradient(135deg, #0f2158, #1d3a8a)",
            boxShadow: toast.type === "error"
              ? "0 8px 24px rgba(185,28,28,0.4)"
              : "0 8px 28px rgba(15,33,88,0.45)",
            maxWidth: "90vw", textAlign: "center", backdropFilter: "blur(20px)",
            border: toast.type === "error" ? "none" : "1px solid rgba(200,146,42,0.3)",
          }}
        >
          <span>{toast.type === "error" ? "⚠" : "✓"}</span>
          {toast.text}
        </div>
      )}
    </>
  );
}