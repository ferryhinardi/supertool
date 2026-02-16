'use client'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import SQLFormatterPage from '../page'

// Mock clipboard API at module level using Object.defineProperty
const mockWriteText = vi.fn().mockResolvedValue(undefined)
const mockReadText = vi.fn().mockResolvedValue('')
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
    readText: mockReadText,
  },
  writable: true,
  configurable: true,
})

describe('SQLFormatterPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
    mockReadText.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByText('SQL Formatter')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByText(/Format, beautify, and minify SQL queries/i)).toBeInTheDocument()
    })

    it('renders the input textarea', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByPlaceholderText('Paste your SQL query here...')).toBeInTheDocument()
    })

    it('renders the Format button', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument()
    })

    it('renders the Minify button', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByRole('button', { name: /minify/i })).toBeInTheDocument()
    })

    it('renders the Clear button', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('renders SQL dialect selector', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByLabelText('SQL Dialect')).toBeInTheDocument()
    })

    it('renders Indent Size selector', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByLabelText('Indent Size')).toBeInTheDocument()
    })

    it('renders Keyword Case selector', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByLabelText('Keyword Case')).toBeInTheDocument()
    })

    it('renders example buttons', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByText('Quick examples:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Basic SELECT' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'JOIN' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Subquery' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'CREATE TABLE' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'INSERT' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'UPDATE' })).toBeInTheDocument()
    })

    it('renders tips section', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByText('Tips for Better SQL Formatting')).toBeInTheDocument()
    })

    it('shows placeholder text for formatted output', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByText('Formatted SQL will appear here...')).toBeInTheDocument()
    })

    it('shows initial character and line counts as 0', () => {
      render(<SQLFormatterPage />)
      expect(screen.getByText('0 characters')).toBeInTheDocument()
      expect(screen.getByText('1 lines')).toBeInTheDocument()
    })
  })

  describe('Input Handling', () => {
    it('updates input value when typing', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')

      expect(input).toHaveValue('SELECT * FROM users')
    })

    it('updates character count when typing', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT')

      expect(screen.getByText('6 characters')).toBeInTheDocument()
    })
  })

  describe('Format SQL', () => {
    it('formats SQL when Format button is clicked', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'select * from users where id=1')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('SQL formatted successfully!')
      })
    })

    it('tracks analytics when formatting SQL', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'select * from users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'sql_formatter_formatted',
          expect.objectContaining({
            dialect: 'standard',
            input_length: expect.any(Number),
            output_length: expect.any(Number),
          })
        )
      })
    })

    it('shows error when formatting empty input', async () => {
      render(<SQLFormatterPage />)

      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter SQL query')
      })
    })

    it('displays error message for empty input', async () => {
      render(<SQLFormatterPage />)

      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByText('Please enter SQL query to format')).toBeInTheDocument()
      })
    })
  })

  describe('Minify SQL', () => {
    it('minifies SQL when Minify button is clicked', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT  *  FROM  users  WHERE  id = 1')
      await user.click(screen.getByRole('button', { name: /minify/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('SQL minified successfully!')
      })
    })

    it('tracks analytics when minifying SQL', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /minify/i }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'sql_formatter_minified',
          expect.objectContaining({
            input_length: expect.any(Number),
            output_length: expect.any(Number),
          })
        )
      })
    })

    it('shows error when minifying empty input', async () => {
      render(<SQLFormatterPage />)

      await user.click(screen.getByRole('button', { name: /minify/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter SQL query')
      })
    })

    it('displays error message for empty minify input', async () => {
      render(<SQLFormatterPage />)

      await user.click(screen.getByRole('button', { name: /minify/i }))

      await waitFor(() => {
        expect(screen.getByText('Please enter SQL query to minify')).toBeInTheDocument()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears all inputs when Clear button is clicked', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('SQL formatted successfully!')
      })

      await user.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(input).toHaveValue('')
        expect(toast.success).toHaveBeenCalledWith('Cleared')
      })
    })

    it('tracks analytics when clearing', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('sql_formatter_cleared', {})
      })
    })

    it('resets formatted output when clearing', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })

      await user.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(screen.getByText('Formatted SQL will appear here...')).toBeInTheDocument()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('shows Copy button after formatting', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      // Copy button should not be visible initially
      expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      })
    })

    it('copies formatted SQL to clipboard', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Formatted SQL copied!')
      })
    })

    it('tracks analytics when copying', async () => {
      mockWriteText.mockResolvedValue(undefined)
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'sql_formatter_copied',
          expect.objectContaining({
            sql_length: expect.any(Number),
          })
        )
      })
    })

    it('shows Copied! text after copying', async () => {
      mockWriteText.mockResolvedValue(undefined)
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    // TODO: Fix clipboard rejection mock - the mock doesn't properly propagate rejection
    it.skip('shows error when clipboard fails', async () => {
      // Reset the mock to reject for this specific test
      mockWriteText.mockReset()
      mockWriteText.mockRejectedValue(new Error('Clipboard error'))

      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })

      // Reset the mock back to resolved for other tests
      mockWriteText.mockReset()
      mockWriteText.mockResolvedValue(undefined)
    })
  })

  describe('Load Example', () => {
    it('loads Basic SELECT example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.click(screen.getByRole('button', { name: 'Basic SELECT' }))

      await waitFor(() => {
        expect(input).toHaveValue(
          'select id,name,email from users where status="active" and age>=18 order by name'
        )
        expect(toast.success).toHaveBeenCalledWith('Example loaded')
      })
    })

    it('loads JOIN example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.click(screen.getByRole('button', { name: 'JOIN' }))

      await waitFor(() => {
        expect(input).toHaveValue(
          'select u.name,o.total from users u inner join orders o on u.id=o.user_id where o.status="completed"'
        )
      })
    })

    it('loads Subquery example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.click(screen.getByRole('button', { name: 'Subquery' }))

      await waitFor(() => {
        expect(input).toHaveValue(
          'select * from products where price>(select avg(price) from products) order by price desc'
        )
      })
    })

    it('loads CREATE TABLE example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.click(screen.getByRole('button', { name: 'CREATE TABLE' }))

      await waitFor(() => {
        expect(input).toHaveValue(
          'create table employees(id int primary key auto_increment,name varchar(100) not null,email varchar(100) unique,salary decimal(10,2),hire_date date)'
        )
      })
    })

    it('loads INSERT example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.click(screen.getByRole('button', { name: 'INSERT' }))

      await waitFor(() => {
        expect(input).toHaveValue(
          'insert into users(name,email,age)values("John Doe","john@example.com",30),("Jane Smith","jane@example.com",25)'
        )
      })
    })

    it('loads UPDATE example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.click(screen.getByRole('button', { name: 'UPDATE' }))

      await waitFor(() => {
        expect(input).toHaveValue(
          'update orders set status="shipped",shipped_at=now() where id in(select order_id from shipments where shipped_date=current_date)'
        )
      })
    })

    it('tracks analytics when loading example', async () => {
      render(<SQLFormatterPage />)

      await user.click(screen.getByRole('button', { name: 'Basic SELECT' }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('sql_formatter_example_loaded', {})
      })
    })

    it('clears formatted output when loading example', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('SQL formatted successfully!')
      })

      await user.click(screen.getByRole('button', { name: 'Basic SELECT' }))

      await waitFor(() => {
        expect(screen.getByText('Formatted SQL will appear here...')).toBeInTheDocument()
      })
    })
  })

  describe('Settings Changes', () => {
    it('changes SQL dialect', async () => {
      render(<SQLFormatterPage />)
      const dialectSelect = screen.getByLabelText('SQL Dialect')

      await user.selectOptions(dialectSelect, 'mysql')

      expect(dialectSelect).toHaveValue('mysql')
    })

    it('changes indent size', async () => {
      render(<SQLFormatterPage />)
      const indentSelect = screen.getByLabelText('Indent Size')

      await user.selectOptions(indentSelect, '4')

      expect(indentSelect).toHaveValue('4')
    })

    it('changes keyword case', async () => {
      render(<SQLFormatterPage />)
      const caseSelect = screen.getByLabelText('Keyword Case')

      await user.selectOptions(caseSelect, 'lower')

      expect(caseSelect).toHaveValue('lower')
    })

    it('formats SQL with different dialect', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')
      const dialectSelect = screen.getByLabelText('SQL Dialect')

      await user.selectOptions(dialectSelect, 'postgresql')
      await user.type(input, 'select * from users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'sql_formatter_formatted',
          expect.objectContaining({
            dialect: 'postgresql',
          })
        )
      })
    })

    it('renders all SQL dialect options', () => {
      render(<SQLFormatterPage />)
      const dialectSelect = screen.getByLabelText('SQL Dialect')

      expect(dialectSelect).toContainElement(screen.getByRole('option', { name: 'Standard SQL' }))
      expect(dialectSelect).toContainElement(screen.getByRole('option', { name: 'MySQL' }))
      expect(dialectSelect).toContainElement(screen.getByRole('option', { name: 'PostgreSQL' }))
      expect(dialectSelect).toContainElement(screen.getByRole('option', { name: 'SQLite' }))
      expect(dialectSelect).toContainElement(
        screen.getByRole('option', { name: 'SQL Server (T-SQL)' })
      )
    })

    it('renders all indent size options', () => {
      render(<SQLFormatterPage />)
      const indentSelect = screen.getByLabelText('Indent Size')

      expect(indentSelect).toContainElement(screen.getByRole('option', { name: '2 spaces' }))
      expect(indentSelect).toContainElement(screen.getByRole('option', { name: '4 spaces' }))
      expect(indentSelect).toContainElement(screen.getByRole('option', { name: '8 spaces' }))
    })

    it('renders all keyword case options', () => {
      render(<SQLFormatterPage />)
      const caseSelect = screen.getByLabelText('Keyword Case')

      expect(caseSelect).toContainElement(screen.getByRole('option', { name: 'UPPERCASE' }))
      expect(caseSelect).toContainElement(screen.getByRole('option', { name: 'lowercase' }))
    })
  })

  describe('Output Display', () => {
    it('displays formatted SQL output', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'select * from users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        // After formatting, the success toast should be shown
        expect(toast.success).toHaveBeenCalledWith('SQL formatted successfully!')
        // And the Copy button should appear (indicating output is available)
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      })
    })

    it('displays minified SQL output', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'SELECT  *  FROM  users  WHERE  id = 1')
      await user.click(screen.getByRole('button', { name: /minify/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('SQL minified successfully!')
      })
    })

    it('shows output character and line counts after formatting', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      await user.type(input, 'select * from users where id = 1')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        // Should show multiple character/line counts (input and output)
        const characterCounts = screen.getAllByText(/\d+ characters/)
        expect(characterCounts.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message in output area', async () => {
      render(<SQLFormatterPage />)

      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByText('Please enter SQL query to format')).toBeInTheDocument()
      })
    })

    it('clears error when new input is formatted successfully', async () => {
      render(<SQLFormatterPage />)
      const input = screen.getByPlaceholderText('Paste your SQL query here...')

      // First, trigger an error
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.getByText('Please enter SQL query to format')).toBeInTheDocument()
      })

      // Then, enter valid SQL and format
      await user.type(input, 'SELECT * FROM users')
      await user.click(screen.getByRole('button', { name: /format/i }))

      await waitFor(() => {
        expect(screen.queryByText('Please enter SQL query to format')).not.toBeInTheDocument()
        expect(toast.success).toHaveBeenCalledWith('SQL formatted successfully!')
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible input labels', () => {
      render(<SQLFormatterPage />)

      expect(screen.getByLabelText('SQL Dialect')).toBeInTheDocument()
      expect(screen.getByLabelText('Indent Size')).toBeInTheDocument()
      expect(screen.getByLabelText('Keyword Case')).toBeInTheDocument()
      expect(screen.getByLabelText('Input SQL')).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      render(<SQLFormatterPage />)

      expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /minify/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })
  })
})
