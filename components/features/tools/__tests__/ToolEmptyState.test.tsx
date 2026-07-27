import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileText } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { ToolEmptyState } from '../ToolEmptyState'

describe('ToolEmptyState', () => {
  it('renders content, tips, and action button', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <ToolEmptyState
        icon={FileText}
        title="No Files Uploaded"
        description="Upload files to get started"
        tips={['Drag and drop files here', 'Supports PDF and PNG files']}
        actionLabel="Upload Files"
        onAction={onAction}
      />
    )

    expect(screen.getByText('No Files Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Upload files to get started')).toBeInTheDocument()
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    expect(screen.getByText('Supports PDF and PNG files')).toBeInTheDocument()
    expect(screen.getByText('Pro Tip')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /upload files/i }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('uses the single tip as the pro tip copy', () => {
    render(
      <ToolEmptyState
        icon={FileText}
        title="Nothing here yet"
        description="Start by adding an item"
        tips={['Press the add button to begin']}
      />
    )

    expect(screen.getAllByText('Press the add button to begin')).toHaveLength(2)
  })
})
