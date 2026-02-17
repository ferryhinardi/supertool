'use client'

import { Download, Trash2 } from 'lucide-react'
import { useState } from 'react'
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

interface SwipeablePDFCardProps {
  pdf: PDFFile
  onDownload: (pdf: PDFFile) => void
  onRemove: (pdf: PDFFile) => void
  formatBytes: (bytes: number) => string
  renderThumbnail: (pdf: PDFFile) => React.ReactNode
  disabled?: boolean
}

export function SwipeablePDFCard({
  pdf,
  onDownload,
  onRemove,
  formatBytes,
  renderThumbnail,
  disabled = false,
}: SwipeablePDFCardProps) {
  const [_isDragging] = useState(false)
  const [swipeOffset] = useState(0)

  // Status badge color
  const getStatusColor = () => {
    switch (pdf.status) {
      case 'completed':
        return { bg: 'green.500/20', text: 'green.400', border: 'green.500/30' }
      case 'processing':
        return { bg: 'blue.500/20', text: 'blue.400', border: 'blue.500/30' }
      case 'error':
        return { bg: 'red.500/20', text: 'red.400', border: 'red.500/30' }
      default:
        return { bg: 'gray.500/20', text: 'gray.400', border: 'gray.500/30' }
    }
  }

  const statusColor = getStatusColor()
  const canDownload = pdf.status === 'completed' && pdf.processedBlob
  const showLeftAction = swipeOffset < -50 && canDownload
  const showRightAction = swipeOffset > 50

  return (
    <div
      className={css({
        position: 'relative',
        display: { base: 'block', lg: 'none' },
        overflow: 'hidden',
        rounded: 'lg',
        bg: 'gray.800/30',
        border: '1px solid',
        borderColor: 'gray.700',
      })}
    >
      {/* Left action (Download) - revealed when swiping left */}
      {showLeftAction && (
        <div
          className={css({
            position: 'absolute',
            right: '0',
            top: '0',
            bottom: '0',
            w: '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'green.600',
            zIndex: 0,
          })}
        >
          <Download
            className={css({
              h: '6',
              w: '6',
              color: 'white',
            })}
          />
        </div>
      )}

      {/* Right action (Delete) - revealed when swiping right */}
      {showRightAction && (
        <div
          className={css({
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            w: '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'red.600',
            zIndex: 0,
          })}
        >
          <Trash2
            className={css({
              h: '6',
              w: '6',
              color: 'white',
            })}
          />
        </div>
      )}

      {/* Main card content */}
      <div
        className={css({
          position: 'relative',
          zIndex: 1,
          bg: 'gray.800/90',
          backdropFilter: 'blur(4px)',
        })}
      >
        <div
          className={css({
            display: 'flex',
            gap: '3',
            p: '4',
            alignItems: 'center',
          })}
        >
          {/* Thumbnail */}
          <div
            className={css({
              flexShrink: 0,
              w: '16',
              h: '20',
              rounded: 'md',
              overflow: 'hidden',
              bg: 'gray.900',
              border: '1px solid',
              borderColor: 'gray.700',
            })}
          >
            {renderThumbnail(pdf)}
          </div>

          {/* File info */}
          <div
            className={css({
              flex: 1,
              minW: 0,
            })}
          >
            {/* Name */}
            <div
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.200',
                truncate: true,
                mb: '1',
              })}
            >
              {pdf.name}
            </div>

            {/* Status badge */}
            <div
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.5',
                px: '2',
                py: '1',
                rounded: 'full',
                fontSize: 'xs',
                fontWeight: 'medium',
                bg: statusColor.bg,
                color: statusColor.text,
                border: '1px solid',
                borderColor: statusColor.border,
                mb: '2',
              })}
            >
              <div
                className={css({
                  h: '1.5',
                  w: '1.5',
                  rounded: 'full',
                  bg: statusColor.text,
                })}
              />
              {pdf.status.charAt(0).toUpperCase() + pdf.status.slice(1)}
            </div>

            {/* Progress bar */}
            {pdf.status === 'processing' && (
              <div
                className={css({
                  w: 'full',
                  h: '1.5',
                  rounded: 'full',
                  bg: 'gray.700',
                  overflow: 'hidden',
                  mb: '2',
                })}
              >
                <div
                  className={css({
                    h: 'full',
                    rounded: 'full',
                    bg: 'blue.500',
                    transition: 'width 300ms ease-out',
                  })}
                  style={{ width: `${pdf.progress}%` }}
                />
              </div>
            )}

            {/* Metadata */}
            <div
              className={css({
                fontSize: 'xs',
                color: 'white',
                display: 'flex',
                gap: '2',
              })}
            >
              <span>{formatBytes(pdf.size)}</span>
              <span>•</span>
              <span>{pdf.pages} pages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe hint */}
      {!_isDragging && swipeOffset === 0 && (
        <div
          className={css({
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            py: '1',
            px: '4',
            bg: 'gray.900/80',
            backdropFilter: 'blur(2px)',
            fontSize: 'xs',
            color: 'gray.600',
            textAlign: 'center',
            pointerEvents: 'none',
          })}
        >
          Swipe for actions
        </div>
      )}
    </div>
  )
}
