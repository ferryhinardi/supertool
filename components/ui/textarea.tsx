import * as React from 'react'
import { textarea } from '@/styled-system/recipes'
import { cx } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return <textarea className={cx(textarea(), className)} ref={ref} {...props} />
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
