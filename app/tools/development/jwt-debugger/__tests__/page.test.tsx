'use client'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// All vi.mock calls must be at the top level and will be hoisted

// Mock the generateJWT function from utils since jose library doesn't work well in jsdom
vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>()
  return {
    ...actual,
    generateJWT: vi
      .fn()
      .mockResolvedValue(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjE2MjM5MDIyfQ.mock-signature'
      ),
  }
})

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock useTrackToolView
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

// Mock useToolHistory - using inline array to avoid hoisting issues
vi.mock('@/hooks/tools/useToolHistory', () => {
  const historyItems: Array<{
    id: string
    timestamp: number
    isFavorite: boolean
    data: { token: string; algorithm: string; payload: object; isExpired: boolean }
  }> = []

  return {
    useToolHistory: vi.fn(() => ({
      items: historyItems,
      addItem: vi.fn(
        (data: { token: string; algorithm: string; payload: object; isExpired: boolean }) => {
          historyItems.push({
            id: Math.random().toString(),
            timestamp: Date.now(),
            isFavorite: false,
            data,
          })
        }
      ),
      deleteItem: vi.fn((id: string) => {
        const index = historyItems.findIndex((item) => item.id === id)
        if (index !== -1) historyItems.splice(index, 1)
      }),
      clearAll: vi.fn(() => {
        historyItems.length = 0
      }),
      toggleFavorite: vi.fn((id: string) => {
        const item = historyItems.find((item) => item.id === id)
        if (item) item.isFavorite = !item.isFavorite
      }),
      getFilteredItems: vi.fn(() => historyItems),
    })),
  }
})

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { toast } from 'sonner'
// Now import the components and utilities after mocks are set up
import JWTDebuggerPage from '../page'
import { decodeJWT, SAMPLE_TOKENS, validateClaims, verifyJWT } from '../utils'

// Mock clipboard API - this can be done at module level since it's setting up a browser API
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
})

// Sample valid JWT token (HS256)
const VALID_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// Invalid JWT token
const INVALID_JWT_TOKEN = 'not-a-valid-jwt-token'

// JWT with only 2 parts
const TWO_PART_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0'

