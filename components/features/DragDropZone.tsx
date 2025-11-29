'use client'

import { FileText, Film, Sparkles, Upload } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { cx } from '@/lib/utils'

interface DragDropZoneProps {
  onFilesSelected: (files: FileList) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  disabled?: boolean
  className?: string
}

export function DragDropZone({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  className,
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
    },
    [disabled, onFilesSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
    },
    [onFilesSelected]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      console.log('🔵 DragDropZone clicked!', {
        disabled,
        hasInputRef: !!inputRef.current,
        inputElement: inputRef.current,
      })
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && inputRef.current) {
        console.log('🟢 Triggering input click...')
        inputRef.current.click()
      } else {
        console.log('🔴 Click blocked:', { disabled, hasRef: !!inputRef.current })
      }
    },
    [disabled]
  )

  // Determine icon based on accept type
  const getIcon = () => {
    if (accept?.includes('video')) return Film
    if (accept?.includes('srt') || accept?.includes('text')) return FileText
    return Upload
  }

  const Icon = getIcon()

  return (
    // biome-ignore lint/a11y/useSemanticElements: div required for drag-and-drop functionality
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!disabled && inputRef.current) {
            inputRef.current.click()
          }
        }
      }}
      role="button"
      tabIndex={0}
      className={cx(
        'group relative overflow-hidden cursor-pointer transition-all duration-300',
        disabled && 'cursor-not-allowed opacity-50 pointer-events-none',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id={inputId}
        aria-label="File upload"
      />

      <div
        className={cx(
          'relative rounded-2xl p-8 transition-all duration-300',
          'border-2 border-dashed',
          isDragOver
            ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
            : 'border-gray-700/50 bg-gray-900/40 hover:border-purple-500/50 hover:bg-gray-900/60'
        )}
      >
        {/* Sparkle decorations */}
        {!isDragOver && (
          <>
            <Sparkles className="absolute top-3 right-3 h-4 w-4 text-purple-400/30 animate-pulse" />
            <Sparkles className="absolute bottom-3 left-3 h-3 w-3 text-blue-400/30 animate-pulse delay-700" />
          </>
        )}

        {/* Content */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Icon */}
          <div
            className={cx(
              'rounded-xl p-4 transition-all duration-300',
              isDragOver
                ? 'bg-gradient-to-br from-purple-500 to-blue-600 scale-110 rotate-3'
                : 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 group-hover:scale-105 group-hover:from-purple-900/40 group-hover:to-blue-900/40'
            )}
          >
            <Icon
              className={cx(
                'h-8 w-8 transition-colors duration-300',
                isDragOver ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'
              )}
            />
          </div>

          {/* Text */}
          <div className="space-y-1">
            <p
              className={cx(
                'text-sm font-semibold transition-colors duration-300',
                isDragOver ? 'text-purple-300' : 'text-gray-300 group-hover:text-purple-300'
              )}
            >
              {isDragOver ? 'Drop your file here' : 'Click to upload'}
            </p>
            <p className="text-xs text-gray-500">or drag and drop</p>
          </div>

          {/* File info */}
          {(accept || maxSize) && (
            <div className="pt-2 text-xs text-gray-600 space-y-1">
              {accept && <div>{accept.includes('video') ? 'Video files' : accept}</div>}
              {maxSize && (
                <div>
                  Max size:{' '}
                  <span className="text-purple-400 font-medium">
                    {(maxSize / (1024 * 1024)).toFixed(0)}MB
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Animated gradient border */}
        <div
          className={cx(
            'absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none',
            'bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20',
            isDragOver ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>
    </div>
  )
}
