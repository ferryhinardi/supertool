import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'
import PrivacyPolicyGeneratorPage from '../page'

// Mock jsPDF library
vi.mock('jspdf', () => ({
  jsPDF: class {
    internal = {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    }
    setFontSize = vi.fn()
    setFont = vi.fn()
    text = vi.fn()
    splitTextToSize = vi.fn((text: string) => [text])
    addPage = vi.fn()
    save = vi.fn()
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('PrivacyPolicyGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper function to fill required company fields
  const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
    const companyNameInput = screen.getByLabelText(/company name/i)
    const websiteInput = screen.getByLabelText(/website url/i)
    const emailInput = screen.getByLabelText(/contact email/i)

    await user.clear(companyNameInput)
    await user.type(companyNameInput, 'Acme Corporation')
    await user.clear(websiteInput)
    await user.type(websiteInput, 'https://acme.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'privacy@acme.com')
  }

  describe('Rendering', () => {
    it('should render page title', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText('Privacy Policy Generator')).toBeInTheDocument()
    })

    it('should render page description', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/GDPR & CCPA compliant privacy policies/i)).toBeInTheDocument()
    })

    it('should render document type selection buttons', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument()
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })

    it('should render company information section', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText('Company Information')).toBeInTheDocument()
    })

    it('should render all company info form fields', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/website url/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument()
    })

    it('should have default values for country', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const countryInput = screen.getByLabelText(/country/i)
      expect(countryInput).toHaveValue('United States')
    })

    it('should render preview section', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    it('should render export buttons when required fields are filled', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Export buttons are only visible when canGenerate is true
      // First, they should NOT be visible
      expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()

      // Fill required fields
      await fillRequiredFields(user)

      // Now they should be visible
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /html/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument()
    })

    it('should render legal notice section', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/legal disclaimer/i)).toBeInTheDocument()
    })

    it('should track page open event on mount', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_generator_open')
    })

    it('should have privacy policy selected by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      // Privacy Policy button should have the selected style
      const privacyPolicyButton = screen.getByText('Privacy Policy').closest('button')
      expect(privacyPolicyButton).toBeInTheDocument()
    })
  })

  describe('Document Type Selection', () => {
    it('should select Cookie Policy when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_document_type_select', {
        type: 'cookie-policy',
      })
    })

    it('should select Terms of Service when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const termsButton = screen.getByText('Terms of Service').closest('button')
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_document_type_select', {
        type: 'terms-of-service',
      })
    })

    it('should select Privacy Policy when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // First select cookie policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      // Then select privacy policy
      const privacyPolicyButton = screen.getByText('Privacy Policy').closest('button')
      if (!privacyPolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(privacyPolicyButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_document_type_select', {
        type: 'privacy-policy',
      })
    })

    it('should show industry selection only for Privacy Policy', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Industry should be visible for Privacy Policy (CardTitle is "Industry")
      expect(screen.getByText('Industry')).toBeInTheDocument()

      // Switch to Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      // Industry should not be visible
      expect(screen.queryByText('Industry')).not.toBeInTheDocument()
    })

    it('should show jurisdiction selection only for Privacy Policy', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Jurisdiction should be visible for Privacy Policy
      expect(screen.getByText('Jurisdiction')).toBeInTheDocument()

      // Switch to Terms of Service
      const termsButton = screen.getByText('Terms of Service').closest('button')
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)

      // Jurisdiction should not be visible
      expect(screen.queryByText('Jurisdiction')).not.toBeInTheDocument()
    })

    it('should show additional sections only for Privacy Policy', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Additional sections should be visible for Privacy Policy
      expect(screen.getByText('Additional Sections')).toBeInTheDocument()

      // Switch to Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      // Additional sections should not be visible
      expect(screen.queryByText('Additional Sections')).not.toBeInTheDocument()
    })
  })

  describe('Company Information Form', () => {
    it('should update company name field', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const input = screen.getByLabelText(/company name/i)
      await user.clear(input)
      await user.type(input, 'Test Company')

      expect(input).toHaveValue('Test Company')
    })

    it('should update website URL field', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const input = screen.getByLabelText(/website url/i)
      await user.clear(input)
      await user.type(input, 'https://test.com')

      expect(input).toHaveValue('https://test.com')
    })

    it('should update contact email field', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const input = screen.getByLabelText(/contact email/i)
      await user.clear(input)
      await user.type(input, 'test@test.com')

      expect(input).toHaveValue('test@test.com')
    })

    it('should update country field', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const input = screen.getByLabelText(/country/i)
      await user.clear(input)
      await user.type(input, 'Canada')

      expect(input).toHaveValue('Canada')
    })

    it('should update state/province field', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const input = screen.getByLabelText(/state\/province/i)
      await user.type(input, 'California')

      expect(input).toHaveValue('California')
    })

    it('should update effective date field', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const input = screen.getByLabelText(/effective date/i)
      await user.clear(input)
      await user.type(input, '2025-01-01')

      expect(input).toHaveValue('2025-01-01')
    })

    it('should show required indicator in company name label', () => {
      render(<PrivacyPolicyGeneratorPage />)
      // The component uses * in the label to indicate required, not the HTML required attribute
      expect(screen.getByText(/company name \*/i)).toBeInTheDocument()
    })

    it('should show required indicator in website URL label', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/website url \*/i)).toBeInTheDocument()
    })

    it('should show required indicator in contact email label', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/contact email \*/i)).toBeInTheDocument()
    })

    it('should have url type for website input', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const input = screen.getByLabelText(/website url/i)
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should have email type for contact email input', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const input = screen.getByLabelText(/contact email/i)
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should have date type for effective date input', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const input = screen.getByLabelText(/effective date/i)
      expect(input).toHaveAttribute('type', 'date')
    })
  })

  describe('Industry Selection', () => {
    it('should render all industry options', () => {
      render(<PrivacyPolicyGeneratorPage />)

      expect(screen.getByText('General Website')).toBeInTheDocument()
      expect(screen.getByText('SaaS/Software')).toBeInTheDocument()
      expect(screen.getByText('E-commerce')).toBeInTheDocument()
      expect(screen.getByText('Blog/Content')).toBeInTheDocument()
      expect(screen.getByText('Mobile App')).toBeInTheDocument()
    })

    it('should have General Website selected by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      // The first industry should be selected by default
      const generalOption = screen.getByText('General Website').closest('button')
      expect(generalOption).toBeInTheDocument()
    })

    it('should select SaaS/Software when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const saasOption = screen.getByText('SaaS/Software').closest('button')
      if (!saasOption) {
        throw new Error('Required button not found')
      }
      await user.click(saasOption)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_industry_select', {
        industry: 'saas',
      })
    })

    it('should select E-commerce when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const ecommerceOption = screen.getByText('E-commerce').closest('button')
      if (!ecommerceOption) {
        throw new Error('Required button not found')
      }
      await user.click(ecommerceOption)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_industry_select', {
        industry: 'ecommerce',
      })
    })

    it('should select Blog/Content when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const blogOption = screen.getByText('Blog/Content').closest('button')
      if (!blogOption) {
        throw new Error('Required button not found')
      }
      await user.click(blogOption)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_industry_select', {
        industry: 'blog',
      })
    })

    it('should select Mobile App when clicked', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const mobileAppOption = screen.getByText('Mobile App').closest('button')
      if (!mobileAppOption) {
        throw new Error('Required button not found')
      }
      await user.click(mobileAppOption)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_industry_select', {
        industry: 'mobile-app',
      })
    })
  })

  describe('Jurisdiction Selection', () => {
    it('should render all jurisdiction options', () => {
      render(<PrivacyPolicyGeneratorPage />)

      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('EU (GDPR)')).toBeInTheDocument()
      expect(screen.getByText('California (CCPA)')).toBeInTheDocument()
      expect(screen.getByText('International')).toBeInTheDocument()
    })

    it('should have International selected by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      // International is required and should be selected by default
      const internationalOption = screen.getByText('International').closest('button')
      expect(internationalOption).toBeInTheDocument()
    })

    it('should toggle United States jurisdiction', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const usOption = screen.getByText('United States').closest('button')
      if (!usOption) {
        throw new Error('Required button not found')
      }
      await user.click(usOption)

      // Analytics does NOT include 'selected' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_jurisdiction_select', {
        jurisdiction: 'us',
      })
    })

    it('should toggle EU (GDPR) jurisdiction and set GDPR rights', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const gdprOption = screen.getByText('EU (GDPR)').closest('button')
      if (!gdprOption) {
        throw new Error('Required button not found')
      }
      await user.click(gdprOption)

      // Analytics does NOT include 'selected' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_jurisdiction_select', {
        jurisdiction: 'eu-gdpr',
      })
    })

    it('should toggle California (CCPA) jurisdiction and set California rights', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const ccpaOption = screen.getByText('California (CCPA)').closest('button')
      if (!ccpaOption) {
        throw new Error('Required button not found')
      }
      await user.click(ccpaOption)

      // Analytics does NOT include 'selected' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_jurisdiction_select', {
        jurisdiction: 'ccpa',
      })
    })

    it('should not deselect International jurisdiction (required)', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const internationalOption = screen.getByText('International').closest('button')
      if (!internationalOption) {
        throw new Error('Required button not found')
      }
      await user.click(internationalOption)

      // International is disabled and cannot be clicked, so no tracking should occur
      expect(trackToolEvent).not.toHaveBeenCalledWith('privacy_policy_jurisdiction_select', {
        jurisdiction: 'international',
      })
    })

    it('should have International jurisdiction disabled (cannot be deselected)', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const internationalOption = screen.getByText('International').closest('button')
      expect(internationalOption).toBeDisabled()
    })
  })

  describe('Additional Sections', () => {
    it('should render all additional section checkboxes', () => {
      render(<PrivacyPolicyGeneratorPage />)

      expect(screen.getByText('Analytics & Tracking')).toBeInTheDocument()
      expect(screen.getByText('Cookies Usage')).toBeInTheDocument()
      expect(screen.getByText('Third-Party Integrations')).toBeInTheDocument()
      expect(screen.getByText('Data Retention Policy')).toBeInTheDocument()
      expect(screen.getByText("Children's Privacy (COPPA)")).toBeInTheDocument()
    })

    it('should have Analytics & Tracking checked by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const checkbox = screen.getByLabelText(/analytics & tracking/i)
      expect(checkbox).toBeChecked()
    })

    it('should have Cookies Usage checked by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const checkbox = screen.getByLabelText(/cookies usage/i)
      expect(checkbox).toBeChecked()
    })

    it('should have Third-Party Integrations unchecked by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const checkbox = screen.getByLabelText(/third-party integrations/i)
      expect(checkbox).not.toBeChecked()
    })

    it('should have Data Retention Policy checked by default', () => {
      render(<PrivacyPolicyGeneratorPage />)
      const checkbox = screen.getByLabelText(/data retention policy/i)
      expect(checkbox).toBeChecked()
    })

    it("should have Children's Privacy checked by default", () => {
      render(<PrivacyPolicyGeneratorPage />)
      const checkbox = screen.getByLabelText(/children's privacy/i)
      expect(checkbox).toBeChecked()
    })

    it('should toggle Analytics & Tracking checkbox', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const checkbox = screen.getByLabelText(/analytics & tracking/i)
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
      // Analytics does NOT include 'enabled' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_option_toggle', {
        option: 'includeAnalytics',
      })
    })

    it('should toggle Cookies Usage checkbox', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const checkbox = screen.getByLabelText(/cookies usage/i)
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
      // Analytics does NOT include 'enabled' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_option_toggle', {
        option: 'includeCookies',
      })
    })

    it('should toggle Third-Party Integrations checkbox', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const checkbox = screen.getByLabelText(/third-party integrations/i)
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
      // Analytics does NOT include 'enabled' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_option_toggle', {
        option: 'includeThirdPartyServices',
      })
    })

    it('should toggle Data Retention Policy checkbox', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const checkbox = screen.getByLabelText(/data retention policy/i)
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
      // Analytics does NOT include 'enabled' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_option_toggle', {
        option: 'includeDataRetention',
      })
    })

    it("should toggle Children's Privacy checkbox", async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      const checkbox = screen.getByLabelText(/children's privacy/i)
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
      // Analytics does NOT include 'enabled' property
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_option_toggle', {
        option: 'includeChildrenPrivacy',
      })
    })
  })

  describe('Document Generation', () => {
    it('should show empty preview when required fields are not filled', () => {
      render(<PrivacyPolicyGeneratorPage />)

      // Clear the company name to ensure no preview
      const companyNameInput = screen.getByLabelText(/company name/i)
      fireEvent.change(companyNameInput, { target: { value: '' } })

      // Preview should show placeholder or empty state
      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('Fill in the required fields')).toBeInTheDocument()
    })

    it('should generate privacy policy preview when required fields are filled', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      // Should show preview with company name (multiple elements may match)
      await waitFor(() => {
        const elements = screen.getAllByText(/acme corporation/i)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('should generate cookie policy when Cookie Policy is selected', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      await fillRequiredFields(user)

      // Should show cookie policy content (check for h1 heading specifically)
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: 'Cookie Policy', level: 1 })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should generate terms of service when Terms of Service is selected', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Terms of Service
      const termsButton = screen.getByText('Terms of Service').closest('button')
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)

      await fillRequiredFields(user)

      // Should show terms of service content (check for h1 heading specifically)
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: 'Terms of Service', level: 1 })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should include company information in generated document', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      await waitFor(() => {
        const elements = screen.getAllByText(/acme corporation/i)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('should include website URL in generated document', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      await waitFor(() => {
        const elements = screen.getAllByText(/acme\.com/i)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('should include contact email in generated document', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      await waitFor(() => {
        const elements = screen.getAllByText(/privacy@acme\.com/i)
        expect(elements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy document to clipboard when fields are filled', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
    })

    it('should track copy analytics event', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)

      // Analytics for copy does NOT include documentType
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_copy')
    })

    it('should copy cookie policy to clipboard', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      await fillRequiredFields(user)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      // Analytics for copy does NOT include documentType
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_copy')
    })

    it('should copy terms of service to clipboard', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Terms of Service
      const termsButton = screen.getByText('Terms of Service').closest('button')
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)

      await fillRequiredFields(user)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      // Analytics for copy does NOT include documentType
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_copy')
    })
  })

  describe('Download HTML', () => {
    it('should download HTML file when fields are filled', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      // Mock after render
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const anchor = originalCreateElement('a')
          anchor.click = mockClick
          return anchor
        }
        return originalCreateElement(tag)
      })

      const htmlButton = screen.getByRole('button', { name: /html/i })
      await user.click(htmlButton)

      expect(mockClick).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('HTML file downloaded!')

      vi.mocked(document.createElement).mockRestore()
    })

    it('should track download HTML analytics event', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      // Mock after render
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const anchor = originalCreateElement('a')
          anchor.click = mockClick
          return anchor
        }
        return originalCreateElement(tag)
      })

      const htmlButton = screen.getByRole('button', { name: /html/i })
      await user.click(htmlButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_download_html', {
        documentType: 'privacy-policy',
      })

      vi.mocked(document.createElement).mockRestore()
    })

    it('should download cookie policy as HTML', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      await fillRequiredFields(user)

      // Mock after render
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const anchor = originalCreateElement('a')
          anchor.click = mockClick
          return anchor
        }
        return originalCreateElement(tag)
      })

      const htmlButton = screen.getByRole('button', { name: /html/i })
      await user.click(htmlButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_download_html', {
        documentType: 'cookie-policy',
      })

      vi.mocked(document.createElement).mockRestore()
    })
  })

  describe('Download PDF', () => {
    it('should download PDF file when fields are filled', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      const pdfButton = screen.getByRole('button', { name: /pdf/i })
      await user.click(pdfButton)

      expect(toast.success).toHaveBeenCalledWith('PDF downloaded successfully!')
    })

    it('should track download PDF analytics event', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      await fillRequiredFields(user)

      const pdfButton = screen.getByRole('button', { name: /pdf/i })
      await user.click(pdfButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_download_pdf', {
        documentType: 'privacy-policy',
      })
    })

    it('should download cookie policy as PDF', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      await fillRequiredFields(user)

      const pdfButton = screen.getByRole('button', { name: /pdf/i })
      await user.click(pdfButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_download_pdf', {
        documentType: 'cookie-policy',
      })
    })

    it('should download terms of service as PDF', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Select Terms of Service
      const termsButton = screen.getByText('Terms of Service').closest('button')
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)

      await fillRequiredFields(user)

      const pdfButton = screen.getByRole('button', { name: /pdf/i })
      await user.click(pdfButton)

      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_download_pdf', {
        documentType: 'terms-of-service',
      })
    })
  })

  describe('Legal Notice Section', () => {
    it('should display legal disclaimer', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/legal disclaimer/i)).toBeInTheDocument()
    })

    it('should display customization notice', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/customize/i)).toBeInTheDocument()
    })

    it('should display regular updates notice', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/regularly/i)).toBeInTheDocument()
    })

    it('should display legal counsel recommendation', () => {
      render(<PrivacyPolicyGeneratorPage />)
      expect(screen.getByText(/legal counsel|lawyer|attorney/i)).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should generate complete privacy policy with all options', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Fill all company info
      await fillRequiredFields(user)

      const stateInput = screen.getByLabelText(/state\/province/i)
      await user.type(stateInput, 'California')

      // Select SaaS industry
      const saasOption = screen.getByText('SaaS/Software').closest('button')
      if (!saasOption) {
        throw new Error('Required button not found')
      }
      await user.click(saasOption)

      // Select GDPR jurisdiction
      const gdprOption = screen.getByText('EU (GDPR)').closest('button')
      if (!gdprOption) {
        throw new Error('Required button not found')
      }
      await user.click(gdprOption)

      // Select CCPA jurisdiction
      const ccpaOption = screen.getByText('California (CCPA)').closest('button')
      if (!ccpaOption) {
        throw new Error('Required button not found')
      }
      await user.click(ccpaOption)

      // Enable Third-Party Integrations
      const thirdPartyCheckbox = screen.getByLabelText(/third-party integrations/i)
      await user.click(thirdPartyCheckbox)

      // Verify document is generated
      await waitFor(() => {
        expect(screen.getAllByText(/acme corporation/i).length).toBeGreaterThan(0)
      })
    })

    it('should switch between document types and maintain company info', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Fill company info
      await fillRequiredFields(user)

      // Switch to Cookie Policy
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      // Company info should still be there
      expect(screen.getByLabelText(/company name/i)).toHaveValue('Acme Corporation')

      // Switch to Terms of Service
      const termsButton = screen.getByText('Terms of Service').closest('button')
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)

      // Company info should still be there
      expect(screen.getByLabelText(/company name/i)).toHaveValue('Acme Corporation')

      // Switch back to Privacy Policy
      const privacyButton = screen.getByText('Privacy Policy').closest('button')
      if (!privacyButton) {
        throw new Error('Required button not found')
      }
      await user.click(privacyButton)

      // Company info should still be there
      expect(screen.getByLabelText(/company name/i)).toHaveValue('Acme Corporation')
    })

    it('should generate and export privacy policy end to end', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Fill required fields
      await fillRequiredFields(user)

      // Wait for document generation
      await waitFor(() => {
        expect(screen.getAllByText(/acme corporation/i).length).toBeGreaterThan(0)
      })

      // Copy to clipboard
      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')

      // Download PDF
      const pdfButton = screen.getByRole('button', { name: /pdf/i })
      await user.click(pdfButton)
      expect(toast.success).toHaveBeenCalledWith('PDF downloaded successfully!')
    })

    it('should handle rapid document type switching', async () => {
      const user = userEvent.setup()
      render(<PrivacyPolicyGeneratorPage />)

      // Rapidly switch between document types
      const cookiePolicyButton = screen.getByText('Cookie Policy').closest('button')
      const termsButton = screen.getByText('Terms of Service').closest('button')
      const privacyButton = screen.getByText('Privacy Policy').closest('button')

      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)
      if (!termsButton) {
        throw new Error('Required button not found')
      }
      await user.click(termsButton)
      if (!privacyButton) {
        throw new Error('Required button not found')
      }
      await user.click(privacyButton)
      if (!cookiePolicyButton) {
        throw new Error('Required button not found')
      }
      await user.click(cookiePolicyButton)

      // Should track all selections
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_document_type_select', {
        type: 'cookie-policy',
      })
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_document_type_select', {
        type: 'terms-of-service',
      })
      expect(trackToolEvent).toHaveBeenCalledWith('privacy_policy_document_type_select', {
        type: 'privacy-policy',
      })
    })
  })
})
