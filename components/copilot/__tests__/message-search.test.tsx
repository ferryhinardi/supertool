import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageSearch } from '../message-search'

describe('MessageSearch', () => {
  const mockOnChange = vi.fn()
  const mockOnClose = vi.fn()
  const mockOnPrevMatch = vi.fn()
  const mockOnNextMatch = vi.fn()

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onClose: mockOnClose,
    matchCount: 0,
    currentMatch: 0,
    onPrevMatch: mockOnPrevMatch,
    onNextMatch: mockOnNextMatch,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders search input with placeholder', () => {
      render(<MessageSearch {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<MessageSearch {...defaultProps} />)

      expect(screen.getByRole('button', { name: /close search/i })).toBeInTheDocument()
    })

    it('does not show match count when value is empty', () => {
      render(<MessageSearch {...defaultProps} />)

      expect(screen.queryByText(/of/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/no results/i)).not.toBeInTheDocument()
    })

    it('shows "No results" when value is present but matchCount is 0', () => {
      render(<MessageSearch {...defaultProps} value="test" matchCount={0} />)

      expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('shows match count when matches exist', () => {
      render(<MessageSearch {...defaultProps} value="test" matchCount={5} currentMatch={2} />)

      expect(screen.getByText('2 of 5')).toBeInTheDocument()
    })

    it('does not show navigation buttons when matchCount is 0', () => {
      render(<MessageSearch {...defaultProps} value="test" matchCount={0} />)

      expect(screen.queryByRole('button', { name: /previous match/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next match/i })).not.toBeInTheDocument()
    })

    it('shows navigation buttons when matchCount is greater than 0', () => {
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={1} />)

      expect(screen.getByRole('button', { name: /previous match/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next match/i })).toBeInTheDocument()
    })
  })

  describe('Input interactions', () => {
    it('focuses input automatically on mount', () => {
      render(<MessageSearch {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search messages...')
      expect(document.activeElement).toBe(input)
    })

    it('calls onChange when typing', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search messages...')
      await user.type(input, 'hello')

      expect(mockOnChange).toHaveBeenCalledTimes(5)
      expect(mockOnChange).toHaveBeenLastCalledWith('o')
    })

    it('displays the current value', () => {
      render(<MessageSearch {...defaultProps} value="search term" />)

      const input = screen.getByPlaceholderText('Search messages...')
      expect(input).toHaveValue('search term')
    })
  })

  describe('Close button interactions', () => {
    it('calls onClose when clicking close button', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close search/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Keyboard shortcuts', () => {
    it('calls onClose when pressing Escape', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} />)

      const input = screen.getByPlaceholderText('Search messages...')
      await user.type(input, '{Escape}')

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onNextMatch when pressing Enter', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={1} />)

      const input = screen.getByPlaceholderText('Search messages...')
      await user.type(input, '{Enter}')

      expect(mockOnNextMatch).toHaveBeenCalledTimes(1)
      expect(mockOnPrevMatch).not.toHaveBeenCalled()
    })

    it('calls onPrevMatch when pressing Shift+Enter', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={2} />)

      const input = screen.getByPlaceholderText('Search messages...')
      await user.type(input, '{Shift>}{Enter}{/Shift}')

      expect(mockOnPrevMatch).toHaveBeenCalledTimes(1)
      expect(mockOnNextMatch).not.toHaveBeenCalled()
    })
  })

  describe('Navigation button interactions', () => {
    it('calls onPrevMatch when clicking previous button', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={2} />)

      const prevButton = screen.getByRole('button', { name: /previous match/i })
      await user.click(prevButton)

      expect(mockOnPrevMatch).toHaveBeenCalledTimes(1)
    })

    it('calls onNextMatch when clicking next button', async () => {
      const user = userEvent.setup()
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={1} />)

      const nextButton = screen.getByRole('button', { name: /next match/i })
      await user.click(nextButton)

      expect(mockOnNextMatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={1} />)

      expect(screen.getByRole('button', { name: /close search/i })).toHaveAttribute(
        'aria-label',
        'Close search'
      )
      expect(screen.getByRole('button', { name: /previous match/i })).toHaveAttribute(
        'aria-label',
        'Previous match'
      )
      expect(screen.getByRole('button', { name: /next match/i })).toHaveAttribute(
        'aria-label',
        'Next match'
      )
    })

    it('has tooltips with keyboard shortcut hints', () => {
      render(<MessageSearch {...defaultProps} value="test" matchCount={3} currentMatch={1} />)

      expect(screen.getByRole('button', { name: /close search/i })).toHaveAttribute(
        'title',
        'Close (Escape)'
      )
      expect(screen.getByRole('button', { name: /previous match/i })).toHaveAttribute(
        'title',
        'Previous match (Shift+Enter)'
      )
      expect(screen.getByRole('button', { name: /next match/i })).toHaveAttribute(
        'title',
        'Next match (Enter)'
      )
    })
  })
})
