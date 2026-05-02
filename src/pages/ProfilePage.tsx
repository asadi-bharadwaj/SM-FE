import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilePageView } from "../components/profile/ProfilePageView";
import { NotFoundPage } from "./NotFoundPage";

export function ProfilePage() {
  const { username } = useParams();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (username === "me") {
      fetch("http://localhost:8081/users/me", {
        headers: {
          "X-User-Id": userId || "",
        },
      })
        .then((res) => res.json())
        .then((data) => setUser(data));
    }
  }, []);

  if (!username) return <NotFoundPage />;
  if (username === "me" && !user) return <div>Loading...</div>;
  if (username !== "me") return <NotFoundPage />;

  return (
    <ProfilePageView
      user={{
        id: String(user.id),
        username: user.username || "me",
        displayName: user.displayName,
        avatarUrl:
          user.avatarUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
        bio: user.bio || "",
        link: "",
        subscriberCount: 0,
      }}
      posts={[]}
      isMe={true}
    />
  );
}