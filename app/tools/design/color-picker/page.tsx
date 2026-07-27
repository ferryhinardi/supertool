'use client'

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Palette,
  RefreshCw,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Color conversion utilities
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

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`
}

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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r: number
  let g: number
  let b: number

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

// WCAG contrast ratio calculation
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const channel = val / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

// Palette generation algorithms
function generateComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const compHue = (hsl.h + 180) % 360
  const compRgb = hslToRgb(compHue, hsl.s, hsl.l)

  return [hex, rgbToHex(compRgb.r, compRgb.g, compRgb.b)]
}

function generateAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []

  for (let i = -60; i <= 60; i += 30) {
    const newHue = (hsl.h + i + 360) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

function generateTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []

  for (let i = 0; i < 360; i += 120) {
    const newHue = (hsl.h + i) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

function generateTetradic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []

  for (let i = 0; i < 360; i += 90) {
    const newHue = (hsl.h + i) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

function generateMonochromatic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []

  for (let i = 20; i <= 80; i += 15) {
    const newRgb = hslToRgb(hsl.h, hsl.s, i)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

function generateShades(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [hex]

  const colors = [hex]

  // Lighter shades
  for (let i = 1; i <= 3; i++) {
    const factor = 1 + i * 0.2
    const r = Math.min(255, Math.round(rgb.r * factor))
    const g = Math.min(255, Math.round(rgb.g * factor))
    const b = Math.min(255, Math.round(rgb.b * factor))
    colors.unshift(rgbToHex(r, g, b))
  }

  // Darker shades
  for (let i = 1; i <= 3; i++) {
    const factor = 1 - i * 0.2
    const r = Math.max(0, Math.round(rgb.r * factor))
    const g = Math.max(0, Math.round(rgb.g * factor))
    const b = Math.max(0, Math.round(rgb.b * factor))
    colors.push(rgbToHex(r, g, b))
  }

  return colors
}

type PaletteType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'
  | 'shades'

function ColorPickerContent() {
  const [color, setColor] = useState('#667EEA')
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  useEffect(() => {
    trackToolEvent('color_picker_open', {})
  }, [])

  const rgb = useMemo(() => {
    const result = hexToRgb(color)
    return result || { r: 0, g: 0, b: 0 }
  }, [color])

  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb])
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb])

  const palette = useMemo(() => {
    switch (paletteType) {
      case 'complementary':
        return generateComplementary(color)
      case 'analogous':
        return generateAnalogous(color)
      case 'triadic':
        return generateTriadic(color)
      case 'tetradic':
        return generateTetradic(color)
      case 'monochromatic':
        return generateMonochromatic(color)
      case 'shades':
        return generateShades(color)
      default:
        return [color]
    }
  }, [color, paletteType])

  const contrastWithWhite = useMemo(() => getContrastRatio(color, '#FFFFFF'), [color])
  const contrastWithBlack = useMemo(() => getContrastRatio(color, '#000000'), [color])

  const handleRandomColor = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()}`
    setColor(randomHex)
    trackToolEvent('color_picker_random', {})
  }

  const handleCopyColor = (colorToCopy: string, format: string) => {
    navigator.clipboard.writeText(colorToCopy)
    setCopiedColor(colorToCopy)
    setTimeout(() => setCopiedColor(null), 2000)
    toast.success(`${format} copied!`)
    trackToolEvent('color_picker_copy', { format })
  }

  const handleCopyPalette = () => {
    const paletteText = palette.join(', ')
    navigator.clipboard.writeText(paletteText)
    toast.success('Palette copied!')
    trackToolEvent('color_picker_copy_palette', { type: paletteType })
  }

  const handleReset = () => {
    setColor('#667EEA')
    setPaletteType('complementary')
    toast.success('Reset to default')
  }

  // Keyboard shortcuts
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts(
    {
      onExecute: handleRandomColor,
      onCopy: () => handleCopyColor(color, 'HEX'),
      onReset: handleReset,
      onEscape: handleReset,
    },
    { allowInInputs: false }
  )

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
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'pink.500/30',
            bg: 'pink.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Palette className={css({ h: '5', w: '5', color: 'pink.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'pink.300',
            })}
          >
            Design Tool
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'pink.400',
            gradientVia: 'rose.400',
            gradientTo: 'red.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Color Picker & Palette Generator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Pick colors, generate harmonious palettes, and convert between HEX, RGB, HSL, and HSV
          formats instantly.
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: '6',
        })}
      >
        {/* Main Section */}
        <div className={css({ spaceY: '6' })}>
          {/* Color Picker */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>Color Picker</CardTitle>
                <CardDescription>Choose a color and explore its variations</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '6' })}>
                {/* Large Color Preview */}
                <div
                  className={css({
                    h: { base: '48', sm: '64' },
                    rounded: 'xl',
                    border: '2px solid',
                    borderColor: 'gray.700',
                    overflow: 'hidden',
                    position: 'relative',
                  })}
                  style={{ backgroundColor: color }}
                >
                  <div
                    className={css({
                      position: 'absolute',
                      top: '4',
                      right: '4',
                      display: 'flex',
                      gap: '2',
                    })}
                  >
                    <Button
                      aria-label="Randomize color"
                      onClick={handleRandomColor}
                      className={css({
                        bg: 'gray.900/80',
                        backdropFilter: 'blur(8px)',
                        _hover: { bg: 'gray.800/80' },
                      })}
                      size="sm"
                    >
                      <Shuffle className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>
                </div>

                {/* Color Input */}
                <div className={css({ display: 'flex', gap: '3', alignItems: 'center' })}>
                  <input
                    type="color"
                    aria-label="Color picker"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value.toUpperCase())
                      trackToolEvent('color_picker_change', {})
                    }}
                    className={css({
                      w: '20',
                      h: '20',
                      rounded: 'lg',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      if (/^#[0-9A-F]{0,6}$/.test(value)) {
                        setColor(value)
                      }
                    }}
                    placeholder="#667EEA"
                    className={css({
                      flex: '1',
                      h: '14',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      px: '4',
                      fontSize: 'lg',
                      color: 'gray.200',
                      fontFamily: 'mono',
                      fontWeight: 'semibold',
                      _focus: {
                        outline: 'none',
                        borderColor: 'pink.500',
                        ring: '2px',
                        ringColor: 'pink.500/20',
                      },
                    })}
                  />
                </div>

                {/* Quick Actions */}
                <div className={css({ display: 'flex', gap: '3', justifyContent: 'center' })}>
                  <Button onClick={handleRandomColor} className={css({ gap: '2' })}>
                    <RefreshCw className={css({ h: '4', w: '4' })} />
                    Random Color
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Formats */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.2s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>Color Formats</CardTitle>
                <CardDescription>Convert between different color formats</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* HEX */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div>
                    <div className={css({ fontSize: 'sm', color: 'white', mb: '1' })}>HEX</div>
                    <div className={css({ fontSize: 'lg', fontFamily: 'mono', color: 'gray.200' })}>
                      {color}
                    </div>
                  </div>
                  <Button
                    aria-label="Copy HEX color"
                    onClick={() => handleCopyColor(color, 'HEX')}
                    variant="outline"
                    size="sm"
                    className={css({ gap: '2' })}
                  >
                    {copiedColor === color ? (
                      <Check className={css({ h: '4', w: '4' })} />
                    ) : (
                      <Copy className={css({ h: '4', w: '4' })} />
                    )}
                  </Button>
                </div>

                {/* RGB */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div>
                    <div className={css({ fontSize: 'sm', color: 'white', mb: '1' })}>RGB</div>
                    <div className={css({ fontSize: 'lg', fontFamily: 'mono', color: 'gray.200' })}>
                      rgb({rgb.r}, {rgb.g}, {rgb.b})
                    </div>
                  </div>
                  <Button
                    aria-label="Copy RGB color"
                    onClick={() => handleCopyColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
                    variant="outline"
                    size="sm"
                    className={css({ gap: '2' })}
                  >
                    {copiedColor === `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` ? (
                      <Check className={css({ h: '4', w: '4' })} />
                    ) : (
                      <Copy className={css({ h: '4', w: '4' })} />
                    )}
                  </Button>
                </div>

                {/* HSL */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div>
                    <div className={css({ fontSize: 'sm', color: 'white', mb: '1' })}>HSL</div>
                    <div className={css({ fontSize: 'lg', fontFamily: 'mono', color: 'gray.200' })}>
                      hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                    </div>
                  </div>
                  <Button
                    aria-label="Copy HSL color"
                    onClick={() => handleCopyColor(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')}
                    variant="outline"
                    size="sm"
                    className={css({ gap: '2' })}
                  >
                    {copiedColor === `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` ? (
                      <Check className={css({ h: '4', w: '4' })} />
                    ) : (
                      <Copy className={css({ h: '4', w: '4' })} />
                    )}
                  </Button>
                </div>

                {/* HSV */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div>
                    <div className={css({ fontSize: 'sm', color: 'white', mb: '1' })}>HSV</div>
                    <div className={css({ fontSize: 'lg', fontFamily: 'mono', color: 'gray.200' })}>
                      hsv({hsv.h}°, {hsv.s}%, {hsv.v}%)
                    </div>
                  </div>
                  <Button
                    aria-label="Copy HSV color"
                    onClick={() => handleCopyColor(`hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`, 'HSV')}
                    variant="outline"
                    size="sm"
                    className={css({ gap: '2' })}
                  >
                    {copiedColor === `hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)` ? (
                      <Check className={css({ h: '4', w: '4' })} />
                    ) : (
                      <Copy className={css({ h: '4', w: '4' })} />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accessibility */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.3s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>WCAG contrast ratios for text readability</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* Contrast with White */}
                <div
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'white' })}>
                      Contrast with White
                    </div>
                    <Badge
                      className={css({
                        bg:
                          contrastWithWhite >= 7
                            ? 'green.500/20'
                            : contrastWithWhite >= 4.5
                              ? 'yellow.500/20'
                              : 'red.500/20',
                        color:
                          contrastWithWhite >= 7
                            ? 'green.300'
                            : contrastWithWhite >= 4.5
                              ? 'yellow.300'
                              : 'red.300',
                        border: '1px solid',
                        borderColor:
                          contrastWithWhite >= 7
                            ? 'green.500/30'
                            : contrastWithWhite >= 4.5
                              ? 'yellow.500/30'
                              : 'red.500/30',
                      })}
                    >
                      {contrastWithWhite.toFixed(2)}:1
                    </Badge>
                  </div>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                      alignItems: 'center',
                    })}
                  >
                    {contrastWithWhite >= 4.5 ? (
                      <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                    ) : (
                      <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                    )}
                    <span className={css({ fontSize: 'sm', color: 'white' })}>
                      {contrastWithWhite >= 7
                        ? 'AAA - Enhanced contrast'
                        : contrastWithWhite >= 4.5
                          ? 'AA - Minimum contrast'
                          : 'Fails WCAG standards'}
                    </span>
                  </div>
                </div>

                {/* Contrast with Black */}
                <div
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'white' })}>
                      Contrast with Black
                    </div>
                    <Badge
                      className={css({
                        bg:
                          contrastWithBlack >= 7
                            ? 'green.500/20'
                            : contrastWithBlack >= 4.5
                              ? 'yellow.500/20'
                              : 'red.500/20',
                        color:
                          contrastWithBlack >= 7
                            ? 'green.300'
                            : contrastWithBlack >= 4.5
                              ? 'yellow.300'
                              : 'red.300',
                        border: '1px solid',
                        borderColor:
                          contrastWithBlack >= 7
                            ? 'green.500/30'
                            : contrastWithBlack >= 4.5
                              ? 'yellow.500/30'
                              : 'red.500/30',
                      })}
                    >
                      {contrastWithBlack.toFixed(2)}:1
                    </Badge>
                  </div>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                      alignItems: 'center',
                    })}
                  >
                    {contrastWithBlack >= 4.5 ? (
                      <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                    ) : (
                      <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                    )}
                    <span className={css({ fontSize: 'sm', color: 'white' })}>
                      {contrastWithBlack >= 7
                        ? 'AAA - Enhanced contrast'
                        : contrastWithBlack >= 4.5
                          ? 'AA - Minimum contrast'
                          : 'Fails WCAG standards'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Palette Generator Sidebar */}
        <div className={css({ spaceY: '6' })}>
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.2s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <div>
                    <CardTitle>Color Palette</CardTitle>
                    <CardDescription>Generate harmonious color combinations</CardDescription>
                  </div>
                  <Button
                    aria-label="Copy color palette"
                    onClick={handleCopyPalette}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* Palette Type Selector */}
                <div className={css({ spaceY: '2' })}>
                  <div className={css({ fontSize: 'sm', color: 'white', mb: '3' })}>
                    Palette Type
                  </div>
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                    {(
                      [
                        'complementary',
                        'analogous',
                        'triadic',
                        'tetradic',
                        'monochromatic',
                        'shades',
                      ] as PaletteType[]
                    ).map((type) => (
                      <Button
                        key={type}
                        onClick={() => {
                          setPaletteType(type)
                          trackToolEvent('color_picker_palette_type', { type })
                        }}
                        variant={paletteType === type ? 'default' : 'outline'}
                        size="sm"
                        className={css({ justifyContent: 'start', textTransform: 'capitalize' })}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Palette Colors */}
                <div className={css({ spaceY: '2' })}>
                  <div className={css({ fontSize: 'sm', color: 'white', mb: '3' })}>
                    Generated Palette
                  </div>
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                    {palette.map((paletteColor, index) => (
                      <div
                        key={`${paletteColor}-${
                          // biome-ignore lint/suspicious/noArrayIndexKey: palette order matters
                          index
                        }`}
                        className={css({
                          display: 'flex',
                          gap: '3',
                          alignItems: 'center',
                          p: '3',
                          rounded: 'lg',
                          bg: 'gray.800/50',
                          border: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      >
                        <div
                          className={css({
                            w: '12',
                            h: '12',
                            rounded: 'lg',
                            border: '2px solid',
                            borderColor: 'gray.600',
                          })}
                          style={{ backgroundColor: paletteColor }}
                        />
                        <div
                          className={css({
                            flex: '1',
                            fontFamily: 'mono',
                            fontSize: 'sm',
                            color: 'white',
                          })}
                        >
                          {paletteColor}
                        </div>
                        <Button
                          aria-label={`Copy color ${paletteColor}`}
                          onClick={() => handleCopyColor(paletteColor, 'Color')}
                          variant="outline"
                          size="sm"
                        >
                          {copiedColor === paletteColor ? (
                            <Check className={css({ h: '3.5', w: '3.5' })} />
                          ) : (
                            <Copy className={css({ h: '3.5', w: '3.5' })} />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.4s',
              opacity: 0,
            })}
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
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'start',
                    gap: '4',
                  })}
                >
                  <Sparkles
                    className={css({
                      h: '6',
                      w: '6',
                      color: 'cyan.400',
                      flexShrink: '0',
                    })}
                  />
                  <div className={css({ spaceY: '2' })}>
                    <h3
                      className={css({
                        fontSize: 'lg',
                        fontWeight: 'semibold',
                        color: 'cyan.300',
                      })}
                    >
                      Color Theory Tips
                    </h3>
                    <ul
                      className={css({
                        spaceY: '2',
                        fontSize: 'sm',
                        color: 'white',
                      })}
                    >
                      <li>• Complementary colors create high contrast and vibrant designs</li>
                      <li>• Analogous colors provide harmonious and serene combinations</li>
                      <li>• Triadic colors offer balanced and colorful palettes</li>
                      <li>• Monochromatic schemes create cohesive and sophisticated looks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
      <ToolSearch />

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={shortcuts}
        toolName="Color Picker"
      />
    </main>
  )
}

export default function ColorPickerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ColorPickerContent />
    </Suspense>
  )
}
