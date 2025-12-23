import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Stopwatch & Timer Tool',
  description:
    'Free online stopwatch with lap tracking and multiple countdown timers. Create custom timer presets, get desktop notifications, and track intervals. Perfect for workouts, study sessions, and productivity.',
  keywords: [
    'stopwatch',
    'timer',
    'countdown timer',
    'lap timer',
    'interval timer',
    'online stopwatch',
    'online timer',
    'productivity timer',
    'workout timer',
    'study timer',
    'timer presets',
    'multiple timers',
    'desktop notifications',
    'time tracking',
  ],
  category: 'productivity',
  path: '/tools/stopwatch-timer',
})

export default function StopwatchTimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
