import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import { apiFetch, BASE_URL } from '../lib/api';

type Notification = {
  id: number;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  client: Client | null;
  connect: (userId: string) => void;
  disconnect: () => void;
  addNotification: (notif: Notification) => void;
  markAllRead: () => void;
  fetchNotifications: (userId: string) => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  connected: false,
  client: null,

  connect: (userId) => {
    if (get().connected) return;

    // Fetch existing unread notifications first
    get().fetchNotifications(userId);

    const token = localStorage.getItem('token');
    const wsUrl = BASE_URL.replace(/^http/, 'ws');
    const brokerURL = token 
      ? `${wsUrl}/ws-notif?token=${token}`
      : `${wsUrl}/ws-notif`;

    const client = new Client({
      brokerURL,
      debug: (msg) => console.log("NOTIF STOMP:", msg),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("NOTIF SUCCESS: Connected to alerts");
        set({ connected: true });
        
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          const newNotif = JSON.parse(message.body) as Notification;
          get().addNotification(newNotif);
        });
      },
      onDisconnect: () => set({ connected: false }),
    });

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.deactivate();
      set({ connected: false, client: null });
    }
  },

  fetchNotifications: async (userId) => {
    try {
      const response = await apiFetch(`/api/notifications?recipientId=${userId}&unreadOnly=true`);
      if (response.ok) {
        const data = await response.json();
        const unread = Array.isArray(data) ? data : [];
        set({ 
          notifications: unread.slice(0, 20),
          unreadCount: unread.length 
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications in store:", error);
    }
  },

  addNotification: (notif) => {
    set((state) => {
      // Avoid duplicates if possible
      if (state.notifications.some(n => n.id === notif.id)) return state;
      
      return {
        notifications: [notif, ...state.notifications].slice(0, 20),
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  markAllRead: () => {
    set({ unreadCount: 0 });
  },
}));
