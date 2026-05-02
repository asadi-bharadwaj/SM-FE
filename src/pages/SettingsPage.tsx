import { useEffect, useState } from "react";

export function SettingsPage() {
  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    country: "",
    language: "",
    avatarUrl: "",
  });

  useEffect(() => {
    fetch("http://localhost:8081/users/me", {
      headers: {
        "X-User-Id": userId || "",
      },
    })
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
  }, []);

  const save = async () => {
    const res = await fetch("http://localhost:8081/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId || "",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Profile Updated");
    } else {
      alert("Failed");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>Edit Profile</h2>

      <input placeholder="Display Name"
        value={form.displayName}
        onChange={(e)=>setForm({...form, displayName:e.target.value})}
      />

      <input placeholder="Bio"
        value={form.bio}
        onChange={(e)=>setForm({...form, bio:e.target.value})}
      />

      <input placeholder="Country"
        value={form.country}
        onChange={(e)=>setForm({...form, country:e.target.value})}
      />

      <input placeholder="Language"
        value={form.language}
        onChange={(e)=>setForm({...form, language:e.target.value})}
      />

      <input placeholder="Avatar URL"
        value={form.avatarUrl}
        onChange={(e)=>setForm({...form, avatarUrl:e.target.value})}
      />

      <button onClick={save}>Save Profile</button>
    </div>
  );
}