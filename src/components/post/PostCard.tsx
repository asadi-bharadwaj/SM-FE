import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIsPostLocked } from '../../hooks/useIsPostLocked'
import { usePostEngagement } from '../../hooks/usePostEngagement'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import type { Post } from '../../types'
import { LikeCount } from './LikeCount'
import { LikesModal } from './LikesModal'
import { PostActions } from './PostActions'
import { PostCaption } from './PostCaption'
import { PostHeader } from './PostHeader'
import { PostMedia } from './PostMedia'
import { CommentList } from './CommentList'
import { CommentComposer } from './CommentComposer'
import styles from './PostCard.module.css'

type Props = {
  post: Post
}

export function PostCard({ post }: Props) {
  const locked = useIsPostLocked(post)
  const toggleSub = useSubscriptionStore((s) => s.toggleSubscribe)
  const { likeCount } = usePostEngagement(post.id)
  const [showLikes, setShowLikes] = useState(false)

  return (
    <article className={styles.root}>
      <Link to={`/p/${post.id}`} className={styles.srOnly} tabIndex={-1}>
        View post
      </Link>
      <PostHeader post={post} verified />
      <PostMedia
        post={post}
        locked={locked}
        onSubscribe={() => toggleSub(post.authorId)}
      />
      <PostActions postId={post.id} disabled={locked} />
      <LikeCount
        count={likeCount}
        disabled={locked}
        onClick={locked ? undefined : () => setShowLikes(true)}
      />
      {showLikes && !locked && (
        <LikesModal
          postId={post.id}
          likeCount={likeCount}
          onClose={() => setShowLikes(false)}
        />
      )}
      <PostCaption post={post} locked={locked} showCommentCta />
      <CommentList postId={post.id} max={2} locked={locked} />
      <CommentComposer postId={post.id} disabled={locked} />
    </article>
  )
}
