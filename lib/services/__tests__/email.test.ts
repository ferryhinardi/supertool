import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Create a mock for the emails.send method
const mockSend = vi.fn()

// Mock the resend module with a proper class mock
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      }
    },
  }
})

// Import after mocking
import { sendDonationThankYou, sendEmail, testEmailConfig } from '../email'

describe('email service', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default env
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test_api_key',
      RESEND_FROM_EMAIL: 'test@supertool.app',
      RESEND_REPLY_TO_EMAIL: 'reply@supertool.app',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('sendEmail', () => {
    it('should throw error when RESEND_API_KEY is not configured', async () => {
      process.env.RESEND_API_KEY = ''

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test Subject',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('RESEND_API_KEY is not configured')
    })

    it('should send email successfully', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_123' },
        error: null,
      })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      })

      expect(result).toEqual({ id: 'email_123' })
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('SuperTool'),
          to: 'user@example.com',
          subject: 'Test Subject',
          html: '<p>Test content</p>',
        })
      )
    })

    it('should send email with all options', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_456' },
        error: null,
      })

      const result = await sendEmail({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Multi-recipient Test',
        html: '<p>HTML content</p>',
        text: 'Plain text content',
        replyTo: 'reply@example.com',
        from: 'Custom Sender <custom@example.com>',
      })

      expect(result).toEqual({ id: 'email_456' })
      expect(mockSend).toHaveBeenCalledWith({
        from: 'Custom Sender <custom@example.com>',
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Multi-recipient Test',
        html: '<p>HTML content</p>',
        text: 'Plain text content',
        replyTo: 'reply@example.com',
      })
    })

    it('should throw error when Resend API returns an error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid recipient email' },
      })

      await expect(
        sendEmail({
          to: 'invalid-email',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Failed to send email: Invalid recipient email')
    })

    it('should throw error when Resend API returns error without message', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { code: 'VALIDATION_ERROR' },
      })

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Failed to send email:')
    })

    it('should throw error when no email ID is returned', async () => {
      mockSend.mockResolvedValueOnce({
        data: {},
        error: null,
      })

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('No email ID returned from Resend')
    })

    it('should throw error when data is null', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('No email ID returned from Resend')
    })

    it('should re-throw errors from Resend client', async () => {
      mockSend.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Network error')
    })
  })

  describe('sendDonationThankYou', () => {
    it('should send donation thank you email with correct formatting', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'donation_email_123' },
        error: null,
      })

      const result = await sendDonationThankYou(
        'donor@example.com',
        'John Doe',
        1000, // 1000 cents = $10.00
        'USD'
      )

      expect(result).toEqual({ id: 'donation_email_123' })
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'donor@example.com',
          subject: 'Thank you for supporting SuperTool! 💙',
          replyTo: 'reply@supertool.app',
        })
      )
    })

    it('should format amount correctly for USD', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_usd' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Jane', 2500, 'USD')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('$25.00'),
          text: expect.stringContaining('$25.00'),
        })
      )
    })

    it('should format amount correctly for EUR', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_eur' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Hans', 5000, 'EUR')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('€50.00'),
          text: expect.stringContaining('€50.00'),
        })
      )
    })

    it('should use USD as default currency', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_default' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Alice', 1500)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('$15.00'),
        })
      )
    })

    it('should include donor name in HTML content', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_name' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Bob Smith', 1000, 'USD')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Bob Smith'),
          text: expect.stringContaining('Bob Smith'),
        })
      )
    })

    it('should include proper HTML structure', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_html' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 1000, 'USD')

      const call = mockSend.mock.calls[0][0]
      expect(call.html).toContain('<!DOCTYPE html>')
      expect(call.html).toContain('<html lang="en">')
      expect(call.html).toContain('Thank You!')
      expect(call.html).toContain('SuperTool')
      expect(call.html).toContain('https://supertool.app')
    })

    it('should include plain text version', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_text' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 1000, 'USD')

      const call = mockSend.mock.calls[0][0]
      expect(call.text).toContain('Thank You for Your Support!')
      expect(call.text).toContain('SuperTool')
      expect(call.text).toContain('https://supertool.app')
      expect(call.text).toContain('60+ free tools')
    })

    it('should handle lowercase currency code', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_lowercase' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 1000, 'usd')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('$10.00'),
        })
      )
    })

    it('should format GBP correctly', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'email_gbp' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 3000, 'GBP')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('£30.00'),
        })
      )
    })

    it('should propagate errors from sendEmail', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded' },
      })

      await expect(sendDonationThankYou('donor@example.com', 'Test', 1000, 'USD')).rejects.toThrow(
        'Failed to send email: Rate limit exceeded'
      )
    })
  })

  describe('testEmailConfig', () => {
    it('should return false when RESEND_API_KEY is not configured', async () => {
      process.env.RESEND_API_KEY = ''

      const result = await testEmailConfig()

      expect(result).toBe(false)
    })

    it('should return true when email sends successfully', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'test_email_123' },
        error: null,
      })

      const result = await testEmailConfig()

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'SuperTool Email Test',
        })
      )
    })

    it('should return false when email fails to send', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'API error' },
      })

      const result = await testEmailConfig()

      expect(result).toBe(false)
    })

    it('should return false when an exception is thrown', async () => {
      mockSend.mockRejectedValueOnce(new Error('Connection failed'))

      const result = await testEmailConfig()

      expect(result).toBe(false)
    })
  })

  describe('email content generation', () => {
    it('should generate HTML with proper styling', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'styled_email' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Styled Test', 1000, 'USD')

      const call = mockSend.mock.calls[0][0]
      expect(call.html).toContain('background-color')
      expect(call.html).toContain('border-radius')
      expect(call.html).toContain('font-family')
    })

    it('should include all required email sections', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'sections_email' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Section Test', 1000, 'USD')

      const call = mockSend.mock.calls[0][0]
      // Header
      expect(call.html).toContain('Thank You!')
      // Content
      expect(call.html).toContain('incredibly grateful')
      // List items
      expect(call.html).toContain('Maintain and improve')
      expect(call.html).toContain('100% ad-free')
      // CTA
      expect(call.html).toContain('Explore SuperTool')
      // Footer
      expect(call.html).toContain('Free Productivity Tools for Everyone')
    })

    it('should include bullet points in plain text', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'bullet_email' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Bullet Test', 1000, 'USD')

      const call = mockSend.mock.calls[0][0]
      expect(call.text).toContain('- Maintain and improve')
      expect(call.text).toContain('- Keep the platform')
      expect(call.text).toContain('- Add new features')
      expect(call.text).toContain('- Ensure fast')
    })
  })

  describe('currency formatting edge cases', () => {
    it('should handle zero amount', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'zero_email' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 0, 'USD')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('$0.00'),
        })
      )
    })

    it('should handle large amounts', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'large_email' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 10000000, 'USD') // $100,000

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('$100,000.00'),
        })
      )
    })

    it('should handle JPY (no decimal places)', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'jpy_email' },
        error: null,
      })

      await sendDonationThankYou('donor@example.com', 'Test', 100000, 'JPY')

      // JPY typically shows as whole number ¥1,000
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('¥'),
        })
      )
    })
  })
})
