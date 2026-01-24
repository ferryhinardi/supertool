'use client'

import type React from 'react'
import { useState } from 'react'
import type {
  CopilotMessage,
  FileAttachment,
  GeneratedFile,
  ToolCall,
} from '@/lib/services/copilot/types'
import { css } from '@/styled-system/css'
import { FilePreviewModal } from './file-preview-modal'

interface ChatMessageProps {
  message: CopilotMessage
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        gap: '2',
        p: '4',
        rounded: 'xl',
        maxW: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        bg: isUser
          ? 'rgba(59, 130, 246, 0.2)'
          : isSystem
            ? 'rgba(234, 179, 8, 0.15)'
            : 'rgba(255, 255, 255, 0.05)',
        border: '1px solid',
        borderColor: isUser
          ? 'rgba(59, 130, 246, 0.3)'
          : isSystem
            ? 'rgba(234, 179, 8, 0.3)'
            : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        _hover: {
          borderColor: isUser
            ? 'rgba(59, 130, 246, 0.5)'
            : isSystem
              ? 'rgba(234, 179, 8, 0.5)'
              : 'rgba(255, 255, 255, 0.2)',
        },
      })}
    >
      {/* Role indicator */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          fontSize: 'xs',
          color: 'rgba(255, 255, 255, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        })}
      >
        <span
          className={css({
            w: '2',
            h: '2',
            rounded: 'full',
            bg: isUser ? 'rgb(59, 130, 246)' : isSystem ? 'rgb(234, 179, 8)' : 'rgb(34, 197, 94)',
          })}
        />
        {message.role}
        {isStreaming && (
          <span
            className={css({
              animation: 'pulse 1.5s ease-in-out infinite',
            })}
          >
            ...
          </span>
        )}
      </div>

      {/* Message content */}
      <div
        className={css({
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 'sm',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        })}
      >
        {message.content}
        {isStreaming && !message.content && (
          <span
            className={css({
              display: 'inline-block',
              w: '2',
              h: '4',
              bg: 'rgba(255, 255, 255, 0.5)',
              animation: 'blink 1s step-end infinite',
            })}
          />
        )}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2',
            mt: '2',
          })}
        >
          {message.attachments.map((attachment) => (
            <AttachmentCard key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}

      {/* Generated Files */}
      {message.generatedFiles && message.generatedFiles.length > 0 && (
        <div
          className={css({
            display: 'flex',
            flexDir: 'column',
            gap: '2',
            mt: '3',
          })}
        >
          <div
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: '1',
            })}
          >
            Generated Files
          </div>
          {message.generatedFiles.map((file) => (
            <DownloadableFileCard key={file.id} file={file} />
          ))}
        </div>
      )}

      {/* Tool calls */}
      {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
        <div className={css({ display: 'flex', flexDir: 'column', gap: '2', mt: '2' })}>
          {message.metadata.toolCalls.map((toolCall) => (
            <ToolCallCard key={toolCall.id} toolCall={toolCall} />
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div
        className={css({
          fontSize: 'xs',
          color: 'rgba(255, 255, 255, 0.3)',
          mt: '1',
        })}
      >
        {formatTimestamp(message.timestamp)}
      </div>
    </div>
  )
}

interface AttachmentCardProps {
  attachment: FileAttachment
}

function AttachmentCard({ attachment }: AttachmentCardProps) {
  const isImage = attachment.type === 'image'

  if (isImage && attachment.preview) {
    return (
      <div
        className={css({
          position: 'relative',
          w: '20',
          h: '20',
          rounded: 'lg',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          bg: 'rgba(0, 0, 0, 0.2)',
        })}
      >
        <img
          src={attachment.preview}
          alt={attachment.name}
          className={css({
            w: '100%',
            h: '100%',
            objectFit: 'cover',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            p: '1',
            bg: 'rgba(0, 0, 0, 0.7)',
            fontSize: 'xs',
            color: 'rgba(255, 255, 255, 0.8)',
            truncate: true,
          })}
        >
          {attachment.name}
        </div>
      </div>
    )
  }

  // Document attachment
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        p: '2',
        rounded: 'lg',
        bg: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: 'xs',
        color: 'rgba(255, 255, 255, 0.8)',
        maxW: '48',
      })}
    >
      <DocumentIcon />
      <div className={css({ flex: '1', minW: '0' })}>
        <div className={css({ truncate: true, fontWeight: '500' })}>{attachment.name}</div>
        <div className={css({ color: 'rgba(255, 255, 255, 0.5)' })}>
          {(attachment.size / 1024).toFixed(1)} KB
        </div>
      </div>
    </div>
  )
}

function DocumentIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5', flexShrink: '0', color: 'rgb(59, 130, 246)' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <title>Document</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

// ============================================
// Downloadable File Card
// ============================================

interface DownloadableFileCardProps {
  file: GeneratedFile
}

