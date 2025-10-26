# 15 - Unit Converter

**Created:** October 26, 2024  
**Last Updated:** October 26, 2024  
**Category:** Productivity Tools  
**Status:** ✅ Active · ⭐ New

## Overview

Comprehensive unit conversion tool supporting 10+ categories and 80+ units. Convert between metric, imperial, and scientific units instantly with bidirectional conversion, favorites system, and precision control—perfect for students, engineers, and everyday calculations.

## Purpose

Unit conversion is essential in science, engineering, cooking, travel, and daily life. This tool eliminates manual calculations and conversion table lookups, providing instant accurate conversions across temperature, length, weight, volume, and more.

## Key Features

### 1. **10+ Conversion Categories**

- **Length**: Meters, feet, inches, miles, kilometers, yards, etc.
- **Weight**: Kilograms, pounds, ounces, grams, tons, stones
- **Temperature**: Celsius, Fahrenheit, Kelvin
- **Volume**: Liters, gallons, milliliters, cups, pints, quarts
- **Area**: Square meters, acres, hectares, square feet
- **Speed**: mph, km/h, m/s, knots
- **Time**: Seconds, minutes, hours, days, weeks, years
- **Energy**: Joules, calories, kilowatt-hours, BTU
- **Pressure**: Pascal, PSI, bar, atmosphere
- **Digital Storage**: Bytes, KB, MB, GB, TB

### 2. **Bidirectional Conversion**

- Instant two-way conversion
- Swap units with one click
- Real-time updates as you type
- No submit button needed

### 3. **Smart Input Handling**

- Accepts decimal numbers
- Scientific notation support
- Negative numbers allowed
- Input validation
- Auto-formatting

### 4. **Precision Control**

- Adjustable decimal places (0-10)
- Scientific notation for large numbers
- Rounded vs exact values
- Appropriate precision per category

### 5. **Favorites System**

- Save frequently used conversions
- Quick access to favorites
- Persistent storage (localStorage)
- One-click selection

### 6. **Common Unit Presets**

- Quick conversion buttons
- Category-specific presets
- Popular conversions highlighted
- Example values for context

## How It Works

### Conversion Algorithm

All conversions use a base unit approach:

```typescript
// Step 1: Convert input to base unit
const baseValue = inputValue * conversionFactor

// Step 2: Convert base unit to target unit
const outputValue = baseValue / targetConversionFactor
```

**Example: Miles to Kilometers**

```
Input: 5 miles
Base unit: meters
Step 1: 5 miles × 1609.344 = 8046.72 meters
Step 2: 8046.72 meters ÷ 1000 = 8.04672 km
Result: 8.05 km
```

### Temperature Conversion

Special formulas for temperature (not simple multiplication):

```typescript
// Celsius to Fahrenheit
F = (C × 9/5) + 32

// Fahrenheit to Celsius
C = (F - 32) × 5/9

// Celsius to Kelvin
K = C + 273.15

// Kelvin to Celsius
C = K - 273.15
```

### Unit Definitions

```typescript
interface Unit {
  name: string
  symbol: string
  toBase: number // Multiplication factor to base unit
  offset?: number // For temperature conversions
}

// Example: Length units
const lengthUnits: Unit[] = [
  { name: 'Meter', symbol: 'm', toBase: 1 },
  { name: 'Kilometer', symbol: 'km', toBase: 0.001 },
  { name: 'Mile', symbol: 'mi', toBase: 0.000621371 },
  { name: 'Foot', symbol: 'ft', toBase: 3.28084 },
  { name: 'Inch', symbol: 'in', toBase: 39.3701 },
]
```

### Conversion Functions

```typescript
const convert = (value: number, fromUnit: string, toUnit: string, category: string): number => {
  const units = getUnitsForCategory(category)
  const from = units.find((u) => u.symbol === fromUnit)
  const to = units.find((u) => u.symbol === toUnit)

  if (!from || !to) return 0

  // Convert to base unit
  const baseValue = value * from.toBase

  // Convert from base to target
  const result = baseValue / to.toBase

  return result
}
```

### State Management

```typescript
const [category, setCategory] = useState<Category>('length')
const [fromUnit, setFromUnit] = useState('m')
const [toUnit, setToUnit] = useState('ft')
const [fromValue, setFromValue] = useState('')
const [toValue, setToValue] = useState('')
const [precision, setPrecision] = useState(2)
const [favorites, setFavorites] = useState<Favorite[]>([])
```

## Usage Instructions

### Basic Conversion

1. **Select Category**: Choose from dropdown (Length, Weight, etc.)
2. **Enter Value**: Type number in "From" field
3. **Select Units**: Choose from/to units from dropdowns
4. **View Result**: Conversion appears instantly in "To" field

**Example:**

```
Category: Length
From: 100 meters
To: ? feet
Result: 328.08 feet
```

### Swap Units

Click the swap icon (🔄) between the fields to reverse conversion direction:

```
Before: 5 miles → ? km
Click swap
After: ? miles ← 8.05 km
```

