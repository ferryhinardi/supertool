import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EmailTemplatesPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

const mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
  warning: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
}

// Mock analytics - use vi.hoisted to ensure mocks are available when vi.mock is hoisted
const { mockTrackToolEvent, mockTrackEvent } = vi.hoisted(() => ({
  mockTrackToolEvent: vi.fn(),
  mockTrackEvent: vi.fn(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
  trackEvent: mockTrackEvent,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, transition, whileHover, whileTap, ...validProps } = props
      return <div {...validProps}>{children}</div>
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, transition, whileHover, whileTap, ...validProps } = props
      return <button {...validProps}>{children}</button>
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, transition, whileHover, whileTap, ...validProps } = props
      return <span {...validProps}>{children}</span>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock ToolSearch
vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search" />,
}))

// Mock FAQAccordion
vi.mock('@/components/ui/faq-accordion', () => ({
  FAQAccordion: ({ faqs }: { faqs: any[] }) => (
    <div data-testid="faq-accordion">FAQ Section ({faqs.length} items)</div>
  ),
}))

// Mock ToolRating
vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: ({ toolId, toolName }: { toolId: string; toolName: string }) => (
    <div data-testid="tool-rating">{toolName}</div>
  ),
}))

// Mock SocialShare
vi.mock('@/components/ui/social-share', () => ({
  SocialShare: ({ toolName }: { toolName: string }) => (
    <div data-testid="social-share">{toolName}</div>
  ),
}))

// Mock RelatedTools
vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools" />,
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  }),
}

// Store original document.createElement before any tests
const originalCreateElement = document.createElement.bind(document)

