'use client'

import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import {
  CodeBlockWrapper,
  imageStyles,
  inlineCodeStyles,
  linkStyles,
  tableStyles,
  tableWrapperStyles,
} from './markdown-renderer'

// Custom sanitize schema that preserves syntax highlighting classes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow className on code and span for syntax highlighting
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
  },
}

interface MarkdownContentProps {
  content: string
}

/**
 * MarkdownContent - The actual markdown rendering component
 * This is loaded lazily to avoid ESM module issues during SSR
 */
export default function MarkdownContent({ content }: MarkdownContentProps) {
  const components: Components = {
    // Custom code block with copy button
    pre: ({ children, ...props }) => <CodeBlockWrapper {...props}>{children}</CodeBlockWrapper>,
    // Inline code
    code: ({ children, className: codeClassName, ...props }) => {
      // Check if this is an inline code (no className means not in a pre block with language)
      const isInline = !codeClassName
      if (isInline) {
        return (
          <code className={inlineCodeStyles} {...props}>
            {children}
          </code>
        )
      }
      return (
        <code className={codeClassName} {...props}>
          {children}
        </code>
      )
    },
    // Links open in new tab
    a: ({ children, href, ...props }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkStyles} {...props}>
        {children}
      </a>
    ),
    // Tables
    table: ({ children, ...props }) => (
      <div className={tableWrapperStyles}>
        <table className={tableStyles} {...props}>
          {children}
        </table>
      </div>
    ),
    // Images
    img: (props) => {
      const { src, alt, ...rest } = props
      const imgSrc = typeof src === 'string' ? src : undefined
      return <img src={imgSrc} alt={alt || ''} className={imageStyles} loading="lazy" {...rest} />
    },
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
