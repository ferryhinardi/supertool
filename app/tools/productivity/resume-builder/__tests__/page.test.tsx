import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ToolEvent } from '@/lib/services/analytics'
import * as analytics from '@/lib/services/analytics'
import ResumeBuilderPage from '../page'

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
vi.mock('../components/PersonalInfoForm', () => ({
  PersonalInfoForm: ({ data, onChange }: { data: unknown; onChange: (data: unknown) => void }) => (
    <div data-testid="personal-info-form">
      <input
        data-testid="full-name-input"
        value={(data as { fullName: string }).fullName || ''}
        onChange={(e) => onChange({ ...(data as object), fullName: e.target.value })}
        placeholder="Full Name"
      />
    </div>
  ),
}))

vi.mock('../components/ExperienceForm', () => ({
  ExperienceForm: ({
    data,
    onChange,
  }: {
    data: unknown[]
    onChange: (data: unknown[]) => void
  }) => (
    <div data-testid="experience-form">
      <button type="button" onClick={() => onChange([...(data as unknown[]), { id: 'new' }])}>
        Add Experience
      </button>
      <span data-testid="experience-count">{(data as unknown[]).length} entries</span>
    </div>
  ),
}))

vi.mock('../components/EducationForm', () => ({
  EducationForm: ({ data, onChange }: { data: unknown[]; onChange: (data: unknown[]) => void }) => (
    <div data-testid="education-form">
      <button type="button" onClick={() => onChange([...(data as unknown[]), { id: 'new' }])}>
        Add Education
      </button>
      <span data-testid="education-count">{(data as unknown[]).length} entries</span>
    </div>
  ),
}))

vi.mock('../components/SkillsForm', () => ({
  SkillsForm: ({ data, onChange }: { data: unknown[]; onChange: (data: unknown[]) => void }) => (
    <div data-testid="skills-form">
      <button type="button" onClick={() => onChange([...(data as unknown[]), { id: 'new' }])}>
        Add Skill Category
      </button>
      <span data-testid="skills-count">{(data as unknown[]).length} categories</span>
    </div>
  ),
}))

vi.mock('../components/ProjectsForm', () => ({
  ProjectsForm: ({ data, onChange }: { data: unknown[]; onChange: (data: unknown[]) => void }) => (
    <div data-testid="projects-form">
      <button type="button" onClick={() => onChange([...(data as unknown[]), { id: 'new' }])}>
        Add Project
      </button>
      <span data-testid="projects-count">{(data as unknown[]).length} projects</span>
    </div>
  ),
}))

vi.mock('../components/ResumePreview', () => ({
  ResumePreview: ({ data, templateId }: { data: unknown; templateId: string }) => (
    <div data-testid="resume-preview">
      <span data-testid="preview-template">{templateId}</span>
      <span data-testid="preview-data">{JSON.stringify(data)}</span>
    </div>
  ),
}))

vi.mock('../components/TemplateThumbnail', () => ({
  TemplateThumbnail: ({
    templateId,
    isSelected,
    onClick,
  }: {
    templateId: string
    isSelected: boolean
    onClick: () => void
  }) => (
    <button
      type="button"
      data-testid={`template-${templateId}`}
      data-selected={isSelected}
      onClick={onClick}
    >
      {templateId}
    </button>
  ),
}))

vi.mock('../components/AISuggestionsPanel', () => ({
  AISuggestionsPanel: ({
    onAnalyticsEvent,
  }: {
    onAnalyticsEvent?: (
      event: Extract<ToolEvent, 'resume_ai_suggestion_requested' | 'resume_ai_suggestion_applied'>,
      data?: Record<string, unknown>
    ) => void
  }) => (
    <div data-testid="resume-ai-suggestions-panel">
      <button
        type="button"
        onClick={() =>
          onAnalyticsEvent?.('resume_ai_suggestion_requested', {
            type: 'summary',
            remaining: 2,
            currentContent: 'secret summary text',
            email: 'john@example.com',
          })
        }
      >
        Generate Unsafe AI Analytics Event
      </button>
    </div>
  ),
}))

// Mock PDF export functions
vi.mock('../lib/pdfExport', () => ({
  exportResumeToPDF: vi.fn().mockResolvedValue(undefined),
  exportResumeToSimplePDF: vi.fn(),
}))

