'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'
import type { OperationType } from './OperationGrid'

interface EmptyStateProps {
  operation: OperationType
  onLoadSample?: () => void
  onUploadClick: () => void
}

const operationTips: Record<
  OperationType,
  {
    title: string
    description: string
    tips: string[]
  }
> = {
  merge: {
    title: 'Merge Multiple PDFs',
    description: 'Combine 2 or more PDF files into a single document',
    tips: ['Upload files in the order you want them merged', 'Drag to reorder before merging'],
  },
  split: {
    title: 'Split PDF into Parts',
    description: 'Break a multi-page PDF into separate documents',
    tips: ['Upload a PDF with multiple pages', 'Choose where to split the document'],
  },
  compress: {
    title: 'Compress PDF Size',
    description: 'Reduce file size by up to 80% without losing quality',
    tips: ['Large PDFs? Choose high compression', 'Perfect for email attachments'],
  },
  toImages: {
    title: 'Convert PDF to Images',
    description: 'Extract each page as a high-quality PNG image',
    tips: ['Great for sharing specific pages', 'Each page becomes a separate image'],
  },
  imagesToPdf: {
    title: 'Convert Images to PDF',
    description: 'Combine JPG, PNG, or WebP images into a PDF document',
    tips: ['Upload multiple images at once', 'Choose page size and fit mode'],
  },
  watermark: {
    title: 'Add Watermark to PDF',
    description: 'Add text watermark to protect your documents',
    tips: ['Customize text and opacity', 'Applied to all pages automatically'],
  },
  extract: {
    title: 'Extract PDF Pages',
    description: 'Extract specific pages from a PDF document',
    tips: ['Specify page range to extract', 'Create a new PDF with selected pages'],
  },
  rotate: {
    title: 'Rotate PDF Pages',
    description: 'Rotate all pages by 90, 180, 270, or 360 degrees',
    tips: ['Quick fix for scanned documents', 'Rotate clockwise or counter-clockwise'],
  },
  toWord: {
    title: 'Convert PDF to Word',
    description: 'Convert PDF to editable DOCX format',
    tips: ['Preserve text formatting', 'Edit content in Microsoft Word'],
  },
  edit: {
    title: 'Edit & Annotate PDF',
    description: 'Add text, shapes, and annotations to your PDF',
    tips: ['Draw shapes and add text', 'Highlight important sections'],
  },
  grayscale: {
    title: 'Convert to Grayscale',
    description: 'Convert color PDF to black and white',
    tips: ['Reduce file size significantly', 'Perfect for printing documents'],
  },
  deletePages: {
    title: 'Delete PDF Pages',
    description: 'Remove unwanted pages from your PDF document',
    tips: ['Select multiple pages to delete', 'Preview pages before deletion'],
  },
  unlock: {
    title: 'Unlock PDF',
    description: 'Remove password protection from encrypted PDFs',
    tips: [
      'Enter the correct password to unlock',
      'Creates a new unprotected PDF',
      'Preserves all content and formatting',
      'Useful for removing restrictions on PDFs you own',
    ],
  },
  duplicatePages: {
    title: 'Duplicate Pages',
    description: 'Create copies of specific pages within your PDF',
    tips: [
      'Select pages you want to duplicate',
      'Choose how many copies to create (1-10)',
      'Duplicates are inserted right after the original page',
      'Useful for creating forms or repeated sections',
    ],
  },
  reorder: {
    title: 'Reorder PDF Pages',
    description: 'Drag and drop pages to rearrange them',
    tips: [
      'Drag pages up or down to change order',
      'Visual preview of new page order',
      'All pages must remain in the document',
      'Perfect for fixing page order in scanned documents',
    ],
  },
  addPageNumbers: {
    title: 'Add Page Numbers',
    description: 'Automatically number your PDF pages',
    tips: [
      'Choose position: top/bottom, left/center/right',
      'Select format: numbers, Roman numerals, or "page/total"',
      'Customize font size and starting number',
      'Numbers added to all pages automatically',
    ],
  },
  extractText: {
    title: 'Extract Text from PDF',
    description: 'Extract all text content from your PDF document',
    tips: [
      'Extracts text from all pages',
      'Preserves page structure with page markers',
      'Output as plain text (.txt) file',
      'Perfect for content analysis or copying text',
    ],
  },
  editMetadata: {
    title: 'Edit PDF Metadata',
    description: 'View and edit document properties and information',
    tips: [
      'Edit title, author, subject, and keywords',
      'Set creator and producer information',
      'Modification date updated automatically',
      'Useful for organizing and cataloging PDFs',
    ],
  },
  ocrExtract: {
    title: 'OCR Text Extraction',
    description: 'Extract text from scanned PDFs using Optical Character Recognition',
    tips: [
      'Works with scanned documents and images in PDFs',
      'Supports multiple languages (English default)',
      'Higher resolution improves accuracy',
      'Exports plain text file with page headers',
    ],
  },
  protect: {
    title: 'Protect PDF',
    description: 'Add password protection and set permissions',
    tips: [
      'Requires password to open the PDF',
      'Set different user and owner passwords',
      'Control printing, copying, and editing permissions',
      'Keeps sensitive documents secure',
    ],
  },
  flatten: {
    title: 'Flatten PDF',
    description: 'Convert interactive elements to static content',
    tips: [
      'Flattens form fields to regular text',
      'Converts annotations to page content',
      'Prevents further editing of forms',
      'Creates more portable PDFs',
    ],
  },
  addHeaderFooter: {
    title: 'Add Headers/Footers',
    description: 'Add custom headers and footers to all pages',
    tips: [
      'Add text to top (header) or bottom (footer)',
      'Choose left, center, or right alignment',
      'Include page numbers with {page} and {total}',
      'Customize font size and appearance',
    ],
  },
  addBookmarks: {
    title: 'Add Bookmarks',
    description: 'Add a table of contents with navigation bookmarks',
    tips: [
      'Creates a TOC page at the beginning',
      'Add multiple bookmarks pointing to different pages',
      'Support for nested bookmarks with levels',
      'Easy navigation within the PDF',
    ],
  },
  extractImages: {
    title: 'Extract Images',
    description: 'Extract all embedded images from PDF files',
    tips: [
      'Extract images in PNG format',
      'Maintains original image quality',
      'Process all pages automatically',
      'Download images as individual files',
    ],
  },
  optimizeWeb: {
    title: 'Optimize for Web',
    description: 'Optimize PDF for faster loading on websites',
    tips: [
      'Removes unused objects and references',
      'Creates clean document structure',
      'Preserves all content and metadata',
      'Ideal for web publishing and sharing',
    ],
  },
  splitByBookmarks: {
    title: 'Split by Bookmarks',
    description: 'Split PDF into separate files at each bookmark',
    tips: [
      'PDF must have existing bookmarks/table of contents',
      'Creates one file per top-level bookmark',
      'Automatically names files based on bookmark titles',
      'Preserves all content and formatting',
    ],
  },
  aiSummarize: {
    title: 'AI-Powered PDF Summarization',
    description: 'Get an intelligent summary of your PDF using AI',
    tips: [
      'Analyzes document content and structure',
      'Extracts key points and action items',
      'Identifies document type and main topics',
      'Export summary as text file',
    ],
  },
}

