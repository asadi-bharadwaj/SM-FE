export type PublicProfile = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  link?: string
  subscriberCount?: number
  followingCount?: number
}

export type User = PublicProfile & {
  email?: string
}
