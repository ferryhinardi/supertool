import './panda.css'
import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { css } from '@/styled-system/css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SuperTool - Modern Developer Toolkit',
  description: 'Beautiful developer tools for JSON formatting, file uploads, and more',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" className={inter.className}>
      <body
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', md: 'row' },
          minH: '100vh',
          bgGradient: 'to-br',
          gradientFrom: 'gray.950',
          gradientVia: 'gray.900',
          gradientTo: 'gray.950',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        })}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main
          className={css({
            position: 'relative',
            zIndex: '1',
            minH: { base: '100vh', md: '100vh' },
            w: { base: '100vw', md: 'calc(100vw - 16rem)' },
            flex: { base: '1', md: '1' },
            overflowX: 'hidden',
            overflowY: 'auto',
            p: { base: '4', sm: '6', md: '8', lg: '10', xl: '12' },
            pt: {
              base: '20', // Space for mobile menu button
              sm: '24',
              md: '8',
              lg: '10',
            },
          })}
        >
          {/* Enhanced background gradient orbs */}
          <div
            className={css({
              pointerEvents: 'none',
              position: 'fixed',
              top: '0',
              right: '0',
              zIndex: '0',
              h: '700px',
              w: '700px',
              animation: 'pulse 4s infinite',
              rounded: 'full',
              bgGradient: 'to-br',
              gradientFrom: 'rgba(168, 85, 247, 0.25)',
              gradientVia: 'rgba(236, 72, 153, 0.20)',
              gradientTo: 'rgba(147, 51, 234, 0.25)',
              filter: 'blur(96px)',
            })}
          />
          <div
            className={css({
              pointerEvents: 'none',
              position: 'fixed',
              bottom: '0',
              left: '0',
              zIndex: '0',
              h: '700px',
              w: '700px',
              animation: 'pulse 5s 1s infinite',
              rounded: 'full',
              bgGradient: 'to-tr',
              gradientFrom: 'rgba(59, 130, 246, 0.25)',
              gradientVia: 'rgba(6, 182, 212, 0.20)',
              gradientTo: 'rgba(20, 184, 166, 0.25)',
              filter: 'blur(96px)',
            })}
          />
          <div
            className={css({
              pointerEvents: 'none',
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: '0',
              h: '500px',
              w: '500px',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 6s 2s infinite',
              rounded: 'full',
              bgGradient: 'to-r',
              gradientFrom: 'rgba(236, 72, 153, 0.15)',
              gradientVia: 'rgba(168, 85, 247, 0.10)',
              gradientTo: 'rgba(59, 130, 246, 0.15)',
              filter: 'blur(96px)',
            })}
          />

          {/* Content wrapper */}
          <div
            className={css({
              position: 'relative',
              zIndex: '10',
              mx: 'auto',
              w: 'full',
              maxW: '1600px',
              minH: 'calc(100vh - 160px)',
            })}
          >
            {children}
          </div>
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

        {/* Google Analytics 4 - only load if ID exists */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
