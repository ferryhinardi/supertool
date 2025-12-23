'use client'

import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { createContext, useContext, useRef, useState } from 'react'

interface FFmpegContextValue {
  ffmpeg: FFmpeg | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  load: () => Promise<void>
}

const FFmpegContext = createContext<FFmpegContextValue | null>(null)

export function useFFmpeg() {
  const context = useContext(FFmpegContext)
  if (!context) {
    throw new Error('useFFmpeg must be used within FFmpegProvider')
  }
  return context
}

export function FFmpegProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const load = async () => {
    if (ffmpegRef.current || isLoading) return

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      // Dynamically import FFmpeg only when needed
      const ffmpegModule = await import('@ffmpeg/ffmpeg')
      const utilModule = await import('@ffmpeg/util')

      const ffmpeg = new ffmpegModule.FFmpeg()
      const { toBlobURL } = utilModule

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      ffmpegRef.current = ffmpeg
      setIsLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load FFmpeg')
      setError(error)
      setIsError(true)
      setIsLoading(false)
    }
  }

  const value: FFmpegContextValue = {
    ffmpeg: ffmpegRef.current,
    isLoading,
    isError,
    error,
    load,
  }

  return <FFmpegContext.Provider value={value}>{children}</FFmpegContext.Provider>
}
