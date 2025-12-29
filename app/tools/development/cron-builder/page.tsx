'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Calendar, Check, Clock, Copy, Download, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { CRON_PRESETS, PRESET_CATEGORIES } from './presets'
import {
  type CronConfig,
  type CronPlatform,
  DAY_OF_MONTH_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  MONTH_OPTIONS,
  PLATFORM_INFO,
} from './types'
import {
  generateCronExpression,
  getHumanReadable,
  getNextExecutions,
  validateCronExpression,
} from './utils'

export default function CronBuilderPage() {
  useTrackToolView({
    toolId: 'cron-builder',
    title: 'Cron Expression Builder',
    href: '/tools/development/cron-builder',
    iconName: 'Clock',
    gradient: 'from-blue-500 to-cyan-500',
  })

  // State
  const [platform, setPlatform] = useState<CronPlatform>('unix')
  const [cronConfig, setCronConfig] = useState<CronConfig>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  })
  const [customValues, setCustomValues] = useState({
    minute: '',
    hour: '',
    dayOfMonth: '',
    month: '',
    dayOfWeek: '',
    seconds: '',
  })
  const [copied, setCopied] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Generate cron expression
  const cronExpression = generateCronExpression(cronConfig, platform)
  const validation = validateCronExpression(cronExpression, platform)
  const humanReadable = validation.isValid
    ? getHumanReadable(cronExpression, platform)
    : 'Invalid expression'
  const nextExecutions = validation.isValid ? getNextExecutions(cronExpression, platform, 10) : []

  // Handlers
  const handlePresetSelect = (presetName: string) => {
    const preset = CRON_PRESETS.find((p) => p.name === presetName)
    if (preset) {
      setCronConfig(preset.config)
      setSelectedPreset(presetName)
      trackToolEvent('cron_builder_preset')
    }
  }

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatform(e.target.value as CronPlatform)
    trackToolEvent('cron_builder_platform')
  }

  const handleFieldChange = (field: keyof CronConfig, value: string) => {
    if (value === 'custom') {
      return
    }
    setCronConfig((prev) => ({ ...prev, [field]: value }))
    setSelectedPreset('')
  }

  const handleCustomValueChange = (field: keyof CronConfig, value: string) => {
    setCustomValues((prev) => ({ ...prev, [field]: value }))
    setCronConfig((prev) => ({ ...prev, [field]: value }))
    setSelectedPreset('')
  }

  const handleCopyExpression = async () => {
    try {
      await navigator.clipboard.writeText(cronExpression)
      setCopied(true)
      toast.success('Cron expression copied to clipboard!')
      trackToolEvent('cron_builder_copy')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    const content = `Cron Expression: ${cronExpression}\nPlatform: ${PLATFORM_INFO[platform].name}\nDescription: ${humanReadable}\n\nNext 10 Executions:\n${nextExecutions.map((exec, i) => `${i + 1}. ${exec.formatted}`).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cron-expression.txt'
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Cron expression downloaded!')
    trackToolEvent('cron_builder_download')
  }

  const handleReset = () => {
    setCronConfig({
      minute: '*',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    })
    setSelectedPreset('')
    setCustomValues({
      minute: '',
      hour: '',
      dayOfMonth: '',
      month: '',
      dayOfWeek: '',
      seconds: '',
    })
    toast.success('Reset to default')
    trackToolEvent('cron_builder_reset')
  }

  // Filter presets by category
  const filteredPresets =
    filterCategory === 'all'
      ? CRON_PRESETS
      : CRON_PRESETS.filter((p) => p.category === filterCategory)

  return (
    <div
      className={css({
        minH: '100vh',
        bg: 'gray.950',
        color: 'gray.50',
      })}
    >
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
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3',
            })}
          >
            <Clock className={css({ w: '10', h: '10', color: 'blue.500' })} />
            <h1
              className={css({
                fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
                fontWeight: 'bold',
                bgGradient: 'to-r',
                gradientFrom: 'blue.400',
                gradientTo: 'cyan.400',
                bgClip: 'text',
              })}
            >
              Cron Expression Builder
            </h1>
          </div>
          <p
            className={css({
              fontSize: { base: 'lg', md: 'xl' },
              color: 'gray.400',
              maxW: '3xl',
              mx: 'auto',
            })}
          >
            Generate cron expressions visually with human-readable explanations and
            platform-specific syntax. Preview next execution times and validate expressions.
          </p>
        </motion.div>

        {/* Main Content */}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
            gap: '6',
            w: 'full',
          })}
        >
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className={css({
                bg: 'gray.900/50',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'gray.800',
                h: 'full',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Settings2 className={css({ w: '5', h: '5' })} />
                  Settings
                </CardTitle>
                <CardDescription>Configure your cron expression</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '6' })}>
                {/* Platform Selector */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="platform-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Platform
                  </label>
                  <select
                    id="platform-select"
                    value={platform}
                    onChange={handlePlatformChange}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    {Object.entries(PLATFORM_INFO).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.name}
                      </option>
                    ))}
                  </select>
                  <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                    {PLATFORM_INFO[platform].description}
                  </p>
                </div>

                {/* Preset Category Filter */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="category-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Preset Category
                  </label>
                  <select
                    id="category-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    <option value="all">All Presets</option>
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Presets */}
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Quick Presets
                  </div>
                  <div
                    className={css({
                      display: 'grid',
                      gap: '2',
                      maxH: '96',
                      overflowY: 'auto',
                    })}
                  >
                    {filteredPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant={selectedPreset === preset.name ? 'default' : 'outline'}
                        className={css({ w: 'full', justifyContent: 'start', textAlign: 'left' })}
                        onClick={() => handlePresetSelect(preset.name)}
                      >
                        <div className={css({ spaceY: '1' })}>
                          <div className={css({ fontWeight: 'medium' })}>{preset.name}</div>
                          <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                            {preset.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button variant="outline" onClick={handleReset} className={css({ flex: '1' })}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Panel - Visual Builder + Output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={css({ gridColumn: { base: 'span 1', lg: 'span 2' }, spaceY: '6' })}
          >
            {/* Visual Builder */}
            <Card
              className={css({
                bg: 'gray.900/50',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'gray.800',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Calendar className={css({ w: '5', h: '5' })} />
                  Visual Schedule Builder
                </CardTitle>
                <CardDescription>Build your cron expression using dropdowns</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* Minute */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="minute-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Minute
                  </label>
                  <select
                    id="minute-select"
                    value={cronConfig.minute}
                    onChange={(e) => handleFieldChange('minute', e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    {MINUTE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {cronConfig.minute === 'custom' && (
                    <Input
                      placeholder="e.g., 0-59, */5, 0,15,30,45"
                      value={customValues.minute}
                      onChange={(e) => handleCustomValueChange('minute', e.target.value)}
                    />
                  )}
                </div>

                {/* Hour */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="hour-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Hour
                  </label>
                  <select
                    id="hour-select"
                    value={cronConfig.hour}
                    onChange={(e) => handleFieldChange('hour', e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    {HOUR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {cronConfig.hour === 'custom' && (
                    <Input
                      placeholder="e.g., 0-23, */2, 9-17"
                      value={customValues.hour}
                      onChange={(e) => handleCustomValueChange('hour', e.target.value)}
                    />
                  )}
                </div>

                {/* Day of Month */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="day-month-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Day of Month
                  </label>
                  <select
                    id="day-month-select"
                    value={cronConfig.dayOfMonth}
                    onChange={(e) => handleFieldChange('dayOfMonth', e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    {DAY_OF_MONTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {cronConfig.dayOfMonth === 'custom' && (
                    <Input
                      placeholder="e.g., 1-31, */2, 1,15"
                      value={customValues.dayOfMonth}
                      onChange={(e) => handleCustomValueChange('dayOfMonth', e.target.value)}
                    />
                  )}
                </div>

                {/* Month */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="month-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Month
                  </label>
                  <select
                    id="month-select"
                    value={cronConfig.month}
                    onChange={(e) => handleFieldChange('month', e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    {MONTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {cronConfig.month === 'custom' && (
                    <Input
                      placeholder="e.g., 1-12, */3, 1,4,7,10"
                      value={customValues.month}
                      onChange={(e) => handleCustomValueChange('month', e.target.value)}
                    />
                  )}
                </div>

                {/* Day of Week */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="day-week-select"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Day of Week
                  </label>
                  <select
                    id="day-week-select"
                    value={cronConfig.dayOfWeek}
                    onChange={(e) => handleFieldChange('dayOfWeek', e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      bg: 'gray.950',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      borderRadius: 'md',
                      color: 'gray.100',
                      fontSize: 'sm',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'gray.600' },
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    {DAY_OF_WEEK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {cronConfig.dayOfWeek === 'custom' && (
                    <Input
                      placeholder="e.g., 0-6, 1-5, 1,3,5"
                      value={customValues.dayOfWeek}
                      onChange={(e) => handleCustomValueChange('dayOfWeek', e.target.value)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card
              className={css({
                bg: 'gray.900/50',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: validation.isValid ? 'gray.800' : 'red.800',
              })}
            >
              <CardHeader>
                <CardTitle>Generated Expression</CardTitle>
                <CardDescription>{PLATFORM_INFO[platform].format}</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* Cron Expression Display */}
                <div
                  className={css({
                    p: '4',
                    bg: 'gray.950',
                    borderRadius: 'lg',
                    border: '1px solid',
                    borderColor: validation.isValid ? 'gray.700' : 'red.700',
                    fontFamily: 'mono',
                    fontSize: 'lg',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '2',
                    flexWrap: 'wrap',
                  })}
                >
                  <code
                    className={css({
                      flex: '1',
                      color: validation.isValid ? 'blue.400' : 'red.400',
                      wordBreak: 'break-all',
                    })}
                  >
                    {cronExpression}
                  </code>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button size="sm" variant="ghost" onClick={handleCopyExpression}>
                      {copied ? (
                        <Check className={css({ w: '4', h: '4' })} />
                      ) : (
                        <Copy className={css({ w: '4', h: '4' })} />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleDownload}>
                      <Download className={css({ w: '4', h: '4' })} />
                    </Button>
                  </div>
                </div>

                {/* Validation Status */}
                {!validation.isValid && (
                  <div
                    className={css({
                      p: '3',
                      bg: 'red.950/50',
                      border: '1px solid',
                      borderColor: 'red.800',
                      borderRadius: 'md',
                      display: 'flex',
                      gap: '2',
                    })}
                  >
                    <AlertCircle
                      className={css({ w: '5', h: '5', color: 'red.500', flexShrink: '0' })}
                    />
                    <p className={css({ fontSize: 'sm', color: 'red.400' })}>{validation.error}</p>
                  </div>
                )}

                {validation.warning && (
                  <div
                    className={css({
                      p: '3',
                      bg: 'yellow.950/50',
                      border: '1px solid',
                      borderColor: 'yellow.800',
                      borderRadius: 'md',
                      display: 'flex',
                      gap: '2',
                    })}
                  >
                    <AlertCircle
                      className={css({ w: '5', h: '5', color: 'yellow.500', flexShrink: '0' })}
                    />
                    <p className={css({ fontSize: 'sm', color: 'yellow.400' })}>
                      {validation.warning}
                    </p>
                  </div>
                )}

                {/* Human Readable Description */}
                {validation.isValid && (
                  <div
                    className={css({
                      p: '4',
                      bg: 'blue.950/20',
                      border: '1px solid',
                      borderColor: 'blue.800',
                      borderRadius: 'md',
                    })}
                  >
                    <p className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                      Human-readable:
                    </p>
                    <p className={css({ fontSize: 'base', color: 'blue.300' })}>{humanReadable}</p>
                  </div>
                )}

                {/* Next Executions */}
                {validation.isValid && nextExecutions.length > 0 && (
                  <div>
                    <h3
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                        mb: '2',
                      })}
                    >
                      Next 10 Executions
                    </h3>
                    <div
                      className={css({
                        spaceY: '2',
                        maxH: '64',
                        overflowY: 'auto',
                      })}
                    >
                      {nextExecutions.map((exec) => (
                        <div
                          key={exec.date.getTime()}
                          className={css({
                            p: '3',
                            bg: 'gray.950/50',
                            border: '1px solid',
                            borderColor: 'gray.800',
                            borderRadius: 'md',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '2',
                            flexWrap: 'wrap',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                            {exec.formatted}
                          </span>
                          <Badge variant="secondary">{exec.relative}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
