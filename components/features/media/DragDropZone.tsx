'use client'

import { FileText, Film, Sparkles, Upload } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'

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
  className = '',
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

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }, [disabled])

  // Determine icon based on accept type
  const getIcon = () => {
    if (accept?.includes('video')) return Film
    if (accept?.includes('srt') || accept?.includes('text')) return FileText
    return Upload
  }

  const Icon = getIcon()

  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    transition: 'all 300ms',
  }

  // Inner box styles
  const boxStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: '16px',
    padding: '32px',
    transition: 'all 300ms',
    border: '2px dashed',
    borderColor: isDragOver ? '#a855f7' : 'rgba(55, 65, 81, 0.5)',
    backgroundColor: isDragOver ? 'rgba(168, 85, 247, 0.1)' : 'rgba(17, 24, 39, 0.4)',
    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
  }

  // Icon container styles
  const iconContainerStyle: React.CSSProperties = {
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 300ms',
    background: isDragOver
      ? 'linear-gradient(to bottom right, #a855f7, #3b82f6)'
      : 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.8), rgba(55, 65, 81, 0.8))',
    transform: isDragOver ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
    display: 'inline-block',
  }

  // Icon styles
  const iconStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    color: isDragOver ? '#ffffff' : '#9ca3af',
    transition: 'color 300ms',
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
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && inputRef.current) {
          e.preventDefault()
          inputRef.current.click()
        }
      }}
      role="button"
      tabIndex={0}
      style={containerStyle}
      className={className}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id={inputId}
        aria-label="File upload"
        disabled={disabled}
      />

      <div style={boxStyle}>
        {/* Sparkle decorations */}
        {!isDragOver && (
          <>
            <Sparkles
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '16px',
                height: '16px',
                color: 'rgba(192, 132, 252, 0.3)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <Sparkles
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                width: '12px',
                height: '12px',
                color: 'rgba(96, 165, 250, 0.3)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: '700ms',
              }}
            />
          </>
        )}

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          {/* Icon */}
          <div style={iconContainerStyle}>
            <Icon style={iconStyle} />
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isDragOver ? '#d8b4fe' : '#d1d5db',
                transition: 'color 300ms',
                margin: 0,
              }}
            >
              {isDragOver ? 'Drop your file here' : 'Click to upload'}
            </p>
            <p
              style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
              }}
            >
              or drag and drop
            </p>
          </div>

          {/* File info */}
          {(accept || maxSize) && (
            <div
              style={{
                paddingTop: '8px',
                fontSize: '12px',
                color: '#4b5563',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {accept && <div>{accept.includes('video') ? 'Video files' : accept}</div>}
              {maxSize && (
                <div>
                  Max size:{' '}
                  <span style={{ color: '#c084fc', fontWeight: 500 }}>
                    {(maxSize / (1024 * 1024)).toFixed(0)}MB
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Animated gradient border */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            background:
              'linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))',
            opacity: isDragOver ? 1 : 0,
            transition: 'opacity 300ms',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
