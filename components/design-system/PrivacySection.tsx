import { ArrowRight, Check, Image as ImageIcon, Shield } from 'lucide-react'
import { Eyebrow } from '@/components/design-system/Eyebrow'
import { css } from '@/styled-system/css'

const points = ['No account required', 'Free, forever', 'No invasive tracking']

export function PrivacySection() {
  return (
    <section
      aria-labelledby="privacy-title"
      className={css({
        display: 'grid',
        gridTemplateColumns: { base: '1fr', lg: '0.92fr 1.08fr' },
        alignItems: 'center',
        gap: { base: '8', lg: '14' },
        p: { base: '5', md: '10' },
        backgroundImage: 'linear-gradient(135deg, #10131b, #12101d)',
        border: '1px solid',
        borderColor: 'brand.line',
        rounded: { base: '15px', md: '20px' },
      })}
    >
      <div
        role="img"
        aria-label="Local processing flow"
        className={css({
          position: 'relative',
          minH: '250px',
          px: { base: '3', md: '6' },
          py: '8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage:
            'radial-gradient(circle at center, rgba(139, 108, 255, 0.11), transparent 60%), #0b0e14',
          border: '1px solid',
          borderColor: 'brand.line',
          rounded: '13px',
        })}
      >
        <div
          className={css({
            w: '120px',
            px: '2.5',
            py: '4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1',
            textAlign: 'center',
            bg: '#121621',
            border: '1px solid #282e3d',
            rounded: '11px',
          })}
        >
          <span
            className={css({
              display: 'grid',
              placeItems: 'center',
              w: '9',
              h: '9',
              mb: '1',
              color: 'brand.muted',
              bg: '#0c0f16',
              rounded: '9px',
            })}
          >
            <ImageIcon className={css({ h: '5', w: '5' })} aria-hidden />
          </span>
          <strong className={css({ fontSize: 'xs' })}>Your file</strong>
          <small className={css({ color: 'brand.muted', fontSize: 'xs' })}>On your device</small>
        </div>
        <div
          className={css({
            w: { base: '10', md: '16' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'brand.violetBright',
          })}
          aria-hidden
        >
          <ArrowRight className={css({ h: '4', w: '4' })} />
        </div>
        <div
          className={css({
            w: '120px',
            px: '2.5',
            py: '4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1',
            textAlign: 'center',
            bg: '#121621',
            border: '1px solid #3e6f63',
            rounded: '11px',
            boxShadow: '0 0 30px rgba(78, 224, 174, 0.08)',
          })}
        >
          <span
            className={css({
              display: 'grid',
              placeItems: 'center',
              w: '9',
              h: '9',
              mb: '1',
              color: 'brand.mint',
              bg: 'rgba(78, 224, 174, 0.08)',
              rounded: '9px',
            })}
          >
            <Shield className={css({ h: '5', w: '5' })} aria-hidden />
          </span>
          <strong className={css({ fontSize: 'xs' })}>Processed locally</strong>
          <small className={css({ color: 'brand.muted', fontSize: 'xs' })}>
            Inside your browser
          </small>
        </div>
        <div
          className={css({
            position: 'absolute',
            left: '50%',
            bottom: '4',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            color: 'brand.mint',
            fontSize: 'xs',
            fontWeight: 'semibold',
            whiteSpace: 'nowrap',
          })}
        >
          <span
            className={css({
              w: '1.5',
              h: '1.5',
              bg: 'brand.mint',
              rounded: 'full',
              boxShadow: '0 0 0 4px rgba(78, 224, 174, 0.1)',
            })}
          />
          Nothing uploaded
        </div>
      </div>
      <div>
        <Eyebrow icon={Shield}>Privacy, built in</Eyebrow>
        <h2
          id="privacy-title"
          className={css({
            fontFamily: 'display',
            fontSize: { base: '3xl', md: '4xl' },
            fontWeight: 'bold',
            letterSpacing: '-0.045em',
            lineHeight: 'tight',
          })}
        >
          Your work stays yours.
        </h2>
        <p
          className={css({
            maxW: '520px',
            mt: '4',
            color: 'brand.muted',
            fontSize: 'sm',
            lineHeight: 'relaxed',
          })}
        >
          SuperTool processes your files locally whenever possible. Your sensitive data stays in the
          browser.
        </p>
        <ul
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' },
            gap: '3',
            mt: '5',
            listStyle: 'none',
            p: '0',
          })}
        >
          {points.map((point) => (
            <li
              key={point}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                color: 'brand.muted',
                fontSize: 'sm',
              })}
            >
              <span
                className={css({
                  display: 'grid',
                  placeItems: 'center',
                  w: '6',
                  h: '6',
                  color: 'brand.mint',
                  bg: 'rgba(78, 224, 174, 0.09)',
                  rounded: 'full',
                })}
              >
                <Check className={css({ h: '3.5', w: '3.5' })} aria-hidden />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
