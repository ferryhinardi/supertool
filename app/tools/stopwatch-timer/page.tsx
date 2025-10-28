'use client'

import { motion } from 'framer-motion'
import { Bell, Clock, Pause, Play, Plus, RotateCcw, Save, Sparkles, Trash2, X } from 'lucide-react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface LapTime {
  id: string
  time: number
  lapDuration: number
}

interface Timer {
  id: string
  name: string
  duration: number // in seconds
  remaining: number
  isRunning: boolean
}

interface TimerPreset {
  id: string
  name: string
  duration: number // in seconds
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
}

function formatTimerDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function StopwatchTimerContent() {
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch')

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [laps, setLaps] = useState<LapTime[]>([])

  // Timer state
  const [timers, setTimers] = useState<Timer[]>([])
  const [presets, setPresets] = useState<TimerPreset[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('timerPresets')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  })

  // New timer inputs
  const [newTimerName, setNewTimerName] = useState('')
  const [newTimerMinutes, setNewTimerMinutes] = useState('5')
  const [newTimerSeconds, setNewTimerSeconds] = useState('0')

  // Notification permission
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  )

  // Track page visit
  useEffect(() => {
    trackToolEvent('stopwatch_timer_open', {})
  }, [])

  // Save presets to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (presets.length > 0) {
        localStorage.setItem('timerPresets', JSON.stringify(presets))
      } else {
        localStorage.removeItem('timerPresets')
      }
    }
  }, [presets])

  // Stopwatch interval
  useEffect(() => {
    if (!stopwatchRunning) return

    const interval = setInterval(() => {
      setStopwatchTime((prev) => prev + 10)
    }, 10)

    return () => clearInterval(interval)
  }, [stopwatchRunning])

  const handleTimerComplete = useCallback(
    (timer: Timer) => {
      toast.success(`Timer "${timer.name}" completed!`)
      trackToolEvent('timer_complete', { timer_name: timer.name })

      // Play notification sound
      if (typeof window !== 'undefined') {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {
          // Fallback to system beep if audio fails
          console.log('Audio playback failed')
        })
      }

      // Show browser notification
      if (notificationPermission === 'granted') {
        new Notification('Timer Complete!', {
          body: `${timer.name} has finished`,
          icon: '/icon.png',
        })
      }
    },
    [notificationPermission]
  )

  // Timer intervals
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []

    timers.forEach((timer) => {
      if (timer.isRunning && timer.remaining > 0) {
        const interval = setInterval(() => {
          setTimers((prev) =>
            prev.map((t) => {
              if (t.id === timer.id && t.remaining > 0) {
                const newRemaining = t.remaining - 1
                // Check if timer just completed
                if (newRemaining === 0) {
                  handleTimerComplete(timer)
                }
                return { ...t, remaining: newRemaining, isRunning: newRemaining > 0 }
              }
              return t
            })
          )
        }, 1000)
        intervals.push(interval)
      }
    })

    return () => {
      for (const interval of intervals) {
        clearInterval(interval)
      }
    }
  }, [timers, handleTimerComplete])

  const handleStopwatchToggle = () => {
    setStopwatchRunning(!stopwatchRunning)
    trackToolEvent(stopwatchRunning ? 'stopwatch_pause' : 'stopwatch_start', {})
  }

  const handleStopwatchReset = () => {
    setStopwatchTime(0)
    setStopwatchRunning(false)
    setLaps([])
    trackToolEvent('stopwatch_reset', {})
  }

  const handleLap = () => {
    const lapDuration = laps.length > 0 ? stopwatchTime - laps[0].time : stopwatchTime
    const newLap: LapTime = {
      id: Date.now().toString(),
      time: stopwatchTime,
      lapDuration,
    }
    setLaps([newLap, ...laps])
    trackToolEvent('stopwatch_lap', { lap_count: laps.length + 1 })
  }

  const handleAddTimer = () => {
    const minutes = Number.parseInt(newTimerMinutes, 10) || 0
    const seconds = Number.parseInt(newTimerSeconds, 10) || 0
    const totalSeconds = minutes * 60 + seconds

    if (totalSeconds <= 0) {
      toast.error('Please enter a valid time')
      return
    }

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: newTimerName || `Timer ${timers.length + 1}`,
      duration: totalSeconds,
      remaining: totalSeconds,
      isRunning: false,
    }

    setTimers([...timers, newTimer])
    setNewTimerName('')
    setNewTimerMinutes('5')
    setNewTimerSeconds('0')
    toast.success('Timer added!')
    trackToolEvent('timer_add', { duration_seconds: totalSeconds })
  }

  const handleRemoveTimer = (id: string) => {
    setTimers(timers.filter((t) => t.id !== id))
    trackToolEvent('timer_remove', {})
  }

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          trackToolEvent(t.isRunning ? 'timer_pause' : 'timer_start', {})
          return { ...t, isRunning: !t.isRunning }
        }
        return t
      })
    )
  }

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remaining: t.duration, isRunning: false } : t))
    )
    trackToolEvent('timer_reset', {})
  }

  const handleSavePreset = () => {
    const minutes = Number.parseInt(newTimerMinutes, 10) || 0
    const seconds = Number.parseInt(newTimerSeconds, 10) || 0
    const totalSeconds = minutes * 60 + seconds

    if (totalSeconds <= 0) {
      toast.error('Please enter a valid time')
      return
    }

    const presetName = newTimerName || `${minutes}m ${seconds}s`
    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name: presetName,
      duration: totalSeconds,
    }

    setPresets([...presets, newPreset])
    toast.success('Preset saved!')
    trackToolEvent('timer_preset_save', { duration_seconds: totalSeconds })
  }

  const handleLoadPreset = (preset: TimerPreset) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      name: preset.name,
      duration: preset.duration,
      remaining: preset.duration,
      isRunning: false,
    }
    setTimers([...timers, newTimer])
    toast.success(`Loaded preset: ${preset.name}`)
    trackToolEvent('timer_preset_load', { preset_name: preset.name })
  }

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id))
    trackToolEvent('timer_preset_delete', {})
  }

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined') return
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

  const fastestLap = useMemo(() => {
    if (laps.length === 0) return null
    return laps.reduce((min, lap) => (lap.lapDuration < min.lapDuration ? lap : min))
  }, [laps])

  const slowestLap = useMemo(() => {
    if (laps.length === 0) return null
    return laps.reduce((max, lap) => (lap.lapDuration > max.lapDuration ? lap : max))
  }, [laps])

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
            borderColor: 'orange.500/30',
            bg: 'orange.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Clock className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            Stopwatch • Timer • Presets
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'amber.400',
            gradientTo: 'yellow.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Stopwatch & Timer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Professional stopwatch with lap tracking and multiple countdown timers. Save presets, set
          alarms, and get desktop notifications.
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={css({ display: 'flex', justifyContent: 'center' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            gap: '2',
            rounded: 'xl',
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'gray.900/50',
            p: '2',
            backdropFilter: 'blur(16px)',
          })}
        >
          <Button
            onClick={() => {
              setMode('stopwatch')
              trackToolEvent('mode_change', { mode: 'stopwatch' })
            }}
            className={css({
              gap: '2',
              bg: mode === 'stopwatch' ? 'orange.500/20' : 'transparent',
              border: '1px solid',
              borderColor: mode === 'stopwatch' ? 'orange.500/50' : 'transparent',
              color: mode === 'stopwatch' ? 'orange.300' : 'gray.400',
              _hover: {
                bg: mode === 'stopwatch' ? 'orange.500/30' : 'gray.800/50',
              },
            })}
          >
            <Clock className={css({ h: '5', w: '5' })} />
            Stopwatch
          </Button>
          <Button
            onClick={() => {
              setMode('timer')
              trackToolEvent('mode_change', { mode: 'timer' })
            }}
            className={css({
              gap: '2',
              bg: mode === 'timer' ? 'orange.500/20' : 'transparent',
              border: '1px solid',
              borderColor: mode === 'timer' ? 'orange.500/50' : 'transparent',
              color: mode === 'timer' ? 'orange.300' : 'gray.400',
              _hover: {
                bg: mode === 'timer' ? 'orange.500/30' : 'gray.800/50',
              },
            })}
          >
            <Bell className={css({ h: '5', w: '5' })} />
            Timer
          </Button>
        </div>
      </motion.div>

      {/* Stopwatch Mode */}
      {mode === 'stopwatch' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'orange.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardContent className={css({ py: '8', textAlign: 'center' })}>
                <div
                  className={css({
                    fontSize: { base: '5xl', md: '7xl' },
                    fontWeight: 'bold',
                    fontVariantNumeric: 'tabular-nums',
                    bgGradient: 'to-r',
                    gradientFrom: 'orange.400',
                    gradientTo: 'amber.400',
                    bgClip: 'text',
                    mb: '8',
                  })}
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatTime(stopwatchTime)}
                </div>

                <div
                  className={css({
                    display: 'flex',
                    gap: '4',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  })}
                >
                  <Button
                    onClick={handleStopwatchToggle}
                    className={css({
                      gap: '2',
                      h: '14',
                      px: '8',
                      fontSize: 'lg',
                      bg: stopwatchRunning ? 'amber.500/20' : 'orange.500/20',
                      border: '1px solid',
                      borderColor: stopwatchRunning ? 'amber.500/50' : 'orange.500/50',
                      color: stopwatchRunning ? 'amber.300' : 'orange.300',
                      _hover: {
                        bg: stopwatchRunning ? 'amber.500/30' : 'orange.500/30',
                      },
                    })}
                  >
                    {stopwatchRunning ? (
                      <>
                        <Pause className={css({ h: '5', w: '5' })} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className={css({ h: '5', w: '5' })} />
                        Start
                      </>
                    )}
                  </Button>

                  {stopwatchRunning && (
                    <Button
                      onClick={handleLap}
                      className={css({
                        gap: '2',
                        h: '14',
                        px: '8',
                        fontSize: 'lg',
                        bg: 'blue.500/20',
                        border: '1px solid',
                        borderColor: 'blue.500/50',
                        color: 'blue.300',
                        _hover: { bg: 'blue.500/30' },
                      })}
                    >
                      <Clock className={css({ h: '5', w: '5' })} />
                      Lap
                    </Button>
                  )}

                  <Button
                    onClick={handleStopwatchReset}
                    className={css({
                      gap: '2',
                      h: '14',
                      px: '8',
                      fontSize: 'lg',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'red.400' },
                    })}
                  >
                    <RotateCcw className={css({ h: '5', w: '5' })} />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lap Times */}
          {laps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'orange.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <CardTitle>Lap Times</CardTitle>
                    <Badge
                      className={css({
                        bg: 'orange.500/20',
                        color: 'orange.300',
                        border: '1px solid',
                        borderColor: 'orange.500/30',
                      })}
                    >
                      {laps.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={css({ spaceY: '2', maxH: '96', overflowY: 'auto' })}>
                    {laps.map((lap, index) => {
                      const isFastest = fastestLap && lap.id === fastestLap.id && laps.length > 1
                      const isSlowest = slowestLap && lap.id === slowestLap.id && laps.length > 1

                      return (
                        <div
                          key={lap.id}
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor: isFastest
                              ? 'green.500/30'
                              : isSlowest
                                ? 'red.500/30'
                                : 'gray.700',
                            bg: isFastest
                              ? 'green.500/10'
                              : isSlowest
                                ? 'red.500/10'
                                : 'gray.800/50',
                            p: '3',
                          })}
                        >
                          <div
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3',
                              flexWrap: 'wrap',
                            })}
                          >
                            <Badge
                              className={css({
                                bg: 'gray.700',
                                color: 'gray.300',
                                fontVariantNumeric: 'tabular-nums',
                              })}
                            >
                              #{laps.length - index}
                            </Badge>
                            <span
                              className={css({
                                fontSize: 'sm',
                                color: 'gray.400',
                                fontVariantNumeric: 'tabular-nums',
                              })}
                            >
                              {formatTime(lap.lapDuration)}
                            </span>
                            {isFastest && (
                              <Badge
                                className={css({
                                  bg: 'green.500/20',
                                  color: 'green.300',
                                  border: '1px solid',
                                  borderColor: 'green.500/30',
                                })}
                              >
                                Fastest
                              </Badge>
                            )}
                            {isSlowest && (
                              <Badge
                                className={css({
                                  bg: 'red.500/20',
                                  color: 'red.300',
                                  border: '1px solid',
                                  borderColor: 'red.500/30',
                                })}
                              >
                                Slowest
                              </Badge>
                            )}
                          </div>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'bold',
                              color: 'orange.300',
                              fontVariantNumeric: 'tabular-nums',
                            })}
                          >
                            {formatTime(lap.time)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* Timer Mode */}
      {mode === 'timer' && (
        <>
          {/* Add Timer Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'orange.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>Create Timer</CardTitle>
                <CardDescription>Set up a new countdown timer with custom duration</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <Input
                  placeholder="Timer name (optional)"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  className={css({
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                />

                <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3' })}>
                  <div>
                    <label
                      htmlFor="minutes"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
                      Minutes
                    </label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="999"
                      value={newTimerMinutes}
                      onChange={(e) => setNewTimerMinutes(e.target.value)}
                      className={css({
                        mt: '2',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seconds"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
                      Seconds
                    </label>
                    <Input
                      id="seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={newTimerSeconds}
                      onChange={(e) => setNewTimerSeconds(e.target.value)}
                      className={css({
                        mt: '2',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                </div>

                <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                  <Button
                    onClick={handleAddTimer}
                    className={css({
                      flex: '1',
                      minW: '40',
                      gap: '2',
                      bg: 'orange.500/20',
                      border: '1px solid',
                      borderColor: 'orange.500/50',
                      color: 'orange.300',
                      _hover: { bg: 'orange.500/30' },
                    })}
                  >
                    <Plus className={css({ h: '5', w: '5' })} />
                    Add Timer
                  </Button>
                  <Button
                    onClick={handleSavePreset}
                    className={css({
                      flex: '1',
                      minW: '40',
                      gap: '2',
                      bg: 'blue.500/20',
                      border: '1px solid',
                      borderColor: 'blue.500/50',
                      color: 'blue.300',
                      _hover: { bg: 'blue.500/30' },
                    })}
                  >
                    <Save className={css({ h: '5', w: '5' })} />
                    Save Preset
                  </Button>
                </div>

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

          {/* Timer Presets */}
          {presets.length > 0 && (
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
                  <CardTitle>Saved Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: {
                        base: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: '3',
                    })}
                  >
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '3',
                          transition: 'all 0.2s',
                          _hover: { bg: 'gray.800', borderColor: 'blue.500/50' },
                        })}
                      >
                        <button
                          type="button"
                          onClick={() => handleLoadPreset(preset)}
                          className={css({
                            flex: '1',
                            textAlign: 'left',
                            bg: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            p: '0',
                          })}
                        >
                          <div
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'gray.300',
                            })}
                          >
                            {preset.name}
                          </div>
                          <div
                            className={css({
                              fontSize: 'xs',
                              color: 'gray.500',
                              fontVariantNumeric: 'tabular-nums',
                            })}
                          >
                            {formatTimerDisplay(preset.duration)}
                          </div>
                        </button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePreset(preset.id)
                          }}
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Active Timers */}
          {timers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'orange.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <CardTitle>Active Timers</CardTitle>
                    <Badge
                      className={css({
                        bg: 'orange.500/20',
                        color: 'orange.300',
                        border: '1px solid',
                        borderColor: 'orange.500/30',
                      })}
                    >
                      {timers.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={css({ spaceY: '4' })}>
                    {timers.map((timer) => {
                      const progress = (timer.remaining / timer.duration) * 100
                      const isWarning = timer.remaining <= 10 && timer.remaining > 0
                      const isComplete = timer.remaining === 0

                      return (
                        <div
                          key={timer.id}
                          className={css({
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor: isComplete
                              ? 'green.500/30'
                              : isWarning
                                ? 'red.500/30'
                                : 'gray.700',
                            bg: isComplete
                              ? 'green.500/10'
                              : isWarning
                                ? 'red.500/10'
                                : 'gray.800/50',
                            p: '4',
                          })}
                        >
                          <div
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: '3',
                              flexWrap: 'wrap',
                              gap: '3',
                            })}
                          >
                            <div>
                              <div
                                className={css({
                                  fontSize: 'lg',
                                  fontWeight: 'semibold',
                                  color: 'gray.200',
                                })}
                              >
                                {timer.name}
                              </div>
                              <div
                                className={css({
                                  fontSize: '2xl',
                                  fontWeight: 'bold',
                                  fontVariantNumeric: 'tabular-nums',
                                  color: isComplete
                                    ? 'green.300'
                                    : isWarning
                                      ? 'red.300'
                                      : 'orange.300',
                                })}
                              >
                                {formatTimerDisplay(timer.remaining)}
                              </div>
                            </div>
                            <div className={css({ display: 'flex', gap: '2' })}>
                              <Button
                                onClick={() => handleToggleTimer(timer.id)}
                                disabled={timer.remaining === 0}
                                size="sm"
                                className={css({
                                  bg: timer.isRunning ? 'amber.500/20' : 'orange.500/20',
                                  border: '1px solid',
                                  borderColor: timer.isRunning ? 'amber.500/50' : 'orange.500/50',
                                  color: timer.isRunning ? 'amber.300' : 'orange.300',
                                  _hover: {
                                    bg: timer.isRunning ? 'amber.500/30' : 'orange.500/30',
                                  },
                                  _disabled: {
                                    opacity: '0.5',
                                    cursor: 'not-allowed',
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

                          {/* Progress Bar */}
                          <div
                            className={css({
                              h: '2',
                              w: 'full',
                              rounded: 'full',
                              bg: 'gray.700',
                              overflow: 'hidden',
                            })}
                          >
                            <div
                              className={css({
                                h: 'full',
                                rounded: 'full',
                                transition: 'all 0.3s',
                                bgGradient: 'to-r',
                                gradientFrom: isComplete
                                  ? 'green.500'
                                  : isWarning
                                    ? 'red.500'
                                    : 'orange.500',
                                gradientTo: isComplete
                                  ? 'green.400'
                                  : isWarning
                                    ? 'red.400'
                                    : 'amber.400',
                              })}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
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
            borderColor: 'amber.500/20',
            bg: 'amber.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'amber.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'amber.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Use lap times to track intervals during workouts or tasks</li>
                  <li>• Save frequently used durations as presets for quick access</li>
                  <li>• Enable notifications to get alerts when timers complete</li>
                  <li>• Run multiple timers simultaneously for complex schedules</li>
                  <li>• All data is saved locally and works offline</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

export default function StopwatchTimerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StopwatchTimerContent />
    </Suspense>
  )
}
