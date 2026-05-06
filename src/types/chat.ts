export type ChatMessage = {
  id?: number;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp?: string;
  threadId: string;
  isRead?: boolean;
};
