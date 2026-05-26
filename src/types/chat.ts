import type { PublicProfile } from "./user";

export type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  threadId?: string;
  isMe?: boolean;
};

export type Thread = {
  id: string;
  participants: PublicProfile[];
  lastMessage: Message;
  unreadCount: number;
  messages?: Message[];
};

export type ChatMessage = {
  id?: number;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp?: string;
  threadId: string;
  isRead?: boolean;
};
