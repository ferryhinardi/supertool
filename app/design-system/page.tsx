import { Braces, Shield, Sparkles, Wand2 } from 'lucide-react'
import type { Metadata } from 'next'
import { BrandMark } from '@/components/design-system/BrandMark'
import { Eyebrow } from '@/components/design-system/Eyebrow'
import { IconTile } from '@/components/design-system/IconTile'
import { Button } from '@/components/ui/button'
import { accents, palette } from '@/lib/design-system'
import { css } from '@/styled-system/css'

export const metadata: Metadata = {
  title: 'Design system',
  description: 'SuperTool color, type, and component foundations from the website revamp.',
  robots: { index: false, follow: false },
}

const swatches = [
  ['Canvas', palette.canvas],
  ['Sidebar', palette.sidebar],
  ['Surface', palette.surface],
  ['Raised', palette.surfaceRaised],
  ['Line', palette.line],
  ['Ink', palette.ink],
  ['Muted', palette.muted],
  ['Violet', palette.violet],
  ['Mint', palette.mint],
  ['Amber', palette.amber],
  ['Rose', palette.rose],
  ['Blue', palette.blue],
] as const

export default function DesignSystemPage() {
  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '8', md: '10' },
      })}
    >
      <header>
        <Eyebrow icon={Sparkles}>Foundations</Eyebrow>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <BrandMark />
          <h1
            className={css({
              fontFamily: 'display',
              fontSize: { base: '3xl', md: '5xl' },
              fontWeight: 'bold',
              letterSpacing: '-0.04em',
            })}
          >
            SuperTool design system
          </h1>
        </div>
        <p className={css({ mt: '4', maxW: '2xl', color: 'brand.muted', lineHeight: 'relaxed' })}>
          Tokens and components adapted from the Website Revamp. Use these on new screens instead of
          one-off colors.
        </p>
      </header>

      <section aria-labelledby="color-heading">
        <h2
          id="color-heading"
          className={css({ fontFamily: 'display', fontSize: '2xl', fontWeight: 'bold', mb: '4' })}
        >
          Color
        </h2>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: '3',
            w: 'full',
          })}
        >
          {swatches.map(([name, value]) => (
            <div
              key={name}
              className={css({
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'brand.line',
                rounded: 'xl',
                bg: 'brand.surface',
              })}
            >
              <div className={css({ h: '14' })} style={{ background: value }} />
              <div className={css({ p: '3' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>{name}</div>
                <div className={css({ fontFamily: 'mono', fontSize: 'xs', color: 'brand.dim' })}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="type-heading">
        <h2
          id="type-heading"
          className={css({ fontFamily: 'display', fontSize: '2xl', fontWeight: 'bold', mb: '4' })}
        >
          Type
        </h2>
        <div className={css({ spaceY: '3' })}>
          <p
            className={css({
              fontFamily: 'display',
              fontSize: { base: '3xl', md: '5xl' },
              fontWeight: 'bold',
              letterSpacing: '-0.045em',
              lineHeight: '1',
            })}
          >
            Manrope for headlines
          </p>
          <p className={css({ color: 'brand.muted', maxW: 'xl' })}>
            Inter carries interface copy. DM Mono is reserved for code previews and token values.
          </p>
          <p className={css({ fontFamily: 'mono', fontSize: 'sm', color: 'brand.violetBright' })}>
            {'{ "product": "SuperTool" }'}
          </p>
        </div>
      </section>

      <section aria-labelledby="component-heading">
        <h2
          id="component-heading"
          className={css({ fontFamily: 'display', fontSize: '2xl', fontWeight: 'bold', mb: '4' })}
        >
          Components
        </h2>
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '3', alignItems: 'center' })}>
          <Button>Primary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '3', mt: '6' })}>
          {(Object.keys(accents) as Array<keyof typeof accents>).map((name) => (
            <div key={name} className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <IconTile
                accent={name}
                icon={name === 'mint' ? Shield : name === 'blue' ? Wand2 : Braces}
              />
              <span className={css({ fontSize: 'sm', color: 'brand.muted' })}>{name}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
