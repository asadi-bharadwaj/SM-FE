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

    const url =
      username === "me"
        ? "http://localhost:8081/users/me"
        : "http://localhost:8081/users/all";

    const options =
      username === "me"
        ? {
            headers: {
              "X-User-Id": userId || "",
            },
          }
        : {};

    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        if (username === "me") {
          setUser(data);
        } else {
          const found = data.find(
            (u: any) =>
              u.username?.toLowerCase() === username.toLowerCase()
          );
          setUser(found || null);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <NotFoundPage />;

  return (
    <ProfilePageView
      user={{
        id: String(user.id),
        username: user.username || "user",
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