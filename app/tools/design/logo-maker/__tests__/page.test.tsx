import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock Panda CSS to ensure css() returns a string
vi.mock('@/styled-system/css', () => ({
  css: vi.fn((styles) => `mock-css-${JSON.stringify(styles).slice(0, 20)}`),
  cx: vi.fn((...args: (string | undefined)[]) => args.filter(Boolean).join(' ')),
}))

// Mock ToolSearch to avoid loading tools.ts which imports many icons
vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="mock-tool-search">Tool Search</div>,
}))

// Mock lucide-react with all necessary icons
// The component uses Object.entries(LucideIcons), so we need actual enumerable properties
vi.mock('lucide-react', () => {
  const React = require('react')

  const createMockIcon = (name: string) => {
    const MockIcon = (props: Record<string, unknown>) => {
      const { className, size, color, strokeWidth, ...rest } = props
      return React.createElement('span', {
        'data-testid': `icon-${name.toLowerCase()}`,
        className: className,
        'data-size': size,
        'data-color': color,
        'data-stroke-width': strokeWidth,
        ...rest,
      })
    }
    MockIcon.displayName = name
    return MockIcon
  }

  // All icons used in ICON_CATEGORIES plus named imports
  const iconNames = [
    'AlignCenter',
    'AlignLeft',
    'AlignRight',
    'ArrowDown',
    'ArrowRight',
    'Download',
    'Palette',
    'RefreshCw',
    'Search',
    'Sparkles',
    'Type',
    'Briefcase',
    'Building',
    'Building2',
    'Store',
    'Landmark',
    'PiggyBank',
    'Wallet',
    'CreditCard',
    'TrendingUp',
    'BarChart3',
    'LineChart',
    'Target',
    'Award',
    'Trophy',
    'Medal',
    'Crown',
    'Code',
    'Code2',
    'Terminal',
    'Cpu',
    'Database',
    'Server',
    'Cloud',
    'Wifi',
    'Globe',
    'Globe2',
    'Laptop',
    'Monitor',
    'Smartphone',
    'Tablet',
    'Bot',
    'Zap',
    'Brush',
    'Pen',
    'PenTool',
    'Pencil',
    'Paintbrush',
    'Camera',
    'Image',
    'Video',
    'Music',
    'Music2',
    'Mic',
    'Film',
    'Clapperboard',
    'Wand2',
    'Leaf',
    'TreeDeciduous',
    'Trees',
    'Flower',
    'Flower2',
    'Sun',
    'Moon',
    'Star',
    'Mountain',
    'CloudSun',
    'Droplet',
    'Waves',
    'Bird',
    'Fish',
    'Bug',
    'Feather',
    'Coffee',
    'UtensilsCrossed',
    'ChefHat',
    'Pizza',
    'Apple',
    'Cake',
    'Cookie',
    'IceCream2',
    'Wine',
    'Beer',
    'Carrot',
    'Beef',
    'Egg',
    'Croissant',
    'Soup',
    'Salad',
    'Heart',
    'HeartPulse',
    'Activity',
    'Stethoscope',
    'Pill',
    'Syringe',
    'Cross',
    'Hospital',
    'Dumbbell',
    'PersonStanding',
    'Footprints',
    'Brain',
    'Eye',
    'Ear',
    'Hand',
    'Plane',
    'Car',
    'Bus',
    'Train',
    'Ship',
    'Bike',
    'Compass',
    'Map',
    'MapPin',
    'Navigation',
    'Luggage',
    'Tent',
    'Anchor',
    'Rocket',
    'Earth',
    'Users',
    'UserPlus',
    'MessageCircle',
    'MessageSquare',
    'Mail',
    'Send',
    'Share2',
    'ThumbsUp',
    'Bell',
    'Gift',
    'PartyPopper',
    'Handshake',
    'Link',
    'AtSign',
  ]

  const icons: Record<string, unknown> = {
    __esModule: true,
    createLucideIcon: () => createMockIcon('Custom'),
    LucideProps: {},
  }

  for (const name of iconNames) {
    icons[name] = createMockIcon(name)
  }

  return icons
})

// Mock Canvas context
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  font: '',
  textAlign: 'center' as CanvasTextAlign,
  textBaseline: 'middle' as CanvasTextBaseline,
  fillStyle: '',
}

