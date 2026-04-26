import type { PublicProfile } from '../types'

export const CURRENT_USER_ID = 'u-me'

const placeholder = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf`

export const MOCK_USERS: PublicProfile[] = [
  {
    id: CURRENT_USER_ID,
    username: 'me',
    displayName: 'You',
    avatarUrl: placeholder('me'),
    bio: 'Creator · subscribe-first feed',
    link: 'https://example.com',
    subscriberCount: 0,
  },
  {
    id: 'u1',
    username: 'risingstartup',
    displayName: 'Rising Startup',
    avatarUrl: placeholder('rising'),
    bio: 'Building in public. Premium drops weekly.',
    link: 'https://example.com/startup',
    subscriberCount: 12040,
  },
  {
    id: 'u2',
    username: 'designluxe',
    displayName: 'Design Luxe',
    avatarUrl: placeholder('design'),
    bio: 'UI craft & motion. Tier: Pro for tutorials.',
    subscriberCount: 8940,
  },
  {
    id: 'u3',
    username: 'codelab',
    displayName: 'Code Lab',
    avatarUrl: placeholder('code'),
    bio: 'TypeScript, React, and systems.',
    subscriberCount: 22000,
  },
]

export function getUserByUsername(username: string): PublicProfile | undefined {
  return MOCK_USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  )
}

export function getUserById(id: string): PublicProfile | undefined {
  return MOCK_USERS.find((u) => u.id === id)
}

export function searchUsers(q: string): PublicProfile[] {
  const t = q.trim().toLowerCase()
  if (!t) return MOCK_USERS.filter((u) => u.id !== CURRENT_USER_ID)
  return MOCK_USERS.filter(
    (u) =>
      u.id !== CURRENT_USER_ID &&
      (u.username.toLowerCase().includes(t) ||
        u.displayName.toLowerCase().includes(t) ||
        u.bio.toLowerCase().includes(t)),
  )
}
