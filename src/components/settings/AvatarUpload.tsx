import React, { useState, useRef } from 'react';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/users/me/avatar', {
        method: 'POST',
        headers: {
          'X-User-Id': userId || '',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onAvatarChange(data.avatarUrl);
        setShowOptions(false);
      } else {
        alert('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onAvatarChange(urlInput.trim());
      setUrlInput('');
      setShowOptions(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={styles.avatarUpload}>
      <div className={styles.currentAvatar}>
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Current avatar" className={styles.avatar} />
        ) : (
          <div className={styles.placeholder}>
            <span>No avatar</span>
          </div>
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
          <button
            type="button"
            className={styles.option}
            onClick={openFileDialog}
            disabled={isUploading}
          >
            📁 Upload from Device
          </button>

          <button
            type="button"
            className={styles.option}
            onClick={openCamera}
            disabled={isUploading}
          >
            📷 Open Camera
          </button>

          <div className={styles.urlOption}>
            <input
              type="url"
              placeholder="Enter image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className={styles.urlInput}
              disabled={isUploading}
            />
            <button
              type="button"
              className={styles.urlButton}
              onClick={handleUrlSubmit}
              disabled={isUploading || !urlInput.trim()}
            >
              ✓
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: 'none' }}
      />
    </div>
  );
}