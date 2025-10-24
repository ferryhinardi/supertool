'use client'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <button className="text-neutral-400 hover:text-white transition-colors">
        Theme Toggle (coming soon)
      </button>
    </header>
  )
}
