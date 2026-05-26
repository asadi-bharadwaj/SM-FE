import { useRef, useEffect, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useChatStore } from '../../stores/chatStore';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from 'lucide-react';
import styles from './ChatThread.module.css'; // Reuse existing styles
import { apiFetch } from '../../lib/api';

export function GlobalCallManager() {
  const userId = localStorage.getItem('userId');
  const { connected } = useChatStore();
  
  if (!userId || !connected) return null;

  return <CallOverlay userId={userId} />;
}

function CallOverlay({ userId }: { userId: string }) {
  // Pass null as recipientId to listen for ANY incoming call
  const { 
    status, 
    callType, 
    isMuted, 
    isVideoOff, 
    toggleAudio, 
    toggleVideo, 
    acceptCall, 
    endCall, 
    remoteStream, 
    localStream, 
    incomingOffer,
    recipientId
  } = useWebRTC(userId, null);

  const [callerName, setCallerName] = useState('Incoming Call...');
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (recipientId && status === 'RINGING') {
      apiFetch(`/users/all`)
        .then(r => r.json())
        .then(users => {
          const user = users.find((u: any) => String(u.id) === String(recipientId) || String(u.authUserId) === String(recipientId));
          if (user) setCallerName(user.username || user.displayName);
        });
    }
  }, [recipientId, status]);

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

  if (status === 'IDLE') return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(20px)'
    }}>
      {(status === 'RINGING' || status === 'DIALING') && (
        <audio loop autoPlay src="https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3" />
      )}
      <div className={callType === 'VIDEO' ? styles.videoContainer : styles.audioContainer} style={{ width: '100%', height: '100%', margin: 0, borderRadius: 0 }}>
        {callType === 'VIDEO' && (
          <>
            {status === 'CONNECTED' ? (
              <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVideo} style={{ borderRadius: 0 }} />
            ) : (
              <div className={styles.remotePlaceholder}>
                <div className={styles.avatarLarge} style={{ width: '120px', height: '120px', fontSize: '40px' }}>
                  {callerName.substring(0, 2).toUpperCase()}
                </div>
                <h2 style={{ fontSize: '24px', marginTop: '20px' }}>{callerName}</h2>
                <p>{status === 'RINGING' ? 'Incoming Video Call...' : 'Connecting...'}</p>
              </div>
            )}
            <video ref={localVideoRef} autoPlay muted playsInline className={styles.localVideo} />
          </>
        )}

        {callType === 'AUDIO' && (
          <div className={styles.audioCallUI} style={{ background: 'transparent' }}>
            <div className={styles.avatarLarge} style={{ width: '120px', height: '120px', fontSize: '40px', background: 'linear-gradient(135deg, #00c6ff, #0072ff)' }}>
              {callerName.substring(0, 2).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '24px', marginTop: '20px' }}>{callerName}</h2>
            <p style={{ color: '#00c6ff', fontWeight: 600 }}>
              {status === 'RINGING' ? 'Incoming Voice Call...' : status === 'CONNECTED' ? 'On Voice Call' : 'Connecting...'}
            </p>
            <audio ref={remoteVideoRef as any} autoPlay />
          </div>
        )}

        <div className={styles.callControls} style={{ bottom: '40px' }}>
          {status === 'RINGING' ? (
            <div className={styles.controlRow}>
              <button 
                onClick={() => acceptCall(incomingOffer, callType)}
                className={`${styles.controlBtn} ${styles.acceptBtn}`}
                style={{ width: '70px', height: '70px' }}
                title="Accept"
              >
                {callType === 'VIDEO' ? <Video size={32} /> : <Phone size={32} />}
              </button>
              <button 
                onClick={() => endCall()}
                className={`${styles.controlBtn} ${styles.declineBtn}`}
                style={{ width: '70px', height: '70px' }}
                title="Decline"
              >
                <PhoneOff size={32} />
              </button>
            </div>
          ) : (
            <div className={styles.controlRow} style={{ gap: '24px' }}>
              <button 
                onClick={toggleAudio}
                className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`}
                style={{ width: '60px', height: '60px' }}
              >
                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
              </button>
              
              {callType === 'VIDEO' && (
                <button 
                  onClick={toggleVideo}
                  className={`${styles.controlBtn} ${isVideoOff ? styles.active : ''}`}
                  style={{ width: '60px', height: '60px' }}
                >
                  {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
                </button>
              )}

              <button 
                onClick={() => endCall()}
                className={`${styles.controlBtn} ${styles.declineBtn}`}
                style={{ width: '60px', height: '60px' }}
              >
                <PhoneOff size={28} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {status === 'ENDED' && (
        <div style={{ position: 'absolute', bottom: '100px', color: '#ff4d4d', fontWeight: 800, fontSize: '18px' }}>
          Call Ended
        </div>
      )}
    </div>
  );
}
