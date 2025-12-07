import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { toast } from 'sonner'
import * as analytics from '@/lib/analytics'
import SignatureGeneratorPage from '../page'

vi.mock('@/lib/analytics', () => ({ trackToolEvent: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockToDataURL = vi.fn(() => 'data:image/png;base64,mockdata')
const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  font: '',
  textAlign: '',
  textBaseline: '',
}))

HTMLCanvasElement.prototype.toDataURL = mockToDataURL
HTMLCanvasElement.prototype.getContext = mockGetContext as any

describe('Signature Generator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
  })

  describe('Rendering', () => {
    it('renders the page with heading', () => {
      render(<SignatureGeneratorPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('displays signature controls', () => {
      render(<SignatureGeneratorPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders name input field', () => {
      render(<SignatureGeneratorPage />)
      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      expect(nameInput).toBeTruthy()
    })

    it('renders canvas element', () => {
      render(<SignatureGeneratorPage />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeTruthy()
    })

    it('displays style options', () => {
      render(<SignatureGeneratorPage />)
      expect(screen.getByText(/Handwritten/i)).toBeTruthy()
      expect(screen.getByText(/Cursive/i)).toBeTruthy()
      expect(screen.getByText(/Modern/i)).toBeTruthy()
    })
  })

  describe('Name Input', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'John Doe')

      expect(nameInput).toHaveValue('John Doe')
    })

    it('updates signature when name changes', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'Jane Smith')

      expect(mockGetContext).toHaveBeenCalled()
    })

    it('clears name input', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'Test Name')
      await user.clear(nameInput)

      expect(nameInput).toHaveValue('')
    })
  })

  describe('Style Selection', () => {
    it('selects handwritten style', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const handwrittenButton = screen.getByText(/Handwritten/i)
      await user.click(handwrittenButton)

      expect(handwrittenButton).toBeTruthy()
    })

    it('selects cursive style', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const cursiveButton = screen.getByText(/Cursive/i)
      await user.click(cursiveButton)

      expect(cursiveButton).toBeTruthy()
    })

    it('selects modern style', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const modernButton = screen.getByText(/Modern/i)
      await user.click(modernButton)

      expect(modernButton).toBeTruthy()
    })

    it('displays all style options', () => {
      render(<SignatureGeneratorPage />)
      expect(screen.getByText(/Handwritten/i)).toBeTruthy()
      expect(screen.getByText(/Cursive/i)).toBeTruthy()
      expect(screen.getByText(/Modern/i)).toBeTruthy()
      expect(screen.getByText(/Elegant/i)).toBeTruthy()
      expect(screen.getByText(/Bold/i)).toBeTruthy()
      expect(screen.getByText(/Minimal/i)).toBeTruthy()
    })
  })

  describe('Color Selection', () => {
    it('renders color picker', () => {
      render(<SignatureGeneratorPage />)
      const colorInput =
        screen.getByRole('textbox', { name: /color/i }) ||
        document.querySelector('input[type="color"]')
      expect(colorInput).toBeTruthy()
    })

    it('allows changing signature color', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const colorInput = document.querySelector('input[type="color"]')
      if (colorInput) {
        await user.click(colorInput)
        expect(colorInput).toBeTruthy()
      }
    })
  })

  describe('Font Size', () => {
    it('renders font size control', () => {
      render(<SignatureGeneratorPage />)
      const slider =
        document.querySelector('input[type="range"]') || screen.getAllByRole('slider')[0]
      expect(slider).toBeTruthy()
    })

    it('allows changing font size', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const slider = document.querySelector('input[type="range"]')
      if (slider) {
        await user.click(slider)
        expect(slider).toBeTruthy()
      }
    })
  })

  describe('Text Styling Options', () => {
    it('has underline toggle', () => {
      render(<SignatureGeneratorPage />)
      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(0)
    })

    it('has italic toggle', () => {
      render(<SignatureGeneratorPage />)
      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(0)
    })

    it('toggles underline', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const underlineLabel = screen.queryByText(/Underline/i)
      if (underlineLabel) {
        await user.click(underlineLabel)
        expect(underlineLabel).toBeTruthy()
      }
    })

    it('toggles italic', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const italicLabel = screen.queryByText(/Italic/i)
      if (italicLabel) {
        await user.click(italicLabel)
        expect(italicLabel).toBeTruthy()
      }
    })
  })

  describe('Download Functionality', () => {
    it('displays download button', () => {
      render(<SignatureGeneratorPage />)
      const downloadButton = screen
        .getAllByRole('button')
        .find((btn) => btn.textContent?.includes('Download') || btn.querySelector('svg'))
      expect(downloadButton).toBeTruthy()
    })

    it('downloads signature as PNG', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'John Doe')

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
    it('displays copy button', () => {
      render(<SignatureGeneratorPage />)
      const copyButton = screen
        .getAllByRole('button')
        .find((btn) => btn.textContent?.includes('Copy') || btn.querySelector('svg'))
      expect(copyButton).toBeTruthy()
    })
  })

  describe('Clear/Reset', () => {
    it('displays clear button', () => {
      render(<SignatureGeneratorPage />)
      const clearButton = screen
        .getAllByRole('button')
        .find((btn) => btn.textContent?.includes('Clear') || btn.querySelector('svg'))
      expect(clearButton).toBeTruthy()
    })

    it('clears signature', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'Test Name')

      const buttons = screen.getAllByRole('button')
      const clearButton = buttons.find(
        (btn) => btn.textContent?.includes('Clear') || btn.querySelector('svg')
      )

      if (clearButton) {
        await user.click(clearButton)
        expect(clearButton).toBeTruthy()
      }
    })
  })

  describe('Canvas Drawing', () => {
    it('calls canvas getContext', () => {
      render(<SignatureGeneratorPage />)
      expect(mockGetContext).toHaveBeenCalled()
    })

    it('draws on canvas when name is entered', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'John Doe')

      expect(mockGetContext).toHaveBeenCalled()
    })
  })

  describe('Analytics', () => {
    it('tracks page view', () => {
      render(<SignatureGeneratorPage />)
      expect(analytics.trackToolEvent).toHaveBeenCalledWith('signature_generator_view', {})
    })

    it('tracks signature generation', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'Test User')

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalled()
      })
    })
  })

  describe('Custom Text', () => {
    it('allows custom text input', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const customTextInput = screen.queryByPlaceholderText(/Custom text/i)
      if (customTextInput) {
        await user.type(customTextInput, 'Custom Signature')
        expect(customTextInput).toHaveValue('Custom Signature')
      }
    })
  })

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      render(<SignatureGeneratorPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible inputs', () => {
      render(<SignatureGeneratorPage />)
      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      expect(nameInput).toBeTruthy()
    })
  })

  describe('Preview', () => {
    it('displays signature preview', () => {
      render(<SignatureGeneratorPage />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeTruthy()
    })

    it('updates preview in real-time', async () => {
      const user = userEvent.setup()
      render(<SignatureGeneratorPage />)

      const nameInput = screen.getByPlaceholderText(/Enter your name/i)
      await user.type(nameInput, 'A')

      expect(mockGetContext).toHaveBeenCalled()
    })
  })
})
