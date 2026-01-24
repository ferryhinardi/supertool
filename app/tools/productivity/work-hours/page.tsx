'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Check,
  Clock,
  Coffee,
  Copy,
  DollarSign,
  Download,
  FileText,
  Pause,
  Play,
  Plus,
  Timer,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  TOOL_COLORS,
  ToolMobilePicker,
  type ToolOperation,
  ToolOperationGrid,
} from '@/components/features/tool-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Types
type CalculationMode = 'daily' | 'weekly' | 'monthly'

interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  description: string
  hourlyRate?: number
}

interface Timesheet {
  id: string
  name: string
  entries: TimeEntry[]
  defaultHourlyRate: number
  createdAt: number
  updatedAt: number
}

interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedSeconds: number
}

// Operations
const CALCULATION_MODES: ToolOperation[] = [
  {
    id: 'daily',
    label: 'Daily Tracker',
    icon: Clock,
    color: TOOL_COLORS.primary,
    description: 'Track daily work hours',
  },
  {
    id: 'weekly',
    label: 'Weekly Summary',
    icon: Calendar,
    color: TOOL_COLORS.success,
    description: 'View weekly totals & overtime',
  },
  {
    id: 'monthly',
    label: 'Monthly Report',
    icon: TrendingUp,
    color: TOOL_COLORS.info,
    description: 'Generate monthly reports',
  },
]

// Storage key
const STORAGE_KEY = 'work-hours-timesheets'
const TIMER_STORAGE_KEY = 'work-hours-timer'

// FAQs
const faqs = [
  {
    question: 'How is overtime calculated?',
    answer:
      'Overtime is calculated as any hours worked beyond 8 hours per day or 40 hours per week. You can customize these thresholds in the settings. Daily overtime takes precedence in the calculation.',
  },
  {
    question: 'Can I track multiple projects or clients?',
    answer:
      'Yes! You can create multiple timesheets, each with its own entries and hourly rate. Use the description field to note specific projects or tasks within each timesheet.',
  },
  {
    question: 'How do I export my timesheet?',
    answer:
      'Click the Export button to download your timesheet as a CSV or JSON file. CSV is great for spreadsheets like Excel or Google Sheets, while JSON preserves all data for backup purposes.',
  },
  {
    question: 'Is my data saved automatically?',
    answer:
      "Yes, all your timesheets are automatically saved to your browser's local storage. Your data stays private on your device and persists between sessions.",
  },
  {
    question: 'How does the live timer work?',
    answer:
      'The live timer lets you track work in real-time. Start the timer when you begin working, pause for breaks, and stop when done. The time is automatically converted to an entry you can save.',
  },
]

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function calculateWorkedMinutes(entry: TimeEntry): number {
  const start = parseTimeToMinutes(entry.startTime)
  const end = parseTimeToMinutes(entry.endTime)
  let worked = end - start
  if (worked < 0) worked += 24 * 60 // Handle overnight shifts
  return Math.max(0, worked - entry.breakMinutes)
}

