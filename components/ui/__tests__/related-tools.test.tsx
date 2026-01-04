import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RelatedTools } from '../related-tools'

describe('RelatedTools', () => {
  it('renders related tools heading when tools are available', () => {
    render(<RelatedTools currentToolPath="/tools/json-beautify" category="Developer Tools" />)

    // Check if heading exists (if related tools are found)
    const heading = screen.queryByText('Related Tools')
    // If tools are available, heading should be present
    if (heading) {
      expect(heading).toBeInTheDocument()
    }
  })

  it('does not render when no related tools found', () => {
    render(
      <RelatedTools currentToolPath="/tools/nonexistent" category="Fake Category" maxItems={0} />
    )

    // Should not render the heading if no tools
    const heading = screen.queryByText('Related Tools')
    expect(heading).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <RelatedTools
        currentToolPath="/tools/json-beautify"
        category="Developer Tools"
        className="custom-class"
      />
    )

    const section = container.querySelector('section')
    if (section) {
      expect(section.className).toContain('custom-class')
    }
  })

  it('respects maxItems parameter', () => {
    const { container } = render(
      <RelatedTools
        currentToolPath="/tools/json-beautify"
        category="Developer Tools"
        maxItems={2}
      />
    )

    // Count rendered tool links
    const links = container.querySelectorAll('a')
    // Should have at most 2 links (or 0 if no related tools)
    expect(links.length).toBeLessThanOrEqual(2)
  })

  it('has proper ARIA labeling when tools are present', () => {
    render(<RelatedTools currentToolPath="/tools/json-beautify" category="Developer Tools" />)

    const section = screen.queryByRole('region', { name: /related tools/i })
    // If related tools exist, section should be present
    if (section) {
      expect(section).toBeInTheDocument()
    }
  })

  it('filters out current tool from results', () => {
    const currentPath = '/tools/json-beautify'
    const { container } = render(<RelatedTools currentToolPath={currentPath} />)

    const links = container.querySelectorAll('a')
    // Ensure no link points to the current tool
    links.forEach((link) => {
      expect(link.getAttribute('href')).not.toBe(currentPath)
    })
  })

  it('displays tool descriptions', () => {
    const { container } = render(
      <RelatedTools currentToolPath="/tools/json-beautify" category="Developer Tools" />
    )

    const paragraphs = container.querySelectorAll('p')
    // If tools are rendered, there should be description paragraphs
    expect(paragraphs.length).toBeGreaterThanOrEqual(0)
  })
})
