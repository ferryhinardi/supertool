'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  ArrowRight,
  Info,
  Repeat,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'
import {
  convertUnit,
  getAllCategories,
  getUnitInfo,
  getUnitsForCategory,
  type UnitCategory,
  unitDefinitions,
} from './utils'

interface Favorite {
  id: string
  category: UnitCategory
  fromUnit: string
  toUnit: string
  name?: string
}

const faqs = [
  {
    question: 'What types of units can I convert with this tool?',
    answer:
      'Our converter supports 30+ unit categories including: length/distance (meters, feet, miles, kilometers), weight/mass (grams, pounds, kilograms, ounces), temperature (Celsius, Fahrenheit, Kelvin), volume (liters, gallons, cups, milliliters), area (square meters, acres, hectares), speed (mph, km/h, knots), time, pressure, energy, power, and data storage units.',
  },
  {
    question: 'How accurate are the unit conversions?',
    answer:
      'All conversions use precise mathematical formulas and industry-standard conversion factors with up to 10 decimal places of precision. For example, temperature conversions use exact formulas: °C = (°F - 32) × 5/9. We regularly verify conversion accuracy against scientific standards to ensure reliability for both casual and professional use.',
  },
  {
    question: 'Can I convert between metric and imperial units?',
    answer:
      'Yes! The converter seamlessly handles conversions between metric (SI) and imperial (US/UK) measurement systems. Convert pounds to kilograms, miles to kilometers, Fahrenheit to Celsius, gallons to liters, and vice versa. This is especially useful for international travel, recipe conversions, or working with specifications from different countries.',
  },
  {
    question: 'How do I convert Celsius to Fahrenheit or vice versa?',
    answer:
      'Select Temperature from the category dropdown, enter your value, choose Celsius or Fahrenheit as the source unit, and select the target unit. The conversion happens instantly. Formula: °F = (°C × 9/5) + 32 or °C = (°F - 32) × 5/9. Our tool also supports Kelvin for scientific calculations.',
  },
  {
    question: 'Can I save my favorite unit conversions?',
    answer:
      'Yes! You can mark frequently used conversions as favorites for quick access. Simply click the star icon next to any conversion pair (e.g., kg to lbs, miles to km) and it will appear in your favorites list. Favorites are saved locally in your browser for instant loading on future visits.',
  },
]

