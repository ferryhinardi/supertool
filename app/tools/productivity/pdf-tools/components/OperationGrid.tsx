'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  Bookmark,
  BookmarkCheck,
  Brain,
  ChevronDown,
  ChevronUp,
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
  Globe,
  GripVertical,
  Hash,
  ImageDown,
  Image as ImageIcon,
  Layers,
  Lock,
  LockOpen,
  Merge,
  RotateCw,
  Search,
  Settings,
  Split,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
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
  | 'protect'
  | 'unlock'
  | 'duplicatePages'
  | 'reorder'
  | 'addPageNumbers'
  | 'extractText'
  | 'editMetadata'
  | 'ocrExtract'
  | 'flatten'
  | 'addHeaderFooter'
  | 'addBookmarks'
  | 'extractImages'
  | 'optimizeWeb'
  | 'splitByBookmarks'
  | 'aiSummarize'

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
      {
        value: 'splitByBookmarks',
        label: 'Split by Bookmarks',
        icon: BookmarkCheck,
        color: '#a855f7',
        description: 'Split PDF at each bookmark',
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
        value: 'optimizeWeb',
        label: 'Optimize for Web',
        icon: Globe,
        color: '#06b6d4',
        description: 'Optimize for faster web viewing',
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
        value: 'reorder',
        label: 'Reorder Pages',
        icon: GripVertical,
        color: '#8b5cf6',
        description: 'Drag pages to reorder',
      },
      {
        value: 'addPageNumbers',
        label: 'Add Page Numbers',
        icon: Hash,
        color: '#0ea5e9',
        description: 'Number pages automatically',
      },
      {
        value: 'addBookmarks',
        label: 'Add Bookmarks',
        icon: Bookmark,
        color: '#0ea5e9',
        description: 'Add table of contents',
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
      {
        value: 'duplicatePages',
        label: 'Duplicate Pages',
        icon: CopyPlus,
        color: '#3b82f6',
        description: 'Create copies of selected pages',
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
      {
        value: 'extractText',
        label: 'PDF → Text',
        icon: FileText,
        color: '#10b981',
        description: 'Extract all text content',
      },
      {
        value: 'ocrExtract',
        label: 'OCR Text Extract',
        icon: FileScan,
        color: '#8b5cf6',
        description: 'Extract text from scanned PDFs',
      },
      {
        value: 'extractImages',
        label: 'Extract Images',
        icon: ImageDown,
        color: '#f59e0b',
        description: 'Extract all embedded images',
      },
    ],
  },
  {
    label: 'AI-Powered',
    operations: [
      {
        value: 'aiSummarize',
        label: 'AI Summarize',
        icon: Brain,
        color: '#a855f7',
        description: 'AI-powered document summary & insights',
      },
    ],
  },
  {
    label: 'Security',
    operations: [
      {
        value: 'protect',
        label: 'Protect PDF',
        icon: Lock,
        color: '#10b981',
        description: 'Add password protection',
      },
      {
        value: 'unlock',
        label: 'Unlock PDF',
        icon: LockOpen,
        color: '#22c55e',
        description: 'Remove password protection',
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
      {
        value: 'editMetadata',
        label: 'Edit Metadata',
        icon: FileEdit,
        color: '#06b6d4',
        description: 'Edit PDF properties',
      },
      {
        value: 'flatten',
        label: 'Flatten PDF',
        icon: Layers,
        color: '#f59e0b',
        description: 'Flatten forms and annotations',
      },
      {
        value: 'addHeaderFooter',
        label: 'Add Headers/Footers',
        icon: FileType,
        color: '#8b5cf6',
        description: 'Add headers and footers',
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const handleOperationClick = (operation: OperationType) => {
    if (disabled) return

    onOperationChange(operation)
    trackEvent({
      action: 'operation_changed',
      category: 'pdf_tools',
      label: operation,
    })
  }

  // Filter operations by search query and category
  const filteredCategories = useMemo(() => {
    let categories = operationCategories

    // Filter by category
    if (selectedCategory !== 'All') {
      categories = categories.filter((cat) => cat.label === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      categories = categories
        .map((cat) => ({
          ...cat,
          operations: cat.operations.filter(
            (op) =>
              op.label.toLowerCase().includes(query) || op.description.toLowerCase().includes(query)
          ),
        }))
        .filter((cat) => cat.operations.length > 0)
    }

    return categories
  }, [searchQuery, selectedCategory])

  // Get all category labels for tabs
  const categoryLabels = ['All', ...operationCategories.map((cat) => cat.label)]

  // Toggle category collapse
  const toggleCategory = (categoryLabel: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryLabel)) {
        next.delete(categoryLabel)
      } else {
        next.add(categoryLabel)
      }
      return next
    })
  }

  return (
    <div className={css({ spaceY: '6' })}>
      {/* Search Bar */}
      <div className={css({ position: 'relative' })}>
        <Search
          className={css({
            position: 'absolute',
            left: '3',
            top: '50%',
            transform: 'translateY(-50%)',
            h: '5',
            w: '5',
            color: 'gray.500',
            pointerEvents: 'none',
          })}
        />
        <input
          type="text"
          placeholder="Search operations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={css({
            w: 'full',
            pl: '10',
            pr: searchQuery ? '10' : '4',
            py: '3',
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'gray.700',
            bg: 'gray.800/50',
            color: 'white',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _focus: {
              outline: '2px solid',
              outlineColor: 'red.500',
              outlineOffset: '2px',
              borderColor: 'red.500',
            },
            _placeholder: {
              color: 'gray.500',
            },
          })}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className={css({
              position: 'absolute',
              right: '3',
              top: '50%',
              transform: 'translateY(-50%)',
              p: '1',
              rounded: 'full',
              color: 'gray.500',
              transition: 'all 0.2s',
              _hover: {
                color: 'white',
                bg: 'gray.700',
              },
            })}
            aria-label="Clear search"
          >
            <X className={css({ h: '4', w: '4' })} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div
        className={css({
          display: 'flex',
          gap: '2',
          overflowX: 'auto',
          pb: '2',
          '&::-webkit-scrollbar': {
            h: '2',
          },
          '&::-webkit-scrollbar-track': {
            bg: 'gray.800',
            rounded: 'full',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: 'gray.700',
            rounded: 'full',
            _hover: {
              bg: 'gray.600',
            },
          },
        })}
      >
        {categoryLabels.map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => setSelectedCategory(label)}
            className={css({
              px: '4',
              py: '2',
              rounded: 'full',
              fontSize: 'sm',
              fontWeight: 'medium',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: selectedCategory === label ? 'red.500' : 'gray.700',
              bg: selectedCategory === label ? 'red.500/20' : 'gray.800/50',
              color: selectedCategory === label ? 'red.400' : 'gray.400',
              _hover: {
                borderColor: selectedCategory === label ? 'red.500' : 'gray.600',
                bg: selectedCategory === label ? 'red.500/30' : 'gray.800',
                color: selectedCategory === label ? 'red.300' : 'white',
              },
            })}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
          Found {filteredCategories.reduce((sum, cat) => sum + cat.operations.length, 0)}{' '}
          operation(s)
        </div>
      )}

      {/* Categories */}
      <AnimatePresence mode="wait">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, categoryIndex) => {
            const isCollapsed = collapsedCategories.has(category.label)

            return (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: categoryIndex * 0.05, duration: 0.3 }}
              >
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.label)}
                  className={css({
                    w: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: '3',
                    p: '2',
                    rounded: 'lg',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'gray.800/50',
                    },
                  })}
                >
                  <h3
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: 'wider',
                    })}
                  >
                    {category.label}
                    <span className={css({ ml: '2', color: 'gray.500', fontWeight: 'normal' })}>
                      ({category.operations.length})
                    </span>
                  </h3>
                  {isCollapsed ? (
                    <ChevronDown className={css({ h: '5', w: '5', color: 'gray.500' })} />
                  ) : (
                    <ChevronUp className={css({ h: '5', w: '5', color: 'gray.500' })} />
                  )}
                </button>

                {/* Operations Grid */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={css({
                        overflow: 'hidden',
                        mb: '6',
                      })}
                    >
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
                              type="button"
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
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={css({
              py: '12',
              textAlign: 'center',
              color: 'gray.500',
            })}
          >
            <p>No operations found matching &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={css({
                mt: '4',
                px: '4',
                py: '2',
                rounded: 'lg',
                bg: 'gray.800',
                color: 'white',
                fontSize: 'sm',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'gray.700',
                },
              })}
            >
              Clear search
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