### Adjust Precision

Use the precision slider to control decimal places:

```
Value: 3.14159265359
Precision 0: 3
Precision 2: 3.14
Precision 5: 3.14159
Precision 10: 3.1415926536
```

### Save to Favorites

1. Set up a conversion (category + units)
2. Click "Add to Favorites" button
3. Access later from Favorites section
4. Remove by clicking trash icon

### Quick Presets

Click preset buttons for common conversions:

**Length:**

- 1 km → miles
- 1 mile → km
- 1 m → feet
- 1 inch → cm

**Temperature:**

- 0°C → °F (freezing)
- 100°C → °F (boiling)
- 98.6°F → °C (body temp)

## Conversion Reference

### Length Conversions

| Unit       | Symbol | Meters     |
| ---------- | ------ | ---------- |
| Kilometer  | km     | 1000 m     |
| Meter      | m      | 1 m        |
| Centimeter | cm     | 0.01 m     |
| Millimeter | mm     | 0.001 m    |
| Mile       | mi     | 1609.344 m |
| Yard       | yd     | 0.9144 m   |
| Foot       | ft     | 0.3048 m   |
| Inch       | in     | 0.0254 m   |

### Weight Conversions

| Unit       | Symbol | Kilograms    |
| ---------- | ------ | ------------ |
| Metric Ton | t      | 1000 kg      |
| Kilogram   | kg     | 1 kg         |
| Gram       | g      | 0.001 kg     |
| Milligram  | mg     | 0.000001 kg  |
| Pound      | lb     | 0.453592 kg  |
| Ounce      | oz     | 0.0283495 kg |
| Stone      | st     | 6.35029 kg   |

### Temperature Conversions

| Scale      | Freezing | Boiling  | Absolute Zero |
| ---------- | -------- | -------- | ------------- |
| Celsius    | 0°C      | 100°C    | -273.15°C     |
| Fahrenheit | 32°F     | 212°F    | -459.67°F     |
| Kelvin     | 273.15 K | 373.15 K | 0 K           |

### Volume Conversions

| Unit        | Symbol | Liters     |
| ----------- | ------ | ---------- |
| Cubic Meter | m³     | 1000 L     |
| Liter       | L      | 1 L        |
| Milliliter  | mL     | 0.001 L    |
| Gallon (US) | gal    | 3.78541 L  |
| Quart (US)  | qt     | 0.946353 L |
| Pint (US)   | pt     | 0.473176 L |
| Cup (US)    | cup    | 0.236588 L |

### Speed Conversions

| Unit            | Symbol | m/s          |
| --------------- | ------ | ------------ |
| Meters/second   | m/s    | 1 m/s        |
| Kilometers/hour | km/h   | 0.277778 m/s |
| Miles/hour      | mph    | 0.44704 m/s  |
| Feet/second     | ft/s   | 0.3048 m/s   |
| Knot            | kn     | 0.514444 m/s |

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  Header (Repeat Icon + Title)      │
├─────────────────────────────────────┤
│  Category Selector [Dropdown]      │
├─────────────────────────────────────┤
│  From Panel                         │
│  ┌───────────────────────────────┐ │
│  │  Value Input                  │ │
│  │  Unit Dropdown                │ │
│  └───────────────────────────────┘ │
│           [🔄 Swap Icon]           │
│  To Panel                           │
│  ┌───────────────────────────────┐ │
│  │  Result Display               │ │
│  │  Unit Dropdown                │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Precision Slider: [0-10]          │
├─────────────────────────────────────┤
│  Quick Presets                      │
│  [1 km→mi] [1 mi→km] [1 m→ft]     │
├─────────────────────────────────────┤
│  Favorites                          │
│  ⭐ Length: m → ft [×]             │
│  ⭐ Weight: kg → lb [×]            │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Blue to cyan (conversion/transformation theme)
- **Glass Cards**: Translucent panels with backdrop blur
- **Large Input Fields**: Easy to read numbers
- **Unit Badges**: Color-coded by category
- **Swap Animation**: Smooth rotation on click

### Responsive Design

- **Desktop**: Side-by-side conversion panels
- **Tablet**: Stacked with comfortable spacing
- **Mobile**: Full-width panels, large touch targets

## Analytics Events

```typescript
trackToolEvent('unit_convert', {
  category: 'length',
  from_unit: 'meters',
  to_unit: 'feet',
  value: 100,
})

trackToolEvent('unit_swap', {
  category: 'temperature',
})

trackToolEvent('unit_favorite_add', {
  category: 'weight',
  from_unit: 'kg',
  to_unit: 'lb',
})

trackToolEvent('unit_precision_change', {
  precision: 5,
})
```

## Common Use Cases

### 1. **Cooking Conversions**

```
Recipe: 250 mL milk
Need: Cups
Convert: 250 mL → 1.06 cups
```

### 2. **Travel Planning**

```
Speed limit: 100 km/h
In mph? 100 km/h → 62.14 mph

Distance: 500 km
In miles? 500 km → 310.69 miles
```

