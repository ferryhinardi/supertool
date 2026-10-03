'use client'

import { ArrowLeft, ArrowRight, Sparkles, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { IconTile } from '@/components/design-system/IconTile'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { CATEGORY_HUBS, type CategoryHubId, getCategoryTools } from '@/lib/data/category-hubs'
import { type Tool, tools } from '@/lib/data/tools'
import { accentForCategory } from '@/lib/design-system'
import { css } from '@/styled-system/css'

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  const isComingSoon = tool.comingSoon
  const accent = accentForCategory(tool.category)

  return (
    <Link
      href={isComingSoon ? '#' : tool.href}
      aria-disabled={isComingSoon || undefined}
      className={css({
        display: 'block',
        h: 'full',
        rounded: 'xl',
        pointerEvents: isComingSoon ? 'none' : 'auto',
        _focusVisible: {
          outline: '2px solid',
          outlineColor: 'brand.violetBright',
          outlineOffset: '2px',
        },
      })}
    >
      <Card
        className={css({
          h: 'full',
          border: '1px solid',
          borderColor: 'brand.line',
          bg: 'brand.surface',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          opacity: isComingSoon ? 0.6 : 1,
          _hover: {
            borderColor: 'brand.violet',
            bg: 'brand.surfaceRaised',
          },
        })}
        style={{ padding: '20px' }}
      >
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4', h: 'full' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '3',
            })}
          >
            <IconTile icon={Icon} accent={accent} />
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1' })}>
              {tool.popular ? (
                <span
                  role="img"
                  aria-label="Popular"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minW: '7',
                    minH: '7',
                    rounded: 'md',
                    bg: 'brand.surfaceRaised',
                    color: 'brand.amber',
                  })}
                >
                  <TrendingUp className={css({ h: '3.5', w: '3.5' })} aria-hidden />
                </span>
              ) : null}
              {tool.new ? (
                <span
                  role="img"
                  aria-label="New"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minW: '7',
                    minH: '7',
                    rounded: 'md',
                    bg: 'brand.surfaceRaised',
                    color: 'brand.blue',
                  })}
                >
                  <Sparkles className={css({ h: '3.5', w: '3.5' })} aria-hidden />
                </span>
              ) : null}
              {tool.premium ? (
                <span
                  role="img"
                  aria-label="Premium"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minW: '7',
                    minH: '7',
                    rounded: 'md',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.violetSoft',
                    color: 'brand.violetBright',
                  })}
                >
                  <Star className={css({ h: '3.5', w: '3.5' })} aria-hidden />
                </span>
              ) : null}
              {isComingSoon ? (
                <span
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'full',
                    bg: 'brand.surfaceRaised',
                    color: 'brand.muted',
                    fontSize: 'xs',
                    fontWeight: 'semibold',
                  })}
                >
                  Soon
                </span>
              ) : null}
            </div>
          </div>

          <div className={css({ display: 'flex', flexDirection: 'column', gap: '2', flex: '1' })}>
            <CardTitle
              className={css({
                fontSize: 'lg',
                lineHeight: 'tight',
                fontWeight: 'bold',
                color: 'brand.ink',
              })}
            >
              {tool.title}
            </CardTitle>
            <CardDescription
              className={css({
                lineClamp: 3,
                fontSize: 'sm',
                lineHeight: 'relaxed',
                color: 'brand.muted',
              })}
            >
              {tool.description}
            </CardDescription>
          </div>

          {tool.features.length > 0 ? (
            <ul
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5',
                m: '0',
                p: '0',
                listStyle: 'none',
              })}
            >
              {tool.features.slice(0, 3).map((feature) => (
                <li
                  key={feature}
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'md',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    fontSize: 'xs',
                    color: 'brand.muted',
                  })}
                >
                  {feature}
                </li>
              ))}
              {tool.features.length > 3 ? (
                <li
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'md',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    fontSize: 'xs',
                    color: 'brand.muted',
                  })}
                >
                  +{tool.features.length - 3}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}

interface CategoryToolsHubProps {
  category: CategoryHubId
}

export function CategoryToolsHub({ category }: CategoryToolsHubProps) {
  const hub = CATEGORY_HUBS[category]
  const categoryTools = getCategoryTools(hub.id)
  const displayTools = tools.filter((tool) => tool.category === hub.id)
  const accent = accentForCategory(hub.id)

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        display: 'flex',
        flexDirection: 'column',
        gap: { base: '6', sm: '8', md: '10' },
      })}
    >
      <div>
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className={css({
              minH: '11',
              color: 'brand.muted',
              _hover: { color: 'brand.ink', bg: 'brand.surface' },
            })}
          >
            <ArrowLeft className={css({ h: '4', w: '4', mr: '2' })} />
            Back to Home
          </Button>
        </Link>
      </div>

      <header className={css({ display: 'flex', alignItems: 'flex-start', gap: '4', minW: 0 })}>
        <IconTile icon={hub.icon} accent={accent} />
        <div className={css({ minW: 0 })}>
          <h1
            className={css({
              m: '0',
              fontFamily: 'display',
              fontSize: { base: '3xl', md: '4xl' },
              fontWeight: 'bold',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              color: 'brand.ink',
              textWrap: 'balance',
            })}
          >
            {hub.title}
          </h1>
          <p
            className={css({
              m: '0',
              mt: '2',
              maxW: '65ch',
              fontSize: { base: 'md', md: 'lg' },
              lineHeight: 'relaxed',
              color: 'brand.muted',
            })}
          >
            {hub.description} Browse {categoryTools.length} free tools below.
          </p>
        </div>
      </header>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: { base: '4', sm: '6' },
          w: 'full',
        })}
      >
        {displayTools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
      </div>

      <div>
        <Link href="/">
          <Button variant="outline" size="lg" className={css({ minH: '11' })}>
            Explore All Tools
            <ArrowRight className={css({ h: '4', w: '4', ml: '2' })} />
          </Button>
        </Link>
      </div>
    </main>
  )
}