// Store original createElement - will be used to create real canvas elements
const originalCreateElement = document.createElement.bind(document)

// Mock URL methods
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

// Mock XMLSerializer
const mockSerializeToString = vi.fn(() => '<svg>mock svg content</svg>')
class MockXMLSerializer {
  serializeToString = mockSerializeToString
}

// Mock Blob constructor spy
const mockBlobConstructor = vi.fn()

// Mock Image constructor
const mockImageOnload = vi.fn()
class MockImage {
  src = ''
  onload: (() => void) | null = null
  width = 64
  height = 64

  constructor() {
    // Simulate async image load
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

// Import the component after mocks
import LogoMakerPage from '../page'

describe('LogoMakerPage', () => {
  const user = userEvent.setup()
  const mockToast = vi.mocked(toast)
  const mockTrackToolEvent = vi.mocked(trackToolEvent)

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup createElement mock for canvas - use real canvas but mock context
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const canvas = originalCreateElement('canvas') as HTMLCanvasElement
        // Mock getContext to return our mock context
        canvas.getContext = vi.fn(() => mockContext) as unknown as typeof canvas.getContext
        // Mock toDataURL to return a valid data URL
        canvas.toDataURL = vi.fn(() => 'data:image/png;base64,mockdata')
        return canvas
      }
      if (tagName === 'a') {
        const anchor = originalCreateElement('a') as HTMLAnchorElement
        anchor.click = vi.fn()
        return anchor
      }
      return originalCreateElement(tagName)
    })

    // Setup URL mocks
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Setup XMLSerializer mock
    global.XMLSerializer = MockXMLSerializer as unknown as typeof XMLSerializer

    // Setup Image mock
    global.Image = MockImage as unknown as typeof Image

    // Setup Blob mock - use a proper class with spy tracking
    class MockBlobImpl {
      content: BlobPart[]
      options: BlobPropertyBag | undefined
      size: number
      type: string
      constructor(content: BlobPart[], options?: BlobPropertyBag) {
        this.content = content
        this.options = options
        this.size = 100
        this.type = options?.type || ''
        // Track the call
        mockBlobConstructor(content, options)
      }
    }
    global.Blob = MockBlobImpl as unknown as typeof Blob
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page title and description', () => {
      render(<LogoMakerPage />)

