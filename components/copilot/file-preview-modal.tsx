'use client'

import hljs from 'highlight.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GeneratedFile } from '@/lib/services/copilot/types'
import { css } from '@/styled-system/css'

// Import a dark theme for highlight.js
import 'highlight.js/styles/github-dark.css'

interface FilePreviewModalProps {
  file: GeneratedFile
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
  onCopy: () => void
  copied: boolean
}

/**
 * Maps file extensions to highlight.js language identifiers
 */
function getLanguageFromExtension(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase()

  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',

    // Web
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',

    // Data formats
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    toml: 'ini',
    csv: 'plaintext',
    tsv: 'plaintext',

    // Programming languages
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    kt: 'kotlin',
    scala: 'scala',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    r: 'r',
    lua: 'lua',
    perl: 'perl',
    pl: 'perl',

    // Shell/Config
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    fish: 'bash',
    ps1: 'powershell',
    bat: 'dos',
    cmd: 'dos',

    // Database
    sql: 'sql',

    // Markup/Documentation
    md: 'markdown',
    markdown: 'markdown',
    rst: 'plaintext',
    txt: 'plaintext',

    // Config files
    ini: 'ini',
    conf: 'ini',
    config: 'ini',
    env: 'bash',
    gitignore: 'plaintext',
    dockerignore: 'plaintext',
    editorconfig: 'ini',

    // Build/Package
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    cmake: 'cmake',
    gradle: 'gradle',
  }

  return ext ? languageMap[ext] : undefined
}

/**
 * Determines if a file can be previewed (text-based)
 */
function canPreviewFile(filename: string, mimeType: string): boolean {
  // Check MIME type
  if (mimeType.startsWith('text/')) return true
  if (mimeType === 'application/json') return true
  if (mimeType === 'application/xml') return true
  if (mimeType === 'application/javascript') return true
  if (mimeType === 'application/typescript') return true

  // Check extension
  const ext = filename.split('.').pop()?.toLowerCase()
  const previewableExtensions = [
    'js',
    'jsx',
    'ts',
    'tsx',
    'mjs',
    'cjs',
    'html',
    'htm',
    'css',
    'scss',
    'sass',
    'less',
    'json',
    'yaml',
    'yml',
    'xml',
    'toml',
    'csv',
    'tsv',
    'py',
    'rb',
    'go',
    'rs',
    'java',
    'kt',
    'scala',
    'c',
    'cpp',
    'h',
    'hpp',
    'cs',
    'php',
    'swift',
    'sh',
    'bash',
    'zsh',
    'fish',
    'ps1',
    'bat',
    'cmd',
    'sql',
    'md',
    'markdown',
    'txt',
    'rst',
    'ini',
    'conf',
    'config',
    'env',
    'dockerfile',
    'makefile',
    'gitignore',
    'dockerignore',
    'editorconfig',
  ]

  return ext ? previewableExtensions.includes(ext) : false
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onDownload,
  onCopy,
  copied,
}: FilePreviewModalProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [lineCount, setLineCount] = useState(0)

  // Decode content if base64
  const decodedContent = useMemo(() => {
    if (file.isBase64) {
      try {
        return atob(file.content)
      } catch {
        return file.content
      }
    }
    return file.content
  }, [file.content, file.isBase64])

  // Get language for syntax highlighting
  const language = useMemo(() => getLanguageFromExtension(file.name), [file.name])

  // Check if file is previewable
  const isPreviewable = useMemo(
    () => canPreviewFile(file.name, file.mimeType),
    [file.name, file.mimeType]
  )

  // Count lines
  useEffect(() => {
    if (decodedContent) {
      setLineCount(decodedContent.split('\n').length)
    }
  }, [decodedContent])

  // Apply syntax highlighting
  useEffect(() => {
    if (codeRef.current && isPreviewable && decodedContent) {
      // Reset previous highlighting
      codeRef.current.removeAttribute('data-highlighted')

      if (language) {
        try {
          hljs.highlightElement(codeRef.current)
        } catch {
          // Fallback to plain text if highlighting fails
        }
      }
    }
  }, [decodedContent, language, isPreviewable])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click handled, keyboard via Escape
    <div
      className={css({
        position: 'fixed',
        inset: '0',
        zIndex: '100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 200ms ease-out',
        p: '4',
      })}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-preview-title"
    >
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          w: 'full',
          maxW: '4xl',
          maxH: '90vh',
          bg: 'rgba(17, 17, 17, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          rounded: 'xl',
          overflow: 'hidden',
          animation: 'scaleIn 200ms ease-out',
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: '4',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(0, 0, 0, 0.3)',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3', minW: '0' })}>
            <FileTypeIcon filename={file.name} />
            <div className={css({ minW: '0' })}>
              <h2
                id="file-preview-title"
                className={css({
                  fontSize: 'md',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.95)',
                  truncate: true,
                })}
              >
                {file.name}
              </h2>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'xs',
                  color: 'rgba(255, 255, 255, 0.5)',
                  mt: '0.5',
                })}
              >
                <span>{formatFileSize(file.size)}</span>
                {language && (
                  <>
                    <span>•</span>
                    <span className={css({ textTransform: 'capitalize' })}>{language}</span>
                  </>
                )}
                <span>•</span>
                <span>{lineCount} lines</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            {/* Copy button */}
            <button
              type="button"
              onClick={onCopy}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '3',
                py: '2',
                rounded: 'lg',
                fontSize: 'sm',
                fontWeight: '500',
                bg: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: copied ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                _hover: {
                  bg: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                },
              })}
              aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span className={css({ display: { base: 'none', sm: 'inline' } })}>
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={onDownload}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '3',
                py: '2',
                rounded: 'lg',
                fontSize: 'sm',
                fontWeight: '500',
                bg: 'rgba(59, 130, 246, 0.2)',
                color: 'rgb(59, 130, 246)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                _hover: {
                  bg: 'rgba(59, 130, 246, 0.3)',
                },
              })}
              aria-label="Download file"
            >
              <DownloadIcon />
              <span className={css({ display: { base: 'none', sm: 'inline' } })}>Download</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '9',
                h: '9',
                rounded: 'lg',
                bg: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                _hover: {
                  bg: 'rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.9)',
                },
              })}
              aria-label="Close preview"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={css({
            flex: '1',
            overflow: 'auto',
            position: 'relative',
          })}
        >
          {isPreviewable ? (
            <div
              className={css({
                display: 'flex',
                minH: 'full',
              })}
            >
              {/* Line numbers */}
              <div
                className={css({
                  flexShrink: '0',
                  py: '4',
                  pr: '3',
                  pl: '4',
                  bg: 'rgba(0, 0, 0, 0.2)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                  userSelect: 'none',
                })}
                aria-hidden="true"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    className={css({
                      fontSize: 'xs',
                      fontFamily: 'mono',
                      color: 'rgba(255, 255, 255, 0.3)',
                      lineHeight: '1.7',
                      textAlign: 'right',
                      minW: '8',
                    })}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Code content */}
              <pre
                className={css({
                  flex: '1',
                  m: '0',
                  p: '4',
                  overflow: 'auto',
                  bg: 'transparent',
                })}
              >
                <code
                  ref={codeRef}
                  className={`${language ? `language-${language}` : ''} ${css({
                    fontSize: 'sm',
                    fontFamily: 'mono',
                    lineHeight: '1.7',
                    whiteSpace: 'pre',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '& .hljs': {
                      bg: 'transparent !important',
                    },
                  })}`}
                >
                  {decodedContent}
                </code>
              </pre>
            </div>
          ) : (
            /* Non-previewable file */
            <div
              className={css({
                display: 'flex',
                flexDir: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: '16',
                px: '8',
                textAlign: 'center',
              })}
            >
              <div
                className={css({
                  w: '16',
                  h: '16',
                  rounded: 'xl',
                  bg: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: '4',
                })}
              >
                <BinaryFileIcon />
              </div>
              <h3
                className={css({
                  fontSize: 'lg',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: '2',
                })}
              >
                Preview not available
              </h3>
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'rgba(255, 255, 255, 0.5)',
                  maxW: 'sm',
                })}
              >
                This file type cannot be previewed. Click "Download" to save it to your device.
              </p>
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4',
            px: '4',
            py: '3',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(0, 0, 0, 0.3)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1.5',
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.4)',
            })}
          >
            <kbd
              className={css({
                px: '1.5',
                py: '0.5',
                rounded: 'md',
                bg: 'rgba(255, 255, 255, 0.1)',
                fontSize: 'xs',
                fontFamily: 'mono',
              })}
            >
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Icons
// ============================================

function FileTypeIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  const codeExtensions = [
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'rb',
    'go',
    'rs',
    'java',
    'c',
    'cpp',
    'h',
    'cs',
    'php',
    'swift',
    'kt',
    'scala',
    'sh',
    'bash',
    'zsh',
    'html',
    'css',
    'scss',
    'less',
    'sql',
  ]
  const dataExtensions = ['csv', 'tsv', 'xls', 'xlsx']
  const configExtensions = ['json', 'yaml', 'yml', 'toml', 'xml', 'ini', 'env', 'config', 'conf']
  const docExtensions = ['md', 'markdown', 'txt', 'rst']

  let bgColor = 'rgba(156, 163, 175, 0.2)' // gray
  let iconColor = 'rgb(156, 163, 175)'
  let Icon = GenericFileIcon

  if (codeExtensions.includes(ext)) {
    bgColor = 'rgba(59, 130, 246, 0.2)'
    iconColor = 'rgb(59, 130, 246)'
    Icon = CodeFileIcon
  } else if (dataExtensions.includes(ext)) {
    bgColor = 'rgba(34, 197, 94, 0.2)'
    iconColor = 'rgb(34, 197, 94)'
    Icon = DataFileIcon
  } else if (configExtensions.includes(ext)) {
    bgColor = 'rgba(234, 179, 8, 0.2)'
    iconColor = 'rgb(234, 179, 8)'
    Icon = ConfigFileIcon
  } else if (docExtensions.includes(ext)) {
    bgColor = 'rgba(139, 92, 246, 0.2)'
    iconColor = 'rgb(139, 92, 246)'
    Icon = DocFileIcon
  }

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        w: '10',
        h: '10',
        rounded: 'lg',
        flexShrink: '0',
      })}
      style={{ backgroundColor: bgColor, color: iconColor }}
    >
      <Icon />
    </div>
  )
}

function CodeFileIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    </svg>
  )
}

function DataFileIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
      />
    </svg>
  )
}

function ConfigFileIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function DocFileIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

function GenericFileIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

function BinaryFileIcon() {
  return (
    <svg
      className={css({ w: '8', h: '8', color: 'rgba(255, 255, 255, 0.4)' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  )
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
