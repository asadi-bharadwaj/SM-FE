import type { PublicProfile } from './user'

export type PostVisibility = 'public' | 'subscribers' | 'tier'

export type Post = {
  id: string
  authorId: string
  author: PublicProfile
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption: string
  createdAt: string
  tags: string[]
  visibility: PostVisibility
  tierId?: string
  /** If set, overrides computed lock from subscription + visibility */
  isLocked?: boolean
}
