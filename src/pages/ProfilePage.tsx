import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilePageView } from "../components/profile/ProfilePageView";
import { NotFoundPage } from "./NotFoundPage";

export function ProfilePage() {
  const { username } = useParams();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    if (username === "me") {
      fetch("http://localhost:8081/users/me", {
        headers: {
          "X-User-Id": userId || "",
        },
      })
        .then((r) => r.json())
        .then((d) => setUser(d))
        .finally(() => setLoading(false));

      return;
    }

    fetch("http://localhost:8081/users/all")
      .then((r) => r.json())
      .then((users) => {
        const found = users.find(
          (u: any) =>
            String(u.username || "")
              .toLowerCase()
              .trim() === username.toLowerCase().trim()
        );

        setUser(found || null);
      })
      .finally(() => setLoading(false));
  }, [username, userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <NotFoundPage />;

  return (
    <ProfilePageView
      user={{
        id: String(user.id),
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        bio: user.bio || "",
        link: "",
        subscriberCount: 0,
      }}
      posts={[]}
      isMe={username === "me"}
    />
  );
}