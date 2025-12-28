'use client'
'use no memo'

import {
  BarChart3,
  Bell,
  BellOff,
  Check,
  Coffee,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Target,
  Timer,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { RelatedTools } from '@/components/ui/related-tools'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type TimerMode = 'work' | 'shortBreak' | 'longBreak'
type TimerStatus = 'idle' | 'running' | 'paused'

interface Task {
  id: string
  name: string
  pomodorosCompleted: number
  pomodorosTarget: number
  completed: boolean
  createdAt: string
}

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
}

interface Statistics {
  totalPomodoros: number
  totalWorkTime: number
  totalBreakTime: number
  sessionsToday: number
  todayDate: string
  dailyHistory: { date: string; count: number }[]
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notificationsEnabled: true,
  soundEnabled: true,
}

const faqs = [
  {
    question: 'What is the Pomodoro Technique and how does it work?',
    answer:
      'The Pomodoro Technique is a time management method developed by Francesco Cirillo that uses a timer to break work into focused intervals (traditionally 25 minutes) separated by short breaks (5 minutes). After 4 work sessions, you take a longer break (15-30 minutes). This helps maintain concentration, reduce mental fatigue, and improve productivity by creating structured work cycles.',
  },
  {
    question: 'Can I customize the timer intervals?',
    answer:
      'Yes! While the classic Pomodoro uses 25-minute work sessions and 5-minute breaks, our timer is fully customizable. Adjust work duration from 1-60 minutes, short breaks from 1-15 minutes, and long breaks from 10-60 minutes. Save your custom settings as presets for different types of tasks like deep work, studying, or creative projects.',
  },
  {
    question: 'How do I track tasks with the Pomodoro timer?',
    answer:
      "Add tasks to your task list before starting a session. When you start the timer, select the task you're working on. The tool tracks completed Pomodoros per task, helping you understand time spent on different activities. Review your statistics to see total focus time, completed sessions, and productivity patterns over time.",
  },
  {
    question: 'Does the timer work when I close the browser tab?',
    answer:
      "The timer continues running in the background even when you switch tabs or minimize the browser. You'll receive desktop notifications when each session ends (if you grant notification permissions). However, closing the browser entirely will stop the timer. For best results, keep the browser open or pinned during your work sessions.",
  },
  {
    question: 'What are the benefits of using the Pomodoro Technique?',
    answer:
      'The Pomodoro Technique helps combat procrastination, improves focus by creating urgency, prevents burnout through regular breaks, makes large tasks less overwhelming by breaking them into smaller chunks, and provides clear metrics to measure productivity. Studies show it reduces anxiety about time and helps maintain sustained mental energy throughout the day.',
  },
]

