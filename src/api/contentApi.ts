import { CONTENT_BASE } from "../config/apiBase";
import type { Post } from "../types";

/** Maps a single post JSON from content-service into app Post shape. */
export function mapContentPostJson(p: Record<string, unknown>): Post {
  const authorRaw = (p.author ?? {}) as Record<string, unknown>;
  return {
    id: String(p.id ?? ""),
    authorId: String(p.authorId ?? ""),
    mediaUrl: String(p.mediaUrl ?? ""),
    mediaType: p.mediaType === "video" ? "video" : "image",
    caption: String(p.caption ?? ""),
    createdAt:
      typeof p.createdAt === "string"
        ? p.createdAt
        : new Date(p.createdAt as string | number).toISOString(),
    visibility: (p.visibility ?? "public") as Post["visibility"],
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    author: {
      id: String(authorRaw.id ?? p.authorId ?? ""),
      username: String(authorRaw.username ?? ""),
      displayName: String(
        authorRaw.displayName ?? authorRaw.username ?? ""
      ),
      avatarUrl: String(authorRaw.avatarUrl ?? ""),
      bio: String(authorRaw.bio ?? ""),
      link:
        typeof authorRaw.link === "string"
          ? authorRaw.link
          : typeof authorRaw.website === "string"
            ? authorRaw.website
            : undefined,
    },
  };
}

export async function fetchPostById(postId: string): Promise<Post> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}`);
  if (!res.ok) {
    throw new Error(`Post ${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return mapContentPostJson(raw);
}
