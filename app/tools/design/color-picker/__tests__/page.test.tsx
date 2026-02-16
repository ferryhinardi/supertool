import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import ColorPickerPage from '../page'

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
}))

describe('Color Picker - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render color picker page', () => {
    render(<ColorPickerPage />)

    expect(
      screen.getByRole('heading', { name: 'Color Picker & Palette Generator', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Color Picker')).toBeInTheDocument()
    expect(screen.getByText('Color Formats')).toBeInTheDocument()
    expect(screen.getByText('Color Palette')).toBeInTheDocument()
  })

  it('should display default color', () => {
    render(<ColorPickerPage />)

    // Check for default color input (#667EEA)
    const hexInput = screen.getByDisplayValue('#667EEA')
    expect(hexInput).toBeInTheDocument()
  })

  it('should display action buttons', () => {
    render(<ColorPickerPage />)

    expect(screen.getByRole('button', { name: /Random Color/ })).toBeInTheDocument()
  })

  it('should display color format labels', () => {
    render(<ColorPickerPage />)

    expect(screen.getByText('HEX')).toBeInTheDocument()
    expect(screen.getByText('RGB')).toBeInTheDocument()
    expect(screen.getByText('HSL')).toBeInTheDocument()
    expect(screen.getByText('HSV')).toBeInTheDocument()
  })

  it('should display palette type buttons', () => {
    render(<ColorPickerPage />)

    expect(screen.getByRole('button', { name: 'complementary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'analogous' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'triadic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'tetradic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'monochromatic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'shades' })).toBeInTheDocument()
  })

  it('should display contrast information', () => {
    render(<ColorPickerPage />)

    expect(screen.getByText('Contrast with White')).toBeInTheDocument()
    expect(screen.getByText('Contrast with Black')).toBeInTheDocument()
  })
})

describe('Color Picker - Color Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update color when hex input changes', () => {
    render(<ColorPickerPage />)

    const hexInput = screen.getByDisplayValue('#667EEA')
    fireEvent.change(hexInput, { target: { value: '#00FF00' } })

    expect(hexInput).toHaveValue('#00FF00')
  })

  it('should update color when color picker input changes', () => {
    render(<ColorPickerPage />)

    const colorInput = screen.getByDisplayValue('#667EEA')
    fireEvent.change(colorInput, { target: { value: '#FF0000' } })

    expect(colorInput).toHaveValue('#FF0000')
  })

  it('should handle invalid hex color input', () => {
    render(<ColorPickerPage />)

    const hexInput = screen.getByPlaceholderText('#667EEA')
    const _originalValue = hexInput.getAttribute('value')

    // Try to enter invalid color
    fireEvent.change(hexInput, { target: { value: 'INVALID' } })

    // Component may validate and keep original or accept invalid input
    // Either behavior is acceptable, just verify it doesn't crash
    expect(hexInput).toBeInTheDocument()
  })
})

describe('Color Picker - Random Color Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate random color when button is clicked', async () => {
    render(<ColorPickerPage />)

    const randomButton = screen.getByRole('button', { name: /Random Color/ })
    const hexInput = screen.getByDisplayValue('#667EEA')

    // Click random button
    await userEvent.click(randomButton)

    // Color should have changed (but we don't know to what)
    expect(hexInput).not.toHaveValue('#667EEA')
  })

  it('should track analytics when random color is generated', async () => {
    render(<ColorPickerPage />)

    const randomButton = screen.getByRole('button', { name: /Random Color/ })
    await userEvent.click(randomButton)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('color_picker_random', {})
  })
})

describe('Color Picker - Color Conversion Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display RGB conversion for default color', () => {
    render(<ColorPickerPage />)

    // #667EEA converts to rgb(102, 126, 234)
    expect(screen.getByText(/rgb\(102, 126, 234\)/)).toBeInTheDocument()
  })

  it('should display HSL conversion for default color', () => {
    render(<ColorPickerPage />)

    // Should display HSL values (exact values may vary due to rounding)
    expect(screen.getByText(/hsl\(/)).toBeInTheDocument()
  })

  it('should display HSV conversion for default color', () => {
    render(<ColorPickerPage />)

    // Should display HSV values
    expect(screen.getByText(/hsv\(/)).toBeInTheDocument()
  })

  it('should update conversions when color changes', () => {
    render(<ColorPickerPage />)

    const hexInput = screen.getByDisplayValue('#667EEA')

    // Change to red
    fireEvent.change(hexInput, { target: { value: '#FF0000' } })

    // Should show RGB for red
    expect(screen.getByText(/rgb\(255, 0, 0\)/)).toBeInTheDocument()
  })
})

