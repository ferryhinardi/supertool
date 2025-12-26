'use client'

import { motion } from 'framer-motion'
import {
  Bell,
  Clock,
  Download,
  FileJson,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface TaskTimer {
  id: string
  name: string
  elapsed: number // in seconds
  isRunning: boolean
  startTime?: number // timestamp when started
}

interface Session {
  id: string
  name: string
  startTime: number
  endTime?: number
  timers: TaskTimer[]
  totalTime: number // total elapsed time across all timers
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function TaskTimerContent() {
  const [timers, setTimers] = useState<TaskTimer[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [sessionHistory, setSessionHistory] = useState<Session[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('taskTimerSessions')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  })
  const [newTimerName, setNewTimerName] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  )

  // Track page visit
  useEffect(() => {
    trackToolEvent('task_timer_open', {})
  }, [])

  // Save session history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionHistory.length > 0) {
        localStorage.setItem('taskTimerSessions', JSON.stringify(sessionHistory))
      } else {
        localStorage.removeItem('taskTimerSessions')
      }
    }
  }, [sessionHistory])

  // Update running timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.isRunning && timer.startTime) {
            const now = Date.now()
            const elapsed = Math.floor((now - timer.startTime) / 1000)
            return { ...timer, elapsed }
          }
          return timer
        })
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleStartSession = () => {
    if (currentSession) {
      toast.error('Please end current session first')
      return
    }

    const name = sessionName.trim() || `Session ${sessionHistory.length + 1}`
    const newSession: Session = {
      id: Date.now().toString(),
      name,
      startTime: Date.now(),
      timers: [],
      totalTime: 0,
    }

    setCurrentSession(newSession)
    setTimers([])
    setSessionName('')
    toast.success(`Started session: ${name}`)
    trackToolEvent('task_timer_session_start', { session_name: name })
  }

  const handleEndSession = () => {
    if (!currentSession) return

    // Stop all running timers
    const finalTimers = timers.map((t) => ({ ...t, isRunning: false }))
    const totalTime = finalTimers.reduce((sum, t) => sum + t.elapsed, 0)

    const completedSession: Session = {
      ...currentSession,
      endTime: Date.now(),
      timers: finalTimers,
      totalTime,
    }

    setSessionHistory([completedSession, ...sessionHistory])
    setCurrentSession(null)
    setTimers([])
    toast.success('Session ended and saved to history')
    trackToolEvent('task_timer_session_end', {
      duration_seconds: totalTime,
      timer_count: finalTimers.length,
    })
  }

  const handleAddTimer = () => {
    if (!currentSession) {
      toast.error('Please start a session first')
      return
    }

    const name = newTimerName.trim() || `Task ${timers.length + 1}`
    const newTimer: TaskTimer = {
      id: Date.now().toString(),
      name,
      elapsed: 0,
      isRunning: false,
    }

    setTimers([...timers, newTimer])
    setNewTimerName('')
    toast.success(`Added timer: ${name}`)
    trackToolEvent('task_timer_add', { timer_name: name })
  }

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          const newIsRunning = !timer.isRunning
          trackToolEvent(newIsRunning ? 'task_timer_start' : 'task_timer_pause', {
            timer_name: timer.name,
          })

          if (newIsRunning) {
            // Starting timer
            return {
              ...timer,
              isRunning: true,
              startTime: Date.now() - timer.elapsed * 1000,
            }
          }
          // Pausing timer
          return {
            ...timer,
            isRunning: false,
            startTime: undefined,
          }
        }
        return timer
      })
    )
  }

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            elapsed: 0,
            isRunning: false,
            startTime: undefined,
          }
        }
        return timer
      })
    )
    trackToolEvent('task_timer_reset', {})
  }

  const handleRemoveTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id))
    trackToolEvent('task_timer_remove', {})
  }

  const handleDeleteSession = (id: string) => {
    setSessionHistory((prev) => prev.filter((s) => s.id !== id))
    toast.success('Session deleted')
    trackToolEvent('task_timer_session_delete', {})
  }

  const exportToCSV = (session: Session) => {
    const headers = ['Task Name', 'Time (seconds)', 'Time (formatted)']
    const rows = session.timers.map((t) => [t.name, t.elapsed.toString(), formatTime(t.elapsed)])
    const totalRow = ['Total', session.totalTime.toString(), formatTime(session.totalTime)]

    const csv = [
      `Session: ${session.name}`,
      `Started: ${new Date(session.startTime).toLocaleString()}`,
      session.endTime ? `Ended: ${new Date(session.endTime).toLocaleString()}` : '',
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      totalRow.join(','),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session.name.replace(/[^a-z0-9]/gi, '_')}_session.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Exported to CSV')
    trackToolEvent('task_timer_export_csv', { session_name: session.name })
  }

  const exportToJSON = (session: Session) => {
    const data = {
      session: session.name,
      startTime: new Date(session.startTime).toISOString(),
      endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
      timers: session.timers.map((t) => ({
        name: t.name,
        elapsed: t.elapsed,
        formattedTime: formatTime(t.elapsed),
      })),
      totalTime: session.totalTime,
      formattedTotalTime: formatTime(session.totalTime),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session.name.replace(/[^a-z0-9]/gi, '_')}_session.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Exported to JSON')
    trackToolEvent('task_timer_export_json', { session_name: session.name })
  }

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'granted') {
      setNotificationPermission('granted')
      return
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      toast.success('Notifications enabled!')
    }
    trackToolEvent('notification_permission_request', { granted: permission === 'granted' })
  }

  const activeTimersCount = timers.filter((t) => t.isRunning).length
  const totalSessionTime = timers.reduce((sum, t) => sum + t.elapsed, 0)

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Timer className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            Multiple Timers • Session Management • Export Reports
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'purple.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Task Timer with Sessions
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Track multiple tasks concurrently with session management. Organize your work into
          sessions, export reports, and analyze your productivity.
        </p>
      </motion.div>

      {/* Session Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Session Control</CardTitle>
            <CardDescription>
              {currentSession
                ? `Active: ${currentSession.name} • ${formatTime(totalSessionTime)}`
                : 'Start a new session to track tasks'}
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {!currentSession ? (
              <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                <Input
                  placeholder="Session name (optional)"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartSession()
                  }}
                  className={css({
                    flex: '1',
                    minW: '60',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                />
                <Button
                  onClick={handleStartSession}
                  className={css({
                    gap: '2',
                    bg: 'purple.500/20',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    _hover: { bg: 'purple.500/30' },
                  })}
                >
                  <Play className={css({ h: '5', w: '5' })} />
                  Start Session
                </Button>
              </div>
            ) : (
              <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                <div
                  className={css({
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    bg: 'purple.500/10',
                    px: '4',
                    py: '3',
                  })}
                >
                  <Clock className={css({ h: '5', w: '5', color: 'purple.400' })} />
                  <div>
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Active Session</div>
                    <div
                      className={css({
                        fontSize: 'lg',
                        fontWeight: 'bold',
                        color: 'purple.300',
                      })}
                    >
                      {currentSession.name}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleEndSession}
                  className={css({
                    gap: '2',
                    bg: 'red.500/20',
                    border: '1px solid',
                    borderColor: 'red.500/50',
                    color: 'red.300',
                    _hover: { bg: 'red.500/30' },
                  })}
                >
                  <Save className={css({ h: '5', w: '5' })} />
                  End Session
                </Button>
              </div>
            )}

            {currentSession && (
              <div
                className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3' })}
              >
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '3',
                    textAlign: 'center',
                  })}
                >
                  <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                    Active Timers
                  </div>
                  <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'blue.300' })}>
                    {activeTimersCount}
                  </div>
                </div>
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '3',
                    textAlign: 'center',
                  })}
                >
                  <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                    Total Timers
                  </div>
                  <div
                    className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'purple.300' })}
                  >
                    {timers.length}
                  </div>
                </div>
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '3',
                    textAlign: 'center',
                  })}
                >
                  <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                    Session Time
                  </div>
                  <div
                    className={css({
                      fontSize: '2xl',
                      fontWeight: 'bold',
                      color: 'green.300',
                      fontVariantNumeric: 'tabular-nums',
                    })}
                  >
                    {formatTime(totalSessionTime)}
                  </div>
                </div>
              </div>
            )}

            {notificationPermission !== 'granted' && (
              <Button
                onClick={requestNotificationPermission}
                className={css({
                  w: 'full',
                  gap: '2',
                  bg: 'yellow.500/20',
                  border: '1px solid',
                  borderColor: 'yellow.500/50',
                  color: 'yellow.300',
                  _hover: { bg: 'yellow.500/30' },
                })}
              >
                <Bell className={css({ h: '5', w: '5' })} />
                Enable Notifications
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Timer */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Add Task Timer</CardTitle>
              <CardDescription>Create a new timer to track a specific task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                <Input
                  placeholder="Task name (optional)"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTimer()
                  }}
                  className={css({
                    flex: '1',
                    minW: '60',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                />
                <Button
                  onClick={handleAddTimer}
                  className={css({
                    gap: '2',
                    bg: 'blue.500/20',
                    border: '1px solid',
                    borderColor: 'blue.500/50',
                    color: 'blue.300',
                    _hover: { bg: 'blue.500/30' },
                  })}
                >
                  <Plus className={css({ h: '5', w: '5' })} />
                  Add Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Timers */}
      {currentSession && timers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <CardTitle>Active Timers</CardTitle>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                  })}
                >
                  {timers.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '3' })}>
                {timers.map((timer) => (
                  <div
                    key={timer.id}
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: timer.isRunning ? 'green.500/30' : 'gray.700',
                      bg: timer.isRunning ? 'green.500/10' : 'gray.800/50',
                      p: '4',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '3',
                      })}
                    >
                      <div className={css({ flex: '1', minW: '40' })}>
                        <div
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'semibold',
                            color: 'gray.200',
                            mb: '1',
                          })}
                        >
                          {timer.name}
                        </div>
                        <div
                          className={css({
                            fontSize: '2xl',
                            fontWeight: 'bold',
                            fontVariantNumeric: 'tabular-nums',
                            color: timer.isRunning ? 'green.300' : 'gray.400',
                          })}
                        >
                          {formatTime(timer.elapsed)}
                        </div>
                      </div>
                      <div className={css({ display: 'flex', gap: '2' })}>
                        <Button
                          onClick={() => handleToggleTimer(timer.id)}
                          size="sm"
                          className={css({
                            bg: timer.isRunning ? 'amber.500/20' : 'green.500/20',
                            border: '1px solid',
                            borderColor: timer.isRunning ? 'amber.500/50' : 'green.500/50',
                            color: timer.isRunning ? 'amber.300' : 'green.300',
                            _hover: {
                              bg: timer.isRunning ? 'amber.500/30' : 'green.500/30',
                            },
                          })}
                        >
                          {timer.isRunning ? (
                            <Pause className={css({ h: '4', w: '4' })} />
                          ) : (
                            <Play className={css({ h: '4', w: '4' })} />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleResetTimer(timer.id)}
                          size="sm"
                          className={css({
                            bg: 'gray.700',
                            color: 'gray.400',
                            _hover: { bg: 'gray.600' },
                          })}
                        >
                          <RotateCcw className={css({ h: '4', w: '4' })} />
                        </Button>
                        <Button
                          onClick={() => handleRemoveTimer(timer.id)}
                          size="sm"
                          className={css({
                            bg: 'transparent',
                            color: 'gray.500',
                            _hover: { bg: 'red.500/20', color: 'red.400' },
                          })}
                        >
                          <X className={css({ h: '4', w: '4' })} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <CardTitle>Session History</CardTitle>
                <Badge
                  className={css({
                    bg: 'purple.500/20',
                    color: 'purple.300',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                  })}
                >
                  {sessionHistory.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '4', maxH: '96', overflowY: 'auto' })}>
                {sessionHistory.map((session) => (
                  <div
                    key={session.id}
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '4',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'space-between',
                        mb: '3',
                        gap: '3',
                      })}
                    >
                      <div className={css({ flex: '1' })}>
                        <div
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'semibold',
                            color: 'gray.200',
                            mb: '1',
                          })}
                        >
                          {session.name}
                        </div>
                        <div className={css({ fontSize: 'sm', color: 'gray.500' })}>
                          {new Date(session.startTime).toLocaleString()}
                          {session.endTime && ` - ${new Date(session.endTime).toLocaleString()}`}
                        </div>
                        <div
                          className={css({
                            fontSize: 'xl',
                            fontWeight: 'bold',
                            fontVariantNumeric: 'tabular-nums',
                            color: 'purple.300',
                            mt: '2',
                          })}
                        >
                          Total: {formatTime(session.totalTime)}
                        </div>
                      </div>
                      <div className={css({ display: 'flex', gap: '2' })}>
                        <Button
                          onClick={() => exportToCSV(session)}
                          size="sm"
                          className={css({
                            gap: '2',
                            bg: 'green.500/20',
                            border: '1px solid',
                            borderColor: 'green.500/50',
                            color: 'green.300',
                            _hover: { bg: 'green.500/30' },
                          })}
                        >
                          <Download className={css({ h: '4', w: '4' })} />
                          CSV
                        </Button>
                        <Button
                          onClick={() => exportToJSON(session)}
                          size="sm"
                          className={css({
                            gap: '2',
                            bg: 'blue.500/20',
                            border: '1px solid',
                            borderColor: 'blue.500/50',
                            color: 'blue.300',
                            _hover: { bg: 'blue.500/30' },
                          })}
                        >
                          <FileJson className={css({ h: '4', w: '4' })} />
                          JSON
                        </Button>
                        <Button
                          onClick={() => handleDeleteSession(session.id)}
                          size="sm"
                          className={css({
                            bg: 'transparent',
                            color: 'gray.500',
                            _hover: { bg: 'red.500/20', color: 'red.400' },
                          })}
                        >
                          <Trash2 className={css({ h: '4', w: '4' })} />
                        </Button>
                      </div>
                    </div>

                    {/* Session Timers Breakdown */}
                    {session.timers.length > 0 && (
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'gray.400',
                            mb: '2',
                          })}
                        >
                          Task Breakdown:
                        </div>
                        {session.timers.map((timer) => (
                          <div
                            key={timer.id}
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              rounded: 'md',
                              bg: 'gray.900/50',
                              p: '2',
                              px: '3',
                            })}
                          >
                            <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                              {timer.name}
                            </span>
                            <span
                              className={css({
                                fontSize: 'sm',
                                fontWeight: 'bold',
                                fontVariantNumeric: 'tabular-nums',
                                color: 'blue.300',
                              })}
                            >
                              {formatTime(timer.elapsed)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'pink.500/20',
            bg: 'pink.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'pink.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'pink.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Start a session to organize multiple task timers together</li>
                  <li>• Run multiple timers concurrently to track different tasks</li>
                  <li>• Export session reports to CSV or JSON for analysis</li>
                  <li>• Enable notifications to stay updated on your progress</li>
                  <li>• All session data is saved locally and works offline</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function TaskTimerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskTimerContent />
    </Suspense>
  )
}
