import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Browser Fingerprint Viewer - See Your Digital Fingerprint',
  description:
    'Free browser fingerprint viewer to discover how unique and trackable your browser is. View canvas fingerprint, WebGL data, device info, and privacy insights. Understand what information websites can collect about you without cookies.',
  keywords: [
    'browser fingerprint',
    'device fingerprinting',
    'canvas fingerprint',
    'webgl fingerprint',
    'browser privacy',
    'tracking protection',
    'digital fingerprint',
    'browser tracking',
    'privacy tool',
    'online privacy',
    'browser uniqueness',
    'fingerprint viewer',
    'privacy awareness',
    'browser identification',
  ],
  category: 'development',
  path: '/tools/browser-fingerprint',
})

export default function BrowserFingerprintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