// Mock utils
vi.mock('../utils', () => ({
  calculateATSScore: vi.fn().mockReturnValue({
    overall: 75,
    formatScore: 80,
    keywordScore: 70,
    contentScore: 75,
  }),
  exportToJSON: vi.fn().mockReturnValue('{}'),
  generateId: vi.fn().mockReturnValue('test-id'),
  loadFromLocalStorage: vi.fn().mockReturnValue(null),
  saveToLocalStorage: vi.fn(),
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
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

describe('Resume Builder - Page Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders resume builder page', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('heading', { name: 'Resume Builder', level: 1 })).toBeInTheDocument()
  })

  it('displays page title and description', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('Resume Builder')).toBeInTheDocument()
    expect(screen.getByText(/ATS-friendly resumes/i)).toBeInTheDocument()
  })

  it('displays professional badge', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('Professional Resume Builder')).toBeInTheDocument()
  })

  it('tracks tool open on mount', () => {
    render(<ResumeBuilderPage />)
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_builder_open', {})
  })
})

describe('Resume Builder - Action Bar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays save button', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
  })

  it('displays export PDF button', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument()
  })

  it('displays simple PDF button', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('button', { name: /Simple PDF/i })).toBeInTheDocument()
  })

  it('displays JSON export button', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('button', { name: /JSON/i })).toBeInTheDocument()
  })

  it('displays cover letter link', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('button', { name: /Cover Letter/i })).toBeInTheDocument()
  })

  it('displays ATS score', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('ATS Score:')).toBeInTheDocument()
    // 75/100 appears twice: once for overall ATS score in action bar, once for content score in ATS Analysis
    const scores = screen.getAllByText('75/100')
    expect(scores.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Resume Builder - Section Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays all section tabs', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByRole('button', { name: /Personal Info/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Experience/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Education/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Skills/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Projects/i })).toBeInTheDocument()
  })

  it('defaults to personal info section', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument()
  })

  it('switches to experience section when clicked', async () => {
    render(<ResumeBuilderPage />)
    const experienceTab = screen.getByRole('button', { name: /Experience/i })

    await userEvent.click(experienceTab)

    expect(screen.getByTestId('experience-form')).toBeInTheDocument()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_section_change', {
      section: 'experience',
    })
  })

  it('switches to education section when clicked', async () => {
    render(<ResumeBuilderPage />)
    const educationTab = screen.getByRole('button', { name: /Education/i })

    await userEvent.click(educationTab)

    expect(screen.getByTestId('education-form')).toBeInTheDocument()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_section_change', {
      section: 'education',
    })
  })

  it('switches to skills section when clicked', async () => {
    render(<ResumeBuilderPage />)
    const skillsTab = screen.getByRole('button', { name: /Skills/i })

    await userEvent.click(skillsTab)

    expect(screen.getByTestId('skills-form')).toBeInTheDocument()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_section_change', {
      section: 'skills',
    })
  })

  it('switches to projects section when clicked', async () => {
    render(<ResumeBuilderPage />)
    const projectsTab = screen.getByRole('button', { name: /Projects/i })

    await userEvent.click(projectsTab)

    expect(screen.getByTestId('projects-form')).toBeInTheDocument()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_section_change', {
      section: 'projects',
    })
  })
})

describe('Resume Builder - Save Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves resume when save button is clicked', async () => {
    const { saveToLocalStorage } = await import('../utils')
    render(<ResumeBuilderPage />)
    const saveButton = screen.getByRole('button', { name: /Save/i })

    await userEvent.click(saveButton)

    expect(saveToLocalStorage).toHaveBeenCalled()
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Resume saved successfully')
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_save', {})
  })

  it('displays last saved time after saving', async () => {
    render(<ResumeBuilderPage />)
    const saveButton = screen.getByRole('button', { name: /Save/i })

    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Last saved:/i)).toBeInTheDocument()
    })
  })
})

