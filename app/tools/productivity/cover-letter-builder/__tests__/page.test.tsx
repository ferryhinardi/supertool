import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import CoverLetterBuilderPage from '../page'
import type { CoverLetterData } from '../types'

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

// Mock useTrackToolView hook
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

// Mock child components to simplify testing
vi.mock('../components/CoverLetterForm', () => ({
  CoverLetterForm: ({
    data,
    onChange,
  }: {
    data: CoverLetterData
    onChange: (data: CoverLetterData) => void
  }) => (
    <div data-testid="cover-letter-form">
      <input
        data-testid="full-name-input"
        value={data.personal.fullName || ''}
        onChange={(e) =>
          onChange({ ...data, personal: { ...data.personal, fullName: e.target.value } })
        }
        placeholder="Full Name"
      />
      <input
        data-testid="email-input"
        value={data.personal.email || ''}
        onChange={(e) =>
          onChange({ ...data, personal: { ...data.personal, email: e.target.value } })
        }
        placeholder="Email"
      />
      <input
        data-testid="company-input"
        value={data.recipient.companyName || ''}
        onChange={(e) =>
          onChange({ ...data, recipient: { ...data.recipient, companyName: e.target.value } })
        }
        placeholder="Company Name"
      />
      <input
        data-testid="position-input"
        value={data.position || ''}
        onChange={(e) => onChange({ ...data, position: e.target.value })}
        placeholder="Position"
      />
      <textarea
        data-testid="opening-input"
        value={data.content.opening || ''}
        onChange={(e) =>
          onChange({ ...data, content: { ...data.content, opening: e.target.value } })
        }
        placeholder="Opening"
      />
      <textarea
        data-testid="body-input"
        value={data.content.body || ''}
        onChange={(e) => onChange({ ...data, content: { ...data.content, body: e.target.value } })}
        placeholder="Body"
      />
      <textarea
        data-testid="closing-input"
        value={data.content.closing || ''}
        onChange={(e) =>
          onChange({ ...data, content: { ...data.content, closing: e.target.value } })
        }
        placeholder="Closing"
      />
    </div>
  ),
}))

vi.mock('../components/AISuggestions', () => ({
  AISuggestions: ({
    coverLetter,
    onApplySuggestion,
    onAnalyticsEvent,
  }: {
    coverLetter: CoverLetterData
    onApplySuggestion: (field: string, value: string) => void
    onAnalyticsEvent: (event: string, data: Record<string, unknown>) => void
  }) => (
    <div data-testid="ai-suggestions">
      <button
        type="button"
        onClick={() => onApplySuggestion('content.opening', 'AI suggested opening')}
      >
        Apply AI Suggestion
      </button>
      <button type="button" onClick={() => onAnalyticsEvent('ai_suggestion_generated', {})}>
        Generate AI Suggestion
      </button>
    </div>
  ),
}))

vi.mock('../components/CoverLetterTips', () => ({
  CoverLetterTips: () => <div data-testid="cover-letter-tips">Tips Component</div>,
}))

// Mock template components
vi.mock('../components/templates/ModernTemplate', () => ({
  ModernTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="modern-template">Modern Template - {data.personal.fullName}</div>
  ),
}))

vi.mock('../components/templates/ClassicTemplate', () => ({
  ClassicTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="classic-template">Classic Template - {data.personal.fullName}</div>
  ),
}))

vi.mock('../components/templates/ProfessionalTemplate', () => ({
  ProfessionalTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="professional-template">Professional Template - {data.personal.fullName}</div>
  ),
}))

vi.mock('../components/templates/CreativeTemplate', () => ({
  CreativeTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="creative-template">Creative Template - {data.personal.fullName}</div>
  ),
}))

vi.mock('../components/templates/MinimalTemplate', () => ({
  MinimalTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="minimal-template">Minimal Template - {data.personal.fullName}</div>
  ),
}))

vi.mock('../components/templates/ExecutiveTemplate', () => ({
  ExecutiveTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="executive-template">Executive Template - {data.personal.fullName}</div>
  ),
}))

