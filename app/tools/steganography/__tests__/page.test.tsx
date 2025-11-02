import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import SteganographyPage from '../page'

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Steganography Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<SteganographyPage />)
      expect(screen.getByText('Text Steganography')).toBeInTheDocument()
    })

    it('renders encode mode by default', () => {
      render(<SteganographyPage />)
      expect(screen.getByText('Encode Mode')).toBeInTheDocument()
    })

    it('renders mode toggle buttons', () => {
      render(<SteganographyPage />)
      expect(screen.getByText('Encode')).toBeInTheDocument()
      expect(screen.getByText('Decode')).toBeInTheDocument()
    })

    it('renders encode mode inputs', () => {
      render(<SteganographyPage />)
      expect(screen.getByPlaceholderText(/Enter the visible text/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Enter your secret message/i)).toBeInTheDocument()
    })

    it('renders encode button', () => {
      render(<SteganographyPage />)
      expect(screen.getByText('Encode Message')).toBeInTheDocument()
    })
  })

  describe('Mode Switching', () => {
    it('switches to decode mode when decode button is clicked', async () => {
      render(<SteganographyPage />)

      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })
    })

    it('renders decode mode input', async () => {
      render(<SteganographyPage />)

      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Paste text that may contain/i)).toBeInTheDocument()
      })
    })

    it('switches back to encode mode', async () => {
      render(<SteganographyPage />)

      // Switch to decode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      // Switch back to encode
      const encodeButton = screen.getByText('Encode')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Encode Mode')).toBeInTheDocument()
      })
    })
  })

  describe('Encode Functionality', () => {
    it('shows error when encoding without cover text', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter cover text')
    })

    it('shows error when encoding without secret message', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      await userEvent.type(coverTextInput, 'Cover text')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a secret message')
    })

    it('encodes message successfully', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'This is cover text')
      await userEvent.type(secretInput, 'Secret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Message encoded successfully!')
      })
    })

    it('displays encoded result', async () => {
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Encoded Result')).toBeInTheDocument()
      })
    })

    it('shows copy button after encoding', async () => {
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Copy Encoded Text')).toBeInTheDocument()
      })
    })
  })

  describe('Decode Functionality', () => {
    it('shows error when decoding empty text', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      const decodeActionButton = screen.getByText('Decode Message')
      await userEvent.click(decodeActionButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter text to decode')
    })

    it('shows error when no hidden message is detected', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      const textInput = screen.getByPlaceholderText(/Paste text that may contain/i)
      await userEvent.type(textInput, 'Just plain text')

      const decodeActionButton = screen.getByText('Decode Message')
      await userEvent.click(decodeActionButton)

      expect(toast.error).toHaveBeenCalledWith('No hidden message detected in the text')
    })

    it('decodes message successfully', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // First encode a message
      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Encoded Result')).toBeInTheDocument()
      })

      // Get the encoded text from the textarea
      const resultTextarea = screen.getAllByRole('textbox')[2] // Third textarea is result
      const encodedText = (resultTextarea as HTMLTextAreaElement).value

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      // Paste the encoded text
      const decodeTextInput = screen.getByPlaceholderText(/Paste text that may contain/i)
      await userEvent.clear(decodeTextInput)
      await userEvent.type(decodeTextInput, encodedText)

      const decodeActionButton = screen.getByText('Decode Message')
      await userEvent.click(decodeActionButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Message decoded successfully!')
      })
    })

    it('displays decoded result', async () => {
      render(<SteganographyPage />)

      // Encode first
      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'TestSecret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Encoded Result')).toBeInTheDocument()
      })

      const resultTextarea = screen.getAllByRole('textbox')[2]
      const encodedText = (resultTextarea as HTMLTextAreaElement).value

      // Switch to decode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      const decodeTextInput = screen.getByPlaceholderText(/Paste text that may contain/i)
      await userEvent.clear(decodeTextInput)
      await userEvent.type(decodeTextInput, encodedText)

      const decodeActionButton = screen.getByText('Decode Message')
      await userEvent.click(decodeActionButton)

      await waitFor(() => {
        expect(screen.getByText('Decoded Message')).toBeInTheDocument()
        const decodedTextarea = screen.getAllByRole('textbox')[1]
        expect((decodedTextarea as HTMLTextAreaElement).value).toBe('TestSecret')
      })
    })
  })

  describe('Copy Functionality', () => {
    it('copies encoded text to clipboard', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Copy Encoded Text')).toBeInTheDocument()
      })

      const copyButton = screen.getByText('Copy Encoded Text')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
      })
    })

    it('copies decoded message to clipboard', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Encode first
      const coverTextInput = screen.getByPlaceholderText(/Enter the visible text/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButton = screen.getByText('Encode Message')
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText('Encoded Result')).toBeInTheDocument()
      })

      const resultTextarea = screen.getAllByRole('textbox')[2]
      const encodedText = (resultTextarea as HTMLTextAreaElement).value

      // Decode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      const decodeTextInput = screen.getByPlaceholderText(/Paste text that may contain/i)
      await userEvent.clear(decodeTextInput)
      await userEvent.type(decodeTextInput, encodedText)

      const decodeActionButton = screen.getByText('Decode Message')
      await userEvent.click(decodeActionButton)

      await waitFor(() => {
        expect(screen.getByText('Copy Decoded Text')).toBeInTheDocument()
      })

      const copyButton = screen.getByText('Copy Decoded Text')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears encode mode inputs', async () => {
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(
        /Enter the visible text/i
      ) as HTMLTextAreaElement
      const secretInput = screen.getByPlaceholderText(
        /Enter your secret message/i
      ) as HTMLTextAreaElement

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      expect(coverTextInput.value).toBe('Cover')
      expect(secretInput.value).toBe('Secret')

      const clearButton = screen.getByText('Clear All')
      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(coverTextInput.value).toBe('')
        expect(secretInput.value).toBe('')
      })
    })

    it('clears decode mode inputs', async () => {
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      const textInput = screen.getByPlaceholderText(
        /Paste text that may contain/i
      ) as HTMLTextAreaElement
      await userEvent.type(textInput, 'Some text')

      expect(textInput.value).toBe('Some text')

      const clearButton = screen.getByText('Clear All')
      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(textInput.value).toBe('')
      })
    })
  })

  describe('Load Example Functionality', () => {
    it('loads example in encode mode', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const coverTextInput = screen.getByPlaceholderText(
          /Enter the visible text/i
        ) as HTMLTextAreaElement
        const secretInput = screen.getByPlaceholderText(
          /Enter your secret message/i
        ) as HTMLTextAreaElement

        expect(coverTextInput.value).toBeTruthy()
        expect(secretInput.value).toBeTruthy()
        expect(toast.success).toHaveBeenCalledWith('Example loaded!')
      })
    })

    it('loads example in decode mode', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode')
      await userEvent.click(decodeButton)

      await waitFor(() => {
        expect(screen.getByText('Decode Mode')).toBeInTheDocument()
      })

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const textInput = screen.getByPlaceholderText(
          /Paste text that may contain/i
        ) as HTMLTextAreaElement
        expect(textInput.value).toBeTruthy()
        expect(toast.success).toHaveBeenCalledWith('Example loaded!')
      })
    })
  })
})
