import { getUserById, searchUsers, CURRENT_USER_ID } from '../mocks/users'
import { Avatar } from '../components/common/Avatar'
import { ProfileResultRow } from '../components/search/ProfileResultRow'
import styles from './RightRail.module.css'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export function RightRail() {
  const me = getUserById(CURRENT_USER_ID)
  const suggestions = searchUsers('').filter((u) => u.id !== me?.id).slice(0, 3)

  return (
    <aside className={styles.rail} aria-label="Account and suggestions">
      {me && (
        <div className={styles.userRow}>
          <Link to={`/u/${me.username}`} className={styles.who}>
            <Avatar src={me.avatarUrl} alt="" size="md" className={styles.ava} />
            <div>
              <div className={styles.n}>{me.username}</div>
              <div className={styles.dn}>You</div>
            </div>
          </Link>
          <Button type="button" variant="ghost" className={styles.switch} onClick={() => {}}>
            Switch
          </Button>
        </div>
      )}
      <div className={styles.shead}>
        <span className={styles.slabel}>Suggested for you</span>
        <Link to="/?mode=profiles" className={styles.seeall}>
          See all
        </Link>
      </div>
      <ul className={styles.sul}>
        {suggestions.map((u) => (
          <li key={u.id} className={styles.srow}>
            <ProfileResultRow user={u} />
          </li>
        ))}
      </ul>
      <div className={styles.footer} role="contentinfo">
        <a href="#about">About</a>
        <a href="#help">Help</a>
        <a href="#press">Press</a>
        <a href="#legal">API</a>
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
        <p className={styles.copy}>© 2026 content subscription</p>
      </div>
    </aside>
  )
}
