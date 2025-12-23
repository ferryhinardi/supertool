'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  History,
  RefreshCw,
  Sparkles,
  Star,
  Wand2,
} from 'lucide-react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
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

interface ColorPair {
  foreground: string
  background: string
  timestamp: number
  ratio: number
}

// Generate accessible color suggestions
function suggestAccessibleColors(
  baseColor: string,
  targetRatio: number = 4.5,
  isForeground: boolean = true
): string[] {
  const suggestions: string[] = []
  const rgb = hexToRgb(baseColor)
  if (!rgb) return suggestions

  // Try darkening and lightening the opposite color
  for (let i = 0; i <= 255; i += 15) {
    const testColor = `#${i.toString(16).padStart(2, '0')}${i.toString(16).padStart(2, '0')}${i.toString(16).padStart(2, '0')}`
    const ratio = isForeground
      ? getContrastRatio(baseColor, testColor)
      : getContrastRatio(testColor, baseColor)

    if (ratio >= targetRatio) {
      suggestions.push(testColor)
      if (suggestions.length >= 5) break
    }
  }

  return suggestions.slice(0, 5)
}

function ColorContrastContent() {
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#FFFFFF')
  const [history, setHistory] = useState<ColorPair[]>([])
  const [favorites, setFavorites] = useState<ColorPair[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load history and favorites from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('color-contrast-history')
    const savedFavorites = localStorage.getItem('color-contrast-favorites')

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Failed to load favorites:', e)
      }
    }
  }, [])

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

  // Save to history
  const saveToHistory = useCallback((fg: string, bg: string, ratio: number) => {
    const newEntry: ColorPair = {
      foreground: fg,
      background: bg,
      timestamp: Date.now(),
      ratio,
    }

    setHistory((prevHistory) => {
      const updatedHistory = [
        newEntry,
        ...prevHistory.filter((item) => !(item.foreground === fg && item.background === bg)),
      ].slice(0, 20) // Keep last 20

      localStorage.setItem('color-contrast-history', JSON.stringify(updatedHistory))
      return updatedHistory
    })
  }, [])

  // Add to favorites
  const addToFavorites = () => {
    const newFavorite: ColorPair = {
      foreground,
      background,
      timestamp: Date.now(),
      ratio: contrastRatio,
    }

    if (favorites.some((fav) => fav.foreground === foreground && fav.background === background)) {
      toast.info('This color pair is already in favorites')
      return
    }

    const updatedFavorites = [...favorites, newFavorite]
    setFavorites(updatedFavorites)
    localStorage.setItem('color-contrast-favorites', JSON.stringify(updatedFavorites))
    toast.success('Added to favorites!')
  }

  // Remove from favorites
  const removeFromFavorites = (fg: string, bg: string) => {
    const updatedFavorites = favorites.filter(
      (fav) => !(fav.foreground === fg && fav.background === bg)
    )
    setFavorites(updatedFavorites)
    localStorage.setItem('color-contrast-favorites', JSON.stringify(updatedFavorites))
    toast.success('Removed from favorites')
  }

  // Load from history/favorites
  const loadColorPair = (fg: string, bg: string) => {
    setForeground(fg)
    setBackground(bg)
    setShowHistory(false)
    setShowFavorites(false)
  }

  // Export as JSON
  const exportAsJSON = () => {
    const data = {
      foreground,
      background,
      contrastRatio: parseFloat(contrastRatio.toFixed(2)),
      compliance: compliance.level,
      normalText: compliance.normalText,
      largeText: compliance.largeText,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-contrast-${foreground.slice(1)}-${background.slice(1)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as JSON!')
  }

  // Export as PNG (screenshot)
  const exportAsPNG = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Draw background
    ctx.fillStyle = background
    ctx.fillRect(0, 0, 800, 400)

    // Draw text
    ctx.fillStyle = foreground
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Contrast Ratio: ${contrastRatio.toFixed(2)}:1`, 400, 150)

    ctx.font = '32px sans-serif'
    ctx.fillText(`WCAG ${compliance.level}`, 400, 220)

    ctx.font = '24px sans-serif'
    ctx.fillText(`${foreground} on ${background}`, 400, 280)

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `color-contrast-${foreground.slice(1)}-${background.slice(1)}.png`
      a.click()
      URL.revokeObjectURL(url)
    })

    toast.success('Exported as PNG!')
  }

  // Save to history when colors change
  useEffect(() => {
    if (contrastRatio > 0) {
      const timer = setTimeout(() => {
        saveToHistory(foreground, background, contrastRatio)
      }, 1000) // Debounce 1 second

      return () => clearTimeout(timer)
    }
  }, [foreground, background, contrastRatio, saveToHistory])

  const suggestions = useMemo(() => {
    return suggestAccessibleColors(foreground, 4.5, true)
  }, [foreground])

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
                flexWrap: 'wrap',
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
              <Button
                onClick={addToFavorites}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'yellow.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                <Star className={css({ h: '4', w: '4' })} />
                Add to Favorites
              </Button>
              <Button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'purple.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                <Wand2 className={css({ h: '4', w: '4' })} />
                Suggest Colors
              </Button>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'blue.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                <History className={css({ h: '4', w: '4' })} />
                History ({history.length})
              </Button>
              <Button
                onClick={() => setShowFavorites(!showFavorites)}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'yellow.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                <Star className={css({ h: '4', w: '4' })} />
                Favorites ({favorites.length})
              </Button>
            </div>

            {/* Suggestions Panel */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'gray.300',
                  })}
                >
                  Accessible Background Suggestions (for current foreground)
                </div>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: {
                      base: 'repeat(2, 1fr)',
                      sm: 'repeat(5, 1fr)',
                    },
                    gap: '2',
                  })}
                >
                  {suggestions.map((suggestedBg) => {
                    const ratio = getContrastRatio(foreground, suggestedBg)
                    return (
                      <button
                        key={suggestedBg}
                        type="button"
                        onClick={() => setBackground(suggestedBg)}
                        className={css({
                          h: '16',
                          rounded: 'lg',
                          border: '2px solid',
                          borderColor: 'gray.700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative',
                          _hover: {
                            borderColor: 'purple.400',
                            transform: 'scale(1.05)',
                          },
                        })}
                        style={{ backgroundColor: suggestedBg }}
                        title={`${suggestedBg} - Ratio: ${ratio.toFixed(2)}:1`}
                      >
                        <span
                          className={css({
                            position: 'absolute',
                            bottom: '1',
                            left: '1',
                            right: '1',
                            fontSize: 'xs',
                            bg: 'black/50',
                            px: '1',
                            py: '0.5',
                            rounded: 'sm',
                            color: 'white',
                          })}
                        >
                          {ratio.toFixed(1)}:1
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* History Panel */}
            {showHistory && history.length > 0 && (
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'gray.300',
                  })}
                >
                  Recent History
                </div>
                <div className={css({ spaceY: '2', maxH: '64', overflowY: 'auto' })}>
                  {history.slice(0, 10).map((item, index) => (
                    <button
                      key={`${item.foreground}-${item.background}-${index}`}
                      type="button"
                      onClick={() => loadColorPair(item.foreground, item.background)}
                      className={css({
                        w: 'full',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'blue.400',
                          bg: 'gray.800',
                        },
                      })}
                    >
                      <div
                        className={css({ w: '12', h: '12', rounded: 'md', flexShrink: '0' })}
                        style={{ backgroundColor: item.background }}
                      >
                        <div
                          className={css({
                            w: 'full',
                            h: 'full',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          })}
                          style={{ color: item.foreground }}
                        >
                          Aa
                        </div>
                      </div>
                      <div className={css({ flex: '1', textAlign: 'left', fontSize: 'sm' })}>
                        <div className={css({ color: 'gray.300', fontFamily: 'mono' })}>
                          {item.foreground} / {item.background}
                        </div>
                        <div className={css({ color: 'gray.500', fontSize: 'xs' })}>
                          Ratio: {item.ratio.toFixed(2)}:1
                        </div>
                      </div>
                      <Clock className={css({ h: '4', w: '4', color: 'gray.500' })} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Panel */}
            {showFavorites && favorites.length > 0 && (
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'gray.300',
                  })}
                >
                  Favorite Color Pairs
                </div>
                <div className={css({ spaceY: '2', maxH: '64', overflowY: 'auto' })}>
                  {favorites.map((item, index) => (
                    <div
                      key={`${item.foreground}-${item.background}-${index}`}
                      className={css({
                        w: 'full',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                      })}
                    >
                      <button
                        type="button"
                        onClick={() => loadColorPair(item.foreground, item.background)}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          flex: '1',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          _hover: {
                            opacity: '0.8',
                          },
                        })}
                      >
                        <div
                          className={css({ w: '12', h: '12', rounded: 'md', flexShrink: '0' })}
                          style={{ backgroundColor: item.background }}
                        >
                          <div
                            className={css({
                              w: 'full',
                              h: 'full',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            })}
                            style={{ color: item.foreground }}
                          >
                            Aa
                          </div>
                        </div>
                        <div className={css({ flex: '1', textAlign: 'left', fontSize: 'sm' })}>
                          <div className={css({ color: 'gray.300', fontFamily: 'mono' })}>
                            {item.foreground} / {item.background}
                          </div>
                          <div className={css({ color: 'gray.500', fontSize: 'xs' })}>
                            Ratio: {item.ratio.toFixed(2)}:1
                          </div>
                        </div>
                      </button>
                      <Button
                        onClick={() => removeFromFavorites(item.foreground, item.background)}
                        className={css({
                          gap: '2',
                          bg: 'red.500/20',
                          color: 'red.400',
                          _hover: { bg: 'red.500/30' },
                          px: '3',
                          py: '2',
                        })}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Export Actions */}
            <div
              className={css({
                display: 'flex',
                gap: '3',
                justifyContent: 'center',
                flexWrap: 'wrap',
              })}
            >
              <Button
                onClick={exportAsJSON}
                className={css({
                  gap: '2',
                  bg: 'blue.500/20',
                  border: '1px solid',
                  borderColor: 'blue.500/50',
                  color: 'blue.300',
                  _hover: { bg: 'blue.500/30' },
                })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Export JSON
              </Button>
              <Button
                onClick={exportAsPNG}
                className={css({
                  gap: '2',
                  bg: 'green.500/20',
                  border: '1px solid',
                  borderColor: 'green.500/50',
                  color: 'green.300',
                  _hover: { bg: 'green.500/30' },
                })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Export PNG
              </Button>
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

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
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
