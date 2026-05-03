import { useEffect, useState } from "react";

type NotificationItem = {
  id: number;
  creatorId: number;
  userId: number;
};

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    fetch("http://localhost:8081/users/following", {
      headers: {
        "X-User-Id": userId,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        setItems(Array.isArray(d) ? d : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: "24px" }}>
        Loading notifications...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        color: "#fff",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 800,
          marginBottom: "24px",
        }}
      >
        Notifications
      </h1>

      {items.length === 0 && (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "16px",
            padding: "20px",
            color: "#999",
          }}
        >
          No activity yet.
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            Subscription Active
          </div>

          <div
            style={{
              color: "#9a9a9a",
              fontSize: "14px",
            }}
          >
            You subscribed to creator #{item.creatorId}
          </div>
        </div>
      ))}
    </div>
  );
}