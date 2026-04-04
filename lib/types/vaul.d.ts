declare module 'vaul' {
  import type { ComponentPropsWithoutRef, ReactNode } from 'react'

  export interface DrawerProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children?: ReactNode
    shouldScaleBackground?: boolean
    modal?: boolean
  }

  export interface DrawerContentProps extends ComponentPropsWithoutRef<'div'> {
    children?: ReactNode
  }

  export interface DrawerOverlayProps extends ComponentPropsWithoutRef<'div'> {
    children?: ReactNode
  }

  export interface DrawerTriggerProps extends ComponentPropsWithoutRef<'button'> {
    children?: ReactNode
    asChild?: boolean
  }

  export interface DrawerTitleProps extends ComponentPropsWithoutRef<'h2'> {
    children?: ReactNode
  }

  export interface DrawerDescriptionProps extends ComponentPropsWithoutRef<'p'> {
    children?: ReactNode
  }

  export const Drawer: {
    Root: React.FC<DrawerProps>
    Trigger: React.FC<DrawerTriggerProps>
    Portal: React.FC<{ children?: ReactNode }>
    Overlay: React.FC<DrawerOverlayProps>
    Content: React.FC<DrawerContentProps>
    Title: React.FC<DrawerTitleProps>
    Description: React.FC<DrawerDescriptionProps>
  }
}
