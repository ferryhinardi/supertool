'use client'

import { Check, Clipboard, Clock, Copy, Pin, PinOff, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldInput } from '@/components/ui/field'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ClipboardItem {
  id: string
  content: string
  timestamp: number
  isPinned: boolean
  type: 'text' // Future: support images
}

const MAX_HISTORY_ITEMS = 100
const STORAGE_KEY = 'clipboard-history'

export default function ClipboardHistoryPage() {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    trackToolEvent('clipboard_history_open')
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setClipboardHistory(parsed)
      } catch (error) {
        console.error('Failed to parse clipboard history:', error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (clipboardHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clipboardHistory))
    }
  }, [clipboardHistory])

  // Start monitoring clipboard (with permission)
  const startListening = async () => {
    try {
      // Request clipboard read permission
      const permission = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
      })

      if (permission.state === 'denied') {
        toast.error('Clipboard access denied. Please enable in browser settings.')
        return
      }

      setIsListening(true)
      trackToolEvent('clipboard_history_start_monitoring')
      toast.success('Clipboard monitoring started. Copy text to add to history.')
    } catch (error) {
      console.error('Clipboard permission error:', error)
      toast.error('Clipboard API not supported in this browser.')
    }
  }

  // Stop monitoring clipboard
  const stopListening = () => {
    setIsListening(false)
    trackToolEvent('clipboard_history_stop_monitoring')
    toast.info('Clipboard monitoring stopped.')
  }

  // Manually add current clipboard content
  const addCurrentClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()

      if (!text || text.trim() === '') {
        toast.error('Clipboard is empty')
        return
      }

      // Check if this text already exists in recent history
      const isDuplicate = clipboardHistory.some((item) => item.content === text)

      if (isDuplicate) {
        toast.info('This item is already in your history')
        return
      }

      const newItem: ClipboardItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: text,
        timestamp: Date.now(),
        isPinned: false,
        type: 'text',
      }

      setClipboardHistory((prev) => {
        const updated = [newItem, ...prev]
        // Keep only the latest MAX_HISTORY_ITEMS (excluding pinned items)
        const pinned = updated.filter((item) => item.isPinned)
        const unpinned = updated.filter((item) => !item.isPinned).slice(0, MAX_HISTORY_ITEMS)
        return [...pinned, ...unpinned]
      })

      trackToolEvent('clipboard_history_add_item', { method: 'manual' })
      toast.success('Added to clipboard history')
    } catch (error) {
      console.error('Failed to read clipboard:', error)
      toast.error('Failed to read clipboard. Please grant permission.')
    }
  }

  // Copy item to clipboard
  const copyToClipboard = async (item: ClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)

      trackToolEvent('clipboard_history_copy_item')
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Toggle pin status
  const togglePin = (id: string) => {
    setClipboardHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    )

    const item = clipboardHistory.find((i) => i.id === id)
    if (item) {
      trackToolEvent('clipboard_history_toggle_pin', { pinned: !item.isPinned })
      toast.success(item.isPinned ? 'Unpinned' : 'Pinned to top')
    }
  }

  // Delete item
  const deleteItem = (id: string) => {
    setClipboardHistory((prev) => prev.filter((item) => item.id !== id))
    trackToolEvent('clipboard_history_delete_item')
    toast.success('Deleted from history')
  }

  // Clear all history
  const clearAll = () => {
    if (clipboardHistory.length === 0) {
      toast.info('History is already empty')
      return
    }

    // Keep only pinned items
    const pinnedItems = clipboardHistory.filter((item) => item.isPinned)

    if (pinnedItems.length === clipboardHistory.length) {
      toast.info('All items are pinned. Unpin items to clear them.')
      return
    }

    setClipboardHistory(pinnedItems)
    trackToolEvent('clipboard_history_clear_all')
    toast.success('Cleared all unpinned items')
  }

  // Filter items based on search
  const filteredItems = clipboardHistory.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort: pinned first, then by timestamp
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.timestamp - a.timestamp
  })

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Clipboard className={css({ h: '5', w: '5', color: 'cyan.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'cyan.300',
            })}
          >
            Clipboard Management Tool
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'cyan.400',
            gradientVia: 'teal.400',
            gradientTo: 'blue.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Clipboard History Manager
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'gray.400',
          })}
        >
          Never lose copied text again. Save, search, pin favorites, and restore clipboard items
          instantly - all stored locally in your browser.
        </p>
      </div>

      {/* Control Panel */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'cyan.500/20',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your clipboard history with these controls</CardDescription>
        </CardHeader>
        <CardContent
          className={css({
            display: 'flex',
            flexDirection: { base: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: '3',
          })}
        >
          <Button
            onClick={addCurrentClipboard}
            className={css({
              flex: { base: '1', sm: 'initial' },
              gap: '2',
              bg: 'cyan.600',
              _hover: { bg: 'cyan.700' },
            })}
          >
            <Clipboard className={css({ h: '4', w: '4' })} />
            Add Current Clipboard
          </Button>

          {!isListening ? (
            <Button
              onClick={startListening}
              variant="outline"
              className={css({
                flex: { base: '1', sm: 'initial' },
                gap: '2',
                borderColor: 'cyan.500/30',
                _hover: { bg: 'cyan.500/10' },
              })}
            >
              <Clock className={css({ h: '4', w: '4' })} />
              Start Monitoring
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              variant="outline"
              className={css({
                flex: { base: '1', sm: 'initial' },
                gap: '2',
                borderColor: 'orange.500/30',
                color: 'orange.400',
                _hover: { bg: 'orange.500/10' },
              })}
            >
              <Clock className={css({ h: '4', w: '4' })} />
              Stop Monitoring
            </Button>
          )}

          <Button
            onClick={clearAll}
            variant="destructive"
            disabled={clipboardHistory.length === 0}
            className={css({
              flex: { base: '1', sm: 'initial' },
              gap: '2',
            })}
          >
            <Trash2 className={css({ h: '4', w: '4' })} />
            Clear All
          </Button>

          <div
            className={css({
              ml: { base: '0', sm: 'auto' },
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.800/50',
              px: '4',
              py: '2',
            })}
          >
            <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Items:</span>
            <Badge
              className={css({
                bg: 'cyan.500/20',
                color: 'cyan.300',
                fontWeight: 'bold',
              })}
            >
              {clipboardHistory.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      {clipboardHistory.length > 0 && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <Field>
              <div className={css({ position: 'relative' })}>
                <div
                  className={css({
                    position: 'absolute',
                    left: '4',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  })}
                >
                  <Search className={css({ h: '5', w: '5', color: 'gray.500' })} />
                </div>

                <FieldInput
                  type="search"
                  placeholder="Search clipboard history..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className={css({
                    h: '12',
                    w: 'full',
                    rounded: 'lg',
                    border: '2px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800',
                    pl: '12',
                    pr: '12',
                    fontSize: 'base',
                    color: 'gray.100',
                    _placeholder: { color: 'gray.500' },
                    _focus: {
                      borderColor: 'cyan.500',
                      ring: '2px',
                      ringColor: 'cyan.500/20',
                    },
                  })}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={css({
                      position: 'absolute',
                      right: '4',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      rounded: 'md',
                      bg: 'gray.700',
                      p: '1',
                      color: 'gray.400',
                      transition: 'all 0.2s',
                      _hover: { bg: 'gray.600', color: 'gray.200' },
                    })}
                  >
                    <X className={css({ h: '4', w: '4' })} />
                  </button>
                )}
              </div>
            </Field>

            {searchQuery && (
              <p
                className={css({
                  mt: '3',
                  fontSize: 'sm',
                  color: 'gray.400',
                })}
              >
                Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clipboard History Items */}
      {clipboardHistory.length === 0 ? (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardContent
            withTopPadding
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: '16',
              textAlign: 'center',
            })}
          >
            <div
              className={css({
                mb: '4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                rounded: 'full',
                bg: 'gray.800/50',
                p: '6',
              })}
            >
              <Clipboard className={css({ h: '12', w: '12', color: 'gray.600' })} />
            </div>
            <h3
              className={css({
                mb: '2',
                fontSize: 'xl',
                fontWeight: 'bold',
                color: 'gray.300',
              })}
            >
              No clipboard history yet
            </h3>
            <p
              className={css({
                mb: '6',
                maxW: 'md',
                fontSize: 'base',
                color: 'gray.500',
              })}
            >
              Click &quot;Add Current Clipboard&quot; to save your current clipboard content, or
              start monitoring to automatically track copied items.
            </p>
          </CardContent>
        </Card>
      ) : sortedItems.length === 0 ? (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardContent
            withTopPadding
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: '12',
              textAlign: 'center',
            })}
          >
            <Search className={css({ mb: '4', h: '12', w: '12', color: 'gray.600' })} />
            <h3
              className={css({
                mb: '2',
                fontSize: 'xl',
                fontWeight: 'bold',
                color: 'gray.300',
              })}
            >
              No results found
            </h3>
            <p className={css({ fontSize: 'base', color: 'gray.500' })}>
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={css({
            display: 'grid',
            w: 'full',
            gap: '4',
            gridTemplateColumns: {
              base: '1fr',
              md: 'repeat(2, 1fr)',
            },
          })}
        >
          {sortedItems.map((item) => (
            <Card
              key={item.id}
              className={css({
                position: 'relative',
                border: '2px solid',
                borderColor: item.isPinned ? 'cyan.500/40' : 'gray.800',
                bg: item.isPinned ? 'cyan.500/5' : 'gray.900/50',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'cyan.500/30',
                  bg: 'gray.900/80',
                },
              })}
            >
              <CardContent withTopPadding className={css({ p: '4' })}>
                <div
                  className={css({
                    mb: '3',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '2',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                    })}
                  >
                    <Clock className={css({ h: '4', w: '4', color: 'gray.500' })} />
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {formatTime(item.timestamp)}
                    </span>
                    {item.isPinned && (
                      <Badge
                        className={css({
                          h: '5',
                          gap: '1',
                          bg: 'cyan.500/20',
                          px: '2',
                          fontSize: 'xs',
                          color: 'cyan.400',
                        })}
                      >
                        <Pin className={css({ h: '3', w: '3' })} />
                        Pinned
                      </Badge>
                    )}
                  </div>

                  <div className={css({ display: 'flex', gap: '1' })}>
                    <button
                      type="button"
                      onClick={() => togglePin(item.id)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        rounded: 'md',
                        bg: 'transparent',
                        p: '1',
                        color: item.isPinned ? 'cyan.400' : 'gray.500',
                        transition: 'all 0.2s',
                        _hover: {
                          bg: 'gray.800',
                          color: item.isPinned ? 'cyan.300' : 'cyan.400',
                        },
                      })}
                      aria-label={item.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {item.isPinned ? (
                        <PinOff className={css({ h: '4', w: '4' })} />
                      ) : (
                        <Pin className={css({ h: '4', w: '4' })} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        rounded: 'md',
                        bg: 'transparent',
                        p: '1',
                        color: 'gray.500',
                        transition: 'all 0.2s',
                        _hover: { bg: 'red.900/20', color: 'red.400' },
                      })}
                      aria-label="Delete"
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </button>
                  </div>
                </div>

                <div
                  className={css({
                    mb: '4',
                    maxH: '32',
                    overflow: 'auto',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '3',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'sm',
                      fontFamily: 'mono',
                      lineHeight: 'relaxed',
                      color: 'gray.300',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    })}
                  >
                    {item.content}
                  </p>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <span className={css({ fontSize: 'xs', color: 'gray.600' })}>
                    {item.content.length} characters
                  </span>

                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(item)}
                    className={css({
                      gap: '2',
                      bg: copiedId === item.id ? 'green.600' : 'cyan.600',
                      _hover: {
                        bg: copiedId === item.id ? 'green.700' : 'cyan.700',
                      },
                    })}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className={css({ h: '4', w: '4' })} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className={css({ h: '4', w: '4' })} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card
        className={css({
          border: '2px solid',
          borderColor: 'cyan.500/20',
          bg: 'rgba(6, 182, 212, 0.05)',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ color: 'cyan.300' })}>
            How to Use Clipboard History Manager
          </CardTitle>
        </CardHeader>
        <CardContent className={css({ spaceY: '3', color: 'gray.300' })}>
          <p>This tool helps you manage your clipboard history locally in your browser:</p>
          <ol className={css({ pl: '6', spaceY: '2', listStyle: 'decimal' })}>
            <li>
              Click <strong>&quot;Add Current Clipboard&quot;</strong> to manually save your current
              clipboard content
            </li>
            <li>
              Use <strong>&quot;Start Monitoring&quot;</strong> to automatically track copied items
              (requires clipboard permission)
            </li>
            <li>
              Click the <strong>Pin icon</strong> to keep important items at the top
            </li>
            <li>
              Use the <strong>search bar</strong> to quickly find specific clipboard items
            </li>
            <li>
              Click <strong>&quot;Copy&quot;</strong> on any item to restore it to your clipboard
            </li>
          </ol>
          <p className={css({ pt: '2' })}>
            <strong>Privacy Note:</strong> All clipboard data is stored locally in your browser.
            Nothing is sent to any server, ensuring your data remains private and secure.
          </p>
        </CardContent>
      </Card>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
