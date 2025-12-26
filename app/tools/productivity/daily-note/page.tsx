'use client'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  LayoutTemplate,
  Plus,
  Save,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface Note {
  id: string
  date: string
  content: string
  template: string
  timestamp: string
}

interface Template {
  id: string
  name: string
  content: string
  category: string
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'daily-log',
    name: 'Daily Log',
    category: 'Productivity',
    content: `# Daily Log - {{date}}

## Today's Focus
- 

## Tasks Completed
- [ ] 
- [ ] 
- [ ] 

## Notes
- 

## Tomorrow's Priorities
- 
`,
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    category: 'Personal',
    content: `# Gratitude Journal - {{date}}

## Three Things I'm Grateful For Today:
1. 
2. 
3. 

## Positive Moments:
- 

## Reflection:
`,
  },
  {
    id: 'learning',
    name: 'Learning Notes',
    category: 'Education',
    content: `# Learning Notes - {{date}}

## Topic:
> 

## Key Concepts:
- 
- 
- 

## Questions:
- 

## Action Items:
- [ ] 
`,
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    category: 'Work',
    content: `# Meeting Notes - {{date}}

## Meeting Details
- **Time:** {{time}}
- **Attendees:** 
- **Purpose:** 

## Agenda:
1. 
2. 
3. 

## Discussion Points:
- 

## Action Items:
- [ ] 
- [ ] 

## Follow-up:
- 
`,
  },
  {
    id: 'project',
    name: 'Project Planning',
    category: 'Work',
    content: `# Project Planning - {{date}}

## Project Overview
**Name:** 
**Goal:** 

## Milestones:
- [ ] 
- [ ] 
- [ ] 

## Tasks Today:
- [ ] 
- [ ] 

## Blockers:
- 

## Next Steps:
- 
`,
  },
  {
    id: 'reflection',
    name: 'Daily Reflection',
    category: 'Personal',
    content: `# Daily Reflection - {{date}}

## What went well today?
- 

## What could be improved?
- 

## What did I learn?
- 

## Energy Level: ⭐⭐⭐⭐⭐ (Rate 1-5)

## Tomorrow's Goals:
- 
`,
  },
  {
    id: 'standup',
    name: 'Standup Notes',
    category: 'Work',
    content: `# Standup - {{date}}

## Yesterday:
- 

## Today:
- 

## Blockers:
- None / 

## Notes:
- 
`,
  },
  {
    id: 'blank',
    name: 'Blank Note',
    category: 'General',
    content: `# Note - {{date}}

`,
  },
]

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const applyTemplate = (template: string, date: string): string => {
  return template
    .replace(/\{\{date\}\}/g, formatDisplayDate(date))
    .replace(/\{\{time\}\}/g, formatTime())
}

