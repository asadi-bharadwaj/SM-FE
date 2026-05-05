import { create } from 'zustand'

const BASE_URL = 'http://localhost:8081'

type State = {
  subscribedAuthorIds: Set<string>
  isLoaded: boolean
  isSubscribed: (authorId: string | number) => boolean
  toggleSubscribe: (authorId: string | number, currentUserId?: string) => Promise<void>
  updateSubscription: (authorId: string | number, isSubscribed: boolean) => void
  loadSubscriptions: (userId?: string) => Promise<void>
}

export const useSubscriptionStore = create<State>((set, get) => ({
  subscribedAuthorIds: new Set(),
  isLoaded: false,

  isSubscribed: (authorId) =>
    get().subscribedAuthorIds.has(String(authorId)),

  loadSubscriptions: async (userId) => {
    const currentUserId = userId || localStorage.getItem('userId')
    
    if (!currentUserId) {
      console.warn('No userId available for loading subscriptions')
      return
    }

    try {
      const response = await fetch(
        `${BASE_URL}/users/following`,
        {
          headers: {
            'X-User-Id': currentUserId,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load subscriptions')
      }

      const data = await response.json()
      const subscriptions = Array.isArray(data) ? data : []

      set(() => {
        const next = new Set<string>()
        subscriptions.forEach((sub: any) => {
          next.add(String(sub.creatorId))
        })
        return { 
          subscribedAuthorIds: next,
          isLoaded: true
        }
      })
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      set({ isLoaded: true })
    }
  },

  toggleSubscribe: async (authorId, currentUserId) => {
    const creatorId = authorId
    const userId = currentUserId || localStorage.getItem('userId')

    if (!userId || !creatorId) {
      console.error('Missing userId or creatorId', { userId, creatorId })
      return
    }

    const already = get().subscribedAuthorIds.has(String(authorId))

    try {
      const response = await fetch(
        `${BASE_URL}/users/follow/${creatorId}`,
        {
          method: already ? 'DELETE' : 'POST',
          headers: {
            'X-User-Id': userId,
          },
        }
      )

      if (!response.ok) {
        throw new Error('API failed')
      }

      set((state) => {
        const next = new Set(state.subscribedAuthorIds)

        if (already) next.delete(String(authorId))
        else next.add(String(authorId))

        return { subscribedAuthorIds: next }
      })
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    }
  },

  updateSubscription: (authorId, isSubscribed) => {
    set((state) => {
      const next = new Set(state.subscribedAuthorIds)
      const authorIdStr = String(authorId)

      if (isSubscribed) {
        next.add(authorIdStr)
      } else {
        next.delete(authorIdStr)
      }

      return { subscribedAuthorIds: next }
    })
  },
}))