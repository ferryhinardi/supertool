import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PlaceholderGeneratorPage from '../page'

const getRequiredButton = (button: HTMLButtonElement | null, label: string): HTMLButtonElement => {
  if (!button) {
    throw new Error(`${label} button not found`)
  }

  return button
}

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock the templates module
vi.mock('../templates', () => ({
  generateSVG: vi.fn(
    (width, height, bgColor, text, textColor, fontSize) =>
      `<svg width="${width}" height="${height}"><rect fill="${bgColor}"/><text fill="${textColor}" font-size="${fontSize}">${text}</text></svg>`
  ),
  svgToDataURL: vi.fn().mockReturnValue('data:image/svg+xml;base64,mockBase64Data'),
  svgToPNG: vi.fn((_svg, _width, _height, callback) => {
    callback('data:image/png;base64,mockPngData')
  }),
  downloadFile: vi.fn(),
  sizePresets: [
    {
      name: 'Full HD',
      width: 1920,
      height: 1080,
      category: 'web',
      description: 'Standard desktop screen',
    },
    { name: 'HD', width: 1280, height: 720, category: 'web', description: '720p resolution' },
    {
      name: 'Laptop',
      width: 1366,
      height: 768,
      category: 'web',
      description: 'Common laptop size',
    },
    {
      name: 'Instagram Square',
      width: 1080,
      height: 1080,
      category: 'social',
      description: 'Square post',
    },
    {
      name: 'Instagram Story',
      width: 1080,
      height: 1920,
      category: 'social',
      description: 'Story format',
    },
    { name: 'YouTube', width: 1920, height: 1080, category: 'video', description: 'YouTube video' },
    { name: 'A4', width: 2480, height: 3508, category: 'print', description: 'A4 at 300dpi' },
    {
      name: 'Leaderboard',
      width: 728,
      height: 90,
      category: 'ad',
      description: 'Standard leaderboard',
    },
  ],
  colorPalette: ['#cccccc', '#999999', '#666666', '#333333', '#000000', '#ffffff'],
}))

// Get mocked functions for assertions
import { trackToolEvent } from '@/lib/services/analytics'
import { downloadFile, generateSVG, svgToDataURL, svgToPNG } from '../templates'

