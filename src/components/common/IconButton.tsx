import { cn } from '../../lib/cn'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import styles from './IconButton.module.css'

type Props = {
  label: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function IconButton({ label, children, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(styles.root, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
