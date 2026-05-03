import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type RefObject } from "react";
import { fetchPostById } from "../api/contentApi";
import { useIsPostLocked } from "../hooks/useIsPostLocked";
import {
  PostEngagementProvider,
  usePostEngagement,
} from "../context/PostEngagementContext";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { NotFoundPage } from "./NotFoundPage";
import { PostHeader } from "../components/post/PostHeader";
import { PostMedia } from "../components/post/PostMedia";
import { PostActions } from "../components/post/PostActions";
import { PostCaption } from "../components/post/PostCaption";
import { LikeCount } from "../components/post/LikeCount";
import { LikesModal } from "../components/post/LikesModal";
import { CommentList } from "../components/post/CommentList";
import { CommentComposer } from "../components/post/CommentComposer";
import type { Post } from "../types";
import styles from "./PostPage.module.css";

export function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchPostById(postId)
      .then((p) => {
        if (!cancelled) {
          setPost(p);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (loading) {
    return (
      <div className={styles.page} style={{ color: "#8a8a8a", padding: 24 }}>
        Loading post…
      </div>
    );
  }
  if (notFound || !post) {
    return <NotFoundPage />;
  }

  return <PostPageInner post={post} />;
}

function PostPageInner({ post: p }: { post: Post }) {
  const nav = useNavigate();
  const commentInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <button type="button" className={styles.back} onClick={() => nav(-1)}>
          ← Back
        </button>
        <span className={styles.muted}>
          <Link to={`/u/${p.author.username}`}>@{p.author.username}</Link>
        </span>
      </div>
      <PostEngagementProvider postId={p.id}>
        <PostPageArticle
          post={p}
          commentInputRef={commentInputRef}
        />
      </PostEngagementProvider>
    </div>
  );
}

function PostPageArticle({
  post: p,
  commentInputRef,
}: {
  post: Post;
  commentInputRef: RefObject<HTMLInputElement | null>;
}) {
  const locked = useIsPostLocked(p);
  const toggle = useSubscriptionStore((s) => s.toggleSubscribe);
  const { likeCount } = usePostEngagement();
  const [showLikes, setShowLikes] = useState(false);
  return (
    <article className={styles.inner}>
      <PostHeader post={p} />
      <PostMedia post={p} locked={locked} onSubscribe={() => toggle(p.authorId)} />
      <PostActions
        postId={p.id}
        disabled={locked}
        onOpenComments={() => commentInputRef.current?.focus()}
      />
      <LikeCount
        count={likeCount}
        disabled={locked}
        onClick={locked ? undefined : () => setShowLikes(true)}
      />
      {showLikes && !locked && (
        <LikesModal postId={p.id} likeCount={likeCount} onClose={() => setShowLikes(false)} />
      )}
      <PostCaption post={p} locked={locked} showCommentCta={false} />
      <CommentList postId={p.id} locked={locked} />
      <CommentComposer ref={commentInputRef} postId={p.id} disabled={locked} />
    </article>
  );
}
