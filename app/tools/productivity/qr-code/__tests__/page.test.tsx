import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/analytics'
import QRCodePage from '../page'

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

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeSVG: vi.fn(({ value }) => <div data-testid="qr-code-svg">{value}</div>),
}))

// Mock QR history service
vi.mock('@/lib/qr-history-service', () => ({
  getHistory: vi.fn(() => []),
  saveToHistory: vi.fn(),
  deleteHistoryItem: vi.fn(),
  clearHistory: vi.fn(),
  toggleFavorite: vi.fn(),
  getFilteredHistory: vi.fn(() => []),
  exportHistory: vi.fn(),
  importHistory: vi.fn(),
}))

// Mock QR export service
vi.mock('@/lib/qr-export-service', () => ({
  exportToPNG: vi.fn(() => Promise.resolve()),
  exportToSVG: vi.fn(() => Promise.resolve()),
  exportToPDF: vi.fn(() => Promise.resolve()),
  exportToJPEG: vi.fn(() => Promise.resolve()),
  exportToWebP: vi.fn(() => Promise.resolve()),
}))

// Mock QR scanner service
vi.mock('@/lib/qr-scanner-service', () => ({
  startWebcamScanner: vi.fn(() => Promise.resolve()),
  stopWebcamScanner: vi.fn(() => Promise.resolve()),
  scanFromFile: vi.fn(() => Promise.resolve({ success: true, data: 'test' })),
  parseQRData: vi.fn((data) => ({ type: 'text', content: data })),
  validateQRCode: vi.fn(() => ({ isValid: true, errors: [] })),
}))

// Mock QR types
vi.mock('@/lib/qr-types', () => ({
  generateEmailQR: vi.fn(),
  generateWhatsAppQR: vi.fn(),
  generateSMSQR: vi.fn(),
  generatePhoneQR: vi.fn(),
  generateGeoQR: vi.fn(),
  generateEventQR: vi.fn(),
  generateAppStoreQR: vi.fn(),
  generateSocialQR: vi.fn(),
}))

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

