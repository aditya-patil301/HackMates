export default function Navbar({ user, view, setView }) {
  const link = (v, desktop, mobile) => (
    <button onClick={() => setView(v)} className={`nav-link ${view === v ? "active" : ""}`}>
      <span className="hm-hide-mobile">{desktop}</span>
      <span className="hm-show-mobile">{mobile || desktop}</span>
    </button>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(252, 253, 255, 0.88)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        borderBottom: "1px solid rgba(12, 26, 58, 0.09)",
        boxShadow: "0 2px 20px rgba(12, 26, 58, 0.06)",
      }}
    >
      <div className="hm-nav-inner">
        {/* Logo */}
        <button
          onClick={() => setView("feed")}
          style={{ display: "flex", alignItems: "center", gap: 11, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(145deg, #0f2158, #1d3a8a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(15, 33, 88, 0.35), inset 0 1px 0 rgba(200,146,42,0.25)",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #c8922a, transparent)" }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.95" />
              <path d="M2 17l10 5 10-5" stroke="#c8922a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
            </svg>
          </div>

          <div className="hm-hide-xs" style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0f2158", letterSpacing: "-0.03em" }}>
              Hack<span style={{ color: "#c8922a" }}>Mates</span>
            </span>
            <span className="hm-hide-mobile" style={{ fontSize: "0.6rem", color: "#8696b0", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Team Builder
            </span>
          </div>
        </button>

        {/* Nav */}
        <nav className="hm-nav-actions">
          {link("feed", "Explore")}
          {user ? (
            <>
              {link("new", "+ New Post", "+ Post")}
              <button
                onClick={() => setView("profile")}
                aria-label="My Profile"
                className={`nav-link ${view === "profile" ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(145deg, #0f2158, #1d3a8a)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    boxShadow: "0 0 0 2px rgba(200,146,42,0.55)",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hm-hide-mobile">My Profile</span>
              </button>
            </>
          ) : (
            <>
              {link("login", "Login")}
              <button onClick={() => setView("register")} className="btn-primary" style={{ padding: "7px 16px" }}>
                <span className="hm-hide-mobile">Get Started</span>
                <span className="hm-show-mobile">Join</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}