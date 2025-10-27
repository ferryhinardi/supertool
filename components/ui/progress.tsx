'use client'

import { Progress as ArkProgress } from '@ark-ui/react'
import * as React from 'react'
import { cx } from '@/lib/utils'
import { css } from '@/styled-system/css'

interface ProgressProps {
  value?: number
  showPercentage?: boolean
  gradient?: boolean
  className?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, showPercentage = false, gradient = true, ...props }, ref) => (
    <div className={css({ position: 'relative' })}>
      <ArkProgress.Root value={value} ref={ref} {...props}>
        <ArkProgress.Track
          className={cx(
            css({
              position: 'relative',
              h: '2',
              w: 'full',
              overflow: 'hidden',
              rounded: 'full',
              bg: 'gray.800',
            }),
            className
          )}
        >
          <ArkProgress.Range
            className={css({
              h: 'full',
              w: 'full',
              flex: '1',
              transition: 'all 500ms ease-out',
              bgGradient: gradient ? 'to-r' : undefined,
              gradientFrom: gradient ? 'purple.500' : undefined,
              gradientVia: gradient ? 'purple.600' : undefined,
              gradientTo: gradient ? 'blue.500' : undefined,
              bg: gradient ? undefined : 'primary',
            })}
          />
        </ArkProgress.Track>
      </ArkProgress.Root>
      {showPercentage && (
        <div
          className={css({
            mt: '1',
            textAlign: 'right',
            fontFamily: 'mono',
            fontSize: 'xs',
            color: 'gray.400',
          })}
        >
          {Math.round(value || 0)}%
        </div>
      )}
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
