/**
 * Mock for @ark-ui/react/field
 */
import * as React from 'react'

// Field components
export const Field = {
  Root: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'field-root' }, children),
  Label: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    (props, ref) => React.createElement('label', { ...props, ref })
  ),
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => React.createElement('input', { ...props, ref })
  ),
  Textarea: React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
  >((props, ref) => React.createElement('textarea', { ...props, ref })),
  Select: React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    (props, ref) => React.createElement('select', { ...props, ref })
  ),
  HelperText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', { 'data-testid': 'field-helper' }, children),
  ErrorText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', { 'data-testid': 'field-error', role: 'alert' }, children),
}

export default Field