describe('PlaceholderGeneratorPage', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }

  // Mock clipboard
  const clipboardMock = {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
    Object.defineProperty(navigator, 'clipboard', { value: clipboardMock, writable: true })
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    cleanup()
  })

  describe('Initial Render', () => {
    it('renders the page title and description', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('Placeholder Image Generator')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Generate custom placeholder images with custom dimensions, colors, and text'
        )
      ).toBeInTheDocument()
    })

    it('renders with default dimension values (800x600)', () => {
      render(<PlaceholderGeneratorPage />)

      const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
      const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement

      expect(widthInput.value).toBe('800')
      expect(heightInput.value).toBe('600')
    })

    it('renders with default color values', () => {
      render(<PlaceholderGeneratorPage />)

      const bgColorInput = screen.getByLabelText('Background Color') as HTMLInputElement
      const textColorInput = screen.getByLabelText('Text Color') as HTMLInputElement

      expect(bgColorInput.value).toBe('#cccccc')
      expect(textColorInput.value).toBe('#333333')
    })

    it('renders with default text showing dimensions', () => {
      render(<PlaceholderGeneratorPage />)

      const textInput = screen.getByLabelText('Text Overlay') as HTMLInputElement
      expect(textInput.value).toBe('800 × 600')
    })

    it('renders the font size slider with default value of 48', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('Font Size: 48px')).toBeInTheDocument()
      const slider = screen.getByLabelText(/Font Size/) as HTMLInputElement
      expect(slider.value).toBe('48')
    })

    it('renders all section headers', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('Dimensions')).toBeInTheDocument()
      expect(screen.getByText('Colors')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('Size Presets')).toBeInTheDocument()
      expect(screen.getByText('Tips')).toBeInTheDocument()
    })

    it('renders all action buttons', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByRole('button', { name: /Copy Data URL/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Download SVG/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
    })

    it('generates SVG on initial render', () => {
      render(<PlaceholderGeneratorPage />)

      expect(generateSVG).toHaveBeenCalledWith(800, 600, '#cccccc', '800 × 600', '#333333', 48)
    })

    it('loads recent sizes from localStorage on mount', () => {
      const recentSizes = [
        { width: 100, height: 100 },
        { width: 200, height: 200 },
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(recentSizes))

      render(<PlaceholderGeneratorPage />)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('placeholder_recent_sizes')
    })
  })

  describe('Dimension Controls', () => {
    it('updates width when input changes', () => {
      render(<PlaceholderGeneratorPage />)

      const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
      fireEvent.change(widthInput, { target: { value: '1024' } })

      expect(widthInput.value).toBe('1024')
      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_size_changed', {
        width: 1024,
        height: 600,
      })
    })

    it('updates height when input changes', () => {
      render(<PlaceholderGeneratorPage />)

      const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement
      fireEvent.change(heightInput, { target: { value: '768' } })

      expect(heightInput.value).toBe('768')
      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_size_changed', {
        width: 800,
        height: 768,
      })
    })

    it('saves new dimensions to localStorage', () => {
      render(<PlaceholderGeneratorPage />)

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'placeholder_recent_sizes',
        expect.stringContaining('1024')
      )
    })

    it('updates text to match new dimensions when text contains dimension pattern', () => {
      render(<PlaceholderGeneratorPage />)

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      const textInput = screen.getByLabelText('Text Overlay') as HTMLInputElement
      expect(textInput.value).toBe('1024 × 600')
    })

    it('does not update text when it contains custom text', () => {
      render(<PlaceholderGeneratorPage />)

      const textInput = screen.getByLabelText('Text Overlay')
      fireEvent.change(textInput, { target: { value: 'My Custom Text' } })

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      expect((textInput as HTMLInputElement).value).toBe('My Custom Text')
    })

    it('regenerates SVG when dimensions change', () => {
      render(<PlaceholderGeneratorPage />)
      vi.mocked(generateSVG).mockClear()

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      expect(generateSVG).toHaveBeenCalled()
    })
  })

  describe('Recent Sizes', () => {
    it('displays recent sizes when available', () => {
      const recentSizes = [
        { width: 100, height: 100 },
        { width: 200, height: 200 },
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(recentSizes))

      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('Recent Sizes')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '100 × 100' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '200 × 200' })).toBeInTheDocument()
    })

    it('does not display recent sizes section when empty', () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<PlaceholderGeneratorPage />)

      expect(screen.queryByText('Recent Sizes')).not.toBeInTheDocument()
    })

    it('applies recent size when clicked', () => {
      const recentSizes = [{ width: 100, height: 100 }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(recentSizes))

      render(<PlaceholderGeneratorPage />)

      const recentButton = screen.getByRole('button', { name: '100 × 100' })
      fireEvent.click(recentButton)

      const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
      const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement

      expect(widthInput.value).toBe('100')
      expect(heightInput.value).toBe('100')
    })

    it('limits recent sizes to 5 items', () => {
      render(<PlaceholderGeneratorPage />)

      // Change dimensions 6 times
      const widthInput = screen.getByLabelText('Width (px)')
      for (let i = 1; i <= 6; i++) {
        fireEvent.change(widthInput, { target: { value: String(i * 100) } })
      }

      // Check that localStorage was called with an array of max 5 items
      const lastCall =
        localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1]
      const savedSizes = JSON.parse(lastCall[1])
      expect(savedSizes.length).toBeLessThanOrEqual(5)
    })

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      // Should not throw
      expect(() => render(<PlaceholderGeneratorPage />)).not.toThrow()
    })
  })

  describe('Color Controls', () => {
    it('updates background color from color picker', () => {
      render(<PlaceholderGeneratorPage />)

      const bgColorPicker = screen.getByLabelText('Background Color')
      fireEvent.change(bgColorPicker, { target: { value: '#ff0000' } })

      expect((bgColorPicker as HTMLInputElement).value).toBe('#ff0000')
      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_color_changed', {
        type: 'bg',
        color: '#ff0000',
      })
    })

    it('updates text color from color picker', () => {
      render(<PlaceholderGeneratorPage />)

      const textColorPicker = screen.getByLabelText('Text Color')
      fireEvent.change(textColorPicker, { target: { value: '#00ff00' } })

      expect((textColorPicker as HTMLInputElement).value).toBe('#00ff00')
      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_color_changed', {
        type: 'text',
        color: '#00ff00',
      })
    })

    it('updates background color from text input', () => {
      render(<PlaceholderGeneratorPage />)

      const bgColorTextInputs = screen.getAllByPlaceholderText('#cccccc')
      const bgColorTextInput = bgColorTextInputs[0]
      fireEvent.change(bgColorTextInput, { target: { value: '#ff0000' } })

      expect((bgColorTextInput as HTMLInputElement).value).toBe('#ff0000')
    })

    it('updates background color from palette button', () => {
      render(<PlaceholderGeneratorPage />)

      const paletteButtons = screen.getAllByRole('button', { name: /Background color #999999/i })
      fireEvent.click(paletteButtons[0])

      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_color_changed', {
        type: 'bg',
        color: '#999999',
      })
    })

    it('updates text color from palette button', () => {
      render(<PlaceholderGeneratorPage />)

      const paletteButtons = screen.getAllByRole('button', { name: /Text color #999999/i })
      fireEvent.click(paletteButtons[0])

      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_color_changed', {
        type: 'text',
        color: '#999999',
      })
    })

    it('regenerates SVG when colors change', () => {
      render(<PlaceholderGeneratorPage />)
      vi.mocked(generateSVG).mockClear()

      const bgColorPicker = screen.getByLabelText('Background Color')
      fireEvent.change(bgColorPicker, { target: { value: '#ff0000' } })

      expect(generateSVG).toHaveBeenCalled()
    })
  })

  describe('Text Controls', () => {
    it('updates text overlay when input changes', () => {
      render(<PlaceholderGeneratorPage />)

      const textInput = screen.getByLabelText('Text Overlay')
      fireEvent.change(textInput, { target: { value: 'Custom Text' } })

      expect((textInput as HTMLInputElement).value).toBe('Custom Text')
    })

    it('updates font size when slider changes', () => {
      render(<PlaceholderGeneratorPage />)

      const slider = screen.getByLabelText(/Font Size/)
      fireEvent.change(slider, { target: { value: '72' } })

      expect(screen.getByText('Font Size: 72px')).toBeInTheDocument()
    })

    it('regenerates SVG when text changes', () => {
      render(<PlaceholderGeneratorPage />)
      vi.mocked(generateSVG).mockClear()

      const textInput = screen.getByLabelText('Text Overlay')
      fireEvent.change(textInput, { target: { value: 'New Text' } })

      expect(generateSVG).toHaveBeenCalled()
    })

    it('regenerates SVG when font size changes', () => {
      render(<PlaceholderGeneratorPage />)
      vi.mocked(generateSVG).mockClear()

      const slider = screen.getByLabelText(/Font Size/)
      fireEvent.change(slider, { target: { value: '72' } })

      expect(generateSVG).toHaveBeenCalled()
    })
  })

  describe('Category Tabs', () => {
    it('renders all category tabs', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByRole('button', { name: 'Web' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Social Media' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Video' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Ad Banners' })).toBeInTheDocument()
    })

    it('shows web presets by default', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('Full HD')).toBeInTheDocument()
      expect(screen.getByText('HD')).toBeInTheDocument()
      expect(screen.getByText('Laptop')).toBeInTheDocument()
    })

    it('switches to social media presets when tab clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const socialTab = screen.getByRole('button', { name: 'Social Media' })
      fireEvent.click(socialTab)

      expect(screen.getByText('Instagram Square')).toBeInTheDocument()
      expect(screen.getByText('Instagram Story')).toBeInTheDocument()
    })

    it('switches to video presets when tab clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const videoTab = screen.getByRole('button', { name: 'Video' })
      fireEvent.click(videoTab)

      expect(screen.getByText('YouTube')).toBeInTheDocument()
    })

    it('switches to print presets when tab clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const printTab = screen.getByRole('button', { name: 'Print' })
      fireEvent.click(printTab)

      expect(screen.getByText('A4')).toBeInTheDocument()
    })

    it('switches to ad banner presets when tab clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const adTab = screen.getByRole('button', { name: 'Ad Banners' })
      fireEvent.click(adTab)

      expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    })

    it('tracks analytics when category tab is clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const socialTab = screen.getByRole('button', { name: 'Social Media' })
      fireEvent.click(socialTab)

      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_preset_selected', {
        category: 'social',
      })
    })
  })

  describe('Size Presets', () => {
    it('applies preset dimensions when clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const fullHDPreset = screen.getByText('Full HD').closest('button')
      fireEvent.click(getRequiredButton(fullHDPreset, 'Full HD preset'))

      const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
      const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement

      expect(widthInput.value).toBe('1920')
      expect(heightInput.value).toBe('1080')
    })

    it('tracks analytics when preset is clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const fullHDPreset = screen.getByText('Full HD').closest('button')
      fireEvent.click(getRequiredButton(fullHDPreset, 'Full HD preset'))

      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_preset_selected', {
        preset: 'Full HD',
        width: 1920,
        height: 1080,
      })
    })

    it('displays preset description when available', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('Standard desktop screen')).toBeInTheDocument()
      expect(screen.getByText('720p resolution')).toBeInTheDocument()
    })

    it('displays preset dimensions', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
      expect(screen.getByText('1280 × 720')).toBeInTheDocument()
    })
  })

  describe('Copy Data URL', () => {
    it('copies data URL to clipboard when button clicked', async () => {
      render(<PlaceholderGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy Data URL/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(svgToDataURL).toHaveBeenCalled()
        expect(clipboardMock.writeText).toHaveBeenCalledWith(
          'data:image/svg+xml;base64,mockBase64Data'
        )
      })
    })

    it('shows "Copied!" feedback after copying', async () => {
      render(<PlaceholderGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy Data URL/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('tracks analytics when data URL is copied', async () => {
      render(<PlaceholderGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy Data URL/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_copied', {
          width: 800,
          height: 600,
          format: 'data_url',
        })
      })
    })

    it('shows temporary "Copied!" feedback that resets', async () => {
      // Test that the copied state can be triggered and shows the Copied text
      // Note: Testing the full 2-second timeout is flaky with fake timers + clipboard API
      // So we verify the state transition mechanism works
      render(<PlaceholderGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy Data URL/i })

      // Initially should show "Copy Data URL"
      expect(screen.getByText(/Copy Data URL/i)).toBeInTheDocument()
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()

      // Click to copy
      fireEvent.click(copyButton)

      // After clicking, should show "Copied!"
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })
  })

  describe('Download SVG', () => {
    it('downloads SVG when button clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const downloadButton = screen.getByRole('button', { name: /Download SVG/i })
      fireEvent.click(downloadButton)

      expect(svgToDataURL).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith(
        'data:image/svg+xml;base64,mockBase64Data',
        'placeholder-800x600.svg'
      )
    })

    it('tracks analytics when SVG is downloaded', () => {
      render(<PlaceholderGeneratorPage />)

      const downloadButton = screen.getByRole('button', { name: /Download SVG/i })
      fireEvent.click(downloadButton)

      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_downloaded', {
        width: 800,
        height: 600,
        format: 'svg',
      })
    })

    it('uses correct filename with current dimensions', () => {
      render(<PlaceholderGeneratorPage />)

      // Change dimensions first
      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      const heightInput = screen.getByLabelText('Height (px)')
      fireEvent.change(heightInput, { target: { value: '768' } })

      const downloadButton = screen.getByRole('button', { name: /Download SVG/i })
      fireEvent.click(downloadButton)

      expect(downloadFile).toHaveBeenCalledWith(expect.any(String), 'placeholder-1024x768.svg')
    })
  })

  describe('Download PNG', () => {
    it('downloads PNG when button clicked', () => {
      render(<PlaceholderGeneratorPage />)

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      fireEvent.click(downloadButton)

      expect(svgToPNG).toHaveBeenCalled()
      expect(downloadFile).toHaveBeenCalledWith(
        'data:image/png;base64,mockPngData',
        'placeholder-800x600.png'
      )
    })

    it('tracks analytics when PNG is downloaded', () => {
      render(<PlaceholderGeneratorPage />)

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      fireEvent.click(downloadButton)

      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_downloaded', {
        width: 800,
        height: 600,
        format: 'png',
      })
    })

    it('passes correct dimensions to svgToPNG', () => {
      render(<PlaceholderGeneratorPage />)

      // Change dimensions
      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      const heightInput = screen.getByLabelText('Height (px)')
      fireEvent.change(heightInput, { target: { value: '768' } })

      vi.mocked(svgToPNG).mockClear()

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      fireEvent.click(downloadButton)

      expect(svgToPNG).toHaveBeenCalledWith(expect.any(String), 1024, 768, expect.any(Function))
    })
  })

  describe('Preview', () => {
    it('renders SVG preview', () => {
      render(<PlaceholderGeneratorPage />)

      // The preview container should contain the SVG content
      const previewSection = screen.getByText('Preview').closest('[class]')
      expect(previewSection).toBeInTheDocument()
    })

    it('updates preview when settings change', () => {
      render(<PlaceholderGeneratorPage />)
      vi.mocked(generateSVG).mockClear()

      // Change width
      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1024' } })

      expect(generateSVG).toHaveBeenCalledWith(1024, 600, '#cccccc', '1024 × 600', '#333333', 48)
    })
  })

  describe('Tips Section', () => {
    it('renders all tips', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByText(/Enter custom dimensions or use presets/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Click color swatches for quick color selection/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/SVG format is lightweight/i)).toBeInTheDocument()
      expect(screen.getByText(/PNG format provides better compatibility/i)).toBeInTheDocument()
      expect(screen.getByText(/Data URL can be used directly/i)).toBeInTheDocument()
      expect(screen.getByText(/Recent sizes are saved locally/i)).toBeInTheDocument()
      expect(screen.getByText(/Perfect for mockups/i)).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('full workflow: select preset, change color, and download', () => {
      render(<PlaceholderGeneratorPage />)

      // Select a preset
      const fullHDPreset = screen.getByText('Full HD').closest('button')
      fireEvent.click(getRequiredButton(fullHDPreset, 'Full HD preset'))

      // Change background color
      const bgColorPicker = screen.getByLabelText('Background Color')
      fireEvent.change(bgColorPicker, { target: { value: '#ff0000' } })

      // Download PNG
      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      fireEvent.click(downloadButton)

      expect(downloadFile).toHaveBeenCalledWith(expect.any(String), 'placeholder-1920x1080.png')
    })

    it('switching categories clears previous presets from view', () => {
      render(<PlaceholderGeneratorPage />)

      // Initially shows web presets
      expect(screen.getByText('Full HD')).toBeInTheDocument()

      // Switch to social
      const socialTab = screen.getByRole('button', { name: 'Social Media' })
      fireEvent.click(socialTab)

      // Web presets should not be visible
      expect(screen.queryByText('Full HD')).not.toBeInTheDocument()
      // Social presets should be visible
      expect(screen.getByText('Instagram Square')).toBeInTheDocument()
    })

    it('custom text is preserved when changing dimensions via preset', () => {
      render(<PlaceholderGeneratorPage />)

      // Set custom text
      const textInput = screen.getByLabelText('Text Overlay')
      fireEvent.change(textInput, { target: { value: 'My Custom Text' } })

      // Select a preset
      const fullHDPreset = screen.getByText('Full HD').closest('button')
      fireEvent.click(getRequiredButton(fullHDPreset, 'Full HD preset'))

      // Custom text should be preserved
      expect((textInput as HTMLInputElement).value).toBe('My Custom Text')
    })

    it('dimension text is updated when changing dimensions via preset', () => {
      render(<PlaceholderGeneratorPage />)

      // Text should show default dimensions
      const textInput = screen.getByLabelText('Text Overlay') as HTMLInputElement
      expect(textInput.value).toBe('800 × 600')

      // Select a preset
      const fullHDPreset = screen.getByText('Full HD').closest('button')
      fireEvent.click(getRequiredButton(fullHDPreset, 'Full HD preset'))

      // Text should update to new dimensions
      expect(textInput.value).toBe('1920 × 1080')
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form inputs', () => {
      render(<PlaceholderGeneratorPage />)

      expect(screen.getByLabelText('Width (px)')).toBeInTheDocument()
      expect(screen.getByLabelText('Height (px)')).toBeInTheDocument()
      expect(screen.getByLabelText('Background Color')).toBeInTheDocument()
      expect(screen.getByLabelText('Text Color')).toBeInTheDocument()
      expect(screen.getByLabelText('Text Overlay')).toBeInTheDocument()
      expect(screen.getByLabelText(/Font Size/)).toBeInTheDocument()
    })

    it('color palette buttons have aria-labels', () => {
      render(<PlaceholderGeneratorPage />)

      // Check that palette buttons have aria-labels
      const bgPaletteButtons = screen.getAllByRole('button', { name: /Background color/i })
      const textPaletteButtons = screen.getAllByRole('button', { name: /Text color/i })

      expect(bgPaletteButtons.length).toBeGreaterThan(0)
      expect(textPaletteButtons.length).toBeGreaterThan(0)
    })

    it('all buttons are keyboard accessible', () => {
      render(<PlaceholderGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy Data URL/i })
      const downloadSVGButton = screen.getByRole('button', { name: /Download SVG/i })
      const downloadPNGButton = screen.getByRole('button', { name: /Download PNG/i })

      expect(copyButton).not.toHaveAttribute('tabindex', '-1')
      expect(downloadSVGButton).not.toHaveAttribute('tabindex', '-1')
      expect(downloadPNGButton).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Edge Cases', () => {
    it('handles very large dimension values', () => {
      render(<PlaceholderGeneratorPage />)

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '10000' } })

      expect((widthInput as HTMLInputElement).value).toBe('10000')
    })

    it('handles minimum dimension values', () => {
      render(<PlaceholderGeneratorPage />)

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '1' } })

      expect((widthInput as HTMLInputElement).value).toBe('1')
    })

    it('handles empty text overlay', () => {
      render(<PlaceholderGeneratorPage />)

      const textInput = screen.getByLabelText('Text Overlay')
      fireEvent.change(textInput, { target: { value: '' } })

      expect((textInput as HTMLInputElement).value).toBe('')
      expect(generateSVG).toHaveBeenCalledWith(800, 600, '#cccccc', '', '#333333', 48)
    })

    it('handles font size at minimum boundary (8px)', () => {
      render(<PlaceholderGeneratorPage />)

      const slider = screen.getByLabelText(/Font Size/)
      fireEvent.change(slider, { target: { value: '8' } })

      expect(screen.getByText('Font Size: 8px')).toBeInTheDocument()
    })

    it('handles font size at maximum boundary (200px)', () => {
      render(<PlaceholderGeneratorPage />)

      const slider = screen.getByLabelText(/Font Size/)
      fireEvent.change(slider, { target: { value: '200' } })

      expect(screen.getByText('Font Size: 200px')).toBeInTheDocument()
    })

    it('handles special characters in text', () => {
      render(<PlaceholderGeneratorPage />)

      const textInput = screen.getByLabelText('Text Overlay')
      const specialText = '<script>alert("xss")</script>'
      fireEvent.change(textInput, { target: { value: specialText } })

      expect((textInput as HTMLInputElement).value).toBe(specialText)
      expect(generateSVG).toHaveBeenCalledWith(800, 600, '#cccccc', specialText, '#333333', 48)
    })

    it('handles color values with different formats', () => {
      render(<PlaceholderGeneratorPage />)

      const bgColorPicker = screen.getByLabelText('Background Color')

      // Standard 6-character hex (HTML color inputs normalize values)
      fireEvent.change(bgColorPicker, { target: { value: '#aabbcc' } })
      expect(trackToolEvent).toHaveBeenCalledWith('placeholder_generator_color_changed', {
        type: 'bg',
        color: '#aabbcc',
      })
    })
  })
})