export default function PomodoroTimerPage() {
  // Timer state
  const [mode, setMode] = useState<TimerMode>('work')
  const [status, setStatus] = useState<TimerStatus>('idle')

  // Lazy initialization for settings from localStorage
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro_settings')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return DEFAULT_SETTINGS
  })

  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro_settings')
      if (saved) {
        return JSON.parse(saved).workDuration * 60
      }
    }
    return DEFAULT_SETTINGS.workDuration * 60
  })

  const [pomodoroCount, setPomodoroCount] = useState(0)

  // Tasks - lazy initialization
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro_tasks')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return []
  })
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskTarget, setNewTaskTarget] = useState('4')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Settings & UI
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Statistics - lazy initialization with daily reset
  const [statistics, setStatistics] = useState<Statistics>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro_statistics')
      if (saved) {
        const loaded = JSON.parse(saved)
        const today = new Date().toDateString()
        // Reset daily count if new day
        if (loaded.todayDate !== today) {
          const updated = {
            ...loaded,
            sessionsToday: 0,
            todayDate: today,
          }
          localStorage.setItem('pomodoro_statistics', JSON.stringify(updated))
          return updated
        }
        return loaded
      }
    }
    return {
      totalPomodoros: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      sessionsToday: 0,
      todayDate: new Date().toDateString(),
      dailyHistory: [],
    }
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // One-time initialization effects
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    trackToolEvent('pomodoro_timer_view', { feature: 'page_load' })
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('pomodoro_statistics', JSON.stringify(statistics))
  }, [statistics])

  // Helper functions
  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }, [settings.soundEnabled])

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (!settings.notificationsEnabled) return
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' })
      }
    },
    [settings.notificationsEnabled]
  )

  const handleTimerComplete = useCallback(() => {
    setStatus('idle')
    playSound()

    if (mode === 'work') {
      const newCount = pomodoroCount + 1
      setPomodoroCount(newCount)

      // Update active task
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === activeTaskId
              ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
              : task
          )
        )
      }

      // Update statistics
      const today = new Date().toDateString()
      setStatistics((prev) => {
        const newTotal = prev.totalPomodoros + 1
        const newWorkTime = prev.totalWorkTime + settings.workDuration
        const newSessionsToday = prev.todayDate === today ? prev.sessionsToday + 1 : 1

        const dailyHistory = [...prev.dailyHistory]
        const todayIndex = dailyHistory.findIndex((d) => d.date === today)
        if (todayIndex >= 0) {
          dailyHistory[todayIndex].count += 1
        } else {
          dailyHistory.push({ date: today, count: 1 })
        }

        return {
          totalPomodoros: newTotal,
          totalWorkTime: newWorkTime,
          totalBreakTime: prev.totalBreakTime,
          sessionsToday: newSessionsToday,
          todayDate: today,
          dailyHistory: dailyHistory.slice(-7),
        }
      })

      // Determine next mode
      const isLongBreak = newCount % settings.longBreakInterval === 0
      const nextMode: TimerMode = isLongBreak ? 'longBreak' : 'shortBreak'
      setMode(nextMode)
      setTimeLeft(isLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60)

      sendNotification(
        'Work Session Complete!',
        `Great job! Time for a ${isLongBreak ? 'long' : 'short'} break.`
      )
      toast.success(`Pomodoro #${newCount} complete! Time for a break.`)

      if (settings.autoStartBreaks) {
        setStatus('running')
      }

      trackToolEvent('pomodoro_complete', {
        pomodoro_count: newCount,
        has_active_task: !!activeTaskId,
      })
    } else {
      // Break complete
      const breakTime =
        mode === 'longBreak' ? settings.longBreakDuration : settings.shortBreakDuration

      setStatistics((prev) => ({
        ...prev,
        totalBreakTime: prev.totalBreakTime + breakTime,
      }))

      setMode('work')
      setTimeLeft(settings.workDuration * 60)

      sendNotification('Break Complete!', 'Ready to focus again?')
      toast.success('Break complete! Ready for another session?')

      if (settings.autoStartPomodoros) {
        setStatus('running')
      }

      trackToolEvent('pomodoro_break_complete', { break_type: mode })
    }
  }, [mode, pomodoroCount, activeTaskId, settings, playSound, sendNotification])

  const handlePlayPause = useCallback(() => {
    if (status === 'running') {
      setStatus('paused')
      trackToolEvent('pomodoro_pause', { mode, time_left: timeLeft })
    } else {
      setStatus('running')
      trackToolEvent('pomodoro_start', { mode, time_left: timeLeft })
    }
  }, [status, mode, timeLeft])

  const handleReset = useCallback(() => {
    setStatus('idle')
    const duration =
      mode === 'work'
        ? settings.workDuration
        : mode === 'longBreak'
          ? settings.longBreakDuration
          : settings.shortBreakDuration
    setTimeLeft(duration * 60)
    trackToolEvent('pomodoro_reset', { mode })
  }, [mode, settings.workDuration, settings.longBreakDuration, settings.shortBreakDuration])

  const handleModeChange = (newMode: TimerMode) => {
    setStatus('idle')
    setMode(newMode)
    const duration =
      newMode === 'work'
        ? settings.workDuration
        : newMode === 'longBreak'
          ? settings.longBreakDuration
          : settings.shortBreakDuration
    setTimeLeft(duration * 60)
    trackToolEvent('pomodoro_mode_change', { mode: newMode })
  }

  const addTask = () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name')
      return
    }

    const target = parseInt(newTaskTarget, 10) || 1
    const task: Task = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      pomodorosCompleted: 0,
      pomodorosTarget: target,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [...prev, task])
    setNewTaskName('')
    setNewTaskTarget('4')
    toast.success('Task added!')
    trackToolEvent('pomodoro_task_add', { target_pomodoros: target })
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (activeTaskId === id) setActiveTaskId(null)
    toast.success('Task deleted')
    trackToolEvent('pomodoro_task_delete', {})
  }

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    )
    trackToolEvent('pomodoro_task_toggle', {})
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = () => {
    const total =
      mode === 'work'
        ? settings.workDuration * 60
        : mode === 'longBreak'
          ? settings.longBreakDuration * 60
          : settings.shortBreakDuration * 60
    return ((total - timeLeft) / total) * 100
  }

  // Timer logic - placed after handler definitions to avoid forward reference
  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer is about to complete, trigger completion
            setTimeout(() => handleTimerComplete(), 0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status, timeLeft, handleTimerComplete])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault()
        handlePlayPause()
      } else if (e.code === 'Escape') {
        e.preventDefault()
        handleReset()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePlayPause, handleReset])

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
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
            borderColor: 'red.500/20',
            bg: 'red.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Timer className={css({ h: '5', w: '5', color: 'red.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'red.300' })}>
            Pomodoro Technique - Stay Focused
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'red.400',
            gradientVia: 'orange.400',
            gradientTo: 'yellow.400',
            bgClip: 'text',
          })}
          style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Pomodoro Timer
        </h1>

        <p className={css({ mx: 'auto', maxW: '2xl', fontSize: 'lg', color: 'white' })}>
          Boost productivity with the Pomodoro Technique. Work in focused 25-minute intervals, track
          your tasks, and build better habits with statistics and insights.
        </p>
      </div>

      {/* Main Timer and Controls */}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: '1fr 2fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
        })}
      >
        {/* Timer Card - Takes full width on mobile, 2 columns on desktop */}
        <Card
          className={css({
            gridColumn: { base: '1 / -1', md: '1 / 2', lg: '1 / 3' },
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardHeader>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  flex: 1,
                  flexWrap: 'wrap',
                })}
              >
                <Button
                  variant={mode === 'work' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('work')}
                  disabled={status === 'running'}
                  className={css({
                    ...(mode === 'work'
                      ? { bg: 'red.500/20', borderColor: 'red.500/40', color: 'red.300' }
                      : {}),
                  })}
                >
                  <Target className={css({ h: '4', w: '4', mr: '2' })} />
                  Work
                </Button>
                <Button
                  variant={mode === 'shortBreak' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('shortBreak')}
                  disabled={status === 'running'}
                  className={css({
                    ...(mode === 'shortBreak'
                      ? { bg: 'green.500/20', borderColor: 'green.500/40', color: 'green.300' }
                      : {}),
                  })}
                >
                  <Coffee className={css({ h: '4', w: '4', mr: '2' })} />
                  Short Break
                </Button>
                <Button
                  variant={mode === 'longBreak' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('longBreak')}
                  disabled={status === 'running'}
                  className={css({
                    ...(mode === 'longBreak'
                      ? { bg: 'blue.500/20', borderColor: 'blue.500/40', color: 'blue.300' }
                      : {}),
                  })}
                >
                  <Coffee className={css({ h: '4', w: '4', mr: '2' })} />
                  Long Break
                </Button>
              </div>

              <div className={css({ display: 'flex', gap: '2' })}>
                <Dialog
                  open={showSettings}
                  onOpenChange={(details) => setShowSettings(details.open)}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className={css({ h: '4', w: '4' })} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <SettingsPanel settings={settings} onUpdate={setSettings} />
                  </DialogContent>
                </Dialog>

                <Dialog open={showStats} onOpenChange={(details) => setShowStats(details.open)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className={css({ h: '4', w: '4' })} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <StatisticsPanel statistics={statistics} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className={css({ spaceY: '8' })}>
            {/* Circular Progress */}
            <div className={css({ display: 'flex', justifyContent: 'center', py: '8' })}>
              <div className={css({ position: 'relative' })}>
                <svg
                  width="280"
                  height="280"
                  className={css({ transform: 'rotate(-90deg)' })}
                  aria-label="Pomodoro timer progress"
                  role="img"
                >
                  <title>Pomodoro Timer Progress</title>
                  {/* Background circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r="130"
                    fill="none"
                    stroke="rgba(107, 114, 128, 0.2)"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r="130"
                    fill="none"
                    stroke={
                      mode === 'work'
                        ? 'rgba(239, 68, 68, 0.8)'
                        : mode === 'longBreak'
                          ? 'rgba(59, 130, 246, 0.8)'
                          : 'rgba(34, 197, 94, 0.8)'
                    }
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 130}`}
                    strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress() / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                  />
                </svg>

                {/* Time display */}
                <div
                  className={css({
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <div
                    className={css({
                      fontSize: '6xl',
                      fontWeight: 'bold',
                      fontFamily: 'mono',
                      color: 'gray.100',
                    })}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  <div className={css({ fontSize: 'lg', color: 'white', mt: '2' })}>
                    {mode === 'work'
                      ? 'Focus Time'
                      : mode === 'longBreak'
                        ? 'Long Break'
                        : 'Short Break'}
                  </div>
                  {activeTaskId && (
                    <div
                      className={css({
                        mt: '4',
                        px: '4',
                        py: '2',
                        rounded: 'full',
                        bg: 'purple.500/20',
                        fontSize: 'sm',
                        color: 'purple.300',
                      })}
                    >
                      {tasks.find((t) => t.id === activeTaskId)?.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={css({ display: 'flex', justifyContent: 'center', gap: '4' })}>
              <Button
                size="lg"
                onClick={handlePlayPause}
                className={css({
                  bg: mode === 'work' ? 'red.500/20' : 'green.500/20',
                  borderColor: mode === 'work' ? 'red.500/40' : 'green.500/40',
                  color: mode === 'work' ? 'red.300' : 'green.300',
                  px: '8',
                  py: '6',
                  fontSize: 'lg',
                })}
              >
                {status === 'running' ? (
                  <>
                    <Pause className={css({ h: '5', w: '5', mr: '2' })} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className={css({ h: '5', w: '5', mr: '2' })} />
                    {status === 'paused' ? 'Resume' : 'Start'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={status === 'idle'}
              >
                <RotateCcw className={css({ h: '5', w: '5', mr: '2' })} />
                Reset
              </Button>
            </div>

            {/* Quick stats */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4',
                pt: '4',
                borderTop: '1px solid',
                borderColor: 'gray.800',
              })}
            >
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'red.400' })}>
                  {pomodoroCount}
                </div>
                <div className={css({ fontSize: 'sm', color: 'white' })}>Session</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'purple.400' })}>
                  {statistics.sessionsToday}
                </div>
                <div className={css({ fontSize: 'sm', color: 'white' })}>Today</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'blue.400' })}>
                  {statistics.totalPomodoros}
                </div>
                <div className={css({ fontSize: 'sm', color: 'white' })}>Total</div>
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div
              className={css({
                display: 'flex',
                justifyContent: 'center',
                gap: '4',
                fontSize: 'sm',
                color: 'white',
              })}
            >
              <div>
                <kbd
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'sm',
                    bg: 'gray.800',
                    fontFamily: 'mono',
                  })}
                >
                  Space
                </kbd>{' '}
                Play/Pause
              </div>
              <div>
                <kbd
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'sm',
                    bg: 'gray.800',
                    fontFamily: 'mono',
                  })}
                >
                  Esc
                </kbd>{' '}
                Reset
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Sidebar */}
        <Card
          className={css({
            gridColumn: { base: '1 / -1', md: '2 / 3', lg: '3 / 4' },
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Target className={css({ h: '5', w: '5' })} />
              Tasks
            </CardTitle>
            <CardDescription>Track your Pomodoros per task</CardDescription>
          </CardHeader>

          <CardContent className={css({ spaceY: '4' })}>
            {/* Add task form */}
            <div className={css({ spaceY: '3' })}>
              <Field>
                <FieldLabel>Task Name</FieldLabel>
                <FieldInput
                  type="text"
                  placeholder="What are you working on?"
                  value={newTaskName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTaskName(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') addTask()
                  }}
                />
              </Field>

              <Field>
                <FieldLabel>Target Pomodoros</FieldLabel>
                <FieldInput
                  type="number"
                  min="1"
                  value={newTaskTarget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTaskTarget(e.target.value)
                  }
                />
              </Field>

              <Button onClick={addTask} size="sm" className={css({ w: 'full' })}>
                <Plus className={css({ h: '4', w: '4', mr: '2' })} />
                Add Task
              </Button>
            </div>

            {/* Task list */}
            <div className={css({ spaceY: '2', maxH: '96', overflowY: 'auto' })}>
              {tasks.length === 0 ? (
                <div
                  className={css({
                    textAlign: 'center',
                    py: '8',
                    fontSize: 'sm',
                    color: 'white',
                  })}
                >
                  No tasks yet. Add one to get started!
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    role="button"
                    tabIndex={0}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: activeTaskId === task.id ? 'purple.500/40' : 'gray.800',
                      bg: activeTaskId === task.id ? 'purple.500/10' : 'gray.800/50',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: task.completed ? 0.6 : 1,
                      _hover: { borderColor: 'purple.500/30', bg: 'purple.500/5' },
                      width: '100%',
                      textAlign: 'left',
                    })}
                    onClick={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveTaskId(activeTaskId === task.id ? null : task.id)
                      }
                    }}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '2',
                        mb: '2',
                      })}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleTaskComplete(task.id)
                        }}
                        className={css({
                          flexShrink: 0,
                          mt: '0.5',
                          h: '4',
                          w: '4',
                          rounded: 'sm',
                          border: '2px solid',
                          borderColor: task.completed ? 'green.500' : 'gray.600',
                          bg: task.completed ? 'green.500' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        })}
                      >
                        {task.completed && (
                          <Check className={css({ h: '3', w: '3', color: 'white' })} />
                        )}
                      </button>

                      <div
                        className={css({
                          flex: 1,
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: task.completed ? 'gray.500' : 'gray.200',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        })}
                      >
                        {task.name}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                        className={css({
                          flexShrink: 0,
                          color: 'gray.600',
                          _hover: { color: 'red.400' },
                        })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </button>
                    </div>

                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <div className={css({ flex: 1, h: '2', rounded: 'full', bg: 'gray.700' })}>
                        <div
                          className={css({
                            h: 'full',
                            rounded: 'full',
                            bg: 'purple.500',
                            transition: 'width 0.3s',
                          })}
                          style={{
                            width: `${(task.pomodorosCompleted / task.pomodorosTarget) * 100}%`,
                          }}
                        />
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'white' })}>
                        {task.pomodorosCompleted}/{task.pomodorosTarget}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'blue.500/20',
          bg: 'blue.500/5',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ fontSize: 'lg' })}>
            How to Use the Pomodoro Technique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: '4',
              w: 'full',
            })}
          >
            <div>
              <div
                className={css({
                  mb: '2',
                  h: '10',
                  w: '10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'lg',
                  bg: 'purple.500/20',
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'purple.300',
                })}
              >
                1
              </div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Choose a Task
              </h3>
              <p className={css({ fontSize: 'xs', color: 'white' })}>
                Select a task you want to work on and set a target number of Pomodoros.
              </p>
            </div>
            <div>
              <div
                className={css({
                  mb: '2',
                  h: '10',
                  w: '10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'lg',
                  bg: 'purple.500/20',
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'purple.300',
                })}
              >
                2
              </div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Work for 25 Minutes
              </h3>
              <p className={css({ fontSize: 'xs', color: 'white' })}>
                Focus completely on your task. Avoid all distractions until the timer rings.
              </p>
            </div>
            <div>
              <div
                className={css({
                  mb: '2',
                  h: '10',
                  w: '10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'lg',
                  bg: 'purple.500/20',
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'purple.300',
                })}
              >
                3
              </div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Take a Short Break
              </h3>
              <p className={css({ fontSize: 'xs', color: 'white' })}>
                Relax for 5 minutes. Stretch, grab water, or take a quick walk.
              </p>
            </div>
            <div>
              <div
                className={css({
                  mb: '2',
                  h: '10',
                  w: '10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'lg',
                  bg: 'purple.500/20',
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'purple.300',
                })}
              >
                4
              </div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Repeat & Rest
              </h3>
              <p className={css({ fontSize: 'xs', color: 'white' })}>
                After 4 Pomodoros, take a longer 15-minute break to recharge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/pomodoro" category="productivity" />
      <ToolRating toolId="/tools/pomodoro" toolName="Pomodoro Timer" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

