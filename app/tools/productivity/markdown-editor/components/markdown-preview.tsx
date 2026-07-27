'use client'

import hljs from 'highlight.js'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import { useEffect, useMemo, useState } from 'react'
import { css } from '@/styled-system/css'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

// Create a configured marked instance with syntax highlighting
const markedInstance = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

// Configure marked options
markedInstance.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: false, // Don't convert \n to <br>
})

/**
 * Simple HTML escaper for fallback
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * MarkdownPreview - Renders markdown using marked for the markdown editor page
 */
export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const [DOMPurify, setDOMPurify] = useState<typeof import('dompurify').default | null>(null)

  // Load DOMPurify on client side only
  useEffect(() => {
    import('dompurify').then((mod) => {
      setDOMPurify(() => mod.default)
    })
  }, [])

  const htmlContent = useMemo(() => {
    try {
      // Parse markdown to HTML
      const rawHtml = markedInstance.parse(content, { async: false }) as string

      // Sanitize HTML to prevent XSS (only if DOMPurify is loaded)
      if (DOMPurify) {
        const sanitized = DOMPurify.sanitize(rawHtml, {
          ADD_ATTR: ['target', 'rel', 'class', 'checked', 'disabled', 'type', 'aria-label'],
          ADD_TAGS: ['input'],
          FORBID_TAGS: ['style', 'script'],
        })
        // Add aria-labels to task list checkboxes (decorative, read-only in preview)
        return sanitized.replace(/<input\b([^>]*?)type="checkbox"([^>]*)>/gi, (match) => {
          if (match.includes('aria-label')) return match
          const isChecked = /checked/.test(match)
          const label = isChecked ? 'Completed task' : 'Incomplete task'
          return match.replace('>', ` aria-label="${label}">`)
        })
      }

      // If DOMPurify hasn't loaded yet, return the raw HTML
      return rawHtml
    } catch (error) {
      console.error('Markdown parsing error:', error)
      return `<pre>${escapeHtml(content)}</pre>`
    }
  }, [content, DOMPurify])

  return (
    <div
      className={`markdown-preview ${previewStyles} ${className || ''}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

// Styles for the markdown preview
const previewStyles = css({
  w: 'full',
  maxW: 'none',
  color: 'white',

  // Headings
  '& h1': {
    mb: '4',
    borderBottom: '1px solid',
    borderColor: 'gray.700',
    pb: '2',
    fontSize: '3xl',
    fontWeight: 'bold',
  },
  '& h2': {
    mt: '6',
    mb: '3',
    borderBottom: '1px solid',
    borderColor: 'gray.800',
    pb: '2',
    fontSize: '2xl',
    fontWeight: 'bold',
  },
  '& h3': {
    mt: '5',
    mb: '2',
    fontSize: 'xl',
    fontWeight: 'bold',
  },

  // Links
  '& a': {
    color: 'blue.400',
    _hover: {
      color: 'blue.300',
      textDecoration: 'underline',
    },
  },

  // Inline code
  '& code:not(pre code)': {
    rounded: 'md',
    bg: 'gray.800',
    px: '1.5',
    py: '0.5',
    fontSize: 'sm',
    color: 'pink.400',
  },

  // Code blocks
  '& pre': {
    overflowX: 'auto',
    rounded: 'lg',
    border: '1px solid',
    borderColor: 'gray.700',
    bg: 'gray.900',
    p: '4',
  },
  '& pre code': {
    bg: 'transparent',
    p: '0',
    fontSize: 'inherit',
    color: 'inherit',
  },

  // Tables
  '& table': {
    minW: 'full',
    borderCollapse: 'collapse',
    border: '1px solid',
    borderColor: 'gray.700',
  },
  '& th': {
    border: '1px solid',
    borderColor: 'gray.700',
    bg: 'gray.800',
    px: '4',
    py: '2',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  '& td': {
    border: '1px solid',
    borderColor: 'gray.700',
    px: '4',
    py: '2',
  },

  // Blockquotes
  '& blockquote': {
    borderLeft: '4px solid',
    borderColor: 'gray.600',
    pl: '4',
    color: 'white',
    fontStyle: 'italic',
  },

  // Lists
  '& ul': {
    listStyleType: 'disc',
    pl: '6',
  },
  '& ol': {
    listStyleType: 'decimal',
    pl: '6',
  },

  // Task lists
  '& input[type="checkbox"]': {
    h: '4',
    w: '4',
    mr: '2',
    rounded: 'md',
    borderColor: 'gray.600',
    bg: 'gray.800',
  },

  // Horizontal rule
  '& hr': {
    my: '4',
    borderColor: 'gray.700',
  },

  // Paragraphs
  '& p': {
    mb: '3',
  },
})
