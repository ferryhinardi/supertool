import Script from 'next/script'

import DonationForm from '@/components/features/support/DonationForm'
import RecentSupporters from '@/components/features/support/RecentSupporters'
import { generateFAQSchema } from '@/lib/data/structured-data'
import { css } from '@/styled-system/css'

// Force dynamic rendering since we fetch data from Supabase at request time
export const dynamic = 'force-dynamic'

const SUPPORT_FAQS = [
  {
    question: 'Why donate?',
    answer:
      'SuperTool stays free because supporters help cover hosting, AI credits, and the work required to ship new tools every week.',
  },
  {
    question: 'Is payment secure?',
    answer:
      'Yes. Payments run through Polar and Stripe, so SuperTool never stores your card or wallet details.',
  },
  {
    question: 'What do I get?',
    answer:
      'You help fund faster improvements for the free toolkit and new premium-ready upgrades without adding ads or trackers.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'Donations are generally non-refundable, but if something went wrong contact support within 14 days and we will review it.',
  },
] as const

export default function SupportPage() {
  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '8', sm: '10', md: '12' },
      })}
    >
      <Script id="support-faq-schema" type="application/ld+json">
        {JSON.stringify(generateFAQSchema([...SUPPORT_FAQS]))}
      </Script>

      {/* Hero Section */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <p
          className={css({
            fontSize: 'sm',
            fontWeight: 'semibold',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'blue.300',
          })}
        >
          Keep SuperTool fast, private, and shipping weekly
        </p>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            color: 'white',
          })}
        >
          Support SuperTool
        </h1>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Fund hosting, AI credits, and new premium-ready tools while keeping the core toolkit free,
          ad-free, and privacy-first.
        </p>
      </div>

      {/* Benefit Section */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
          gap: { base: '4', sm: '6' },
          maxW: '4xl',
          mx: 'auto',
        })}
      >
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: { base: '4', sm: '6' },
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.400' })}>60+</div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
            Free tools shipping today
          </div>
        </div>
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: '6',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'green.400' })}>
            100%
          </div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
            Open roadmap, open source
          </div>
        </div>
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: '6',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'purple.400' })}>0</div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
            Ads, trackers, or spammy upsells
          </div>
        </div>
      </div>

      {/* Donation Form */}
      <DonationForm />

      {/* Recent Supporters */}
      <RecentSupporters />

      {/* FAQ Section */}
      <div className={css({ maxW: '3xl', mx: 'auto', spaceY: '6' })}>
        <h2
          className={css({
            fontSize: { base: '2xl', sm: '3xl' },
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
          })}
        >
          Frequently Asked Questions
        </h2>

        <div className={css({ spaceY: '4' })}>
          {SUPPORT_FAQS.map((faq) => (
            <div
              key={faq.question}
              className={css({
                bg: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'lg',
                p: { base: '4', sm: '6' },
                border: '1px solid rgba(255, 255, 255, 0.1)',
              })}
            >
              <h3
                className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
              >
                {faq.question}
              </h3>
              <p className={css({ color: 'gray.400' })}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Thank You Message */}
      <div
        className={css({
          textAlign: 'center',
          maxW: '2xl',
          mx: 'auto',
          p: { base: '5', sm: '8' },
          bg: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 'xl',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        })}
      >
        <p className={css({ fontSize: 'lg', color: 'gray.300', mb: '4' })}>
          Thank you for supporting SuperTool! Every donation, no matter the size, helps us continue
          building amazing free tools for everyone.
        </p>
        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
          Questions? Contact us at{' '}
          <a href="mailto:support@supertool.id" className={css({ color: 'blue.400' })}>
            support@supertool.id
          </a>
        </p>
      </div>
    </main>
  )
}
