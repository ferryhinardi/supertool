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

export type ToolFamilyCategory = 'data' | 'productivity' | 'development'

interface ToolFamilyNavProps {
  category?: ToolFamilyCategory
}

function dataLinkClass(active: boolean) {
  return css({
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
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
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
  })
}

function productivityLinkClass(active: boolean) {
  return css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
    minH: '11',
    px: '3',
    rounded: 'lg',
    border: '1px solid',
    borderColor: active ? 'brand.amber' : 'brand.line',
    bg: active ? 'brand.surfaceRaised' : 'brand.surface',
    color: active ? 'brand.amber' : 'brand.muted',
    fontSize: 'sm',
    fontWeight: 'medium',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    _hover: {
      color: 'brand.ink',
      borderColor: 'orange.500',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'brand.amber',
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  })
}

function developmentLinkClass(active: boolean) {
  return css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
    minH: '11',
    px: '3',
    rounded: 'lg',
    border: '1px solid',
    borderColor: active ? 'brand.blue' : 'brand.line',
    bg: active ? 'brand.surfaceRaised' : 'brand.surface',
    color: active ? 'brand.blue' : 'brand.muted',
    fontSize: 'sm',
    fontWeight: 'medium',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    _hover: {
      color: 'brand.ink',
      borderColor: 'brand.cyan',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'brand.blue',
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  })
}

function ariaLabelFor(category: ToolFamilyCategory) {
  if (category === 'productivity') return 'Productivity tools'
  if (category === 'development') return 'Development tools'
  return 'Data processing tools'
}

function linkClassFor(category: ToolFamilyCategory) {
  if (category === 'productivity') return productivityLinkClass
  if (category === 'development') return developmentLinkClass
  return dataLinkClass
}

export function ToolFamilyNav({ category = 'data' }: ToolFamilyNavProps) {
  const pathname = usePathname()
  const familyTools = getCategoryTools(category)
  const ariaLabel = ariaLabelFor(category)
  const linkClass = linkClassFor(category)

  return (
    <nav
      aria-label={ariaLabel}
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
                if (category === 'productivity') {
                  trackToolEvent('feature_interaction', {
                    feature: 'tool_family_navigation',
                    category: 'productivity',
                    destination: toolSlug(tool.href),
                  })
                  return
                }
                if (category === 'development') {
                  trackToolEvent('feature_interaction', {
                    feature: 'tool_family_navigation',
                    category: 'development',
                    destination: toolSlug(tool.href),
                  })
                  return
                }
                trackToolEvent('feature_interaction', {
                  feature: 'data_family_nav',
                  target: toolSlug(tool.href),
                })
              }}
              className={linkClass(active)}
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
