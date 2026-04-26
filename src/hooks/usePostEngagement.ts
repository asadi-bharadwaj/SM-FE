import { getUserById, CURRENT_USER_ID } from '../mocks/users'
import { useEngagementStore } from '../stores/engagementStore'

export function usePostEngagement(postId: string) {
  const byPost = useEngagementStore((s) => s.byPost[postId])
  const toggleLike = useEngagementStore((s) => s.toggleLike)
  const addComment = useEngagementStore((s) => s.addComment)

  const e = byPost
  return {
    liked: e?.liked ?? false,
    likeCount: e?.likeCount ?? 0,
    comments: e?.comments ?? [],
    toggleLike: () => toggleLike(postId),
    addComment: (text: string) => {
      const me = getUserById(CURRENT_USER_ID)
      if (!me) return
      addComment(postId, me, text)
    },
  }
}
