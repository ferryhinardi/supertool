'use client'

import { FileStack, Layers } from 'lucide-react'
import { css } from '@/styled-system/css'
import { OperationProgress } from './OperationProgress'

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  processedBlob?: Blob
  processedSize?: number
}

interface BatchQueueProps {
  pdfs: PDFFile[]
  onDownload: (pdf: PDFFile) => void
  onRetry: (pdf: PDFFile) => void
  onRemove: (pdf: PDFFile) => void
  maxHeight?: string
}

export function BatchQueue({
  pdfs,
  onDownload,
  onRetry,
  onRemove,
  maxHeight = '600px',
}: BatchQueueProps) {
  if (pdfs.length === 0) {
    return (
      <div
        className={css({
          animation: 'fadeIn 0.3s ease-out forwards',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 16,
          px: 4,
          bg: 'gray.800/30',
          border: '2px dashed',
          borderColor: 'gray.700',
          rounded: 'lg',
          textAlign: 'center',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: 20,
            h: 20,
            rounded: 'full',
            bg: 'gray.700/50',
            mb: 4,
          })}
        >
          <FileStack className={css({ w: 10, h: 10, color: 'white' })} />
        </div>
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: 2, color: 'white' })}>
          No files in queue
        </h3>
        <p className={css({ fontSize: 'sm', color: 'white', maxW: 'md' })}>
          Upload PDF files to start batch processing. You can process multiple files at once.
        </p>
      </div>
    )
  }

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      })}
    >
      {/* Queue Header */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 4,
          py: 2,
          bg: 'gray.800/50',
          border: '1px solid',
          borderColor: 'gray.700',
          rounded: 'lg',
        })}
      >
        <Layers className={css({ w: 5, h: 5, color: 'white' })} />
        <h3 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'white' })}>
          Batch Queue
        </h3>
        <span className={css({ fontSize: 'xs', color: 'white' })}>
          ({pdfs.length} {pdfs.length === 1 ? 'file' : 'files'})
        </span>
      </div>

      {/* File List with Scroll */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxH: maxHeight,
          overflowY: 'auto',
          pr: 2,
          '&::-webkit-scrollbar': {
            w: 2,
          },
          '&::-webkit-scrollbar-track': {
            bg: 'gray.800',
            rounded: 'full',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: 'gray.600',
            rounded: 'full',
            _hover: {
              bg: 'gray.500',
            },
          },
        })}
      >
        {pdfs.map((pdf) => (
          <OperationProgress
            key={pdf.id}
            pdf={pdf}
            onDownload={onDownload}
            onRetry={onRetry}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Footer Stats */}
      {pdfs.length > 5 && (
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            py: 2,
            fontSize: 'xs',
            color: 'white',
            borderTop: '1px solid',
            borderColor: 'gray.700',
          })}
        >
          <span>
            Showing {pdfs.length} {pdfs.length === 1 ? 'file' : 'files'} in queue
          </span>
        </div>
      )}
    </div>
  )
}
