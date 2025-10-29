import './panda.css'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'
import { css } from '@/styled-system/css/css.mjs'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SuperTool - Modern Developer Toolkit | 40+ Free Online Tools',
    template: '%s | SuperTool',
  },
  description:
    'Professional toolkit with 40+ free tools for developers and productivity enthusiasts. JSON formatter, image optimizer, video converter, password generator, and more - all free, fast, and privacy-focused. No registration required.',
  keywords: [
    'developer tools',
    'online tools indonesia',
    'free web tools',
    'json formatter',
    'json beautifier',
    'image optimizer',
    'video converter',
    'password generator',
    'url shortener',
    'qr code generator',
    'text transformer',
    'markdown editor',
    'code diff viewer',
    'base64 encoder',
    'hash generator',
    'encryption tool',
    'productivity tools',
    'web tools',
    'online tools',
    'free tools',
    'developer utilities',
    'alat developer',
    'tools gratis',
  ],
  authors: [{ name: 'Ferry Hinardi', url: 'https://github.com/ferryhinardi' }],
  creator: 'Ferry Hinardi',
  publisher: 'SuperTool',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/icon.png', type: 'image/png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    url: baseUrl,
    title: 'SuperTool - Modern Developer Toolkit | 40+ Free Online Tools',
    description:
      'Professional toolkit with 40+ tools for developers and productivity. JSON formatter, image optimizer, video converter, and more - all free and privacy-focused.',
    siteName: 'SuperTool',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SuperTool - Modern Developer Toolkit',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuperTool - Modern Developer Toolkit | 40+ Free Online Tools',
    description:
      'Professional toolkit with 40+ tools for developers and productivity. All free and privacy-focused.',
    creator: '@ferryhinardi',
    images: [`${baseUrl}/og-image.png`],
    site: '@supertool_id',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'id-ID': baseUrl,
      'en-US': baseUrl,
    },
  },
  category: 'technology',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="id" className={inter.className}>
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
          overflow: 'auto',
        })}
      >
        <ReactQueryProvider>
          <NuqsAdapter>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content wrapper - Changed from <main> to <div> to avoid nested <main> tags in tool pages */}
            <div
              className={css({
                position: 'relative',
                zIndex: '1',
                minH: { base: '100vh', md: '100vh' },
                w: { base: '100vw', md: 'calc(100vw - 16rem)' },
                flex: { base: '1', md: '1' },
                overflowX: 'hidden',
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
            </div>

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
          </NuqsAdapter>
        </ReactQueryProvider>

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
