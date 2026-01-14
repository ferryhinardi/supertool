import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ApiTesterPage from '../page'

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

// Mock nanoid to generate unique IDs
let mockIdCounter = 0
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => `test-id-${mockIdCounter++}`),
}))

// Mock fetch API
globalThis.fetch = vi.fn()

describe('API Tester Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockIdCounter = 0 // Reset counter for each test
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockClear()
  })

  it('should render API tester page', () => {
    render(<ApiTesterPage />)

    expect(
      screen.getByRole('heading', { name: 'API Request Tester', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText(/Test REST APIs directly in your browser/i)).toBeInTheDocument()
  })

  it('should display HTTP method selector with default GET', () => {
    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    expect(methodSelect).toBeInTheDocument()
  })

  it('should display URL input field', () => {
    render(<ApiTesterPage />)

    expect(screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)).toBeInTheDocument()
  })

  it('should display Send button', () => {
    render(<ApiTesterPage />)

    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument()
  })

  it('should display Save Preset button', () => {
    render(<ApiTesterPage />)

    expect(screen.getByRole('button', { name: /Save Preset/i })).toBeInTheDocument()
  })

  it('should display Presets button with count', () => {
    render(<ApiTesterPage />)

    expect(screen.getByRole('button', { name: /Presets \(0\)/i })).toBeInTheDocument()
  })

  it('should display History button with count', () => {
    render(<ApiTesterPage />)

    expect(screen.getByRole('button', { name: /History \(0\)/i })).toBeInTheDocument()
  })

  it('should display authentication selector', async () => {
    render(<ApiTesterPage />)

    // Click on Auth tab to access authentication section
    const authTab = screen.getByRole('button', { name: 'Auth' })
    await userEvent.click(authTab)

    await waitFor(() => {
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
    })
  })

  it('should display add header button', async () => {
    render(<ApiTesterPage />)

    // Click on Headers tab to access headers section
    const headersTab = screen.getByRole('button', { name: 'Headers' })
    await userEvent.click(headersTab)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Header/i })).toBeInTheDocument()
    })
  })

  it('should change HTTP method', async () => {
    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    await waitFor(() => {
      expect(methodSelect).toHaveValue('POST')
    })
  })

  it('should enter URL', async () => {
    const _user = userEvent.setup()
    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    fireEvent.change(urlInput, { target: { value: 'https://api.example.com/users' } })

    expect(urlInput).toHaveValue('https://api.example.com/users')
  })

  it('should disable send button when URL is empty', async () => {
    render(<ApiTesterPage />)

    const sendButton = await screen.findByRole('button', { name: /Send/i })

    expect(sendButton).toBeDisabled()
  })

  it('should add a new header', async () => {
    render(<ApiTesterPage />)

    // Click on Headers tab to access headers section
    const headersTab = screen.getByRole('button', { name: 'Headers' })
    await userEvent.click(headersTab)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Header/i })).toBeInTheDocument()
    })

    const addHeaderButton = screen.getByRole('button', { name: /Add Header/i })
    await userEvent.click(addHeaderButton)

    const headerInputs = screen.getAllByPlaceholderText(/Header name/i)
    expect(headerInputs.length).toBeGreaterThan(1)
  })

  it('should enter header key and value', async () => {
    render(<ApiTesterPage />)

    // Click on Headers tab to access headers section
    const headersTab = screen.getByRole('button', { name: 'Headers' })
    await userEvent.click(headersTab)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Header name/i)).toBeInTheDocument()
    })

    const headerKeyInput = screen.getByPlaceholderText(/Header name/i)
    const headerValueInput = screen.getByPlaceholderText(/Header value/i)

    await userEvent.type(headerKeyInput, 'Content-Type')
    await userEvent.type(headerValueInput, 'application/json')

    expect(headerKeyInput).toHaveValue('Content-Type')
    expect(headerValueInput).toHaveValue('application/json')
  })

  it('should show bearer token input when authentication type is bearer', async () => {
    render(<ApiTesterPage />)

    // Click on Auth tab to access authentication section
    const authTab = screen.getByRole('button', { name: 'Auth' })
    await userEvent.click(authTab)

    await waitFor(() => {
      expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
    })

    const authSelect = screen.getByDisplayValue('No Authentication')
    fireEvent.change(authSelect, { target: { value: 'bearer' } })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter bearer token/i)).toBeInTheDocument()
    })
  })

  it('should show basic auth inputs when authentication type is basic', async () => {
    render(<ApiTesterPage />)

    // Click on Auth tab to access authentication section
    const authTab = screen.getByRole('button', { name: 'Auth' })
    await userEvent.click(authTab)

    await waitFor(() => {
      expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
    })

    const authSelect = screen.getByDisplayValue('No Authentication')
    fireEvent.change(authSelect, { target: { value: 'basic' } })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
    })
  })

  it('should show body type selector for POST method', async () => {
    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    // Click on Body tab to access body section
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Body' })).toBeInTheDocument()
    })

    const bodyTab = screen.getByRole('button', { name: 'Body' })
    await userEvent.click(bodyTab)

    await waitFor(() => {
      expect(screen.getByText('Request Body')).toBeInTheDocument()
      expect(screen.getByDisplayValue('No Body')).toBeInTheDocument()
    })
  })

  it('should show JSON textarea when body type is JSON', async () => {
    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    // Click on Body tab to access body section
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Body' })).toBeInTheDocument()
    })

    const bodyTab = screen.getByRole('button', { name: 'Body' })
    await userEvent.click(bodyTab)

    await waitFor(() => {
      const bodyTypeSelect = screen.getByDisplayValue('No Body')
      fireEvent.change(bodyTypeSelect, { target: { value: 'json' } })
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/"key": "value"/i)).toBeInTheDocument()
    })
  })

  it('should show text textarea when body type is text', async () => {
    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    // Click on Body tab to access body section
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Body' })).toBeInTheDocument()
    })

    const bodyTab = screen.getByRole('button', { name: 'Body' })
    await userEvent.click(bodyTab)

    await waitFor(() => {
      const bodyTypeSelect = screen.getByDisplayValue('No Body')
      fireEvent.change(bodyTypeSelect, { target: { value: 'text' } })
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter text content/i)).toBeInTheDocument()
    })
  })

  it('should send successful GET request', async () => {
    const { toast } = await import('sonner')
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
    })
  })

  it('should display response after successful request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument()
      expect(screen.getByText(/200/)).toBeInTheDocument()
    })
  })

  it('should display error message on failed request', async () => {
    const { toast } = await import('sonner')
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    )

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error')
    })
  })

  it('should save preset with name', async () => {
    window.prompt = vi.fn(() => 'Test Preset')

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const saveButton = screen.getByRole('button', { name: /Save Preset/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const presetsButton = screen.getByRole('button', { name: /Presets \(1\)/i })
      expect(presetsButton).toBeInTheDocument()
    })
  })

  it('should not save preset without name', async () => {
    window.prompt = vi.fn(() => '')

    render(<ApiTesterPage />)

    const saveButton = screen.getByRole('button', { name: /Save Preset/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const presetsButton = screen.getByRole('button', { name: /Presets \(0\)/i })
      expect(presetsButton).toBeInTheDocument()
    })
  })

  it('should toggle presets panel', async () => {
    render(<ApiTesterPage />)

    const presetsButton = screen.getByRole('button', { name: /Presets \(0\)/i })
    await userEvent.click(presetsButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Saved Presets/i })).toBeInTheDocument()
    })
  })

  it('should display no presets message when empty', async () => {
    render(<ApiTesterPage />)

    const presetsButton = screen.getByRole('button', { name: /Presets \(0\)/i })
    await userEvent.click(presetsButton)

    await waitFor(() => {
      expect(screen.getByText('No presets saved yet')).toBeInTheDocument()
    })
  })

  it('should toggle history panel', async () => {
    render(<ApiTesterPage />)

    const historyButton = screen.getByRole('button', { name: /History \(0\)/i })
    await userEvent.click(historyButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Request History/i })).toBeInTheDocument()
    })
  })

  it('should display no requests message when history is empty', async () => {
    render(<ApiTesterPage />)

    const historyButton = screen.getByRole('button', { name: /History \(0\)/i })
    await userEvent.click(historyButton)

    await waitFor(() => {
      expect(screen.getByText('No requests yet')).toBeInTheDocument()
    })
  })

  it('should persist presets to localStorage', async () => {
    window.prompt = vi.fn(() => 'Test Preset')

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const saveButton = screen.getByRole('button', { name: /Save Preset/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      const saved = localStorage.getItem('apiTesterPresets')
      expect(saved).toBeTruthy()
      if (saved) {
        const presets = JSON.parse(saved)
        expect(presets.length).toBe(1)
        expect(presets[0].name).toBe('Test Preset')
      }
    })
  })

  it('should load presets from localStorage on mount', () => {
    const mockPresets = [
      {
        id: '1',
        name: 'Loaded Preset',
        createdAt: Date.now(),
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: [],
        authType: 'none',
        authToken: '',
        authUsername: '',
        authPassword: '',
        bodyType: 'none',
        bodyJson: '{\n  \n}',
        bodyText: '',
        formData: [],
      },
    ]
    localStorage.setItem('apiTesterPresets', JSON.stringify(mockPresets))

    render(<ApiTesterPage />)

    expect(screen.getByRole('button', { name: /Presets \(1\)/i })).toBeInTheDocument()
  })

  it('should display copy response button after request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
    })
  })

  it('should display download response button after request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      // Multiple download buttons may exist, just check at least one exists
      const downloadButtons = screen.getAllByRole('button', { name: /Download/i })
      expect(downloadButtons.length).toBeGreaterThan(0)
    })
  })

  it('should display features section', async () => {
    render(<ApiTesterPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Features/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/Support for all HTTP methods/)).toBeInTheDocument()
  })

  it('should display response headers after request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Response Headers')).toBeInTheDocument()
    })
  })

  it('should display response body after request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Response Body')).toBeInTheDocument()
    })
  })

  it('should add request to history after successful request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      const historyButton = screen.getByRole('button', { name: /History \(1\)/i })
      expect(historyButton).toBeInTheDocument()
    })
  })

  it('should show invalid JSON error for malformed JSON body', async () => {
    const { toast } = await import('sonner')

    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    // Click on Body tab to access body section
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Body' })).toBeInTheDocument()
    })

    const bodyTab = screen.getByRole('button', { name: 'Body' })
    await userEvent.click(bodyTab)

    await waitFor(() => {
      const bodyTypeSelect = screen.getByDisplayValue('No Body')
      fireEvent.change(bodyTypeSelect, { target: { value: 'json' } })
    })

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    await waitFor(() => {
      const jsonTextarea = screen.getByPlaceholderText(/"key": "value"/i)
      fireEvent.change(jsonTextarea, { target: { value: '{invalid json}' } })
    })

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid JSON in request body')
    })
  })

  it('should display query parameters section', async () => {
    render(<ApiTesterPage />)

    // Params tab should be active by default, but let's click it to be sure
    const paramsTab = screen.getByRole('button', { name: 'Params' })
    await userEvent.click(paramsTab)

    await waitFor(() => {
      expect(screen.getByText('Query Parameters')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add Parameter/i })).toBeInTheDocument()
    })
  })

  it('should add a new query parameter', async () => {
    render(<ApiTesterPage />)

    // Params tab should be active by default
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Parameter/i })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Add Parameter/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      const paramInputs = screen.getAllByPlaceholderText(/Parameter name/i)
      expect(paramInputs.length).toBeGreaterThan(1)
    })
  })

  it('should display API key authentication option', async () => {
    render(<ApiTesterPage />)

    // Click on Auth tab to access authentication section
    const authTab = screen.getByRole('button', { name: 'Auth' })
    await userEvent.click(authTab)

    await waitFor(() => {
      expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
    })

    const authSelect = screen.getByDisplayValue('No Authentication')
    fireEvent.change(authSelect, { target: { value: 'api-key' } })

    expect(authSelect).toHaveValue('api-key')
  })

  it('should show API key input when API key auth is selected', async () => {
    render(<ApiTesterPage />)

    // Click on Auth tab to access authentication section
    const authTab = screen.getByRole('button', { name: 'Auth' })
    await userEvent.click(authTab)

    await waitFor(() => {
      expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
    })

    const authSelect = screen.getByDisplayValue('No Authentication')
    fireEvent.change(authSelect, { target: { value: 'api-key' } })

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Enter API key \(will be sent as X-API-Key header\)/i)
      ).toBeInTheDocument()
    })
  })

  it('should send request with query parameters', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    // Add query parameter
    const paramInputs = screen.getAllByPlaceholderText(/Parameter name/i)
    await userEvent.type(paramInputs[0], 'key')

    const paramValueInputs = screen.getAllByPlaceholderText(/Parameter value/i)
    await userEvent.type(paramValueInputs[0], 'value')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('key=value'),
        expect.any(Object)
      )
    })
  })

  it('should send request with API key header', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Success' }),
    }
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/test')

    // Click on Auth tab to access authentication section
    const authTab = screen.getByRole('button', { name: 'Auth' })
    await userEvent.click(authTab)

    await waitFor(() => {
      expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
    })

    const authSelect = screen.getByDisplayValue('No Authentication')
    fireEvent.change(authSelect, { target: { value: 'api-key' } })

    const apiKeyInput = await screen.findByPlaceholderText(
      /Enter API key \(will be sent as X-API-Key header\)/i
    )
    await userEvent.type(apiKeyInput, 'test-api-key')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key',
          }),
        })
      )
    })
  })

  it('should display keyboard shortcut hint', () => {
    render(<ApiTesterPage />)

    expect(screen.getByText(/Tip:/i)).toBeInTheDocument()
    expect(screen.getByText(/to send/i)).toBeInTheDocument()
  })

  // Environment Variables Tests
  describe('Environment Variables', () => {
    it('should display Environments button', () => {
      render(<ApiTesterPage />)

      expect(screen.getByRole('button', { name: /Environments \(0\)/i })).toBeInTheDocument()
    })

    it('should open environments panel when clicked', async () => {
      render(<ApiTesterPage />)

      const environmentsButton = screen.getByRole('button', { name: /Environments \(0\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Environments')).toBeInTheDocument()
        expect(screen.getByText(/Manage environment variables. Use {{/i)).toBeInTheDocument()
      })
    })

    it('should create a new environment', async () => {
      // Mock prompt
      global.prompt = vi.fn(() => 'TestEnv123')

      render(<ApiTesterPage />)

      const environmentsButton = screen.getByRole('button', { name: /Environments \(0\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Environment')).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /Create New Environment/i })
      await userEvent.click(createButton)

      await waitFor(() => {
        // Check if stored in localStorage
        const stored = JSON.parse(localStorage.getItem('apiTesterEnvironments') || '[]')
        expect(stored).toHaveLength(1)
        expect(stored[0].name).toBe('TestEnv123')
      })
    })

    it('should activate an environment', async () => {
      // Pre-populate with an environment
      const env = {
        id: 'env-1',
        name: 'Production',
        variables: [
          {
            id: 'var-1',
            key: 'API_URL',
            value: 'https://api.prod.com',
            enabled: true,
            secret: false,
          },
        ],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))

      render(<ApiTesterPage />)

      // Should show environment name on button
      const environmentsButton = screen.getByRole('button', { name: /Environments \(1\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Production')).toBeInTheDocument()
      })

      // Find and click the globe icon to activate
      const globeButtons = screen.getAllByRole('button')
      const activateButton = globeButtons.find((btn) => {
        const parent = btn.closest('div')
        return parent?.textContent?.includes('Production')
      })

      if (activateButton) {
        await userEvent.click(activateButton)
      }

      // Check if stored in localStorage
      await waitFor(() => {
        const storedActiveId = localStorage.getItem('apiTesterActiveEnvironment')
        expect(storedActiveId).toBe('env-1')
      })
    })

    it('should add variable to environment', async () => {
      // Pre-populate with an environment
      const env = {
        id: 'env-1',
        name: 'Development',
        variables: [],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))

      render(<ApiTesterPage />)

      const environmentsButton = screen.getByRole('button', { name: /Environments \(1\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Development')).toBeInTheDocument()
      })

      // Click Edit button - use getAllByRole since there may be multiple Edit buttons
      const editButtons = screen.getAllByRole('button', { name: /Edit/i })
      await userEvent.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Variable/i })).toBeInTheDocument()
      })

      // Click Add Variable
      const addVariableButton = screen.getByRole('button', { name: /Add Variable/i })
      await userEvent.click(addVariableButton)

      await waitFor(() => {
        // Should have input fields for key and value
        const inputs = screen.getAllByPlaceholderText(/Variable name/i)
        expect(inputs.length).toBeGreaterThan(0)
      })
    })

    it('should substitute variables in URL', async () => {
      // Pre-populate with an active environment
      const env = {
        id: 'env-1',
        name: 'Production',
        variables: [
          {
            id: 'var-1',
            key: 'BASE_URL',
            value: 'https://api.prod.com',
            enabled: true,
            secret: false,
          },
          { id: 'var-2', key: 'VERSION', value: 'v1', enabled: true, secret: false },
        ],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))
      localStorage.setItem('apiTesterActiveEnvironment', 'env-1')

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success' }),
        text: async () => JSON.stringify({ message: 'Success' }),
      }
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

      render(<ApiTesterPage />)

      // Wait for component to mount and load environment - may be multiple Production buttons
      await waitFor(() => {
        const prodButtons = screen.getAllByRole('button', { name: /Production/i })
        expect(prodButtons.length).toBeGreaterThan(0)
      })

      const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
      fireEvent.change(urlInput, { target: { value: '{{BASE_URL}}/{{VERSION}}/users' } })

      const sendButton = screen.getByRole('button', { name: /Send/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled()
        const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(callArgs[0]).toBe('https://api.prod.com/v1/users')
      })
    })

    it('should substitute variables in headers', async () => {
      // Pre-populate with an active environment
      const env = {
        id: 'env-1',
        name: 'ProdEnv',
        variables: [
          { id: 'var-1', key: 'API_KEY', value: 'secret-key-123', enabled: true, secret: true },
        ],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))
      localStorage.setItem('apiTesterActiveEnvironment', 'env-1')

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success' }),
        text: async () => JSON.stringify({ message: 'Success' }),
      }
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

      render(<ApiTesterPage />)

      // Wait for environment to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ProdEnv/i })).toBeInTheDocument()
      })

      const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/test' } })

      // Click on Headers tab
      const headersTab = screen.getByRole('button', { name: 'Headers' })
      await userEvent.click(headersTab)

      await waitFor(() => {
        const headerKeys = screen.getAllByPlaceholderText(/Header name/i)
        expect(headerKeys.length).toBeGreaterThan(0)
      })

      const headerKeys = screen.getAllByPlaceholderText(/Header name/i)
      const headerValues = screen.getAllByPlaceholderText(/Header value/i)

      fireEvent.change(headerKeys[0], { target: { value: 'Authorization' } })
      fireEvent.change(headerValues[0], { target: { value: 'Bearer {{API_KEY}}' } })

      const sendButton = screen.getByRole('button', { name: /Send/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled()
        const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(callArgs[1].headers.Authorization).toBe('Bearer secret-key-123')
      })
    })

    it('should substitute variables in bearer token', async () => {
      // Pre-populate with an active environment
      const env = {
        id: 'env-1',
        name: 'TokenEnv',
        variables: [
          { id: 'var-1', key: 'TOKEN', value: 'bearer-token-xyz', enabled: true, secret: true },
        ],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))
      localStorage.setItem('apiTesterActiveEnvironment', 'env-1')

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success' }),
        text: async () => JSON.stringify({ message: 'Success' }),
      }
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

      render(<ApiTesterPage />)

      // Wait for environment to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /TokenEnv/i })).toBeInTheDocument()
      })

      const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/test' } })

      // Click on Auth tab
      const authTab = screen.getByRole('button', { name: 'Auth' })
      await userEvent.click(authTab)

      await waitFor(() => {
        expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
      })

      const authSelect = screen.getByDisplayValue('No Authentication')
      fireEvent.change(authSelect, { target: { value: 'bearer' } })

      const tokenInput = await screen.findByPlaceholderText(/Enter bearer token/i)
      fireEvent.change(tokenInput, { target: { value: '{{TOKEN}}' } })

      const sendButton = screen.getByRole('button', { name: /Send/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled()
        const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(callArgs[1].headers.Authorization).toBe('Bearer bearer-token-xyz')
      })
    })

    it('should substitute variables in JSON body', async () => {
      // Pre-populate with an active environment
      const env = {
        id: 'env-1',
        name: 'Production',
        variables: [{ id: 'var-1', key: 'USER_ID', value: '12345', enabled: true, secret: false }],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))
      localStorage.setItem('apiTesterActiveEnvironment', 'env-1')

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Success' }),
      }
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

      render(<ApiTesterPage />)

      const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/test' } })

      const methodSelect = screen.getByDisplayValue('GET')
      fireEvent.change(methodSelect, { target: { value: 'POST' } })

      // Wait a bit for state to update
      await waitFor(() => {
        expect(methodSelect).toHaveValue('POST')
      })

      // Click on Body tab
      const bodyTab = screen.getByRole('button', { name: 'Body' })
      await userEvent.click(bodyTab)

      // Wait for body type selector to appear
      const bodyTypeSelect = await screen.findByDisplayValue('No Body')
      fireEvent.change(bodyTypeSelect, { target: { value: 'json' } })

      // Wait for JSON textarea to appear - the placeholder is '{"key": "value"}'
      const jsonTextarea = await screen.findByPlaceholderText(
        '{"key": "value"}',
        {},
        { timeout: 3000 }
      )
      fireEvent.change(jsonTextarea, { target: { value: '{"userId": "{{USER_ID}}"}' } })

      const sendButton = screen.getByRole('button', { name: /Send/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: '{"userId": "12345"}',
          })
        )
      })
    })

    it('should delete environment', async () => {
      // Mock confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

      // Pre-populate with an environment
      const env = {
        id: 'env-1',
        name: 'Development',
        variables: [],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))

      render(<ApiTesterPage />)

      const environmentsButton = screen.getByRole('button', { name: /Environments \(1\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Development')).toBeInTheDocument()
      })

      // Find all buttons, filter for those with SVG containing polyline (Trash2 icon has polyline)
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg.lucide-trash-2')
        if (svg) return true
        // Fallback: check for polyline which is part of Trash2 icon
        const polyline = btn.querySelector('polyline')
        return polyline !== null
      })

      expect(deleteButton).toBeTruthy()
      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Verify confirm was called
        await waitFor(() => {
          expect(confirmSpy).toHaveBeenCalled()
        })

        // Verify environment was deleted
        await waitFor(() => {
          const stored = JSON.parse(localStorage.getItem('apiTesterEnvironments') || '[]')
          expect(stored).toHaveLength(0)
        })
      }

      confirmSpy.mockRestore()
    })

    it('should toggle secret visibility for variables', async () => {
      // Pre-populate with an environment
      const env = {
        id: 'env-1',
        name: 'Development',
        variables: [
          { id: 'var-1', key: 'SECRET', value: 'my-secret', enabled: true, secret: false },
        ],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))

      render(<ApiTesterPage />)

      const environmentsButton = screen.getByRole('button', { name: /Environments \(1\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Development')).toBeInTheDocument()
      })

      // Click Edit button - use getAllByRole since there may be multiple Edit buttons
      const editButtons = screen.getAllByRole('button', { name: /Edit/i })
      await userEvent.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('my-secret')).toBeInTheDocument()
      })

      // The value should be visible (type="text")
      const valueInput = screen.getByDisplayValue('my-secret') as HTMLInputElement
      expect(valueInput.type).toBe('text')

      // Find and click the eye icon to toggle secret
      const buttons = screen.getAllByRole('button')
      const eyeButton = buttons.find((btn) => btn.getAttribute('title')?.includes('value'))

      if (eyeButton) {
        await userEvent.click(eyeButton)

        await waitFor(() => {
          // After toggling, the input should be type="password"
          const valueInputAfter = screen.getByDisplayValue('my-secret') as HTMLInputElement
          expect(valueInputAfter.type).toBe('password')
        })
      }
    })

    it('should duplicate environment', async () => {
      // Pre-populate with an environment
      const env = {
        id: 'env-1',
        name: 'Production',
        variables: [
          {
            id: 'var-1',
            key: 'API_URL',
            value: 'https://api.prod.com',
            enabled: true,
            secret: false,
          },
        ],
        createdAt: Date.now(),
      }
      localStorage.setItem('apiTesterEnvironments', JSON.stringify([env]))

      render(<ApiTesterPage />)

      const environmentsButton = screen.getByRole('button', { name: /Environments \(1\)/i })
      await userEvent.click(environmentsButton)

      await waitFor(() => {
        expect(screen.getByText('Production')).toBeInTheDocument()
      })

      // Find and click Copy button - it's the button with Copy icon (no text, just icon)
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg')
        // Look for the rect element which is specific to Copy icon
        const rect = svg?.querySelector('rect')
        const hasRect = rect !== null
        // Ensure it doesn't have text content (to avoid confusion with other buttons)
        const hasNoText = !btn.textContent || btn.textContent.trim() === ''
        return hasRect && hasNoText
      })

      expect(copyButton).toBeTruthy()
      if (copyButton) {
        await userEvent.click(copyButton)
      }

      await waitFor(
        () => {
          // Should see "Production (Copy)"
          expect(screen.getByText('Production (Copy)')).toBeInTheDocument()

          // Check localStorage
          const stored = JSON.parse(localStorage.getItem('apiTesterEnvironments') || '[]')
          expect(stored).toHaveLength(2)
          expect(stored[1].name).toBe('Production (Copy)')
          expect(stored[1].variables[0].key).toBe('API_URL')
        },
        { timeout: 3000 }
      )
    })
  })

  describe('UX Enhancements', () => {
    it('should display count badges on tabs with content', async () => {
      render(<ApiTesterPage />)

      // Verify initially no badges (there's one empty param but no key, so count = 0)
      let paramsTab = screen.getByRole('button', { name: 'Params' })
      expect(paramsTab.textContent).toBe('Params')

      // Click on params tab and type into the existing empty parameter field
      await userEvent.click(paramsTab)

      // There should already be one empty parameter field from initial state
      const keyInputs = screen.getAllByPlaceholderText(/Parameter name/i)
      expect(keyInputs.length).toBeGreaterThan(0)

      // Type into the first (existing) parameter field
      await userEvent.type(keyInputs[0], 'testkey')

      // Params tab should now show count badge with 1
      await waitFor(
        () => {
          paramsTab = screen.getByRole('button', { name: /Params/i })
          // Match "Params" followed by whitespace and "1", accounting for the badge
          const match = paramsTab.textContent?.match(/Params/)
          expect(match).toBeTruthy()
          expect(paramsTab.textContent).toContain('1')
        },
        { timeout: 3000 }
      )

      // Switch to Headers tab - it should have one empty header from initial state
      // Use getAllByRole since there may be multiple Headers buttons in the UI
      const headersTabs = screen.getAllByRole('button', { name: /Headers/i })
      await userEvent.click(headersTabs[0])

      const headerInputs = screen.getAllByPlaceholderText(/Header name/i)
      await userEvent.type(headerInputs[0], 'Authorization')

      // Headers tab should show count badge with 1
      await waitFor(
        () => {
          const headerBtns = screen.getAllByRole('button', { name: /Headers/i })
          expect(headerBtns[0].textContent).toContain('1')
        },
        { timeout: 3000 }
      )

      // Auth tab should show count when auth type is not none
      const authTab = screen.getByRole('button', { name: /Auth/i })
      await userEvent.click(authTab)

      const authSelect = screen.getByDisplayValue('No Authentication')
      fireEvent.change(authSelect, { target: { value: 'bearer' } })

      await waitFor(
        () => {
          const auth = screen.getByRole('button', { name: /Auth/i })
          expect(auth.textContent).toContain('1')
        },
        { timeout: 3000 }
      )
    })

    it('should not show count badge when no content exists', async () => {
      render(<ApiTesterPage />)

      const paramsTab = screen.getByRole('button', { name: 'Params' })
      const authTab = screen.getByRole('button', { name: 'Auth' })
      const headersTab = screen.getByRole('button', { name: 'Headers' })

      // Initially, no badges should be shown (only tab names)
      expect(paramsTab.textContent).toBe('Params')
      expect(authTab.textContent).toBe('Auth')
      expect(headersTab.textContent).toBe('Headers')
    })
  })
})
