'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Copy, Eye, RefreshCw, Sparkles } from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

// WCAG 2.1 Contrast Ratio Calculation
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const channel = val / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

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

interface ComplianceResult {
  level: 'AAA' | 'AA' | 'Fail'
  normalText: boolean
  largeText: boolean
  ratio: number
}

function getWCAGCompliance(ratio: number): ComplianceResult {
  const normalAA = ratio >= 4.5
  const normalAAA = ratio >= 7
  const largeAA = ratio >= 3
  const largeAAA = ratio >= 4.5

  let level: 'AAA' | 'AA' | 'Fail' = 'Fail'
  if (normalAAA && largeAAA) level = 'AAA'
  else if (normalAA && largeAA) level = 'AA'

  return {
    level,
    normalText: normalAA,
    largeText: largeAA,
    ratio,
  }
}

const presetColors = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
]

function ColorContrastContent() {
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#FFFFFF')

  useEffect(() => {
    trackToolEvent('color_contrast_open', {})
  }, [])

  const contrastRatio = useMemo(() => {
    return getContrastRatio(foreground, background)
  }, [foreground, background])

  const compliance = useMemo(() => {
    return getWCAGCompliance(contrastRatio)
  }, [contrastRatio])

  const handleSwapColors = () => {
    const temp = foreground
    setForeground(background)
    setBackground(temp)
    trackToolEvent('color_contrast_swap', {})
  }

  const handleCopyColor = (color: string, type: 'foreground' | 'background') => {
    navigator.clipboard.writeText(color)
    toast.success(`${type === 'foreground' ? 'Foreground' : 'Background'} color copied!`)
    trackToolEvent('color_contrast_copy', { type })
  }

  const handleRandomColors = () => {
    const randomHex = () =>
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`
    setForeground(randomHex())
    setBackground(randomHex())
    trackToolEvent('color_contrast_random', {})
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
            borderColor: 'pink.500/30',
            bg: 'pink.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Eye className={css({ h: '5', w: '5', color: 'pink.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'pink.300',
            })}
          >
            WCAG 2.1 Compliant
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
          Color Contrast Checker
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Check color contrast ratios for WCAG 2.1 accessibility compliance. Ensure your designs are
          readable for everyone.
        </p>
      </motion.div>

      {/* Color Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Select Colors</CardTitle>
            <CardDescription>Choose foreground and background colors to test</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Foreground Color */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="foreground"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Foreground (Text Color)
              </label>
              <div
                className={css({
                  display: 'flex',
                  gap: '3',
                  alignItems: 'center',
                })}
              >
                <input
                  type="color"
                  id="foreground"
                  value={foreground}
                  onChange={(e) => {
                    setForeground(e.target.value.toUpperCase())
                    trackToolEvent('color_contrast_change_foreground', {})
                  }}
                  className={css({
                    w: '16',
                    h: '16',
                    rounded: 'lg',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'gray.700',
                    bg: 'transparent',
                  })}
                />
                <input
                  type="text"
                  value={foreground}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    if (/^#[0-9A-F]{0,6}$/.test(value)) {
                      setForeground(value)
                    }
                  }}
                  placeholder="#000000"
                  className={css({
                    flex: '1',
                    h: '12',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
                    color: 'gray.200',
                    fontFamily: 'mono',
                    _focus: {
                      outline: 'none',
                      borderColor: 'pink.500',
                      ring: '2px',
                      ringColor: 'pink.500/20',
                    },
                  })}
                />
                <Button
                  onClick={() => handleCopyColor(foreground, 'foreground')}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy
                </Button>
              </div>
            </div>

            {/* Swap Button */}
            <div className={css({ display: 'flex', justifyContent: 'center' })}>
              <Button
                onClick={handleSwapColors}
                className={css({
                  gap: '2',
                  rounded: 'full',
                  bg: 'pink.500/20',
                  border: '1px solid',
                  borderColor: 'pink.500/50',
                  color: 'pink.300',
                  _hover: {
                    bg: 'pink.500/30',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s',
                  },
                })}
              >
                <RefreshCw className={css({ h: '5', w: '5' })} />
                Swap Colors
              </Button>
            </div>

            {/* Background Color */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="background"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Background Color
              </label>
              <div
                className={css({
                  display: 'flex',
                  gap: '3',
                  alignItems: 'center',
                })}
              >
                <input
                  type="color"
                  id="background"
                  value={background}
                  onChange={(e) => {
                    setBackground(e.target.value.toUpperCase())
                    trackToolEvent('color_contrast_change_background', {})
                  }}
                  className={css({
                    w: '16',
                    h: '16',
                    rounded: 'lg',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'gray.700',
                    bg: 'transparent',
                  })}
                />
                <input
                  type="text"
                  value={background}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    if (/^#[0-9A-F]{0,6}$/.test(value)) {
                      setBackground(value)
                    }
                  }}
                  placeholder="#FFFFFF"
                  className={css({
                    flex: '1',
                    h: '12',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
                    color: 'gray.200',
                    fontFamily: 'mono',
                    _focus: {
                      outline: 'none',
                      borderColor: 'pink.500',
                      ring: '2px',
                      ringColor: 'pink.500/20',
                    },
                  })}
                />
                <Button
                  onClick={() => handleCopyColor(background, 'background')}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className={css({
                display: 'flex',
                gap: '3',
                justifyContent: 'center',
              })}
            >
              <Button
                onClick={handleRandomColors}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'gray.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                <RefreshCw className={css({ h: '4', w: '4' })} />
                Random Colors
              </Button>
            </div>

            {/* Color Presets */}
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Quick Presets
              </div>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: 'repeat(4, 1fr)',
                    sm: 'repeat(8, 1fr)',
                  },
                  gap: '2',
                })}
              >
                {presetColors.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setForeground(preset.hex)}
                    className={css({
                      h: '10',
                      rounded: 'lg',
                      border: '2px solid',
                      borderColor: foreground === preset.hex ? 'pink.500' : 'gray.700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        borderColor: 'pink.400',
                        transform: 'scale(1.05)',
                      },
                    })}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contrast Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
            <CardTitle>Contrast Ratio Results</CardTitle>
            <CardDescription>WCAG 2.1 accessibility compliance levels</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Ratio Display */}
            <div className={css({ textAlign: 'center', spaceY: '2' })}>
              <div
                className={css({
                  fontSize: '6xl',
                  fontWeight: 'extrabold',
                  bgGradient: 'to-r',
                  gradientFrom: 'pink.400',
                  gradientTo: 'rose.400',
                  bgClip: 'text',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {contrastRatio.toFixed(2)}:1
              </div>
              <p className={css({ fontSize: 'lg', color: 'gray.400' })}>Contrast Ratio</p>
            </div>

            {/* Compliance Level */}
            <div className={css({ textAlign: 'center' })}>
              <Badge
                className={css({
                  px: '6',
                  py: '2',
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  bg:
                    compliance.level === 'AAA'
                      ? 'green.500/20'
                      : compliance.level === 'AA'
                        ? 'yellow.500/20'
                        : 'red.500/20',
                  color:
                    compliance.level === 'AAA'
                      ? 'green.300'
                      : compliance.level === 'AA'
                        ? 'yellow.300'
                        : 'red.300',
                  border: '1px solid',
                  borderColor:
                    compliance.level === 'AAA'
                      ? 'green.500/30'
                      : compliance.level === 'AA'
                        ? 'yellow.500/30'
                        : 'red.500/30',
                })}
              >
                {compliance.level === 'AAA' && <CheckCircle2 className={css({ h: '5', w: '5' })} />}
                {compliance.level === 'AA' && <CheckCircle2 className={css({ h: '5', w: '5' })} />}
                {compliance.level === 'Fail' && <AlertCircle className={css({ h: '5', w: '5' })} />}
                WCAG {compliance.level}
              </Badge>
            </div>

            {/* Detailed Results */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '4',
              })}
            >
              {/* Normal Text */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: compliance.normalText ? 'green.500/20' : 'red.500/20',
                  bg: compliance.normalText ? 'green.500/5' : 'red.500/5',
                  p: '4',
                  spaceY: '2',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  {compliance.normalText ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  )}
                  <span
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      color: compliance.normalText ? 'green.300' : 'red.300',
                    })}
                  >
                    Normal Text
                  </span>
                </div>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  {compliance.normalText
                    ? 'Passes WCAG AA (4.5:1 minimum)'
                    : 'Fails WCAG AA (needs 4.5:1)'}
                </p>
              </div>

              {/* Large Text */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: compliance.largeText ? 'green.500/20' : 'red.500/20',
                  bg: compliance.largeText ? 'green.500/5' : 'red.500/5',
                  p: '4',
                  spaceY: '2',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  {compliance.largeText ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  )}
                  <span
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      color: compliance.largeText ? 'green.300' : 'red.300',
                    })}
                  >
                    Large Text
                  </span>
                </div>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  {compliance.largeText
                    ? 'Passes WCAG AA (3:1 minimum)'
                    : 'Fails WCAG AA (needs 3:1)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your colors look in real-world scenarios</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Normal Text Preview */}
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                p: '6',
              })}
              style={{ backgroundColor: background }}
            >
              <p className={css({ fontSize: 'base', mb: '4' })} style={{ color: foreground }}>
                Normal text (16px): The quick brown fox jumps over the lazy dog.
              </p>
              <p
                className={css({ fontSize: 'xl', fontWeight: 'bold' })}
                style={{ color: foreground }}
              >
                Large text (20px+): The quick brown fox jumps over the lazy dog.
              </p>
            </div>

            {/* Button Preview */}
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                p: '6',
                display: 'flex',
                gap: '4',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
              })}
              style={{ backgroundColor: background }}
            >
              <button
                type="button"
                className={css({
                  px: '6',
                  py: '3',
                  rounded: 'lg',
                  fontSize: 'base',
                  fontWeight: 'medium',
                })}
                style={{ backgroundColor: foreground, color: background }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className={css({
                  px: '6',
                  py: '3',
                  rounded: 'lg',
                  fontSize: 'base',
                  fontWeight: 'medium',
                  border: '2px solid',
                })}
                style={{
                  color: foreground,
                  borderColor: foreground,
                  backgroundColor: 'transparent',
                }}
              >
                Outline Button
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                  About WCAG Compliance
                </h3>
                <ul
                  className={css({
                    spaceY: '2',
                    fontSize: 'sm',
                    color: 'gray.400',
                  })}
                >
                  <li>
                    • WCAG AA: Minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text
                  </li>
                  <li>
                    • WCAG AAA: Enhanced contrast ratio of 7:1 for normal text, 4.5:1 for large text
                  </li>
                  <li>• Large text is defined as 18pt+ (24px+) or 14pt+ (18.5px+) bold</li>
                  <li>
                    • Higher contrast ratios improve readability for users with visual impairments
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

export default function ColorContrastPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ColorContrastContent />
    </Suspense>
  )
}
