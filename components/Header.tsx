import Link from 'next/link'

export default function Header() {
  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: 'var(--pine)' }}
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
          Mirror Project Planner
        </Link>
        <Link href="/my-tasks" className="text-sm text-white/80 hover:text-white">
          My Tasks
        </Link>
        <Link href="/tasks" className="text-sm text-white/80 hover:text-white">
          All Tasks
        </Link>
        <Link href="/people" className="text-sm text-white/80 hover:text-white">
          People
        </Link>
      </div>
      <span className="text-xs text-white/70">Independent Power · Commercial</span>
    </header>
  )
}
