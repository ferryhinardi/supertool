# Unit Converter

**Created**: January 6, 2026  
**Last Updated**: January 6, 2026  
**Tool Path**: `/tools/productivity/unit-converter`  
**Category**: Productivity Tools  
**Complexity**: Very Complex (2648 lines + 657 lines utils)

## Overview

A comprehensive unit conversion tool supporting 11 categories and 100+ units across metric, imperial, and scientific measurement systems. Features real-time conversion with up to 10 decimal places of precision, multi-step chain conversions, favorites, conversion history, and detailed formula explanations.

## Key Features

- **11 Unit Categories**: Length, Weight/Mass, Temperature, Volume, Area, Speed, Time, Pressure, Energy, Power, and Digital Storage
- **100+ Supported Units**: From nanometers to nautical miles, milligrams to metric tons
- **Real-Time Conversion**: Instant results as you type with high precision (up to 10 decimal places)
- **Formula Explanations**: Step-by-step breakdown of how conversions work
- **Multi-Step Chain Conversions**: Chain multiple units together (e.g., km -> m -> ft -> in)
- **8 Built-in Chain Presets**: Quick-start templates for common conversion chains
- **Favorite Conversions**: Save frequently used unit pairs for quick access
- **Conversion History**: Automatic tracking of last 50 conversions with export capability
- **Swap Function**: One-click reversal of source and target units
- **URL State Persistence**: Share specific conversions via URL parameters
- **Offline Support**: All calculations run locally in browser

## Supported Unit Categories

### 1. Length (11 units)
- Meter (m), Kilometer (km), Centimeter (cm), Millimeter (mm)
- Micrometer (um), Nanometer (nm)
- Mile (mi), Yard (yd), Foot (ft), Inch (in)
- Nautical Mile (nmi)

### 2. Weight / Mass (8 units)
- Kilogram (kg), Gram (g), Milligram (mg), Metric Ton (t)
- Pound (lb), Ounce (oz), Ton US (ton), Stone (st)

### 3. Temperature (3 units)
- Celsius (C), Fahrenheit (F), Kelvin (K)

### 4. Volume (11 units)
- Liter (L), Milliliter (mL), Cubic Meter (m3), Cubic Centimeter (cm3)
- Gallon US (gal), Quart US (qt), Pint US (pt), Cup US (cup)
- Fluid Ounce US (fl oz), Tablespoon (tbsp), Teaspoon (tsp)

### 5. Area (10 units)
- Square Meter (m2), Square Kilometer (km2), Square Centimeter (cm2), Square Millimeter (mm2)
- Hectare (ha), Acre (ac), Square Mile (mi2)
- Square Yard (yd2), Square Foot (ft2), Square Inch (in2)

### 6. Speed (6 units)
- Meter per Second (m/s), Kilometer per Hour (km/h)
- Mile per Hour (mph), Foot per Second (ft/s)
- Knot (kn), Mach (Ma)

### 7. Time (10 units)
- Second (s), Millisecond (ms), Microsecond (us), Nanosecond (ns)
- Minute (min), Hour (h), Day (d), Week (wk)
- Month (mo), Year (yr)

### 8. Pressure (6 units)
- Pascal (Pa), Kilopascal (kPa), Bar (bar)
- Atmosphere (atm), PSI (psi), Torr (Torr)

### 9. Energy (8 units)
- Joule (J), Kilojoule (kJ), Calorie (cal), Kilocalorie (kcal)
- Watt-hour (Wh), Kilowatt-hour (kWh), Electronvolt (eV), BTU (BTU)

### 10. Power (5 units)
- Watt (W), Kilowatt (kW), Megawatt (MW)
- Horsepower (hp), BTU per Hour (BTU/h)

### 11. Digital Storage (10 units)
- Byte (B), Kilobyte (KB), Megabyte (MB), Gigabyte (GB), Terabyte (TB), Petabyte (PB)
- Bit (bit), Kilobit (Kb), Megabit (Mb), Gigabit (Gb)

## How to Use

### Basic Conversion

1. **Select a Category**
   - Click on one of the 11 category buttons (Length, Weight, Temperature, etc.)
   - On mobile, tap the category picker to open the selection sheet

2. **Enter Your Value**
   - Type a number in the "From" input field
   - Supports decimal values and scientific notation

3. **Select Units**
   - Choose the source unit from the "From" dropdown
   - Choose the target unit from the "To" dropdown

4. **View Result**
   - The converted value appears instantly in the "To" field
   - Results show up to 10 decimal places (trailing zeros removed)

### Using the Swap Function

- Click the **"Swap Units"** button between the From and To fields
- This exchanges the source and target units
- The input value is also swapped to the previous result

### Viewing Formula Details

1. Complete a conversion (enter a value and select units)
2. A formula panel appears below the result
3. Click **"Show Details"** to see:
   - The mathematical formula used
   - Step-by-step calculation breakdown
   - Explanation of how the conversion works

### Multi-Step Chain Conversions

