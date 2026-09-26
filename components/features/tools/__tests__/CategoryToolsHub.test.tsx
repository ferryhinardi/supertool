import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'

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

describe('CategoryToolsHub', () => {
  it('renders productivity hub title and tool links', () => {
    render(<CategoryToolsHub category="productivity" />)

    expect(screen.getByRole('heading', { level: 1, name: /Productivity Tools/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Back to Home/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Case Converter/i })).toBeTruthy()
  })

  it('renders finance hub with solid title and calculator links', () => {
    render(<CategoryToolsHub category="finance" />)

    const heading = screen.getByRole('heading', { level: 1, name: /Finance Tools/i })
    expect(heading).toBeTruthy()
    expect(heading.getAttribute('style') || '').not.toMatch(/background-clip|transparent/i)
    expect(screen.getByRole('link', { name: /Currency Converter/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Tip Calculator/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Loan & Mortgage Calculator/i })).toBeTruthy()
  })

  it('renders security hub with password tools', () => {
    render(<CategoryToolsHub category="security" />)

    expect(screen.getByRole('heading', { level: 1, name: /Security Tools/i })).toBeTruthy()
    const passwordLinks = screen
      .getAllByRole('link')
      .filter((el) => /password/i.test(el.textContent || ''))
    expect(passwordLinks.length).toBeGreaterThanOrEqual(2)
  })
})
