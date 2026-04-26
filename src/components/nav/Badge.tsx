import { cn } from '../../lib/cn'
import styles from './Badge.module.css'

type Props = { count: number; className?: string }

export function Badge({ count, className }: Props) {
  const text = count > 99 ? '99+' : String(count)
  return <span className={cn(styles.badge, className)}>{text}</span>
}
