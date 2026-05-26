import { getIconNavItems } from './navItems'
import { NavItem } from './NavItem'
import styles from './IconRail.module.css'
import logo from '../../assets/antimatter-logo.png'

const MESSAGE_UNREAD = 4

export function IconRail() {
  const items = getIconNavItems()
  return (
    <nav className={styles.rail} aria-label="Main">
      <div className={styles.logo} aria-hidden>
        <img src={logo} alt="AntiMatter" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
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
