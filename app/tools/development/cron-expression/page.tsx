'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Copy, Download, Info, Sparkles, Star, Zap } from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  buildCronExpression,
  COMMON_PATTERNS,
  type CronField,
  type CronPattern,
  describeCronExpression,
  exportCronExpression,
  formatExecutionDate,
  getNextExecutions,
  getPatternCategories,
  getPatternsByCategory,
  parseCronExpression,
  validateCronExpression,
} from './utils'

function CronExpressionContent() {
  const [expression, setExpression] = useState('0 9 * * 1-5')
  const [fields, setFields] = useState<CronField>(() => parseCronExpression('0 9 * * 1-5'))
  const [selectedCategory, setSelectedCategory] = useState<string>('common')
  const [exportPlatform, setExportPlatform] = useState<
    'crontab' | 'kubernetes' | 'aws' | 'github' | 'gitlab'
  >('crontab')

  // Track page visit
  useEffect(() => {
    trackToolEvent('cron_expression_open', {})
  }, [])

  // Validate and update expression
  const validation = useMemo(() => validateCronExpression(expression), [expression])

  // Get human-readable description
  const description = useMemo(() => describeCronExpression(expression), [expression])

  // Get next execution times
  const nextExecutions = useMemo(() => {
    if (!validation.isValid) return []
    return getNextExecutions(expression, 10)
  }, [expression, validation.isValid])

  // Handle manual expression input
  const handleExpressionChange = (value: string) => {
    setExpression(value)
    const newFields = parseCronExpression(value)
    setFields(newFields)
    trackToolEvent('cron_expression_manual_edit', {})
  }

  // Handle field updates from visual builder
  const handleFieldChange = (field: keyof CronField, value: string) => {
    const newFields = { ...fields, [field]: value }
    setFields(newFields)
    const newExpression = buildCronExpression(newFields)
    setExpression(newExpression)
    trackToolEvent('cron_expression_field_change', { field })
  }

  // Handle pattern selection
  const handlePatternSelect = (pattern: CronPattern) => {
    setExpression(pattern.expression)
    setFields(parseCronExpression(pattern.expression))
    toast.success(`Loaded: ${pattern.name}`)
    trackToolEvent('cron_expression_pattern_select', { pattern: pattern.name })
  }

  // Copy expression to clipboard
  const handleCopyExpression = async () => {
    try {
      await navigator.clipboard.writeText(expression)
      toast.success('Copied to clipboard!')
      trackToolEvent('cron_expression_copy', {})
    } catch (_error) {
      toast.error('Failed to copy')
    }
  }

  // Copy export to clipboard
  const handleCopyExport = async () => {
    try {
      const exported = exportCronExpression(expression, exportPlatform)
      await navigator.clipboard.writeText(exported)
      toast.success(`Copied ${exportPlatform} config!`)
      trackToolEvent('cron_expression_export', { platform: exportPlatform })
    } catch (_error) {
      toast.error('Failed to copy')
    }
  }

  const categories = getPatternCategories()

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
            borderColor: 'teal.500/30',
            bg: 'teal.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Calendar className={css({ h: '5', w: '5', color: 'teal.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'teal.300' })}>
            Visual Builder • 18 Common Patterns
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'teal.400',
            gradientVia: 'green.400',
            gradientTo: 'emerald.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Cron Expression Builder
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Build and validate cron schedules visually. Generate expressions, preview execution times,
          and export for multiple platforms.
        </p>
      </motion.div>

      {/* Expression Input & Validation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: validation.isValid ? 'teal.500/20' : 'red.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Cron Expression</CardTitle>
            <CardDescription>Enter or build your cron schedule expression</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ display: 'flex', gap: '3', w: 'full' })}>
              <Input
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                placeholder="* * * * *"
                className={css({
                  flex: '1',
                  fontFamily: 'mono',
                  fontSize: 'lg',
                  h: '14',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: validation.isValid ? 'teal.500/50' : 'red.500/50',
                  _focus: {
                    borderColor: validation.isValid ? 'teal.500' : 'red.500',
                    ring: '2px',
                    ringColor: validation.isValid ? 'teal.500/20' : 'red.500/20',
                  },
                })}
              />
              <Button
                onClick={handleCopyExpression}
                disabled={!validation.isValid}
                className={css({
                  gap: '2',
                  bg: 'teal.500/20',
                  border: '1px solid',
                  borderColor: 'teal.500/50',
                  color: 'teal.300',
                  _hover: { bg: 'teal.500/30' },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                <Copy className={css({ h: '5', w: '5' })} />
                Copy
              </Button>
            </div>

            {/* Validation Status */}
            {validation.isValid ? (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  rounded: 'lg',
                  bg: 'teal.500/10',
                  border: '1px solid',
                  borderColor: 'teal.500/30',
                  p: '4',
                })}
              >
                <Zap className={css({ h: '5', w: '5', color: 'teal.400' })} />
                <div className={css({ flex: '1' })}>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'teal.300' })}>
                    {description}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  rounded: 'lg',
                  bg: 'red.500/10',
                  border: '1px solid',
                  borderColor: 'red.500/30',
                  p: '4',
                })}
              >
                <Info className={css({ h: '5', w: '5', color: 'red.400' })} />
                <p className={css({ fontSize: 'sm', color: 'red.300' })}>
                  {validation.error || 'Invalid expression'}
                </p>
              </div>
            )}

            {/* Field Labels */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '3',
                pt: '2',
              })}
            >
              {['Minute', 'Hour', 'Day', 'Month', 'Weekday'].map((label) => (
                <div key={label} className={css({ textAlign: 'center' })}>
                  <span
                    className={css({ fontSize: 'xs', color: 'gray.500', fontWeight: 'medium' })}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Visual Builder</CardTitle>
            <CardDescription>Configure each field of your cron expression</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
                gap: '3',
                w: 'full',
              })}
            >
              {/* Minute */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="minute"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Minute
                </label>
                <Input
                  id="minute"
                  value={fields.minute}
                  onChange={(e) => handleFieldChange('minute', e.target.value)}
                  placeholder="*"
                  className={css({
                    fontFamily: 'mono',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'teal.500', ring: '2px', ringColor: 'teal.500/20' },
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>0-59</p>
              </div>

              {/* Hour */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="hour"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Hour
                </label>
                <Input
                  id="hour"
                  value={fields.hour}
                  onChange={(e) => handleFieldChange('hour', e.target.value)}
                  placeholder="*"
                  className={css({
                    fontFamily: 'mono',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'teal.500', ring: '2px', ringColor: 'teal.500/20' },
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>0-23</p>
              </div>

              {/* Day of Month */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="dayOfMonth"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Day
                </label>
                <Input
                  id="dayOfMonth"
                  value={fields.dayOfMonth}
                  onChange={(e) => handleFieldChange('dayOfMonth', e.target.value)}
                  placeholder="*"
                  className={css({
                    fontFamily: 'mono',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'teal.500', ring: '2px', ringColor: 'teal.500/20' },
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>1-31</p>
              </div>

              {/* Month */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="month"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Month
                </label>
                <Input
                  id="month"
                  value={fields.month}
                  onChange={(e) => handleFieldChange('month', e.target.value)}
                  placeholder="*"
                  className={css({
                    fontFamily: 'mono',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'teal.500', ring: '2px', ringColor: 'teal.500/20' },
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>1-12</p>
              </div>

              {/* Day of Week */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="dayOfWeek"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Weekday
                </label>
                <Input
                  id="dayOfWeek"
                  value={fields.dayOfWeek}
                  onChange={(e) => handleFieldChange('dayOfWeek', e.target.value)}
                  placeholder="*"
                  className={css({
                    fontFamily: 'mono',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'teal.500', ring: '2px', ringColor: 'teal.500/20' },
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>0-6</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Common Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Star className={css({ h: '5', w: '5', color: 'green.400' })} fill="currentColor" />
              <CardTitle>Common Patterns</CardTitle>
              <Badge
                className={css({
                  bg: 'green.500/20',
                  color: 'green.300',
                  border: '1px solid',
                  borderColor: 'green.500/30',
                })}
              >
                {COMMON_PATTERNS.length}
              </Badge>
            </div>
            <CardDescription>Select from pre-configured cron schedules</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Category Tabs */}
            <div
              className={css({
                display: 'flex',
                gap: '2',
                flexWrap: 'wrap',
              })}
            >
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                  className={css({
                    textTransform: 'capitalize',
                    bg: selectedCategory === cat ? 'green.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'green.500/50' : 'gray.700/50',
                    color: selectedCategory === cat ? 'green.300' : 'gray.400',
                    _hover: { bg: selectedCategory === cat ? 'green.500/30' : 'gray.800' },
                  })}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Pattern Grid */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                gap: '3',
                w: 'full',
              })}
            >
              {getPatternsByCategory(selectedCategory).map((pattern) => (
                <button
                  key={pattern.name}
                  type="button"
                  onClick={() => handlePatternSelect(pattern)}
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    gap: '2',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    w: 'full',
                    _hover: {
                      bg: 'gray.800',
                      borderColor: 'green.500/50',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <div
                    className={css({ display: 'flex', alignItems: 'center', gap: '2', w: 'full' })}
                  >
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {pattern.name}
                    </span>
                  </div>
                  <code
                    className={css({
                      fontSize: 'xs',
                      fontFamily: 'mono',
                      color: 'green.400',
                      bg: 'green.500/10',
                      px: '2',
                      py: '1',
                      rounded: 'md',
                    })}
                  >
                    {pattern.expression}
                  </code>
                  <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                    {pattern.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Executions */}
      {validation.isValid && nextExecutions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Clock className={css({ h: '5', w: '5', color: 'blue.400' })} />
                <CardTitle>Next 10 Executions</CardTitle>
              </div>
              <CardDescription>Preview when this cron job will run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'grid', gap: '2' })}>
                {nextExecutions.map((date, index) => (
                  <div
                    key={date.toISOString()}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3',
                      rounded: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      p: '3',
                    })}
                  >
                    <Badge
                      className={css({
                        bg: 'blue.500/20',
                        color: 'blue.300',
                        border: '1px solid',
                        borderColor: 'blue.500/30',
                        minW: '8',
                        justifyContent: 'center',
                      })}
                    >
                      {index + 1}
                    </Badge>
                    <span
                      className={css({ fontFamily: 'mono', fontSize: 'sm', color: 'gray.300' })}
                    >
                      {formatExecutionDate(date)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Export Options */}
      {validation.isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
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
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Download className={css({ h: '5', w: '5', color: 'purple.400' })} />
                <CardTitle>Export Configuration</CardTitle>
              </div>
              <CardDescription>Generate platform-specific configuration</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  display: 'flex',
                  gap: '3',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                })}
              >
                <label
                  htmlFor="platform"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Platform:
                </label>
                <select
                  id="platform"
                  value={exportPlatform}
                  onChange={(e) => setExportPlatform(e.target.value as typeof exportPlatform)}
                  className={css({
                    flex: '1',
                    minW: '48',
                    h: '10',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    color: 'gray.200',
                    cursor: 'pointer',
                    _hover: { bg: 'gray.800' },
                    _focus: {
                      outline: 'none',
                      borderColor: 'purple.500',
                      ring: '2px',
                      ringColor: 'purple.500/20',
                    },
                  })}
                >
                  <option value="crontab">Crontab</option>
                  <option value="kubernetes">Kubernetes CronJob</option>
                  <option value="aws">AWS CloudWatch/EventBridge</option>
                  <option value="github">GitHub Actions</option>
                  <option value="gitlab">GitLab CI/CD</option>
                </select>
                <Button
                  onClick={handleCopyExport}
                  className={css({
                    gap: '2',
                    bg: 'purple.500/20',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    _hover: { bg: 'purple.500/30' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy Config
                </Button>
              </div>

              {/* Preview Export */}
              <div
                className={css({
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  p: '4',
                  maxH: '80',
                  overflowY: 'auto',
                })}
              >
                <pre
                  className={css({
                    fontFamily: 'mono',
                    fontSize: 'xs',
                    color: 'gray.300',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  })}
                >
                  {exportCronExpression(expression, exportPlatform)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
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
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Cron Syntax Guide
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Use * for any value (every minute, hour, day, etc.)</li>
                  <li>• Use */N for intervals (*/5 = every 5 units)</li>
                  <li>• Use ranges with - (1-5 = Monday through Friday)</li>
                  <li>• Use lists with , (1,3,5 = Monday, Wednesday, Friday)</li>
                  <li>• Combine operators for complex schedules</li>
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

export default function CronExpressionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CronExpressionContent />
    </Suspense>
  )
}
