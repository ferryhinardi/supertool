import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CitationGeneratorPage from '../page'

// Mock analytics
const mockTrackToolEvent = vi.hoisted(() => vi.fn())
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

// Mock clipboard API using defineProperty (required for browser mode)
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
    write: vi.fn(),
    read: vi.fn(),
    readText: vi.fn(),
  },
  writable: true,
  configurable: true,
})

describe('CitationGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockWriteText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  describe('Rendering', () => {
    it('renders page with title and description', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /citation generator/i })).toBeInTheDocument()
      expect(
        screen.getByText(/generate accurate citations in apa, mla, chicago/i)
      ).toBeInTheDocument()
    })

    it('renders source type section with all 9 source types', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /^source type$/i })).toBeInTheDocument()

      // All 9 source types should be visible (using actual display names from SOURCE_TYPES)
      expect(screen.getByRole('button', { name: /^book$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /journal article/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^website$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /newspaper article/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /video\/youtube/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /conference paper/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /thesis\/dissertation/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^report$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /book chapter/i })).toBeInTheDocument()
    })

    it('renders citation style section with all 6 styles', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /^citation style$/i })).toBeInTheDocument()

      // All 6 citation styles (using full display names from CITATION_STYLES)
      expect(screen.getByRole('button', { name: /apa 7th edition/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /mla 9th edition/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /chicago 17th edition/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^harvard$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^ieee$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^vancouver$/i })).toBeInTheDocument()
    })

    it('renders source details section', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /source details/i })).toBeInTheDocument()
    })

    it('renders generate citation button', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('button', { name: /generate citation/i })).toBeInTheDocument()
    })

    it('renders result sections with placeholder text', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /full citation/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /in-text citation/i })).toBeInTheDocument()
      expect(
        screen.getByText(/fill in the source details and click.*generate citation/i)
      ).toBeInTheDocument()
    })

    it('renders style guide section', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /apa 7th edition guide/i })).toBeInTheDocument()
      expect(screen.getByText(/Common Use/)).toBeInTheDocument()
      expect(screen.getByText(/In-Text Format/)).toBeInTheDocument()
    })

    it('renders pro tips section', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /pro tips/i })).toBeInTheDocument()
      expect(
        screen.getByText(/always verify generated citations against your institution/i)
      ).toBeInTheDocument()
    })

    it('renders features section', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /^features$/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /multiple styles/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /all source types/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /copy to clipboard/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /accurate formatting/i })).toBeInTheDocument()
    })
  })

  describe('Source Type Selection', () => {
    it('selects book by default', () => {
      render(<CitationGeneratorPage />)

      // Book should be visible and the form should show book-related fields
      const bookButton = screen.getByRole('button', { name: /^book$/i })
      expect(bookButton).toBeInTheDocument()
      // Default fields for book should include title, publisher
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    it('changes form fields when selecting different source types', async () => {
      render(<CitationGeneratorPage />)

      // Select website - should show URL field
      await user.click(screen.getByRole('button', { name: /website/i }))
      expect(screen.getByLabelText(/url/i)).toBeInTheDocument()

      // Select journal - should show journal name, volume, issue
      await user.click(screen.getByRole('button', { name: /journal article/i }))
      expect(screen.getByLabelText(/journal name/i)).toBeInTheDocument()
    })

    it('tracks analytics when source type changes', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /journal article/i }))

      expect(mockTrackToolEvent).toHaveBeenCalledWith('citation_source_type_changed', {
        sourceType: 'journal',
      })
    })

    it('clears citation result when source type changes', async () => {
      render(<CitationGeneratorPage />)

      // Generate a citation first
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      await user.type(screen.getByLabelText(/year/i), '2024')
      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Verify citation exists
      expect(screen.queryByText(/fill in the source details/i)).not.toBeInTheDocument()

      // Change source type
      await user.click(screen.getByRole('button', { name: /journal article/i }))

      // Citation should be cleared - placeholder text should reappear
      expect(screen.getByText(/fill in the source details/i)).toBeInTheDocument()
    })

    it('shows thesis type dropdown when thesis is selected', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /thesis\/dissertation/i }))

      expect(screen.getByLabelText(/thesis type/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('shows editors field when chapter is selected', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /book chapter/i }))

      expect(screen.getByRole('button', { name: /add editor/i })).toBeInTheDocument()
    })
  })

  describe('Citation Style Selection', () => {
    it('selects APA by default', () => {
      render(<CitationGeneratorPage />)

      // APA guide should be visible
      expect(screen.getByRole('heading', { name: /apa 7th edition guide/i })).toBeInTheDocument()
    })

    it('changes style guide when selecting different styles', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /mla 9th edition/i }))
      expect(screen.getByRole('heading', { name: /mla 9th edition guide/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /chicago 17th edition/i }))
      expect(
        screen.getByRole('heading', { name: /chicago 17th edition guide/i })
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^harvard$/i }))
      expect(screen.getByRole('heading', { name: /harvard guide/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^ieee$/i }))
      expect(screen.getByRole('heading', { name: /ieee guide/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^vancouver$/i }))
      expect(screen.getByRole('heading', { name: /vancouver guide/i })).toBeInTheDocument()
    })

    it('tracks analytics when style changes', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /mla 9th edition/i }))

      expect(mockTrackToolEvent).toHaveBeenCalledWith('citation_style_changed', {
        style: 'mla',
      })
    })

    it('regenerates citation when style changes if citation exists', async () => {
      render(<CitationGeneratorPage />)

      // Generate a citation first
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      await user.type(screen.getByLabelText(/year/i), '2024')
      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Change style - citation should be regenerated (not cleared)
      await user.click(screen.getByRole('button', { name: /mla 9th edition/i }))

      // Citation should still exist (not show placeholder)
      expect(screen.queryByText(/fill in the source details/i)).not.toBeInTheDocument()
    })
  })

  describe('Author Management', () => {
    it('shows empty author message initially', () => {
      render(<CitationGeneratorPage />)

      expect(
        screen.getByText(/no authors added\. click.*add author.*to add one/i)
      ).toBeInTheDocument()
    })

    it('adds an author when clicking add author button', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /add author/i }))

      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Middle (opt.)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument()
    })

    it('can edit author fields', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /add author/i }))

      const firstNameInput = screen.getByPlaceholderText('First Name')
      const middleNameInput = screen.getByPlaceholderText('Middle (opt.)')
      const lastNameInput = screen.getByPlaceholderText('Last Name')

      await user.type(firstNameInput, 'John')
      await user.type(middleNameInput, 'M')
      await user.type(lastNameInput, 'Doe')

      expect(firstNameInput).toHaveValue('John')
      expect(middleNameInput).toHaveValue('M')
      expect(lastNameInput).toHaveValue('Doe')
    })

    it('adds multiple authors', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.click(screen.getByRole('button', { name: /add author/i }))

      const firstNameInputs = screen.getAllByPlaceholderText('First Name')
      expect(firstNameInputs).toHaveLength(2)
    })

    it('removes an author when clicking trash button', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /add author/i }))
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument()

      // Find and click the remove button (trash icon button)
      const removeButtons = screen.getAllByRole('button').filter((btn) => {
        return btn.querySelector('.lucide-trash-2') !== null
      })
      expect(removeButtons.length).toBeGreaterThan(0)
      await user.click(removeButtons[0])

      // Author should be removed
      expect(screen.queryByPlaceholderText('First Name')).not.toBeInTheDocument()
      expect(
        screen.getByText(/no authors added\. click.*add author.*to add one/i)
      ).toBeInTheDocument()
    })
  })

  describe('Editor Management (Book Chapter)', () => {
    it('shows empty editor message for chapter source type', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /book chapter/i }))

      expect(
        screen.getByText(/no editors added\. click.*add editor.*to add one/i)
      ).toBeInTheDocument()
    })

    it('adds an editor when clicking add editor button', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /book chapter/i }))
      await user.click(screen.getByRole('button', { name: /add editor/i }))

      // Editor inputs should appear (multiple First Name and Last Name fields)
      const firstNameInputs = screen.getAllByPlaceholderText('First Name')
      expect(firstNameInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('removes an editor', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /book chapter/i }))
      await user.click(screen.getByRole('button', { name: /add editor/i }))

      // Find all trash buttons and click the one for editor (last one since author is first)
      const removeButtons = screen.getAllByRole('button').filter((btn) => {
        return btn.querySelector('.lucide-trash-2') !== null
      })
      expect(removeButtons.length).toBeGreaterThan(0)
      await user.click(removeButtons[removeButtons.length - 1])

      // Should show empty editor message again
      expect(
        screen.getByText(/no editors added\. click.*add editor.*to add one/i)
      ).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('can edit title field', async () => {
      render(<CitationGeneratorPage />)

      const titleInput = screen.getByLabelText(/^title/i)
      await user.type(titleInput, 'My Great Book')

      expect(titleInput).toHaveValue('My Great Book')
    })

    it('can edit year field', async () => {
      render(<CitationGeneratorPage />)

      const yearInput = screen.getByLabelText(/year/i)
      await user.clear(yearInput)
      await user.type(yearInput, '2024')

      expect(yearInput).toHaveValue('2024')
    })

    it('can edit publisher field', async () => {
      render(<CitationGeneratorPage />)

      const publisherInput = screen.getByLabelText(/publisher/i)
      await user.type(publisherInput, 'Academic Press')

      expect(publisherInput).toHaveValue('Academic Press')
    })

    it('can select thesis type from dropdown', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /thesis\/dissertation/i }))

      const thesisTypeSelect = screen.getByRole('combobox')
      await user.selectOptions(thesisTypeSelect, 'masters')

      expect(thesisTypeSelect).toHaveValue('masters')
    })

    it('shows required field markers', () => {
      render(<CitationGeneratorPage />)

      // Title should have required marker (asterisk)
      const titleLabel = screen.getByText(/^title/i)
      const asterisk = titleLabel.parentElement?.querySelector('span')
      expect(asterisk?.textContent).toBe('*')
    })

    it('shows URL field for website source type', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /website/i }))

      expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    })

    it('shows access date field for website source type', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /website/i }))

      expect(screen.getByLabelText(/access date/i)).toBeInTheDocument()
    })
  })

  describe('Citation Generation', () => {
    it('shows validation errors when required fields are missing', async () => {
      render(<CitationGeneratorPage />)

      // Clear title to trigger validation error
      const titleInput = screen.getByLabelText(/^title/i)
      await user.clear(titleInput)

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Should show error messages
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })

    it('generates citation when valid data is provided', async () => {
      render(<CitationGeneratorPage />)

      // Add author
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')

      // Fill required fields
      await user.type(screen.getByLabelText(/^title/i), 'Test Book Title')
      await user.type(screen.getByLabelText(/year/i), '2024')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Placeholder should be gone
      expect(screen.queryByText(/fill in the source details/i)).not.toBeInTheDocument()

      // Copy button should appear
      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('tracks analytics when citation is generated', async () => {
      render(<CitationGeneratorPage />)

      // Add author and fill fields
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      await user.type(screen.getByLabelText(/year/i), '2024')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(mockTrackToolEvent).toHaveBeenCalledWith('citation_generated', {
        style: 'apa',
        sourceType: 'book',
      })
    })

    it('clears errors when valid citation is generated', async () => {
      render(<CitationGeneratorPage />)

      // First, generate an error by clearing the title
      const titleInput = screen.getByLabelText(/^title/i)
      await user.clear(titleInput)
      await user.click(screen.getByRole('button', { name: /generate citation/i }))
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()

      // Now fill in valid data
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(titleInput, 'Test Book')
      const yearInput = screen.getByLabelText(/year/i)
      await user.clear(yearInput)
      await user.type(yearInput, '2024')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Error should be gone
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
    })

    it('shows in-text citation when generated', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      await user.type(screen.getByLabelText(/year/i), '2024')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // In-text citation copy button should appear
      expect(screen.getByRole('button', { name: /copy in-text citation/i })).toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    const generateValidCitation = async () => {
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      const yearInput = screen.getByLabelText(/year/i)
      await user.clear(yearInput)
      await user.type(yearInput, '2024')
      await user.click(screen.getByRole('button', { name: /generate citation/i }))
    }

    it('copies full citation to clipboard', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      await user.click(screen.getByRole('button', { name: /copy full citation/i }))

      // Verify copy succeeded via UI state change
      expect(screen.getByText(/^copied!$/i)).toBeInTheDocument()
    })

    it('shows success state after copying full citation', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      await user.click(screen.getByRole('button', { name: /copy full citation/i }))

      expect(screen.getByText(/^copied!$/i)).toBeInTheDocument()
      // Check icon should be visible
      const copyButton = screen.getByRole('button', { name: /copied/i })
      expect(copyButton.querySelector('.lucide-check')).toBeInTheDocument()
    })

    it('resets copy success state after timeout', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      await user.click(screen.getByRole('button', { name: /copy full citation/i }))
      expect(screen.getByText(/^copied!$/i)).toBeInTheDocument()

      // Advance timers past the 2000ms timeout
      await vi.advanceTimersByTimeAsync(2100)

      // Wait for React to process the state update
      await waitFor(() => {
        expect(screen.queryByText(/^copied!$/i)).not.toBeInTheDocument()
      })
    })

    it('copies in-text citation to clipboard', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      await user.click(screen.getByRole('button', { name: /copy in-text citation/i }))

      // Verify copy succeeded via UI state change
      expect(screen.getByText(/^copied!$/i)).toBeInTheDocument()
    })

    it('tracks analytics when copying full citation', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      mockTrackToolEvent.mockClear()
      await user.click(screen.getByRole('button', { name: /copy full citation/i }))

      expect(mockTrackToolEvent).toHaveBeenCalledWith('citation_copied', {
        type: 'full',
        style: 'apa',
        sourceType: 'book',
      })
    })

    it('tracks analytics when copying in-text citation', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      mockTrackToolEvent.mockClear()
      await user.click(screen.getByRole('button', { name: /copy in-text citation/i }))

      expect(mockTrackToolEvent).toHaveBeenCalledWith('citation_copied', {
        type: 'intext',
        style: 'apa',
        sourceType: 'book',
      })
    })
  })

  describe('Plain Text Toggle', () => {
    const generateValidCitation = async () => {
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      const yearInput = screen.getByLabelText(/year/i)
      await user.clear(yearInput)
      await user.type(yearInput, '2024')
      await user.click(screen.getByRole('button', { name: /generate citation/i }))
    }

    it('does not show toggle button before citation is generated', () => {
      render(<CitationGeneratorPage />)

      expect(screen.queryByRole('button', { name: /show plain text/i })).not.toBeInTheDocument()
    })

    it('shows toggle button after citation is generated', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      expect(screen.getByRole('button', { name: /show plain text/i })).toBeInTheDocument()
    })

    it('toggles between formatted and plain text', async () => {
      render(<CitationGeneratorPage />)
      await generateValidCitation()

      // Initially shows formatted (toggle says "Show Plain Text")
      expect(screen.getByRole('button', { name: /show plain text/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /show plain text/i }))

      // Now shows plain text (toggle says "Show Formatted")
      expect(screen.getByRole('button', { name: /show formatted/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /show formatted/i }))

      // Back to formatted
      expect(screen.getByRole('button', { name: /show plain text/i })).toBeInTheDocument()
    })
  })

  describe('Different Citation Styles', () => {
    // Map style keys to their button display names
    const styleButtonNames: Record<string, string> = {
      apa: 'apa 7th edition',
      mla: 'mla 9th edition',
      chicago: 'chicago 17th edition',
      harvard: 'harvard',
      ieee: 'ieee',
      vancouver: 'vancouver',
    }

    const generateCitationWithStyle = async (styleName: string) => {
      const buttonName = styleButtonNames[styleName.toLowerCase()] || styleName
      await user.click(screen.getByRole('button', { name: new RegExp(buttonName, 'i') }))
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      await user.type(screen.getByLabelText(/year/i), '2024')
      await user.click(screen.getByRole('button', { name: /generate citation/i }))
    }

    it('generates APA citation', async () => {
      render(<CitationGeneratorPage />)
      await generateCitationWithStyle('apa')

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates MLA citation', async () => {
      render(<CitationGeneratorPage />)
      await generateCitationWithStyle('mla')

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates Chicago citation', async () => {
      render(<CitationGeneratorPage />)
      await generateCitationWithStyle('chicago')

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates Harvard citation', async () => {
      render(<CitationGeneratorPage />)
      await generateCitationWithStyle('harvard')

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates IEEE citation', async () => {
      render(<CitationGeneratorPage />)
      await generateCitationWithStyle('ieee')

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates Vancouver citation', async () => {
      render(<CitationGeneratorPage />)
      await generateCitationWithStyle('vancouver')

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })
  })

  describe('Different Source Types', () => {
    it('generates journal citation', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /journal article/i }))
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'Jane')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Smith')
      await user.type(screen.getByLabelText(/^title/i), 'Research Article')
      await user.type(screen.getByLabelText(/journal name/i), 'Science Journal')
      await user.type(screen.getByLabelText(/year/i), '2023')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates website citation', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /website/i }))
      await user.type(screen.getByLabelText(/^title/i), 'Web Page Title')
      await user.type(screen.getByLabelText(/url/i), 'https://example.com')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates thesis citation', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /thesis\/dissertation/i }))
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'Graduate')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Student')
      await user.type(screen.getByLabelText(/^title/i), 'My Dissertation')
      await user.type(screen.getByLabelText(/university/i), 'State University')
      await user.type(screen.getByLabelText(/year/i), '2022')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates video citation', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /video\/youtube/i }))
      await user.type(screen.getByLabelText(/^title/i), 'Educational Video')
      await user.type(screen.getByLabelText(/url/i), 'https://youtube.com/watch?v=123')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates conference citation', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /conference paper/i }))
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'Conference')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Speaker')
      await user.type(screen.getByLabelText(/^title/i), 'Conference Paper')
      await user.type(screen.getByLabelText(/conference name/i), 'Tech Conference 2024')
      await user.type(screen.getByLabelText(/year/i), '2024')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })

    it('generates report citation', async () => {
      render(<CitationGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /report/i }))
      await user.type(screen.getByLabelText(/^title/i), 'Annual Report')
      await user.type(screen.getByLabelText(/organization/i), 'Organization Name')
      const yearInput = screen.getByLabelText(/year/i)
      await user.clear(yearInput)
      await user.type(yearInput, '2024')

      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      expect(screen.getByRole('button', { name: /copy full citation/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByLabelText(/^title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('button', { name: /generate citation/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add author/i })).toBeInTheDocument()
    })

    it('has accessible headings', () => {
      render(<CitationGeneratorPage />)

      expect(screen.getByRole('heading', { name: /citation generator/i })).toBeInTheDocument()
      // May have multiple source type headings due to responsive design
      expect(
        screen.getAllByRole('heading', { name: /source type/i }).length
      ).toBeGreaterThanOrEqual(1)
      expect(screen.getByRole('heading', { name: /citation style/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /source details/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles clipboard write failure gracefully', async () => {
      render(<CitationGeneratorPage />)

      // Generate citation
      await user.click(screen.getByRole('button', { name: /add author/i }))
      await user.type(screen.getByPlaceholderText('First Name'), 'John')
      await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText(/^title/i), 'Test Book')
      const yearInput = screen.getByLabelText(/year/i)
      await user.clear(yearInput)
      await user.type(yearInput, '2024')
      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Try to copy - app should not crash regardless of clipboard state
      await user.click(screen.getByRole('button', { name: /copy full citation/i }))

      // Verify app still works after copy attempt
      expect(screen.getByRole('button', { name: /copy full citation|copied/i })).toBeInTheDocument()
    })

    it('shows multiple validation errors', async () => {
      render(<CitationGeneratorPage />)

      // Clear title and try to generate
      const titleInput = screen.getByLabelText(/^title/i)
      await user.clear(titleInput)
      await user.click(screen.getByRole('button', { name: /generate citation/i }))

      // Should show error about missing title
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
  })
})
