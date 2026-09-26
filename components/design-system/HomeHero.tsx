'use client'

import { ArrowRight, Command, Search, Sparkles, X } from 'lucide-react'
import type React from 'react'
import { Eyebrow } from '@/components/design-system/Eyebrow'
import { HeroPreview } from '@/components/design-system/HeroPreview'
import { Field, FieldInput } from '@/components/ui/field'
import { elevation } from '@/lib/design-system'
import { css } from '@/styled-system/css'

const examples = [
  { label: 'JSON formatter', query: 'JSON' },
  { label: 'password', query: 'password' },
  { label: 'image tools', query: 'image' },
]

interface HomeHeroProps {
  toolCount: number
  searchQuery: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onBrowse: () => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
}

export function HomeHero({
  toolCount,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onBrowse,
  searchInputRef,
}: HomeHeroProps) {
  return (
    <section
      className={css({
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: { base: '1fr', lg: '0.92fr 1.08fr' },
        alignItems: 'center',
        gap: { base: '6', lg: '10' },
        overflow: 'hidden',
      })}
    >
      <div
        aria-hidden
        className={css({
          pointerEvents: 'none',
          position: 'absolute',
          right: '-140px',
          top: '-180px',
          w: '620px',
          h: '620px',
          backgroundImage: 'radial-gradient(circle, rgba(112, 80, 245, 0.16), transparent 66%)',
        })}
      />
      <div className={css({ position: 'relative', zIndex: '2', py: { base: '2', lg: '8' } })}>
        <Eyebrow icon={Sparkles}>{toolCount} tools. Zero friction.</Eyebrow>
        <h1
          className={css({
            maxW: '600px',
            fontFamily: 'display',
            fontSize: { base: '4xl', sm: '5xl', lg: '6xl' },
            fontWeight: 'bold',
            lineHeight: '1',
            letterSpacing: '-0.055em',
          })}
        >
          <span className="sr-only">SuperTool. </span>
          Your everyday tools,
          <span className={css({ color: 'brand.violetBright' })}> thoughtfully reimagined.</span>
        </h1>
        <p
          className={css({
            maxW: '510px',
            mt: '6',
            color: 'brand.muted',
            fontSize: { base: 'sm', md: 'base' },
            lineHeight: 'relaxed',
          })}
        >
          A fast, private toolkit for developers and creators. No sign-up, no noise — just the right
          tool when you need it.
        </p>
        <Field>
          <div
            className={css({
              position: 'relative',
              maxW: '520px',
              mt: '6',
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              h: '14',
              pl: '4',
              pr: '2',
              color: 'brand.violetBright',
              bg: 'brand.surface',
              border: '1px solid #393055',
              rounded: '12px',
            })}
            style={{ boxShadow: elevation.search }}
          >
            <Search className={css({ h: '5', w: '5', flexShrink: 0 })} aria-hidden />
            <FieldInput
              ref={searchInputRef}
              type="search"
              placeholder="What do you need to do?"
              value={searchQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSearchChange(event.target.value)
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') onBrowse()
              }}
              className={css({
                h: 'full',
                flex: '1',
                minW: '0',
                border: '0',
                bg: 'transparent',
                color: 'brand.ink',
                fontSize: 'sm',
                shadow: 'none',
                px: '0',
                _placeholder: { color: '#7f8799' },
                _focus: { ring: '0', outline: 'none' },
              })}
              autoComplete="off"
              spellCheck="false"
              aria-label="Search tools"
              aria-describedby="search-hint"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear search"
                className={css({
                  display: 'grid',
                  placeItems: 'center',
                  minW: '11',
                  minH: '11',
                  color: 'brand.muted',
                  rounded: '9px',
                  _hover: { color: 'white', bg: 'brand.surfaceRaised' },
                })}
              >
                <X className={css({ h: '4', w: '4' })} />
              </button>
            ) : (
              <span
                id="search-hint"
                className={css({
                  display: { base: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: '1',
                  px: '1.5',
                  py: '1',
                  color: 'brand.dim',
                  bg: 'brand.sidebar',
                  border: '1px solid',
                  borderColor: 'brand.line',
                  rounded: '5px',
                  fontSize: 'xs',
                })}
              >
                <Command className={css({ h: '3', w: '3' })} aria-hidden />K
              </span>
            )}
            <button
              type="button"
              onClick={onBrowse}
              aria-label="Submit search"
              className={css({
                display: 'grid',
                placeItems: 'center',
                minW: '11',
                minH: '11',
                color: 'white',
                bg: 'brand.violet',
                border: '0',
                rounded: '9px',
                cursor: 'pointer',
              })}
            >
              <ArrowRight className={css({ h: '4', w: '4' })} />
            </button>
          </div>
        </Field>
        <div
          className={css({
            maxW: '520px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1',
            mt: '2',
            color: '#7f8799',
            fontSize: 'xs',
          })}
        >
          <span>Try</span>
          {examples.map((example) => (
            <button
              key={example.query}
              type="button"
              onClick={() => onSearchChange(example.query)}
              className={css({
                minH: '11',
                px: '2',
                color: '#aeb5c4',
                bg: 'transparent',
                textDecoration: 'underline',
                textDecorationColor: '#3b4150',
                textUnderlineOffset: '3px',
                cursor: 'pointer',
              })}
            >
              {example.label}
            </button>
          ))}
        </div>
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '5',
            mt: '4',
          })}
        >
          <button
            type="button"
            onClick={onBrowse}
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2',
              minH: '11',
              px: '1',
              color: 'brand.violetBright',
              bg: 'transparent',
              fontSize: 'sm',
              fontWeight: 'bold',
              cursor: 'pointer',
            })}
          >
            Browse all {toolCount} tools
            <ArrowRight className={css({ h: '4', w: '4' })} aria-hidden />
          </button>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              color: 'brand.muted',
              fontSize: 'xs',
            })}
          >
            <span className={css({ display: 'flex' })} aria-hidden>
              <i
                className={css({
                  display: 'grid',
                  placeItems: 'center',
                  w: '6',
                  h: '6',
                  color: 'brand.ink',
                  bg: '#3546a3',
                  border: '2px solid',
                  borderColor: 'brand.canvas',
                  rounded: 'full',
                  fontStyle: 'normal',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                })}
              >
                AD
              </i>
              <i
                className={css({
                  display: 'grid',
                  placeItems: 'center',
                  w: '6',
                  h: '6',
                  ml: '-1.5',
                  color: 'brand.ink',
                  bg: '#854764',
                  border: '2px solid',
                  borderColor: 'brand.canvas',
                  rounded: 'full',
                  fontStyle: 'normal',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                })}
              >
                MK
              </i>
            </span>
            <span>Loved by makers who want tools without the noise</span>
          </div>
        </div>
      </div>
      <HeroPreview />
    </section>
  )
}
