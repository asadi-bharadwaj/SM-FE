import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilePageView } from "../components/profile/ProfilePageView";
import { NotFoundPage } from "./NotFoundPage";

export function ProfilePage() {
  const { username } = useParams();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState<any>(null);
  const [subscriberCount, setSubscriberCount] =
    useState(0);
  const [followingCount, setFollowingCount] =
    useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const loadCounts = async (targetId: any) => {
      try {
        const followersRes = await fetch(
          "http://localhost:8081/users/followers",
          {
            headers: {
              "X-User-Id": String(targetId),
            },
          }
        );

        const followers =
          await followersRes.json();

        setSubscriberCount(
          Array.isArray(followers)
            ? followers.length
            : 0
        );

        if (username === "me") {
          const followingRes = await fetch(
            "http://localhost:8081/users/following",
            {
              headers: {
                "X-User-Id":
                  userId || "",
              },
            }
          );

          const following =
            await followingRes.json();

          setFollowingCount(
            Array.isArray(following)
              ? following.length
              : 0
          );
        }
      } catch {
        setSubscriberCount(0);
        setFollowingCount(0);
      }
    };

    if (username === "me") {
      fetch(
        "http://localhost:8081/users/me",
        {
          headers: {
            "X-User-Id":
              userId || "",
          },
        }
      )
        .then((r) => r.json())
        .then(async (d) => {
          setUser(d);
          await loadCounts(d.id);
        })
        .finally(() =>
          setLoading(false)
        );

      return;
    }

    fetch("http://localhost:8081/users/all")
      .then((r) => r.json())
      .then(async (users) => {
        const found = users.find(
          (u: any) =>
            String(
              u.username || ""
            )
              .toLowerCase()
              .trim() ===
            username
              .toLowerCase()
              .trim()
        );

        setUser(found || null);

        if (found) {
          await loadCounts(found.id);
        }
      })
      .finally(() =>
        setLoading(false)
      );
  }, [username, userId]);

  if (loading)
    return <div>Loading...</div>;

  if (!user) return <NotFoundPage />;

  return (
    <ProfilePageView
      user={{
        id: String(user.id),
        username:
          user.username,
        displayName:
          user.displayName ||
          user.username,
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        bio: user.bio || "",
        link: "",
        subscriberCount:
          subscriberCount,
        followingCount:
          followingCount,
      }}
      posts={[]}
      isMe={username === "me"}
    />
  );
}