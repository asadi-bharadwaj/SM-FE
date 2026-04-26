import type { PublicProfile } from '../types'
import { MOCK_USERS } from './users'

const pool = MOCK_USERS.filter((u) => u.id !== 'u-me')

export function getMockLikersForPost(
  _postId: string,
  count: number,
): PublicProfile[] {
  return pool.slice(0, Math.min(count, pool.length))
}
