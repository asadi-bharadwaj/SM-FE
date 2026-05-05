import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8081/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

   if (res.ok) {
  const data = await res.json()

  localStorage.setItem("token", data.accessToken)
  localStorage.setItem("refreshToken", data.refreshToken)
  localStorage.setItem("userId", data.id)

  window.location.href = "/u/me"
}
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <section className="auth-left">
          <div className="auth-art">
            <span className="auth-badge">#SocialCanvas</span>
            <h2>Build community.<br />Create with confidence.</h2>
            <p>
              A modern platform for creators, fans, and curators. Share your story,
              connect with fellow members, and grow a meaningful social experience
              with fresh style.
            </p>
          </div>
          <div className="auth-ornament auth-ornament-1" />
          <div className="auth-ornament auth-ornament-2" />
          <div className="auth-ornament auth-ornament-3" />
        </section>

        <main className="auth-card">
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

            <button type="submit">Login</button>
          </form>

          <span>
            New here? <Link to="/register">Create account</Link>
          </span>
        </main>
      </div>
    </div>
  );
}