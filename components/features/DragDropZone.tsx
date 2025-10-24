'use client'

import { useState, useCallback } from 'react'
import { Upload, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300',
        'hover:border-purple-500/50 hover:bg-gray-900/50',
        isDragOver
          ? 'scale-[1.02] border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'border-gray-700 bg-gray-900/30',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center"
      >
        <div
          className={cn(
            'mb-4 rounded-full p-4 transition-all duration-300',
            isDragOver ? 'scale-110 bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-800'
          )}
        >
          {isDragOver ? (
            <FileCheck className="h-8 w-8 text-white" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>

        <p className="mb-2 text-sm text-gray-300">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>

        <p className="text-xs text-gray-500">
          {accept ? `Accepted files: ${accept}` : 'Any file type'}
          {maxSize && ` • Max size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`}
        </p>

        {isDragOver && (
          <p className="mt-4 animate-pulse text-sm font-medium text-purple-400">Drop files here</p>
        )}
      </label>
    </div>
  )
}
