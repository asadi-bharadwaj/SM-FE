import { cn } from '../../lib/cn'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'ghost' | 'outline'

type Props = {
  children: ReactNode
  variant?: Variant
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  )
}
