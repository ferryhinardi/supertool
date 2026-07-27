'use client'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'
import type { CoverLetterData } from '../../types'
import { AISuggestions } from '../AISuggestions'

vi.mock('@/components/features/monetization/PaywallModal', () => ({
  PaywallModal: ({
    open,
    reason,
    remaining,
    onOpenChange,
  }: {
    open: boolean
    reason: 'quota-exceeded' | 'anonymous-blocked'
    remaining?: number
    onOpenChange: (value: boolean) => void
  }) =>
    open ? (
      <div data-testid="paywall-modal">
        <span>{reason}</span>
        <span>{remaining ?? 'no-remaining'}</span>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close paywall
        </button>
      </div>
    ) : null,
}))

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}))

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

const createMockResponse = (data: unknown, ok = true, status = 200) => {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    clone: function () {
      return this
    },
  } as Response
}

const coverLetterFixture: CoverLetterData = {
  id: 'cover-letter-1',
  personal: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '555-0100',
    location: 'Jakarta',
    linkedin: 'linkedin.com/in/johndoe',
    portfolio: 'johndoe.dev',
  },
  recipient: {
    companyName: 'Acme Corp',
    hiringManagerName: 'Jane Smith',
    hiringManagerTitle: 'Head of Engineering',
    companyAddress: '123 Main St',
    department: 'Engineering',
  },
  position: 'Senior Software Engineer',
  content: {
    opening: 'I am excited to apply.',
    body: 'I build reliable systems and lead projects.',
    closing: 'Thank you for your consideration.',
    callToAction: 'I look forward to speaking with you.',
  },
  date: '2024-01-15',
  salutation: 'Dear Hiring Manager',
  signature: 'Sincerely',
  templateId: 'modern',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
}

describe('AISuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('includes the authorization header when a Supabase session token is available', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'session-token',
        },
      },
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>)

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: { opening: 'Authenticated opening' },
        remaining: 2,
      })
    )

    render(
      <AISuggestions
        coverLetter={coverLetterFixture}
        onApplySuggestion={vi.fn()}
        onAnalyticsEvent={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /Generate Opening/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai-cover-letter',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer session-token',
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  it('shows a paywall modal when the API returns a blocked premium response', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'quota-exceeded', remaining: 0 }, false, 402)
    )

    render(
      <AISuggestions
        coverLetter={coverLetterFixture}
        onApplySuggestion={vi.fn()}
        onAnalyticsEvent={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /Generate Opening/i }))

    await waitFor(() => {
      expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
    })

    expect(screen.getByText('quota-exceeded')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows remaining free quota after a successful AI suggestion response', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: { opening: 'Fresh opening paragraph' },
        remaining: 2,
      })
    )

    render(
      <AISuggestions
        coverLetter={coverLetterFixture}
        onApplySuggestion={vi.fn()}
        onAnalyticsEvent={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /Generate Opening/i }))

    await waitFor(() => {
      expect(screen.getByText(/Remaining free AI uses today: 2/i)).toBeInTheDocument()
    })
  })

  it('emits sanitized analytics payloads without raw cover-letter content', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: { opening: 'Fresh opening paragraph' },
        remaining: 2,
      })
    )

    const onAnalyticsEvent = vi.fn()

    render(
      <AISuggestions
        coverLetter={coverLetterFixture}
        onApplySuggestion={vi.fn()}
        onAnalyticsEvent={onAnalyticsEvent}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /Generate Opening/i }))

    expect(onAnalyticsEvent).toHaveBeenCalledWith('cover_letter_ai_suggestion_requested', {
      type: 'opening',
    })

    const analyticsPayload = onAnalyticsEvent.mock.calls[0]?.[1] as Record<string, unknown>
    expect(analyticsPayload).not.toHaveProperty('fullName')
    expect(analyticsPayload).not.toHaveProperty('companyName')
    expect(analyticsPayload).not.toHaveProperty('content')
    expect(analyticsPayload).not.toHaveProperty('email')
  })

  it('allows closing the paywall modal after a blocked response', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'anonymous-blocked' }, false, 402)
    )

    render(
      <AISuggestions
        coverLetter={coverLetterFixture}
        onApplySuggestion={vi.fn()}
        onAnalyticsEvent={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /Generate Opening/i }))

    await waitFor(() => {
      expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Close paywall/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('paywall-modal')).not.toBeInTheDocument()
    })
  })
})
