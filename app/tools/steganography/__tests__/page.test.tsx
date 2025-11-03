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
      expect(screen.getByText('Text Steganography Tool')).toBeInTheDocument()
    })

    it('renders encode mode by default', () => {
      render(<SteganographyPage />)
      expect(screen.getByText('Encode Secret Message')).toBeInTheDocument()
    })

    it('renders mode toggle buttons', () => {
      render(<SteganographyPage />)
      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      expect(encodeButtons.length).toBeGreaterThan(0)
      expect(decodeButtons.length).toBeGreaterThan(0)
    })

    it('renders encode mode inputs', () => {
      render(<SteganographyPage />)
      expect(
        screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Enter your secret message to hide/i)).toBeInTheDocument()
    })

    it('renders encode button', () => {
      render(<SteganographyPage />)
      const encodeButtons = screen.getAllByText(/Encode Message/i)
      expect(encodeButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Mode Switching', () => {
    it('switches to decode mode when decode button is clicked', async () => {
      render(<SteganographyPage />)

      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })
    })

    it('renders decode mode input', async () => {
      render(<SteganographyPage />)

      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Paste text that might contain a hidden message/i)
        ).toBeInTheDocument()
      })
    })

    it('switches back to encode mode', async () => {
      render(<SteganographyPage />)

      // Switch to decode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      // Switch back to encode
      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons.find((el) => el.textContent === 'Encode Message')
      await userEvent.click(encodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Encode Secret Message')).toBeInTheDocument()
      })
    })
  })

  describe('Encode Functionality', () => {
    it('shows error when encoding without cover text', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1] // Get the action button
      await userEvent.click(encodeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter cover text')
    })

    it('shows error when encoding without secret message', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      await userEvent.type(coverTextInput, 'Cover text')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1] // Get the action button
      await userEvent.click(encodeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a secret message')
    })

    it('encodes message successfully', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'This is cover text')
      await userEvent.type(secretInput, 'Secret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1] // Get the action button
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Message encoded successfully!')
      })
    })

    it('displays encoded result', async () => {
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1] // Get the action button
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText(/Encoded Text.*contains hidden message/i)).toBeInTheDocument()
      })
    })

    it('shows copy button after encoding', async () => {
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1] // Get the action button
      await userEvent.click(encodeButton)

      await waitFor(() => {
        const copyButtons = screen.getAllByText('Copy')
        expect(copyButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Decode Functionality', () => {
    it('shows error when decoding empty text', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      const decodeActionButtons = screen.getAllByText(/Decode Message/i)
      const decodeActionButton = decodeActionButtons[decodeActionButtons.length - 1]
      await userEvent.click(decodeActionButton)

      expect(toast.error).toHaveBeenCalledWith('Please paste text to decode')
    })

    it('shows error when no hidden message is detected', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      const textInput = screen.getByPlaceholderText(
        /Paste text that might contain a hidden message/i
      )
      await userEvent.type(textInput, 'Just plain text')

      const decodeActionButtons = screen.getAllByText(/Decode Message/i)
      const decodeActionButton = decodeActionButtons[decodeActionButtons.length - 1]
      await userEvent.click(decodeActionButton)

      expect(toast.error).toHaveBeenCalledWith('No hidden message detected in this text')
    })

    it('decodes message successfully', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // First encode a message
      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1]
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText(/Encoded Text.*contains hidden message/i)).toBeInTheDocument()
      })

      // Get the encoded text from the textarea
      const resultTextarea = screen.getAllByRole('textbox')[2] // Third textarea is result
      const encodedText = (resultTextarea as HTMLTextAreaElement).value

      // Switch to decode mode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      // Paste the encoded text
      const decodeTextInput = screen.getByPlaceholderText(
        /Paste text that might contain a hidden message/i
      )
      await userEvent.clear(decodeTextInput)
      await userEvent.type(decodeTextInput, encodedText)

      const decodeActionButtons = screen.getAllByText(/Decode Message/i)
      const decodeActionButton = decodeActionButtons[decodeActionButtons.length - 1]
      await userEvent.click(decodeActionButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Message decoded successfully!')
      })
    })

    it('displays decoded result', async () => {
      render(<SteganographyPage />)

      // Encode first
      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'TestSecret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1]
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText(/Encoded Text.*contains hidden message/i)).toBeInTheDocument()
      })

      const resultTextarea = screen.getAllByRole('textbox')[2]
      const encodedText = (resultTextarea as HTMLTextAreaElement).value

      // Switch to decode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      const decodeTextInput = screen.getByPlaceholderText(
        /Paste text that might contain a hidden message/i
      )
      await userEvent.clear(decodeTextInput)
      await userEvent.type(decodeTextInput, encodedText)

      const decodeActionButtons = screen.getAllByText(/Decode Message/i)
      const decodeActionButton = decodeActionButtons[decodeActionButtons.length - 1]
      await userEvent.click(decodeActionButton)

      await waitFor(() => {
        expect(screen.getByText('Decoded Secret Message')).toBeInTheDocument()
        const decodedTextarea = screen.getAllByRole('textbox')[1]
        expect((decodedTextarea as HTMLTextAreaElement).value).toBe('TestSecret')
      })
    })
  })

  describe('Copy Functionality', () => {
    it('copies encoded text to clipboard', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1]
      await userEvent.click(encodeButton)

      await waitFor(() => {
        const copyButtons = screen.getAllByText('Copy')
        expect(copyButtons.length).toBeGreaterThan(0)
      })

      const copyButtons = screen.getAllByText('Copy')
      await userEvent.click(copyButtons[0])

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Encoded text copied to clipboard!')
      })
    })

    it('copies decoded message to clipboard', async () => {
      const { toast } = await import('sonner')
      render(<SteganographyPage />)

      // Encode first
      const coverTextInput = screen.getByPlaceholderText(/Enter normal text that will be visible/i)
      const secretInput = screen.getByPlaceholderText(/Enter your secret message to hide/i)

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      const encodeButtons = screen.getAllByText(/Encode Message/i)
      const encodeButton = encodeButtons[encodeButtons.length - 1]
      await userEvent.click(encodeButton)

      await waitFor(() => {
        expect(screen.getByText(/Encoded Text.*contains hidden message/i)).toBeInTheDocument()
      })

      const resultTextarea = screen.getAllByRole('textbox')[2]
      const encodedText = (resultTextarea as HTMLTextAreaElement).value

      // Decode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      const decodeTextInput = screen.getByPlaceholderText(
        /Paste text that might contain a hidden message/i
      )
      await userEvent.clear(decodeTextInput)
      await userEvent.type(decodeTextInput, encodedText)

      const decodeActionButtons = screen.getAllByText(/Decode Message/i)
      const decodeActionButton = decodeActionButtons[decodeActionButtons.length - 1]
      await userEvent.click(decodeActionButton)

      await waitFor(() => {
        const copyButtons = screen.getAllByText('Copy')
        expect(copyButtons.length).toBeGreaterThan(0)
      })

      const copyButtons = screen.getAllByText('Copy')
      await userEvent.click(copyButtons[0])

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Decoded message copied!')
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears encode mode inputs', async () => {
      render(<SteganographyPage />)

      const coverTextInput = screen.getByPlaceholderText(
        /Enter normal text that will be visible/i
      ) as HTMLTextAreaElement
      const secretInput = screen.getByPlaceholderText(
        /Enter your secret message to hide/i
      ) as HTMLTextAreaElement

      await userEvent.type(coverTextInput, 'Cover')
      await userEvent.type(secretInput, 'Secret')

      expect(coverTextInput.value).toBe('Cover')
      expect(secretInput.value).toBe('Secret')

      const clearButton = screen.getByText('Clear')
      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(coverTextInput.value).toBe('')
        expect(secretInput.value).toBe('')
      })
    })

    it('clears decode mode inputs', async () => {
      render(<SteganographyPage />)

      // Switch to decode mode
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      const textInput = screen.getByPlaceholderText(
        /Paste text that might contain a hidden message/i
      ) as HTMLTextAreaElement
      await userEvent.type(textInput, 'Some text')

      expect(textInput.value).toBe('Some text')

      const clearButton = screen.getByText('Clear')
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
          /Enter normal text that will be visible/i
        ) as HTMLTextAreaElement
        const secretInput = screen.getByPlaceholderText(
          /Enter your secret message to hide/i
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
      const decodeButtons = screen.getAllByText(/Decode Message/i)
      const decodeButton = decodeButtons.find((el) => el.textContent === 'Decode Message')
      await userEvent.click(decodeButton!)

      await waitFor(() => {
        expect(screen.getByText('Decode Hidden Message')).toBeInTheDocument()
      })

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const textInput = screen.getByPlaceholderText(
          /Paste text that might contain a hidden message/i
        ) as HTMLTextAreaElement
        expect(textInput.value).toBeTruthy()
        expect(toast.success).toHaveBeenCalledWith(
          'Example loaded! Click Decode to reveal the secret.'
        )
      })
    })
  })
})
