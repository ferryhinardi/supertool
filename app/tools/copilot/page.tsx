'use client'

import { motion } from 'framer-motion'
import { Bot, MessageSquare, Plus, Sparkles } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { ChatContainer, SessionSidebar } from '@/components/copilot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCreateSession, usePrefetchSessions, useSessions } from '@/lib/hooks'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

function CopilotPageContent() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const { data: sessions, isLoading: isLoadingSessions } = useSessions()
  const createSession = useCreateSession()
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
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }, [createSession])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

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
            <ChatContainer sessionId={activeSessionId} />
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
      </div>
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
