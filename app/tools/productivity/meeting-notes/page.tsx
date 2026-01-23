'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  FileText,
  ListTodo,
  Mic,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Users,
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
type MeetingType = 'standup' | 'one-on-one' | 'team' | 'client' | 'brainstorm' | 'retrospective'

interface Attendee {
  id: string
  name: string
  email?: string
  role?: string
}

interface AgendaItem {
  id: string
  topic: string
  duration?: number
  notes?: string
  completed: boolean
}

interface ActionItem {
  id: string
  task: string
  assignee: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

interface Decision {
  id: string
  description: string
  madeBy?: string
  timestamp: number
}

interface MeetingNotes {
  id: string
  title: string
  type: MeetingType
  date: string
  startTime?: string
  endTime?: string
  duration?: number
  attendees: Attendee[]
  agenda: AgendaItem[]
  discussionPoints: string[]
  actionItems: ActionItem[]
  decisions: Decision[]
  generalNotes: string
  createdAt: number
  updatedAt: number
}

// Meeting templates
const MEETING_TEMPLATES: Record<MeetingType, Partial<MeetingNotes>> = {
  standup: {
    title: 'Daily Standup',
    agenda: [
      { id: '1', topic: 'What did you accomplish yesterday?', completed: false },
      { id: '2', topic: 'What will you work on today?', completed: false },
      { id: '3', topic: 'Any blockers or challenges?', completed: false },
    ],
    discussionPoints: [],
    generalNotes: '',
  },
  'one-on-one': {
    title: '1:1 Meeting',
    agenda: [
      { id: '1', topic: 'Check-in and updates', completed: false },
      { id: '2', topic: 'Progress on goals', completed: false },
      { id: '3', topic: 'Challenges and support needed', completed: false },
      { id: '4', topic: 'Career development', completed: false },
      { id: '5', topic: 'Feedback', completed: false },
    ],
    discussionPoints: [],
    generalNotes: '',
  },
  team: {
    title: 'Team Meeting',
    agenda: [
      { id: '1', topic: 'Team updates and announcements', completed: false },
      { id: '2', topic: 'Project status review', completed: false },
      { id: '3', topic: 'Discussion items', completed: false },
      { id: '4', topic: 'Action items review', completed: false },
      { id: '5', topic: 'Q&A', completed: false },
    ],
    discussionPoints: [],
    generalNotes: '',
  },
  client: {
    title: 'Client Meeting',
    agenda: [
      { id: '1', topic: 'Introduction and objectives', completed: false },
      { id: '2', topic: 'Project updates', completed: false },
      { id: '3', topic: 'Deliverables review', completed: false },
      { id: '4', topic: 'Timeline and milestones', completed: false },
      { id: '5', topic: 'Next steps and action items', completed: false },
    ],
    discussionPoints: [],
    generalNotes: '',
  },
  brainstorm: {
    title: 'Brainstorming Session',
    agenda: [
      { id: '1', topic: 'Problem statement / goal', completed: false },
      { id: '2', topic: 'Idea generation (no judgment)', completed: false },
      { id: '3', topic: 'Idea grouping and discussion', completed: false },
      { id: '4', topic: 'Prioritization and voting', completed: false },
      { id: '5', topic: 'Action items', completed: false },
    ],
    discussionPoints: [],
    generalNotes: '',
  },
  retrospective: {
    title: 'Sprint Retrospective',
    agenda: [
      { id: '1', topic: 'What went well?', completed: false },
      { id: '2', topic: 'What could be improved?', completed: false },
      { id: '3', topic: 'What will we commit to improve?', completed: false },
      { id: '4', topic: 'Action items', completed: false },
    ],
    discussionPoints: [],
    generalNotes: '',
  },
}

// Operations for template selection
const MEETING_OPERATIONS: ToolOperation[] = [
  {
    id: 'standup',
    label: 'Daily Standup',
    icon: RefreshCw,
    color: TOOL_COLORS.success,
    description: 'Quick daily sync meeting',
  },
  {
    id: 'one-on-one',
    label: '1:1 Meeting',
    icon: Users,
    color: TOOL_COLORS.info,
    description: 'Personal check-in meeting',
  },
  {
    id: 'team',
    label: 'Team Meeting',
    icon: UserPlus,
    color: TOOL_COLORS.primary,
    description: 'Team sync and updates',
  },
  {
    id: 'client',
    label: 'Client Call',
    icon: Mic,
    color: TOOL_COLORS.warning,
    description: 'External client meeting',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm',
    icon: Sparkles,
    color: TOOL_COLORS.purple,
    description: 'Creative ideation session',
  },
  {
    id: 'retrospective',
    label: 'Retrospective',
    icon: ListTodo,
    color: TOOL_COLORS.teal,
    description: 'Sprint/project review',
  },
]

const STORAGE_KEY = 'meeting-notes-data'

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11)

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5)
}

