'use client'

import { Calendar, Check, Clock, Link2, RotateCcw, Share2 } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const now = new Date()
  const total = targetDate.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function CountdownTimerContent() {
  const [eventName, setEventName] = useQueryState('event', parseAsString.withDefault(''))
  const [targetDateTime, setTargetDateTime] = useQueryState('target', parseAsString.withDefault(''))

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [copied, setCopied] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    trackToolEvent('countdown_timer_open', {})
  }, [])

  // Initialize from URL params
  useEffect(() => {
    if (targetDateTime) {
      setIsStarted(true)
    }
  }, [targetDateTime])

  // Update countdown every second
  useEffect(() => {
    if (!targetDateTime || !isStarted) {
      setTimeRemaining(null)
      return
    }

    const targetDate = new Date(targetDateTime)
    if (Number.isNaN(targetDate.getTime())) {
      setTimeRemaining(null)
      return
    }

    const updateCountdown = () => {
      setTimeRemaining(calculateTimeRemaining(targetDate))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetDateTime, isStarted])

  const handleStart = useCallback(() => {
    if (!targetDateTime) {
      toast.error('Please select a target date and time')
      return
    }

    const targetDate = new Date(targetDateTime)
    if (Number.isNaN(targetDate.getTime())) {
      toast.error('Invalid date/time selected')
      return
    }

    if (targetDate.getTime() < Date.now()) {
      toast.warning('Target date is in the past. The countdown will show as completed.')
    }

    setIsStarted(true)
    trackToolEvent('countdown_timer_start', {})
    toast.success('Countdown started!')
  }, [targetDateTime])

  const handleClear = useCallback(() => {
    setEventName('')
    setTargetDateTime('')
    setTimeRemaining(null)
    setIsStarted(false)
    toast.success('Timer cleared!')
  }, [setEventName, setTargetDateTime])

  const handleShare = useCallback(async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: eventName || 'Countdown Timer',
          text: `Countdown to ${eventName || 'event'}`,
          url,
        })
        trackToolEvent('countdown_timer_share', {})
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        trackToolEvent('countdown_timer_copy', {})
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // User cancelled share or error
    }
  }, [eventName])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      trackToolEvent('countdown_timer_copy', {})
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }, [])

  const isExpired = timeRemaining && timeRemaining.total <= 0
  const hasTarget = targetDateTime && !Number.isNaN(new Date(targetDateTime).getTime())

  // Get default datetime (tomorrow at noon)
  const getDefaultDateTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(12, 0, 0, 0)
    return formatDateTime(tomorrow)
  }

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
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <Badge
          className={css({
            bg: 'orange.500/10',
            color: 'orange.400',
            border: '1px solid',
            borderColor: 'orange.500/20',
          })}
        >
          <Clock className={css({ w: '3', h: '3', mr: '1' })} />
          Productivity Tool
        </Badge>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            letterSpacing: 'tight',
            lineHeight: 'tight',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'orange.400',
              gradientTo: 'red.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Countdown
          </span>{' '}
          <span className={css({ color: 'gray.100' })}>Timer</span>
        </h1>
        <p
          className={css({
            fontSize: { base: 'md', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Set a countdown to any date and time. Share the link with others to count down together.
          Perfect for events, deadlines, and celebrations.
        </p>
      </div>

      {/* Setup Card */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
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
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2',
              })}
            >
              <div>
                <CardTitle className={css({ color: 'gray.100' })}>Timer Settings</CardTitle>
                <CardDescription>Set up your countdown</CardDescription>
              </div>
              {isStarted && (
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className={css({
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    <Share2 className={css({ w: '4', h: '4', mr: '2' })} />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className={css({
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    {copied ? (
                      <Check className={css({ w: '4', h: '4', mr: '2', color: 'green.400' })} />
                    ) : (
                      <Link2 className={css({ w: '4', h: '4', mr: '2' })} />
                    )}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className={css({
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    <RotateCcw className={css({ w: '4', h: '4', mr: '2' })} />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Event Name */}
            <div>
              <label
                htmlFor="countdown-event-name"
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Event Name (optional)
              </label>
              <Input
                id="countdown-event-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Product Launch, Birthday, Vacation"
                className={css({
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: {
                    borderColor: 'orange.500',
                    ring: '1px',
                    ringColor: 'orange.500',
                  },
                })}
              />
            </div>

            {/* Target DateTime */}
            <div>
              <label
                htmlFor="countdown-target-datetime"
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Target Date & Time
              </label>
              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                <Input
                  id="countdown-target-datetime"
                  type="datetime-local"
                  value={targetDateTime}
                  onChange={(e) => setTargetDateTime(e.target.value)}
                  className={css({
                    flex: 1,
                    minW: '200px',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    colorScheme: 'dark',
                    _focus: {
                      borderColor: 'orange.500',
                      ring: '1px',
                      ringColor: 'orange.500',
                    },
                  })}
                />
                <Button
                  variant="outline"
                  onClick={() => setTargetDateTime(getDefaultDateTime())}
                  className={css({
                    borderColor: 'gray.700',
                    _hover: { bg: 'gray.800' },
                  })}
                >
                  <Calendar className={css({ w: '4', h: '4', mr: '2' })} />
                  Tomorrow
                </Button>
              </div>
            </div>

            {/* Start Button */}
            {!isStarted && (
              <Button
                onClick={handleStart}
                disabled={!hasTarget}
                className={css({
                  w: 'full',
                  bg: 'orange.500',
                  color: 'white',
                  _hover: { bg: 'orange.600' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Clock className={css({ w: '4', h: '4', mr: '2' })} />
                Start Countdown
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Countdown Display */}
      {isStarted && timeRemaining && (
        <div
          className={css({
            animation: 'scaleIn 0.5s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0,
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: isExpired ? 'red.500/30' : 'orange.500/30',
              bg: isExpired ? 'red.900/20' : 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent className={css({ py: '8' })}>
              {/* Event Name Display */}
              {eventName && (
                <div
                  className={css({
                    textAlign: 'center',
                    mb: '6',
                  })}
                >
                  <h2
                    className={css({
                      fontSize: { base: 'xl', sm: '2xl' },
                      fontWeight: 'semibold',
                      color: 'gray.100',
                    })}
                  >
                    {eventName}
                  </h2>
                </div>
              )}

              {isExpired ? (
                <div className={css({ textAlign: 'center' })}>
                  <div
                    className={css({
                      fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                      fontWeight: 'bold',
                      color: 'red.400',
                      mb: '2',
                    })}
                  >
                    Time&apos;s Up!
                  </div>
                  <div className={css({ fontSize: 'lg', color: 'gray.400' })}>
                    The countdown has ended
                  </div>
                </div>
              ) : (
                <>
                  {/* Countdown Numbers */}
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                      gap: { base: '4', sm: '6' },
                      maxW: '4xl',
                      mx: 'auto',
                    })}
                  >
                    {[
                      { label: 'Days', value: timeRemaining.days },
                      { label: 'Hours', value: timeRemaining.hours },
                      { label: 'Minutes', value: timeRemaining.minutes },
                      { label: 'Seconds', value: timeRemaining.seconds },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className={css({
                          textAlign: 'center',
                          p: { base: '4', sm: '6' },
                          rounded: 'xl',
                          bg: 'gray.800/50',
                          border: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      >
                        <div
                          className={css({
                            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
                            fontWeight: 'bold',
                            fontFamily: 'mono',
                            bgGradient: 'to-r',
                            gradientFrom: 'orange.400',
                            gradientTo: 'red.500',
                            bgClip: 'text',
                            color: 'transparent',
                            lineHeight: 1,
                            animation: 'scaleIn 0.2s ease-out forwards',
                            opacity: 0,
                          })}
                        >
                          {String(unit.value).padStart(2, '0')}
                        </div>
                        <div
                          className={css({
                            fontSize: { base: 'xs', sm: 'sm' },
                            color: 'gray.400',
                            mt: '2',
                            textTransform: 'uppercase',
                            letterSpacing: 'wide',
                          })}
                        >
                          {unit.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Target Date Display */}
                  <div
                    className={css({
                      textAlign: 'center',
                      mt: '6',
                      color: 'gray.500',
                      fontSize: 'sm',
                    })}
                  >
                    Counting down to:{' '}
                    <span className={css({ color: 'gray.300' })}>
                      {new Date(targetDateTime).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Presets */}
      {!isStarted && (
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
          })}
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
              <CardTitle className={css({ color: 'gray.100' })}>Quick Presets</CardTitle>
              <CardDescription>Click to set a countdown quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    lg: 'repeat(6, 1fr)',
                  },
                  gap: '3',
                  w: 'full',
                })}
              >
                {[
                  { label: '1 Hour', hours: 1 },
                  { label: '4 Hours', hours: 4 },
                  { label: '24 Hours', hours: 24 },
                  { label: '1 Week', hours: 24 * 7 },
                  { label: '1 Month', hours: 24 * 30 },
                  { label: 'New Year', newYear: true },
                ].map((preset) => {
                  const getPresetDate = () => {
                    if (preset.newYear) {
                      const now = new Date()
                      const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0)
                      return formatDateTime(nextYear)
                    }
                    const date = new Date()
                    date.setTime(date.getTime() + (preset.hours || 0) * 60 * 60 * 1000)
                    return formatDateTime(date)
                  }

                  return (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => {
                        setTargetDateTime(getPresetDate())
                        if (preset.newYear) {
                          setEventName(`New Year ${new Date().getFullYear() + 1}`)
                        }
                      }}
                      className={css({
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/30',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'orange.500/50',
                          bg: 'orange.500/5',
                        },
                      })}
                    >
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.200',
                        })}
                      >
                        {preset.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/productivity/countdown-timer" />

      {/* Social Share & Rating */}
      <div className={css({ spaceY: '6' })}>
        <SocialShare
          toolName="Countdown Timer"
          toolUrl="/tools/productivity/countdown-timer"
          description="Create countdown timers to any date and time"
        />
        <ToolRating toolId="countdown-timer" toolName="Countdown Timer" />
      </div>
    </main>
  )
}

export default function CountdownTimerPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minH: '50vh',
            color: 'gray.400',
          })}
        >
          Loading...
        </div>
      }
    >
      <CountdownTimerContent />
    </Suspense>
  )
}
