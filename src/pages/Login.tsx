import { useState } from "react";
import { Link } from "react-router-dom";
import QuantumCanvas from '../components/QuantumCanvas';
import QuantumForm from '../components/QuantumForm';
import { apiFetch } from "../lib/api";
import { UAParser } from 'ua-parser-js';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getSimpleDeviceInfo = () => {
    const parser = new UAParser(navigator.userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    
    let deviceStr = "Unknown Device";
    if (os.name === 'Mac OS' || os.name === 'iOS') {
        deviceStr = 'MacBook';
    } else if (os.name === 'Windows') {
        deviceStr = 'Windows';
    } else if (os.name === 'Linux') {
        deviceStr = 'Linux';
    } else if (os.name === 'Android') {
        deviceStr = 'Android';
    }
    
    return `Web Browser (${deviceStr}, ${browser.name || 'Unknown Browser'})`;
  };

  const login = async (data: Record<string, string>) => {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: data.email, 
          password: data.password, 
          deviceInfo: getSimpleDeviceInfo()
        }),
      });

      if (res.ok) {
        const responseData = await res.json();
        localStorage.setItem("token", responseData.accessToken);
        localStorage.setItem("refreshToken", responseData.refreshToken);
        localStorage.setItem("userId", responseData.id);
        window.location.href = "/u/me";
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Invalid credentials.");
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div>
                  <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '14px' }}>
                    Forgot Password?
                  </Link>
                </div>
                <div>
                  Don't have an account?{" "}
                  <Link to="/register" style={{ color: 'var(--accent-cyan)' }}>
                    Create Account
                  </Link>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </QuantumCanvas>
  );
}