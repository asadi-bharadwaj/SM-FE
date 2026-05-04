import { useState, useEffect } from "react";
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
  currentUserId?: string;
  onSubscriptionChange?: () => void;
};

export function ProfilePageView({
  user,
  posts,
  isMe,
  currentUserId,
  onSubscriptionChange,
}: Props) {
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [isSubscribed, setIsSubscribed] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const nav = useNavigate();

  const loggedInUserId =
    currentUserId || localStorage.getItem("userId");

  const actualIsMe =
    isMe ||
    String(loggedInUserId) === String(user.id);

  // Load initial subscription status
  useEffect(() => {
    if (!actualIsMe && loggedInUserId && user.id) {
      checkSubscriptionStatus();
    }
  }, [user.id, actualIsMe, loggedInUserId]);

  const checkSubscriptionStatus = async () => {
    try {
      const following = await fetch(
        "http://localhost:8081/users/following",
        {
          headers: {
            "X-User-Id": loggedInUserId || "",
          },
        }
      ).then((r) => r.json());

      if (Array.isArray(following)) {
        const isUserSubscribed = following.some(
          (f: any) => String(f.creatorId) === String(user.id)
        );
        setIsSubscribed(isUserSubscribed);
      }
    } catch (e) {
      console.log("Error checking subscription:", e);
    }
  };

  const handleSubscribe = async () => {
    if (!loggedInUserId || actualIsMe) return;

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
            "X-User-Id": loggedInUserId,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      setIsSubscribed(!isSubscribed);
      setRefreshTrigger(prev => prev + 1);
      onSubscriptionChange?.();
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
        isMe={actualIsMe}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
        onMessage={
          !actualIsMe && isSubscribed
            ? () => nav("/messages")
            : undefined
        }
        refreshTrigger={refreshTrigger}
        currentUserId={currentUserId}
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