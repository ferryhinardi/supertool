import DonationForm from '@/components/features/support/DonationForm'
import RecentSupporters from '@/components/features/support/RecentSupporters'
import { css } from '@/styled-system/css'

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
      {/* Hero Section */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
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
          Help us keep SuperTool free and ad-free for everyone. Your donation fuels development and
          hosting costs.
        </p>
      </div>

      {/* Stats Section */}
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
            p: '6',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.400' })}>60+</div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>Free Tools</div>
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
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>Open Source</div>
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
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>Ads or Trackers</div>
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
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              Why donate?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              SuperTool is completely free with no ads. Your donations help cover hosting costs, API
              fees, and allow us to develop new features.
            </p>
          </div>

          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              Is payment secure?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              Yes! Payments are processed securely by Polar.sh using Stripe. We never see or store
              your payment information.
            </p>
          </div>

          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              What do I get?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              All tools remain free for everyone! Your donation supports the project and shows your
              appreciation. You'll receive a receipt and our gratitude.
            </p>
          </div>

          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              Can I get a refund?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              Donations are non-refundable, but we honor refund requests within 14 days. Contact us
              if you have any concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Thank You Message */}
      <div
        className={css({
          textAlign: 'center',
          maxW: '2xl',
          mx: 'auto',
          p: '8',
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
