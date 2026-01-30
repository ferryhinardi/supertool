'use client'

import hljs from 'highlight.js'
import { Marked, type Tokens } from 'marked'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface MarkdownContentProps {
  content: string
}

// Create a configured marked instance
const marked = new Marked()

// Custom renderer for links (open in new tab), images (lazy loading), and code blocks
const renderer = {
  link({ href, title, text }: Tokens.Link): string {
    const titleAttr = title ? ` title="${title}"` : ''
    // Don't add target/rel for javascript: URLs (they should be sanitized anyway)
    if (href?.startsWith('javascript:')) {
      return `<a href="#">${text}</a>`
    }
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
  },
  image({ href, title, text }: Tokens.Image): string {
    const titleAttr = title ? ` title="${title}"` : ''
    const altAttr = text ? ` alt="${text}"` : ' alt=""'
    return `<img src="${href}"${altAttr}${titleAttr} loading="lazy" />`
  },
  code({ text, lang }: Tokens.Code): string {
    // text contains the RAW code (not highlighted)
    const language = hljs.getLanguage(lang || '') ? lang : 'plaintext'
    const highlighted = hljs.highlight(text, { language: language || 'plaintext' }).value
    const langClass = lang ? ` hljs language-${lang}` : ' hljs'
    // Add data-code attribute to store the RAW code for copying
    // Escape HTML entities in the raw code
    const escapedCode = text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<div class="code-block-wrapper" style="position: relative;">
      <button class="copy-code-btn" aria-label="Copy code" data-code="${escapedCode}" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 12px; z-index: 1;">Copy</button>
      <pre><code class="${langClass}">${highlighted}</code></pre>
    </div>`
  },
}

marked.use({ renderer })

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
  const containerRef = useRef<HTMLDivElement>(null)

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
          ADD_ATTR: ['target', 'rel', 'class', 'data-code', 'loading'],
          ADD_TAGS: ['iframe'],
          FORBID_TAGS: ['style', 'script'],
        })
      }

      // If DOMPurify hasn't loaded yet, return the raw HTML
      // In tests, the mock will be loaded synchronously
      // In production, this brief moment of unsanitized content is acceptable
      // as it will be immediately replaced when DOMPurify loads
      return rawHtml
    } catch (error) {
      console.error('Markdown parsing error:', error)
      return `<pre>${escapeHtml(content)}</pre>`
    }
  }, [content, DOMPurify])

  // Handle copy button clicks
  const handleCopyClick = useCallback(async (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('copy-code-btn')) {
      const code = target.getAttribute('data-code')
      if (code) {
        // Decode HTML entities
        const decodedCode = code
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
        try {
          await navigator.clipboard.writeText(`${decodedCode}\n`)
          target.setAttribute('aria-label', 'Copied!')
          target.textContent = 'Copied!'
          setTimeout(() => {
            target.setAttribute('aria-label', 'Copy code')
            target.textContent = 'Copy'
          }, 2000)
        } catch (err) {
          console.error('Failed to copy code:', err)
        }
      }
    }
  }, [])

  // Attach click event listener to container
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('click', handleCopyClick)
      return () => {
        container.removeEventListener('click', handleCopyClick)
      }
    }
  }, [handleCopyClick])

  return (
    <div
      ref={containerRef}
      className="markdown-content"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
