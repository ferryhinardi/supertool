import { Braces, Check, Shield, Sparkles, Star } from 'lucide-react'
import { elevation } from '@/lib/design-system'
import { css } from '@/styled-system/css'
import { IconTile } from './IconTile'

export function HeroPreview() {
  return (
    <div
      role="img"
      aria-label="Product preview"
      className={css({
        position: 'relative',
        zIndex: '2',
        minH: { base: 'auto', lg: '410px' },
        display: { base: 'none', md: 'grid' },
        placeItems: 'center',
      })}
    >
      <div
        className={css({
          position: 'absolute',
          w: '440px',
          h: '440px',
          border: '1px solid rgba(139, 108, 255, 0.08)',
          rounded: 'full',
          pointerEvents: 'none',
        })}
      />
      <div
        className={css({
          position: 'absolute',
          w: '330px',
          h: '330px',
          border: '1px solid rgba(139, 108, 255, 0.08)',
          rounded: 'full',
          pointerEvents: 'none',
        })}
      />
      <div
        className={css({
          position: 'relative',
          w: 'full',
          maxW: '500px',
          overflow: 'hidden',
          bg: '#0e1118',
          border: '1px solid #2c3140',
          rounded: '15px',
        })}
        style={{ boxShadow: elevation.window }}
      >
        <div
          className={css({
            h: '10',
            px: '3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'brand.dim',
            bg: '#141822',
            borderBottom: '1px solid',
            borderColor: 'brand.line',
            fontSize: 'xs',
          })}
        >
          <span className={css({ display: 'flex', gap: '1.5' })} aria-hidden>
            <i className={css({ w: '1.5', h: '1.5', bg: '#ef6e73', rounded: 'full' })} />
            <i className={css({ w: '1.5', h: '1.5', bg: '#e5b75f', rounded: 'full' })} />
            <i className={css({ w: '1.5', h: '1.5', bg: '#343b4b', rounded: 'full' })} />
          </span>
          <span>supertool.id / json</span>
          <Star className={css({ h: '3.5', w: '3.5' })} aria-hidden />
        </div>
        <div className={css({ p: '5' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              fontFamily: 'display',
              fontSize: 'sm',
              fontWeight: 'bold',
            })}
          >
            <IconTile icon={Braces} accent="violet" size="sm" />
            JSON Formatter
            <span
              className={css({
                ml: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                color: 'brand.mint',
                fontFamily: 'sans',
                fontSize: 'xs',
                fontWeight: 'semibold',
              })}
            >
              <Check className={css({ h: '3', w: '3' })} aria-hidden /> Valid JSON
            </span>
          </div>
          <pre
            className={css({
              mt: '4',
              p: '4',
              color: 'brand.muted',
              bg: '#090b10',
              border: '1px solid #1c202b',
              rounded: '9px',
              fontFamily: 'mono',
              fontSize: 'xs',
              lineHeight: '1.85',
              overflow: 'auto',
            })}
          >
            <span className={css({ color: '#3e4658' })}>1 </span>
            <span className={css({ color: '#b493ff' })}>{'{'}</span>
            {'\n'}
            <span className={css({ color: '#3e4658' })}>2 </span>
            <span className={css({ color: '#78b5ff' })}>&quot;product&quot;</span>
            {': '}
            <span className={css({ color: '#70dcb5' })}>&quot;SuperTool&quot;</span>
            {',\n'}
            <span className={css({ color: '#3e4658' })}>3 </span>
            <span className={css({ color: '#78b5ff' })}>&quot;fast&quot;</span>
            {': '}
            <span className={css({ color: '#b493ff' })}>true</span>
            {'\n'}
            <span className={css({ color: '#3e4658' })}>4 </span>
            <span className={css({ color: '#b493ff' })}>{'}'}</span>
          </pre>
          <div
            className={css({
              mt: '3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'brand.dim',
              fontSize: 'xs',
            })}
          >
            <span>Spaces: 2</span>
            <span
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                px: '2',
                py: '1.5',
                color: 'white',
                bg: 'brand.violetDeep',
                rounded: '6px',
                fontWeight: 'semibold',
              })}
            >
              <Sparkles className={css({ h: '3', w: '3' })} aria-hidden /> Format JSON
            </span>
          </div>
        </div>
      </div>
      <div
        className={css({
          position: 'absolute',
          left: '0',
          bottom: '10',
          display: { base: 'none', xl: 'flex' },
          alignItems: 'center',
          gap: '2',
          px: '3',
          py: '2',
          bg: 'rgba(20, 24, 34, 0.93)',
          border: '1px solid #2a3040',
          rounded: '10px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.32)',
        })}
      >
        <IconTile icon={Shield} accent="mint" size="sm" />
        <span className={css({ display: 'flex', flexDirection: 'column' })}>
          <strong className={css({ fontSize: 'xs' })}>Private</strong>
          <small className={css({ color: 'brand.dim', fontSize: 'xs' })}>
            Runs in your browser
          </small>
        </span>
      </div>
      <div
        className={css({
          position: 'absolute',
          right: '0',
          top: '16',
          display: { base: 'none', xl: 'flex' },
          alignItems: 'center',
          gap: '2',
          px: '3',
          py: '2',
          bg: 'rgba(20, 24, 34, 0.93)',
          border: '1px solid #2a3040',
          rounded: '10px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.32)',
        })}
      >
        <IconTile icon={Sparkles} accent="amber" size="sm" />
        <span className={css({ display: 'flex', flexDirection: 'column' })}>
          <strong className={css({ fontSize: 'xs' })}>Lightning fast</strong>
          <small className={css({ color: 'brand.dim', fontSize: 'xs' })}>No waiting around</small>
        </span>
      </div>
    </div>
  )
}