// Settings Panel Component
function SettingsPanel({
  settings,
  onUpdate,
}: {
  settings: PomodoroSettings
  onUpdate: (settings: PomodoroSettings) => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onUpdate(localSettings)
    toast.success('Settings saved!')
    trackToolEvent('pomodoro_settings_save', {
      work_duration: localSettings.workDuration,
      auto_start: localSettings.autoStartBreaks,
    })
  }

  return (
    <div className={css({ p: '6', spaceY: '6' })}>
      <div>
        <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>Timer Settings</h2>
        <p className={css({ fontSize: 'sm', color: 'white' })}>Customize your Pomodoro intervals</p>
      </div>

      <div className={css({ spaceY: '4' })}>
        <Field>
          <FieldLabel>Work Duration (minutes)</FieldLabel>
          <FieldInput
            type="number"
            min="1"
            max="60"
            value={localSettings.workDuration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocalSettings({
                ...localSettings,
                workDuration: parseInt(e.target.value, 10) || 25,
              })
            }
          />
        </Field>

        <Field>
          <FieldLabel>Short Break (minutes)</FieldLabel>
          <FieldInput
            type="number"
            min="1"
            max="30"
            value={localSettings.shortBreakDuration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocalSettings({
                ...localSettings,
                shortBreakDuration: parseInt(e.target.value, 10) || 5,
              })
            }
          />
        </Field>

        <Field>
          <FieldLabel>Long Break (minutes)</FieldLabel>
          <FieldInput
            type="number"
            min="1"
            max="60"
            value={localSettings.longBreakDuration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocalSettings({
                ...localSettings,
                longBreakDuration: parseInt(e.target.value, 10) || 15,
              })
            }
          />
        </Field>

        <Field>
          <FieldLabel>Long Break Interval (Pomodoros)</FieldLabel>
          <FieldInput
            type="number"
            min="2"
            max="10"
            value={localSettings.longBreakInterval}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocalSettings({
                ...localSettings,
                longBreakInterval: parseInt(e.target.value, 10) || 4,
              })
            }
          />
        </Field>

        <div
          className={css({ spaceY: '3', pt: '4', borderTop: '1px solid', borderColor: 'gray.800' })}
        >
          <label
            className={css({ display: 'flex', alignItems: 'center', gap: '3', cursor: 'pointer' })}
          >
            <input
              type="checkbox"
              checked={localSettings.autoStartBreaks}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, autoStartBreaks: e.target.checked })
              }
              className={css({ h: '4', w: '4' })}
            />
            <span className={css({ fontSize: 'sm' })}>Auto-start breaks</span>
          </label>

          <label
            className={css({ display: 'flex', alignItems: 'center', gap: '3', cursor: 'pointer' })}
          >
            <input
              type="checkbox"
              checked={localSettings.autoStartPomodoros}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, autoStartPomodoros: e.target.checked })
              }
              className={css({ h: '4', w: '4' })}
            />
            <span className={css({ fontSize: 'sm' })}>Auto-start Pomodoros</span>
          </label>

          <label
            className={css({ display: 'flex', alignItems: 'center', gap: '3', cursor: 'pointer' })}
          >
            <input
              type="checkbox"
              checked={localSettings.notificationsEnabled}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, notificationsEnabled: e.target.checked })
              }
              className={css({ h: '4', w: '4' })}
            />
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              {localSettings.notificationsEnabled ? (
                <Bell className={css({ h: '4', w: '4' })} />
              ) : (
                <BellOff className={css({ h: '4', w: '4' })} />
              )}
              <span className={css({ fontSize: 'sm' })}>Desktop notifications</span>
            </div>
          </label>

          <label
            className={css({ display: 'flex', alignItems: 'center', gap: '3', cursor: 'pointer' })}
          >
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
              }
              className={css({ h: '4', w: '4' })}
            />
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              {localSettings.soundEnabled ? (
                <Volume2 className={css({ h: '4', w: '4' })} />
              ) : (
                <VolumeX className={css({ h: '4', w: '4' })} />
              )}
              <span className={css({ fontSize: 'sm' })}>Sound alerts</span>
            </div>
          </label>
        </div>
      </div>

      <Button onClick={handleSave} className={css({ w: 'full' })}>
        Save Settings
      </Button>
    </div>
  )
}

