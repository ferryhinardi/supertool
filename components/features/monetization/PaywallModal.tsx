'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

type PaywallReason = 'quota-exceeded' | 'anonymous-blocked'

export interface PaywallModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  reason: PaywallReason
  toolSlug: string
  remaining?: number
}

const actionButtonClassName = css({
  minH: '11',
  minW: '11',
  w: { base: 'full', sm: 'auto' },
})

const minimumTouchTargetStyle = {
  minHeight: '44px',
  minWidth: '44px',
} as const

const titleByReason: Record<PaywallReason, string> = {
  'anonymous-blocked': 'Support SuperTool for more anonymous usage',
  'quota-exceeded': 'You reached today’s free quota',
}

function getDescription(reason: PaywallReason, remaining?: number): string {
  if (reason === 'anonymous-blocked') {
    return 'Anonymous usage is limited. Support SuperTool to keep using this tool with a smoother experience.'
  }

  if (typeof remaining === 'number') {
    return `You've used today's free quota for this tool. Remaining free uses: ${remaining}. Support SuperTool to keep going anytime.`
  }

  return 'You’ve used today’s free quota for this tool. Support SuperTool to keep going anytime.'
}

export function PaywallModal({
  open,
  onOpenChange,
  reason,
  toolSlug,
  remaining,
}: PaywallModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!open) {
      return
    }

    const params: Record<string, string | number> = {
      reason,
      tool_slug: toolSlug,
    }

    if (typeof remaining === 'number') {
      params.remaining = remaining
    }

    trackToolEvent('paywall_shown', params)
  }, [open, reason, remaining, toolSlug])

  const handleDismiss = () => {
    trackToolEvent('paywall_dismissed', {
      reason,
      tool_slug: toolSlug,
    })
    onOpenChange(false)
  }

  const handleUpgrade = () => {
    trackToolEvent('upgrade_clicked', {
      reason,
      tool_slug: toolSlug,
    })
    onOpenChange(false)
    router.push('/support')
  }

  return (
    <Dialog open={open} onOpenChange={(details) => !details.open && onOpenChange(false)}>
      <DialogContent
        className={css({
          w: { base: '11/12', sm: 'lg' },
          maxW: 'xl',
          borderColor: 'white/10',
          bg: 'rgba(10, 15, 30, 0.92)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(20px)',
          color: 'white',
        })}
      >
        <DialogHeader>
          <DialogTitle
            className={css({
              pr: '10',
              fontSize: { base: 'xl', sm: '2xl' },
              fontWeight: 'semibold',
              lineHeight: 'tight',
            })}
          >
            {titleByReason[reason]}
          </DialogTitle>
          <DialogDescription
            className={css({
              mt: '3',
              color: 'rgba(255, 255, 255, 0.72)',
              fontSize: { base: 'sm', sm: 'md' },
              lineHeight: 'relaxed',
            })}
          >
            {getDescription(reason, remaining)}
          </DialogDescription>
        </DialogHeader>

        <div
          className={css({
            mt: '6',
            rounded: 'xl',
            borderWidth: '1px',
            borderColor: 'white/10',
            bg: 'rgba(255, 255, 255, 0.04)',
            p: { base: '4', sm: '5' },
          })}
        >
          <p
            className={css({
              fontSize: 'sm',
              lineHeight: 'relaxed',
              color: 'rgba(255, 255, 255, 0.8)',
            })}
          >
            Supporting SuperTool helps keep advanced tools available, unlocks higher limits, and
            funds continued improvements without sharing any personal data in analytics.
          </p>
        </div>

        <DialogFooter
          className={css({
            mt: '8',
            display: 'flex',
            flexDirection: { base: 'column-reverse', sm: 'row' },
            gap: '3',
            justifyContent: 'flex-end',
          })}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={handleDismiss}
            className={actionButtonClassName}
            style={minimumTouchTargetStyle}
          >
            Maybe later
          </Button>
          <Button
            type="button"
            onClick={handleUpgrade}
            className={actionButtonClassName}
            style={minimumTouchTargetStyle}
          >
            Upgrade / Support
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
