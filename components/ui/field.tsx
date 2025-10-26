import * as React from 'react'
import { Field as ArkField } from '@ark-ui/react/field'
import { css } from '@/styled-system/css'
import { cx } from '@/lib/utils'

const Field = ArkField.Root

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof ArkField.Label>
>(({ className, ...props }, ref) => (
  <ArkField.Label
    ref={ref}
    className={cx(
      css({
        display: 'block',
        fontSize: 'sm',
        fontWeight: 'medium',
        color: 'fg.default',
        mb: '2',
        cursor: 'pointer',
        _disabled: {
          cursor: 'not-allowed',
          opacity: '0.5',
        },
      }),
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = 'FieldLabel'

const FieldHelperText = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ArkField.HelperText>
>(({ className, ...props }, ref) => (
  <ArkField.HelperText
    ref={ref}
    className={cx(
      css({
        fontSize: 'sm',
        color: 'fg.muted',
        mt: '2',
      }),
      className
    )}
    {...props}
  />
))
FieldHelperText.displayName = 'FieldHelperText'

const FieldErrorText = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ArkField.ErrorText>
>(({ className, ...props }, ref) => (
  <ArkField.ErrorText
    ref={ref}
    className={cx(
      css({
        fontSize: 'sm',
        color: 'fg.error',
        mt: '2',
        fontWeight: 'medium',
      }),
      className
    )}
    {...props}
  />
))
FieldErrorText.displayName = 'FieldErrorText'

const FieldInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof ArkField.Input>
>(({ className, ...props }, ref) => (
  <ArkField.Input
    ref={ref}
    className={cx(
      css({
        display: 'flex',
        h: '10',
        w: 'full',
        rounded: 'md',
        border: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.surface',
        px: '3',
        py: '2',
        fontSize: 'sm',
        color: 'fg.default',
        transition: 'all 0.2s',
        _placeholder: { color: 'fg.muted' },
        _focus: {
          outline: 'none',
          ring: '2px',
          ringColor: 'ring',
          ringOffset: '2px',
          borderColor: 'border.focused',
        },
        _disabled: {
          cursor: 'not-allowed',
          opacity: '0.5',
        },
        _invalid: {
          borderColor: 'border.error',
        },
      }),
      className
    )}
    {...props}
  />
))
FieldInput.displayName = 'FieldInput'

const FieldTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<typeof ArkField.Textarea>
>(({ className, ...props }, ref) => (
  <ArkField.Textarea
    ref={ref}
    className={cx(
      css({
        display: 'flex',
        minH: '20',
        w: 'full',
        rounded: 'md',
        border: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.surface',
        px: '3',
        py: '2',
        fontSize: 'sm',
        color: 'fg.default',
        transition: 'all 0.2s',
        _placeholder: { color: 'fg.muted' },
        _focus: {
          outline: 'none',
          ring: '2px',
          ringColor: 'ring',
          ringOffset: '2px',
          borderColor: 'border.focused',
        },
        _disabled: {
          cursor: 'not-allowed',
          opacity: '0.5',
        },
        _invalid: {
          borderColor: 'border.error',
        },
      }),
      className
    )}
    {...props}
  />
))
FieldTextarea.displayName = 'FieldTextarea'

const FieldSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<typeof ArkField.Select>
>(({ className, ...props }, ref) => (
  <ArkField.Select
    ref={ref}
    className={cx(
      css({
        display: 'flex',
        h: '10',
        w: 'full',
        rounded: 'md',
        border: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.surface',
        px: '3',
        py: '2',
        fontSize: 'sm',
        color: 'fg.default',
        transition: 'all 0.2s',
        _focus: {
          outline: 'none',
          ring: '2px',
          ringColor: 'ring',
          ringOffset: '2px',
          borderColor: 'border.focused',
        },
        _disabled: {
          cursor: 'not-allowed',
          opacity: '0.5',
        },
        _invalid: {
          borderColor: 'border.error',
        },
      }),
      className
    )}
    {...props}
  />
))
FieldSelect.displayName = 'FieldSelect'

export {
  Field,
  FieldLabel,
  FieldHelperText,
  FieldErrorText,
  FieldInput,
  FieldTextarea,
  FieldSelect,
}
