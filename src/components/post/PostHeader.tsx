import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { IconButton } from '../common/IconButton'
import { UserLink } from '../common/UserLink'
import { Avatar } from '../common/Avatar'
import { timeAgo } from '../../lib/time'
import type { Post } from '../../types'
import { EditPostModal } from './EditPostModal'
import { apiFetch } from '../../lib/api'
import styles from './PostHeader.module.css'

type Props = {
  post: Post
  verified?: boolean
}

export function PostHeader({ post, verified }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loggedInUserId = localStorage.getItem("userId");
  const isMyPost = String(loggedInUserId) === String(post.authorId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await apiFetch(`/posts/${post.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to delete post");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <UserLink user={post.author} className={styles.avatarLink}>
          <Avatar src={post.author.avatarUrl} alt="" size="md" className={styles.ava} />
        </UserLink>
        <div>
          <div className={styles.nameRow}>
            <UserLink user={post.author} bold>
              {post.author.username}
            </UserLink>
            {verified ? <span className={styles.verified} aria-label="Verified">✓</span> : null}
            {post.visibility === 'tier' && post.tierId ? (
              <span className={styles.pill}>Pro</span>
            ) : null}
            <span className={styles.dot} aria-hidden>
              ·
            </span>
            <span className={styles.time}>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className={styles.right} ref={menuRef}>
        <IconButton type="button" label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
          <MoreHorizontal size={22} />
        </IconButton>
        
        {menuOpen && isMyPost && (
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem} onClick={() => { setMenuOpen(false); setEditOpen(true); }}>
              <Edit2 size={16} /> Edit Post
            </button>
            <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => { setMenuOpen(false); handleDelete(); }}>
              <Trash2 size={16} /> Delete Post
            </button>
          </div>
        )}
      </div>

      {editOpen && (
        <EditPostModal 
          isOpen={editOpen} 
          onClose={() => setEditOpen(false)} 
          post={post}
          onPostUpdated={() => window.location.reload()}
        />
      )}
    </div>
  )
}
