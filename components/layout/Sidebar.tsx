'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Code, Upload, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'JSON Beautifier', href: '/tools/json-beautify', icon: Code },
  { name: 'File Upload', href: '/tools/upload', icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="glass relative flex w-64 flex-col overflow-hidden border-r border-purple-500/20 p-6">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-blue-600/20" />
      <div
        className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"
        style={{ animationDuration: '3s' }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <Link href="/" className="group mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold transition-transform hover:scale-105">
            <span className="text-3xl">⚡</span>
            <span className="gradient-text">SuperTool</span>
          </h1>
          <p className="mt-1 ml-10 text-xs text-gray-400">Developer Toolkit</p>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300',
                  'hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20',
                  isActive
                    ? 'border border-purple-500/30 bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-blue-600/30 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:text-white'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 animate-pulse rounded-r-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 shadow-lg shadow-purple-500/50" />
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'
                  )}
                />
                <span className="font-medium">{item.name}</span>

                {/* Hover glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto space-y-3 border-t border-gray-800/50 pt-6">
          <a
            href="https://github.com/ferryhinardi/supertool"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <Github className="h-4 w-4" />
            <span className="group-hover:underline">View on GitHub</span>
          </a>

          <p className="text-xs text-gray-500">
            Built with ❤️ by{' '}
            <a
              href="https://github.com/ferryhinardi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 transition-colors hover:text-purple-300"
            >
              Ferry
            </a>
          </p>
        </div>
      </div>
    </aside>
  )
}
