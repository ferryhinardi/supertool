'use client'

import { motion } from 'framer-motion'
import { Bot, FolderOpen, MessageSquare, Plus, Sparkles } from 'lucide-react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { SourceType } from '@/components/copilot'
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
  COPILOT_SHORTCUTS,
  useCreateSession,
  useDeleteSession,
  useKeyboardShortcuts,
  usePrefetchSessions,
  useSessions,
} from '@/lib/hooks'
import { trackToolEvent } from '@/lib/services/analytics'
import type { LocalFileAnalysisResult, LocalFileInfo } from '@/lib/services/local-files'
import { css } from '@/styled-system/css'

function CopilotPageContent() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [triggerRenameSessionId, setTriggerRenameSessionId] = useState<string | null>(null)

  // Local file state
  const [localFiles, setLocalFiles] = useState<LocalFileInfo[]>([])
  const [selectedLocalFiles, setSelectedLocalFiles] = useState<LocalFileInfo[]>([])
  const [rawFilesMap, setRawFilesMap] = useState<Map<string, File>>(new Map())
  const [localAnalysisResult, setLocalAnalysisResult] = useState<LocalFileAnalysisResult | null>(
    null
  )
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<SourceType>('github')

  const { data: sessions, isLoading: isLoadingSessions } = useSessions()
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()
  const prefetchSessions = usePrefetchSessions()

  // Compute selected raw files from the map based on selectedLocalFiles
  const selectedRawFiles = useMemo(() => {
    return selectedLocalFiles
      .map((localFile) => rawFilesMap.get(localFile.name))
      .filter((file): file is File => file !== undefined)
  }, [selectedLocalFiles, rawFilesMap])

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
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }, [createSession])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const toggleSourcePanel = useCallback(() => {
    setIsSourcePanelOpen((prev) => !prev)
    trackToolEvent('copilot_source_panel_toggled', { isOpen: !isSourcePanelOpen })
  }, [isSourcePanelOpen])

  // Local file handlers
  const handleLocalFilesUpload = useCallback(async (files: LocalFileInfo[]) => {
    setLocalFiles((prev) => [...prev, ...files])
    setLocalError(null)

    // Analyze files after upload
    if (files.length > 0) {
      setIsAnalyzingLocal(true)
      try {
        const response = await fetch('/api/copilot/local-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze',
            files: files.map((f) => ({
              name: f.name,
              path: f.path,
              type: f.type,
              size: f.size,
              extension: f.extension,
              modifiedAt: f.modifiedAt,
              isDirectory: f.isDirectory,
            })),
          }),
        })
        if (response.ok) {
          const result = await response.json()
          setLocalAnalysisResult(result)
        }
      } catch (error) {
        console.error('Failed to analyze files:', error)
        setLocalError('Failed to analyze files')
      } finally {
        setIsAnalyzingLocal(false)
      }
    }

    trackToolEvent('copilot_local_files_uploaded', { count: files.length })
  }, [])

  const handleLocalFilesSelect = useCallback((files: LocalFileInfo[]) => {
    setSelectedLocalFiles(files)
    trackToolEvent('copilot_local_files_selected', { count: files.length })
  }, [])

  const handleRawFilesUpload = useCallback((files: File[]) => {
    setRawFilesMap((prev) => {
      const newMap = new Map(prev)
      for (const file of files) {
        newMap.set(file.name, file)
      }
      return newMap
    })
  }, [])

  const handleSourceChange = useCallback((source: SourceType) => {
    setActiveSource(source)
    trackToolEvent('copilot_source_changed', { source })
  }, [])

  // Keyboard shortcut handlers
  const handleDeleteCurrentSession = useCallback(() => {
    if (activeSessionId) {
      deleteSession.mutate(activeSessionId)
      trackToolEvent('copilot_session_deleted', { sessionId: activeSessionId })
    }
  }, [activeSessionId, deleteSession])

  const handlePrevSession = useCallback(() => {
    if (!sessions || sessions.length === 0 || !activeSessionId) return
    const currentIndex = sessions.findIndex((s) => s.id === activeSessionId)
    if (currentIndex > 0) {
      setActiveSessionId(sessions[currentIndex - 1].id)
    }
  }, [sessions, activeSessionId])

  const handleNextSession = useCallback(() => {
    if (!sessions || sessions.length === 0 || !activeSessionId) return
    const currentIndex = sessions.findIndex((s) => s.id === activeSessionId)
    if (currentIndex < sessions.length - 1) {
      setActiveSessionId(sessions[currentIndex + 1].id)
    }
  }, [sessions, activeSessionId])

  const handleRenameCurrentSession = useCallback(() => {
    if (activeSessionId) {
      setTriggerRenameSessionId(activeSessionId)
    }
  }, [activeSessionId])

  const handleShowShortcuts = useCallback(() => {
    setShowShortcutsModal(true)
  }, [])

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    { ...COPILOT_SHORTCUTS.NEW_SESSION, handler: handleCreateSession },
    { ...COPILOT_SHORTCUTS.DELETE_SESSION, handler: handleDeleteCurrentSession },
    { ...COPILOT_SHORTCUTS.RENAME_SESSION, handler: handleRenameCurrentSession },
    { ...COPILOT_SHORTCUTS.PREV_SESSION, handler: handlePrevSession },
    { ...COPILOT_SHORTCUTS.NEXT_SESSION, handler: handleNextSession },
    { ...COPILOT_SHORTCUTS.HELP, handler: handleShowShortcuts },
  ])

  return (
    <main
      className={css({
        display: 'flex',
        flexDir: 'column',
        h: 'calc(100vh - 64px)',
        overflow: 'hidden',
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{
            x: isSidebarOpen ? 0 : -300,
            opacity: isSidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={css({
            position: { base: 'absolute', lg: 'relative' },
            top: '0',
            left: '0',
            bottom: '0',
            zIndex: '20',
            w: { base: '280px', lg: '320px' },
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
            onRenameTriggered={() => setTriggerRenameSessionId(null)}
          />
        </motion.div>

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
              zIndex: '10',
              border: 'none',
              cursor: 'pointer',
            })}
          />
        )}

        {/* Chat Area */}
        <div
          className={css({
            flex: '1',
            display: 'flex',
            flexDir: 'column',
            overflow: 'hidden',
            bg: 'gray.950',
          })}
        >
          {activeSessionId ? (
            <ChatContainer sessionId={activeSessionId} selectedFiles={selectedRawFiles} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
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
              zIndex: '15',
              border: 'none',
              cursor: 'pointer',
            })}
          />
        )}

        {/* Source Panel - Right Sidebar */}
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{
            x: isSourcePanelOpen ? 0 : 300,
            opacity: isSourcePanelOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={css({
            position: { base: 'absolute', lg: 'relative' },
            top: '0',
            right: '0',
            bottom: '0',
            zIndex: '20',
            w: { base: '320px', lg: '380px' },
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
            initialRepo="ferryhinardi/supertool"
            onSourceChange={handleSourceChange}
            localFiles={localFiles}
            onLocalFilesSelect={handleLocalFilesSelect}
            onLocalFilesUpload={handleLocalFilesUpload}
            onRawFilesUpload={handleRawFilesUpload}
            localAnalysisResult={localAnalysisResult}
            isAnalyzingLocal={isAnalyzingLocal}
            localError={localError}
            maxHeight="calc(100vh - 140px)"
          />
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
      )}
    </main>
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
