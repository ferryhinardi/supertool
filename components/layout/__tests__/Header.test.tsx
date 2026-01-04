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
    const feedbackButton = screen.getByRole('button', { name: /feedback/i })
    expect(feedbackButton).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<Header />)

    expect(screen.getByText(/theme toggle/i)).toBeInTheDocument()
  })

  it('has sticky positioning', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header).toHaveClass('sticky')
  })

  it('is accessible with semantic header element', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header).toBeInTheDocument()
  })
})
