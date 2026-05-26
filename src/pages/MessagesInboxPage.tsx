import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import type { ChatMessage } from "../types/chat";
import { Search, MessageCircle, Users, Plus, X, Check } from "lucide-react";
import { apiFetch } from "../lib/api";

type UserProfile = {
  id: string;
  authUserId?: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

type ChatGroup = {
  id: number;
  threadId: string;
  name: string;
};

export function MessagesInboxPage() {
  const [threads, setThreads] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userGroups, setUserGroups] = useState<ChatGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [threadsLoading, setThreadsLoading] = useState(true);
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  const { connected, unreadThreads } = useChatStore();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    loadInbox();
    loadUsers();
    loadGroups();
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
    setThreadsLoading(true);
    try {
      // 1. Load messages/threads
      const threadRes = await apiFetch(`/chat/threads/${userId}`);
      let messageThreads: ChatMessage[] = [];
      if (threadRes.ok) {
        messageThreads = await threadRes.json() as ChatMessage[];
      }

      // 2. Load groups
      const groupRes = await apiFetch(`/chat/groups/${userId}`);
      let groups: ChatGroup[] = [];
      if (groupRes.ok) {
        groups = await groupRes.json() as ChatGroup[];
        setUserGroups(groups);
      }
      
      // Group by threadId and keep latest message correctly
      const threadMap = new Map<string, ChatMessage>();
      messageThreads.forEach(m => {
        if (!threadMap.has(m.threadId)) {
          threadMap.set(m.threadId, m);
        } else {
          const current = threadMap.get(m.threadId)!;
          if (new Date(m.timestamp!) > new Date(current.timestamp!)) {
            threadMap.set(m.threadId, m);
          }
        }
      });

      // 3. Ensure all groups are represented, even those with no messages
      groups.forEach(group => {
        if (!threadMap.has(group.threadId)) {
          // Dummy message for groups with no messages
          threadMap.set(group.threadId, {
            threadId: group.threadId,
            content: "No messages yet. Say hi!",
            senderId: "",
            recipientId: "",
            timestamp: new Date(0).toISOString(), // Oldest possible to sort at bottom
            isRead: true
          } as ChatMessage);
        }
      });
        
      setThreads(Array.from(threadMap.values()).sort((a, b) => 
        new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
      ));
    } catch (err) {
      console.error("Failed to fetch inbox", err);
    } finally {
      setThreadsLoading(false);
    }
  };

  const loadGroups = async () => {
    // This is now handled within loadInbox to ensure synchronization
  };

  const loadUsers = async () => {
    try {
      const res = await apiFetch("/users/all");
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
    (u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 8);

  const startNewChat = (user: UserProfile) => {
    const targetId = user.id;
    const ids = [String(userId), String(targetId)].sort();
    const threadId = ids.join("_");
    navigate(`/messages/${threadId}?recipientId=${targetId}`);
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedMembers.length === 0) return;
    try {
      const res = await apiFetch("/chat/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          memberIds: [...selectedMembers, userId]
        })
      });
      if (res.ok) {
        const group = await res.json();
        setShowCreateGroup(false);
        setGroupName("");
        setSelectedMembers([]);
        navigate(`/messages/${group.threadId}`);
      }
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="inbox-container">
      <style>
        {`
          .inbox-container {
            max-width: 800px;
            margin: 0 auto;
            color: #fff;
            padding-bottom: 100px;
          }
          .inbox-title {
            font-size: 32px;
            font-weight: 800;
            margin: 0;
          }
          .inbox-thread-card {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.2s ease;
            position: relative;
          }
          .inbox-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 22px;
            flex-shrink: 0;
          }
          .inbox-empty {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 60px 40px;
            text-align: center;
            color: #888;
          }
          
          @media (max-width: 768px) {
            .inbox-title {
              font-size: 24px;
            }
            .inbox-thread-card {
              padding: 12px;
              gap: 12px;
              border-radius: 12px;
            }
            .inbox-avatar {
              width: 48px;
              height: 48px;
              font-size: 18px;
            }
            .inbox-empty {
              padding: 40px 20px;
            }
            .thread-name { font-size: 15px !important; }
            .thread-preview { font-size: 13px !important; }
          }
        `}
      </style>
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
        <h1 className="inbox-title">Messages</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setShowCreateGroup(true)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid #333",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
          >
            <Users size={18} />
            Create Group
          </button>
          <div style={{ 
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
      </div>

      {/* Group Create Modal */}
      {showCreateGroup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "24px",
            width: "90%",
            maxWidth: "500px",
            padding: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>New Group</h2>
              <X style={{ cursor: "pointer" }} onClick={() => setShowCreateGroup(false)} />
            </div>

            <input 
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "14px",
                color: "#fff",
                fontSize: "16px",
                marginBottom: "20px",
                outline: "none"
              }}
            />

            <div style={{ marginBottom: "12px", fontSize: "14px", color: "#888" }}>
              Selected: {selectedMembers.length} members
            </div>

            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "#555" }} />
              <input 
                placeholder="Search users..."
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0a0a0a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "12px 12px 12px 40px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "24px" }}>
              {allUsers.filter(u => String(u.id) !== String(userId) && (u.username?.toLowerCase().includes(groupSearchQuery.toLowerCase()) || u.displayName?.toLowerCase().includes(groupSearchQuery.toLowerCase()))).map(u => (
                <div 
                  key={u.id}
                  onClick={() => toggleMember(u.id)}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "10px", 
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: selectedMembers.includes(u.id) ? "rgba(0, 198, 255, 0.1)" : "transparent"
                  }}
                >
                  <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                  <div style={{ flex: 1 }}>{u.displayName}</div>
                  {selectedMembers.includes(u.id) ? <Check size={18} color="#00c6ff" /> : <Plus size={18} color="#444" />}
                </div>
              ))}
            </div>

            <button 
              onClick={handleCreateGroup}
              disabled={!groupName || selectedMembers.length === 0}
              style={{
                width: "100%",
                background: groupName && selectedMembers.length > 0 ? "linear-gradient(90deg, #00c6ff, #0072ff)" : "#222",
                color: groupName && selectedMembers.length > 0 ? "#fff" : "#555",
                border: "none",
                padding: "16px",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: groupName && selectedMembers.length > 0 ? "pointer" : "default"
              }}
            >
              Create Group Chat
            </button>
          </div>
        </div>
      )}

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
                  key={String(u.authUserId ?? u.id)}
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

      {threadsLoading && threads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>Loading conversations...</div>
      ) : threads.length === 0 && !searchQuery ? (
        <div className="inbox-empty">
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Your inbox is empty</p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Search for your friends or favorite creators and start a conversation!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {!searchQuery && threads.map((thread) => {
            const isMe = String(thread.senderId) === String(userId);
            const isGroup = thread.threadId.startsWith("GROUP_");
            const otherId = isMe ? thread.recipientId : thread.senderId;
            const otherUser = allUsers.find(u => String(u.id) === String(otherId));
            const groupInfo = isGroup ? userGroups.find(g => g.threadId === thread.threadId) : null;
            const isUnread = unreadThreads.has(thread.threadId); 
            
            const threadName = isGroup ? (groupInfo?.name || "Group Chat") : (otherUser?.displayName || otherUser?.username || `User ${otherId}`);
            const threadAvatar = isGroup ? null : otherUser?.avatarUrl;
            
            return (
              <Link
                key={thread.threadId}
                to={isGroup ? `/messages/${thread.threadId}` : `/messages/${thread.threadId}?recipientId=${otherId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="inbox-thread-card"
                  style={{
                    background: isUnread ? "rgba(0, 198, 255, 0.03)" : "#111",
                    borderColor: isUnread ? "rgba(0, 198, 255, 0.3)" : "#222",
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
                    className="inbox-avatar"
                    style={{
                      background: isGroup ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" : "transparent",
                      boxShadow: isUnread ? "0 0 20px rgba(0, 198, 255, 0.3)" : "none",
                    }}
                  >
                    {isGroup ? (
                      <Users size={28} color="#fff" />
                    ) : (
                      <img src={threadAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username || "user"}`} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="thread-name" style={{ 
                      fontWeight: 700, 
                      marginBottom: "6px", 
                      fontSize: "17px",
                      color: isUnread ? "#fff" : "#eee",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      {threadName}
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
                      className="thread-preview"
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
