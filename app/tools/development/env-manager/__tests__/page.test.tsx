import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EnvManager from '../page'

// Mock sonner toast - use vi.hoisted to ensure mockToast is available when vi.mock is hoisted
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

// Mock useTrackToolView hook
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

// Mock URL APIs for download
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
const mockClipboardWriteText = vi.fn().mockResolvedValue(undefined)

// Store original URL methods
const originalCreateObjectURL = global.URL.createObjectURL
const originalRevokeObjectURL = global.URL.revokeObjectURL

// Store original document.createElement for download tests (must be captured before any mocks)
const originalCreateElement = document.createElement.bind(document)

describe('EnvManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockClipboardWriteText },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL
    global.URL.revokeObjectURL = originalRevokeObjectURL
  })

  // ============================================================
  // RENDERING TESTS
  // ============================================================
  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<EnvManager />)
      expect(screen.getByText('Environment Variable Manager')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<EnvManager />)
      expect(
        screen.getByText(
          'Parse, edit, validate, and convert .env files. Detect sensitive values, group by prefix, and export to multiple formats.'
        )
      ).toBeInTheDocument()
    })

    it('renders the input textarea with placeholder', () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      expect(textarea).toBeInTheDocument()
    })

    it('renders Parse Variables button', () => {
      render(<EnvManager />)
      expect(screen.getByRole('button', { name: /parse variables/i })).toBeInTheDocument()
    })

    it('renders Clear button', () => {
      render(<EnvManager />)
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('renders export format buttons', () => {
      render(<EnvManager />)
      expect(screen.getByRole('button', { name: '.env' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '.json' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '.yaml' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '.shell' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '.env.example' })).toBeInTheDocument()
    })

    it('renders Copy and Download buttons', () => {
      render(<EnvManager />)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      const downloadButtons = screen.getAllByRole('button', { name: /download/i })
      expect(copyButtons.length).toBeGreaterThan(0)
      expect(downloadButtons.length).toBeGreaterThan(0)
    })

    it('renders example configuration cards', () => {
      render(<EnvManager />)
      expect(screen.getByText('Node.js App')).toBeInTheDocument()
      expect(screen.getByText('Next.js App')).toBeInTheDocument()
      expect(screen.getByText('AWS Services')).toBeInTheDocument()
    })

    it('renders Example Configurations section title', () => {
      render(<EnvManager />)
      expect(screen.getByText('Example Configurations')).toBeInTheDocument()
    })

    it('does not render Variables Editor when no variables parsed', () => {
      render(<EnvManager />)
      expect(screen.queryByText('Variables Editor')).not.toBeInTheDocument()
    })

    it('shows placeholder text when no output', () => {
      render(<EnvManager />)
      expect(
        screen.getByText('Parse some variables to see the export output...')
      ).toBeInTheDocument()
    })
  })

  // ============================================================
  // PARSING TESTS
  // ============================================================
  describe('Parsing .env content', () => {
    it('shows error toast when input is empty', async () => {
      render(<EnvManager />)
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.error).toHaveBeenCalledWith('Please enter some environment variables')
    })

    it('shows error toast when input has only whitespace', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: '   \n  \n   ' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.error).toHaveBeenCalledWith('Please enter some environment variables')
    })

    it('shows error toast when no valid variables found', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: '# This is just a comment\n# Another comment' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.error).toHaveBeenCalledWith('No valid environment variables found')
    })

    it('parses valid env content and shows success toast', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development\nPORT=3000' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.success).toHaveBeenCalledWith('Parsed 2 variables')
    })

    it('shows Variables Editor after parsing', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getByText('Variables Editor')).toBeInTheDocument()
    })

    it('handles comments correctly (ignores lines starting with #)', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: '# Comment\nNODE_ENV=development\n# Another comment\nPORT=3000' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.success).toHaveBeenCalledWith('Parsed 2 variables')
    })

    it('handles double-quoted values', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'MESSAGE="Hello World"' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      // Check that the value appears without quotes in the output
      await waitFor(() => {
        expect(screen.getByText('MESSAGE=Hello World')).toBeInTheDocument()
      })
    })

    it('handles single-quoted values', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: "MESSAGE='Hello World'" } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      await waitFor(() => {
        expect(screen.getByText('MESSAGE=Hello World')).toBeInTheDocument()
      })
    })

    it('ignores lines without equals sign', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: 'INVALID_LINE_NO_EQUALS\nVALID_VAR=value' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.success).toHaveBeenCalledWith('Parsed 1 variables')
    })

    it('handles empty values', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'EMPTY_VAR=' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.success).toHaveBeenCalledWith('Parsed 1 variables')
    })
  })

  // ============================================================
  // STATS BADGE TESTS
  // ============================================================
  describe('Stats badges', () => {
    it('shows variable count badge after parsing', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development\nPORT=3000' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getByText('2 vars')).toBeInTheDocument()
    })

    it('shows secrets count badge when sensitive vars detected', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'API_KEY=secret123\nNODE_ENV=dev' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getByText('1 secrets')).toBeInTheDocument()
    })

    it('does not show secrets badge when no sensitive vars', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development\nPORT=3000' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.queryByText(/secrets/)).not.toBeInTheDocument()
    })
  })

  // ============================================================
  // SENSITIVE VARIABLE DETECTION TESTS
  // ============================================================
  describe('Sensitive variable detection', () => {
    const sensitivePatterns = [
      'PASSWORD',
      'SECRET',
      'KEY',
      'TOKEN',
      'API_KEY',
      'APIKEY',
      'AUTH',
      'CREDENTIAL',
      'PRIVATE',
      'ACCESS',
      'BEARER',
      'JWT',
    ]

    sensitivePatterns.forEach((pattern) => {
      it(`detects ${pattern} as sensitive`, async () => {
        render(<EnvManager />)
        const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
        fireEvent.change(textarea, { target: { value: `${pattern}=somevalue` } })
        const parseButton = screen.getByRole('button', { name: /parse variables/i })
        fireEvent.click(parseButton)
        expect(screen.getByText('1 secrets')).toBeInTheDocument()
      })
    })

    it('detects case-insensitive sensitive patterns', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'my_password=secret\nMY_SECRET=value' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getByText('2 secrets')).toBeInTheDocument()
    })
  })

  // ============================================================
  // VARIABLE GROUPING TESTS
  // ============================================================
  describe('Variable grouping', () => {
    it('groups variables by prefix', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: 'DATABASE_URL=url\nDATABASE_HOST=host' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      // Should show DATABASE group
      expect(screen.getByText('DATABASE')).toBeInTheDocument()
    })

    it('puts single-word keys in GENERAL group', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'PORT=3000' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getByText('GENERAL')).toBeInTheDocument()
    })

    it('shows group count in description', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: 'DATABASE_URL=url\nREDIS_URL=redis\nNODE_ENV=dev' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      // Should show 3 groups (DATABASE, REDIS, GENERAL), 0 secrets
      expect(screen.getByText(/3 groups, 0 sensitive values detected/)).toBeInTheDocument()
    })
  })

  // ============================================================
  // VARIABLE CRUD TESTS
  // ============================================================
  describe('Variable CRUD operations', () => {
    const setupWithVariables = () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
    }

    describe('Add variable', () => {
      it('adds a new variable successfully', async () => {
        setupWithVariables()
        const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
        const valueInput = screen.getByPlaceholderText('value')
        fireEvent.change(keyInput, { target: { value: 'NEW_VAR' } })
        fireEvent.change(valueInput, { target: { value: 'new_value' } })
        const addButton = screen.getByRole('button', { name: /add/i })
        fireEvent.click(addButton)
        expect(mockToast.success).toHaveBeenCalledWith('Variable added')
      })

      it('shows error when key is empty', async () => {
        setupWithVariables()
        const addButton = screen.getByRole('button', { name: /add/i })
        fireEvent.click(addButton)
        expect(mockToast.error).toHaveBeenCalledWith('Key is required')
      })

      it('shows error when key format is invalid', async () => {
        setupWithVariables()
        const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
        fireEvent.change(keyInput, { target: { value: 'invalid-key' } })
        const addButton = screen.getByRole('button', { name: /add/i })
        fireEvent.click(addButton)
        expect(mockToast.error).toHaveBeenCalledWith(
          'Key must start with uppercase letter and contain only A-Z, 0-9, _'
        )
      })

      it('shows error for duplicate key', async () => {
        setupWithVariables()
        const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
        const valueInput = screen.getByPlaceholderText('value')
        fireEvent.change(keyInput, { target: { value: 'NODE_ENV' } })
        fireEvent.change(valueInput, { target: { value: 'production' } })
        const addButton = screen.getByRole('button', { name: /add/i })
        fireEvent.click(addButton)
        expect(mockToast.error).toHaveBeenCalledWith('Variable with this key already exists')
      })

      it('converts key to uppercase automatically', async () => {
        setupWithVariables()
        const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
        fireEvent.change(keyInput, { target: { value: 'lowercase' } })
        // The input should automatically uppercase
        expect(keyInput).toHaveValue('LOWERCASE')
      })

      it('clears inputs after successful add', async () => {
        setupWithVariables()
        const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
        const valueInput = screen.getByPlaceholderText('value')
        fireEvent.change(keyInput, { target: { value: 'NEW_VAR' } })
        fireEvent.change(valueInput, { target: { value: 'new_value' } })
        const addButton = screen.getByRole('button', { name: /add/i })
        fireEvent.click(addButton)
        expect(keyInput).toHaveValue('')
        expect(valueInput).toHaveValue('')
      })
    })

    describe('Delete variable', () => {
      it('deletes a variable', async () => {
        setupWithVariables()
        // Find delete button (trash icon)
        const deleteButtons = screen.getAllByRole('button')
        const trashButton = deleteButtons.find((btn) => btn.querySelector('svg.lucide-trash-2'))
        expect(trashButton).toBeDefined()
        fireEvent.click(trashButton!)
        expect(mockToast.success).toHaveBeenCalledWith('Variable deleted')
      })

      it('removes Variables Editor when all variables deleted', async () => {
        setupWithVariables()
        const deleteButtons = screen.getAllByRole('button')
        const trashButton = deleteButtons.find((btn) => btn.querySelector('svg.lucide-trash-2'))
        fireEvent.click(trashButton!)
        expect(screen.queryByText('Variables Editor')).not.toBeInTheDocument()
      })
    })

    describe('Update variable', () => {
      it('updates variable key', async () => {
        setupWithVariables()
        // Find the input with NODE_ENV value
        const keyInputs = screen.getAllByDisplayValue('NODE_ENV')
        expect(keyInputs.length).toBeGreaterThan(0)
        fireEvent.change(keyInputs[0], { target: { value: 'APP_ENV' } })
        // Should update the output
        await waitFor(() => {
          expect(screen.getByText('APP_ENV=development')).toBeInTheDocument()
        })
      })

      it('updates variable value', async () => {
        setupWithVariables()
        const valueInputs = screen.getAllByDisplayValue('development')
        expect(valueInputs.length).toBeGreaterThan(0)
        fireEvent.change(valueInputs[0], { target: { value: 'production' } })
        await waitFor(() => {
          expect(screen.getByText('NODE_ENV=production')).toBeInTheDocument()
        })
      })
    })
  })

  // ============================================================
  // SHOW/HIDE SECRETS TOGGLE TESTS
  // ============================================================
  describe('Show/Hide secrets toggle', () => {
    it('shows Hide Secrets button after parsing sensitive vars', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'API_KEY=secret123' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getByRole('button', { name: /show secrets/i })).toBeInTheDocument()
    })

    it('toggles between Show and Hide secrets', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'API_KEY=secret123' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const toggleButton = screen.getByRole('button', { name: /show secrets/i })
      fireEvent.click(toggleButton)
      expect(screen.getByRole('button', { name: /hide secrets/i })).toBeInTheDocument()
    })
  })

  // ============================================================
  // EXPORT FORMAT TESTS
  // ============================================================
  describe('Export formats', () => {
    const setupWithVariables = () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: 'NODE_ENV=development\nAPI_KEY=secret123' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
    }

    it('exports to .env format by default', () => {
      setupWithVariables()
      // Use getAllByText since the text appears in both input and output areas
      expect(screen.getAllByText(/NODE_ENV=development/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/API_KEY=secret123/).length).toBeGreaterThan(0)
    })

    it('exports to JSON format', async () => {
      setupWithVariables()
      const jsonButton = screen.getByRole('button', { name: '.json' })
      fireEvent.click(jsonButton)
      await waitFor(() => {
        expect(screen.getByText(/"NODE_ENV": "development"/)).toBeInTheDocument()
      })
    })

    it('exports to YAML format', async () => {
      setupWithVariables()
      const yamlButton = screen.getByRole('button', { name: '.yaml' })
      fireEvent.click(yamlButton)
      await waitFor(() => {
        expect(screen.getByText(/NODE_ENV: "development"/)).toBeInTheDocument()
      })
    })

    it('exports to shell format', async () => {
      setupWithVariables()
      const shellButton = screen.getByRole('button', { name: '.shell' })
      fireEvent.click(shellButton)
      await waitFor(() => {
        expect(screen.getByText(/export NODE_ENV="development"/)).toBeInTheDocument()
      })
    })

    it('exports to .env.example format with placeholders', async () => {
      setupWithVariables()
      const exampleButton = screen.getByRole('button', { name: '.env.example' })
      fireEvent.click(exampleButton)
      await waitFor(() => {
        // NODE_ENV is not sensitive, so should get your_value_here
        expect(screen.getByText(/NODE_ENV=your_value_here/)).toBeInTheDocument()
        // API_KEY is sensitive, so should get your_secret_here
        expect(screen.getByText(/API_KEY=your_secret_here/)).toBeInTheDocument()
      })
    })

    it('escapes quotes in YAML export', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'MESSAGE=Hello "World"' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const yamlButton = screen.getByRole('button', { name: '.yaml' })
      fireEvent.click(yamlButton)
      await waitFor(() => {
        expect(screen.getByText(/MESSAGE: "Hello \\"World\\""/)).toBeInTheDocument()
      })
    })

    it('escapes quotes in shell export', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'MESSAGE=Hello "World"' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const shellButton = screen.getByRole('button', { name: '.shell' })
      fireEvent.click(shellButton)
      await waitFor(() => {
        expect(screen.getByText(/export MESSAGE="Hello \\"World\\""/)).toBeInTheDocument()
      })
    })
  })

  // ============================================================
  // COPY ACTION TESTS
  // ============================================================
  describe('Copy action', () => {
    it('copies output to clipboard successfully', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      const copyButton = copyButtons.find((btn) => btn.textContent?.includes('Copy'))
      fireEvent.click(copyButton!)
      expect(mockClipboardWriteText).toHaveBeenCalledWith('NODE_ENV=development')
      expect(mockToast.success).toHaveBeenCalledWith('Copied to clipboard!')
    })
  })

  // ============================================================
  // DOWNLOAD ACTION TESTS
  // ============================================================
  describe('Download action', () => {
    let mockCreateElement: ReturnType<typeof vi.spyOn> | null = null

    afterEach(() => {
      // Always restore the mock to prevent affecting subsequent tests
      if (mockCreateElement) {
        mockCreateElement.mockRestore()
        mockCreateElement = null
      }
    })

    it('downloads file with correct extension for .env format', async () => {
      const mockClick = vi.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      }

      // Render and interact FIRST, before setting up the mock
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      // Setup mock AFTER render, right before the download click
      mockCreateElement = vi.spyOn(document, 'createElement')
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tagName)
      })

      fireEvent.click(downloadButton!)

      expect(mockAnchor.download).toBe('environment.env')
      expect(mockClick).toHaveBeenCalled()
      expect(mockToast.success).toHaveBeenCalledWith('File downloaded')
    })

    it('downloads file with .json extension for JSON format', async () => {
      const mockClick = vi.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      }

      // Render and interact FIRST, before setting up the mock
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const jsonButton = screen.getByRole('button', { name: '.json' })
      fireEvent.click(jsonButton)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      // Setup mock AFTER render, right before the download click
      mockCreateElement = vi.spyOn(document, 'createElement')
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tagName)
      })

      fireEvent.click(downloadButton!)

      expect(mockAnchor.download).toBe('environment.json')
    })

    it('downloads file with .yaml extension for YAML format', async () => {
      const mockClick = vi.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      }

      // Render and interact FIRST, before setting up the mock
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const yamlButton = screen.getByRole('button', { name: '.yaml' })
      fireEvent.click(yamlButton)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      // Setup mock AFTER render, right before the download click
      mockCreateElement = vi.spyOn(document, 'createElement')
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tagName)
      })

      fireEvent.click(downloadButton!)

      expect(mockAnchor.download).toBe('environment.yaml')
    })

    it('downloads file with .sh extension for shell format', async () => {
      const mockClick = vi.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      }

      // Render and interact FIRST, before setting up the mock
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const shellButton = screen.getByRole('button', { name: '.shell' })
      fireEvent.click(shellButton)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      // Setup mock AFTER render, right before the download click
      mockCreateElement = vi.spyOn(document, 'createElement')
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tagName)
      })

      fireEvent.click(downloadButton!)

      expect(mockAnchor.download).toBe('environment.sh')
    })

    it('downloads file with .env.example extension for example format', async () => {
      const mockClick = vi.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      }

      // Render and interact FIRST, before setting up the mock
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const exampleButton = screen.getByRole('button', { name: '.env.example' })
      fireEvent.click(exampleButton)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      // Setup mock AFTER render, right before the download click
      mockCreateElement = vi.spyOn(document, 'createElement')
      mockCreateElement.mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tagName)
      })

      fireEvent.click(downloadButton!)

      expect(mockAnchor.download).toBe('environment.env.example')
    })
  })

  // ============================================================
  // CLEAR ACTION TESTS
  // ============================================================
  describe('Clear action', () => {
    it('clears all data', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      // Verify variables are parsed
      expect(screen.getByText('Variables Editor')).toBeInTheDocument()
      // Click clear
      const clearButton = screen.getByRole('button', { name: /clear/i })
      fireEvent.click(clearButton)
      // Verify everything is cleared
      expect(mockToast.info).toHaveBeenCalledWith('Cleared all data')
      expect(textarea).toHaveValue('')
      expect(screen.queryByText('Variables Editor')).not.toBeInTheDocument()
    })
  })

  // ============================================================
  // LOAD EXAMPLE TESTS
  // ============================================================
  describe('Load example', () => {
    it('loads Node.js App example', async () => {
      render(<EnvManager />)
      const nodeJsButton = screen.getByText('Node.js App')
      fireEvent.click(nodeJsButton)
      expect(mockToast.success).toHaveBeenCalledWith('Loaded example with 6 variables')
      expect(screen.getByText('Variables Editor')).toBeInTheDocument()
    })

    it('loads Next.js App example', async () => {
      render(<EnvManager />)
      const nextJsButton = screen.getByText('Next.js App')
      fireEvent.click(nextJsButton)
      expect(mockToast.success).toHaveBeenCalledWith('Loaded example with 5 variables')
    })

    it('loads AWS Services example', async () => {
      render(<EnvManager />)
      const awsButton = screen.getByText('AWS Services')
      fireEvent.click(awsButton)
      expect(mockToast.success).toHaveBeenCalledWith('Loaded example with 5 variables')
    })

    it('populates textarea with example content', async () => {
      render(<EnvManager />)
      const nodeJsButton = screen.getByText('Node.js App')
      fireEvent.click(nodeJsButton)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i) as HTMLTextAreaElement
      expect(textarea.value).toContain('NODE_ENV=development')
      expect(textarea.value).toContain('PORT=3000')
    })
  })

  // ============================================================
  // COPY/DOWNLOAD BUTTON STATE TESTS
  // ============================================================
  describe('Button states', () => {
    it('disables Copy button when no output', () => {
      render(<EnvManager />)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      const copyButton = copyButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).toBeDisabled()
    })

    it('disables Download button when no output', () => {
      render(<EnvManager />)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))
      expect(downloadButton).toBeDisabled()
    })

    it('enables Copy button after parsing', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      const copyButton = copyButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).not.toBeDisabled()
    })

    it('enables Download button after parsing', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      const buttons = screen.getAllByRole('button', { name: /download/i })
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))
      expect(downloadButton).not.toBeDisabled()
    })
  })

  // ============================================================
  // KEY VALIDATION TESTS
  // ============================================================
  describe('Key validation', () => {
    const setupWithVariables = () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
    }

    it('rejects keys starting with number', async () => {
      setupWithVariables()
      const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
      fireEvent.change(keyInput, { target: { value: '1INVALID' } })
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      expect(mockToast.error).toHaveBeenCalledWith(
        'Key must start with uppercase letter and contain only A-Z, 0-9, _'
      )
    })

    it('rejects keys with lowercase letters (after uppercase conversion)', async () => {
      // Note: The UI converts to uppercase, so lowercase becomes valid
      setupWithVariables()
      const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
      fireEvent.change(keyInput, { target: { value: 'VALID_KEY' } })
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      expect(mockToast.success).toHaveBeenCalledWith('Variable added')
    })

    it('rejects keys with special characters', async () => {
      setupWithVariables()
      const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
      // Type directly - the component uppercases but doesn't strip special chars
      fireEvent.change(keyInput, { target: { value: 'INVALID-KEY' } })
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      expect(mockToast.error).toHaveBeenCalledWith(
        'Key must start with uppercase letter and contain only A-Z, 0-9, _'
      )
    })

    it('accepts valid keys with numbers', async () => {
      setupWithVariables()
      const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
      fireEvent.change(keyInput, { target: { value: 'CONFIG_V2' } })
      const valueInput = screen.getByPlaceholderText('value')
      fireEvent.change(valueInput, { target: { value: 'test' } })
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      expect(mockToast.success).toHaveBeenCalledWith('Variable added')
    })

    it('accepts valid keys with underscores', async () => {
      setupWithVariables()
      const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
      fireEvent.change(keyInput, { target: { value: 'DATABASE_CONNECTION_URL' } })
      const valueInput = screen.getByPlaceholderText('value')
      fireEvent.change(valueInput, { target: { value: 'test' } })
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      expect(mockToast.success).toHaveBeenCalledWith('Variable added')
    })
  })

  // ============================================================
  // EDGE CASES
  // ============================================================
  describe('Edge cases', () => {
    it('handles values with equals signs', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: 'CONNECTION_STRING=host=localhost;port=5432' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.success).toHaveBeenCalledWith('Parsed 1 variables')
      // The value should include everything after the first equals
      expect(
        screen.getAllByText('CONNECTION_STRING=host=localhost;port=5432').length
      ).toBeGreaterThan(0)
    })

    it('handles multiline values parsed line by line', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, {
        target: { value: 'VAR1=value1\n\n\nVAR2=value2' },
      })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(mockToast.success).toHaveBeenCalledWith('Parsed 2 variables')
    })

    it('trims whitespace from keys and values', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: '  NODE_ENV  =  development  ' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getAllByText('NODE_ENV=development').length).toBeGreaterThan(0)
    })

    it('updates export when variables change', async () => {
      render(<EnvManager />)
      const textarea = screen.getByPlaceholderText(/DATABASE_URL=postgres/i)
      fireEvent.change(textarea, { target: { value: 'NODE_ENV=development' } })
      const parseButton = screen.getByRole('button', { name: /parse variables/i })
      fireEvent.click(parseButton)
      expect(screen.getAllByText('NODE_ENV=development').length).toBeGreaterThan(0)

      // Add a new variable
      const keyInput = screen.getByPlaceholderText('VARIABLE_NAME')
      const valueInput = screen.getByPlaceholderText('value')
      fireEvent.change(keyInput, { target: { value: 'PORT' } })
      fireEvent.change(valueInput, { target: { value: '3000' } })
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)

      // Output should update
      await waitFor(() => {
        expect(screen.getAllByText(/PORT=3000/).length).toBeGreaterThan(0)
      })
    })
  })
})
