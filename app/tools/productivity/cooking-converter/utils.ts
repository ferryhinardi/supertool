// Cooking Unit Converter - Conversion utilities

// Volume units in milliliters (base unit)
export const VOLUME_UNITS = {
  ml: { name: 'Milliliter', abbr: 'ml', toBase: 1 },
  l: { name: 'Liter', abbr: 'L', toBase: 1000 },
  tsp: { name: 'Teaspoon', abbr: 'tsp', toBase: 4.92892 },
  tbsp: { name: 'Tablespoon', abbr: 'tbsp', toBase: 14.7868 },
  floz: { name: 'Fluid Ounce', abbr: 'fl oz', toBase: 29.5735 },
  cup: { name: 'Cup', abbr: 'cup', toBase: 236.588 },
  pint: { name: 'Pint', abbr: 'pt', toBase: 473.176 },
  quart: { name: 'Quart', abbr: 'qt', toBase: 946.353 },
  gallon: { name: 'Gallon', abbr: 'gal', toBase: 3785.41 },
} as const

// Weight units in grams (base unit)
export const WEIGHT_UNITS = {
  g: { name: 'Gram', abbr: 'g', toBase: 1 },
  kg: { name: 'Kilogram', abbr: 'kg', toBase: 1000 },
  oz: { name: 'Ounce', abbr: 'oz', toBase: 28.3495 },
  lb: { name: 'Pound', abbr: 'lb', toBase: 453.592 },
  mg: { name: 'Milligram', abbr: 'mg', toBase: 0.001 },
} as const

export type VolumeUnit = keyof typeof VOLUME_UNITS
export type WeightUnit = keyof typeof WEIGHT_UNITS
export type Unit = VolumeUnit | WeightUnit

export type UnitCategory = 'volume' | 'weight'