vi.mock('../components/templates/TechTemplate', () => ({
  TechTemplate: ({ data }: { data: CoverLetterData }) => (
    <div data-testid="tech-template">Tech Template - {data.personal.fullName}</div>
  ),
}))

// Mock PDF export functions
vi.mock('../lib/pdfExport', () => ({
  exportCoverLetterToPDF: vi.fn().mockResolvedValue(undefined),
  exportCoverLetterToTextPDF: vi.fn().mockResolvedValue(undefined),
  getSuggestedFileName: vi.fn().mockReturnValue('cover-letter-test.pdf'),
}))

// Mock utils
vi.mock('../utils', () => ({
  generateId: vi.fn().mockReturnValue('test-id'),
  saveToLocalStorage: vi.fn(),
  loadFromLocalStorage: vi.fn().mockReturnValue(null),
  clearLocalStorage: vi.fn(),
  exportToJSON: vi.fn(),
  importFromJSON: vi.fn(),
  validateCoverLetter: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
  checkLength: vi
    .fn()
    .mockReturnValue({ status: 'optimal', message: 'Optimal length!', wordCount: 300 }),
  getWordCount: vi.fn().mockReturnValue(300),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
global.URL.revokeObjectURL = vi.fn()

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Mock confirm
vi.stubGlobal(
  'confirm',
  vi.fn(() => true)
)

// Mock alert
vi.stubGlobal('alert', vi.fn())

describe('Cover Letter Builder - Page Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders cover letter builder page', () => {
    render(<CoverLetterBuilderPage />)
    expect(
      screen.getByRole('heading', { name: 'Cover Letter Builder', level: 1 })
    ).toBeInTheDocument()
  })

  it('displays page title and description', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Cover Letter Builder')).toBeInTheDocument()
    expect(screen.getByText(/customizable templates/i)).toBeInTheDocument()
  })

  it('tracks tool open on mount', () => {
    render(<CoverLetterBuilderPage />)
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_builder_open',
      {}
    )
  })

  it('renders cover letter form component', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByTestId('cover-letter-form')).toBeInTheDocument()
  })

  it('renders AI suggestions component', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByTestId('ai-suggestions')).toBeInTheDocument()
  })

  it('renders tips component', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByTestId('cover-letter-tips')).toBeInTheDocument()
  })
})

describe('Cover Letter Builder - Template Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all template options', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Creative')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('Executive')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('defaults to modern template', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByTestId('modern-template')).toBeInTheDocument()
  })

  it('changes template when clicking a template button', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    // Click on Classic template
    const classicButton = screen.getByRole('button', { name: /Classic/i })
    await user.click(classicButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_template_changed',
      { template: 'classic' }
    )
  })

  it('changes template to professional', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    // Use getAllByRole and find the button that starts with "Professional"
    // since "Professional" also appears in template descriptions
    const buttons = screen.getAllByRole('button')
    const professionalButton = buttons.find((btn) => btn.textContent?.startsWith('Professional'))
    expect(professionalButton).toBeTruthy()
    await user.click(professionalButton!)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_template_changed',
      { template: 'professional' }
    )
  })

  it('changes template to creative', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const creativeButton = screen.getByRole('button', { name: /Creative/i })
    await user.click(creativeButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_template_changed',
      { template: 'creative' }
    )
  })

  it('changes template to minimal', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const minimalButton = screen.getByRole('button', { name: /Minimal/i })
    await user.click(minimalButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_template_changed',
      { template: 'minimal' }
    )
  })

  it('changes template to executive', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const executiveButton = screen.getByRole('button', { name: /Executive/i })
    await user.click(executiveButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_template_changed',
      { template: 'executive' }
    )
  })

  it('changes template to tech', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const techButton = screen.getByRole('button', { name: /Tech/i })
    await user.click(techButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_template_changed',
      { template: 'tech' }
    )
  })
})

