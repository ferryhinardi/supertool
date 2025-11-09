'use client'

import { Calendar, Clock, Download, Plus, Trash2, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface Task {
  id: string
  title: string
  duration: number // in minutes
  category: string
  completed: boolean
  createdAt: string
}

const CATEGORIES = [
  { value: 'work', label: 'Work', color: 'blue' },
  { value: 'personal', label: 'Personal', color: 'green' },
  { value: 'learning', label: 'Learning', color: 'purple' },
  { value: 'health', label: 'Health', color: 'red' },
  { value: 'social', label: 'Social', color: 'yellow' },
  { value: 'other', label: 'Other', color: 'gray' },
] as const

export default function DailyTaskSummary() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Initialize state from localStorage
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('dailyTaskSummary')
      if (savedTasks) {
        try {
          return JSON.parse(savedTasks)
        } catch (e) {
          console.error('Failed to load tasks:', e)
        }
      }
    }
    return []
  })
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState('work')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('dailyTaskSummary', JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = () => {
    if (!title.trim() || !duration) {
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      duration: parseInt(duration, 10),
      category,
      completed: false,
      createdAt: selectedDate,
    }

    setTasks([...tasks, newTask])
    setTitle('')
    setDuration('')
    setCategory('work')

    trackEvent({
      action: 'daily_task_summary_task_added',
      category: 'productivity',
      label: category,
      value: parseInt(duration, 10),
    })
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    trackEvent({
      action: 'daily_task_summary_task_deleted',
      category: 'productivity',
    })
  }

  const clearAllTasks = () => {
    setTasks([])
    localStorage.removeItem('dailyTaskSummary')
    trackEvent({
      action: 'daily_task_summary_cleared',
      category: 'productivity',
    })
  }

  // Filter tasks for selected date
  const filteredTasks = tasks.filter((task) => task.createdAt === selectedDate)

  // Calculate statistics
  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter((task) => task.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const totalTime = filteredTasks.reduce((acc, task) => acc + task.duration, 0)
  const completedTime = filteredTasks
    .filter((task) => task.completed)
    .reduce((acc, task) => acc + task.duration, 0)

  // Calculate category distribution
  const categoryStats = CATEGORIES.map((cat) => {
    const categoryTasks = filteredTasks.filter((task) => task.category === cat.value)
    const categoryTime = categoryTasks.reduce((acc, task) => acc + task.duration, 0)
    return {
      ...cat,
      count: categoryTasks.length,
      time: categoryTime,
      percentage: totalTime > 0 ? (categoryTime / totalTime) * 100 : 0,
    }
  }).filter((stat) => stat.count > 0)

  const downloadSummary = (format: 'txt' | 'json') => {
    const summary =
      format === 'json'
        ? JSON.stringify(
            {
              date: selectedDate,
              statistics: {
                totalTasks,
                completedTasks,
                completionRate,
                totalTime,
                completedTime,
              },
              categoryBreakdown: categoryStats,
              tasks: filteredTasks,
            },
            null,
            2
          )
        : generateTextSummary()

    const blob = new Blob([summary], {
      type: format === 'json' ? 'application/json' : 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-summary-${selectedDate}.${format}`
    a.click()
    URL.revokeObjectURL(url)

    trackEvent({
      action: 'daily_task_summary_downloaded',
      category: 'productivity',
      label: format,
    })
  }

  const generateTextSummary = () => {
    let summary = `Daily Task Summary - ${selectedDate}\n`
    summary += `${'='.repeat(50)}\n\n`
    summary += `OVERVIEW\n`
    summary += `--------\n`
    summary += `Total Tasks: ${totalTasks}\n`
    summary += `Completed: ${completedTasks} (${completionRate}%)\n`
    summary += `Total Time: ${formatTime(totalTime)}\n`
    summary += `Completed Time: ${formatTime(completedTime)}\n\n`

    if (categoryStats.length > 0) {
      summary += `CATEGORY BREAKDOWN\n`
      summary += `------------------\n`
      categoryStats.forEach((stat) => {
        summary += `${stat.label}: ${stat.count} tasks (${formatTime(stat.time)}, ${Math.round(stat.percentage)}%)\n`
      })
      summary += `\n`
    }

    summary += `TASKS\n`
    summary += `-----\n`
    filteredTasks.forEach((task, index) => {
      const status = task.completed ? '[✓]' : '[ ]'
      summary += `${index + 1}. ${status} ${task.title}\n`
      summary += `   Category: ${CATEGORIES.find((c) => c.value === task.category)?.label}\n`
      summary += `   Duration: ${formatTime(task.duration)}\n\n`
    })

    return summary
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <main
      className={css({
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #10b981, #3b82f6)',
        padding: { base: '2rem 1rem', md: '2rem' },
      })}
    >
      <div
        className={css({
          maxWidth: '1200px',
          margin: '0 auto',
        })}
      >
        {/* Header */}
        <div
          className={css({
            textAlign: 'center',
            marginBottom: '2rem',
          })}
        >
          <div
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              marginBottom: '1rem',
            })}
          >
            <Calendar size={32} color="white" />
          </div>
          <h1
            className={css({
              fontSize: { base: '2rem', md: '2.5rem' },
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem',
            })}
          >
            Daily Task Summary
          </h1>
          <p
            className={css({
              fontSize: { base: '1rem', md: '1.125rem' },
              color: 'rgba(255, 255, 255, 0.9)',
            })}
          >
            Track your daily tasks and analyze your productivity
          </p>
        </div>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
            gap: '1.5rem',
          })}
        >
          {/* Left Column - Task Input & List */}
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5rem' })}>
            {/* Date Selector */}
            <Card>
              <div className={css({ padding: '1.5rem' })}>
                <label
                  htmlFor="task-date"
                  className={css({
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                  })}
                >
                  Select Date
                </label>
                <Input
                  id="task-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </Card>

            {/* Add Task Form */}
            <Card>
              <div className={css({ padding: '1.5rem' })}>
                <h2
                  className={css({
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  })}
                >
                  Add New Task
                </h2>

                <div className={css({ display: 'flex', flexDirection: 'column', gap: '1rem' })}>
                  <div>
                    <label
                      htmlFor="task-title"
                      className={css({
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                      })}
                    >
                      Task Title
                    </label>
                    <Input
                      id="task-title"
                      type="text"
                      placeholder="What do you need to do?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                  </div>

                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                    })}
                  >
                    <div>
                      <label
                        htmlFor="task-duration"
                        className={css({
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          marginBottom: '0.5rem',
                        })}
                      >
                        Duration (minutes)
                      </label>
                      <Input
                        id="task-duration"
                        type="number"
                        placeholder="30"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="task-category"
                        className={css({
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          marginBottom: '0.5rem',
                        })}
                      >
                        Category
                      </label>
                      <select
                        id="task-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={css({
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          '&:focus': {
                            borderColor: '#3b82f6',
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          },
                        })}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button onClick={addTask} disabled={!title.trim() || !duration}>
                    <Plus size={16} />
                    Add Task
                  </Button>
                </div>
              </div>
            </Card>

            {/* Task List */}
            <Card>
              <div className={css({ padding: '1.5rem' })}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  })}
                >
                  <h2
                    className={css({
                      fontSize: '1.25rem',
                      fontWeight: '600',
                    })}
                  >
                    Tasks ({filteredTasks.length})
                  </h2>
                  {filteredTasks.length > 0 && (
                    <Button
                      onClick={clearAllTasks}
                      className={css({
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem',
                      })}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {filteredTasks.length === 0 ? (
                  <p
                    className={css({
                      textAlign: 'center',
                      color: '#6b7280',
                      padding: '2rem',
                    })}
                  >
                    No tasks for this date. Add your first task above!
                  </p>
                ) : (
                  <div
                    className={css({ display: 'flex', flexDirection: 'column', gap: '0.75rem' })}
                  >
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={css({
                          padding: '1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          backgroundColor: task.completed ? '#f9fafb' : 'white',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          },
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                          })}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className={css({
                              width: '1.25rem',
                              height: '1.25rem',
                              marginTop: '0.125rem',
                              cursor: 'pointer',
                            })}
                          />
                          <div className={css({ flex: 1 })}>
                            <h3
                              className={css({
                                fontWeight: '500',
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? '#6b7280' : 'inherit',
                                marginBottom: '0.5rem',
                              })}
                            >
                              {task.title}
                            </h3>
                            <div
                              className={css({
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center',
                              })}
                            >
                              <Badge>
                                {CATEGORIES.find((c) => c.value === task.category)?.label}
                              </Badge>
                              <span
                                className={css({
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.875rem',
                                  color: '#6b7280',
                                })}
                              >
                                <Clock size={14} />
                                {formatTime(task.duration)}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteTask(task.id)}
                            className={css({
                              padding: '0.5rem',
                              minWidth: 'auto',
                            })}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Statistics & Insights */}
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5rem' })}>
            {/* Overview Stats */}
            <Card>
              <div className={css({ padding: '1.5rem' })}>
                <h2
                  className={css({
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  })}
                >
                  Overview
                </h2>

                <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5rem' })}>
                  <div>
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        })}
                      >
                        Completion Rate
                      </span>
                      <span
                        className={css({
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#3b82f6',
                        })}
                      >
                        {completionRate}%
                      </span>
                    </div>
                    <Progress value={completionRate} />
                  </div>

                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                    })}
                  >
                    <div
                      className={css({
                        padding: '1rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '0.5rem',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        })}
                      >
                        Total Tasks
                      </div>
                      <div
                        className={css({
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#3b82f6',
                        })}
                      >
                        {totalTasks}
                      </div>
                    </div>

                    <div
                      className={css({
                        padding: '1rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '0.5rem',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        })}
                      >
                        Completed
                      </div>
                      <div
                        className={css({
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#10b981',
                        })}
                      >
                        {completedTasks}
                      </div>
                    </div>

                    <div
                      className={css({
                        padding: '1rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '0.5rem',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        })}
                      >
                        Total Time
                      </div>
                      <div
                        className={css({
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#f59e0b',
                        })}
                      >
                        {formatTime(totalTime)}
                      </div>
                    </div>

                    <div
                      className={css({
                        padding: '1rem',
                        backgroundColor: '#fce7f3',
                        borderRadius: '0.5rem',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        })}
                      >
                        Done Time
                      </div>
                      <div
                        className={css({
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#ec4899',
                        })}
                      >
                        {formatTime(completedTime)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Category Breakdown */}
            {categoryStats.length > 0 && (
              <Card>
                <div className={css({ padding: '1.5rem' })}>
                  <h2
                    className={css({
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    })}
                  >
                    <TrendingUp size={20} />
                    Category Breakdown
                  </h2>

                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '1rem' })}>
                    {categoryStats.map((stat) => (
                      <div key={stat.value}>
                        <div
                          className={css({
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                          })}
                        >
                          <span
                            className={css({
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            })}
                          >
                            {stat.label}
                          </span>
                          <span
                            className={css({
                              fontSize: '0.875rem',
                              color: '#6b7280',
                            })}
                          >
                            {stat.count} tasks · {formatTime(stat.time)}
                          </span>
                        </div>
                        <Progress value={stat.percentage} />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Download Summary */}
            {filteredTasks.length > 0 && (
              <Card>
                <div className={css({ padding: '1.5rem' })}>
                  <h2
                    className={css({
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                    })}
                  >
                    Export Summary
                  </h2>

                  <div
                    className={css({ display: 'flex', flexDirection: 'column', gap: '0.75rem' })}
                  >
                    <Button onClick={() => downloadSummary('txt')}>
                      <Download size={16} />
                      Download as Text
                    </Button>
                    <Button onClick={() => downloadSummary('json')}>
                      <Download size={16} />
                      Download as JSON
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

    {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

    <ToolSearch />

    
    </main>
  )
}
