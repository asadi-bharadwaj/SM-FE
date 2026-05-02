import { create } from 'zustand'

const USER_ID = 1
const BASE_URL = 'http://localhost:8081'

const creatorMap: Record<string, number> = {
  u1: 101,
  u2: 202,
  u3: 303,
}

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
    const creatorId = creatorMap[authorId]

    if (!creatorId) {
      console.error('Creator mapping missing')
      return
    }

    const already = get().subscribedAuthorIds.has(authorId)

    try {
      const response = await fetch(
        `${BASE_URL}/users/follow/${creatorId}`,
        {
          method: already ? 'DELETE' : 'POST',
          headers: {
            'X-User-Id': USER_ID.toString(),
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