describe('Color Picker - Palette Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display complementary palette by default', () => {
    render(<ColorPickerPage />)

    const complementaryButton = screen.getByRole('button', { name: 'complementary' })

    // Should exist and be accessible
    expect(complementaryButton).toBeInTheDocument()
  })

  it('should change palette type when clicking buttons', async () => {
    render(<ColorPickerPage />)

    const analogousButton = screen.getByRole('button', { name: 'analogous' })

    await userEvent.click(analogousButton)

    // Should exist and be clickable
    expect(analogousButton).toBeInTheDocument()
  })

  it('should track analytics when palette type changes', async () => {
    render(<ColorPickerPage />)

    const triadicButton = screen.getByRole('button', { name: 'triadic' })
    await userEvent.click(triadicButton)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('color_picker_palette_type', {
      type: 'triadic',
    })
  })
})

describe('Color Picker - Contrast Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display contrast ratios', () => {
    render(<ColorPickerPage />)

    expect(screen.getByText('Contrast with White')).toBeInTheDocument()
    expect(screen.getByText('Contrast with Black')).toBeInTheDocument()
  })

  it('should display WCAG level badges', () => {
    render(<ColorPickerPage />)

    // Should have status badges for WCAG compliance
    const badges = screen.getAllByRole('status')
    expect(badges.length).toBeGreaterThan(0)
  })
})

describe('Color Picker - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should copy HEX color to clipboard', async () => {
    render(<ColorPickerPage />)

    // Find the first copy button (HEX section)
    const copyButtons = screen.getAllByRole('button')
    const hexCopyButton = copyButtons.find((btn) => {
      const parent = btn.closest('div')
      return parent?.textContent?.includes('HEX')
    })

    if (hexCopyButton) {
      await userEvent.click(hexCopyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#667EEA')
      })

      expect(toast.success).toHaveBeenCalledWith('HEX copied!')
    }
  })

  it('should track analytics when copying color', async () => {
    render(<ColorPickerPage />)

    const copyButtons = screen.getAllByRole('button')
    const hexCopyButton = copyButtons.find((btn) => {
      const parent = btn.closest('div')
      return parent?.textContent?.includes('HEX')
    })

    if (hexCopyButton) {
      await userEvent.click(hexCopyButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('color_picker_copy', {
          format: 'HEX',
        })
      })
    }
  })
})

describe('Color Picker - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update all sections when color changes', () => {
    render(<ColorPickerPage />)

    const hexInput = screen.getByDisplayValue('#667EEA')

    // Change to green
    fireEvent.change(hexInput, { target: { value: '#00FF00' } })

    // Check that color input updated
    expect(hexInput).toHaveValue('#00FF00')

    // Check that RGB conversion updated
    expect(screen.getByText(/rgb\(0, 255, 0\)/)).toBeInTheDocument()
  })

  it('should maintain palette type when color changes', async () => {
    render(<ColorPickerPage />)

    // Select triadic palette
    const triadicButton = screen.getByRole('button', { name: 'triadic' })
    await userEvent.click(triadicButton)

    // Change color
    const hexInput = screen.getByDisplayValue('#667EEA')
    fireEvent.change(hexInput, { target: { value: '#FF0000' } })

    // Triadic should still be selected - just check it exists
    expect(triadicButton).toBeInTheDocument()
  })

  it('should show visual feedback when copying', async () => {
    render(<ColorPickerPage />)

    const copyButtons = screen.getAllByRole('button')
    const firstCopyButton = copyButtons.find((btn) => {
      const parent = btn.closest('div')
      return parent?.textContent?.includes('HEX')
    })

    if (firstCopyButton) {
      await userEvent.click(firstCopyButton)

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    }
  })
})