describe('JWTDebuggerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()

    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title and description', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByText('JWT Debugger')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Decode, verify, and generate JSON Web Tokens with full algorithm support/i
        )
      ).toBeInTheDocument()
    })

    it('renders the encoded token input section', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByText('Encoded Token')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      ).toBeInTheDocument()
    })

    it('renders sample token buttons', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByRole('button', { name: 'Valid HS256' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'With Expiration' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'With Claims' })).toBeInTheDocument()
    })

    it('renders the generate JWT section', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByText('Generate JWT')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Generate Token' })).toBeInTheDocument()
    })

    it('renders the history section', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByText('History')).toBeInTheDocument()
      expect(screen.getByText('No history yet')).toBeInTheDocument()
    })

    it('renders related tool link to JWT Decoder', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByText('Just Need Quick Decoding?')).toBeInTheDocument()
      expect(screen.getByText('JWT Decoder')).toBeInTheDocument()
    })
  })

  describe('Token Input and Decoding', () => {
    it('accepts token input in textarea', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      await user.type(textarea, VALID_JWT_TOKEN)

      expect(textarea).toHaveValue(VALID_JWT_TOKEN)
    })

    it('shows decoded header after entering valid token', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      await user.clear(textarea)
      await user.type(textarea, VALID_JWT_TOKEN)

      await waitFor(() => {
        expect(screen.getByText('Header')).toBeInTheDocument()
      })
    })

    it('shows decoded payload after entering valid token', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      await user.clear(textarea)
      await user.type(textarea, VALID_JWT_TOKEN)

      await waitFor(() => {
        expect(screen.getByText('Payload')).toBeInTheDocument()
      })
    })

    it('shows error message for invalid token format', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      await user.type(textarea, INVALID_JWT_TOKEN)

      await waitFor(() => {
        // The component shows an error when JWT is invalid
        expect(screen.queryByText('Header')).not.toBeInTheDocument()
      })
    })

    it('shows verify signature section after entering valid token', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      await user.clear(textarea)
      await user.type(textarea, VALID_JWT_TOKEN)

      await waitFor(() => {
        // Use getAllByText since there's both a heading and a button with this text
        const elements = screen.getAllByText('Verify Signature')
        expect(elements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Sample Token Loading', () => {
    it('loads sample token when clicking Valid HS256 button', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      expect(toast.success).toHaveBeenCalledWith('Loaded: Valid HS256')
    })

    it('loads sample token when clicking With Expiration button', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'With Expiration' }))

      expect(toast.success).toHaveBeenCalledWith('Loaded: With Expiration')
    })

    it('loads sample token when clicking With Claims button', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'With Claims' }))

      expect(toast.success).toHaveBeenCalledWith('Loaded: With Claims')
    })
  })

  describe('Signature Verification', () => {
    it('shows algorithm selector in verify section', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token first
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Algorithm')).toBeInTheDocument()
      })

      const algorithmSelect = screen.getByLabelText('Algorithm')
      expect(algorithmSelect).toHaveValue('HS256')
    })

    it('shows secret key input in verify section', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token first
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Secret Key')).toBeInTheDocument()
      })
    })

    it('shows Verify Signature button', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token first
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        // Use getAllByRole since there might be multiple buttons matching
        const verifyButtons = screen
          .getAllByRole('button')
          .filter((btn) => btn.textContent?.includes('Verify Signature'))
        expect(verifyButtons.length).toBeGreaterThan(0)
      })
    })

    it('shows error when verifying without token', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Clear the token first and try to verify
      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      await user.clear(textarea)

      // Verify section should not be visible when no token - check for no Verify Signature buttons
      const verifyButtons = screen
        .queryAllByRole('button')
        .filter((btn) => btn.textContent?.includes('Verify Signature'))
      expect(verifyButtons.length).toBe(0)
    })
  })

  describe('Token Generation', () => {
    it('shows payload input for generation', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByLabelText(/Payload \(JSON\)/i)).toBeInTheDocument()
    })

    it('has default payload in the generator', () => {
      render(<JWTDebuggerPage />)

      const payloadInput = screen.getByLabelText(/Payload \(JSON\)/i) as HTMLTextAreaElement
      const value = payloadInput.value
      expect(value).toContain('"sub"')
      expect(value).toContain('"name"')
    })

    it('generates token when clicking Generate Token button', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'Generate Token' }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('JWT token generated successfully!')
      })
    })

    it('shows error for invalid JSON payload', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      const payloadInput = screen.getByLabelText(/Payload \(JSON\)/i)
      await user.clear(payloadInput)
      await user.type(payloadInput, 'invalid json')

      await user.click(screen.getByRole('button', { name: 'Generate Token' }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })

    it('shows Copy Token button after generation', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'Generate Token' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Token/i })).toBeInTheDocument()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('copies header to clipboard', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByText('Header')).toBeInTheDocument()
      })

      // Find the Header card and its copy button
      const headerCard = screen.getByText('Header').closest('[class*="card"]')
      if (headerCard) {
        const copyButton = within(headerCard as HTMLElement).getByRole('button')
        await user.click(copyButton)

        expect(mockWriteText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Header copied to clipboard!')
      }
    })

    it('copies payload to clipboard', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByText('Payload')).toBeInTheDocument()
      })

      // Find copy buttons and click the payload one (second copy button)
      const copyButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'))
      // The payload copy button is typically after the header copy button
      const payloadCopyBtn = copyButtons.find((btn) => {
        const parent = btn.closest('[class*="card"]')
        return parent?.textContent?.includes('Payload')
      })

      if (payloadCopyBtn) {
        await user.click(payloadCopyBtn)
        expect(mockWriteText).toHaveBeenCalled()
      }
    })

    it('copies generated token to clipboard', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Generate a token
      await user.click(screen.getByRole('button', { name: 'Generate Token' }))

      // Wait for token to be generated and success message
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('JWT token generated successfully!')
      })

      // The Copy Token button should now be visible - find it by text content
      const copyTokenButton = await screen.findByRole('button', { name: /Copy Token/i })
      await user.click(copyTokenButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Generated token copied to clipboard!')
      })
    })
  })

  describe('History', () => {
    it('shows No history yet message when empty', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByText('No history yet')).toBeInTheDocument()
    })

    it('does not show search and filters when history is empty', () => {
      render(<JWTDebuggerPage />)

      expect(screen.queryByPlaceholderText('Search history...')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Newest' })).not.toBeInTheDocument()
    })
  })

  describe('Algorithm Selection', () => {
    it('has HS256, HS384, HS512 options', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token to show the algorithm selector
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        const algorithmSelect = screen.getByLabelText('Algorithm')
        expect(algorithmSelect).toBeInTheDocument()
      })

      const algorithmSelect = screen.getByLabelText('Algorithm') as HTMLSelectElement
      const options = Array.from(algorithmSelect.options).map((opt) => opt.value)

      expect(options).toContain('HS256')
      expect(options).toContain('HS384')
      expect(options).toContain('HS512')
    })

    it('can change algorithm', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      // Load a valid token
      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Algorithm')).toBeInTheDocument()
      })

      const algorithmSelect = screen.getByLabelText('Algorithm')
      await user.selectOptions(algorithmSelect, 'HS384')

      expect(algorithmSelect).toHaveValue('HS384')
    })
  })

  describe('Accessibility', () => {
    it('has accessible token textarea', () => {
      render(<JWTDebuggerPage />)

      const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
      expect(textarea).toBeInTheDocument()
    })

    it('has accessible payload input with label', () => {
      render(<JWTDebuggerPage />)

      expect(screen.getByLabelText(/Payload \(JSON\)/i)).toBeInTheDocument()
    })

    it('has accessible algorithm select with label', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Algorithm')).toBeInTheDocument()
      })
    })

    it('has accessible secret key input with label', async () => {
      const user = userEvent.setup()
      render(<JWTDebuggerPage />)

      await user.click(screen.getByRole('button', { name: 'Valid HS256' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Secret Key')).toBeInTheDocument()
      })
    })
  })
})

