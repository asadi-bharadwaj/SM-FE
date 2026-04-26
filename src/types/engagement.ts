import type { PublicProfile } from './user'

export type Comment = {
  id: string
  postId: string
  user: PublicProfile
  text: string
  createdAt: string
  likeCount?: number
}

export type PostEngagement = {
  liked: boolean
  likeCount: number
  comments: Comment[]
}
