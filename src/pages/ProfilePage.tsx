import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilePageView } from "../components/profile/ProfilePageView";
import {
  CONTENT_BASE,
  PROFILE_BASE,
  SOCIAL_BASE,
} from "../config/apiBase";
import type { Post } from "../types";
import { NotFoundPage } from "./NotFoundPage";

export function ProfilePage() {
  const { username } = useParams();
  const currentUserId = localStorage.getItem("userId");

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [username]);

  const getStableId = (u: any) =>
    String(u?.id ?? u?.userId ?? "");

  const loadData = async () => {
    try {
      let profileUser: any = null;

      if (username === "me") {
        if (!currentUserId) {
          setLoading(false);
          return;
        }
        let meRes = await fetch(`${PROFILE_BASE}/users/me`, {
          headers: { "X-User-Id": currentUserId },
        });
        if (meRes.status === 404) {
          const bootstrapName = localStorage.getItem("profileUsername") ?? "";
          if (bootstrapName) {
            const putRes = await fetch(`${PROFILE_BASE}/users/me`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-User-Id": currentUserId,
              },
              body: JSON.stringify({
                username: bootstrapName,
                displayName: bootstrapName,
              }),
            });
            if (putRes.ok) {
              meRes = await fetch(`${PROFILE_BASE}/users/me`, {
                headers: { "X-User-Id": currentUserId },
              });
            }
          }
        }
        if (!meRes.ok) {
          setLoading(false);
          return;
        }
        profileUser = await meRes.json();
      } else {
        const users = await fetch(`${PROFILE_BASE}/users/all`).then((r) =>
          r.json()
        );

        profileUser = users.find(
          (u: any) =>
            String(u.username || "").toLowerCase() ===
            String(username || "").toLowerCase()
        );
      }

      if (!profileUser) {
        setLoading(false);
        return;
      }

      setUser(profileUser);

      const profileId = getStableId(profileUser);

      const followers = await fetch(`${SOCIAL_BASE}/users/followers`, {
        headers: { "X-User-Id": profileId },
      }).then((r) => r.json());

      setSubscriberCount(Array.isArray(followers) ? followers.length : 0);

      const following = await fetch(`${SOCIAL_BASE}/users/following`, {
        headers: { "X-User-Id": profileId },
      }).then((r) => r.json());

      setSubscriptionCount(Array.isArray(following) ? following.length : 0);

      const rawPosts = await fetch(
        `${CONTENT_BASE}/users/${profileId}/posts`
      ).then((r) => r.json());

      if (Array.isArray(rawPosts)) {
        setPosts(
          rawPosts.map((p: any) => ({
            id: String(p.id),
            authorId: String(p.authorId),
            mediaUrl: p.mediaUrl,
            mediaType: p.mediaType === "video" ? "video" : "image",
            caption: p.caption ?? "",
            createdAt:
              typeof p.createdAt === "string"
                ? p.createdAt
                : new Date(p.createdAt).toISOString(),
            visibility: (p.visibility ?? "public") as "public" | "subscribers" | "tier",
            tags: Array.isArray(p.tags) ? p.tags : [],
            author: {
              id: String(p.author?.id ?? p.authorId),
              username: p.author?.username ?? "",
              displayName: p.author?.displayName ?? "",
              avatarUrl: p.author?.avatarUrl ?? "",
              bio: p.author?.bio ?? "",
            },
          }))
        );
      } else {
        setPosts([]);
      }
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <NotFoundPage />;

  const stableId = getStableId(user);

  return (
    <ProfilePageView
      user={{
        id: stableId,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        bio: user.bio || "",
        link: user.link ?? user.website ?? "",
        subscriberCount,
        followingCount: subscriptionCount,
      }}
      posts={posts}
      isMe={username === "me"}
    />
  );
}
