# Color Picker & Palette Generator Implementation

## Overview

The Color Picker & Palette Generator is a comprehensive design tool that allows users to pick colors, generate harmonious color palettes, convert between color formats, and check accessibility contrast ratios. It provides instant format conversions and six different palette generation algorithms.

**Page Location:** `/app/tools/color-picker/page.tsx`  
**Tests Location:** `/app/tools/color-picker/__tests__/page.test.tsx`  
**Layout:** `/app/tools/color-picker/layout.tsx`

## Features

### Core Color Picking

- **Visual Color Picker:**
  - Native HTML5 color picker
  - Large color preview display (192px x 256px)
  - Real-time color updates
  - Random color generation
- **Hex Code Input:**
  - Text input with validation
  - Automatic uppercase conversion
  - Live preview of entered color
  - Monospace font for readability

### Color Format Conversion

Instant conversion between four color formats:

1. **HEX** - `#FF0000`
2. **RGB** - `rgb(255, 0, 0)`
3. **HSL** - `hsl(0, 100%, 50%)`
4. **HSV** - `hsv(0, 100%, 100%)`

Each format includes:
- Copy to clipboard functionality
- Visual representation
- Real-time synchronization

### Palette Generation

Six palette generation algorithms:

1. **Complementary** - Opposite on color wheel (2 colors)
2. **Analogous** - Adjacent on color wheel (5 colors)
3. **Triadic** - 120° apart on color wheel (3 colors)
4. **Tetradic** - Rectangle on color wheel (4 colors)
5. **Monochromatic** - Different lightness values (5 colors)
6. **Shades** - Tints and shades (5 colors)

Each palette includes:
- Visual color swatches
- Hex code display
- Individual copy buttons
- "Copy Palette" button for all colors

### Accessibility Features

- **Contrast Ratios:**
  - Contrast with white background
  - Contrast with black background
  - WCAG compliance indicators
  - Pass/fail status badges
- **Compliance Levels:**
  - WCAG AA indicators
  - Color-coded badges
  - Visual pass/fail icons

### Educational Content

- **Color Theory Tips:**
  - Complementary colors explained
  - Analogous harmony information
  - Monochromatic scheme guidance
  - Color accessibility best practices

## Technical Implementation

### Color Conversion Utilities

#### HEX to RGB
```typescript
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}
```

#### RGB to HEX
```typescript
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`
}
```

#### RGB to HSL
```typescript
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}
```

#### HSL to RGB
```typescript
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}
```

#### RGB to HSV
```typescript
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const v = max

  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}
