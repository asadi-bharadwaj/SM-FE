import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type User = {
  id: number
  authUserId: number
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
}

export function SearchPage() {
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('http://localhost:8081/users/all')
      .then((res) => res.json())
      .then((data) => setUsers(data))
  }, [])

  const filtered = users.filter((u) =>
    `${u.username} ${u.displayName}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20 }}>Profiles</h2>

      <input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #333',
          background: '#111',
          color: '#fff',
        }}
      />

      {filtered.map((u) => (
        <Link
          key={u.id}
          to={`/u/${u.username}`}
          style={{
            display: 'flex',
            gap: '14px',
            padding: '14px',
            border: '1px solid #222',
            borderRadius: '12px',
            marginBottom: '12px',
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <img
            src={
              u.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
            }
            width="48"
            height="48"
            style={{ borderRadius: '50%' }}
          />

          <div>
            <div style={{ fontWeight: 700 }}>{u.displayName}</div>
            <div style={{ color: '#aaa' }}>@{u.username}</div>
            <div style={{ color: '#777', fontSize: 14 }}>
              {u.bio || 'No bio yet'}
            </div>
          </div>
        </Link>
      ))}

      {filtered.length === 0 && (
        <p style={{ color: '#777' }}>No users found</p>
      )}
    </div>
  )
}