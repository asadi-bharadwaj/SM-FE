import { create } from 'zustand'
import { INITIAL_ENGAGEMENT } from '../mocks/engagementSeed'
import type { Comment, PublicProfile } from '../types'

type ByPost = typeof INITIAL_ENGAGEMENT

const initialByPost: ByPost = JSON.parse(
  JSON.stringify(INITIAL_ENGAGEMENT),
) as ByPost

type State = {
  byPost: ByPost
  toggleLike: (postId: string) => void
  addComment: (postId: string, user: PublicProfile, text: string) => void
}

export const useEngagementStore = create<State>((set) => ({
  byPost: initialByPost,
  toggleLike: (postId) =>
    set((s) => {
      const cur = s.byPost[postId]
      if (!cur) return s
      const next = { ...s.byPost[postId]! }
      next.liked = !next.liked
      next.likeCount += next.liked ? 1 : -1
      return { byPost: { ...s.byPost, [postId]: next } }
    }),
  addComment: (postId, user, text) =>
    set((s) => {
      const cur = s.byPost[postId] ?? { liked: false, likeCount: 0, comments: [] }
      const c: Comment = {
        id: `c-${Date.now()}`,
        postId,
        user,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      }
      return {
        byPost: {
          ...s.byPost,
          [postId]: { ...cur, comments: [...cur.comments, c] },
        },
      }
    }),
}))

export function getEngagementSnapshot(postId: string) {
  return useEngagementStore.getState().byPost[postId]
}
