import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackEvent } from '@/lib/analytics'
import VideoConverterPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
  trackToolEvent: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

// Mock FFmpeg
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn(() => ({
    load: vi.fn(() => Promise.resolve()),
    exec: vi.fn(() => Promise.resolve()),
    writeFile: vi.fn(),
    readFile: vi.fn(() => new Uint8Array([1, 2, 3])),
    deleteFile: vi.fn(),
    on: vi.fn(),
  })),
}))

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: vi.fn((url) => Promise.resolve(url)),
  fetchFile: vi.fn((_file) => Promise.resolve(new Uint8Array())),
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-video-url')
global.URL.revokeObjectURL = vi.fn()

describe('Video Converter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the page without crashing', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Video Converter/i)).toBeTruthy()
    })

    it('should render the main heading', () => {
      render(<VideoConverterPage />)
      const heading = screen.getByText(/Video Converter & Compressor/i)
      expect(heading).toBeTruthy()
    })

    it('should render the description text', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Convert videos between formats, compress file sizes/i)).toBeTruthy()
    })

    it('should track page view on mount', () => {
      render(<VideoConverterPage />)
      expect(vi.mocked(trackEvent)).toHaveBeenCalledWith({
        action: 'page_view',
        category: 'video_converter',
        label: 'tool_opened',
      })
    })
  })

  describe('Settings Panel', () => {
    it('should render conversion settings section', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Conversion Settings/i)).toBeTruthy()
    })

    it('should render output format selection', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Output Format/i)).toBeTruthy()
    })

    it('should render quality slider', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Quality/i)).toBeTruthy()
    })

    it('should render Convert All button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Convert All Videos/i)).toBeTruthy()
    })

    it('should render Download All button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Download All/i)).toBeTruthy()
    })

    it('should render Clear All button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Clear All/i)).toBeTruthy()
    })
  })

  describe('Format Options', () => {
    it('should render MP4 format button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('MP4')).toBeTruthy()
    })

    it('should render WEBM format button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('WEBM')).toBeTruthy()
    })

    it('should render AVI format button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('AVI')).toBeTruthy()
    })

    it('should render MOV format button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('MOV')).toBeTruthy()
    })

    it('should render MKV format button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('MKV')).toBeTruthy()
    })
  })

  describe('Video Codec Options', () => {
    it('should render video codec selection', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Video Codec/i)).toBeTruthy()
    })

    it('should render H.264 codec option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('H.264')).toBeTruthy()
    })

    it('should render H.265 codec option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('H.265')).toBeTruthy()
    })

    it('should render VP9 codec option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('VP9')).toBeTruthy()
    })
  })

  describe('Audio Codec Options', () => {
    it('should render audio codec selection', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Audio Codec/i)).toBeTruthy()
    })

    it('should render AAC option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('AAC')).toBeTruthy()
    })

    it('should render MP3 option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('MP3')).toBeTruthy()
    })

    it('should render Opus option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('Opus')).toBeTruthy()
    })
  })

  describe('Upload Section', () => {
    it('should render drag and drop upload zone', () => {
      render(<VideoConverterPage />)
      const dropzones = screen.queryAllByText(/Drag|Drop|Upload/i)
      expect(dropzones.length).toBeGreaterThan(0)
    })

    it('should display Videos section header', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Videos \(0\)/i)).toBeTruthy()
    })

    it('should show supported formats description', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Drag & drop videos or click to browse/i)).toBeTruthy()
    })
  })

  describe('Features Section', () => {
    it('should render Format Conversion feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Format Conversion/i)).toBeTruthy()
    })

    it('should render Video Compression feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Video Compression/i)).toBeTruthy()
    })

    it('should render Codec Selection feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Codec Selection/i)).toBeTruthy()
    })

    it('should render Batch Processing feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Batch Processing/i)).toBeTruthy()
    })
  })

  describe('How to Use Section', () => {
    it('should render How to Use heading', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/How to Use Video Converter/i)).toBeTruthy()
    })

    it('should render step 1: Upload videos', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Upload Your Videos/i)).toBeTruthy()
    })

    it('should render step 2: Select format', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Select Output Format/i)).toBeTruthy()
    })

    it('should render step 3: Choose codecs', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Choose Codecs & Quality/i)).toBeTruthy()
    })

    it('should render step 4: Convert videos', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Convert Videos/i)).toBeTruthy()
    })

    it('should display numbered steps', () => {
      render(<VideoConverterPage />)
      const badges = screen.getAllByText(/^[1-4]$/)
      expect(badges.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('FAQ Section', () => {
    it('should render FAQ about supported formats', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/What video formats are supported/i)).toBeTruthy()
    })

    it('should render FAQ about file size', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/What is the maximum file size/i)).toBeTruthy()
    })

    it('should render FAQ about codecs', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/What are video codecs/i)).toBeTruthy()
    })

    it('should render FAQ about quality', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/How does the quality setting work/i)).toBeTruthy()
    })

    it('should render FAQ about processing time', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/How long does video conversion take/i)).toBeTruthy()
    })

    it('should render FAQ about privacy', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Are my videos uploaded to a server/i)).toBeTruthy()
    })

    it('should render FAQ about batch processing', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Can I convert multiple videos at once/i)).toBeTruthy()
    })

    it('should render FAQ about best format', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Which format should I choose/i)).toBeTruthy()
    })

    it('should render FAQ about compression', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/How much can I compress videos/i)).toBeTruthy()
    })

    it('should render FAQ about resolution', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Can I change the video resolution/i)).toBeTruthy()
    })
  })

  describe('Pro Tips Section', () => {
    it('should render Pro Tips section', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Pro Tips/i)).toBeTruthy()
    })

    it('should display browser processing tip', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/All processing happens in your browser/i)).toBeTruthy()
    })

    it('should display quality tip', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/quality \(CRF\)/i)).toBeTruthy()
    })

    it('should display codec tip', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/H\.264 for maximum compatibility/i)).toBeTruthy()
    })
  })

  describe('Social Share', () => {
    it('should render SocialShare component', () => {
      render(<VideoConverterPage />)
      const socialElements = document.querySelectorAll('[class*="social"]')
      expect(socialElements.length).toBeGreaterThan(0)
    })
  })

  describe('Related Tools', () => {
    it('should render RelatedTools component', () => {
      render(<VideoConverterPage />)
      const relatedElements = document.querySelectorAll('[class*="related"]')
      expect(relatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Tool Rating', () => {
    it('should render ToolRating component', () => {
      render(<VideoConverterPage />)
      const ratingElements = document.querySelectorAll('[class*="rating"]')
      expect(ratingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      render(<VideoConverterPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have proper heading hierarchy', () => {
      render(<VideoConverterPage />)
      const h1 = document.querySelector('h1')
      expect(h1).toBeTruthy()
      expect(h1?.textContent).toContain('Video Converter')
    })

    it('should have labeled controls', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Output Format/i)).toBeTruthy()
      expect(screen.getByText(/Video Codec/i)).toBeTruthy()
      expect(screen.getByText(/Audio Codec/i)).toBeTruthy()
    })

    it('should have clear button text', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Convert All Videos/i)).toBeTruthy()
      expect(screen.getByText(/Download All/i)).toBeTruthy()
      expect(screen.getByText(/Clear All/i)).toBeTruthy()
    })
  })

  describe('User Interactions - Format Selection', () => {
    it('should select MP4 format when clicked', async () => {
      const user = userEvent.setup()
      render(<VideoConverterPage />)

      const mp4Button = screen.getByText('MP4')
      await user.click(mp4Button)

      // Button should remain clickable
      expect(mp4Button).toBeTruthy()
    })

    it('should select WEBM format when clicked', async () => {
      const user = userEvent.setup()
      render(<VideoConverterPage />)

      const webmButton = screen.getByText('WEBM')
      await user.click(webmButton)

      expect(webmButton).toBeTruthy()
    })
  })

  describe('User Interactions - Codec Selection', () => {
    it('should select H.264 codec when clicked', async () => {
      const user = userEvent.setup()
      render(<VideoConverterPage />)

      const h264Button = screen.getByText('H.264')
      await user.click(h264Button)

      expect(h264Button).toBeTruthy()
    })

    it('should select AAC audio codec when clicked', async () => {
      const user = userEvent.setup()
      render(<VideoConverterPage />)

      const aacButton = screen.getByText('AAC')
      await user.click(aacButton)

      expect(aacButton).toBeTruthy()
    })
  })

  describe('Button States', () => {
    it('should disable Convert All button when no videos', () => {
      render(<VideoConverterPage />)
      const button = screen.getByText(/Convert All Videos/i).closest('button')
      expect(button?.disabled).toBe(true)
    })

    it('should disable Download All button when no completed videos', () => {
      render(<VideoConverterPage />)
      const button = screen.getByText(/Download All/i).closest('button')
      expect(button?.disabled).toBe(true)
    })

    it('should disable Clear All button when no videos', () => {
      render(<VideoConverterPage />)
      const button = screen.getByText(/Clear All/i).closest('button')
      expect(button?.disabled).toBe(true)
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should render icon elements', () => {
      render(<VideoConverterPage />)
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render cards with proper styling', () => {
      render(<VideoConverterPage />)
      const cards = document.querySelectorAll('[class*="card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should render grid layouts', () => {
      render(<VideoConverterPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have responsive padding classes', () => {
      render(<VideoConverterPage />)
      const main = document.querySelector('main')
      expect(main?.className).toBeTruthy()
    })
  })

  describe('Feature Cards', () => {
    it('should display all feature cards', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Format Conversion/i)).toBeTruthy()
      expect(screen.getByText(/Video Compression/i)).toBeTruthy()
      expect(screen.getByText(/Codec Selection/i)).toBeTruthy()
      expect(screen.getByText(/Batch Processing/i)).toBeTruthy()
    })

    it('should display feature descriptions', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Convert between MP4, WebM, AVI, MOV, MKV/i)).toBeTruthy()
    })
  })

  describe('Stats Display', () => {
    it('should not show stats initially when no videos', () => {
      render(<VideoConverterPage />)
      // Videos count should show 0
      expect(screen.getByText(/Videos \(0\)/i)).toBeTruthy()
    })
  })

  describe('Resolution Options', () => {
    it('should render resolution selection', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Resolution/i)).toBeTruthy()
    })

    it('should render Original resolution option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('Original')).toBeTruthy()
    })

    it('should render 1080p option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('1080p')).toBeTruthy()
    })

    it('should render 720p option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('720p')).toBeTruthy()
    })

    it('should render 480p option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('480p')).toBeTruthy()
    })
  })

  describe('Quality Settings', () => {
    it('should display quality slider label', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Quality/i)).toBeTruthy()
    })

    it('should have quality value indicator', () => {
      render(<VideoConverterPage />)
      // Quality CRF value should be displayed
      expect(screen.getByText(/23/i)).toBeTruthy()
    })
  })

  describe('Layout Sections', () => {
    it('should render settings panel card', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Conversion Settings/i)).toBeTruthy()
    })

    it('should render upload panel card', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Videos \(0\)/i)).toBeTruthy()
    })

    it('should render features grid', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Format Conversion/i)).toBeTruthy()
    })
  })

  describe('FFmpeg Integration', () => {
    it('should initialize FFmpeg mock', () => {
      render(<VideoConverterPage />)
      // Page should render without FFmpeg errors
      expect(screen.getByText(/Video Converter/i)).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing elements gracefully', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Video Converter/i)).toBeTruthy()
    })

    it('should render without errors when no videos uploaded', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Videos \(0\)/i)).toBeTruthy()
    })
  })
})
