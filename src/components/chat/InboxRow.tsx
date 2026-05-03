import { Link, useParams } from "react-router-dom";
import { timeAgo } from "../../lib/time";
import { getCurrentUserId } from "../../lib/currentUser";
import { Avatar } from "../common/Avatar";
import { cn } from "../../lib/cn";
import type { Thread } from "../../types";
import styles from "./InboxRow.module.css";

type Props = { t: Thread };

export function InboxRow({ t }: Props) {
  const { threadId } = useParams();
  const myId = getCurrentUserId();
  const other =
    t.participants.find((p) => p.id !== myId) ?? t.participants[0]!;
  const isActive = t.id === threadId;

  return (
    <li>
      <Link
        to={t.id}
        className={cn(styles.row, isActive && styles.on)}
        aria-current={isActive ? "true" : undefined}
      >
        <Avatar
          src={other.avatarUrl}
          alt=""
          size="md"
        />
        <div className={styles.body}>
          <div className={styles.top}>
            <span className={styles.name}>{other.username}</span>
            <span className={styles.t}>{timeAgo(t.lastMessage.createdAt)}</span>
          </div>
          <p className={styles.last}>
            {t.lastMessage.body || "No messages yet"}
          </p>
        </div>
        {t.unreadCount > 0 && (
          <span className={styles.dot} aria-label="Unread" />
        )}
      </Link>
    </li>
  );
}
