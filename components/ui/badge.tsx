import { ark } from '@ark-ui/react'
import * as React from 'react'
import { cx } from '@/lib/utils'
import { badge } from '@/styled-system/recipes'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? ark.span : 'span'
    return (
      <Comp
        ref={ref}
        className={cx(badge({ variant, size }), className)}
        role="status"
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
