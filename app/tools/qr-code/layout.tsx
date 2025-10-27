import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'QR Code Generator',
  description:
    'Free online QR code generator for URLs, text, WiFi, and more. Create custom QR codes with logos, colors, and download in high resolution. Fast, secure, and privacy-focused QR code maker.',
  keywords: [
    'qr code generator',
    'create qr code',
    'qr code maker',
    'generate qr',
    'custom qr code',
    'qr code creator',
    'free qr generator',
    'wifi qr code',
    'url to qr',
    'qr code online',
    'barcode generator',
    'qr scanner',
  ],
  category: 'utilities',
  path: '/tools/qr-code',
})

export default function QRCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