function formatMinutesToHours(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins}m`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function WorkHoursCalculatorPage() {
  // State
  const [mode, setMode] = useState<CalculationMode>('daily')
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [activeTimesheetId, setActiveTimesheetId] = useState<string | null>(null)
  const [showNewTimesheetModal, setShowNewTimesheetModal] = useState(false)
  const [newTimesheetName, setNewTimesheetName] = useState('')
  const [newTimesheetRate, setNewTimesheetRate] = useState('25')

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // New entry form state
  const [newEntry, setNewEntry] = useState<Omit<TimeEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 30,
    description: '',
  })

  // Get active timesheet
  const activeTimesheet = useMemo(
    () => timesheets.find((t) => t.id === activeTimesheetId) || null,
    [timesheets, activeTimesheetId]
  )

  // Load data from localStorage
  useEffect(() => {
    trackToolEvent('work_hours_open', {})

    const savedTimesheets = localStorage.getItem(STORAGE_KEY)
    if (savedTimesheets) {
      try {
        const parsed = JSON.parse(savedTimesheets)
        setTimesheets(parsed)
        if (parsed.length > 0) {
          setActiveTimesheetId(parsed[0].id)
        }
        trackToolEvent('work_hours_load', { count: parsed.length })
      } catch {
        console.error('Failed to parse saved timesheets')
      }
    }

    // Load timer state
    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY)
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer)
        if (parsed.isRunning && parsed.startTime) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000)
          setTimer({
            isRunning: true,
            startTime: parsed.startTime,
            elapsedSeconds: elapsed,
          })
        }
      } catch {
        console.error('Failed to parse timer state')
      }
    }
  }, [])

  // Save timesheets to localStorage
  useEffect(() => {
    if (timesheets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timesheets))
    }
  }, [timesheets])

  // Timer effect
  useEffect(() => {
    const { isRunning, startTime } = timer

    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => ({
          ...prev,
          elapsedSeconds: prev.startTime
            ? Math.floor((Date.now() - prev.startTime) / 1000)
            : prev.elapsedSeconds + 1,
        }))
      }, 1000)

      // Save timer state
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ isRunning, startTime }))
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      localStorage.removeItem(TIMER_STORAGE_KEY)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timer])

  // Handlers
  const handleModeChange = useCallback((opId: string) => {
    setMode(opId as CalculationMode)
    trackToolEvent('work_hours_calculate', { mode: opId })
  }, [])

  const handleCreateTimesheet = useCallback(() => {
    if (!newTimesheetName.trim()) {
      toast.error('Please enter a timesheet name')
      return
    }

    const newTimesheet: Timesheet = {
      id: generateId(),
      name: newTimesheetName.trim(),
      entries: [],
      defaultHourlyRate: Number.parseFloat(newTimesheetRate) || 25,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setTimesheets((prev) => [newTimesheet, ...prev])
    setActiveTimesheetId(newTimesheet.id)
    setNewTimesheetName('')
    setNewTimesheetRate('25')
    setShowNewTimesheetModal(false)
    trackToolEvent('work_hours_save', { action: 'create_timesheet' })
    toast.success('Timesheet created!')
  }, [newTimesheetName, newTimesheetRate])

  const handleDeleteTimesheet = useCallback(
    (id: string) => {
      setTimesheets((prev) => prev.filter((t) => t.id !== id))
      if (activeTimesheetId === id) {
        setActiveTimesheetId(timesheets[0]?.id || null)
      }
      trackToolEvent('work_hours_delete', { action: 'delete_timesheet' })
      toast.success('Timesheet deleted')
    },
    [activeTimesheetId, timesheets]
  )

  const handleAddEntry = useCallback(() => {
    if (!activeTimesheet) {
      toast.error('Please create or select a timesheet first')
      return
    }

    const entry: TimeEntry = {
      id: generateId(),
      ...newEntry,
      hourlyRate: activeTimesheet.defaultHourlyRate,
    }

    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === activeTimesheetId
          ? { ...t, entries: [...t.entries, entry], updatedAt: Date.now() }
          : t
      )
    )

    trackToolEvent('work_hours_add_entry', {
      workedMinutes: calculateWorkedMinutes(entry),
    })
    toast.success('Entry added!')
  }, [activeTimesheet, activeTimesheetId, newEntry])

  const handleRemoveEntry = useCallback(
    (entryId: string) => {
      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === activeTimesheetId
            ? { ...t, entries: t.entries.filter((e) => e.id !== entryId), updatedAt: Date.now() }
            : t
        )
      )
      trackToolEvent('work_hours_remove_entry', {})
      toast.success('Entry removed')
    },
    [activeTimesheetId]
  )

  const handleClearEntries = useCallback(() => {
    if (!activeTimesheet) return

    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === activeTimesheetId ? { ...t, entries: [], updatedAt: Date.now() } : t
      )
    )
    trackToolEvent('work_hours_clear', {})
    toast.success('All entries cleared')
  }, [activeTimesheet, activeTimesheetId])

  // Timer handlers
  const handleStartTimer = useCallback(() => {
    setTimer({
      isRunning: true,
      startTime: Date.now(),
      elapsedSeconds: 0,
    })
    trackToolEvent('work_hours_timer_start', {})
    toast.success('Timer started!')
  }, [])

  const handleStopTimer = useCallback(() => {
    const elapsed = timer.elapsedSeconds
    setTimer({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
    })

    if (elapsed > 60 && activeTimesheet) {
      // Auto-create entry from timer
      const now = new Date()
      const startDate = new Date(now.getTime() - elapsed * 1000)

      const entry: TimeEntry = {
        id: generateId(),
        date: now.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: now.toTimeString().slice(0, 5),
        breakMinutes: 0,
        description: 'Timed session',
        hourlyRate: activeTimesheet.defaultHourlyRate,
      }

      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === activeTimesheetId
            ? { ...t, entries: [...t.entries, entry], updatedAt: Date.now() }
            : t
        )
      )
      toast.success(`Timer stopped! Entry added: ${formatMinutesToHours(Math.floor(elapsed / 60))}`)
    } else {
      toast.info('Timer stopped (session too short to create entry)')
    }

    trackToolEvent('work_hours_timer_stop', { elapsedSeconds: elapsed })
  }, [timer.elapsedSeconds, activeTimesheet, activeTimesheetId])

  // Export handlers
  const handleExportCSV = useCallback(() => {
    if (!activeTimesheet || activeTimesheet.entries.length === 0) {
      toast.error('No entries to export')
      return
    }

    const headers = [
      'Date',
      'Start Time',
      'End Time',
      'Break (min)',
      'Worked Hours',
      'Description',
      'Earnings',
    ]
    const rows = activeTimesheet.entries.map((e) => {
      const worked = calculateWorkedMinutes(e)
      const earnings = (worked / 60) * (e.hourlyRate || activeTimesheet.defaultHourlyRate)
      return [
        e.date,
        e.startTime,
        e.endTime,
        e.breakMinutes.toString(),
        formatMinutesToHours(worked),
        `"${e.description.replace(/"/g, '""')}"`,
        formatCurrency(earnings),
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTimesheet.name.replace(/\s+/g, '-')}-timesheet.csv`
    a.click()
    URL.revokeObjectURL(url)

    trackToolEvent('work_hours_export', {
      format: 'csv',
      entryCount: activeTimesheet.entries.length,
    })
    toast.success('Timesheet exported as CSV!')
  }, [activeTimesheet])

  const _handleExportJSON = useCallback(() => {
    if (!activeTimesheet) {
      toast.error('No timesheet to export')
      return
    }

    const json = JSON.stringify(activeTimesheet, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTimesheet.name.replace(/\s+/g, '-')}-timesheet.json`
    a.click()
    URL.revokeObjectURL(url)

    trackToolEvent('work_hours_export', { format: 'json' })
    toast.success('Timesheet exported as JSON!')
  }, [activeTimesheet])

  const handleCopyResults = useCallback(() => {
    if (!activeTimesheet || activeTimesheet.entries.length === 0) {
      toast.error('No data to copy')
      return
    }

    const totalMinutes = activeTimesheet.entries.reduce(
      (sum, e) => sum + calculateWorkedMinutes(e),
      0
    )
    const totalEarnings = activeTimesheet.entries.reduce((sum, e) => {
      const worked = calculateWorkedMinutes(e)
      return sum + (worked / 60) * (e.hourlyRate || activeTimesheet.defaultHourlyRate)
    }, 0)

    const text = `${activeTimesheet.name}
Total Hours: ${formatMinutesToHours(totalMinutes)}
Total Earnings: ${formatCurrency(totalEarnings)}
Entries: ${activeTimesheet.entries.length}`

    navigator.clipboard.writeText(text)
    trackToolEvent('work_hours_copy', {})
    toast.success('Summary copied to clipboard!')
  }, [activeTimesheet])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!activeTimesheet || activeTimesheet.entries.length === 0) {
      return {
        totalMinutes: 0,
        totalEarnings: 0,
        averageDaily: 0,
        overtimeMinutes: 0,
        entriesByWeek: {} as Record<number, number>,
        entriesByMonth: {} as Record<string, number>,
      }
    }

    const totalMinutes = activeTimesheet.entries.reduce(
      (sum, e) => sum + calculateWorkedMinutes(e),
      0
    )
    const totalEarnings = activeTimesheet.entries.reduce((sum, e) => {
      const worked = calculateWorkedMinutes(e)
      return sum + (worked / 60) * (e.hourlyRate || activeTimesheet.defaultHourlyRate)
    }, 0)

    // Group by date for daily overtime
    const byDate: Record<string, number> = {}
    for (const e of activeTimesheet.entries) {
      byDate[e.date] = (byDate[e.date] || 0) + calculateWorkedMinutes(e)
    }

    // Calculate overtime (over 8 hours/day)
    const overtimeMinutes = Object.values(byDate).reduce((sum, mins) => {
      return sum + Math.max(0, mins - 8 * 60)
    }, 0)

    const uniqueDays = Object.keys(byDate).length
    const averageDaily = uniqueDays > 0 ? totalMinutes / uniqueDays : 0

    // Group by week
    const entriesByWeek: Record<number, number> = {}
    for (const e of activeTimesheet.entries) {
      const week = getWeekNumber(new Date(e.date))
      entriesByWeek[week] = (entriesByWeek[week] || 0) + calculateWorkedMinutes(e)
    }

    // Group by month
    const entriesByMonth: Record<string, number> = {}
    for (const e of activeTimesheet.entries) {
      const month = getMonthName(new Date(e.date))
      entriesByMonth[month] = (entriesByMonth[month] || 0) + calculateWorkedMinutes(e)
    }

    return {
      totalMinutes,
      totalEarnings,
      averageDaily,
      overtimeMinutes,
      entriesByWeek,
      entriesByMonth,
    }
  }, [activeTimesheet])

  // Get current mode operation
  const currentModeOp = useMemo(
    () => CALCULATION_MODES.find((op) => op.id === mode) || CALCULATION_MODES[0],
    [mode]
  )

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
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({ display: 'flex', justifyContent: 'center', gap: '2', flexWrap: 'wrap' })}
        >
          <Badge
            variant="outline"
            className={css({ color: 'green.400', borderColor: 'green.400/50' })}
          >
            Productivity
          </Badge>
          <Badge
            variant="outline"
            className={css({ color: 'blue.400', borderColor: 'blue.400/50' })}
          >
            Time Tracking
          </Badge>
        </div>
        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            color: 'white',
          })}
        >
          Work Hours Calculator
        </h1>
        <p className={css({ color: 'gray.400', maxW: '2xl', mx: 'auto' })}>
          Track your work hours, calculate overtime, and manage timesheets. Perfect for freelancers,
          contractors, and employees tracking billable hours.
        </p>
      </motion.div>

      {/* Mode Selection */}
      <div className={css({ display: { base: 'none', md: 'block' } })}>
        <ToolOperationGrid
          operations={CALCULATION_MODES}
          selectedOperation={mode}
          onOperationChange={handleModeChange}
          columns={{ base: 1, sm: 3, lg: 3 }}
          analyticsCategory="work_hours"
        />
      </div>
      <div className={css({ display: { base: 'block', md: 'none' } })}>
        <ToolMobilePicker
          label={currentModeOp.label}
          title="Select Mode"
          description="Choose tracking mode"
          color={TOOL_COLORS.success}
        >
          <ToolOperationGrid
            operations={CALCULATION_MODES}
            selectedOperation={mode}
            onOperationChange={handleModeChange}
            columns={{ base: 1, sm: 2, lg: 3 }}
            analyticsCategory="work_hours"
          />
        </ToolMobilePicker>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
        })}
      >
        {/* Left Column - Timesheet Management & Entry Form */}
        <div className={css({ spaceY: '6', gridColumn: { lg: 'span 1' } })}>
          {/* Live Timer */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: timer.isRunning ? 'green.500/40' : 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader className={css({ pb: '2' })}>
              <CardTitle
                className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'white' })}
              >
                <Timer className={css({ w: '5', h: '5', color: 'green.400' })} />
                Live Timer
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  textAlign: 'center',
                  py: '4',
                  px: '2',
                  bg: 'gray.800/50',
                  rounded: 'lg',
                  fontFamily: 'mono',
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  color: timer.isRunning ? 'green.400' : 'gray.400',
                })}
              >
                {formatTime(timer.elapsedSeconds)}
              </div>
              <div className={css({ display: 'flex', gap: '2' })}>
                {!timer.isRunning ? (
                  <Button
                    onClick={handleStartTimer}
                    className={css({ flex: '1', bg: 'green.600', _hover: { bg: 'green.700' } })}
                  >
                    <Play className={css({ w: '4', h: '4', mr: '2' })} />
                    Start
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopTimer}
                    className={css({ flex: '1', bg: 'red.600', _hover: { bg: 'red.700' } })}
                  >
                    <Pause className={css({ w: '4', h: '4', mr: '2' })} />
                    Stop & Save
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timesheet Selector */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader className={css({ pb: '2' })}>
              <CardTitle
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'white',
                })}
              >
                <span className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <FileText className={css({ w: '5', h: '5', color: 'green.400' })} />
                  Timesheets
                </span>
                <Button
                  size="sm"
                  onClick={() => setShowNewTimesheetModal(true)}
                  className={css({ bg: 'green.600', _hover: { bg: 'green.700' } })}
                >
                  <Plus className={css({ w: '4', h: '4' })} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '2' })}>
              {timesheets.length === 0 ? (
                <p className={css({ color: 'gray.500', textAlign: 'center', py: '4' })}>
                  No timesheets yet. Create one to start tracking!
                </p>
              ) : (
                timesheets.map((ts) => (
                  <div
                    key={ts.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveTimesheetId(ts.id)
                      }
                    }}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: '3',
                      rounded: 'lg',
                      bg: activeTimesheetId === ts.id ? 'green.600/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: activeTimesheetId === ts.id ? 'green.500/40' : 'transparent',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800' },
                    })}
                    onClick={() => setActiveTimesheetId(ts.id)}
                  >
                    <div>
                      <p className={css({ color: 'white', fontWeight: '500' })}>{ts.name}</p>
                      <p className={css({ color: 'gray.500', fontSize: 'sm' })}>
                        {ts.entries.length} entries · ${ts.defaultHourlyRate}/hr
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTimesheet(ts.id)
                      }}
                      className={css({ color: 'red.400', _hover: { bg: 'red.900/30' } })}
                    >
                      <Trash2 className={css({ w: '4', h: '4' })} />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Add Entry Form */}
          {activeTimesheet && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader className={css({ pb: '2' })}>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    color: 'white',
                  })}
                >
                  <Plus className={css({ w: '5', h: '5', color: 'green.400' })} />
                  Add Entry
                </CardTitle>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div>
                  <label
                    htmlFor="entry-date"
                    className={css({
                      color: 'gray.400',
                      fontSize: 'sm',
                      mb: '1',
                      display: 'block',
                    })}
                  >
                    Date
                  </label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, date: e.target.value }))}
                    className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                  />
                </div>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '3',
                  })}
                >
                  <div>
                    <label
                      htmlFor="entry-start-time"
                      className={css({
                        color: 'gray.400',
                        fontSize: 'sm',
                        mb: '1',
                        display: 'block',
                      })}
                    >
                      Start Time
                    </label>
                    <Input
                      id="entry-start-time"
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) =>
                        setNewEntry((prev) => ({ ...prev, startTime: e.target.value }))
                      }
                      className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="entry-end-time"
                      className={css({
                        color: 'gray.400',
                        fontSize: 'sm',
                        mb: '1',
                        display: 'block',
                      })}
                    >
                      End Time
                    </label>
                    <Input
                      id="entry-end-time"
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) =>
                        setNewEntry((prev) => ({ ...prev, endTime: e.target.value }))
                      }
                      className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="entry-break"
                    className={css({
                      color: 'gray.400',
                      fontSize: 'sm',
                      mb: '1',
                      display: 'block',
                    })}
                  >
                    Break (minutes)
                  </label>
                  <Input
                    id="entry-break"
                    type="number"
                    min="0"
                    value={newEntry.breakMinutes}
                    onChange={(e) =>
                      setNewEntry((prev) => ({ ...prev, breakMinutes: Number(e.target.value) }))
                    }
                    className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                  />
                </div>
                <div>
                  <label
                    htmlFor="entry-description"
                    className={css({
                      color: 'gray.400',
                      fontSize: 'sm',
                      mb: '1',
                      display: 'block',
                    })}
                  >
                    Description
                  </label>
                  <Input
                    id="entry-description"
                    placeholder="What did you work on?"
                    value={newEntry.description}
                    onChange={(e) =>
                      setNewEntry((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                  />
                </div>
                <Button
                  onClick={handleAddEntry}
                  className={css({ w: 'full', bg: 'green.600', _hover: { bg: 'green.700' } })}
                >
                  <Plus className={css({ w: '4', h: '4', mr: '2' })} />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & Entries */}
        <div className={css({ spaceY: '6', gridColumn: { lg: 'span 2' } })}>
          {/* Summary Stats */}
          {activeTimesheet && (
            <div
              className={css({
                display: 'grid',
                gap: '4',
                gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              })}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'green.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '4', textAlign: 'center' })}>
                  <Clock
                    className={css({ w: '6', h: '6', color: 'green.400', mx: 'auto', mb: '2' })}
                  />
                  <p className={css({ color: 'gray.400', fontSize: 'sm' })}>Total Hours</p>
                  <p className={css({ color: 'white', fontSize: 'xl', fontWeight: 'bold' })}>
                    {formatMinutesToHours(stats.totalMinutes)}
                  </p>
                </CardContent>
              </Card>
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'blue.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '4', textAlign: 'center' })}>
                  <DollarSign
                    className={css({ w: '6', h: '6', color: 'blue.400', mx: 'auto', mb: '2' })}
                  />
                  <p className={css({ color: 'gray.400', fontSize: 'sm' })}>Total Earnings</p>
                  <p className={css({ color: 'white', fontSize: 'xl', fontWeight: 'bold' })}>
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </CardContent>
              </Card>
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'amber.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '4', textAlign: 'center' })}>
                  <TrendingUp
                    className={css({ w: '6', h: '6', color: 'amber.400', mx: 'auto', mb: '2' })}
                  />
                  <p className={css({ color: 'gray.400', fontSize: 'sm' })}>Daily Avg</p>
                  <p className={css({ color: 'white', fontSize: 'xl', fontWeight: 'bold' })}>
                    {formatMinutesToHours(Math.round(stats.averageDaily))}
                  </p>
                </CardContent>
              </Card>
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'red.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '4', textAlign: 'center' })}>
                  <Coffee
                    className={css({ w: '6', h: '6', color: 'red.400', mx: 'auto', mb: '2' })}
                  />
                  <p className={css({ color: 'gray.400', fontSize: 'sm' })}>Overtime</p>
                  <p className={css({ color: 'white', fontSize: 'xl', fontWeight: 'bold' })}>
                    {formatMinutesToHours(stats.overtimeMinutes)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mode-specific view */}
          {activeTimesheet && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <CardTitle className={css({ color: 'white' })}>
                    {mode === 'daily' && 'Time Entries'}
                    {mode === 'weekly' && 'Weekly Summary'}
                    {mode === 'monthly' && 'Monthly Report'}
                  </CardTitle>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button size="sm" variant="outline" onClick={handleCopyResults}>
                      <Copy className={css({ w: '4', h: '4' })} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExportCSV}>
                      <Download className={css({ w: '4', h: '4' })} />
                    </Button>
                    {activeTimesheet.entries.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearEntries}
                        className={css({ color: 'red.400', borderColor: 'red.400/50' })}
                      >
                        <Trash2 className={css({ w: '4', h: '4' })} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mode === 'daily' && (
                  <div className={css({ spaceY: '3' })}>
                    {activeTimesheet.entries.length === 0 ? (
                      <p className={css({ color: 'gray.500', textAlign: 'center', py: '8' })}>
                        No entries yet. Add your first time entry above!
                      </p>
                    ) : (
                      activeTimesheet.entries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((entry) => {
                          const worked = calculateWorkedMinutes(entry)
                          const earnings =
                            (worked / 60) * (entry.hourlyRate || activeTimesheet.defaultHourlyRate)
                          return (
                            <div
                              key={entry.id}
                              className={css({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: '4',
                                bg: 'gray.800/50',
                                rounded: 'lg',
                                border: '1px solid',
                                borderColor: 'gray.700/50',
                              })}
                            >
                              <div className={css({ flex: '1' })}>
                                <div
                                  className={css({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3',
                                    mb: '1',
                                  })}
                                >
                                  <span className={css({ color: 'white', fontWeight: '500' })}>
                                    {entry.date}
                                  </span>
                                  <Badge variant="outline" className={css({ color: 'green.400' })}>
                                    {formatMinutesToHours(worked)}
                                  </Badge>
                                  <Badge variant="outline" className={css({ color: 'blue.400' })}>
                                    {formatCurrency(earnings)}
                                  </Badge>
                                </div>
                                <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
                                  {entry.startTime} - {entry.endTime} ({entry.breakMinutes}min
                                  break)
                                </p>
                                {entry.description && (
                                  <p
                                    className={css({ color: 'gray.500', fontSize: 'sm', mt: '1' })}
                                  >
                                    {entry.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveEntry(entry.id)}
                                className={css({ color: 'red.400', _hover: { bg: 'red.900/30' } })}
                              >
                                <X className={css({ w: '4', h: '4' })} />
                              </Button>
                            </div>
                          )
                        })
                    )}
                  </div>
                )}

                {mode === 'weekly' && (
                  <div className={css({ spaceY: '4' })}>
                    {Object.keys(stats.entriesByWeek).length === 0 ? (
                      <p className={css({ color: 'gray.500', textAlign: 'center', py: '8' })}>
                        No weekly data yet. Add time entries to see weekly summaries.
                      </p>
                    ) : (
                      Object.entries(stats.entriesByWeek)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([week, minutes]) => {
                          const overtime = Math.max(0, minutes - 40 * 60)
                          const earnings = (minutes / 60) * activeTimesheet.defaultHourlyRate
                          return (
                            <div
                              key={week}
                              className={css({
                                p: '4',
                                bg: 'gray.800/50',
                                rounded: 'lg',
                                border: '1px solid',
                                borderColor: 'gray.700/50',
                              })}
                            >
                              <div
                                className={css({
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  mb: '2',
                                })}
                              >
                                <span className={css({ color: 'white', fontWeight: '500' })}>
                                  Week {week}
                                </span>
                                <span className={css({ color: 'green.400', fontWeight: '500' })}>
                                  {formatMinutesToHours(minutes)}
                                </span>
                              </div>
                              <div className={css({ display: 'flex', gap: '4', fontSize: 'sm' })}>
                                <span className={css({ color: 'gray.400' })}>
                                  Earnings: {formatCurrency(earnings)}
                                </span>
                                {overtime > 0 && (
                                  <span className={css({ color: 'amber.400' })}>
                                    Overtime: {formatMinutesToHours(overtime)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })
                    )}
                  </div>
                )}

                {mode === 'monthly' && (
                  <div className={css({ spaceY: '4' })}>
                    {Object.keys(stats.entriesByMonth).length === 0 ? (
                      <p className={css({ color: 'gray.500', textAlign: 'center', py: '8' })}>
                        No monthly data yet. Add time entries to see monthly reports.
                      </p>
                    ) : (
                      Object.entries(stats.entriesByMonth)
                        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                        .map(([month, minutes]) => {
                          const earnings = (minutes / 60) * activeTimesheet.defaultHourlyRate
                          // Estimate working days (assuming 22 workdays/month)
                          const avgDaily = minutes / 22
                          return (
                            <div
                              key={month}
                              className={css({
                                p: '4',
                                bg: 'gray.800/50',
                                rounded: 'lg',
                                border: '1px solid',
                                borderColor: 'gray.700/50',
                              })}
                            >
                              <div
                                className={css({
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  mb: '2',
                                })}
                              >
                                <span className={css({ color: 'white', fontWeight: '500' })}>
                                  {month}
                                </span>
                                <span className={css({ color: 'green.400', fontWeight: '500' })}>
                                  {formatMinutesToHours(minutes)}
                                </span>
                              </div>
                              <div
                                className={css({
                                  display: 'flex',
                                  gap: '4',
                                  fontSize: 'sm',
                                  flexWrap: 'wrap',
                                })}
                              >
                                <span className={css({ color: 'blue.400' })}>
                                  Earnings: {formatCurrency(earnings)}
                                </span>
                                <span className={css({ color: 'gray.400' })}>
                                  Daily Avg: {formatMinutesToHours(Math.round(avgDaily))}
                                </span>
                              </div>
                            </div>
                          )
                        })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!activeTimesheet && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardContent className={css({ py: '12', textAlign: 'center' })}>
                <FileText
                  className={css({ w: '12', h: '12', color: 'gray.600', mx: 'auto', mb: '4' })}
                />
                <h3 className={css({ color: 'white', fontSize: 'lg', fontWeight: '500', mb: '2' })}>
                  No Timesheet Selected
                </h3>
                <p className={css({ color: 'gray.500', mb: '4' })}>
                  Create a new timesheet to start tracking your work hours.
                </p>
                <Button
                  onClick={() => setShowNewTimesheetModal(true)}
                  className={css({ bg: 'green.600', _hover: { bg: 'green.700' } })}
                >
                  <Plus className={css({ w: '4', h: '4', mr: '2' })} />
                  Create Timesheet
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Timesheet Modal */}
      {showNewTimesheetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="timesheet-modal-title"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowNewTimesheetModal(false)
          }}
          className={css({
            position: 'fixed',
            inset: '0',
            bg: 'black/60',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '50',
            p: '4',
          })}
          onClick={() => setShowNewTimesheetModal(false)}
        >
          <Card
            className={css({
              w: 'full',
              maxW: 'md',
              border: '1px solid',
              borderColor: 'green.500/30',
              bg: 'gray.900',
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle id="timesheet-modal-title" className={css({ color: 'white' })}>
                Create New Timesheet
              </CardTitle>
              <CardDescription>Set up a new timesheet for tracking hours</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div>
                <label
                  htmlFor="timesheet-name"
                  className={css({ color: 'gray.400', fontSize: 'sm', mb: '1', display: 'block' })}
                >
                  Timesheet Name
                </label>
                <Input
                  id="timesheet-name"
                  placeholder="e.g., Client Project, Freelance Work"
                  value={newTimesheetName}
                  onChange={(e) => setNewTimesheetName(e.target.value)}
                  className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                />
              </div>
              <div>
                <label
                  htmlFor="timesheet-rate"
                  className={css({ color: 'gray.400', fontSize: 'sm', mb: '1', display: 'block' })}
                >
                  Default Hourly Rate ($)
                </label>
                <Input
                  id="timesheet-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25.00"
                  value={newTimesheetRate}
                  onChange={(e) => setNewTimesheetRate(e.target.value)}
                  className={css({ bg: 'gray.800', borderColor: 'gray.700', color: 'white' })}
                />
              </div>
              <div className={css({ display: 'flex', gap: '3', pt: '2' })}>
                <Button
                  variant="outline"
                  onClick={() => setShowNewTimesheetModal(false)}
                  className={css({ flex: '1' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTimesheet}
                  className={css({ flex: '1', bg: 'green.600', _hover: { bg: 'green.700' } })}
                >
                  <Check className={css({ w: '4', h: '4', mr: '2' })} />
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQs */}
      <FAQAccordion faqs={faqs} />

      {/* Tool Rating */}
      <ToolRating toolId="work-hours-calculator" toolName="Work Hours Calculator" />

      {/* Social Share */}
      <SocialShare
        toolName="Work Hours Calculator"
        toolUrl="https://supertool.dev/tools/productivity/work-hours"
        description="Track work hours, calculate overtime, and manage timesheets. Perfect for freelancers and contractors."
      />

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/productivity/work-hours" category="productivity" />
    </main>
  )
}