1. Click **"Start Chain"** in the Multi-Step Conversions card
2. Enter a starting value in the input field
3. Click **"Add Step"** to add more units to the chain
4. Change any step's unit using the dropdown
5. See all intermediate values calculated automatically

**Example Chain**: 1 kilometer -> 1000 meters -> 3280.84 feet -> 39370.08 inches

### Using Chain Presets

8 built-in presets are available:
- **Metric Length Ladder**: km -> m -> cm -> mm
- **Imperial Length Ladder**: mi -> yd -> ft -> in
- **Metric Weight Ladder**: t -> kg -> g -> mg
- **Imperial Weight Ladder**: ton -> lb -> oz
- **Temperature Scale Tour**: C -> F -> K
- **Metric Volume Ladder**: L -> dL -> cL -> mL
- **Time Cascade**: day -> hour -> minute -> second
- **Data Storage Scale**: TB -> GB -> MB -> KB -> B

Click any preset to instantly load it into the chain converter.

### Saving Custom Chains

1. Create a chain with at least 2 steps
2. Click **"Save Chain"** in the summary area
3. Enter a name for your chain
4. Your chain appears in "Your Saved Chains" for future use

### Managing Favorites

1. Set up a conversion you use frequently
2. Click **"Add to Favorites"** (star button)
3. Access favorites from the Favorite Conversions card
4. Click any favorite to load it instantly
5. Click the trash icon to remove a favorite

### Using Conversion History

- History is automatically recorded (last 50 conversions)
- Click any history item to reload that conversion
- Export history as CSV for record-keeping
- Click "Clear" to remove all history

## Use Cases

### Everyday Life
- **Cooking & Baking**: Convert cups to milliliters, tablespoons to grams
- **Travel**: Convert miles to kilometers, Fahrenheit to Celsius
- **Shopping**: Convert pounds to kilograms for international purchases
- **Fitness**: Convert body weight between units, track running distances

### Professional Applications
- **Engineering**: Convert pressure units (PSI to bar), power (hp to kW)
- **Science**: Use precise conversions with high decimal precision
- **Construction**: Convert between metric and imperial measurements
- **IT/Tech**: Convert data storage and transfer rates

### Education
- **Learning Unit Systems**: See step-by-step formula explanations
- **Cross-System Understanding**: Compare metric and imperial values
- **Scientific Calculations**: Use electronvolts, joules, and other scientific units

### International Business
- **Product Specifications**: Convert between regional measurement standards
- **Documentation**: Export conversion history for records
- **Quick Reference**: Save common conversion pairs as favorites

## Tips & Tricks

1. **Scientific Notation**: Enter large or small numbers like "1e6" for 1,000,000
2. **Quick Reverse**: Use the Swap button instead of re-selecting units manually
3. **URL Sharing**: The URL updates with your conversion - share it to send exact conversions
4. **Chain Templates**: Use presets as starting points, then modify steps as needed
5. **History as Reference**: Don't clear history - use it as a quick-access log
6. **Offline Use**: After first load, the tool works completely offline
7. **Precision Control**: Results auto-trim trailing zeros for cleaner display
8. **Keyboard Navigation**: Tab through fields for faster input

## Pro Tips Card

The built-in Pro Tips section highlights:
- Use the swap button for quick reversal
- Save frequently used conversions as favorites
- All conversions work offline
- Supports scientific notation for extreme values

## Troubleshooting

### Conversion Shows "Error"
- **Cause**: Invalid input value or incompatible units
- **Solution**: Ensure you've entered a valid number and selected units from the same category

### Result Shows Too Many Decimal Places
- **Cause**: Some conversions produce very precise results
- **Solution**: Results are automatically trimmed; copy the value and round as needed

### Favorites Not Saving
- **Cause**: Browser localStorage may be disabled or full
- **Solution**: Clear browser cache or enable localStorage in browser settings

### Chain Conversions Not Calculating
- **Cause**: Category mismatch between steps
- **Solution**: Ensure all units in the chain belong to the same category

### History Not Appearing
- **Cause**: No conversions performed yet or history cleared
- **Solution**: Perform a conversion; history saves automatically

## Technical Details

### Libraries Used
- **React 19**: Core framework with hooks (useState, useEffect, useMemo, useCallback)
- **nuqs**: URL state management for shareable conversions
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Icon library (30+ icons used)
- **Sonner**: Toast notifications

### Conversion Algorithm
All conversions use a two-step process:
1. Convert source value to a base unit using `toBase()` function
2. Convert from base unit to target using `fromBase()` function

```typescript
const baseValue = from.toBase(value)
return to.fromBase(baseValue)
```

### Performance
- **Real-time calculation**: Uses `useMemo` for efficient re-computation
- **Lazy initialization**: Favorites/history load only on client-side mount
- **No server calls**: All math happens in browser
- **State persistence**: URL params + localStorage for data retention

### Browser Compatibility
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers fully supported
- Works offline after initial page load
- Responsive design for all screen sizes

