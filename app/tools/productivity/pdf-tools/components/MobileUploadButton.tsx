'use client'

import { Camera, Upload } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'

interface MobileUploadButtonProps {
  onFilesSelected: (files: FileList) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

export function MobileUploadButton({
  onFilesSelected,
  accept = 'application/pdf,image/*',
  multiple = true,
  disabled = false,
}: MobileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [onFilesSelected]
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click()
  }, [])

  return (
    <div
      className={css({
        display: { base: 'flex', lg: 'none' },
        flexDirection: 'column',
        gap: '3',
        w: 'full',
      })}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={disabled}
        aria-label="File upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={disabled}
        aria-label="Camera capture"
      />

      {/* Upload from Files Button */}
      <Button
        onClick={handleUploadClick}
        disabled={disabled}
        size="lg"
        className={css({
          w: 'full',
          h: '14',
          gap: '2',
          bg: 'red.600',
          fontSize: 'base',
          fontWeight: 'semibold',
          _hover: {
            bg: 'red.700',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        })}
      >
        <Upload
          className={css({
            h: '5',
            w: '5',
          })}
        />
        Upload from Files
      </Button>

      {/* Camera Capture Button */}
      <Button
        onClick={handleCameraClick}
        disabled={disabled}
        variant="outline"
        size="lg"
        className={css({
          w: 'full',
          h: '14',
          gap: '2',
          borderColor: 'gray.700',
          bg: 'gray.800/50',
          fontSize: 'base',
          fontWeight: 'semibold',
          _hover: {
            bg: 'gray.800',
            borderColor: 'gray.600',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        })}
      >
        <Camera
          className={css({
            h: '5',
            w: '5',
          })}
        />
        Take Photo / Scan Document
      </Button>

      {/* Helper text */}
      <p
        className={css({
          fontSize: 'xs',
          color: 'gray.500',
          textAlign: 'center',
          lineHeight: 'relaxed',
        })}
      >
        Camera will convert photos to PDF automatically
      </p>
    </div>
  )
}
