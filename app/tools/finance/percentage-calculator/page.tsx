'use client'

import { motion } from 'framer-motion'
import { Calculator, Copy, Info, Percent, RotateCcw, Sparkles, TrendingUp } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type CalculationMode =
  | 'percent-of'
  | 'is-what-percent'
  | 'is-percent-of-what'
  | 'percent-change'
  | 'discount'
  | 'tip'
  | 'tax'

interface ModeConfig {
  name: string
  description: string
  inputs: { id: string; label: string; placeholder: string; suffix?: string }[]
  calculate: (values: string[]) => { result: string; formula: string } | null
}

const modes: Record<CalculationMode, ModeConfig> = {
  'percent-of': {
    name: 'What is X% of Y?',
    description: 'Calculate percentage of a number',
    inputs: [
      { id: 'percent-input-1', label: 'Percentage', placeholder: '25', suffix: '%' },
      { id: 'percent-input-2', label: 'Of Number', placeholder: '200' },
    ],
    calculate: ([percent, number]) => {
      const p = Number.parseFloat(percent)
      const n = Number.parseFloat(number)
      if (Number.isNaN(p) || Number.isNaN(n)) return null
      const result = (p / 100) * n
      return {
        result: result.toFixed(2),
        formula: `(${p}% ÷ 100) × ${n} = ${result.toFixed(2)}`,
      }
    },
  },
  'is-what-percent': {
    name: 'X is what % of Y?',
    description: 'Find what percentage one number is of another',
    inputs: [
      { id: 'is-what-percent-input-1', label: 'Number', placeholder: '50' },
      { id: 'is-what-percent-input-2', label: 'Of Number', placeholder: '200' },
    ],
    calculate: ([number, total]) => {
      const n = Number.parseFloat(number)
      const t = Number.parseFloat(total)
      if (Number.isNaN(n) || Number.isNaN(t) || t === 0) return null
      const result = (n / t) * 100
      return {
        result: `${result.toFixed(2)}%`,
        formula: `(${n} ÷ ${t}) × 100 = ${result.toFixed(2)}%`,
      }
    },
  },
  'is-percent-of-what': {
    name: 'X is Y% of what?',
    description: 'Find the whole when you know the part and percentage',
    inputs: [
      { id: 'is-percent-of-what-input-1', label: 'Number', placeholder: '50' },
      { id: 'is-percent-of-what-input-2', label: 'Is Percentage', placeholder: '25', suffix: '%' },
    ],
    calculate: ([number, percent]) => {
      const n = Number.parseFloat(number)
      const p = Number.parseFloat(percent)
      if (Number.isNaN(n) || Number.isNaN(p) || p === 0) return null
      const result = (n / p) * 100
      return {
        result: result.toFixed(2),
        formula: `${n} ÷ (${p}% ÷ 100) = ${result.toFixed(2)}`,
      }
    },
  },
  'percent-change': {
    name: 'Percentage Change',
    description: 'Calculate percentage increase or decrease between two numbers',
    inputs: [
      { id: 'percent-change-input-1', label: 'Original Value', placeholder: '100' },
      { id: 'percent-change-input-2', label: 'New Value', placeholder: '150' },
    ],
    calculate: ([original, newValue]) => {
      const o = Number.parseFloat(original)
      const n = Number.parseFloat(newValue)
      if (Number.isNaN(o) || Number.isNaN(n) || o === 0) return null
      const change = ((n - o) / o) * 100
      const isIncrease = change > 0
      return {
        result: `${isIncrease ? '+' : ''}${change.toFixed(2)}%`,
        formula: `((${n} - ${o}) ÷ ${o}) × 100 = ${change.toFixed(2)}% ${isIncrease ? 'increase' : 'decrease'}`,
      }
    },
  },
  discount: {
    name: 'Discount Calculator',
    description: 'Calculate final price after discount',
    inputs: [
      { id: 'discount-input-1', label: 'Original Price', placeholder: '100', suffix: '$' },
      { id: 'discount-input-2', label: 'Discount', placeholder: '20', suffix: '%' },
    ],
    calculate: ([price, discount]) => {
      const p = Number.parseFloat(price)
      const d = Number.parseFloat(discount)
      if (Number.isNaN(p) || Number.isNaN(d)) return null
      const discountAmount = (d / 100) * p
      const result = p - discountAmount
      return {
        result: `$${result.toFixed(2)}`,
        formula: `$${p} - ($${p} × ${d}%) = $${result.toFixed(2)} (saved $${discountAmount.toFixed(2)})`,
      }
    },
  },
  tip: {
    name: 'Tip Calculator',
    description: 'Calculate tip amount and total bill',
    inputs: [
      { id: 'tip-input-1', label: 'Bill Amount', placeholder: '100', suffix: '$' },
      { id: 'tip-input-2', label: 'Tip Percentage', placeholder: '15', suffix: '%' },
    ],
    calculate: ([bill, tipPercent]) => {
      const b = Number.parseFloat(bill)
      const t = Number.parseFloat(tipPercent)
      if (Number.isNaN(b) || Number.isNaN(t)) return null
      const tipAmount = (t / 100) * b
      const total = b + tipAmount
      return {
        result: `$${total.toFixed(2)}`,
        formula: `Bill: $${b} + Tip: $${tipAmount.toFixed(2)} (${t}%) = Total: $${total.toFixed(2)}`,
      }
    },
  },
  tax: {
    name: 'Tax Calculator',
    description: 'Calculate price with tax included',
    inputs: [
      { id: 'tax-input-1', label: 'Price Before Tax', placeholder: '100', suffix: '$' },
      { id: 'tax-input-2', label: 'Tax Rate', placeholder: '8', suffix: '%' },
    ],
    calculate: ([price, taxRate]) => {
      const p = Number.parseFloat(price)
      const t = Number.parseFloat(taxRate)
      if (Number.isNaN(p) || Number.isNaN(t)) return null
      const taxAmount = (t / 100) * p
      const total = p + taxAmount
      return {
        result: `$${total.toFixed(2)}`,
        formula: `Price: $${p} + Tax: $${taxAmount.toFixed(2)} (${t}%) = Total: $${total.toFixed(2)}`,
      }
    },
  },
}

