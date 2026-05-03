import type { PublicProfile } from "../types";
import { getUserById } from "../mocks/users";

/** Logged-in user id from auth (same source as login/register). */
export function getCurrentUserId(): string | null {
  return localStorage.getItem("userId");
}

/** Profile for engagement UI; falls back when the user list has not loaded yet. */
export function getCurrentUserProfile(): PublicProfile | null {
  const id = getCurrentUserId();
  if (!id) return null;
  const fromDirectory = getUserById(id);
  if (fromDirectory) return fromDirectory;
  return {
    id,
    username: "you",
    displayName: "You",
    avatarUrl: "",
    bio: "",
  };
}
