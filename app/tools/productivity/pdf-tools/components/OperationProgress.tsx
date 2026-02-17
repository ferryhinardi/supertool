'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'

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

interface OperationProgressProps {
  pdf: PDFFile
  onDownload: (pdf: PDFFile) => void
  onRetry: (pdf: PDFFile) => void
  onRemove: (pdf: PDFFile) => void
  showActions?: boolean
}

export function OperationProgress({
  pdf,
  onDownload,
  onRetry,
  onRemove,
  showActions = true,
}: OperationProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }

  const getStatusColor = () => {
    switch (pdf.status) {
      case 'completed':
        return 'green'
      case 'error':
        return 'red'
      case 'processing':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = () => {
    switch (pdf.status) {
      case 'completed':
        return <CheckCircle2 className={css({ w: 5, h: 5, color: 'green.400' })} />
      case 'error':
        return <AlertCircle className={css({ w: 5, h: 5, color: 'red.400' })} />
      case 'processing':
        return <Loader2 className={css({ w: 5, h: 5, color: 'blue.400', animation: 'spin' })} />
      default:
        return <Clock className={css({ w: 5, h: 5, color: 'white' })} />
    }
  }

  const getStatusLabel = () => {
    switch (pdf.status) {
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Failed'
      case 'processing':
        return `Processing ${pdf.progress}%`
      default:
        return 'Pending'
    }
  }

  const color = getStatusColor()

  return (
    <div
      className={css({
        animation: 'fadeIn 0.3s ease-out forwards',
        display: 'flex',
        flexDirection: { base: 'column', sm: 'row' },
        alignItems: { base: 'stretch', sm: 'center' },
        gap: 3,
        p: 4,
        bg: 'gray.800/30',
        border: '1px solid',
        borderColor: 'gray.700',
        rounded: 'lg',
        backdropFilter: 'blur(4px)',
        _hover: {
          borderColor: 'gray.600',
          bg: 'gray.800/50',
        },
        transition: 'all 0.2s',
      })}
    >
      {/* File Info */}
      <div className={css({ display: 'flex', alignItems: 'center', gap: 3, flex: 1, minW: 0 })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: 10,
            h: 10,
            rounded: 'lg',
            bg: `${color}.500/20`,
            flexShrink: 0,
          })}
        >
          <FileText className={css({ w: 5, h: 5, color: `${color}.400` })} />
        </div>

        <div className={css({ flex: 1, minW: 0 })}>
          <div
            className={css({
              fontSize: 'sm',
              fontWeight: 'medium',
              truncate: true,
              mb: 1,
            })}
            title={pdf.name}
          >
            {pdf.name}
          </div>

          <div className={css({ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' })}>
            {/* Status Badge */}
            <div
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                rounded: 'full',
                bg: `${color}.500/20`,
                fontSize: 'xs',
                fontWeight: 'medium',
                color: `${color}.300`,
              })}
            >
              {getStatusIcon()}
              <span>{getStatusLabel()}</span>
            </div>

            {/* File Size */}
            <span className={css({ fontSize: 'xs', color: 'white' })}>
              {formatFileSize(pdf.size)}
              {pdf.processedSize && pdf.processedSize !== pdf.size && (
                <>
                  {' → '}
                  <span className={css({ color: 'green.400', fontWeight: 'medium' })}>
                    {formatFileSize(pdf.processedSize)}
                  </span>
                </>
              )}
            </span>

            {/* Pages */}
            <span className={css({ fontSize: 'xs', color: 'white' })}>
              {pdf.pages} {pdf.pages === 1 ? 'page' : 'pages'}
            </span>
          </div>

          {/* Error Message */}
          {pdf.error && (
            <div
              className={css({
                mt: 2,
                p: 2,
                bg: 'red.500/10',
                border: '1px solid',
                borderColor: 'red.500/30',
                rounded: 'md',
                fontSize: 'xs',
                color: 'red.300',
              })}
            >
              {pdf.error}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (only show when processing) */}
      {pdf.status === 'processing' && (
        <div
          className={css({
            w: { base: 'full', sm: '200px' },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          })}
        >
          <div
            className={css({
              flex: 1,
              h: 2,
              bg: 'gray.700',
              rounded: 'full',
              overflow: 'hidden',
            })}
          >
            <div
              className={css({
                h: 'full',
                bg: `${color}.500`,
                rounded: 'full',
                transition: 'width 0.3s ease',
              })}
              style={{ width: `${pdf.progress}%` }}
            />
          </div>
          <span className={css({ fontSize: 'xs', color: 'white', w: 10, textAlign: 'right' })}>
            {pdf.progress}%
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className={css({ display: 'flex', gap: 2, flexShrink: 0 })}>
          {pdf.status === 'completed' && pdf.processedBlob && (
            <Button
              onClick={() => onDownload(pdf)}
              size="sm"
              variant="outline"
              className={css({
                h: 8,
                px: 3,
                bg: 'green.500/10',
                borderColor: 'green.500/30',
                color: 'green.300',
                _hover: {
                  bg: 'green.500/20',
                  borderColor: 'green.500/50',
                },
              })}
            >
              <Download className={css({ w: 4, h: 4 })} />
            </Button>
          )}

          {pdf.status === 'error' && (
            <Button
              onClick={() => onRetry(pdf)}
              size="sm"
              variant="outline"
              className={css({
                h: 8,
                px: 3,
                bg: 'blue.500/10',
                borderColor: 'blue.500/30',
                color: 'blue.300',
                _hover: {
                  bg: 'blue.500/20',
                  borderColor: 'blue.500/50',
                },
              })}
            >
              <RotateCcw className={css({ w: 4, h: 4 })} />
            </Button>
          )}

          {(pdf.status === 'pending' || pdf.status === 'error') && (
            <Button
              onClick={() => onRemove(pdf)}
              size="sm"
              variant="outline"
              className={css({
                h: 8,
                px: 3,
                bg: 'red.500/10',
                borderColor: 'red.500/30',
                color: 'red.300',
                _hover: {
                  bg: 'red.500/20',
                  borderColor: 'red.500/50',
                },
              })}
            >
              <X className={css({ w: 4, h: 4 })} />
            </Button>
          )}

          {pdf.status === 'completed' && (
            <Button
              onClick={() => onRemove(pdf)}
              size="sm"
              variant="outline"
              className={css({
                h: 8,
                px: 3,
                bg: 'gray.500/10',
                borderColor: 'gray.500/30',
                color: 'white',
                _hover: {
                  bg: 'gray.500/20',
                  borderColor: 'gray.500/50',
                },
              })}
            >
              <Trash2 className={css({ w: 4, h: 4 })} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
