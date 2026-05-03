import { useState } from "react";
import { Link } from "react-router-dom";
import { AUTH_BASE } from "../config/apiBase";
import { formatApiErrorBody } from "../lib/apiError";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const res = await fetch(`${AUTH_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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
        <h1>Welcome Back</h1>
        <p>Login to continue</p>

        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit">Login</button>
        </form>

        <span>
          New here? <Link to="/register">Create account</Link>
        </span>
      </div>
    </div>
  );
}
