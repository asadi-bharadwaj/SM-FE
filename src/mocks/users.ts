import type { PublicProfile } from '../types'

export const CURRENT_USER_ID = 'u-me'

export const MOCK_USERS: PublicProfile[] = []

export function getUserByUsername(
  _username: string
): PublicProfile | undefined {
  return undefined
}

export function getUserById(
  _id: string
): PublicProfile | undefined {
  return undefined
}

export function searchUsers(_q: string): PublicProfile[] {
  return []
}