// Ingredient densities (grams per cup)
// This allows conversion between volume and weight for specific ingredients
export const INGREDIENTS = {
  // Flours
  'all-purpose-flour': { name: 'All-Purpose Flour', gramsPerCup: 125, category: 'Flour' },
  'bread-flour': { name: 'Bread Flour', gramsPerCup: 127, category: 'Flour' },
  'cake-flour': { name: 'Cake Flour', gramsPerCup: 114, category: 'Flour' },
  'whole-wheat-flour': { name: 'Whole Wheat Flour', gramsPerCup: 120, category: 'Flour' },
  'almond-flour': { name: 'Almond Flour', gramsPerCup: 96, category: 'Flour' },
  'coconut-flour': { name: 'Coconut Flour', gramsPerCup: 112, category: 'Flour' },
  'oat-flour': { name: 'Oat Flour', gramsPerCup: 92, category: 'Flour' },
  'rye-flour': { name: 'Rye Flour', gramsPerCup: 102, category: 'Flour' },

  // Sugars
  'granulated-sugar': { name: 'Granulated Sugar', gramsPerCup: 200, category: 'Sugar' },
  'brown-sugar-packed': { name: 'Brown Sugar (packed)', gramsPerCup: 220, category: 'Sugar' },
  'brown-sugar-loose': { name: 'Brown Sugar (loose)', gramsPerCup: 145, category: 'Sugar' },
  'powdered-sugar': { name: 'Powdered Sugar', gramsPerCup: 120, category: 'Sugar' },
  honey: { name: 'Honey', gramsPerCup: 340, category: 'Sugar' },
  'maple-syrup': { name: 'Maple Syrup', gramsPerCup: 322, category: 'Sugar' },
  molasses: { name: 'Molasses', gramsPerCup: 328, category: 'Sugar' },
  'corn-syrup': { name: 'Corn Syrup', gramsPerCup: 328, category: 'Sugar' },

  // Dairy
  butter: { name: 'Butter', gramsPerCup: 227, category: 'Dairy' },
  milk: { name: 'Milk', gramsPerCup: 245, category: 'Dairy' },
  'heavy-cream': { name: 'Heavy Cream', gramsPerCup: 238, category: 'Dairy' },
  'sour-cream': { name: 'Sour Cream', gramsPerCup: 242, category: 'Dairy' },
  yogurt: { name: 'Yogurt', gramsPerCup: 245, category: 'Dairy' },
  'cream-cheese': { name: 'Cream Cheese', gramsPerCup: 232, category: 'Dairy' },
  'cottage-cheese': { name: 'Cottage Cheese', gramsPerCup: 225, category: 'Dairy' },
  'parmesan-grated': { name: 'Parmesan (grated)', gramsPerCup: 100, category: 'Dairy' },
  'cheddar-shredded': { name: 'Cheddar (shredded)', gramsPerCup: 113, category: 'Dairy' },

  // Liquids
  water: { name: 'Water', gramsPerCup: 237, category: 'Liquid' },
  'vegetable-oil': { name: 'Vegetable Oil', gramsPerCup: 218, category: 'Liquid' },
  'olive-oil': { name: 'Olive Oil', gramsPerCup: 216, category: 'Liquid' },
  'coconut-oil': { name: 'Coconut Oil', gramsPerCup: 218, category: 'Liquid' },

  // Grains & Starches
  'rice-uncooked': { name: 'Rice (uncooked)', gramsPerCup: 185, category: 'Grain' },
  'oats-rolled': { name: 'Rolled Oats', gramsPerCup: 90, category: 'Grain' },
  'oats-instant': { name: 'Instant Oats', gramsPerCup: 80, category: 'Grain' },
  cornstarch: { name: 'Cornstarch', gramsPerCup: 128, category: 'Grain' },
  breadcrumbs: { name: 'Breadcrumbs', gramsPerCup: 108, category: 'Grain' },
  cornmeal: { name: 'Cornmeal', gramsPerCup: 150, category: 'Grain' },

  // Nuts & Seeds
  'almonds-whole': { name: 'Almonds (whole)', gramsPerCup: 143, category: 'Nut' },
  'almonds-sliced': { name: 'Almonds (sliced)', gramsPerCup: 92, category: 'Nut' },
  'walnuts-chopped': { name: 'Walnuts (chopped)', gramsPerCup: 117, category: 'Nut' },
  'pecans-chopped': { name: 'Pecans (chopped)', gramsPerCup: 109, category: 'Nut' },
  peanuts: { name: 'Peanuts', gramsPerCup: 146, category: 'Nut' },
  'peanut-butter': { name: 'Peanut Butter', gramsPerCup: 258, category: 'Nut' },
  'chia-seeds': { name: 'Chia Seeds', gramsPerCup: 160, category: 'Nut' },
  'flax-seeds': { name: 'Flax Seeds', gramsPerCup: 168, category: 'Nut' },
  'sesame-seeds': { name: 'Sesame Seeds', gramsPerCup: 144, category: 'Nut' },

  // Chocolate & Cocoa
  'cocoa-powder': { name: 'Cocoa Powder', gramsPerCup: 85, category: 'Chocolate' },
  'chocolate-chips': { name: 'Chocolate Chips', gramsPerCup: 170, category: 'Chocolate' },

  // Leaveners & Spices
  'baking-powder': { name: 'Baking Powder', gramsPerCup: 230, category: 'Leavener' },
  'baking-soda': { name: 'Baking Soda', gramsPerCup: 220, category: 'Leavener' },
  'salt-table': { name: 'Table Salt', gramsPerCup: 288, category: 'Spice' },
  'salt-kosher': { name: 'Kosher Salt', gramsPerCup: 241, category: 'Spice' },

  // Fruits
  raisins: { name: 'Raisins', gramsPerCup: 145, category: 'Fruit' },
  'dried-cranberries': { name: 'Dried Cranberries', gramsPerCup: 120, category: 'Fruit' },
  'banana-mashed': { name: 'Banana (mashed)', gramsPerCup: 225, category: 'Fruit' },
  applesauce: { name: 'Applesauce', gramsPerCup: 244, category: 'Fruit' },

  // Eggs
  'egg-whole': { name: 'Egg (whole, beaten)', gramsPerCup: 243, category: 'Egg' },
  'egg-white': { name: 'Egg White', gramsPerCup: 243, category: 'Egg' },
  'egg-yolk': { name: 'Egg Yolk', gramsPerCup: 243, category: 'Egg' },
} as const

export type IngredientId = keyof typeof INGREDIENTS

export interface Ingredient {
  name: string
  gramsPerCup: number
  category: string
}

export interface ConversionResult {
  value: number
  formatted: string
  unit: Unit
  unitName: string
}

export interface ScaledIngredient {
  original: string
  scaled: string
  amount: number
  scaledAmount: number
  unit: string
}

// Get unit category
export function getUnitCategory(unit: Unit): UnitCategory {
  if (unit in VOLUME_UNITS) return 'volume'
  return 'weight'
}

// Check if units are compatible (same category or have ingredient for conversion)
export function areUnitsCompatible(
  fromUnit: Unit,
  toUnit: Unit,
  ingredientId?: IngredientId
): boolean {
  const fromCategory = getUnitCategory(fromUnit)
  const toCategory = getUnitCategory(toUnit)

  // Same category units are always compatible
  if (fromCategory === toCategory) return true

  // Cross-category requires an ingredient
  return !!ingredientId
}

// Convert between volume units
export function convertVolume(value: number, fromUnit: VolumeUnit, toUnit: VolumeUnit): number {
  const fromData = VOLUME_UNITS[fromUnit]
  const toData = VOLUME_UNITS[toUnit]

  // Convert to base unit (ml), then to target unit
  const inMl = value * fromData.toBase
  return inMl / toData.toBase
}

// Convert between weight units
export function convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  const fromData = WEIGHT_UNITS[fromUnit]
  const toData = WEIGHT_UNITS[toUnit]

  // Convert to base unit (g), then to target unit
  const inGrams = value * fromData.toBase
  return inGrams / toData.toBase
}

