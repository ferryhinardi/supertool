'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Repository } from '@/lib/services/github/types'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface RepoSelectorProps {
  repositories: Repository[]
  selectedRepo: Repository | null
  onSelect: (repo: Repository) => void
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
}

// ============================================
// Icons
// ============================================

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function RepoIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '3', h: '3', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '3', h: '3', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '4',
        h: '4',
        animation: 'spin 1s linear infinite',
        flexShrink: 0,
      })}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className={css({ opacity: 0.25 })}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className={css({ opacity: 0.75 })}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ============================================
// Helper Functions
// ============================================

function formatStarCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// ============================================
// Sub-components
// ============================================

interface RepoOptionProps {
  repo: Repository
  isSelected: boolean
  onSelect: () => void
}

function RepoOption({ repo, isSelected, onSelect }: RepoOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={css({
        w: 'full',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '3',
        p: '3',
        rounded: 'lg',
        bg: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
        border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        _hover: {
          bg: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
        },
      })}
    >
      {/* Repo Icon */}
      <div
        className={css({
          color: isSelected ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.5)',
          mt: '0.5',
        })}
      >
        <RepoIcon />
      </div>

      {/* Repo Info */}
      <div className={css({ flex: '1', minW: '0' })}>
        {/* Name & Owner */}
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: '500',
              color: isSelected ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.9)',
              truncate: true,
            })}
          >
            {repo.owner.login}/{repo.name}
          </span>
          {repo.private && (
            <span className={css({ color: 'rgba(255, 255, 255, 0.4)' })}>
              <LockIcon />
            </span>
          )}
        </div>

        {/* Description */}
        {repo.description && (
          <p
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
              mt: '1',
              lineClamp: 2,
            })}
          >
            {repo.description}
          </p>
        )}

        {/* Meta Info */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            mt: '2',
          })}
        >
          {/* Stars */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.4)',
            })}
          >
            <StarIcon />
            <span>{formatStarCount(repo.stargazers_count)}</span>
          </div>

          {/* Language */}
          {repo.language && (
            <span
              className={css({
                fontSize: 'xs',
                color: 'rgba(255, 255, 255, 0.4)',
              })}
            >
              {repo.language}
            </span>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className={css({ color: 'rgb(59, 130, 246)', mt: '0.5' })}>
          <CheckIcon />
        </div>
      )}
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export function RepoSelector({
  repositories,
  selectedRepo,
  onSelect,
  isLoading = false,
  placeholder = 'Select a repository...',
  disabled = false,
}: RepoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter repositories based on search query
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) {
      return repositories
    }
    const query = searchQuery.toLowerCase()
    return repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.owner.login.toLowerCase().includes(query)
    )
  }, [repositories, searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'Enter' && filteredRepos.length === 1) {
        onSelect(filteredRepos[0])
        setIsOpen(false)
        setSearchQuery('')
      }
    },
    [filteredRepos, onSelect]
  )

  const handleSelectRepo = useCallback(
    (repo: Repository) => {
      onSelect(repo)
      setIsOpen(false)
      setSearchQuery('')
    },
    [onSelect]
  )

  const toggleDropdown = useCallback(() => {
    if (!disabled && !isLoading) {
      setIsOpen((prev) => !prev)
    }
  }, [disabled, isLoading])

  return (
    <div ref={containerRef} className={css({ position: 'relative', w: 'full' })}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || isLoading}
        className={css({
          w: 'full',
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          p: '3',
          rounded: 'lg',
          bg: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          _hover: {
            bg: disabled || isLoading ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)',
            borderColor:
              disabled || isLoading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          },
          _focus: {
            outline: 'none',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
          },
          _disabled: {
            opacity: 0.5,
          },
        })}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <div className={css({ color: 'rgba(255, 255, 255, 0.5)' })}>
          {isLoading ? <SpinnerIcon /> : <RepoIcon />}
        </div>

        {/* Selected Value or Placeholder */}
        <div className={css({ flex: '1', minW: '0', textAlign: 'left' })}>
          {selectedRepo ? (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.9)',
                  truncate: true,
                })}
              >
                {selectedRepo.owner.login}/{selectedRepo.name}
              </span>
              {selectedRepo.private && (
                <span className={css({ color: 'rgba(255, 255, 255, 0.4)' })}>
                  <LockIcon />
                </span>
              )}
            </div>
          ) : (
            <span
              className={css({
                fontSize: 'sm',
                color: 'rgba(255, 255, 255, 0.4)',
              })}
            >
              {placeholder}
            </span>
          )}
        </div>

        {/* Dropdown Indicator */}
        <div
          className={css({
            color: 'rgba(255, 255, 255, 0.4)',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          })}
        >
          <ChevronDownIcon />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={css({
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: '0',
            right: '0',
            zIndex: '50',
            bg: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            rounded: 'xl',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
          })}
          role="listbox"
        >
          {/* Search Input */}
          <div
            className={css({
              p: '3',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '3',
                py: '2',
                rounded: 'lg',
                bg: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                _focusWithin: {
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                },
              })}
            >
              <div className={css({ color: 'rgba(255, 255, 255, 0.4)' })}>
                <SearchIcon />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search repositories..."
                className={css({
                  flex: '1',
                  bg: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 'sm',
                  color: 'rgba(255, 255, 255, 0.9)',
                  _placeholder: {
                    color: 'rgba(255, 255, 255, 0.4)',
                  },
                })}
              />
            </div>
          </div>

          {/* Repository List */}
          <div
            className={css({
              maxH: '300px',
              overflowY: 'auto',
              p: '2',
            })}
          >
            {filteredRepos.length > 0 ? (
              <div className={css({ display: 'flex', flexDir: 'column', gap: '1' })}>
                {filteredRepos.map((repo) => (
                  <RepoOption
                    key={repo.id}
                    repo={repo}
                    isSelected={selectedRepo?.id === repo.id}
                    onSelect={() => handleSelectRepo(repo)}
                  />
                ))}
              </div>
            ) : (
              <div
                className={css({
                  py: '8',
                  textAlign: 'center',
                })}
              >
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'rgba(255, 255, 255, 0.5)',
                  })}
                >
                  {searchQuery
                    ? `No repositories found matching "${searchQuery}"`
                    : 'No repositories available'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