function UnitConverterContent() {
  const [category, setCategory] = useQueryState(
    'category',
    parseAsStringEnum<UnitCategory>(getAllCategories()).withDefault('length')
  )
  const [fromUnit, setFromUnit] = useQueryState('from', { defaultValue: 'meter' })
  const [toUnit, setToUnit] = useQueryState('to', { defaultValue: 'foot' })
  const [fromValue, setFromValue] = useQueryState('value', { defaultValue: '1' })
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    // Lazy initialization - only runs once on mount (client-side safe)
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem('unitConverterFavorites')
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
        localStorage.setItem('unitConverterFavorites', JSON.stringify(favorites))
      } else {
        localStorage.removeItem('unitConverterFavorites')
      }
    }
  }, [favorites])

  // Track page visit
  useEffect(() => {
    trackToolEvent('unit_converter_open', {})
  }, [])

  // Compute conversion result (derived value, not state)
  const toValue = useMemo(() => {
    if (!fromValue || fromValue === '' || Number.isNaN(Number(fromValue))) {
      return ''
    }

    try {
      const result = convertUnit(Number(fromValue), fromUnit, toUnit, category)
      return result.toFixed(8).replace(/\.?0+$/, '')
    } catch (error) {
      console.error('Conversion error:', error)
      return 'Error'
    }
  }, [fromValue, fromUnit, toUnit, category])

  const handleSwapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)

    trackToolEvent('unit_converter_swap', { category })
  }

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory)
    // Update units for new category
    const units = getUnitsForCategory(newCategory)
    if (units.length >= 2) {
      setFromUnit(units[0])
      setToUnit(units[1])
    }
  }

  const handleAddFavorite = () => {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      category,
      fromUnit,
      toUnit,
    }

    setFavorites([...favorites, newFavorite])
    toast.success('Added to favorites! ⭐')

    trackToolEvent('unit_converter_favorite_add', {
      category,
      from_unit: fromUnit,
      to_unit: toUnit,
    })
  }

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id))
    toast.success('Removed from favorites')

    trackToolEvent('unit_converter_favorite_remove', {})
  }

  const handleLoadFavorite = (favorite: Favorite) => {
    setCategory(favorite.category)
    setFromUnit(favorite.fromUnit)
    setToUnit(favorite.toUnit)
    toast.success('Loaded favorite conversion')

    trackToolEvent('unit_converter_favorite_load', {
      category: favorite.category,
    })
  }

  const isFavorite = useMemo(() => {
    return favorites.some(
      (f) => f.category === category && f.fromUnit === fromUnit && f.toUnit === toUnit
    )
  }, [favorites, category, fromUnit, toUnit])

  const availableUnits = useMemo(() => {
    return getUnitsForCategory(category)
  }, [category])

  const fromUnitInfo = getUnitInfo(category, fromUnit)
  const toUnitInfo = getUnitInfo(category, toUnit)

  const categories = getAllCategories()
  const categoryInfo = unitDefinitions[category]

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
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Repeat className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            11 Categories • 100+ Units
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Unit Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Convert between metric, imperial, and scientific units instantly. Support for length,
          weight, temperature, volume, area, speed, time, and more.
        </p>
      </motion.div>

      {/* Category Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Select Category</CardTitle>
            <CardDescription>Choose the type of unit you want to convert</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(6, 1fr)',
                },
                gap: '3',
              })}
            >
              {categories.map((cat) => {
                const isActive = category === cat
                const def = unitDefinitions[cat]
                return (
                  <Button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={css({
                      h: 'auto',
                      flexDirection: 'column',
                      gap: '2',
                      py: '4',
                      px: '3',
                      bg: isActive ? 'blue.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: isActive ? 'blue.500/50' : 'gray.700/50',
                      color: isActive ? 'blue.300' : 'gray.400',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: isActive ? 'blue.500/30' : 'gray.800',
                        borderColor: isActive ? 'blue.500/70' : 'gray.600',
                        transform: 'translateY(-2px)',
                      },
                    })}
                  >
                    <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {def.name}
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {Object.keys(def.units).length} units
                    </span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Converter */}
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
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <CardTitle>Convert {categoryInfo.name}</CardTitle>
              {!isFavorite && (
                <Button
                  onClick={handleAddFavorite}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
                    _hover: { bg: 'gray.700', color: 'yellow.400' },
                  })}
                >
                  <Star className={css({ h: '4', w: '4' })} />
                  Add to Favorites
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* From Unit */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="from-value"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
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
                    trackToolEvent('unit_converter_convert', {
                      category,
                      from_unit: fromUnit,
                      to_unit: toUnit,
                    })
                  }}
                  placeholder="Enter value"
                  className={css({
                    h: '14',
                    fontSize: 'xl',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                  })}
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
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
                      borderColor: 'blue.500',
                      ring: '2px',
                      ringColor: 'blue.500/20',
                    },
                  })}
                >
                  {availableUnits.map((unit) => {
                    const info = getUnitInfo(category, unit)
                    return (
                      <option key={unit} value={unit}>
                        {info?.name} ({info?.symbol})
                      </option>
                    )
                  })}
                </select>
              </div>
              {fromUnitInfo && (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Info className={css({ h: '4', w: '4', color: 'gray.500' })} />
                  <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                    {fromUnitInfo.name} ({fromUnitInfo.symbol})
                  </span>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className={css({ display: 'flex', justifyContent: 'center' })}>
              <Button
                onClick={handleSwapUnits}
                className={css({
                  gap: '2',
                  rounded: 'full',
                  bg: 'blue.500/20',
                  border: '1px solid',
                  borderColor: 'blue.500/50',
                  color: 'blue.300',
                  _hover: {
                    bg: 'blue.500/30',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s',
                  },
                })}
              >
                <ArrowLeftRight className={css({ h: '5', w: '5' })} />
                Swap Units
              </Button>
            </div>

            {/* To Unit */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="to-value"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                To
              </label>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3' })}>
                <Input
                  id="to-value"
                  type="text"
                  readOnly
                  value={toValue}
                  placeholder="Result"
                  className={css({
                    h: '14',
                    fontSize: 'xl',
                    fontWeight: 'bold',
                    bg: 'blue.500/10',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                    color: 'blue.300',
                    cursor: 'default',
                  })}
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
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
                      borderColor: 'blue.500',
                      ring: '2px',
                      ringColor: 'blue.500/20',
                    },
                  })}
                >
                  {availableUnits.map((unit) => {
                    const info = getUnitInfo(category, unit)
                    return (
                      <option key={unit} value={unit}>
                        {info?.name} ({info?.symbol})
                      </option>
                    )
                  })}
                </select>
              </div>
              {toUnitInfo && (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Info className={css({ h: '4', w: '4', color: 'gray.500' })} />
                  <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                    {toUnitInfo.name} ({toUnitInfo.symbol})
                  </span>
                </div>
              )}
            </div>

            {/* Quick Conversion Info */}
            {fromValue && toValue && toValue !== 'Error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'blue.500/20',
                  bg: 'blue.500/5',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <TrendingUp className={css({ h: '4', w: '4', color: 'blue.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'blue.300' })}
                  >
                    Conversion Formula
                  </span>
                </div>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  1 {fromUnitInfo?.symbol} = {convertUnit(1, fromUnit, toUnit, category).toFixed(6)}{' '}
                  {toUnitInfo?.symbol}
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
          transition={{ delay: 0.3, duration: 0.5 }}
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
                  const catDef = unitDefinitions[favorite.category]
                  const fromInfo = catDef.units[favorite.fromUnit]
                  const toInfo = catDef.units[favorite.toUnit]

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
                        _hover: { bg: 'gray.800', borderColor: 'blue.500/50' },
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
                        <Badge
                          className={css({
                            bg: 'blue.500/20',
                            color: 'blue.300',
                            border: '1px solid',
                            borderColor: 'blue.500/30',
                          })}
                        >
                          {catDef.name}
                        </Badge>
                        <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                          {fromInfo?.name} ({fromInfo?.symbol})
                        </span>
                        <ArrowRight className={css({ h: '4', w: '4', color: 'gray.500' })} />
                        <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                          {toInfo?.name} ({toInfo?.symbol})
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
                          color: 'gray.500',
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
        transition={{ delay: 0.4, duration: 0.5 }}
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
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Use the swap button to quickly reverse conversions</li>
                  <li>• Save frequently used conversions as favorites for quick access</li>
                  <li>• All conversions are instant and work offline</li>
                  <li>• Supports scientific notation for very large or small numbers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/unit-converter" category="productivity" />
    </main>
  )
}

export default function UnitConverterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnitConverterContent />
    </Suspense>
  )
}
