import { cn } from '../../lib/cn'
import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

type Props = {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className, style }: Props) {
  return <div className={cn(styles.skeleton, className)} style={style} role="presentation" />
}
