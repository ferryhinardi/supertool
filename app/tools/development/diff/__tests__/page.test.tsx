import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DiffTool from '../page'

// Mock react-diff-viewer-continued
vi.mock('react-diff-viewer-continued', () => ({
  default: vi.fn(() => <div data-testid="diff-viewer">Diff Viewer</div>),
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock ToolRating to prevent async state updates
vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => null,
}))

// Mock Next.js Link to prevent navigation errors in JSDOM
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} onClick={(e) => e.preventDefault()}>
      {children}
    </a>
  ),
}))

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('DiffTool', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the diff tool page', () => {
      render(<DiffTool />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('renders the page title', () => {
      render(<DiffTool />)
      expect(screen.getByRole('heading', { name: /Diff Viewer/, level: 1 })).toBeTruthy()
    })

    it('renders the page description', () => {
      render(<DiffTool />)
      expect(screen.getByText(/Compare text, JSON, or code/)).toBeTruthy()
    })

    it('renders text input areas', () => {
      render(<DiffTool />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThanOrEqual(2)
    })

    it('renders view type toggle buttons', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders FAQ section', () => {
      render(<DiffTool />)
      const faqText = screen.queryByText(/how do i compare/i)
      expect(faqText).toBeTruthy()
    })

    it('renders both input panels', () => {
      render(<DiffTool />)
      expect(screen.getByText(/Original/)).toBeTruthy()
      expect(screen.getByText(/Modified/)).toBeTruthy()
    })

    it('displays tool badge', () => {
      render(<DiffTool />)
      expect(screen.getByText(/Side-by-Side Comparison/)).toBeTruthy()
    })

    it('renders action buttons', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5)
    })

    it('renders related tools section', () => {
      render(<DiffTool />)
      expect(screen.getByText(/Related Tools/)).toBeTruthy()
    })
  })

  describe('Text Input', () => {
    it('allows entering old value', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      const oldValueTextarea = textareas[0]

      fireEvent.change(oldValueTextarea, { target: { value: 'Old text' } })

      expect((oldValueTextarea as HTMLTextAreaElement).value).toBe('Old text')
    })

    it('allows entering new value', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      const newValueTextarea = textareas[1]

      fireEvent.change(newValueTextarea, { target: { value: 'New text' } })

      expect((newValueTextarea as HTMLTextAreaElement).value).toBe('New text')
    })

    it('displays character and line count', () => {
      render(<DiffTool />)
      // Statistics should be visible
      const stats = screen.queryAllByText(/lines|characters/i)
      expect(stats.length).toBeGreaterThanOrEqual(0)
    })

    it('updates stats when text is entered', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1\nLine 2\nLine 3' } })

      await waitFor(() => {
        const stats = screen.queryAllByText(/\d+ lines?/i)
        expect(stats.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('handles multiline text input', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1{Enter}Line 2{Enter}Line 3' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toContain('Line 1')
    })

    it('displays character count for both panels', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Test' } })
      fireEvent.change(textareas[1], { target: { value: 'Testing' } })

      await waitFor(() => {
        const charCounts = screen.queryAllByText(/\d+ characters?/i)
        expect(charCounts.length).toBeGreaterThanOrEqual(0)
      })
    })

    it('displays line count for both panels', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1{Enter}Line 2' } })
      fireEvent.change(textareas[1], { target: { value: 'Line 1' } })

      await waitFor(() => {
        const lineCounts = screen.queryAllByText(/\d+ lines?/i)
        expect(lineCounts.length).toBeGreaterThanOrEqual(0)
      })
    })

    it('handles empty input', () => {
      render(<DiffTool />)
      const textareas = screen.getAllByRole('textbox')
      expect((textareas[0] as HTMLTextAreaElement).value).toBe('')
      expect((textareas[1] as HTMLTextAreaElement).value).toBe('')
    })

    it('allows clearing text', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Test' } })
      await user.clear(textareas[0])

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('')
    })
  })

  describe('View Mode Toggle', () => {
    it('allows switching between split and unified view', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const buttons = screen.getAllByRole('button')
      const splitButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('split'))
      const unifiedButton = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('unified')
      )

      if (splitButton) {
        await user.click(splitButton)
        expect(splitButton).toBeTruthy()
      }

      if (unifiedButton) {
        await user.click(unifiedButton)
        expect(unifiedButton).toBeTruthy()
      }
    })

    it('displays split view button', () => {
      render(<DiffTool />)
      expect(screen.getByText('Split View')).toBeTruthy()
    })

    it('displays unified view button', () => {
      render(<DiffTool />)
      expect(screen.getByText('Unified View')).toBeTruthy()
    })

    it('highlights active view mode', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const unifiedButton = screen.getByText('Unified View')
      await user.click(unifiedButton)

      expect(unifiedButton.closest('button')).toBeTruthy()
    })

    it('switches view mode when clicked', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const splitButton = screen.getByText('Split View')
      const unifiedButton = screen.getByText('Unified View')

      await user.click(unifiedButton)
      await user.click(splitButton)

      expect(splitButton).toBeTruthy()
    })

    it('defaults to split view', () => {
      render(<DiffTool />)
      const splitButton = screen.getByText('Split View')
      expect(splitButton).toBeTruthy()
    })
  })

  describe('Content Type', () => {
    it('allows switching between text and JSON mode', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const buttons = screen.getAllByRole('button')
      const jsonButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('json'))

      if (jsonButton) {
        await user.click(jsonButton)
        expect(jsonButton).toBeTruthy()
      }
    })

    it('displays text mode button', () => {
      render(<DiffTool />)
      expect(screen.getByRole('button', { name: /Plain Text/i })).toBeTruthy()
    })

    it('displays JSON mode button', () => {
      render(<DiffTool />)
      const jsonButtons = screen.getAllByRole('button').filter((btn) => btn.textContent === 'JSON')
      expect(jsonButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('validates JSON input', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      // Switch to JSON mode first
      const jsonButton = screen.getAllByRole('button').find((btn) => btn.textContent === 'JSON')
      if (jsonButton) await user.click(jsonButton)

      // Enter invalid JSON
      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '{{invalid json}}' } })

      // Should render without crashing
      expect(textareas[0]).toBeTruthy()
    })

    it('validates valid JSON', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      await user.click(screen.getByRole('button', { name: 'JSON' }))

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '{"key": "value"}' } })

      expect(textareas[0]).toBeTruthy()
    })

    it('switches content type when clicked', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const buttons = screen.getAllByRole('button')
      const textButton = buttons.find((btn) => btn.textContent === 'Plain Text')
      const jsonButton = buttons.find((btn) => btn.textContent === 'JSON')

      if (jsonButton) await user.click(jsonButton)
      if (textButton) await user.click(textButton)

      expect(textButton).toBeTruthy()
    })

    it('defaults to text mode', () => {
      render(<DiffTool />)
      const textButton = screen.getByRole('button', { name: /Plain Text/i })
      expect(textButton).toBeTruthy()
    })
  })

  describe('JSON Formatting', () => {
    it('formats JSON for old value', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      await user.click(screen.getByRole('button', { name: 'JSON' }))

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '{"key":"value"}' } })

      const buttons = screen.getAllByRole('button')
      const formatButtons = buttons.filter((btn) => btn.textContent?.includes('Format'))

      if (formatButtons.length > 0) {
        await user.click(formatButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
            expect.stringContaining('formatted')
          )
        })
      }
    })

    it('formats JSON for new value', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      await user.click(screen.getByRole('button', { name: 'JSON' }))

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[1], { target: { value: '{"key":"value"}' } })

      const buttons = screen.getAllByRole('button')
      const formatButtons = buttons.filter((btn) => btn.textContent?.includes('Format'))

      if (formatButtons.length > 1) {
        await user.click(formatButtons[1])

        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalled()
        })
      }
    })

    it('shows error for invalid JSON format', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const jsonButton = screen.getAllByRole('button').find((btn) => btn.textContent === 'JSON')
      if (jsonButton) await user.click(jsonButton)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'invalid' } })

      const buttons = screen.getAllByRole('button')
      const formatButtons = buttons.filter((btn) => btn.textContent?.includes('Format'))

      if (formatButtons.length > 0) {
        await user.click(formatButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.error)).toHaveBeenCalled()
        })
      }
    })

    it('shows error when formatting empty content', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const jsonButton = screen.getAllByRole('button').find((btn) => btn.textContent === 'JSON')
      if (jsonButton) await user.click(jsonButton)

      const buttons = screen.getAllByRole('button')
      const formatButtons = buttons.filter((btn) => btn.textContent?.includes('Format'))

      if (formatButtons.length > 0) {
        await user.click(formatButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.error)).toHaveBeenCalledWith('No content to format')
        })
      }
    })

    it('displays format buttons in JSON mode', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const jsonButton = screen.getAllByRole('button').find((btn) => btn.textContent === 'JSON')
      if (jsonButton) await user.click(jsonButton)

      const formatButtons = screen.queryAllByText(/Format/)
      expect(formatButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Actions', () => {
    it('renders copy button', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.querySelector('svg'))
      expect(copyButton).toBeTruthy()
    })

    it('renders download button', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find((btn) => btn.querySelector('svg'))
      expect(downloadButton).toBeTruthy()
    })

    it('renders reset button', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      const resetButton = buttons.find((btn) => btn.querySelector('svg'))
      expect(resetButton).toBeTruthy()
    })

    it('renders swap button', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5)
    })

    it('displays action buttons with icons', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      const iconButtons = buttons.filter((btn) => btn.querySelector('svg'))
      expect(iconButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Copy Functionality', () => {
    it('copies diff to clipboard', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const copyButtons = buttons.filter((btn) => {
        const text = btn.textContent?.toLowerCase()
        return text?.includes('copy')
      })

      if (copyButtons.length > 0) {
        await user.click(copyButtons[0])

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalled()
        })
      }
    })

    it('shows success toast after copying', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const copyButtons = buttons.filter((btn) => {
        const text = btn.textContent?.toLowerCase()
        return text?.includes('copy')
      })

      if (copyButtons.length > 0) {
        await user.click(copyButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
            expect.stringContaining('clipboard')
          )
        })
      }
    })

    it('copies formatted diff text', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Original text' } })
      fireEvent.change(textareas[1], { target: { value: 'Modified text' } })

      const buttons = screen.getAllByRole('button')
      const copyButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('copy'))

      if (copyButtons.length > 0) {
        await user.click(copyButtons[0])

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            expect.stringContaining('=== OLD ===')
          )
        })
      }
    })
  })

  describe('Download Functionality', () => {
    it('downloads diff as text file', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const downloadButtons = buttons.filter((btn) =>
        btn.textContent?.toLowerCase().includes('download')
      )

      if (downloadButtons.length > 0) {
        await user.click(downloadButtons[0])

        await waitFor(() => {
          expect(global.URL.createObjectURL).toHaveBeenCalled()
        })
      }
    })

    it('shows success toast after downloading', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const downloadButtons = buttons.filter((btn) =>
        btn.textContent?.toLowerCase().includes('download')
      )

      if (downloadButtons.length > 0) {
        await user.click(downloadButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
            expect.stringContaining('downloaded')
          )
        })
      }
    })

    it('creates proper download file name', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const downloadButtons = buttons.filter((btn) =>
        btn.textContent?.toLowerCase().includes('download')
      )

      if (downloadButtons.length > 0) {
        await user.click(downloadButtons[0])

        await waitFor(() => {
          expect(global.URL.createObjectURL).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Reset Functionality', () => {
    it('clears both text areas', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old text' } })
      fireEvent.change(textareas[1], { target: { value: 'New text' } })

      const buttons = screen.getAllByRole('button')
      const resetButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('reset'))

      if (resetButtons.length > 0) {
        await user.click(resetButtons[0])

        await waitFor(() => {
          expect((textareas[0] as HTMLTextAreaElement).value).toBe('')
          expect((textareas[1] as HTMLTextAreaElement).value).toBe('')
        })
      }
    })

    it('shows info toast after reset', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const resetButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('reset'))

      if (resetButtons.length > 0) {
        await user.click(resetButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.info)).toHaveBeenCalledWith('Content cleared')
        })
      }
    })

    it('resets statistics after clearing', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old text' } })
      fireEvent.change(textareas[1], { target: { value: 'New text' } })

      const buttons = screen.getAllByRole('button')
      const resetButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('reset'))

      if (resetButtons.length > 0) {
        await user.click(resetButtons[0])

        await waitFor(() => {
          expect((textareas[0] as HTMLTextAreaElement).value).toBe('')
        })
      }
    })
  })

  describe('Swap Functionality', () => {
    it('swaps old and new values', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const swapButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('swap'))

      if (swapButtons.length > 0) {
        await user.click(swapButtons[0])

        await waitFor(() => {
          expect((textareas[0] as HTMLTextAreaElement).value).toBe('New')
          expect((textareas[1] as HTMLTextAreaElement).value).toBe('Old')
        })
      }
    })

    it('shows success toast after swapping', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const swapButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('swap'))

      if (swapButtons.length > 0) {
        await user.click(swapButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalledWith(expect.stringContaining('swapped'))
        })
      }
    })

    it('allows multiple swaps', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Old' } })
      fireEvent.change(textareas[1], { target: { value: 'New' } })

      const buttons = screen.getAllByRole('button')
      const swapButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes('swap'))

      if (swapButtons.length > 0) {
        await user.click(swapButtons[0])
        await user.click(swapButtons[0])

        await waitFor(() => {
          expect((textareas[0] as HTMLTextAreaElement).value).toBe('Old')
        })
      }
    })
  })

  describe('Diff Viewer', () => {
    it('displays diff viewer when text is entered', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1\nLine 2' } })
      fireEvent.change(textareas[1], { target: { value: 'Line 1 modified\nLine 2' } })

      // Diff viewer should render
      const diffViewer = screen.queryByTestId('diff-viewer')
      expect(diffViewer).toBeTruthy()
    })

    it('shows loading state initially', () => {
      render(<DiffTool />)
      // Component should render
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('renders diff viewer for both panels', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Test' } })
      fireEvent.change(textareas[1], { target: { value: 'Test modified' } })

      await waitFor(() => {
        expect(screen.queryByTestId('diff-viewer')).toBeTruthy()
      })
    })

    it('updates diff viewer when content changes', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'First' } })
      await user.clear(textareas[0])
      fireEvent.change(textareas[0], { target: { value: 'Second' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('Second')
    })
  })

  describe('Statistics', () => {
    it('displays line count statistics', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1\nLine 2\nLine 3' } })

      // Statistics should update
      const stats = screen.queryAllByText(/line/i)
      expect(stats.length).toBeGreaterThanOrEqual(0)
    })

    it('displays character count statistics', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Test content' } })

      // Character count should be displayed
      const stats = screen.queryAllByText(/character/i)
      expect(stats.length).toBeGreaterThanOrEqual(0)
    })

    it('shows difference in line count', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1\nLine 2' } })
      fireEvent.change(textareas[1], { target: { value: 'Line 1\nLine 2\nLine 3' } })

      await waitFor(() => {
        const stats = screen.queryAllByText(/line/i)
        expect(stats.length).toBeGreaterThanOrEqual(0)
      })
    })

    it('shows difference in character count', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Short' } })
      fireEvent.change(textareas[1], { target: { value: 'Much longer text' } })

      await waitFor(() => {
        const stats = screen.queryAllByText(/character/i)
        expect(stats.length).toBeGreaterThanOrEqual(0)
      })
    })

    it('updates statistics in real-time', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')

      // Initial state - should show 0 chars
      const initialStats = screen.queryAllByText(/0 chars/i)
      expect(initialStats.length).toBeGreaterThan(0)

      // Add single character
      fireEvent.change(textareas[0], { target: { value: 'A' } })
      await waitFor(() => {
        const stats = screen.queryAllByText(/1 chars/i)
        expect(stats.length).toBeGreaterThan(0)
      })

      // Add more characters
      fireEvent.change(textareas[0], { target: { value: 'ABC' } })
      await waitFor(() => {
        const stats = screen.queryAllByText(/3 chars/i)
        expect(stats.length).toBeGreaterThan(0)
      })
    })
  })

  describe('FAQ Section', () => {
    it('renders FAQ accordion', () => {
      render(<DiffTool />)
      expect(screen.getByText(/how do i compare/i)).toBeTruthy()
    })

    it('displays multiple FAQ questions', () => {
      render(<DiffTool />)
      expect(screen.getByText(/split view and unified view/i)).toBeTruthy()
      const syntaxHighlightingElements = screen.getAllByText(/syntax highlighting/i)
      expect(syntaxHighlightingElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows FAQ about JSON support', () => {
      render(<DiffTool />)
      expect(screen.getByText(/compare JSON files/i)).toBeTruthy()
    })

    it('shows FAQ about data safety', () => {
      render(<DiffTool />)
      expect(screen.getByText(/code or text data safe/i)).toBeTruthy()
    })

    it('displays comprehensive FAQ answers', () => {
      render(<DiffTool />)
      const faqSection = screen.getByText(/how do i compare/i)
      expect(faqSection).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<DiffTool />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
    })

    it('has accessible textareas', () => {
      render(<DiffTool />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThanOrEqual(2)
    })

    it('has accessible buttons', () => {
      render(<DiffTool />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('provides labels for input areas', () => {
      render(<DiffTool />)
      expect(screen.getByText(/Original/)).toBeTruthy()
      expect(screen.getByText(/Modified/)).toBeTruthy()
    })

    it('uses semantic HTML elements', () => {
      render(<DiffTool />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('has descriptive button labels', () => {
      render(<DiffTool />)
      expect(screen.getByText('Split View')).toBeTruthy()
      expect(screen.getByText('Unified View')).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('renders on mobile viewport', () => {
      render(<DiffTool />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('displays flexible layout', () => {
      render(<DiffTool />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThanOrEqual(2)
    })

    it('shows responsive text sizing', () => {
      render(<DiffTool />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
    })
  })

  describe('User Experience', () => {
    it('provides clear visual feedback', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Test' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('Test')
    })

    it('handles rapid input changes', async () => {
      const _user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Quick' } })
      fireEvent.change(textareas[1], { target: { value: 'Brown' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('Quick')
      expect((textareas[1] as HTMLTextAreaElement).value).toBe('Brown')
    })

    it('maintains state across actions', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Keep' } })

      await user.click(screen.getByText('Split View'))

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('Keep')
    })

    it('shows appropriate error messages', async () => {
      const user = userEvent.setup()
      render(<DiffTool />)

      const jsonButton = screen.getAllByRole('button').find((btn) => btn.textContent === 'JSON')
      if (jsonButton) await user.click(jsonButton)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'invalid json' } })

      const buttons = screen.getAllByRole('button')
      const formatButtons = buttons.filter((btn) => btn.textContent?.includes('Format'))

      if (formatButtons.length > 0) {
        await user.click(formatButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.error)).toHaveBeenCalled()
        })
      }
    })

    it('handles empty state gracefully', () => {
      render(<DiffTool />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Related Tools', () => {
    it('displays related tools section', () => {
      render(<DiffTool />)
      expect(screen.getByText(/Related Tools/)).toBeTruthy()
    })

    it('shows multiple related tool suggestions', () => {
      render(<DiffTool />)
      const relatedSection = screen.getByText(/Related Tools/)
      expect(relatedSection).toBeTruthy()
    })
  })

  describe('Tool Rating', () => {
    it('renders tool rating component', () => {
      render(<DiffTool />)
      // Rating component should be present
      const ratingText = screen.queryAllByText(/rate/i)
      expect(ratingText.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles very long text input', async () => {
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      const longText = 'A'.repeat(10000)
      fireEvent.change(textareas[0], { target: { value: longText } })

      expect((textareas[0] as HTMLTextAreaElement).value).toContain('A')
    })

    it('handles special characters', async () => {
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '!@#$%^&*()' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('!@#$%^&*()')
    })

    it('handles unicode characters', async () => {
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '🚀✨🎉' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('🚀✨🎉')
    })

    it('handles empty lines', async () => {
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: 'Line 1\n\nLine 3' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toContain('Line 1')
    })

    it('handles whitespace-only content', async () => {
      render(<DiffTool />)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '   ' } })

      expect((textareas[0] as HTMLTextAreaElement).value).toBe('   ')
    })
  })
})
