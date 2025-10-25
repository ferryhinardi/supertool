import * as React from 'react'
import { badge } from '@/styled-system/recipes'
import { cx } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cx(badge({ variant, size }), className)} {...props} />
}

export { Badge }
