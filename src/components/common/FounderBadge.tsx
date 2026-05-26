import { Crown } from 'lucide-react';
import styles from './FounderBadge.module.css';

export function FounderBadge({ username }: { username: string }) {
  if (username !== 'TestAccount1') return null;

  return (
    <span className={styles.badge} title="App Founder">
      <Crown size={12} strokeWidth={2.5} className={styles.icon} />
      <span className={styles.label}>FOUNDER</span>
    </span>
  );
}
