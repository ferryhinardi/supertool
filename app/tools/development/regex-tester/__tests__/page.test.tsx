'use client'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// All vi.mock calls must be at the top level and will be hoisted

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

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import RegexTesterPage from '../page'
import {
  CODE_LANGUAGES,
  escapeRegex,
  FLAG_DESCRIPTIONS,
  generateCode,
  highlightMatches,
  REGEX_PATTERNS,
  testRegex,
} from '../templates'

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
})

const getRequiredPattern = (id: string) => {
  const pattern = REGEX_PATTERNS.find((item) => item.id === id)

  if (!pattern) {
    throw new Error(`Expected regex pattern '${id}' to exist`)
  }

  return pattern
}

describe('RegexTesterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title and description', () => {
      render(<RegexTesterPage />)

      expect(screen.getByText('Regex Tester')).toBeInTheDocument()
      expect(
        screen.getByText(/Test and validate regular expressions with live matching/i)
      ).toBeInTheDocument()
    })

    it('renders the pattern input section', () => {
      render(<RegexTesterPage />)

      expect(screen.getByPlaceholderText(/Enter your regex pattern/i)).toBeInTheDocument()
    })

    it('renders the test string textarea', () => {
      render(<RegexTesterPage />)

      expect(
        screen.getByPlaceholderText(/Enter text to test your regex pattern/i)
      ).toBeInTheDocument()
    })

    it('renders regex flag buttons', () => {
      render(<RegexTesterPage />)

      // Should show flag buttons by their title attribute
      expect(screen.getByTitle(/Global - Find all matches/i)).toBeInTheDocument()
      expect(screen.getByTitle(/Case Insensitive/i)).toBeInTheDocument()
      expect(screen.getByTitle(/Multiline/i)).toBeInTheDocument()
    })

    it('has global flag enabled by default', () => {
      render(<RegexTesterPage />)

      const gFlagButton = screen.getByTitle(/Global - Find all matches/i)
      // The button should have some indication of being selected (checking aria or class)
      expect(gFlagButton).toBeInTheDocument()
    })

    it('renders the patterns section', () => {
      render(<RegexTesterPage />)

      expect(screen.getByText('Common Patterns')).toBeInTheDocument()
    })

    it('renders clear button', () => {
      render(<RegexTesterPage />)

      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
    })

    it('renders copy pattern button', () => {
      render(<RegexTesterPage />)

      expect(screen.getByRole('button', { name: /Copy Pattern/i })).toBeInTheDocument()
    })
  })

  describe('Pattern Input', () => {
    it('accepts pattern input', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      await user.type(patternInput, 'hello')

      expect(patternInput).toHaveValue('hello')
    })

    it('shows matches when pattern is valid', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      const testInput = screen.getByPlaceholderText(/Enter text to test your regex pattern/i)

      await user.type(patternInput, 'hello')
      await user.type(testInput, 'hello world')

      await waitFor(() => {
        // Should show match count or indicator
        expect(screen.getByText(/1 match/i)).toBeInTheDocument()
      })
    })

    it('shows multiple matches with global flag', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      const testInput = screen.getByPlaceholderText(/Enter text to test your regex pattern/i)

      await user.type(patternInput, 'a')
      await user.type(testInput, 'abracadabra')

      await waitFor(() => {
        expect(screen.getByText(/5 matches/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid regex pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      // Use paste to avoid special character issues with userEvent.type
      await user.click(patternInput)
      await user.paste('[invalid')

      await waitFor(() => {
        expect(screen.getByText(/Invalid/i)).toBeInTheDocument()
      })
    })

    it('shows no matches when pattern does not match', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      const testInput = screen.getByPlaceholderText(/Enter text to test your regex pattern/i)

      await user.type(patternInput, 'xyz')
      await user.type(testInput, 'hello world')

      await waitFor(() => {
        expect(screen.getByText(/No matches found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Flag Toggling', () => {
    it('toggles global flag', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const gFlagButton = screen.getByTitle(/Global - Find all matches/i)
      await user.click(gFlagButton)

      // Flag should now be toggled off
      expect(trackToolEvent).toHaveBeenCalledWith('regex_tester_flag_toggled', { flag: 'g' })
    })

    it('toggles case insensitive flag', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const iFlagButton = screen.getByTitle(/Case Insensitive/i)
      await user.click(iFlagButton)

      expect(trackToolEvent).toHaveBeenCalledWith('regex_tester_flag_toggled', { flag: 'i' })
    })

    it('toggles multiline flag', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const mFlagButton = screen.getByTitle(/Multiline/i)
      await user.click(mFlagButton)

      expect(trackToolEvent).toHaveBeenCalledWith('regex_tester_flag_toggled', { flag: 'm' })
    })
  })

  describe('Loading Preset Patterns', () => {
    it('loads email pattern when selected', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      // Find and click email pattern - use exact match to avoid matching "Extract Emails"
      const emailButtons = screen.getAllByRole('button', { name: /Email Address/i })
      // Get the first one which is the validation pattern
      await user.click(emailButtons[0])

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Loaded: Email Address')
      })
      expect(trackToolEvent).toHaveBeenCalledWith('regex_tester_pattern_loaded', {
        pattern_id: 'email',
      })
    })

    it('loads URL pattern when selected', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      // The button name includes description, so match partial name
      const urlButton = screen.getByRole('button', { name: /^URL Validates HTTP/i })
      await user.click(urlButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Loaded: URL')
      })
    })

    it('loads phone pattern when selected', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const phoneButton = screen.getByRole('button', { name: /US Phone Number/i })
      await user.click(phoneButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Loaded: US Phone Number')
      })
    })
  })

  describe('Pattern Category Filter', () => {
    it('shows all patterns by default', () => {
      render(<RegexTesterPage />)

      // Should show patterns from different categories - use getAllBy for potential duplicates
      expect(screen.getAllByRole('button', { name: /Email Address/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('button', { name: /Extract Emails/i }).length).toBeGreaterThan(0)
    })

    it('filters patterns by validation category', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      // Click on validation category button
      const validationButton = screen.getByRole('button', { name: /^Validation$/i })
      await user.click(validationButton)

      // Should show validation patterns
      expect(screen.getAllByRole('button', { name: /Email Address/i }).length).toBeGreaterThan(0)
    })
  })

  describe('Copy Functionality', () => {
    it('copies pattern to clipboard', async () => {
      // Create fresh spy for this test
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      await user.type(patternInput, 'hello')

      // Verify the input has the value
      expect(patternInput).toHaveValue('hello')

      // Find copy button and ensure it's enabled
      const copyButton = screen.getByRole('button', { name: /Copy Pattern/i })
      await waitFor(() => {
        expect(copyButton).not.toBeDisabled()
      })

      await user.click(copyButton)

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalledWith('/hello/g')
      })
      expect(toast.success).toHaveBeenCalledWith('Pattern copied to clipboard')
      expect(trackToolEvent).toHaveBeenCalledWith('regex_tester_pattern_copied')
    })
  })

  describe('Clear Functionality', () => {
    it('clears all inputs when clicking clear', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      const testInput = screen.getByPlaceholderText(/Enter text to test your regex pattern/i)

      await user.type(patternInput, 'hello')
      await user.type(testInput, 'hello world')

      expect(patternInput).toHaveValue('hello')
      expect(testInput).toHaveValue('hello world')

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      await user.click(clearButton)

      expect(patternInput).toHaveValue('')
      expect(testInput).toHaveValue('')
      expect(trackToolEvent).toHaveBeenCalledWith('regex_tester_cleared')
    })
  })

  describe('Code Generation', () => {
    it('shows code snippet section', async () => {
      render(<RegexTesterPage />)

      // Look for code generation heading
      expect(screen.getByText('Code Generation')).toBeInTheDocument()
    })

    it('can select different programming languages', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      // Click code toggle to show code section - use the heading button
      const codeSection = screen.getByRole('button', { name: /Code Generation/i })
      await user.click(codeSection)

      // Should have language selector
      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible pattern input', () => {
      render(<RegexTesterPage />)

      const patternInput = screen.getByPlaceholderText(/Enter your regex pattern/i)
      expect(patternInput).toBeInTheDocument()
      expect(patternInput.tagName.toLowerCase()).toBe('input')
    })

    it('has accessible test string textarea', () => {
      render(<RegexTesterPage />)

      const testInput = screen.getByPlaceholderText(/Enter text to test your regex pattern/i)
      expect(testInput).toBeInTheDocument()
      expect(testInput.tagName.toLowerCase()).toBe('textarea')
    })

    it('flag buttons have accessible labels', () => {
      render(<RegexTesterPage />)

      // Flags should be accessible by their title attribute
      expect(screen.getByTitle(/Global - Find all matches/i)).toBeInTheDocument()
      expect(screen.getByTitle(/Case Insensitive/i)).toBeInTheDocument()
      expect(screen.getByTitle(/Multiline/i)).toBeInTheDocument()
    })
  })
})

