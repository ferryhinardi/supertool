import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FAQAccordion } from '../faq-accordion'

describe('FAQAccordion', () => {
  const mockFAQs = [
    {
      question: 'What is this tool?',
      answer: 'This is a test tool for testing purposes.',
    },
    {
      question: 'How do I use it?',
      answer: 'Simply click the button to get started.',
    },
    {
      question: 'Is it free?',
      answer: 'Yes, completely free to use.',
    },
  ]

  it('renders FAQ heading', () => {
    render(<FAQAccordion faqs={mockFAQs} />)

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<FAQAccordion faqs={mockFAQs} />)

    expect(screen.getByText('What is this tool?')).toBeInTheDocument()
    expect(screen.getByText('How do I use it?')).toBeInTheDocument()
    expect(screen.getByText('Is it free?')).toBeInTheDocument()
  })

  it('renders all FAQ answers', () => {
    render(<FAQAccordion faqs={mockFAQs} />)

    expect(screen.getByText('This is a test tool for testing purposes.')).toBeInTheDocument()
    expect(screen.getByText('Simply click the button to get started.')).toBeInTheDocument()
    expect(screen.getByText('Yes, completely free to use.')).toBeInTheDocument()
  })

  it('renders empty when no FAQs provided', () => {
    const { container } = render(<FAQAccordion faqs={[]} />)

    // Should still render the heading
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()

    // But no accordion items
    const accordionItems = container.querySelectorAll('[data-scope="accordion"]')
    expect(accordionItems.length).toBeLessThanOrEqual(1) // Only the root
  })

  it('applies custom className', () => {
    const { container } = render(<FAQAccordion faqs={mockFAQs} className="custom-class" />)

    const section = container.querySelector('section')
    expect(section?.className).toContain('custom-class')
  })

  it('has proper ARIA labeling', () => {
    render(<FAQAccordion faqs={mockFAQs} />)

    const section = screen.getByRole('region', { name: /frequently asked questions/i })
    expect(section).toBeInTheDocument()
  })

  it('renders accordion indicators (arrows)', () => {
    const { container } = render(<FAQAccordion faqs={mockFAQs} />)

    // Check for SVG arrows
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
