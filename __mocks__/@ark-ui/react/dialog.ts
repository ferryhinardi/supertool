/**
 * Mock for @ark-ui/react/dialog
 */
import * as React from 'react'

// Dialog components
export const Dialog = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
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