function PercentageCalculatorContent() {
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringEnum<CalculationMode>(Object.keys(modes) as CalculationMode[]).withDefault(
      'percent-of'
    )
  )
  const [input1, setInput1] = useQueryState('input1', { defaultValue: '' })
  const [input2, setInput2] = useQueryState('input2', { defaultValue: '' })
  const [result, setResult] = useState<{ result: string; formula: string } | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('percentage_calculator_open', {})
  }, [])

  // Calculate result whenever inputs change
  useEffect(() => {
    const currentMode = modes[mode]
    if (input1 && input2) {
      const calculationResult = currentMode.calculate([input1, input2])
      setResult(calculationResult)
      if (calculationResult) {
        trackToolEvent('percentage_calculator_calculate', {
          mode,
          input1,
          input2,
        })
      }
    } else {
      setResult(null)
    }
  }, [mode, input1, input2])

  const handleModeChange = (newMode: CalculationMode) => {
    setMode(newMode)
    setInput1('')
    setInput2('')
    setResult(null)
    trackToolEvent('percentage_calculator_mode_change', { mode: newMode })
  }

  const handleClear = () => {
    setInput1('')
    setInput2('')
    setResult(null)
    trackToolEvent('percentage_calculator_clear', { mode })
  }

  const handleCopyResult = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result)
      toast.success('Result copied to clipboard!')
      trackToolEvent('percentage_calculator_copy', { mode, result: result.result })
    }
  }

  const currentMode = modes[mode]
  const modeKeys = Object.keys(modes) as CalculationMode[]

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
            borderColor: 'purple.500/30',
            bg: 'purple.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Percent className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            7 Calculation Modes • Instant Results
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'rose.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Percentage Calculator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Calculate percentages, discounts, tips, tax, and more with instant results. Seven powerful
          calculation modes for all your percentage needs.
        </p>
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Select Calculation Mode</CardTitle>
            <CardDescription>Choose the type of percentage calculation you need</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: '3',
                w: 'full',
              })}
            >
              {modeKeys.map((modeKey) => {
                const isActive = mode === modeKey
                const modeConfig = modes[modeKey]
                return (
                  <Button
                    key={modeKey}
                    onClick={() => handleModeChange(modeKey)}
                    className={css({
                      h: 'auto',
                      flexDirection: 'column',
                      gap: '2',
                      py: '4',
                      px: '4',
                      bg: isActive ? 'purple.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: isActive ? 'purple.500/50' : 'gray.700/50',
                      color: isActive ? 'purple.300' : 'gray.400',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      alignItems: 'flex-start',
                      _hover: {
                        bg: isActive ? 'purple.500/30' : 'gray.800',
                        borderColor: isActive ? 'purple.500/70' : 'gray.600',
                        transform: 'translateY(-2px)',
                      },
                    })}
                  >
                    <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {modeConfig.name}
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {modeConfig.description}
                    </span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <Calculator className={css({ h: '5', w: '5', color: 'purple.400' })} />
              <CardTitle>{currentMode.name}</CardTitle>
            </div>
            <CardDescription>{currentMode.description}</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Input Fields */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                gap: '4',
                w: 'full',
              })}
            >
              {currentMode.inputs.map((inputConfig, index) => (
                <div key={inputConfig.id} className={css({ spaceY: '3' })}>
                  <label
                    htmlFor={inputConfig.id}
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    {inputConfig.label}
                  </label>
                  <div className={css({ position: 'relative' })}>
                    <Input
                      id={inputConfig.id}
                      type="text"
                      inputMode="decimal"
                      value={index === 0 ? input1 : input2}
                      onChange={(e) => {
                        if (index === 0) {
                          setInput1(e.target.value)
                        } else {
                          setInput2(e.target.value)
                        }
                      }}
                      placeholder={inputConfig.placeholder}
                      className={css({
                        h: '14',
                        fontSize: 'xl',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        pr: inputConfig.suffix ? '12' : '4',
                        _focus: {
                          borderColor: 'purple.500',
                          ring: '2px',
                          ringColor: 'purple.500/20',
                        },
                      })}
                    />
                    {inputConfig.suffix && (
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
                        {inputConfig.suffix}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({ spaceY: '4' })}
              >
                <div className={css({ spaceY: '3' })}>
                  <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                    Result
                  </div>
                  <div className={css({ position: 'relative' })}>
                    <div
                      className={css({
                        h: '20',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                        bg: 'purple.500/10',
                        px: '6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: '3xl',
                          fontWeight: 'bold',
                          color: 'purple.300',
                        })}
                      >
                        {result.result}
                      </span>
                      <Button
                        onClick={handleCopyResult}
                        size="sm"
                        className={css({
                          gap: '2',
                          bg: 'purple.500/20',
                          color: 'purple.300',
                          _hover: { bg: 'purple.500/30' },
                        })}
                      >
                        <Copy className={css({ h: '4', w: '4' })} />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Formula */}
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'purple.500/20',
                    bg: 'purple.500/5',
                    p: '4',
                  })}
                >
                  <div
                    className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}
                  >
                    <TrendingUp className={css({ h: '4', w: '4', color: 'purple.400' })} />
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.300' })}
                    >
                      Calculation
                    </span>
                  </div>
                  <p className={css({ fontSize: 'sm', color: 'gray.400', fontFamily: 'mono' })}>
                    {result.formula}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Clear Button */}
            <div className={css({ display: 'flex', justifyContent: 'center', pt: '4' })}>
              <Button
                onClick={handleClear}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'gray.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                <RotateCcw className={css({ h: '4', w: '4' })} />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
              borderColor: 'pink.500/20',
              bg: 'pink.500/5',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                <Sparkles className={css({ h: '6', w: '6', color: 'pink.400', flexShrink: '0' })} />
                <div className={css({ spaceY: '2' })}>
                  <h3
                    className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'pink.300' })}
                  >
                    Pro Tips
                  </h3>
                  <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                    <li>• Switch between modes without losing your data</li>
                    <li>• Copy results with one click</li>
                    <li>• All calculations are instant and work offline</li>
                    <li>• Supports decimal values for precise calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={css({
              border: '1px solid',
              borderColor: 'rose.500/20',
              bg: 'rose.500/5',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                <Info className={css({ h: '6', w: '6', color: 'rose.400', flexShrink: '0' })} />
                <div className={css({ spaceY: '2' })}>
                  <h3
                    className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'rose.300' })}
                  >
                    Common Uses
                  </h3>
                  <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                    <li>• Calculate sales discounts and savings</li>
                    <li>• Determine tip amounts at restaurants</li>
                    <li>• Compute sales tax on purchases</li>
                    <li>• Track percentage changes in finances</li>
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

export default function PercentageCalculatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PercentageCalculatorContent />
    </Suspense>
  )
}
