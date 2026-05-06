import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QuantumCanvas from '../components/QuantumCanvas';
import QuantumForm from '../components/QuantumForm';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: ""
  });

  const navigate = useNavigate();

  const validateLocal = (data: Record<string, string>) => {
    const e = (data.email || "").trim();
    const p = (data.password || "").trim();

    if (!e.includes("@") || !e.includes(".")) return "Invalid email format.";
    if (p.length < 8) return "Password must be at least 8 characters.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return "Password must contain a special character.";
    if (!/[0-9]/.test(p)) return "Password must contain a number.";
    if (!/[A-Z]/.test(p)) return "Password must contain an uppercase letter.";
    return null;
  };

  const startRegister = async (data: Record<string, string>) => {
    setError("");
    const localError = validateLocal(data);
    if (localError) {
      setError(localError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/auth/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password
        }),
      });

      const responseData = await res.text();

      if (res.ok) {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(2);
      } else {
        setError(responseData || "Registration failed to start.");
      }
    } catch (err) {
      setError("Service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const completeRegister = async (data: Record<string, string>) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8081/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          otp: data.otp
        }),
      });

      const responseData = await res.text();

      if (res.ok) {
        alert("Account verified! You can now login.");
        navigate("/login");
      } else {
        setError(responseData || "Verification failed.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const step1Fields = [
    {
      name: "username",
      type: "text",
      placeholder: "Choose your username...",
      required: true
    },
    {
      name: "email",
      type: "email",
      placeholder: "Enter your email address...",
      required: true
    },
    {
      name: "password",
      type: "password",
      placeholder: "Create a strong password (8+ chars, special, number, upper)...",
      required: true
    }
  ];

  const step2Fields = [
    {
      name: "otp",
      type: "text",
      placeholder: "Enter verification code...",
      required: true
    }
  ];

  return (
    <QuantumCanvas>
      <div className="auth-page">
        <div className="quantum-form-container">
          {step === 1 ? (
            <QuantumForm
              title="Create Account"
              subtitle="Join our community"
              fields={step1Fields}
              buttonText="Send Verification Code"
              onSubmit={startRegister}
              loading={loading}
              error={error}
              footer={
                <>
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: 'var(--accent-cyan)' }}>
                    Sign In
                  </Link>
                </>
              }
            />
          ) : (
            <QuantumForm
              title="Verify Email"
              subtitle={`Verification code sent to ${formData.email}`}
              fields={step2Fields}
              buttonText="Complete Registration"
              onSubmit={completeRegister}
              loading={loading}
              error={error}
              footer={
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '16px'
                  }}
                >
                  ← Back to Registration
                </button>
              }
            />
          )}
        </div>
      </div>
    </QuantumCanvas>
  );
}
