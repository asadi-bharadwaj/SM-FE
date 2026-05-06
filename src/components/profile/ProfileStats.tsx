import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProfileStats.module.css";

type Props = {
  postCount: number;
  userId?: string;
  profileUserId?: string;
  subscriberCount?: number;
  followingCount?: number;
  refreshTrigger?: number;
};

export function ProfileStats({
  postCount,
  userId,
  profileUserId,
  subscriberCount = 0,
  followingCount = 0,
  refreshTrigger,
}: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [displaySubscriberCount, setDisplaySubscriberCount] = useState(subscriberCount);
  const [displayFollowingCount, setDisplayFollowingCount] = useState(followingCount);

  const [showFollowers, setShowFollowers] =
    useState(false);

  const [showFollowing, setShowFollowing] =
    useState(false);

  const effectiveUserId = profileUserId || userId || undefined;

  useEffect(() => {
    setDisplaySubscriberCount(subscriberCount);
  }, [subscriberCount]);

  useEffect(() => {
    setDisplayFollowingCount(followingCount);
  }, [followingCount]);

  useEffect(() => {
    if (effectiveUserId) loadAll();
  }, [effectiveUserId, refreshTrigger]);

  const loadAll = async () => {
    try {
      const allUsers = await fetch(
        "http://localhost:8081/users/all"
      ).then((r) => r.json());

      setUsers(allUsers);

      const subs = await fetch(
        "http://localhost:8081/users/followers",
        {
          headers: {
            "X-User-Id": effectiveUserId || "",
          },
        }
      ).then((r) => r.json());

      const subsArray = Array.isArray(subs) ? subs : [];
      setFollowers(subsArray);
      setDisplaySubscriberCount(subsArray.length);

      const followingRes = await fetch(
        "http://localhost:8081/users/following",
        {
          headers: {
            "X-User-Id": effectiveUserId || "",
          },
        }
      ).then((r) => r.json());

      const followingArray = Array.isArray(followingRes)
        ? followingRes
        : [];
      setFollowing(followingArray);
      setDisplayFollowingCount(followingArray.length);
    } catch (e) {
      console.log(e);
    }
  };

  const matchUser = (id: any) => {
    const candidate = String(id ?? "");
    if (!candidate) return undefined;
    return users.find((u: any) => 
      String(u.authUserId) === candidate || String(u.id) === candidate
    );
  };

  const makeProfile = (id: any, label: string) => {
    const matched = matchUser(id)
    if (matched) return matched
    return {
      id: `${label}-${id}`,
      username: `${label}-${id}`,
      displayName: `${label} ${id}`,
      fallback: true,
    }
  }

  const followerProfiles = followers
    .map((x) => makeProfile(x.userId, "Follower"))
    .filter(Boolean);

  const followingProfiles = following
    .map((x) => makeProfile(x.creatorId, "Creator"))
    .filter(Boolean);

  return (
    <>
      <ul className={styles.stats}>
        <li>
          <span className={styles.n}>
            {postCount}
          </span>{" "}
          posts
        </li>

        <li
          style={{ cursor: "pointer" }}
          onClick={() =>
            setShowFollowers(true)
          }
        >
          <span className={styles.n}>
            {displaySubscriberCount}
          </span>{" "}
          subscribers
        </li>

        <li
          style={{ cursor: "pointer" }}
          onClick={() =>
            setShowFollowing(true)
          }
        >
          <span className={styles.n}>
            {displayFollowingCount}
          </span>{" "}
          subscriptions
        </li>
      </ul>

      {showFollowers && (
        <Popup
          title="Subscribers"
          users={followerProfiles}
          close={() =>
            setShowFollowers(false)
          }
        />
      )}

      {showFollowing && (
        <Popup
          title="Subscriptions"
          users={followingProfiles}
          close={() =>
            setShowFollowing(false)
          }
        />
      )}
    </>
  );
}

function Popup({
  title,
  users,
  close,
}: any) {
  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          background: "#181818",
          padding: 24,
          width: 420,
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: 12,
          border: "1px solid #333",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{title}</h2>

        {users.length === 0 && (
          <p style={{ color: "#888" }}>No users found.</p>
        )}

        {users.map((u: any) => (
          u.fallback ? (
            <div
              key={u.id}
              style={{
                display: "block",
                padding: "12px 0",
                color: "#888",
                borderBottom:
                  "1px solid #262626",
              }}
            >
              {u.displayName}
            </div>
          ) : (
            <Link
              key={u.id}
              to={`/u/${u.username}`}
              onClick={close}
              style={{
                display: "block",
                padding: "12px 0",
                color: "white",
                textDecoration: "none",
                borderBottom:
                  "1px solid #262626",
              }}
            >
              <div style={{ fontWeight: 600 }}>{u.username}</div>
              <div style={{ fontSize: "0.85rem", color: "#888" }}>{u.displayName}</div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}