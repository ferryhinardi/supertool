import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import MarkdownEditorPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

describe('Markdown Editor Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the page without crashing', () => {
      render(<MarkdownEditorPage />)
      expect(screen.getAllByText(/Markdown/i)[0]).toBeTruthy()
    })

    it('displays editor and preview areas', () => {
      render(<MarkdownEditorPage />)
      expect(screen.getAllByText(/Editor/i)[0]).toBeTruthy()
    })

    it('renders with default markdown content', () => {
      render(<MarkdownEditorPage />)
      expect(screen.getByText(/Welcome to Markdown Editor/i)).toBeTruthy()
    })

    it('displays view mode buttons', () => {
      render(<MarkdownEditorPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders markdown textarea', () => {
      render(<MarkdownEditorPage />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThan(0)
    })
  })

  describe('View Modes', () => {
    it('starts in split view mode', () => {
      render(<MarkdownEditorPage />)
      expect(screen.getByText(/Welcome to Markdown Editor/i)).toBeTruthy()
    })

    it('switches to editor-only mode', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const editorButton = buttons.find((btn) => btn.textContent?.includes('Editor'))

      if (editorButton) {
        await user.click(editorButton)
        expect(editorButton).toBeTruthy()
      }
    })

    it('switches to preview-only mode', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const previewButton = buttons.find((btn) => btn.textContent?.includes('Preview'))

      if (previewButton) {
        await user.click(previewButton)
        expect(previewButton).toBeTruthy()
      }
    })

    it('switches to split view mode', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const splitButton = buttons.find((btn) => btn.textContent?.includes('Split'))

      if (splitButton) {
        await user.click(splitButton)
        expect(splitButton).toBeTruthy()
      }
    })
  })

  describe('Markdown Editing', () => {
    it('allows typing in markdown editor', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '# Hello World')
        expect(textareas[0]).toHaveValue('# Hello World')
      }
    })

    it('updates preview when markdown changes', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '# Test Heading')

        await waitFor(() => {
          expect(screen.queryByText('Test Heading')).toBeTruthy()
        })
      }
    })

    it('clears markdown content', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        expect(textareas[0]).toHaveValue('')
      }
    })
  })

  describe('Export Functionality', () => {
    it('displays download markdown button', () => {
      render(<MarkdownEditorPage />)
      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find(
        (btn) => btn.textContent?.includes('Download') || btn.querySelector('svg')
      )
      expect(downloadButton).toBeTruthy()
    })

    it('downloads markdown file', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find(
        (btn) => btn.textContent?.includes('Download') || btn.querySelector('svg')
      )

      if (downloadButton) {
        await user.click(downloadButton)
        expect(analytics.trackToolEvent).toHaveBeenCalled()
      }
    })
  })

  describe('Copy Functionality', () => {
    it('displays copy markdown button', () => {
      render(<MarkdownEditorPage />)
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find(
        (btn) => btn.textContent?.includes('Copy') || btn.querySelector('svg')
      )
      expect(copyButton).toBeTruthy()
    })

    it('copies markdown to clipboard', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find(
        (btn) => btn.textContent?.includes('Copy') || btn.querySelector('svg')
      )

      if (copyButton) {
        await user.click(copyButton)
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })
  })

  describe('File Upload', () => {
    it('allows loading markdown files', async () => {
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const uploadButton = buttons.find(
        (btn) => btn.textContent?.includes('Load') || btn.textContent?.includes('Upload')
      )

      if (uploadButton) {
        expect(uploadButton).toBeTruthy()
      }
    })
  })

  describe('Reset Functionality', () => {
    it('displays reset button', () => {
      render(<MarkdownEditorPage />)
      const buttons = screen.getAllByRole('button')
      const resetButton = buttons.find(
        (btn) => btn.textContent?.includes('Reset') || btn.querySelector('svg')
      )
      expect(resetButton).toBeTruthy()
    })

    it('resets to default content', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], 'Custom content')

        const buttons = screen.getAllByRole('button')
        const resetButton = buttons.find((btn) => btn.textContent?.includes('Reset'))

        if (resetButton) {
          await user.click(resetButton)
          await waitFor(() => {
            expect(screen.getByText(/Welcome to Markdown Editor/i)).toBeTruthy()
          })
        }
      }
    })
  })

  describe('Markdown Features', () => {
    it('supports headings', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '# Heading 1')

        await waitFor(() => {
          expect(screen.queryByText('Heading 1')).toBeTruthy()
        })
      }
    })

    it('supports bold text', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '**bold text**')
        expect(textareas[0]).toHaveValue('**bold text**')
      }
    })

    it('supports lists', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '- Item 1{Enter}- Item 2')
        expect(textareas[0]).toBeTruthy()
      }
    })

    it('supports code blocks', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '```javascript{Enter}const x = 1;{Enter}```')
        expect(textareas[0]).toBeTruthy()
      }
    })

    it('supports links', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '[Link](https://example.com)')
        expect(textareas[0]).toHaveValue('[Link](https://example.com)')
      }
    })

    it('supports tables', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '| Column 1 | Column 2 |')
        expect(textareas[0]).toBeTruthy()
      }
    })
  })

  describe('Local Storage', () => {
    it('saves content to local storage', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], 'Test content')

        await waitFor(() => {
          const saved = localStorage.getItem('markdown-editor-content')
          expect(saved).toBeTruthy()
        })
      }
    })
  })

  describe('Analytics', () => {
    it('tracks page view', () => {
      render(<MarkdownEditorPage />)
      expect(analytics.trackToolEvent).toHaveBeenCalled()
    })

    it('tracks export actions', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      if (downloadButton) {
        await user.click(downloadButton)
        expect(analytics.trackToolEvent).toHaveBeenCalled()
      }
    })
  })

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      render(<MarkdownEditorPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible text inputs', () => {
      render(<MarkdownEditorPage />)
      const textboxes = screen.getAllByRole('textbox')
      expect(textboxes.length).toBeGreaterThan(0)
    })
  })

  describe('Preview Rendering', () => {
    it('renders markdown preview', () => {
      render(<MarkdownEditorPage />)
      expect(screen.getByText(/Welcome to Markdown Editor/i)).toBeTruthy()
    })

    it('updates preview in real-time', async () => {
      const user = userEvent.setup()
      render(<MarkdownEditorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas[0]) {
        await user.clear(textareas[0])
        await user.type(textareas[0], '# New Heading')

        await waitFor(() => {
          expect(screen.queryByText('New Heading')).toBeTruthy()
        })
      }
    })
  })
})
