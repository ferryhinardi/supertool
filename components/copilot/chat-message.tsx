'use client'

import type { CopilotMessage, ToolCall } from '@/lib/services/copilot/types'
import { css } from '@/styled-system/css'

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