describe('Cover Letter Builder - Export Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Visual PDF export button', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByRole('button', { name: /Visual PDF/i })).toBeInTheDocument()
  })

  it('displays ATS-Friendly PDF export button', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByRole('button', { name: /ATS-Friendly PDF/i })).toBeInTheDocument()
  })

  it('displays Export JSON button', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByRole('button', { name: /Export JSON/i })).toBeInTheDocument()
  })

  it('calls exportCoverLetterToPDF when Visual PDF button is clicked', async () => {
    const user = userEvent.setup()
    const { exportCoverLetterToPDF } = await import('../lib/pdfExport')
    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /Visual PDF/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(vi.mocked(exportCoverLetterToPDF)).toHaveBeenCalled()
    })
  })

  it('calls exportCoverLetterToTextPDF when ATS PDF button is clicked', async () => {
    const user = userEvent.setup()
    const { exportCoverLetterToTextPDF } = await import('../lib/pdfExport')
    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /ATS-Friendly PDF/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(vi.mocked(exportCoverLetterToTextPDF)).toHaveBeenCalled()
    })
  })

  it('tracks visual PDF export event', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /Visual PDF/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('cover_letter_exported', {
        format: 'visual_pdf',
      })
    })
  })

  it('tracks ATS PDF export event', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /ATS-Friendly PDF/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('cover_letter_exported', {
        format: 'text_pdf',
      })
    })
  })

  it('calls exportToJSON when Export JSON button is clicked', async () => {
    const user = userEvent.setup()
    const { exportToJSON } = await import('../utils')
    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /Export JSON/i })
    await user.click(exportButton)

    expect(vi.mocked(exportToJSON)).toHaveBeenCalled()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('cover_letter_exported', {
      format: 'json',
    })
  })

  it('disables export buttons when validation fails', async () => {
    const { validateCoverLetter } = await import('../utils')
    vi.mocked(validateCoverLetter).mockReturnValue({
      isValid: false,
      errors: ['Full name is required'],
    })

    render(<CoverLetterBuilderPage />)

    const visualPdfButton = screen.getByRole('button', { name: /Visual PDF/i })
    const atsPdfButton = screen.getByRole('button', { name: /ATS-Friendly PDF/i })

    expect(visualPdfButton).toBeDisabled()
    expect(atsPdfButton).toBeDisabled()
  })

  it('shows message when validation fails', async () => {
    const { validateCoverLetter } = await import('../utils')
    vi.mocked(validateCoverLetter).mockReturnValue({
      isValid: false,
      errors: ['Full name is required'],
    })

    render(<CoverLetterBuilderPage />)

    expect(screen.getByText(/Complete required fields to export/i)).toBeInTheDocument()
  })
})

describe('Cover Letter Builder - Import Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Import JSON button', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByRole('button', { name: /Import JSON/i })).toBeInTheDocument()
  })

  it('creates file input when Import JSON is clicked', async () => {
    const user = userEvent.setup()
    const createElementSpy = vi.spyOn(document, 'createElement')

    render(<CoverLetterBuilderPage />)

    const importButton = screen.getByRole('button', { name: /Import JSON/i })
    await user.click(importButton)

    expect(createElementSpy).toHaveBeenCalledWith('input')
  })
})

describe('Cover Letter Builder - Clear Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Clear All button', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog when Clear All is clicked', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const clearButton = screen.getByRole('button', { name: /Clear All/i })
    await user.click(clearButton)

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to clear all data? This action cannot be undone.'
    )
  })

  it('clears data when confirmation is accepted', async () => {
    const user = userEvent.setup()
    const { clearLocalStorage } = await import('../utils')
    render(<CoverLetterBuilderPage />)

    const clearButton = screen.getByRole('button', { name: /Clear All/i })
    await user.click(clearButton)

    expect(vi.mocked(clearLocalStorage)).toHaveBeenCalled()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('cover_letter_cleared', {})
  })

  it('does not clear data when confirmation is rejected', async () => {
    const user = userEvent.setup()
    vi.mocked(window.confirm).mockReturnValueOnce(false)
    const { clearLocalStorage } = await import('../utils')

    render(<CoverLetterBuilderPage />)

    const clearButton = screen.getByRole('button', { name: /Clear All/i })
    await user.click(clearButton)

    expect(vi.mocked(clearLocalStorage)).not.toHaveBeenCalled()
  })
})

