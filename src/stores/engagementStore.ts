import { create } from 'zustand'
import { INITIAL_ENGAGEMENT } from '../mocks/engagementSeed'
import type { Comment, PublicProfile } from '../types'

type ByPost = typeof INITIAL_ENGAGEMENT

const initialByPost: ByPost = JSON.parse(
  JSON.stringify(INITIAL_ENGAGEMENT),
) as ByPost

async function notify(recipientId: string, type: string, title: string, message: string) {
  try {
    await fetch("http://localhost:8081/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientId,
        type,
        title,
        message,
      }),
    });
  } catch (e) {
    console.error("Failed to send notification", e);
  }
}

type State = {
  byPost: ByPost
  toggleLike: (postId: string, authorId?: string) => void
  addComment: (postId: string, user: PublicProfile, text: string, authorId?: string) => void
}

export const useEngagementStore = create<State>((set) => ({
  byPost: initialByPost,
  toggleLike: (postId, authorId) =>
    set((s) => {
      const cur = s.byPost[postId]
      if (!cur) return s
      const next = { ...s.byPost[postId]! }
      next.liked = !next.liked
      next.likeCount += next.liked ? 1 : -1

      if (next.liked && authorId) {
        notify(authorId, "PUSH", "New Like!", "Someone liked your post.");
      }

      return { byPost: { ...s.byPost, [postId]: next } }
    }),
  addComment: (postId, user, text, authorId) =>
    set((s) => {
      const cur = s.byPost[postId] ?? { liked: false, likeCount: 0, comments: [] }
      const c: Comment = {
        id: `c-${Date.now()}`,
        postId,
        user,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      }

      if (authorId) {
        notify(authorId, "PUSH", "New Comment!", `${user.username} commented on your post.`);
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
