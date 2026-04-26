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

interface AggregateUsageRow {
  sum_quantity: number | string | null
}

interface ActiveSubscriptionRow {
  id: string
}

const ANONYMOUS_DAILY_LIMIT = 3
const ANONYMOUS_METRIC_TABLE = 'ai_anonymous'
const ANONYMOUS_WINDOW_MINUTES = 1440

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

const failClosed = (): PremiumAccessResult => ({
  allowed: false,
  reason: 'quota-exceeded',
  remaining: 0,
})

export async function checkPremiumAccess({
  userId,
  metricName,
  freeQuotaPerDay,
  ipAddress,
}: CheckPremiumAccessParams): Promise<PremiumAccessResult> {
  try {
    const supabase = getSupabaseServer()

    if (!userId) {
      if (!ipAddress) {
        return {
          allowed: false,
          reason: 'anonymous-blocked',
          remaining: 0,
        }
      }

      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_ip_address: ipAddress,
        p_max_requests: ANONYMOUS_DAILY_LIMIT,
        p_table_name: ANONYMOUS_METRIC_TABLE,
        p_time_window_minutes: ANONYMOUS_WINDOW_MINUTES,
      })

      if (error) {
        console.error('Failed to check premium access:', error)
        return failClosed()
      }

      if (!data) {
        return {
          allowed: false,
          reason: 'anonymous-blocked',
          remaining: 0,
        }
      }

      return {
        allowed: true,
        reason: 'within-quota',
        remaining: ANONYMOUS_DAILY_LIMIT - 1,
      }
    }

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

    const { periodStart } = getTodayPeriod()
    const { data: usageRows, error: usageError } = await supabase
      .from('usage_records')
      .select('sum_quantity:quantity.sum()')
      .eq('user_id', userId)
      .eq('metric_name', metricName)
      .gte('period_start', periodStart.toISOString())

    if (usageError) {
      console.error('Failed to check premium access:', usageError)
      return failClosed()
    }

    const usageAggregate = ((usageRows ?? []) as AggregateUsageRow[])[0]
    const usedQuantity = normalizeQuantity(usageAggregate?.sum_quantity)
    const remaining = Math.max(0, freeQuotaPerDay - usedQuantity)

    if (usedQuantity < freeQuotaPerDay) {
      return {
        allowed: true,
        reason: 'within-quota',
        remaining,
      }
    }

    return {
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    }
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
