'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  Copy,
  Droplet,
  Edit3,
  FileDown,
  FileOutput,
  Image as ImageIcon,
  Merge,
  RotateCw,
  Settings,
  Split,
  Trash2,
} from 'lucide-react'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export type OperationType =
  | 'merge'
  | 'split'
  | 'compress'
  | 'toImages'
  | 'imagesToPdf'
  | 'watermark'
  | 'extract'
  | 'rotate'
  | 'toWord'
  | 'edit'
  | 'grayscale'
  | 'deletePages'

interface Operation {
  value: OperationType
  label: string
  icon: LucideIcon
  color: string
  description: string
}

interface OperationCategory {
  label: string
  operations: Operation[]
}

const operationCategories: OperationCategory[] = [
  {
    label: 'Combine & Split',
    operations: [
      {
        value: 'merge',
        label: 'Merge PDFs',
        icon: Merge,
        color: '#3b82f6',
        description: 'Combine multiple PDFs into one',
      },
      {
        value: 'split',
        label: 'Split PDF',
        icon: Split,
        color: '#a855f7',
        description: 'Break PDF into separate files',
      },
    ],
  },
  {
    label: 'Optimize & Convert',
    operations: [
      {
        value: 'compress',
        label: 'Compress',
        icon: Archive,
        color: '#10b981',
        description: 'Reduce file size',
      },
      {
        value: 'grayscale',
        label: 'Grayscale',
        icon: Settings,
        color: '#6b7280',
        description: 'Convert to black & white',
      },
    ],
  },
  {
    label: 'Transform',
    operations: [
      {
        value: 'rotate',
        label: 'Rotate',
        icon: RotateCw,
        color: '#f97316',
        description: 'Rotate pages',
      },
      {
        value: 'watermark',
        label: 'Watermark',
        icon: Droplet,
        color: '#06b6d4',
        description: 'Add text watermark',
      },
      {
        value: 'extract',
        label: 'Extract Pages',
        icon: Copy,
        color: '#ec4899',
        description: 'Extract specific pages',
      },
      {
        value: 'deletePages',
        label: 'Delete Pages',
        icon: Trash2,
        color: '#ef4444',
        description: 'Remove unwanted pages',
      },
    ],
  },
  {
    label: 'Convert',
    operations: [
      {
        value: 'toImages',
        label: 'PDF → Images',
        icon: ImageIcon,
        color: '#eab308',
        description: 'Convert to PNG images',
      },
      {
        value: 'imagesToPdf',
        label: 'Images → PDF',
        icon: FileDown,
        color: '#6366f1',
        description: 'Convert images to PDF',
      },
      {
        value: 'toWord',
        label: 'PDF → Word',
        icon: FileOutput,
        color: '#14b8a6',
        description: 'Convert to DOCX',
      },
    ],
  },
  {
    label: 'Edit & Annotate',
    operations: [
      {
        value: 'edit',
        label: 'Edit PDF',
        icon: Edit3,
        color: '#ef4444',
        description: 'Add annotations',
      },
    ],
  },
]

interface OperationGridProps {
  selectedOperation: OperationType
  onOperationChange: (operation: OperationType) => void
  disabled?: boolean
}

export function OperationGrid({
  selectedOperation,
  onOperationChange,
  disabled = false,
}: OperationGridProps) {
  const handleOperationClick = (operation: OperationType) => {
    if (disabled) return

    onOperationChange(operation)
    trackEvent({
      action: 'operation_changed',
      category: 'pdf_tools',
      label: operation,
    })
  }

  return (
    <div className={css({ spaceY: '6' })}>
      {operationCategories.map((category, categoryIndex) => (
        <motion.div
          key={category.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1, duration: 0.3 }}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'gray.400',
              textTransform: 'uppercase',
              letterSpacing: 'wider',
            })}
          >
            {category.label}
          </h3>

          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
              gap: '3',
              w: 'full',
            })}
          >
            {category.operations.map((op) => {
              const isSelected = selectedOperation === op.value
              const Icon = op.icon

              return (
                <motion.button
                  key={op.value}
                  onClick={() => handleOperationClick(op.value)}
                  disabled={disabled}
                  whileHover={{ scale: disabled ? 1 : 1.02 }}
                  whileTap={{ scale: disabled ? 1 : 0.98 }}
                  className={css({
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    p: '4',
                    rounded: 'lg',
                    border: '2px solid',
                    borderColor: isSelected ? 'currentColor' : 'gray.700',
                    bg: isSelected ? 'currentColor/10' : 'gray.800/50',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    _hover: disabled
                      ? {}
                      : {
                          borderColor: 'currentColor',
                          bg: 'currentColor/5',
                        },
                    _focus: {
                      outline: '2px solid',
                      outlineColor: 'currentColor',
                      outlineOffset: '2px',
                    },
                  })}
                  style={{ color: op.color }}
                  aria-pressed={isSelected}
                  aria-label={`${op.label}: ${op.description}`}
                >
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <div
                      className={css({
                        position: 'absolute',
                        inset: '-2px',
                        rounded: 'lg',
                        opacity: 0.5,
                        pointerEvents: 'none',
                        filter: 'blur(8px)',
                      })}
                      style={{ background: op.color }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={css({
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      h: '12',
                      w: '12',
                      rounded: 'lg',
                      bg: isSelected ? 'currentColor/20' : 'currentColor/10',
                    })}
                  >
                    <Icon
                      className={css({
                        h: '6',
                        w: '6',
                      })}
                      style={{ color: op.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className={css({ minW: '0', flex: '1' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        mb: '1',
                      })}
                    >
                      <h4
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: isSelected ? 'currentColor' : 'gray.200',
                        })}
                      >
                        {op.label}
                      </h4>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            h: '5',
                            w: '5',
                            rounded: 'full',
                            bg: 'currentColor',
                          })}
                        >
                          <svg
                            className={css({ h: '3', w: '3', color: 'white' })}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <title>Selected</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <p
                      className={css({
                        fontSize: 'xs',
                        color: isSelected ? 'currentColor/80' : 'gray.500',
                        lineHeight: 'tight',
                      })}
                    >
                      {op.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
