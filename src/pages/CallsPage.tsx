import { useEffect, useState } from 'react';
import { Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing, Clock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import styles from './CallsPage.module.css';

interface CallLog {
  id: number;
  callerId: string;
  receiverId: string;
  type: 'VOICE' | 'VIDEO';
  status: 'COMPLETED' | 'MISSED' | 'REJECTED' | 'BUSY';
  duration?: number;
  timestamp: string;
}

export function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, any>>({});
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    Promise.all([
      apiFetch('/chat/calls/history').then(res => res.json()),
      apiFetch('/users/all').then(res => res.json())
    ]).then(([history, allUsers]) => {
      setCalls(Array.isArray(history) ? history : []);
      const userMap: Record<string, any> = {};
      (Array.isArray(allUsers) ? allUsers : []).forEach((u: any) => {
        userMap[String(u.id)] = u;
        userMap[String(u.authUserId)] = u;
      });
      setUsers(userMap);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch call history", err);
      setLoading(false);
    });
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusIcon = (call: CallLog) => {
    const isOutgoing = String(call.callerId) === String(currentUserId);
    if (call.status === 'MISSED') return <PhoneMissed size={16} color="#ff4d4d" />;
    if (isOutgoing) return <PhoneOutgoing size={16} color="#00c6ff" />;
    return <PhoneIncoming size={16} color="#00ff00" />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Call History</h1>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading history...</div>
      ) : calls.length === 0 ? (
        <div className={styles.empty}>No recent calls</div>
      ) : (
        <div className={styles.callList}>
          {calls.map((call) => {
            const isOutgoing = String(call.callerId) === String(currentUserId);
            const otherId = isOutgoing ? call.receiverId : call.callerId;
            const otherUser = users[otherId];
            
            return (
              <div key={call.id} className={styles.callItem}>
                <div className={styles.avatar}>
                  <img 
                    src={otherUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username || 'user'}`} 
                    alt={otherUser?.username || 'User'} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </div>
                <div className={styles.callInfo}>
                  <div className={styles.otherName}>
                    {otherUser?.displayName || otherUser?.username || `User ${otherId}`}
                  </div>
                  <div className={styles.callMeta}>
                    {getStatusIcon(call)}
                    <span>{isOutgoing ? 'Outgoing' : 'Incoming'} {call.type.toLowerCase()} call</span>
                    <span>•</span>
                    <span>{new Date(call.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className={styles.callDuration}>
                  {call.status === 'COMPLETED' ? (
                    <div className={styles.durationBadge}>
                      <Clock size={12} />
                      {formatDuration(call.duration)}
                    </div>
                  ) : (
                    <span className={styles.statusText}>{call.status}</span>
                  )}
                  {call.type === 'VIDEO' ? <Video size={18} color="#888" /> : <Phone size={18} color="#888" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
