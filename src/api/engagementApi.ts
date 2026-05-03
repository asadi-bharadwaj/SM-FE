import { CONTENT_BASE } from "../config/apiBase";
import { formatApiErrorBody } from "../lib/apiError";
import type { Comment, PublicProfile } from "../types";

function userHeaders(): HeadersInit {
  const id = localStorage.getItem("userId");
  const h: Record<string, string> = {};
  if (id) h["X-User-Id"] = id;
  return h;
}

function mapUser(raw: Record<string, unknown>): PublicProfile {
  return {
    id: String(raw.id ?? ""),
    username: String(raw.username ?? ""),
    displayName: String(raw.displayName ?? raw.username ?? ""),
    avatarUrl: String(raw.avatarUrl ?? ""),
    bio: String(raw.bio ?? ""),
    link:
      typeof raw.link === "string"
        ? raw.link
        : typeof raw.website === "string"
          ? raw.website
          : undefined,
  };
}

export function mapCommentJson(
  postId: string,
  raw: Record<string, unknown>,
): Comment {
  const u = (raw.user ?? {}) as Record<string, unknown>;
  const createdAt =
    typeof raw.createdAt === "string"
      ? raw.createdAt
      : new Date(raw.createdAt as string | number).toISOString();
  return {
    id: String(raw.id ?? ""),
    postId,
    user: mapUser(u),
    text: String(raw.text ?? ""),
    createdAt,
  };
}

export type EngagementPayload = {
  likeCount: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
};

export async function fetchPostEngagement(
  postId: string,
): Promise<EngagementPayload> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}/engagement`, {
    headers: userHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
  const j = (await res.json()) as {
    likeCount: number;
    liked: boolean;
    saved: boolean;
    comments: Record<string, unknown>[];
  };
  return {
    likeCount: j.likeCount ?? 0,
    liked: Boolean(j.liked),
    saved: Boolean(j.saved),
    comments: (j.comments ?? []).map((c) => mapCommentJson(postId, c)),
  };
}

export async function likePost(postId: string): Promise<void> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}/likes`, {
    method: "POST",
    headers: userHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
}

export async function unlikePost(postId: string): Promise<void> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}/likes`, {
    method: "DELETE",
    headers: userHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
}

export async function postComment(
  postId: string,
  text: string,
): Promise<Comment> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(t, res.status));
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return mapCommentJson(postId, raw);
}

export async function savePost(postId: string): Promise<void> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}/saved`, {
    method: "POST",
    headers: userHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
}

export async function unsavePost(postId: string): Promise<void> {
  const res = await fetch(`${CONTENT_BASE}/posts/${postId}/saved`, {
    method: "DELETE",
    headers: userHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
}

export async function fetchPostLikers(postId: string): Promise<PublicProfile[]> {
  const res = await fetch(
    `${CONTENT_BASE}/posts/${postId}/likes?limit=100`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
  const j = (await res.json()) as { users?: Record<string, unknown>[] };
  return (j.users ?? []).map((u) => mapUser(u));
}
