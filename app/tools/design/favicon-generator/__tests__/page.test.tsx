import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FaviconGeneratorPage from '../page'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    span: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => (
      <span {...props}>{children}</span>
    ),
  },
}))

// Mock URL.createObjectURL and revokeObjectURL
const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
const revokeObjectURLMock = vi.fn()
window.URL.createObjectURL = createObjectURLMock
window.URL.revokeObjectURL = revokeObjectURLMock

describe('Favicon Generator Page - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createObjectURLMock.mockClear()
    revokeObjectURLMock.mockClear()
  })

  describe('Page Rendering', () => {
    it('should render page with title and description', () => {
      render(<FaviconGeneratorPage />)

      expect(
        screen.getByRole('heading', { name: 'Favicon Generator', level: 1 })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Convert logos, images, or emojis into favicons for websites/i)
      ).toBeInTheDocument()
    })

    it('should render mode selection buttons', () => {
      render(<FaviconGeneratorPage />)

      expect(screen.getByText('Upload Image')).toBeInTheDocument()
      expect(screen.getByText('Use Emoji')).toBeInTheDocument()
    })

    it('should render generate button', () => {
      render(<FaviconGeneratorPage />)

      expect(screen.getByText('Generate Favicons')).toBeInTheDocument()
    })

    it('should render info section', () => {
      render(<FaviconGeneratorPage />)

      expect(screen.getByText('About Favicons')).toBeInTheDocument()
      expect(
        screen.getByText(/Favicons are small icons that appear in browser tabs/i)
      ).toBeInTheDocument()
    })
  })

  describe('Mode Switching', () => {
    it('should start in upload mode by default', () => {
      render(<FaviconGeneratorPage />)

      expect(
        screen.getByText('Drag and drop an image here, or click to select')
      ).toBeInTheDocument()
    })

    it('should switch to emoji mode when emoji button is clicked', async () => {
      render(<FaviconGeneratorPage />)

      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByText('Select or Enter Emoji')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Or paste your own emoji here...')).toBeInTheDocument()
      })
    })

    it('should switch back to upload mode when upload button is clicked', async () => {
      render(<FaviconGeneratorPage />)

      // Switch to emoji mode first
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByText('Select or Enter Emoji')).toBeInTheDocument()
      })

      // Switch back to upload mode
      const uploadButton = screen.getByText('Upload Image')
      await userEvent.click(uploadButton)

      await waitFor(() => {
        expect(
          screen.getByText('Drag and drop an image here, or click to select')
        ).toBeInTheDocument()
      })
    })

    it('should highlight active mode button', async () => {
      render(<FaviconGeneratorPage />)

      const uploadButton = screen.getByText('Upload Image')
      const emojiButton = screen.getByText('Use Emoji')

      // Upload mode should be active by default - check className contains violet
      expect(uploadButton.className).toContain('violet')

      // Click emoji button
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(emojiButton.className).toContain('violet')
      })
    })
  })

  describe('Upload Mode - File Handling', () => {
    it('should accept valid image file upload', async () => {
      const { trackEvent } = await import('@/lib/services/analytics')
      render(<FaviconGeneratorPage />)

      const file = new File(['image'], 'test.png', { type: 'image/png' })
      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement
      const input = dropZone?.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)

        await waitFor(() => {
          expect(screen.getByText('test.png')).toBeInTheDocument()
          expect(trackEvent).toHaveBeenCalledWith({
            action: 'favicon_upload_image',
            category: 'favicon_generator',
            label: 'image/png',
          })
        })
      }
    })

    it('should show error for invalid file type', async () => {
      render(<FaviconGeneratorPage />)

      const file = new File(['document'], 'test.pdf', { type: 'application/pdf' })
      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement

      if (dropZone) {
        const input = dropZone.querySelector('input')
        if (input) {
          Object.defineProperty(input, 'files', {
            value: [file],
            writable: false,
          })
          input.dispatchEvent(new Event('change', { bubbles: true }))

          await waitFor(() => {
            expect(screen.getByText(/Please upload a valid image file/i)).toBeInTheDocument()
          })
        }
      }
    })

    it('should show error for file size exceeding 5MB', async () => {
      render(<FaviconGeneratorPage />)

      // Create a file larger than 5MB
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      })
      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement

      if (dropZone) {
        const input = dropZone.querySelector('input')
        if (input) {
          Object.defineProperty(input, 'files', {
            value: [largeFile],
            writable: false,
          })
          input.dispatchEvent(new Event('change', { bubbles: true }))

          await waitFor(() => {
            expect(screen.getByText(/File size must be less than 5MB/i)).toBeInTheDocument()
          })
        }
      }
    })

    it('should display image preview after upload', async () => {
      render(<FaviconGeneratorPage />)

      const file = new File(['image'], 'preview.png', { type: 'image/png' })
      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement

      if (dropZone) {
        const input = dropZone.querySelector('input')
        if (input) {
          await userEvent.upload(input, file)

          await waitFor(() => {
            const preview = screen.getByAltText('Preview')
            expect(preview).toBeInTheDocument()
            expect(preview).toHaveAttribute('src', 'blob:mock-url')
          })
        }
      }
    })

    it('should disable generate button when no file is uploaded', () => {
      render(<FaviconGeneratorPage />)

      const generateButton = screen.getByText('Generate Favicons')
      expect(generateButton).toBeDisabled()
    })

    it('should enable generate button when file is uploaded', async () => {
      render(<FaviconGeneratorPage />)

      const file = new File(['image'], 'test.png', { type: 'image/png' })
      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement

      if (dropZone) {
        const input = dropZone.querySelector('input')
        if (input) {
          await userEvent.upload(input, file)

          await waitFor(() => {
            const generateButton = screen.getByText('Generate Favicons')
            expect(generateButton).not.toBeDisabled()
          })
        }
      }
    })
  })

  describe('Emoji Mode - Emoji Selection', () => {
    it('should display popular emojis grid', async () => {
      render(<FaviconGeneratorPage />)

      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        // Check for some popular emojis
        expect(screen.getByText('🚀')).toBeInTheDocument()
        expect(screen.getByText('⚡')).toBeInTheDocument()
        expect(screen.getByText('🎨')).toBeInTheDocument()
        expect(screen.getByText('💡')).toBeInTheDocument()
      })
    })

    it('should select emoji from popular grid', async () => {
      render(<FaviconGeneratorPage />)

      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByText('⚡')).toBeInTheDocument()
      })

      const lightning = screen.getByText('⚡')
      await userEvent.click(lightning)

      // Generate button should be enabled
      const generateButton = screen.getByText('Generate Favicons')
      expect(generateButton).not.toBeDisabled()
    })

    it('should allow custom emoji input', async () => {
      render(<FaviconGeneratorPage />)

      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Or paste your own emoji here...')).toBeInTheDocument()
      })

      const customInput = screen.getByPlaceholderText('Or paste your own emoji here...')
      await userEvent.type(customInput, '🦄')

      expect(customInput).toHaveValue('🦄')
    })

    it('should prioritize custom emoji over selected emoji', async () => {
      render(<FaviconGeneratorPage />)

      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByText('🚀')).toBeInTheDocument()
      })

      // Select from popular grid
      const rocket = screen.getByText('🚀')
      await userEvent.click(rocket)

      // Enter custom emoji
      const customInput = screen.getByPlaceholderText('Or paste your own emoji here...')
      await userEvent.type(customInput, '🦄')

      expect(customInput).toHaveValue('🦄')
    })

    it('should clear custom emoji when selecting from popular grid', async () => {
      render(<FaviconGeneratorPage />)

      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Or paste your own emoji here...')).toBeInTheDocument()
      })

      // Enter custom emoji first
      const customInput = screen.getByPlaceholderText('Or paste your own emoji here...')
      await userEvent.type(customInput, '🦄')
      expect(customInput).toHaveValue('🦄')

      // Select from popular grid
      const rocket = screen.getByText('🚀')
      await userEvent.click(rocket)

      await waitFor(() => {
        expect(customInput).toHaveValue('')
      })
    })
  })

  describe('Generate Functionality', () => {
    it('should track generate event with analytics', async () => {
      const { trackEvent } = await import('@/lib/services/analytics')
      render(<FaviconGeneratorPage />)

      // Switch to emoji mode
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      await waitFor(() => {
        expect(screen.getByText('Generate Favicons')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('Generate Favicons')
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          action: 'favicon_select_emoji',
          category: 'favicon_generator',
          label: expect.any(String),
        })
      })
    })
  })

  describe('Download Functionality', () => {
    it('should not show download section initially', () => {
      render(<FaviconGeneratorPage />)

      expect(screen.queryByText('Preview & Download')).not.toBeInTheDocument()
    })

    it('should track ICO download event', async () => {
      const { trackEvent } = await import('@/lib/services/analytics')
      render(<FaviconGeneratorPage />)

      // Switch to emoji mode and generate
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      const generateButton = screen.getByText('Generate Favicons')
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Preview & Download')).toBeInTheDocument()
      })

      const downloadButton = screen.getByText('Download ICO File')
      await userEvent.click(downloadButton)

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          action: 'favicon_download_ico',
          category: 'favicon_generator',
          value: expect.any(Number),
        })
      })
    })
  })

  describe('HTML Copy Functionality', () => {
    it('should show copy button when favicons are generated', async () => {
      render(<FaviconGeneratorPage />)

      // Switch to emoji mode and generate
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      const generateButton = screen.getByText('Generate Favicons')
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('HTML Code')).toBeInTheDocument()
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })
    })

    it('should track HTML copy event', async () => {
      const { trackEvent } = await import('@/lib/services/analytics')

      render(<FaviconGeneratorPage />)

      // Switch to emoji mode and generate
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      const generateButton = screen.getByText('Generate Favicons')
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          action: 'favicon_copy_html',
          category: 'favicon_generator',
          value: expect.any(Number),
        })
      })
    })

    it('should show copied confirmation after copying HTML', async () => {
      render(<FaviconGeneratorPage />)

      // Switch to emoji mode and generate
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      const generateButton = screen.getByText('Generate Favicons')
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('should display generated HTML code', async () => {
      render(<FaviconGeneratorPage />)

      // Switch to emoji mode and generate
      const emojiButton = screen.getByText('Use Emoji')
      await userEvent.click(emojiButton)

      const generateButton = screen.getByText('Generate Favicons')
      await userEvent.click(generateButton)

      await waitFor(() => {
        const htmlCode = screen.getByText(/link rel="icon"/i)
        expect(htmlCode).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message for invalid file', async () => {
      render(<FaviconGeneratorPage />)

      const file = new File(['text'], 'test.txt', { type: 'text/plain' })
      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement

      if (dropZone) {
        const input = dropZone.querySelector('input')
        if (input) {
          Object.defineProperty(input, 'files', {
            value: [file],
            writable: false,
          })
          input.dispatchEvent(new Event('change', { bubbles: true }))

          await waitFor(() => {
            expect(screen.getByText(/Please upload a valid image file/i)).toBeInTheDocument()
          })
        }
      }
    })

    it('should clear error when valid file is uploaded after error', async () => {
      render(<FaviconGeneratorPage />)

      const dropZone = screen.getByText(
        'Drag and drop an image here, or click to select'
      ).parentElement
      if (!dropZone) return

      const input = dropZone.querySelector('input')
      if (!input) return

      // First upload invalid file
      const invalidFile = new File(['text'], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false,
      })
      input.dispatchEvent(new Event('change', { bubbles: true }))

      await waitFor(() => {
        expect(screen.getByText(/Please upload a valid image file/i)).toBeInTheDocument()
      })

      // Then upload valid file
      const validFile = new File(['image'], 'test.png', { type: 'image/png' })
      await userEvent.upload(input, validFile)

      await waitFor(() => {
        expect(screen.queryByText(/Please upload a valid image file/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible heading structure', () => {
      render(<FaviconGeneratorPage />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Favicon Generator')
    })

    it('should have accessible file input', () => {
      render(<FaviconGeneratorPage />)

      // File input should exist in upload mode
      const input = document.querySelector('input[type="file"]')
      expect(input).not.toBeNull()
      expect(input).toHaveAttribute('accept', 'image/*')
    })

    it('should have descriptive button labels', () => {
      render(<FaviconGeneratorPage />)

      expect(screen.getByText('Upload Image')).toBeInTheDocument()
      expect(screen.getByText('Use Emoji')).toBeInTheDocument()
      expect(screen.getByText('Generate Favicons')).toBeInTheDocument()
    })
  })
})
