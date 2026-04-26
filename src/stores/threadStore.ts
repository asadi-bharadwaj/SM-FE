import { create } from 'zustand'
import { appendMessage } from '../mocks/threads'
import { CURRENT_USER_ID } from '../mocks/users'

type State = {
  version: number
  send: (threadId: string, body: string) => void
}

export const useThreadStore = create<State>((set) => ({
  version: 0,
  send: (threadId, body) => {
    appendMessage(threadId, body, CURRENT_USER_ID)
    set((s) => ({ version: s.version + 1 }))
  },
}))

export function useThreadVersion() {
  return useThreadStore((s) => s.version)
}
