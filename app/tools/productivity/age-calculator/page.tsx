'use client'

import { motion } from 'framer-motion'
import { Cake, Calendar, Clock, Copy, Heart, Info, RotateCcw, Sparkles } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface AgeCalculation {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  totalMonths: number
  totalHours: number
  totalMinutes: number
  daysUntilNextBirthday: number
  nextBirthday: Date
  zodiacSign: string
  lifeMilestones: string[]
}

function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒'
  return 'Pisces ♓'
}

function getLifeMilestones(years: number): string[] {
  const milestones: string[] = []
  if (years >= 13 && years < 20) milestones.push('Teenager')
  if (years >= 18) milestones.push('Legal Adult')
  if (years >= 21) milestones.push('21+ (US)')
  if (years >= 30) milestones.push('30s Club')
  if (years >= 40) milestones.push('40s Club')
  if (years >= 50) milestones.push('Golden 50s')
  if (years >= 60) milestones.push('Senior')
  if (years >= 65) milestones.push('Retirement Age')
  if (years >= 100) milestones.push('Centenarian! 🎉')
  return milestones
}

function calculateAge(birthdate: string): AgeCalculation | null {
  if (!birthdate) return null

  const birth = new Date(birthdate)
  const today = new Date()

  // Validate date
  if (Number.isNaN(birth.getTime()) || birth > today) return null

  // Calculate exact age
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()

  // Adjust for negative days
  if (days < 0) {
    months--
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += lastMonth.getDate()
  }

  // Adjust for negative months
  if (months < 0) {
    years--
    months += 12
  }

  // Calculate next birthday
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  }

  // Calculate days until next birthday
  const diffTime = nextBirthday.getTime() - today.getTime()
  const daysUntilNextBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Calculate total units
  const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)
  const totalMonths = years * 12 + months
  const totalHours = totalDays * 24
  const totalMinutes = totalHours * 60

  // Get zodiac sign
  const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate())

  // Get life milestones
  const lifeMilestones = getLifeMilestones(years)

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    daysUntilNextBirthday,
    nextBirthday,
    zodiacSign,
    lifeMilestones,
  }
}

