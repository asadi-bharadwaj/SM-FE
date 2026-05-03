import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import type { Post } from "../../types";
import styles from "./PostGridItem.module.css";

type Props = { post: Post; locked: boolean };

export function PostGridItem({ post, locked }: Props) {
  const isVideo = post.mediaType === "video";

  return (
    <Link
      to={`/p/${post.id}`}
      className={styles.cell}
      style={
        isVideo
          ? undefined
          : { backgroundImage: `url(${post.mediaUrl})` }
      }
    >
      {isVideo ? (
        <video
          className={styles.thumbVideo}
          src={post.mediaUrl}
          muted
          playsInline
          preload="metadata"
          aria-hidden
        />
      ) : null}
      {locked && (
        <span className={styles.shade}>
          <Lock size={22} aria-hidden />
        </span>
      )}
    </Link>
  );
}
