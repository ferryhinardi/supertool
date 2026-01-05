import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '../Sidebar'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

// Mock auth store
vi.mock('@/lib/auth/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    profile: null,
    isLoading: false,
    openAuthModal: vi.fn(),
    signOut: vi.fn(),
  })),
}))

describe('Sidebar', () => {
  it('renders SuperTool logo', () => {
    render(<Sidebar />)

    expect(screen.getByText('SuperTool')).toBeInTheDocument()
    expect(screen.getByText('Digital Toolkit')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Sidebar />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText(/JSON Beautifier/i)).toBeInTheDocument()
    expect(screen.getByText(/QR Code Generator/i)).toBeInTheDocument()
    expect(screen.getByText(/Password Generator/i)).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Sidebar />)

    const menuButton = screen.getByLabelText('Toggle menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu when button clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const menuButton = screen.getByLabelText('Toggle menu')
    await user.click(menuButton)

    // Check for close menu button/overlay
    const closeButton = screen.getByLabelText('Close menu')
    expect(closeButton).toBeInTheDocument()
  })

  it('renders sign in button when user is not authenticated', () => {
    render(<Sidebar />)

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays footer information', () => {
    render(<Sidebar />)

    expect(screen.getByText(/built with/i)).toBeInTheDocument()
    expect(screen.getByText('Ferry')).toBeInTheDocument()
  })

  it('renders all major tool categories', () => {
    render(<Sidebar />)

    // Check for various tool categories
    expect(screen.getByText(/JSON Beautifier/i)).toBeInTheDocument()
    expect(screen.getByText(/Split Bill/i)).toBeInTheDocument()
    expect(screen.getByText(/Currency Converter/i)).toBeInTheDocument()
    expect(screen.getByText(/Password Generator/i)).toBeInTheDocument()
    expect(screen.getByText(/Hash Generator/i)).toBeInTheDocument()
    expect(screen.getByText(/Unit Converter/i)).toBeInTheDocument()
    expect(screen.getByText(/BMI.*Health Calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/API Request Tester/i)).toBeInTheDocument()
  })
})
