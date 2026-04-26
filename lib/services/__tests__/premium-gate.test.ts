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

function createUsageQueryResult(sum: number | string | null, error: unknown = null) {
  const gte = vi.fn().mockResolvedValue({ data: [{ sum_quantity: sum }], error })
  const eqMetric = vi.fn().mockReturnValue({ gte })
  const eqUser = vi.fn().mockReturnValue({ eq: eqMetric })
  const select = vi.fn().mockReturnValue({ eq: eqUser })

  return {
    select,
    eqUser,
    eqMetric,
    gte,
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

  it('allows access for an active subscription without checking usage quota', async () => {
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
      remaining: expect.any(Number),
    })
    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('active_subscriptions')
  })

  it('allows access within quota and returns remaining free usage', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    const usageQuery = createUsageQueryResult(2)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      if (table === 'usage_records') return usageQuery
      throw new Error(`Unexpected table: ${table}`)
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
  })

  it('blocks access when the free quota is exceeded', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    const usageQuery = createUsageQueryResult('5')

    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      if (table === 'usage_records') return usageQuery
      throw new Error(`Unexpected table: ${table}`)
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

  it('allows anonymous access when the rate-limit RPC returns true', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })

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
    expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
      p_ip_address: '127.0.0.1',
      p_max_requests: 3,
      p_table_name: 'ai_anonymous',
      p_time_window_minutes: 1440,
    })
  })

  it('blocks anonymous access when the rate-limit RPC returns false', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
      ipAddress: '127.0.0.1',
    })

    expect(result).toEqual({
      allowed: false,
      reason: 'anonymous-blocked',
      remaining: 0,
    })
  })

  it('blocks anonymous access when no ip address is provided', async () => {
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

  it('fails closed when the anonymous rate-limit RPC returns an error', async () => {
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
    expect(consoleError).toHaveBeenCalledWith('Failed to check premium access:', expect.any(Error))
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

  it('fails closed when the usage query returns an error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    const usageQuery = createUsageQueryResult(null, new Error('usage failed'))

    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      if (table === 'usage_records') return usageQuery
      throw new Error(`Unexpected table: ${table}`)
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-usage-error',
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

  it('treats invalid usage aggregates as zero and allows access', async () => {
    const activeSubscriptionQuery = createSubscriptionQueryResult([])
    const usageQuery = createUsageQueryResult('not-a-number')

    mockFrom.mockImplementation((table: string) => {
      if (table === 'active_subscriptions') return activeSubscriptionQuery
      if (table === 'usage_records') return usageQuery
      throw new Error(`Unexpected table: ${table}`)
    })

    const { checkPremiumAccess } = await import('../premium-gate')

    const result = await checkPremiumAccess({
      userId: 'user-invalid-aggregate',
      metricName: 'ai_text_rewriter',
      freeQuotaPerDay: 5,
    })

    expect(result).toEqual({
      allowed: true,
      reason: 'within-quota',
      remaining: 5,
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

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
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
