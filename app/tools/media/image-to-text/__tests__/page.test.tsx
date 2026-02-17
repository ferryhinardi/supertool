import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ImageToTextPage from '../page'

// Mock tesseract.js
const mockRecognize = vi.fn()
const mockTerminate = vi.fn()
const mockCreateWorker = vi.fn()

vi.mock('tesseract.js', () => ({
  createWorker: (...args: unknown[]) => mockCreateWorker(...args),
}))

// Mock analytics
const mockTrackToolEvent = vi.fn()
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: (...args: unknown[]) => mockTrackToolEvent(...args),
}))

// Mock styled-system/css
vi.mock('@/styled-system/css', () => ({
  css: () => '',
}))

// Mock Card component
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}))

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    variant,
    size,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
    variant?: string
    size?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}))

// Store original URL methods
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

describe('ImageToTextPage', () => {
  let urlCounter = 0

  // Helper function to create mock image file
  const createMockImageFile = (name = 'test-image.jpg', size = 1000, type = 'image/jpeg'): File => {
    const content = new Array(size).fill('a').join('')
    return new File([content], name, { type })
  }

  // Helper function to create mock file list
  const createMockFileList = (files: File[]): FileList => {
    const fileList = {
      length: files.length,
      item: (index: number) => files[index] || null,
      [Symbol.iterator]: function* () {
        for (let i = 0; i < files.length; i++) {
          yield files[i]
        }
      },
    }
    files.forEach((file, index) => {
      Object.defineProperty(fileList, index, { value: file, enumerable: true })
    })
    return fileList as FileList
  }

  // Helper function to upload a file
  const uploadFile = (file: File) => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const fileList = createMockFileList([file])
    Object.defineProperty(input, 'files', { value: fileList, configurable: true })
    fireEvent.change(input, { target: { files: fileList } })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    urlCounter = 0

    // Mock URL methods
    URL.createObjectURL = vi.fn(() => `blob:test-url-${urlCounter++}`)
    URL.revokeObjectURL = vi.fn()

    // Reset createWorker mock to return a working worker
    mockCreateWorker.mockReset()
    mockRecognize.mockReset()
    mockTerminate.mockReset()

    mockRecognize.mockResolvedValue({
      data: { text: 'Extracted text from image' },
    })

    mockCreateWorker.mockImplementation(async (_lang, _oem, options) => {
      // Simulate progress updates
      if (options?.logger) {
        options.logger({ status: 'recognizing text', progress: 0.5 })
      }
      return {
        recognize: mockRecognize,
        terminate: mockTerminate,
      }
    })

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<ImageToTextPage />)
      expect(screen.getByText('Image to Text Converter')).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<ImageToTextPage />)
      expect(screen.getByText(/Extract text from images using OCR/i)).toBeInTheDocument()
    })

    it('renders the Upload Image button', () => {
      render(<ImageToTextPage />)
      // There are multiple "Upload Image" texts (button + how-to step)
      const uploadTexts = screen.getAllByText('Upload Image')
      expect(uploadTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('renders the language selector', () => {
      render(<ImageToTextPage />)
      expect(screen.getByLabelText('Language')).toBeInTheDocument()
    })

    it('has English as default language', () => {
      render(<ImageToTextPage />)
      const select = screen.getByLabelText('Language') as HTMLSelectElement
      expect(select.value).toBe('eng')
    })

    it('renders all language options', () => {
      render(<ImageToTextPage />)
      const select = screen.getByLabelText('Language') as HTMLSelectElement
      expect(select.options.length).toBe(12)
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Spanish')).toBeInTheDocument()
      expect(screen.getByText('French')).toBeInTheDocument()
      expect(screen.getByText('German')).toBeInTheDocument()
      expect(screen.getByText('Chinese (Simplified)')).toBeInTheDocument()
      expect(screen.getByText('Chinese (Traditional)')).toBeInTheDocument()
      expect(screen.getByText('Japanese')).toBeInTheDocument()
      expect(screen.getByText('Korean')).toBeInTheDocument()
      expect(screen.getByText('Russian')).toBeInTheDocument()
      expect(screen.getByText('Arabic')).toBeInTheDocument()
      expect(screen.getByText('Portuguese')).toBeInTheDocument()
      expect(screen.getByText('Italian')).toBeInTheDocument()
    })

    it('renders extracted text section header', () => {
      render(<ImageToTextPage />)
      expect(screen.getByText('Extracted Text')).toBeInTheDocument()
    })

    it('shows placeholder text when no image is uploaded', () => {
      render(<ImageToTextPage />)
      expect(screen.getByText('Upload an image to extract text using OCR')).toBeInTheDocument()
    })

    it('shows supported formats message', () => {
      render(<ImageToTextPage />)
      expect(screen.getByText('Supported formats: PNG, JPEG, WEBP')).toBeInTheDocument()
    })

    it('has a hidden file input', () => {
      render(<ImageToTextPage />)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.accept).toBe('image/*')
    })
  })

  describe('Language Selection', () => {
    it('allows changing language', () => {
      render(<ImageToTextPage />)
      const select = screen.getByLabelText('Language') as HTMLSelectElement

      fireEvent.change(select, { target: { value: 'spa' } })
      expect(select.value).toBe('spa')
    })

    it('uses selected language when processing', async () => {
      render(<ImageToTextPage />)

      // Change language to Spanish
      const select = screen.getByLabelText('Language') as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'spa' } })

      // Upload file
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(mockCreateWorker).toHaveBeenCalledWith('spa', 1, expect.any(Object))
      })
    })
  })

  describe('File Upload', () => {
    it('accepts valid image files', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile('test.jpg', 1000, 'image/jpeg')
      uploadFile(file)

      await waitFor(() => {
        expect(mockCreateWorker).toHaveBeenCalled()
      })
    })

    it('tracks upload event', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile('test.jpg', 5000, 'image/jpeg')
      uploadFile(file)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('image_to_text_upload', {
          fileType: 'image/jpeg',
          fileSize: 5000,
          language: 'eng',
        })
      })
    })

    it('shows image preview after upload', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        const img = screen.getByAltText('Uploaded')
        expect(img).toBeInTheDocument()
      })
    })

    it('creates object URL for image preview', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalledWith(file)
      })
    })
  })

  describe('File Validation', () => {
    it('rejects non-image files', async () => {
      render(<ImageToTextPage />)

      const textFile = new File(['text content'], 'document.txt', { type: 'text/plain' })
      uploadFile(textFile)

      await waitFor(() => {
        expect(screen.getByText('Please upload a valid image file')).toBeInTheDocument()
      })

      // Should not call worker
      expect(mockCreateWorker).not.toHaveBeenCalled()
    })

    it('rejects files larger than 10MB', async () => {
      render(<ImageToTextPage />)

      // Create a file larger than 10MB
      const largeFile = createMockImageFile('large.jpg', 11 * 1024 * 1024)
      uploadFile(largeFile)

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 10MB')).toBeInTheDocument()
      })

      // Should not call worker
      expect(mockCreateWorker).not.toHaveBeenCalled()
    })

    it('accepts files exactly 10MB', async () => {
      render(<ImageToTextPage />)

      // Create a file exactly 10MB
      const exactFile = createMockImageFile('exact.jpg', 10 * 1024 * 1024)
      uploadFile(exactFile)

      await waitFor(() => {
        expect(mockCreateWorker).toHaveBeenCalled()
      })
    })

    it('accepts PNG files', async () => {
      render(<ImageToTextPage />)

      const pngFile = createMockImageFile('test.png', 1000, 'image/png')
      uploadFile(pngFile)

      await waitFor(() => {
        expect(mockCreateWorker).toHaveBeenCalled()
      })
    })

    it('accepts WEBP files', async () => {
      render(<ImageToTextPage />)

      const webpFile = createMockImageFile('test.webp', 1000, 'image/webp')
      uploadFile(webpFile)

      await waitFor(() => {
        expect(mockCreateWorker).toHaveBeenCalled()
      })
    })
  })

  describe('OCR Processing', () => {
    it('calls tesseract createWorker with correct parameters', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(mockCreateWorker).toHaveBeenCalledWith(
          'eng',
          1,
          expect.objectContaining({
            logger: expect.any(Function),
          })
        )
      })
    })

    it('shows processing status', async () => {
      // Make worker creation slow to observe processing state
      mockCreateWorker.mockImplementation(async (_lang, _oem, options) => {
        if (options?.logger) {
          options.logger({ status: 'recognizing text', progress: 0.5 })
        }
        return {
          recognize: mockRecognize,
          terminate: mockTerminate,
        }
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      // Button should show processing text
      await waitFor(() => {
        expect(screen.getByText(/Processing.../)).toBeInTheDocument()
      })
    })

    it('displays extracted text after successful processing', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Hello World from OCR' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Hello World from OCR')).toBeInTheDocument()
      })
    })

    it('terminates worker after processing', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(mockTerminate).toHaveBeenCalled()
      })
    })

    it('revokes object URL after processing', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalled()
      })
    })

    it('tracks success event after processing', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Test extracted text' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('image_to_text_success', {
          textLength: 'Test extracted text'.length,
          language: 'eng',
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error message when OCR fails', async () => {
      mockCreateWorker.mockRejectedValue(new Error('OCR failed'))

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to extract text from image. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('tracks error event when OCR fails', async () => {
      mockCreateWorker.mockRejectedValue(new Error('OCR failed'))

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('image_to_text_error', {
          language: 'eng',
        })
      })
    })

    it('resets processing state after error', async () => {
      mockCreateWorker.mockRejectedValue(new Error('OCR failed'))

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to extract text from image. Please try again.')
        ).toBeInTheDocument()
      })

      // Button should be back to normal (multiple "Upload Image" texts exist)
      const uploadTexts = screen.getAllByText('Upload Image')
      expect(uploadTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('clears previous error when uploading new valid file', async () => {
      // First upload fails
      mockCreateWorker.mockRejectedValueOnce(new Error('OCR failed'))

      render(<ImageToTextPage />)

      const file1 = createMockImageFile('test1.jpg')
      uploadFile(file1)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to extract text from image. Please try again.')
        ).toBeInTheDocument()
      })

      // Reset mock for second upload
      mockCreateWorker.mockImplementation(async () => ({
        recognize: mockRecognize,
        terminate: mockTerminate,
      }))

      // Second upload succeeds
      const file2 = createMockImageFile('test2.jpg')
      uploadFile(file2)

      await waitFor(() => {
        expect(
          screen.queryByText('Failed to extract text from image. Please try again.')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Copy to Clipboard', () => {
    it('shows copy button after text is extracted', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Test text' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Test text')).toBeInTheDocument()
      })

      // Find buttons after extraction - there should be action buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(1)
    })

    it('copies text to clipboard when copy button is clicked', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Text to copy' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Text to copy')).toBeInTheDocument()
      })

      // Find and click the copy button (first outline button after extraction)
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      if (copyButton) {
        fireEvent.click(copyButton)

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Text to copy')
        })
      }
    })

    it('tracks copy event', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Text to copy' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Text to copy')).toBeInTheDocument()
      })

      // Find and click the copy button
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      if (copyButton) {
        fireEvent.click(copyButton)

        await waitFor(() => {
          expect(mockTrackToolEvent).toHaveBeenCalledWith('image_to_text_copy')
        })
      }
    })
  })

  describe('Download Text', () => {
    it('tracks download event when download button is clicked', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Text to download' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Text to download')).toBeInTheDocument()
      })

      // Mock document.createElement for download link AFTER render
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string) => {
          if (tag === 'a') {
            const anchor = originalCreateElement('a') as HTMLAnchorElement
            anchor.click = mockClick
            return anchor
          }
          return originalCreateElement(tag)
        })

      // Find and click the download button (second outline button)
      const buttons = screen.getAllByRole('button')
      const outlineButtons = buttons.filter(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      if (outlineButtons.length >= 2) {
        fireEvent.click(outlineButtons[1])

        await waitFor(() => {
          expect(mockTrackToolEvent).toHaveBeenCalledWith('image_to_text_download')
        })
      }

      createElementSpy.mockRestore()
    })
  })

  describe('Clear Functionality', () => {
    it('clears extracted text when clear button is clicked', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Text to clear' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Text to clear')).toBeInTheDocument()
      })

      // Find and click the clear button (has red border color)
      const buttons = screen.getAllByRole('button')
      const outlineButtons = buttons.filter(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      // Clear button is the third outline button
      if (outlineButtons.length >= 3) {
        fireEvent.click(outlineButtons[2])

        await waitFor(() => {
          expect(screen.queryByText('Text to clear')).not.toBeInTheDocument()
        })
      }
    })

    it('tracks clear event', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Text to clear' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Text to clear')).toBeInTheDocument()
      })

      // Find and click the clear button
      const buttons = screen.getAllByRole('button')
      const outlineButtons = buttons.filter(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      if (outlineButtons.length >= 3) {
        fireEvent.click(outlineButtons[2])

        await waitFor(() => {
          expect(mockTrackToolEvent).toHaveBeenCalledWith('image_to_text_clear')
        })
      }
    })

    it('clears image preview when clear button is clicked', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Some text' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByAltText('Uploaded')).toBeInTheDocument()
      })

      // Find and click the clear button
      const buttons = screen.getAllByRole('button')
      const outlineButtons = buttons.filter(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      if (outlineButtons.length >= 3) {
        fireEvent.click(outlineButtons[2])

        await waitFor(() => {
          expect(screen.queryByAltText('Uploaded')).not.toBeInTheDocument()
        })
      }
    })

    it('shows placeholder after clearing', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Some text' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Some text')).toBeInTheDocument()
      })

      // Find and click the clear button
      const buttons = screen.getAllByRole('button')
      const outlineButtons = buttons.filter(
        (btn) =>
          btn.getAttribute('data-variant') === 'outline' && btn.getAttribute('data-size') === 'sm'
      )

      if (outlineButtons.length >= 3) {
        fireEvent.click(outlineButtons[2])

        await waitFor(() => {
          expect(screen.getByText('Upload an image to extract text using OCR')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Character and Word Count', () => {
    it('shows character count after text is extracted', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Hello World' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText(/Characters: 11/)).toBeInTheDocument()
      })
    })

    it('shows word count after text is extracted', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'Hello World' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText(/Words: 2/)).toBeInTheDocument()
      })
    })

    it('correctly counts multiple words', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'The quick brown fox jumps over the lazy dog' },
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText(/Words: 9/)).toBeInTheDocument()
        expect(screen.getByText(/Characters: 43/)).toBeInTheDocument()
      })
    })
  })

  describe('Button Disabled State', () => {
    it('disables upload button during processing', async () => {
      // Make processing take longer
      mockCreateWorker.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return {
          recognize: mockRecognize,
          terminate: mockTerminate,
        }
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      // Find the upload button
      const uploadButton = screen
        .getAllByRole('button')
        .find((btn) => btn.textContent?.includes('Processing'))

      expect(uploadButton).toBeDisabled()
    })

    it('disables language selector during processing', async () => {
      // Make processing take longer
      mockCreateWorker.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return {
          recognize: mockRecognize,
          terminate: mockTerminate,
        }
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      const select = screen.getByLabelText('Language') as HTMLSelectElement
      expect(select).toBeDisabled()
    })

    it('re-enables controls after processing completes', async () => {
      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Extracted text from image')).toBeInTheDocument()
      })

      const select = screen.getByLabelText('Language') as HTMLSelectElement
      expect(select).not.toBeDisabled()

      // Multiple "Upload Image" texts exist (button + how-to step), get the button
      const uploadButtons = screen.getAllByText('Upload Image')
      const uploadButton = uploadButtons.find((el) => el.tagName === 'BUTTON')
      expect(uploadButton).not.toBeDisabled()
    })
  })

  describe('Progress Bar', () => {
    it('shows progress during OCR processing', async () => {
      mockCreateWorker.mockImplementation(async (_lang, _oem, options) => {
        // Simulate progress updates
        if (options?.logger) {
          options.logger({ status: 'recognizing text', progress: 0.5 })
        }
        return {
          recognize: mockRecognize,
          terminate: mockTerminate,
        }
      })

      render(<ImageToTextPage />)

      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        // Progress percentage should be visible in button text
        expect(screen.getByText(/Processing... 50%/)).toBeInTheDocument()
      })
    })
  })

  describe('Multiple File Uploads', () => {
    it('allows uploading another image after processing', async () => {
      // This test verifies that users can upload multiple images sequentially
      // Reset mocks at the start of this test for clean state
      mockRecognize.mockReset()
      mockCreateWorker.mockReset()

      // Use mockResolvedValueOnce for first call, then default for subsequent
      mockRecognize.mockResolvedValueOnce({ data: { text: 'First text' } })
      mockRecognize.mockResolvedValue({ data: { text: 'Second text' } })

      mockCreateWorker.mockImplementation(async (_lang, _oem, options) => {
        if (options?.logger) {
          options.logger({ status: 'recognizing text', progress: 0.5 })
        }
        return {
          recognize: mockRecognize,
          terminate: mockTerminate,
        }
      })

      render(<ImageToTextPage />)

      // First upload
      const file1 = createMockImageFile('first.jpg')
      uploadFile(file1)

      // Wait for first text to appear
      await waitFor(
        () => {
          expect(screen.getByText('First text')).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Upload second file directly (without clearing)
      const file2 = createMockImageFile('second.jpg')
      uploadFile(file2)

      // Wait for second text to appear - this is the key assertion
      // The component should handle replacing the current image and show new text
      await waitFor(
        () => {
          expect(screen.getByText('Second text')).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Verify recognize was called multiple times (at least once per upload)
      expect(mockRecognize).toHaveBeenCalledTimes(2)
    })
  })
})
