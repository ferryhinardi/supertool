'use client'

import type { DragEvent, KeyboardEvent } from 'react'
import { useCallback, useRef, useState } from 'react'
import type { FileAttachment } from '@/lib/services/copilot/types'
import {
  MAX_ATTACHMENTS_PER_MESSAGE,
  MAX_FILE_SIZE,
  SUPPORTED_FILE_TYPES,
  SUPPORTED_IMAGE_TYPES,
} from '@/lib/services/copilot/types'
import { css } from '@/styled-system/css'

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask Copilot...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = message.trim()
    const hasContent = trimmed.length > 0 || attachments.length > 0
    if (hasContent && !disabled) {
      onSend(trimmed, attachments.length > 0 ? attachments : undefined)
      setMessage('')
      setAttachments([])
      setError(null)
    }
  }, [message, attachments, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const validateFile = useCallback((file: File): string | null => {
    if (!SUPPORTED_FILE_TYPES.includes(file.type as (typeof SUPPORTED_FILE_TYPES)[number])) {
      return `Unsupported file type: ${file.type || 'unknown'}. Supported: images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, MD, CSV).`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 20MB.`
    }
    return null
  }, [])

  const processFile = useCallback(
    async (file: File): Promise<FileAttachment | null> => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return null
      }

      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string
          const base64Data = dataUrl.split(',')[1]
          const isImage = SUPPORTED_IMAGE_TYPES.includes(
            file.type as (typeof SUPPORTED_IMAGE_TYPES)[number]
          )

          const attachment: FileAttachment = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            type: isImage ? 'image' : 'document',
            mimeType: file.type,
            size: file.size,
            data: base64Data,
          }

          if (isImage) {
            attachment.preview = dataUrl
            // Get image dimensions
            const img = new Image()
            img.onload = () => {
              attachment.dimensions = {
                width: img.naturalWidth,
                height: img.naturalHeight,
              }
              resolve(attachment)
            }
            img.onerror = () => resolve(attachment)
            img.src = dataUrl
          } else {
            resolve(attachment)
          }
        }
        reader.onerror = () => {
          setError(`Failed to read file "${file.name}".`)
          resolve(null)
        }
        reader.readAsDataURL(file)
      })
    },
    [validateFile]
  )

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remainingSlots = MAX_ATTACHMENTS_PER_MESSAGE - attachments.length

      if (fileArray.length > remainingSlots) {
        setError(`Can only attach ${MAX_ATTACHMENTS_PER_MESSAGE} files per message.`)
        return
      }

      setError(null)
      const newAttachments: FileAttachment[] = []

      for (const file of fileArray) {
        const attachment = await processFile(file)
        if (attachment) {
          newAttachments.push(attachment)
        }
      }

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments])
      }
    },
    [attachments.length, processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
        // Reset input so same file can be selected again
        e.target.value = ''
      }
    },
    [handleFiles]
  )

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if leaving the container
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
    setError(null)
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const canSend = (message.trim().length > 0 || attachments.length > 0) && !disabled

  const acceptedTypes = SUPPORTED_FILE_TYPES.join(',')

  return (
    <section
      aria-label="Chat input with file upload support"
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        p: '4',
        bg: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: isDragging
          ? '2px dashed rgba(59, 130, 246, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        rounded: 'xl',
        transition: 'all 0.2s ease',
      })}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple
        onChange={handleFileSelect}
        className={css({ display: 'none' })}
        tabIndex={-1}
      />

      {/* Drag overlay indicator */}
      {isDragging && (
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: '4',
            bg: 'rgba(59, 130, 246, 0.1)',
            border: '1px dashed rgba(59, 130, 246, 0.4)',
            rounded: 'lg',
            color: 'rgba(59, 130, 246, 1)',
            fontSize: 'sm',
            fontWeight: 'medium',
          })}
        >
          <UploadIcon />
          <span className={css({ ml: '2' })}>Drop files here to attach</span>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2',
          })}
        >
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={css({
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                p: '2',
                bg: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                rounded: 'lg',
                maxW: '200px',
              })}
            >
              {/* Image preview or document icon */}
              {attachment.type === 'image' && attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  className={css({
                    w: '10',
                    h: '10',
                    objectFit: 'cover',
                    rounded: 'md',
                  })}
                />
              ) : (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    bg: 'rgba(255, 255, 255, 0.1)',
                    rounded: 'md',
                    color: 'rgba(255, 255, 255, 0.6)',
                  })}
                >
                  <DocumentIcon />
                </div>
              )}

              {/* File info */}
              <div className={css({ flex: '1', minW: '0' })}>
                <p
                  className={css({
                    fontSize: 'xs',
                    fontWeight: 'medium',
                    color: 'rgba(255, 255, 255, 0.9)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {attachment.name}
                </p>
                <p
                  className={css({
                    fontSize: 'xs',
                    color: 'rgba(255, 255, 255, 0.5)',
                  })}
                >
                  {formatFileSize(attachment.size)}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className={css({
                  position: 'absolute',
                  top: '-2',
                  right: '-2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  w: '5',
                  h: '5',
                  bg: 'rgba(239, 68, 68, 0.9)',
                  rounded: 'full',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  _hover: {
                    bg: 'rgba(220, 38, 38, 1)',
                    transform: 'scale(1.1)',
                  },
                })}
                aria-label={`Remove ${attachment.name}`}
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          className={css({
            fontSize: 'xs',
            color: 'rgba(239, 68, 68, 1)',
            p: '2',
            bg: 'rgba(239, 68, 68, 0.1)',
            rounded: 'md',
          })}
        >
          {error}
        </p>
      )}

      {/* Input area */}
      <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-end' })}>
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachments.length >= MAX_ATTACHMENTS_PER_MESSAGE}
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '10',
            h: '10',
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
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
          })}
          aria-label="Attach files"
          title="Attach images or documents (drag & drop supported)"
        >
          <PaperclipIcon />
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={css({
            flex: '1',
            minH: '10',
            maxH: '32',
            p: '3',
            bg: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            rounded: 'lg',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 'sm',
            resize: 'none',
            outline: 'none',
            transition: 'all 0.2s ease',
            _placeholder: {
              color: 'rgba(255, 255, 255, 0.4)',
            },
            _focus: {
              borderColor: 'rgba(59, 130, 246, 0.5)',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
          })}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '10',
            h: '10',
            rounded: 'lg',
            bg: canSend ? 'rgb(59, 130, 246)' : 'rgba(255, 255, 255, 0.1)',
            color: canSend ? 'white' : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            _hover: canSend
              ? {
                  bg: 'rgb(37, 99, 235)',
                  transform: 'scale(1.05)',
                }
              : {},
            _active: canSend
              ? {
                  transform: 'scale(0.95)',
                }
              : {},
          })}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>

      {/* Helper text */}
      <p
        className={css({
          fontSize: 'xs',
          color: 'rgba(255, 255, 255, 0.4)',
          textAlign: 'center',
        })}
      >
        Press Enter to send, Shift+Enter for new line. Drag & drop or click to attach files.
      </p>
    </section>
  )
}

function SendIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Send</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Attach</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Upload</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Document</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className={css({ w: '3', h: '3' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <title>Remove</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
