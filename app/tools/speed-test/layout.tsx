import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Network Speed Test - Check Internet Speed',
  description:
    'Free online network speed test tool. Measure your internet connection download speed, upload speed, latency, and jitter. Accurate and fast connection testing in real-time.',
  keywords: [
    'speed test',
    'internet speed test',
    'network speed test',
    'bandwidth test',
    'connection speed',
    'download speed',
    'upload speed',
    'latency test',
    'ping test',
    'jitter test',
    'broadband test',
    'wifi speed',
  ],
  category: 'utilities',
  path: '/tools/speed-test',
})

export default function SpeedTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
