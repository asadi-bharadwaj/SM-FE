import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const items: { to: string; label: string; hint?: string }[] = [
  { to: '/settings/account', label: 'Account centre', hint: 'Profile, avatar, and login details' },
  { to: '/settings/saved-posts', label: 'Saved posts', hint: 'Posts you have saved' },
  { to: '/settings/time-management', label: 'Time management', hint: 'Screen time and reminders' },
  { to: '/settings/blocked', label: 'Blocked', hint: 'Accounts you have blocked' },
  { to: '/settings/close-friends', label: 'Close friends', hint: 'Share with people you choose' },
]

export function SettingsPage() {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '24px 20px 80px',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          color: '#fff',
          fontSize: '1.85rem',
          fontWeight: 800,
          margin: '0 0 8px',
        }}
      >
        Settings
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '0.95rem' }}>
        Manage your account and preferences
      </p>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: 14,
                textDecoration: 'none',
                color: '#fff',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.background = '#161616'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222'
                e.currentTarget.style.background = '#111'
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontWeight: 650,
                    fontSize: '1rem',
                    marginBottom: item.hint ? 4 : 0,
                  }}
                >
                  {item.label}
                </span>
                {item.hint ? (
                  <span style={{ display: 'block', fontSize: '0.82rem', color: '#666' }}>
                    {item.hint}
                  </span>
                ) : null}
              </span>
              <ChevronRight size={20} color="#555" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
