import styles from './SearchPageHeader.module.css'

type Props = { children: React.ReactNode }

export function SearchPageHeader({ children }: Props) {
  return <header className={styles.inner}>{children}</header>
}
