import { describe, expect, it } from 'vitest'
import {
  areUnitsCompatible,
  convert,
  convertVolume,
  convertWeight,
  formatNumber,
  getAllUnits,
  getIngredientsByCategory,
  getUnitCategory,
  INGREDIENTS,
  QUICK_CONVERSIONS,
  SCALE_OPTIONS,
  scaleRecipe,
  VOLUME_UNITS,
  volumeToWeight,
  WEIGHT_UNITS,
  weightToVolume,
} from '../utils'

describe('cooking-converter utils', () => {
  describe('VOLUME_UNITS constant', () => {
    it('contains all expected volume units', () => {
      expect(VOLUME_UNITS).toHaveProperty('ml')
      expect(VOLUME_UNITS).toHaveProperty('l')
      expect(VOLUME_UNITS).toHaveProperty('tsp')
      expect(VOLUME_UNITS).toHaveProperty('tbsp')
      expect(VOLUME_UNITS).toHaveProperty('floz')
      expect(VOLUME_UNITS).toHaveProperty('cup')
      expect(VOLUME_UNITS).toHaveProperty('pint')
      expect(VOLUME_UNITS).toHaveProperty('quart')
      expect(VOLUME_UNITS).toHaveProperty('gallon')
    })

    it('has correct structure for each unit', () => {
      Object.values(VOLUME_UNITS).forEach((unit) => {
        expect(unit).toHaveProperty('name')
        expect(unit).toHaveProperty('abbr')
        expect(unit).toHaveProperty('toBase')
        expect(typeof unit.name).toBe('string')
        expect(typeof unit.abbr).toBe('string')
        expect(typeof unit.toBase).toBe('number')
      })
    })

    it('has ml as base unit with toBase of 1', () => {
      expect(VOLUME_UNITS.ml.toBase).toBe(1)
    })

    it('has correct conversion factors for common units', () => {
      expect(VOLUME_UNITS.l.toBase).toBe(1000)
      expect(VOLUME_UNITS.tsp.toBase).toBeCloseTo(4.92892, 4)
      expect(VOLUME_UNITS.tbsp.toBase).toBeCloseTo(14.7868, 4)
      expect(VOLUME_UNITS.cup.toBase).toBeCloseTo(236.588, 3)
    })

    it('has correct abbreviations', () => {
      expect(VOLUME_UNITS.ml.abbr).toBe('ml')
      expect(VOLUME_UNITS.l.abbr).toBe('L')
      expect(VOLUME_UNITS.tsp.abbr).toBe('tsp')
      expect(VOLUME_UNITS.tbsp.abbr).toBe('tbsp')
      expect(VOLUME_UNITS.floz.abbr).toBe('fl oz')
      expect(VOLUME_UNITS.cup.abbr).toBe('cup')
    })
  })

  describe('WEIGHT_UNITS constant', () => {
    it('contains all expected weight units', () => {
      expect(WEIGHT_UNITS).toHaveProperty('g')
      expect(WEIGHT_UNITS).toHaveProperty('kg')
      expect(WEIGHT_UNITS).toHaveProperty('oz')
      expect(WEIGHT_UNITS).toHaveProperty('lb')
      expect(WEIGHT_UNITS).toHaveProperty('mg')
    })

    it('has correct structure for each unit', () => {
      Object.values(WEIGHT_UNITS).forEach((unit) => {
        expect(unit).toHaveProperty('name')
        expect(unit).toHaveProperty('abbr')
        expect(unit).toHaveProperty('toBase')
        expect(typeof unit.name).toBe('string')
        expect(typeof unit.abbr).toBe('string')
        expect(typeof unit.toBase).toBe('number')
      })
    })

    it('has gram as base unit with toBase of 1', () => {
      expect(WEIGHT_UNITS.g.toBase).toBe(1)
    })

    it('has correct conversion factors', () => {
      expect(WEIGHT_UNITS.kg.toBase).toBe(1000)
      expect(WEIGHT_UNITS.oz.toBase).toBeCloseTo(28.3495, 4)
      expect(WEIGHT_UNITS.lb.toBase).toBeCloseTo(453.592, 3)
      expect(WEIGHT_UNITS.mg.toBase).toBe(0.001)
    })

    it('has correct abbreviations', () => {
      expect(WEIGHT_UNITS.g.abbr).toBe('g')
      expect(WEIGHT_UNITS.kg.abbr).toBe('kg')
      expect(WEIGHT_UNITS.oz.abbr).toBe('oz')
      expect(WEIGHT_UNITS.lb.abbr).toBe('lb')
      expect(WEIGHT_UNITS.mg.abbr).toBe('mg')
    })
  })

  describe('INGREDIENTS constant', () => {
    it('contains flour ingredients', () => {
      expect(INGREDIENTS['all-purpose-flour']).toBeDefined()
      expect(INGREDIENTS['bread-flour']).toBeDefined()
      expect(INGREDIENTS['cake-flour']).toBeDefined()
      expect(INGREDIENTS['whole-wheat-flour']).toBeDefined()
      expect(INGREDIENTS['almond-flour']).toBeDefined()
    })

    it('contains sugar ingredients', () => {
      expect(INGREDIENTS['granulated-sugar']).toBeDefined()
      expect(INGREDIENTS['brown-sugar-packed']).toBeDefined()
      expect(INGREDIENTS['powdered-sugar']).toBeDefined()
      expect(INGREDIENTS.honey).toBeDefined()
    })

    it('contains dairy ingredients', () => {
      expect(INGREDIENTS.butter).toBeDefined()
      expect(INGREDIENTS.milk).toBeDefined()
      expect(INGREDIENTS['heavy-cream']).toBeDefined()
      expect(INGREDIENTS.yogurt).toBeDefined()
    })

    it('contains liquid ingredients', () => {
      expect(INGREDIENTS.water).toBeDefined()
      expect(INGREDIENTS['vegetable-oil']).toBeDefined()
      expect(INGREDIENTS['olive-oil']).toBeDefined()
    })

    it('has correct structure for each ingredient', () => {
      Object.values(INGREDIENTS).forEach((ingredient) => {
        expect(ingredient).toHaveProperty('name')
        expect(ingredient).toHaveProperty('gramsPerCup')
        expect(ingredient).toHaveProperty('category')
        expect(typeof ingredient.name).toBe('string')
        expect(typeof ingredient.gramsPerCup).toBe('number')
        expect(typeof ingredient.category).toBe('string')
        expect(ingredient.gramsPerCup).toBeGreaterThan(0)
      })
    })

    it('has correct density for common ingredients', () => {
      expect(INGREDIENTS['all-purpose-flour'].gramsPerCup).toBe(125)
      expect(INGREDIENTS['granulated-sugar'].gramsPerCup).toBe(200)
      expect(INGREDIENTS.butter.gramsPerCup).toBe(227)
      expect(INGREDIENTS.water.gramsPerCup).toBe(237)
    })

    it('has correct categories for ingredients', () => {
      expect(INGREDIENTS['all-purpose-flour'].category).toBe('Flour')
      expect(INGREDIENTS['granulated-sugar'].category).toBe('Sugar')
      expect(INGREDIENTS.butter.category).toBe('Dairy')
      expect(INGREDIENTS.water.category).toBe('Liquid')
    })

    it('contains over 40 ingredients', () => {
      expect(Object.keys(INGREDIENTS).length).toBeGreaterThanOrEqual(40)
    })
  })

  describe('QUICK_CONVERSIONS constant', () => {
    it('contains expected quick conversions', () => {
      expect(QUICK_CONVERSIONS).toHaveLength(6)
    })

    it('has correct structure for each conversion', () => {
      QUICK_CONVERSIONS.forEach((conv) => {
        expect(conv).toHaveProperty('from')
        expect(conv).toHaveProperty('to')
        expect(conv).toHaveProperty('label')
        expect(typeof conv.from).toBe('string')
        expect(typeof conv.to).toBe('string')
        expect(typeof conv.label).toBe('string')
      })
    })

    it('contains tbsp to tsp conversion', () => {
      const tbspToTsp = QUICK_CONVERSIONS.find((c) => c.from === 'tbsp' && c.to === 'tsp')
      expect(tbspToTsp).toBeDefined()
      expect(tbspToTsp?.label).toBe('tbsp to tsp')
    })

    it('contains cups to ml conversion', () => {
      const cupToMl = QUICK_CONVERSIONS.find((c) => c.from === 'cup' && c.to === 'ml')
      expect(cupToMl).toBeDefined()
      expect(cupToMl?.label).toBe('cups to ml')
    })

    it('contains oz to g conversion', () => {
      const ozToG = QUICK_CONVERSIONS.find((c) => c.from === 'oz' && c.to === 'g')
      expect(ozToG).toBeDefined()
      expect(ozToG?.label).toBe('oz to g')
    })
  })

  describe('SCALE_OPTIONS constant', () => {
    it('contains expected scale options', () => {
      expect(SCALE_OPTIONS).toHaveLength(8)
    })

    it('has correct structure for each option', () => {
      SCALE_OPTIONS.forEach((opt) => {
        expect(opt).toHaveProperty('value')
        expect(opt).toHaveProperty('label')
        expect(typeof opt.value).toBe('number')
        expect(typeof opt.label).toBe('string')
      })
    })

    it('contains common scale values', () => {
      const values = SCALE_OPTIONS.map((o) => o.value)
      expect(values).toContain(0.25)
      expect(values).toContain(0.5)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(4)
    })

    it('has correct labels for scale values', () => {
      const half = SCALE_OPTIONS.find((o) => o.value === 0.5)
      expect(half?.label).toBe('1/2x')

      const double = SCALE_OPTIONS.find((o) => o.value === 2)
      expect(double?.label).toBe('2x')

      const original = SCALE_OPTIONS.find((o) => o.value === 1)
      expect(original?.label).toBe('1x')
    })
  })

  describe('getUnitCategory', () => {
    it('returns "volume" for volume units', () => {
      expect(getUnitCategory('ml')).toBe('volume')
      expect(getUnitCategory('l')).toBe('volume')
      expect(getUnitCategory('tsp')).toBe('volume')
      expect(getUnitCategory('tbsp')).toBe('volume')
      expect(getUnitCategory('cup')).toBe('volume')
      expect(getUnitCategory('floz')).toBe('volume')
      expect(getUnitCategory('pint')).toBe('volume')
      expect(getUnitCategory('quart')).toBe('volume')
      expect(getUnitCategory('gallon')).toBe('volume')
    })

    it('returns "weight" for weight units', () => {
      expect(getUnitCategory('g')).toBe('weight')
      expect(getUnitCategory('kg')).toBe('weight')
      expect(getUnitCategory('oz')).toBe('weight')
      expect(getUnitCategory('lb')).toBe('weight')
      expect(getUnitCategory('mg')).toBe('weight')
    })
  })

  describe('areUnitsCompatible', () => {
    describe('same category units', () => {
      it('returns true for volume to volume without ingredient', () => {
        expect(areUnitsCompatible('cup', 'ml')).toBe(true)
        expect(areUnitsCompatible('tsp', 'tbsp')).toBe(true)
        expect(areUnitsCompatible('l', 'gallon')).toBe(true)
      })

      it('returns true for weight to weight without ingredient', () => {
        expect(areUnitsCompatible('g', 'kg')).toBe(true)
        expect(areUnitsCompatible('oz', 'lb')).toBe(true)
        expect(areUnitsCompatible('mg', 'g')).toBe(true)
      })

      it('returns true for same category with ingredient', () => {
        expect(areUnitsCompatible('cup', 'ml', 'all-purpose-flour')).toBe(true)
        expect(areUnitsCompatible('g', 'kg', 'granulated-sugar')).toBe(true)
      })
    })

    describe('cross-category units', () => {
      it('returns false for volume to weight without ingredient', () => {
        expect(areUnitsCompatible('cup', 'g')).toBe(false)
        expect(areUnitsCompatible('ml', 'oz')).toBe(false)
        expect(areUnitsCompatible('tbsp', 'kg')).toBe(false)
      })

      it('returns false for weight to volume without ingredient', () => {
        expect(areUnitsCompatible('g', 'cup')).toBe(false)
        expect(areUnitsCompatible('oz', 'ml')).toBe(false)
        expect(areUnitsCompatible('lb', 'l')).toBe(false)
      })

      it('returns true for volume to weight with ingredient', () => {
        expect(areUnitsCompatible('cup', 'g', 'all-purpose-flour')).toBe(true)
        expect(areUnitsCompatible('ml', 'oz', 'water')).toBe(true)
        expect(areUnitsCompatible('tbsp', 'kg', 'butter')).toBe(true)
      })

      it('returns true for weight to volume with ingredient', () => {
        expect(areUnitsCompatible('g', 'cup', 'granulated-sugar')).toBe(true)
        expect(areUnitsCompatible('oz', 'ml', 'milk')).toBe(true)
        expect(areUnitsCompatible('lb', 'l', 'honey')).toBe(true)
      })
    })
  })

  describe('convertVolume', () => {
    describe('basic conversions', () => {
      it('converts ml to l', () => {
        expect(convertVolume(1000, 'ml', 'l')).toBeCloseTo(1, 5)
        expect(convertVolume(500, 'ml', 'l')).toBeCloseTo(0.5, 5)
        expect(convertVolume(2500, 'ml', 'l')).toBeCloseTo(2.5, 5)
      })

      it('converts l to ml', () => {
        expect(convertVolume(1, 'l', 'ml')).toBeCloseTo(1000, 5)
        expect(convertVolume(0.5, 'l', 'ml')).toBeCloseTo(500, 5)
        expect(convertVolume(2.5, 'l', 'ml')).toBeCloseTo(2500, 5)
      })

      it('converts same unit to itself', () => {
        expect(convertVolume(5, 'cup', 'cup')).toBeCloseTo(5, 5)
        expect(convertVolume(10, 'ml', 'ml')).toBeCloseTo(10, 5)
        expect(convertVolume(3, 'tsp', 'tsp')).toBeCloseTo(3, 5)
      })
    })

    describe('teaspoon and tablespoon conversions', () => {
      it('converts tsp to tbsp (3 tsp = 1 tbsp)', () => {
        const result = convertVolume(3, 'tsp', 'tbsp')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts tbsp to tsp', () => {
        const result = convertVolume(1, 'tbsp', 'tsp')
        expect(result).toBeCloseTo(3, 1)
      })

      it('converts multiple tbsp to tsp', () => {
        const result = convertVolume(4, 'tbsp', 'tsp')
        expect(result).toBeCloseTo(12, 1)
      })
    })

    describe('cup conversions', () => {
      it('converts cups to ml', () => {
        const result = convertVolume(1, 'cup', 'ml')
        expect(result).toBeCloseTo(236.588, 2)
      })

      it('converts cups to tbsp (1 cup = 16 tbsp)', () => {
        const result = convertVolume(1, 'cup', 'tbsp')
        expect(result).toBeCloseTo(16, 0)
      })

      it('converts tbsp to cups', () => {
        const result = convertVolume(16, 'tbsp', 'cup')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts cups to tsp (1 cup = 48 tsp)', () => {
        const result = convertVolume(1, 'cup', 'tsp')
        expect(result).toBeCloseTo(48, 0)
      })
    })

    describe('fluid ounce conversions', () => {
      it('converts cups to fluid ounces (1 cup = 8 fl oz)', () => {
        const result = convertVolume(1, 'cup', 'floz')
        expect(result).toBeCloseTo(8, 0)
      })

      it('converts fluid ounces to cups', () => {
        const result = convertVolume(8, 'floz', 'cup')
        expect(result).toBeCloseTo(1, 1)
      })
    })

    describe('larger volume conversions', () => {
      it('converts cups to pints (2 cups = 1 pint)', () => {
        const result = convertVolume(2, 'cup', 'pint')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts pints to quarts (2 pints = 1 quart)', () => {
        const result = convertVolume(2, 'pint', 'quart')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts quarts to gallons (4 quarts = 1 gallon)', () => {
        const result = convertVolume(4, 'quart', 'gallon')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts liters to cups', () => {
        const result = convertVolume(1, 'l', 'cup')
        expect(result).toBeCloseTo(4.227, 2)
      })
    })

    describe('edge cases', () => {
      it('handles zero value', () => {
        expect(convertVolume(0, 'cup', 'ml')).toBe(0)
      })

      it('handles very small values', () => {
        const result = convertVolume(0.001, 'l', 'ml')
        expect(result).toBeCloseTo(1, 5)
      })

      it('handles very large values', () => {
        const result = convertVolume(1000, 'gallon', 'ml')
        expect(result).toBeCloseTo(3785410, 0)
      })
    })
  })

  describe('convertWeight', () => {
    describe('basic conversions', () => {
      it('converts g to kg', () => {
        expect(convertWeight(1000, 'g', 'kg')).toBeCloseTo(1, 5)
        expect(convertWeight(500, 'g', 'kg')).toBeCloseTo(0.5, 5)
        expect(convertWeight(2500, 'g', 'kg')).toBeCloseTo(2.5, 5)
      })

      it('converts kg to g', () => {
        expect(convertWeight(1, 'kg', 'g')).toBeCloseTo(1000, 5)
        expect(convertWeight(0.5, 'kg', 'g')).toBeCloseTo(500, 5)
        expect(convertWeight(2.5, 'kg', 'g')).toBeCloseTo(2500, 5)
      })

      it('converts same unit to itself', () => {
        expect(convertWeight(5, 'g', 'g')).toBeCloseTo(5, 5)
        expect(convertWeight(10, 'kg', 'kg')).toBeCloseTo(10, 5)
        expect(convertWeight(3, 'oz', 'oz')).toBeCloseTo(3, 5)
      })
    })

    describe('ounce and pound conversions', () => {
      it('converts oz to g (1 oz ≈ 28.35 g)', () => {
        const result = convertWeight(1, 'oz', 'g')
        expect(result).toBeCloseTo(28.3495, 3)
      })

      it('converts g to oz', () => {
        const result = convertWeight(28.3495, 'g', 'oz')
        expect(result).toBeCloseTo(1, 3)
      })

      it('converts lb to g (1 lb ≈ 453.59 g)', () => {
        const result = convertWeight(1, 'lb', 'g')
        expect(result).toBeCloseTo(453.592, 2)
      })

      it('converts g to lb', () => {
        const result = convertWeight(453.592, 'g', 'lb')
        expect(result).toBeCloseTo(1, 3)
      })

      it('converts oz to lb (16 oz = 1 lb)', () => {
        const result = convertWeight(16, 'oz', 'lb')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts lb to oz', () => {
        const result = convertWeight(1, 'lb', 'oz')
        expect(result).toBeCloseTo(16, 0)
      })
    })

    describe('milligram conversions', () => {
      it('converts mg to g', () => {
        expect(convertWeight(1000, 'mg', 'g')).toBeCloseTo(1, 5)
        expect(convertWeight(500, 'mg', 'g')).toBeCloseTo(0.5, 5)
      })

      it('converts g to mg', () => {
        expect(convertWeight(1, 'g', 'mg')).toBeCloseTo(1000, 5)
        expect(convertWeight(0.5, 'g', 'mg')).toBeCloseTo(500, 5)
      })
    })

    describe('kg to lb conversions', () => {
      it('converts kg to lb (1 kg ≈ 2.2 lb)', () => {
        const result = convertWeight(1, 'kg', 'lb')
        expect(result).toBeCloseTo(2.205, 2)
      })

      it('converts lb to kg', () => {
        const result = convertWeight(2.205, 'lb', 'kg')
        expect(result).toBeCloseTo(1, 2)
      })
    })

    describe('edge cases', () => {
      it('handles zero value', () => {
        expect(convertWeight(0, 'g', 'kg')).toBe(0)
      })

      it('handles very small values', () => {
        const result = convertWeight(0.001, 'g', 'mg')
        expect(result).toBeCloseTo(1, 5)
      })

      it('handles very large values', () => {
        const result = convertWeight(1000, 'kg', 'mg')
        expect(result).toBeCloseTo(1000000000, 0)
      })
    })
  })

  describe('volumeToWeight', () => {
    describe('flour conversions', () => {
      it('converts 1 cup of all-purpose flour to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'all-purpose-flour')
        expect(result).toBeCloseTo(125, 0)
      })

      it('converts 2 cups of bread flour to grams', () => {
        const result = volumeToWeight(2, 'cup', 'g', 'bread-flour')
        expect(result).toBeCloseTo(254, 0)
      })

      it('converts cups of flour to kg', () => {
        const result = volumeToWeight(8, 'cup', 'kg', 'all-purpose-flour')
        expect(result).toBeCloseTo(1, 0)
      })

      it('converts tablespoons of flour to grams', () => {
        // 1 cup = 16 tbsp, so 1 tbsp = 125/16 ≈ 7.8g for all-purpose flour
        const result = volumeToWeight(1, 'tbsp', 'g', 'all-purpose-flour')
        expect(result).toBeCloseTo(7.8, 0)
      })
    })

    describe('sugar conversions', () => {
      it('converts 1 cup of granulated sugar to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'granulated-sugar')
        expect(result).toBeCloseTo(200, 0)
      })

      it('converts cups of brown sugar to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'brown-sugar-packed')
        expect(result).toBeCloseTo(220, 0)
      })

      it('converts cups of powdered sugar to ounces', () => {
        const result = volumeToWeight(1, 'cup', 'oz', 'powdered-sugar')
        expect(result).toBeCloseTo(4.23, 1)
      })
    })

    describe('dairy conversions', () => {
      it('converts 1 cup of butter to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'butter')
        expect(result).toBeCloseTo(227, 0)
      })

      it('converts 1 cup of milk to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'milk')
        expect(result).toBeCloseTo(245, 0)
      })

      it('converts tablespoons of butter to grams', () => {
        // 1 cup = 16 tbsp, so 1 tbsp = 227/16 ≈ 14.2g for butter
        const result = volumeToWeight(1, 'tbsp', 'g', 'butter')
        expect(result).toBeCloseTo(14.2, 0)
      })
    })

    describe('liquid conversions', () => {
      it('converts 1 cup of water to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'water')
        expect(result).toBeCloseTo(237, 0)
      })

      it('converts ml of water to grams', () => {
        // Water: 237g per cup, cup = 236.588ml, so approx 1g/ml
        const result = volumeToWeight(100, 'ml', 'g', 'water')
        expect(result).toBeCloseTo(100, 0)
      })

      it('converts cups of oil to grams', () => {
        const result = volumeToWeight(1, 'cup', 'g', 'vegetable-oil')
        expect(result).toBeCloseTo(218, 0)
      })
    })

    describe('other volume units', () => {
      it('converts teaspoons to grams', () => {
        const result = volumeToWeight(1, 'tsp', 'g', 'all-purpose-flour')
        // 1 tsp ≈ 4.93ml, 1 cup ≈ 236.6ml, so 1 tsp = 1/48 cup
        // 125g/cup * (1/48) = ~2.6g
        expect(result).toBeCloseTo(2.6, 0)
      })

      it('converts milliliters to grams', () => {
        const result = volumeToWeight(236.588, 'ml', 'g', 'all-purpose-flour')
        expect(result).toBeCloseTo(125, 0)
      })

      it('converts liters to kilograms', () => {
        // 1L water ≈ 1kg
        const result = volumeToWeight(1, 'l', 'kg', 'water')
        expect(result).toBeCloseTo(1, 0)
      })
    })

    describe('edge cases', () => {
      it('handles zero value', () => {
        const result = volumeToWeight(0, 'cup', 'g', 'all-purpose-flour')
        expect(result).toBe(0)
      })

      it('handles fractional cups', () => {
        const result = volumeToWeight(0.5, 'cup', 'g', 'granulated-sugar')
        expect(result).toBeCloseTo(100, 0)
      })
    })
  })

  describe('weightToVolume', () => {
    describe('flour conversions', () => {
      it('converts 125g of all-purpose flour to cups', () => {
        const result = weightToVolume(125, 'g', 'cup', 'all-purpose-flour')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts 250g of bread flour to cups', () => {
        const result = weightToVolume(254, 'g', 'cup', 'bread-flour')
        expect(result).toBeCloseTo(2, 1)
      })

      it('converts kg of flour to cups', () => {
        const result = weightToVolume(1, 'kg', 'cup', 'all-purpose-flour')
        expect(result).toBeCloseTo(8, 0)
      })
    })

    describe('sugar conversions', () => {
      it('converts 200g of granulated sugar to cups', () => {
        const result = weightToVolume(200, 'g', 'cup', 'granulated-sugar')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts ounces of sugar to cups', () => {
        // 200g = 1 cup, 200g ≈ 7.05 oz
        const result = weightToVolume(7.05, 'oz', 'cup', 'granulated-sugar')
        expect(result).toBeCloseTo(1, 1)
      })
    })

    describe('dairy conversions', () => {
      it('converts 227g of butter to cups', () => {
        const result = weightToVolume(227, 'g', 'cup', 'butter')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts grams of butter to tablespoons', () => {
        // 227g = 1 cup = 16 tbsp, so 14.2g = 1 tbsp
        const result = weightToVolume(14.2, 'g', 'tbsp', 'butter')
        expect(result).toBeCloseTo(1, 0)
      })
    })

    describe('liquid conversions', () => {
      it('converts grams of water to cups', () => {
        const result = weightToVolume(237, 'g', 'cup', 'water')
        expect(result).toBeCloseTo(1, 1)
      })

      it('converts grams of water to ml', () => {
        const result = weightToVolume(100, 'g', 'ml', 'water')
        expect(result).toBeCloseTo(100, 0)
      })

      it('converts kg of water to liters', () => {
        const result = weightToVolume(1, 'kg', 'l', 'water')
        expect(result).toBeCloseTo(1, 0)
      })
    })

    describe('edge cases', () => {
      it('handles zero value', () => {
        const result = weightToVolume(0, 'g', 'cup', 'all-purpose-flour')
        expect(result).toBe(0)
      })

      it('handles small weights', () => {
        const result = weightToVolume(7.8, 'g', 'tbsp', 'all-purpose-flour')
        expect(result).toBeCloseTo(1, 0)
      })
    })
  })

  describe('convert (main conversion function)', () => {
    describe('volume to volume conversions', () => {
      it('converts cups to ml', () => {
        const result = convert(1, 'cup', 'ml')
        expect(result.value).toBeCloseTo(236.588, 2)
        expect(result.unit).toBe('ml')
        expect(result.unitName).toBe('Milliliter')
        expect(result.formatted).toBeDefined()
      })

      it('converts tbsp to tsp', () => {
        const result = convert(2, 'tbsp', 'tsp')
        expect(result.value).toBeCloseTo(6, 0)
        expect(result.unit).toBe('tsp')
      })

      it('converts liters to cups', () => {
        const result = convert(1, 'l', 'cup')
        expect(result.value).toBeCloseTo(4.227, 2)
      })
    })

    describe('weight to weight conversions', () => {
      it('converts grams to kg', () => {
        const result = convert(1000, 'g', 'kg')
        expect(result.value).toBeCloseTo(1, 5)
        expect(result.unit).toBe('kg')
        expect(result.unitName).toBe('Kilogram')
      })

      it('converts oz to lb', () => {
        const result = convert(16, 'oz', 'lb')
        expect(result.value).toBeCloseTo(1, 1)
      })

      it('converts lb to g', () => {
        const result = convert(1, 'lb', 'g')
        expect(result.value).toBeCloseTo(453.592, 2)
      })
    })

    describe('volume to weight conversions (with ingredient)', () => {
      it('converts cups of flour to grams', () => {
        const result = convert(1, 'cup', 'g', 'all-purpose-flour')
        expect(result.value).toBeCloseTo(125, 0)
        expect(result.unit).toBe('g')
      })

      it('converts cups of sugar to grams', () => {
        const result = convert(1, 'cup', 'g', 'granulated-sugar')
        expect(result.value).toBeCloseTo(200, 0)
      })

      it('converts tbsp of butter to grams', () => {
        const result = convert(1, 'tbsp', 'g', 'butter')
        expect(result.value).toBeCloseTo(14.2, 0)
      })
    })

    describe('weight to volume conversions (with ingredient)', () => {
      it('converts grams of flour to cups', () => {
        const result = convert(125, 'g', 'cup', 'all-purpose-flour')
        expect(result.value).toBeCloseTo(1, 1)
        expect(result.unit).toBe('cup')
      })

      it('converts grams of sugar to cups', () => {
        const result = convert(200, 'g', 'cup', 'granulated-sugar')
        expect(result.value).toBeCloseTo(1, 1)
      })
    })

    describe('error handling', () => {
      it('throws error for cross-category conversion without ingredient', () => {
        expect(() => convert(1, 'cup', 'g')).toThrow(
          'Ingredient required for volume-to-weight conversion'
        )
      })

      it('throws error for weight to volume without ingredient', () => {
        expect(() => convert(100, 'g', 'ml')).toThrow(
          'Ingredient required for volume-to-weight conversion'
        )
      })
    })

    describe('result formatting', () => {
      it('returns formatted string in result', () => {
        const result = convert(1, 'cup', 'ml')
        expect(typeof result.formatted).toBe('string')
        expect(result.formatted.length).toBeGreaterThan(0)
      })

      it('returns correct unit name for volume', () => {
        const result = convert(1, 'cup', 'tbsp')
        expect(result.unitName).toBe('Tablespoon')
      })

      it('returns correct unit name for weight', () => {
        const result = convert(1, 'kg', 'oz')
        expect(result.unitName).toBe('Ounce')
      })
    })
  })

  describe('formatNumber', () => {
    describe('zero handling', () => {
      it('returns "0" for zero', () => {
        expect(formatNumber(0)).toBe('0')
      })
    })

    describe('very small numbers', () => {
      it('uses exponential notation for very small numbers', () => {
        const result = formatNumber(0.0001)
        expect(result).toMatch(/e/)
      })

      it('formats numbers less than 0.001 in exponential', () => {
        const result = formatNumber(0.00005)
        expect(result).toMatch(/e/)
      })
    })

    describe('small numbers (< 0.1)', () => {
      it('shows more decimal places for small numbers', () => {
        const result = formatNumber(0.05)
        expect(result).toBe('0.05')
      })

      it('removes trailing zeros', () => {
        const result = formatNumber(0.05)
        expect(result).toBe('0.05')
      })
    })

    describe('numbers between 0.1 and 1', () => {
      it('shows 3 decimal places', () => {
        const result = formatNumber(0.5)
        expect(result).toBe('0.5')
      })

      it('formats 0.333 correctly', () => {
        const result = formatNumber(0.333)
        expect(result).toBe('0.333')
      })

      it('removes trailing zeros', () => {
        const result = formatNumber(0.5)
        expect(result).toBe('0.5')
      })
    })

    describe('numbers between 1 and 100', () => {
      it('shows 2 decimal places', () => {
        const result = formatNumber(12.345)
        expect(result).toBe('12.35')
      })

      it('removes trailing zeros', () => {
        const result = formatNumber(15.0)
        expect(result).toBe('15')
      })

      it('handles whole numbers', () => {
        const result = formatNumber(42)
        expect(result).toBe('42')
      })

      it('formats 1 correctly', () => {
        expect(formatNumber(1)).toBe('1')
      })

      it('formats 99.99 correctly', () => {
        expect(formatNumber(99.99)).toBe('99.99')
      })
    })

    describe('numbers >= 100', () => {
      it('shows 1 decimal place', () => {
        const result = formatNumber(123.456)
        expect(result).toBe('123.5')
      })

      it('removes trailing zeros', () => {
        const result = formatNumber(200.0)
        expect(result).toBe('200')
      })

      it('handles large numbers', () => {
        const result = formatNumber(1234.5)
        expect(result).toBe('1234.5')
      })
    })

    describe('negative numbers', () => {
      it('handles negative small numbers', () => {
        const result = formatNumber(-0.05)
        expect(result).toBe('-0.05')
      })

      it('handles negative regular numbers', () => {
        const result = formatNumber(-12.34)
        expect(result).toBe('-12.34')
      })

      it('handles negative large numbers', () => {
        const result = formatNumber(-150.5)
        expect(result).toBe('-150.5')
      })
    })
  })

  describe('scaleRecipe', () => {
    describe('basic scaling', () => {
      it('scales by 1x (no change)', () => {
        expect(scaleRecipe(1, 1)).toBe(1)
        expect(scaleRecipe(100, 1)).toBe(100)
        expect(scaleRecipe(0.5, 1)).toBe(0.5)
      })

      it('scales by 2x (double)', () => {
        expect(scaleRecipe(1, 2)).toBe(2)
        expect(scaleRecipe(100, 2)).toBe(200)
        expect(scaleRecipe(0.5, 2)).toBe(1)
      })

      it('scales by 0.5x (half)', () => {
        expect(scaleRecipe(1, 0.5)).toBe(0.5)
        expect(scaleRecipe(100, 0.5)).toBe(50)
        expect(scaleRecipe(2, 0.5)).toBe(1)
      })
    })

    describe('fractional scaling', () => {
      it('scales by 0.25x (quarter)', () => {
        expect(scaleRecipe(4, 0.25)).toBe(1)
        expect(scaleRecipe(100, 0.25)).toBe(25)
      })

      it('scales by 0.75x (three quarters)', () => {
        expect(scaleRecipe(4, 0.75)).toBe(3)
        expect(scaleRecipe(100, 0.75)).toBe(75)
      })

      it('scales by 1.5x', () => {
        expect(scaleRecipe(2, 1.5)).toBe(3)
        expect(scaleRecipe(100, 1.5)).toBe(150)
      })
    })

    describe('larger multipliers', () => {
      it('scales by 3x', () => {
        expect(scaleRecipe(1, 3)).toBe(3)
        expect(scaleRecipe(100, 3)).toBe(300)
      })

      it('scales by 4x', () => {
        expect(scaleRecipe(1, 4)).toBe(4)
        expect(scaleRecipe(100, 4)).toBe(400)
      })
    })

    describe('edge cases', () => {
      it('scales zero amount', () => {
        expect(scaleRecipe(0, 2)).toBe(0)
        expect(scaleRecipe(0, 0.5)).toBe(0)
      })

      it('scales by zero multiplier', () => {
        expect(scaleRecipe(100, 0)).toBe(0)
      })

      it('handles decimal amounts', () => {
        expect(scaleRecipe(1.5, 2)).toBe(3)
        expect(scaleRecipe(0.25, 4)).toBe(1)
      })

      it('handles very small multipliers', () => {
        expect(scaleRecipe(100, 0.1)).toBe(10)
      })
    })
  })

  describe('getAllUnits', () => {
    it('returns object with volume and weight properties', () => {
      const units = getAllUnits()
      expect(units).toHaveProperty('volume')
      expect(units).toHaveProperty('weight')
    })

    it('returns VOLUME_UNITS as volume', () => {
      const units = getAllUnits()
      expect(units.volume).toBe(VOLUME_UNITS)
    })

    it('returns WEIGHT_UNITS as weight', () => {
      const units = getAllUnits()
      expect(units.weight).toBe(WEIGHT_UNITS)
    })

    it('contains all volume units', () => {
      const units = getAllUnits()
      expect(Object.keys(units.volume)).toEqual(Object.keys(VOLUME_UNITS))
    })

    it('contains all weight units', () => {
      const units = getAllUnits()
      expect(Object.keys(units.weight)).toEqual(Object.keys(WEIGHT_UNITS))
    })
  })

  describe('getIngredientsByCategory', () => {
    it('returns grouped ingredients', () => {
      const grouped = getIngredientsByCategory()
      expect(typeof grouped).toBe('object')
      expect(Object.keys(grouped).length).toBeGreaterThan(0)
    })

    it('has Flour category', () => {
      const grouped = getIngredientsByCategory()
      expect(grouped.Flour).toBeDefined()
      expect(Array.isArray(grouped.Flour)).toBe(true)
    })

    it('has Sugar category', () => {
      const grouped = getIngredientsByCategory()
      expect(grouped.Sugar).toBeDefined()
      expect(Array.isArray(grouped.Sugar)).toBe(true)
    })

    it('has Dairy category', () => {
      const grouped = getIngredientsByCategory()
      expect(grouped.Dairy).toBeDefined()
      expect(Array.isArray(grouped.Dairy)).toBe(true)
    })

    it('has Liquid category', () => {
      const grouped = getIngredientsByCategory()
      expect(grouped.Liquid).toBeDefined()
      expect(Array.isArray(grouped.Liquid)).toBe(true)
    })

    it('each ingredient has id and name', () => {
      const grouped = getIngredientsByCategory()
      Object.values(grouped).forEach((ingredients) => {
        ingredients.forEach((ing) => {
          expect(ing).toHaveProperty('id')
          expect(ing).toHaveProperty('name')
          expect(typeof ing.id).toBe('string')
          expect(typeof ing.name).toBe('string')
        })
      })
    })

    it('flour category contains all-purpose-flour', () => {
      const grouped = getIngredientsByCategory()
      const flourIds = grouped.Flour.map((f) => f.id)
      expect(flourIds).toContain('all-purpose-flour')
    })

    it('sugar category contains granulated-sugar', () => {
      const grouped = getIngredientsByCategory()
      const sugarIds = grouped.Sugar.map((s) => s.id)
      expect(sugarIds).toContain('granulated-sugar')
    })

    it('dairy category contains butter', () => {
      const grouped = getIngredientsByCategory()
      const dairyIds = grouped.Dairy.map((d) => d.id)
      expect(dairyIds).toContain('butter')
    })

    it('liquid category contains water', () => {
      const grouped = getIngredientsByCategory()
      const liquidIds = grouped.Liquid.map((l) => l.id)
      expect(liquidIds).toContain('water')
    })

    it('total ingredients matches INGREDIENTS count', () => {
      const grouped = getIngredientsByCategory()
      let totalCount = 0
      Object.values(grouped).forEach((ingredients) => {
        totalCount += ingredients.length
      })
      expect(totalCount).toBe(Object.keys(INGREDIENTS).length)
    })
  })

  describe('integration tests', () => {
    describe('realistic cooking scenarios', () => {
      it('converts recipe from cups to grams for flour', () => {
        // Recipe calls for 2.5 cups of all-purpose flour
        const result = convert(2.5, 'cup', 'g', 'all-purpose-flour')
        expect(result.value).toBeCloseTo(312.5, 0)
      })

      it('converts butter sticks to grams (1 stick = 1/2 cup)', () => {
        // 1 stick of butter = 0.5 cups
        const result = convert(0.5, 'cup', 'g', 'butter')
        expect(result.value).toBeCloseTo(113.5, 0)
      })

      it('converts metric recipe to US measurements', () => {
        // Recipe calls for 300g of sugar
        const result = convert(300, 'g', 'cup', 'granulated-sugar')
        expect(result.value).toBeCloseTo(1.5, 1)
      })

      it('handles small measurements like teaspoons of salt', () => {
        const result = convert(1, 'tsp', 'g', 'salt-table')
        // 288g per cup / 48 tsp per cup = 6g per tsp
        expect(result.value).toBeCloseTo(6, 0)
      })
    })

    describe('scaling full recipes', () => {
      it('halves a recipe correctly', () => {
        // Original: 2 cups flour
        const halfFlour = scaleRecipe(2, 0.5)
        expect(halfFlour).toBe(1)

        // Original: 1.5 cups sugar
        const halfSugar = scaleRecipe(1.5, 0.5)
        expect(halfSugar).toBe(0.75)
      })

      it('doubles a recipe correctly', () => {
        // Original: 3 tbsp butter
        const doubleButter = scaleRecipe(3, 2)
        expect(doubleButter).toBe(6)

        // Original: 0.25 cup milk
        const doubleMilk = scaleRecipe(0.25, 2)
        expect(doubleMilk).toBe(0.5)
      })
    })

    describe('round-trip conversions', () => {
      it('converts cups to grams and back', () => {
        const toGrams = convert(1, 'cup', 'g', 'all-purpose-flour')
        const backToCups = convert(toGrams.value, 'g', 'cup', 'all-purpose-flour')
        expect(backToCups.value).toBeCloseTo(1, 2)
      })

      it('converts ml to cups and back', () => {
        const toCups = convert(500, 'ml', 'cup')
        const backToMl = convert(toCups.value, 'cup', 'ml')
        expect(backToMl.value).toBeCloseTo(500, 1)
      })

      it('converts oz to g and back', () => {
        const toGrams = convert(4, 'oz', 'g')
        const backToOz = convert(toGrams.value, 'g', 'oz')
        expect(backToOz.value).toBeCloseTo(4, 2)
      })
    })
  })
})
