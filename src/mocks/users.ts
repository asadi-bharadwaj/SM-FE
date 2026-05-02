import type { PublicProfile } from '../types'

export const CURRENT_USER_ID = 'u-me'

const BASE_URL = 'http://localhost:8083'

let cachedUsers: PublicProfile[] = []

function mapUser(u: any): PublicProfile {
  return {
    id: String(u.authUserId ?? u.id),
    username: u.username || `user${u.id}`,
    displayName: u.displayName || 'User',
    avatarUrl:
      u.avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        u.username || u.displayName || 'user'
      )}`,
    bio: u.bio || '',
    link: '',
    subscriberCount: 0,
  }
}

export async function loadUsers(): Promise<PublicProfile[]> {
  const res = await fetch(`${BASE_URL}/users/all`)
  const data = await res.json()

  cachedUsers = data.map(mapUser)

  return cachedUsers
}

export function getUserByUsername(
  username: string
): PublicProfile | undefined {
  return cachedUsers.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  )
}

export function getUserById(id: string): PublicProfile | undefined {
  return cachedUsers.find((u) => u.id === id)
}

export function searchUsers(q: string): PublicProfile[] {
  const t = q.trim().toLowerCase()

  if (!t) return cachedUsers

  return cachedUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(t) ||
      u.displayName.toLowerCase().includes(t) ||
      u.bio.toLowerCase().includes(t)
  )
}