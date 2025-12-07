import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReceiptScanner } from '../ReceiptScanner'

describe('ReceiptScanner', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReceiptScanner onDataExtracted={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('accepts onDataExtracted prop', () => {
    const handleDataExtracted = () => {}
    const { container } = render(<ReceiptScanner onDataExtracted={handleDataExtracted} />)
    expect(container).toBeInTheDocument()
  })
})
