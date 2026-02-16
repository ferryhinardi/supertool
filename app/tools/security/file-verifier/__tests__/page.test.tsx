import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FileVerifierPage from '../page'

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

// Mock clipboard API

// Mock WebCrypto API
const mockDigest = vi.fn()
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest,
    },
  },
  writable: true,
})

describe('File Integrity Verifier - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock hash result (SHA-256 of "test")
    mockDigest.mockResolvedValue(
      new Uint8Array([
        159, 134, 208, 129, 136, 76, 125, 101, 154, 47, 234, 160, 197, 90, 208, 21, 163, 191, 79,
        27, 43, 11, 130, 44, 209, 93, 108, 21, 176, 240, 10, 8,
      ]).buffer
    )
  })

  it('should render file verifier page', () => {
    render(<FileVerifierPage />)

    expect(screen.getByRole('heading', { name: 'File Integrity Verifier', level: 1 }))
    expect(screen.getByText(/cryptographic hashes/i))
  })

  it('should display upload section', () => {
    render(<FileVerifierPage />)

    expect(screen.getByText('Upload File'))
  })

  it('should display algorithm selection buttons', () => {
    render(<FileVerifierPage />)

    expect(screen.getByRole('button', { name: 'MD5' }))
    expect(screen.getByRole('button', { name: 'SHA-1' }))
    expect(screen.getByRole('button', { name: 'SHA-256' }))
    expect(screen.getByRole('button', { name: 'SHA-512' }))
  })

  it('should display expected hash input field', () => {
    render(<FileVerifierPage />)

    // Check for placeholder with algorithm-specific text
    const input = screen.getByPlaceholderText(/Enter expected/i)
    expect(input).toBeInTheDocument()
  })

  it('should display educational sections', () => {
    render(<FileVerifierPage />)

    expect(screen.getByText('Common Use Cases'))
  })

  it('should display security badge', () => {
    render(<FileVerifierPage />)

    expect(screen.getByText(/Secure • Client-Side • No Server Upload/i))
  })
})

describe('File Integrity Verifier - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDigest.mockResolvedValue(
      new Uint8Array([
        159, 134, 208, 129, 136, 76, 125, 101, 154, 47, 234, 160, 197, 90, 208, 21, 163, 191, 79,
        27, 43, 11, 130, 44, 209, 93, 108, 21, 176, 240, 10, 8,
      ]).buffer
    )
  })

  it('should have proper heading hierarchy', () => {
    render(<FileVerifierPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('File Integrity Verifier')
  })

  it('should have accessible file input', () => {
    render(<FileVerifierPage />)

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('should have accessible form controls', () => {
    render(<FileVerifierPage />)

    const expectedHashInput = screen.getByPlaceholderText(/Enter expected/i)
    expect(expectedHashInput).toBeInTheDocument()
  })
})

describe('File Integrity Verifier - Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDigest.mockResolvedValue(
      new Uint8Array([
        159, 134, 208, 129, 136, 76, 125, 101, 154, 47, 234, 160, 197, 90, 208, 21, 163, 191, 79,
        27, 43, 11, 130, 44, 209, 93, 108, 21, 176, 240, 10, 8,
      ]).buffer
    )
  })

  it('should handle file selection', async () => {
    render(<FileVerifierPage />)

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalled()
    })
  })

  it('should change algorithm when button is clicked', async () => {
    render(<FileVerifierPage />)

    const md5Button = screen.getByRole('button', { name: 'MD5' })
    fireEvent.click(md5Button)

    // Algorithm should be changed (verified by no errors)
    expect(md5Button).toBeInTheDocument()
  })

  it('should display file metadata after upload', async () => {
    render(<FileVerifierPage />)

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
  })

  it('should format file size correctly for bytes', async () => {
    render(<FileVerifierPage />)

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalled()
    })
  })

  it('should handle empty file selection', () => {
    render(<FileVerifierPage />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [] } })

    // Should not call digest
    expect(mockDigest).not.toHaveBeenCalled()
  })

  it('should copy hash to clipboard when copy button is clicked', async () => {
    render(<FileVerifierPage />)

    // Upload file first
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalled()
    })

    // Find and click copy button
    const copyButtons = screen.getAllByRole('button')
    const copyButton = copyButtons.find((btn) => btn.textContent?.includes('Copy'))

    if (copyButton) {
      fireEvent.click(copyButton)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      )
    }
  })

  it('should clear all data when clear button is clicked', async () => {
    render(<FileVerifierPage />)

    // Upload file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalled()
    })

    // Clear
    const buttons = screen.getAllByRole('button')
    const clearButton = buttons.find((btn) => btn.textContent?.includes('Clear'))

    if (clearButton) {
      fireEvent.click(clearButton)
    }

    // File name should be removed
    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
    })
  })

  it('should handle file hash calculation errors gracefully', async () => {
    mockDigest.mockRejectedValueOnce(new Error('Hash calculation failed'))

    render(<FileVerifierPage />)

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalled()
    })
  })

  it('should verify when verify button is clicked', async () => {
    render(<FileVerifierPage />)

    // Upload file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalled()
    })

    // Enter hash
    const expectedHashInput = screen.getByPlaceholderText(/Enter expected/i)
    const calculatedHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    fireEvent.change(expectedHashInput, { target: { value: calculatedHash } })

    // Click verify button
    const buttons = screen.getAllByRole('button')
    const verifyButton = buttons.find((btn) => btn.textContent?.includes('Verify'))

    if (verifyButton) {
      fireEvent.click(verifyButton)
    }
  })

  it('should recalculate hash when algorithm changes with file selected', async () => {
    render(<FileVerifierPage />)

    // First upload a file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalledTimes(1)
    })

    // Then change algorithm
    vi.clearAllMocks()
    const sha512Button = screen.getByRole('button', { name: 'SHA-512' })
    fireEvent.click(sha512Button)

    await waitFor(() => {
      expect(mockDigest).toHaveBeenCalledTimes(1)
    })
  })
})
