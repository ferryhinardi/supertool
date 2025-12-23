'use client'

import { FeedbackDialog } from '@/components/features/shared/FeedbackDialog'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-900 p-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="flex items-center gap-3">
        <FeedbackDialog />
        <button type="button" className="text-neutral-400 transition-colors hover:text-white">
          Theme Toggle (coming soon)
        </button>
      </div>
    </header>
  )
}
