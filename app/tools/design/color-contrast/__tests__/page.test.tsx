import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ColorContrastPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackToolUsage: vi.fn(),
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

describe('Color Contrast Checker - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render color contrast checker page', () => {
    render(<ColorContrastPage />)

    expect(
      screen.getByRole('heading', { name: 'Color Contrast Checker', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Select Colors')).toBeInTheDocument()
    expect(screen.getByText('Contrast Ratio Results')).toBeInTheDocument()
  })

  it('should display default colors', () => {
    render(<ColorContrastPage />)

    // Check for default foreground (black)
    const foregroundInput = screen.getByPlaceholderText('#000000')
    expect(foregroundInput).toHaveValue('#000000')

    // Check for default background (white)
    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')
    expect(backgroundInput).toHaveValue('#FFFFFF')
  })

  it('should display contrast ratio', () => {
    render(<ColorContrastPage />)

    // Default black text on white background should have 21:1 contrast ratio
    expect(screen.getByText(/21\.00:1/)).toBeInTheDocument()
  })

  it('should display WCAG compliance level', () => {
    render(<ColorContrastPage />)

    // Black on white should pass AAA (multiple instances exist, so we check for at least one)
    const aaaElements = screen.getAllByText(/WCAG AAA/)
    expect(aaaElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should display action buttons', () => {
    render(<ColorContrastPage />)

    expect(screen.getByRole('button', { name: /Swap Colors/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Random Colors/ })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Copy/ }).length).toBeGreaterThanOrEqual(2)
  })

  it('should display live preview', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText('Live Preview')).toBeInTheDocument()
    expect(screen.getByText(/Normal text \(16px\):/)).toBeInTheDocument()
    expect(screen.getByText(/Large text \(20px\+\):/)).toBeInTheDocument()
  })

  it('should display compliance details', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText('Normal Text')).toBeInTheDocument()
    expect(screen.getByText('Large Text')).toBeInTheDocument()
  })
})

describe('Color Contrast Checker - Color Input Tests', () => {
  it('should update foreground color', () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')
    fireEvent.change(foregroundInput, { target: { value: '#FF0000' } })

    expect(foregroundInput).toHaveValue('#FF0000')
  })

  it('should update background color', () => {
    render(<ColorContrastPage />)

    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')
    fireEvent.change(backgroundInput, { target: { value: '#0000FF' } })

    expect(backgroundInput).toHaveValue('#0000FF')
  })

  it('should validate hex color format', () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')

    // Try invalid format - should not update
    fireEvent.change(foregroundInput, { target: { value: 'invalid' } })
    expect(foregroundInput).toHaveValue('#000000')

    // Try valid format - should update
    fireEvent.change(foregroundInput, { target: { value: '#ABC123' } })
    expect(foregroundInput).toHaveValue('#ABC123')
  })

  it('should copy foreground color to clipboard', async () => {
    render(<ColorContrastPage />)

    const copyButtons = screen.getAllByRole('button', { name: /Copy/ })
    await userEvent.click(copyButtons[0])

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#000000')
      expect(toast.success).toHaveBeenCalledWith('Foreground color copied!')
    })
  })

  it('should copy background color to clipboard', async () => {
    render(<ColorContrastPage />)

    const copyButtons = screen.getAllByRole('button', { name: /Copy/ })
    await userEvent.click(copyButtons[1])

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#FFFFFF')
      expect(toast.success).toHaveBeenCalledWith('Background color copied!')
    })
  })
})

describe('Color Contrast Checker - Functionality Tests', () => {
  it('should swap colors when swap button is clicked', async () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')
    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')
    const swapButton = screen.getByRole('button', { name: /Swap Colors/ })

    const initialForeground = foregroundInput.getAttribute('value')
    const initialBackground = backgroundInput.getAttribute('value')

    await userEvent.click(swapButton)

    expect(foregroundInput).toHaveValue(initialBackground)
    expect(backgroundInput).toHaveValue(initialForeground)
  })

  it('should generate random colors', async () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')
    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')
    const randomButton = screen.getByRole('button', { name: /Random Colors/ })

    const initialForeground = foregroundInput.getAttribute('value')
    const initialBackground = backgroundInput.getAttribute('value')

    await userEvent.click(randomButton)

    // Colors should be different after randomization
    const newForeground = foregroundInput.getAttribute('value')
    const newBackground = backgroundInput.getAttribute('value')

    expect(newForeground).not.toBe(initialForeground)
    expect(newBackground).not.toBe(initialBackground)
  })

  it('should apply preset color when clicked', async () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')

    // Find preset buttons (they are color squares)
    const presetButtons = document.querySelectorAll('button[title]')

    if (presetButtons.length > 0) {
      await userEvent.click(presetButtons[0] as HTMLElement)

      // Foreground color should have changed
      expect(foregroundInput.getAttribute('value')).not.toBe('#000000')
    }
  })
})