// Statistics Panel Component
function StatisticsPanel({ statistics }: { statistics: Statistics }) {
  const avgPerDay =
    statistics.dailyHistory.length > 0
      ? Math.round(
          statistics.dailyHistory.reduce((sum, d) => sum + d.count, 0) /
            statistics.dailyHistory.length
        )
      : 0

  const totalHours = Math.floor(statistics.totalWorkTime / 60)
  const totalMinutes = statistics.totalWorkTime % 60

  return (
    <div className={css({ p: '6', spaceY: '6' })}>
      <div>
        <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>Your Statistics</h2>
        <p className={css({ fontSize: 'sm', color: 'white' })}>Track your productivity over time</p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4',
        })}
      >
        <div
          className={css({
            p: '4',
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'purple.500/10',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'purple.400' })}>
            {statistics.totalPomodoros}
          </div>
          <div className={css({ fontSize: 'sm', color: 'white' })}>Total Pomodoros</div>
        </div>

        <div
          className={css({
            p: '4',
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/10',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.400' })}>
            {statistics.sessionsToday}
          </div>
          <div className={css({ fontSize: 'sm', color: 'white' })}>Today</div>
        </div>

        <div
          className={css({
            p: '4',
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'green.500/20',
            bg: 'green.500/10',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'green.400' })}>
            {totalHours}h {totalMinutes}m
          </div>
          <div className={css({ fontSize: 'sm', color: 'white' })}>Focus Time</div>
        </div>

        <div
          className={css({
            p: '4',
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'orange.500/10',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'orange.400' })}>
            {avgPerDay}
          </div>
          <div className={css({ fontSize: 'sm', color: 'white' })}>Avg per Day</div>
        </div>
      </div>

      {statistics.dailyHistory.length > 0 && (
        <div>
          <h3 className={css({ mb: '3', fontSize: 'lg', fontWeight: 'semibold' })}>Last 7 Days</h3>
          <div className={css({ spaceY: '2' })}>
            {statistics.dailyHistory.map((day) => {
              const maxCount = Math.max(...statistics.dailyHistory.map((d) => d.count))
              const percentage = (day.count / maxCount) * 100

              return (
                <div key={day.date} className={css({ spaceY: '1' })}>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'sm',
                    })}
                  >
                    <span className={css({ color: 'white' })}>
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className={css({ fontWeight: 'semibold' })}>{day.count}</span>
                  </div>
                  <div className={css({ h: '2', rounded: 'full', bg: 'gray.800' })}>
                    <div
                      className={css({ h: 'full', rounded: 'full', bg: 'purple.500' })}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
