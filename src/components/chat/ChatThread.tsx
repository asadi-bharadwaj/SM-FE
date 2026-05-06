import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../stores/chatStore';
import type { ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import styles from './ChatThread.module.css';

type Props = {
  threadId: string;
  userId: string;
  recipientId: string;
  messages: ChatMessage[];
};

export function ChatThread({ threadId, userId, recipientId, messages }: Props) {
  const { sendMessage, connected, connecting } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recipientName, setRecipientName] = useState(`User ${recipientId}`);
  const navigate = useNavigate(); // Added for back navigation

  useEffect(() => {
    // Fetch recipient details to show username instead of ID
    fetch(`http://localhost:8081/users/all`)
      .then(r => r.json())
      .then(users => {
        const user = users.find((u: any) => String(u.id) === String(recipientId) || String(u.authUserId) === String(recipientId));
        if (user) setRecipientName(user.username || user.displayName);
      })
      .catch(() => {});
  }, [recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    sendMessage({
      threadId,
      senderId: userId,
      recipientId,
      content: text,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
            marginRight: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className={styles.avatar}>
          {recipientName.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 className={styles.title}>{recipientName}</h3>
          <div style={{ fontSize: '10px', color: connected ? '#00ff00' : '#ff4d4d' }}>
            {connected ? '● Connected' : connecting ? 'Connecting...' : '○ Offline'}
          </div>
        </div>
      </div>
      
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 && !connecting && (
          <div className={styles.empty}>No messages yet. Start the conversation!</div>
        )}
        {connecting && <div className={styles.empty}>Establishing secure connection...</div>}
        {messages.map((msg, i) => (
          <MessageBubble 
            key={msg.id || i} 
            message={msg.content} 
            isMe={String(msg.senderId) === String(userId)}
            timestamp={msg.timestamp}
          />
        ))}
      </div>

      <div className={styles.composer}>
        <ChatComposer onSend={handleSend} disabled={!connected} />
      </div>
    </div>
  );
}
