'use client'

import type dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { Calendar, Clock, Copy, Info } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  addTime,
  COMMON_TIMEZONES,
  calculateDifference,
  convertTimezone,
  type DateDifference,
  FORMAT_PRESETS,
  type FormatPreset,
  formatDate,
  getCurrentDate,
  getFormattedOutputs,
  getRelativeTime,
  isValidDate,
  parseDate,
  subtractTime,
} from './utils'

function DateFormatterContent() {
  const [inputDate, setInputDate] = useState('')
  const [parsedDate, setParsedDate] = useState<dayjs.Dayjs | null>(null)
  const [selectedFormat, _setSelectedFormat] = useState<FormatPreset>('ISO 8601')
  const [customFormat, _setCustomFormat] = useState('')
  const [selectedTimezone, _setSelectedTimezone] = useState('UTC')
  const [targetTimezone, setTargetTimezone] = useState('America/New_York')
  const [convertedDate, setConvertedDate] = useState<dayjs.Dayjs | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateDiff, setDateDiff] = useState<DateDifference | null>(null)
  const [formattedOutputs, setFormattedOutputs] = useState<Record<string, string>>({})

  useEffect(() => {
    trackToolEvent('date_formatter_open', {})
  }, [])

  useEffect(() => {
    const parsed = parseDate(inputDate)
    setParsedDate(parsed)

    if (isValidDate(parsed)) {
      const outputs = getFormattedOutputs(parsed)
      setFormattedOutputs(outputs)
    } else {
      setFormattedOutputs({})
    }
  }, [inputDate])

  useEffect(() => {
    if (parsedDate && isValidDate(parsedDate)) {
      const converted = convertTimezone(parsedDate, targetTimezone)
      setConvertedDate(converted)
    } else {
      setConvertedDate(null)
    }
  }, [parsedDate, targetTimezone])

  useEffect(() => {
    const start = parseDate(startDate)
    const end = parseDate(endDate)

    if (isValidDate(start) && isValidDate(end)) {
      const diff = calculateDifference(start, end)
      setDateDiff(diff)
    } else {
      setDateDiff(null)
    }
  }, [startDate, endDate])

  const handleSetCurrentDate = () => {
    const now = getCurrentDate(selectedTimezone)
    setInputDate(now.toISOString())
    trackToolEvent('date_set_current', { timezone: selectedTimezone })
  }

  const _handleFormatConvert = () => {
    if (!parsedDate || !isValidDate(parsedDate)) return

    const format = selectedFormat === 'Custom' ? customFormat : FORMAT_PRESETS[selectedFormat]
    const formatted = formatDate(parsedDate, { format, timezone: selectedTimezone })

    navigator.clipboard.writeText(formatted)
    toast.success('Formatted date copied to clipboard!')

    trackToolEvent('date_format', {
      format: selectedFormat,
      timezone: selectedTimezone,
    })
  }

  const handleCopyOutput = (format: string, value: string) => {
    navigator.clipboard.writeText(value)
    toast.success(`${format} copied!`)
    trackToolEvent('date_copy', { format })
  }

  const handleCopyTimezoneConversion = () => {
    if (!convertedDate || !isValidDate(convertedDate)) return

    const formatted = convertedDate.format('YYYY-MM-DD HH:mm:ss z')
    navigator.clipboard.writeText(formatted)
    toast.success('Converted date copied!')

    trackToolEvent('date_convert', {
      from_timezone: selectedTimezone,
      to_timezone: targetTimezone,
    })
  }

  const _handleAddTime = (amount: number, unit: 'days' | 'hours' | 'minutes') => {
    if (!parsedDate || !isValidDate(parsedDate)) return

    const newDate = addTime(parsedDate, amount, unit)
    if (newDate) {
      setInputDate(newDate.toISOString())
      toast.success(`Added ${amount} ${unit}`)
    }
  }

  const _handleSubtractTime = (amount: number, unit: 'days' | 'hours' | 'minutes') => {
    if (!parsedDate || !isValidDate(parsedDate)) return

    const newDate = subtractTime(parsedDate, amount, unit)
    if (newDate) {
      setInputDate(newDate.toISOString())
      toast.success(`Subtracted ${amount} ${unit}`)
    }
  }

  const relativeTime = parsedDate && isValidDate(parsedDate) ? getRelativeTime(parsedDate) : ''

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
          <Calendar className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            Powered by Day.js
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'red.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Date Formatter & Parser
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Convert timestamps between formats and timezones. Parse dates, calculate differences, and
          format with precision.
        </p>
      </motion.div>

      {/* Date Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Date Input</CardTitle>
            <CardDescription>Enter a date, timestamp, or use the current date/time</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'flex',
                gap: '3',
                flexDirection: { base: 'column', sm: 'row' },
              })}
            >
              <Input
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                placeholder="2024-01-01, 1704067200, or any date format..."
                className={css({
                  flex: '1',
                  h: '12',
                  fontSize: 'md',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: { borderColor: 'orange.500', ring: '2px', ringColor: 'orange.500/20' },
                })}
              />
              <Button
                onClick={handleSetCurrentDate}
                className={css({
                  gap: '2',
                  bg: 'orange.500/20',
                  color: 'orange.300',
                  border: '1px solid',
                  borderColor: 'orange.500/30',
                  _hover: { bg: 'orange.500/30' },
                })}
              >
                <Clock className={css({ h: '4', w: '4' })} />
                Now
              </Button>
            </div>

            {parsedDate && isValidDate(parsedDate) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({ spaceY: '3' })}
              >
                <div
                  className={css({
                    display: 'flex',
                    gap: '2',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  })}
                >
                  <Badge
                    className={css({
                      bg: 'green.500/20',
                      color: 'green.300',
                      border: '1px solid',
                      borderColor: 'green.500/30',
                    })}
                  >
                    Valid Date
                  </Badge>
                  {relativeTime && (
                    <Badge
                      className={css({
                        bg: 'blue.500/20',
                        color: 'blue.300',
                        border: '1px solid',
                        borderColor: 'blue.500/30',
                      })}
                    >
                      {relativeTime}
                    </Badge>
                  )}
                </div>

                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '3',
                  })}
                >
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                      Unix Timestamp
                    </div>
                    <div
                      className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {parsedDate.unix()}
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                      ISO 8601
                    </div>
                    <div
                      className={css({
                        fontSize: 'lg',
                        fontWeight: 'semibold',
                        color: 'gray.200',
                        wordBreak: 'break-all',
                      })}
                    >
                      {parsedDate.toISOString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Format Converter */}
      {parsedDate && isValidDate(parsedDate) && (
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
              <CardTitle>Format Converter</CardTitle>
              <CardDescription>Convert to various date formats</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: '3',
                })}
              >
                {Object.entries(formattedOutputs).map(([format, value]) => (
                  <div
                    key={format}
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                      position: 'relative',
                      _hover: { borderColor: 'blue.500/50' },
                      transition: 'all 0.2s',
                    })}
                  >
                    <div
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.500',
                        mb: '2',
                        fontWeight: 'medium',
                      })}
                    >
                      {format}
                    </div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.300',
                        wordBreak: 'break-all',
                        mb: '2',
                      })}
                    >
                      {value}
                    </div>
                    <Button
                      onClick={() => handleCopyOutput(format, value)}
                      size="sm"
                      className={css({
                        w: 'full',
                        h: '8',
                        gap: '2',
                        bg: 'blue.500/10',
                        color: 'blue.300',
                        border: '1px solid',
                        borderColor: 'blue.500/20',
                        _hover: { bg: 'blue.500/20' },
                      })}
                    >
                      <Copy className={css({ h: '3', w: '3' })} />
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timezone Converter */}
      {parsedDate && isValidDate(parsedDate) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
              <CardTitle>Timezone Converter</CardTitle>
              <CardDescription>Convert between different timezones</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                  gap: '4',
                })}
              >
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="targetTimezone"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Target Timezone
                  </label>
                  <select
                    id="targetTimezone"
                    value={targetTimezone}
                    onChange={(e) => setTargetTimezone(e.target.value)}
                    className={css({
                      w: 'full',
                      h: '10',
                      px: '3',
                      rounded: 'md',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      color: 'gray.200',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      _focus: {
                        outline: 'none',
                        borderColor: 'purple.500',
                        ring: '2px',
                        ringColor: 'purple.500/20',
                      },
                    })}
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                {convertedDate && isValidDate(convertedDate) && (
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'purple.500/30',
                      bg: 'purple.500/10',
                      p: '4',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.400', mb: '2' })}>
                      Converted Time
                    </div>
                    <div
                      className={css({
                        fontSize: 'xl',
                        fontWeight: 'bold',
                        color: 'purple.300',
                        mb: '3',
                      })}
                    >
                      {convertedDate.format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                    <Button
                      onClick={handleCopyTimezoneConversion}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'purple.500/20',
                        color: 'purple.300',
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                        _hover: { bg: 'purple.500/30' },
                      })}
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Date Difference Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
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
            <CardTitle>Date Difference Calculator</CardTitle>
            <CardDescription>Calculate time between two dates</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '3',
              })}
            >
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="startDate"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Start Date
                </label>
                <Input
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="2024-01-01"
                  className={css({
                    h: '10',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'green.500', ring: '2px', ringColor: 'green.500/20' },
                  })}
                />
              </div>

              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="endDate"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  End Date
                </label>
                <Input
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="2024-12-31"
                  className={css({
                    h: '10',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'green.500', ring: '2px', ringColor: 'green.500/20' },
                  })}
                />
              </div>
            </div>

            {dateDiff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({ spaceY: '4' })}
              >
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'green.500/30',
                    bg: 'green.500/10',
                    p: '4',
                  })}
                >
                  <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '2' })}>
                    Time Difference
                  </div>
                  <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.300' })}>
                    {dateDiff.humanReadable}
                  </div>
                </div>

                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: {
                      base: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(4, 1fr)',
                    },
                    gap: '3',
                  })}
                >
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                      Total Days
                    </div>
                    <div
                      className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {dateDiff.totalDays}
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                      Total Hours
                    </div>
                    <div
                      className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {dateDiff.totalHours}
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                      Total Minutes
                    </div>
                    <div
                      className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {dateDiff.totalMinutes}
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                      Total Seconds
                    </div>
                    <div
                      className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {dateDiff.totalSeconds}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Info className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Supported Formats
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• ISO 8601: 2024-01-01T12:00:00Z</li>
                  <li>• Unix Timestamp: 1704067200 (seconds or milliseconds)</li>
                  <li>• US Format: 01/15/2024</li>
                  <li>• EU Format: 15/01/2024</li>
                  <li>• Natural Language: January 15, 2024</li>
                  <li>• RFC 2822: Mon, 15 Jan 2024 12:00:00 +0000</li>
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

export default function DateFormatterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DateFormatterContent />
    </Suspense>
  )
}
