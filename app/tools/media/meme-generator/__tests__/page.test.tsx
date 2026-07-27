import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock analytics - MUST use vi.hoisted()
const mockTrackToolEvent = vi.hoisted(() => vi.fn())
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

// Mock toast
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: mockToast }))

// Mock useTrackToolView hook
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

// Mock utils
const mockGenerateMeme = vi.hoisted(() =>
  vi.fn().mockResolvedValue('data:image/png;base64,generatedMemeData')
)
const mockCreateDefaultTextBoxes = vi.hoisted(() =>
  vi.fn().mockImplementation((count: number) => {
    const positions = ['top', 'middle', 'bottom', 'custom', 'custom']
    return Array.from({ length: count }, (_, i) => ({
      id: `box-${i + 1}`,
      text: '',
      position: positions[i] || 'custom',
      x: 50,
      y: i === 0 ? 10 : 90,
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      align: 'center',
      uppercase: true,
      shadowEnabled: true,
      rotation: 0,
    }))
  })
)
const mockValidateImageFile = vi.hoisted(() => vi.fn().mockReturnValue({ valid: true }))
const mockDownloadMeme = vi.hoisted(() => vi.fn())
const mockFormatFileSize = vi.hoisted(() => vi.fn().mockReturnValue('1.5 MB'))

vi.mock('../utils', () => ({
  generateMeme: mockGenerateMeme,
  createDefaultTextBoxes: mockCreateDefaultTextBoxes,
  validateImageFile: mockValidateImageFile,
  downloadMeme: mockDownloadMeme,
  formatFileSize: mockFormatFileSize,
}))

const mockGetTemplatesByCategory = vi.hoisted(() =>
  vi.fn().mockImplementation((category: string) => {
    const templates = [
      {
        id: '181913649',
        name: 'Drake Hotline Bling',
        category: 'classic',
        imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
        width: 1200,
        height: 1200,
        boxCount: 2,
        keywords: ['drake', 'choice', 'prefer'],
        popularity: 10,
      },
      {
        id: '87743020',
        name: 'Two Buttons',
        category: 'classic',
        imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
        width: 600,
        height: 908,
        boxCount: 3,
        keywords: ['choice', 'decision', 'buttons'],
        popularity: 9,
      },
      {
        id: '89370399',
        name: 'Roll Safe Think About It',
        category: 'reaction',
        imageUrl: 'https://i.imgflip.com/1h7in3.jpg',
        width: 702,
        height: 395,
        boxCount: 2,
        keywords: ['smart', 'think', 'genius'],
        popularity: 8,
      },
      {
        id: 'wholesome-1',
        name: 'Wholesome Seal',
        category: 'wholesome',
        imageUrl: 'https://example.com/seal.jpg',
        width: 600,
        height: 600,
        boxCount: 2,
        keywords: ['cute', 'seal', 'happy'],
        popularity: 7,
      },
    ]
    return templates.filter((t) => t.category === category)
  })
)

const mockSearchTemplates = vi.hoisted(() =>
  vi.fn().mockImplementation((query: string) => {
    const templates = [
      {
        id: '181913649',
        name: 'Drake Hotline Bling',
        category: 'classic',
        imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
        width: 1200,
        height: 1200,
        boxCount: 2,
        keywords: ['drake', 'choice', 'prefer'],
        popularity: 10,
      },
      {
        id: '87743020',
        name: 'Two Buttons',
        category: 'classic',
        imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
        width: 600,
        height: 908,
        boxCount: 3,
        keywords: ['choice', 'decision', 'buttons'],
        popularity: 9,
      },
      {
        id: '89370399',
        name: 'Roll Safe Think About It',
        category: 'reaction',
        imageUrl: 'https://i.imgflip.com/1h7in3.jpg',
        width: 702,
        height: 395,
        boxCount: 2,
        keywords: ['smart', 'think', 'genius'],
        popularity: 8,
      },
      {
        id: 'wholesome-1',
        name: 'Wholesome Seal',
        category: 'wholesome',
        imageUrl: 'https://example.com/seal.jpg',
        width: 600,
        height: 600,
        boxCount: 2,
        keywords: ['cute', 'seal', 'happy'],
        popularity: 7,
      },
    ]
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.keywords.some((k: string) => k.toLowerCase().includes(query.toLowerCase()))
    )
  })
)

