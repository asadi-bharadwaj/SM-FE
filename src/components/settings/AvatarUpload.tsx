import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './AvatarUpload.module.css';
import { apiFetch } from '../../lib/api';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopStream(); // cleanup on unmount
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('File size must be less than 20MB'); return; }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiFetch('/users/me/avatar', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        onAvatarChange(data.avatarUrl);
        setShowOptions(false);
        setShowCamera(false);
        stopStream();
      } else {
        const text = await response.text();
        alert(`Upload failed: ${text}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onAvatarChange(urlInput.trim());
      setUrlInput('');
      setShowOptions(false);
    }
  };

  const openCamera = useCallback(async () => {
    setCameraError('');
    setCameraReady(false);
    setShowOptions(false);
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow camera permission in your browser and try again.'
          : 'Could not access your camera. Make sure it\'s not being used by another application.'
      );
    }
  }, []);

  const closeCamera = () => {
    stopStream();
    setShowCamera(false);
    setCameraReady(false);
    setCameraError('');
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isUploading) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      await handleFileUpload(file);
    }, 'image/jpeg', 0.92);
  }, [isUploading]);

  return (
    <div className={styles.avatarUpload}>
      <div className={styles.currentAvatar}>
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Current avatar" className={styles.avatar} />
        ) : (
          <div className={styles.placeholder}><span>No avatar</span></div>
        )}
      </div>

      <button
        type="button"
        className={styles.changeButton}
        onClick={() => setShowOptions(!showOptions)}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Change Avatar'}
      </button>

      {showOptions && (
        <div className={styles.options}>
          <button type="button" className={styles.option} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            📁 Upload from Device
          </button>
          <button type="button" className={styles.option} onClick={openCamera} disabled={isUploading}>
            📷 Open Camera
          </button>
          <div className={styles.urlOption}>
            <input
              type="url"
              placeholder="Or paste an image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className={styles.urlInput}
              disabled={isUploading}
            />
            <button type="button" className={styles.urlButton} onClick={handleUrlSubmit} disabled={isUploading || !urlInput.trim()}>✓</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Camera Modal ── */}
      {showCamera && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, gap: 24, padding: 24,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 600 }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Take a Photo</span>
            <button
              onClick={closeCamera}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, padding: '6px 14px', fontSize: 14,
                cursor: 'pointer', fontWeight: 600,
              }}
            >✕ Close</button>
          </div>

          {/* Video / Error area */}
          <div style={{ width: '100%', maxWidth: 600, borderRadius: 16, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)', minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cameraError ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📵</div>
                <p style={{ color: '#ff6b6b', fontSize: 15, lineHeight: 1.5, maxWidth: 380 }}>{cameraError}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' /* mirror for selfie feel */ }}
              />
            )}
          </div>

          {/* Capture button */}
          {!cameraError && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                onClick={capturePhoto}
                disabled={isUploading || !cameraReady}
                style={{
                  width: 72, height: 72,
                  borderRadius: '50%',
                  background: isUploading ? '#444' : 'white',
                  border: '5px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 0 0 3px rgba(255,255,255,0.08)',
                  cursor: (isUploading || !cameraReady) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, transition: 'transform 0.1s',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isUploading ? '⏳' : ''}
              </button>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                {!cameraReady ? 'Starting camera...' : isUploading ? 'Uploading...' : 'Click to capture'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}