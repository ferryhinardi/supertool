import * as React from 'react'
import { ark } from '@ark-ui/react'
import { input } from '@/styled-system/recipes'
import { cx } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<'input'> {
  asChild?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, asChild = false, ...props }, ref) => {
    const Comp = asChild ? ark.input : 'input'
    return <Comp type={type} className={cx(input(), className)} ref={ref} {...props} />
  }
)
Input.displayName = 'Input'

export { Input }
