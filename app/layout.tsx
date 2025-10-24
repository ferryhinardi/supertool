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
        <main className="relative flex-1 overflow-hidden p-6 md:p-8 lg:p-12">
          {/* Enhanced background gradient orbs */}
          <div
            className="pointer-events-none fixed top-0 right-0 h-[700px] w-[700px] animate-pulse rounded-full bg-gradient-to-br from-purple-500/25 via-pink-500/20 to-purple-600/25 blur-3xl"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="pointer-events-none fixed bottom-0 left-0 h-[700px] w-[700px] animate-pulse rounded-full bg-gradient-to-tr from-blue-500/25 via-cyan-500/20 to-teal-500/25 blur-3xl"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <div
            className="pointer-events-none fixed top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-blue-500/15 blur-3xl"
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
              background:
                'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'white',
              fontSize: '14px',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
            },
          }}
        />
      </body>
    </html>
  )
}
