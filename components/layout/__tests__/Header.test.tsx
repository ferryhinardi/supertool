import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Header from '../Header'

describe('Header', () => {
  it('renders header with dashboard title', () => {
    render(<Header />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders feedback dialog component', () => {
    render(<Header />)

    // FeedbackDialog should be rendered (it renders a button internally)
    // Use getAllByRole since there may be multiple feedback buttons
    const feedbackButtons = screen.getAllByRole('button', { name: /feedback/i })
    expect(feedbackButtons.length).toBeGreaterThan(0)
    expect(feedbackButtons[0]).toBeInTheDocument()
  })

  it('has sticky positioning', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header?.className).toContain('pos_sticky')
  })

  it('is accessible with semantic header element', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header).toBeInTheDocument()
  })
})
