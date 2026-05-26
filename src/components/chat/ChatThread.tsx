import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../stores/chatStore';
import type { ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import { apiFetch } from '../../lib/api';
import styles from './ChatThread.module.css';
import { Phone, PhoneOff, Users, MoreHorizontal, Trash2, Video, Mic, MicOff, VideoOff } from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';

type Props = {
  threadId: string;
  userId: string;
  recipientId: string;
  messages: ChatMessage[];
};

export function ChatThread({ threadId, userId, recipientId, messages }: Props) {
  const { sendMessage, connected, connecting, typingUsers, sendReadReceipt, deleteThread } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recipientName, setRecipientName] = useState(`User ${recipientId}`);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showThreadMenu, setShowThreadMenu] = useState(false);
  const [recipientAvatar, setRecipientAvatar] = useState<string | null>(null);
  const [recipientUsername, setRecipientUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  const isGroup = threadId.startsWith("GROUP_");

  const { 
    status, 
    callType, 
    isMuted, 
    isVideoOff, 
    toggleAudio, 
    toggleVideo, 
    startCall, 
    acceptCall, 
    endCall, 
    remoteStream, 
    localStream, 
    incomingOffer 
  } = useWebRTC(userId, recipientId);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, status]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, status]);

  // Check if the other person is typing
  const isOtherTyping = typingUsers[`${threadId}_${recipientId}`];

  useEffect(() => {
    apiFetch(`/users/all`)
      .then(r => r.json())
      .then(users => {
        setAllUsers(users);
        if (!isGroup) {
          const user = users.find((u: any) => String(u.id) === String(recipientId) || String(u.authUserId) === String(recipientId));
          if (user) {
            setRecipientName(user.username || user.displayName);
            setRecipientUsername(user.username);
            setRecipientAvatar(user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
          }
        } else {
          // Fetch group name
          apiFetch(`/chat/groups/${userId}`)
            .then(gr => gr.json())
            .then(groups => {
              const group = groups.find((g: any) => g.threadId === threadId);
              if (group) setRecipientName(group.name);
            });
          
          // Fetch participants
          apiFetch(`/chat/groups/${threadId}/members`)
            .then(res => res.json())
            .then(data => setParticipants(data))
            .catch(err => console.error("Failed to fetch participants", err));
        }
      })
      .catch(() => {});
  }, [recipientId, threadId, isGroup, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Send read receipt if we have unread messages from the other person
    const hasUnread = messages.some(m => String(m.recipientId) === String(userId) && !m.isRead);
    if (hasUnread && connected) {
      sendReadReceipt(threadId, userId);
    }
  }, [messages, isOtherTyping, threadId, userId, sendReadReceipt, connected]);

  const handleSend = (text: string, type: string = 'TEXT', audioUrl?: string, duration?: number) => {
    sendMessage({
      threadId,
      senderId: userId,
      recipientId: isGroup ? threadId : recipientId, // For groups, recipientId in message is threadId
      content: text,
      type,
      audioUrl,
      duration
    } as any);
  };

  const handleDeleteThread = async () => {
    if (window.confirm(`Are you sure you want to delete this ${isGroup ? 'group' : 'chat'}? This will remove it from your inbox.`)) {
      await deleteThread(threadId);
      navigate('/messages');
    }
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
        <div className={styles.avatar} style={isGroup ? { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' } : { overflow: 'hidden', background: '#333' }}>
          {isGroup ? <Users size={20} /> : (
            <img src={recipientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientName}`} alt={recipientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div 
          style={{ flex: 1, cursor: 'pointer' }} 
          onClick={() => {
            if (isGroup) {
              navigate(`/messages/${threadId}/details`);
            } else if (recipientUsername || recipientId) {
              navigate(`/u/${recipientUsername || recipientId}`);
            }
          }}
        >
          <h3 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {recipientName}
          </h3>
          <div style={{ fontSize: '10px', color: status !== 'IDLE' ? '#00c6ff' : connected ? '#00ff00' : '#ff4d4d', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isGroup ? (
              <>
                <span style={{ color: connected ? '#00ff00' : '#ff4d4d' }}>●</span>
                <span>{participants.length} Participants</span>
              </>
            ) : (status !== 'IDLE' ? `Call: ${status}` : connected ? '● Connected' : connecting ? 'Connecting...' : '○ Offline')}
          </div>
        </div>

        <div className={styles.actions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isGroup && (
            <button 
              onClick={() => startCall('AUDIO')}
              className={styles.toolBtn}
              style={{ background: 'rgba(0, 198, 255, 0.1)', color: '#00c6ff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Group Voice Call"
            >
              <Phone size={20} />
            </button>
          )}

          {!isGroup && (
            <>
              {status === 'IDLE' && (
                <>
                  <button 
                    onClick={() => startCall('AUDIO')}
                    className={styles.toolBtn}
                    style={{ background: 'rgba(0, 198, 255, 0.1)', color: '#00c6ff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Voice Call"
                  >
                    <Phone size={20} />
                  </button>
                  <button 
                    onClick={() => startCall('VIDEO')}
                    className={styles.toolBtn}
                    style={{ background: 'rgba(0, 198, 255, 0.1)', color: '#00c6ff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Video Call"
                  >
                    <Video size={20} />
                  </button>
                </>
              )}
            </>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowThreadMenu(!showThreadMenu)}
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showThreadMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                zIndex: 110,
                width: '200px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '8px'
              }}>
                <button 
                  onClick={handleDeleteThread}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderRadius: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,77,77,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Trash2 size={16} /> Delete {isGroup ? 'Group' : 'Conversation'}
                </button>
                <button 
                  onClick={() => setShowThreadMenu(false)}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#888', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {status !== 'IDLE' && status !== 'ENDED' && (
        <div className={callType === 'VIDEO' ? styles.videoContainer : styles.audioContainer}>
          {callType === 'VIDEO' && (
            <>
              {status === 'CONNECTED' ? (
                <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVideo} />
              ) : (
                <div className={styles.remotePlaceholder}>
                  <div className={styles.avatarLarge} style={{ overflow: 'hidden', background: '#333' }}>
                    <img src={recipientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientName}`} alt={recipientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <p>{status === 'RINGING' ? 'Incoming Video Call...' : 'Calling...'}</p>
                </div>
              )}
              <video ref={localVideoRef} autoPlay muted playsInline className={styles.localVideo} />
            </>
          )}

          {callType === 'AUDIO' && (
            <div className={styles.audioCallUI}>
              <div className={styles.avatarLarge} style={{ overflow: 'hidden', background: '#333' }}>
                <img src={recipientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientName}`} alt={recipientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p>{status === 'RINGING' ? 'Incoming Voice Call...' : status === 'CONNECTED' ? 'On Voice Call' : 'Calling...'}</p>
              <audio ref={remoteVideoRef as any} autoPlay />
            </div>
          )}

          <div className={styles.callControls}>
            {status === 'RINGING' ? (
              <div className={styles.controlRow}>
                <button 
                  onClick={() => acceptCall(incomingOffer, callType)}
                  className={`${styles.controlBtn} ${styles.acceptBtn}`}
                  title="Accept"
                >
                  {callType === 'VIDEO' ? <Video size={24} /> : <Phone size={24} />}
                </button>
                <button 
                  onClick={() => endCall()}
                  className={`${styles.controlBtn} ${styles.declineBtn}`}
                  title="Decline"
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            ) : (
              <div className={styles.controlRow}>
                <button 
                  onClick={toggleAudio}
                  className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                
                {callType === 'VIDEO' && (
                  <button 
                    onClick={toggleVideo}
                    className={`${styles.controlBtn} ${isVideoOff ? styles.active : ''}`}
                    title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                )}

                <button 
                  onClick={() => endCall()}
                  className={`${styles.controlBtn} ${styles.declineBtn}`}
                  title="End Call"
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.messages} ref={scrollRef}>
        {showParticipants && (
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            width: '240px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            zIndex: 100,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Group Participants</h4>
              <button onClick={() => setShowParticipants(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {participants.map((p, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/profile/${p.username || p.id}`)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '6px', 
                    borderRadius: '6px', 
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #00c6ff, #0072ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', overflow: 'hidden' }}>
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username || 'user'}`} style={{ width: '100%', height: '100%' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', color: '#eee' }}>{p.displayName || p.username}</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>@{p.username || 'user'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {messages.length === 0 && !connecting && (
          <div className={styles.empty}>No messages yet. Start the conversation!</div>
        )}
        {connecting && <div className={styles.empty}>Establishing secure connection...</div>}
        
        {messages.map((msg, i) => {
          const sender = allUsers.find(u => String(u.id) === String(msg.senderId) || String(u.authUserId) === String(msg.senderId));
          return (
            <MessageBubble 
              key={msg.id || i} 
              id={msg.id}
              message={msg.content} 
              isMe={String(msg.senderId) === String(userId)}
              senderName={isGroup && String(msg.senderId) !== String(userId) ? (sender?.displayName || sender?.username || `User ${msg.senderId}`) : undefined}
              timestamp={msg.timestamp}
              isRead={msg.isRead}
              type={(msg as any).type}
              audioUrl={(msg as any).audioUrl}
              duration={(msg as any).duration}
            />
          );
        })}

        {isOtherTyping && !isGroup && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingBubble}>
              <span>{recipientName} is typing</span>
              <div className={styles.dots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.composer}>
        <ChatComposer 
          threadId={threadId} 
          userId={userId} 
          onSend={handleSend} 
          disabled={!connected} 
        />
      </div>
    </div>
  );
}
