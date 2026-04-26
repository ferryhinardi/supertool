import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplatesSelector } from '../TemplatesSelector'

const mockDeleteBillTemplate = vi.fn()
const mockLoadBillTemplates = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

vi.mock('@/lib/tools/split-bill/split-bill-storage', () => ({
  deleteBillTemplate: (...args: unknown[]) => mockDeleteBillTemplate(...args),
  loadBillTemplates: () => mockLoadBillTemplates(),
}))

describe('TemplatesSelector', () => {
  const mockOnSelectTemplate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders an empty state when no templates exist', async () => {
    const user = userEvent.setup()
    mockLoadBillTemplates.mockReturnValue([])

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    expect(screen.getByRole('button', { name: /Load Template \(0\)/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Load Template \(0\)/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('No templates saved yet')).toBeInTheDocument()
  })

  it('loads a template and closes the modal', async () => {
    const user = userEvent.setup()
    const templates = [
      {
        id: 'template-1',
        name: 'Dinner split',
        description: 'Dinner with tax and tip',
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [{ name: 'Alex' }],
        splitType: 'equal' as const,
        createdAt: '2026-04-25T00:00:00.000Z',
      },
    ]
    mockLoadBillTemplates.mockReturnValue(templates)

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(1\)/i }))
    await user.click(await screen.findByRole('button', { name: 'Load' }))

    expect(mockOnSelectTemplate).toHaveBeenCalledWith(templates[0])
    expect(mockToastSuccess).toHaveBeenCalledWith('Template "Dinner split" loaded!')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('deletes a template after confirmation', async () => {
    const user = userEvent.setup()
    let templates = [
      {
        id: 'template-1',
        name: 'Dinner split',
        description: 'Dinner with tax and tip',
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [{ name: 'Alex' }],
        splitType: 'equal' as const,
        createdAt: '2026-04-25T00:00:00.000Z',
      },
    ]
    mockLoadBillTemplates.mockImplementation(() => templates)
    mockDeleteBillTemplate.mockImplementation(() => {
      templates = []
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(1\)/i }))
    await user.click((await screen.findAllByRole('button'))[2])

    expect(window.confirm).toHaveBeenCalledWith('Delete template "Dinner split"?')
    expect(mockDeleteBillTemplate).toHaveBeenCalledWith('template-1')
    expect(mockToastSuccess).toHaveBeenCalledWith('Template deleted')
    await waitFor(() => {
      expect(screen.getByText('No templates saved yet')).toBeInTheDocument()
    })
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    mockLoadBillTemplates.mockReturnValue([])

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(0\)/i }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(dialog)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows count text, optional descriptions, and singular/plural people labels', async () => {
    const user = userEvent.setup()
    const templates = [
      {
        id: 'template-1',
        name: 'Solo lunch',
        description: 'Lunch for one',
        billAmount: '24',
        tipPercent: '10',
        taxPercent: '0',
        currency: 'USD',
        people: [{ name: 'Alex' }],
        splitType: 'equal' as const,
        createdAt: '2026-04-25T00:00:00.000Z',
      },
      {
        id: 'template-2',
        name: 'Team dinner',
        billAmount: '120',
        tipPercent: '18',
        taxPercent: '8',
        currency: 'USD',
        people: [{ name: 'Alex' }, { name: 'Sam' }],
        splitType: 'percentage' as const,
        createdAt: '2026-04-26T00:00:00.000Z',
      },
    ]
    mockLoadBillTemplates.mockReturnValue(templates)

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    const trigger = screen.getByRole('button', { name: /Load Template \(2\)/i })
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Lunch for one')).toBeInTheDocument()
    expect(screen.getByText('1 person')).toBeInTheDocument()
    expect(screen.getByText('2 people')).toBeInTheDocument()
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
  })

  it('does not delete a template when confirmation is cancelled', async () => {
    const user = userEvent.setup()
    const templates = [
      {
        id: 'template-1',
        name: 'Dinner split',
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [{ name: 'Alex' }],
        splitType: 'equal' as const,
        createdAt: '2026-04-25T00:00:00.000Z',
      },
    ]
    mockLoadBillTemplates.mockReturnValue(templates)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(1\)/i }))
    await user.click((await screen.findAllByRole('button'))[2])

    expect(window.confirm).toHaveBeenCalledWith('Delete template "Dinner split"?')
    expect(mockDeleteBillTemplate).not.toHaveBeenCalled()
    expect(mockToastSuccess).not.toHaveBeenCalledWith('Template deleted')
    expect(screen.getByText('Dinner split')).toBeInTheDocument()
  })

  it('closes when the header close button is clicked', async () => {
    const user = userEvent.setup()
    mockLoadBillTemplates.mockReturnValue([])

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(0\)/i }))
    await user.click((await screen.findAllByRole('button'))[0])

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    mockLoadBillTemplates.mockReturnValue([])

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(0\)/i }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('updates the trigger count after deleting the last template', async () => {
    const user = userEvent.setup()
    let templates = [
      {
        id: 'template-1',
        name: 'Dinner split',
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [{ name: 'Alex' }],
        splitType: 'equal' as const,
        createdAt: '2026-04-25T00:00:00.000Z',
      },
    ]

    mockLoadBillTemplates.mockImplementation(() => templates)
    mockDeleteBillTemplate.mockImplementation(() => {
      templates = []
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<TemplatesSelector onSelectTemplate={mockOnSelectTemplate} />)

    await user.click(screen.getByRole('button', { name: /Load Template \(1\)/i }))
    await user.click((await screen.findAllByRole('button'))[2])

    await user.click((await screen.findAllByRole('button'))[0])

    expect(await screen.findByRole('button', { name: /Load Template \(0\)/i })).toBeInTheDocument()
  })
})
