import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PDFEditor } from '../PDFEditor'

describe('PDFEditor', () => {
  it('renders without crashing', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const mockOnSave = vi.fn()
    const mockOnClose = vi.fn()

    const { container } = render(
      <PDFEditor pdfFile={mockFile} onSave={mockOnSave} onClose={mockOnClose} />
    )
    expect(container).toBeInTheDocument()
  })
})
