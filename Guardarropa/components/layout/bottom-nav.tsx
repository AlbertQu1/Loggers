'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Shirt, ShoppingBag, Sparkles, Clock } from 'lucide-react'

const IZQ = [
  { href: '/closet', label: 'Clóset', icon: Shirt },
  { href: '/outfit', label: 'Outfit', icon: Sparkles },
]
const DER = [
  { href: '/tienda', label: 'Tienda', icon: ShoppingBag },
  { href: '/olvidadas', label: 'Olvidadas', icon: Clock },
]

function Tab({ href, label, icon: Icon, activo }: { href: string; label: string; icon: typeof Shirt; activo: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
        activo ? 'text-foreground' : 'text-muted-foreground'
      }`}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={activo ? 2.2 : 1.6} />
      {label}
      <span className={`h-1 w-1 rounded-full ${activo ? 'bg-accent' : 'bg-transparent'}`} />
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const agregarActivo = pathname.startsWith('/agregar')
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-end px-2">
        {IZQ.map((t) => <Tab key={t.href} {...t} activo={pathname.startsWith(t.href)} />)}
        <div className="flex flex-1 justify-center">
          <Link
            href="/agregar"
            aria-label="Agregar prenda"
            className={`-mt-6 mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95 ${
              agregarActivo ? 'outline outline-2 outline-accent' : ''
            }`}
          >
            <Plus className="h-7 w-7" />
          </Link>
        </div>
        {DER.map((t) => <Tab key={t.href} {...t} activo={pathname.startsWith(t.href)} />)}
      </div>
    </nav>
  )
}
