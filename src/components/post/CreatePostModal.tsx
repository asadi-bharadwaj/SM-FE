import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import styles from "./CreatePostModal.module.css";
import { apiFetch } from "../../lib/api";

const PRESET_FILTERS = [
  { name: "Normal", values: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0 } },
  { name: "Clarendon", values: { brightness: 110, contrast: 120, saturation: 125, sepia: 0, grayscale: 0, blur: 0 } },
  { name: "Gingham", values: { brightness: 105, contrast: 90, saturation: 100, sepia: 30, grayscale: 0, blur: 0 } },
  { name: "Moon", values: { brightness: 110, contrast: 110, saturation: 100, sepia: 0, grayscale: 100, blur: 0 } },
  { name: "Reyes", values: { brightness: 110, contrast: 85, saturation: 75, sepia: 22, grayscale: 0, blur: 0 } },
  { name: "Juno", values: { brightness: 100, contrast: 115, saturation: 115, sepia: 20, grayscale: 0, blur: 0 } },
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Filters state
  const [activePreset, setActivePreset] = useState("Normal");
  const [filters, setFilters] = useState(PRESET_FILTERS[0].values);

  // When a preset is clicked
  const handlePresetSelect = (presetName: string, presetValues: typeof filters) => {
    setActivePreset(presetName);
    setFilters(presetValues);
  };

  // When a manual slider is changed, set activePreset to Custom
  const handleManualFilterChange = (key: keyof typeof filters, value: number) => {
    setActivePreset("Custom");
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image into canvas
  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = previewUrl;
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Adjust canvas size to match image aspect ratio
          const maxWidth = 800;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Apply filters
          ctx.filter = `
            brightness(${filters.brightness}%) 
            contrast(${filters.contrast}%) 
            saturate(${filters.saturation}%) 
            sepia(${filters.sepia}%) 
            grayscale(${filters.grayscale}%) 
            blur(${filters.blur}px)
          `;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
    }
  }, [previewUrl, filters]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type.startsWith("image/")) {
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        alert("Please select an image file.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith("image/")) {
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
      }
    }
  };

  const getCanvasBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!canvasRef.current) return reject("No canvas");
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Failed to create blob");
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleSubmit = async () => {
    if (!file || !previewUrl) return;

    try {
      setIsUploading(true);

      // 1. Get filtered image as blob
      const blob = await getCanvasBlob();

      // 2. Get Pre-signed URL from Content-Service
      const ext = "jpg";
      const contentType = "image/jpeg";
      
      const presignRes = await apiFetch("/posts/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extension: ext, contentType }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      
      const { uploadUrl } = await presignRes.json();

      // 3. Upload directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: blob,
      });

      if (!s3Res.ok) throw new Error("Failed to upload to S3");

      // We need the public URL of the object. Since we don't know the exact domain format, 
      // we'll construct it based on standard S3 URL formats.
      const bucketUrl = uploadUrl.split("?")[0];
      
      // 4. Create Post in Content-Service
      const postRes = await apiFetch("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: bucketUrl,
          mediaType: "IMAGE", // We only process images via canvas right now
          caption,
          visibility,
          tags
        }),
      });

      if (!postRes.ok) throw new Error("Failed to create post");

      onPostCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to upload post. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Create New Post</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.mediaSection}>
            {!previewUrl ? (
              <div 
                className={styles.dropzone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={48} />
                <p>Drag & Drop or Click to Upload</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <>
                <div className={styles.previewContainer}>
                  <canvas ref={canvasRef} className={styles.previewCanvas} />
                </div>
                
                <div className={styles.presetsContainer}>
                  {PRESET_FILTERS.map((preset) => (
                    <button
                      key={preset.name}
                      className={`${styles.presetBtn} ${activePreset === preset.name ? styles.active : ""}`}
                      onClick={() => handlePresetSelect(preset.name, preset.values)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className={styles.filterControls}>
                  <div className={styles.filterRow}>
                    <label>Brightness <span>{filters.brightness}%</span></label>
                    <input type="range" className={styles.slider} min="0" max="200" value={filters.brightness} onChange={(e) => handleManualFilterChange('brightness', Number(e.target.value))} />
                  </div>
                  <div className={styles.filterRow}>
                    <label>Contrast <span>{filters.contrast}%</span></label>
                    <input type="range" className={styles.slider} min="0" max="200" value={filters.contrast} onChange={(e) => handleManualFilterChange('contrast', Number(e.target.value))} />
                  </div>
                  <div className={styles.filterRow}>
                    <label>Saturation <span>{filters.saturation}%</span></label>
                    <input type="range" className={styles.slider} min="0" max="200" value={filters.saturation} onChange={(e) => handleManualFilterChange('saturation', Number(e.target.value))} />
                  </div>
                  <div className={styles.filterRow}>
                    <label>Blur <span>{filters.blur}px</span></label>
                    <input type="range" className={styles.slider} min="0" max="10" value={filters.blur} onChange={(e) => handleManualFilterChange('blur', Number(e.target.value))} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.inputGroup}>
              <label>Caption</label>
              <textarea 
                className={styles.textarea}
                placeholder="Write something luxurious..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Visibility</label>
              <select className={styles.select} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="PUBLIC">Public</option>
                <option value="SUBSCRIBERS">Subscribers Only</option>
                <option value="TIER">Premium Tier</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Tags (comma separated)</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="luxury, lifestyle, code"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <div className="glow-border-wrap" style={{ display: 'inline-block', borderRadius: '12px' }}>
            <button 
              className={styles.submitBtn} 
              onClick={handleSubmit} 
              disabled={!file || isUploading}
            >
              {isUploading ? "Posting..." : "Share to Feed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
