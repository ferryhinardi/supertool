import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Clipboard History Manager - Track and Restore Clipboard Items',
  description:
    'Free online clipboard history manager. Automatically track, save, search, and restore clipboard items with local storage. Pin important items, search history, and manage up to 100 clipboard entries. Privacy-focused with browser-only storage.',
  keywords: [
    'clipboard history',
    'clipboard manager',
    'clipboard tracker',
    'copy paste history',
    'clipboard monitor',
    'clipboard saver',
    'restore clipboard',
    'clipboard search',
    'pin clipboard',
    'clipboard tool',
    'clipboard organizer',
    'multiple clipboard',
    'clipboard utility',
    'save clipboard items',
    'clipboard backup',
    'clipboard recovery',
    'local clipboard storage',
    'privacy clipboard',
  ],
  category: 'productivity',
  path: '/tools/clipboard-history',
})

export default function ClipboardHistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
