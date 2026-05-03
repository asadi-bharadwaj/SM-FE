import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProfileStats.module.css";

type Props = {
  postCount: number;
  userId?: string;
};

export function ProfileStats({
  postCount,
  userId,
}: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  const [showFollowers, setShowFollowers] =
    useState(false);

  const [showFollowing, setShowFollowing] =
    useState(false);

  useEffect(() => {
    if (userId) loadAll();
  }, [userId]);

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
            "X-User-Id": userId || "",
          },
        }
      ).then((r) => r.json());

      setFollowers(Array.isArray(subs) ? subs : []);

      const followingRes = await fetch(
        "http://localhost:8081/users/following",
        {
          headers: {
            "X-User-Id": userId || "",
          },
        }
      ).then((r) => r.json());

      setFollowing(
        Array.isArray(followingRes)
          ? followingRes
          : []
      );
    } catch (e) {
      console.log(e);
    }
  };

  const matchUser = (id: any) =>
    users.find(
      (u: any) =>
        String(u.id) === String(id) ||
        String(u.userId) === String(id)
    );

  const followerProfiles = followers
    .map((x) => matchUser(x.userId))
    .filter(Boolean);

  const followingProfiles = following
    .map((x) => matchUser(x.creatorId))
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
            {followerProfiles.length}
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
            {followingProfiles.length}
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
        background: "rgba(0,0,0,.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          background: "#111",
          padding: 24,
          width: 420,
          borderRadius: 20,
        }}
      >
        <h2>{title}</h2>

        {users.length === 0 && (
          <p>No users found.</p>
        )}

        {users.map((u: any) => (
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
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            @{u.username}
          </Link>
        ))}
      </div>
    </div>
  );
}