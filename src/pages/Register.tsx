import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateLocal = () => {
    if (!email.includes("@")) return "Invalid email format.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain a special character.";
    if (!/[0-9]/.test(password)) return "Password must contain a number.";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
    return null;
  };

  const startRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const localError = validateLocal();
    if (localError) {
      setError(localError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/auth/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.text();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data || "Registration failed to start.");
      }
    } catch (err) {
      setError("Service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const completeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8081/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, otp }),
      });

      const data = await res.text();

      if (res.ok) {
        alert("Account verified! You can now login.");
        navigate("/login");
      } else {
        setError(data || "Verification failed.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{step === 1 ? "Create Account" : "Verify Email"}</h1>
        <p>{step === 1 ? "Join the community" : `We sent an OTP to ${email}`}</p>

        {error && <div style={{ color: "#ff4d4d", marginBottom: "15px", fontSize: "14px", fontWeight: 500 }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={startRegister}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (8+ chars, 1 Special, 1 Num, 1 Upper)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={completeRegister}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: "none", border: "none", color: "#aaa", marginTop: "10px", cursor: "pointer" }}
            >
              ← Back to details
            </button>
          </form>
        )}

        <span>
          Already have an account? <Link to="/login">Log in</Link>
        </span>
      </div>
    </div>
  );
}
