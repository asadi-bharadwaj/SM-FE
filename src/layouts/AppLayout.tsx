import { Outlet, Link, useLocation } from "react-router-dom";

function Item({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();

  const active =
    pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className="lux-nav"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        e.currentTarget.style.setProperty(
          "--x",
          `${e.clientX - rect.left}px`
        );

        e.currentTarget.style.setProperty(
          "--y",
          `${e.clientY - rect.top}px`
        );
      }}
      style={{
        position: "relative",
        padding: "15px 10px",
        color: active ? "#ffffff" : "#9f9f9f",
        textDecoration: "none",
        fontWeight: active ? 700 : 500,
        fontSize: "15px",
        letterSpacing: "0.25px",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.25s ease",
      }}
    >
      <span
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {label}
      </span>

      {/* cursor glow */}
      <span
        className="mouse-light"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.16), transparent 45%)",
          opacity: 0,
          transition: "opacity 0.18s ease",
          zIndex: 1,
        }}
      />

      {/* star dust */}
      <span
        className="dust dust1"
        style={{
          position: "absolute",
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          left: "24%",
          top: "35%",
          opacity: 0,
          zIndex: 1,
        }}
      />

      <span
        className="dust dust2"
        style={{
          position: "absolute",
          width: "2px",
          height: "2px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.75)",
          left: "58%",
          top: "55%",
          opacity: 0,
          zIndex: 1,
        }}
      />

      <span
        className="dust dust3"
        style={{
          position: "absolute",
          width: "2px",
          height: "2px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.8)",
          left: "78%",
          top: "28%",
          opacity: 0,
          zIndex: 1,
        }}
      />
    </Link>
  );
}

export function AppLayout() {
  return (
    <>
      <style>
        {`
          .lux-nav:hover {
            color: #fff !important;
            transform: translateX(6px);
          }

          .lux-nav:hover .mouse-light {
            opacity: 1 !important;
          }

          .lux-nav:hover .dust1 {
            animation: sparkle 1.2s infinite;
          }

          .lux-nav:hover .dust2 {
            animation: sparkle 1.6s infinite;
          }

          .lux-nav:hover .dust3 {
            animation: sparkle 1.4s infinite;
          }

          @keyframes sparkle {
            0% {
              opacity: 0;
              transform: scale(0.5) translateY(0px);
            }
            50% {
              opacity: 1;
              transform: scale(1.5) translateY(-4px);
            }
            100% {
              opacity: 0;
              transform: scale(0.6) translateY(-8px);
            }
          }
        `}
      </style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, #0d0d0d, #000 40%)",
          color: "#fff",
        }}
      >
        <aside
          style={{
            padding: "28px 22px",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <h2
            style={{
              marginBottom: "34px",
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            ShowMe
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Item to="/" label="Home" />
            <Item to="/u/me" label="Profile" />
            <Item to="/messages" label="Messages" />
            <Item to="/notifications" label="Notifications" />
            <Item to="/settings" label="Settings" />
          </div>
        </aside>

        <main
          style={{
            padding: "28px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}