import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function SearchPage() {
  const [tab, setTab] = useState("feed");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/users/all")
      .then((r) => r.json())
      .then((d) => setUsers(d));
  }, []);

  const filtered = users.filter((u) => {
  const username = (u.username || "").toLowerCase();
  const displayName = (u.displayName || "").toLowerCase();
  const q = query.trim().toLowerCase();

  return username.includes(q) || displayName.includes(q);
});

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <input
        placeholder="Search creators..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "14px",
          border: "1px solid #222",
          background: "#111",
          color: "#fff",
          marginBottom: "20px",
        }}
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <button
          onClick={() => setTab("feed")}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            background: tab === "feed" ? "#fff" : "#111",
            color: tab === "feed" ? "#000" : "#fff",
          }}
        >
          Feed
        </button>

        <button
          onClick={() => setTab("profiles")}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            background: tab === "profiles" ? "#fff" : "#111",
            color: tab === "profiles" ? "#000" : "#fff",
          }}
        >
          Profiles
        </button>
      </div>

      {tab === "feed" && (
  <div>
    {query ? (
      <div
        style={{
          padding: "20px",
          border: "1px solid #222",
          borderRadius: "14px",
          color: "#aaa"
        }}
      >
        No content found for "{query}" yet.
      </div>
    ) : (
      <div
        style={{
          padding: "20px",
          border: "1px solid #222",
          borderRadius: "14px",
          color: "#888"
        }}
      >
        Feed content coming soon.
      </div>
    )}
  </div>
)}

      {tab === "profiles" && (
        <div>
          {filtered.map((u) => (
            <Link
              key={u.id}
              to={`/u/${u.username}`}
              style={{
                display: "flex",
                gap: "12px",
                padding: "14px",
                borderBottom: "1px solid #222",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {u.displayName}
                </div>
                <div style={{ color: "#888" }}>
                  @{u.username}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}