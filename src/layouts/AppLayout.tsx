import { Outlet, Link, useLocation } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/antimatter-logo.png";
import { apiFetch } from "../lib/api";
import { GlobalCallManager } from "../components/chat/GlobalCallManager";

function Item({ to, label, badge }: { to: string; label: string; badge?: number }) {
  const { pathname } = useLocation();

  const active =
    pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={`lux-nav ${active ? "active" : ""}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 10px",
        textDecoration: "none",
        color: active ? "#ffffff" : "#9f9f9f",
        fontWeight: active ? 700 : 500,
        fontSize: "15px",
        letterSpacing: "0.25px",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.25s ease",
      }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>{label}</span>
      
      {/* Stars Container */}
      <div className="stars-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="star-particle" />
        ))}
      </div>
      
      {badge && badge > 0 ? (
        <span style={{
          background: "#ff4d4d",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 800,
          minWidth: "18px",
          height: "18px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 0 10px rgba(255, 77, 77, 0.4)"
        }}>
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}

      <span
        className="mouse-light"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.16), transparent 45%)",
          opacity: 0,
          transition: "opacity 0.18s ease",
          zIndex: 1,
        }}
      />
    </Link>
  );
}

export function AppLayout() {
  const { connect: connectChat, unreadThreads } = useChatStore();
  const { connect: connectNotif, unreadCount, latestNotification, clearLatestNotification } = useNotificationStore();
  const [toast, setToast] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userId = localStorage.getItem("userId");
  const connStarted = useRef(false);

  useEffect(() => {
    if (!userId) {
      connStarted.current = false;
    } else if (userId && !connStarted.current) {
      connStarted.current = true;
      connectChat(userId);
      connectNotif(userId);
    }
  }, [userId, connectChat, connectNotif]);

  // Toast effect for new notifications
  useEffect(() => {
    if (latestNotification) {
      setToast(latestNotification);
      const timer = setTimeout(() => {
        setToast(null);
        clearLatestNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification, clearLatestNotification]);

  // Close menu on navigation
  const { pathname } = useLocation();
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <style>
        {`
          .lux-nav {
            font-family: 'Outfit', sans-serif;
            transition: color 0.25s ease, transform 0.25s ease;
          }
          .lux-nav:hover {
            color: #fff !important;
            transform: translateX(6px);
          }
          .lux-nav:hover .mouse-light {
            opacity: 1 !important;
          }
          
          .toast-notification {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-left: 4px solid #00c6ff;
            padding: 16px 20px;
            border-radius: 8px;
            color: #fff;
            z-index: 9999;
            min-width: 280px;
            max-width: 380px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
            gap: 4px;
            animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            text-align: left;
          }
          @keyframes slideInRight {
            0% { transform: translateX(120%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          
          .page-transition-enter {
            animation: fadeSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .stars-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .lux-nav:hover .stars-container {
            opacity: 1;
          }
          .star-particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 4px #fff, 0 0 8px #00c6ff;
            opacity: 0;
          }
          .lux-nav:hover .star-particle {
            animation: star-sparkle 1.5s infinite ease-in-out;
          }
          .star-particle:nth-child(1) { top: 20%; left: 30%; animation-delay: 0.1s; }
          .star-particle:nth-child(2) { top: 60%; left: 80%; animation-delay: 0.4s; }
          .star-particle:nth-child(3) { top: 10%; left: 70%; animation-delay: 0.7s; }
          .star-particle:nth-child(4) { top: 80%; left: 20%; animation-delay: 1.0s; }
          .star-particle:nth-child(5) { top: 40%; left: 50%; animation-delay: 1.3s; }
          .star-particle:nth-child(6) { top: 70%; left: 90%; animation-delay: 0.2s; }

          @keyframes star-sparkle {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
          }
          
          .app-wrapper {
            display: grid;
            grid-template-columns: 220px 1fr;
            min-height: 100vh;
            position: relative;
            z-index: 1;
          }
          .app-sidebar {
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            padding: 28px 22px;
            border-right: 1px solid var(--glass-border);
            backdrop-filter: blur(var(--glass-blur));
            -webkit-backdrop-filter: blur(var(--glass-blur));
            z-index: 50;
            background: var(--glass-bg);
            transition: transform 0.3s ease;
          }
          .mobile-header {
            display: none;
          }
          .mobile-overlay {
            display: none;
          }

          @media (max-width: 768px) {
            .app-wrapper {
              display: flex;
              flex-direction: column;
            }
            .app-sidebar {
              position: fixed;
              left: 0;
              top: 0;
              width: 260px;
              background: rgba(10, 10, 10, 0.95);
              transform: translateX(-100%);
            }
            .app-sidebar.open {
              transform: translateX(0);
            }
            .mobile-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 16px 20px;
              border-bottom: 1px solid var(--glass-border);
              position: sticky;
              top: 0;
              background: var(--glass-bg);
              backdrop-filter: blur(var(--glass-blur));
              -webkit-backdrop-filter: blur(var(--glass-blur));
              z-index: 40;
            }
            .mobile-overlay.open {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.6);
              backdrop-filter: blur(4px);
              z-index: 45;
            }
            .main-content {
              padding: 16px !important;
            }
          }
        `}
      </style>

      {/* Global Call UI */}
      <GlobalCallManager />

      {toast && (
        <div className="toast-notification">
          <div style={{ fontWeight: 600, fontSize: "15px", color: "#fff" }}>{toast.title}</div>
          <div style={{ fontSize: "13px", color: "#aaa" }}>{toast.message}</div>
        </div>
      )}

      {/* Minimalist Background Effects */}
      <div className="minimalist-canvas">
        {/* Particle dots */}
        <div className="particle-dots">
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="particle-dot"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="app-wrapper">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="mobile-header">
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
            <img src={logo} alt="AntiMatter" style={{ width: "32px", height: "32px", borderRadius: "6px" }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>AntiMatter</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "8px" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>

        {/* Mobile Overlay */}
        <div 
          className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            style={{
              marginBottom: "34px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingTop: "10px",
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <img src={logo} alt="AntiMatter" style={{ width: "40px", height: "40px", borderRadius: "8px" }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>AntiMatter</span>
          </Link>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Item to="/" label="Discover" />
            <Item to="/feed" label="Feed" />
            <Item to="/messages" label="Messages" badge={unreadThreads.size} />
            <Item to="/calls" label="Calls" />
            <Item to="/notifications" label="Notifications" badge={unreadCount} />
            <Item to="/u/me" label="Profile" />
            <Item to="/create" label="Create Post" />
            <Item to="/settings" label="Settings" />

            <button
              onClick={async () => {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                  try {
                    await apiFetch("/auth/logout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ refreshToken })
                    });
                  } catch (e) {
                    console.error("Logout failed on server", e);
                  }
                }
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userId");
                window.location.href = "/login";
              }}
              className="lux-nav"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
              }}
              style={{
                position: "relative",
                padding: "15px 10px",
                color: "#ff4d4d",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "15px",
                letterSpacing: "0.25px",
                overflow: "hidden",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.25s ease",
                marginTop: "20px",
                fontFamily: "inherit",
              }}
            >
              <span style={{ position: "relative", zIndex: 2 }}>Logout</span>
              <span
                className="mouse-light"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,77,77,0.12), transparent 45%)",
                  opacity: 0,
                  transition: "opacity 0.18s ease",
                  zIndex: 1,
                }}
              />
            </button>
          </div>
        </aside>

        <main
          className="main-content"
          style={{
            padding: "28px",
          }}
        >
          <div key={pathname} className="page-transition-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
