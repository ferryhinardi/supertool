import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/lib/auth-store'
import { AuthModal } from '../AuthModal'

// Mock the auth store
vi.mock('@/lib/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

// Mock child components
vi.mock('../LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}))

vi.mock('../SignupForm', () => ({
  SignupForm: () => <div data-testid="signup-form">Signup Form</div>,
}))

vi.mock('../ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">Forgot Password Form</div>,
}))

describe('AuthModal', () => {
  const mockCloseAuthModal = vi.fn()
  const mockSetAuthView = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when modal is closed', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: false,
      closeAuthModal: mockCloseAuthModal,
      authView: 'sign-in',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    const { container } = render(<AuthModal />)
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('should render sign-in view when modal is open', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: true,
      closeAuthModal: mockCloseAuthModal,
      authView: 'sign-in',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    render(<AuthModal />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('should render sign-up view', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: true,
      closeAuthModal: mockCloseAuthModal,
      authView: 'sign-up',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    render(<AuthModal />)
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
  })

  it('should render forgot-password view', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: true,
      closeAuthModal: mockCloseAuthModal,
      authView: 'forgot-password',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    render(<AuthModal />)
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
  })

  it('should switch to sign-up view when clicking sign up link', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: true,
      closeAuthModal: mockCloseAuthModal,
      authView: 'sign-in',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    render(<AuthModal />)
    const signUpButton = screen.getByText('Sign up')
    await user.click(signUpButton)

    expect(mockSetAuthView).toHaveBeenCalledWith('sign-up')
  })

  it('should switch to forgot-password view when clicking forgot password link', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: true,
      closeAuthModal: mockCloseAuthModal,
      authView: 'sign-in',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    render(<AuthModal />)
    const forgotPasswordButton = screen.getByText('Forgot password?')
    await user.click(forgotPasswordButton)

    expect(mockSetAuthView).toHaveBeenCalledWith('forgot-password')
  })

  it('should switch back to sign-in from sign-up view', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthModalOpen: true,
      closeAuthModal: mockCloseAuthModal,
      authView: 'sign-up',
      setAuthView: mockSetAuthView,
      user: null,
      isLoading: false,
      openAuthModal: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    })

    render(<AuthModal />)
    const signInButton = screen.getByText('Sign in')
    await user.click(signInButton)

    expect(mockSetAuthView).toHaveBeenCalledWith('sign-in')
  })
})
