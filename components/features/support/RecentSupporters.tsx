import { getSupabaseServer } from '@/lib/auth/supabaseServer'
import { formatAmount } from '@/lib/data/donation-tiers'
import { anonymizeName, formatRelativeTime } from '@/lib/utils/privacy'
import { css } from '@/styled-system/css'

interface Supporter {
  customer_name: string | null
  amount: number
  created_at: string
}

/**
 * Recent Supporters Component
 * Displays the last 10 supporters to build social proof
 * Server component - fetches data from Supabase
 */
export default async function RecentSupporters() {
  const supabase = getSupabaseServer()

  // Fetch last 10 successful donations
  const { data: supporters, error } = await supabase
    .from('orders')
    .select('customer_name, amount, created_at')
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
    .limit(10)

  // If error or no supporters, show placeholder
  if (error || !supporters || supporters.length === 0) {
    return (
      <div
        className={css({
          maxW: '4xl',
          mx: 'auto',
          textAlign: 'center',
          p: '8',
          bg: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'xl',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        })}
      >
        <p className={css({ color: 'gray.400', fontSize: 'lg' })}>
          Be the first to support SuperTool! 🚀
        </p>
      </div>
    )
  }

  return (
    <div className={css({ maxW: '4xl', mx: 'auto', spaceY: '6' })}>
      <h2
        className={css({
          fontSize: { base: '2xl', sm: '3xl' },
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'white',
        })}
      >
        Recent Supporters 💙
      </h2>

      <div
        className={css({
          bg: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'xl',
          p: { base: '4', sm: '6' },
          border: '1px solid rgba(255, 255, 255, 0.1)',
        })}
      >
        <div className={css({ spaceY: '3' })}>
          {(supporters as Supporter[]).map((supporter, index) => (
            <div
              key={`${supporter.created_at}-${index}`}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '4',
                bg: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 'lg',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'rgba(0, 0, 0, 0.3)',
                },
              })}
            >
              {/* Left: Supporter info */}
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                {/* Avatar */}
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    bg: 'blue.500',
                    borderRadius: 'full',
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    color: 'white',
                    flexShrink: 0,
                  })}
                >
                  {(supporter.customer_name || 'A')[0].toUpperCase()}
                </div>

                {/* Name and time */}
                <div>
                  <div
                    className={css({
                      fontSize: { base: 'sm', sm: 'base' },
                      fontWeight: 'semibold',
                      color: 'white',
                    })}
                  >
                    {anonymizeName(supporter.customer_name)}
                  </div>
                  <div
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.400',
                    })}
                  >
                    {formatRelativeTime(supporter.created_at)}
                  </div>
                </div>
              </div>

              {/* Right: Amount */}
              <div
                className={css({
                  fontSize: { base: 'base', sm: 'lg' },
                  fontWeight: 'bold',
                  color: 'green.400',
                  flexShrink: 0,
                })}
              >
                {formatAmount(supporter.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Thank you message */}
        <div
          className={css({
            mt: '6',
            pt: '6',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          })}
        >
          <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
            Thank you to all our supporters! Your generosity keeps SuperTool free for everyone. 🙏
          </p>
        </div>
      </div>
    </div>
  )
}
