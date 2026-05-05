import { useState } from "react";
import { Link } from "react-router-dom";
import QuantumCanvas from '../components/QuantumCanvas';
import QuantumForm from '../components/QuantumForm';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (data: Record<string, string>) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (res.ok) {
        const responseData = await res.json();
        localStorage.setItem("token", responseData.accessToken);
        localStorage.setItem("refreshToken", responseData.refreshToken);
        localStorage.setItem("userId", responseData.id);
        window.location.href = "/u/me";
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "email",
      type: "email",
      placeholder: "Enter your email...",
      required: true
    },
    {
      name: "password",
      type: "password",
      placeholder: "Enter your password...",
      required: true
    }
  ];

  return (
    <QuantumCanvas>
      <div className="auth-page">
        <div className="quantum-form-container">
          <QuantumForm
            title="Welcome Back"
            subtitle="Sign in to your account"
            fields={formFields}
            buttonText="Sign In"
            onSubmit={login}
            loading={loading}
            error={error}
            footer={
              <>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: 'var(--accent-cyan)' }}>
                  Create Account
                </Link>
              </>
            }
          />
        </div>
      </div>
    </QuantumCanvas>
  );
}