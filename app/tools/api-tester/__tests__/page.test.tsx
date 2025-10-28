import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
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
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id'),
}))

// Mock fetch API
globalThis.fetch = vi.fn()

describe('API Tester Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
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

  it('should display authentication selector', () => {
    render(<ApiTesterPage />)

    expect(screen.getByText('Authentication')).toBeInTheDocument()
    expect(screen.getByDisplayValue('No Authentication')).toBeInTheDocument()
  })

  it('should display add header button', () => {
    render(<ApiTesterPage />)

    expect(screen.getByRole('button', { name: /Add Header/i })).toBeInTheDocument()
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
    render(<ApiTesterPage />)

    const urlInput = screen.getByPlaceholderText(/https:\/\/api.example.com\/endpoint/i)
    await userEvent.type(urlInput, 'https://api.example.com/users')

    expect(urlInput).toHaveValue('https://api.example.com/users')
  })

  it('should disable send button when URL is empty', async () => {
    render(<ApiTesterPage />)

    const sendButton = await screen.findByRole('button', { name: /Send/i })

    expect(sendButton).toBeDisabled()
  })

  it('should add a new header', async () => {
    render(<ApiTesterPage />)

    const addHeaderButton = screen.getByRole('button', { name: /Add Header/i })
    await userEvent.click(addHeaderButton)

    const headerInputs = screen.getAllByPlaceholderText(/Header name/i)
    expect(headerInputs.length).toBeGreaterThan(1)
  })

  it('should enter header key and value', async () => {
    render(<ApiTesterPage />)

    const headerKeyInput = screen.getByPlaceholderText(/Header name/i)
    const headerValueInput = screen.getByPlaceholderText(/Header value/i)

    await userEvent.type(headerKeyInput, 'Content-Type')
    await userEvent.type(headerValueInput, 'application/json')

    expect(headerKeyInput).toHaveValue('Content-Type')
    expect(headerValueInput).toHaveValue('application/json')
  })

  it('should show bearer token input when authentication type is bearer', async () => {
    render(<ApiTesterPage />)

    const authSelect = screen.getByDisplayValue('No Authentication')
    fireEvent.change(authSelect, { target: { value: 'bearer' } })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter bearer token/i)).toBeInTheDocument()
    })
  })

  it('should show basic auth inputs when authentication type is basic', async () => {
    render(<ApiTesterPage />)

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

    await waitFor(() => {
      expect(screen.getByText('Request Body')).toBeInTheDocument()
      expect(screen.getByDisplayValue('No Body')).toBeInTheDocument()
    })
  })

  it('should show JSON textarea when body type is JSON', async () => {
    render(<ApiTesterPage />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

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
      expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
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
})
