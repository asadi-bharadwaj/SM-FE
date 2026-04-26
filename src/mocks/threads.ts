import type { Message, Thread } from '../types'
import { getUserById } from './users'

const t1id = 't1'
const t2id = 't2'

const m = (
  id: string,
  threadId: string,
  senderId: string,
  body: string,
  at: number,
): Message => ({
  id,
  threadId,
  senderId,
  body,
  createdAt: new Date(at).toISOString(),
})

const initialMessages1: Message[] = [
  m('m1', t1id, 'u1', 'Hey! Thanks for subscribing.', Date.now() - 86400000),
  m('m2', t1id, 'u-me', 'Loving the BTS content.', Date.now() - 86000000),
  m('m3', t1id, 'u1', 'New drop Friday.', Date.now() - 3600000),
]

const initialMessages2: Message[] = [
  m('m4', t2id, 'u2', 'Pro tier Figma is live.', Date.now() - 7200000),
]

const u1 = getUserById('u1')!
const u2 = getUserById('u2')!
const me = getUserById('u-me')!

export const MOCK_THREADS: Thread[] = [
  {
    id: t1id,
    participants: [u1, me],
    lastMessage: {
      body: 'New drop Friday.',
      createdAt: initialMessages1[initialMessages1.length - 1]!.createdAt,
      senderId: 'u1',
    },
    unreadCount: 1,
    messages: initialMessages1,
  },
  {
    id: t2id,
    participants: [u2, me],
    lastMessage: {
      body: 'Pro tier Figma is live.',
      createdAt: initialMessages2[initialMessages2.length - 1]!.createdAt,
      senderId: 'u2',
    },
    unreadCount: 0,
    messages: initialMessages2,
  },
]

let threads = JSON.parse(JSON.stringify(MOCK_THREADS)) as Thread[]

export function getThreads(): Thread[] {
  return threads
}

export function getThread(id: string): Thread | undefined {
  return threads.find((t) => t.id === id)
}

export function appendMessage(threadId: string, body: string, senderId: string) {
  const t = threads.find((th) => th.id === threadId)
  if (!t) return
  const msg: Message = {
    id: `m-${Date.now()}`,
    threadId,
    senderId,
    body,
    createdAt: new Date().toISOString(),
  }
  t.messages.push(msg)
  t.lastMessage = { body, createdAt: msg.createdAt, senderId }
  t.unreadCount = 0
  threads = [...threads]
  return getThread(threadId)
}

// reset for HMR
export function resetMockThreads() {
  threads = JSON.parse(JSON.stringify(MOCK_THREADS)) as Thread[]
}
