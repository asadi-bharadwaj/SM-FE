import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "./ProfileHeader";
import { PostGrid } from "./PostGrid";
import type { PublicProfile } from "../../types";
import type { Post } from "../../types";
import styles from "./ProfilePageView.module.css";
import { apiFetch } from "../../lib/api";
import { ChevronLeft } from "lucide-react";

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
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadedSaved, setLoadedSaved] = useState(false);

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

  useEffect(() => {
    if (tab === "saved" && isMe && !loadedSaved) {
      loadSavedPosts();
    }
  }, [tab, isMe, loadedSaved]);

  const loadSavedPosts = async () => {
    try {
      const res = await apiFetch("/posts/saved");
      if (res.ok) {
        const data = await res.json();
        const savedArray = Array.isArray(data) ? data : [];
        const mapped = savedArray.map((post: any) => ({
          ...post,
          author: {
            ...post.author,
            avatarUrl: post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`
          }
        }));
        setSavedPosts(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadedSaved(true);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!loggedInUserId || !user.id || actualIsMe) return;
    
    try {
      const response = await apiFetch(
        "/users/following"
      );
      
      if (!response.ok) return;
      
      const following = await response.json();

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

      const res = await apiFetch(
        `/users/follow/${user.id}`,
        {
          method,
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
        <button 
          onClick={() => nav(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Profile</h2>
      </div>

      <ProfileHeader
        user={user}
        postCount={posts.length}
        isMe={actualIsMe}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
        onMessage={
          !actualIsMe
            ? () => {
                const ids = [String(loggedInUserId), String(user.id)].sort();
                const threadId = ids.join("_");
                nav(`/messages/${threadId}?recipientId=${user.id}`);
              }
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
          savedPosts.length > 0 ? (
            <PostGrid posts={savedPosts} />
          ) : (
            <p className={styles.savedEmpty}>
              No saved posts yet.
            </p>
          )
        )}
    </div>
  );
}