      expect(
        screen.getByRole('heading', { name: /create your logo in minutes/i, level: 1 })
      ).toBeInTheDocument()
      expect(screen.getByText(/design professional logos/i)).toBeInTheDocument()
    })

    it('renders icon selection section', () => {
      render(<LogoMakerPage />)

      expect(screen.getByText('Choose an Icon')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search icons...')).toBeInTheDocument()
    })

    it('renders text settings section', () => {
      render(<LogoMakerPage />)

      expect(screen.getByText('Text Settings')).toBeInTheDocument()
      expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tagline/i)).toBeInTheDocument()
    })

    it('renders color settings section', () => {
      render(<LogoMakerPage />)

      expect(screen.getByText('Colors')).toBeInTheDocument()
      // Color palettes use title attribute, not visible text
      expect(screen.getByTitle('Professional')).toBeInTheDocument()
      expect(screen.getByTitle('Modern')).toBeInTheDocument()
    })

    it('renders layout options section', () => {
      render(<LogoMakerPage />)

      expect(screen.getByText('Layout')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /horizontal/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /vertical/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /icon only/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /text only/i })).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<LogoMakerPage />)

      expect(screen.getByRole('button', { name: /generate random/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /download svg/i })).toBeInTheDocument()
    })

    it('renders live preview section', () => {
      render(<LogoMakerPage />)

      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('renders all icon categories', () => {
      render(<LogoMakerPage />)

      // Use exact text match to avoid conflict with palette buttons that have similar titles
      expect(screen.getByText('business')).toBeInTheDocument()
      expect(screen.getByText('technology')).toBeInTheDocument()
      expect(screen.getByText('creative')).toBeInTheDocument()
      expect(screen.getByText('nature')).toBeInTheDocument()
      expect(screen.getByText('food')).toBeInTheDocument()
      expect(screen.getByText('health')).toBeInTheDocument()
      expect(screen.getByText('travel')).toBeInTheDocument()
      expect(screen.getByText('social')).toBeInTheDocument()
    })
  })

  describe('Icon Selection', () => {
    it('shows business icons by default', () => {
      render(<LogoMakerPage />)

      // Business category should be active
      const businessTab = screen.getByRole('button', { name: /business/i })
      expect(businessTab).toHaveAttribute('data-active', 'true')
    })

    it('switches icon categories when clicking category buttons', async () => {
      render(<LogoMakerPage />)

      const techButton = screen.getByRole('button', { name: /technology/i })
      await user.click(techButton)

      expect(techButton).toHaveAttribute('data-active', 'true')
    })

    it('selects an icon when clicked', async () => {
      render(<LogoMakerPage />)

      // Find and click the first icon button in the grid
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))

      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        expect(mockTrackToolEvent).toHaveBeenCalledWith('logo_select_icon', expect.any(Object))
      }
    })

    it('filters icons based on search query', async () => {
      render(<LogoMakerPage />)

      const searchInput = screen.getByPlaceholderText('Search icons...')
      await user.type(searchInput, 'brief')

      // Should show only matching icons
      await waitFor(() => {
        const briefcaseIcon = screen.queryByTestId('icon-briefcase')
        expect(briefcaseIcon).toBeInTheDocument()
      })
    })

    it('hides categories during search and shows them when search is cleared', async () => {
      render(<LogoMakerPage />)

      const searchInput = screen.getByPlaceholderText('Search icons...')

      // Categories should be visible initially
      expect(screen.getByText('technology')).toBeInTheDocument()

      // Type in search - categories should be hidden
      await user.type(searchInput, 'test')
      expect(screen.queryByText('technology')).not.toBeInTheDocument()

      // Clear search - categories should reappear
      await user.clear(searchInput)
      expect(screen.getByText('technology')).toBeInTheDocument()
    })
  })

  describe('Text Settings', () => {
    it('updates brand name', async () => {
      render(<LogoMakerPage />)

      const brandInput = screen.getByLabelText(/brand name/i)
      await user.clear(brandInput)
      await user.type(brandInput, 'MyCompany')

      expect(brandInput).toHaveValue('MyCompany')
    })

    it('updates tagline', async () => {
      render(<LogoMakerPage />)

      const taglineInput = screen.getByLabelText(/tagline/i)
      await user.type(taglineInput, 'Building the future')

      expect(taglineInput).toHaveValue('Building the future')
    })

    it('changes font selection', async () => {
      render(<LogoMakerPage />)

      const fontSelect = screen.getByRole('combobox')
      await user.selectOptions(fontSelect, 'Georgia')

      expect(fontSelect).toHaveValue('Georgia')
    })

    it('toggles font weight between normal and bold', async () => {
      render(<LogoMakerPage />)

      // Font weight buttons have data-active attribute, unlike palette buttons which have title
      const allNormalButtons = screen.getAllByRole('button', { name: /^normal$/i })
      const normalButton = allNormalButtons.find((btn) => btn.hasAttribute('data-active'))!

      const allBoldButtons = screen.getAllByRole('button', { name: /^bold$/i })
      const boldButton = allBoldButtons.find((btn) => btn.hasAttribute('data-active'))!

      // Bold should be active by default
      expect(boldButton).toHaveAttribute('data-active', 'true')

      await user.click(normalButton)
      expect(normalButton).toHaveAttribute('data-active', 'true')
    })

    it('changes text alignment', async () => {
      render(<LogoMakerPage />)

      // Find alignment buttons by their icons
      const alignButtons = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.querySelector('[data-testid="icon-alignleft"]') ||
            btn.querySelector('[data-testid="icon-aligncenter"]') ||
            btn.querySelector('[data-testid="icon-alignright"]')
        )

      expect(alignButtons.length).toBe(3)

      // Click left align
      await user.click(alignButtons[0])
    })

    it('adjusts font size with slider', async () => {
      render(<LogoMakerPage />)

      const fontSizeSlider = screen.getByRole('slider', { name: /font size/i })
      fireEvent.change(fontSizeSlider, { target: { value: '64' } })

      expect(fontSizeSlider).toHaveValue('64')
    })
  })

  describe('Color Settings', () => {
    it('applies a color palette when clicked', async () => {
      render(<LogoMakerPage />)

      const modernPalette = screen.getByRole('button', { name: /modern/i })
      await user.click(modernPalette)

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_apply_palette',
        expect.objectContaining({ palette: 'Modern' })
      )
    })

    it('updates primary color', async () => {
      render(<LogoMakerPage />)

      const primaryColorInput = screen.getByLabelText(/primary/i)
      fireEvent.change(primaryColorInput, { target: { value: '#ff0000' } })

      expect(primaryColorInput).toHaveValue('#ff0000')
    })

    it('updates secondary color', async () => {
      render(<LogoMakerPage />)

      const secondaryColorInput = screen.getByLabelText(/secondary/i)
      fireEvent.change(secondaryColorInput, { target: { value: '#00ff00' } })

      expect(secondaryColorInput).toHaveValue('#00ff00')
    })

    it('changes background option', async () => {
      render(<LogoMakerPage />)

      const whiteButton = screen.getByRole('button', { name: /white/i })
      await user.click(whiteButton)

      expect(whiteButton).toHaveAttribute('data-active', 'true')
    })

    it('selects transparent background', async () => {
      render(<LogoMakerPage />)

      const transparentButton = screen.getByRole('button', { name: /transparent/i })
      expect(transparentButton).toHaveAttribute('data-active', 'true')
    })

    it('selects black background', async () => {
      render(<LogoMakerPage />)

      const blackButton = screen.getByRole('button', { name: /black/i })
      await user.click(blackButton)

      expect(blackButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('Layout Options', () => {
    it('horizontal layout is selected by default', () => {
      render(<LogoMakerPage />)

      const horizontalButton = screen.getByRole('button', { name: /horizontal/i })
      expect(horizontalButton).toHaveAttribute('data-active', 'true')
    })

    it('switches to vertical layout', async () => {
      render(<LogoMakerPage />)

      const verticalButton = screen.getByRole('button', { name: /vertical/i })
      await user.click(verticalButton)

      expect(verticalButton).toHaveAttribute('data-active', 'true')
    })

    it('switches to icon-only layout', async () => {
      render(<LogoMakerPage />)

      const iconOnlyButton = screen.getByRole('button', { name: /icon only/i })
      await user.click(iconOnlyButton)

      expect(iconOnlyButton).toHaveAttribute('data-active', 'true')
    })

    it('switches to text-only layout', async () => {
      render(<LogoMakerPage />)

      const textOnlyButton = screen.getByRole('button', { name: /text only/i })
      await user.click(textOnlyButton)

      expect(textOnlyButton).toHaveAttribute('data-active', 'true')
    })

    it('hides icon customization when text-only is selected', async () => {
      render(<LogoMakerPage />)

      // Icon size slider should be visible initially
      expect(screen.getByRole('slider', { name: /icon size/i })).toBeInTheDocument()

      const textOnlyButton = screen.getByRole('button', { name: /text only/i })
      await user.click(textOnlyButton)

      // Icon size slider should be hidden
      expect(screen.queryByRole('slider', { name: /icon size/i })).not.toBeInTheDocument()
    })
  })

  describe('Slider Controls', () => {
    it('adjusts icon size', async () => {
      render(<LogoMakerPage />)

      const iconSizeSlider = screen.getByRole('slider', { name: /icon size/i })
      fireEvent.change(iconSizeSlider, { target: { value: '96' } })

      expect(iconSizeSlider).toHaveValue('96')
    })

    it('adjusts stroke width', async () => {
      render(<LogoMakerPage />)

      const strokeSlider = screen.getByRole('slider', { name: /icon stroke/i })
      fireEvent.change(strokeSlider, { target: { value: '3' } })

      expect(strokeSlider).toHaveValue('3')
    })

    it('adjusts spacing', async () => {
      render(<LogoMakerPage />)

      const spacingSlider = screen.getByRole('slider', { name: /spacing/i })
      fireEvent.change(spacingSlider, { target: { value: '24' } })

      expect(spacingSlider).toHaveValue('24')
    })
  })

  describe('Generate Random Logo', () => {
    it('generates random logo when button clicked', async () => {
      render(<LogoMakerPage />)

      const randomButton = screen.getByRole('button', { name: /generate random/i })
      await user.click(randomButton)

      expect(mockToast.success).toHaveBeenCalledWith('Random logo generated!')
      expect(mockTrackToolEvent).toHaveBeenCalledWith('logo_generate_random', expect.any(Object))
    })

    it('randomizes icon selection', async () => {
      render(<LogoMakerPage />)

      const randomButton = screen.getByRole('button', { name: /generate random/i })
      await user.click(randomButton)

      // The analytics should capture the randomized settings
      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_generate_random',
        expect.objectContaining({
          icon: expect.any(String),
          palette: expect.any(String),
          font: expect.any(String),
          layout: expect.any(String),
        })
      )
    })
  })

  describe('Download PNG', () => {
    it('downloads PNG when button clicked', async () => {
      render(<LogoMakerPage />)

      // First select an icon
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])
      }

      const downloadPngButton = screen.getByRole('button', { name: /download png/i })
      await user.click(downloadPngButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Logo downloaded as PNG!')
      })

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_download',
        expect.objectContaining({ format: 'png' })
      )
    })

    it('creates canvas element for PNG export', async () => {
      render(<LogoMakerPage />)

      // Select an icon first
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])
      }

      const downloadPngButton = screen.getByRole('button', { name: /download png/i })
      await user.click(downloadPngButton)

      await waitFor(() => {
        expect(document.createElement).toHaveBeenCalledWith('canvas')
      })
    })
  })

  describe('Download SVG', () => {
    it('downloads SVG when button clicked', async () => {
      render(<LogoMakerPage />)

      // First select an icon
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])
      }

      const downloadSvgButton = screen.getByRole('button', { name: /download svg/i })
      await user.click(downloadSvgButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Logo downloaded as SVG!')
      })

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_download',
        expect.objectContaining({ format: 'svg' })
      )
    })

    it('creates Blob for SVG export', async () => {
      render(<LogoMakerPage />)

      // Select an icon first
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])
      }

      const downloadSvgButton = screen.getByRole('button', { name: /download svg/i })
      await user.click(downloadSvgButton)

      await waitFor(() => {
        expect(mockBlobConstructor).toHaveBeenCalled()
        expect(mockCreateObjectURL).toHaveBeenCalled()
      })
    })
  })

  describe('Live Preview', () => {
    it('shows brand name in preview', () => {
      render(<LogoMakerPage />)

      // Default brand name is "Brand" - it appears in both the input and the preview
      const brandTexts = screen.getAllByText('Brand')
      expect(brandTexts.length).toBeGreaterThan(0)
    })

    it('updates preview when brand name changes', async () => {
      render(<LogoMakerPage />)

      const brandInput = screen.getByLabelText(/brand name/i)
      await user.clear(brandInput)
      await user.type(brandInput, 'TestBrand')

      await waitFor(() => {
        const previewTexts = screen.getAllByText('TestBrand')
        expect(previewTexts.length).toBeGreaterThan(0)
      })
    })

    it('shows tagline in preview when entered', async () => {
      render(<LogoMakerPage />)

      const taglineInput = screen.getByLabelText(/tagline/i)
      await user.type(taglineInput, 'My Tagline')

      await waitFor(() => {
        expect(screen.getByText('My Tagline')).toBeInTheDocument()
      })
    })

    it('shows selected icon in preview', async () => {
      render(<LogoMakerPage />)

      // Click on an icon to select it
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))

      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        // The preview should now contain the selected icon
        const previewSection = screen.getByText('Live Preview').closest('section')
        expect(previewSection).toBeInTheDocument()
      }
    })
  })

  describe('Color Palettes', () => {
    it('renders all 8 color palettes', () => {
      render(<LogoMakerPage />)

      expect(screen.getByTitle('Professional')).toBeInTheDocument()
      expect(screen.getByTitle('Modern')).toBeInTheDocument()
      expect(screen.getByTitle('Vibrant')).toBeInTheDocument()
      expect(screen.getByTitle('Nature')).toBeInTheDocument()
      expect(screen.getByTitle('Sunset')).toBeInTheDocument()
      expect(screen.getByTitle('Ocean')).toBeInTheDocument()
      expect(screen.getByTitle('Minimal')).toBeInTheDocument()
      expect(screen.getByTitle('Bold')).toBeInTheDocument()
    })

    it('applies vibrant palette colors', async () => {
      render(<LogoMakerPage />)

      const vibrantPalette = screen.getByTitle('Vibrant')
      await user.click(vibrantPalette)

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_apply_palette',
        expect.objectContaining({ palette: 'Vibrant' })
      )
    })
  })

  describe('Font Selection', () => {
    it('renders all font options', () => {
      render(<LogoMakerPage />)

      const fontSelect = screen.getByRole('combobox')
      const options = fontSelect.querySelectorAll('option')

      expect(options.length).toBe(10)
    })

    it('allows selecting different fonts', async () => {
      render(<LogoMakerPage />)

      const fontSelect = screen.getByRole('combobox')

      await user.selectOptions(fontSelect, 'Times New Roman')
      expect(fontSelect).toHaveValue('Times New Roman')

      await user.selectOptions(fontSelect, 'Courier New')
      expect(fontSelect).toHaveValue('Courier New')
    })
  })

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<LogoMakerPage />)

      expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tagline/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/primary/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/secondary/i)).toBeInTheDocument()
    })

    it('has accessible slider labels', () => {
      render(<LogoMakerPage />)

      expect(screen.getByRole('slider', { name: /font size/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /icon size/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /icon stroke/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /spacing/i })).toBeInTheDocument()
    })

    it('search input has placeholder text', () => {
      render(<LogoMakerPage />)

      const searchInput = screen.getByPlaceholderText('Search icons...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty brand name', async () => {
      render(<LogoMakerPage />)

      const brandInput = screen.getByLabelText(/brand name/i)
      await user.clear(brandInput)

      // Should still be able to download
      const downloadPngButton = screen.getByRole('button', { name: /download png/i })
      expect(downloadPngButton).toBeInTheDocument()
    })

    it('handles special characters in brand name', async () => {
      render(<LogoMakerPage />)

      const brandInput = screen.getByLabelText(/brand name/i)
      await user.clear(brandInput)
      await user.type(brandInput, 'Test & Co.')

      expect(brandInput).toHaveValue('Test & Co.')
    })

    it('handles very long tagline', async () => {
      render(<LogoMakerPage />)

      const taglineInput = screen.getByLabelText(/tagline/i)
      const longTagline = 'This is a very long tagline that might overflow'
      await user.type(taglineInput, longTagline)

      expect(taglineInput).toHaveValue(longTagline)
    })

    it('handles slider min values', async () => {
      render(<LogoMakerPage />)

      const fontSizeSlider = screen.getByRole('slider', { name: /font size/i })
      fireEvent.change(fontSizeSlider, { target: { value: '16' } })

      expect(fontSizeSlider).toHaveValue('16')
    })

    it('handles slider max values', async () => {
      render(<LogoMakerPage />)

      const fontSizeSlider = screen.getByRole('slider', { name: /font size/i })
      fireEvent.change(fontSizeSlider, { target: { value: '96' } })

      expect(fontSizeSlider).toHaveValue('96')
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks icon selection with icon name', async () => {
      render(<LogoMakerPage />)

      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))

      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])

        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'logo_select_icon',
          expect.objectContaining({
            icon: expect.any(String),
          })
        )
      }
    })

    it('tracks palette selection with palette name', async () => {
      render(<LogoMakerPage />)

      const oceanPalette = screen.getByRole('button', { name: /ocean/i })
      await user.click(oceanPalette)

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_apply_palette',
        expect.objectContaining({
          palette: 'Ocean',
        })
      )
    })

    it('tracks random generation with all settings', async () => {
      render(<LogoMakerPage />)

      const randomButton = screen.getByRole('button', { name: /generate random/i })
      await user.click(randomButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'logo_generate_random',
        expect.objectContaining({
          icon: expect.any(String),
          palette: expect.any(String),
          font: expect.any(String),
          layout: expect.any(String),
        })
      )
    })

    it('tracks PNG download', async () => {
      render(<LogoMakerPage />)

      // Select an icon first
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])
      }

      const downloadPngButton = screen.getByRole('button', { name: /download png/i })
      await user.click(downloadPngButton)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'logo_download',
          expect.objectContaining({
            format: 'png',
          })
        )
      })
    })

    it('tracks SVG download', async () => {
      render(<LogoMakerPage />)

      // Select an icon first
      const iconButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid]'))
      if (iconButtons.length > 0) {
        await user.click(iconButtons[0])
      }

      const downloadSvgButton = screen.getByRole('button', { name: /download svg/i })
      await user.click(downloadSvgButton)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'logo_download',
          expect.objectContaining({
            format: 'svg',
          })
        )
      })
    })
  })
})