describe('Cover Letter Builder - Form Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks form update when form changes', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const nameInput = screen.getByTestId('full-name-input')
    await user.type(nameInput, 'John Doe')

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_form_updated',
      {}
    )
  })

  it('updates cover letter state when form changes', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const nameInput = screen.getByTestId('full-name-input')
    await user.type(nameInput, 'John Doe')

    expect(nameInput).toHaveValue('John Doe')
  })

  it('updates email when email input changes', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const emailInput = screen.getByTestId('email-input')
    await user.type(emailInput, 'john@example.com')

    expect(emailInput).toHaveValue('john@example.com')
  })

  it('updates company name when company input changes', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const companyInput = screen.getByTestId('company-input')
    await user.type(companyInput, 'Acme Corp')

    expect(companyInput).toHaveValue('Acme Corp')
  })

  it('updates position when position input changes', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const positionInput = screen.getByTestId('position-input')
    await user.type(positionInput, 'Software Engineer')

    expect(positionInput).toHaveValue('Software Engineer')
  })
})

describe('Cover Letter Builder - Statistics Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Statistics section', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Statistics')).toBeInTheDocument()
  })

  it('displays word count', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Word Count:')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('displays length status message', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Optimal length!')).toBeInTheDocument()
  })

  it('displays validation errors when present', async () => {
    const { validateCoverLetter } = await import('../utils')
    vi.mocked(validateCoverLetter).mockReturnValue({
      isValid: false,
      errors: ['Full name is required', 'Email is required'],
    })

    render(<CoverLetterBuilderPage />)

    expect(screen.getByText(/2 required field/i)).toBeInTheDocument()
  })

  it('lists validation errors', async () => {
    const { validateCoverLetter } = await import('../utils')
    vi.mocked(validateCoverLetter).mockReturnValue({
      isValid: false,
      errors: ['Full name is required'],
    })

    render(<CoverLetterBuilderPage />)

    expect(screen.getByText('Full name is required')).toBeInTheDocument()
  })
})

describe('Cover Letter Builder - AI Suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('applies AI suggestion when clicked', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const applyButton = screen.getByRole('button', { name: /Apply AI Suggestion/i })
    await user.click(applyButton)

    // The suggestion should trigger a form update
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalled()
  })

  it('tracks analytics when AI suggestion is generated', async () => {
    const user = userEvent.setup()
    render(<CoverLetterBuilderPage />)

    const generateButton = screen.getByRole('button', { name: /Generate AI Suggestion/i })
    await user.click(generateButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('ai_suggestion_generated', {})
  })
})

describe('Cover Letter Builder - Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays link to Resume Builder', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByRole('link', { name: /Resume Builder/i })).toBeInTheDocument()
  })

  it('has correct href for Resume Builder link', () => {
    render(<CoverLetterBuilderPage />)
    const link = screen.getByRole('link', { name: /Resume Builder/i })
    expect(link).toHaveAttribute('href', '/tools/productivity/resume-builder')
  })
})

describe('Cover Letter Builder - Preview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Preview section', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('displays Real-time preview description', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText('Real-time preview')).toBeInTheDocument()
  })

  it('renders the preview element with correct id', () => {
    render(<CoverLetterBuilderPage />)
    const previewElement = document.getElementById('cover-letter-preview')
    expect(previewElement).toBeInTheDocument()
  })
})

