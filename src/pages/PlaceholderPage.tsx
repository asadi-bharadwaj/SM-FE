import { useLocation } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'

export function PlaceholderPage() {
  const { pathname } = useLocation()
  return (
    <EmptyState
      title={pathname}
      description="This route is a placeholder in the nav shell (Reels, More, etc.)."
    />
  )
}
