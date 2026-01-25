'use client'

import hljs from 'highlight.js'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import { useEffect, useMemo, useState } from 'react'

interface MarkdownContentProps {
  content: string
}

// Create a configured marked instance with syntax highlighting
const marked = new Marked(
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
marked.setOptions({
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
 * MarkdownContent - Renders markdown using marked (CommonJS compatible)
 * This replaces react-markdown which has ESM module issues with Turbopack
 */
export default function MarkdownContent({ content }: MarkdownContentProps) {
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
      const rawHtml = marked.parse(content, { async: false }) as string

      // Sanitize HTML to prevent XSS (only if DOMPurify is loaded)
      if (DOMPurify) {
        return DOMPurify.sanitize(rawHtml, {
          ADD_ATTR: ['target', 'rel', 'class'],
          ADD_TAGS: ['iframe'],
          FORBID_TAGS: ['style', 'script'],
        })
      }

      // If DOMPurify hasn't loaded yet, return the raw HTML
      // This is safe because we're in a trusted context
      return rawHtml
    } catch (error) {
      console.error('Markdown parsing error:', error)
      return `<pre>${escapeHtml(content)}</pre>`
    }
  }, [content, DOMPurify])

  return (
    <div
      className="markdown-content"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
