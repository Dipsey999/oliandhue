'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Briefcase, Mail, Users,
  FileText, Image, UserCog, Settings, LogOut, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const iconMap = {
  LayoutDashboard, MessageSquare, Briefcase, Mail, Users,
  FileText, Star, Image, UserCog, Settings,
} as const

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Submissions', href: '/admin/submissions', icon: 'MessageSquare' },
  { label: 'One-time Plans', href: '/admin/inquiries', icon: 'Briefcase' },
  { label: 'Subscribers', href: '/admin/subscribers', icon: 'Mail' },
  { label: 'Clients', href: '/admin/clients', icon: 'Users' },
  { label: 'Blog', href: '/admin/blog', icon: 'FileText' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: 'Star' },
  { label: 'Portfolio', href: '/admin/portfolio', icon: 'Image' },
  { label: 'Team', href: '/admin/team', icon: 'UserCog' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0a0a0a] border-r border-neutral-800 flex flex-col z-40">
      <div className="p-4 border-b border-neutral-800">
        <Link href="/admin/dashboard" className="block">
          <h1 className="text-base font-bold text-white tracking-tight">Oli & Hue</h1>
          <p className="text-[0.65rem] text-neutral-500 uppercase tracking-wider">Admin Panel</p>
        </Link>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-red-400 hover:bg-neutral-800/50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