// Convert volume to weight using ingredient density
export function volumeToWeight(
  value: number,
  volumeUnit: VolumeUnit,
  weightUnit: WeightUnit,
  ingredientId: IngredientId
): number {
  const ingredient = INGREDIENTS[ingredientId]

  // First convert volume to cups
  const inCups = convertVolume(value, volumeUnit, 'cup')

  // Convert cups to grams using ingredient density
  const inGrams = inCups * ingredient.gramsPerCup

  // Convert grams to target weight unit
  return convertWeight(inGrams, 'g', weightUnit)
}

// Convert weight to volume using ingredient density
export function weightToVolume(
  value: number,
  weightUnit: WeightUnit,
  volumeUnit: VolumeUnit,
  ingredientId: IngredientId
): number {
  const ingredient = INGREDIENTS[ingredientId]

  // First convert weight to grams
  const inGrams = convertWeight(value, weightUnit, 'g')

  // Convert grams to cups using ingredient density
  const inCups = inGrams / ingredient.gramsPerCup

  // Convert cups to target volume unit
  return convertVolume(inCups, 'cup', volumeUnit)
}

// Main conversion function
export function convert(
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  ingredientId?: IngredientId
): ConversionResult {
  const fromCategory = getUnitCategory(fromUnit)
  const toCategory = getUnitCategory(toUnit)

  let result: number

  if (fromCategory === toCategory) {
    // Same category conversion
    if (fromCategory === 'volume') {
      result = convertVolume(value, fromUnit as VolumeUnit, toUnit as VolumeUnit)
    } else {
      result = convertWeight(value, fromUnit as WeightUnit, toUnit as WeightUnit)
    }
  } else if (ingredientId) {
    // Cross-category conversion with ingredient
    if (fromCategory === 'volume') {
      result = volumeToWeight(value, fromUnit as VolumeUnit, toUnit as WeightUnit, ingredientId)
    } else {
      result = weightToVolume(value, fromUnit as WeightUnit, toUnit as VolumeUnit, ingredientId)
    }
  } else {
    throw new Error('Ingredient required for volume-to-weight conversion')
  }

  const unitData =
    fromCategory === toCategory
      ? toCategory === 'volume'
        ? VOLUME_UNITS[toUnit as VolumeUnit]
        : WEIGHT_UNITS[toUnit as WeightUnit]
      : toCategory === 'volume'
        ? VOLUME_UNITS[toUnit as VolumeUnit]
        : WEIGHT_UNITS[toUnit as WeightUnit]

  return {
    value: result,
    formatted: formatNumber(result),
    unit: toUnit,
    unitName: unitData.name,
  }
}

// Format number with appropriate precision
export function formatNumber(value: number): string {
  if (value === 0) return '0'

  // For very small numbers
  if (Math.abs(value) < 0.001) {
    return value.toExponential(2)
  }

  // For small numbers, show more decimal places
  if (Math.abs(value) < 0.1) {
    return value.toFixed(4).replace(/\.?0+$/, '')
  }

  if (Math.abs(value) < 1) {
    return value.toFixed(3).replace(/\.?0+$/, '')
  }

  // For regular numbers
  if (Math.abs(value) < 100) {
    return value.toFixed(2).replace(/\.?0+$/, '')
  }

  // For larger numbers
  return value.toFixed(1).replace(/\.?0+$/, '')
}

// Scale a recipe by a multiplier
export function scaleRecipe(amount: number, multiplier: number): number {
  return amount * multiplier
}

// Get all units grouped by category
export function getAllUnits(): { volume: typeof VOLUME_UNITS; weight: typeof WEIGHT_UNITS } {
  return {
    volume: VOLUME_UNITS,
    weight: WEIGHT_UNITS,
  }
}

// Get ingredients grouped by category
export function getIngredientsByCategory(): Record<string, { id: IngredientId; name: string }[]> {
  const grouped: Record<string, { id: IngredientId; name: string }[]> = {}

  for (const [id, data] of Object.entries(INGREDIENTS)) {
    if (!grouped[data.category]) {
      grouped[data.category] = []
    }
    grouped[data.category].push({ id: id as IngredientId, name: data.name })
  }

  return grouped
}

// Common conversion presets
export const QUICK_CONVERSIONS = [
  { from: 'tbsp', to: 'tsp', label: 'tbsp to tsp' },
  { from: 'cup', to: 'ml', label: 'cups to ml' },
  { from: 'oz', to: 'g', label: 'oz to g' },
  { from: 'lb', to: 'kg', label: 'lb to kg' },
  { from: 'cup', to: 'tbsp', label: 'cups to tbsp' },
  { from: 'l', to: 'cup', label: 'L to cups' },
] as const

// Common recipe scaling options
export const SCALE_OPTIONS = [
  { value: 0.25, label: '1/4x' },
  { value: 0.5, label: '1/2x' },
  { value: 0.75, label: '3/4x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: 4, label: '4x' },
] as const