export function EmptyState({ operation, onLoadSample, onUploadClick }: EmptyStateProps) {
  const tip = operationTips[operation]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { base: '12', sm: '16' },
        px: '4',
        textAlign: 'center',
      })}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        className={css({
          mb: '6',
          position: 'relative',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            h: '24',
            w: '24',
            rounded: 'full',
            bg: 'red.500/20',
            border: '2px dashed',
            borderColor: 'red.500/40',
          })}
        >
          <FileText
            className={css({
              h: '12',
              w: '12',
              color: 'red.400',
            })}
          />
        </div>

        {/* Floating sparkles */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className={css({
            position: 'absolute',
            top: '-2',
            right: '-2',
          })}
        >
          <Sparkles
            className={css({
              h: '6',
              w: '6',
              color: 'yellow.400',
            })}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <h3
        className={css({
          mb: '2',
          fontSize: { base: 'xl', sm: '2xl' },
          fontWeight: 'bold',
          color: 'gray.100',
        })}
      >
        {tip.title}
      </h3>

      <p
        className={css({
          mb: '6',
          maxW: 'md',
          fontSize: { base: 'sm', sm: 'base' },
          color: 'gray.400',
          lineHeight: 'relaxed',
        })}
      >
        {tip.description}
      </p>

      {/* Tips */}
      <div
        className={css({
          mb: '8',
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
          maxW: 'md',
        })}
      >
        {tip.tips.map((tipText) => (
          <motion.div
            key={tipText}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + tip.tips.indexOf(tipText) * 0.1 }}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              fontSize: 'sm',
              color: 'gray.500',
            })}
          >
            <div
              className={css({
                h: '1.5',
                w: '1.5',
                rounded: 'full',
                bg: 'red.500',
                flexShrink: 0,
              })}
            />
            {tipText}
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', sm: 'row' },
          gap: '3',
          w: { base: 'full', sm: 'auto' },
        })}
      >
        <Button
          onClick={onUploadClick}
          size="lg"
          className={css({
            gap: '2',
            bg: 'red.600',
            _hover: {
              bg: 'red.700',
            },
          })}
        >
          <Upload
            className={css({
              h: '5',
              w: '5',
            })}
          />
          Upload Files
        </Button>

        {onLoadSample && (
          <Button
            onClick={onLoadSample}
            variant="outline"
            size="lg"
            className={css({
              gap: '2',
              borderColor: 'gray.700',
              color: 'gray.300',
              _hover: {
                bg: 'gray.800',
              },
            })}
          >
            <Sparkles
              className={css({
                h: '5',
                w: '5',
              })}
            />
            Try Example PDF
          </Button>
        )}
      </div>

      {/* Quick start hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={css({
          mt: '8',
          p: '4',
          rounded: 'lg',
          bg: 'gray.800/50',
          border: '1px solid',
          borderColor: 'gray.700',
          maxW: 'md',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'start',
            gap: '3',
            textAlign: 'left',
          })}
        >
          <Sparkles
            className={css({
              h: '5',
              w: '5',
              color: 'yellow.400',
              flexShrink: 0,
              mt: '0.5',
            })}
          />
          <div>
            <h4
              className={css({
                mb: '1',
                fontSize: 'sm',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Quick Start
            </h4>
            <p
              className={css({
                fontSize: 'xs',
                color: 'gray.400',
                lineHeight: 'relaxed',
              })}
            >
              1. Upload your files • 2. Adjust settings if needed • 3. Click Process • 4. Download
              results
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