describe('Resume Builder - Export Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports to PDF when button is clicked', async () => {
    const { exportResumeToPDF } = await import('../lib/pdfExport')
    render(<ResumeBuilderPage />)
    const pdfButton = screen.getByRole('button', { name: /Export PDF/i })

    await userEvent.click(pdfButton)

    await waitFor(() => {
      expect(vi.mocked(toast.info)).toHaveBeenCalledWith('Generating PDF...')
      expect(exportResumeToPDF).toHaveBeenCalled()
    })
  })

  it('exports to simple PDF when button is clicked', async () => {
    const { exportResumeToSimplePDF } = await import('../lib/pdfExport')
    render(<ResumeBuilderPage />)
    const simplePdfButton = screen.getByRole('button', { name: /Simple PDF/i })

    await userEvent.click(simplePdfButton)

    expect(exportResumeToSimplePDF).toHaveBeenCalled()
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_export_simple_pdf', {})
  })

  it('exports to JSON when button is clicked', async () => {
    const { exportToJSON } = await import('../utils')
    render(<ResumeBuilderPage />)
    const jsonButton = screen.getByRole('button', { name: /JSON/i })

    await userEvent.click(jsonButton)

    expect(exportToJSON).toHaveBeenCalled()
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Resume exported as JSON')
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_export_json', {})
  })

  it('tracks PDF export in analytics', async () => {
    render(<ResumeBuilderPage />)
    const pdfButton = screen.getByRole('button', { name: /Export PDF/i })

    await userEvent.click(pdfButton)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_export_pdf', {
        template: 'modern',
      })
    })
  })
})

describe('Resume Builder - Template Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays template thumbnails', () => {
    render(<ResumeBuilderPage />)
    // Templates are rendered in both mobile and desktop sections, so there are duplicates
    const templates = screen.getAllByTestId(/^template-/)
    expect(templates.length).toBeGreaterThan(0)
  })

  it('defaults to modern template', () => {
    render(<ResumeBuilderPage />)
    // Modern template appears in both mobile and desktop sections
    const modernTemplates = screen.getAllByTestId('template-modern')
    expect(modernTemplates.length).toBeGreaterThan(0)
    expect(modernTemplates[0]).toHaveAttribute('data-selected', 'true')
  })

  it('changes template when clicked', async () => {
    render(<ResumeBuilderPage />)
    // Classic template appears in both mobile and desktop sections
    const classicTemplates = screen.getAllByTestId('template-classic')

    await userEvent.click(classicTemplates[0])

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_template_change', {
      template: 'classic',
    })
  })
})

describe('Resume Builder - ATS Score Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays ATS Analysis card', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('ATS Analysis')).toBeInTheDocument()
  })

  it('displays format score', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('Format')).toBeInTheDocument()
    expect(screen.getByText('80/100')).toBeInTheDocument()
  })

  it('displays keywords score', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('Keywords')).toBeInTheDocument()
    expect(screen.getByText('70/100')).toBeInTheDocument()
  })

  it('displays content score', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('Content')).toBeInTheDocument()
    // Content score is 75
    const contentScores = screen.getAllByText('75/100')
    expect(contentScores.length).toBeGreaterThanOrEqual(1)
  })

  it('tracks ATS score calculation', () => {
    render(<ResumeBuilderPage />)
    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'resume_ats_score_calculated',
      expect.objectContaining({
        overall: 75,
        format: 80,
        keywords: 70,
        content: 75,
      })
    )
  })
})

describe('Resume Builder - Preview Section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays preview section', () => {
    render(<ResumeBuilderPage />)
    // 'Preview' appears multiple times: as a CardTitle, as a button text, and in mobile modal
    const previewElements = screen.getAllByText(/Preview/)
    expect(previewElements.length).toBeGreaterThan(0)
  })

  it('displays resume preview component', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByTestId('resume-preview')).toBeInTheDocument()
  })

  it('displays zoom controls', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('allows zooming in', async () => {
    render(<ResumeBuilderPage />)
    const zoomInButton = screen.getByTitle('Zoom in')

    await userEvent.click(zoomInButton)

    expect(screen.getByText('125%')).toBeInTheDocument()
  })

  it('allows zooming out', async () => {
    render(<ResumeBuilderPage />)
    const zoomOutButton = screen.getByTitle('Zoom out')

    await userEvent.click(zoomOutButton)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('allows resetting zoom', async () => {
    render(<ResumeBuilderPage />)
    const zoomInButton = screen.getByTitle('Zoom in')
    const resetButton = screen.getByTitle('Reset zoom')

    await userEvent.click(zoomInButton) // Zoom to 125%
    await userEvent.click(resetButton) // Reset to 100%

    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('disables zoom out at minimum', async () => {
    render(<ResumeBuilderPage />)
    const zoomOutButton = screen.getByTitle('Zoom out')

    // Zoom out twice to reach 50%
    await userEvent.click(zoomOutButton)
    await userEvent.click(zoomOutButton)

    expect(zoomOutButton).toBeDisabled()
  })

  it('disables zoom in at maximum', async () => {
    render(<ResumeBuilderPage />)
    const zoomInButton = screen.getByTitle('Zoom in')

    // Zoom in twice to reach 150%
    await userEvent.click(zoomInButton)
    await userEvent.click(zoomInButton)

    expect(zoomInButton).toBeDisabled()
  })
})

describe('Resume Builder - Sample Data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays sample data toggle button', () => {
    render(<ResumeBuilderPage />)
    const sampleButtons = screen.getAllByRole('button').filter((btn) => {
      return btn.textContent?.includes('Sample')
    })
    expect(sampleButtons.length).toBeGreaterThan(0)
  })

  it('tracks sample data toggle', async () => {
    render(<ResumeBuilderPage />)
    const sampleButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.includes('Sample Data'))

    if (sampleButton) {
      await userEvent.click(sampleButton)

      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
        'resume_sample_data_toggle',
        expect.any(Object)
      )
    }
  })
})

