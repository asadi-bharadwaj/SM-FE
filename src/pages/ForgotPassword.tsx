import { useState } from "react";
import { Link } from "react-router-dom";
import QuantumCanvas from '../components/QuantumCanvas';
import QuantumForm from '../components/QuantumForm';
import { apiFetch } from "../lib/api";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (data: Record<string, string>) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Failed to send reset link. Please try again.");
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
      placeholder: "Enter your email address...",
      required: true
    }
  ];

  if (success) {
    return (
      <QuantumCanvas>
        <div className="auth-page">
          <div className="quantum-form-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h1 style={{ color: 'white', marginBottom: '16px', fontSize: '28px' }}>Check Your Email</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
              We've sent a password reset link to your email address. Please click the link to reset your password.
            </p>
            <Link to="/login" style={{ 
              display: 'inline-block',
              padding: '12px 32px', 
              background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '12px',
              fontWeight: 700
            }}>
              Return to Login
            </Link>
          </div>
        </div>
      </QuantumCanvas>
    );
  }

  return (
    <QuantumCanvas>
      <div className="auth-page">
        <div className="quantum-form-container">
          <QuantumForm
            title="Reset Password"
            subtitle="We'll send you a link to reset it"
            fields={formFields}
            buttonText="Send Reset Link"
            onSubmit={handleResetRequest}
            loading={loading}
            error={error}
            footer={
              <>
                Remember your password?{" "}
                <Link to="/login" style={{ color: 'var(--accent-cyan)' }}>
                  Sign In
                </Link>
              </>
            }
          />
        </div>
      </div>
    </QuantumCanvas>
  );
}
