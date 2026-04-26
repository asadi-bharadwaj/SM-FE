import { getIconNavItems } from './navItems'
import { NavItem } from './NavItem'
import styles from './IconRail.module.css'

const MESSAGE_UNREAD = 4

export function IconRail() {
  const items = getIconNavItems()
  return (
    <nav className={styles.rail} aria-label="Main">
      <div className={styles.logo} aria-hidden>
        ◇
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.to + item.label} className={styles.li}>
            <NavItem
              item={item}
              messageBadgeCount={item.badgeKey === 'messages' ? MESSAGE_UNREAD : undefined}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
