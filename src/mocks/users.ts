import type { PublicProfile } from '../types'

export const CURRENT_USER_ID = 'u-me'

export let MOCK_USERS: PublicProfile[] = []

const BASE_URL = 'http://localhost:8081'

function mapUser(u: any): PublicProfile {
  return {
    id: String(u.authUserId ?? u.id),
    username: u.username || `user${u.id}`,
    displayName: u.displayName || 'User',
    avatarUrl: u.avatarUrl || '',
    bio: u.bio || '',
    link: '',
    subscriberCount: 0
  } as PublicProfile
}

export async function loadUsers() {
  try {
    const res = await fetch(`${BASE_URL}/users/all`)
    const data = await res.json()

    MOCK_USERS = Array.isArray(data) ? data.map(mapUser) : []
  } catch (e) {
    console.error('Failed loading users', e)
    MOCK_USERS = []
  }
}

export function getUserByUsername(username: string) {
  return MOCK_USERS.find(
    (u) => u.username?.toLowerCase() === username.toLowerCase()
  )
}

export function getUserById(id: string) {
  return MOCK_USERS.find((u) => String(u.id) === String(id))
}

export function searchUsers(q: string) {
  const s = q.toLowerCase()

  return MOCK_USERS.filter(
    (u) =>
      u.username?.toLowerCase().includes(s) ||
      u.displayName?.toLowerCase().includes(s)
  )
}