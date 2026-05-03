import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openOrGetConversation } from "../../api/chatApi";
import { CHAT_BASE, PROFILE_BASE } from "../../config/apiBase";
import { getCurrentUserId } from "../../lib/currentUser";
import { useThreadStore } from "../../stores/threadStore";
import { Avatar } from "../common/Avatar";
import styles from "./MessageProfileSearch.module.css";

type UserRow = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

function mapUser(raw: Record<string, unknown>): UserRow {
  const username = String(raw.username ?? "");
  const id = String(raw.id ?? "");
  const displayName = String(raw.displayName ?? username);
  const avatarUrl =
    String(raw.avatarUrl ?? "").trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username || id)}`;
  return { id, username, displayName, avatarUrl };
}

export function MessageProfileSearch() {
  const navigate = useNavigate();
  const bump = useThreadStore((s) => s.bump);
  const me = getCurrentUserId();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingDir, setLoadingDir] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${PROFILE_BASE}/users/all`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown) => {
        if (cancelled || !Array.isArray(d)) return;
        setUsers(d.map((x) => mapUser(x as Record<string, unknown>)));
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDir(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const others = users.filter((u) => String(u.id) !== String(me));
    if (!q) return [];
    return others
      .filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [users, query, me]);

  const showResults = query.trim().length > 0;

  const pick = async (other: UserRow) => {
    if (!me || opening) return;
    if (String(other.id) === String(me)) {
      setError("You can't message yourself. Open a chat with someone else.");
      return;
    }
    setError(null);
    setOpening(true);
    try {
      const cid = await openOrGetConversation(me, other.id);
      bump();
      setQuery("");
      navigate(`/messages/${cid}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not open conversation.";
      if (
        msg === "Failed to fetch" ||
        (e instanceof TypeError && /fetch|network/i.test(String(e.message)))
      ) {
        setError(
          `Cannot reach chat at ${CHAT_BASE}. Start chat-service (default port 8085).`
        );
      } else {
        setError(msg);
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <label htmlFor="msg-profile-search" className={styles.label}>
        New message
      </label>
      <input
        id="msg-profile-search"
        type="search"
        autoComplete="off"
        placeholder={
          me ? "Search people by name…" : "Sign in to message"
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setError(null);
        }}
        className={styles.input}
        disabled={!me}
      />
      {loadingDir && me ? (
        <p className={styles.hint}>Loading directory…</p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {showResults ? (
        <ul className={styles.results} role="listbox" aria-label="Matching profiles">
          {filtered.length === 0 ? (
            <li className={styles.empty}>No matches</li>
          ) : (
            filtered.map((u) => (
              <li key={u.id} role="presentation">
                <button
                  type="button"
                  className={styles.pick}
                  role="option"
                  onClick={() => pick(u)}
                  disabled={opening}
                >
                  <Avatar src={u.avatarUrl} alt="" size="sm" />
                  <span className={styles.meta}>
                    <span className={styles.un}>@{u.username}</span>
                    <span className={styles.dn}>{u.displayName}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
