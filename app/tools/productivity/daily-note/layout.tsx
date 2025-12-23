import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Daily Note Generator - Timestamped Notes with Templates',
  description:
    'Free daily note generator with customizable templates and markdown support. Create timestamped daily notes, journals, and meeting notes with auto-formatting. Organize thoughts and tasks with date-based navigation.',
  keywords: [
    'daily notes',
    'note generator',
    'daily journal',
    'note taking',
    'markdown notes',
    'timestamped notes',
    'note templates',
    'daily planner',
    'journal app',
    'meeting notes',
    'note organizer',
    'productivity tool',
    'daily log',
    'note keeper',
  ],
  category: 'productivity',
  path: '/tools/daily-note',
})

export default function DailyNoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
