import { Link } from 'react-router-dom'

type Props = {
  title: string
  description?: string
}

export function SettingsSectionPlaceholder({ title, description }: Props) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: 'auto',
        padding: 24,
        minHeight: '60vh',
        color: '#e5e5e5',
      }}
    >
      <Link
        to="/settings"
        style={{
          color: '#888',
          textDecoration: 'none',
          fontSize: '0.9rem',
          display: 'inline-block',
          marginBottom: 24,
        }}
      >
        ← Settings
      </Link>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px' }}>{title}</h1>
      <p style={{ color: '#888', lineHeight: 1.6, margin: 0 }}>
        {description ?? 'This section is coming soon.'}
      </p>
    </div>
  )
}
