'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCopilot, useCopilotStore } from '@/lib/hooks'
import type { FileAttachment } from '@/lib/services/copilot/types'
import { css } from '@/styled-system/css'
import { ChatInput } from './chat-input'
import { ChatMessage } from './chat-message'
import { MessageSearch } from './message-search'

interface ChatContainerProps {
  sessionId: string
  /** Selected raw files to include as attachments when sending messages */
  selectedFiles?: File[]
}

/**
 * Convert a File object to a FileAttachment
 */
async function fileToAttachment(file: File): Promise<FileAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const isImage = file.type.startsWith('image/')
      resolve({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: base64.split(',')[1] || base64, // Remove data URL prefix if present
        preview: isImage ? base64 : undefined,
      })
    }
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export function ChatContainer({ sessionId, selectedFiles = [] }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const prevMessageCountRef = useRef(0)
  const { messages, isStreaming } = useCopilotStore()
  const { sendMessage, error } = useCopilot({})

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  // Compute matching message indices based on search query
  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return messages
      .map((msg, idx) => (msg.content.toLowerCase().includes(query) ? idx : -1))
      .filter((idx) => idx !== -1)
  }, [messages, searchQuery])

  // Reset current match when matches change
  useEffect(() => {
    if (matchingIndices.length > 0) {
      setCurrentMatchIndex(0)
    }
  }, [matchingIndices.length])

  // Keyboard shortcut for Cmd/Ctrl+F to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Scroll to current matching message
  useEffect(() => {
    if (matchingIndices.length > 0 && currentMatchIndex < matchingIndices.length) {
      const messageIndex = matchingIndices[currentMatchIndex]
      const message = messages[messageIndex]
      if (message) {
        const element = messageRefs.current.get(message.id)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentMatchIndex, matchingIndices, messages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  })

  const handleSend = useCallback(
    async (content: string) => {
      // Convert selected files to attachments if any
      let attachments: FileAttachment[] | undefined
      if (selectedFiles.length > 0) {
        try {
          attachments = await Promise.all(selectedFiles.map(fileToAttachment))
        } catch (error) {
          console.error('Failed to process file attachments:', error)
        }
      }
      sendMessage(sessionId, content, undefined, attachments)
    },
    [sendMessage, sessionId, selectedFiles]
  )

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setCurrentMatchIndex(0)
  }, [])

  const handlePrevMatch = useCallback(() => {
    if (matchingIndices.length === 0) return
    setCurrentMatchIndex((prev) => (prev === 0 ? matchingIndices.length - 1 : prev - 1))
  }, [matchingIndices.length])

  const handleNextMatch = useCallback(() => {
    if (matchingIndices.length === 0) return
    setCurrentMatchIndex((prev) => (prev === matchingIndices.length - 1 ? 0 : prev + 1))
  }, [matchingIndices.length])

  // Helper to register message refs
  const setMessageRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      messageRefs.current.set(id, element)
    } else {
      messageRefs.current.delete(id)
    }
  }, [])

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        h: 'full',
        bg: 'rgba(0, 0, 0, 0.2)',
        rounded: 'xl',
        overflow: 'hidden',
      })}
    >
      {/* Search bar */}
      {isSearchOpen && (
        <MessageSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onClose={handleCloseSearch}
          matchCount={matchingIndices.length}
          currentMatch={matchingIndices.length > 0 ? currentMatchIndex + 1 : 0}
          onPrevMatch={handlePrevMatch}
          onNextMatch={handleNextMatch}
        />
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className={css({
          flex: '1',
          overflowY: 'auto',
          p: '4',
          display: 'flex',
          flexDir: 'column',
          gap: '4',
        })}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              ref={(el) => setMessageRef(message.id, el)}
              message={message}
              isStreaming={isStreaming && index === messages.length - 1}
              searchQuery={isSearchOpen ? searchQuery : undefined}
              isCurrentMatch={
                isSearchOpen &&
                matchingIndices.length > 0 &&
                matchingIndices[currentMatchIndex] === index
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div
          className={css({
            mx: '4',
            mb: '2',
            p: '3',
            rounded: 'lg',
            bg: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'rgb(252, 165, 165)',
            fontSize: 'sm',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              fontWeight: '600',
              mb: '1',
            })}
          >
            <ErrorIcon />
            Error
          </div>
          {error.message}
        </div>
      )}

      {/* Input area */}
      <div
        className={css({
          p: '4',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        })}
      >
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Copilot is thinking...' : 'Ask Copilot...'}
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className={css({
        flex: '1',
        display: 'flex',
        flexDir: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        p: '8',
      })}
    >
      <div
        className={css({
          w: '16',
          h: '16',
          rounded: 'full',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <CopilotIcon />
      </div>
      <div>
        <h3
          className={css({
            fontSize: 'lg',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.8)',
            mb: '2',
          })}
        >
          Start a conversation
        </h3>
        <p className={css({ fontSize: 'sm', maxW: 'sm' })}>
          Ask Copilot to analyze code, fetch PR information, generate charts, or help with your
          development workflow.
        </p>
      </div>
      <div
        className={css({
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2',
          justifyContent: 'center',
          maxW: 'md',
        })}
      >
        {[
          'Analyze my recent PR',
          'Show file changes',
          'Generate a chart',
          'Suggest code organization',
        ].map((suggestion) => (
          <span
            key={suggestion}
            className={css({
              px: '3',
              py: '1.5',
              rounded: 'full',
              bg: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.6)',
            })}
          >
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  )
}

function CopilotIcon() {
  return (
    <svg
      className={css({ w: '8', h: '8', color: 'rgb(59, 130, 246)' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <title>Copilot</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Error</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  )
}
