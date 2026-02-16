'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  Bot,
  Bug,
  Code,
  FileCode,
  FolderOpen,
  GitPullRequest,
  MessageSquare,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  ChatContainer,
  KeyboardShortcutsModal,
  SessionSidebar,
  SourcePanel,
} from '@/components/copilot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DEFAULT_COPILOT_REPO,
  MAIN_CONTENT_HEIGHT,
  SIDEBAR_ANIMATION_OFFSET,
  SIDEBAR_WIDTH,
  SOURCE_PANEL_ANIMATION_OFFSET,
  SOURCE_PANEL_MAX_HEIGHT,
  SOURCE_PANEL_WIDTH,
  Z_INDEX,
} from '@/lib/constants/layout'
import {
  COPILOT_SHORTCUTS,
  useCopilotUI,
  useCreateSession,
  useDeleteSession,
  useKeyboardShortcuts,
  useLocalFiles,
  usePrefetchSessions,
  useSessions,
} from '@/lib/hooks'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

function CopilotPageContent() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // Refs for focus management
  const mainContentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sourcePanelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // UI state management (sidebar, source panel, modals)
  const {
    isSidebarOpen,
    toggleSidebar,
    isSourcePanelOpen,
    toggleSourcePanel,
    activeSource,
    handleSourceChange,
    showShortcutsModal,
    openShortcutsModal,
    closeShortcutsModal,
    triggerRenameSessionId,
    setTriggerRenameSessionId,
    clearTriggerRenameSessionId,
  } = useCopilotUI()

  // Local file state management
  const {
    localFiles,
    selectedRawFiles,
    localAnalysisResult,
    isAnalyzingLocal,
    localError,
    handleLocalFilesUpload,
    handleLocalFilesSelect,
    handleRawFilesUpload,
    clearError: clearLocalError,
  } = useLocalFiles()

  // Accessibility: respect user's reduced motion preferences
  const shouldReduceMotion = useReducedMotion()
  const noMotion = shouldReduceMotion ?? false

  const { data: sessions, isLoading: isLoadingSessions } = useSessions()
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()
  const prefetchSessions = usePrefetchSessions()

  // Track page visit
  useEffect(() => {
    trackToolEvent('copilot_tool_open', {})
    prefetchSessions()
  }, [prefetchSessions])

  // Auto-select first session or create new one
  useEffect(() => {
    if (!isLoadingSessions && sessions) {
      if (sessions.length > 0 && !activeSessionId) {
        setActiveSessionId(sessions[0].id)
      }
    }
  }, [sessions, isLoadingSessions, activeSessionId])

  const handleSessionSelect = useCallback((id: string) => {
    setActiveSessionId(id)
    trackToolEvent('copilot_session_selected', { sessionId: id })
  }, [])

  const handleCreateSession = useCallback(async () => {
    try {
      const newSession = await createSession.mutateAsync({
        name: `Chat ${new Date().toLocaleDateString()}`,
      })
      setActiveSessionId(newSession.id)
      trackToolEvent('copilot_session_created', { sessionId: newSession.id })
      toast.success('New chat session created')
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error('Failed to create session. Please try again.')
    }
  }, [createSession])

  // Keyboard shortcut handlers
  const handleDeleteCurrentSession = useCallback(() => {
    if (activeSessionId) {
      deleteSession.mutate(activeSessionId, {
        onSuccess: () => {
          toast.success('Session deleted')
        },
        onError: () => {
          toast.error('Failed to delete session')
        },
      })
      trackToolEvent('copilot_session_deleted', { sessionId: activeSessionId })
      trackToolEvent('copilot_keyboard_shortcut_used', { shortcut: 'delete_session' })
    }
  }, [activeSessionId, deleteSession])

  const handlePrevSession = useCallback(() => {
    if (!sessions || sessions.length === 0 || !activeSessionId) return
    const currentIndex = sessions.findIndex((s) => s.id === activeSessionId)
    if (currentIndex > 0) {
      setActiveSessionId(sessions[currentIndex - 1].id)
      trackToolEvent('copilot_keyboard_shortcut_used', { shortcut: 'prev_session' })
    }
  }, [sessions, activeSessionId])

  const handleNextSession = useCallback(() => {
    if (!sessions || sessions.length === 0 || !activeSessionId) return
    const currentIndex = sessions.findIndex((s) => s.id === activeSessionId)
    if (currentIndex < sessions.length - 1) {
      setActiveSessionId(sessions[currentIndex + 1].id)
      trackToolEvent('copilot_keyboard_shortcut_used', { shortcut: 'next_session' })
    }
  }, [sessions, activeSessionId])

  const handleRenameCurrentSession = useCallback(() => {
    if (activeSessionId) {
      setTriggerRenameSessionId(activeSessionId)
      trackToolEvent('copilot_keyboard_shortcut_used', { shortcut: 'rename_session' })
    }
  }, [activeSessionId, setTriggerRenameSessionId])

  const handleShowShortcuts = useCallback(() => {
    openShortcutsModal()
    trackToolEvent('copilot_keyboard_shortcut_used', { shortcut: 'show_help' })
  }, [openShortcutsModal])

  // Wrap handleCreateSession for keyboard shortcut tracking
  const handleCreateSessionWithTracking = useCallback(async () => {
    trackToolEvent('copilot_keyboard_shortcut_used', { shortcut: 'new_session' })
    await handleCreateSession()
  }, [handleCreateSession])

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    { ...COPILOT_SHORTCUTS.NEW_SESSION, handler: handleCreateSessionWithTracking },
    { ...COPILOT_SHORTCUTS.DELETE_SESSION, handler: handleDeleteCurrentSession },
    { ...COPILOT_SHORTCUTS.RENAME_SESSION, handler: handleRenameCurrentSession },
    { ...COPILOT_SHORTCUTS.PREV_SESSION, handler: handlePrevSession },
    { ...COPILOT_SHORTCUTS.NEXT_SESSION, handler: handleNextSession },
    { ...COPILOT_SHORTCUTS.HELP, handler: handleShowShortcuts },
  ])

  // Focus management: Move focus to sidebar when opened (mobile), restore when closed
  useEffect(() => {
    if (isSidebarOpen && sidebarRef.current) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus first focusable element in sidebar
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    } else if (!isSidebarOpen && previousFocusRef.current) {
      // Restore focus when sidebar closes
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isSidebarOpen])

  // Focus management: Move focus to source panel when opened, restore when closed
  useEffect(() => {
    if (isSourcePanelOpen && sourcePanelRef.current) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus first focusable element in source panel
      const firstFocusable = sourcePanelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    } else if (!isSourcePanelOpen && previousFocusRef.current) {
      // Restore focus when source panel closes
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isSourcePanelOpen])

  // Skip to main content handler
  const handleSkipToMain = useCallback(() => {
    mainContentRef.current?.focus()
  }, [])

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <button
        type="button"
        onClick={handleSkipToMain}
        className={css({
          position: 'absolute',
          top: '-40px',
          left: '0',
          bg: 'violet.500',
          color: 'white',
          p: '2',
          zIndex: 100,
          border: 'none',
          cursor: 'pointer',
          _focus: {
            top: '0',
          },
        })}
      >
        Skip to main content
      </button>

      <main
        aria-label="GitHub Copilot Chat"
        className={css({
          display: 'flex',
          flexDir: 'column',
          h: MAIN_CONTENT_HEIGHT,
          overflow: 'hidden',
        })}
      >
        {/* Live region for dynamic announcements */}
        <div role="status" aria-live="polite" aria-atomic="true" className={css({ srOnly: true })}>
          {activeSessionId ? 'Chat session active' : 'No chat session selected'}
        </div>

        {/* Error Banner with alert role for screen readers */}
        {localError && (
          <div
            role="alert"
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '3',
              px: { base: '4', sm: '6', md: '8' },
              py: '3',
              bg: 'red.900/50',
              borderBottom: '1px solid',
              borderColor: 'red.500/30',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <AlertCircle
                aria-hidden="true"
                className={css({ w: '4', h: '4', color: 'red.400', flexShrink: 0 })}
              />
              <p className={css({ fontSize: 'sm', color: 'red.200' })}>{localError}</p>
            </div>
            <button
              type="button"
              onClick={clearLocalError}
              aria-label="Dismiss error"
              className={css({
                p: '1',
                rounded: 'md',
                color: 'red.400',
                _hover: { bg: 'red.800/50' },
                cursor: 'pointer',
                border: 'none',
                bg: 'transparent',
              })}
            >
              <X aria-hidden="true" className={css({ w: '4', h: '4' })} />
            </button>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={noMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={noMotion ? { duration: 0 } : { duration: 0.4 }}
          className={css({
            px: { base: '4', sm: '6', md: '8' },
            py: { base: '4', sm: '5' },
            borderBottom: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxW: '7xl',
              mx: 'auto',
              w: 'full',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  w: '12',
                  h: '12',
                  rounded: 'xl',
                  bg: 'linear-gradient(135deg, token(colors.violet.500), token(colors.purple.600))',
                  shadow: 'lg',
                })}
              >
                <Bot className={css({ w: '6', h: '6', color: 'white' })} />
              </div>
              <div>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <h1
                    className={css({
                      fontSize: { base: 'xl', sm: '2xl' },
                      fontWeight: 'bold',
                      color: 'white',
                    })}
                  >
                    GitHub Copilot Chat
                  </h1>
                  <Badge
                    variant="secondary"
                    className={css({
                      bg: 'violet.500/20',
                      color: 'violet.300',
                      border: '1px solid',
                      borderColor: 'violet.500/30',
                    })}
                  >
                    <Sparkles className={css({ w: '3', h: '3', mr: '1' })} />
                    AI
                  </Badge>
                </div>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    display: { base: 'none', sm: 'block' },
                  })}
                >
                  Your AI-powered coding assistant for code review, explanations, and more
                </p>
              </div>
            </div>

            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSidebar}
                className={css({
                  display: { base: 'flex', lg: 'none' },
                  borderColor: 'gray.700',
                  color: 'gray.300',
                  _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                  _focusVisible: {
                    outline: '2px solid',
                    outlineColor: 'violet.500',
                    outlineOffset: '2px',
                  },
                })}
              >
                <MessageSquare className={css({ w: '4', h: '4' })} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSourcePanel}
                className={css({
                  borderColor: isSourcePanelOpen ? 'violet.500' : 'gray.700',
                  color: isSourcePanelOpen ? 'violet.400' : 'gray.300',
                  _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                  _focusVisible: {
                    outline: '2px solid',
                    outlineColor: 'violet.500',
                    outlineOffset: '2px',
                  },
                })}
              >
                <FolderOpen className={css({ w: '4', h: '4', mr: '2' })} />
                Sources
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={createSession.isPending}
                className={css({
                  bg: 'linear-gradient(135deg, token(colors.violet.500), token(colors.purple.600))',
                  color: 'white',
                  _hover: {
                    bg: 'linear-gradient(135deg, token(colors.violet.600), token(colors.purple.700))',
                  },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                  _focusVisible: {
                    outline: '2px solid',
                    outlineColor: 'violet.500',
                    outlineOffset: '2px',
                  },
                })}
              >
                <Plus className={css({ w: '4', h: '4', mr: '2' })} />
                New Chat
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div
          className={css({
            display: 'flex',
            flex: '1',
            overflow: 'hidden',
            position: 'relative',
          })}
        >
          {/* Sidebar - Sessions navigation */}
          <motion.aside
            ref={sidebarRef}
            aria-label="Chat sessions"
            initial={noMotion ? false : { x: SIDEBAR_ANIMATION_OFFSET, opacity: 0 }}
            animate={{
              x: isSidebarOpen ? 0 : SIDEBAR_ANIMATION_OFFSET,
              opacity: isSidebarOpen ? 1 : 0,
            }}
            transition={noMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
            className={css({
              position: { base: 'absolute', lg: 'relative' },
              top: '0',
              left: '0',
              bottom: '0',
              zIndex: Z_INDEX.sidebar,
              w: SIDEBAR_WIDTH,
              borderRight: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/95',
              backdropFilter: 'blur(16px)',
              display: isSidebarOpen ? 'block' : 'none',
            })}
          >
            <SessionSidebar
              activeSessionId={activeSessionId ?? undefined}
              onSessionSelect={handleSessionSelect}
              triggerRenameSessionId={triggerRenameSessionId}
              onRenameTriggered={clearTriggerRenameSessionId}
            />
          </motion.aside>

          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              onKeyDown={(e) => e.key === 'Escape' && toggleSidebar()}
              aria-label="Close sidebar"
              className={css({
                display: { base: 'block', lg: 'none' },
                position: 'absolute',
                inset: '0',
                bg: 'black/50',
                zIndex: Z_INDEX.overlay,
                border: 'none',
                cursor: 'pointer',
              })}
            />
          )}

          {/* Chat Area - Main content region */}
          <div
            ref={mainContentRef}
            id="main-content"
            tabIndex={-1}
            role="region"
            aria-label="Chat conversation"
            className={css({
              flex: '1',
              display: 'flex',
              flexDir: 'column',
              overflow: 'hidden',
              bg: 'gray.950',
              _focus: { outline: 'none' },
            })}
          >
            {activeSessionId ? (
              <ChatContainer sessionId={activeSessionId} selectedFiles={selectedRawFiles} />
            ) : (
              <motion.div
                initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={noMotion ? { duration: 0 } : { duration: 0.4 }}
                className={css({
                  display: 'flex',
                  flex: '1',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: '8',
                })}
              >
                <Card
                  className={css({
                    maxW: 'md',
                    w: 'full',
                    border: '1px solid',
                    borderColor: 'gray.800',
                    bg: 'gray.900/50',
                    backdropFilter: 'blur(16px)',
                  })}
                >
                  <CardContent
                    className={css({
                      display: 'flex',
                      flexDir: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      py: '12',
                      gap: '4',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        w: '16',
                        h: '16',
                        rounded: '2xl',
                        bg: 'linear-gradient(135deg, token(colors.violet.500/20), token(colors.purple.600/20))',
                        border: '1px solid',
                        borderColor: 'violet.500/30',
                      })}
                    >
                      <Bot className={css({ w: '8', h: '8', color: 'violet.400' })} />
                    </div>
                    <div>
                      <h2
                        className={css({
                          fontSize: 'xl',
                          fontWeight: 'semibold',
                          color: 'white',
                          mb: '2',
                        })}
                      >
                        Welcome to Copilot Chat
                      </h2>
                      <p className={css({ fontSize: 'sm', color: 'gray.400', mb: '6' })}>
                        Start a new conversation or select an existing one from the sidebar
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateSession}
                      disabled={createSession.isPending}
                      size="lg"
                      className={css({
                        bg: 'linear-gradient(135deg, token(colors.violet.500), token(colors.purple.600))',
                        color: 'white',
                        _hover: {
                          bg: 'linear-gradient(135deg, token(colors.violet.600), token(colors.purple.700))',
                        },
                        _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                      })}
                    >
                      <Plus className={css({ w: '5', h: '5', mr: '2' })} />
                      Start New Chat
                    </Button>

                    {/* Quick action suggestions */}
                    <div className={css({ mt: '6', w: 'full' })}>
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.500',
                          mb: '3',
                          textTransform: 'uppercase',
                          letterSpacing: 'wide',
                        })}
                      >
                        Quick Actions
                      </p>
                      <div
                        className={css({
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '2',
                          justifyContent: 'center',
                        })}
                      >
                        <button
                          type="button"
                          onClick={handleCreateSession}
                          disabled={createSession.isPending}
                          className={css({
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1.5',
                            px: '3',
                            py: '1.5',
                            rounded: 'full',
                            fontSize: 'sm',
                            color: 'gray.300',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            _hover: {
                              bg: 'gray.800',
                              borderColor: 'violet.500/50',
                              color: 'violet.300',
                            },
                            _focusVisible: {
                              outline: '2px solid',
                              outlineColor: 'violet.500',
                              outlineOffset: '2px',
                            },
                            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                          })}
                        >
                          <FileCode aria-hidden="true" className={css({ w: '3.5', h: '3.5' })} />
                          Explain code
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateSession}
                          disabled={createSession.isPending}
                          className={css({
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1.5',
                            px: '3',
                            py: '1.5',
                            rounded: 'full',
                            fontSize: 'sm',
                            color: 'gray.300',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            _hover: {
                              bg: 'gray.800',
                              borderColor: 'violet.500/50',
                              color: 'violet.300',
                            },
                            _focusVisible: {
                              outline: '2px solid',
                              outlineColor: 'violet.500',
                              outlineOffset: '2px',
                            },
                            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                          })}
                        >
                          <GitPullRequest
                            aria-hidden="true"
                            className={css({ w: '3.5', h: '3.5' })}
                          />
                          Review PR
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateSession}
                          disabled={createSession.isPending}
                          className={css({
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1.5',
                            px: '3',
                            py: '1.5',
                            rounded: 'full',
                            fontSize: 'sm',
                            color: 'gray.300',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            _hover: {
                              bg: 'gray.800',
                              borderColor: 'violet.500/50',
                              color: 'violet.300',
                            },
                            _focusVisible: {
                              outline: '2px solid',
                              outlineColor: 'violet.500',
                              outlineOffset: '2px',
                            },
                            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                          })}
                        >
                          <Bug aria-hidden="true" className={css({ w: '3.5', h: '3.5' })} />
                          Debug issue
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateSession}
                          disabled={createSession.isPending}
                          className={css({
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1.5',
                            px: '3',
                            py: '1.5',
                            rounded: 'full',
                            fontSize: 'sm',
                            color: 'gray.300',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            _hover: {
                              bg: 'gray.800',
                              borderColor: 'violet.500/50',
                              color: 'violet.300',
                            },
                            _focusVisible: {
                              outline: '2px solid',
                              outlineColor: 'violet.500',
                              outlineOffset: '2px',
                            },
                            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                          })}
                        >
                          <Code aria-hidden="true" className={css({ w: '3.5', h: '3.5' })} />
                          Generate code
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Overlay for mobile when source panel is open */}
          {isSourcePanelOpen && (
            <button
              type="button"
              onClick={toggleSourcePanel}
              onKeyDown={(e) => e.key === 'Escape' && toggleSourcePanel()}
              aria-label="Close source panel"
              className={css({
                display: { base: 'block', lg: 'none' },
                position: 'absolute',
                inset: '0',
                bg: 'black/50',
                zIndex: Z_INDEX.sourcePanelOverlay,
                border: 'none',
                cursor: 'pointer',
              })}
            />
          )}

          {/* Source Panel - Right Sidebar (complementary region) */}
          <motion.aside
            ref={sourcePanelRef}
            aria-label="Code sources"
            initial={noMotion ? false : { x: SOURCE_PANEL_ANIMATION_OFFSET, opacity: 0 }}
            animate={{
              x: isSourcePanelOpen ? 0 : SOURCE_PANEL_ANIMATION_OFFSET,
              opacity: isSourcePanelOpen ? 1 : 0,
            }}
            transition={noMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
            className={css({
              position: { base: 'absolute', lg: 'relative' },
              top: '0',
              right: '0',
              bottom: '0',
              zIndex: Z_INDEX.sidebar,
              w: SOURCE_PANEL_WIDTH,
              borderLeft: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/95',
              backdropFilter: 'blur(16px)',
              display: isSourcePanelOpen ? 'block' : 'none',
              overflow: 'hidden',
            })}
          >
            <SourcePanel
              initialSource={activeSource}
              initialRepo={DEFAULT_COPILOT_REPO}
              onSourceChange={handleSourceChange}
              localFiles={localFiles}
              onLocalFilesSelect={handleLocalFilesSelect}
              onLocalFilesUpload={handleLocalFilesUpload}
              onRawFilesUpload={handleRawFilesUpload}
              localAnalysisResult={localAnalysisResult}
              isAnalyzingLocal={isAnalyzingLocal}
              localError={localError}
              maxHeight={SOURCE_PANEL_MAX_HEIGHT}
            />
          </motion.aside>
        </div>

        {/* Keyboard Shortcuts Modal */}
        {showShortcutsModal && (
          <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={closeShortcutsModal} />
        )}
      </main>
    </>
  )
}

function LoadingFallback() {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        h: 'calc(100vh - 64px)',
        bg: 'gray.950',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          alignItems: 'center',
          gap: '4',
        })}
      >
        <div
          className={css({
            w: '12',
            h: '12',
            rounded: 'full',
            border: '3px solid',
            borderColor: 'violet.500/30',
            borderTopColor: 'violet.500',
            animation: 'spin 1s linear infinite',
          })}
        />
        <p className={css({ color: 'gray.400', fontSize: 'sm' })}>Loading Copilot...</p>
      </div>
    </div>
  )
}

export default function CopilotPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CopilotPageContent />
    </Suspense>
  )
}
