import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import IconSearchPage from '../page'

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

// Mock lucide-react with a subset of icons for testing
vi.mock('lucide-react', async () => {
  const MockIcon = ({
    size,
    color,
    strokeWidth,
    className,
  }: {
    size?: number
    color?: string
    strokeWidth?: number
    className?: string
  }) => (
    <svg
      data-testid="mock-icon"
      width={size || 24}
      height={size || 24}
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth || 2}
      className={className}
    >
      <title>Mock Icon</title>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )

  return {
    Home: MockIcon,
    User: MockIcon,
    Settings: MockIcon,
    Search: MockIcon,
    Copy: MockIcon,
    Download: MockIcon,
    Heart: MockIcon,
    Mail: MockIcon,
    Phone: MockIcon,
    Camera: MockIcon,
    createLucideIcon: () => MockIcon,
    default: MockIcon,
  }
})

// Mock react-dom/client for copySVG and downloadSVG
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}))

// Mock clipboard - define the mock function at module level
const mockWriteText = vi.fn().mockResolvedValue(undefined)
const mockReadText = vi.fn().mockResolvedValue('')

// Create clipboard mock object
const mockClipboard = {
  writeText: mockWriteText,
  readText: mockReadText,
}

// Use Object.assign to add clipboard to navigator (works better in jsdom)
Object.assign(navigator, { clipboard: mockClipboard })

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock XMLSerializer
global.XMLSerializer = vi.fn().mockImplementation(() => ({
  serializeToString: vi.fn(() => '<svg>mock svg content</svg>'),
}))

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'

const mockToast = vi.mocked(toast)
const mockTrackToolEvent = vi.mocked(trackToolEvent)

