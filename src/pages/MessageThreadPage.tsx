import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { ChatThread } from '../components/chat/ChatThread';
import { NotFoundPage } from './NotFoundPage';

export function MessageThreadPage() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipientId');
  const userId = localStorage.getItem('userId');
  
  const { loadHistory, messages, subscribeToThread, connected } = useChatStore();

  useEffect(() => {
    if (threadId) {
      loadHistory(threadId);
    }
  }, [threadId, loadHistory]);

  useEffect(() => {
    if (threadId && connected) {
      console.log("SUBSCRIBING to thread:", threadId);
      const unsubscribe = subscribeToThread(threadId);
      
      // Mark as read
      if (userId) {
        fetch(`http://localhost:8081/chat/read/${threadId}/${userId}`, { method: 'PUT' })
          .catch(e => console.error("Failed to mark as read", e));
      }
      return () => {
        console.log("UNSUBSCRIBING from thread:", threadId);
        unsubscribe();
      };
    }
  }, [threadId, connected, subscribeToThread, userId]);

  if (!threadId || !userId || !recipientId) return <NotFoundPage />;

  return (
    <div style={{ height: 'calc(100vh - 100px)' }}>
      <ChatThread 
        threadId={threadId} 
        userId={userId} 
        recipientId={recipientId}
        messages={messages}
      />
    </div>
  );
}
