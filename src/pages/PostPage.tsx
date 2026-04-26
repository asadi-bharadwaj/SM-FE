import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPost } from '../mocks'
import { useIsPostLocked } from '../hooks/useIsPostLocked'
import { usePostEngagement } from '../hooks/usePostEngagement'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { NotFoundPage } from './NotFoundPage'
import { PostHeader } from '../components/post/PostHeader'
import { PostMedia } from '../components/post/PostMedia'
import { PostActions } from '../components/post/PostActions'
import { PostCaption } from '../components/post/PostCaption'
import { LikeCount } from '../components/post/LikeCount'
import { LikesModal } from '../components/post/LikesModal'
import { CommentList } from '../components/post/CommentList'
import { CommentComposer } from '../components/post/CommentComposer'
import { useState } from 'react'
import type { Post } from '../types'
import styles from './PostPage.module.css'

export function PostPage() {
  const { postId } = useParams()
  const p = postId ? getPost(postId) : undefined
  if (!p) return <NotFoundPage />
  return <PostPageInner post={p} />
}

function PostPageInner({ post: p }: { post: Post }) {
  const nav = useNavigate()
  const locked = useIsPostLocked(p)
  const toggle = useSubscriptionStore((s) => s.toggleSubscribe)
  const { likeCount } = usePostEngagement(p.id)
  const [showLikes, setShowLikes] = useState(false)
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
      <article className={styles.inner}>
        <PostHeader post={p} />
        <PostMedia post={p} locked={locked} onSubscribe={() => toggle(p.authorId)} />
        <PostActions postId={p.id} disabled={locked} />
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
        <CommentComposer postId={p.id} disabled={locked} />
      </article>
    </div>
  )
}
