import type { Comment, PublicProfile } from '../types'
import { getUserById, MOCK_USERS } from './users'
import { MOCK_POSTS } from './posts'

function u(id: string): PublicProfile {
  return getUserById(id) ?? MOCK_USERS[0]!
}

export const INITIAL_ENGAGEMENT: Record<
  string,
  { liked: boolean; likeCount: number; comments: Comment[] }
> = {}

for (const p of MOCK_POSTS) {
  INITIAL_ENGAGEMENT[p.id] = {
    liked: false,
    likeCount: Math.floor(500 + Math.random() * 5000),
    comments: [
      {
        id: `${p.id}-c1`,
        postId: p.id,
        user: u('u2'),
        text: 'This is great',
        createdAt: new Date(Date.now() - 100000).toISOString(),
      },
      {
        id: `${p.id}-c2`,
        postId: p.id,
        user: u('u3'),
        text: 'Subscribed for more',
        createdAt: new Date(Date.now() - 50000).toISOString(),
      },
    ],
  }
}