function DownloadableFileCard({ file }: DownloadableFileCardProps) {
  const [copied, setCopied] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleDownload = () => {
    let blob: Blob

    if (file.isBase64) {
      // Decode base64 content
      const binaryString = atob(file.content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      blob = new Blob([bytes], { type: file.mimeType })
    } else {
      // Plain text content
      blob = new Blob([file.content], { type: file.mimeType })
    }

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      let textContent = file.content
      if (file.isBase64) {
        // Decode base64 for text files
        textContent = atob(file.content)
      }
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
  const icon = getFileIcon(fileExtension)

  return (
    <>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          p: '3',
          rounded: 'lg',
          bg: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          transition: 'all 0.2s ease',
          _hover: {
            bg: 'rgba(34, 197, 94, 0.15)',
            borderColor: 'rgba(34, 197, 94, 0.5)',
          },
        })}
      >
        {/* File icon - clickable for preview */}
        <button
          type="button"
          onClick={handlePreview}
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '10',
            h: '10',
            rounded: 'lg',
            bg: 'rgba(34, 197, 94, 0.2)',
            color: 'rgb(34, 197, 94)',
            flexShrink: '0',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            _hover: {
              bg: 'rgba(34, 197, 94, 0.3)',
              transform: 'scale(1.05)',
            },
            _active: {
              transform: 'scale(0.95)',
            },
          })}
          aria-label={`Preview ${file.name}`}
          title="Click to preview"
        >
          {icon}
        </button>

        {/* File info - clickable for preview */}
        <button
          type="button"
          onClick={handlePreview}
          className={css({
            flex: '1',
            minW: '0',
            textAlign: 'left',
            bg: 'transparent',
            border: 'none',
            cursor: 'pointer',
            p: '0',
          })}
          aria-label={`Preview ${file.name}`}
        >
          <div
            className={css({
              fontSize: 'sm',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.9)',
              truncate: true,
            })}
          >
            {file.name}
          </div>
          <div
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
              mt: '0.5',
            })}
          >
            {formatFileSize(file.size)}
            {file.description && ` - ${file.description}`}
          </div>
        </button>

        {/* Action buttons */}
        <div className={css({ display: 'flex', gap: '2', flexShrink: '0' })}>
          {/* Preview button */}
          <button
            type="button"
            onClick={handlePreview}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '9',
              h: '9',
              rounded: 'lg',
              bg: 'rgba(139, 92, 246, 0.2)',
              color: 'rgb(139, 92, 246)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              _hover: {
                bg: 'rgba(139, 92, 246, 0.3)',
                transform: 'scale(1.05)',
              },
              _active: {
                transform: 'scale(0.95)',
              },
            })}
            aria-label={`Preview ${file.name}`}
            title="Preview file"
          >
            <PreviewIcon />
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '9',
              h: '9',
              rounded: 'lg',
              bg: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: copied ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              _hover: {
                bg: 'rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
              _active: {
                transform: 'scale(0.95)',
              },
            })}
            aria-label={copied ? 'Copied!' : `Copy ${file.name} content`}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '9',
              h: '9',
              rounded: 'lg',
              bg: 'rgba(34, 197, 94, 0.2)',
              color: 'rgb(34, 197, 94)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              _hover: {
                bg: 'rgba(34, 197, 94, 0.3)',
                transform: 'scale(1.05)',
              },
              _active: {
                transform: 'scale(0.95)',
              },
            })}
            aria-label={`Download ${file.name}`}
            title="Download file"
          >
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        file={file}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
        onCopy={handleCopy}
        copied={copied}
      />
    </>
  )
}

function DownloadIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Download</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  )
}

function PreviewIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Preview</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
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
      className={css({ w: '5', h: '5' })}
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
      <title>Code file</title>
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
      <title>Data file</title>
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
      <title>Config file</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <title>File</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

function getFileIcon(extension: string): React.ReactNode {
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

  if (codeExtensions.includes(extension)) {
    return <CodeFileIcon />
  }
  if (dataExtensions.includes(extension)) {
    return <DataFileIcon />
  }
  if (configExtensions.includes(extension)) {
    return <ConfigFileIcon />
  }
  return <GenericFileIcon />
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

interface ToolCallCardProps {
  toolCall: ToolCall
}

function ToolCallCard({ toolCall }: ToolCallCardProps) {
  return (
    <div
      className={css({
        p: '3',
        rounded: 'lg',
        bg: 'rgba(139, 92, 246, 0.15)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        fontSize: 'xs',
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          mb: '2',
          color: 'rgb(167, 139, 250)',
          fontWeight: '600',
        })}
      >
        <ToolIcon />
        {toolCall.name}
      </div>
      <pre
        className={css({
          p: '2',
          rounded: 'md',
          bg: 'rgba(0, 0, 0, 0.3)',
          color: 'rgba(255, 255, 255, 0.7)',
          overflow: 'auto',
          maxH: '24',
          fontSize: 'xs',
          fontFamily: 'mono',
        })}
      >
        {JSON.stringify(toolCall.arguments, null, 2)}
      </pre>
    </div>
  )
}

function ToolIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Tool icon</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
      />
    </svg>
  )
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }

  // Otherwise show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
