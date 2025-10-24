import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SuperTool - Modern Developer Toolkit',
  description: 'Beautiful developer tools for JSON formatting, file uploads, and more',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="relative flex-1 overflow-hidden p-8 md:p-10 lg:p-12">
          {/* Background gradient orbs */}
          <div
            className="pointer-events-none fixed top-0 right-0 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="pointer-events-none fixed bottom-0 left-0 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <div
            className="pointer-events-none fixed top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 blur-3xl"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          />

          {/* Content wrapper */}
          <div className="relative z-10">{children}</div>
        </main>

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </body>
    </html>
  )
}
