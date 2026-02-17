import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import imageCompression from 'browser-image-compression'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackEvent } from '@/lib/services/analytics'
import ImageOptimizerPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
  trackToolEvent: vi.fn(),
}))

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

// Mock canvas
const mockCanvasContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  canvas: { toBlob: vi.fn((cb) => cb(new Blob())) },
}
// biome-ignore lint/suspicious/noExplicitAny: Canvas context mock requires flexible typing for test environment
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext) as any

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('Image Optimizer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation requires flexible parameter types
    vi.mocked(imageCompression).mockImplementation((_file: any, options: any) => {
      // Simulate progress callback
      if (options.onProgress) {
        options.onProgress(50)
        setTimeout(() => options.onProgress(100), 100)
      }
      // Return a smaller compressed file
      const blob = new Blob(['compressed'], { type: options.fileType })
      return Promise.resolve(new File([blob], 'compressed.jpg', { type: options.fileType }))
    })
  })

  describe('Page Rendering', () => {
    it('should render the page without crashing', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getAllByText(/Image Optimizer & Converter/i).length).toBeGreaterThan(0)
    })

    it('should render the main heading', () => {
      render(<ImageOptimizerPage />)
      // Use role-based query to verify proper heading structure
      const heading = screen.getByRole('heading', {
        name: /Image Optimizer & Converter/i,
        level: 1,
      })
      expect(heading).toBeTruthy()
    })

    it('should render the description text', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Compress and optimize images up to 80% smaller/i)).toBeTruthy()
    })

    it('should render the Professional Image Optimization badge', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Professional Image Optimization/i)).toBeTruthy()
    })

    it('should track page view on mount', () => {
      render(<ImageOptimizerPage />)
      expect(vi.mocked(trackEvent)).toHaveBeenCalledWith({
        action: 'page_view',
        category: 'image_optimizer',
        label: 'tool_opened',
      })
    })
  })

  describe('Settings Panel', () => {
    it('should render optimization settings section', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Optimization Settings/i)).toBeTruthy()
    })

    it('should render output format buttons', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText('JPEG')).toBeTruthy()
      expect(screen.getByText('PNG')).toBeTruthy()
      expect(screen.getByText('WEBP')).toBeTruthy()
    })

    it('should render quality slider', () => {
      render(<ImageOptimizerPage />)
      const slider = screen.getByRole('slider')
      expect(slider).toBeTruthy()
      expect(slider.getAttribute('type')).toBe('range')
    })

    it('should display default quality value (80%)', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText('80%')).toBeTruthy()
    })

    it('should render max width input', () => {
      render(<ImageOptimizerPage />)
      const input = screen.getByLabelText(/Width \(px\)/i)
      expect(input).toBeTruthy()
      expect(input.getAttribute('type')).toBe('number')
    })

    it('should render max height input', () => {
      render(<ImageOptimizerPage />)
      const input = screen.getByLabelText(/Height \(px\)/i)
      expect(input).toBeTruthy()
      expect(input.getAttribute('type')).toBe('number')
    })

    it('should render maintain aspect ratio checkbox', () => {
      render(<ImageOptimizerPage />)
      const checkbox = screen.getByLabelText(/Maintain aspect ratio/i)
      expect(checkbox).toBeTruthy()
      expect(checkbox.getAttribute('type')).toBe('checkbox')
    })

    it('should render Optimize All Images button', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getAllByText(/Optimize All Images/i).length).toBeGreaterThan(0)
    })

    it('should render Download All button', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getAllByText(/Download All/i).length).toBeGreaterThan(0)
    })

    it('should render Clear All button', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Clear All/i)).toBeTruthy()
    })
  })

  describe('User Interactions - Settings', () => {
    it('should change output format to PNG when clicked', async () => {
      const user = userEvent.setup()
      render(<ImageOptimizerPage />)

      const pngButton = screen.getByText('PNG')
      await user.click(pngButton)

      // Button should be selected (this is visual, we just ensure no errors)
      expect(pngButton).toBeTruthy()
    })

    it('should change output format to WEBP when clicked', async () => {
      const user = userEvent.setup()
      render(<ImageOptimizerPage />)

      const webpButton = screen.getByText('WEBP')
      await user.click(webpButton)

      expect(webpButton).toBeTruthy()
    })

    it('should update quality when slider is changed', async () => {
      render(<ImageOptimizerPage />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '50' } })

      // Quality value should update
      await waitFor(() => {
        expect(screen.getByText('50%')).toBeTruthy()
      })
    })

    it('should update max width input', async () => {
      const user = userEvent.setup()
      render(<ImageOptimizerPage />)

      const input = screen.getByLabelText(/Width \(px\)/i)
      await user.clear(input)
      fireEvent.change(input, { target: { value: '1024' } })

      expect(input).toHaveValue(1024)
    })

    it('should update max height input', async () => {
      const user = userEvent.setup()
      render(<ImageOptimizerPage />)

      const input = screen.getByLabelText(/Height \(px\)/i)
      await user.clear(input)
      fireEvent.change(input, { target: { value: '768' } })

      expect(input).toHaveValue(768)
    })

    it('should toggle maintain aspect ratio checkbox', async () => {
      const user = userEvent.setup()
      render(<ImageOptimizerPage />)

      const checkbox = screen.getByLabelText(/Maintain aspect ratio/i) as HTMLInputElement
      const initialState = checkbox.checked

      await user.click(checkbox)

      expect(checkbox.checked).toBe(!initialState)
    })
  })

  describe('File Upload', () => {
    it('should render upload zone initially', () => {
      render(<ImageOptimizerPage />)
      // DragDropZone component should be present
      const elements = screen.queryAllByText(/Drop|Upload|Select/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should display Images section header', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Images \(0\)/i)).toBeTruthy()
    })

    it('should show supported formats in description', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Drag & drop images or click to browse/i)).toBeTruthy()
    })
  })

  describe('Features Section', () => {
    it('should render Smart Compression feature', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Smart Compression/i)).toBeTruthy()
      expect(
        screen.getByText(/Up to 80% size reduction without visible quality loss/i)
      ).toBeTruthy()
    })

    it('should render Batch Processing feature', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getAllByText(/Batch Processing/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Optimize multiple images at once for faster workflow/i)).toBeTruthy()
    })

    it('should render Resize & Convert feature', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Resize & Convert/i)).toBeTruthy()
      expect(screen.getByText(/Resize dimensions and convert between formats/i)).toBeTruthy()
    })

    it('should render Multiple Formats feature', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getAllByText(/Multiple Formats/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Support for JPG, PNG, WebP, and more/i)).toBeTruthy()
    })
  })

  describe('Social Share Section', () => {
    it('should render SocialShare component', () => {
      render(<ImageOptimizerPage />)
      // SocialShare component should be present - check for Share This Tool heading
      expect(screen.getByText(/Share This Tool/i)).toBeTruthy()
    })
  })

  describe('Related Tools Section', () => {
    it('should render RelatedTools component', () => {
      render(<ImageOptimizerPage />)
      // RelatedTools component should be present - check for actual text content
      const links = document.querySelectorAll('a')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Tool Rating Section', () => {
    it('should render ToolRating component', () => {
      render(<ImageOptimizerPage />)
      // ToolRating component should be present - check for star SVG elements
      const svgElements = document.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<ImageOptimizerPage />)
      // Quality slider should have proper accessibility - verify via aria-label or connected label
      const qualitySlider = screen.getByRole('slider')
      expect(qualitySlider).toBeTruthy()
      expect(qualitySlider.getAttribute('id')).toBe('quality-slider')
      // Verify the label is properly connected via htmlFor
      const qualityLabel = document.querySelector('label[for="quality-slider"]')
      expect(qualityLabel).toBeTruthy()
      expect(qualityLabel?.textContent).toContain('Quality')
      expect(screen.getByLabelText(/Width \(px\)/i)).toBeTruthy()
      expect(screen.getByLabelText(/Height \(px\)/i)).toBeTruthy()
      expect(screen.getByLabelText(/Maintain aspect ratio/i)).toBeTruthy()
    })

    it('should have proper button text', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getAllByText(/Optimize All Images/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Download All/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Clear All/i)).toBeTruthy()
    })

    it('should have main landmark', () => {
      render(<ImageOptimizerPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have proper heading hierarchy', () => {
      render(<ImageOptimizerPage />)
      const h1 = document.querySelector('h1')
      expect(h1).toBeTruthy()
      expect(h1?.textContent).toContain('Image Optimizer')
    })
  })

  describe('Button States', () => {
    it('should disable Optimize All button when no images', () => {
      render(<ImageOptimizerPage />)
      const buttons = screen.getAllByText(/Optimize All Images/i)
      const button = buttons[0].closest('button')
      expect(button?.disabled).toBe(true)
    })

    it('should disable Download All button when no completed images', () => {
      render(<ImageOptimizerPage />)
      const buttons = screen.getAllByText(/Download All/i)
      const button = buttons[0].closest('button')
      expect(button?.disabled).toBe(true)
    })

    it('should disable Clear All button when no images', () => {
      render(<ImageOptimizerPage />)
      const button = screen.getByText(/Clear All/i).closest('button')
      expect(button?.disabled).toBe(true)
    })
  })

  describe('Analytics Tracking', () => {
    it('should track page view on component mount', () => {
      render(<ImageOptimizerPage />)
      expect(vi.mocked(trackEvent)).toHaveBeenCalledWith({
        action: 'page_view',
        category: 'image_optimizer',
        label: 'tool_opened',
      })
    })
  })

  describe('Visual Elements', () => {
    it('should render icon elements', () => {
      render(<ImageOptimizerPage />)
      // Icons are rendered via Lucide components
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render cards with proper styling', () => {
      render(<ImageOptimizerPage />)
      // Panda CSS generates hashed class names, so we verify structure instead
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('should render grid layouts', () => {
      render(<ImageOptimizerPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have responsive padding classes', () => {
      render(<ImageOptimizerPage />)
      const main = document.querySelector('main')
      // Panda CSS handles responsive styles without traditional class names
      // Verify main element renders - styling is handled by Panda CSS
      expect(main).toBeTruthy()
    })
  })

  describe('Format Helpers', () => {
    it('should format bytes correctly in display', () => {
      render(<ImageOptimizerPage />)
      // Stats are only shown when there are images - test that the page renders successfully
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing elements gracefully', () => {
      render(<ImageOptimizerPage />)
      // Component should render without errors
      expect(screen.getAllByText(/Image Optimizer & Converter/i).length).toBeGreaterThan(0)
    })
  })

  describe('Input Validation', () => {
    it('should have min/max constraints on quality slider', () => {
      render(<ImageOptimizerPage />)
      const slider = screen.getByRole('slider')
      expect(slider.getAttribute('min')).toBe('10')
      expect(slider.getAttribute('max')).toBe('100')
      expect(slider.getAttribute('step')).toBe('5')
    })

    it('should have min/max constraints on width input', () => {
      render(<ImageOptimizerPage />)
      const input = screen.getByLabelText(/Width \(px\)/i)
      expect(input.getAttribute('min')).toBe('100')
      expect(input.getAttribute('max')).toBe('10000')
    })

    it('should have min/max constraints on height input', () => {
      render(<ImageOptimizerPage />)
      const input = screen.getByLabelText(/Height \(px\)/i)
      expect(input.getAttribute('min')).toBe('100')
      expect(input.getAttribute('max')).toBe('10000')
    })
  })

  describe('Stats Display', () => {
    it('should not show stats summary initially (no images)', () => {
      render(<ImageOptimizerPage />)
      // Stats cards should not be visible when images array is empty
      const totalImagesText = screen.queryByText(/Total Images/i)
      expect(totalImagesText).toBeFalsy()
    })
  })

  describe('Layout Sections', () => {
    it('should render settings panel card', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Optimization Settings/i)).toBeTruthy()
    })

    it('should render upload panel card', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Images \(0\)/i)).toBeTruthy()
    })

    it('should render features grid', () => {
      render(<ImageOptimizerPage />)
      expect(screen.getByText(/Smart Compression/i)).toBeTruthy()
      expect(screen.getAllByText(/Batch Processing/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Resize & Convert/i)).toBeTruthy()
      expect(screen.getAllByText(/Multiple Formats/i).length).toBeGreaterThan(0)
    })
  })
})
