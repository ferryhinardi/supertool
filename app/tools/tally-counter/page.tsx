'use client'
'use no memo'

import { Minus, Plus, RotateCcw, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface Counter {
  id: string
  name: string
  count: number
  step: number
  createdAt: string
}

export default function TallyCounterPage() {
  // State - lazy initialization from localStorage
  const [counters, setCounters] = useState<Counter[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tally_counters')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: '1',
        name: 'Main Counter',
        count: 0,
        step: 1,
        createdAt: new Date().toISOString(),
      },
    ]
  })

  const [newCounterName, setNewCounterName] = useState('')
  const [newCounterStep, setNewCounterStep] = useState('1')

  // Track page view on mount
  useEffect(() => {
    trackToolEvent('tally_counter_open', { feature: 'page_load' })
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('tally_counters', JSON.stringify(counters))
  }, [counters])

  // Counter actions
  const increment = useCallback((id: string) => {
    setCounters((prev) => prev.map((c) => (c.id === id ? { ...c, count: c.count + c.step } : c)))
    trackToolEvent('tally_counter_increment', { counter_id: id })
  }, [])

  const decrement = useCallback((id: string) => {
    setCounters((prev) => prev.map((c) => (c.id === id ? { ...c, count: c.count - c.step } : c)))
    trackToolEvent('tally_counter_decrement', { counter_id: id })
  }, [])

  const reset = useCallback((id: string) => {
    setCounters((prev) => prev.map((c) => (c.id === id ? { ...c, count: 0 } : c)))
    trackToolEvent('tally_counter_reset', { counter_id: id })
    toast.success('Counter reset!')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Only apply shortcuts if there's exactly one counter
      if (counters.length !== 1) return

      const counter = counters[0]

      if (e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault()
        increment(counter.id)
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        decrement(counter.id)
      } else if (e.code === 'KeyR') {
        e.preventDefault()
        reset(counter.id)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [counters, increment, decrement, reset])

  const addCounter = () => {
    if (!newCounterName.trim()) {
      toast.error('Please enter a counter name')
      return
    }

    const step = parseInt(newCounterStep, 10) || 1
    if (step <= 0) {
      toast.error('Step must be a positive number')
      return
    }

    const newCounter: Counter = {
      id: Date.now().toString(),
      name: newCounterName.trim(),
      count: 0,
      step,
      createdAt: new Date().toISOString(),
    }

    setCounters((prev) => [...prev, newCounter])
    setNewCounterName('')
    setNewCounterStep('1')
    toast.success('Counter added!')
    trackToolEvent('tally_counter_add', { step })
  }

  const removeCounter = (id: string) => {
    if (counters.length === 1) {
      toast.error('Cannot remove the last counter')
      return
    }

    setCounters((prev) => prev.filter((c) => c.id !== id))
    toast.success('Counter removed!')
    trackToolEvent('tally_counter_remove', { counter_id: id })
  }

  const updateStep = (id: string, newStep: number) => {
    if (newStep <= 0) {
      toast.error('Step must be a positive number')
      return
    }

    setCounters((prev) => prev.map((c) => (c.id === id ? { ...c, step: newStep } : c)))
    trackToolEvent('tally_counter_set_step', { counter_id: id, step: newStep })
    toast.success(`Step updated to ${newStep}`)
  }

  const totalCount = counters.reduce((sum, c) => sum + c.count, 0)

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
            borderColor: 'yellow.500/20',
            bg: 'yellow.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Star className={css({ h: '5', w: '5', color: 'yellow.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'yellow.300' })}>
            Track Counts Simply & Effectively
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'yellow.400',
            gradientVia: 'orange.400',
            gradientTo: 'amber.400',
            bgClip: 'text',
          })}
          style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Tally Counter
        </h1>

        <p className={css({ mx: 'auto', maxW: '2xl', fontSize: 'lg', color: 'gray.400' })}>
          Simple and effective tally counter with multiple counters, custom step values, and
          keyboard shortcuts. Perfect for counting inventory, tracking events, or managing any
          numeric data.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
        })}
      >
        {/* Counters Grid - Takes 2 columns on desktop */}
        <div
          className={css({
            gridColumn: { base: '1', lg: 'span 2' },
            display: 'grid',
            gap: '6',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
            alignContent: 'start',
            w: 'full',
          })}
        >
          {counters.map((counter) => (
            <Card
              key={counter.id}
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
                position: 'relative',
              })}
            >
              <CardHeader>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <CardTitle className={css({ flex: 1, fontSize: 'lg' })}>{counter.name}</CardTitle>
                  {counters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCounter(counter.id)}
                      className={css({
                        color: 'gray.600',
                        transition: 'color 0.2s',
                        _hover: { color: 'red.400' },
                      })}
                      aria-label="Remove counter"
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </button>
                  )}
                </div>
                <CardDescription>Step: {counter.step}</CardDescription>
              </CardHeader>

              <CardContent className={css({ spaceY: '6' })}>
                {/* Count Display */}
                <div className={css({ textAlign: 'center', py: '4' })}>
                  <div
                    className={css({
                      fontSize: '6xl',
                      fontWeight: 'bold',
                      fontFamily: 'mono',
                      bgGradient: 'to-r',
                      gradientFrom: 'yellow.400',
                      gradientTo: 'orange.400',
                      bgClip: 'text',
                    })}
                    style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {counter.count}
                  </div>
                </div>

                {/* Controls */}
                <div className={css({ display: 'flex', gap: '3', justifyContent: 'center' })}>
                  <Button
                    size="lg"
                    onClick={() => decrement(counter.id)}
                    className={css({
                      bg: 'red.500/20',
                      borderColor: 'red.500/40',
                      color: 'red.300',
                      px: '8',
                      _hover: { bg: 'red.500/30' },
                    })}
                  >
                    <Minus className={css({ h: '5', w: '5' })} />
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => increment(counter.id)}
                    className={css({
                      bg: 'green.500/20',
                      borderColor: 'green.500/40',
                      color: 'green.300',
                      px: '8',
                      _hover: { bg: 'green.500/30' },
                    })}
                  >
                    <Plus className={css({ h: '5', w: '5' })} />
                  </Button>
                </div>

                {/* Reset & Step Controls */}
                <div
                  className={css({
                    display: 'flex',
                    gap: '2',
                    pt: '4',
                    borderTop: '1px solid',
                    borderColor: 'gray.800',
                  })}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reset(counter.id)}
                    className={css({ flex: 1 })}
                  >
                    <RotateCcw className={css({ h: '4', w: '4', mr: '2' })} />
                    Reset
                  </Button>

                  <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                    <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Step:</span>
                    <input
                      type="number"
                      min="1"
                      value={counter.step}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10)
                        if (!Number.isNaN(value) && value > 0) {
                          updateStep(counter.id, value)
                        }
                      }}
                      className={css({
                        w: '16',
                        px: '2',
                        py: '1',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        color: 'gray.200',
                        fontSize: 'sm',
                        _focus: {
                          outline: 'none',
                          borderColor: 'yellow.500',
                        },
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Counter Sidebar */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            alignSelf: 'start',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Plus className={css({ h: '5', w: '5' })} />
              Add Counter
            </CardTitle>
            <CardDescription>Create a new tally counter</CardDescription>
          </CardHeader>

          <CardContent className={css({ spaceY: '4' })}>
            <Field>
              <FieldLabel>Counter Name</FieldLabel>
              <FieldInput
                type="text"
                placeholder="e.g., Visitors, Sales, Items..."
                value={newCounterName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCounterName(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') addCounter()
                }}
              />
            </Field>

            <Field>
              <FieldLabel>Step Value</FieldLabel>
              <FieldInput
                type="number"
                min="1"
                placeholder="1"
                value={newCounterStep}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCounterStep(e.target.value)
                }
              />
            </Field>

            <Button onClick={addCounter} size="sm" className={css({ w: 'full' })}>
              <Plus className={css({ h: '4', w: '4', mr: '2' })} />
              Add Counter
            </Button>

            {/* Total Count */}
            <div
              className={css({
                mt: '6',
                pt: '4',
                borderTop: '1px solid',
                borderColor: 'gray.800',
                textAlign: 'center',
              })}
            >
              <div className={css({ fontSize: 'sm', color: 'gray.500', mb: '1' })}>Total Count</div>
              <div
                className={css({
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  bgGradient: 'to-r',
                  gradientFrom: 'yellow.400',
                  gradientTo: 'orange.400',
                  bgClip: 'text',
                })}
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {totalCount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features & Keyboard Shortcuts */}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1', md: 'repeat(2, 1fr)' },
        })}
      >
        {/* Features */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/5',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3', fontSize: 'sm', color: 'gray.300' })}>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <span className={css({ color: 'yellow.400', mt: '1' })}>✓</span>
                <span>
                  <strong>Multiple Counters:</strong> Create and manage multiple counters
                  simultaneously
                </span>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <span className={css({ color: 'yellow.400', mt: '1' })}>✓</span>
                <span>
                  <strong>Custom Steps:</strong> Set custom increment/decrement values for each
                  counter
                </span>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <span className={css({ color: 'yellow.400', mt: '1' })}>✓</span>
                <span>
                  <strong>Persistence:</strong> All counters are automatically saved to your browser
                </span>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <span className={css({ color: 'yellow.400', mt: '1' })}>✓</span>
                <span>
                  <strong>Total Count:</strong> View the sum of all counters at a glance
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'purple.500/5',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Keyboard Shortcuts</CardTitle>
            <CardDescription>Available when using a single counter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <kbd
                    className={css({
                      px: '2',
                      py: '1',
                      rounded: 'sm',
                      bg: 'gray.800',
                      fontFamily: 'mono',
                      fontSize: 'sm',
                    })}
                  >
                    ↑
                  </kbd>
                  <span className={css({ fontSize: 'sm', color: 'gray.400' })}>or</span>
                  <kbd
                    className={css({
                      px: '2',
                      py: '1',
                      rounded: 'sm',
                      bg: 'gray.800',
                      fontFamily: 'mono',
                      fontSize: 'sm',
                    })}
                  >
                    Space
                  </kbd>
                </div>
                <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Increment</span>
              </div>

              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <kbd
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'sm',
                    bg: 'gray.800',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                  })}
                >
                  ↓
                </kbd>
                <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Decrement</span>
              </div>

              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <kbd
                  className={css({
                    px: '2',
                    py: '1',
                    rounded: 'sm',
                    bg: 'gray.800',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                  })}
                >
                  R
                </kbd>
                <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Reset Counter</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Use Cases */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'green.500/20',
          bg: 'green.500/5',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ fontSize: 'lg' })}>Perfect For</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <div className={css({ fontSize: 'xl', mb: '1' })}>📊</div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Event Tracking
              </h3>
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                Count attendees, participants, or visitors
              </p>
            </div>
            <div>
              <div className={css({ fontSize: 'xl', mb: '1' })}>📦</div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Inventory Management
              </h3>
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                Track stock levels and quantities
              </p>
            </div>
            <div>
              <div className={css({ fontSize: 'xl', mb: '1' })}>🎯</div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                Goal Tracking
              </h3>
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                Monitor progress towards daily targets
              </p>
            </div>
            <div>
              <div className={css({ fontSize: 'xl', mb: '1' })}>🔢</div>
              <h3 className={css({ mb: '1', fontSize: 'sm', fontWeight: 'semibold' })}>
                General Counting
              </h3>
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                Any situation requiring numeric tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
