'use client'

import { memo } from 'react'
import { css, cx } from '@/styled-system/css'

// Import highlight.js theme
import 'highlight.js/styles/github-dark.css'

// Import markdown content component (now uses marked which is CommonJS compatible)
import MarkdownContent from './markdown-content'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * MarkdownRenderer - Renders markdown content with syntax highlighting
 * Supports GFM (GitHub Flavored Markdown), code blocks, tables, and more
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cx(markdownStyles, className)}>
      <MarkdownContent content={content} />
    </div>
  )
})

// ============================================
// Styles
// ============================================

const markdownStyles = css({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  lineHeight: '1.7',
  wordBreak: 'break-word',

  // Headings
  '& h1': {
    fontSize: 'xl',
    fontWeight: '700',
    mt: '4',
    mb: '3',
    pb: '2',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
  },
  '& h2': {
    fontSize: 'lg',
    fontWeight: '600',
    mt: '4',
    mb: '2',
    color: 'white',
  },
  '& h3': {
    fontSize: 'md',
    fontWeight: '600',
    mt: '3',
    mb: '2',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  '& h4, & h5, & h6': {
    fontSize: 'sm',
    fontWeight: '600',
    mt: '3',
    mb: '1',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Paragraphs
  '& p': {
    mb: '3',
    _last: {
      mb: '0',
    },
  },

  // Lists
  '& ul, & ol': {
    pl: '5',
    mb: '3',
    _last: {
      mb: '0',
    },
  },
  '& ul': {
    listStyleType: 'disc',
  },
  '& ol': {
    listStyleType: 'decimal',
  },
  '& li': {
    mb: '1',
    pl: '1',
    _last: {
      mb: '0',
    },
  },
  '& li > ul, & li > ol': {
    mt: '1',
    mb: '0',
  },

  // Task lists (GFM)
  '& ul.contains-task-list': {
    listStyleType: 'none',
    pl: '0',
  },
  '& li.task-list-item': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2',
  },
  '& input[type="checkbox"]': {
    mt: '1',
    accentColor: 'rgb(59, 130, 246)',
  },

  // Blockquotes
  '& blockquote': {
    borderLeft: '3px solid rgba(59, 130, 246, 0.5)',
    pl: '4',
    py: '1',
    my: '3',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    bg: 'rgba(59, 130, 246, 0.05)',
    rounded: 'md',
    roundedLeft: 'none',
  },
  '& blockquote > p': {
    mb: '0',
  },

  // Horizontal rule
  '& hr': {
    border: 'none',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    my: '4',
  },

  // Strong and emphasis
  '& strong': {
    fontWeight: '600',
    color: 'white',
  },
  '& em': {
    fontStyle: 'italic',
  },

  // Strikethrough
  '& del': {
    textDecoration: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Inline code
  '& code:not(pre code)': {
    px: '1.5',
    py: '0.5',
    rounded: 'md',
    bg: 'rgba(255, 255, 255, 0.1)',
    color: 'rgb(248, 113, 113)',
    fontSize: '0.875em',
    fontFamily: 'mono',
    fontWeight: '500',
  },

  // Code blocks
  '& pre': {
    position: 'relative',
    my: '3',
    p: '4',
    rounded: 'lg',
    overflow: 'auto',
    fontSize: '0.85em',
    lineHeight: '1.6',
    fontFamily: 'mono',
    bg: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  '& pre code': {
    bg: 'transparent !important',
    p: '0',
  },
  '& .hljs': {
    bg: 'transparent !important',
    p: '0',
  },

  // Links
  '& a': {
    color: 'rgb(96, 165, 250)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    transition: 'color 0.2s ease',
    _hover: {
      color: 'rgb(147, 197, 253)',
    },
  },

  // Tables
  '& table': {
    w: 'full',
    my: '3',
    borderCollapse: 'collapse',
    fontSize: 'sm',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    rounded: 'lg',
    overflow: 'hidden',
  },
  '& th': {
    textAlign: 'left',
    p: '3',
    fontWeight: '600',
    bg: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
  },
  '& td': {
    p: '3',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  '& tr:last-child td': {
    borderBottom: 'none',
  },
  '& tr:hover td': {
    bg: 'rgba(255, 255, 255, 0.02)',
  },

  // Images
  '& img': {
    maxW: 'full',
    h: 'auto',
    rounded: 'lg',
    my: '3',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  // First child margin fix
  '& > :first-child': {
    mt: '0',
  },
})
