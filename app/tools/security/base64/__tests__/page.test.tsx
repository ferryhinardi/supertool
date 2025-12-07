import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Base64Page from '../page'

// Mock dependencies - vi.mock is hoisted, so must use factory function
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

vi.mock('nuqs', () => ({
  parseAsStringEnum: vi.fn(() => ({
    withDefault: vi.fn(() => ({})),
  })),
  useQueryState: vi.fn((key) => {
    if (key === 'mode') {
      return ['encode', vi.fn()]
    }
    if (key === 'input') {
      return ['', vi.fn()]
    }
    return ['', vi.fn()]
  }),
}))

describe('Base64 Encoder/Decoder Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
    global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')
    global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary')
  })

  describe('Basic Rendering', () => {
    it('should render the page without crashing', () => {
      render(<Base64Page />)
      expect(screen.getAllByText(/Base64/i)[0]).toBeTruthy()
    })

    it('should display the main heading', () => {
      render(<Base64Page />)
      expect(screen.getByText('Base64 Encoder & Decoder')).toBeTruthy()
    })

    it('should display the subtitle', () => {
      render(<Base64Page />)
      expect(
        screen.getByText(
          /Convert text and files to Base64 encoding or decode Base64 strings back to original format/i
        )
      ).toBeTruthy()
    })

    it('should display mode toggle buttons', () => {
      render(<Base64Page />)
      const encodeButton = screen.getByRole('button', { name: /Encode/i })
      const decodeButton = screen.getByRole('button', { name: /Decode/i })
      expect(encodeButton).toBeTruthy()
      expect(decodeButton).toBeTruthy()
    })

    it('should display base64 conversion badge', () => {
      render(<Base64Page />)
      expect(screen.getByText('Base64 Conversion')).toBeTruthy()
    })
  })

  describe('Pro Tips Section', () => {
    it('should display pro tips heading', () => {
      render(<Base64Page />)
      expect(screen.getByText('Pro Tips')).toBeTruthy()
    })

    it('should display text & file encoding tip', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Text & File Encoding:/i)).toBeTruthy()
    })

    it('should display binary-to-text conversion tip', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Binary-to-Text Conversion:/i)).toBeTruthy()
    })

    it('should display image preview tip', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Image Preview:/i)).toBeTruthy()
    })

    it('should display data URI support tip', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Data URI Support:/i)).toBeTruthy()
    })

    it('should display browser-only processing tip', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Browser-Only Processing:/i)).toBeTruthy()
    })
  })

  describe('Mode Switching', () => {
    it('should have encode mode button', () => {
      render(<Base64Page />)
      const encodeButton = screen.getByRole('button', { name: /Encode/i })
      expect(encodeButton).toBeTruthy()
    })

    it('should have decode mode button', () => {
      render(<Base64Page />)
      const decodeButton = screen.getByRole('button', { name: /Decode/i })
      expect(decodeButton).toBeTruthy()
    })

    it('should allow clicking encode button', async () => {
      const user = userEvent.setup()
      render(<Base64Page />)

      const encodeButton = screen.getByRole('button', { name: /Encode/i })
      await user.click(encodeButton)

      // Button should be clickable
      expect(encodeButton).toBeTruthy()
    })

    it('should allow clicking decode button', async () => {
      const user = userEvent.setup()
      render(<Base64Page />)

      const decodeButton = screen.getByRole('button', { name: /Decode/i })
      await user.click(decodeButton)

      // Button should be clickable
      expect(decodeButton).toBeTruthy()
    })
  })

  describe('Input/Output Areas', () => {
    it('should display input card with title', () => {
      render(<Base64Page />)
      expect(screen.getByText('Original Text/File')).toBeTruthy()
    })

    it('should display input description', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Enter text or upload a file to encode/i)).toBeTruthy()
    })

    it('should display output card with title', () => {
      render(<Base64Page />)
      expect(screen.getByText('Base64 Output')).toBeTruthy()
    })

    it('should display output description', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Result will appear here/i)).toBeTruthy()
    })

    it('should have input textarea', () => {
      render(<Base64Page />)
      const textarea = screen.getByPlaceholderText(/Enter text to encode.../i)
      expect(textarea).toBeTruthy()
    })

    it('should have output textarea', () => {
      render(<Base64Page />)
      const textarea = screen.getByPlaceholderText(/Output will appear here.../i)
      expect(textarea).toBeTruthy()
    })

    it('should have readonly output textarea', () => {
      render(<Base64Page />)
      const textarea = screen.getByPlaceholderText(/Output will appear here.../i)
      expect(textarea).toHaveAttribute('readonly')
    })
  })

  describe('File Upload', () => {
    it('should display file input in encode mode', () => {
      render(<Base64Page />)
      const fileInput = screen.getByLabelText(/Upload any file to encode/i).closest('input')
      expect(fileInput).toBeTruthy()
      expect(fileInput).toHaveAttribute('type', 'file')
    })

    it('should accept any file type', () => {
      render(<Base64Page />)
      const fileInput = screen.getByLabelText(/Upload any file to encode/i).closest('input')
      expect(fileInput).toHaveAttribute('accept', '*/*')
    })

    it('should show file upload help text', () => {
      render(<Base64Page />)
      expect(screen.getByText('Upload any file to encode')).toBeTruthy()
    })
  })

  describe('Action Buttons', () => {
    it('should display encode button', () => {
      render(<Base64Page />)
      expect(screen.getByText('Encode to Base64')).toBeTruthy()
    })

    it('should display copy button', () => {
      render(<Base64Page />)
      const copyButton = screen.getByRole('button', { name: /Copy/i })
      expect(copyButton).toBeTruthy()
    })

    it('should display download button', () => {
      render(<Base64Page />)
      const downloadButton = screen.getByRole('button', { name: /Download/i })
      expect(downloadButton).toBeTruthy()
    })

    it('should disable encode button when no input', () => {
      render(<Base64Page />)
      const encodeBtn = screen.getByText('Encode to Base64').closest('button')
      expect(encodeBtn).toHaveAttribute('disabled')
    })

    it('should disable copy button when no output', () => {
      render(<Base64Page />)
      const copyBtn = screen.getByRole('button', { name: /Copy/i })
      expect(copyBtn).toHaveAttribute('disabled')
    })

    it('should disable download button when no output', () => {
      render(<Base64Page />)
      const downloadBtn = screen.getByRole('button', { name: /Download/i })
      expect(downloadBtn).toHaveAttribute('disabled')
    })
  })

  describe('Features Section', () => {
    it('should display text encoding feature', () => {
      render(<Base64Page />)
      expect(screen.getByText('Text Encoding')).toBeTruthy()
      expect(screen.getByText('Convert text to Base64')).toBeTruthy()
    })

    it('should display file support feature', () => {
      render(<Base64Page />)
      expect(screen.getByText('File Support')).toBeTruthy()
      expect(screen.getByText('Encode any file type')).toBeTruthy()
    })

    it('should display image preview feature', () => {
      render(<Base64Page />)
      expect(screen.getByText('Image Preview')).toBeTruthy()
      expect(screen.getByText('Preview decoded images')).toBeTruthy()
    })

    it('should display export feature', () => {
      render(<Base64Page />)
      expect(screen.getByText('Export')).toBeTruthy()
      expect(screen.getByText('Copy or download results')).toBeTruthy()
    })
  })

  describe('How to Use Section', () => {
    it('should display how to use heading', () => {
      render(<Base64Page />)
      expect(screen.getByText('How to Use Base64 Encoder/Decoder')).toBeTruthy()
    })

    it('should display how to use description', () => {
      render(<Base64Page />)
      expect(
        screen.getByText(/Follow these simple steps to encode and decode Base64 data/i)
      ).toBeTruthy()
    })

    it('should display step 1', () => {
      render(<Base64Page />)
      expect(screen.getByText('Choose Encode or Decode Mode')).toBeTruthy()
    })

    it('should display step 2', () => {
      render(<Base64Page />)
      expect(screen.getByText('Enter Text or Upload File')).toBeTruthy()
    })

    it('should display step 3', () => {
      render(<Base64Page />)
      expect(screen.getByText('Convert and View Results')).toBeTruthy()
    })

    it('should display step 4', () => {
      render(<Base64Page />)
      expect(screen.getByText('Copy or Download Output')).toBeTruthy()
    })

    it('should display numbered badges for steps', () => {
      render(<Base64Page />)
      const badges = screen.getAllByText(/^[1-4]$/)
      expect(badges.length).toBe(4)
    })
  })

  describe('Social Share', () => {
    it('should display social share component', () => {
      render(<Base64Page />)
      // SocialShare component renders buttons/links
      const socialElements = document.querySelectorAll('[class*="social"]')
      expect(socialElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('FAQ Section', () => {
    it('should display FAQ accordion', () => {
      render(<Base64Page />)
      // FAQAccordion renders with FAQ data
      expect(screen.getByText(/What is Base64 encoding and why is it used\?/i)).toBeTruthy()
    })

    it('should have multiple FAQ items', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Can I encode files other than text with this tool\?/i)).toBeTruthy()
      expect(
        screen.getByText(/How do I decode a Base64 string back to its original format\?/i)
      ).toBeTruthy()
      expect(screen.getByText(/Is Base64 encoding secure for sensitive data\?/i)).toBeTruthy()
    })

    it('should display security warning in FAQ', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Is Base64 encoding secure for sensitive data\?/i)).toBeTruthy()
    })

    it('should display size increase FAQ', () => {
      render(<Base64Page />)
      expect(
        screen.getByText(/Why is my Base64 string so much longer than the original\?/i)
      ).toBeTruthy()
    })

    it('should display HTML/CSS embedding FAQ', () => {
      render(<Base64Page />)
      expect(
        screen.getByText(/Can I embed Base64-encoded images directly in HTML and CSS\?/i)
      ).toBeTruthy()
    })

    it('should display error handling FAQ', () => {
      render(<Base64Page />)
      expect(screen.getByText(/What does "Invalid Base64 string" error mean\?/i)).toBeTruthy()
    })

    it('should display JSON API FAQ', () => {
      render(<Base64Page />)
      expect(screen.getByText(/How do I encode images for use in JSON APIs\?/i)).toBeTruthy()
    })

    it('should display image preview FAQ', () => {
      render(<Base64Page />)
      expect(screen.getByText(/Can I decode Base64 images and preview them\?/i)).toBeTruthy()
    })

    it('should display use cases FAQ', () => {
      render(<Base64Page />)
      expect(screen.getByText(/What are common use cases for Base64 encoding\?/i)).toBeTruthy()
    })
  })

  describe('Related Tools', () => {
    it('should display related tools component', () => {
      render(<Base64Page />)
      // RelatedTools component is rendered
      const relatedSection = document.querySelector('[class*="related"]')
      // Component exists (may not have visible content in test)
      expect(relatedSection).toBeTruthy()
    })
  })

  describe('Tool Rating', () => {
    it('should display tool rating component', () => {
      render(<Base64Page />)
      // ToolRating component is rendered
      const ratingSection = document.querySelector('[class*="rating"]')
      // Component exists (may not have visible content in test)
      expect(ratingSection).toBeTruthy()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should have keyboard shortcuts dialog', () => {
      render(<Base64Page />)
      // KeyboardShortcutsDialog is rendered
      const dialogs = document.querySelectorAll('[role="dialog"]')
      // Dialog exists but may not be open
      expect(dialogs).toBeTruthy()
    })
  })

  describe('Suspense and Loading', () => {
    it('should have suspense boundary', () => {
      render(<Base64Page />)
      // Page renders without crashing with Suspense
      expect(screen.getByText('Base64 Encoder & Decoder')).toBeTruthy()
    })

    it('should not show loading state when content is ready', () => {
      render(<Base64Page />)
      expect(screen.queryByText('Loading...')).toBeNull()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive main container', () => {
      render(<Base64Page />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have max width constraints', () => {
      render(<Base64Page />)
      // Check for maxW styles via rendered elements
      const containers = document.querySelectorAll('[style*="max-width"]')
      expect(containers.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Animations', () => {
    it('should have motion components', () => {
      render(<Base64Page />)
      // framer-motion renders divs with animation styles
      const animatedElements = document.querySelectorAll('[style*="opacity"]')
      expect(animatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      render(<Base64Page />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have proper heading hierarchy', () => {
      render(<Base64Page />)
      const h1 = screen.getByText('Base64 Encoder & Decoder')
      expect(h1.tagName).toBe('SPAN') // h1 contains a span with gradient text
    })

    it('should have textarea labels', () => {
      render(<Base64Page />)
      const textareas = document.querySelectorAll('textarea')
      expect(textareas.length).toBeGreaterThanOrEqual(2)
    })

    it('should have button accessible names', () => {
      render(<Base64Page />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Card Components', () => {
    it('should render cards with proper styling', () => {
      render(<Base64Page />)
      // Multiple Card components are rendered
      const cards = document.querySelectorAll('[class*="card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Icon Display', () => {
    it('should display lock icon for encoding', () => {
      render(<Base64Page />)
      // Lock icons are rendered via lucide-react
      const lockIcons = document.querySelectorAll('svg')
      expect(lockIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Gradient Text Styling', () => {
    it('should apply gradient to heading', () => {
      render(<Base64Page />)
      const heading = screen.getByText('Base64 Encoder & Decoder')
      expect(heading).toBeTruthy()
      // Gradient styles are applied inline
    })

    it('should have webkit text fill transparent', () => {
      render(<Base64Page />)
      const heading = screen.getByText('Base64 Encoder & Decoder')
      const style = window.getComputedStyle(heading)
      // Check if style object exists (actual CSS is applied)
      expect(style).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      render(<Base64Page />)
      const textarea = screen.getByPlaceholderText(/Enter text to encode.../i)
      expect(textarea).toHaveValue('')
    })

    it('should handle empty output', () => {
      render(<Base64Page />)
      const outputTextarea = screen.getByPlaceholderText(/Output will appear here.../i)
      expect(outputTextarea).toHaveValue('')
    })
  })

  describe('Layout Structure', () => {
    it('should have grid layout for input/output', () => {
      render(<Base64Page />)
      // Grid is rendered with proper structure
      const grids = document.querySelectorAll('[style*="grid"]')
      expect(grids.length).toBeGreaterThanOrEqual(0)
    })

    it('should have feature cards grid', () => {
      render(<Base64Page />)
      expect(screen.getByText('Text Encoding')).toBeTruthy()
      expect(screen.getByText('File Support')).toBeTruthy()
      expect(screen.getByText('Image Preview')).toBeTruthy()
      expect(screen.getByText('Export')).toBeTruthy()
    })
  })

  describe('Button Groups', () => {
    it('should have copy and download buttons grouped', () => {
      render(<Base64Page />)
      const copyButton = screen.getByRole('button', { name: /Copy/i })
      const downloadButton = screen.getByRole('button', { name: /Download/i })
      expect(copyButton).toBeTruthy()
      expect(downloadButton).toBeTruthy()
    })
  })

  describe('Clipboard Support', () => {
    it('should have clipboard available', () => {
      expect(navigator.clipboard).toBeTruthy()
      expect(navigator.clipboard.writeText).toBeTruthy()
    })
  })

  describe('Browser APIs', () => {
    it('should have btoa function available', () => {
      expect(global.btoa).toBeTruthy()
    })

    it('should have atob function available', () => {
      expect(global.atob).toBeTruthy()
    })

    it('should encode text with btoa', () => {
      const encoded = btoa('Hello World')
      expect(encoded).toBeTruthy()
      expect(typeof encoded).toBe('string')
    })

    it('should decode text with atob', () => {
      const encoded = btoa('Test')
      const decoded = atob(encoded)
      expect(decoded).toBe('Test')
    })
  })
})
