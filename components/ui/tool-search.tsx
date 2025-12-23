'use client'

import { Dialog } from '@ark-ui/react'
import { Command, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { type Tool, tools } from '@/lib/data/tools'
import { trackToolEvent } from '@/lib/services/analytics'
import { cx } from '@/lib/utils'
import { css } from '@/styled-system/css'

interface ToolSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ToolSearch({ open: controlledOpen, onOpenChange }: ToolSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : open

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        trackToolEvent('tool_search_open', { action: 'engagement' })
      }
      if (isControlled && onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setOpen(newOpen)
      }
    },
    [isControlled, onOpenChange]
  )

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleOpenChange(!isOpen)
      }
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        handleOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleOpenChange])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Fuzzy search logic
  const filteredTools = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return tools.filter((tool) => !tool.comingSoon).slice(0, 10) // Show first 10 active tools
    }

    const query = searchQuery.toLowerCase().trim()

    return tools
      .filter((tool) => {
        if (tool.comingSoon) return false

        const titleMatch = tool.title.toLowerCase().includes(query)
        const descriptionMatch = tool.description.toLowerCase().includes(query)
        const categoryMatch = tool.category.toLowerCase().includes(query)
        const featuresMatch = tool.features.some((feature) => feature.toLowerCase().includes(query))

        return titleMatch || descriptionMatch || categoryMatch || featuresMatch
      })
      .slice(0, 10) // Limit to 10 results
  }, [searchQuery])

  const handleSelectTool = (tool: Tool) => {
    trackToolEvent('tool_search_select', { action: 'engagement', tool: tool.title })
    handleOpenChange(false)
    setSearchQuery('')
    router.push(tool.href)
  }

  // Keyboard navigation for results
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length)
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      e.preventDefault()
      handleSelectTool(filteredTools[selectedIndex])
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => handleOpenChange(details.open)}>
      <Dialog.Backdrop
        className={css({
          position: 'fixed',
          inset: '0',
          zIndex: '50',
          bg: 'black/80',
          animation: 'fadeIn 200ms',
        })}
      />
      <Dialog.Positioner>
        <Dialog.Content
          className={css({
            position: 'fixed',
            top: { base: '10%', sm: '20%' },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '50',
            w: 'full',
            maxW: { base: '95%', sm: '2xl' },
            bg: 'background',
            border: '1px solid',
            borderColor: 'border',
            rounded: 'lg',
            shadow: 'lg',
            animation: 'fadeIn 200ms, scaleIn 200ms',
            overflow: 'hidden',
          })}
        >
          {/* Header with search input */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              px: '4',
              py: '3',
              borderBottom: '1px solid',
              borderColor: 'border',
            })}
          >
            <Search className={css({ h: '5', w: '5', color: 'muted-foreground' })} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={css({
                flex: '1',
                bg: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'lg',
                color: 'foreground',
                _placeholder: { color: 'muted-foreground' },
              })}
            />
            <kbd
              className={css({
                display: { base: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: '1',
                px: '2',
                py: '1',
                rounded: 'sm',
                bg: 'muted',
                fontSize: 'xs',
                color: 'muted-foreground',
              })}
            >
              <Command className={css({ h: '3', w: '3' })} />K
            </kbd>
            <Dialog.CloseTrigger
              className={css({
                rounded: 'sm',
                opacity: '0.7',
                transition: 'opacity 0.2s',
                _hover: { opacity: '1' },
              })}
            >
              <X className={css({ h: '4', w: '4' })} />
            </Dialog.CloseTrigger>
          </div>

          {/* Results */}
          <div
            className={css({
              maxH: { base: '60vh', sm: '400px' },
              overflowY: 'auto',
            })}
          >
            {filteredTools.length === 0 ? (
              <div
                className={css({
                  px: '4',
                  py: '8',
                  textAlign: 'center',
                  color: 'muted-foreground',
                  fontSize: 'sm',
                })}
              >
                {searchQuery ? `No tools found for "${searchQuery}"` : 'Start typing to search...'}
              </div>
            ) : (
              <div className={css({ py: '2' })}>
                {filteredTools.map((tool, index) => {
                  const Icon = tool.icon
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={tool.href}
                      type="button"
                      onClick={() => handleSelectTool(tool)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cx(
                        css({
                          w: 'full',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '3',
                          px: '4',
                          py: '3',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          bg: isSelected ? 'muted' : 'transparent',
                          _hover: { bg: 'muted' },
                        })
                      )}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          w: '10',
                          h: '10',
                          rounded: 'lg',
                          bg: `linear-gradient(135deg, ${tool.gradient})`,
                          flexShrink: '0',
                        })}
                      >
                        <Icon className={css({ h: '5', w: '5', color: 'white' })} />
                      </div>
                      <div className={css({ flex: '1', minW: '0' })}>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            mb: '1',
                          })}
                        >
                          <h3
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'foreground',
                              truncate: true,
                            })}
                          >
                            {tool.title}
                          </h3>
                          {tool.new && (
                            <span
                              className={css({
                                px: '1.5',
                                py: '0.5',
                                rounded: 'full',
                                bg: 'green-500',
                                color: 'white',
                                fontSize: 'xs',
                                fontWeight: 'medium',
                              })}
                            >
                              NEW
                            </span>
                          )}
                          {tool.popular && (
                            <span
                              className={css({
                                px: '1.5',
                                py: '0.5',
                                rounded: 'full',
                                bg: 'orange-500',
                                color: 'white',
                                fontSize: 'xs',
                                fontWeight: 'medium',
                              })}
                            >
                              POPULAR
                            </span>
                          )}
                        </div>
                        <p
                          className={css({
                            fontSize: 'xs',
                            color: 'muted-foreground',
                            lineClamp: '2',
                          })}
                        >
                          {tool.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div
            className={css({
              display: { base: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: '4',
              px: '4',
              py: '2',
              borderTop: '1px solid',
              borderColor: 'border',
              bg: 'muted/50',
              fontSize: 'xs',
              color: 'muted-foreground',
            })}
          >
            <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
              <kbd className={css({ px: '1', py: '0.5', rounded: 'sm', bg: 'background' })}>↑</kbd>
              <kbd className={css({ px: '1', py: '0.5', rounded: 'sm', bg: 'background' })}>↓</kbd>
              to navigate
            </span>
            <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
              <kbd className={css({ px: '1', py: '0.5', rounded: 'sm', bg: 'background' })}>↵</kbd>
              to select
            </span>
            <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
              <kbd className={css({ px: '1', py: '0.5', rounded: 'sm', bg: 'background' })}>
                esc
              </kbd>
              to close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

// Hook for easy integration
export function useToolSearch() {
  const [open, setOpen] = useState(false)

  return {
    open,
    setOpen,
    ToolSearch: () => <ToolSearch open={open} onOpenChange={setOpen} />,
  }
}
