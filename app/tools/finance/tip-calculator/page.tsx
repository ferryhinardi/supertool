'use client'

import { motion } from 'framer-motion'
import { Copy, DollarSign, Info, RotateCcw, Sparkles, TrendingUp, Users } from 'lucide-react'
import { parseAsFloat, parseAsInteger, useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

const TIP_PRESETS = [10, 15, 18, 20, 25]
const ROUNDING_OPTIONS = ['none', 'up', 'down'] as const
type RoundingOption = (typeof ROUNDING_OPTIONS)[number]

interface TipCalculation {
  billAmount: number
  tipPercentage: number
  tipAmount: number
  totalWithTip: number
  perPersonBeforeTip: number
  perPersonTip: number
  perPersonTotal: number
  roundedTotal?: number
  roundedPerPerson?: number
}

function TipCalculatorContent() {
  // URL state for persistence
  const [billAmount, setBillAmount] = useQueryState('bill', parseAsFloat.withDefault(0))
  const [tipPercentage, setTipPercentage] = useQueryState('tip', parseAsFloat.withDefault(15))
  const [numberOfPeople, setNumberOfPeople] = useQueryState('people', parseAsInteger.withDefault(1))
  const [customTip, setCustomTip] = useState('')
  const [roundingOption, setRoundingOption] = useState<RoundingOption>('none')

  // Track page visit
  useEffect(() => {
    trackToolEvent('tip_calculator_open', {})
  }, [])

  // Calculate all tip values
  const calculation = useMemo<TipCalculation | null>(() => {
    if (billAmount <= 0 || numberOfPeople < 1) return null

    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount
    const perPersonBeforeTip = billAmount / numberOfPeople
    const perPersonTip = tipAmount / numberOfPeople
    const perPersonTotal = totalWithTip / numberOfPeople

    let roundedTotal: number | undefined
    let roundedPerPerson: number | undefined

    if (roundingOption === 'up') {
      roundedTotal = Math.ceil(totalWithTip)
      roundedPerPerson = Math.ceil(perPersonTotal)
    } else if (roundingOption === 'down') {
      roundedTotal = Math.floor(totalWithTip)
      roundedPerPerson = Math.floor(perPersonTotal)
    }

    return {
      billAmount,
      tipPercentage,
      tipAmount,
      totalWithTip,
      perPersonBeforeTip,
      perPersonTip,
      perPersonTotal,
      roundedTotal,
      roundedPerPerson,
    }
  }, [billAmount, tipPercentage, numberOfPeople, roundingOption])

  const handlePresetClick = (percent: number) => {
    setTipPercentage(percent)
    setCustomTip('')
    trackToolEvent('tip_calculator_preset', { percentage: percent })
  }

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value)
    const parsed = Number.parseFloat(value)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setTipPercentage(parsed)
    }
  }

  const handleClear = () => {
    setBillAmount(0)
    setTipPercentage(15)
    setNumberOfPeople(1)
    setCustomTip('')
    setRoundingOption('none')
    trackToolEvent('tip_calculator_clear', {})
    toast.success('Cleared all fields')
  }

  const handleCopySummary = () => {
    if (!calculation) return

    const summary = `
Tip Calculation Summary
━━━━━━━━━━━━━━━━━━━━━
Bill Amount: $${calculation.billAmount.toFixed(2)}
Tip (${calculation.tipPercentage}%): $${calculation.tipAmount.toFixed(2)}
Total: $${(calculation.roundedTotal ?? calculation.totalWithTip).toFixed(2)}
${numberOfPeople > 1 ? `\nSplit Between ${numberOfPeople} People:\nPer Person: $${(calculation.roundedPerPerson ?? calculation.perPersonTotal).toFixed(2)}` : ''}
		`.trim()

    navigator.clipboard.writeText(summary)
    toast.success('Summary copied to clipboard!')
    trackToolEvent('tip_calculator_copy', {
      billAmount: calculation.billAmount,
      tipPercentage: calculation.tipPercentage,
      numberOfPeople,
    })
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
            borderColor: 'green.500/30',
            bg: 'green.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <DollarSign className={css({ h: '5', w: '5', color: 'green.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'green.300',
            })}
          >
            Quick Presets • Split Bill • Round Total
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'green.400',
            gradientVia: 'teal.400',
            gradientTo: 'cyan.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tip Calculator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Calculate tips quickly with preset percentages or custom amounts. Split bills among
          multiple people and round totals for convenience.
        </p>
      </motion.div>

      {/* Bill Amount Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Bill Amount</CardTitle>
            <CardDescription>Enter the total bill amount before tip</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ position: 'relative', maxW: 'md' })}>
              <span
                className={css({
                  position: 'absolute',
                  left: '4',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '2xl',
                  fontWeight: 'semibold',
                  color: 'gray.500',
                })}
              >
                $
              </span>
              <Input
                type="text"
                inputMode="decimal"
                value={billAmount || ''}
                onChange={(e) => {
                  const value = e.target.value
                  const parsed = Number.parseFloat(value)
                  setBillAmount(Number.isNaN(parsed) ? 0 : parsed)
                }}
                placeholder="0.00"
                className={css({
                  h: '16',
                  pl: '10',
                  pr: '4',
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: {
                    borderColor: 'green.500',
                    ring: '2px',
                    ringColor: 'green.500/20',
                  },
                })}
                aria-label="Bill amount in dollars"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tip Percentage Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
            <CardTitle>Tip Percentage</CardTitle>
            <CardDescription>Select a preset or enter a custom percentage</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Preset Buttons */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: 'repeat(3, 1fr)',
                  sm: 'repeat(5, 1fr)',
                },
                gap: '3',
                w: 'full',
              })}
            >
              {TIP_PRESETS.map((percent) => {
                const isActive = tipPercentage === percent && !customTip
                return (
                  <Button
                    key={percent}
                    onClick={() => handlePresetClick(percent)}
                    className={css({
                      h: '16',
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      bg: isActive ? 'green.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: isActive ? 'green.500/50' : 'gray.700/50',
                      color: isActive ? 'green.300' : 'gray.400',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: isActive ? 'green.500/30' : 'gray.800',
                        borderColor: isActive ? 'green.500/70' : 'gray.600',
                        transform: 'translateY(-2px)',
                      },
                    })}
                    aria-label={`${percent} percent tip`}
                  >
                    {percent}%
                  </Button>
                )
              })}
            </div>

            {/* Custom Tip Input */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="custom-tip"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Custom Percentage
              </label>
              <div className={css({ position: 'relative', maxW: 'xs' })}>
                <Input
                  id="custom-tip"
                  type="text"
                  inputMode="decimal"
                  value={customTip}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  placeholder="Enter custom %"
                  className={css({
                    h: '12',
                    pr: '10',
                    fontSize: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: {
                      borderColor: 'green.500',
                      ring: '2px',
                      ringColor: 'green.500/20',
                    },
                  })}
                  aria-label="Custom tip percentage"
                />
                <span
                  className={css({
                    position: 'absolute',
                    right: '4',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.500',
                  })}
                >
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Split Bill & Rounding Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
            <CardTitle>Split Bill & Rounding</CardTitle>
            <CardDescription>Divide the bill and optionally round the total</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Number of People */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="num-people"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Number of People
              </label>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <Button
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 1}
                  className={css({
                    h: '12',
                    w: '12',
                    fontSize: 'xl',
                    bg: 'gray.800',
                    _hover: { bg: 'gray.700' },
                  })}
                  aria-label="Decrease number of people"
                >
                  -
                </Button>
                <Input
                  id="num-people"
                  type="text"
                  inputMode="numeric"
                  value={numberOfPeople}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10)
                    if (!Number.isNaN(value) && value >= 1) {
                      setNumberOfPeople(value)
                    }
                  }}
                  className={css({
                    h: '12',
                    textAlign: 'center',
                    fontSize: 'xl',
                    fontWeight: 'bold',
                    bg: 'gray.800/50',
                    maxW: '32',
                  })}
                  aria-label="Number of people"
                />
                <Button
                  onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                  className={css({
                    h: '12',
                    w: '12',
                    fontSize: 'xl',
                    bg: 'gray.800',
                    _hover: { bg: 'gray.700' },
                  })}
                  aria-label="Increase number of people"
                >
                  +
                </Button>
                <Users
                  className={css({
                    h: '6',
                    w: '6',
                    color: 'teal.400',
                    ml: '2',
                  })}
                />
              </div>
            </div>

            {/* Rounding Options */}
            <div className={css({ spaceY: '2' })}>
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Round Total
              </div>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '3',
                })}
              >
                {ROUNDING_OPTIONS.map((option) => {
                  const isActive = roundingOption === option
                  const labels = {
                    none: 'No Rounding',
                    up: 'Round Up',
                    down: 'Round Down',
                  }
                  return (
                    <Button
                      key={option}
                      onClick={() => setRoundingOption(option)}
                      className={css({
                        h: '12',
                        bg: isActive ? 'teal.500/20' : 'gray.800/50',
                        border: '1px solid',
                        borderColor: isActive ? 'teal.500/50' : 'gray.700/50',
                        color: isActive ? 'teal.300' : 'gray.400',
                        transition: 'all 0.2s',
                        _hover: {
                          bg: isActive ? 'teal.500/30' : 'gray.800',
                          borderColor: isActive ? 'teal.500/70' : 'gray.600',
                        },
                      })}
                      aria-label={labels[option]}
                    >
                      {labels[option]}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {calculation && billAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/30',
              bg: 'green.500/10',
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
                  gap: '3',
                })}
              >
                <div>
                  <CardTitle>Total Summary</CardTitle>
                  <CardDescription>Your tip calculation breakdown</CardDescription>
                </div>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={handleCopySummary}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'green.500/20',
                      color: 'green.300',
                      _hover: { bg: 'green.500/30' },
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                    Copy Summary
                  </Button>
                  <Button
                    onClick={handleClear}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700' },
                    })}
                  >
                    <RotateCcw className={css({ h: '4', w: '4' })} />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Main Total Display */}
              <div
                className={css({
                  rounded: 'xl',
                  border: '2px solid',
                  borderColor: 'green.500/40',
                  bg: 'green.500/15',
                  p: '6',
                  textAlign: 'center',
                })}
              >
                <div
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'green.300',
                    mb: '2',
                  })}
                >
                  Total with Tip
                </div>
                <div
                  className={css({
                    fontSize: { base: '4xl', sm: '5xl' },
                    fontWeight: 'bold',
                    color: 'green.300',
                    mb: '2',
                  })}
                >
                  ${(calculation.roundedTotal ?? calculation.totalWithTip).toFixed(2)}
                </div>
                {calculation.roundedTotal && (
                  <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                    Original: ${calculation.totalWithTip.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Breakdown Grid */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '4',
                })}
              >
                {/* Bill Amount */}
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'green.500/20',
                    bg: 'green.500/5',
                    p: '4',
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.400',
                      mb: '1',
                    })}
                  >
                    Bill Amount
                  </div>
                  <div
                    className={css({
                      fontSize: '2xl',
                      fontWeight: 'bold',
                      color: 'gray.200',
                    })}
                  >
                    ${calculation.billAmount.toFixed(2)}
                  </div>
                </div>

                {/* Tip Amount */}
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'green.500/20',
                    bg: 'green.500/5',
                    p: '4',
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.400',
                      mb: '1',
                    })}
                  >
                    Tip ({calculation.tipPercentage}%)
                  </div>
                  <div
                    className={css({
                      fontSize: '2xl',
                      fontWeight: 'bold',
                      color: 'gray.200',
                    })}
                  >
                    ${calculation.tipAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Per Person Breakdown */}
              {numberOfPeople > 1 && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'teal.500/30',
                    bg: 'teal.500/10',
                    p: '5',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      mb: '4',
                    })}
                  >
                    <Users className={css({ h: '5', w: '5', color: 'teal.400' })} />
                    <span
                      className={css({
                        fontSize: 'lg',
                        fontWeight: 'semibold',
                        color: 'teal.300',
                      })}
                    >
                      Split Between {numberOfPeople} People
                    </span>
                  </div>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                      gap: '4',
                    })}
                  >
                    <div>
                      <div
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.500',
                          mb: '1',
                        })}
                      >
                        Per Person Bill
                      </div>
                      <div
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'bold',
                          color: 'gray.300',
                        })}
                      >
                        ${calculation.perPersonBeforeTip.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.500',
                          mb: '1',
                        })}
                      >
                        Per Person Tip
                      </div>
                      <div
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'bold',
                          color: 'gray.300',
                        })}
                      >
                        ${calculation.perPersonTip.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.500',
                          mb: '1',
                        })}
                      >
                        Per Person Total
                      </div>
                      <div
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'bold',
                          color: 'teal.300',
                        })}
                      >
                        ${(calculation.roundedPerPerson ?? calculation.perPersonTotal).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formula */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'green.500/20',
                  bg: 'green.500/5',
                  p: '4',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    mb: '2',
                  })}
                >
                  <TrendingUp className={css({ h: '4', w: '4', color: 'green.400' })} />
                  <span
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'green.300',
                    })}
                  >
                    Calculation
                  </span>
                </div>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    fontFamily: 'mono',
                  })}
                >
                  Bill: ${calculation.billAmount.toFixed(2)} + Tip: $
                  {calculation.tipAmount.toFixed(2)} ({calculation.tipPercentage}
                  %) = Total: ${(calculation.roundedTotal ?? calculation.totalWithTip).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
            gap: '6',
            w: 'full',
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'cyan.500/20',
              bg: 'cyan.500/5',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                <Sparkles
                  className={css({
                    h: '6',
                    w: '6',
                    color: 'cyan.400',
                    flexShrink: '0',
                  })}
                />
                <div className={css({ spaceY: '2' })}>
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'cyan.300',
                    })}
                  >
                    Quick Tips
                  </h3>
                  <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                    <li>• 15-20% is standard for good service</li>
                    <li>• Use presets for quick calculations</li>
                    <li>• Round up for easier cash payments</li>
                    <li>• Split evenly among your group</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={css({
              border: '1px solid',
              borderColor: 'emerald.500/20',
              bg: 'emerald.500/5',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                <Info
                  className={css({
                    h: '6',
                    w: '6',
                    color: 'emerald.400',
                    flexShrink: '0',
                  })}
                />
                <div className={css({ spaceY: '2' })}>
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'emerald.300',
                    })}
                  >
                    Tipping Guidelines
                  </h3>
                  <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                    <li>• Excellent service: 20-25%</li>
                    <li>• Good service: 15-20%</li>
                    <li>• Adequate service: 10-15%</li>
                    <li>• Counter service: 10-15%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
      <ToolSearch />
    </main>
  )
}

export default function TipCalculatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TipCalculatorContent />
    </Suspense>
  )
}
