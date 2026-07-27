import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToolProcessingModal } from '../ToolProcessingModal'

describe('ToolProcessingModal', () => {
  it('renders nothing when idle without an error', () => {
    const { container } = render(
      <ToolProcessingModal isProcessing={false} progress={0} status="Idle" />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders processing details and allows cancellation', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onClose = vi.fn()
    const { container } = render(
      <ToolProcessingModal
        isProcessing
        progress={42.4}
        status="Compressing file..."
        fileName="video.mp4"
        estimatedTime="2 minutes"
        cancellable
        onCancel={onCancel}
        onClose={onClose}
      />
    )

    expect(screen.getByText('Compressing file...')).toBeInTheDocument()
    expect(screen.getByText('video.mp4')).toBeInTheDocument()
    expect(screen.getByText('Estimated: 2 minutes')).toBeInTheDocument()
    expect(screen.getByText('42% complete')).toBeInTheDocument()
    expect(screen.getByLabelText('Progress: 42%')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)

    const backdrop = container.querySelector('div[aria-hidden="true"]')
    expect(backdrop).toBeTruthy()
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders completion state and closes through actions', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <ToolProcessingModal
        isProcessing
        progress={100}
        status="Done"
        fileName="report.pdf"
        onClose={onClose}
      />
    )

    expect(screen.getByText('Complete!')).toBeInTheDocument()
    expect(screen.getByText('report.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders error state with retry action', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <ToolProcessingModal
        isProcessing={false}
        progress={0}
        status="Failed"
        error="Upload failed"
        onClose={onClose}
      />
    )

    expect(screen.getByText('Processing Failed')).toBeInTheDocument()
    expect(screen.getByText('Upload failed')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
