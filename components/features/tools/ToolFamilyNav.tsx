'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCategoryTools } from '@/lib/data/category-hubs'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

function toolSlug(href: string): string {
  const parts = href.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? 'tool'
}

export function ToolFamilyNav() {
  const pathname = usePathname()
  const familyTools = getCategoryTools('data')

  return (
    <nav
      aria-label="Data processing tools"
      className={css({
        bg: 'brand.canvas',
        borderBottom: '1px solid',
        borderColor: 'brand.line',
      })}
    >
      <div
        className={css({
          display: 'flex',
          gap: '2',
          overflowX: 'auto',
          px: { base: '3', sm: '4', md: '6' },
          py: '2',
          scrollBehavior: 'smooth',
          '@media (prefers-reduced-motion: reduce)': {
            scrollBehavior: 'auto',
          },
        })}
      >
        {familyTools.map((tool) => {
          const active = pathname === tool.href
          const Icon = tool.icon
          return (
            <Link
              key={tool.href}
              href={tool.href}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                trackToolEvent('feature_interaction', {
                  feature: 'data_family_nav',
                  target: toolSlug(tool.href),
                })
              }}
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2',
                flexShrink: 0,
                minH: '11',
                px: '3',
                rounded: 'lg',
                border: '1px solid',
                borderColor: active ? 'brand.violet' : 'brand.line',
                bg: active ? 'brand.violetSoft' : 'brand.surface',
                color: active ? 'brand.violetBright' : 'brand.muted',
                fontSize: 'sm',
                fontWeight: 'medium',
                whiteSpace: 'nowrap',
                transition:
                  'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                _hover: {
                  color: 'brand.ink',
                  borderColor: 'brand.violet',
                },
                _focusVisible: {
                  outline: '2px solid',
                  outlineColor: 'brand.violetBright',
                  outlineOffset: '2px',
                },
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              })}
            >
              <Icon className={css({ h: '4', w: '4' })} aria-hidden />
              {tool.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