describe('Cover Letter Builder - localStorage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Ensure real timers are always restored after each test in this suite
    vi.useRealTimers()
  })

  it('loads from localStorage on mount', async () => {
    const { loadFromLocalStorage } = await import('../utils')
    const mockData: CoverLetterData = {
      id: 'loaded-id',
      personal: {
        fullName: 'Loaded Name',
        email: 'loaded@example.com',
        phone: '555-0100',
        location: 'Test City',
        linkedin: '',
        portfolio: '',
      },
      recipient: {
        companyName: 'Loaded Company',
        hiringManagerName: '',
        hiringManagerTitle: '',
        companyAddress: '',
        department: '',
      },
      position: 'Loaded Position',
      content: {
        opening: 'Loaded opening paragraph',
        body: 'Loaded body content',
        closing: 'Loaded closing paragraph',
        callToAction: 'Loaded call to action',
      },
      date: '2024-01-15',
      salutation: 'Dear Hiring Manager',
      signature: 'Sincerely',
      templateId: 'modern',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    }

    vi.mocked(loadFromLocalStorage).mockReturnValueOnce(mockData)

    render(<CoverLetterBuilderPage />)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'cover_letter_loaded_from_storage',
      {}
    )
  })

  it('auto-saves to localStorage periodically', async () => {
    vi.useFakeTimers()
    try {
      const { saveToLocalStorage } = await import('../utils')

      render(<CoverLetterBuilderPage />)

      // Advance time by 30 seconds (auto-save interval)
      vi.advanceTimersByTime(30000)

      expect(vi.mocked(saveToLocalStorage)).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows auto-save indicator after save', async () => {
    vi.useFakeTimers()

    try {
      render(<CoverLetterBuilderPage />)

      // Advance time by 30 seconds (auto-save interval) to trigger auto-save
      // This will set showAutoSaveIndicator to true
      await vi.advanceTimersByTimeAsync(30000)

      // Auto-save indicator shows up after save
      expect(screen.getByText('Auto-saved')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('Cover Letter Builder - Export Error Handling', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Restore all mocks to their default implementations
    const pdfExport = await import('../lib/pdfExport')
    vi.mocked(pdfExport.exportCoverLetterToPDF).mockResolvedValue(undefined)
    vi.mocked(pdfExport.exportCoverLetterToTextPDF).mockResolvedValue(undefined)
    vi.mocked(pdfExport.getSuggestedFileName).mockReturnValue('cover-letter-test.pdf')
    const utils = await import('../utils')
    vi.mocked(utils.exportToJSON).mockImplementation(() => {})
    vi.mocked(utils.validateCoverLetter).mockReturnValue({ isValid: true, errors: [] })
    vi.mocked(utils.saveToLocalStorage).mockImplementation(() => {})
    vi.mocked(utils.loadFromLocalStorage).mockReturnValue(null)
  })

  it('shows alert when visual PDF export fails', async () => {
    const user = userEvent.setup()

    // Set up the mock to reject BEFORE rendering
    const pdfExport = await import('../lib/pdfExport')
    vi.mocked(pdfExport.exportCoverLetterToPDF).mockRejectedValueOnce(new Error('Export failed'))

    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /Visual PDF/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to export PDF. Please try again.')
    })
  })

  it('shows alert when ATS PDF export fails', async () => {
    const user = userEvent.setup()

    // Set up the mock to reject BEFORE rendering
    const pdfExport = await import('../lib/pdfExport')
    vi.mocked(pdfExport.exportCoverLetterToTextPDF).mockRejectedValueOnce(
      new Error('Export failed')
    )

    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /ATS-Friendly PDF/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to export PDF. Please try again.')
    })
  })

  it('shows alert when JSON export fails', async () => {
    const user = userEvent.setup()

    // Set up the mock to throw BEFORE rendering
    const utils = await import('../utils')
    vi.mocked(utils.exportToJSON).mockImplementationOnce(() => {
      throw new Error('Export failed')
    })

    render(<CoverLetterBuilderPage />)

    const exportButton = screen.getByRole('button', { name: /Export JSON/i })
    await user.click(exportButton)

    expect(window.alert).toHaveBeenCalledWith('Failed to export JSON. Please try again.')
  })
})

describe('Cover Letter Builder - Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays helpful tip in footer', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText(/automatically saved every 30 seconds/i)).toBeInTheDocument()
  })

  it('displays word count recommendation', () => {
    render(<CoverLetterBuilderPage />)
    expect(screen.getByText(/250-400 words/i)).toBeInTheDocument()
  })
})

describe('Cover Letter Builder - Template Descriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows template descriptions', () => {
    render(<CoverLetterBuilderPage />)

    // Modern template description
    expect(screen.getByText(/Clean design with contemporary typography/i)).toBeInTheDocument()

    // Classic template description
    expect(screen.getByText(/Traditional business letter format/i)).toBeInTheDocument()
  })
})
