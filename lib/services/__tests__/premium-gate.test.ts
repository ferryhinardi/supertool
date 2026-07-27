import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockFrom = vi.fn()
const mockRpc = vi.fn()
const mockGetSupabaseServer = vi.fn()

vi.mock('@/lib/auth/supabaseServer', () => ({
  getSupabaseServer: mockGetSupabaseServer,
}))

function createSubscriptionQueryResult(data: unknown, error: unknown = null) {
  const limit = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn().mockReturnValue({ limit })
  const select = vi.fn().mockReturnValue({ eq })

  return {
    select,
    eq,
    limit,
  }
}

function createInsertResult(error: unknown = null) {
  const insert = vi.fn().mockResolvedValue({ error })

  return {
    insert,
  }
}

describe('premium-gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    mockGetSupabaseServer.mockReturnValue({
      from: mockFrom,
      rpc: mockRpc,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('allows access for an active subscription without reserving free quota', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([{ id: 'sub-1' }])
    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-1',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: true,
      reason: 'subscription',
      remaining: Number.POSITIVE_INFINITY,
    })
    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('active_subscriptions')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('allows authenticated non-subscribers within quota using reservation RPC', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })
    mockRpc.mockResolvedValue({
      data: [{ allowed: true, reason: 'within-quota', remaining: 3 }],
      error: null,
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-2',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: true,
      reason: 'within-quota',
      remaining: 3,
    })
    expect(mockRpc).toHaveBeenCalledWith(
      'reserve_premium_usage',
      expect.objectContaining({
        p_anonymous_id: null,
        p_free_quota_per_day: 5,
        p_metric_name: 'ai_text_rewriter',
        p_period_end: expect.stringMatching(/T23:59:59\.999Z$/),
        p_period_start: expect.stringMatching(/T00:00:00\.000Z$/),
        p_user_id: 'user-2',
      })
    )
  })

  it('blocks authenticated non-subscribers when reservation RPC denies access', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })
    mockRpc.mockResolvedValue({
      data: [{ allowed: false, reason: 'quota-exceeded', remaining: 0 }],
      error: null,
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-3',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })
  })

  it('allows anonymous access with trusted identifier using reservation RPC', async () => {
    mockRpc.mockResolvedValue({
      data: [{ allowed: true, reason: 'within-quota', remaining: 2 }],
      error: null,
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
      ipAddress: '127.0.0.1',
    })

    expect(result).toEqual({
      allowed: true,
      reason: 'within-quota',
      remaining: 2,
    })
    expect(mockRpc).toHaveBeenCalledWith(
      'reserve_premium_usage',
      expect.objectContaining({
        p_anonymous_id: '127.0.0.1',
        p_free_quota_per_day: 3,
        p_metric_name: 'ai_text_rewriter',
        p_period_end: expect.stringMatching(/T23:59:59\.999Z$/),
        p_period_start: expect.stringMatching(/T00:00:00\.000Z$/),
        p_user_id: null,
      })
    )
  })

  it('blocks anonymous access when no identifier is provided', async () => {
    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'anonymous-blocked',
      remaining: 0,
    })
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('fails closed when the reservation RPC returns an error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockRpc.mockResolvedValue({ data: null, error: new Error('rpc failed') })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
      ipAddress: '127.0.0.1',
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })
    expect(consoleError).toHaveBeenCalledWith('Failed to reserve premium usage:', expect.any(Error))
  })

  it('fails closed when the active subscription query returns an error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const activeSubscriptionQuery = createSubscriptionQueryResult(
      [],
      new Error('subscription failed')
    )

    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-subscription-error',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })
    expect(consoleError).toHaveBeenCalledWith('Failed to check premium access:', expect.any(Error))
  })

  it('fails closed when the reservation RPC returns malformed data', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })
    mockRpc.mockResolvedValue({
      data: [{ allowed: 'yes', reason: 'within-quota', remaining: 4 }],
      error: null,
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-invalid-reservation',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })
  })

  it('fails closed when the reservation RPC returns an empty result set', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })
    mockRpc.mockResolvedValue({ data: [], error: null })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-empty-reservation',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })
  })

  it('accepts a single-object reservation payload for forward compatibility', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      throw new Error(`Unexpected table: ${table}`)
    })
    mockRpc.mockResolvedValue({
      data: { allowed: true, reason: 'within-quota', remaining: 1 },
      error: null,
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-object-reservation',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: true,
      reason: 'within-quota',
      remaining: 1,
    })
  })

  it('fails closed and logs when Supabase access throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockGetSupabaseServer.mockImplementation(() => {
      throw new Error('supabase unavailable')
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-4',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })
    expect(consoleError).toHaveBeenCalledWith('Failed to check premium access:', expect.any(Error))
  })

  it('records usage for the current day period', async () => {
    const insertQuery = createInsertResult()
    mockFrom.mockImplementation((table: string) => {
      if (table === 'usage_records') return insertQuery
      throw new Error(`Unexpected table: ${table}`)
    })

    const { recordUsage } = await import('../premium-gate')

    const result = await recordUsage({
      userId: 'user-5',
      metricName: 'ai_text_rewriter',
      quantity: 1,
    })

    expect(result).toBe(true)
    expect(insertQuery.insert).toHaveBeenCalledTimes(1)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-5',
        subscription_id: null,
        metric_name: 'ai_text_rewriter',
        quantity: 1,
        reported_to_polar: false,
        metadata: {},
      })
    )

    const insertedRecord = insertQuery.insert.mock.calls[0]?.[0]
    expect(insertedRecord.period_start).toMatch(/T00:00:00.000Z$/)
    expect(insertedRecord.period_end).toMatch(/T23:59:59.999Z$/)
  })

  it('returns false and logs when usage record insertion fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const insertQuery = createInsertResult(new Error('insert failed'))

    mockFrom.mockImplementation((table: string) => {
      if (table === 'usage_records') return insertQuery
      throw new Error(`Unexpected table: ${table}`)
    })

    const { recordUsage } = await import('../premium-gate')

    const result = await recordUsage({
      userId: 'user-6',
      metricName: 'ai_text_rewriter',
      quantity: 2,
    })

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith('Failed to record premium usage:', expect.any(Error))
  })

  it('returns false and logs when Supabase usage recording throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockGetSupabaseServer.mockImplementation(() => {
      throw new Error('record unavailable')
    })

    const { recordUsage } = await import('../premium-gate')

    const result = await recordUsage({
      userId: 'user-7',
      metricName: 'ai_text_rewriter',
      quantity: 1,
    })

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith('Failed to record premium usage:', expect.any(Error))
  })
})
