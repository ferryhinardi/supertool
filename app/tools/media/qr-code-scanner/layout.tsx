import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Code Scanner - Read QR Codes Online Free | SuperTool',
  description:
    'Scan and read QR codes instantly with our free online QR code scanner. Upload images or use your webcam to decode QR codes. No installation required.',
  keywords: [
    'qr code scanner',
    'qr code reader',
    'scan qr code online',
    'read qr code',
    'qr decoder',
    'qr code scanner online',
    'free qr scanner',
    'qr code reader online',
    'decode qr code',
    'qr code webcam scanner',
    'barcode scanner',
    'qr reader tool',
    'online qr scanner',
    'qr code detector',
    'mobile qr scanner',
    'qr code upload',
    'qr code image scanner',
    'webcam qr reader',
  ],
  openGraph: {
    title: 'QR Code Scanner - Read QR Codes Online Free',
    description:
      'Scan and read QR codes instantly. Upload images or use your webcam to decode QR codes. Free online tool, no installation required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Scanner - Read QR Codes Online Free',
    description:
      'Scan and read QR codes instantly. Upload images or use your webcam to decode QR codes.',
  },
}

export default function QRCodeScannerLayout({ children }: { children: React.ReactNode }) {
  return children
}
