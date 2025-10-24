'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Upload, Code } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'JSON Beautifier', href: '/tools/json', icon: Code },
  { name: 'File Upload', href: '/tools/upload', icon: Upload },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
      <div className="p-4 text-xl font-semibold text-white tracking-tight">
        ⚡ SuperTool
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors',
              pathname === href && 'bg-neutral-800 text-blue-400'
            )}
          >
            <Icon size={18} />
            <span>{name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 text-xs text-neutral-500 border-t border-neutral-800">
        Built with ❤️ by Ferry
      </div>
    </aside>
  )
}
