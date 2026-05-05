import { useEffect, useState } from "react";

type NotificationResponse = {
  id: number;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch real notifications from the Notification Service
    fetch(`http://localhost:8081/api/notifications?recipientId=${userId}`, {
      headers: {
        "X-User-Id": userId,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        setItems(Array.isArray(d) ? d : []);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8081/api/notifications/${id}/read`, {
        method: "PUT",
      });
      setItems(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
    } catch (e) {
      console.error(e);
    }
  };

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

      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => !item.read && markAsRead(item.id)}
          style={{
            background: item.read ? "#0a0a0a" : "#111",
            border: item.read ? "1px solid #1a1a1a" : "1px solid #333",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "14px",
            cursor: item.read ? "default" : "pointer",
            position: "relative",
          }}
        >
          {!item.read && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#0095f6",
              }}
            />
          )}

          <div
            style={{
              fontWeight: 700,
              marginBottom: "4px",
              color: item.read ? "#aaa" : "#fff",
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              color: item.read ? "#666" : "#9a9a9a",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {item.message}
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "11px",
              color: "#555",
            }}
          >
            {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
