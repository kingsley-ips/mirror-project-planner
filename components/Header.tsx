'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/my-tasks', label: 'My Tasks' },
  { href: '/tasks', label: 'All Tasks' },
  { href: '/people', label: 'People' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: 'var(--pine)' }}
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Go to home">
          <Image
            src="/ip-logo-horizontal-reverse.webp"
            alt="Independent Power"
            width={140}
            height={35}
            priority
          />
          <span
            className="text-white font-semibold text-lg border-l border-white/30 pl-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mirror Project Planner
          </span>
        </Link>
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="text-sm hover:text-white"
              style={{
                color: active ? 'var(--spring)' : 'rgba(255,255,255,0.8)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>
      <span className="text-xs text-white/70">Commercial</span>
    </header>
  )
}
