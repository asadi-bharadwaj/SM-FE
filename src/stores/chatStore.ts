import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';

type ChatState = {
  messages: ChatMessage[];
  connected: boolean;
  connecting: boolean;
  client: Client | null;
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (msg: ChatMessage) => void;
  loadHistory: (threadId: string) => Promise<void>;
  subscribeToThread: (threadId: string) => () => void;
  onNewMessage?: (msg: ChatMessage) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  connected: false,
  connecting: false,
  client: null,

  connect: (userId) => {
    if (get().connected || get().connecting) return;
    
    set({ connecting: true });
    console.log("SYSTEM: Initializing WebSocket for user:", userId);

    try {
      const socket = new SockJS('http://127.0.0.1:8081/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (msg) => console.log("DEBUG STOMP:", msg),
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log("SYSTEM: WS CONNECTED", frame.headers['user-name'] || '');
          set({ connected: true, connecting: false });
          
          client.subscribe(`/topic/inbox/${userId}`, (message) => {
            const newMsg = JSON.parse(message.body) as ChatMessage;
            console.log("SYSTEM: Inbox notification received");
            if (get().onNewMessage) {
              get().onNewMessage!(newMsg);
            }
          });
        },
        onDisconnect: () => {
          console.log("SYSTEM: WS DISCONNECTED");
          set({ connected: false, connecting: false });
        },
        onStompError: (frame) => {
          console.error("SYSTEM: STOMP ERROR", frame.headers['message']);
          set({ connected: false, connecting: false });
        }
      });

      client.activate();
      set({ client });
    } catch (e) {
      console.error("SYSTEM: WS INIT FAILED", e);
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
    if (client && connected) {
      console.log("SYSTEM: Outgoing message ->", msg.content);
      
      // OPTIMISTIC UPDATE: Add to UI immediately
      const tempMsg = { 
        ...msg, 
        id: Date.now(), 
        timestamp: new Date().toISOString(),
        optimistic: true 
      };
      
      set(s => ({ messages: [...s.messages, tempMsg] }));

      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          ...msg,
          isRead: false
        }),
      });
    } else {
      console.error("SYSTEM: CANNOT SEND - No Connection");
    }
  },

  loadHistory: async (threadId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8081/chat/history/${threadId}`);
      if (response.ok) {
        const history = await response.json();
        set({ messages: history });
      }
    } catch (err) {
      console.error('SYSTEM: History failed', err);
    }
  },

  subscribeToThread: (threadId) => {
    const { client, connected } = get();
    if (!client || !connected) return () => {};

    console.log("SYSTEM: Subscribing to thread topic:", threadId);
    const sub = client.subscribe(`/topic/chat/${threadId}`, (message) => {
      const newMsg = JSON.parse(message.body) as ChatMessage;
      console.log("SYSTEM: Incoming message ->", newMsg.content);
      
      set((state) => {
        // Dedup: Remove optimistic version if it exists
        const filtered = state.messages.filter(m => 
          !(m as any).optimistic || m.content !== newMsg.content || m.senderId !== newMsg.senderId
        );
        
        // Final Dedup: Check if this ID is already in the list
        if (filtered.some(m => m.id === newMsg.id)) return state;
        
        return { messages: [...filtered, newMsg] };
      });
    });

    return () => sub.unsubscribe();
  },
}));
