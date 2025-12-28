'use client'

import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { css } from '@/styled-system/css'

interface DesktopUploadButtonProps {
  onFilesSelected: (files: FileList) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

/**
 * Desktop-specific upload button component
 * Only visible on lg+ screens (desktop)
 * Complements MobileUploadButton which is visible on base-md screens
 */
export function DesktopUploadButton({
  onFilesSelected,
  accept = 'application/pdf,image/jpeg,image/jpg,image/png,image/webp',
  multiple = true,
  disabled = false,
}: DesktopUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
    // Reset input to allow selecting the same file again
    if (e.target) {
      e.target.value = ''
    }
  }

  return (
    <div
      className={css({
        display: { base: 'none', lg: 'flex' }, // Only show on desktop
        justifyContent: 'center',
        mt: '4',
      })}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className={css({ display: 'none' })}
        aria-label="Upload more PDF files"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2',
          px: '6',
          py: '3',
          borderRadius: 'lg',
          fontWeight: 'semibold',
          fontSize: 'sm',
          transition: 'all',
          transitionDuration: '200ms',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          bg: 'linear-gradient(to right, #a855f7, #3b82f6)',
          color: 'white',
          border: 'none',
          _hover: {
            transform: disabled ? 'none' : 'translateY(-2px)',
            boxShadow: disabled
              ? 'none'
              : '0 10px 15px -3px rgba(168, 85, 247, 0.3), 0 4px 6px -2px rgba(168, 85, 247, 0.15)',
          },
          _active: {
            transform: disabled ? 'none' : 'translateY(0)',
          },
          _focus: {
            outline: '2px solid',
            outlineColor: '#a855f7',
            outlineOffset: '2px',
          },
        })}
      >
        <Upload
          className={css({
            w: '5',
            h: '5',
          })}
        />
        <span>Add More Files</span>
      </button>
    </div>
  )
}
