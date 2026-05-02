import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./index.css";
import { App } from "./app/App";
import { loadUsers } from "./mocks/users";

function IntroScreen() {
  return (
    <>
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes glowPulse {
            0% { opacity: .25; transform: scale(1); }
            50% { opacity: .45; transform: scale(1.08); }
            100% { opacity: .25; transform: scale(1); }
          }

          @keyframes drift {
            0% { transform: translateY(0px); opacity: .2; }
            50% { transform: translateY(-20px); opacity: .45; }
            100% { transform: translateY(-40px); opacity: 0; }
          }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, #101010, #000 45%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ambient glow */}
        <div
          style={{
            position: "absolute",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
            animation: "glowPulse 4s ease-in-out infinite",
          }}
        />

        {/* dust particles */}
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.75)",
              left: `${10 + i * 7}%`,
              bottom: `${10 + (i % 4) * 8}%`,
              animation: `drift ${3 + (i % 4)}s linear infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}

        {/* center content */}
        <div
          style={{
            textAlign: "center",
            zIndex: 2,
            maxWidth: "760px",
            padding: "24px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "6px",
              color: "#8f8f8f",
              marginBottom: "24px",
              animation: "fadeUp 1.2s ease forwards",
            }}
          >
            SHOWME
          </div>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              marginBottom: "18px",
              animation: "fadeUp 1.4s ease forwards",
            }}
          >
            The future belongs to the bold.
            <br />
           
          </h1>

          <p
            style={{
              color: "#9d9d9d",
              fontSize: "17px",
              letterSpacing: "0.2px",
              animation: "fadeUp 1.7s ease forwards",
            }}
          >
            Built for those who dare.
          </p>
        </div>
      </div>
    </>
  );
}

function RootApp() {
  const [phase, setPhase] = useState("intro");

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setPhase("fade");
    }, 2200);

    const appTimer = setTimeout(() => {
      setPhase("app");
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(appTimer);
    };
  }, []);

  if (phase === "app") {
    return (
      <div
        style={{
          animation: "appFadeIn 1s ease forwards",
          minHeight: "100vh",
        }}
      >
        <style>
          {`
            @keyframes appFadeIn {
              from {
                opacity: 0;
                transform: scale(1.01);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>

        <App />
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: phase === "fade" ? 0 : 1,
        transform:
          phase === "fade"
            ? "scale(1.03)"
            : "scale(1)",
        transition:
          "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      <IntroScreen />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);

// Load users after app starts
loadUsers().catch((err) => {
  console.error("Users load failed:", err);
});