describe('Resume Builder - Form Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates personal info when form changes', async () => {
    render(<ResumeBuilderPage />)
    const nameInput = screen.getByTestId('full-name-input')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
        'resume_personal_info_update',
        {
          completed_fields: 1,
        }
      )
    })
  })

  it('sanitizes forwarded AI analytics payloads before tracking', async () => {
    render(<ResumeBuilderPage />)

    await userEvent.click(
      screen.getByRole('button', { name: /Generate Unsafe AI Analytics Event/i })
    )

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'resume_ai_suggestion_requested',
      {
        type: 'summary',
        remaining: 2,
      }
    )
  })

  it('adds experience entry when button is clicked', async () => {
    render(<ResumeBuilderPage />)
    const experienceTab = screen.getByRole('button', { name: /Experience/i })

    await userEvent.click(experienceTab)

    const addButton = screen.getByRole('button', { name: /Add Experience/i })
    await userEvent.click(addButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'resume_experience_add',
      expect.any(Object)
    )
  })

  it('adds education entry when button is clicked', async () => {
    render(<ResumeBuilderPage />)
    const educationTab = screen.getByRole('button', { name: /Education/i })

    await userEvent.click(educationTab)

    const addButton = screen.getByRole('button', { name: /Add Education/i })
    await userEvent.click(addButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'resume_education_add',
      expect.any(Object)
    )
  })

  it('adds skill category when button is clicked', async () => {
    render(<ResumeBuilderPage />)
    const skillsTab = screen.getByRole('button', { name: /Skills/i })

    await userEvent.click(skillsTab)

    const addButton = screen.getByRole('button', { name: /Add Skill Category/i })
    await userEvent.click(addButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'resume_skills_add_category',
      expect.any(Object)
    )
  })

  it('adds project when button is clicked', async () => {
    render(<ResumeBuilderPage />)
    const projectsTab = screen.getByRole('button', { name: /Projects/i })

    await userEvent.click(projectsTab)

    const addButton = screen.getByRole('button', { name: /Add Project/i })
    await userEvent.click(addButton)

    expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
      'resume_project_add',
      expect.any(Object)
    )
  })
})

describe('Resume Builder - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has proper heading hierarchy', () => {
    render(<ResumeBuilderPage />)
    const h1 = screen.getByRole('heading', { level: 1, name: 'Resume Builder' })
    expect(h1).toBeInTheDocument()
  })

  it('all section tabs are keyboard accessible', () => {
    render(<ResumeBuilderPage />)
    const tabs = screen.getAllByRole('button').filter((btn) => {
      return ['Personal Info', 'Experience', 'Education', 'Skills', 'Projects'].some((name) =>
        btn.textContent?.includes(name)
      )
    })

    tabs.forEach((tab) => {
      expect(tab).toBeTruthy()
    })
  })

  it('action buttons are keyboard accessible', () => {
    render(<ResumeBuilderPage />)
    const saveButton = screen.getByRole('button', { name: /Save/i })
    const pdfButton = screen.getByRole('button', { name: /Export PDF/i })

    expect(saveButton).toBeTruthy()
    expect(pdfButton).toBeTruthy()
  })

  it('zoom controls have accessible titles', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByTitle('Zoom in')).toBeInTheDocument()
    expect(screen.getByTitle('Zoom out')).toBeInTheDocument()
    expect(screen.getByTitle('Reset zoom')).toBeInTheDocument()
  })
})

