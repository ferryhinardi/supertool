/**
 * Mock for @ark-ui/react/dialog
 */
import * as React from 'react'

type AsChildProps = {
  asChild?: boolean
  children?: React.ReactNode
  className?: string
}

function mergeClassName(existingClassName: unknown, nextClassName: unknown) {
  const classes = [existingClassName, nextClassName].filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  )

  return classes.length > 0 ? classes.join(' ') : undefined
}

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & AsChildProps
>(({ asChild, children, className, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string
      children?: React.ReactNode
    }>

    return React.cloneElement(child, {
      ...props,
      className: mergeClassName(className, child.props.className),
    })
  }

  return React.createElement('button', { ...props, className, ref, type: 'button' }, children)
})

// Dialog components
export const Dialog = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: DialogTrigger,
  Backdrop: () => null,
  Positioner: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog-positioner' }, children),
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref, role: 'dialog' })
  ),
  Title: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    (props, ref) => React.createElement('h2', { ...props, ref })
  ),
  Description: React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    (props, ref) => React.createElement('p', { ...props, ref })
  ),
  CloseTrigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
}

export default Dialog
