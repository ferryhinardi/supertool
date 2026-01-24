'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useCopilot, useCopilotStore } from '@/lib/hooks'
import { css } from '@/styled-system/css'
import { ChatInput } from './chat-input'
import { ChatMessage } from './chat-message'

interface ChatContainerProps {
  sessionId: string
}

export function ChatContainer({ sessionId }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const { messages, isStreaming } = useCopilotStore()
  const { sendMessage, error } = useCopilot({})

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  })

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(sessionId, content)
    },
    [sendMessage, sessionId]
  )

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
      {/* Messages area */}
      <div
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
              message={message}
              isStreaming={isStreaming && index === messages.length - 1}
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