### 3. **Weather Understanding**

```
Forecast: 25°C
In Fahrenheit? 25°C → 77°F

Winter: -10°C
In Fahrenheit? -10°C → 14°F
```

### 4. **Construction & DIY**

```
Room: 3.5 meters wide
In feet? 3.5 m → 11.48 ft

Board: 8 feet long
In meters? 8 ft → 2.44 m
```

### 5. **Science & Engineering**

```
Pressure: 101.325 kPa
In PSI? 101.325 kPa → 14.7 PSI

Energy: 1000 calories
In joules? 1000 cal → 4184 J
```

### 6. **Digital Storage**

```
File: 1.5 GB
In MB? 1.5 GB → 1536 MB
In MB? 1.5 GB → 1,572,864 KB
```

## Precision Guidelines

### Recommended Precision by Category

| Category    | Precision | Reason                 |
| ----------- | --------- | ---------------------- |
| Length      | 2-3       | Practical measurements |
| Weight      | 2         | Standard scales        |
| Temperature | 1         | Weather forecasts      |
| Volume      | 2         | Cooking recipes        |
| Area        | 2         | Real estate            |
| Speed       | 1-2       | Vehicle speeds         |
| Energy      | 0-2       | Utility bills          |
| Pressure    | 1         | Tire pressure, weather |
| Time        | 0-2       | Duration calculations  |
| Digital     | 0         | Whole units            |

## Performance

- **Instant Conversion**: < 1ms calculation time
- **Real-time Updates**: No lag while typing
- **Lightweight**: Zero dependencies for math
- **Memory Efficient**: Minimal state storage
- **Favorites Persistence**: localStorage (< 1KB)

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Mobile browsers (iOS Safari, Chrome Mobile)  
✅ Works offline after initial load  
✅ No server required

## Limitations

- **Very Large Numbers**: JavaScript precision limits (15-17 significant digits)
- **Scientific Accuracy**: Rounded to practical precision
- **Historical Units**: Ancient units not included
- **Regional Variations**: Uses international standards

## Accuracy Notes

### Floating Point Precision

JavaScript uses 64-bit floating point (IEEE 754):

- 15-17 significant decimal digits
- Some decimal values can't be represented exactly
- Example: 0.1 + 0.2 = 0.30000000000000004

**Mitigation:** Results are rounded to selected precision.

### Conversion Factors

All factors sourced from:

- International System of Units (SI)
- National Institute of Standards (NIST)
- International Bureau of Weights and Measures

### Temperature Special Cases

- Kelvin has no negative values (absolute zero = 0 K)
- Celsius/Fahrenheit conversions use exact formulas
- No rounding of intermediate values

## Future Enhancements

- [ ] Currency conversion integration
- [ ] Historical unit systems (Roman, Biblical)
- [ ] Compound unit conversions (km/h → m/s)
- [ ] Batch conversion mode
- [ ] Custom unit creation
- [ ] Conversion history
- [ ] Share conversion via URL
- [ ] Dark/light theme toggle
- [ ] Voice input for values
- [ ] Keyboard shortcuts

## Related Tools

- **Calculator** _(Coming Soon)_ - Basic arithmetic
- **Percentage Calculator** _(Coming Soon)_ - Calculate percentages
- **Currency Converter** _(Coming Soon)_ - Real-time exchange rates
- **Text Transformer** - Format numbers

## Learning Resources

### Common Conversions to Memorize

**Length:**

- 1 inch = 2.54 cm (exact)
- 1 mile ≈ 1.6 km
- 1 meter ≈ 3.3 feet

**Weight:**

- 1 kg ≈ 2.2 pounds
- 1 pound ≈ 454 grams
- 1 ounce ≈ 28 grams

**Temperature:**

- 0°C = 32°F (freezing)
- 100°C = 212°F (boiling)
- -40°C = -40°F (equal point)

**Volume:**

- 1 liter ≈ 0.26 gallons
- 1 gallon ≈ 3.8 liters
- 1 cup = 237 mL

## Tips & Tricks

💡 **Use Favorites**: Save your most common conversions  
💡 **Adjust Precision**: Match your needs (cooking vs engineering)  
💡 **Quick Presets**: Faster than typing for common values  
💡 **Swap Button**: Reverse direction instead of retyping  
💡 **Scientific Notation**: For very large/small numbers

## Keyboard Shortcuts (Future)

Planned shortcuts:

- `Tab`: Switch between fields
- `Ctrl/Cmd + S`: Swap units
- `Ctrl/Cmd + F`: Add to favorites
- `↑/↓`: Adjust precision
- `Ctrl/Cmd + C`: Copy result

---

**Route:** `/tools/unit-converter`  
**Component:** `app/tools/unit-converter/page.tsx`  
**Utils:** `app/tools/unit-converter/utils.ts`  
**Dependencies:** None (pure JavaScript math)  
**Tests:** `app/tools/unit-converter/__tests__/` (55 logic tests, 12 component tests)
