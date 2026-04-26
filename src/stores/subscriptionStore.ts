import { create } from 'zustand'

const initial = new Set<string>(['u1', 'u2'])

type State = {
  subscribedAuthorIds: Set<string>
  isSubscribed: (authorId: string) => boolean
  setSubscribed: (authorId: string, value: boolean) => void
  toggleSubscribe: (authorId: string) => void
}

export const useSubscriptionStore = create<State>((set, get) => ({
  subscribedAuthorIds: new Set(initial),
  isSubscribed: (authorId) => get().subscribedAuthorIds.has(authorId),
  setSubscribed: (authorId, value) =>
    set((s) => {
      const next = new Set(s.subscribedAuthorIds)
      if (value) next.add(authorId)
      else next.delete(authorId)
      return { subscribedAuthorIds: next }
    }),
  toggleSubscribe: (authorId) => {
    const { setSubscribed, isSubscribed } = get()
    setSubscribed(authorId, !isSubscribed(authorId))
  },
}))
