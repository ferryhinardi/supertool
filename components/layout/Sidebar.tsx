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
    <aside className="glass relative flex w-64 flex-col overflow-hidden border-r-2 border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20">
      {/* Enhanced animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/15 via-pink-600/15 to-cyan-600/20" />
      <div
        className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-tr from-blue-500/15 via-purple-500/10 to-pink-500/15"
        style={{ animationDuration: '3s' }}
      />
      <div
        className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-bl from-cyan-500/10 via-transparent to-purple-500/10"
        style={{ animationDuration: '4s', animationDelay: '1s' }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <Link href="/" className="group mb-10">
          <h1 className="flex items-center gap-3 text-2xl font-bold transition-all hover:scale-105">
            <span className="animate-pulse text-4xl">⚡</span>
            <span className="gradient-text-vibrant bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
              SuperTool
            </span>
          </h1>
          <p className="mt-2 ml-12 text-sm font-medium text-purple-300">Developer Toolkit</p>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300',
                  'hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/30',
                  isActive
                    ? 'border-2 border-purple-500/40 bg-gradient-to-r from-purple-600/40 via-pink-600/30 to-blue-600/40 text-white shadow-xl shadow-purple-500/40'
                    : 'border border-transparent text-gray-400 hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-white'
                )}
              >
                {/* Active indicator with gradient */}
                {isActive && (
                  <div className="absolute top-1/2 left-0 h-10 w-1.5 -translate-y-1/2 animate-pulse rounded-r-full bg-gradient-to-b from-purple-400 via-pink-500 to-blue-500 shadow-lg shadow-purple-500/70" />
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive
                      ? 'text-purple-300'
                      : 'text-gray-500 group-hover:scale-110 group-hover:text-purple-400'
                  )}
                />
                <span className="font-semibold">{item.name}</span>

                {/* Enhanced hover glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto space-y-4 border-t-2 border-purple-500/20 pt-6">
          <a
            href="https://github.com/ferryhinardi/supertool"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-all hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-white"
          >
            <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="font-medium group-hover:underline">View on GitHub</span>
          </a>

          <p className="text-xs text-gray-400">
            Built with <span className="animate-pulse text-red-500">❤️</span> by{' '}
            <a
              href="https://github.com/ferryhinardi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold text-transparent transition-all hover:from-purple-300 hover:to-pink-300"
            >
              Ferry
            </a>
          </p>
        </div>
      </div>
    </aside>
  )
}
