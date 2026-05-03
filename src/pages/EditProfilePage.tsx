import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PROFILE_BASE } from "../config/apiBase";
import { formatApiErrorBody } from "../lib/apiError";

/** Profile form — open from Settings → Profile & appearance, or profile “Edit profile”. */
export function EditProfilePage() {
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    country: "",
    language: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!userId) {
      setLoadError("Not signed in.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${PROFILE_BASE}/users/me`, {
      headers: { "X-User-Id": userId },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(formatApiErrorBody(text, res.status));
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          country: data.country || "",
          language: data.language || "",
          avatarUrl: data.avatarUrl || "",
        });
        setLoadError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaveStatus(null);
    setSaving(true);

    try {
      const res = await fetch(`${PROFILE_BASE}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setSaveStatus({
          kind: "error",
          text: formatApiErrorBody(text, res.status),
        });
        return;
      }

      setSaveStatus({ kind: "success", text: "Profile saved." });
    } catch {
      setSaveStatus({
        kind: "error",
        text: "Network error. Try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const avatarPreview =
    form.avatarUrl.trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      form.displayName || "user"
    )}`;

  return (
    <div className="settings-page">
      <p className="settings-back">
        <Link to="/settings" className="settings-back-link">
          ← Settings
        </Link>
      </p>
      <div className="settings-card">
        <header className="settings-header">
          <div className="settings-header-row">
            <div>
              <h1 className="settings-title">Profile & appearance</h1>
              <p className="settings-subtitle">
                This information is shown on your public profile.
              </p>
            </div>
            <div className="settings-avatar-wrap" aria-hidden>
              <img
                className="settings-avatar-img"
                src={avatarPreview}
                alt=""
              />
            </div>
          </div>
        </header>

        {loading ? (
          <p className="settings-muted">Loading your profile…</p>
        ) : loadError ? (
          <p className="settings-banner settings-banner-error" role="alert">
            {loadError}
          </p>
        ) : (
          <form className="settings-form" onSubmit={save}>
            <div className="settings-field">
              <label htmlFor="edit-profile-displayName">Display name</label>
              <input
                id="edit-profile-displayName"
                className="settings-input"
                type="text"
                autoComplete="nickname"
                maxLength={200}
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
              />
            </div>

            <div className="settings-field">
              <label htmlFor="edit-profile-bio">Bio</label>
              <textarea
                id="edit-profile-bio"
                className="settings-textarea"
                placeholder="Tell people what you create or care about."
                rows={4}
                maxLength={2000}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            <div className="settings-row">
              <div className="settings-field">
                <label htmlFor="edit-profile-country">Country</label>
                <input
                  id="edit-profile-country"
                  className="settings-input"
                  type="text"
                  autoComplete="country-name"
                  maxLength={100}
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                />
              </div>
              <div className="settings-field">
                <label htmlFor="edit-profile-language">Language</label>
                <input
                  id="edit-profile-language"
                  className="settings-input"
                  type="text"
                  autoComplete="language"
                  maxLength={50}
                  placeholder="e.g. English"
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="edit-profile-avatarUrl">Avatar image URL</label>
              <input
                id="edit-profile-avatarUrl"
                className="settings-input"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm({ ...form, avatarUrl: e.target.value })
                }
              />
              <span className="settings-hint">
                Paste a direct link to an image, or leave blank for a generated
                avatar.
              </span>
            </div>

            {saveStatus ? (
              <p
                className={
                  saveStatus.kind === "success"
                    ? "settings-banner settings-banner-success"
                    : "settings-banner settings-banner-error"
                }
                role="status"
              >
                {saveStatus.text}
              </p>
            ) : null}

            <div className="settings-actions">
              <button
                type="submit"
                className="settings-submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
