import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Countdown Timer',
  description:
    'Set a countdown to any date and time. Share the link with others to count down together.',
  path: '/tools/productivity/countdown-timer',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
