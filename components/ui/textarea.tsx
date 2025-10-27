import * as React from 'react'
import { cx } from '@/lib/utils'
import { textarea } from '@/styled-system/recipes'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return <textarea className={cx(textarea(), className)} ref={ref} {...props} />
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
