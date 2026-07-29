'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Coffee, Wrench, Clock, Package } from 'lucide-react'

const NAV_ITEMS = [
  {
    href: '/new-cup',
    label: 'New Cup',
    icon: Coffee,
  },
  {
    href: '/bags',
    label: 'Bags',
    icon: Package,
  },
  {
    href: '/waste',
    label: 'Care',
    icon: Wrench,
  },
  {
    href: '/history',
    label: 'History',
    icon: Clock,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
