import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      action={
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginTop: 8,
            color: 'var(--color-accent)',
            fontWeight: 600,
          }}
        >
          Go home
        </Link>
      }
    />
  )
}
