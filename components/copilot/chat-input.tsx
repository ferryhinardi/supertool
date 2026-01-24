'use client'

import type { KeyboardEvent } from 'react'
import { useCallback, useState } from 'react'
import { css } from '@/styled-system/css'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask Copilot...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
    }
  }, [message, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const canSend = message.trim().length > 0 && !disabled

  return (
    <div
      className={css({
        display: 'flex',
        gap: '3',
        p: '4',
        bg: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        rounded: 'xl',
      })}
    >
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