export default function MeetingNotesPage() {
  // State
  const [meetingType, setMeetingType] = useState<MeetingType>('team')
  const [currentMeeting, setCurrentMeeting] = useState<MeetingNotes | null>(null)
  const [savedMeetings, setSavedMeetings] = useState<MeetingNotes[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showSavedMeetings, setShowSavedMeetings] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved meetings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSavedMeetings(JSON.parse(saved))
      } catch {
        console.error('Failed to load saved meetings')
      }
    }
    trackToolEvent('meeting_notes_open', { timestamp: Date.now() })
  }, [])

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning])

  // Create new meeting from template
  const createNewMeeting = useCallback((type: MeetingType) => {
    const template = MEETING_TEMPLATES[type]
    const now = new Date()
    const newMeeting: MeetingNotes = {
      id: generateId(),
      title: template.title || 'New Meeting',
      type,
      date: formatDate(now),
      startTime: formatTime(now),
      attendees: [],
      agenda: template.agenda?.map((item) => ({ ...item, id: generateId() })) || [],
      discussionPoints: template.discussionPoints || [],
      actionItems: [],
      decisions: [],
      generalNotes: template.generalNotes || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setCurrentMeeting(newMeeting)
    setElapsedTime(0)
    setIsTimerRunning(false)
    trackToolEvent('meeting_notes_generate', { template: type })
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (opId: string) => {
      setMeetingType(opId as MeetingType)
      createNewMeeting(opId as MeetingType)
      trackToolEvent('meeting_notes_template_select', { template: opId })
    },
    [createNewMeeting]
  )

  // Save meeting
  const saveMeeting = useCallback(() => {
    if (!currentMeeting) return
    const updatedMeeting = {
      ...currentMeeting,
      duration: elapsedTime,
      endTime: formatTime(new Date()),
      updatedAt: Date.now(),
    }
    const existingIndex = savedMeetings.findIndex((m) => m.id === currentMeeting.id)
    let newSavedMeetings: MeetingNotes[]
    if (existingIndex >= 0) {
      newSavedMeetings = [...savedMeetings]
      newSavedMeetings[existingIndex] = updatedMeeting
    } else {
      newSavedMeetings = [updatedMeeting, ...savedMeetings]
    }
    setSavedMeetings(newSavedMeetings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedMeetings))
    setCurrentMeeting(updatedMeeting)
    toast.success('Meeting notes saved!')
    trackToolEvent('meeting_notes_save', { meetingId: currentMeeting.id })
  }, [currentMeeting, savedMeetings, elapsedTime])

  // Load meeting
  const loadMeeting = useCallback((meeting: MeetingNotes) => {
    setCurrentMeeting(meeting)
    setMeetingType(meeting.type)
    setElapsedTime(meeting.duration || 0)
    setShowSavedMeetings(false)
    trackToolEvent('meeting_notes_load', { meetingId: meeting.id })
  }, [])

  // Delete meeting
  const deleteMeeting = useCallback(
    (meetingId: string) => {
      const newSavedMeetings = savedMeetings.filter((m) => m.id !== meetingId)
      setSavedMeetings(newSavedMeetings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedMeetings))
      if (currentMeeting?.id === meetingId) {
        setCurrentMeeting(null)
      }
      toast.success('Meeting deleted')
      trackToolEvent('meeting_notes_delete', { meetingId })
    },
    [savedMeetings, currentMeeting]
  )

  // Export functions
  const exportAsMarkdown = useCallback(() => {
    if (!currentMeeting) return
    let md = `# ${currentMeeting.title}\n\n`
    md += `**Date:** ${currentMeeting.date}\n`
    md += `**Time:** ${currentMeeting.startTime || 'N/A'} - ${currentMeeting.endTime || 'N/A'}\n`
    if (currentMeeting.duration) {
      md += `**Duration:** ${formatDuration(currentMeeting.duration)}\n`
    }
    md += `**Type:** ${currentMeeting.type}\n\n`

    if (currentMeeting.attendees.length > 0) {
      md += `## Attendees\n`
      currentMeeting.attendees.forEach((a) => {
        md += `- ${a.name}${a.role ? ` (${a.role})` : ''}\n`
      })
      md += '\n'
    }

    if (currentMeeting.agenda.length > 0) {
      md += `## Agenda\n`
      currentMeeting.agenda.forEach((item) => {
        md += `- [${item.completed ? 'x' : ' '}] ${item.topic}\n`
        if (item.notes) md += `  - Notes: ${item.notes}\n`
      })
      md += '\n'
    }

    if (currentMeeting.discussionPoints.length > 0) {
      md += `## Discussion Points\n`
      currentMeeting.discussionPoints.forEach((point) => {
        md += `- ${point}\n`
      })
      md += '\n'
    }

    if (currentMeeting.actionItems.length > 0) {
      md += `## Action Items\n`
      currentMeeting.actionItems.forEach((item) => {
        md += `- [${item.completed ? 'x' : ' '}] ${item.task}`
        if (item.assignee) md += ` (@${item.assignee})`
        if (item.dueDate) md += ` - Due: ${item.dueDate}`
        md += ` [${item.priority}]\n`
      })
      md += '\n'
    }

    if (currentMeeting.decisions.length > 0) {
      md += `## Decisions\n`
      currentMeeting.decisions.forEach((d) => {
        md += `- ${d.description}`
        if (d.madeBy) md += ` (by ${d.madeBy})`
        md += '\n'
      })
      md += '\n'
    }

    if (currentMeeting.generalNotes) {
      md += `## Notes\n${currentMeeting.generalNotes}\n`
    }

    return md
  }, [currentMeeting])

  const copyToClipboard = useCallback(() => {
    const md = exportAsMarkdown()
    if (md) {
      navigator.clipboard.writeText(md)
      toast.success('Copied to clipboard!')
      trackToolEvent('meeting_notes_copy', { format: 'markdown' })
    }
  }, [exportAsMarkdown])

  const downloadMarkdown = useCallback(() => {
    const md = exportAsMarkdown()
    if (md && currentMeeting) {
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentMeeting.title.replace(/\s+/g, '-').toLowerCase()}-${currentMeeting.date}.md`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
      trackToolEvent('meeting_notes_export', { format: 'markdown' })
    }
  }, [exportAsMarkdown, currentMeeting])

  // Update meeting field
  const updateMeeting = useCallback(
    <K extends keyof MeetingNotes>(field: K, value: MeetingNotes[K]) => {
      if (currentMeeting) {
        setCurrentMeeting({ ...currentMeeting, [field]: value, updatedAt: Date.now() })
      }
    },
    [currentMeeting]
  )

  // Attendee management
  const addAttendee = useCallback(() => {
    if (currentMeeting) {
      const newAttendee: Attendee = { id: generateId(), name: '' }
      updateMeeting('attendees', [...currentMeeting.attendees, newAttendee])
    }
  }, [currentMeeting, updateMeeting])

  const updateAttendee = useCallback(
    (id: string, field: keyof Attendee, value: string) => {
      if (currentMeeting) {
        const updated = currentMeeting.attendees.map((a) =>
          a.id === id ? { ...a, [field]: value } : a
        )
        updateMeeting('attendees', updated)
      }
    },
    [currentMeeting, updateMeeting]
  )

  const removeAttendee = useCallback(
    (id: string) => {
      if (currentMeeting) {
        updateMeeting(
          'attendees',
          currentMeeting.attendees.filter((a) => a.id !== id)
        )
      }
    },
    [currentMeeting, updateMeeting]
  )

  // Agenda management
  const addAgendaItem = useCallback(() => {
    if (currentMeeting) {
      const newItem: AgendaItem = { id: generateId(), topic: '', completed: false }
      updateMeeting('agenda', [...currentMeeting.agenda, newItem])
    }
  }, [currentMeeting, updateMeeting])

  const updateAgendaItem = useCallback(
    (id: string, field: keyof AgendaItem, value: string | boolean | number) => {
      if (currentMeeting) {
        const updated = currentMeeting.agenda.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
        updateMeeting('agenda', updated)
      }
    },
    [currentMeeting, updateMeeting]
  )

  const removeAgendaItem = useCallback(
    (id: string) => {
      if (currentMeeting) {
        updateMeeting(
          'agenda',
          currentMeeting.agenda.filter((item) => item.id !== id)
        )
      }
    },
    [currentMeeting, updateMeeting]
  )

  // Discussion points management
  const addDiscussionPoint = useCallback(() => {
    if (currentMeeting) {
      updateMeeting('discussionPoints', [...currentMeeting.discussionPoints, ''])
    }
  }, [currentMeeting, updateMeeting])

  const updateDiscussionPoint = useCallback(
    (index: number, value: string) => {
      if (currentMeeting) {
        const updated = [...currentMeeting.discussionPoints]
        updated[index] = value
        updateMeeting('discussionPoints', updated)
      }
    },
    [currentMeeting, updateMeeting]
  )

  const removeDiscussionPoint = useCallback(
    (index: number) => {
      if (currentMeeting) {
        updateMeeting(
          'discussionPoints',
          currentMeeting.discussionPoints.filter((_, i) => i !== index)
        )
      }
    },
    [currentMeeting, updateMeeting]
  )

  // Action items management
  const addActionItem = useCallback(() => {
    if (currentMeeting) {
      const newItem: ActionItem = {
        id: generateId(),
        task: '',
        assignee: '',
        priority: 'medium',
        completed: false,
      }
      updateMeeting('actionItems', [...currentMeeting.actionItems, newItem])
    }
  }, [currentMeeting, updateMeeting])

  const updateActionItem = useCallback(
    (id: string, field: keyof ActionItem, value: string | boolean) => {
      if (currentMeeting) {
        const updated = currentMeeting.actionItems.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
        updateMeeting('actionItems', updated)
      }
    },
    [currentMeeting, updateMeeting]
  )

  const removeActionItem = useCallback(
    (id: string) => {
      if (currentMeeting) {
        updateMeeting(
          'actionItems',
          currentMeeting.actionItems.filter((item) => item.id !== id)
        )
      }
    },
    [currentMeeting, updateMeeting]
  )

  // Decisions management
  const addDecision = useCallback(() => {
    if (currentMeeting) {
      const newDecision: Decision = {
        id: generateId(),
        description: '',
        timestamp: Date.now(),
      }
      updateMeeting('decisions', [...currentMeeting.decisions, newDecision])
    }
  }, [currentMeeting, updateMeeting])

  const updateDecision = useCallback(
    (id: string, field: keyof Decision, value: string) => {
      if (currentMeeting) {
        const updated = currentMeeting.decisions.map((d) =>
          d.id === id ? { ...d, [field]: value } : d
        )
        updateMeeting('decisions', updated)
      }
    },
    [currentMeeting, updateMeeting]
  )

  const removeDecision = useCallback(
    (id: string) => {
      if (currentMeeting) {
        updateMeeting(
          'decisions',
          currentMeeting.decisions.filter((d) => d.id !== id)
        )
      }
    },
    [currentMeeting, updateMeeting]
  )

  // Selected operation for display
  const selectedOperation = useMemo(
    () => MEETING_OPERATIONS.find((op) => op.id === meetingType) || MEETING_OPERATIONS[0],
    [meetingType]
  )

  // FAQs
  const faqs = [
    {
      question: 'How do I save my meeting notes?',
      answer:
        'Click the "Save" button in the toolbar to save your meeting notes to your browser\'s local storage. Your notes will persist even after closing the browser.',
    },
    {
      question: 'Can I export my meeting notes?',
      answer:
        'Yes! You can export your notes as Markdown format by clicking the download button, or copy them to your clipboard for easy pasting into other applications.',
    },
    {
      question: 'What meeting templates are available?',
      answer:
        'We offer 6 meeting templates: Daily Standup, 1:1 Meeting, Team Meeting, Client Call, Brainstorm Session, and Sprint Retrospective. Each comes with pre-configured agenda items.',
    },
    {
      question: 'How does the meeting timer work?',
      answer:
        'The timer tracks your meeting duration. Click Play to start, Pause to stop. The duration is automatically saved with your meeting notes.',
    },
    {
      question: 'Can I track action items and assignees?',
      answer:
        'Yes! Each action item can have an assignee, due date, and priority level (low, medium, high). You can mark items as completed as they are done.',
    },
    {
      question: 'Are my meeting notes private?',
      answer:
        'All meeting notes are stored locally in your browser. We do not send any data to external servers. Your notes remain completely private on your device.',
    },
  ]

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
        className={css({ spaceY: '4', textAlign: 'center' })}
      >
        <div
          className={css({ display: 'flex', justifyContent: 'center', gap: '2', flexWrap: 'wrap' })}
        >
          <Badge
            variant="outline"
            className={css({ borderColor: 'green.500/30', color: 'green.400' })}
          >
            <FileText className={css({ w: '3', h: '3', mr: '1' })} />
            Productivity
          </Badge>
          <Badge
            variant="outline"
            className={css({ borderColor: 'blue.500/30', color: 'blue.400' })}
          >
            Free
          </Badge>
        </div>
        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            color: 'white',
          })}
        >
          Meeting Notes Generator
        </h1>
        <p
          className={css({
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
            fontSize: { base: 'sm', sm: 'base' },
          })}
        >
          Capture meeting notes efficiently with structured templates. Track attendees, agenda
          items, action items, and decisions. Export as Markdown or copy to clipboard.
        </p>
      </motion.div>

      {/* Template Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'green.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ color: 'white' })}>Select Meeting Template</CardTitle>
            <CardDescription>
              Choose a template to start with pre-configured sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Grid */}
            <div className={css({ display: { base: 'none', md: 'block' } })}>
              <ToolOperationGrid
                operations={MEETING_OPERATIONS}
                selectedOperation={meetingType}
                onOperationChange={handleTemplateSelect}
                columns={{ base: 1, sm: 2, lg: 3 }}
                analyticsCategory="meeting_notes"
              />
            </div>
            {/* Mobile Picker */}
            <div className={css({ display: { base: 'block', md: 'none' } })}>
              <ToolMobilePicker
                label={selectedOperation.label}
                title="Select Template"
                description="Choose a meeting template"
                color={TOOL_COLORS.success}
              >
                <ToolOperationGrid
                  operations={MEETING_OPERATIONS}
                  selectedOperation={meetingType}
                  onOperationChange={handleTemplateSelect}
                  columns={{ base: 1, sm: 2 }}
                  analyticsCategory="meeting_notes"
                />
              </ToolMobilePicker>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Editor */}
      {currentMeeting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={css({ spaceY: '6' })}
        >
          {/* Toolbar */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent className={css({ p: '4' })}>
              <div
                className={css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '3',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                {/* Timer */}
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Clock className={css({ w: '5', h: '5', color: 'green.400' })} />
                  <span className={css({ fontSize: 'xl', fontFamily: 'mono', color: 'white' })}>
                    {formatDuration(elapsedTime)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={css({ borderColor: 'green.500/30' })}
                  >
                    {isTimerRunning ? (
                      <Pause className={css({ w: '4', h: '4' })} />
                    ) : (
                      <Play className={css({ w: '4', h: '4' })} />
                    )}
                  </Button>
                </div>

                {/* Actions */}
                <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSavedMeetings(!showSavedMeetings)}
                    className={css({ borderColor: 'gray.600' })}
                  >
                    <Upload className={css({ w: '4', h: '4', mr: '1' })} />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveMeeting}
                    className={css({ borderColor: 'green.500/30', color: 'green.400' })}
                  >
                    <Save className={css({ w: '4', h: '4', mr: '1' })} />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className={css({ borderColor: 'blue.500/30', color: 'blue.400' })}
                  >
                    <Copy className={css({ w: '4', h: '4', mr: '1' })} />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadMarkdown}
                    className={css({ borderColor: 'purple.500/30', color: 'purple.400' })}
                  >
                    <Download className={css({ w: '4', h: '4', mr: '1' })} />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Meetings Panel */}
          {showSavedMeetings && savedMeetings.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ color: 'white', fontSize: 'lg' })}>
                  Saved Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={css({ spaceY: '2' })}>
                  {savedMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: '3',
                        bg: 'gray.800/50',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    >
                      <div>
                        <p className={css({ color: 'white', fontWeight: 'medium' })}>
                          {meeting.title}
                        </p>
                        <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
                          {meeting.date} - {meeting.type}
                        </p>
                      </div>
                      <div className={css({ display: 'flex', gap: '2' })}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => loadMeeting(meeting)}
                          className={css({ color: 'green.400' })}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMeeting(meeting.id)}
                          className={css({ color: 'red.400' })}
                        >
                          <Trash2 className={css({ w: '4', h: '4' })} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meeting Details */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ color: 'white' })}>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                  gap: '4',
                })}
              >
                <div>
                  <label
                    htmlFor="meeting-title"
                    className={css({
                      color: 'gray.400',
                      fontSize: 'sm',
                      mb: '1',
                      display: 'block',
                    })}
                  >
                    Meeting Title
                  </label>
                  <Input
                    id="meeting-title"
                    value={currentMeeting.title}
                    onChange={(e) => updateMeeting('title', e.target.value)}
                    className={css({ bg: 'gray.800', borderColor: 'gray.700' })}
                  />
                </div>
                <div>
                  <label
                    htmlFor="meeting-date"
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
                    id="meeting-date"
                    type="date"
                    value={currentMeeting.date}
                    onChange={(e) => updateMeeting('date', e.target.value)}
                    className={css({ bg: 'gray.800', borderColor: 'gray.700' })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/20',
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
                <CardTitle
                  className={css({
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Users className={css({ w: '5', h: '5', color: 'blue.400' })} />
                  Attendees
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addAttendee}>
                  <Plus className={css({ w: '4', h: '4', mr: '1' })} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentMeeting.attendees.length === 0 ? (
                <p className={css({ color: 'gray.500', textAlign: 'center', py: '4' })}>
                  No attendees added yet. Click "Add" to add attendees.
                </p>
              ) : (
                <div className={css({ spaceY: '2' })}>
                  {currentMeeting.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className={css({
                        display: 'flex',
                        gap: '2',
                        alignItems: 'center',
                      })}
                    >
                      <Input
                        placeholder="Name"
                        value={attendee.name}
                        onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                        className={css({ bg: 'gray.800', borderColor: 'gray.700', flex: '1' })}
                      />
                      <Input
                        placeholder="Role (optional)"
                        value={attendee.role || ''}
                        onChange={(e) => updateAttendee(attendee.id, 'role', e.target.value)}
                        className={css({ bg: 'gray.800', borderColor: 'gray.700', flex: '1' })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttendee(attendee.id)}
                        className={css({ color: 'red.400' })}
                      >
                        <X className={css({ w: '4', h: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
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
                <CardTitle
                  className={css({
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <ListTodo className={css({ w: '5', h: '5', color: 'purple.400' })} />
                  Agenda
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addAgendaItem}>
                  <Plus className={css({ w: '4', h: '4', mr: '1' })} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentMeeting.agenda.length === 0 ? (
                <p className={css({ color: 'gray.500', textAlign: 'center', py: '4' })}>
                  No agenda items. Click "Add" to add items.
                </p>
              ) : (
                <div className={css({ spaceY: '2' })}>
                  {currentMeeting.agenda.map((item) => (
                    <div
                      key={item.id}
                      className={css({
                        display: 'flex',
                        gap: '2',
                        alignItems: 'center',
                      })}
                    >
                      <button
                        type="button"
                        onClick={() => updateAgendaItem(item.id, 'completed', !item.completed)}
                        className={css({
                          w: '6',
                          h: '6',
                          rounded: 'md',
                          border: '2px solid',
                          borderColor: item.completed ? 'green.500' : 'gray.600',
                          bg: item.completed ? 'green.500' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        })}
                      >
                        {item.completed && (
                          <Check className={css({ w: '4', h: '4', color: 'white' })} />
                        )}
                      </button>
                      <Input
                        placeholder="Agenda topic"
                        value={item.topic}
                        onChange={(e) => updateAgendaItem(item.id, 'topic', e.target.value)}
                        className={css({
                          bg: 'gray.800',
                          borderColor: 'gray.700',
                          flex: '1',
                          textDecoration: item.completed ? 'line-through' : 'none',
                          opacity: item.completed ? 0.6 : 1,
                        })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAgendaItem(item.id)}
                        className={css({ color: 'red.400' })}
                      >
                        <X className={css({ w: '4', h: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discussion Points */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'teal.500/20',
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
                <CardTitle
                  className={css({
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Sparkles className={css({ w: '5', h: '5', color: 'teal.400' })} />
                  Discussion Points
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addDiscussionPoint}>
                  <Plus className={css({ w: '4', h: '4', mr: '1' })} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentMeeting.discussionPoints.length === 0 ? (
                <p className={css({ color: 'gray.500', textAlign: 'center', py: '4' })}>
                  No discussion points yet.
                </p>
              ) : (
                <div className={css({ spaceY: '2' })}>
                  {currentMeeting.discussionPoints.map((point, index) => (
                    <div
                      key={`discussion-${index}-${point.slice(0, 10)}`}
                      className={css({
                        display: 'flex',
                        gap: '2',
                        alignItems: 'center',
                      })}
                    >
                      <Input
                        placeholder="Discussion point"
                        value={point}
                        onChange={(e) => updateDiscussionPoint(index, e.target.value)}
                        className={css({ bg: 'gray.800', borderColor: 'gray.700', flex: '1' })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeDiscussionPoint(index)}
                        className={css({ color: 'red.400' })}
                      >
                        <X className={css({ w: '4', h: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/20',
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
                <CardTitle
                  className={css({
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Check className={css({ w: '5', h: '5', color: 'orange.400' })} />
                  Action Items
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addActionItem}>
                  <Plus className={css({ w: '4', h: '4', mr: '1' })} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentMeeting.actionItems.length === 0 ? (
                <p className={css({ color: 'gray.500', textAlign: 'center', py: '4' })}>
                  No action items yet.
                </p>
              ) : (
                <div className={css({ spaceY: '3' })}>
                  {currentMeeting.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className={css({
                        p: '3',
                        bg: 'gray.800/50',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          gap: '2',
                          alignItems: 'center',
                          mb: '2',
                        })}
                      >
                        <button
                          type="button"
                          onClick={() => updateActionItem(item.id, 'completed', !item.completed)}
                          className={css({
                            w: '6',
                            h: '6',
                            rounded: 'md',
                            border: '2px solid',
                            borderColor: item.completed ? 'green.500' : 'gray.600',
                            bg: item.completed ? 'green.500' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          })}
                        >
                          {item.completed && (
                            <Check className={css({ w: '4', h: '4', color: 'white' })} />
                          )}
                        </button>
                        <Input
                          placeholder="Task description"
                          value={item.task}
                          onChange={(e) => updateActionItem(item.id, 'task', e.target.value)}
                          className={css({
                            bg: 'gray.800',
                            borderColor: 'gray.700',
                            flex: '1',
                            textDecoration: item.completed ? 'line-through' : 'none',
                            opacity: item.completed ? 0.6 : 1,
                          })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeActionItem(item.id)}
                          className={css({ color: 'red.400' })}
                        >
                          <X className={css({ w: '4', h: '4' })} />
                        </Button>
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                          gap: '2',
                          ml: '8',
                        })}
                      >
                        <Input
                          placeholder="Assignee"
                          value={item.assignee}
                          onChange={(e) => updateActionItem(item.id, 'assignee', e.target.value)}
                          className={css({
                            bg: 'gray.800',
                            borderColor: 'gray.700',
                            fontSize: 'sm',
                          })}
                        />
                        <Input
                          type="date"
                          value={item.dueDate || ''}
                          onChange={(e) => updateActionItem(item.id, 'dueDate', e.target.value)}
                          className={css({
                            bg: 'gray.800',
                            borderColor: 'gray.700',
                            fontSize: 'sm',
                          })}
                        />
                        <select
                          value={item.priority}
                          onChange={(e) => updateActionItem(item.id, 'priority', e.target.value)}
                          className={css({
                            bg: 'gray.800',
                            borderColor: 'gray.700',
                            color: 'white',
                            rounded: 'md',
                            px: '3',
                            py: '2',
                            fontSize: 'sm',
                          })}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decisions */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'yellow.500/20',
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
                <CardTitle
                  className={css({
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Calendar className={css({ w: '5', h: '5', color: 'yellow.400' })} />
                  Decisions Made
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addDecision}>
                  <Plus className={css({ w: '4', h: '4', mr: '1' })} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentMeeting.decisions.length === 0 ? (
                <p className={css({ color: 'gray.500', textAlign: 'center', py: '4' })}>
                  No decisions recorded yet.
                </p>
              ) : (
                <div className={css({ spaceY: '2' })}>
                  {currentMeeting.decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className={css({
                        display: 'flex',
                        gap: '2',
                        alignItems: 'center',
                      })}
                    >
                      <Input
                        placeholder="Decision description"
                        value={decision.description}
                        onChange={(e) => updateDecision(decision.id, 'description', e.target.value)}
                        className={css({ bg: 'gray.800', borderColor: 'gray.700', flex: '1' })}
                      />
                      <Input
                        placeholder="Made by"
                        value={decision.madeBy || ''}
                        onChange={(e) => updateDecision(decision.id, 'madeBy', e.target.value)}
                        className={css({ bg: 'gray.800', borderColor: 'gray.700', w: '32' })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeDecision(decision.id)}
                        className={css({ color: 'red.400' })}
                      >
                        <X className={css({ w: '4', h: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Notes */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({ color: 'white', display: 'flex', alignItems: 'center', gap: '2' })}
              >
                <FileText className={css({ w: '5', h: '5', color: 'gray.400' })} />
                General Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={currentMeeting.generalNotes}
                onChange={(e) => updateMeeting('generalNotes', e.target.value)}
                placeholder="Add any additional notes here..."
                className={css({
                  w: 'full',
                  minH: '32',
                  p: '3',
                  bg: 'gray.800',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  rounded: 'lg',
                  color: 'white',
                  resize: 'vertical',
                  _placeholder: { color: 'gray.500' },
                  _focus: { outline: 'none', borderColor: 'green.500/50' },
                })}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No meeting selected */}
      {!currentMeeting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent className={css({ py: '12', textAlign: 'center' })}>
              <FileText
                className={css({ w: '12', h: '12', color: 'gray.600', mx: 'auto', mb: '4' })}
              />
              <h3
                className={css({ color: 'white', fontSize: 'lg', fontWeight: 'medium', mb: '2' })}
              >
                Select a Template to Start
              </h3>
              <p className={css({ color: 'gray.400' })}>
                Choose a meeting template above to begin taking notes
              </p>
              {savedMeetings.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowSavedMeetings(true)}
                  className={css({ mt: '4' })}
                >
                  <Upload className={css({ w: '4', h: '4', mr: '2' })} />
                  Load Saved Meeting ({savedMeetings.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.700',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ color: 'white' })}>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <FAQAccordion faqs={faqs} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Tool Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ToolRating toolId="meeting-notes" toolName="Meeting Notes Generator" />
      </motion.div>

      {/* Social Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SocialShare
          toolName="Meeting Notes Generator"
          toolUrl="https://supertool.dev/tools/productivity/meeting-notes"
          description="Capture meeting notes efficiently with structured templates. Track attendees, agenda items, action items, and decisions."
        />
      </motion.div>

      {/* Related Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <RelatedTools currentToolPath="/tools/productivity/meeting-notes" category="productivity" />
      </motion.div>
    </main>
  )
}
