'use client'

import { ArrowRightLeft, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCurrencyConverter } from '@/hooks/tools/useCurrencyConverter'
import {
  formatCurrencyAmount,
  getCurrencyInfo,
  POPULAR_CURRENCIES,
} from '@/lib/tools/currency/currency-converter'
import { css } from '@/styled-system/css'

interface CurrencyConverterProps {
  baseCurrency: string
  targetCurrency: string
  onBaseCurrencyChange: (currency: string) => void
  onTargetCurrencyChange: (currency: string) => void
  amounts?: Array<{ label: string; value: number }>
  compact?: boolean
}

const EMPTY_AMOUNTS: Array<{ label: string; value: number }> = []

export function CurrencyConverter({
  baseCurrency,
  targetCurrency,
  onBaseCurrencyChange,
  onTargetCurrencyChange,
  amounts = EMPTY_AMOUNTS,
  compact = false,
}: CurrencyConverterProps) {
  const {
    isLoading,
    error,
    rates: _rates,
    cacheAge,
    isCacheFresh,
    refreshRates,
    getRate,
  } = useCurrencyConverter(baseCurrency)

  const [convertedAmounts, setConvertedAmounts] = useState<Record<string, number>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  const rate = getRate(baseCurrency, targetCurrency)

  // Convert amounts when rate or amounts change
  useEffect(() => {
    if (rate) {
      const converted: Record<string, number> = {}
      for (const amount of amounts) {
        converted[amount.label] = amount.value * rate
      }
      setConvertedAmounts(converted)
    }
  }, [rate, amounts])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshRates(baseCurrency)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSwapCurrencies = () => {
    onBaseCurrencyChange(targetCurrency)
    onTargetCurrencyChange(baseCurrency)
  }

  const baseInfo = getCurrencyInfo(baseCurrency)
  const targetInfo = getCurrencyInfo(targetCurrency)

  const getCacheStatusColor = () => {
    if (!cacheAge) return 'gray.500'
    if (cacheAge < 12) return 'green.500'
    if (cacheAge < 20) return 'yellow.500'
    return 'orange.500'
  }

  if (compact) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          p: '2',
          rounded: 'lg',
          bg: 'gray.800/50',
          border: '1px solid',
          borderColor: 'gray.700',
        })}
      >
        <select
          value={baseCurrency}
          onChange={(e) => onBaseCurrencyChange(e.target.value)}
          className={css({
            px: '2',
            py: '1',
            rounded: 'md',
            bg: 'gray.900',
            border: '1px solid',
            borderColor: 'gray.700',
            color: 'white',
            fontSize: 'sm',
            cursor: 'pointer',
            _focus: { outline: 'none', borderColor: 'blue.500' },
          })}
        >
          {POPULAR_CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.code}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSwapCurrencies}
          className={css({
            p: '1',
            rounded: 'md',
            bg: 'gray.700/50',
            color: 'gray.400',
            transition: 'all 0.2s',
            _hover: { bg: 'blue.500/20', color: 'blue.400' },
          })}
        >
          <ArrowRightLeft className={css({ h: '4', w: '4' })} />
        </button>

        <select
          value={targetCurrency}
          onChange={(e) => onTargetCurrencyChange(e.target.value)}
          className={css({
            px: '2',
            py: '1',
            rounded: 'md',
            bg: 'gray.900',
            border: '1px solid',
            borderColor: 'gray.700',
            color: 'white',
            fontSize: 'sm',
            cursor: 'pointer',
            _focus: { outline: 'none', borderColor: 'blue.500' },
          })}
        >
          {POPULAR_CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.code}
            </option>
          ))}
        </select>

        {rate && (
          <div className={css({ fontSize: 'xs', color: 'gray.500', ml: 'auto' })}>
            1 {baseCurrency} = {rate.toFixed(4)} {targetCurrency}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={css({
        rounded: 'lg',
        border: '1px solid',
        borderColor: 'blue.500/30',
        bg: 'blue.500/5',
        p: '4',
        spaceY: '4',
      })}
    >
      {/* Header */}
      <div
        className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}
      >
        <h3 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'blue.300' })}>
          Currency Conversion
        </h3>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            fontSize: 'xs',
            h: '7',
            px: '2',
          })}
        >
          <RefreshCw
            className={css({
              h: '3',
              w: '3',
              animation: isRefreshing ? 'spin' : 'none',
            })}
          />
          Refresh
        </Button>
      </div>

      {/* Currency Selectors */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '3',
          alignItems: 'center',
        })}
      >
        <div className={css({ spaceY: '2' })}>
          <label
            htmlFor="from-currency"
            className={css({ fontSize: 'xs', color: 'gray.400', fontWeight: 'medium' })}
          >
            From Currency
          </label>
          <select
            id="from-currency"
            value={baseCurrency}
            onChange={(e) => onBaseCurrencyChange(e.target.value)}
            className={css({
              w: 'full',
              px: '3',
              py: '2',
              rounded: 'md',
              bg: 'gray.900',
              border: '1px solid',
              borderColor: 'gray.700',
              color: 'white',
              fontSize: 'sm',
              cursor: 'pointer',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.500/20',
              },
            })}
          >
            {POPULAR_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSwapCurrencies}
          className={css({
            p: '2',
            rounded: 'full',
            bg: 'blue.500/20',
            border: '1px solid',
            borderColor: 'blue.500/30',
            color: 'blue.400',
            transition: 'all 0.2s',
            mt: '6',
            _hover: { bg: 'blue.500/30', transform: 'rotate(180deg)' },
          })}
        >
          <ArrowRightLeft className={css({ h: '4', w: '4' })} />
        </button>

        <div className={css({ spaceY: '2' })}>
          <label
            htmlFor="to-currency"
            className={css({ fontSize: 'xs', color: 'gray.400', fontWeight: 'medium' })}
          >
            To Currency
          </label>
          <select
            id="to-currency"
            value={targetCurrency}
            onChange={(e) => onTargetCurrencyChange(e.target.value)}
            className={css({
              w: 'full',
              px: '3',
              py: '2',
              rounded: 'md',
              bg: 'gray.900',
              border: '1px solid',
              borderColor: 'gray.700',
              color: 'white',
              fontSize: 'sm',
              cursor: 'pointer',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.500/20',
              },
            })}
          >
            {POPULAR_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exchange Rate Display */}
      {rate && !isLoading && (
        <div
          className={css({
            p: '3',
            rounded: 'md',
            bg: 'gray.800/50',
            border: '1px solid',
            borderColor: 'gray.700',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '2',
            })}
          >
            <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Exchange Rate</span>
            {cacheAge !== null && (
              <span
                className={css({
                  fontSize: 'xs',
                  color: getCacheStatusColor(),
                  fontWeight: 'medium',
                })}
              >
                {isCacheFresh ? '✓ Fresh' : '⚠ Stale'} ({Math.round(cacheAge)}h old)
              </span>
            )}
          </div>
          <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'white' })}>
            1 {baseInfo?.symbol || baseCurrency} = {rate.toFixed(4)}{' '}
            {targetInfo?.symbol || targetCurrency}
          </div>
        </div>
      )}

      {/* Converted Amounts */}
      {amounts.length > 0 && rate && (
        <div className={css({ spaceY: '2' })}>
          <div className={css({ fontSize: 'xs', color: 'gray.500', fontWeight: 'medium' })}>
            Converted Amounts
          </div>
          {amounts.map((amount) => (
            <div
              key={amount.label}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '2',
                rounded: 'md',
                bg: 'gray.800/30',
              })}
            >
              <span className={css({ fontSize: 'sm', color: 'gray.400' })}>{amount.label}</span>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                  {formatCurrencyAmount(amount.value, baseCurrency)}
                </span>
                <span className={css({ fontSize: 'xs', color: 'gray.600' })}>→</span>
                <span
                  className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}
                >
                  {formatCurrencyAmount(convertedAmounts[amount.label] || 0, targetCurrency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className={css({
            p: '2',
            rounded: 'md',
            bg: 'red.500/10',
            border: '1px solid',
            borderColor: 'red.500/30',
            fontSize: 'sm',
            color: 'red.400',
          })}
        >
          ⚠ {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={css({ textAlign: 'center', fontSize: 'sm', color: 'gray.500' })}>
          Loading exchange rates...
        </div>
      )}
    </div>
  )
}
