declare module 'react-circular-progressbar' {
  import type { CSSProperties, ReactNode } from 'react'

  export interface CircularProgressbarProps {
    value: number
    minValue?: number
    maxValue?: number
    text?: string
    className?: string
    styles?: CircularProgressbarStyles
    strokeWidth?: number
    background?: boolean
    backgroundPadding?: number
    counterClockwise?: boolean
    circleRatio?: number
  }

  export interface CircularProgressbarStyles {
    root?: CSSProperties
    path?: CSSProperties
    trail?: CSSProperties
    text?: CSSProperties
    background?: CSSProperties
  }

  export interface BuildStylesOptions {
    pathColor?: string
    textColor?: string
    trailColor?: string
    backgroundColor?: string
    pathTransition?: string
    pathTransitionDuration?: number
    rotation?: number
    strokeLinecap?: 'butt' | 'round' | 'square'
    textSize?: string
  }

  export interface CircularProgressbarWithChildrenProps extends CircularProgressbarProps {
    children?: ReactNode
  }

  export const CircularProgressbar: React.FC<CircularProgressbarProps>
  export const CircularProgressbarWithChildren: React.FC<CircularProgressbarWithChildrenProps>
  export function buildStyles(styles: BuildStylesOptions): CircularProgressbarStyles
}
