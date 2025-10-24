"use client"

import { useState, useCallback } from "react"
import { Upload, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
  }, [disabled, onFilesSelected])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
  }, [onFilesSelected])

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer",
        "hover:border-purple-500/50 hover:bg-gray-900/50",
        isDragOver
          ? "border-purple-500 bg-purple-500/10 scale-[1.02] shadow-lg shadow-purple-500/20"
          : "border-gray-700 bg-gray-900/30",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center px-6 py-12 text-center cursor-pointer"
      >
        <div
          className={cn(
            "mb-4 p-4 rounded-full transition-all duration-300",
            isDragOver
              ? "bg-gradient-to-r from-purple-500 to-blue-500 scale-110"
              : "bg-gray-800"
          )}
        >
          {isDragOver ? (
            <FileCheck className="w-8 h-8 text-white" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
        </div>
        
        <p className="mb-2 text-sm text-gray-300">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        
        <p className="text-xs text-gray-500">
          {accept ? `Accepted files: ${accept}` : "Any file type"}
          {maxSize && ` • Max size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`}
        </p>

        {isDragOver && (
          <p className="mt-4 text-sm font-medium text-purple-400 animate-pulse">
            Drop files here
          </p>
        )}
      </label>
    </div>
  )
}
