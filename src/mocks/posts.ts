import { searchMatch } from '../lib/search'
import type { Post } from '../types'
import { CURRENT_USER_ID, getUserById, getUserByUsername } from './users'

const img = (id: string) => `https://picsum.photos/seed/${id}/800/1000`

function makePost(
  p: Omit<Post, 'author' | 'isLocked'>,
): Post {
  const author = getUserById(p.authorId)!
  return { ...p, author }
}

const raw: Omit<Post, 'author' | 'isLocked'>[] = [
  {
    id: 'p1',
    authorId: 'u1',
    mediaUrl: img('p1'),
    mediaType: 'image',
    caption: 'New drop for subscribers — team uniforms shoot.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['brand', 'startup'],
    visibility: 'public',
  },
  {
    id: 'p2',
    authorId: 'u1',
    mediaUrl: img('p2'),
    mediaType: 'image',
    caption: 'Behind the scenes: strategy deck (Pro tier).',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tags: ['strategy', 'pro'],
    visibility: 'subscribers',
  },
  {
    id: 'p3',
    authorId: 'u2',
    mediaUrl: img('p3'),
    mediaType: 'image',
    caption: 'Figma file walkthrough in 4K.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ['figma', 'design'],
    visibility: 'tier',
    tierId: 'pro',
  },
  {
    id: 'p4',
    authorId: 'u2',
    mediaUrl: img('p4'),
    mediaType: 'image',
    caption: 'Free wallpaper pack — link in bio.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    tags: ['free', 'wallpaper'],
    visibility: 'public',
  },
  {
    id: 'p5',
    authorId: 'u3',
    mediaUrl: img('p5'),
    mediaType: 'image',
    caption: 'Ship log #42 — new router + nested layouts.',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    tags: ['react', 'router'],
    visibility: 'subscribers',
  },
]

export const MOCK_POSTS: Post[] = raw.map((r) => makePost(r))

export function getPost(id: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.id === id)
}

export function getPostsByAuthor(username: string): Post[] {
  const u = getUserByUsername(username)
  if (!u) return []
  return MOCK_POSTS.filter((p) => p.authorId === u.id)
}

const defaultFeedSubscribed = new Set(['u1', 'u2'])

export function getFeedPosts(
  _viewerId: string,
  subscribedTo?: Set<string>,
): Post[] {
  const sub = subscribedTo ?? defaultFeedSubscribed
  return MOCK_POSTS.filter(
    (p) =>
      p.authorId === _viewerId || p.visibility === 'public' || sub.has(p.authorId),
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function searchPosts(
  q: string,
  subscribedTo: Set<string>,
): Post[] {
  const t = q.trim()
  if (!t) {
    return getFeedPosts(CURRENT_USER_ID, subscribedTo)
  }
  return MOCK_POSTS.filter(
    (p) =>
      searchMatch(t, p.caption) ||
      p.tags.some((tag) => searchMatch(t, tag)) ||
      searchMatch(t, p.author.username) ||
      searchMatch(t, p.author.displayName),
  )
}
