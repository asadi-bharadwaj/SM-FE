import { Home, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { getUserById, CURRENT_USER_ID } from '../../mocks/users'
import { Avatar } from '../common/Avatar'
import { Badge } from './Badge'
import type { NavItemDef } from './navItems'
import styles from './NavItem.module.css'

type Props = {
  item: NavItemDef
  messageBadgeCount?: number
}

export function NavItem({ item, messageBadgeCount }: Props) {
  const me = getUserById(CURRENT_USER_ID)

  if (item.icon === 'avatar' && me) {
    return (
      <div className={styles.wrap}>
        <NavLink
          to={item.to}
          end
          className={({ isActive }) => cn(styles.avatarLink, isActive && styles.active)}
          aria-label={item.label}
        >
          <Avatar src={me.avatarUrl} alt="" size="sm" className={styles.navAvatar} />
        </NavLink>
      </div>
    )
  }

  const Icon: LucideIcon = item.icon === 'avatar' ? Home : item.icon

  return (
    <div className={styles.wrap}>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => cn(styles.link, isActive && styles.active)}
        aria-label={item.label}
      >
        <span className={styles.iconBox}>
          <Icon size={28} strokeWidth={1.75} />
        </span>
        {item.badgeKey === 'messages' && messageBadgeCount && messageBadgeCount > 0 ? (
          <Badge count={messageBadgeCount} className={styles.badge} />
        ) : null}
      </NavLink>
    </div>
  )
}