function AgeCalculatorContent() {
  // URL state for persistence
  const [birthdate, setBirthdate] = useQueryState('birthdate', parseAsString.withDefault(''))

  // Track page visit
  useEffect(() => {
    trackToolEvent('age_calculator_open', {})
  }, [])

  // Calculate age
  const calculation = useMemo<AgeCalculation | null>(() => {
    if (!birthdate) return null
    const result = calculateAge(birthdate)
    if (result) {
      trackToolEvent('age_calculator_calculate', {
        birthdate,
        years: result.years,
      })
    }
    return result
  }, [birthdate])

  const handleClear = () => {
    setBirthdate('')
    trackToolEvent('age_calculator_clear', {})
    toast.success('Cleared!')
  }

  const handleCopyAge = () => {
    if (!calculation) return
    const text = `I am ${calculation.years} years, ${calculation.months} months, and ${calculation.days} days old!`
    navigator.clipboard.writeText(text)
    trackToolEvent('age_calculator_copy', { type: 'exact_age' })
    toast.success('Age copied to clipboard!')
  }

  const handleCopySummary = () => {
    if (!calculation) return
    const summary = `
Age Summary
=================
Exact Age: ${calculation.years} years, ${calculation.months} months, ${calculation.days} days
Total Days: ${calculation.totalDays.toLocaleString()}
Total Weeks: ${calculation.totalWeeks.toLocaleString()}
Total Months: ${calculation.totalMonths}
Total Hours: ${calculation.totalHours.toLocaleString()}
Total Minutes: ${calculation.totalMinutes.toLocaleString()}
Next Birthday: In ${calculation.daysUntilNextBirthday} days
Zodiac Sign: ${calculation.zodiacSign}
    `.trim()
    navigator.clipboard.writeText(summary)
    trackToolEvent('age_calculator_copy', { type: 'summary' })
    toast.success('Summary copied to clipboard!')
  }

  return (
    <main
      className={css({
        maxW: '7xl',
        mx: 'auto',
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
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'pink.500/30',
            bg: 'pink.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Cake className={css({ h: '5', w: '5', color: 'pink.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'pink.300' })}>
            Exact Age • Next Birthday • Life Events
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'pink.400',
            gradientVia: 'rose.400',
            gradientTo: 'red.400',
            bgClip: 'text',
          })}
          style={{ WebkitTextFillColor: 'transparent' }}
        >
          Age Calculator
        </h1>

        <p
          className={css({
            maxW: '3xl',
            mx: 'auto',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Calculate your exact age from birthdate with precision. See how old you are in years,
          months, days, hours, and even minutes. Find out when your next birthday is!
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'pink.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Birthdate</CardTitle>
            <CardDescription>Enter your birthdate to calculate your age</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ maxW: 'md' })}>
              <Input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={css({
                  h: '14',
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: {
                    borderColor: 'pink.500',
                    ring: '2px',
                    ringColor: 'pink.500/20',
                  },
                })}
                aria-label="Select your birthdate"
              />
            </div>

            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleClear}
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  borderColor: 'gray.700',
                  color: 'gray.300',
                  _hover: { borderColor: 'gray.600', bg: 'gray.800' },
                })}
              >
                <RotateCcw className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {calculation && (
        <>
          {/* Exact Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/30',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ fontSize: 'lg' })}>Exact Age</CardTitle>
                <CardDescription>Your precise age calculated from your birthdate</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    p: '6',
                    borderRadius: 'lg',
                    bg: 'pink.500/10',
                    border: '1px solid',
                    borderColor: 'pink.500/30',
                  })}
                >
                  <Cake className={css({ h: '8', w: '8', color: 'pink.400' })} />
                  <div>
                    <div
                      className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'pink.300' })}
                    >
                      {calculation.years} years, {calculation.months} months, {calculation.days}{' '}
                      days
                    </div>
                    <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                      Born on{' '}
                      {new Date(birthdate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCopyAge}
                  variant="outline"
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    w: 'full',
                    borderColor: 'pink.500/50',
                    color: 'pink.300',
                    _hover: { bg: 'pink.500/10', borderColor: 'pink.500/70' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy Age
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Birthday */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'rose.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={css({
                    fontSize: 'lg',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Calendar className={css({ h: '5', w: '5' })} />
                  Next Birthday
                </CardTitle>
                <CardDescription>Countdown to your next birthday celebration</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4',
                    p: '5',
                    borderRadius: 'lg',
                    bg: 'rose.500/10',
                    border: '1px solid',
                    borderColor: 'rose.500/30',
                  })}
                >
                  <Sparkles className={css({ h: '8', w: '8', color: 'rose.400' })} />
                  <div>
                    <div
                      className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'rose.300' })}
                    >
                      {calculation.daysUntilNextBirthday} days left
                    </div>
                    <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                      {calculation.nextBirthday.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Multiple Units */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={css({
                    fontSize: 'lg',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Clock className={css({ h: '5', w: '5' })} />
                  Age in Different Units
                </CardTitle>
                <CardDescription>Your age measured in various time units</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1', sm: '2', lg: '3' },
                    gap: '4',
                  })}
                >
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Days</div>
                    <div
                      className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'pink.300',
                        mt: '1',
                      })}
                    >
                      {calculation.totalDays.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Weeks</div>
                    <div
                      className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'pink.300',
                        mt: '1',
                      })}
                    >
                      {calculation.totalWeeks.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Months</div>
                    <div
                      className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'pink.300',
                        mt: '1',
                      })}
                    >
                      {calculation.totalMonths.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Hours</div>
                    <div
                      className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'pink.300',
                        mt: '1',
                      })}
                    >
                      {calculation.totalHours.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Minutes</div>
                    <div
                      className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'pink.300',
                        mt: '1',
                      })}
                    >
                      {calculation.totalMinutes.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: 'pink.500/10',
                      border: '1px solid',
                      borderColor: 'pink.500/30',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Zodiac Sign</div>
                    <div
                      className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'pink.300',
                        mt: '1',
                      })}
                    >
                      {calculation.zodiacSign}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCopySummary}
                  variant="outline"
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    w: 'full',
                    mt: '4',
                    borderColor: 'pink.500/50',
                    color: 'pink.300',
                    _hover: { bg: 'pink.500/10', borderColor: 'pink.500/70' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy Full Summary
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Life Milestones */}
          {calculation.lifeMilestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'pink.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle
                    className={css({
                      fontSize: 'lg',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                    })}
                  >
                    <Heart className={css({ h: '5', w: '5' })} />
                    Life Milestones
                  </CardTitle>
                  <CardDescription>Important life events you've reached</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                    {calculation.lifeMilestones.map((milestone) => (
                      <div
                        key={milestone}
                        className={css({
                          px: '4',
                          py: '2',
                          borderRadius: 'full',
                          bg: 'pink.500/10',
                          border: '1px solid',
                          borderColor: 'pink.500/30',
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'pink.300',
                        })}
                      >
                        {milestone}
                      </div>
                    ))}
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
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.700',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ pt: '6' })}>
            <div className={css({ display: 'flex', gap: '4' })}>
              <Info
                className={css({ h: '5', w: '5', color: 'gray.400', flexShrink: '0', mt: '1' })}
              />
              <div className={css({ spaceY: '3' })}>
                <h3
                  className={css({
                    fontSize: 'md',
                    fontWeight: 'semibold',
                    color: 'fg.default',
                  })}
                >
                  How Age Calculation Works
                </h3>
                <div className={css({ fontSize: 'sm', color: 'gray.400', spaceY: '2' })}>
                  <p>
                    Your age is calculated by comparing your birthdate with today's date. The
                    calculator accounts for leap years and varying month lengths to give you an
                    exact age.
                  </p>
                  <ul className={css({ pl: '5', spaceY: '1', listStyleType: 'disc' })}>
                    <li>Years, months, and days are calculated precisely</li>
                    <li>Zodiac sign is determined from birth month and day</li>
                    <li>Next birthday countdown updates daily</li>
                    <li>All calculations are performed in your local timezone</li>
                  </ul>
                </div>
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

export default function AgeCalculatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgeCalculatorContent />
    </Suspense>
  )
}
