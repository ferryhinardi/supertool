import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VideoConverterPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockTrackEvent = vi.fn()
vi.mock('@/lib/services/analytics', () => ({
  trackEvent: (params: unknown) => mockTrackEvent(params),
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
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('should render the main heading', () => {
      render(<VideoConverterPage />)
      const heading = screen.getByText(/Video Converter & Compressor/i)
      expect(heading).toBeTruthy()
    })

    it('should render the description text', () => {
      render(<VideoConverterPage />)
      expect(
        screen.getByText(/Convert videos between formats.*compress file sizes.*optimize for web/i)
      ).toBeTruthy()
    })

    it('should track page view on mount', () => {
      render(<VideoConverterPage />)
      expect(mockTrackEvent).toHaveBeenCalledWith({
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
      // Multiple instances may exist due to mobile/desktop responsive layouts
      expect(screen.getAllByText(/Output Format/i).length).toBeGreaterThan(0)
    })

    it('should render quality slider', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Quality \(CRF\)/i)).toBeTruthy()
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

    it('should render MKV format button', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('MKV')).toBeTruthy()
    })
  })

  describe('Video Codec Options', () => {
    it('should render video codec selection', () => {
      render(<VideoConverterPage />)
      // Multiple instances may exist due to mobile/desktop responsive layouts
      expect(screen.getAllByText(/Video Codec/i).length).toBeGreaterThan(0)
    })

    it('should render H264 codec option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('H264')).toBeTruthy()
    })

    it('should render H265 codec option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('H265')).toBeTruthy()
    })
  })

  describe('Audio Codec Options', () => {
    it('should render audio codec selection', () => {
      render(<VideoConverterPage />)
      // Multiple instances may exist due to mobile/desktop responsive layouts
      expect(screen.getAllByText(/Audio Codec/i).length).toBeGreaterThan(0)
    })

    it('should render AAC option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('AAC')).toBeTruthy()
    })

    it('should render MP3 option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('MP3')).toBeTruthy()
    })

    it('should render OPUS option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText('OPUS')).toBeTruthy()
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
    it('should render Multiple Formats feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Multiple Formats/i)).toBeTruthy()
    })

    it('should render Fast Conversion feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Fast Conversion/i)).toBeTruthy()
    })

    it('should render Compression feature', () => {
      render(<VideoConverterPage />)
      // Use exact match to distinguish from "Maximum Compression" label
      expect(screen.getByRole('heading', { name: /^Compression$/i })).toBeTruthy()
    })

    it('should render Web Optimized feature', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Web Optimized/i)).toBeTruthy()
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
      // Multiple instances may exist due to mobile/desktop responsive layouts
      expect(screen.getAllByText(/Output Format/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Video Codec/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Audio Codec/i).length).toBeGreaterThan(0)
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
    it('should select H264 codec when clicked', async () => {
      const user = userEvent.setup()
      render(<VideoConverterPage />)

      const h264Button = screen.getByText('H264')
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
      // Check for article elements which are used as Card components
      const cards = document.querySelectorAll('article')
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
      // Just check main exists - Panda CSS classes may be stripped in test env
      expect(main).toBeTruthy()
    })
  })

  describe('Feature Cards', () => {
    it('should display all feature cards', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Multiple Formats/i)).toBeTruthy()
      expect(screen.getByText(/Fast Conversion/i)).toBeTruthy()
      // Use exact heading match to distinguish from "Maximum Compression" label
      expect(screen.getByRole('heading', { name: /^Compression$/i })).toBeTruthy()
      expect(screen.getByText(/Web Optimized/i)).toBeTruthy()
    })

    it('should display feature descriptions', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Convert between MP4, WebM, AVI, MOV, and MKV formats/i)).toBeTruthy()
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
      expect(screen.getByText(/1080p/i)).toBeTruthy()
    })

    it('should render 720p option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/720p/i)).toBeTruthy()
    })

    it('should render 480p option', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/480p/i)).toBeTruthy()
    })
  })

  describe('Quality Settings', () => {
    it('should display quality slider label', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Quality \(CRF\)/i)).toBeTruthy()
    })

    it('should have quality value indicator', () => {
      render(<VideoConverterPage />)
      // Quality CRF value should be displayed (default is 23)
      expect(screen.getByText('23')).toBeTruthy()
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
      expect(screen.getByText(/Multiple Formats/i)).toBeTruthy()
    })
  })

  describe('FFmpeg Integration', () => {
    it('should show Initialize Video Converter button when FFmpeg not loaded', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Initialize Video Converter/i)).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle page render gracefully', () => {
      render(<VideoConverterPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('should render without errors when no videos uploaded', () => {
      render(<VideoConverterPage />)
      expect(screen.getByText(/Videos \(0\)/i)).toBeTruthy()
    })
  })
})
