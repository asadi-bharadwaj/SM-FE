import { useMemo } from 'react'
import { getCurrentUserId } from '../lib/currentUser'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import type { Post } from '../types'

export function useIsPostLocked(
  post: Post,
  viewerId: string = getCurrentUserId() ?? '',
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
