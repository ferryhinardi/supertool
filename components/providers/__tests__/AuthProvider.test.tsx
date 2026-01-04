import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../AuthProvider'

// Mock auth store
vi.mock('@/lib/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    setUser: vi.fn(),
    setProfile: vi.fn(),
    setLoading: vi.fn(),
  })),
}))

describe('AuthProvider', () => {
  it('renders children correctly', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('passes through multiple children', () => {
    render(
      <AuthProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </AuthProvider>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('renders without crashing when no children', () => {
    const { container } = render(<AuthProvider>{null}</AuthProvider>)

    expect(container).toBeTruthy()
  })
})