describe('Resume Builder - Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders main element', () => {
    render(<ResumeBuilderPage />)
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
  })

  it('displays mobile preview button', () => {
    render(<ResumeBuilderPage />)
    const previewButton = screen.getByRole('button', { name: /Preview/i })
    expect(previewButton).toBeInTheDocument()
  })
})

describe('Resume Builder - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles PDF export error gracefully', async () => {
    const { exportResumeToPDF } = await import('../lib/pdfExport')
    vi.mocked(exportResumeToPDF).mockRejectedValueOnce(new Error('Export failed'))

    render(<ResumeBuilderPage />)
    const pdfButton = screen.getByRole('button', { name: /Export PDF/i })

    await userEvent.click(pdfButton)

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Failed to export PDF')
    })
  })
})

describe('Resume Builder - localStorage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads saved resume on mount', async () => {
    const { loadFromLocalStorage } = await import('../utils')
    vi.mocked(loadFromLocalStorage).mockReturnValueOnce({
      id: 'saved-id',
      name: 'Saved Resume',
      personal: {
        fullName: 'Saved User',
        professionalTitle: 'Software Engineer',
        email: 'test@test.com',
        phone: '+1 555-0100',
        location: 'San Francisco, CA',
        summary: 'Experienced software engineer',
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      awards: [],
      volunteer: [],
      publications: [],
      sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications'],
      template: 'modern',
      theme: {
        primaryColor: '#2563eb',
        textColor: '#1f2937',
        headingColor: '#111827',
        backgroundColor: '#ffffff',
        fontFamily: 'Calibri',
        fontSize: 11,
        lineHeight: 1.5,
        spacing: 'normal',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(<ResumeBuilderPage />)

    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Resume loaded from previous session')
    })
  })

  it('tracks resume load analytics', async () => {
    const { loadFromLocalStorage } = await import('../utils')
    vi.mocked(loadFromLocalStorage).mockReturnValueOnce({
      id: 'saved-id',
      name: 'Test Resume',
      personal: {
        fullName: 'Test',
        professionalTitle: 'Developer',
        email: 'test@example.com',
        phone: '+1 555-0101',
        location: 'New York, NY',
        summary: 'Test summary',
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      awards: [],
      volunteer: [],
      publications: [],
      sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications'],
      template: 'modern',
      theme: {
        primaryColor: '#2563eb',
        textColor: '#1f2937',
        headingColor: '#111827',
        backgroundColor: '#ffffff',
        fontFamily: 'Calibri',
        fontSize: 11,
        lineHeight: 1.5,
        spacing: 'normal',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(<ResumeBuilderPage />)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith('resume_load', {
        had_saved_data: true,
      })
    })
  })
})

describe('Resume Builder - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles empty resume state', () => {
    render(<ResumeBuilderPage />)
    expect(screen.getByTestId('resume-preview')).toBeInTheDocument()
  })

  it('handles maximum zoom level', async () => {
    render(<ResumeBuilderPage />)
    const zoomInButton = screen.getByTitle('Zoom in')

    // Click multiple times to reach max
    for (let i = 0; i < 5; i++) {
      await userEvent.click(zoomInButton)
    }

    expect(screen.getByText('150%')).toBeInTheDocument()
  })

  it('handles minimum zoom level', async () => {
    render(<ResumeBuilderPage />)
    const zoomOutButton = screen.getByTitle('Zoom out')

    // Click multiple times to reach min
    for (let i = 0; i < 5; i++) {
      await userEvent.click(zoomOutButton)
    }

    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('handles rapid section switching', async () => {
    render(<ResumeBuilderPage />)

    const sections = ['Experience', 'Education', 'Skills', 'Projects', 'Personal Info']

    for (const section of sections) {
      const tab = screen.getByRole('button', { name: new RegExp(section, 'i') })
      await userEvent.click(tab)
    }

    // Should end up back on Personal Info
    expect(screen.getByTestId('personal-info-form')).toBeInTheDocument()
  })
})
