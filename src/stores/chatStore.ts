import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import type { ChatMessage } from '../types/chat';
import { apiFetch, BASE_URL } from '../lib/api';

type ChatState = {
  messages: ChatMessage[];
  unreadThreads: Set<string>;
  typingUsers: Record<string, boolean>; // threadId_senderId -> isTyping
  connected: boolean;
  connecting: boolean;
  client: Client | null;
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (msg: ChatMessage) => void;
  sendTyping: (threadId: string, userId: string, isTyping: boolean) => void;
  sendReadReceipt: (threadId: string, userId: string) => void;
  loadHistory: (threadId: string) => Promise<void>;
  subscribeToThread: (threadId: string) => () => void;
  onNewMessage?: (msg: ChatMessage) => void;
  onCallSignal?: (signal: any) => void;
  sendCallSignal: (recipientId: string, signal: any) => void;
  clearUnread: (threadId: string) => void;
  deleteMessage: (messageId: number, type: 'ME' | 'ALL') => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  unreadThreads: new Set<string>(),
  typingUsers: {},
  connected: false,
  connecting: false,
  client: null,

  connect: (userId) => {
    if (get().connected || get().connecting) return;
    
    set({ connecting: true });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("CHAT ERROR: No token found in localStorage. Gateway will reject this connection.");
      }
      
      const wsUrl = BASE_URL.replace(/^http/, 'ws');
      const brokerURL = token 
        ? `${wsUrl}/ws?token=${token}`
        : `${wsUrl}/ws`;
      const client = new Client({
        brokerURL,
        debug: (msg) => console.log("STOMP:", msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onStompError: (frame) => console.error('STOMP ERROR', frame),
        onWebSocketError: (err) => console.error('WS ERROR', err),
        onConnect: () => {
          set({ connected: true, connecting: false });
          
          client.subscribe(`/topic/inbox/${userId}`, (message) => {
            const payload = JSON.parse(message.body);
            
            if (payload.type === 'MESSAGE_DELETED') {
              // Refresh inbox if needed, or handle locally
              return;
            }

            if (payload.type === 'THREAD_DELETED') {
              // Refresh inbox
              return;
            }

            const newMsg = payload.data || payload;
            if (!newMsg.threadId) return;

            const currentThreadId = window.location.pathname.split('/').pop();
            if (newMsg.threadId !== currentThreadId && newMsg.senderId !== userId) {
              set(s => {
                const next = new Set(s.unreadThreads);
                next.add(newMsg.threadId);
                return { unreadThreads: next };
              });
            }

            if (get().onNewMessage) {
              get().onNewMessage!(newMsg);
            }
          });

          client.subscribe(`/topic/call/${userId}`, (message) => {
            const signal = JSON.parse(message.body);
            if (get().onCallSignal) {
              get().onCallSignal!(signal);
            }
          });
        },
        onDisconnect: () => set({ connected: false, connecting: false }),
      });

      client.activate();
      set({ client });
    } catch (e) {
      set({ connecting: false });
    }
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.deactivate();
      set({ client: null, connected: false, connecting: false });
    }
  },

  sendMessage: (msg) => {
    const { client, connected } = get();
    if (client && connected && client.connected) {
      const tempMsg = { ...msg, id: Date.now(), timestamp: new Date().toISOString(), optimistic: true };
      set(s => ({ messages: [...s.messages, tempMsg] }));

      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ ...msg, isRead: false }),
      });
    }
  },

  sendTyping: (threadId, userId, isTyping) => {
    const { client, connected } = get();
    if (client && connected && client.connected) {
      client.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({ threadId, senderId: userId, isTyping }),
      });
    }
  },

  sendReadReceipt: (threadId, userId) => {
    const { client, connected } = get();
    if (client && connected && client.connected) {
      client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({ threadId, recipientId: userId }),
      });
    }
  },

  loadHistory: async (threadId) => {
    try {
      const response = await apiFetch(`/chat/history/${threadId}`);
      if (response.ok) {
        const history = await response.json();
        set({ messages: history });
      }
    } catch (err) {}
  },

  subscribeToThread: (threadId) => {
    const { client, connected } = get();
    if (!client || !connected || !client.connected) return () => {};

    // Subscribe to messages
    const msgSub = client.subscribe(`/topic/chat/${threadId}`, (message) => {
      const payload = JSON.parse(message.body);
      
      if (payload.type === 'MESSAGE_DELETED') {
        const { messageId, type, userId } = payload.data;
        const currentUserId = localStorage.getItem('userId');
        
        set(state => {
          if (type === 'ALL' || userId === currentUserId) {
            return { messages: state.messages.filter(m => m.id !== messageId) };
          }
          return state;
        });
        return;
      }

      const newMsg = payload.data || payload;
      set((state) => {
        const filtered = state.messages.filter(m => 
          !(m as any).optimistic || m.content !== newMsg.content || m.senderId !== newMsg.senderId
        );
        if (filtered.some(m => m.id === newMsg.id)) return state;
        return { messages: [...filtered, newMsg] };
      });
    });

    // Subscribe to typing indicators
    const typingSub = client.subscribe(`/topic/chat/${threadId}/typing`, (message) => {
      const data = JSON.parse(message.body);
      const key = `${threadId}_${data.senderId}`;
      set(s => ({
        typingUsers: { ...s.typingUsers, [key]: data.isTyping }
      }));
    });

    // Subscribe to read receipts
    const readSub = client.subscribe(`/topic/chat/${threadId}/read`, (message) => {
      const data = JSON.parse(message.body);
      set(state => ({
        messages: state.messages.map(m => {
          if (m.recipientId === data.recipientId) {
            return { ...m, isRead: true };
          }
          return m;
        })
      }));
    });

    return () => {
      msgSub.unsubscribe();
      typingSub.unsubscribe();
      readSub.unsubscribe();
    };
  },

  sendCallSignal: (recipientId, signal) => {
    const { client, connected } = get();
    if (client && connected && client.connected) {
      client.publish({
        destination: '/app/chat.call.signal',
        body: JSON.stringify({ ...signal, recipientId }),
      });
    }
  },

  clearUnread: (threadId) => {
    set(s => {
      const next = new Set(s.unreadThreads);
      next.delete(threadId);
      return { unreadThreads: next };
    });
  },

  deleteMessage: async (messageId, type) => {
    // Optimistic update
    set(state => ({
      messages: state.messages.filter(m => m.id !== messageId)
    }));
    await apiFetch(`/chat/message/${messageId}?type=${type}`, { method: 'DELETE' });
  },

  deleteThread: async (threadId) => {
    // Optimistic update: If this is the current thread, clear messages
    const currentThreadId = window.location.pathname.split('/').pop();
    if (currentThreadId === threadId) {
      set({ messages: [] });
    }
    set(state => {
      const next = new Set(state.unreadThreads);
      next.delete(threadId);
      return { unreadThreads: next };
    });
    await apiFetch(`/chat/thread/${threadId}`, { method: 'DELETE' });
  }
}));
