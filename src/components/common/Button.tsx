import { cn } from '../../lib/cn'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { useRef, useState } from 'react'
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
  style,
  ...rest
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) * 0.25
    const y = (e.clientY - top - height / 2) * 0.25
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      className={cn(styles.button, styles[variant], className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
