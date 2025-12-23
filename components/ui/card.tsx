import { ark } from '@ark-ui/react'
import * as React from 'react'
import { cx } from '@/lib/utils'
import { css } from '@/styled-system/css'
import { card } from '@/styled-system/recipes'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, asChild = false, ...props }, ref) => {
    const Comp = asChild ? ark.div : 'article'
    return <Comp ref={ref} className={cx(card({ glass }), className)} {...props} />
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cx(
        css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5',
          p: '6',
        }),
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref}
    className={cx(
      css({
        fontSize: 'lg',
        lineHeight: 'tight',
        fontWeight: 'semibold',
        letterSpacing: 'tight',
        color: 'fg.default',
      }),
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cx(
      css({
        color: 'fg.muted',
        fontSize: 'sm',
        lineHeight: 'relaxed',
      }),
      className
    )}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to include top padding. Set to true when CardContent is used without CardHeader.
   * @default false
   */
  withTopPadding?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, withTopPadding = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(
        css({
          p: '6',
          pt: withTopPadding ? '6' : '0',
        }),
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to include top padding. Set to true when CardFooter is the first element in Card.
   * @default false
   */
  withTopPadding?: boolean
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withTopPadding = false, ...props }, ref) => (
    <footer
      ref={ref}
      className={cx(
        css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          p: '6',
          pt: withTopPadding ? '6' : '0',
        }),
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
