import { getSupabaseServer } from '@/lib/auth/supabaseServer'

type PremiumAccessReason = 'subscription' | 'within-quota' | 'quota-exceeded' | 'anonymous-blocked'

interface CheckPremiumAccessParams {
  userId?: string
  metricName: string
  freeQuotaPerDay: number
  ipAddress?: string
}

interface RecordUsageParams {
  userId: string
  metricName: string
  quantity: number
}

interface PremiumAccessResult {
  allowed: boolean
  reason: PremiumAccessReason
  remaining: number
}

interface ActiveSubscriptionRow {
  id: string
}

interface ReservedUsageRow {
  allowed?: boolean
  reason?: PremiumAccessReason | string | null
  remaining?: number | string | null
}

const ANONYMOUS_DAILY_LIMIT = 3

const getTodayPeriod = () => {
  const now = new Date()
  const periodStart = new Date(now)
  periodStart.setUTCHours(0, 0, 0, 0)

  const periodEnd = new Date(now)
  periodEnd.setUTCHours(23, 59, 59, 999)

  return {
    periodStart,
    periodEnd,
  }
}

const normalizeQuantity = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const isPremiumAccessReason = (value: string | null | undefined): value is PremiumAccessReason => {
  return (
    value === 'subscription' ||
    value === 'within-quota' ||
    value === 'quota-exceeded' ||
    value === 'anonymous-blocked'
  )
}

const failClosed = (): PremiumAccessResult => ({
  allowed: false,
  reason: 'quota-exceeded',
  remaining: 0,
})

const reserveQuota = async ({
  userId,
  metricName,
  freeQuotaPerDay,
  anonymousId,
}: {
  userId?: string
  metricName: string
  freeQuotaPerDay: number
  anonymousId?: string
}): Promise<PremiumAccessResult> => {
  const supabase = getSupabaseServer()
  const { periodStart, periodEnd } = getTodayPeriod()
  const { data, error } = await supabase.rpc('reserve_premium_usage', {
    p_anonymous_id: anonymousId ?? null,
    p_free_quota_per_day: freeQuotaPerDay,
    p_metric_name: metricName,
    p_period_end: periodEnd.toISOString(),
    p_period_start: periodStart.toISOString(),
    p_user_id: userId ?? null,
  })

  if (error) {
    console.error('Failed to reserve premium usage:', error)
    return failClosed()
  }

  // The RPC function RETURNS TABLE, so PostgREST yields an array of rows;
  // tolerate a bare object as well for forward compatibility.
  const reservation = ((Array.isArray(data) ? data[0] : data) ?? {}) as ReservedUsageRow

  if (typeof reservation.allowed !== 'boolean') {
    return failClosed()
  }

  const reason = isPremiumAccessReason(reservation.reason) ? reservation.reason : 'quota-exceeded'

  return {
    allowed: reservation.allowed,
    reason,
    remaining: Math.max(0, normalizeQuantity(reservation.remaining)),
  }
}

export async function checkPremiumAccess({
  userId,
  metricName,
  freeQuotaPerDay,
  ipAddress,
}: CheckPremiumAccessParams): Promise<PremiumAccessResult> {
  try {
    if (!userId) {
      if (!ipAddress || ipAddress === 'unknown') {
        return {
          allowed: false,
          reason: 'anonymous-blocked',
          remaining: 0,
        }
      }

      return await reserveQuota({
        metricName,
        freeQuotaPerDay: ANONYMOUS_DAILY_LIMIT,
        anonymousId: ipAddress,
      })
    }

    const supabase = getSupabaseServer()
    const { data: subscriptionRows, error: subscriptionError } = await supabase
      .from('active_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (subscriptionError) {
      console.error('Failed to check premium access:', subscriptionError)
      return failClosed()
    }

    const activeSubscriptions = (subscriptionRows ?? []) as ActiveSubscriptionRow[]

    if (activeSubscriptions.length > 0) {
      return {
        allowed: true,
        reason: 'subscription',
        remaining: Number.POSITIVE_INFINITY,
      }
    }

    return await reserveQuota({
      userId,
      metricName,
      freeQuotaPerDay,
    })
  } catch (error) {
    console.error('Failed to check premium access:', error)
    return failClosed()
  }
}

export async function recordUsage({
  userId,
  metricName,
  quantity,
}: RecordUsageParams): Promise<boolean> {
  try {
    const supabase = getSupabaseServer()
    const { periodStart, periodEnd } = getTodayPeriod()
    const { error } = await supabase.from('usage_records').insert({
      user_id: userId,
      subscription_id: null,
      metric_name: metricName,
      quantity,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      reported_to_polar: false,
      metadata: {},
    })

    if (error) {
      console.error('Failed to record premium usage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to record premium usage:', error)
    return false
  }
}
