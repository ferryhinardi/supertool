import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TemplatesSelector } from '../TemplatesSelector'

describe('TemplatesSelector', () => {
  it('renders without crashing', () => {
    const mockOnSelectTemplate = vi.fn()
    const { container } = render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)
    expect(container).toBeInTheDocument()
  })

  it('renders with template selection handler', () => {
    const mockOnSelectTemplate = vi.fn()
    const { container } = render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)
    expect(container).toBeInTheDocument()
  })
})
