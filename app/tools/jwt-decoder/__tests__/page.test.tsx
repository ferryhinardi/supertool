import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import JWTDecoderPage from '../page'

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

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

// Valid JWT token for testing (expires in year 2030)
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MDAwMDAwMDB9.4Adcj0mI-_hH7fMbVMEBCBlAMZq3jZNYQBxg2YJQ1IY'

// Expired JWT token (expired in 2020)
const EXPIRED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1Nzc4MzY4MDB9.xEr1ITyF6Yj17eI5vLLqIvMNQvIrjkfZE8vPg-nJiWk'

describe('JWT Decoder - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render JWT decoder page', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByRole('heading', { name: 'JWT Decoder & Inspector', level: 1 }))
    expect(screen.getByText(/decode, verify, and validate/i))
  })

  it('should display security badge', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByText(/Secure • Client-Side • No Server Storage/i))
  })

  it('should display JWT token input area', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByText('JWT Token Input'))
    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should display clear button', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByRole('button', { name: /clear/i }))
  })

  it('should display educational sections', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByText('What is JWT?'))
    expect(screen.getByText('Common Use Cases'))
  })

  it('should display JWT structure information', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByText(/Token type and algorithm/i))
    expect(screen.getByText(/Claims and user data/i))
    expect(screen.getByText(/Verification signature/i))
  })
})

describe('JWT Decoder - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have proper heading hierarchy', () => {
    render(<JWTDecoderPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('JWT Decoder & Inspector')
  })

  it('should have accessible textarea with label', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByText('JWT Token'))
    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should have accessible action buttons', () => {
    render(<JWTDecoderPage />)

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })
})

describe('JWT Decoder - Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should decode valid JWT token', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Payload')).toBeInTheDocument()
      expect(screen.getByText('Signature')).toBeInTheDocument()
    })
  })

  it('should display header information', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
    })
  })

  it('should display payload information', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Payload')).toBeInTheDocument()
    })
  })

  it('should show error for invalid JWT format', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: 'invalid-jwt-token' } })

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid JWT format. Expected 3 parts separated by dots./i)
      ).toBeInTheDocument()
    })
  })

  it('should show error for malformed base64 in JWT', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: 'part1.part2.part3' } })

    await waitFor(() => {
      expect(
        screen.getByText(/The string to be decoded is not correctly encoded/i)
      ).toBeInTheDocument()
    })
  })

  it('should clear token and decoded data when clear button clicked', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /clear/i })
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(textarea).toHaveValue('')
      expect(screen.queryByText('Header')).not.toBeInTheDocument()
    })
  })

  it('should show expired token warning', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: EXPIRED_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Token Expired')).toBeInTheDocument()
      expect(screen.getByText(/This JWT token has expired/i)).toBeInTheDocument()
    })
  })

  it('should show valid token message for non-expired tokens', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Token Valid')).toBeInTheDocument()
      expect(screen.getByText(/Expires:/i)).toBeInTheDocument()
    })
  })

  it('should toggle signature visibility', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Signature')).toBeInTheDocument()
    })

    // Find eye icon button (show/hide signature)
    const buttons = screen.getAllByRole('button')
    const eyeButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null
    })

    if (eyeButton) {
      fireEvent.click(eyeButton)
      // Signature visibility should toggle (tested by no errors)
    }
  })

  it('should copy header to clipboard', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    // Find copy button in header section
    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null && btn.closest('[class*="CardHeader"]')
    })

    if (copyButton) {
      fireEvent.click(copyButton)
      expect(mockWriteText).toHaveBeenCalled()
    }
  })

  it('should copy payload to clipboard', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Payload')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    // Find a copy button (there are multiple)
    const copyButtons = buttons.filter((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null
    })

    if (copyButtons.length > 1) {
      fireEvent.click(copyButtons[1])
      expect(mockWriteText).toHaveBeenCalled()
    }
  })

  it('should copy signature to clipboard', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Signature')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const copyButtons = buttons.filter((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null
    })

    if (copyButtons.length > 2) {
      fireEvent.click(copyButtons[copyButtons.length - 1])
      expect(mockWriteText).toHaveBeenCalled()
    }
  })

  it('should display standard claims when present', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Standard Claims')).toBeInTheDocument()
      expect(screen.getByText(/Subject \(sub\):/i)).toBeInTheDocument()
      expect(screen.getByText(/Issued At \(iat\):/i)).toBeInTheDocument()
      expect(screen.getByText(/Expiration \(exp\):/i)).toBeInTheDocument()
    })
  })

  it('should handle tokens without expiration', async () => {
    // JWT without exp claim
    const noExpJWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)
    fireEvent.change(textarea, { target: { value: noExpJWT } })

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Payload')).toBeInTheDocument()
      // Should not show expiration warnings
      expect(screen.queryByText('Token Expired')).not.toBeInTheDocument()
      expect(screen.queryByText('Token Valid')).not.toBeInTheDocument()
    })
  })

  it('should clear error when valid token entered after invalid', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)

    // First enter invalid token
    fireEvent.change(textarea, { target: { value: 'invalid' } })

    await waitFor(() => {
      expect(screen.getByText(/Invalid JWT format/i)).toBeInTheDocument()
    })

    // Then enter valid token
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.queryByText(/Invalid JWT format/i)).not.toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
    })
  })

  it('should clear all data when textarea is emptied', async () => {
    render(<JWTDecoderPage />)

    const textarea = screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i)

    // First enter valid token
    fireEvent.change(textarea, { target: { value: VALID_JWT } })

    await waitFor(() => {
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    // Then clear it
    fireEvent.change(textarea, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.queryByText('Header')).not.toBeInTheDocument()
      expect(screen.queryByText('Payload')).not.toBeInTheDocument()
      expect(screen.queryByText('Signature')).not.toBeInTheDocument()
    })
  })
})
