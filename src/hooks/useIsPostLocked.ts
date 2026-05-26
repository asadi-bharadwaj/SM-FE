import { useMemo } from 'react'
import { CURRENT_USER_ID } from '../mocks/users'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import type { Post } from '../types'

export function useIsPostLocked(
  post: Post,
  viewerId: string = CURRENT_USER_ID,
): boolean {
  return false
}
