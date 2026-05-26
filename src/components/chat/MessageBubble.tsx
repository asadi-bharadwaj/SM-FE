import styles from './MessageBubble.module.css'
import { timeAgo } from '../../lib/time'
import { Play, Pause, Check, CheckCheck, ChevronDown, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { useChatStore } from '../../stores/chatStore'
import { BASE_URL } from '../../lib/api'
import { SharedPostPreview } from './SharedPostPreview'
type Props = {
  id?: number;
  message: string;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  isRead?: boolean;
  type?: string;
  audioUrl?: string;
  duration?: number;
}

export function MessageBubble({ id, message, isMe, senderName, timestamp, isRead, type, audioUrl, duration }: Props) {
  const isGif = message.startsWith("GIF:");
  const gifUrl = isGif ? message.substring(4) : null;
  const isVoice = type === 'VOICE';

  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { deleteMessage } = useChatStore();

  const isPostShare = message.startsWith("Check out this post: ");
  const postUrlMatch = isPostShare ? message.match(/Check out this post:\s*(.+)$/) : null;
  const postUrl = postUrlMatch ? postUrlMatch[1] : null;
  const postIdMatch = postUrl ? postUrl.match(/\/p\/(\d+)/) : null;
  const sharedPostId = postIdMatch ? postIdMatch[1] : null;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onEnded = () => setIsPlaying(false);

  const handleDelete = (type: 'ME' | 'ALL') => {
    if (id) {
      deleteMessage(id, type);
      setShowMenu(false);
    }
  };

  return (
    <div className={isMe ? styles.mine : styles.them} style={{ position: 'relative' }}>
      <div className={styles.bubbleContainer}>
        <div className={styles.bubble}>
          {senderName && !isMe && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#00c6ff', marginBottom: '4px' }}>
              {senderName}
            </div>
          )}
          {isGif ? (
            <img 
              src={gifUrl!} 
              alt="GIF" 
              style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }} 
            />
          ) : isVoice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px', padding: '4px 0' }}>
              <button 
                onClick={togglePlay}
                style={{ background: isMe ? '#fff' : '#00c6ff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isMe ? '#000' : '#fff' }}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: isMe ? '#fff' : '#00c6ff', width: '0%', borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                  Voice Message · {Math.floor((duration || 0) / 60)}:{( (duration || 0) % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <audio 
                ref={audioRef} 
                src={audioUrl?.startsWith('/') ? `${BASE_URL}${audioUrl}` : audioUrl} 
                onEnded={onEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
            </div>
          ) : (
            <>
              {!sharedPostId && message}
              {sharedPostId && <SharedPostPreview postId={sharedPostId} />}
            </>
          )}
          {timestamp && (
            <div className={styles.meta} title={timestamp}>
              {timeAgo(timestamp)}
              {isMe && (
                <span style={{ marginLeft: '4px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                  {isRead ? (
                    <CheckCheck size={14} color="#00c6ff" />
                  ) : (
                    <Check size={14} color="#888" />
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        <button 
          className={styles.menuTrigger}
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: '20px',
            height: '20px'
          }}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {showMenu && (
        <div style={{
          position: 'absolute',
          top: '30px',
          [isMe ? 'right' : 'left']: '0',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          zIndex: 100,
          padding: '6px',
          minWidth: '160px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
        }}>
          <button 
            onClick={() => handleDelete('ME')}
            style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', borderRadius: '8px' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <Trash2 size={14} /> Delete for me
          </button>
          {isMe && (
            <button 
              onClick={() => handleDelete('ALL')}
              style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', borderRadius: '8px' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,77,77,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Trash2 size={14} /> Delete for everyone
            </button>
          )}
          <div style={{ height: '1px', background: '#333', margin: '4px 0' }} />
          <button 
            onClick={() => setShowMenu(false)}
            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#666', textAlign: 'left', cursor: 'pointer', fontSize: '12px' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
