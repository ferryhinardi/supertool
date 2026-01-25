'use client'

import dynamic from 'next/dynamic'
import type { ComponentType, ReactNode } from 'react'
import { memo, useCallback, useState } from 'react'
import { css, cx } from '@/styled-system/css'

// Import highlight.js theme
import 'highlight.js/styles/github-dark.css'

interface MarkdownContentProps {
  content: string
}

// Dynamically import the markdown component with SSR disabled
// This is necessary because react-markdown v10 and its dependencies use ESM exports
// that cause "ReferenceError: boolean is not defined" during SSR with Turbopack
const DynamicMarkdownContent = dynamic<MarkdownContentProps>(
  () => import('./markdown-content') as Promise<{ default: ComponentType<MarkdownContentProps> }>,
  {
    ssr: false,
    loading: () => <div className={css({ whiteSpace: 'pre-wrap', opacity: 0.7 })}>Loading...</div>,
  }
)

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
      <DynamicMarkdownContent content={content} />
    </div>
  )
})

interface CodeBlockWrapperProps {
  children?: ReactNode
  className?: string
}

/**
 * CodeBlockWrapper - Wraps code blocks with a copy button
 */
export function CodeBlockWrapper({ children, className, ...props }: CodeBlockWrapperProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCopy = useCallback(async () => {
    // Extract text content from children
    const codeContent = extractTextContent(children)

    try {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }, [children])

  return (
    <div
      className={codeBlockWrapperStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="group"
    >
      <button
        type="button"
        onClick={handleCopy}
        className={css({
          position: 'absolute',
          top: '2',
          right: '2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '8',
          h: '8',
          rounded: 'md',
          bg: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.6)',
          border: 'none',
          cursor: 'pointer',
          opacity: isHovered ? '1' : '0',
          transition: 'all 0.2s ease',
          zIndex: '10',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.9)',
          },
          _active: {
            transform: 'scale(0.95)',
          },
        })}
        aria-label={copied ? 'Copied!' : 'Copy code'}
        title={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <pre className={cx(preStyles, className)} {...props}>
        {children}
      </pre>
    </div>
  )
}

/**
 * Extract text content from React elements recursively
 */
export function extractTextContent(node: ReactNode): string {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (typeof node === 'boolean') return ''

  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('')
  }

  // Handle React elements
  if (typeof node === 'object' && 'props' in node) {
    const element = node as { props?: { children?: ReactNode } }
    if (element.props?.children) {
      return extractTextContent(element.props.children)
    }
  }

  return ''
}

function CopyIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Copy</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Copied</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

// ============================================
// Styles (exported for use in markdown-content)
// ============================================

export const markdownStyles = css({
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

  // First child margin fix
  '& > :first-child': {
    mt: '0',
  },
})

export const inlineCodeStyles = css({
  px: '1.5',
  py: '0.5',
  rounded: 'md',
  bg: 'rgba(255, 255, 255, 0.1)',
  color: 'rgb(248, 113, 113)',
  fontSize: '0.875em',
  fontFamily: 'mono',
  fontWeight: '500',
})

export const codeBlockWrapperStyles = css({
  position: 'relative',
  my: '3',
  rounded: 'lg',
  overflow: 'hidden',
  bg: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
})

export const preStyles = css({
  m: '0',
  p: '4',
  overflow: 'auto',
  fontSize: '0.85em',
  lineHeight: '1.6',
  fontFamily: 'mono',
  bg: 'transparent !important',

  // Override highlight.js background
  '& code': {
    bg: 'transparent !important',
  },

  // Syntax highlighting adjustments
  '& .hljs': {
    bg: 'transparent !important',
    p: '0',
  },
})

export const linkStyles = css({
  color: 'rgb(96, 165, 250)',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  transition: 'color 0.2s ease',

  _hover: {
    color: 'rgb(147, 197, 253)',
  },
})

export const tableWrapperStyles = css({
  overflowX: 'auto',
  my: '3',
  rounded: 'lg',
  border: '1px solid rgba(255, 255, 255, 0.1)',
})

export const tableStyles = css({
  w: 'full',
  borderCollapse: 'collapse',
  fontSize: 'sm',

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
})

export const imageStyles = css({
  maxW: 'full',
  h: 'auto',
  rounded: 'lg',
  my: '3',
  border: '1px solid rgba(255, 255, 255, 0.1)',
})
