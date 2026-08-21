'use client'

import {
  Calculator,
  Calendar,
  DollarSign,
  Percent,
  PiggyBank,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { parseAsFloat, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { CURRENCIES } from '@/lib/tools/currency/currency'
import { css } from '@/styled-system/css'

interface PaymentScheduleItem {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

interface LoanComparison {
  id: string
  name: string
  principal: number
  rate: number
  years: number
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  currency: string
}

function LoanCalculatorContent() {
  const [principal, setPrincipal] = useQueryState('principal', parseAsFloat.withDefault(300000))
  const [rate, setRate] = useQueryState('rate', parseAsFloat.withDefault(4.5))
  const [years, setYears] = useQueryState('years', parseAsInteger.withDefault(30))
  const [extraPayment, setExtraPayment] = useQueryState('extra', parseAsFloat.withDefault(0))
  const [currency, setCurrency] = useQueryState('currency', parseAsString.withDefault('IDR'))

  const [comparisons, setComparisons] = useState<LoanComparison[]>([])
  const [showSchedule, setShowSchedule] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('loan_calculator_open', {})
  }, [])

  // Calculate monthly payment using standard mortgage formula
  const calculateMonthlyPayment = useCallback((p: number, r: number, n: number): number => {
    if (r === 0) return p / n
    const monthlyRate = r / 100 / 12
    const numPayments = n * 12
    return (
      (p * monthlyRate * (1 + monthlyRate) ** numPayments) / ((1 + monthlyRate) ** numPayments - 1)
    )
  }, [])

  // Main loan calculations
  const loanData = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    const numPayments = years * 12
    const monthlyPayment = calculateMonthlyPayment(principal, rate, years)
    const totalPayment = monthlyPayment * numPayments
    const totalInterest = totalPayment - principal

    // Calculate with extra payments
    let extraBalance = principal
    let extraTotalPaid = 0
    let extraMonths = 0

    while (extraBalance > 0 && extraMonths < numPayments * 2) {
      const interestPayment = extraBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment + extraPayment
      extraBalance -= principalPayment
      extraTotalPaid += monthlyPayment + extraPayment
      extraMonths++

      if (extraBalance < 0) {
        extraTotalPaid += extraBalance
        extraBalance = 0
      }
    }

    const extraTotalInterest = extraTotalPaid - principal
    const savedInterest = totalInterest - extraTotalInterest
    const savedMonths = numPayments - extraMonths

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      principalPercent: (principal / totalPayment) * 100,
      interestPercent: (totalInterest / totalPayment) * 100,
      withExtra:
        extraPayment > 0
          ? {
              totalPaid: extraTotalPaid,
              totalInterest: extraTotalInterest,
              monthsSaved: savedMonths,
              interestSaved: savedInterest,
              payoffYears: Math.floor(extraMonths / 12),
              payoffMonths: extraMonths % 12,
            }
          : null,
    }
  }, [principal, rate, years, extraPayment, calculateMonthlyPayment])

  // Generate amortization schedule
  const schedule = useMemo((): PaymentScheduleItem[] => {
    const monthlyRate = rate / 100 / 12
    const monthlyPayment = loanData.monthlyPayment
    let balance = principal
    const items: PaymentScheduleItem[] = []

    for (let month = 1; month <= years * 12; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      if (balance < 0) balance = 0

      items.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      })

      if (balance === 0) break
    }

    return items
  }, [principal, rate, years, loanData.monthlyPayment])

  // Group schedule by year for display
  const scheduleByYear = useMemo(() => {
    const grouped: { [year: number]: PaymentScheduleItem[] } = {}
    schedule.forEach((item) => {
      const year = Math.ceil(item.month / 12)
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(item)
    })
    return grouped
  }, [schedule])

  const handleAddComparison = () => {
    const newComparison: LoanComparison = {
      id: Date.now().toString(),
      name: `Loan ${comparisons.length + 1}`,
      principal,
      rate,
      years,
      monthlyPayment: loanData.monthlyPayment,
      totalInterest: loanData.totalInterest,
      totalCost: loanData.totalPayment,
      currency,
    }
    setComparisons([...comparisons, newComparison])
    trackToolEvent('loan_calculator_add_comparison', {
      principal,
      rate,
      years,
    })
  }

  const handleRemoveComparison = (id: string) => {
    setComparisons(comparisons.filter((c) => c.id !== id))
    trackToolEvent('loan_calculator_remove_comparison', {})
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
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
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'emerald.500/30',
            bg: 'emerald.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Calculator className={css({ h: '5', w: '5', color: 'emerald.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'emerald.300' })}>
            Mortgage & Loan Calculator
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'emerald.400',
            gradientVia: 'green.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Loan Calculator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Calculate monthly payments, view amortization schedules, and compare different loan
          scenarios. Perfect for mortgages, auto loans, and personal loans.
        </p>
      </div>

      {/* Calculator Inputs */}
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
            borderColor: 'emerald.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>Enter your loan information to calculate payments</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                gap: '6',
              })}
            >
              {/* Currency Selection */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="currency"
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <DollarSign className={css({ h: '4', w: '4', color: 'emerald.400' })} />
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value)
                    trackToolEvent('loan_calculator_currency_change', { currency: e.target.value })
                  }}
                  className={css({
                    h: '12',
                    w: 'full',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'lg',
                    color: 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    _focus: {
                      outline: 'none',
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                  })}
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Amount */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="principal"
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <DollarSign className={css({ h: '4', w: '4', color: 'emerald.400' })} />
                  Loan Amount
                </label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => {
                    setPrincipal(Number(e.target.value))
                    trackToolEvent('loan_calculator_calculate', { field: 'principal' })
                  }}
                  placeholder="300000"
                  className={css({
                    h: '12',
                    fontSize: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: {
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                  })}
                />
              </div>

              {/* Interest Rate */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="rate"
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Percent className={css({ h: '4', w: '4', color: 'emerald.400' })} />
                  Annual Interest Rate (%)
                </label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => {
                    setRate(Number(e.target.value))
                    trackToolEvent('loan_calculator_calculate', { field: 'rate' })
                  }}
                  placeholder="4.5"
                  className={css({
                    h: '12',
                    fontSize: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: {
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                  })}
                />
              </div>

              {/* Loan Term */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="years"
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Calendar className={css({ h: '4', w: '4', color: 'emerald.400' })} />
                  Loan Term (Years)
                </label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => {
                    setYears(Number(e.target.value))
                    trackToolEvent('loan_calculator_calculate', { field: 'years' })
                  }}
                  placeholder="30"
                  className={css({
                    h: '12',
                    fontSize: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: {
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                  })}
                />
              </div>

              {/* Extra Payment */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="extra"
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Plus className={css({ h: '4', w: '4', color: 'emerald.400' })} />
                  Extra Monthly Payment (Optional)
                </label>
                <Input
                  id="extra"
                  type="number"
                  value={extraPayment}
                  onChange={(e) => {
                    setExtraPayment(Number(e.target.value))
                    trackToolEvent('loan_calculator_extra_payment', {
                      amount: Number(e.target.value),
                    })
                  }}
                  placeholder="0"
                  className={css({
                    h: '12',
                    fontSize: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: {
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.2s',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: '4',
          })}
        >
          {/* Monthly Payment */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'emerald.500/30',
              bg: 'emerald.500/10',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ spaceY: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Calculator className={css({ h: '5', w: '5', color: 'emerald.400' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>Monthly Payment</span>
                </div>
                <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'emerald.300' })}>
                  {formatCurrency(loanData.monthlyPayment)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Interest */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/30',
              bg: 'orange.500/10',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ spaceY: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Percent className={css({ h: '5', w: '5', color: 'orange.400' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>Total Interest</span>
                </div>
                <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'orange.300' })}>
                  {formatCurrency(loanData.totalInterest)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/30',
              bg: 'blue.500/10',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ spaceY: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <TrendingUp className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>Total Cost</span>
                </div>
                <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.300' })}>
                  {formatCurrency(loanData.totalPayment)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Principal/Interest Split */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/30',
              bg: 'purple.500/10',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
              <div className={css({ spaceY: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <PiggyBank className={css({ h: '5', w: '5', color: 'purple.400' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    Principal / Interest
                  </span>
                </div>
                <p className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'purple.300' })}>
                  {loanData.principalPercent.toFixed(1)}% / {loanData.interestPercent.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extra Payment Benefits */}
      {loanData.withExtra && (
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
              borderColor: 'green.500/20',
              bg: 'green.500/5',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ color: 'green.300' })}>Extra Payment Benefits</CardTitle>
              <CardDescription>
                See how much you can save with extra monthly payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: '4',
                })}
              >
                <div className={css({ spaceY: '1' })}>
                  <span className={css({ fontSize: 'sm', color: 'white' })}>Interest Saved</span>
                  <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.300' })}>
                    {formatCurrency(loanData.withExtra.interestSaved)}
                  </p>
                </div>
                <div className={css({ spaceY: '1' })}>
                  <span className={css({ fontSize: 'sm', color: 'white' })}>Time Saved</span>
                  <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.300' })}>
                    {loanData.withExtra.monthsSaved} months
                  </p>
                </div>
                <div className={css({ spaceY: '1' })}>
                  <span className={css({ fontSize: 'sm', color: 'white' })}>New Payoff Time</span>
                  <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.300' })}>
                    {loanData.withExtra.payoffYears}y {loanData.withExtra.payoffMonths}m
                  </p>
                </div>
                <div className={css({ spaceY: '1' })}>
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    New Total Interest
                  </span>
                  <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.300' })}>
                    {formatCurrency(loanData.withExtra.totalInterest)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amortization Schedule */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.4s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '3',
              })}
            >
              <div>
                <CardTitle>Amortization Schedule</CardTitle>
                <CardDescription>Detailed payment breakdown by year</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setShowSchedule(!showSchedule)
                  trackToolEvent('loan_calculator_toggle_schedule', { show: !showSchedule })
                }}
                className={css({
                  gap: '2',
                  bg: 'emerald.500/20',
                  color: 'emerald.300',
                  _hover: { bg: 'emerald.500/30' },
                })}
              >
                {showSchedule ? 'Hide' : 'Show'} Schedule
              </Button>
            </div>
          </CardHeader>
          {showSchedule && (
            <CardContent>
              <div className={css({ spaceY: '4', maxH: '600px', overflowY: 'auto' })}>
                {Object.entries(scheduleByYear).map(([year, items]) => {
                  const yearTotal = items.reduce((sum, item) => sum + item.payment, 0)
                  const yearPrincipal = items.reduce((sum, item) => sum + item.principal, 0)
                  const yearInterest = items.reduce((sum, item) => sum + item.interest, 0)
                  const endBalance = items[items.length - 1].balance

                  return (
                    <div
                      key={year}
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: '3',
                        })}
                      >
                        <h3
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'semibold',
                            color: 'emerald.300',
                          })}
                        >
                          Year {year}
                        </h3>
                        <Badge
                          className={css({
                            bg: 'emerald.500/20',
                            color: 'emerald.300',
                            border: '1px solid',
                            borderColor: 'emerald.500/30',
                          })}
                        >
                          {items.length} payments
                        </Badge>
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: {
                            base: 'repeat(2, minmax(0, 1fr))',
                            sm: 'repeat(4, 1fr)',
                          },
                          gap: '4',
                          fontSize: 'sm',
                        })}
                      >
                        <div>
                          <span className={css({ color: 'white' })}>Total Paid</span>
                          <p className={css({ fontWeight: 'semibold', color: 'gray.200' })}>
                            {formatCurrency(yearTotal)}
                          </p>
                        </div>
                        <div>
                          <span className={css({ color: 'white' })}>Principal</span>
                          <p className={css({ fontWeight: 'semibold', color: 'emerald.300' })}>
                            {formatCurrency(yearPrincipal)}
                          </p>
                        </div>
                        <div>
                          <span className={css({ color: 'white' })}>Interest</span>
                          <p className={css({ fontWeight: 'semibold', color: 'orange.300' })}>
                            {formatCurrency(yearInterest)}
                          </p>
                        </div>
                        <div>
                          <span className={css({ color: 'white' })}>End Balance</span>
                          <p className={css({ fontWeight: 'semibold', color: 'blue.300' })}>
                            {formatCurrency(endBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Loan Comparison */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.5s',
          opacity: 0,
        })}
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
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <div>
                <CardTitle>Compare Loans</CardTitle>
                <CardDescription>Add current loan to comparison list</CardDescription>
              </div>
              <Button
                onClick={handleAddComparison}
                className={css({
                  gap: '2',
                  bg: 'blue.500/20',
                  color: 'blue.300',
                  _hover: { bg: 'blue.500/30' },
                })}
              >
                <Plus className={css({ h: '4', w: '4' })} />
                Add to Compare
              </Button>
            </div>
          </CardHeader>
          {comparisons.length > 0 && (
            <CardContent>
              <div className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: {
                      base: '1fr',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    },
                    gap: '4',
                  })}
                >
                  {comparisons.map((loan) => (
                    <div
                      key={loan.id}
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        spaceY: '3',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        })}
                      >
                        <h4
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'semibold',
                            color: 'blue.300',
                          })}
                        >
                          {loan.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveComparison(loan.id)}
                          className={css({
                            color: 'white',
                            _hover: { color: 'red.400' },
                            bg: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'sm',
                          })}
                        >
                          Remove
                        </button>
                      </div>
                      <div className={css({ spaceY: '2', fontSize: 'sm' })}>
                        <div
                          className={css({
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: '1',
                          })}
                        >
                          <span className={css({ color: 'white' })}>Loan Amount:</span>
                          <span className={css({ color: 'gray.200' })}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: loan.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(loan.principal)}
                          </span>
                        </div>
                        <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                          <span className={css({ color: 'white' })}>Rate:</span>
                          <span className={css({ color: 'gray.200' })}>{loan.rate}%</span>
                        </div>
                        <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                          <span className={css({ color: 'white' })}>Term:</span>
                          <span className={css({ color: 'gray.200' })}>{loan.years} years</span>
                        </div>
                        <div className={css({ h: 'px', bg: 'gray.700', my: '2' })} />
                        <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                          <span className={css({ color: 'white' })}>Monthly Payment:</span>
                          <span className={css({ fontWeight: 'bold', color: 'emerald.300' })}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: loan.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(loan.monthlyPayment)}
                          </span>
                        </div>
                        <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                          <span className={css({ color: 'white' })}>Total Interest:</span>
                          <span className={css({ fontWeight: 'bold', color: 'orange.300' })}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: loan.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(loan.totalInterest)}
                          </span>
                        </div>
                        <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                          <span className={css({ color: 'white' })}>Total Cost:</span>
                          <span className={css({ fontWeight: 'bold', color: 'blue.300' })}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: loan.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(loan.totalCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function LoanCalculatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoanCalculatorContent />
    </Suspense>
  )
}
