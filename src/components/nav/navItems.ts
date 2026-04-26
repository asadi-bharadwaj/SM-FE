import {
  Clapperboard,
  Heart,
  Home,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import { CURRENT_USER_ID, getUserById } from '../../mocks/users'
import type { LucideIcon } from 'lucide-react'

export type NavItemDef = {
  to: string
  end?: boolean
  label: string
  icon: LucideIcon | 'avatar'
  badgeKey?: 'messages' | 'notifications'
}

const me = getUserById(CURRENT_USER_ID)

export function getIconNavItems(): NavItemDef[] {
  return [
    { to: '/', label: 'Home', end: true, icon: Home },
    { to: '/search', label: 'Search', end: true, icon: Search },
    { to: '/reels', label: 'Reels', icon: Clapperboard },
    { to: '/messages', label: 'Direct', badgeKey: 'messages', icon: MessageCircle },
    { to: '/notifications', label: 'Activity', icon: Heart },
    { to: '/create', label: 'Create', icon: ImagePlus },
    { to: me ? `/u/${me.username}` : '/u/me', label: 'Profile', icon: 'avatar' },
    { to: '/more', label: 'More', icon: MoreHorizontal },
  ]
}