export default function DailyNotePage() {
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()))
  const [content, setContent] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('daily-log')
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [newTemplateName, setNewTemplateName] = useState<string>('')
  const [showTemplateCreator, setShowTemplateCreator] = useState<boolean>(false)

  // Load notes and custom templates from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('dailyNotes')
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes))
        } catch (e) {
          console.error('Failed to load notes:', e)
        }
      }

      const savedCustomTemplates = localStorage.getItem('dailyNoteTemplates')
      if (savedCustomTemplates) {
        try {
          setCustomTemplates(JSON.parse(savedCustomTemplates))
        } catch (e) {
          console.error('Failed to load custom templates:', e)
        }
      }
    }
  }, [])

  // Load note for selected date
  useEffect(() => {
    const existingNote = notes.find((note) => note.date === selectedDate)
    if (existingNote) {
      setContent(existingNote.content)
      setSelectedTemplate(existingNote.template)
    } else {
      // Apply default template for new date
      const template = [...DEFAULT_TEMPLATES, ...customTemplates].find(
        (t) => t.id === selectedTemplate
      )
      if (template) {
        setContent(applyTemplate(template.content, selectedDate))
      } else {
        setContent('')
      }
    }
  }, [selectedDate, notes, customTemplates, selectedTemplate])

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('dailyNotes', JSON.stringify(notes))
    }
  }, [notes])

  // Save custom templates to localStorage
  useEffect(() => {
    if (customTemplates.length > 0) {
      localStorage.setItem('dailyNoteTemplates', JSON.stringify(customTemplates))
    }
  }, [customTemplates])

  const allTemplates = useMemo(() => [...DEFAULT_TEMPLATES, ...customTemplates], [customTemplates])

  const handleSaveNote = useCallback(() => {
    if (!content.trim()) {
      toast.error('Note content cannot be empty')
      return
    }

    const existingNoteIndex = notes.findIndex((note) => note.date === selectedDate)
    const timestamp = new Date().toISOString()

    if (existingNoteIndex >= 0) {
      // Update existing note
      const updatedNotes = [...notes]
      updatedNotes[existingNoteIndex] = {
        ...updatedNotes[existingNoteIndex],
        content,
        timestamp,
      }
      setNotes(updatedNotes)
      toast.success('Note updated successfully! 💾')
    } else {
      // Create new note
      const newNote: Note = {
        id: `${selectedDate}-${Date.now()}`,
        date: selectedDate,
        content,
        template: selectedTemplate,
        timestamp,
      }
      setNotes([...notes, newNote])
      toast.success('Note saved successfully! 💾')
    }

    trackEvent({
      action: 'daily_note_saved',
      category: 'productivity',
      label: selectedTemplate,
    })
  }, [content, selectedDate, notes, selectedTemplate])

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const template = allTemplates.find((t) => t.id === templateId)
      if (template) {
        setSelectedTemplate(templateId)
        setContent(applyTemplate(template.content, selectedDate))
        toast.success(`Template "${template.name}" applied! 📝`)

        trackEvent({
          action: 'daily_note_template_changed',
          category: 'productivity',
          label: templateId,
        })
      }
    },
    [allTemplates, selectedDate]
  )

  const handleDateChange = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      let newDate: Date

      if (direction === 'today') {
        newDate = new Date()
      } else {
        const currentDate = new Date(`${selectedDate}T00:00:00`)
        newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
      }

      setSelectedDate(formatDate(newDate))

      trackEvent({
        action: 'daily_note_date_changed',
        category: 'productivity',
        label: direction,
      })
    },
    [selectedDate]
  )

  const handleDownloadMarkdown = useCallback(() => {
    if (!content.trim()) {
      toast.error('No content to download')
      return
    }

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `note-${selectedDate}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Note downloaded as Markdown! 💾')

    trackEvent({
      action: 'daily_note_downloaded',
      category: 'productivity',
      label: 'markdown',
    })
  }, [content, selectedDate])

  const handleCopyToClipboard = useCallback(() => {
    if (!content.trim()) {
      toast.error('No content to copy')
      return
    }

    navigator.clipboard.writeText(content)
    toast.success('Note copied to clipboard! 📋')

    trackEvent({
      action: 'daily_note_copied',
      category: 'productivity',
    })
  }, [content])

  const handleCreateCustomTemplate = useCallback(() => {
    if (!newTemplateName.trim()) {
      toast.error('Template name cannot be empty')
      return
    }

    if (!content.trim()) {
      toast.error('Template content cannot be empty')
      return
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: newTemplateName,
      content,
      category: 'Custom',
    }

    setCustomTemplates([...customTemplates, newTemplate])
    setNewTemplateName('')
    setShowTemplateCreator(false)
    toast.success(`Custom template "${newTemplateName}" created! ✨`)

    trackEvent({
      action: 'daily_note_custom_template_created',
      category: 'productivity',
    })
  }, [newTemplateName, content, customTemplates])

  const recentNotes = useMemo(() => {
    return notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }, [notes])

  const stats = useMemo(() => {
    const totalNotes = notes.length
    const currentMonthNotes = notes.filter((note) => {
      const noteDate = new Date(note.date)
      const today = new Date()
      return (
        noteDate.getMonth() === today.getMonth() && noteDate.getFullYear() === today.getFullYear()
      )
    }).length

    const avgWordCount =
      totalNotes > 0
        ? Math.round(
            notes.reduce((acc, note) => acc + note.content.trim().split(/\s+/).length, 0) /
              totalNotes
          )
        : 0

    return {
      totalNotes,
      currentMonthNotes,
      avgWordCount,
    }
  }, [notes])

  return (
    <main
      className={css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minH: '100vh',
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        gap: { base: '6', sm: '6', md: '8' },
      })}
    >
      {/* Header */}
      <div
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', md: 'row' },
          alignItems: { base: 'start', md: 'start' },
          justifyContent: { base: 'start', md: 'space-between' },
          gap: { base: '4', md: '4' },
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
          <div
            className={css({
              display: 'flex',
              h: { base: '12', sm: '14' },
              w: { base: '12', sm: '14' },
              alignItems: 'center',
              justifyContent: 'center',
              rounded: '2xl',
              bgGradient: 'to-br',
              gradientFrom: 'green.500',
              gradientTo: 'emerald.600',
              shadow: 'lg',
              boxShadow: '0 10px 15px rgba(34, 197, 94, 0.3)',
            })}
          >
            <FileText
              className={css({
                h: { base: '6', sm: '7' },
                w: { base: '6', sm: '7' },
                color: 'white',
              })}
            />
          </div>
          <div>
            <h1
              className={css({
                fontSize: { base: '2xl', sm: '3xl' },
                fontWeight: 'bold',
                color: 'white',
              })}
            >
              Daily Note Generator
            </h1>
            <p
              className={css({
                mt: '1',
                fontSize: { base: 'sm', sm: 'base' },
                color: 'gray.400',
              })}
            >
              Create timestamped notes with customizable templates
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
          <Badge
            variant="outline"
            className={css({
              gap: '1.5',
              border: '1px solid',
              borderColor: 'green.500/30',
              color: 'green.400',
            })}
          >
            <FileText className={css({ h: '3', w: '3' })} />
            {stats.totalNotes} notes
          </Badge>
          <Badge
            variant="outline"
            className={css({
              gap: '1.5',
              border: '1px solid',
              borderColor: 'blue.500/30',
              color: 'blue.400',
            })}
          >
            <Calendar className={css({ h: '3', w: '3' })} />
            {stats.currentMonthNotes} this month
          </Badge>
          {stats.avgWordCount > 0 && (
            <Badge
              variant="outline"
              className={css({
                gap: '1.5',
                border: '1px solid',
                borderColor: 'purple.500/30',
                color: 'purple.400',
              })}
            >
              ~{stats.avgWordCount} words avg
            </Badge>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'gray.800',
          bg: 'rgba(17, 24, 39, 0.5)',
          backdropFilter: 'blur(8px)',
        })}
      >
        <CardContent withTopPadding>
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              alignItems: { base: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: '4',
              p: { base: '4', sm: '5' },
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <Calendar className={css({ h: '5', w: '5', color: 'green.400', flexShrink: '0' })} />
              <div>
                <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  {formatDisplayDate(selectedDate)}
                </h2>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  <Clock className={css({ display: 'inline', h: '3', w: '3', mr: '1' })} />
                  {formatTime()}
                </p>
              </div>
            </div>

            <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateChange('prev')}
                className={css({ gap: '2' })}
              >
                <ChevronLeft className={css({ h: '4', w: '4' })} />
                Previous
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDateChange('today')}
                className={css({ gap: '2' })}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateChange('next')}
                className={css({ gap: '2' })}
              >
                Next
                <ChevronRight className={css({ h: '4', w: '4' })} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gap: { base: '6', lg: '6' },
          gridTemplateColumns: { base: '1fr', lg: '300px 1fr' },
        })}
      >
        {/* Left Sidebar - Templates */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
          {/* Template Selection */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardHeader>
              <div className={css({ spaceY: '2', p: { base: '4', sm: '4' } })}>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    fontSize: 'lg',
                  })}
                >
                  <LayoutTemplate className={css({ h: '5', w: '5', color: 'green.500' })} />
                  Templates
                </CardTitle>
                <CardDescription>Choose a template to start</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '4' }, spaceY: '3' })}>
                {/* Group templates by category */}
                {['Productivity', 'Work', 'Personal', 'Education', 'General', 'Custom'].map(
                  (category) => {
                    const categoryTemplates = allTemplates.filter((t) => t.category === category)
                    if (categoryTemplates.length === 0) return null

                    return (
                      <div key={category}>
                        <h4
                          className={css({
                            fontSize: 'xs',
                            fontWeight: 'semibold',
                            color: 'gray.500',
                            mb: '2',
                          })}
                        >
                          {category}
                        </h4>
                        <div className={css({ spaceY: '1' })}>
                          {categoryTemplates.map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => handleTemplateChange(template.id)}
                              className={css({
                                w: 'full',
                                textAlign: 'left',
                                px: '3',
                                py: '2',
                                rounded: 'md',
                                fontSize: 'sm',
                                transition: 'all',
                                cursor: 'pointer',
                                bg:
                                  selectedTemplate === template.id ? 'green.500/20' : 'transparent',
                                color: selectedTemplate === template.id ? 'green.400' : 'gray.300',
                                border: '1px solid',
                                borderColor:
                                  selectedTemplate === template.id ? 'green.500/30' : 'transparent',
                                _hover: {
                                  bg:
                                    selectedTemplate === template.id
                                      ? 'green.500/30'
                                      : 'gray.800/50',
                                },
                              })}
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                )}

                {/* Create Custom Template */}
                {!showTemplateCreator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateCreator(true)}
                    className={css({ w: 'full', gap: '2', mt: '4' })}
                  >
                    <Plus className={css({ h: '4', w: '4' })} />
                    Create Custom Template
                  </Button>
                )}

                {showTemplateCreator && (
                  <div className={css({ mt: '4', spaceY: '2' })}>
                    <Input
                      placeholder="Template name..."
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className={css({
                        bg: 'gray.950',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                    <div className={css({ display: 'flex', gap: '2' })}>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleCreateCustomTemplate}
                        className={css({ flex: '1' })}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowTemplateCreator(false)
                          setNewTemplateName('')
                        }}
                        className={css({ flex: '1' })}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          {recentNotes.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'rgba(17, 24, 39, 0.5)',
                backdropFilter: 'blur(8px)',
              })}
            >
              <CardHeader>
                <div className={css({ spaceY: '2', p: { base: '4', sm: '4' } })}>
                  <CardTitle
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'lg',
                    })}
                  >
                    <Clock className={css({ h: '5', w: '5', color: 'emerald.500' })} />
                    Recent Notes
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ p: { base: '4', sm: '4' }, spaceY: '2' })}>
                  {recentNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedDate(note.date)}
                      className={css({
                        w: 'full',
                        textAlign: 'left',
                        px: '3',
                        py: '2',
                        rounded: 'md',
                        fontSize: 'sm',
                        transition: 'all',
                        cursor: 'pointer',
                        bg: selectedDate === note.date ? 'emerald.500/20' : 'transparent',
                        color: selectedDate === note.date ? 'emerald.400' : 'gray.300',
                        border: '1px solid',
                        borderColor: selectedDate === note.date ? 'emerald.500/30' : 'gray.800',
                        _hover: {
                          bg: selectedDate === note.date ? 'emerald.500/30' : 'gray.800/50',
                        },
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        })}
                      >
                        <span>
                          {new Date(note.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          {note.content.trim().split(/\s+/).length} words
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Note Editor */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
          {/* Action Buttons */}
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveNote}
              className={css({ gap: '2' })}
            >
              <Save className={css({ h: '4', w: '4' })} />
              Save Note
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className={css({ gap: '2' })}
            >
              <Copy className={css({ h: '4', w: '4' })} />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
              className={css({ gap: '2' })}
            >
              <Download className={css({ h: '4', w: '4' })} />
              Download .md
            </Button>
          </div>

          {/* Editor */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(8px)',
              flex: '1',
            })}
          >
            <CardHeader>
              <div className={css({ spaceY: '2', p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <FileText className={css({ h: '5', w: '5', color: 'green.500' })} />
                  Your Note
                </CardTitle>
                <CardDescription>
                  Write your daily note using markdown syntax. Auto-saves to browser storage.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your note here..."
                  className={css({
                    minH: '[600px]',
                    resize: 'none',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.950',
                    fontFamily: 'mono',
                    color: 'gray.100',
                    _focus: { ring: '2px', ringColor: 'green.500' },
                  })}
                />
                <div
                  className={css({
                    mt: '3',
                    display: 'flex',
                    gap: '3',
                    fontSize: 'xs',
                    color: 'gray.500',
                  })}
                >
                  <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>•</span>
                  <span>{content.length} characters</span>
                  <span>•</span>
                  <span>{content.split('\n').length} lines</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'gray.800',
          bgGradient: 'to-r',
          gradientFrom: 'green.500/10',
          gradientTo: 'emerald.500/10',
        })}
      >
        <CardContent withTopPadding>
          <div
            className={css({
              display: 'flex',
              alignItems: 'start',
              gap: '4',
              p: { base: '5', sm: '6' },
            })}
          >
            <FileText
              className={css({ mt: '1', h: '6', w: '6', flexShrink: '0', color: 'green.400' })}
            />
            <div className={css({ flex: '1' })}>
              <h3 className={css({ mb: '2', fontWeight: 'semibold', color: 'white' })}>
                Template Variables
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Use{' '}
                <code
                  className={css({
                    px: '1.5',
                    py: '0.5',
                    rounded: 'sm',
                    bg: 'gray.800',
                    color: 'green.400',
                  })}
                >
                  {'{{date}}'}
                </code>{' '}
                and{' '}
                <code
                  className={css({
                    px: '1.5',
                    py: '0.5',
                    rounded: 'sm',
                    bg: 'gray.800',
                    color: 'green.400',
                  })}
                >
                  {'{{time}}'}
                </code>{' '}
                in your custom templates to automatically insert the current date and time. Perfect
                for creating consistent note structures!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
