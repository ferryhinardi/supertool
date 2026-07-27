'use client'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type ExtractedItem, ItemPreviewModal } from '../ItemPreviewModal'

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/dialog', () => {
  const Dialog = ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog-root">{children}</div> : null

  const DialogContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div role="dialog" {...props}>
      {children}
    </div>
  )

  const DialogClose = ({ children }: { children: React.ReactElement }) => children
  const passthrough = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription: passthrough,
    DialogFooter: passthrough,
    DialogHeader: passthrough,
    DialogTitle: passthrough,
  }
})

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

const items: ExtractedItem[] = [
  {
    id: 'item-1',
    name: 'Milk',
    price: 2.5,
    quantity: 2,
    confidence: 'low',
    rawText: 'MILK 2.50',
  },
  {
    id: 'item-2',
    name: 'Bread',
    price: 3,
    quantity: 1,
    confidence: 'medium',
  },
]

describe('ItemPreviewModal', () => {
  it('renders item summary, confidence badges, and totals', () => {
    render(<ItemPreviewModal isOpen items={items} onClose={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByText('Review Scanned Items')).toBeInTheDocument()
    expect(
      screen.getByText('2 items detected. Review and edit before importing.')
    ).toBeInTheDocument()
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Bread')).toBeInTheDocument()
    expect(screen.getByText(/\?LOW/)).toBeInTheDocument()
    expect(screen.getByText(/⚠MEDIUM/)).toBeInTheDocument()
    expect(screen.getByText('Raw: MILK 2.50')).toBeInTheDocument()
    expect(screen.getByText('$8.00')).toBeInTheDocument()
  })

  it('allows editing an item and upgrades confidence to high on save', async () => {
    const user = userEvent.setup()

    render(<ItemPreviewModal isOpen items={items} onClose={vi.fn()} onConfirm={vi.fn()} />)

    await user.click(screen.getAllByTitle('Edit item')[0])

    const nameInput = screen.getByPlaceholderText('Item name')
    const priceInput = screen.getByPlaceholderText('Price')
    const quantityInput = screen.getByPlaceholderText('Quantity')

    await user.clear(nameInput)
    await user.type(nameInput, 'Whole Milk')
    await user.clear(priceInput)
    await user.type(priceInput, '4.25')
    await user.clear(quantityInput)
    await user.type(quantityInput, '3')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Whole Milk')).toBeInTheDocument()
    expect(screen.getByText(/✓HIGH/)).toBeInTheDocument()
    expect(screen.getByText('$12.75')).toBeInTheDocument()
    expect(screen.getByText('$15.75')).toBeInTheDocument()
  })

  it('keeps edit mode open when save input is invalid, supports cancel/delete, and disables import when empty', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onConfirm = vi.fn()

    render(<ItemPreviewModal isOpen items={items} onClose={onClose} onConfirm={onConfirm} />)

    await user.click(screen.getAllByTitle('Edit item')[0])

    const nameInput = screen.getByPlaceholderText('Item name')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Cancel' })[0])
    expect(screen.queryByPlaceholderText('Item name')).not.toBeInTheDocument()

    const deleteButtons = screen.getAllByTitle('Delete item')
    await user.click(deleteButtons[0])
    expect(screen.queryByText('Milk')).not.toBeInTheDocument()

    await user.click(screen.getAllByTitle('Delete item')[0])
    expect(screen.queryByText('Bread')).not.toBeInTheDocument()

    const importButton = screen.getByRole('button', { name: 'Import 0 Items' })
    expect(importButton).toBeDisabled()

    await user.click(importButton)
    expect(onConfirm).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('confirms the edited items and closes the dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onConfirm = vi.fn()

    render(<ItemPreviewModal isOpen items={items} onClose={onClose} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Import 2 Items' }))

    expect(onConfirm).toHaveBeenCalledWith(items)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
