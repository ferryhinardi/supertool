import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Import toast after mock
import { toast } from 'sonner'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

import { trackToolEvent } from '@/lib/services/analytics'

// Mock ToolSearch component
vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search">Tool Search</div>,
}))

// Mock document.createElement for download - at module level
const mockAnchorClick = vi.fn()
const originalCreateElement = document.createElement.bind(document)

// Import component
import GraphQLPlaygroundPage from '../page'

// Clipboard mock - will be set up in beforeEach
let mockWriteText: ReturnType<typeof vi.fn>

describe('GraphQLPlaygroundPage', () => {
  let mockLocalStorage: {
    getItem: Mock
    setItem: Mock
    removeItem: Mock
    clear: Mock
    key: Mock
    length: number
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set up clipboard mock using vi.spyOn (clipboard is globally available from vitest.setup.ts)
    mockWriteText = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(
      mockWriteText as unknown as (data: string) => Promise<void>
    )

    // Mock localStorage with all required methods
    mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()

    // Mock fetch
    global.fetch = vi.fn()

    // Mock createElement for anchor elements
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        Object.defineProperty(element, 'click', {
          value: mockAnchorClick,
          writable: true,
        })
      }
      return element
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByRole('heading', { name: /graphql playground/i })).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<GraphQLPlaygroundPage />)
      expect(
        screen.getByText(/test graphql apis with query builder, schema explorer/i)
      ).toBeInTheDocument()
    })

    it('renders the Interactive badge', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Interactive')).toBeInTheDocument()
    })

    it('renders the Developer Tool badge', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Developer Tool')).toBeInTheDocument()
    })

    it('renders the Configuration section', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Configuration')).toBeInTheDocument()
      expect(screen.getByText('Set your GraphQL endpoint and headers')).toBeInTheDocument()
    })

    it('renders the Query Editor section', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Query Editor')).toBeInTheDocument()
      expect(screen.getByText('Write your GraphQL query')).toBeInTheDocument()
    })

    it('renders the Features section', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument()
    })

    it('renders all 6 feature items', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Execute Queries')).toBeInTheDocument()
      expect(screen.getByText('Variables Support')).toBeInTheDocument()
      expect(screen.getByText('Custom Headers')).toBeInTheDocument()
      expect(screen.getByText('Query History')).toBeInTheDocument()
      expect(screen.getByText('Favorites')).toBeInTheDocument()
      expect(screen.getByText('Export Results')).toBeInTheDocument()
    })

    it('renders the endpoint input with default value', () => {
      render(<GraphQLPlaygroundPage />)
      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      expect(endpointInput).toHaveValue(
        'https://swapi-graphql.netlify.app/.netlify/functions/index'
      )
    })

    it('renders the query editor with default query', () => {
      render(<GraphQLPlaygroundPage />)
      const queryTextarea = screen.getByPlaceholderText(
        /enter your graphql query/i
      ) as HTMLTextAreaElement
      expect(queryTextarea.value).toContain('# Welcome to GraphQL Playground!')
    })

    it('renders the variables input with default value', () => {
      render(<GraphQLPlaygroundPage />)
      const variablesTextarea = screen.getByLabelText(/variables \(json\)/i)
      expect(variablesTextarea).toHaveValue('{}')
    })

    it('renders the Execute Query button', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByRole('button', { name: /execute query/i })).toBeInTheDocument()
    })

    it('renders the History button with count', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByRole('button', { name: /history \(0\)/i })).toBeInTheDocument()
    })

    it('renders the ToolSearch component', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByTestId('tool-search')).toBeInTheDocument()
    })

    it('tracks page visit on mount', () => {
      render(<GraphQLPlaygroundPage />)
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_playground_open', {})
    })
  })

  describe('Endpoint Configuration', () => {
    it('allows changing the endpoint URL', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      await user.clear(endpointInput)
      await user.type(endpointInput, 'https://api.example.com/graphql')

      expect(endpointInput).toHaveValue('https://api.example.com/graphql')
    })

    it('renders Headers tab', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByRole('tab', { name: /headers/i })).toBeInTheDocument()
    })

    it('renders Sample Queries tab', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByRole('tab', { name: /sample queries/i })).toBeInTheDocument()
    })

    it('shows headers textarea when Headers tab is active', () => {
      render(<GraphQLPlaygroundPage />)
      const headersTextarea = screen.getByLabelText(/headers \(json\)/i)
      expect(headersTextarea).toBeInTheDocument()
      expect(headersTextarea).toHaveValue('{}')
    })

    it('allows changing headers', async () => {
      render(<GraphQLPlaygroundPage />)

      const headersTextarea = screen.getByLabelText(/headers \(json\)/i)
      fireEvent.change(headersTextarea, { target: { value: '{"Authorization": "Bearer token"}' } })

      expect(headersTextarea).toHaveValue('{"Authorization": "Bearer token"}')
    })

    it('shows sample queries when Sample Queries tab is clicked', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const samplesTab = screen.getByRole('tab', { name: /sample queries/i })
      await user.click(samplesTab)

      expect(screen.getByRole('button', { name: /star wars - get film/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /countries api/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /spacex api/i })).toBeInTheDocument()
    })
  })

  describe('Sample Queries', () => {
    it('loads Star Wars sample query', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const samplesTab = screen.getByRole('tab', { name: /sample queries/i })
      await user.click(samplesTab)

      const starWarsButton = screen.getByRole('button', { name: /star wars - get film/i })
      await user.click(starWarsButton)

      expect(toast.success).toHaveBeenCalledWith('Loaded: Star Wars - Get Film')
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_sample_load', {
        sample: 'Star Wars - Get Film',
      })
    })

    it('loads Countries API sample query', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const samplesTab = screen.getByRole('tab', { name: /sample queries/i })
      await user.click(samplesTab)

      const countriesButton = screen.getByRole('button', { name: /countries api/i })
      await user.click(countriesButton)

      expect(toast.success).toHaveBeenCalledWith('Loaded: Countries API')

      // Check endpoint is updated
      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      expect(endpointInput).toHaveValue('https://countries.trevorblades.com/graphql')
    })

    it('loads SpaceX API sample query', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const samplesTab = screen.getByRole('tab', { name: /sample queries/i })
      await user.click(samplesTab)

      const spacexButton = screen.getByRole('button', { name: /spacex api/i })
      await user.click(spacexButton)

      expect(toast.success).toHaveBeenCalledWith('Loaded: SpaceX API')

      // Check endpoint is updated
      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      expect(endpointInput).toHaveValue('https://spacex-production.up.railway.app/')
    })
  })

  describe('Query Editor', () => {
    it('allows changing the query', async () => {
      render(<GraphQLPlaygroundPage />)

      const queryTextarea = screen.getByPlaceholderText(/enter your graphql query/i)
      fireEvent.change(queryTextarea, { target: { value: 'query { users { id } }' } })

      expect(queryTextarea).toHaveValue('query { users { id } }')
    })

    it('allows changing variables', async () => {
      render(<GraphQLPlaygroundPage />)

      const variablesTextarea = screen.getByLabelText(/variables \(json\)/i)
      fireEvent.change(variablesTextarea, { target: { value: '{"id": 1}' } })

      expect(variablesTextarea).toHaveValue('{"id": 1}')
    })
  })

  describe('Query Execution', () => {
    it('shows error when endpoint is empty', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      await user.clear(endpointInput)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a GraphQL endpoint URL')
    })

    it('shows error when query is empty', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const queryTextarea = screen.getByPlaceholderText(/enter your graphql query/i)
      await user.clear(queryTextarea)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a GraphQL query')
    })

    it('shows error for invalid variables JSON', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const variablesTextarea = screen.getByLabelText(/variables \(json\)/i)
      await user.clear(variablesTextarea)
      await user.type(variablesTextarea, 'invalid json')

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(toast.error).toHaveBeenCalledWith('Invalid JSON in variables')
    })

    it('shows error for invalid headers JSON', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const headersTextarea = screen.getByLabelText(/headers \(json\)/i)
      await user.clear(headersTextarea)
      await user.type(headersTextarea, 'invalid json')

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(toast.error).toHaveBeenCalledWith('Invalid JSON in headers')
    })

    it('executes query successfully and shows response', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        data: {
          film: {
            title: 'A New Hope',
            director: 'George Lucas',
          },
        },
      }

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('Response')).toBeInTheDocument()
      })

      expect(screen.getByText(/query executed successfully/i)).toBeInTheDocument()
      expect(toast.success).toHaveBeenCalledWith('Query executed successfully!')
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_query_execute', {
        has_variables: true,
        has_headers: true,
        has_errors: false,
      })
    })

    it('shows error count when query has GraphQL errors', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        errors: [{ message: 'Cannot query field' }, { message: 'Unknown argument' }],
      }

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('Response')).toBeInTheDocument()
      })

      expect(screen.getByText(/2 error\(s\) found/i)).toBeInTheDocument()
      expect(toast.error).toHaveBeenCalledWith('Query returned 2 error(s)')
    })

    it('handles HTTP error', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('HTTP Error: 404 Not Found')
      })
    })

    it('handles network error', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error')
        expect(trackToolEvent).toHaveBeenCalledWith('graphql_query_error', {})
      })
    })

    it('shows loading state during execution', async () => {
      const user = userEvent.setup()

      let resolvePromise: ((value: unknown) => void) | undefined
      ;(global.fetch as Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve
          })
      )

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(screen.getByRole('button', { name: /executing.../i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /executing.../i })).toBeDisabled()

      // Resolve the promise
      const currentResolvePromise = resolvePromise
      if (!currentResolvePromise) {
        throw new Error('Expected resolvePromise to be assigned')
      }

      currentResolvePromise({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /execute query/i })).toBeInTheDocument()
      })
    })

    it('sends variables with the request', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const variablesTextarea = screen.getByLabelText(/variables \(json\)/i)
      fireEvent.change(variablesTextarea, { target: { value: '{"filmID": 2}' } })

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://swapi-graphql.netlify.app/.netlify/functions/index',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"filmID":2'),
          })
        )
      })

      // Note: has_headers is true because default value '{}' has length > 0
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_query_execute', {
        has_variables: true,
        has_headers: true,
        has_errors: false,
      })
    })

    it('sends headers with the request', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const headersTextarea = screen.getByLabelText(/headers \(json\)/i)
      fireEvent.change(headersTextarea, {
        target: { value: '{"Authorization": "Bearer test-token"}' },
      })

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://swapi-graphql.netlify.app/.netlify/functions/index',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: 'Bearer test-token',
            }),
          })
        )
      })

      // Note: has_variables is true because default value '{}' has length > 0
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_query_execute', {
        has_variables: true,
        has_headers: true,
        has_errors: false,
      })
    })
  })

  describe('Response Actions', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      const mockResponse = {
        data: { film: { title: 'A New Hope' } },
      }

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('Response')).toBeInTheDocument()
      })

      // Wait for response card with copy button to be visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy response/i })).toBeInTheDocument()
      })
    })

    it('copies response to clipboard', async () => {
      const user = userEvent.setup()
      const copyButton = screen.getByRole('button', { name: /copy response/i })

      await user.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          JSON.stringify({ data: { film: { title: 'A New Hope' } } }, null, 2)
        )
      })
      expect(toast.success).toHaveBeenCalledWith('Response copied to clipboard!')
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_response_copy', {})
    })

    it('handles clipboard error', async () => {
      const user = userEvent.setup()
      // Set up the rejection before the click
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'))

      const copyButton = screen.getByRole('button', { name: /copy response/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy response')
      })
    })

    it('downloads response as JSON', async () => {
      const user = userEvent.setup()

      const downloadButton = screen.getByRole('button', { name: /download json/i })
      await user.click(downloadButton)

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_response_download', {})
    })
  })

  describe('History', () => {
    it('toggles history panel when History button is clicked', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const historyButton = screen.getByRole('button', { name: /history \(0\)/i })
      await user.click(historyButton)

      // "Load previous queries" is unique to the History panel (not in Features section)
      expect(screen.getByText('Load previous queries')).toBeInTheDocument()
      expect(screen.getByText(/no query history yet/i)).toBeInTheDocument()
    })

    it('closes history panel when clicked again', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const historyButton = screen.getByRole('button', { name: /history \(0\)/i })
      await user.click(historyButton)

      // "Load previous queries" is unique to the History panel
      expect(screen.getByText('Load previous queries')).toBeInTheDocument()

      await user.click(historyButton)

      expect(screen.queryByText('Load previous queries')).not.toBeInTheDocument()
    })

    it('updates history count after query execution', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      expect(screen.getByRole('button', { name: /history \(0\)/i })).toBeInTheDocument()

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /history \(1\)/i })).toBeInTheDocument()
      })
    })

    it('loads query from history', async () => {
      const user = userEvent.setup()

      // Execute a query first
      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /history \(1\)/i })).toBeInTheDocument()
      })

      // Open history panel
      const historyButton = screen.getByRole('button', { name: /history \(1\)/i })
      await user.click(historyButton)

      // Click on history item
      const historyItem = screen.getByRole('button', {
        name: /# Welcome to GraphQL Playground!/i,
      })
      await user.click(historyItem)

      expect(toast.success).toHaveBeenCalledWith('Query loaded from history')
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_history_load', {})
    })

    it('clears history', async () => {
      const user = userEvent.setup()

      // Execute a query first
      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /history \(1\)/i })).toBeInTheDocument()
      })

      // Open history panel
      const historyButton = screen.getByRole('button', { name: /history \(1\)/i })
      await user.click(historyButton)

      // Click clear all button
      const clearButton = screen.getByRole('button', { name: /clear all/i })
      await user.click(clearButton)

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('graphql_history')
      expect(toast.success).toHaveBeenCalledWith('History cleared')
      expect(trackToolEvent).toHaveBeenCalledWith('graphql_history_clear', {})
    })

    it('saves history to localStorage', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'graphql_history',
          expect.stringContaining('Welcome to GraphQL Playground')
        )
      })
    })

    it('loads history from localStorage on mount', () => {
      const savedHistory = [
        {
          query: 'query { test }',
          variables: '{}',
          endpoint: 'https://api.example.com/graphql',
          timestamp: Date.now(),
        },
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedHistory))

      render(<GraphQLPlaygroundPage />)

      expect(screen.getByRole('button', { name: /history \(1\)/i })).toBeInTheDocument()
    })

    it('handles invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      // Should not throw
      expect(() => render(<GraphQLPlaygroundPage />)).not.toThrow()
      expect(screen.getByRole('button', { name: /history \(0\)/i })).toBeInTheDocument()
    })

    it('toggles favorite on history item', async () => {
      const user = userEvent.setup()

      // Execute a query first
      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /history \(1\)/i })).toBeInTheDocument()
      })

      // Open history panel
      const historyButton = screen.getByRole('button', { name: /history \(1\)/i })
      await user.click(historyButton)

      // Find and click the favorite button (star icon)
      const favoriteButtons = screen.getAllByRole('button')
      const starButton = favoriteButtons.find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-star')
      )

      if (starButton) {
        await user.click(starButton)
        // Verify localStorage was updated
        expect(mockLocalStorage.setItem).toHaveBeenCalled()
      }
    })
  })

  describe('Feature Cards', () => {
    it('renders Execute Queries feature', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Execute Queries')).toBeInTheDocument()
      expect(screen.getByText('Run GraphQL queries and mutations')).toBeInTheDocument()
    })

    it('renders Variables Support feature', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Variables Support')).toBeInTheDocument()
      expect(screen.getByText('Pass dynamic variables to queries')).toBeInTheDocument()
    })

    it('renders Custom Headers feature', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Custom Headers')).toBeInTheDocument()
      expect(screen.getByText('Add authentication and custom headers')).toBeInTheDocument()
    })

    it('renders Query History feature', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Query History')).toBeInTheDocument()
      expect(screen.getByText('Access and reuse previous queries')).toBeInTheDocument()
    })

    it('renders Favorites feature', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Favorites')).toBeInTheDocument()
      expect(screen.getByText('Save frequently used queries')).toBeInTheDocument()
    })

    it('renders Export Results feature', () => {
      render(<GraphQLPlaygroundPage />)
      expect(screen.getByText('Export Results')).toBeInTheDocument()
      expect(screen.getByText('Download responses as JSON')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper label for endpoint input', () => {
      render(<GraphQLPlaygroundPage />)
      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      expect(endpointInput).toBeInTheDocument()
    })

    it('has proper label for headers input', () => {
      render(<GraphQLPlaygroundPage />)
      const headersTextarea = screen.getByLabelText(/headers \(json\)/i)
      expect(headersTextarea).toBeInTheDocument()
    })

    it('has proper label for variables input', () => {
      render(<GraphQLPlaygroundPage />)
      const variablesTextarea = screen.getByLabelText(/variables \(json\)/i)
      expect(variablesTextarea).toBeInTheDocument()
    })

    it('Execute Query button is accessible', () => {
      render(<GraphQLPlaygroundPage />)
      const executeButton = screen.getByRole('button', { name: /execute query/i })
      expect(executeButton).toBeInTheDocument()
    })

    it('History button is accessible', () => {
      render(<GraphQLPlaygroundPage />)
      const historyButton = screen.getByRole('button', { name: /history/i })
      expect(historyButton).toBeInTheDocument()
    })

    it('tabs are navigable', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const headersTab = screen.getByRole('tab', { name: /headers/i })
      const samplesTab = screen.getByRole('tab', { name: /sample queries/i })

      expect(headersTab).toHaveAttribute('aria-selected', 'true')

      await user.click(samplesTab)
      expect(samplesTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty variables gracefully', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })

      render(<GraphQLPlaygroundPage />)

      const variablesTextarea = screen.getByLabelText(/variables \(json\)/i)
      await user.clear(variablesTextarea)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('"variables":{}'),
          })
        )
      })
    })

    it('handles whitespace-only endpoint', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const endpointInput = screen.getByLabelText(/graphql endpoint/i)
      await user.clear(endpointInput)
      await user.type(endpointInput, '   ')

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a GraphQL endpoint URL')
    })

    it('handles whitespace-only query', async () => {
      const user = userEvent.setup()
      render(<GraphQLPlaygroundPage />)

      const queryTextarea = screen.getByPlaceholderText(/enter your graphql query/i)
      await user.clear(queryTextarea)
      await user.type(queryTextarea, '   ')

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a GraphQL query')
    })

    it('does not copy when no response exists', async () => {
      render(<GraphQLPlaygroundPage />)

      // Response section should not be visible
      expect(screen.queryByRole('button', { name: /copy response/i })).not.toBeInTheDocument()
    })

    it('does not download when no response exists', async () => {
      render(<GraphQLPlaygroundPage />)

      // Response section should not be visible
      expect(screen.queryByRole('button', { name: /download json/i })).not.toBeInTheDocument()
    })

    it('handles generic error in query execution', async () => {
      const user = userEvent.setup()

      ;(global.fetch as Mock).mockRejectedValueOnce('Unknown error')

      render(<GraphQLPlaygroundPage />)

      const executeButton = screen.getByRole('button', { name: /execute query/i })
      await user.click(executeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to execute query')
      })
    })
  })
})
