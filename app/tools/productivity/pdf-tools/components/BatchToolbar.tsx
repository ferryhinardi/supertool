'use client'

import { Download, Pause, Play, Trash2, TrendingUp, X } from 'lucide-react'
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

interface BatchToolbarProps {
  pdfs: PDFFile[]
  isPaused: boolean
  onPauseResume: () => void
  onCancelAll: () => void
  onDownloadAll: () => void
  onRetryFailed: () => void
  onClearCompleted: () => void
}

export function BatchToolbar({
  pdfs,
  isPaused,
  onPauseResume,
  onCancelAll,
  onDownloadAll,
  onRetryFailed,
  onClearCompleted,
}: BatchToolbarProps) {
  const totalFiles = pdfs.length
  const completedCount = pdfs.filter((p) => p.status === 'completed').length
  const processingCount = pdfs.filter((p) => p.status === 'processing').length
  const pendingCount = pdfs.filter((p) => p.status === 'pending').length
  const errorCount = pdfs.filter((p) => p.status === 'error').length

  const overallProgress = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0

  const hasCompleted = completedCount > 0
  const hasErrors = errorCount > 0
  const hasPending = pendingCount > 0 || processingCount > 0

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: { base: 'column', md: 'row' },
        alignItems: { base: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 4,
        p: 4,
        bg: 'gray.800/50',
        border: '1px solid',
        borderColor: 'gray.700',
        rounded: 'lg',
        backdropFilter: 'blur(4px)',
        mb: 4,
      })}
    >
      {/* Left: Progress Stats */}
      <div className={css({ display: 'flex', alignItems: 'center', gap: 4, flex: 1 })}>
        {/* Overall Progress Circle */}
        <div
          className={css({
            position: 'relative',
            w: 16,
            h: 16,
            flexShrink: 0,
          })}
        >
          <svg
            className={css({ w: 'full', h: 'full', transform: 'rotate(-90deg)' })}
            viewBox="0 0 64 64"
            aria-label={`Overall progress: ${overallProgress}%`}
          >
            <title>Overall Progress</title>
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className={css({ color: 'gray.700' })}
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={`${(overallProgress / 100) * 176} 176`}
              strokeLinecap="round"
              className={css({ color: 'blue.500', transition: 'all 0.3s' })}
            />
          </svg>
          <div
            className={css({
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'xs',
              fontWeight: 'bold',
              color: 'blue.400',
            })}
          >
            {overallProgress}%
          </div>
        </div>

        {/* Stats */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: 1 })}>
          <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
            {completedCount} of {totalFiles} Complete
          </div>
          <div className={css({ display: 'flex', gap: 3, fontSize: 'xs', color: 'gray.400' })}>
            {processingCount > 0 && (
              <span className={css({ color: 'blue.400' })}>{processingCount} processing</span>
            )}
            {pendingCount > 0 && (
              <span className={css({ color: 'gray.400' })}>{pendingCount} pending</span>
            )}
            {errorCount > 0 && (
              <span className={css({ color: 'red.400' })}>{errorCount} failed</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div
        className={css({
          display: 'flex',
          gap: '2',
          flexWrap: 'wrap',
          justifyContent: { base: 'stretch', sm: 'flex-end' },
          w: { base: 'full', sm: 'auto' },
        })}
      >
        {/* Pause/Resume (only if processing or pending) */}
        {hasPending && (
          <Button
            onClick={onPauseResume}
            size="sm"
            variant="outline"
            className={css({
              gap: '2',
              minH: '11',
              flex: { base: '1', sm: 'initial' },
              bg: isPaused ? 'green.500/10' : 'yellow.500/10',
              borderColor: isPaused ? 'green.500/30' : 'yellow.500/30',
              color: isPaused ? 'green.300' : 'yellow.300',
              _hover: {
                bg: isPaused ? 'green.500/20' : 'yellow.500/20',
                borderColor: isPaused ? 'green.500/50' : 'yellow.500/50',
              },
            })}
          >
            {isPaused ? (
              <>
                <Play className={css({ w: 4, h: 4 })} />
                Resume
              </>
            ) : (
              <>
                <Pause className={css({ w: 4, h: 4 })} />
                Pause
              </>
            )}
          </Button>
        )}

        {/* Retry Failed */}
        {hasErrors && (
          <Button
            onClick={onRetryFailed}
            size="sm"
            variant="outline"
            className={css({
              gap: '2',
              minH: '11',
              flex: { base: '1', sm: 'initial' },
              bg: 'blue.500/10',
              borderColor: 'blue.500/30',
              color: 'blue.300',
              _hover: {
                bg: 'blue.500/20',
                borderColor: 'blue.500/50',
              },
            })}
          >
            <TrendingUp className={css({ w: 4, h: 4 })} />
            Retry Failed ({errorCount})
          </Button>
        )}

        {/* Download All Completed */}
        {hasCompleted && (
          <Button
            onClick={onDownloadAll}
            size="sm"
            variant="outline"
            className={css({
              gap: '2',
              minH: '11',
              flex: { base: '1', sm: 'initial' },
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
            Download All ({completedCount})
          </Button>
        )}

        {/* Clear Completed */}
        {hasCompleted && (
          <Button
            onClick={onClearCompleted}
            size="sm"
            variant="outline"
            className={css({
              gap: '2',
              minH: '11',
              flex: { base: '1', sm: 'initial' },
              bg: 'gray.500/10',
              borderColor: 'gray.500/30',
              color: 'gray.300',
              _hover: {
                bg: 'gray.500/20',
                borderColor: 'gray.500/50',
              },
            })}
          >
            <Trash2 className={css({ w: 4, h: 4 })} />
            Clear Completed
          </Button>
        )}

        {/* Cancel All (only if has pending/processing) */}
        {hasPending && (
          <Button
            onClick={onCancelAll}
            size="sm"
            variant="outline"
            className={css({
              gap: '2',
              minH: '11',
              flex: { base: '1', sm: 'initial' },
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
            Cancel All
          </Button>
        )}
      </div>
    </div>
  )
}
