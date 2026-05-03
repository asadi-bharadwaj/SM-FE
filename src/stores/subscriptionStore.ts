import { create } from 'zustand'

import { SOCIAL_BASE } from '../config/apiBase'

type State = {
  subscribedAuthorIds: Set<string>
  isSubscribed: (authorId: string) => boolean
  toggleSubscribe: (authorId: string) => Promise<void>
}

export const useSubscriptionStore = create<State>((set, get) => ({
  subscribedAuthorIds: new Set(),

  isSubscribed: (authorId) =>
    get().subscribedAuthorIds.has(authorId),

  toggleSubscribe: async (authorId) => {
    const viewerId = localStorage.getItem('userId')
    if (!viewerId) {
      alert('Sign in to subscribe')
      return
    }

    const already = get().subscribedAuthorIds.has(authorId)

    try {
      const response = await fetch(
        `${SOCIAL_BASE}/users/follow/${authorId}`,
        {
          method: already ? 'DELETE' : 'POST',
          headers: {
            'X-User-Id': viewerId,
          },
        }
      )

      if (!response.ok) {
        throw new Error('API failed')
      }

      set((state) => {
        const next = new Set(state.subscribedAuthorIds)

        if (already) next.delete(authorId)
        else next.add(authorId)

        return { subscribedAuthorIds: next }
      })
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    }
  },
}))
