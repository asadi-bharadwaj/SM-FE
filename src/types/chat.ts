import type { PublicProfile } from './user'

export type Message = {
  id: string
  threadId: string
  senderId: string
  body: string
  createdAt: string
}

export type Thread = {
  id: string
  participants: PublicProfile[]
  lastMessage: { body: string; createdAt: string; senderId: string }
  unreadCount: number
  messages: Message[]
}
