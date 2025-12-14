declare module 'canvas-confetti' {
  export interface Options {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    origin?: {
      x?: number
      y?: number
    }
    colors?: string[]
    shapes?: Array<'square' | 'circle'>
    scalar?: number
    zIndex?: number
    disableForReducedMotion?: boolean
  }

  export interface GlobalOptions {
    resize?: boolean
    useWorker?: boolean
  }

  type CreateTypes = (options?: GlobalOptions) => (options?: Options) => Promise<null> | null

  interface ConfettiFunction {
    (options?: Options): Promise<null> | null
    create: CreateTypes
    reset: () => void
  }

  const confetti: ConfettiFunction
  export default confetti
}
