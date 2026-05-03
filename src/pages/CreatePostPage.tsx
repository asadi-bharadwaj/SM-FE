import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { CONTENT_BASE } from "../config/apiBase";
import { formatApiErrorBody } from "../lib/apiError";

type Visibility = "public" | "subscribers" | "tier";

export function CreatePostPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!f) {
      setFile(null);
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("You need to be logged in to post.");
      return;
    }
    if (!file) {
      setError("Choose a photo or video to upload.");
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", caption);
    fd.append("visibility", visibility);
    if (tags.trim()) fd.append("tags", tags.trim());

    try {
      const res = await fetch(`${CONTENT_BASE}/posts`, {
        method: "POST",
        headers: {
          "X-User-Id": userId,
        },
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setError(formatApiErrorBody(text, res.status));
        return;
      }

      navigate("/u/me");
    } catch {
      setError(
        `Network error. Is content-service running at ${CONTENT_BASE}?`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-card">
        <header className="create-post-header">
          <h1 className="create-post-title">New post</h1>
          <p className="create-post-subtitle">
            Upload an image or video. It appears on your profile and in feeds.
          </p>
        </header>

        <form className="create-post-form" onSubmit={submit}>
          <div className="create-post-drop">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="create-post-file-input"
              onChange={onPickFile}
            />
            {previewUrl ? (
              <div className="create-post-preview">
                {file?.type.startsWith("video/") ? (
                  <video
                    className="create-post-preview-media"
                    src={previewUrl}
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    className="create-post-preview-media"
                    src={previewUrl}
                    alt="Preview"
                  />
                )}
                <button
                  type="button"
                  className="create-post-change"
                  onClick={() => fileRef.current?.click()}
                >
                  Change file
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="create-post-placeholder"
                onClick={() => fileRef.current?.click()}
              >
                <span className="create-post-placeholder-label">
                  Click to upload
                </span>
                <span className="create-post-placeholder-hint">
                  PNG, JPG, GIF, WebP, or MP4 · max ~80MB
                </span>
              </button>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="create-caption">Caption</label>
            <textarea
              id="create-caption"
              className="settings-textarea"
              placeholder="Write a caption…"
              rows={4}
              maxLength={2000}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label htmlFor="create-visibility">Who can see this</label>
            <select
              id="create-visibility"
              className="settings-input create-post-select"
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as Visibility)
              }
            >
              <option value="public">Everyone</option>
              <option value="subscribers">Subscribers only</option>
              <option value="tier">Tier subscribers</option>
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="create-tags">Tags (optional)</label>
            <input
              id="create-tags"
              className="settings-input"
              type="text"
              placeholder="art, behind-the-scenes"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <span className="settings-hint">Comma-separated.</span>
          </div>

          {error ? (
            <p className="settings-banner settings-banner-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="create-post-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
