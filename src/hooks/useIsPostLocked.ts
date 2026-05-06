import { useMemo } from 'react'
import { CURRENT_USER_ID } from '../mocks/users'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import type { Post } from '../types'

function resolveViewerId(explicit?: string): string {
  if (explicit) return explicit
  try {
    return localStorage.getItem('userId') || CURRENT_USER_ID
  } catch {
    return CURRENT_USER_ID
  }
}

export function useIsPostLocked(post: Post, viewerId?: string): boolean {
  const me = resolveViewerId(viewerId)
  const isSubscribedToAuthor = useSubscriptionStore((s) =>
    s.isSubscribed(post.authorId),
  )

  return useMemo(() => {
    if (post.authorId === me) return false
    if (post.visibility === 'public') return false
    return !isSubscribedToAuthor
  }, [isSubscribedToAuthor, post.authorId, post.visibility, me])
}
