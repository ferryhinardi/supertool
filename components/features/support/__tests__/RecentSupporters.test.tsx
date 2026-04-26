import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecentSupporters from '../RecentSupporters'

const mockLimit = vi.fn()
const mockOrder = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockGetSupabaseServer = vi.fn()

vi.mock('@/lib/auth/supabaseServer', () => ({
  getSupabaseServer: () => mockGetSupabaseServer(),
}))

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

describe('RecentSupporters', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockLimit.mockResolvedValue({ data: [], error: null })
    mockOrder.mockReturnValue({ limit: mockLimit })
    mockEq.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })
    mockGetSupabaseServer.mockReturnValue({ from: mockFrom })
  })

  it('renders the placeholder when supporters are unavailable', async () => {
    mockLimit.mockResolvedValueOnce({ data: [], error: null })

    render(await RecentSupporters())

    expect(screen.getByText('Be the first to support SuperTool! 🚀')).toBeInTheDocument()
    expect(mockFrom).toHaveBeenCalledWith('orders')
    expect(mockSelect).toHaveBeenCalledWith('customer_name, amount, created_at')
    expect(mockEq).toHaveBeenCalledWith('status', 'succeeded')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(mockLimit).toHaveBeenCalledWith(10)
  })

  it('renders recent supporters with anonymized names and formatted metadata', async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          customer_name: 'Jane Doe',
          amount: 1500,
          created_at: '2026-04-25T10:00:00.000Z',
        },
        {
          customer_name: null,
          amount: 500,
          created_at: '2026-04-24T09:00:00.000Z',
        },
      ],
      error: null,
    })

    render(await RecentSupporters())

    expect(screen.getByRole('heading', { name: 'Recent Supporters 💙' })).toBeInTheDocument()
    expect(screen.getByText('Jane D.')).toBeInTheDocument()
    expect(screen.getByText('Anonymous Supporter')).toBeInTheDocument()
    expect(screen.getByText('$15.00')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Thank you to all our supporters! Your generosity keeps SuperTool free for everyone. 🙏'
      )
    ).toBeInTheDocument()
  })

  it('renders the placeholder when the Supabase query fails', async () => {
    mockLimit.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database unavailable' },
    })

    render(await RecentSupporters())

    expect(screen.getByText('Be the first to support SuperTool! 🚀')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recent Supporters 💙' })).not.toBeInTheDocument()
  })
})
