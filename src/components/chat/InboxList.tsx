import { useEffect, useState } from "react";
import { enrichThreadsForInbox, fetchConversationSummaries } from "../../api/chatApi";
import { getCurrentUserId } from "../../lib/currentUser";
import type { Thread } from "../../types";
import { useThreadVersion } from "../../stores/threadStore";
import { InboxRow } from "./InboxRow";
import { MessageProfileSearch } from "./MessageProfileSearch";
import styles from "./InboxList.module.css";

export function InboxList() {
  const ver = useThreadVersion();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getCurrentUserId();
    if (!uid) {
      setThreads([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const summaries = await fetchConversationSummaries(uid);
        const enriched = await enrichThreadsForInbox(summaries, uid);
        if (!cancelled) {
          setThreads(enriched);
        }
      } catch {
        if (!cancelled) setThreads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
  }, [ver]);

  if (!getCurrentUserId()) {
    return (
      <div className={styles.root}>
        <MessageProfileSearch />
        <h2 className={styles.heading}>Messages</h2>
        <p style={{ color: "#8a8a8a", padding: "12px 0" }}>
          Sign in to see your conversations.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.root}>
        <MessageProfileSearch />
        <h2 className={styles.heading}>Messages</h2>
        <p style={{ color: "#8a8a8a" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <MessageProfileSearch />
      <h2 className={styles.heading}>Messages</h2>
      <ul className={styles.list} aria-label="Conversations">
        {threads.map((t) => (
          <InboxRow key={t.id} t={t} />
        ))}
      </ul>
      {threads.length === 0 && (
        <p style={{ color: "#8a8a8a", padding: "12px 0" }}>
          No conversations yet. Search above to start a chat, or message from a
          profile.
        </p>
      )}
    </div>
  );
}
