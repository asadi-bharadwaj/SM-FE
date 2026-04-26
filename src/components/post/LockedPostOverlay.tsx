import { Button } from '../common/Button'
import { Lock } from 'lucide-react'
import styles from './LockedPostOverlay.module.css'

type Props = {
  onSubscribe?: () => void
  priceText?: string
}

export function LockedPostOverlay({ onSubscribe, priceText = 'from $4.99/mo' }: Props) {
  return (
    <div className={styles.backdrop} role="presentation">
      <div className={styles.content}>
        <Lock size={28} className={styles.icon} />
        <p className={styles.text}>Subscribers only</p>
        <p className={styles.sub}>{priceText}</p>
        {onSubscribe ? <Button onClick={onSubscribe}>Subscribe to unlock</Button> : null}
      </div>
    </div>
  )
}
