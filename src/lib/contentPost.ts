import type { Post, PostVisibility } from '../types'

type ProfileFallback = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
}

export function mapContentServicePost(dto: Record<string, unknown>, fb: ProfileFallback): Post {
  const v = String(dto.visibility ?? 'public').toLowerCase()
  const visibility: PostVisibility =
    v === 'subscribers' ? 'subscribers' : v === 'tier' ? 'tier' : 'public'
  const mt = String(dto.mediaType ?? 'image').toLowerCase()
  const mediaType = mt === 'video' ? 'video' : 'image'
  const authorRaw = dto.author as Record<string, unknown> | undefined
  const author = authorRaw
    ? {
        id: String(authorRaw.id ?? dto.authorId ?? fb.id),
        username: String(authorRaw.username ?? fb.username),
        displayName: String(authorRaw.displayName ?? authorRaw.username ?? fb.displayName),
        avatarUrl: String(authorRaw.avatarUrl ?? fb.avatarUrl),
        bio: String(authorRaw.bio ?? ''),
        link: '',
      }
    : {
        id: String(dto.authorId ?? fb.id),
        username: fb.username,
        displayName: fb.displayName,
        avatarUrl: fb.avatarUrl,
        bio: '',
        link: '',
      }
  const created = dto.createdAt
  return {
    id: String(dto.id),
    authorId: String(dto.authorId),
    author,
    mediaUrl: String(dto.mediaUrl ?? ''),
    mediaType,
    caption: String(dto.caption ?? ''),
    createdAt:
      typeof created === 'string'
        ? created
        : created instanceof Date
          ? created.toISOString()
          : new Date().toISOString(),
    tags: Array.isArray(dto.tags) ? (dto.tags as string[]) : [],
    visibility,
  }
}
