import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import type { ChatMessage } from "../types/chat";
import { Search, MessageCircle } from "lucide-react";

type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export function MessagesInboxPage() {
  const [threads, setThreads] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const { connected } = useChatStore();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    if (userId) {
      loadInbox();
      loadUsers();
    }
  }, [userId]);

  useEffect(() => {
    if (connected) {
      useChatStore.setState({ 
        onNewMessage: () => {
          loadInbox(); 
        } 
      });
    }
  }, [connected]);

  const loadInbox = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8081/chat/threads/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const uniqueThreads = Array.from(
          new Map(data.map((m: ChatMessage) => [m.threadId, m])).values()
        ) as ChatMessage[];
        setThreads(uniqueThreads);
      }
    } catch (err) {
      console.error("Failed to fetch inbox", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:8081/users/all");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    String(u.id) !== String(userId) && 
    String(u.authUserId) !== String(userId) &&
    (u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 8);

  const startNewChat = (user: UserProfile) => {
    const targetId = user.id || (user as any).authUserId;
    const ids = [String(userId), String(targetId)].sort();
    const threadId = ids.join("_");
    navigate(`/messages/${threadId}?recipientId=${targetId}`);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", color: "#fff", paddingBottom: "100px" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px" 
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0 }}>Messages</h1>
        <div style={{ 
          marginLeft: "auto",
          background: "rgba(0, 198, 255, 0.1)", 
          padding: "8px 16px", 
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid rgba(0, 198, 255, 0.3)"
        }}>
          <MessageCircle size={18} color="#00c6ff" />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#00c6ff" }}>Inbox</span>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "30px" }}>
        <Search 
          size={20} 
          style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#555" }} 
        />
        <input 
          placeholder="Search people to message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "#111",
            border: "1px solid #222",
            borderRadius: "14px",
            padding: "16px 16px 16px 48px",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#00c6ff")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#222")}
        />

        {searchQuery && (
          <div style={{ 
            position: "absolute", 
            top: "100%", 
            left: 0, 
            right: 0, 
            background: "#111", 
            border: "1px solid #222", 
            borderRadius: "14px", 
            marginTop: "8px", 
            zIndex: 100,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No users found.</div>
            ) : (
              filteredUsers.map(u => (
                <div 
                  key={u.id}
                  onClick={() => startNewChat(u)}
                  style={{ 
                    padding: "12px 16px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#181818")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <img 
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                    alt={u.username}
                    style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>@{u.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>Loading conversations...</div>
      ) : threads.length === 0 && !searchQuery ? (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "16px",
            padding: "60px 40px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Your inbox is empty</p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Search for your friends or favorite creators and start a conversation!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {!searchQuery && threads.map((thread) => {
            const isMe = String(thread.senderId) === String(userId);
            const otherId = isMe ? thread.recipientId : thread.senderId;
            const otherUser = allUsers.find(u => String(u.id) === String(otherId) || String(u.authUserId) === String(otherId));
            const isUnread = !isMe && !thread.isRead; 
            
            return (
              <Link
                key={thread.threadId}
                to={`/messages/${thread.threadId}?recipientId=${otherId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    background: isUnread ? "rgba(0, 198, 255, 0.03)" : "#111",
                    border: isUnread ? "1px solid rgba(0, 198, 255, 0.3)" : "1px solid #222",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isUnread ? "rgba(0, 198, 255, 0.06)" : "#181818";
                    e.currentTarget.style.borderColor = isUnread ? "#00c6ff" : "#333";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isUnread ? "rgba(0, 198, 255, 0.03)" : "#111";
                    e.currentTarget.style.borderColor = isUnread ? "rgba(0, 198, 255, 0.3)" : "#222";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {isUnread && (
                    <div style={{
                      position: "absolute",
                      left: "0",
                      top: "20%",
                      bottom: "20%",
                      width: "4px",
                      background: "#00c6ff",
                      borderRadius: "0 4px 4px 0",
                      boxShadow: "0 0 10px #00c6ff"
                    }} />
                  )}

                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "22px",
                      boxShadow: isUnread ? "0 0 20px rgba(0, 198, 255, 0.3)" : "none",
                      flexShrink: 0
                    }}
                  >
                    {otherUser?.avatarUrl ? (
                      <img src={otherUser.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                    ) : (
                      (otherUser?.username || "U").substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 700, 
                      marginBottom: "6px", 
                      fontSize: "17px",
                      color: isUnread ? "#fff" : "#eee",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      {otherUser?.displayName || otherUser?.username || `User ${otherId}`}
                      {isUnread && <span style={{ 
                        fontSize: "10px", 
                        background: "#00c6ff", 
                        color: "#000", 
                        padding: "2px 8px", 
                        borderRadius: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>New</span>}
                    </div>
                    <div
                      style={{
                        color: isUnread ? "#ccc" : "#888",
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: isUnread ? 500 : 400
                      }}
                    >
                      {isMe ? <span style={{ color: "#00c6ff" }}>You: </span> : ""}{thread.content}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "#555", fontSize: "12px", marginBottom: "4px" }}>
                      {thread.timestamp ? new Date(thread.timestamp).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
