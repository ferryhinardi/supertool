'use client'

import { FileCheck, Sparkles, Upload } from 'lucide-react'
import { useCallback, useId, useState } from 'react'
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

  const handleClick = () => {
    if (!disabled) {
      document.getElementById(inputId)?.click()
    }
  }

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
          handleClick()
        }
      }}
      role="button"
      tabIndex={0}
      className={cx(
        'group relative overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-500',
        'backdrop-blur-xl shadow-xl',
        isDragOver
          ? 'scale-[1.02] border-purple-500/80 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 shadow-2xl shadow-purple-500/30'
          : 'border-gray-700/50 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10',
        disabled && 'cursor-not-allowed opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Animated background gradient */}
      <div
        className={cx(
          'absolute inset-0 opacity-0 transition-opacity duration-500',
          'bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10',
          isDragOver && 'opacity-100'
        )}
      />

      {/* Sparkle effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-4 right-4 animate-pulse">
          <Sparkles className="h-4 w-4 text-purple-400/40" />
        </div>
        <div className="absolute bottom-6 left-6 animate-pulse delay-150">
          <Sparkles className="h-3 w-3 text-blue-400/40" />
        </div>
      </div>

      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id={inputId}
      />

      <label
        htmlFor={inputId}
        className="relative z-10 flex cursor-pointer flex-col items-center justify-center px-8 py-10 text-center"
      >
        {/* Icon container with modern styling */}
        <div
          className={cx(
            'relative mb-5 rounded-2xl p-5 transition-all duration-500',
            'shadow-lg',
            isDragOver
              ? 'scale-110 bg-gradient-to-br from-purple-500 to-blue-600 shadow-purple-500/50 rotate-6'
              : 'bg-gradient-to-br from-gray-800 to-gray-700 group-hover:scale-105 group-hover:from-purple-900/50 group-hover:to-blue-900/50'
          )}
        >
          {/* Glow effect */}
          <div
            className={cx(
              'absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500',
              isDragOver
                ? 'opacity-60 bg-gradient-to-br from-purple-500 to-blue-500'
                : 'opacity-0 group-hover:opacity-30 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-blue-500'
            )}
          />

          {isDragOver ? (
            <FileCheck className="relative h-10 w-10 text-white drop-shadow-lg" />
          ) : (
            <Upload className="relative h-10 w-10 text-gray-300 group-hover:text-purple-300 transition-colors duration-300" />
          )}
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <p
            className={cx(
              'text-base font-semibold transition-colors duration-300',
              isDragOver ? 'text-purple-200' : 'text-gray-200 group-hover:text-purple-300'
            )}
          >
            {isDragOver ? 'Drop your file here' : 'Click to upload'}
          </p>

          <p className="text-sm text-gray-400 font-medium">or drag and drop</p>

          <p className="text-xs text-gray-500 pt-2 leading-relaxed">
            {accept ? `Accepted: ${accept.split(',').slice(0, 3).join(', ')}` : 'Any file type'}
            {maxSize && (
              <>
                <br />
                <span className="text-gray-600">Max size: </span>
                <span className="text-purple-400 font-semibold">
                  {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </span>
              </>
            )}
          </p>
        </div>

        {/* Drag over animation */}
        {isDragOver && (
          <div className="mt-4 flex items-center gap-2 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-purple-400" />
            <p className="text-sm font-medium text-purple-300">Ready to upload</p>
            <div className="h-2 w-2 rounded-full bg-blue-400" />
          </div>
        )}
      </label>

      {/* Bottom gradient line */}
      <div
        className={cx(
          'absolute bottom-0 left-0 right-0 h-1 transition-all duration-500',
          isDragOver
            ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 opacity-100'
            : 'bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100'
        )}
      />
    </div>
  )
}