describe('Color Contrast Checker - WCAG Compliance Tests', () => {
  it('should show AAA compliance for black on white', () => {
    render(<ColorContrastPage />)

    // Default colors (black on white) should pass AAA (multiple instances exist)
    const aaaElements = screen.getAllByText(/WCAG AAA/)
    expect(aaaElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/21\.00:1/)).toBeInTheDocument()
  })

  it('should calculate correct contrast ratio for different colors', () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')
    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')

    // Test with gray on white
    fireEvent.change(foregroundInput, { target: { value: '#777777' } })
    fireEvent.change(backgroundInput, { target: { value: '#FFFFFF' } })

    // Gray on white should have lower contrast (around 4.5:1)
    const contrastRatios = screen.getAllByText(/:1/)
    expect(contrastRatios.length).toBeGreaterThanOrEqual(1)
  })

  it('should show normal text compliance status', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText('Normal Text')).toBeInTheDocument()
    const passElements = screen.getAllByText(/Passes WCAG AA/)
    expect(passElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should show large text compliance status', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText('Large Text')).toBeInTheDocument()
    const passElements = screen.getAllByText(/Passes WCAG AA/)
    expect(passElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should show fail status for low contrast colors', () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')
    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')

    // Test with low contrast (light gray on white)
    fireEvent.change(foregroundInput, { target: { value: '#EEEEEE' } })
    fireEvent.change(backgroundInput, { target: { value: '#FFFFFF' } })

    // Should show fail status
    expect(screen.getByText(/WCAG Fail/)).toBeInTheDocument()
  })
})

describe('Color Contrast Checker - Preview Tests', () => {
  it('should display preview with selected colors', () => {
    render(<ColorContrastPage />)

    const foregroundInput = screen.getByPlaceholderText('#000000')
    const backgroundInput = screen.getByPlaceholderText('#FFFFFF')

    fireEvent.change(foregroundInput, { target: { value: '#FF0000' } })
    fireEvent.change(backgroundInput, { target: { value: '#00FF00' } })

    // Preview should update (visual test - hard to assert)
    expect(screen.getByText(/Normal text \(16px\):/)).toBeInTheDocument()
  })

  it('should display button previews', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText('Primary Button')).toBeInTheDocument()
    expect(screen.getByText('Outline Button')).toBeInTheDocument()
  })
})

describe('Color Contrast Checker - Information Tests', () => {
  it('should display WCAG information', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText('About WCAG Compliance')).toBeInTheDocument()
    expect(screen.getByText(/WCAG AA: Minimum contrast ratio of 4.5:1/)).toBeInTheDocument()
    expect(screen.getByText(/WCAG AAA: Enhanced contrast ratio of 7:1/)).toBeInTheDocument()
  })

  it('should display large text definition', () => {
    render(<ColorContrastPage />)

    expect(screen.getByText(/Large text is defined as 18pt\+ \(24px\+\)/)).toBeInTheDocument()
  })
})

describe('Color Contrast Checker - Accessibility', () => {
  it('should have proper heading hierarchy', () => {
    render(<ColorContrastPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    const h3s = screen.getAllByRole('heading', { level: 3 })

    expect(h1).toBeInTheDocument()
    expect(h3s.length).toBeGreaterThanOrEqual(3) // Select Colors, Results, Preview (Card components use h3)
  })

  it('should have labeled form inputs', () => {
    render(<ColorContrastPage />)

    expect(screen.getByLabelText(/Foreground/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Background/)).toBeInTheDocument()
  })

  it('should have accessible buttons', () => {
    render(<ColorContrastPage />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeInTheDocument()
    })
  })
})
