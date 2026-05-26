import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { Avatar } from '../common/Avatar'
import { IconButton } from '../common/IconButton'
import { apiFetch } from '../../lib/api'
import styles from './ShareModal.module.css'

type Props = {
  postId: string
  onClose: () => void
}

export function ShareModal({ postId, onClose }: Props) {
  useLockBodyScroll(true)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sentTo, setSentTo] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const [followRes, allUsersRes] = await Promise.all([
          apiFetch('/users/following'),
          apiFetch('/users/all')
        ]);
        
        if (followRes.ok && allUsersRes.ok) {
          const followData = await followRes.json();
          const allUsers = await allUsersRes.json();
          
          if (Array.isArray(followData) && Array.isArray(allUsers)) {
            const followingIds = new Set(followData.map((f: any) => String(f.creatorId)));
            const followingUsers = allUsers.filter((u: any) => {
              const uId = String(u.authUserId || u.id || u.userId || '');
              return followingIds.has(uId);
            });
            setUsers(followingUsers);
          }
        }
      } catch (err) {
        console.error('Failed to fetch following', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFollowing()
  }, [])

  const filtered = users.filter((u) => 
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSend = async (recipientId: string) => {
    try {
      const url = `${window.location.origin}/p/${postId}`
      const message = {
        recipientId,
        content: `Check out this post: ${url}`,
      }
      const res = await apiFetch('/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })
      if (res.ok) {
        setSentTo(prev => ({ ...prev, [recipientId]: true }))
      }
    } catch (e) {
      console.error('Failed to send', e)
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Share Post"
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && e.stopPropagation()}
        role="document"
      >
        <div className={styles.header}>
          <span className={styles.hTitle}>Share</span>
          <IconButton
            className={styles.close}
            type="button"
            label="Close"
            onClick={onClose}
          >
            <X size={22} />
          </IconButton>
        </div>
        
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>You are not following anyone yet</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No matches found</div>
        ) : (
          <ul className={styles.list}>
            {filtered.map((u) => {
              const uId = String(u.authUserId || u.id || u.userId || '');
              const avatar = u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
              return (
                <li key={uId} className={styles.row}>
                  <div className={styles.who}>
                    <Avatar src={avatar} alt="" size="md" />
                    <div>
                      <div className={styles.name}>{u.username}</div>
                      <div className={styles.dn}>{u.displayName}</div>
                    </div>
                  </div>
                  {sentTo[uId] ? (
                    <button className={styles.sentBtn} disabled>Sent</button>
                  ) : (
                    <button className={styles.sendBtn} onClick={() => handleSend(uId)}>Send</button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
