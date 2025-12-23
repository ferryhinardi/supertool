import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Tally Counter - Simple Click Counter Tool',
  description:
    'Free online tally counter with multiple counters, custom step values, and keyboard shortcuts. Perfect for counting inventory, tracking events, or managing any numeric data. Automatically saves your counts.',
  keywords: [
    'tally counter',
    'click counter',
    'count tracker',
    'counter tool',
    'click counter online',
    'digital counter',
    'event counter',
    'inventory counter',
    'people counter',
    'visitor counter',
    'multiple counters',
    'step counter',
  ],
  category: 'productivity',
  path: '/tools/tally-counter',
})

export default function TallyCounterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
