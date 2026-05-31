import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Image, Search, Paperclip, AlertCircle, Mic, Square } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useChatStore } from '../../stores/chatStore'
import styles from './ChatComposer.module.css'
import { GIPHY_API_KEY, apiFetch } from '../../lib/api'

type Props = { 
  threadId: string;
  userId: string;
  onSend: (body: string, type?: string, audioUrl?: string, duration?: number) => void; 
  disabled?: boolean 
}

export function ChatComposer({ threadId, userId, onSend, disabled }: Props) {
  const [t, setT] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifs, setGifs] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<any>(null)
  
  const sendTyping = useChatStore((s) => s.sendTyping)
  const typingRef = useRef<any>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!t.trim() || disabled) return
    onSend(t.trim())
    setT('')
    setShowEmoji(false)
    setShowGif(false)
    
    // Stop typing immediately on send
    if (typingRef.current) clearTimeout(typingRef.current)
    sendTyping(threadId, userId, false)
  }

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Prefer mp4/aac for iOS compatibility
      const mimeType = ['audio/mp4', 'audio/aac', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
      console.log("Using mimeType for recording:", mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      const startTime = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const extension = (mimeType?.includes('mp4') || mimeType?.includes('aac')) ? 'mp4' : 'webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const duration = Math.floor((Date.now() - startTime) / 1000);
        
        // Upload audio
        const formData = new FormData();
        formData.append('file', audioBlob, `voice_${Date.now()}.${extension}`);
        formData.append('threadId', threadId);

        try {
          const res = await apiFetch('/chat/voice/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            // web app uses (content, type, url, duration) format
            onSend('Voice Message', 'VOICE', data.audioUrl, duration);
          }
        } catch (err) {
          console.error("Failed to upload voice message", err);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Handle typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setT(val)

    if (!disabled) {
      // Send typing = true immediately
      sendTyping(threadId, userId, true)

      // Debounce the typing = false
      if (typingRef.current) clearTimeout(typingRef.current)
      typingRef.current = setTimeout(() => {
        sendTyping(threadId, userId, false)
      }, 3000)
    }
  }

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
        setShowGif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (typingRef.current) clearTimeout(typingRef.current)
    }
  }, [])

  // Search GIFs
  useEffect(() => {
    if (!showGif) return;
    const delayDebounce = setTimeout(() => {
      searchGifs();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [gifQuery, showGif]);

  const searchGifs = async () => {
    setSearching(true);
    setError(null);
    try {
      const q = gifQuery || 'trending';
      const endpoint = gifQuery ? 'search' : 'trending';
      const res = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?api_key=${GIPHY_API_KEY}&q=${q}&limit=12&rating=g`);
      if (!res.ok) throw new Error(`Giphy API returned ${res.status}`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      setGifs([]);
      setError("Giphy connection limited.");
    } finally {
      setSearching(false);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setT(prev => prev + emojiData.emoji)
    sendTyping(threadId, userId, true)
  }

  const sendGif = (url: string) => {
    onSend(`GIF:${url}`)
    setShowGif(false)
  }

  const handleMediaUpload = () => {
    alert("Photo/Video upload requires storage. Use GIFs for now.");
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {showEmoji && (
        <div className={styles.popup}>
          <EmojiPicker onEmojiClick={onEmojiClick} theme={"dark" as any} width={320} height={400} />
        </div>
      )}

      {showGif && (
        <div className={styles.popup} style={{ width: '320px', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #333' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input 
                placeholder="Search GIFs..." 
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value)}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: '8px', padding: '8px 8px 8px 32px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {searching ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#666', padding: '20px' }}>Searching...</div>
            ) : error ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#ff4d4d', padding: '20px', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={24} />
                {error}
              </div>
            ) : gifs.map(g => (
              <img key={g.id} src={g.images.fixed_width_small.url} onClick={() => sendGif(g.images.original.url)} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }} alt="gif" />
            ))}
          </div>
        </div>
      )}

      <form className={styles.form} onSubmit={submit}>
        {!isRecording ? (
          <>
            <button type="button" className={styles.toolBtn} onClick={handleMediaUpload} aria-label="Upload Media"><Paperclip size={20} /></button>
            <button type="button" className={styles.toolBtn} onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }} aria-label="Emojis"><Smile size={22} /></button>
            <button type="button" className={styles.toolBtn} onClick={() => { setShowGif(!showGif); setShowEmoji(false); }} aria-label="GIFs"><Image size={22} /></button>

            <input
              className={styles.input}
              placeholder="Message..."
              value={t}
              onChange={handleInputChange}
              disabled={disabled}
              autoComplete="off"
            />
            
            <button 
              type="button" 
              className={styles.toolBtn} 
              onClick={startRecording}
              style={{ color: '#ff4d4d' }}
              aria-label="Record Voice"
            >
              <Mic size={22} />
            </button>

            <button className={styles.send} type="submit" disabled={!t.trim() || disabled} aria-label="Send"><Send size={20} /></button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '16px', padding: '0 12px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ff4d4d', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
            <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>Recording... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
            <button 
              type="button" 
              onClick={stopRecording}
              style={{ background: '#ff4d4d', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifySelf: 'center', color: '#fff', cursor: 'pointer' }}
            >
              <Square size={18} style={{ margin: '0 auto' }} />
            </button>
          </div>
        )}
      </form>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
