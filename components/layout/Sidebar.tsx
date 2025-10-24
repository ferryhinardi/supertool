"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Code, Upload, Github } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "JSON Beautifier", href: "/tools/json-beautify", icon: Code },
  { name: "File Upload", href: "/tools/upload", icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 glass border-r border-purple-500/20 flex flex-col p-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-blue-600/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 animate-pulse pointer-events-none" style={{ animationDuration: '3s' }} />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <Link href="/" className="group mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-3xl">⚡</span>
            <span className="gradient-text">SuperTool</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 ml-10">Developer Toolkit</p>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative",
                  "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20",
                  isActive
                    ? "bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-blue-600/30 text-white shadow-lg shadow-purple-500/30 border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 rounded-r-full shadow-lg shadow-purple-500/50 animate-pulse" />
                )}
                
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-purple-400" : "text-gray-500 group-hover:text-purple-400"
                  )} 
                />
                <span className="font-medium">{item.name}</span>
                
                {/* Hover glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-800/50 space-y-3">
          <a
            href="https://github.com/ferryhinardi/supertool"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
          >
            <Github className="w-4 h-4" />
            <span className="group-hover:underline">View on GitHub</span>
          </a>
          
          <p className="text-xs text-gray-500">
            Built with ❤️ by{" "}
            <a 
              href="https://github.com/ferryhinardi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ferry
            </a>
          </p>
        </div>
      </div>
    </aside>
  )
}
