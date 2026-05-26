import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./CreatePostModal.module.css";
import { apiFetch } from "../../lib/api";
import type { Post } from "../../types";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onPostUpdated: () => void;
}

export function EditPostModal({ isOpen, onClose, post, onPostUpdated }: EditPostModalProps) {
  const [caption, setCaption] = useState(post.caption || "");
  const [location, setLocation] = useState(post.location || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      
      const res = await apiFetch(`/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, location }),
      });

      if (!res.ok) throw new Error("Failed to update post");
      
      onPostUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update post.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', height: 'auto', minHeight: 'unset' }}>
        <div className={styles.header}>
          <h2>Edit Post</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content} style={{ flexDirection: 'column', overflowY: 'visible', padding: '24px' }}>
          <div className={styles.inputGroup} style={{ width: '100%', marginBottom: '16px' }}>
            <label>Caption</label>
            <textarea 
              className={styles.textarea}
              placeholder="Write something luxurious..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ minHeight: '120px' }}
            />
          </div>

          <div className={styles.inputGroup} style={{ width: '100%' }}>
            <label>Location</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Where was this taken?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer} style={{ marginTop: '0' }}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isUpdating}>
            Cancel
          </button>
          <button 
            className={styles.submitBtn} 
            onClick={handleSubmit} 
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
