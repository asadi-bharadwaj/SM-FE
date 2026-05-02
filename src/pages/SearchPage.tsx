import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function SearchPage() {
  const [tab, setTab] = useState("feed");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/users/all")
      .then((r) => r.json())
      .then((d) => setUsers(d))
      .catch((e) => console.error(e));
  }, []);

  const filtered = users.filter((u) => {
    const username = (u.username || "").toLowerCase();
    const displayName = (u.displayName || "").toLowerCase();
    const q = query.trim().toLowerCase();

    return username.includes(q) || displayName.includes(q);
  });

  const glowMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();

    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <>
      <style>
        {`
          .lux-box {
            position: relative;
            overflow: hidden;
          }

          .lux-box::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              radial-gradient(
                circle at var(--x,50%) var(--y,50%),
                rgba(255,255,255,0.12),
                transparent 38%
              );
            opacity: 0;
            transition: opacity .2s ease;
            pointer-events: none;
          }

          .lux-box:hover::before {
            opacity: 1;
          }

          .lux-btn {
            transition: all .25s ease;
          }

          .lux-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 18px rgba(255,255,255,0.06);
          }

          .spark {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(255,255,255,.8);
            opacity: 0;
          }

          .lux-box:hover .s1 {
            left: 22%;
            top: 35%;
            animation: sparkle 1.3s infinite;
          }

          .lux-box:hover .s2 {
            left: 58%;
            top: 55%;
            animation: sparkle 1.6s infinite;
          }

          .lux-box:hover .s3 {
            left: 78%;
            top: 30%;
            animation: sparkle 1.4s infinite;
          }

          @keyframes sparkle {
            0% {
              opacity: 0;
              transform: scale(.4) translateY(0);
            }
            50% {
              opacity: 1;
              transform: scale(1.5) translateY(-5px);
            }
            100% {
              opacity: 0;
              transform: scale(.5) translateY(-10px);
            }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "8px 0",
        }}
      >
        <div style={{ marginBottom: "26px" }}>
          <h1
            style={{
              fontSize: "34px",
              fontWeight: 800,
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            Discover
          </h1>

          <p
            style={{
              color: "#8d8d8d",
              margin: 0,
              fontSize: "15px",
            }}
          >
            Explore creators and premium content
          </p>
        </div>

        <div
          className="lux-box"
          onMouseMove={glowMove}
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "18px",
            padding: "15px 18px",
            marginBottom: "22px",
          }}
        >
          <input
            placeholder="Search creators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "16px",
              position: "relative",
              zIndex: 2,
            }}
          />

          <span className="spark s1"></span>
          <span className="spark s2"></span>
          <span className="spark s3"></span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => setTab("feed")}
            onMouseMove={glowMove}
            className="lux-box lux-btn"
            style={{
              padding: "12px 20px",
              borderRadius: "14px",
              border: "1px solid #222",
              cursor: "pointer",
              fontWeight: 700,
              background: tab === "feed" ? "#fff" : "#111",
              color: tab === "feed" ? "#000" : "#fff",
            }}
          >
            Feed
          </button>

          <button
            onClick={() => setTab("profiles")}
            onMouseMove={glowMove}
            className="lux-box lux-btn"
            style={{
              padding: "12px 20px",
              borderRadius: "14px",
              border: "1px solid #222",
              cursor: "pointer",
              fontWeight: 700,
              background: tab === "profiles" ? "#fff" : "#111",
              color: tab === "profiles" ? "#000" : "#fff",
            }}
          >
            Profiles
          </button>
        </div>

        {tab === "feed" && (
          <div
            className="lux-box"
            onMouseMove={glowMove}
            style={{
              background: "#111",
              border: "1px solid #222",
              borderRadius: "20px",
              padding: "24px",
              color: "#8e8e8e",
            }}
          >
            Feed content coming soon.
          </div>
        )}

        {tab === "profiles" && (
          <div style={{ display: "grid", gap: "14px" }}>
            {filtered.length === 0 && (
              <div
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: "18px",
                  padding: "22px",
                  color: "#888",
                }}
              >
                No profiles found.
              </div>
            )}

            {filtered.map((u) => {
              const uname = u.username || `user${u.id}`;

              return (
                <Link
                  key={u.id}
                  to={`/u/${uname}`}
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                  }}
                >
                  <div
                    className="lux-box"
                    onMouseMove={glowMove}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      background: "#111",
                      border: "1px solid #222",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <img
                      src={
                        u.avatarUrl?.startsWith("http")
                          ? u.avatarUrl
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${uname}`
                      }
                      alt={uname}
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: "4px",
                        }}
                      >
                        {u.displayName || uname}
                      </div>

                      <div
                        style={{
                          color: "#8a8a8a",
                          fontSize: "14px",
                        }}
                      >
                        @{uname}
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#8a8a8a",
                        fontSize: "14px",
                      }}
                    >
                      View →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}