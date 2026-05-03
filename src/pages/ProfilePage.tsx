import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilePageView } from "../components/profile/ProfilePageView";
import { NotFoundPage } from "./NotFoundPage";

export function ProfilePage() {
  const { username } = useParams();
  const currentUserId = localStorage.getItem("userId");

  const [user, setUser] = useState<any>(null);
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
        profileUser = await fetch("http://localhost:8081/users/me", {
          headers: { "X-User-Id": currentUserId || "" },
        }).then((r) => r.json());
      } else {
        const users = await fetch("http://localhost:8081/users/all").then((r) =>
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

      const followers = await fetch(
        "http://localhost:8081/users/followers",
        {
          headers: { "X-User-Id": profileId },
        }
      ).then((r) => r.json());

      setSubscriberCount(Array.isArray(followers) ? followers.length : 0);

      const following = await fetch(
        "http://localhost:8081/users/following",
        {
          headers: { "X-User-Id": profileId },
        }
      ).then((r) => r.json());

      setSubscriptionCount(Array.isArray(following) ? following.length : 0);
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
        link: "",
        subscriberCount,
        subscriptionCount,
      }}
      posts={[]}
      isMe={username === "me"}
    />
  );
}