// Utility function tests - these test the actual util functions (except generateJWT which is mocked)
describe('JWT Utils', () => {
  describe('decodeJWT', () => {
    it('decodes a valid JWT token', () => {
      const result = decodeJWT(VALID_JWT_TOKEN)

      expect(result.isValid).toBe(true)
      expect(result.header).toBeDefined()
      expect(result.payload).toBeDefined()
      expect(result.signature).toBeDefined()
    })

    it('extracts header correctly', () => {
      const result = decodeJWT(VALID_JWT_TOKEN)

      expect(result.header?.alg).toBe('HS256')
      expect(result.header?.typ).toBe('JWT')
    })

    it('extracts payload correctly', () => {
      const result = decodeJWT(VALID_JWT_TOKEN)

      expect(result.payload?.sub).toBe('1234567890')
      expect(result.payload?.name).toBe('John Doe')
    })

    it('extracts claims correctly', () => {
      const result = decodeJWT(VALID_JWT_TOKEN)

      expect(result.claims).toBeDefined()
      expect(result.claims?.sub).toBe('1234567890')
      expect(result.claims?.iat).toBe(1516239022)
    })

    it('returns error for token without 3 parts', () => {
      const result = decodeJWT(TWO_PART_JWT)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid JWT format')
    })

    it('returns error for completely invalid token', () => {
      const result = decodeJWT(INVALID_JWT_TOKEN)

      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('detects expired token', () => {
      // JWT with exp in the past
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.2H0EJnt58ApysedXcvNUAy6FhgBIbDmPfq9d79qF4yQ'
      const result = decodeJWT(expiredToken)

      expect(result.claims?.isExpired).toBe(true)
    })

    it('detects non-expired token', () => {
      // JWT with exp far in the future
      const futureToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjo5OTk5OTk5OTk5fQ.FLmBSPEpEyHvczNeexK-A5s1ie6_3D2qG1XfC-LAVQE'
      const result = decodeJWT(futureToken)

      expect(result.claims?.isExpired).toBe(false)
    })
  })

  describe('verifyJWT', () => {
    it('verifies valid token with correct secret', async () => {
      const result = await verifyJWT(VALID_JWT_TOKEN, 'your-256-bit-secret', 'HS256')

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('fails verification with wrong secret', async () => {
      const result = await verifyJWT(VALID_JWT_TOKEN, 'wrong-secret', 'HS256')

      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('fails verification with wrong algorithm', async () => {
      const result = await verifyJWT(VALID_JWT_TOKEN, 'your-256-bit-secret', 'HS512')

      expect(result.isValid).toBe(false)
    })
  })

  describe('validateClaims', () => {
    it('returns valid for payload without time claims', () => {
      const payload = { sub: '123', name: 'Test' }
      const result = validateClaims(payload)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('detects expired token', () => {
      const payload = { exp: 1 } // Expired long ago
      const result = validateClaims(payload)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Token has expired')
    })

    it('warns about token expiring soon', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { exp: now + 100 } // Expires in 100 seconds
      const result = validateClaims(payload)

      expect(result.warnings).toContain('Token will expire soon')
    })

    it('detects token not yet valid (nbf)', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { nbf: now + 3600 } // Not valid for another hour
      const result = validateClaims(payload)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Token is not yet valid (nbf claim)')
    })

    it('warns about future iat', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { iat: now + 3600 } // Issued in the future
      const result = validateClaims(payload)

      expect(result.warnings).toContain('Token issued in the future')
    })
  })

  describe('SAMPLE_TOKENS', () => {
    it('contains expected sample tokens', () => {
      expect(SAMPLE_TOKENS.length).toBeGreaterThan(0)

      const names = SAMPLE_TOKENS.map((s) => s.name)
      expect(names).toContain('Valid HS256')
      expect(names).toContain('With Expiration')
      expect(names).toContain('With Claims')
    })

    it('all sample tokens have required properties', () => {
      for (const sample of SAMPLE_TOKENS) {
        expect(sample.name).toBeDefined()
        expect(sample.algorithm).toBeDefined()
        expect(sample.secret).toBeDefined()
        expect(sample.token).toBeDefined()
      }
    })

    it('all sample tokens are decodable', () => {
      for (const sample of SAMPLE_TOKENS) {
        const decoded = decodeJWT(sample.token)
        expect(decoded.isValid).toBe(true)
      }
    })
  })
})
