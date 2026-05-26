import { useEffect, useState } from "react";
import { AvatarUpload } from "../components/settings/AvatarUpload";
import { AlertTriangle, UserX, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/api";

export function SettingsPage() {
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    country: "",
    language: "",
    avatarUrl: "",
  });

  const [pushEnabled, setPushEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Fetch profile
    apiFetch("/users/me")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          country: data.country || "",
          language: data.language || "",
          avatarUrl: data.avatarUrl || "",
        });
      });

    // Fetch preferences
    apiFetch("/users/me/preferences")
      .then((res) => res.json())
      .then((data) => {
        setPushEnabled(data.pushNotifications ?? true);
        setDataSaver(data.dataSaver ?? false);
        setPrivateProfile(data.privateProfile ?? false);
        setTwoFactorEnabled(data.twoFactorEnabled ?? false);
      });
  }, []);

  const save = async () => {
    // Save profile
    const resProfile = await apiFetch("/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    // Save preferences
    const resPrefs = await apiFetch("/users/me/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pushNotifications: pushEnabled,
        dataSaver,
        privateProfile,
        twoFactorEnabled
      }),
    });

    if (resProfile.ok && resPrefs.ok) {
      alert("Settings Updated");
    } else {
      alert("Failed to save some settings");
    }
  };

  const handleDisable = async () => {
    if (window.confirm("Disable account temporarily? You can reactivate by logging in within 30 days. Your profile will be hidden from everyone.")) {
      const res = await apiFetch("/auth/disable", {
        method: "PUT"
      });
      if (res.ok) {
        alert("Account disabled. Redirecting to login...");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("PERMANENTLY DELETE ACCOUNT? This action is irreversible. All your chats, posts, and profile data will be WIPED from our servers.")) {
      const res = await apiFetch("/auth/delete", {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Account deleted permanently. Goodbye.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setForm(prev => ({ ...prev, avatarUrl }));
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: "auto",
      padding: "20px 20px 100px 20px",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      gap: 20
    }}>
      <h2 style={{
        textAlign: "center",
        color: "white",
        marginBottom: 20,
        fontSize: "2rem",
        fontWeight: 700
      }}>
        Settings
      </h2>

      <AvatarUpload
        currentAvatarUrl={form.avatarUrl}
        onAvatarChange={handleAvatarChange}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ color: "#888", fontSize: "14px", fontWeight: 600, textTransform: "uppercase" }}>Edit Profile</h3>
        
        <input placeholder="Display Name"
          value={form.displayName}
          onChange={(e)=>setForm({...form, displayName:e.target.value})}
          style={{
            padding: "14px 16px",
            background: "#111",
            border: "1px solid #333",
            borderRadius: "12px",
            color: "white",
            fontSize: "0.95rem"
          }}
        />

        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={(e)=>setForm({...form, bio:e.target.value})}
          rows={3}
          style={{
            padding: "14px 16px",
            background: "#111",
            border: "1px solid #333",
            borderRadius: "12px",
            color: "white",
            fontSize: "0.95rem",
            minHeight: "80px"
          }}
        />

        <button
          onClick={save}
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          Save Profile
        </button>

        <div style={{ padding: "24px", border: "1px solid #222", borderRadius: "16px", background: "#0a0a0a" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#fff" }}>Security & Privacy</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Change Password</span>
                <button style={{ background: "#222", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>Update</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Two-Factor Authentication (2FA)</span>
                <button style={{ background: "#222", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>Enable</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Private Profile</span>
                <input type="checkbox" style={{ transform: "scale(1.2)" }} />
            </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid #222", borderRadius: "16px", background: "#0a0a0a" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#fff" }}>Notifications</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Push Notifications</span>
                <input type="checkbox" defaultChecked style={{ transform: "scale(1.2)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Email Notifications</span>
                <input type="checkbox" defaultChecked style={{ transform: "scale(1.2)" }} />
            </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid #222", borderRadius: "16px", background: "#0a0a0a" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#fff" }}>App Preferences</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Data Saver Mode</span>
                <input type="checkbox" style={{ transform: "scale(1.2)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Language</span>
                <select style={{ background: "#222", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px" }}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
            </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid #222", borderRadius: "16px", background: "#0a0a0a" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#fff" }}>Legal & Support</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <a href="/privacy-policy" target="_blank" style={{ color: "#aaa", fontSize: "14px", textDecoration: "none" }}>Privacy Policy</a>
                <span style={{ color: "#555" }}>↗</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <a href="/terms" target="_blank" style={{ color: "#aaa", fontSize: "14px", textDecoration: "none" }}>Terms of Service</a>
                <span style={{ color: "#555" }}>↗</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <a href="#" style={{ color: "#aaa", fontSize: "14px", textDecoration: "none" }}>Community Guidelines</a>
                <span style={{ color: "#555" }}>↗</span>
            </div>
        </div>

        <div style={{ marginTop: "40px", padding: "24px", border: "1px solid #222", borderRadius: "16px", background: "#0a0a0a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#ff4d4d" }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Danger Zone</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                    onClick={handleDisable}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "14px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid #333",
                        borderRadius: "12px",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px"
                    }}
                >
                    <UserX size={18} />
                    Temporarily Disable Account
                </button>

                <button
                    onClick={handleDelete}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "14px",
                        background: "rgba(255, 77, 77, 0.1)",
                        border: "1px solid rgba(255, 77, 77, 0.2)",
                        borderRadius: "12px",
                        color: "#ff4d4d",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px"
                    }}
                >
                    <Trash2 size={18} />
                    Permanently Delete Everything
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
