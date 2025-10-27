'use client'

import { Tooltip as ArkTooltip } from '@ark-ui/react'
import * as React from 'react'
import { cx } from '@/lib/utils'
import { css } from '@/styled-system/css'

const TooltipProvider = ArkTooltip.Root
const Tooltip = ArkTooltip.Root
const TooltipTrigger = ArkTooltip.Trigger

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <ArkTooltip.Positioner>
      <ArkTooltip.Content
        ref={ref}
        className={cx(
          css({
            zIndex: '50',
            overflow: 'hidden',
            rounded: 'md',
            bg: 'gray.900',
            px: '3',
            py: '1.5',
            fontSize: 'xs',
            color: 'white',
            border: '1px solid',
            borderColor: 'gray.800',
            shadow: 'lg',
            animation: 'fadeIn 150ms, scaleIn 150ms',
          }),
          className
        )}
        {...props}
      />
    </ArkTooltip.Positioner>
  )
)
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
