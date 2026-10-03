import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DataToolsLayout from '@/app/tools/data/layout'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/tools/data/json-to-csv'),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Data tools layout', () => {
  it('renders one family nav under the workspace header', () => {
    render(
      <DataToolsLayout>
        <main>
          <h1>JSON to CSV Converter</h1>
        </main>
      </DataToolsLayout>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Data processing tools' })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'JSON to CSV Converter' })
    ).toBeInTheDocument()
  })
})
