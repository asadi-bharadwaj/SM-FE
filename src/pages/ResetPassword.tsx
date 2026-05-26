import { useState, useEffect } from "react";
import QuantumCanvas from "../components/QuantumCanvas";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Failed to reset password. The link may have expired.");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <QuantumCanvas>
        <div className="auth-page">
          <div className="quantum-form-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h1 style={{ color: 'white', marginBottom: '16px', fontSize: '28px' }}>Password Reset</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
              Your password has been successfully reset. You can now login with your new password.
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
              Go to Login
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
          <div className="quantum-form-header">
            <h1>Reset Password</h1>
            <p className="quantum-subtitle">Enter a new secure password</p>
          </div>
          
          {error && <div className="quantum-error">{error}</div>}
          
          <form onSubmit={handleResetPassword} className="quantum-form">
            <div className="quantum-field-wrapper">
              <div className="quantum-input-container">
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="quantum-input"
                  style={{ animationDelay: '0s' }}
                  disabled={!token}
                />
              </div>
            </div>
            
            <div className="quantum-field-wrapper">
              <div className="quantum-input-container">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="quantum-input"
                  style={{ animationDelay: '0.1s' }}
                  disabled={!token}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="quantum-button"
            >
              <span className="button-text">
                {loading ? 'Processing...' : 'Reset Password'}
              </span>
            </button>
          </form>

          <div className="quantum-footer">
            <Link to="/login" className="quantum-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </QuantumCanvas>
  );
}
