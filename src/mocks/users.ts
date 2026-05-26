import type { PublicProfile } from '../types'
import { apiFetch } from '../lib/api'

export const CURRENT_USER_ID = 'u-me'

export let MOCK_USERS: PublicProfile[] = []

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
    const res = await apiFetch(`/users/all`)
    if (!res.ok) {
      console.warn('Users load returned non-OK status:', res.status);
      MOCK_USERS = []
      return;
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json()
      MOCK_USERS = Array.isArray(data) ? data.map(mapUser) : []
    } else {
      console.warn('Users load returned non-JSON content');
      MOCK_USERS = []
    }
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