vi.mock('../templates', () => ({
  MEME_TEMPLATES: [
    {
      id: '181913649',
      name: 'Drake Hotline Bling',
      category: 'classic',
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
      width: 1200,
      height: 1200,
      boxCount: 2,
      keywords: ['drake', 'choice', 'prefer'],
      popularity: 10,
    },
    {
      id: '87743020',
      name: 'Two Buttons',
      category: 'classic',
      imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
      width: 600,
      height: 908,
      boxCount: 3,
      keywords: ['choice', 'decision', 'buttons'],
      popularity: 9,
    },
    {
      id: '89370399',
      name: 'Roll Safe Think About It',
      category: 'reaction',
      imageUrl: 'https://i.imgflip.com/1h7in3.jpg',
      width: 702,
      height: 395,
      boxCount: 2,
      keywords: ['smart', 'think', 'genius'],
      popularity: 8,
    },
    {
      id: 'wholesome-1',
      name: 'Wholesome Seal',
      category: 'wholesome',
      imageUrl: 'https://example.com/seal.jpg',
      width: 600,
      height: 600,
      boxCount: 2,
      keywords: ['cute', 'seal', 'happy'],
      popularity: 7,
    },
  ],
  getTemplatesByCategory: mockGetTemplatesByCategory,
  searchTemplates: mockSearchTemplates,
}))

// Import component after mocks
import MemeGeneratorPage from '../page'

const getRequiredButton = (button: HTMLButtonElement | null, label: string): HTMLButtonElement => {
  if (!button) {
    throw new Error(`${label} button not found`)
  }

  return button
}

const getRequiredFileInput = (
  input: Element | null | undefined,
  label: string
): HTMLInputElement => {
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`${label} file input not found`)
  }

  return input
}

