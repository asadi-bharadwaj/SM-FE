import { useMemo } from 'react'
import { CURRENT_USER_ID } from '../mocks/users'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import type { Post } from '../types'

export function useIsPostLocked(
  post: Post,
  viewerId: string = CURRENT_USER_ID,
): boolean {
  const isSubscribedToAuthor = useSubscriptionStore((s) =>
    s.isSubscribed(post.authorId),
  )

  return useMemo(() => {
    if (post.authorId === viewerId) return false
    if (post.visibility === 'public') return false
    return !isSubscribedToAuthor
  }, [isSubscribedToAuthor, post.authorId, post.visibility, viewerId])
}
