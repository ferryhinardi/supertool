import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GoogleButton } from '../GoogleButton'

// Mock auth store
vi.mock('@/lib/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    closeAuthModal: vi.fn(),
  })),
}))

describe('GoogleButton', () => {
  it('renders the Google sign-in button', () => {
    render(<GoogleButton />)

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('displays Google logo/icon', () => {
    render(<GoogleButton />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    // Check that SVG icon is present
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('button is not disabled by default', () => {
    render(<GoogleButton />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).not.toBeDisabled()
  })
})
