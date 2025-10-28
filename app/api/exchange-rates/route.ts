import { NextResponse } from 'next/server'

// Cache duration: 1 hour (exchange rates don't change that frequently)
const CACHE_DURATION = 3600

interface ExchangeRateAPIResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: {
    [key: string]: number
  }
}

interface FrankfurterAPIResponse {
  amount: number
  base: string
  date: string
  rates: {
    [key: string]: number
  }
}

/**
 * GET /api/exchange-rates
 *
 * Fetches real-time exchange rates for 150+ currencies
 * Uses ExchangeRate-API (primary) with Frankfurter API as fallback
 *
 * Response format:
 * {
 *   rates: { [currencyCode: string]: number },
 *   base: string,
 *   timestamp: number
 * }
 */
export async function GET() {
  try {
    // Try ExchangeRate-API first (free tier: 1,500 requests/month)
    // Using USD as base currency for consistency
    const apiKey = process.env.EXCHANGE_RATE_API_KEY

    if (apiKey) {
      try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
          next: { revalidate: CACHE_DURATION },
        })

        if (response.ok) {
          const data = (await response.json()) as ExchangeRateAPIResponse

          if (data.result === 'success') {
            return NextResponse.json(
              {
                rates: data.conversion_rates,
                base: data.base_code,
                timestamp: data.time_last_update_unix,
              },
              {
                headers: {
                  'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
                },
              }
            )
          }
        }
      } catch (error) {
        console.warn('ExchangeRate-API failed, falling back to Frankfurter:', error)
      }
    }

    // Fallback to Frankfurter API (free, no API key required, EU-based)
    const frankfurterResponse = await fetch('https://api.frankfurter.app/latest?from=USD', {
      next: { revalidate: CACHE_DURATION },
    })

    if (!frankfurterResponse.ok) {
      throw new Error('Both exchange rate APIs failed')
    }

    const frankfurterData = (await frankfurterResponse.json()) as FrankfurterAPIResponse

    // Frankfurter doesn't include the base currency in rates, so we add it
    const rates = {
      USD: 1,
      ...frankfurterData.rates,
    }

    return NextResponse.json(
      {
        rates,
        base: frankfurterData.base,
        timestamp: new Date(frankfurterData.date).getTime() / 1000,
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
        },
      }
    )
  } catch (error) {
    console.error('Error fetching exchange rates:', error)

    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 })
  }
}
