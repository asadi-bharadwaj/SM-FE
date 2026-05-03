import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "./ProfileHeader";
import { PostGrid } from "./PostGrid";
import type { PublicProfile } from "../../types";
import type { Post } from "../../types";
import styles from "./ProfilePageView.module.css";

type Props = {
  user: PublicProfile;
  posts: Post[];
  isMe: boolean;
};

export function ProfilePageView({
  user,
  posts,
  isMe,
}: Props) {
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [isSubscribed, setIsSubscribed] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  const nav = useNavigate();

  const currentUserId =
    localStorage.getItem("userId");

  const handleSubscribe = async () => {
    if (!currentUserId || isMe) return;

    setLoading(true);

    try {
      const method = isSubscribed
        ? "DELETE"
        : "POST";

      const res = await fetch(
        `http://localhost:8081/users/follow/${user.id}`,
        {
          method,
          headers: {
            "X-User-Id": currentUserId,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      setIsSubscribed(!isSubscribed);
    } catch (e) {
      alert("Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <ProfileHeader
        user={user}
        postCount={posts.length}
        isMe={isMe}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
        onMessage={
          !isMe && isSubscribed
            ? () => nav("/messages")
            : undefined
        }
      />

      <p className={styles.display}>
        {user.displayName}
      </p>

      {user.bio && (
        <p className={styles.bio}>
          {user.bio}
        </p>
      )}

      {user.link && (
        <a
          href={user.link}
          className={styles.link}
          target="_blank"
          rel="noreferrer"
        >
          {user.link.replace(
            /^https?:\/\//,
            ""
          )}
        </a>
      )}

      <p className={styles.priceLine}>
        {loading
          ? "Updating..."
          : "From $4.99/mo · full library for subscribers"}
      </p>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Content tabs"
      >
        <button
          className={
            tab === "posts"
              ? styles.tactive
              : undefined
          }
          onClick={() => setTab("posts")}
          type="button"
        >
          Posts
        </button>

        {isMe && (
          <button
            className={
              tab === "saved"
                ? styles.tactive
                : undefined
            }
            onClick={() => setTab("saved")}
            type="button"
          >
            Saved
          </button>
        )}
      </div>

      {tab === "posts" && (
        <PostGrid posts={posts} />
      )}

      {tab === "saved" &&
        isMe && (
          <p className={styles.savedEmpty}>
            No saved posts yet.
          </p>
        )}
    </div>
  );
}