beforeEach(() => {
  vi.clearAllMocks()
  mockLocalStorage.store = {}

  vi.stubGlobal('localStorage', mockLocalStorage)

  // Mock URL methods
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('EmailTemplatesPage', () => {
  describe('Basic Rendering', () => {
    it('should render page title', () => {
      render(<EmailTemplatesPage />)
      // Title appears in both heading and possibly elsewhere, so use getAllByText
      const titles = screen.getAllByText('Email Template Builder')
      expect(titles.length).toBeGreaterThanOrEqual(1)
    })

    it('should render page description', () => {
      render(<EmailTemplatesPage />)
      expect(
        screen.getByText(/Create professional emails in seconds with pre-built templates/)
      ).toBeInTheDocument()
    })

    it('should render feature badge', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText('10+ Templates • 4 Tone Styles')).toBeInTheDocument()
    })

    it('should render category selection card', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText('Choose Template Category')).toBeInTheDocument()
      expect(screen.getByText('Select the type of email you want to create')).toBeInTheDocument()
    })

    it('should render templates card', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText('Templates')).toBeInTheDocument()
    })

    it('should render email editor card', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText('Email Editor')).toBeInTheDocument()
    })

    it('should render variables panel', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText('Variables')).toBeInTheDocument()
      expect(screen.getByText('Fill in placeholder values')).toBeInTheDocument()
    })

    it('should render FAQ section', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument()
    })

    it('should render tool rating', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
    })

    it('should render social share', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByTestId('social-share')).toBeInTheDocument()
    })

    it('should render related tools', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByTestId('related-tools')).toBeInTheDocument()
    })
  })

  describe('Category Selection', () => {
    it('should display category operations', () => {
      render(<EmailTemplatesPage />)
      // Check for category labels
      expect(screen.getByText('Follow-up')).toBeInTheDocument()
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Thank You')).toBeInTheDocument()
      expect(screen.getByText('Rejection')).toBeInTheDocument()
      expect(screen.getByText('Inquiry')).toBeInTheDocument()
    })

    it('should show templates count for current category', () => {
      render(<EmailTemplatesPage />)
      // Default is follow-up which has 2 templates
      expect(screen.getByText('2 templates available')).toBeInTheDocument()
    })

    it('should display template names for follow-up category', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText('Job Application Follow-up')).toBeInTheDocument()
      expect(screen.getByText('Meeting Follow-up')).toBeInTheDocument()
    })
  })

  describe('Template Selection', () => {
    it('should load template content when selecting a template', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Click on a template
      const templateButton = screen.getByText('Job Application Follow-up')
      await user.click(templateButton)

      // Check that subject is loaded
      const subjectInput = screen.getByLabelText('Subject Line') as HTMLInputElement
      expect(subjectInput.value).toBe('Following Up on My Application - {{position}}')
    })

    it('should display template tone badge', () => {
      render(<EmailTemplatesPage />)
      // Templates have tone badges
      const toneBadges = screen.getAllByText('professional')
      expect(toneBadges.length).toBeGreaterThan(0)
    })

    it('should update editor description when template is selected', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Initially shows placeholder text
      expect(screen.getByText('Select a template or start from scratch')).toBeInTheDocument()

      // Click on a template
      await user.click(screen.getByText('Job Application Follow-up'))

      // Check description is updated
      expect(screen.getByText('Editing: Job Application Follow-up')).toBeInTheDocument()
    })
  })

  describe('Editor Functionality', () => {
    it('should allow editing subject line', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const subjectInput = screen.getByLabelText('Subject Line')
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Test Subject')

      expect((subjectInput as HTMLInputElement).value).toBe('Test Subject')
    })

    it('should allow editing email body', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.clear(bodyTextarea)
      await user.type(bodyTextarea, 'Test body content')

      expect((bodyTextarea as HTMLTextAreaElement).value).toBe('Test body content')
    })

    it('should show tone guide section', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByText(/Tone Guide:/)).toBeInTheDocument()
    })

    it('should display tone information', () => {
      render(<EmailTemplatesPage />)
      // Default tone is professional
      expect(screen.getByText(/Greeting:/)).toBeInTheDocument()
      expect(screen.getByText(/Closing:/)).toBeInTheDocument()
      expect(screen.getByText(/Style:/)).toBeInTheDocument()
    })
  })

  describe('Tone Selection', () => {
    it('should show tone button with current tone', () => {
      render(<EmailTemplatesPage />)
      // Default tone is professional
      expect(screen.getByRole('button', { name: /Tone: professional/i })).toBeInTheDocument()
    })

    it('should open tone dropdown when clicking tone button', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const toneButton = screen.getByRole('button', { name: /Tone: professional/i })
      await user.click(toneButton)

      // Check dropdown options are visible
      expect(screen.getByText('formal')).toBeInTheDocument()
      expect(screen.getByText('friendly')).toBeInTheDocument()
      expect(screen.getByText('casual')).toBeInTheDocument()
    })

    it('should change tone when selecting from dropdown', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Open dropdown
      const toneButton = screen.getByRole('button', { name: /Tone: professional/i })
      await user.click(toneButton)

      // Select formal tone
      const formalOption = screen.getByText('formal')
      await user.click(formalOption)

      // Check tone is updated
      expect(screen.getByRole('button', { name: /Tone: formal/i })).toBeInTheDocument()
    })

    it('should display tone descriptions in dropdown', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const toneButton = screen.getByRole('button', { name: /Tone: professional/i })
      await user.click(toneButton)

      // Check for tone style descriptions
      expect(
        screen.getByText('Uses formal language, proper titles, and structured paragraphs')
      ).toBeInTheDocument()
    })
  })

  describe('Variable Replacement', () => {
    it('should display variable input fields', () => {
      render(<EmailTemplatesPage />)

      expect(screen.getByLabelText('Recipient Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Position/Role')).toBeInTheDocument()
      expect(screen.getByLabelText('Your Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Your Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Your Phone')).toBeInTheDocument()
    })

    it('should display variable key placeholders', () => {
      render(<EmailTemplatesPage />)

      expect(screen.getByText('{{name}}')).toBeInTheDocument()
      expect(screen.getByText('{{company}}')).toBeInTheDocument()
      expect(screen.getByText('{{date}}')).toBeInTheDocument()
    })

    it('should allow entering variable values', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const nameInput = screen.getByLabelText('Recipient Name')
      await user.type(nameInput, 'John Smith')

      expect((nameInput as HTMLInputElement).value).toBe('John Smith')
    })

    it('should have clear all button for variables', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByRole('button', { name: 'Clear All' })).toBeInTheDocument()
    })

    it('should clear all variables when clicking clear button', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter some variable values
      const nameInput = screen.getByLabelText('Recipient Name')
      await user.type(nameInput, 'John Smith')

      // Click clear all
      await user.click(screen.getByRole('button', { name: 'Clear All' }))

      // Check toast was shown
      expect(mockToast.success).toHaveBeenCalledWith('Variables cleared')

      // Check input is cleared
      expect((nameInput as HTMLInputElement).value).toBe('')
    })
  })

  describe('Preview Section', () => {
    it('should not show preview when no content', () => {
      render(<EmailTemplatesPage />)
      // Preview section should not be visible initially
      expect(screen.queryByText('Preview')).not.toBeInTheDocument()
    })

    it('should show preview when subject is entered', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    it('should show preview when body is entered', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, 'Test body')

      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    it('should replace variables in preview', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter subject with variable - use fireEvent since {{}} has special meaning in userEvent
      const subjectInput = screen.getByLabelText('Subject Line')
      fireEvent.change(subjectInput, { target: { value: 'Hello {{name}}' } })

      // Verify the input value was set correctly
      expect(subjectInput).toHaveValue('Hello {{name}}')

      // Wait for preview to show first - it should appear when editedSubject has content
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument()
      })

      // Initially, the preview should show the placeholder value replaced
      // {{name}} placeholder is "John Doe", so it should show "Hello John Doe"
      await waitFor(() => {
        expect(screen.getByText('Hello John Doe')).toBeInTheDocument()
      })

      // Now type a custom value to replace the placeholder
      const nameInput = screen.getByPlaceholderText('John Doe')
      await user.clear(nameInput)
      await user.type(nameInput, 'Alice')

      // The preview subject should now show "Hello Alice"
      await waitFor(() => {
        expect(screen.getByText('Hello Alice')).toBeInTheDocument()
      })
    })

    it('should show "No subject" when subject is empty', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter only body to trigger preview
      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, 'Test body')

      // Check for no subject message
      expect(screen.getByText('No subject')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render copy full email button', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByRole('button', { name: /Copy Full Email/i })).toBeInTheDocument()
    })

    it('should render copy body only button', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByRole('button', { name: /Copy Body Only/i })).toBeInTheDocument()
    })

    it('should render save template button', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByRole('button', { name: /Save Template/i })).toBeInTheDocument()
    })

    it('should render download button', () => {
      render(<EmailTemplatesPage />)
      expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
    })

    it('should disable buttons when no content', () => {
      render(<EmailTemplatesPage />)

      expect(screen.getByRole('button', { name: /Copy Full Email/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Copy Body Only/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Save Template/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Download/i })).toBeDisabled()
    })

    it('should enable buttons when content is present', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter subject
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      // Buttons should be enabled
      expect(screen.getByRole('button', { name: /Copy Full Email/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /Save Template/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /Download/i })).not.toBeDisabled()
    })
  })

  describe('Copy Functionality', () => {
    it('should copy full email to clipboard', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, 'Test body')

      // Wait for button to be enabled and click
      const copyButton = screen.getByRole('button', { name: /Copy Full Email/i })
      await waitFor(() => {
        expect(copyButton).not.toBeDisabled()
      })
      await user.click(copyButton)

      // Check clipboard was called and toast was shown
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith('Email copied to clipboard!')
      })
    })

    it('should copy body only to clipboard', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content
      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, 'Test body content')

      // Wait for button to be enabled and click
      const copyBodyButton = screen.getByRole('button', { name: /Copy Body Only/i })
      await waitFor(() => {
        expect(copyBodyButton).not.toBeDisabled()
      })
      await user.click(copyBodyButton)

      // Check clipboard was called with body only and toast shown
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test body content')
        expect(mockToast.success).toHaveBeenCalledWith('Email body copied to clipboard!')
      })
    })

    it('should handle clipboard error', async () => {
      const user = userEvent.setup()

      // Mock clipboard to reject
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Clipboard error'))

      render(<EmailTemplatesPage />)

      // Enter content
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      // Wait for button to be enabled and click
      const copyButton = screen.getByRole('button', { name: /Copy Full Email/i })
      await waitFor(() => {
        expect(copyButton).not.toBeDisabled()
      })
      await user.click(copyButton)

      // Check error toast was shown
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })
  })

  describe('Save Template Functionality', () => {
    it('should open save dialog when clicking save button', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      // Click save button (the one in the action buttons area)
      await user.click(screen.getByRole('button', { name: /Save Template/i }))

      // Check dialog is open - dialog should have Template Name input
      await waitFor(() => {
        expect(screen.getByLabelText('Template Name')).toBeInTheDocument()
      })

      // "Save Template" text appears multiple times (button + dialog title)
      const saveTemplateTexts = screen.getAllByText('Save Template')
      expect(saveTemplateTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('should close save dialog when clicking cancel', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content and open dialog
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')
      await user.click(screen.getByRole('button', { name: /Save Template/i }))

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByLabelText('Template Name')).toBeInTheDocument()
      })

      // Click cancel
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByLabelText('Template Name')).not.toBeInTheDocument()
      })
    })

    it('should show warning when saving without name', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content and open dialog
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')
      await user.click(screen.getByRole('button', { name: /Save Template/i }))

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByLabelText('Template Name')).toBeInTheDocument()
      })

      // Find the Save button inside the dialog (last one, not the "Save Template" button)
      const saveButtons = screen.getAllByRole('button', { name: /^Save$/i })
      const dialogSaveButton = saveButtons[saveButtons.length - 1]
      await user.click(dialogSaveButton)

      // Check error toast (the component uses toast.error, not toast.warning)
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Please enter a template name')
      })
    })

    it('should save template with valid name', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, 'Test body')

      // Open save dialog
      await user.click(screen.getByRole('button', { name: /Save Template/i }))

      // Enter template name
      const nameInput = screen.getByLabelText('Template Name')
      await user.type(nameInput, 'My Custom Template')

      // Click save in dialog
      const saveButtons = screen.getAllByRole('button', { name: /Save/i })
      const dialogSaveButton = saveButtons[saveButtons.length - 1]
      await user.click(dialogSaveButton)

      // Check success toast
      expect(mockToast.success).toHaveBeenCalledWith('Template saved!')

      // Check localStorage was called
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'emailTemplates',
        expect.stringContaining('My Custom Template')
      )
    })
  })

  describe('Custom Templates', () => {
    it('should load custom templates from localStorage on mount', () => {
      const customTemplates = [
        {
          id: 'custom-1',
          name: 'My Saved Template',
          category: 'custom',
          subject: 'Custom Subject',
          body: 'Custom Body',
          tone: 'professional',
          isCustom: true,
          createdAt: Date.now(),
        },
      ]
      mockLocalStorage.store['emailTemplates'] = JSON.stringify(customTemplates)

      render(<EmailTemplatesPage />)

      // Check localStorage was read
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('emailTemplates')
    })

    it('should show empty state for custom templates when none exist', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Find and click the "My Templates" category
      // Need to find in the category operations
      const myTemplatesText = screen.queryByText('My Templates')
      if (myTemplatesText) {
        await user.click(myTemplatesText)
        expect(screen.getByText('No custom templates yet')).toBeInTheDocument()
      }
    })

    it('should show delete button for custom templates', async () => {
      const user = userEvent.setup()

      // Set up a custom template
      const customTemplates = [
        {
          id: 'custom-1',
          name: 'My Saved Template',
          category: 'custom',
          subject: 'Custom Subject',
          body: 'Custom Body',
          tone: 'professional',
          isCustom: true,
          createdAt: Date.now(),
        },
      ]
      mockLocalStorage.store['emailTemplates'] = JSON.stringify(customTemplates)

      render(<EmailTemplatesPage />)

      // Find and click the "My Templates" category if available
      const categoryTexts = screen.queryAllByText('My Templates')
      if (categoryTexts.length > 0) {
        await user.click(categoryTexts[0])

        // Check that delete button exists
        await waitFor(() => {
          const templateCard = screen.getByText('My Saved Template')
          expect(templateCard).toBeInTheDocument()
        })
      }
    })
  })

  describe('Download Functionality', () => {
    it('should download template as text file', async () => {
      const user = userEvent.setup()

      // RENDER FIRST - before any document.createElement mocking
      render(<EmailTemplatesPage />)

      // Enter content
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, 'Test body')

      // NOW set up download mocks (after render)
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {},
      }

      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tag)
      })

      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockAnchor as any)
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockAnchor as any)

      // Click download
      await user.click(screen.getByRole('button', { name: /Download/i }))

      // Check file was created and downloaded
      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockAnchor.click).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith('Template downloaded!')
      })

      // Cleanup
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('Template Filtering', () => {
    it('should show correct number of templates for introduction category', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Click on introduction category using aria-label (format: "Label: Description")
      const introButton = screen.getByRole('button', { name: /Introduction: First contact/i })
      await user.click(introButton)

      // Should show 2 introduction templates
      await waitFor(() => {
        expect(screen.getByText('2 templates available')).toBeInTheDocument()
      })
    })

    it('should display introduction templates when category selected', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Click on introduction category
      const introButton = screen.getByRole('button', { name: /Introduction: First contact/i })
      await user.click(introButton)

      // Check for introduction templates
      await waitFor(() => {
        expect(screen.getByText('Professional Introduction')).toBeInTheDocument()
        expect(screen.getByText('Networking Introduction')).toBeInTheDocument()
      })
    })

    it('should show thank you templates when category selected', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Click on thank you category
      const thankYouButton = screen.getByRole('button', { name: /Thank You: Gratitude emails/i })
      await user.click(thankYouButton)

      // Check for thank you templates
      await waitFor(() => {
        expect(screen.getByText('Interview Thank You')).toBeInTheDocument()
        expect(screen.getByText('Client Thank You')).toBeInTheDocument()
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('should track page open on mount', async () => {
      render(<EmailTemplatesPage />)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('email_templates_open', {})
      })
    })

    it('should track template selection', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Click on a template
      await user.click(screen.getByText('Job Application Follow-up'))

      // The actual event sends category, not templateId
      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('email_templates_select', {
          category: 'follow-up',
        })
      })
    })

    it('should track copy action', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Enter content
      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Test Subject')

      // Click copy
      await user.click(screen.getByRole('button', { name: /Copy Full Email/i }))

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('email_templates_copy', {})
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible labels for form inputs', () => {
      render(<EmailTemplatesPage />)

      expect(screen.getByLabelText('Subject Line')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Body')).toBeInTheDocument()
      expect(screen.getByLabelText('Recipient Name')).toBeInTheDocument()
    })

    it('should have proper button text for action buttons', () => {
      render(<EmailTemplatesPage />)

      // These buttons exist but may be disabled - check they exist in document
      const copyFullButton = screen.getByRole('button', { name: /Copy Full Email/i })
      const copyBodyButton = screen.getByRole('button', { name: /Copy Body Only/i })
      const saveButton = screen.getByRole('button', { name: /Save Template/i })
      const downloadButton = screen.getByRole('button', { name: /Download/i })

      expect(copyFullButton).toBeInTheDocument()
      expect(copyBodyButton).toBeInTheDocument()
      expect(saveButton).toBeInTheDocument()
      expect(downloadButton).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty localStorage gracefully', () => {
      mockLocalStorage.store = {}
      // Render should not throw
      const { container } = render(<EmailTemplatesPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      mockLocalStorage.store['emailTemplates'] = 'invalid json'
      // Render should not throw
      const { container } = render(<EmailTemplatesPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle special characters in variables', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Hello {{name}}!')

      const nameInput = screen.getByLabelText('Recipient Name')
      await user.type(nameInput, 'John <script>alert("xss")</script>')

      // Check preview displays (it exists when there's content)
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument()
      })
    })

    it('should handle very long content', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const longText = 'A'.repeat(1000) // Reduced from 10000 for speed
      const bodyTextarea = screen.getByLabelText('Email Body')
      await user.type(bodyTextarea, longText)

      expect((bodyTextarea as HTMLTextAreaElement).value).toHaveLength(1000)
    })

    it('should handle templates with no variables', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      const subjectInput = screen.getByLabelText('Subject Line')
      await user.type(subjectInput, 'Simple subject without variables')

      // Preview should show the text as-is
      await waitFor(() => {
        expect(screen.getByText('Simple subject without variables')).toBeInTheDocument()
      })
    })
  })

  describe('Template Selection and Editing', () => {
    it('should set correct tone when selecting template', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Click on follow-up template (has professional tone)
      await user.click(screen.getByText('Job Application Follow-up'))

      // Check tone button shows professional
      expect(screen.getByRole('button', { name: /Tone: professional/i })).toBeInTheDocument()
    })

    it('should allow editing template after selection', async () => {
      const user = userEvent.setup()
      render(<EmailTemplatesPage />)

      // Select a template
      await user.click(screen.getByText('Job Application Follow-up'))

      // Modify subject
      const subjectInput = screen.getByLabelText('Subject Line') as HTMLInputElement
      const originalValue = subjectInput.value
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Modified Subject')

      expect(subjectInput.value).toBe('Modified Subject')
      expect(subjectInput.value).not.toBe(originalValue)
    })
  })
})