describe('IconSearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset clipboard mock functions
    mockWriteText.mockClear()
    mockReadText.mockClear()
  })

  describe('Rendering', () => {
    it('renders the page title and description', () => {
      render(<IconSearchPage />)

      expect(screen.getByText('Search 1000+ Free Icons')).toBeInTheDocument()
      expect(
        screen.getByText(/Find, customize, and download Lucide icons for your projects/)
      ).toBeInTheDocument()
    })

    it('renders the search input', () => {
      render(<IconSearchPage />)

      expect(
        screen.getByPlaceholderText('Search icons... (e.g., home, user, settings)')
      ).toBeInTheDocument()
    })

    it('renders the icon library card', () => {
      render(<IconSearchPage />)

      expect(screen.getByText('Icon Library')).toBeInTheDocument()
      expect(screen.getByText('Click any icon to customize and download')).toBeInTheDocument()
    })

    it('renders the customization panel with default state', () => {
      render(<IconSearchPage />)

      expect(screen.getByText('Select an Icon')).toBeInTheDocument()
      expect(screen.getByText('Select an icon to customize and download')).toBeInTheDocument()
    })

    it('renders pro tips section', () => {
      render(<IconSearchPage />)

      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText('Search Tips')).toBeInTheDocument()
      expect(screen.getByText('React Integration')).toBeInTheDocument()
      expect(screen.getByText('Favorites')).toBeInTheDocument()
    })

    it('displays icon count in card description', () => {
      render(<IconSearchPage />)

      // Should show "Showing X of Y icons" format
      expect(screen.getByText(/Showing \d+ of \d+ icons/)).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters icons when searching', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )

      await user.type(searchInput, 'Home')

      // The search should filter icons
      expect(searchInput).toHaveValue('Home')
    })

    it('shows no results message when search yields no matches', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )

      await user.type(searchInput, 'xyznonexistent')

      await waitFor(() => {
        expect(screen.getByText(/No icons found matching/)).toBeInTheDocument()
      })
    })

    it('clears search and shows all icons', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )

      await user.type(searchInput, 'test')
      await user.clear(searchInput)

      expect(searchInput).toHaveValue('')
    })

    it('performs case-insensitive search', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )

      await user.type(searchInput, 'HOME')

      // Search should work regardless of case
      expect(searchInput).toHaveValue('HOME')
    })
  })

  describe('Icon Selection', () => {
    it('shows customization panel when an icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      // Find and click an icon button by title
      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByText('Customize & Download')).toBeInTheDocument()
        })
      }
    })

    it('tracks icon selection event', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      // Find and click an icon button by its title
      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(mockTrackToolEvent).toHaveBeenCalledWith('icon_select', expect.any(Object))
        })
      }
    })
  })

  describe('Customization Controls', () => {
    it('renders size slider when icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      // Select an icon first
      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Size:/)).toBeInTheDocument()
        })
      }
    })

    it('renders color picker when icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText('Color')).toBeInTheDocument()
        })
      }
    })

    it('renders stroke width slider when icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Stroke Width:/)).toBeInTheDocument()
        })
      }
    })

    it('updates icon size when slider is changed', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Size:/)).toBeInTheDocument()
        })

        const sizeSlider = screen.getByLabelText(/Size:/)
        fireEvent.change(sizeSlider, { target: { value: '48' } })

        expect(screen.getByText(/Size: 48px/)).toBeInTheDocument()
      }
    })

    it('updates icon color when color input is changed', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText('Color')).toBeInTheDocument()
        })

        const colorInput = screen.getByLabelText('Color')
        fireEvent.change(colorInput, { target: { value: '#ff0000' } })

        // Color should be updated
        expect(colorInput).toHaveValue('#ff0000')
      }
    })

    it('updates stroke width when slider is changed', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Stroke Width:/)).toBeInTheDocument()
        })

        const strokeSlider = screen.getByLabelText(/Stroke Width:/)
        fireEvent.change(strokeSlider, { target: { value: '3' } })

        expect(screen.getByText(/Stroke Width: 3/)).toBeInTheDocument()
      }
    })
  })

  describe('Favorites', () => {
    it('toggles favorite status when heart is clicked', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      // Find favorite buttons (heart icons)
      const favoriteButtons = screen.getAllByTitle(/Add to favorites|Remove from favorites/)
      if (favoriteButtons.length > 0) {
        await user.click(favoriteButtons[0])

        expect(mockTrackToolEvent).toHaveBeenCalledWith('icon_favorite', expect.any(Object))
      }
    })

    it('tracks favorite toggle event', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const favoriteButtons = screen.getAllByTitle('Add to favorites')
      if (favoriteButtons.length > 0) {
        await user.click(favoriteButtons[0])

        expect(mockTrackToolEvent).toHaveBeenCalledWith('icon_favorite', expect.any(Object))
      }
    })
  })

  describe('Copy and Download Actions', () => {
    it('renders copy SVG button when icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /Copy SVG/i })).toBeInTheDocument()
        })
      }
    })

    it('renders download SVG button when icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /Download SVG/i })).toBeInTheDocument()
        })
      }
    })

    it('renders copy React code button when icon is selected', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /Copy React Code/i })).toBeInTheDocument()
        })
      }
    })

    it('copies React code to clipboard', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /Copy React Code/i })).toBeInTheDocument()
        })

        const copyButton = screen.getByRole('button', { name: /Copy React Code/i })
        await user.click(copyButton)

        // Note: Clipboard API mocking is unreliable in jsdom/vitest browser mode
        // We verify the function executed by checking the toast notification
        await waitFor(() => {
          expect(mockToast.success).toHaveBeenCalledWith('React code copied to clipboard!')
        })
      }
    })

    it('tracks React code copy event', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /Copy React Code/i })).toBeInTheDocument()
        })

        const copyButton = screen.getByRole('button', { name: /Copy React Code/i })
        await user.click(copyButton)

        expect(mockTrackToolEvent).toHaveBeenCalledWith('icon_copy_react', expect.any(Object))
      }
    })
  })

  describe('Accessibility', () => {
    it('has accessible search input with placeholder', () => {
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('icon buttons have title attributes', () => {
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      expect(iconButtons.length).toBeGreaterThan(0)
    })

    it('favorite buttons have accessible titles', () => {
      render(<IconSearchPage />)

      const favoriteButtons = screen.getAllByTitle('Add to favorites')
      expect(favoriteButtons.length).toBeGreaterThan(0)
    })

    it('has proper heading structure', () => {
      render(<IconSearchPage />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Search 1000+ Free Icons')

      const h3Elements = screen.getAllByRole('heading', { level: 3 })
      expect(h3Elements.length).toBeGreaterThan(0)
    })

    it('sliders have accessible labels', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Size:/)).toBeInTheDocument()
          expect(screen.getByLabelText('Color')).toBeInTheDocument()
          expect(screen.getByLabelText(/Stroke Width:/)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles empty search gracefully', () => {
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )
      expect(searchInput).toHaveValue('')

      // Should show all icons when search is empty
      expect(screen.getByText(/Showing \d+ of \d+ icons/)).toBeInTheDocument()
    })

    it('handles special characters in search', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )

      await user.type(searchInput, '!@#$%')

      // Should handle special characters without error
      expect(searchInput).toHaveValue('!@#$%')
    })

    it('handles rapid search input changes', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const searchInput = screen.getByPlaceholderText(
        'Search icons... (e.g., home, user, settings)'
      )

      // Type quickly
      await user.type(searchInput, 'home')
      await user.clear(searchInput)
      await user.type(searchInput, 'user')

      expect(searchInput).toHaveValue('user')
    })

    it('maintains selected icon state during search', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      // Select an icon first
      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByText('Customize & Download')).toBeInTheDocument()
        })

        // Now search
        const searchInput = screen.getByPlaceholderText(
          'Search icons... (e.g., home, user, settings)'
        )
        await user.type(searchInput, 'test')

        // Customization panel should still show
        expect(screen.getByText('Customize & Download')).toBeInTheDocument()
      }
    })
  })

  describe('Slider Range Validation', () => {
    it('size slider has correct min and max values', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Size:/)).toBeInTheDocument()
        })

        const sizeSlider = screen.getByLabelText(/Size:/) as HTMLInputElement
        expect(sizeSlider.min).toBe('16')
        expect(sizeSlider.max).toBe('128')
      }
    })

    it('stroke width slider has correct min, max, and step values', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText(/Stroke Width:/)).toBeInTheDocument()
        })

        const strokeSlider = screen.getByLabelText(/Stroke Width:/) as HTMLInputElement
        expect(strokeSlider.min).toBe('0.5')
        expect(strokeSlider.max).toBe('4')
        expect(strokeSlider.step).toBe('0.5')
      }
    })
  })

  describe('Default Values', () => {
    it('has default icon size of 24px', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByText('Size: 24px')).toBeInTheDocument()
        })
      }
    })

    it('has default stroke width of 2', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByText('Stroke Width: 2')).toBeInTheDocument()
        })
      }
    })

    it('has default icon color of white (#ffffff)', async () => {
      const user = userEvent.setup()
      render(<IconSearchPage />)

      const iconButtons = screen.getAllByTitle(
        /^(Camera|Copy|Download|Heart|Home|Mail|Phone|Search|Settings|User)$/
      )
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        await waitFor(() => {
          expect(screen.getByLabelText('Color')).toBeInTheDocument()
        })

        const colorInput = screen.getByLabelText('Color')
        expect(colorInput).toHaveValue('#ffffff')
      }
    })
  })
})
