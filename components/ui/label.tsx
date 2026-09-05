import type { ComponentPropsWithoutRef } from 'react'
import { css } from '@/styled-system/css'

export type LabelProps = ComponentPropsWithoutRef<'label'>

export function Label({ className = '', children, ...props }: LabelProps) {
  const baseStyles = css({
    display: 'block',
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'gray.100',
    mb: '2',
  })

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Label component is used with htmlFor prop
    <label className={`${baseStyles} ${className}`} {...props}>
      {children}
    </label>
  )
}