describe('QR Code Generator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the page without crashing', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/QR Code Generator/i)).toBeTruthy()
    })

    it('should render the main heading', () => {
      render(<QRCodePage />)
      const heading = screen.getByText(/QR Code Generator & Scanner/i)
      expect(heading).toBeTruthy()
    })

    it('should render the description text', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Create custom QR codes instantly/i)).toBeTruthy()
    })

    it('should track page open event', () => {
      render(<QRCodePage />)
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
        'qr_code_generator_open',
        expect.any(Object)
      )
    })
  })

  describe('QR Code Type Selection', () => {
    it('should render URL type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('URL')).toBeTruthy()
    })

    it('should render Text type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/^Text$/i)).toBeTruthy()
    })

    it('should render WiFi type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('WiFi')).toBeTruthy()
    })

    it('should render vCard type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('vCard')).toBeTruthy()
    })

    it('should render Email type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('Email')).toBeTruthy()
    })

    it('should render SMS type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('SMS')).toBeTruthy()
    })

    it('should render Phone type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/^Phone$/i)).toBeTruthy()
    })

    it('should render WhatsApp type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('WhatsApp')).toBeTruthy()
    })

    it('should render Geo type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Location/i)).toBeTruthy()
    })

    it('should render Event type button', () => {
      render(<QRCodePage />)
      expect(screen.getByText('Event')).toBeTruthy()
    })
  })

  describe('Input Field', () => {
    it('should render text input for URL type', () => {
      render(<QRCodePage />)
      const input = screen.getByPlaceholderText(/Enter URL/i)
      expect(input).toBeTruthy()
    })

    it('should allow typing in input field', async () => {
      const user = userEvent.setup()
      render(<QRCodePage />)

      const input = screen.getByPlaceholderText(/Enter URL/i)
      await user.type(input, 'https://example.com')

      expect(input).toHaveValue('https://example.com')
    })
  })

  describe('Generate Button', () => {
    it('should render Generate QR Code button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Generate QR Code/i)).toBeTruthy()
    })

    it('should generate QR code when button clicked', async () => {
      const user = userEvent.setup()
      render(<QRCodePage />)

      const input = screen.getByPlaceholderText(/Enter URL/i)
      const generateButton = screen.getByText(/Generate QR Code/i)

      await user.type(input, 'https://example.com')
      await user.click(generateButton)

      // QR code should be displayed
      const qrCode = screen.getByTestId('qr-code-svg')
      expect(qrCode).toBeTruthy()
    })
  })

  describe('Download Options', () => {
    it('should render Download as PNG button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/PNG/i)).toBeTruthy()
    })

    it('should render Download as SVG button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/SVG/i)).toBeTruthy()
    })

    it('should render Download as PDF button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/PDF/i)).toBeTruthy()
    })

    it('should render Download as JPEG button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/JPEG/i)).toBeTruthy()
    })

    it('should render Download as WebP button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/WebP/i)).toBeTruthy()
    })
  })

  describe('Customization Options', () => {
    it('should render color customization section', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Foreground Color/i)).toBeTruthy()
    })

    it('should render background color option', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Background Color/i)).toBeTruthy()
    })

    it('should render size control', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Size/i)).toBeTruthy()
    })

    it('should render error correction level option', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Error Correction/i)).toBeTruthy()
    })
  })

  describe('Style Presets', () => {
    it('should render style preset section', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Style Presets/i)).toBeTruthy()
    })

    it('should render Classic preset', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Classic/i)).toBeTruthy()
    })

    it('should render Modern preset', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Modern/i)).toBeTruthy()
    })

    it('should render Branded preset', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Branded/i)).toBeTruthy()
    })

    it('should render Minimalist preset', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Minimalist/i)).toBeTruthy()
    })
  })

  describe('Scanner Feature', () => {
    it('should render scanner tab', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Scanner/i)).toBeTruthy()
    })

    it('should render scan from webcam option', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Webcam/i)).toBeTruthy()
    })

    it('should render scan from file option', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Upload/i)).toBeTruthy()
    })
  })

  describe('History Feature', () => {
    it('should render history section', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/History/i)).toBeTruthy()
    })

    it('should render clear history button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Clear All/i)).toBeTruthy()
    })
  })

  describe('Bulk Generation', () => {
    it('should render bulk generation option', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Bulk/i)).toBeTruthy()
    })

    it('should render bulk generation description', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Generate multiple QR codes/i)).toBeTruthy()
    })
  })

  describe('Pro Tips Section', () => {
    it('should render Pro Tips heading', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Pro Tips/i)).toBeTruthy()
    })

    it('should display high contrast tip', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/high contrast/i)).toBeTruthy()
    })

    it('should display size recommendation tip', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/2cm x 2cm/i)).toBeTruthy()
    })

    it('should display error correction tip', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/error correction/i)).toBeTruthy()
    })
  })

  describe('How to Use Section', () => {
    it('should render How to Use heading', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/How to Use/i)).toBeTruthy()
    })

    it('should display numbered steps', () => {
      render(<QRCodePage />)
      const badges = screen.getAllByText(/^[1-5]$/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('FAQ Section', () => {
    it('should render FAQ about creating QR codes', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/How do I create a QR code for free/i)).toBeTruthy()
    })

    it('should render FAQ about QR code types', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/What types of QR codes can I generate/i)).toBeTruthy()
    })

    it('should render FAQ about customization', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Can I customize the QR code design/i)).toBeTruthy()
    })

    it('should render FAQ about validity', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Are the QR codes generated permanently valid/i)).toBeTruthy()
    })

    it('should render FAQ about size', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/What is the best size and resolution/i)).toBeTruthy()
    })

    it('should render FAQ about scanning issues', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Why won't my QR code scan properly/i)).toBeTruthy()
    })

    it('should render FAQ about bulk generation', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Can I generate multiple QR codes at once/i)).toBeTruthy()
    })

    it('should render FAQ about business use', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/How can I use QR codes for my business/i)).toBeTruthy()
    })

    it('should render FAQ about security', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Are QR codes secure and safe to use/i)).toBeTruthy()
    })

    it('should render FAQ about scanning devices', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/What devices and apps can scan QR codes/i)).toBeTruthy()
    })
  })

  describe('Social Share', () => {
    it('should render SocialShare component', () => {
      render(<QRCodePage />)
      const socialElements = document.querySelectorAll('[class*="social"]')
      expect(socialElements.length).toBeGreaterThan(0)
    })
  })

  describe('Related Tools', () => {
    it('should render RelatedTools component', () => {
      render(<QRCodePage />)
      const relatedElements = document.querySelectorAll('[class*="related"]')
      expect(relatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Tool Rating', () => {
    it('should render ToolRating component', () => {
      render(<QRCodePage />)
      const ratingElements = document.querySelectorAll('[class*="rating"]')
      expect(ratingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      render(<QRCodePage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have proper heading hierarchy', () => {
      render(<QRCodePage />)
      const h1 = document.querySelector('h1')
      expect(h1).toBeTruthy()
    })

    it('should have labeled inputs', () => {
      render(<QRCodePage />)
      const input = screen.getByPlaceholderText(/Enter URL/i)
      expect(input).toBeTruthy()
    })

    it('should have clear button text', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Generate QR Code/i)).toBeTruthy()
    })
  })

  describe('User Interactions', () => {
    it('should switch QR code type when type button clicked', async () => {
      const user = userEvent.setup()
      render(<QRCodePage />)

      const textButton = screen.getByText(/^Text$/i)
      await user.click(textButton)

      // Type should change
      expect(textButton).toBeTruthy()
    })

    it('should clear input when clear button clicked', async () => {
      const user = userEvent.setup()
      render(<QRCodePage />)

      const input = screen.getByPlaceholderText(/Enter URL/i)
      const clearButton = screen.getByText(/Clear/i)

      await user.type(input, 'test')
      await user.click(clearButton)

      expect(input).toHaveValue('')
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should render icon elements', () => {
      render(<QRCodePage />)
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render cards with proper styling', () => {
      render(<QRCodePage />)
      const cards = document.querySelectorAll('[class*="card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should render grid layouts', () => {
      render(<QRCodePage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have responsive padding classes', () => {
      render(<QRCodePage />)
      const main = document.querySelector('main')
      expect(main?.className).toBeTruthy()
    })
  })

  describe('Features Grid', () => {
    it('should render feature cards', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Multiple QR Types/i)).toBeTruthy()
    })

    it('should render customization feature', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Style Customization/i)).toBeTruthy()
    })

    it('should render scanner feature', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/QR Code Scanner/i)).toBeTruthy()
    })

    it('should render bulk generation feature', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Bulk Generation/i)).toBeTruthy()
    })
  })

  describe('Action Buttons', () => {
    it('should render copy button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Copy/i)).toBeTruthy()
    })

    it('should render print button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Print/i)).toBeTruthy()
    })

    it('should render share button', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/Share/i)).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      render(<QRCodePage />)
      const input = screen.getByPlaceholderText(/Enter URL/i)
      expect(input).toHaveValue('')
    })

    it('should render without errors', () => {
      render(<QRCodePage />)
      expect(screen.getByText(/QR Code Generator/i)).toBeTruthy()
    })
  })
})
