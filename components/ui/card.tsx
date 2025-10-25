import * as React from 'react'
import { css } from '@/styled-system/css'
import { card } from '@/styled-system/recipes'
import { cx } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, glass, ...props }, ref) => (
  <div ref={ref} className={cx(card({ glass }), className)} {...props} />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(
        css({
          display: 'flex',
          flexDirection: 'column',
          gap: { base: '4', sm: '5', md: '6' },
          p: { base: '6', sm: '7', md: '8', lg: '10' },
        }),
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(
        css({
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
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(css({ color: 'muted-foreground', fontSize: 'sm' }), className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(
        css({
          px: { base: '6', sm: '7', md: '8', lg: '10' },
          pt: '0',
          pb: { base: '6', sm: '7', md: '8', lg: '10' },
        }),
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(
        css({
          display: 'flex',
          alignItems: 'center',
          p: { base: '4', sm: '5', md: '6' },
          pt: '0',
        }),
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
