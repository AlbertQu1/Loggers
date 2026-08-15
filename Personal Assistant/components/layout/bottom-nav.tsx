'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircleQuestion, Inbox } from 'lucide-react'
import { usePendientesCount } from '@/hooks/use-pendientes-count'

const NAV_ITEMS = [
  {
    href: '/preguntar',
    label: 'Preguntar',
    icon: MessageCircleQuestion,
  },
  {
    href: '/pendientes',
    label: 'Pendientes',
    icon: Inbox,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const pendientesCount = usePendientesCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          const showBadge = item.href === '/pendientes' && pendientesCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title={item.label}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                    {pendientesCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
