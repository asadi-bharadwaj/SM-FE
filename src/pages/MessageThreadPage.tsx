import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchThreadDetail } from "../api/chatApi";
import { getCurrentUserId } from "../lib/currentUser";
import { useThreadVersion } from "../stores/threadStore";
import { NotFoundPage } from "./NotFoundPage";
import { ChatThread } from "../components/chat/ChatThread";
import type { Thread } from "../types";

export function MessageThreadPage() {
  const { threadId } = useParams();
  const version = useThreadVersion();
  const uid = getCurrentUserId();
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!threadId || !uid) {
      setThread(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const t = await fetchThreadDetail(threadId, uid);
        if (!cancelled) {
          setThread(t);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setThread(null);
        }
      }
    };

    void load();
    const interval = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [threadId, uid, version]);

  if (!threadId) return <NotFoundPage />;
  if (!uid) {
    return (
      <div style={{ color: "#fff", padding: 24 }}>
        Sign in to view messages.
      </div>
    );
  }
  if (error) return <NotFoundPage />;
  if (!thread) {
    return (
      <div style={{ color: "#8a8a8a", padding: 24 }}>Loading conversation…</div>
    );
  }

  return <ChatThread key={`${thread.id}-${version}`} thread={thread} />;
}
