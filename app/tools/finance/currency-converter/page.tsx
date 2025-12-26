'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  ArrowRight,
  Coins,
  Info,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { CURRENCIES, formatCurrency } from '@/lib/tools/currency/currency'
import { css } from '@/styled-system/css'

interface ExchangeRates {
  [key: string]: number
}

interface Favorite {
  id: string
  fromCurrency: string
  toCurrency: string
  name?: string
}

function CurrencyConverterContent() {
  const [fromCurrency, setFromCurrency] = useQueryState('from', parseAsString.withDefault('USD'))
  const [toCurrency, setToCurrency] = useQueryState('to', parseAsString.withDefault('IDR'))
  const [fromValue, setFromValue] = useQueryState('amount', parseAsString.withDefault('100'))

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    // Lazy initialization - only runs once on mount (client-side safe)
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem('currencyConverterFavorites')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        return []
      }
    }
    return []
  })

  // Save favorites to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (favorites.length > 0) {
        localStorage.setItem('currencyConverterFavorites', JSON.stringify(favorites))
      } else {
        localStorage.removeItem('currencyConverterFavorites')
      }
    }
  }, [favorites])

  // Track page visit
  useEffect(() => {
    trackToolEvent('currency_converter_open', {})
  }, [])

  // Fetch exchange rates
  const fetchExchangeRates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/exchange-rates')

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      const data = await response.json()
      setExchangeRates(data.rates)
      setLastUpdated(new Date())

      trackToolEvent('currency_converter_rates_loaded', {
        currencies_count: Object.keys(data.rates).length,
      })
    } catch (err) {
      console.error('Error fetching rates:', err)
      setError('Failed to load exchange rates. Please try again.')
      toast.error('Failed to load exchange rates')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchExchangeRates()
  }, [fetchExchangeRates])

  // Convert currency
  const convertedAmount = useMemo(() => {
    const amount = Number.parseFloat(fromValue)
    if (Number.isNaN(amount) || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return null
    }

    // Convert from -> USD -> to
    const usdAmount = amount / exchangeRates[fromCurrency]
    const result = usdAmount * exchangeRates[toCurrency]

    return result
  }, [fromValue, fromCurrency, toCurrency, exchangeRates])

  // Get exchange rate
  const exchangeRate = useMemo(() => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return null
    }

    const usdAmount = 1 / exchangeRates[fromCurrency]
    return usdAmount * exchangeRates[toCurrency]
  }, [fromCurrency, toCurrency, exchangeRates])

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    if (convertedAmount !== null) {
      setFromValue(convertedAmount.toString())
    }

    trackToolEvent('currency_converter_swap', {
      from: fromCurrency,
      to: toCurrency,
    })
  }

  const handleAddFavorite = () => {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
    }

    setFavorites([...favorites, newFavorite])
    toast.success('Added to favorites! ⭐')

    trackToolEvent('currency_converter_favorite_add', {
      from: fromCurrency,
      to: toCurrency,
    })
  }

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id))
    toast.success('Removed from favorites')

    trackToolEvent('currency_converter_favorite_remove', {})
  }

  const handleLoadFavorite = (favorite: Favorite) => {
    setFromCurrency(favorite.fromCurrency)
    setToCurrency(favorite.toCurrency)
    toast.success('Loaded favorite conversion')

    trackToolEvent('currency_converter_favorite_load', {
      from: favorite.fromCurrency,
      to: favorite.toCurrency,
    })
  }

  const isFavorite = useMemo(() => {
    return favorites.some((f) => f.fromCurrency === fromCurrency && f.toCurrency === toCurrency)
  }, [favorites, fromCurrency, toCurrency])

  const fromCurrencyInfo = CURRENCIES.find((c) => c.code === fromCurrency)
  const toCurrencyInfo = CURRENCIES.find((c) => c.code === toCurrency)

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
            borderColor: 'emerald.500/30',
            bg: 'emerald.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Coins className={css({ h: '5', w: '5', color: 'emerald.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'emerald.300' })}>
            {Object.keys(exchangeRates).length || 150}+ Currencies • Real-time Rates
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
          Currency Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Convert between 150+ world currencies with real-time exchange rates. Fast, accurate, and
          free to use.
        </p>
      </motion.div>

      {/* Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '3',
              })}
            >
              <div>
                <CardTitle>Convert Currency</CardTitle>
                {lastUpdated && (
                  <CardDescription>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </CardDescription>
                )}
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Button
                  onClick={fetchExchangeRates}
                  size="sm"
                  disabled={loading}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'white',
                    _hover: { bg: 'gray.700', color: 'emerald.400' },
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                >
                  <RefreshCw
                    className={css({
                      h: '4',
                      w: '4',
                      animation: loading ? 'spin 1s linear infinite' : 'none',
                    })}
                  />
                  Refresh Rates
                </Button>
                {!isFavorite && (
                  <Button
                    onClick={handleAddFavorite}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'white',
                      _hover: { bg: 'gray.700', color: 'yellow.400' },
                    })}
                  >
                    <Star className={css({ h: '4', w: '4' })} />
                    Favorite
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {error && (
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'red.500/50',
                  bg: 'red.500/10',
                  p: '4',
                  fontSize: 'sm',
                  color: 'red.300',
                })}
              >
                {error}
              </div>
            )}

            {/* From Currency */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="from-value"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
              >
                From
              </label>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3' })}>
                <Input
                  id="from-value"
                  type="text"
                  inputMode="decimal"
                  value={fromValue}
                  onChange={(e) => {
                    setFromValue(e.target.value)
                    trackToolEvent('currency_converter_convert', {
                      from: fromCurrency,
                      to: toCurrency,
                    })
                  }}
                  placeholder="Enter amount"
                  disabled={loading}
                  className={css({
                    h: '14',
                    fontSize: 'xl',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: {
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  disabled={loading}
                  className={css({
                    h: '14',
                    minW: '40',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
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
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              {fromCurrencyInfo && (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Info className={css({ h: '4', w: '4', color: 'white' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    {fromCurrencyInfo.name} ({fromCurrencyInfo.symbol})
                  </span>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className={css({ display: 'flex', justifyContent: 'center' })}>
              <Button
                onClick={handleSwapCurrencies}
                disabled={loading}
                className={css({
                  gap: '2',
                  rounded: 'full',
                  bg: 'emerald.500/20',
                  border: '1px solid',
                  borderColor: 'emerald.500/50',
                  color: 'emerald.300',
                  _hover: {
                    bg: 'emerald.500/30',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s',
                  },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                <ArrowLeftRight className={css({ h: '5', w: '5' })} />
                Swap
              </Button>
            </div>

            {/* To Currency */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="to-value"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
              >
                To
              </label>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3' })}>
                <Input
                  id="to-value"
                  type="text"
                  readOnly
                  value={
                    convertedAmount !== null
                      ? formatCurrency(convertedAmount, toCurrency)
                      : loading
                        ? 'Loading...'
                        : ''
                  }
                  placeholder="Result"
                  className={css({
                    h: '14',
                    fontSize: 'xl',
                    fontWeight: 'bold',
                    bg: 'emerald.500/10',
                    border: '1px solid',
                    borderColor: 'emerald.500/30',
                    color: 'emerald.300',
                    cursor: 'default',
                  })}
                />
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  disabled={loading}
                  className={css({
                    h: '14',
                    minW: '40',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
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
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              {toCurrencyInfo && (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Info className={css({ h: '4', w: '4', color: 'white' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    {toCurrencyInfo.name} ({toCurrencyInfo.symbol})
                  </span>
                </div>
              )}
            </div>

            {/* Exchange Rate Info */}
            {exchangeRate !== null && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'emerald.500/20',
                  bg: 'emerald.500/5',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <TrendingUp className={css({ h: '4', w: '4', color: 'emerald.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'emerald.300' })}
                  >
                    Exchange Rate
                  </span>
                </div>
                <p className={css({ fontSize: 'sm', color: 'white' })}>
                  1 {fromCurrencyInfo?.code} = {exchangeRate.toFixed(6)} {toCurrencyInfo?.code}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'yellow.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Star
                  className={css({ h: '5', w: '5', color: 'yellow.400' })}
                  fill="currentColor"
                />
                <CardTitle>Favorite Conversions</CardTitle>
                <Badge
                  className={css({
                    bg: 'yellow.500/20',
                    color: 'yellow.300',
                    border: '1px solid',
                    borderColor: 'yellow.500/30',
                  })}
                >
                  {favorites.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'grid', gap: '3' })}>
                {favorites.map((favorite) => {
                  const fromInfo = CURRENCIES.find((c) => c.code === favorite.fromCurrency)
                  const toInfo = CURRENCIES.find((c) => c.code === favorite.toCurrency)

                  return (
                    <div
                      key={favorite.id}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        transition: 'all 0.2s',
                        w: 'full',
                        _hover: { bg: 'gray.800', borderColor: 'emerald.500/50' },
                      })}
                    >
                      <button
                        type="button"
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          flex: '1',
                          bg: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          p: '0',
                        })}
                        onClick={() => handleLoadFavorite(favorite)}
                      >
                        <span
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'white',
                          })}
                        >
                          {fromInfo?.code}
                        </span>
                        <ArrowRight className={css({ h: '4', w: '4', color: 'white' })} />
                        <span
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'white',
                          })}
                        >
                          {toInfo?.code}
                        </span>
                        <span className={css({ fontSize: 'xs', color: 'white' })}>
                          {fromInfo?.name} to {toInfo?.name}
                        </span>
                      </button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFavorite(favorite.id)
                        }}
                        size="sm"
                        className={css({
                          gap: '2',
                          bg: 'transparent',
                          color: 'white',
                          _hover: { bg: 'red.500/20', color: 'red.400' },
                        })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                  <li>• Exchange rates are updated in real-time for accuracy</li>
                  <li>• Save frequently used currency pairs as favorites</li>
                  <li>• Use the swap button to quickly reverse conversions</li>
                  <li>• Rates are sourced from reliable financial data providers</li>
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

export default function CurrencyConverterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CurrencyConverterContent />
    </Suspense>
  )
}