### Privacy & Security
- **100% Client-Side**: No data sent to servers
- **Local Storage Only**: Favorites, history, saved chains stored in browser
- **No Tracking of Values**: Only generic analytics events logged
- **Offline Capable**: Works without internet connection

### Data Storage
- Favorites: `localStorage.unitConverterFavorites`
- History: `localStorage.unitConverterHistory` (max 50 items)
- Saved Chains: `localStorage.unitConverterSavedChains`

## Analytics Events

| Event | Description |
|-------|-------------|
| `unit_converter_open` | Page opened |
| `unit_converter_swap` | Units swapped |
| `unit_converter_convert` | Formula details toggled |
| `unit_converter_favorite_add` | Favorite added |
| `unit_converter_favorite_remove` | Favorite removed |
| `unit_converter_favorite_load` | Favorite loaded |
| `unit_converter_history_clear` | History cleared |
| `unit_converter_history_export` | History exported as CSV |
| `unit_converter_history_replay` | History item reloaded |
| `unit_converter_chain_add_step` | Chain step added |
| `unit_converter_chain_remove_step` | Chain step removed |
| `unit_converter_chain_clear` | Chain cleared |
| `unit_converter_chain_save` | Custom chain saved |
| `unit_converter_chain_load` | Saved chain loaded |
| `unit_converter_chain_delete` | Saved chain deleted |
| `unit_converter_chain_export` | Chain results exported |
| `unit_converter_preset_load` | Preset chain loaded |

## Related Tools

- **Timestamp Converter** - Convert between date formats and Unix timestamps
- **Number Base Converter** - Convert between binary, hex, decimal, octal
- **Calculator** - Scientific calculator for complex math
- **Data Size Calculator** - Calculate storage requirements

## FAQ

### What types of units can I convert with this tool?
Our converter supports 11 categories including: length/distance (meters, feet, miles, kilometers), weight/mass (grams, pounds, kilograms, ounces), temperature (Celsius, Fahrenheit, Kelvin), volume (liters, gallons, cups, milliliters), area (square meters, acres, hectares), speed (mph, km/h, knots), time, pressure, energy, power, and data storage units.

### How accurate are the unit conversions?
All conversions use precise mathematical formulas and industry-standard conversion factors with up to 10 decimal places of precision. For example, temperature conversions use exact formulas: C = (F - 32) x 5/9. We regularly verify conversion accuracy against scientific standards.

### Can I convert between metric and imperial units?
Yes! The converter seamlessly handles conversions between metric (SI) and imperial (US/UK) measurement systems. Convert pounds to kilograms, miles to kilometers, Fahrenheit to Celsius, gallons to liters, and vice versa.

### How do I convert Celsius to Fahrenheit?
Select Temperature from the category, enter your Celsius value, choose Celsius as the source unit, and select Fahrenheit as target. The formula used is: F = (C x 9/5) + 32.

### Can I save my favorite unit conversions?
Yes! Click the star icon next to any conversion pair (e.g., kg to lbs, miles to km) and it will appear in your favorites list. Favorites are saved locally in your browser.

### Does this unit converter work offline?
Yes! Once the page loads, all conversions happen locally in your browser. The conversion formulas are built into the application, so you can use it offline after the initial page load.

### What is the difference between weight and mass units?
Mass (kilograms, grams) measures the amount of matter and remains constant. Weight (newtons, pounds-force) measures gravitational force and varies by location. In everyday use, pounds and kilograms are used interchangeably for "weight."

### Can I convert cooking measurements?
Yes! The volume category includes cups, tablespoons, teaspoons, fluid ounces, milliliters, and liters. This is perfect for converting recipes between US and metric measurements.

### How do I convert data storage units like GB, TB, and MB?
Select "Digital Storage" from categories, then choose your units. The converter handles binary standards (1 KB = 1024 bytes). Useful for file sizes, storage capacity, and data transfer calculations.

### Why use a unit converter instead of calculating manually?
While simple conversions are easy, complex ones (acre-feet to cubic meters, BTU to joules, knots to m/s) require specific formulas. Our converter eliminates errors, saves time, and handles precision automatically.

## Best Practices

1. **Select the right category first** - Units are organized by type for faster selection
2. **Use favorites for repeated conversions** - Save time on common unit pairs
3. **Check formula details when learning** - Understand the math behind conversions
4. **Export history for documentation** - Keep records of important conversions
5. **Use chain conversions for education** - See how values transform step-by-step
6. **Bookmark specific conversions** - URL contains your settings for easy return
7. **Use presets as starting points** - Modify them rather than building from scratch
8. **Clear history periodically** - Keeps the interface clean and responsive

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move between input fields |
| `Enter` | Confirm selection in dropdowns |
| `Cmd/Ctrl + K` | Open global tool search |

## Changelog

### Version 1.0.0 (January 2026)
- Initial release with 11 categories and 100+ units
- Multi-step chain conversions with 8 presets
- Favorites, history, and saved chains
- Formula explanations with step-by-step breakdowns
- URL state persistence for shareable conversions
- CSV export for history and chain results
- Mobile-responsive design with bottom sheet picker
- Offline support after initial load
