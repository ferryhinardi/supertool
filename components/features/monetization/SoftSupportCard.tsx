'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface SoftSupportCardProps {
  /** Tool slug for analytics, e.g. resume-builder */
  toolId: string
  headline?: string
  body?: string
}

/**
 * Soft monetization CTA — donations/support only.
 * No hard paywall. Shown after primary tool value is delivered.
 */
export function SoftSupportCard({
  toolId,
  headline = 'Finding this useful?',
  body = 'SuperTool stays free and private in your browser. If it saved you time, a small tip keeps the lights on.',
}: SoftSupportCardProps) {
  useEffect(() => {
    trackToolEvent('support_cta_view', { tool_id: toolId, placement: 'soft_support_card' })
  }, [toolId])

  return (
    <section
      aria-label="Support SuperTool"
      className={css({
        mt: { base: '6', md: '8' },
        p: { base: '4', sm: '5' },
        rounded: 'xl',
        border: '1px solid',
        borderColor: 'gray.700',
        bg: 'gray.900/60',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: '4',
        })}
      >
        <div className={css({ spaceY: '1', minW: '0' })}>
          <p className={css({ fontSize: 'md', fontWeight: 'semibold', color: 'gray.100' })}>
            {headline}
          </p>
          <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
            {body}
          </p>
        </div>
        <Link
          href="/support"
          onClick={() =>
            trackToolEvent('support_cta_click', { tool_id: toolId, placement: 'soft_support_card' })
          }
          className={css({ flexShrink: 0 })}
        >
          <Button
            variant="outline"
            className={css({
              minH: '44px',
              borderColor: 'pink.500/40',
              color: 'pink.200',
              _hover: { bg: 'pink.500/10', borderColor: 'pink.400/60' },
            })}
          >
            <Heart className={css({ h: '4', w: '4', mr: '2' })} />
            Support Us
          </Button>
        </Link>
      </div>
    </section>
  )
}