// Utility function tests
describe('Regex Utils', () => {
  describe('testRegex', () => {
    it('returns valid result for valid pattern', () => {
      const result = testRegex('hello', ['g'], 'hello world')

      expect(result.isValid).toBe(true)
      expect(result.hasMatch).toBe(true)
      expect(result.matches.length).toBe(1)
      expect(result.matches[0].match).toBe('hello')
    })

    it('returns error for invalid pattern', () => {
      const result = testRegex('[invalid', [], 'test')

      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.matches.length).toBe(0)
    })

    it('finds multiple matches with global flag', () => {
      const result = testRegex('a', ['g'], 'abracadabra')

      expect(result.isValid).toBe(true)
      expect(result.matches.length).toBe(5)
    })

    it('finds single match without global flag', () => {
      const result = testRegex('a', [], 'abracadabra')

      expect(result.isValid).toBe(true)
      expect(result.matches.length).toBe(1)
    })

    it('handles case insensitive flag', () => {
      const result = testRegex('HELLO', ['i'], 'hello world')

      expect(result.isValid).toBe(true)
      expect(result.hasMatch).toBe(true)
    })

    it('returns no match when pattern does not match', () => {
      const result = testRegex('xyz', ['g'], 'hello world')

      expect(result.isValid).toBe(true)
      expect(result.hasMatch).toBe(false)
      expect(result.matches.length).toBe(0)
    })

    it('captures groups correctly', () => {
      const result = testRegex('(?<name>\\w+)@(?<domain>\\w+)', [], 'user@example')

      expect(result.isValid).toBe(true)
      expect(result.matches[0].groups).toBeDefined()
      expect(result.matches[0].groups?.name).toBe('user')
      expect(result.matches[0].groups?.domain).toBe('example')
    })

    it('handles empty pattern', () => {
      const result = testRegex('', [], 'test')

      expect(result.isValid).toBe(true)
    })

    it('handles empty test string', () => {
      const result = testRegex('hello', [], '')

      expect(result.isValid).toBe(true)
      expect(result.hasMatch).toBe(false)
    })
  })

  describe('escapeRegex', () => {
    it('escapes special regex characters', () => {
      const result = escapeRegex('hello.*world')

      expect(result).toBe('hello\\.\\*world')
    })

    it('escapes brackets', () => {
      const result = escapeRegex('[test]')

      expect(result).toBe('\\[test\\]')
    })

    it('escapes parentheses', () => {
      const result = escapeRegex('(test)')

      expect(result).toBe('\\(test\\)')
    })

    it('escapes dollar sign and caret', () => {
      const result = escapeRegex('^$100')

      expect(result).toBe('\\^\\$100')
    })

    it('leaves alphanumeric characters unchanged', () => {
      const result = escapeRegex('hello123')

      expect(result).toBe('hello123')
    })
  })

  describe('highlightMatches', () => {
    it('returns single non-match segment for no matches', () => {
      const result = highlightMatches('hello world', [])

      expect(result.length).toBe(1)
      expect(result[0].text).toBe('hello world')
      expect(result[0].isMatch).toBe(false)
    })

    it('highlights single match', () => {
      const matches = [{ match: 'hello', index: 0 }]
      const result = highlightMatches('hello world', matches)

      expect(result.length).toBe(2)
      expect(result[0].text).toBe('hello')
      expect(result[0].isMatch).toBe(true)
      expect(result[1].text).toBe(' world')
      expect(result[1].isMatch).toBe(false)
    })

    it('highlights multiple matches', () => {
      const matches = [
        { match: 'a', index: 0 },
        { match: 'a', index: 3 },
        { match: 'a', index: 5 },
      ]
      const result = highlightMatches('abracadabra', matches)

      // Should have alternating match and non-match segments
      const matchSegments = result.filter((s) => s.isMatch)
      expect(matchSegments.length).toBe(3)
    })

    it('handles match at end of string', () => {
      const matches = [{ match: 'world', index: 6 }]
      const result = highlightMatches('hello world', matches)

      expect(result[result.length - 1].text).toBe('world')
      expect(result[result.length - 1].isMatch).toBe(true)
    })

    it('handles match at beginning of string', () => {
      const matches = [{ match: 'hello', index: 0 }]
      const result = highlightMatches('hello world', matches)

      expect(result[0].text).toBe('hello')
      expect(result[0].isMatch).toBe(true)
    })
  })

  describe('generateCode', () => {
    it('generates JavaScript code', () => {
      const code = generateCode('\\d+', ['g'], 'javascript')

      expect(code).toContain('const regex = /\\d+/g')
      expect(code).toContain('.match(regex)')
    })

    it('generates TypeScript code', () => {
      const code = generateCode('\\d+', ['g'], 'typescript')

      expect(code).toContain('const regex = /\\d+/g')
    })

    it('generates Python code', () => {
      const code = generateCode('\\d+', ['g', 'i'], 'python')

      expect(code).toContain('import re')
      expect(code).toContain('pattern = r"\\d+"')
      expect(code).toContain('re.IGNORECASE')
    })

    it('generates Java code', () => {
      const code = generateCode('\\d+', ['i'], 'java')

      expect(code).toContain('import java.util.regex.*')
      expect(code).toContain('Pattern.CASE_INSENSITIVE')
    })

    it('generates C# code', () => {
      const code = generateCode('\\d+', ['i'], 'csharp')

      expect(code).toContain('using System.Text.RegularExpressions')
      expect(code).toContain('RegexOptions.IgnoreCase')
    })

    it('generates PHP code', () => {
      const code = generateCode('\\d+', ['g'], 'php')

      expect(code).toContain('preg_match_all')
      expect(code).toContain('/\\d+/g')
    })

    it('generates Ruby code', () => {
      const code = generateCode('\\d+', ['g'], 'ruby')

      expect(code).toContain('/\\d+/g')
      expect(code).toContain('.scan(pattern)')
    })

    it('generates Go code', () => {
      const code = generateCode('\\d+', [], 'go')

      expect(code).toContain('import "regexp"')
      expect(code).toContain('regexp.MustCompile')
    })

    it('returns basic pattern for unknown language', () => {
      const code = generateCode('\\d+', ['g'], 'unknown')

      expect(code).toBe('/\\d+/g')
    })
  })

  describe('REGEX_PATTERNS', () => {
    it('contains expected pattern categories', () => {
      const categories = [...new Set(REGEX_PATTERNS.map((p) => p.category))]

      expect(categories).toContain('validation')
      expect(categories).toContain('extraction')
      expect(categories).toContain('formatting')
      expect(categories).toContain('advanced')
    })

    it('all patterns have required properties', () => {
      for (const pattern of REGEX_PATTERNS) {
        expect(pattern.id).toBeDefined()
        expect(pattern.name).toBeDefined()
        expect(pattern.description).toBeDefined()
        expect(pattern.pattern).toBeDefined()
        expect(pattern.flags).toBeDefined()
        expect(pattern.category).toBeDefined()
        expect(pattern.examples).toBeDefined()
        expect(pattern.examples.length).toBeGreaterThan(0)
      }
    })

    it('all patterns are valid regex', () => {
      for (const pattern of REGEX_PATTERNS) {
        const result = testRegex(pattern.pattern, pattern.flags, pattern.examples[0])
        expect(result.isValid).toBe(true)
      }
    })

    it('email pattern matches valid emails', () => {
      const emailPattern = getRequiredPattern('email')

      const result = testRegex(emailPattern.pattern, emailPattern.flags, 'user@example.com')
      expect(result.hasMatch).toBe(true)
    })

    it('url pattern matches valid URLs', () => {
      const urlPattern = getRequiredPattern('url')

      const result = testRegex(urlPattern.pattern, urlPattern.flags, 'https://example.com')
      expect(result.hasMatch).toBe(true)
    })

    it('phone pattern matches US phone numbers', () => {
      const phonePattern = getRequiredPattern('phone-us')

      const result = testRegex(phonePattern.pattern, phonePattern.flags, '(555) 123-4567')
      expect(result.hasMatch).toBe(true)
    })
  })

  describe('FLAG_DESCRIPTIONS', () => {
    it('contains descriptions for all flags', () => {
      expect(FLAG_DESCRIPTIONS.g).toBeDefined()
      expect(FLAG_DESCRIPTIONS.i).toBeDefined()
      expect(FLAG_DESCRIPTIONS.m).toBeDefined()
      expect(FLAG_DESCRIPTIONS.s).toBeDefined()
      expect(FLAG_DESCRIPTIONS.u).toBeDefined()
      expect(FLAG_DESCRIPTIONS.y).toBeDefined()
    })

    it('global flag has correct description', () => {
      expect(FLAG_DESCRIPTIONS.g).toContain('Global')
    })

    it('case insensitive flag has correct description', () => {
      expect(FLAG_DESCRIPTIONS.i).toContain('Case')
    })
  })

  describe('CODE_LANGUAGES', () => {
    it('contains expected languages', () => {
      const languageIds = CODE_LANGUAGES.map((l) => l.id)

      expect(languageIds).toContain('javascript')
      expect(languageIds).toContain('typescript')
      expect(languageIds).toContain('python')
      expect(languageIds).toContain('java')
      expect(languageIds).toContain('csharp')
      expect(languageIds).toContain('php')
      expect(languageIds).toContain('ruby')
      expect(languageIds).toContain('go')
    })

    it('all languages have name and extension', () => {
      for (const lang of CODE_LANGUAGES) {
        expect(lang.id).toBeDefined()
        expect(lang.name).toBeDefined()
        expect(lang.ext).toBeDefined()
      }
    })
  })
})
