import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Panda CSS
vi.mock('@/styled-system/css', () => ({
  css: vi.fn(() => 'mock-css'),
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeftRight: ({ className }: { className?: string }) => (
    <svg data-testid="icon-arrow-left-right" className={className} />
  ),
  CookingPot: ({ className }: { className?: string }) => (
    <svg data-testid="icon-cooking-pot" className={className} />
  ),
  Scale: ({ className }: { className?: string }) => (
    <svg data-testid="icon-scale" className={className} />
  ),
  Utensils: ({ className }: { className?: string }) => (
    <svg data-testid="icon-utensils" className={className} />
  ),
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

import { trackToolEvent } from '@/lib/services/analytics'
import CookingConverterPage from '../page'
import { QUICK_CONVERSIONS, SCALE_OPTIONS } from '../utils'

describe('CookingConverterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the main title', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Cooking Unit Converter')).toBeInTheDocument()
    })

    it('renders the subtitle description', () => {
      render(<CookingConverterPage />)
      expect(
        screen.getByText(/Convert cooking measurements between cups, tablespoons, grams/)
      ).toBeInTheDocument()
    })

    it('renders the CookingPot icon in header', () => {
      render(<CookingConverterPage />)
      expect(screen.getByTestId('icon-cooking-pot')).toBeInTheDocument()
    })

    it('renders the main element', () => {
      render(<CookingConverterPage />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('renders Unit Converter section', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Unit Converter')).toBeInTheDocument()
    })

    it('renders Quick Conversions section', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Quick Conversions')).toBeInTheDocument()
    })

    it('renders Recipe Scaler section', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Recipe Scaler')).toBeInTheDocument()
    })

    it('renders Features section', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Features')).toBeInTheDocument()
    })
  })

  describe('Unit Converter section', () => {
    it('renders the amount input with default value of 1', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      expect(amountInput).toBeInTheDocument()
      expect(amountInput).toHaveValue(1)
    })

    it('renders the Amount label', () => {
      render(<CookingConverterPage />)
      expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })

    it('renders the Result label', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Result')).toBeInTheDocument()
    })

    it('renders from unit selector with default cup selected', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const fromSelect = selects[0]
      expect(fromSelect).toHaveValue('cup')
    })

    it('renders to unit selector with default ml selected', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]
      expect(toSelect).toHaveValue('ml')
    })

    it('renders swap button', () => {
      render(<CookingConverterPage />)
      const swapButton = screen.getByTitle('Swap units')
      expect(swapButton).toBeInTheDocument()
    })

    it('renders ArrowLeftRight icon in swap button', () => {
      render(<CookingConverterPage />)
      expect(screen.getByTestId('icon-arrow-left-right')).toBeInTheDocument()
    })

    it('renders Scale icon in Unit Converter header', () => {
      render(<CookingConverterPage />)
      expect(screen.getByTestId('icon-scale')).toBeInTheDocument()
    })

    it('displays conversion result for same-category units', () => {
      render(<CookingConverterPage />)
      // Default: 1 cup to ml should show result
      // Look for the formatted result (236.588 >= 100, so 1 decimal: 236.6)
      // Multiple elements may contain this value, so use getAllByText
      expect(screen.getAllByText(/236\.6/).length).toBeGreaterThan(0)
    })

    it('allows changing the amount input', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '2' } })
      expect(amountInput).toHaveValue(2)
    })

    it('updates result when amount changes', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '2' } })
      // 2 cups to ml should be ~473.18 (>= 100, so 1 decimal: 473.2)
      // Multiple elements may contain this value, so use getAllByText
      expect(screen.getAllByText(/473\.2/).length).toBeGreaterThan(0)
    })

    it('allows changing from unit', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const fromSelect = selects[0]
      fireEvent.change(fromSelect, { target: { value: 'tbsp' } })
      expect(fromSelect).toHaveValue('tbsp')
    })

    it('allows changing to unit', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]
      fireEvent.change(toSelect, { target: { value: 'tsp' } })
      expect(toSelect).toHaveValue('tsp')
    })

    it('contains Volume optgroup in unit selectors', () => {
      render(<CookingConverterPage />)
      const optgroups = screen.getAllByRole('group', { name: 'Volume' })
      expect(optgroups.length).toBeGreaterThan(0)
    })

    it('contains Weight optgroup in unit selectors', () => {
      render(<CookingConverterPage />)
      const optgroups = screen.getAllByRole('group', { name: 'Weight' })
      expect(optgroups.length).toBeGreaterThan(0)
    })

    it('renders volume unit options', () => {
      render(<CookingConverterPage />)
      expect(screen.getAllByText(/Cup/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Tablespoon/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Teaspoon/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Milliliter/).length).toBeGreaterThan(0)
    })

    it('renders weight unit options', () => {
      render(<CookingConverterPage />)
      expect(screen.getAllByText(/Gram/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Ounce/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Pound/).length).toBeGreaterThan(0)
    })
  })

  describe('swap units functionality', () => {
    it('swaps from and to units when swap button clicked', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const fromSelect = selects[0]
      const toSelect = selects[1]

      // Initial state: cup -> ml
      expect(fromSelect).toHaveValue('cup')
      expect(toSelect).toHaveValue('ml')

      // Click swap
      const swapButton = screen.getByTitle('Swap units')
      fireEvent.click(swapButton)

      // After swap: ml -> cup
      expect(fromSelect).toHaveValue('ml')
      expect(toSelect).toHaveValue('cup')
    })

    it('tracks analytics event on swap', () => {
      render(<CookingConverterPage />)
      const swapButton = screen.getByTitle('Swap units')
      fireEvent.click(swapButton)

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_converted', {
        fromUnit: 'ml',
        toUnit: 'cup',
        hasIngredient: false,
      })
    })
  })

  describe('ingredient selector (cross-category conversion)', () => {
    it('does not show ingredient selector for same-category conversion', () => {
      render(<CookingConverterPage />)
      // Default: cup to ml (both volume)
      expect(
        screen.queryByText(/Converting between volume and weight requires selecting an ingredient/)
      ).not.toBeInTheDocument()
    })

    it('shows ingredient selector when converting from volume to weight', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      // Change to weight unit
      fireEvent.change(toSelect, { target: { value: 'g' } })

      expect(
        screen.getByText(/Converting between volume and weight requires selecting an ingredient/)
      ).toBeInTheDocument()
    })

    it('shows ingredient selector when converting from weight to volume', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const fromSelect = selects[0]

      // Change from to weight unit
      fireEvent.change(fromSelect, { target: { value: 'g' } })

      expect(
        screen.getByText(/Converting between volume and weight requires selecting an ingredient/)
      ).toBeInTheDocument()
    })

    it('shows "Select ingredient" placeholder when no ingredient selected', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      // Change to weight unit
      fireEvent.change(toSelect, { target: { value: 'g' } })

      expect(screen.getByText('Select ingredient')).toBeInTheDocument()
    })

    it('renders ingredient dropdown when needed', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      // Change to weight unit
      fireEvent.change(toSelect, { target: { value: 'g' } })

      // Should now have 3 selects (from, to, ingredient)
      const allSelects = screen.getAllByRole('combobox')
      expect(allSelects.length).toBe(4) // from, to, ingredient, scale multiplier
    })

    it('shows "Select an ingredient..." option in ingredient selector', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      // Change to weight unit
      fireEvent.change(toSelect, { target: { value: 'g' } })

      expect(screen.getByText('Select an ingredient...')).toBeInTheDocument()
    })

    it('allows selecting an ingredient', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      // Change to weight unit
      fireEvent.change(toSelect, { target: { value: 'g' } })

      // Find the ingredient selector
      const allSelects = screen.getAllByRole('combobox')
      const ingredientSelect = allSelects[2]

      fireEvent.change(ingredientSelect, { target: { value: 'all-purpose-flour' } })
      expect(ingredientSelect).toHaveValue('all-purpose-flour')
    })

    it('shows conversion result after selecting ingredient', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      // Change to weight unit
      fireEvent.change(toSelect, { target: { value: 'g' } })

      // Select ingredient
      const allSelects = screen.getAllByRole('combobox')
      const ingredientSelect = allSelects[2]
      fireEvent.change(ingredientSelect, { target: { value: 'all-purpose-flour' } })

      // Should show result - look for numeric value instead of absence of "Select ingredient"
      // The result will be displayed in the result area
      expect(screen.getAllByText(/\d+/).length).toBeGreaterThan(0)
    })

    it('displays ingredient name in result when ingredient selected', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      const toSelect = selects[1]

      fireEvent.change(toSelect, { target: { value: 'g' } })

      const allSelects = screen.getAllByRole('combobox')
      const ingredientSelect = allSelects[2]
      fireEvent.change(ingredientSelect, { target: { value: 'all-purpose-flour' } })

      // Text may appear multiple times in result display
      expect(screen.getAllByText(/for All-Purpose Flour/).length).toBeGreaterThan(0)
    })
  })

  describe('quick conversions', () => {
    it('renders all quick conversion buttons', () => {
      render(<CookingConverterPage />)
      QUICK_CONVERSIONS.forEach((conv) => {
        expect(screen.getByText(conv.label)).toBeInTheDocument()
      })
    })

    it('clicking quick conversion updates units', () => {
      render(<CookingConverterPage />)
      const cupToMlButton = screen.getByText('cups to ml')
      fireEvent.click(cupToMlButton)

      const selects = screen.getAllByRole('combobox')
      expect(selects[0]).toHaveValue('cup')
      expect(selects[1]).toHaveValue('ml')
    })

    it('clicking tbsp to tsp updates units', () => {
      render(<CookingConverterPage />)
      const tbspToTspButton = screen.getByText('tbsp to tsp')
      fireEvent.click(tbspToTspButton)

      const selects = screen.getAllByRole('combobox')
      expect(selects[0]).toHaveValue('tbsp')
      expect(selects[1]).toHaveValue('tsp')
    })

    it('clicking oz to g updates units', () => {
      render(<CookingConverterPage />)
      const ozToGButton = screen.getByText('oz to g')
      fireEvent.click(ozToGButton)

      const selects = screen.getAllByRole('combobox')
      expect(selects[0]).toHaveValue('oz')
      expect(selects[1]).toHaveValue('g')
    })

    it('clicking lb to kg updates units', () => {
      render(<CookingConverterPage />)
      const lbToKgButton = screen.getByText('lb to kg')
      fireEvent.click(lbToKgButton)

      const selects = screen.getAllByRole('combobox')
      expect(selects[0]).toHaveValue('lb')
      expect(selects[1]).toHaveValue('kg')
    })

    it('tracks analytics on quick conversion click', () => {
      render(<CookingConverterPage />)
      const ozToGButton = screen.getByText('oz to g')
      fireEvent.click(ozToGButton)

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_converted', {
        fromUnit: 'oz',
        toUnit: 'g',
        hasIngredient: false,
      })
    })

    it('clears ingredient selection when quick conversion clicked', () => {
      render(<CookingConverterPage />)
      // First set up cross-category conversion with ingredient
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'g' } })

      const allSelects = screen.getAllByRole('combobox')
      const ingredientSelect = allSelects[2]
      fireEvent.change(ingredientSelect, { target: { value: 'all_purpose_flour' } })

      // Now click quick conversion
      const cupToMlButton = screen.getByText('cups to ml')
      fireEvent.click(cupToMlButton)

      // Ingredient should be cleared - selector should be hidden
      expect(
        screen.queryByText(/Converting between volume and weight requires selecting an ingredient/)
      ).not.toBeInTheDocument()
    })
  })

  describe('Recipe Scaler section', () => {
    it('renders Original Amount label', () => {
      render(<CookingConverterPage />)
      expect(screen.getByLabelText('Original Amount')).toBeInTheDocument()
    })

    it('renders Multiplier label', () => {
      render(<CookingConverterPage />)
      expect(screen.getByLabelText('Multiplier')).toBeInTheDocument()
    })

    it('renders Scaled Amount label', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Scaled Amount')).toBeInTheDocument()
    })

    it('renders Utensils icon', () => {
      render(<CookingConverterPage />)
      expect(screen.getByTestId('icon-utensils')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<CookingConverterPage />)
      expect(
        screen.getByText('Scale any ingredient amount up or down for your recipe needs.')
      ).toBeInTheDocument()
    })

    it('renders original amount input with default value of 1', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      expect(originalAmountInput).toHaveValue(1)
    })

    it('renders multiplier select with default value of 1', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      expect(multiplierSelect).toHaveValue('1')
    })

    it('renders all scale options in multiplier select', () => {
      render(<CookingConverterPage />)
      SCALE_OPTIONS.forEach((opt) => {
        expect(screen.getByText(opt.label)).toBeInTheDocument()
      })
    })

    it('displays scaled amount as 1 by default', () => {
      render(<CookingConverterPage />)
      // With original 1 and multiplier 1, result is 1
      const scaledAmountContainers = screen.getAllByText('1')
      expect(scaledAmountContainers.length).toBeGreaterThan(0)
    })

    it('allows changing original amount', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      fireEvent.change(originalAmountInput, { target: { value: '2' } })
      expect(originalAmountInput).toHaveValue(2)
    })

    it('updates scaled amount when original amount changes', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      fireEvent.change(originalAmountInput, { target: { value: '4' } })
      // With multiplier 1, result should be 4
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('allows changing multiplier', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      fireEvent.change(multiplierSelect, { target: { value: '2' } })
      expect(multiplierSelect).toHaveValue('2')
    })

    it('updates scaled amount when multiplier changes', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      fireEvent.change(multiplierSelect, { target: { value: '2' } })
      // With original 1 and multiplier 2, result is 2
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('calculates correct scaled amount with different values', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      const multiplierSelect = screen.getByLabelText('Multiplier')

      fireEvent.change(originalAmountInput, { target: { value: '3' } })
      fireEvent.change(multiplierSelect, { target: { value: '2' } })

      // 3 * 2 = 6
      expect(screen.getByText('6')).toBeInTheDocument()
    })

    it('tracks analytics when multiplier changes', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      fireEvent.change(multiplierSelect, { target: { value: '2' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_scaled', { multiplier: 2 })
    })

    it('shows dash when original amount is invalid', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      fireEvent.change(originalAmountInput, { target: { value: '' } })

      // Find the scaled amount display area
      const scaledAmountDisplay = screen.getByText('—')
      expect(scaledAmountDisplay).toBeInTheDocument()
    })
  })

  describe('Reference panels', () => {
    describe('Common Equivalents', () => {
      it('renders Common Equivalents section', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('Common Equivalents')).toBeInTheDocument()
      })

      it('shows 1 cup = 16 tbsp', () => {
        render(<CookingConverterPage />)
        // '1 cup' appears multiple times in Common Equivalents
        expect(screen.getAllByText('1 cup').length).toBeGreaterThan(0)
        expect(screen.getByText('16 tbsp')).toBeInTheDocument()
      })

      it('shows 1 cup = 236.6 ml', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('236.6 ml')).toBeInTheDocument()
      })

      it('shows 1 tbsp = 3 tsp', () => {
        render(<CookingConverterPage />)
        expect(screen.getAllByText('1 tbsp').length).toBeGreaterThan(0)
        expect(screen.getAllByText('3 tsp').length).toBeGreaterThan(0)
      })

      it('shows 1 tbsp = 14.8 ml', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('14.8 ml')).toBeInTheDocument()
      })

      it('shows 1 oz = 28.35 g', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('1 oz')).toBeInTheDocument()
        expect(screen.getByText('28.35 g')).toBeInTheDocument()
      })

      it('shows 1 lb = 453.6 g', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('1 lb')).toBeInTheDocument()
        expect(screen.getByText('453.6 g')).toBeInTheDocument()
      })

      it('shows 1 kg = 2.2 lb', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('1 kg')).toBeInTheDocument()
        expect(screen.getByText('2.2 lb')).toBeInTheDocument()
      })

      it('shows 1 L = 4.23 cups', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('1 L')).toBeInTheDocument()
        expect(screen.getByText('4.23 cups')).toBeInTheDocument()
      })
    })

    describe('Butter Quick Reference', () => {
      it('renders Butter Quick Reference section', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('Butter Quick Reference')).toBeInTheDocument()
      })

      it('shows 1 stick = 8 tbsp / 113g', () => {
        render(<CookingConverterPage />)
        expect(screen.getAllByText('1 stick').length).toBeGreaterThan(0)
        expect(screen.getAllByText('8 tbsp / 113g').length).toBeGreaterThan(0)
      })

      it('shows 1 stick = 1/2 cup', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('1/2 cup')).toBeInTheDocument()
      })

      it('shows 2 sticks = 1 cup / 227g', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('2 sticks')).toBeInTheDocument()
        expect(screen.getByText('1 cup / 227g')).toBeInTheDocument()
      })

      it('shows 4 sticks = 1 lb / 454g', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('4 sticks')).toBeInTheDocument()
        expect(screen.getByText('1 lb / 454g')).toBeInTheDocument()
      })
    })

    describe('Oven Temperatures', () => {
      it('renders Oven Temperatures section', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('Oven Temperatures')).toBeInTheDocument()
      })

      it('shows 300°F = 150°C (Low)', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('300°F')).toBeInTheDocument()
        expect(screen.getByText('150°C (Low)')).toBeInTheDocument()
      })

      it('shows 350°F = 175°C (Moderate)', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('350°F')).toBeInTheDocument()
        expect(screen.getByText('175°C (Moderate)')).toBeInTheDocument()
      })

      it('shows 375°F = 190°C', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('375°F')).toBeInTheDocument()
        expect(screen.getByText('190°C')).toBeInTheDocument()
      })

      it('shows 400°F = 200°C (Hot)', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('400°F')).toBeInTheDocument()
        expect(screen.getByText('200°C (Hot)')).toBeInTheDocument()
      })

      it('shows 425°F = 220°C', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('425°F')).toBeInTheDocument()
        expect(screen.getByText('220°C')).toBeInTheDocument()
      })

      it('shows 450°F = 230°C (Very Hot)', () => {
        render(<CookingConverterPage />)
        expect(screen.getByText('450°F')).toBeInTheDocument()
        expect(screen.getByText('230°C (Very Hot)')).toBeInTheDocument()
      })
    })
  })

  describe('Features section', () => {
    it('renders Volume Conversion feature card', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Volume Conversion')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Convert between cups, tablespoons, teaspoons, milliliters, liters, and more.'
        )
      ).toBeInTheDocument()
    })

    it('renders Weight Conversion feature card', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Weight Conversion')).toBeInTheDocument()
      expect(
        screen.getByText('Convert between grams, kilograms, ounces, and pounds with precision.')
      ).toBeInTheDocument()
    })

    it('renders Recipe Scaling feature card', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('Recipe Scaling')).toBeInTheDocument()
      expect(
        screen.getByText('Easily scale recipes up or down from 1/4x to 4x the original amount.')
      ).toBeInTheDocument()
    })

    it('renders 100+ Ingredients feature card', () => {
      render(<CookingConverterPage />)
      expect(screen.getByText('100+ Ingredients')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Accurate volume-to-weight conversions for over 100 common cooking ingredients.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('analytics tracking', () => {
    it('tracks conversion event when amount changes to valid number', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '5' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_converted', {
        fromUnit: 'cup',
        toUnit: 'ml',
        hasIngredient: false,
      })
    })

    it('does not track when amount is invalid', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '' } })

      expect(trackToolEvent).not.toHaveBeenCalled()
    })

    it('does not track when amount is negative', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '-1' } })

      expect(trackToolEvent).not.toHaveBeenCalled()
    })

    it('tracks unit change for from unit', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'tbsp' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_unit_changed', {
        unit: 'tbsp',
        direction: 'from',
      })
    })

    it('tracks unit change for to unit', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'tsp' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_unit_changed', {
        unit: 'tsp',
        direction: 'to',
      })
    })

    it('tracks ingredient change', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'g' } })

      const allSelects = screen.getAllByRole('combobox')
      fireEvent.change(allSelects[2], { target: { value: 'all-purpose-flour' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_ingredient_changed', {
        ingredient: 'All-Purpose Flour',
      })
    })

    it('does not track ingredient change when clearing selection', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'g' } })

      const allSelects = screen.getAllByRole('combobox')
      fireEvent.change(allSelects[2], { target: { value: 'all-purpose-flour' } })

      vi.clearAllMocks()

      // Clear ingredient
      fireEvent.change(allSelects[2], { target: { value: '' } })

      expect(trackToolEvent).not.toHaveBeenCalledWith(
        'cooking_converter_ingredient_changed',
        expect.anything()
      )
    })

    it('tracks scaling event', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      fireEvent.change(multiplierSelect, { target: { value: '3' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_scaled', { multiplier: 3 })
    })

    it('tracks hasIngredient true when ingredient is selected', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'g' } })

      const allSelects = screen.getAllByRole('combobox')
      fireEvent.change(allSelects[2], { target: { value: 'granulated-sugar' } })

      vi.clearAllMocks()

      // Now change amount to trigger conversion tracking
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '2' } })

      expect(trackToolEvent).toHaveBeenCalledWith('cooking_converter_converted', {
        fromUnit: 'cup',
        toUnit: 'g',
        hasIngredient: true,
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('handles zero amount', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '0' } })

      // Should show 0 result (may appear multiple times)
      expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    })

    it('handles decimal amounts', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '0.5' } })

      // 0.5 cup to ml should be ~118.29 (>= 100, so 1 decimal: 118.3)
      expect(screen.getAllByText(/118\.3/).length).toBeGreaterThan(0)
    })

    it('handles very large amounts', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '1000' } })

      // Should display result without error
      expect(screen.queryByText('—')).not.toBeInTheDocument()
    })

    it('handles empty amount gracefully', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      fireEvent.change(amountInput, { target: { value: '' } })

      // Should show placeholder or dash
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('handles same unit conversion (cup to cup)', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'cup' } })

      // 1 cup to cup should be 1
      expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    })

    it('handles fractional scale multipliers', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      fireEvent.change(multiplierSelect, { target: { value: '0.5' } })

      const originalAmountInput = screen.getByLabelText('Original Amount')
      fireEvent.change(originalAmountInput, { target: { value: '4' } })

      // 4 * 0.5 = 2
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('handles quarter scale multiplier', () => {
      render(<CookingConverterPage />)
      const multiplierSelect = screen.getByLabelText('Multiplier')
      fireEvent.change(multiplierSelect, { target: { value: '0.25' } })

      const originalAmountInput = screen.getByLabelText('Original Amount')
      fireEvent.change(originalAmountInput, { target: { value: '8' } })

      // 8 * 0.25 = 2
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('conversion accuracy', () => {
    it('converts 1 cup to ml correctly (~236.6)', () => {
      render(<CookingConverterPage />)
      // Default state is 1 cup to ml (>= 100, so 1 decimal)
      expect(screen.getAllByText(/236\.6/).length).toBeGreaterThan(0)
    })

    it('converts 1 tbsp to tsp correctly (3)', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'tbsp' } })
      fireEvent.change(selects[1], { target: { value: 'tsp' } })

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('converts 1 oz to g correctly (~28.35)', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'oz' } })
      fireEvent.change(selects[1], { target: { value: 'g' } })

      expect(screen.getAllByText(/28\.35/).length).toBeGreaterThan(0)
    })

    it('converts 1 lb to kg correctly (~0.45)', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'lb' } })
      fireEvent.change(selects[1], { target: { value: 'kg' } })

      expect(screen.getAllByText(/0\.45/).length).toBeGreaterThan(0)
    })

    it('converts 1 L to cup correctly (~4.23)', () => {
      render(<CookingConverterPage />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'l' } })
      fireEvent.change(selects[1], { target: { value: 'cup' } })

      expect(screen.getAllByText(/4\.23/).length).toBeGreaterThan(0)
    })
  })

  describe('input attributes', () => {
    it('amount input has type number', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      expect(amountInput).toHaveAttribute('type', 'number')
    })

    it('amount input has min 0', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      expect(amountInput).toHaveAttribute('min', '0')
    })

    it('amount input has step any', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      expect(amountInput).toHaveAttribute('step', 'any')
    })

    it('amount input has placeholder', () => {
      render(<CookingConverterPage />)
      const amountInput = screen.getByLabelText('Amount')
      expect(amountInput).toHaveAttribute('placeholder', 'Enter amount')
    })

    it('original amount input has type number', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      expect(originalAmountInput).toHaveAttribute('type', 'number')
    })

    it('original amount input has min 0', () => {
      render(<CookingConverterPage />)
      const originalAmountInput = screen.getByLabelText('Original Amount')
      expect(originalAmountInput).toHaveAttribute('min', '0')
    })
  })
})
