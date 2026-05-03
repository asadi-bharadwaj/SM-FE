import { useState } from "react";
import { Link } from "react-router-dom";
import { AUTH_BASE } from "../config/apiBase";
import { formatApiErrorBody } from "../lib/apiError";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const res = await fetch(`${AUTH_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setError(formatApiErrorBody(text, res.status));
      return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.id);
    if (typeof data.username === "string" && data.username) {
      localStorage.setItem("profileUsername", data.username);
    }

    window.location.href = "/u/me";
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join now and start exploring</p>

        <form onSubmit={register}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={2}
            maxLength={50}
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            maxLength={100}
            autoComplete="new-password"
            required
          />

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit">Register</button>
        </form>

        <span>
          Already have account? <Link to="/login">Login</Link>
        </span>
      </div>
    </div>
  );
}
