import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilePageView } from "../components/profile/ProfilePageView";
import { NotFoundPage } from "./NotFoundPage";
import { apiFetch } from "../lib/api";

export function ProfilePage() {
  const { username } = useParams();
  const currentUserId = localStorage.getItem("userId");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [username]);

  useEffect(() => {
    // Refresh counts whenever subscription changes
    if (user) {
      refreshCounts();
    }
  }, [refreshCounter]);

  const getStableId = (u: any) =>
    String(u?.authUserId ?? u?.id ?? u?.userId ?? "");

  const loadData = async () => {
    try {
      let profileUser: any = null;

      if (username === "me") {
        profileUser = await apiFetch("/users/me").then((r) => r.json());
      } else {
        const users = await apiFetch("/users/all").then((r) =>
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
      const stableId = getStableId(profileUser);

      const followers = await apiFetch(
        `/users/${stableId}/followers`
      ).then((r) => r.json());

      setSubscriberCount(Array.isArray(followers) ? followers.length : 0);

      const following = await apiFetch(
        `/users/${stableId}/following`
      ).then((r) => r.json());

      setSubscriptionCount(Array.isArray(following) ? following.length : 0);

      const userPostsData = await apiFetch(`/posts/user/${stableId}`).then(r => r.json());
      const postsArray = Array.isArray(userPostsData) ? userPostsData : [];
      const mappedPosts = postsArray
        .filter((p: any) => String(p.id) !== '1' && String(p.id) !== '2' && String(p.id) !== '3')
        .map((post: any) => ({
          ...post,
          author: {
            username: profileUser.username,
            avatarUrl: profileUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`,
            displayName: profileUser.displayName || profileUser.username
          }
        }));
      setPosts(mappedPosts);

    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  const refreshCounts = async () => {
    if (!user) return;
    const stableId = getStableId(user);

    try {
      const followers = await apiFetch(
        `/users/${stableId}/followers`
      ).then((r) => r.json());

      setSubscriberCount(Array.isArray(followers) ? followers.length : 0);

      const following = await apiFetch(
        `/users/${stableId}/following`
      ).then((r) => r.json());

      setSubscriptionCount(Array.isArray(following) ? following.length : 0);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubscriptionChange = () => {
    setRefreshCounter(prev => prev + 1);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <NotFoundPage />;

  const stableId = getStableId(user);
  const isCurrentUser =
    username === "me" ||
    String(currentUserId) === String(stableId);

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
        link: "",
        subscriberCount,
        subscriptionCount,
        followingCount: subscriptionCount,
      }}
      posts={posts}
      isMe={isCurrentUser}
      onSubscriptionChange={handleSubscriptionChange}
      currentUserId={currentUserId || undefined}
    />
  );
}
