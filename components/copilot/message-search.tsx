'use client'

import { useCallback, useEffect, useRef } from 'react'
import { css } from '@/styled-system/css'

interface MessageSearchProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
  matchCount: number
  currentMatch: number
  onPrevMatch: () => void
  onNextMatch: () => void
}

export function MessageSearch({
  value,
  onChange,
  onClose,
  matchCount,
  currentMatch,
  onPrevMatch,
  onNextMatch,
}: MessageSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle keyboard shortcuts within the search bar
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          onPrevMatch()
        } else {
          onNextMatch()
        }
      }
    },
    [onClose, onPrevMatch, onNextMatch]
  )

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        p: '3',
        bg: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      })}
    >
      {/* Search icon */}
      <SearchIcon />

      {/* Search input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search messages..."
        className={css({
          flex: '1',
          bg: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          rounded: 'lg',
          px: '3',
          py: '2',
          fontSize: 'sm',
          color: 'rgba(255, 255, 255, 0.9)',
          outline: 'none',
          transition: 'all 0.2s ease',
          _placeholder: {
            color: 'rgba(255, 255, 255, 0.4)',
          },
          _focus: {
            borderColor: 'rgba(59, 130, 246, 0.5)',
            bg: 'rgba(255, 255, 255, 0.08)',
          },
        })}
      />

      {/* Match count */}
      {value && (
        <div
          className={css({
            fontSize: 'xs',
            color: matchCount > 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(239, 68, 68, 0.8)',
            whiteSpace: 'nowrap',
            minW: '16',
            textAlign: 'center',
          })}
        >
          {matchCount > 0 ? `${currentMatch} of ${matchCount}` : 'No results'}
        </div>
      )}

      {/* Navigation buttons */}
      {matchCount > 0 && (
        <div className={css({ display: 'flex', gap: '1' })}>
          <button
            type="button"
            onClick={onPrevMatch}
            disabled={matchCount === 0}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '8',
              h: '8',
              rounded: 'md',
              bg: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              _hover: {
                bg: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
              _disabled: {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            })}
            aria-label="Previous match"
            title="Previous match (Shift+Enter)"
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            onClick={onNextMatch}
            disabled={matchCount === 0}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '8',
              h: '8',
              rounded: 'md',
              bg: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              _hover: {
                bg: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
              _disabled: {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            })}
            aria-label="Next match"
            title="Next match (Enter)"
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '8',
          h: '8',
          rounded: 'md',
          bg: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.5)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)',
          },
        })}
        aria-label="Close search"
        title="Close (Escape)"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5', color: 'rgba(255, 255, 255, 0.5)', flexShrink: '0' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Search</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Up</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Down</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Close</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