```

### Palette Generation Algorithms

#### Complementary Colors
```typescript
function generateComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const complementaryHue = (hsl.h + 180) % 360
  
  const complementaryRgb = hslToRgb(complementaryHue, hsl.s, hsl.l)
  const complementaryHex = rgbToHex(
    complementaryRgb.r,
    complementaryRgb.g,
    complementaryRgb.b
  )
  
  return [hex, complementaryHex]
}
```

#### Analogous Colors
```typescript
function generateAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const analogousColors: string[] = []
  
  for (let i = -2; i <= 2; i++) {
    const hue = (hsl.h + i * 30 + 360) % 360
    const analogousRgb = hslToRgb(hue, hsl.s, hsl.l)
    analogousColors.push(rgbToHex(analogousRgb.r, analogousRgb.g, analogousRgb.b))
  }
  
  return analogousColors
}
```

#### Triadic Colors
```typescript
function generateTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const triadicColors: string[] = [hex]
  
  for (let i = 1; i <= 2; i++) {
    const hue = (hsl.h + i * 120) % 360
    const triadicRgb = hslToRgb(hue, hsl.s, hsl.l)
    triadicColors.push(rgbToHex(triadicRgb.r, triadicRgb.g, triadicRgb.b))
  }
  
  return triadicColors
}
```

#### Tetradic Colors
```typescript
function generateTetradic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const tetradicColors: string[] = [hex]
  
  for (let i = 1; i <= 3; i++) {
    const hue = (hsl.h + i * 90) % 360
    const tetradicRgb = hslToRgb(hue, hsl.s, hsl.l)
    tetradicColors.push(rgbToHex(tetradicRgb.r, tetradicRgb.g, tetradicRgb.b))
  }
  
  return tetradicColors
}
```

#### Monochromatic Colors
```typescript
function generateMonochromatic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const monochromaticColors: string[] = []
  
  for (let i = -2; i <= 2; i++) {
    const lightness = Math.max(10, Math.min(90, hsl.l + i * 15))
    const monoRgb = hslToRgb(hsl.h, hsl.s, lightness)
    monochromaticColors.push(rgbToHex(monoRgb.r, monoRgb.g, monoRgb.b))
  }
  
  return monochromaticColors
}
```

#### Shades
```typescript
function generateShades(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const shades: string[] = []
  
  for (let i = -2; i <= 2; i++) {
    const lightness = Math.max(10, Math.min(90, hsl.l + i * 20))
    const shadeRgb = hslToRgb(hsl.h, hsl.s, lightness)
    shades.push(rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b))
  }
  
  return shades
}
```

### Contrast Ratio Calculation

Uses WCAG 2.1 formula for accessibility:

```typescript
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const channel = val / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 1
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}
```

### Random Color Generation

```typescript
const handleRandomColor = () => {
  const randomHex = `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase()}`
  setColor(randomHex)
  trackToolEvent('color_picker_random', {})
}
```

## Analytics Events

Tracked events via `trackToolEvent`:

| Event Name                    | Description                      | Parameters           |
| ----------------------------- | -------------------------------- | -------------------- |
| `color_picker_open`           | User opens the tool              | None                 |
| `color_picker_change`         | User changes color               | None                 |
| `color_picker_random`         | User generates random color      | None                 |
| `color_picker_copy`           | User copies color to clipboard   | `{ format: string }` |
| `color_picker_copy_palette`   | User copies entire palette       | `{ type: string }`   |
| `color_picker_palette_type`   | User switches palette type       | `{ type: string }`   |

## User Interface

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│    Color Picker & Palette Generator Header                  │
│    (with gradient text animation and Design Tool badge)     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────┐
│  Color Picker Card      │  Accessibility Card               │
│  • Large color preview  │  • Contrast with White            │
│  • Color input          │  • Contrast with Black            │
│  • Hex code input       │  • WCAG compliance badges         │
│  • Random button        │  • Pass/fail indicators           │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────┐
│  Color Formats Card     │  Color Palette Card               │
│  • HEX format + copy    │  • Palette type selector          │
│  • RGB format + copy    │  • 2-5 color swatches             │
│  • HSL format + copy    │  • Individual copy buttons        │
│  • HSV format + copy    │  • Copy Palette button            │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Color Theory Tips Card                                      │
│  • Educational content about color harmony                   │
│  • Usage recommendations                                     │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Design

- **Desktop (lg+):** Two-column layout (2fr + 1fr grid)
- **Tablet (md):** Two-column with adjusted spacing
- **Mobile (base):** Single column, stacked cards

### Visual Design

- **Color Preview:**
  - Height: 192px (mobile) to 256px (desktop)
  - Rounded corners (xl)
  - 2px solid border
  - Random shuffle button overlay

- **Color Inputs:**
  - Native color picker (80px x 80px)
  - Hex input with monospace font
  - Large size (56px height)
  - Focus ring with pink accent

- **Format Display:**
  - Tab-style buttons
  - Active state highlighting
  - Copy button with icon
  - Code-style text display

- **Palette Swatches:**
  - Circular color previews
  - 80px diameter
  - Hex code labels
  - Individual copy buttons
  - Glassmorphism effects

- **Badges:**
  - Color-coded (red/yellow/green)
  - Pass/fail icons
  - WCAG compliance levels
  - Transparent backgrounds

## Dependencies

### Native Browser APIs (No External Color Libraries)

- **Color Input:** Native `<input type="color">`
- **Clipboard API:** Copy colors and palettes
- **Math Operations:** Color conversions and calculations

### UI Components (Internal)

- `@/components/ui/button` - Action buttons
- `@/components/ui/card` - Container cards
- `@/components/ui/badge` - Status badges
- `lucide-react` - Icons (Palette, Copy, RefreshCw, Shuffle, Sparkles, CheckCircle2, AlertCircle, Check)
- `sonner` - Toast notifications
- `framer-motion` - Page animations

## SEO & Metadata

```typescript
export const metadata: Metadata = generateToolMetadata({
  title: 'Color Picker & Palette Generator - HEX, RGB, HSL Converter',
  description:
    'Free color picker and palette generator with instant format conversion. Pick colors, generate complementary, analogous, triadic, and monochromatic palettes. Convert between HEX, RGB, HSL, and HSV formats. Check WCAG contrast ratios for accessibility.',
  keywords: [
    'color picker',
    'palette generator',
    'color converter',
    'hex to rgb',
    'rgb to hsl',
    'color scheme generator',
    'complementary colors',
    'analogous colors',
    'triadic colors',
    'monochromatic palette',
    'color formats',
    'wcag contrast',
    'color tool',
    'hex color picker',
  ],
  category: 'design',
  path: '/tools/color-picker',
})
```

## Usage Example

### Picking a Color

1. **Choose Color:**
   - Click visual color picker
   - Or enter hex code manually
   - Or click "Random Color" for inspiration

2. **View Formats:**
   - Switch between HEX, RGB, HSL, HSV tabs
   - Copy any format to clipboard
   - All formats update instantly

3. **Generate Palette:**
   - Select palette type (complementary, analogous, etc.)
   - View generated colors
   - Copy individual colors or entire palette

4. **Check Accessibility:**
   - Review contrast with white
   - Review contrast with black
   - Check WCAG compliance badges

### Color Theory Workflow

1. **Start with Base Color:**
   - Pick your primary brand color
   - Enter exact hex code if known

2. **Generate Harmonious Palette:**
   - Try complementary for contrast
   - Try analogous for harmony
   - Try triadic for vibrant combinations

3. **Export Colors:**
   - Copy individual hex codes
   - Or copy entire palette at once
   - Use in your design tool or code

## Testing Strategy

### Component Tests (33 tests)

**Rendering Tests:**
- Page structure and headings
- Default color display
- Action buttons presence
- Format tabs display
- Palette type buttons
- Contrast information

**Color Input Tests:**
- Update color via text input
- Hex format validation
- Random color generation
- Copy hex color to clipboard

**Format Conversion Tests:**
- Display HEX format by default
- Switch to RGB format
- Switch to HSL format
- Switch to HSV format
- Correct color conversions

**Palette Generation Tests:**
- Display complementary palette
- Switch to analogous palette
- Switch to triadic palette
- Switch to tetradic palette
- Switch to monochromatic palette
- Switch to shades palette
- Copy entire palette
- Copy individual palette color

**Contrast Tests:**
- Display contrast with white
- Display contrast with black
- Show WCAG compliance status
- Update contrast when color changes

**Accessibility Tests:**
- Proper heading hierarchy
- Accessible buttons
- Labeled form inputs

**Integration Tests:**
- Update palette when color changes
- Update all formats when color changes
- Maintain palette type when color changes

### Test Coverage

```bash
# Run tests
pnpm test app/tools/color-picker

