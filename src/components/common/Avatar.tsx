import { cn } from '../../lib/cn'
import styles from './Avatar.module.css'

type Props = {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = { sm: 24, md: 32, lg: 44, xl: 96 } as const

export function Avatar({ src, alt, size = 'md', className }: Props) {
  const px = sizeMap[size]
  return (
    <img
      className={cn(styles.root, className)}
      src={src}
      alt={alt}
      width={px}
      height={px}
      style={{ width: px, height: px }}
    />
  )
}
