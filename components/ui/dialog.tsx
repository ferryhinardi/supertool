'use client'

import * as React from 'react'
import { Dialog as ArkDialog } from '@ark-ui/react'
import { X } from 'lucide-react'
import { css } from '@/styled-system/css'
import { cx } from '@/lib/utils'

const Dialog = ArkDialog.Root
const DialogTrigger = ArkDialog.Trigger
const DialogClose = ArkDialog.CloseTrigger

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <ArkDialog.Backdrop
      ref={ref}
      className={cx(
        css({
          position: 'fixed',
          inset: '0',
          zIndex: '50',
          bg: 'black/80',
          animation: 'fadeIn 200ms',
        }),
        className
      )}
      {...props}
    />
  )
)
DialogOverlay.displayName = 'DialogOverlay'

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <ArkDialog.Positioner>
      <DialogOverlay />
      <ArkDialog.Content
        ref={ref}
        className={cx(
          css({
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: '50',
            display: 'grid',
            w: 'full',
            maxW: 'lg',
            transform: 'translate(-50%, -50%)',
            gap: '4',
            border: '1px solid',
            borderColor: 'border',
            bg: 'background',
            p: '6',
            shadow: 'lg',
            animation: 'fadeIn 200ms, scaleIn 200ms',
            sm: { rounded: 'lg' },
          }),
          className
        )}
        {...props}
      >
        {children}
        <ArkDialog.CloseTrigger
          className={css({
            position: 'absolute',
            top: '4',
            right: '4',
            rounded: 'sm',
            opacity: '0.7',
            transition: 'opacity 0.2s',
            _hover: { opacity: '1' },
            _focus: {
              outline: 'none',
              ring: '2px',
              ringColor: 'ring',
              ringOffset: '2px',
            },
            _disabled: { pointerEvents: 'none' },
          })}
        >
          <X className={css({ h: '4', w: '4' })} />
          <span className={css({ srOnly: true })}>Close</span>
        </ArkDialog.CloseTrigger>
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  )
)
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5',
        textAlign: { base: 'center', sm: 'left' },
      }),
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      css({
        display: 'flex',
        flexDirection: { base: 'column-reverse', sm: 'row' },
        justifyContent: { sm: 'flex-end' },
        gap: { sm: '2' },
      }),
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <ArkDialog.Title
      ref={ref}
      className={cx(
        css({
          fontSize: 'lg',
          lineHeight: 'none',
          fontWeight: 'semibold',
          letterSpacing: 'tight',
        }),
        className
      )}
      {...props}
    />
  )
)
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <ArkDialog.Description
    ref={ref}
    className={cx(css({ color: 'muted-foreground', fontSize: 'sm' }), className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