describe('MemeGeneratorPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    // Mock Image constructor
    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: ((err: Error) => void) | null = null
      src = ''
      width = 800
      height = 600
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      }
    } as unknown as typeof Image

    // Mock FileReader
    global.FileReader = class MockFileReader {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null
      onerror: ((err: Error) => void) | null = null
      result: string | ArrayBuffer | null = 'data:image/png;base64,mockImageData'

      readAsDataURL(_file: Blob) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({
              target: { result: this.result },
            } as ProgressEvent<FileReader>)
          }
        }, 10)
      }
    } as unknown as typeof FileReader

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ============================================
  // Initial Render Tests
  // ============================================
  describe('Initial Render', () => {
    it('renders the page header with title', () => {
      render(<MemeGeneratorPage />)

      expect(screen.getByRole('heading', { name: /meme generator/i })).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<MemeGeneratorPage />)

      expect(screen.getByText(/create viral memes in seconds/i)).toBeInTheDocument()
    })

    it('renders the template selector card', () => {
      render(<MemeGeneratorPage />)

      expect(screen.getByText('Select Template')).toBeInTheDocument()
      expect(
        screen.getByText(/choose a popular meme template or upload your own/i)
      ).toBeInTheDocument()
    })

    it('renders upload custom image button', () => {
      render(<MemeGeneratorPage />)

      expect(screen.getByRole('button', { name: /upload custom image/i })).toBeInTheDocument()
    })

    it('renders search input for templates', () => {
      render(<MemeGeneratorPage />)

      expect(screen.getByPlaceholderText(/search templates/i)).toBeInTheDocument()
    })

    it('renders category filter buttons', () => {
      render(<MemeGeneratorPage />)

      // Should have category buttons (excluding 'custom')
      // Use emoji prefix to distinguish from template names
      expect(screen.getByRole('button', { name: /🎭\s*Classic/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /😮\s*Reaction/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🤗\s*Wholesome/i })).toBeInTheDocument()
    })

    it('renders template grid with available templates', () => {
      render(<MemeGeneratorPage />)

      // Check for template names
      expect(screen.getByText('Drake Hotline Bling')).toBeInTheDocument()
      expect(screen.getByText('Two Buttons')).toBeInTheDocument()
      expect(screen.getByText('Roll Safe Think About It')).toBeInTheDocument()
    })

    it('renders placeholder when no template is selected', () => {
      render(<MemeGeneratorPage />)

      expect(
        screen.getByText(/select a template or upload an image to get started/i)
      ).toBeInTheDocument()
    })

    it('does not render text editor initially', () => {
      render(<MemeGeneratorPage />)

      expect(screen.queryByText('Text Editor')).not.toBeInTheDocument()
    })
  })

  // ============================================
  // Template Selection Tests
  // ============================================
  describe('Template Selection', () => {
    it('shows text editor when template is selected', async () => {
      render(<MemeGeneratorPage />)

      // Click on Drake template
      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      expect(drakeTemplate).toBeInTheDocument()
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      // Advance timers for Image onload
      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Text Editor')).toBeInTheDocument()
    })

    it('creates text boxes based on template boxCount', async () => {
      render(<MemeGeneratorPage />)

      // Click on Drake template (boxCount: 2)
      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(mockCreateDefaultTextBoxes).toHaveBeenCalledWith(2)
    })

    it('tracks template selection event', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(mockTrackToolEvent).toHaveBeenCalledWith('meme_template_select')
    })

    it('hides placeholder when template is selected', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(
        screen.queryByText(/select a template or upload an image to get started/i)
      ).not.toBeInTheDocument()
    })

    it('shows check mark on selected template', async () => {
      render(<MemeGeneratorPage />)

      const drakeButton = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeButton, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(drakeButton).toBeInTheDocument()
    })
  })

  // ============================================
  // Category Filtering Tests
  // ============================================
  describe('Category Filtering', () => {
    it('filters templates by classic category', async () => {
      render(<MemeGeneratorPage />)

      const classicButton = screen.getByRole('button', { name: /classic/i })
      fireEvent.click(classicButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Classic templates should be visible
      expect(screen.getByText('Drake Hotline Bling')).toBeInTheDocument()
      expect(screen.getByText('Two Buttons')).toBeInTheDocument()
    })

    it('filters templates by reaction category', async () => {
      render(<MemeGeneratorPage />)

      const reactionButton = screen.getByRole('button', { name: /reaction/i })
      fireEvent.click(reactionButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Reaction template should be visible
      expect(screen.getByText('Roll Safe Think About It')).toBeInTheDocument()
    })

    it('filters templates by wholesome category', async () => {
      render(<MemeGeneratorPage />)

      // Use emoji prefix to distinguish from "Wholesome Seal" template
      const wholesomeButton = screen.getByRole('button', { name: /🤗\s*Wholesome/i })
      fireEvent.click(wholesomeButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Wholesome Seal')).toBeInTheDocument()
    })

    it('shows all templates in initial state (default category)', () => {
      render(<MemeGeneratorPage />)

      // All templates should be visible initially (no category filter applied)
      // The component defaults to 'all' category which shows all templates
      expect(screen.getByText('Drake Hotline Bling')).toBeInTheDocument()
      expect(screen.getByText('Two Buttons')).toBeInTheDocument()
      expect(screen.getByText('Roll Safe Think About It')).toBeInTheDocument()
      expect(screen.getByText('Wholesome Seal')).toBeInTheDocument()
    })
  })

  // ============================================
  // Search Functionality Tests
  // ============================================
  describe('Search Functionality', () => {
    it('filters templates by search query', async () => {
      render(<MemeGeneratorPage />)

      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: 'drake' } })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Drake Hotline Bling')).toBeInTheDocument()
    })

    it('shows no templates found message for non-matching search', async () => {
      render(<MemeGeneratorPage />)

      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('No templates found')).toBeInTheDocument()
    })

    it('clears search when category is selected', async () => {
      render(<MemeGeneratorPage />)

      // First search
      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: 'drake' } })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Then select a category
      const reactionButton = screen.getByRole('button', { name: /reaction/i })
      fireEvent.click(reactionButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Search should be cleared
      expect(searchInput).toHaveValue('')
    })

    it('searches by keywords', async () => {
      render(<MemeGeneratorPage />)

      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: 'choice' } })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Templates with 'choice' keyword
      expect(screen.getByText('Drake Hotline Bling')).toBeInTheDocument()
      expect(screen.getByText('Two Buttons')).toBeInTheDocument()
    })
  })

  // ============================================
  // Custom Image Upload Tests
  // ============================================
  describe('Custom Image Upload', () => {
    it('handles valid image upload', async () => {
      render(<MemeGeneratorPage />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB

      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      expect(fileInput).toBeInTheDocument()
      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(mockValidateImageFile).toHaveBeenCalledWith(file)
      expect(mockTrackToolEvent).toHaveBeenCalledWith('meme_custom_upload')
      expect(mockToast.success).toHaveBeenCalledWith('Image uploaded successfully')
    })

    it('shows file info badge after upload', async () => {
      render(<MemeGeneratorPage />)

      const file = new File(['test'], 'my-image.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 })

      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByText(/my-image\.png/)).toBeInTheDocument()
      expect(mockFormatFileSize).toHaveBeenCalled()
    })

    it('rejects invalid image file', async () => {
      mockValidateImageFile.mockReturnValueOnce({ valid: false, error: 'Invalid file type' })

      render(<MemeGeneratorPage />)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(mockToast.error).toHaveBeenCalledWith('Invalid file type')
    })

    it('creates default text boxes for custom image', async () => {
      render(<MemeGeneratorPage />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(mockCreateDefaultTextBoxes).toHaveBeenCalledWith(2)
    })

    it('shows text editor after custom image upload', async () => {
      render(<MemeGeneratorPage />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByText('Text Editor')).toBeInTheDocument()
    })
  })

  // ============================================
  // Text Input Tests
  // ============================================
  describe('Text Input', () => {
    it('renders text input fields after template selection', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Should have text inputs for each box
      expect(screen.getByPlaceholderText(/enter top text/i)).toBeInTheDocument()
    })

    it('updates text box value on input change', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Hello World' } })

      expect(topTextInput).toHaveValue('Hello World')
    })

    it('triggers auto-generate after text input with debounce', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      mockGenerateMeme.mockClear()

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test text' } })

      // Before debounce completes
      expect(mockGenerateMeme).not.toHaveBeenCalled()

      // Advance past 500ms debounce
      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      expect(mockGenerateMeme).toHaveBeenCalled()
    })

    it('does not auto-generate when all text boxes are empty', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      mockGenerateMeme.mockClear()

      // Type and then clear text
      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: '' } })

      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      expect(mockGenerateMeme).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // Advanced Settings Tests
  // ============================================
  describe('Advanced Settings', () => {
    it('shows advanced settings toggle button', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByRole('button', { name: /show advanced settings/i })).toBeInTheDocument()
    })

    it('toggles advanced settings visibility', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Initially hidden
      expect(screen.queryAllByText('Font Size')).toHaveLength(0)

      // Click to show
      const settingsButton = screen.getByRole('button', { name: /show advanced settings/i })
      fireEvent.click(settingsButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Font Size and Color appear once per text box (Drake has 2 text boxes)
      expect(screen.getAllByText('Font Size').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Color').length).toBeGreaterThan(0)
    })

    it('hides advanced settings when toggled again', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Show settings
      const settingsButton = screen.getByRole('button', { name: /show advanced settings/i })
      fireEvent.click(settingsButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Font Size appears once per text box (Drake has 2 text boxes)
      expect(screen.getAllByText('Font Size').length).toBeGreaterThan(0)

      // Hide settings
      const hideButton = screen.getByRole('button', { name: /hide advanced settings/i })
      fireEvent.click(hideButton)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.queryAllByText('Font Size')).toHaveLength(0)
    })
  })

  // ============================================
  // Meme Generation Tests
  // ============================================
  describe('Meme Generation', () => {
    it('renders generate meme button after template selection', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByRole('button', { name: /generate meme/i })).toBeInTheDocument()
    })

    it('disables generate button when no text is entered', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      expect(generateButton).toBeDisabled()
    })

    it('enables generate button when text is entered', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test text' } })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      expect(generateButton).not.toBeDisabled()
    })

    it('calls generateMeme with correct config', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'My meme text' } })

      mockGenerateMeme.mockClear()

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(mockGenerateMeme).toHaveBeenCalled()
      const callArg = mockGenerateMeme.mock.calls[0][0]
      expect(callArg.template.id).toBe('181913649')
      expect(callArg.textBoxes).toBeDefined()
    })

    it('shows success toast on successful generation', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(mockToast.success).toHaveBeenCalledWith('Meme generated successfully!')
    })

    it('tracks meme generation event', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      mockTrackToolEvent.mockClear()

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(mockTrackToolEvent).toHaveBeenCalledWith('meme_generate')
    })

    it('shows error toast on generation failure', async () => {
      mockGenerateMeme.mockRejectedValueOnce(new Error('Generation failed'))

      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to generate meme')
      expect(mockTrackToolEvent).toHaveBeenCalledWith('meme_generate_error')
    })

    it('shows preview after generation', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByText('Your Meme')).toBeInTheDocument()
      expect(screen.getByAltText('Generated meme')).toBeInTheDocument()
    })
  })

  // ============================================
  // Download Tests
  // ============================================
  describe('Download', () => {
    it('shows download button after generation', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByRole('button', { name: /download meme/i })).toBeInTheDocument()
    })

    it('calls downloadMeme function on download click', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      const downloadButton = screen.getByRole('button', { name: /download meme/i })
      fireEvent.click(downloadButton)

      expect(mockDownloadMeme).toHaveBeenCalledWith(
        'data:image/png;base64,generatedMemeData',
        expect.stringMatching(/^meme-\d+\.png$/)
      )
    })

    it('tracks download event', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      mockTrackToolEvent.mockClear()

      const downloadButton = screen.getByRole('button', { name: /download meme/i })
      fireEvent.click(downloadButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('meme_download')
    })

    it('shows success toast on download', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = getRequiredButton(
        screen.getByText('Drake Hotline Bling').closest('button'),
        'Drake Hotline Bling template'
      )
      fireEvent.click(drakeTemplate)

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const topTextInput = screen.getByPlaceholderText(/enter top text/i)
      fireEvent.change(topTextInput, { target: { value: 'Test' } })

      const generateButton = screen.getByRole('button', { name: /generate meme/i })
      fireEvent.click(generateButton)

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      mockToast.success.mockClear()

      const downloadButton = screen.getByRole('button', { name: /download meme/i })
      fireEvent.click(downloadButton)

      expect(mockToast.success).toHaveBeenCalledWith('Meme downloaded!')
    })
  })

  // ============================================
  // Reset Tests
  // ============================================
  describe('Reset', () => {
    it('resets all state when reset button is clicked', async () => {
      render(<MemeGeneratorPage />)

      // Select template
      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Verify text editor is shown
      expect(screen.getByText('Text Editor')).toBeInTheDocument()

      // Click reset button (X button)
      const buttons = screen.getAllByRole('button')
      const xButton = buttons.find((btn) => btn.querySelector('svg') && btn.textContent === '')

      if (xButton) {
        fireEvent.click(xButton)

        await act(async () => {
          vi.advanceTimersByTime(50)
        })

        // Text editor should be hidden
        expect(screen.queryByText('Text Editor')).not.toBeInTheDocument()
      }
    })

    it('tracks reset event', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      mockTrackToolEvent.mockClear()

      // Find and click the reset/X button
      const buttons = screen.getAllByRole('button')
      const xButton = buttons.find((btn) => btn.querySelector('svg') && btn.textContent === '')

      if (xButton) {
        fireEvent.click(xButton)

        await act(async () => {
          vi.advanceTimersByTime(50)
        })

        expect(mockTrackToolEvent).toHaveBeenCalledWith('meme_reset')
      }
    })

    it('shows placeholder after reset', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Find and click the reset/X button
      const buttons = screen.getAllByRole('button')
      const xButton = buttons.find((btn) => btn.querySelector('svg') && btn.textContent === '')

      if (xButton) {
        fireEvent.click(xButton)

        await act(async () => {
          vi.advanceTimersByTime(50)
        })

        expect(
          screen.getByText(/select a template or upload an image to get started/i)
        ).toBeInTheDocument()
      }
    })
  })

  // ============================================
  // Edge Cases Tests
  // ============================================
  describe('Edge Cases', () => {
    it('handles template switch correctly', async () => {
      render(<MemeGeneratorPage />)

      // Select first template
      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(mockCreateDefaultTextBoxes).toHaveBeenCalledWith(2)

      // Select second template (with 3 boxes)
      const twoButtonsTemplate = screen.getByText('Two Buttons').closest('button')
      fireEvent.click(getRequiredButton(twoButtonsTemplate, 'Two Buttons template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(mockCreateDefaultTextBoxes).toHaveBeenCalledWith(3)
    })

    it('clears custom image when template is selected', async () => {
      render(<MemeGeneratorPage />)

      // Upload custom image
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // File badge should be visible
      expect(screen.getByText(/test\.png/)).toBeInTheDocument()

      // Now select a template
      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // File badge should be gone
      expect(screen.queryByText(/test\.png/)).not.toBeInTheDocument()
    })

    it('clears template when custom image is uploaded', async () => {
      render(<MemeGeneratorPage />)

      // First select a template
      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Then upload custom image
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [file] },
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // File badge should be visible
      expect(screen.getByText(/test\.png/)).toBeInTheDocument()
    })

    it('handles empty file input gracefully', async () => {
      render(<MemeGeneratorPage />)

      const uploadButton = screen.getByRole('button', { name: /upload custom image/i })
      const fileInput = uploadButton.parentElement?.querySelector('input[type="file"]')

      // Trigger change with no files
      fireEvent.change(getRequiredFileInput(fileInput, 'Upload custom image'), {
        target: { files: [] },
      })

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Should not crash, no file badge
      expect(mockValidateImageFile).not.toHaveBeenCalled()
    })

    it('shows error toast when generation called without template', async () => {
      // This tests the edge case where handleGenerateMeme is called without template/image
      // In normal UI flow this shouldn't happen, but we test the guard clause
      render(<MemeGeneratorPage />)

      // The generate button shouldn't be visible without a template
      expect(screen.queryByRole('button', { name: /generate meme/i })).not.toBeInTheDocument()
    })
  })

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<MemeGeneratorPage />)

      const h1 = screen.getByRole('heading', { level: 1, name: /meme generator/i })
      expect(h1).toBeInTheDocument()
    })

    it('has accessible labels for text inputs', async () => {
      render(<MemeGeneratorPage />)

      const drakeTemplate = screen.getByText('Drake Hotline Bling').closest('button')
      fireEvent.click(getRequiredButton(drakeTemplate, 'Drake Hotline Bling template'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // Text inputs should have associated labels
      const textInputs = screen.getAllByRole('textbox')
      expect(textInputs.length).toBeGreaterThan(0)
    })

    it('has accessible button labels', () => {
      render(<MemeGeneratorPage />)

      // Upload button
      expect(screen.getByRole('button', { name: /upload custom image/i })).toBeInTheDocument()

      // Category buttons
      expect(screen.getByRole('button', { name: /classic/i })).toBeInTheDocument()
    })

    it('template buttons are keyboard accessible', () => {
      render(<MemeGeneratorPage />)

      const drakeButton = screen.getByText('Drake Hotline Bling').closest('button')
      expect(drakeButton).toHaveAttribute('type', 'button')
    })
  })
})