# With coverage
pnpm test app/tools/color-picker --coverage
```

## Browser Compatibility

- **Chrome/Edge:** ✅ Full support
- **Firefox:** ✅ Full support
- **Safari:** ✅ Full support (14+)
- **Mobile:** ✅ Responsive design with touch support

### Required Browser Features

- Native color input (all modern browsers)
- Clipboard API (HTTPS required)
- JavaScript Math functions
- CSS Grid and Flexbox

## Performance Notes

- **Real-time Calculation:** Instant format conversions
- **No API Calls:** All calculations client-side
- **Minimal Overhead:** Pure JavaScript calculations
- **Optimized Rendering:** React memo hooks and useMemo
- **No External Libraries:** Zero dependencies for color operations

## Accessibility

- **Keyboard Navigation:** All controls focusable and operable
- **Screen Readers:** Proper semantic HTML and ARIA labels
- **Color Contrast:** Tool itself meets WCAG AA standards
- **Focus Indicators:** Visible focus states on all inputs
- **WCAG Compliance:** Built-in accessibility checking

## Known Limitations

1. **Color Format:** Primarily uses hex colors (#RRGGBB)
2. **Palette Size:** Fixed number of colors per palette type
3. **Clipboard API:** Requires HTTPS (except localhost)
4. **Mobile Color Picker:** Native picker varies by device

## Future Enhancements

### Potential Features

1. **Advanced Color Formats:**
   - RGBA with transparency
   - HSLA support
   - CMYK for print design
   - Named CSS colors

2. **Palette Features:**
   - Save favorite palettes
   - Export to CSS/SCSS/JSON
   - Import from image
   - Custom palette sizes

3. **Color Analysis:**
   - Color blindness simulation
   - Color harmony scoring
   - Psychological associations
   - Cultural meanings

4. **Integration Features:**
   - Export to design tools (Figma, Sketch)
   - Import from brand guidelines
   - Shareable palette URLs
   - Palette version history

5. **AI Features:**
   - AI-powered color suggestions
   - Trend-based palettes
   - Brand color extraction
   - Mood-based generation

## Integration

### Adding to Homepage

```typescript
{
  title: 'Color Picker & Palette Generator',
  description: 'Pick colors and generate harmonious palettes instantly',
  icon: Palette,
  href: '/tools/color-picker',
  gradient: 'from-pink-500 to-rose-500',
  features: ['HEX/RGB/HSL', '6 Palette Types', 'WCAG Contrast', 'Format Convert'],
  category: 'design',
  new: true,
}
```

### Adding to Sidebar

```typescript
import { Palette } from 'lucide-react'

{
  name: 'Color Picker',
  href: '/tools/color-picker',
  icon: Palette
}
```

## Conclusion

The Color Picker & Palette Generator is a comprehensive design tool that combines color picking, format conversion, palette generation, and accessibility checking in one interface. With pure JavaScript implementations and no external dependencies, it provides fast, reliable color operations for designers and developers.

The tool is production-ready with:

- ✅ Full test coverage (33+ tests)
- ✅ Comprehensive documentation
- ✅ Analytics tracking
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Cross-browser compatibility
- ✅ No external dependencies
- ✅ SEO optimized

Users can pick colors, explore color harmonies, convert between formats, check accessibility, and export palettes for use in their design projects, making it an essential tool for web designers and developers.
