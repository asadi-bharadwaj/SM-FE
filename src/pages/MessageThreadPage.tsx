import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { ChatThread } from '../components/chat/ChatThread';
import { NotFoundPage } from './NotFoundPage';
import { apiFetch } from "../lib/api";

export function MessageThreadPage() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipientId');
  const userId = localStorage.getItem('userId');
  
  const { loadHistory, messages, subscribeToThread, connected, clearUnread } = useChatStore();

  useEffect(() => {
    if (threadId) {
      loadHistory(threadId);
      clearUnread(threadId); // Instantly clear the red dot locally
    }
  }, [threadId, loadHistory, clearUnread]);

  useEffect(() => {
    if (threadId && connected) {
      console.log("SUBSCRIBING to thread:", threadId);
      const unsubscribe = subscribeToThread(threadId);
      
      // Mark as read
      if (userId) {
        apiFetch(`/chat/read/${threadId}/${userId}`, { method: 'PUT' })
          .catch(e => console.error("Failed to mark as read", e));
      }
      return () => {
        console.log("UNSUBSCRIBING from thread:", threadId);
        unsubscribe();
      };
    }
  }, [threadId, connected, subscribeToThread, userId]);

  const isGroup = threadId?.startsWith('GROUP_');

  if (!threadId || !userId) return <NotFoundPage />;
  if (!isGroup && !recipientId) return <NotFoundPage />;

  return (
    <div style={{ height: 'calc(100dvh - 100px)' }}>
      <ChatThread 
        threadId={threadId} 
        userId={userId} 
        recipientId={recipientId || threadId} // Fallback to threadId for groups
        messages={messages}
      />
    </div>
  );
}
