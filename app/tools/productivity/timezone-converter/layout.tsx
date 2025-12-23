import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Timezone Converter - Convert Time Across Multiple Timezones',
  description:
    'Free online timezone converter with DST awareness. Convert time across multiple timezones, plan international meetings, and coordinate with remote teams. Real-time updates with support for 40+ timezones worldwide.',
  keywords: [
    'timezone converter',
    'time zone converter',
    'world clock',
    'time converter',
    'meeting planner',
    'international time',
    'dst converter',
    'timezone calculator',
    'time difference calculator',
    'world time zones',
    'convert timezone',
    'meeting scheduler',
  ],
  category: 'utilities',
  path: '/tools/timezone-converter',
})

export default function TimezoneConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
