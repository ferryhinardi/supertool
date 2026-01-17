'use client'

import { ArrowLeftRight, CookingPot, Scale, Utensils } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  convert,
  formatNumber,
  getIngredientsByCategory,
  getUnitCategory,
  INGREDIENTS,
  type IngredientId,
  QUICK_CONVERSIONS,
  SCALE_OPTIONS,
  scaleRecipe,
  type Unit,
  VOLUME_UNITS,
  WEIGHT_UNITS,
} from './utils'

export default function CookingConverterPage() {
  const [amount, setAmount] = useState<string>('1')
  const [fromUnit, setFromUnit] = useState<Unit>('cup')
  const [toUnit, setToUnit] = useState<Unit>('ml')
  const [ingredientId, setIngredientId] = useState<IngredientId | ''>('')
  const [scaleAmount, setScaleAmount] = useState<string>('1')
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1)

  const ingredientsByCategory = useMemo(() => getIngredientsByCategory(), [])

  const fromCategory = getUnitCategory(fromUnit)
  const toCategory = getUnitCategory(toUnit)
  const needsIngredient = fromCategory !== toCategory

  // Calculate conversion result
  const result = useMemo(() => {
    const numAmount = Number.parseFloat(amount)
    if (Number.isNaN(numAmount) || numAmount < 0) return null

    // If cross-category conversion without ingredient, show message
    if (needsIngredient && !ingredientId) {
      return null
    }

    try {
      return convert(
        numAmount,
        fromUnit,
        toUnit,
        ingredientId ? (ingredientId as IngredientId) : undefined
      )
    } catch {
      return null
    }
  }, [amount, fromUnit, toUnit, ingredientId, needsIngredient])

  // Calculate scaled amount
  const scaledAmount = useMemo(() => {
    const numAmount = Number.parseFloat(scaleAmount)
    if (Number.isNaN(numAmount) || numAmount < 0) return null
    return scaleRecipe(numAmount, scaleMultiplier)
  }, [scaleAmount, scaleMultiplier])

  const handleAmountChange = (value: string) => {
    setAmount(value)
    const numValue = Number.parseFloat(value)
    if (!Number.isNaN(numValue) && numValue > 0) {
      trackToolEvent('cooking_converter_converted', {
        fromUnit,
        toUnit,
        hasIngredient: !!ingredientId,
      })
    }
  }

  const handleFromUnitChange = (value: Unit) => {
    setFromUnit(value)
    trackToolEvent('cooking_converter_unit_changed', { unit: value, direction: 'from' })
  }

  const handleToUnitChange = (value: Unit) => {
    setToUnit(value)
    trackToolEvent('cooking_converter_unit_changed', { unit: value, direction: 'to' })
  }

  const handleIngredientChange = (value: string) => {
    setIngredientId(value as IngredientId | '')
    if (value) {
      trackToolEvent('cooking_converter_ingredient_changed', {
        ingredient: INGREDIENTS[value as IngredientId]?.name || value,
      })
    }
  }

  const handleSwapUnits = useCallback(() => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    trackToolEvent('cooking_converter_converted', {
      fromUnit: toUnit,
      toUnit: fromUnit,
      hasIngredient: !!ingredientId,
    })
  }, [fromUnit, toUnit, ingredientId])

  const handleQuickConversion = (from: string, to: string) => {
    setFromUnit(from as Unit)
    setToUnit(to as Unit)
    setIngredientId('')
    trackToolEvent('cooking_converter_converted', {
      fromUnit: from,
      toUnit: to,
      hasIngredient: false,
    })
  }

  const handleScaleChange = (multiplier: number) => {
    setScaleMultiplier(multiplier)
    trackToolEvent('cooking_converter_scaled', { multiplier })
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
      <div className={css({ spaceY: 4, textAlign: 'center' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          })}
        >
          <CookingPot className={css({ w: 10, h: 10, color: 'orange.400' })} />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'orange.500',
              gradientTo: 'red.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Cooking Unit Converter
          </h1>
        </div>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Convert cooking measurements between cups, tablespoons, grams, ounces, and more. Scale
          recipes up or down with ingredient-specific conversions.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: { base: 6, lg: 8 },
          alignItems: 'start',
        })}
      >
        {/* Converter Panel */}
        <div className={css({ spaceY: 6 })}>
          {/* Main Converter */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 6,
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              })}
            >
              <Scale className={css({ w: 5, h: 5, color: 'orange.400' })} />
              <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
                Unit Converter
              </h2>
            </div>

            {/* Conversion Inputs */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: '1fr auto 1fr' },
                gap: 4,
                alignItems: 'end',
              })}
            >
              {/* From */}
              <div className={css({ spaceY: 2 })}>
                <label
                  htmlFor="cooking-amount-input"
                  className={css({ fontSize: 'sm', color: 'gray.400' })}
                >
                  Amount
                </label>
                <input
                  id="cooking-amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  min="0"
                  step="any"
                  placeholder="Enter amount"
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'lg',
                    bg: 'gray.900',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    outline: 'none',
                    _focus: {
                      borderColor: 'orange.500',
                      ring: '2px',
                      ringColor: 'rgba(249, 115, 22, 0.3)',
                    },
                    _placeholder: { color: 'gray.500' },
                  })}
                />
                <select
                  value={fromUnit}
                  onChange={(e) => handleFromUnitChange(e.target.value as Unit)}
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'sm',
                    bg: 'gray.900',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    outline: 'none',
                    cursor: 'pointer',
                    _focus: { borderColor: 'orange.500' },
                  })}
                >
                  <optgroup label="Volume">
                    {Object.entries(VOLUME_UNITS).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name} ({data.abbr})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Weight">
                    {Object.entries(WEIGHT_UNITS).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name} ({data.abbr})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwapUnits}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  rounded: 'full',
                  bg: 'gray.800',
                  color: 'gray.300',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { bg: 'gray.700', borderColor: 'orange.500', color: 'orange.400' },
                  alignSelf: { base: 'center', sm: 'end' },
                  mb: { base: 0, sm: 1 },
                })}
                title="Swap units"
              >
                <ArrowLeftRight className={css({ w: 5, h: 5 })} />
              </button>

              {/* To */}
              <div className={css({ spaceY: 2 })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: display element, not an input */}
                <label className={css({ fontSize: 'sm', color: 'gray.400' })}>Result</label>
                <div
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    bg: 'gray.900',
                    color: result ? 'orange.400' : 'gray.500',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    minH: '50px',
                    display: 'flex',
                    alignItems: 'center',
                  })}
                >
                  {result ? result.formatted : needsIngredient ? 'Select ingredient' : '—'}
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => handleToUnitChange(e.target.value as Unit)}
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'sm',
                    bg: 'gray.900',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    outline: 'none',
                    cursor: 'pointer',
                    _focus: { borderColor: 'orange.500' },
                  })}
                >
                  <optgroup label="Volume">
                    {Object.entries(VOLUME_UNITS).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name} ({data.abbr})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Weight">
                    {Object.entries(WEIGHT_UNITS).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name} ({data.abbr})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Ingredient Selector (for volume/weight conversion) */}
            {needsIngredient && (
              <div
                className={css({
                  p: 4,
                  bg: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid',
                  borderColor: 'rgba(249, 115, 22, 0.3)',
                  rounded: 'lg',
                  spaceY: 3,
                })}
              >
                <p className={css({ fontSize: 'sm', color: 'orange.300' })}>
                  Converting between volume and weight requires selecting an ingredient (densities
                  vary).
                </p>
                <select
                  value={ingredientId}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'sm',
                    bg: 'gray.900',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    outline: 'none',
                    cursor: 'pointer',
                    _focus: { borderColor: 'orange.500' },
                  })}
                >
                  <option value="">Select an ingredient...</option>
                  {Object.entries(ingredientsByCategory).map(([category, ingredients]) => (
                    <optgroup key={category} label={category}>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div
                className={css({
                  p: 4,
                  bg: 'gray.900',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  rounded: 'lg',
                  textAlign: 'center',
                })}
              >
                <p className={css({ fontSize: 'sm', color: 'gray.400', mb: 1 })}>
                  {amount}{' '}
                  {VOLUME_UNITS[fromUnit as keyof typeof VOLUME_UNITS]?.name ||
                    WEIGHT_UNITS[fromUnit as keyof typeof WEIGHT_UNITS]?.name}{' '}
                  =
                </p>
                <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'orange.400' })}>
                  {result.formatted} {result.unitName}
                </p>
                {ingredientId && (
                  <p className={css({ fontSize: 'sm', color: 'gray.500', mt: 1 })}>
                    (for {INGREDIENTS[ingredientId as IngredientId]?.name})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Conversions */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Quick Conversions
            </h3>
            <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
              {QUICK_CONVERSIONS.map((conv) => (
                <button
                  key={conv.label}
                  type="button"
                  onClick={() => handleQuickConversion(conv.from, conv.to)}
                  className={css({
                    px: 3,
                    py: 2,
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    rounded: 'lg',
                    bg: fromUnit === conv.from && toUnit === conv.to ? 'orange.600' : 'gray.800',
                    color: fromUnit === conv.from && toUnit === conv.to ? 'white' : 'gray.300',
                    border: '1px solid',
                    borderColor:
                      fromUnit === conv.from && toUnit === conv.to ? 'orange.500' : 'gray.700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.700', borderColor: 'orange.500', color: 'orange.300' },
                  })}
                >
                  {conv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Scaler */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
              <Utensils className={css({ w: 5, h: 5, color: 'red.400' })} />
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                Recipe Scaler
              </h3>
            </div>
            <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
              Scale any ingredient amount up or down for your recipe needs.
            </p>

            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: '1fr 1fr 1fr' },
                gap: 4,
                alignItems: 'end',
              })}
            >
              <div className={css({ spaceY: 2 })}>
                <label
                  htmlFor="scale-original-amount"
                  className={css({ fontSize: 'sm', color: 'gray.400' })}
                >
                  Original Amount
                </label>
                <input
                  id="scale-original-amount"
                  type="number"
                  value={scaleAmount}
                  onChange={(e) => setScaleAmount(e.target.value)}
                  min="0"
                  step="any"
                  placeholder="Enter amount"
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'lg',
                    bg: 'gray.900',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    outline: 'none',
                    _focus: {
                      borderColor: 'red.500',
                      ring: '2px',
                      ringColor: 'rgba(239, 68, 68, 0.3)',
                    },
                    _placeholder: { color: 'gray.500' },
                  })}
                />
              </div>

              <div className={css({ spaceY: 2 })}>
                <label
                  htmlFor="scale-multiplier-select"
                  className={css({ fontSize: 'sm', color: 'gray.400' })}
                >
                  Multiplier
                </label>
                <select
                  id="scale-multiplier-select"
                  value={scaleMultiplier}
                  onChange={(e) => handleScaleChange(Number(e.target.value))}
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'lg',
                    bg: 'gray.900',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    outline: 'none',
                    cursor: 'pointer',
                    _focus: { borderColor: 'red.500' },
                  })}
                >
                  {SCALE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={css({ spaceY: 2 })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: display element, not an input */}
                <label className={css({ fontSize: 'sm', color: 'gray.400' })}>Scaled Amount</label>
                <div
                  className={css({
                    w: 'full',
                    p: 3,
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    bg: 'gray.900',
                    color: scaledAmount !== null ? 'red.400' : 'gray.500',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    minH: '50px',
                    display: 'flex',
                    alignItems: 'center',
                  })}
                >
                  {scaledAmount !== null ? formatNumber(scaledAmount) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Panel */}
        <div className={css({ spaceY: 4 })}>
          {/* Common Equivalents */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Common Equivalents
            </h3>
            <div className={css({ spaceY: 2 })}>
              <EquivalentRow left="1 cup" right="16 tbsp" />
              <EquivalentRow left="1 cup" right="236.6 ml" />
              <EquivalentRow left="1 tbsp" right="3 tsp" />
              <EquivalentRow left="1 tbsp" right="14.8 ml" />
              <EquivalentRow left="1 oz" right="28.35 g" />
              <EquivalentRow left="1 lb" right="453.6 g" />
              <EquivalentRow left="1 kg" right="2.2 lb" />
              <EquivalentRow left="1 L" right="4.23 cups" />
            </div>
          </div>

          {/* Butter Reference */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Butter Quick Reference
            </h3>
            <div className={css({ spaceY: 2 })}>
              <EquivalentRow left="1 stick" right="8 tbsp / 113g" />
              <EquivalentRow left="1 stick" right="1/2 cup" />
              <EquivalentRow left="2 sticks" right="1 cup / 227g" />
              <EquivalentRow left="4 sticks" right="1 lb / 454g" />
            </div>
          </div>

          {/* Temperature Guide */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Oven Temperatures
            </h3>
            <div className={css({ spaceY: 2 })}>
              <EquivalentRow left="300°F" right="150°C (Low)" />
              <EquivalentRow left="350°F" right="175°C (Moderate)" />
              <EquivalentRow left="375°F" right="190°C" />
              <EquivalentRow left="400°F" right="200°C (Hot)" />
              <EquivalentRow left="425°F" right="220°C" />
              <EquivalentRow left="450°F" right="230°C (Very Hot)" />
            </div>
          </div>

          {/* Tips */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Pro Tips
            </h3>
            <div className={css({ spaceY: 3 })}>
              <TipItem text="For baking, weight measurements (grams) are more accurate than volume (cups)." />
              <TipItem text="Different ingredients have different densities - 1 cup of flour weighs less than 1 cup of sugar." />
              <TipItem text="When scaling recipes, small quantities of leaveners (baking powder/soda) may need adjustment." />
              <TipItem text="For best results with chocolate, use weight measurements and melt slowly." />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        className={css({
          bg: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          rounded: 'xl',
          p: { base: 4, sm: 6 },
          spaceY: 4,
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
          Features
        </h3>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 4,
          })}
        >
          <FeatureCard
            title="Volume Conversion"
            description="Convert between cups, tablespoons, teaspoons, milliliters, liters, and more."
          />
          <FeatureCard
            title="Weight Conversion"
            description="Convert between grams, kilograms, ounces, and pounds with precision."
          />
          <FeatureCard
            title="Recipe Scaling"
            description="Easily scale recipes up or down from 1/4x to 4x the original amount."
          />
          <FeatureCard
            title="100+ Ingredients"
            description="Accurate volume-to-weight conversions for over 100 common cooking ingredients."
          />
        </div>
      </div>
    </main>
  )
}

// Equivalent Row Component
function EquivalentRow({ left, right }: { left: string; right: string }) {
  return (
    <div
      className={css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        rounded: 'md',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
      })}
    >
      <span className={css({ fontSize: 'sm', color: 'gray.300' })}>{left}</span>
      <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.400' })}>
        {right}
      </span>
    </div>
  )
}

// Tip Item Component
function TipItem({ text }: { text: string }) {
  return (
    <div className={css({ display: 'flex', gap: 2 })}>
      <span className={css({ color: 'orange.400', flexShrink: 0 })}>•</span>
      <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>{text}</p>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={css({
        p: 4,
        rounded: 'lg',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
        spaceY: 2,
      })}
    >
      <h4 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.400' })}>
        {title}
      </h4>
      <p className={css({ fontSize: 'xs', color: 'gray.400', lineHeight: 'relaxed' })}>
        {description}
      </p>
    </div>
  )
}
