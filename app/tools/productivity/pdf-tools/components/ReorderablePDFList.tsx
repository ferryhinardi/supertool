'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, GripVertical, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { css } from '@/styled-system/css'
import { SwipeablePDFCard } from './SwipeablePDFCard'

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

interface SortablePDFCardProps {
  pdf: PDFFile
  onRemove: (id: string) => void
  onDownload?: (pdf: PDFFile) => void
  formatBytes: (bytes: number) => string
  thumbnail?: ReactNode
  disabled?: boolean
}

function SortablePDFCard({
  pdf,
  onRemove,
  onDownload,
  formatBytes,
  thumbnail,
  disabled = false,
}: SortablePDFCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pdf.id,
    disabled: disabled || pdf.status === 'processing',
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const canDrag = !disabled && pdf.status !== 'processing'

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={css({
        display: { base: 'none', lg: 'block' },
        rounded: 'lg',
        border: '1px solid',
        borderColor: pdf.status === 'error' ? 'red.500/50' : 'gray.800',
        bg: pdf.status === 'error' ? 'red.500/10' : 'gray.900/80',
        p: '4',
        position: 'relative',
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: canDrag ? 'grab' : 'not-allowed',
            color: canDrag ? 'gray.400' : 'gray.600',
            bg: 'transparent',
            border: 'none',
            p: '0',
            _hover: canDrag ? { color: 'gray.300' } : {},
            _active: canDrag ? { cursor: 'grabbing' } : {},
            opacity: canDrag ? 1 : 0.5,
            touchAction: 'none',
          })}
          aria-label="Drag to reorder"
          tabIndex={canDrag ? 0 : -1}
          disabled={!canDrag}
        >
          <GripVertical
            className={css({
              h: '5',
              w: '5',
            })}
          />
        </button>

        {/* Thumbnail */}
        {thumbnail && <div className={css({ flexShrink: 0 })}>{thumbnail}</div>}

        {/* Completion badge */}
        {pdf.status === 'completed' && (
          <div
            className={css({
              position: 'absolute',
              top: '1',
              right: '1',
              p: '1',
              rounded: 'full',
              bg: 'green.500',
            })}
          >
            <CheckCircle
              className={css({
                h: '3',
                w: '3',
                color: 'white',
              })}
              aria-label="Completed"
            />
          </div>
        )}

        {/* File Info */}
        <div className={css({ minW: '0', flex: '1' })}>
          <div
            className={css({
              mb: '2',
              display: 'flex',
              alignItems: 'start',
              justifyContent: 'space-between',
              gap: '2',
            })}
          >
            <div className={css({ minW: '0', flex: '1' })}>
              <p
                className={css({
                  truncate: true,
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.200',
                })}
              >
                {pdf.name}
              </p>
              <div
                className={css({
                  mt: '1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                  fontSize: 'xs',
                  color: 'gray.500',
                  flexWrap: 'wrap',
                })}
              >
                <span>{formatBytes(pdf.size)}</span>
                <span>•</span>
                <span>{pdf.pages} pages</span>
                {pdf.processedSize && (
                  <>
                    <span>→</span>
                    <span
                      className={css({
                        color: 'red.400',
                      })}
                    >
                      {formatBytes(pdf.processedSize)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={css({ display: 'flex', gap: '2', flexShrink: 0 })}>
              {pdf.status === 'completed' && onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(pdf)}
                  className={css({
                    px: '3',
                    py: '1',
                    fontSize: 'xs',
                  })}
                >
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(pdf.id)}
                disabled={pdf.status === 'processing'}
                className={css({
                  color: 'red.400',
                  _hover: {
                    bg: 'red.500/10',
                  },
                })}
                aria-label={`Remove ${pdf.name}`}
              >
                <Trash2
                  className={css({
                    h: '4',
                    w: '4',
                  })}
                />
              </Button>
            </div>
          </div>

          {/* Progress */}
          {pdf.status === 'processing' && (
            <div className={css({ mt: '3', spaceY: '2' })}>
              <Progress value={pdf.progress} className={css({ h: '2' })} />
              <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
                Processing... {pdf.progress}%
              </p>
            </div>
          )}

          {/* Error */}
          {pdf.status === 'error' && pdf.error && (
            <div
              className={css({
                mt: '2',
                p: '2',
                rounded: 'md',
                bg: 'red.500/20',
                borderColor: 'red.500/30',
                border: '1px solid',
              })}
            >
              <p className={css({ fontSize: 'xs', color: 'red.200' })}>{pdf.error}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface ReorderablePDFListProps {
  pdfs: PDFFile[]
  onReorder: (pdfs: PDFFile[]) => void
  onRemove: (id: string) => void
  onDownload?: (pdf: PDFFile) => void
  formatBytes: (bytes: number) => string
  renderThumbnail?: (pdf: PDFFile) => ReactNode
  disabled?: boolean
}

export function ReorderablePDFList({
  pdfs,
  onReorder,
  onRemove,
  onDownload,
  formatBytes,
  renderThumbnail,
  disabled = false,
}: ReorderablePDFListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = pdfs.findIndex((pdf) => pdf.id === active.id)
      const newIndex = pdfs.findIndex((pdf) => pdf.id === over.id)

      const reorderedPdfs = arrayMove(pdfs, oldIndex, newIndex)
      onReorder(reorderedPdfs)
    }
  }

  return (
    <>
      {/* Desktop: Sortable drag-and-drop list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pdfs.map((pdf) => pdf.id)} strategy={verticalListSortingStrategy}>
          <div
            className={css({
              display: { base: 'none', lg: 'block' },
              maxH: '[600px]',
              spaceY: '3',
              overflowY: 'auto',
              pr: '2',
            })}
          >
            <AnimatePresence>
              {pdfs.map((pdf) => (
                <SortablePDFCard
                  key={pdf.id}
                  pdf={pdf}
                  onRemove={onRemove}
                  onDownload={onDownload}
                  formatBytes={formatBytes}
                  thumbnail={renderThumbnail?.(pdf)}
                  disabled={disabled}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {/* Mobile: Swipeable cards */}
      <div
        className={css({
          display: { base: 'block', lg: 'none' },
          maxH: '[600px]',
          spaceY: '3',
          overflowY: 'auto',
          pr: '2',
        })}
      >
        <AnimatePresence>
          {pdfs.map((pdf) => (
            <SwipeablePDFCard
              key={pdf.id}
              pdf={pdf}
              onDownload={(p) => onDownload?.(p)}
              onRemove={(p) => onRemove(p.id)}
              formatBytes={formatBytes}
              renderThumbnail={(p) => renderThumbnail?.(p) || null}
              disabled={disabled}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
