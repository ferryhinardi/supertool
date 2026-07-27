import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ToolMobilePicker } from '../ToolMobilePicker'

describe('ToolMobilePicker', () => {
  it('opens the picker and renders its content', async () => {
    const user = userEvent.setup()

    render(
      <ToolMobilePicker label="Choose operation" title="Operations" description="Pick one action">
        <span>Merge PDFs</span>
      </ToolMobilePicker>
    )

    await user.click(screen.getByRole('button', { name: /choose operation/i }))

    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('Pick one action')).toBeInTheDocument()
    expect(screen.getByText('Merge PDFs')).toBeInTheDocument()
  })

  it('closes when the drawer handle or wrapped content is clicked', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <ToolMobilePicker label="Choose operation" title="Operations">
        <span>Merge PDFs</span>
      </ToolMobilePicker>
    )

    await user.click(screen.getByRole('button', { name: /choose operation/i }))
    await user.click(screen.getByRole('button', { name: 'Close drawer' }))

    expect(screen.queryByText('Operations')).not.toBeInTheDocument()

    rerender(
      <ToolMobilePicker label="Choose operation" title="Operations">
        <span>Split PDFs</span>
      </ToolMobilePicker>
    )

    await user.click(screen.getByRole('button', { name: /choose operation/i }))
    await user.click(screen.getByRole('button', { name: /split pdfs/i }))

    expect(screen.queryByText('Operations')).not.toBeInTheDocument()
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ToolMobilePicker label="Choose operation" title="Operations">
        <span>Merge PDFs</span>
      </ToolMobilePicker>
    )

    await user.click(screen.getByRole('button', { name: /choose operation/i }))

    const backdrop = container.querySelector('div[aria-hidden="true"]')
    expect(backdrop).toBeTruthy()
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(screen.queryByText('Operations')).not.toBeInTheDocument()
  })

  it('respects the disabled trigger state', async () => {
    const user = userEvent.setup()

    render(
      <ToolMobilePicker label="Choose operation" title="Operations" disabled>
        <span>Merge PDFs</span>
      </ToolMobilePicker>
    )

    const trigger = screen.getByRole('button', { name: /choose operation/i })
    expect(trigger).toBeDisabled()

    await user.click(trigger)
    expect(screen.queryByText('Operations')).not.toBeInTheDocument()
  })
})
