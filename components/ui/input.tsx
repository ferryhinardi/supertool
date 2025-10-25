import * as React from 'react'
import { input } from '@/styled-system/recipes'
import { cx } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={cx(input(), className)} ref={ref} {...props} />
  }
)
Input.displayName = 'Input'

export { Input }
