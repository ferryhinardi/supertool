'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  Bookmark,
  CheckCircle,
  Copy,
  CopyPlus,
  Droplet,
  Edit3,
  FileDown,
  FileEdit,
  FileOutput,
  FileScan,
  FileText,
  FileType,
  GripVertical,
  Hash,
  ImageDown,
  Image as ImageIcon,
  Layers,
  Loader2,
  Lock,
  LockOpen,
  Merge,
  RotateCw,
  Settings,
  Split,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'
import type { OperationType } from './OperationGrid'

interface PDFFile {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

interface ProcessingModalProps {
  pdfs: PDFFile[]
  operation: OperationType
  isOpen: boolean
  onClose: () => void
  canClose?: boolean
}

const operationIcons: Record<OperationType, LucideIcon> = {
  merge: Merge,
  split: Split,
  compress: Archive,
  toImages: ImageIcon,
  imagesToPdf: FileDown,
  watermark: Droplet,
  extract: Copy,
  rotate: RotateCw,
  toWord: FileOutput,
  edit: Edit3,
  grayscale: Settings,
  deletePages: Trash2,
  protect: Lock,
  unlock: LockOpen,
  duplicatePages: CopyPlus,
  reorder: GripVertical,
  addPageNumbers: Hash,
  extractText: FileText,
  editMetadata: FileEdit,
  ocrExtract: FileScan,
  flatten: Layers,
  addHeaderFooter: FileType,
  addBookmarks: Bookmark,
  extractImages: ImageDown,
}

const operationLabels: Record<OperationType, string> = {
  merge: 'Merging PDFs',
  split: 'Splitting PDF',
  compress: 'Compressing PDFs',
  toImages: 'Converting to Images',
  imagesToPdf: 'Converting to PDF',
  watermark: 'Adding Watermark',
  extract: 'Extracting Pages',
  rotate: 'Rotating Pages',
  toWord: 'Converting to Word',
  edit: 'Editing PDF',
  grayscale: 'Converting to Grayscale',
  deletePages: 'Deleting Pages',
  protect: 'Protecting PDF',
  unlock: 'Unlocking PDF',
  duplicatePages: 'Duplicating Pages',
  reorder: 'Reordering Pages',
  addPageNumbers: 'Adding Page Numbers',
  extractText: 'Extracting Text',
  editMetadata: 'Editing Metadata',
  ocrExtract: 'Extracting Text with OCR',
  flatten: 'Flattening PDF',
  addHeaderFooter: 'Adding Headers/Footers',
  addBookmarks: 'Adding Bookmarks',
  extractImages: 'Extracting Images',
}

// Simple circular progress component without external dependency
function ProgressCircle({ value, text }: { value: number; text: string }) {
  const radius = 28
  const stroke = 4
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div
      className={css({
        w: '16',
        h: '16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      })}
    >
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Progress: ${value}%`}
        role="img"
      >
        <title>Progress indicator</title>
        {/* Background circle */}
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke="#ef4444"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div
        className={css({
          position: 'absolute',
          fontSize: 'sm',
          fontWeight: 'bold',
          color: 'red.400',
        })}
      >
        {text}
      </div>
    </div>
  )
}

function FileProgressItem({ pdf }: { pdf: PDFFile }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        p: '3',
        rounded: 'lg',
        bg:
          pdf.status === 'error'
            ? 'red.500/10'
            : pdf.status === 'completed'
              ? 'green.500/10'
              : 'gray.800/50',
        border: '1px solid',
        borderColor:
          pdf.status === 'error'
            ? 'red.500/20'
            : pdf.status === 'completed'
              ? 'green.500/20'
              : 'gray.700',
      })}
    >
      {/* Status Icon */}
      <div className={css({ flexShrink: 0 })}>
        {pdf.status === 'processing' && (
          <Loader2
            className={css({
              h: '5',
              w: '5',
              color: 'red.400',
              animation: 'spin 1s linear infinite',
            })}
          />
        )}
        {pdf.status === 'completed' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <CheckCircle
              className={css({
                h: '5',
                w: '5',
                color: 'green.400',
              })}
            />
          </motion.div>
        )}
        {pdf.status === 'error' && (
          <XCircle
            className={css({
              h: '5',
              w: '5',
              color: 'red.400',
            })}
          />
        )}
        {pdf.status === 'pending' && (
          <div
            className={css({
              h: '5',
              w: '5',
              rounded: 'full',
              border: '2px solid',
              borderColor: 'gray.600',
            })}
          />
        )}
      </div>

      {/* File Name */}
      <div className={css({ minW: '0', flex: '1' })}>
        <p
          className={css({
            truncate: true,
            fontSize: 'sm',
            fontWeight: 'medium',
            color: pdf.status === 'error' ? 'red.300' : 'gray.200',
          })}
        >
          {pdf.name}
        </p>
        {pdf.status === 'error' && pdf.error && (
          <p className={css({ fontSize: 'xs', color: 'red.400', mt: '1' })}>{pdf.error}</p>
        )}
      </div>

      {/* Progress */}
      {pdf.status === 'processing' && (
        <div className={css({ flexShrink: 0, w: '12' })}>
          <span className={css({ fontSize: 'xs', color: 'gray.400' })}>{pdf.progress}%</span>
        </div>
      )}
    </motion.div>
  )
}

export function ProcessingModal({
  pdfs,
  operation,
  isOpen,
  onClose,
  canClose = true,
}: ProcessingModalProps) {
  const processingCount = pdfs.filter((p) => p.status === 'processing').length
  const completedCount = pdfs.filter((p) => p.status === 'completed').length
  const errorCount = pdfs.filter((p) => p.status === 'error').length
  const totalProgress = Math.round(
    pdfs.reduce((sum, pdf) => sum + pdf.progress, 0) / Math.max(pdfs.length, 1)
  )

  const OperationIcon = operationIcons[operation]
  const allCompleted = completedCount === pdfs.length && pdfs.length > 0
  const hasErrors = errorCount > 0

  if (!isOpen) return null

  return (
    <div
      className={css({
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'black/60',
        backdropFilter: 'blur(8px)',
        zIndex: '50',
        p: '4',
      })}
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={css({
          w: 'full',
          maxW: '2xl',
          rounded: '2xl',
          bg: 'gray.900',
          border: '1px solid',
          borderColor: 'gray.800',
          shadow: '2xl',
          overflow: 'hidden',
        })}
      >
        {/* Header */}
        <div
          className={css({
            p: '6',
            borderBottom: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/80',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
            {/* Animated Icon */}
            <motion.div
              animate={{
                rotate: processingCount > 0 ? 360 : 0,
              }}
              transition={{
                duration: 2,
                repeat: processingCount > 0 ? Number.POSITIVE_INFINITY : 0,
                ease: 'linear',
              }}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                h: '12',
                w: '12',
                rounded: 'full',
                bg: 'red.500/20',
              })}
            >
              <OperationIcon
                className={css({
                  h: '6',
                  w: '6',
                  color: 'red.400',
                })}
              />
            </motion.div>

            {/* Title & Stats */}
            <div className={css({ flex: '1' })}>
              <h2
                id="processing-modal-title"
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'gray.100',
                })}
              >
                {allCompleted
                  ? 'Processing Complete!'
                  : hasErrors
                    ? 'Processing Complete with Errors'
                    : operationLabels[operation]}
              </h2>
              <p className={css({ mt: '1', fontSize: 'sm', color: 'gray.400' })}>
                {completedCount} of {pdfs.length} files completed
                {errorCount > 0 && ` • ${errorCount} failed`}
              </p>
            </div>

            {/* Overall Progress */}
            {!allCompleted && processingCount > 0 && (
              <div className={css({ flexShrink: 0, w: '16', h: '16' })}>
                <ProgressCircle value={totalProgress} text={`${totalProgress}%`} />
              </div>
            )}
          </div>
        </div>

        {/* File List */}
        <div
          className={css({
            maxH: '96',
            overflowY: 'auto',
            p: '6',
            spaceY: '2',
          })}
        >
          {pdfs.map((pdf) => (
            <FileProgressItem key={pdf.id} pdf={pdf} />
          ))}
        </div>

        {/* Footer */}
        <div
          className={css({
            p: '6',
            borderTop: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/80',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '3',
          })}
        >
          {canClose && (
            <Button
              onClick={onClose}
              variant={allCompleted ? 'default' : 'outline'}
              className={css({
                px: '6',
                ...(allCompleted && {
                  bg: 'red.600',
                  _hover: {
                    bg: 'red.700',
                  },
                }),
              })}
            >
              {allCompleted ? 'Done' : 'Close'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
