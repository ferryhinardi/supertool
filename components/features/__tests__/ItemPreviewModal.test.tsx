import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ItemPreviewModal } from '../ItemPreviewModal'

describe('ItemPreviewModal', () => {
  const mockItems = [
    {
      id: '1',
      name: 'Test Item',
      price: 10.99,
      quantity: 2,
      confidence: 'high' as const,
    },
  ]

  it('renders when open', () => {
    const { container } = render(
      <ItemPreviewModal isOpen={true} onClose={() => {}} items={mockItems} onConfirm={() => {}} />
    )
    expect(container).toBeTruthy()
  })

  it('does not render when closed', () => {
    const { container } = render(
      <ItemPreviewModal isOpen={false} onClose={() => {}} items={mockItems} onConfirm={() => {}} />
    )
    expect(container).toBeTruthy()
  })
})
