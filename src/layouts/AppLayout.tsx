import { Outlet } from 'react-router-dom'
import { IconRail } from '../components/nav/IconRail'
import { RightRail } from './RightRail'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from './AppLayout.module.css'

function MainPad() {
  return <div className={styles.bar} aria-hidden />
}

export function AppLayout() {
  const isNarrow = useMediaQuery('(max-width: 1023px)')
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <div className={styles.app}>
      <IconRail />
      {isMobile && <MainPad />}
      <main
        className={styles.main}
        style={{
          paddingLeft: isMobile ? 0 : 'var(--icon-rail-width)',
          paddingRight: !isNarrow ? 'var(--right-rail-width)' : 0,
        }}
      >
        <div className={styles.content}>
          <Outlet />
        </div>
        {!isNarrow && <RightRail />}
      </main>
    </div>
  )
}
