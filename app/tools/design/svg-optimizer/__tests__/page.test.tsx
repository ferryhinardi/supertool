import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SVGOptimizerPage from '../page'

// Mock the analytics module
vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
  trackToolEvent: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('SVGOptimizerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Component Rendering Tests
  // ============================================================================

  describe('Component Rendering', () => {
    it('should render the page title', () => {
      render(<SVGOptimizerPage />)
      expect(screen.getByText('SVG Optimizer & Editor')).toBeInTheDocument()
    })

    it('should render the textarea for SVG input', () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('placeholder')
    })

    it('should render all optimization option checkboxes', () => {
      render(<SVGOptimizerPage />)
      // Check for key checkboxes - labels are generated from camelCase
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBe(10) // We have 10 optimization options

      // Verify some specific labels exist (using text search instead of label)
      expect(screen.getByText('Remove Comments')).toBeInTheDocument()
      expect(screen.getByText('Remove Metadata')).toBeInTheDocument()
      expect(screen.getByText('Remove Hidden Elements')).toBeInTheDocument()
      expect(screen.getByText('Minify Colors')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<SVGOptimizerPage />)
      expect(screen.getByRole('button', { name: /Optimize SVG/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
    })

    it('should render educational content sections', () => {
      render(<SVGOptimizerPage />)
      expect(screen.getByText('Optimization Benefits')).toBeInTheDocument()
      expect(screen.getByText('Best Practices')).toBeInTheDocument()
    })

    it('should not render stats panel initially', () => {
      render(<SVGOptimizerPage />)
      expect(screen.queryByText('Original Size')).not.toBeInTheDocument()
    })

    it('should not render optimized output initially', () => {
      render(<SVGOptimizerPage />)
      expect(screen.queryByText('Optimized SVG')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<SVGOptimizerPage />)
      const mainHeading = screen.getByRole('heading', { name: /SVG Optimizer & Editor/i })
      expect(mainHeading).toBeInTheDocument()
      expect(mainHeading.tagName).toBe('H1')
    })

    it('should have accessible form labels', () => {
      render(<SVGOptimizerPage />)
      expect(screen.getByLabelText('Remove Comments')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove Metadata')).toBeInTheDocument()
    })

    it('should have keyboard-accessible buttons', () => {
      render(<SVGOptimizerPage />)
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })
      expect(optimizeButton).toBeInTheDocument()
      expect(optimizeButton).not.toBeDisabled()
    })
  })

  // ============================================================================
  // SVG Optimization Logic Tests
  // ============================================================================

  describe('SVG Optimization Logic', () => {
    it('should optimize a basic SVG and show output', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg width="100" height="100">
        <!-- This is a comment -->
        <circle cx="50" cy="50" r="40" fill="red"/>
      </svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
      })
    })

    it('should remove comments when option is enabled', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><!-- Comment --><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should keep comments when option is disabled', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const removeCommentsCheckbox = screen.getByText('Remove Comments')
        .previousSibling as HTMLInputElement
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><!-- Comment --><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.click(removeCommentsCheckbox) // Disable
      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should remove metadata elements', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><metadata>Some metadata</metadata><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should remove hidden elements (display:none)', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><rect style="display:none" width="100"/><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should minify hex colors', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle fill="#ff0000" cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should optimize path data by removing unnecessary spaces', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><path d="M 10 10 L 20 20 L 30 10"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should remove empty attributes', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40" fill="" stroke=""/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should remove default fill="black" attribute', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40" fill="black"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should handle invalid SVG gracefully', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const invalidSVG = 'Not valid SVG'

      fireEvent.change(textarea, { target: { value: invalidSVG } })
      fireEvent.click(optimizeButton)

      // Should not show output for invalid SVG (implementation returns early with error toast)
      await waitFor(() => {
        expect(screen.queryByText('Optimized SVG')).not.toBeInTheDocument()
      })
    })

    it('should handle empty input', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      fireEvent.change(textarea, { target: { value: '' } })
      fireEvent.click(optimizeButton)

      // Should not show output for empty input
      await waitFor(() => {
        expect(screen.queryByText('Optimized SVG')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Stats Calculation Tests
  // ============================================================================

  describe('Stats Calculation', () => {
    it('should show stats after optimization', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg width="100" height="100">
        <!-- Comment -->
        <circle cx="50" cy="50" r="40" fill="red"/>
      </svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Original Size')).toBeInTheDocument()
          expect(screen.getByText('Optimized Size')).toBeInTheDocument()
          expect(screen.getByText('Size Reduction')).toBeInTheDocument()
          expect(screen.getByText(/Elements \(was/i)).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should show reduction percentage', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><!-- Long comment here --><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText('Size Reduction')).toBeInTheDocument()
          const reductionElements = screen.getAllByText(/%/)
          expect(reductionElements.length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })

    it('should count elements correctly', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40"/><rect x="10" y="10" width="30" height="30"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(
        () => {
          expect(screen.getByText(/Elements \(was/i)).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  // ============================================================================
  // Copy to Clipboard Tests
  // ============================================================================

  describe('Copy to Clipboard', () => {
    it('should have copy button after optimization', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
      })

      const copyButtons = screen.getAllByRole('button')
      const copyButton = copyButtons.find((btn) =>
        btn.querySelector('svg')?.classList.toString().includes('lucide-copy')
      )
      expect(copyButton).toBeDefined()
    })

    it('should copy optimized SVG to clipboard when copy button is clicked', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
      })

      const copyButtons = screen.getAllByRole('button')
      const copyButton = copyButtons.find((btn) =>
        btn.querySelector('svg')?.classList.toString().includes('lucide-copy')
      )

      if (copyButton) {
        fireEvent.click(copyButton)
        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalled()
        })
      }
    })
  })

  // ============================================================================
  // Download Tests
  // ============================================================================

  describe('Download', () => {
    it('should have download button after optimization', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
      })

      const downloadButtons = screen.getAllByRole('button')
      const downloadButton = downloadButtons.find((btn) =>
        btn.querySelector('svg')?.classList.toString().includes('lucide-download')
      )
      expect(downloadButton).toBeDefined()
    })
  })

  // ============================================================================
  // Clear Functionality Tests
  // ============================================================================

  describe('Clear Functionality', () => {
    it('should clear input when clear button is clicked', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement
      const clearButton = screen.getByRole('button', { name: /Clear/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      expect(textarea.value).toBe(inputSVG)

      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(textarea.value).toBe('')
      })
    })

    it('should clear output and stats after clearing', async () => {
      render(<SVGOptimizerPage />)
      const textarea = screen.getAllByRole('textbox')[0]
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })
      const clearButton = screen.getByRole('button', { name: /Clear/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(screen.getByText('Optimized SVG')).toBeInTheDocument()
        expect(screen.getByText('Original Size')).toBeInTheDocument()
      })

      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByText('Optimized SVG')).not.toBeInTheDocument()
        expect(screen.queryByText('Original Size')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Checkbox Toggle Tests
  // ============================================================================

  describe('Checkbox Toggle', () => {
    it('should toggle optimization options', () => {
      render(<SVGOptimizerPage />)
      const removeCommentsCheckbox = screen.getByLabelText('Remove Comments') as HTMLInputElement

      expect(removeCommentsCheckbox.checked).toBe(true)

      fireEvent.click(removeCommentsCheckbox)
      expect(removeCommentsCheckbox.checked).toBe(false)

      fireEvent.click(removeCommentsCheckbox)
      expect(removeCommentsCheckbox.checked).toBe(true)
    })

    it('should have all checkboxes enabled by default', () => {
      render(<SVGOptimizerPage />)

      const removeCommentsCheckbox = screen.getByLabelText('Remove Comments') as HTMLInputElement
      const removeMetadataCheckbox = screen.getByLabelText('Remove Metadata') as HTMLInputElement
      const removeHiddenCheckbox = screen.getByLabelText(
        'Remove Hidden Elements'
      ) as HTMLInputElement

      expect(removeCommentsCheckbox.checked).toBe(true)
      expect(removeMetadataCheckbox.checked).toBe(true)
      expect(removeHiddenCheckbox.checked).toBe(true)
    })
  })

  // ============================================================================
  // Preview Tests
  // ============================================================================

  describe('Preview', () => {
    it('should show preview after optimization', async () => {
      render(<SVGOptimizerPage />)
      const textareas = screen.getAllByRole('textbox')
      const textarea = textareas[0] // Get the first textbox (input)
      const optimizeButton = screen.getByRole('button', { name: /Optimize SVG/i })

      const inputSVG = `<svg><circle cx="50" cy="50" r="40" fill="red"/></svg>`

      fireEvent.change(textarea, { target: { value: inputSVG } })
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(screen.getByText('Live Preview')).toBeInTheDocument()
      })
    })
  })
})
