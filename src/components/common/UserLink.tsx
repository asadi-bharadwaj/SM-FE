import { Link } from 'react-router-dom'
import type { PublicProfile } from '../../types'
import { cn } from '../../lib/cn'
import { FounderBadge } from './FounderBadge'
import styles from './UserLink.module.css'

type Props = {
  user: PublicProfile
  className?: string
  children?: React.ReactNode
  bold?: boolean
}

export function UserLink({ user, className, children, bold }: Props) {
  const isTextLink = typeof children === 'string' || children === undefined;
  
  return (
    <Link
      to={`/u/${user.username}`}
      className={cn(styles.link, bold && styles.bold, className)}
    >
      {children ?? user.username}
      {isTextLink && <FounderBadge username={user.username} />}
    </Link>
  )
}
