'use client'

import {
  Check,
  Copy,
  Download,
  Moon,
  Plus,
  RotateCcw,
  Shuffle,
  Sun,
  Trash2,
  Wand2,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ColorStop {
  id: string
  color: string
  position: number
}

type GradientType = 'linear' | 'radial' | 'conic'

interface GradientPreset {
  name: string
  colors: string[]
  type: GradientType
  angle?: number
  category: string
}

const presets: GradientPreset[] = [
  // Sunset
  {
    name: 'Warm Flame',
    colors: ['#ff9a56', '#ff6a88', '#ff99ac'],
    type: 'linear',
    angle: 45,
    category: 'sunset',
  },
  {
    name: 'Night Fade',
    colors: ['#a18cd1', '#fbc2eb'],
    type: 'linear',
    angle: 135,
    category: 'sunset',
  },
  {
    name: 'Spring Warmth',
    colors: ['#fad0c4', '#ffd1ff'],
    type: 'linear',
    angle: 90,
    category: 'sunset',
  },

  // Ocean
  {
    name: 'Deep Blue',
    colors: ['#6a11cb', '#2575fc'],
    type: 'linear',
    angle: 135,
    category: 'ocean',
  },
  { name: 'Reef', colors: ['#00d2ff', '#3a7bd5'], type: 'linear', angle: 45, category: 'ocean' },
  {
    name: 'Sea Weed',
    colors: ['#4ca1af', '#c4e0e5'],
    type: 'linear',
    angle: 180,
    category: 'ocean',
  },

  // Forest
  { name: 'Lush', colors: ['#56ab2f', '#a8e063'], type: 'linear', angle: 90, category: 'forest' },
  { name: 'Moss', colors: ['#134e5e', '#71b280'], type: 'linear', angle: 135, category: 'forest' },
  { name: 'Jungle', colors: ['#0f9b0f', '#8fd3f4'], type: 'linear', angle: 45, category: 'forest' },

  // Fire
  {
    name: 'Burning Orange',
    colors: ['#ff416c', '#ff4b2b'],
    type: 'linear',
    angle: 90,
    category: 'fire',
  },
  {
    name: 'Red Mist',
    colors: ['#ff0844', '#ffb199'],
    type: 'linear',
    angle: 135,
    category: 'fire',
  },
  { name: 'Phoenix', colors: ['#f83600', '#f9d423'], type: 'linear', angle: 45, category: 'fire' },

  // Neon
  {
    name: 'Neon Life',
    colors: ['#b3ffab', '#12fff7'],
    type: 'linear',
    angle: 45,
    category: 'neon',
  },
  {
    name: 'Electric Violet',
    colors: ['#4776e6', '#8e54e9'],
    type: 'linear',
    angle: 135,
    category: 'neon',
  },
  {
    name: 'Synthwave',
    colors: ['#f093fb', '#f5576c'],
    type: 'linear',
    angle: 90,
    category: 'neon',
  },

  // Pastel
  {
    name: 'Sweet Morning',
    colors: ['#ff6e7f', '#bfe9ff'],
    type: 'linear',
    angle: 135,
    category: 'pastel',
  },
  { name: 'Candy', colors: ['#ffecd2', '#fcb69f'], type: 'linear', angle: 90, category: 'pastel' },
  {
    name: 'Peach',
    colors: ['#ffeaa7', '#fdcb6e', '#e17055'],
    type: 'linear',
    angle: 45,
    category: 'pastel',
  },

  // Radial
  { name: 'Radial Burst', colors: ['#667eea', '#764ba2'], type: 'radial', category: 'special' },
  {
    name: 'Conic Rainbow',
    colors: ['#ee0979', '#ff6a00', '#fdfc47', '#0cebeb', '#20e3b2', '#29ffc6'],
    type: 'conic',
    category: 'special',
  },
]

export default function GradientGeneratorPage() {
  // Track tool view for Recent Tools feature
  useTrackToolView({
    toolId: 'gradient-generator',
    title: 'Gradient Generator',
    href: '/tools/design/gradient-generator',
    iconName: 'Wand2',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
  })

  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#667eea', position: 0 },
    { id: '2', color: '#764ba2', position: 100 },
  ])
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [previewBg, setPreviewBg] = useState<'dark' | 'light'>('dark')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate CSS gradient string
  const generateGradientCSS = (): string => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)
    const colorString = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${colorString})`
      case 'radial':
        return `radial-gradient(circle, ${colorString})`
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${colorString})`
      default:
        return ''
    }
  }

  // Add color stop
  const handleAddColorStop = () => {
    const newPosition =
      colorStops.length > 0
        ? Math.round((colorStops[colorStops.length - 1].position + 100) / 2)
        : 50

    const newStop: ColorStop = {
      id: Date.now().toString(),
      color:
        '#' +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, '0'),
      position: Math.min(newPosition, 100),
    }

    setColorStops([...colorStops, newStop])
    trackToolEvent('gradient_generator_add_color_stop')
  }

  // Remove color stop
  const handleRemoveColorStop = (id: string) => {
    if (colorStops.length <= 2) {
      toast.error('You need at least 2 color stops')
      return
    }
    setColorStops(colorStops.filter((stop) => stop.id !== id))
    trackToolEvent('gradient_generator_remove_color_stop')
  }

  // Update color stop
  const handleUpdateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setColorStops(colorStops.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop)))
  }

  // Apply preset
  const handleApplyPreset = (preset: GradientPreset) => {
    const newStops: ColorStop[] = preset.colors.map((color, index) => ({
      id: Date.now().toString() + index,
      color,
      position: Math.round((index / (preset.colors.length - 1)) * 100),
    }))

    setColorStops(newStops)
    setGradientType(preset.type)
    if (preset.angle !== undefined) {
      setAngle(preset.angle)
    }

    toast.success(`Applied "${preset.name}" preset`)
    trackToolEvent('gradient_generator_apply_preset', { preset_name: preset.name })
  }

  // Copy CSS
  const handleCopyCSS = async () => {
    const css = `background: ${generateGradientCSS()};`
    await navigator.clipboard.writeText(css)
    setCopied('css')
    setTimeout(() => setCopied(null), 2000)
    toast.success('CSS copied to clipboard!')
    trackToolEvent('gradient_generator_copy_css')
  }

  // Download as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1200
    canvas.height = 675

    // Create gradient
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)
    let gradient: CanvasGradient

    if (gradientType === 'linear') {
      const angleRad = ((angle - 90) * Math.PI) / 180
      const x1 = canvas.width / 2 + (Math.cos(angleRad) * canvas.width) / 2
      const y1 = canvas.height / 2 + (Math.sin(angleRad) * canvas.height) / 2
      const x2 = canvas.width / 2 - (Math.cos(angleRad) * canvas.width) / 2
      const y2 = canvas.height / 2 - (Math.sin(angleRad) * canvas.height) / 2
      gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    } else if (gradientType === 'radial') {
      gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      )
    } else {
      // Conic - use linear as fallback for canvas
      gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    }

    sortedStops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gradient-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Gradient downloaded!')
      trackToolEvent('gradient_generator_download_png')
    })
  }

  // Randomize gradient
  const handleRandomize = () => {
    const numStops = 2 + Math.floor(Math.random() * 3) // 2-4 stops
    const newStops: ColorStop[] = []

    for (let i = 0; i < numStops; i++) {
      newStops.push({
        id: Date.now().toString() + i,
        color:
          '#' +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0'),
        position: Math.round((i / (numStops - 1)) * 100),
      })
    }

    setColorStops(newStops)
    setAngle(Math.floor(Math.random() * 360))
    toast.success('Random gradient generated!')
    trackToolEvent('gradient_generator_randomize')
  }

  // Reverse gradient
  const handleReverse = () => {
    const reversed = colorStops.map((stop) => ({
      ...stop,
      position: 100 - stop.position,
    }))
    setColorStops(reversed)
    trackToolEvent('gradient_generator_reverse')
  }

  const gradientCSS = generateGradientCSS()

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
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'purple.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Wand2 className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.300' })}>
            Beautiful CSS Gradients
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'orange.400',
            bgClip: 'text',
          })}
          style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Gradient Generator
        </h1>

        <p className={css({ mx: 'auto', maxW: '2xl', fontSize: 'lg', color: 'white' })}>
          Create stunning CSS gradients visually. Linear, radial, and conic gradients with unlimited
          color stops, presets, and export options.
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: '6',
        })}
      >
        {/* Main Preview and Controls */}
        <div className={css({ spaceY: '6' })}>
          {/* Preview Card */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              p: '6',
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: '4',
              })}
            >
              <h2 className={css({ fontSize: 'xl', fontWeight: '600', color: 'gray.100' })}>
                Preview
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewBg(previewBg === 'dark' ? 'light' : 'dark')}
              >
                {previewBg === 'dark' ? (
                  <Sun className={css({ h: '4', w: '4' })} />
                ) : (
                  <Moon className={css({ h: '4', w: '4' })} />
                )}
              </Button>
            </div>

            {/* Large Preview */}
            <div
              className={css({
                position: 'relative',
                h: { base: '64', sm: '80', md: '96' },
                rounded: 'xl',
                border: '2px solid',
                borderColor: 'gray.700',
                overflow: 'hidden',
                bg: previewBg === 'dark' ? 'gray.950' : 'gray.50',
              })}
            >
              <div className={css({ w: 'full', h: 'full' })} style={{ background: gradientCSS }} />
            </div>

            {/* Action Buttons */}
            <div className={css({ display: 'flex', gap: '3', mt: '4' })}>
              <Button onClick={handleCopyCSS} className={css({ flex: '1' })}>
                {copied === 'css' ? (
                  <>
                    <Check className={css({ mr: '2', h: '4', w: '4' })} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className={css({ mr: '2', h: '4', w: '4' })} />
                    Copy CSS
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className={css({ mr: '2', h: '4', w: '4' })} />
                Download PNG
              </Button>
              <Button onClick={handleRandomize} variant="outline">
                <Shuffle className={css({ h: '4', w: '4' })} />
              </Button>
              <Button onClick={handleReverse} variant="outline">
                <RotateCcw className={css({ h: '4', w: '4' })} />
              </Button>
            </div>
          </Card>

          {/* Controls Card */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              p: '6',
              spaceY: '6',
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: '600', color: 'gray.100' })}>
              Gradient Controls
            </h2>

            {/* Gradient Type */}
            <Field>
              <FieldLabel>Gradient Type</FieldLabel>
              <div className={css({ display: 'flex', gap: '2' })}>
                {(['linear', 'radial', 'conic'] as GradientType[]).map((type) => (
                  <Button
                    key={type}
                    variant={gradientType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGradientType(type)}
                    className={css({ flex: '1', textTransform: 'capitalize' })}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </Field>

            {/* Angle (for linear and conic) */}
            {(gradientType === 'linear' || gradientType === 'conic') && (
              <Field>
                <FieldLabel>Angle: {angle}°</FieldLabel>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                  className={css({ w: 'full' })}
                />
              </Field>
            )}

            {/* Color Stops */}
            <div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: '3',
                })}
              >
                <FieldLabel>Color Stops</FieldLabel>
                <Button size="sm" onClick={handleAddColorStop}>
                  <Plus className={css({ mr: '1', h: '3.5', w: '3.5' })} />
                  Add
                </Button>
              </div>

              <div className={css({ spaceY: '3' })}>
                {colorStops.map((stop) => (
                  // biome-ignore lint/a11y/useSemanticElements: interactive color stop picker requires div for proper layout
                  <div
                    key={stop.id}
                    role="button"
                    tabIndex={0}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3',
                      p: '3',
                      rounded: 'lg',
                      bg: selectedStopId === stop.id ? 'purple.500/10' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: selectedStopId === stop.id ? 'purple.500/30' : 'gray.700',
                      cursor: 'pointer',
                      width: 'full',
                    })}
                    onClick={() => setSelectedStopId(stop.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedStopId(stop.id)
                      }
                    }}
                  >
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => handleUpdateColorStop(stop.id, { color: e.target.value })}
                      className={css({ w: '12', h: '12', rounded: 'lg', cursor: 'pointer' })}
                    />
                    <div className={css({ flex: '1', spaceY: '2' })}>
                      <Input
                        value={stop.color}
                        onChange={(e) => handleUpdateColorStop(stop.id, { color: e.target.value })}
                        placeholder="#000000"
                        className={css({ fontFamily: 'mono', textTransform: 'uppercase' })}
                      />
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) =>
                            handleUpdateColorStop(stop.id, {
                              position: parseInt(e.target.value, 10),
                            })
                          }
                          className={css({ flex: '1' })}
                        />
                        <span
                          className={css({
                            fontSize: 'sm',
                            color: 'white',
                            w: '12',
                            textAlign: 'right',
                          })}
                        >
                          {stop.position}%
                        </span>
                      </div>
                    </div>
                    {colorStops.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveColorStop(stop.id)
                        }}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <Field>
              <FieldLabel>CSS Code</FieldLabel>
              <div className={css({ position: 'relative' })}>
                <pre
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.950',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    fontSize: 'sm',
                    fontFamily: 'mono',
                    color: 'white',
                    overflow: 'auto',
                  })}
                >
                  background: {gradientCSS}
                </pre>
              </div>
            </Field>
          </Card>
        </div>

        {/* Presets Sidebar */}
        <div className={css({ spaceY: '6' })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              p: '6',
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: '600', color: 'gray.100', mb: '4' })}>
              Gradient Presets
            </h2>

            <div className={css({ spaceY: '4' })}>
              {['sunset', 'ocean', 'forest', 'fire', 'neon', 'pastel', 'special'].map(
                (category) => {
                  const categoryPresets = presets.filter((p) => p.category === category)
                  if (categoryPresets.length === 0) return null

                  return (
                    <div key={category}>
                      <h3
                        className={css({
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'white',
                          mb: '2',
                          textTransform: 'capitalize',
                        })}
                      >
                        {category}
                      </h3>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '2',
                        })}
                      >
                        {categoryPresets.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={css({
                              h: '20',
                              rounded: 'lg',
                              border: '2px solid',
                              borderColor: 'gray.700',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              _hover: {
                                borderColor: 'purple.500',
                                transform: 'scale(1.05)',
                              },
                            })}
                            style={{
                              background:
                                preset.type === 'linear'
                                  ? `linear-gradient(${preset.angle || 90}deg, ${preset.colors.join(', ')})`
                                  : preset.type === 'radial'
                                    ? `radial-gradient(circle, ${preset.colors.join(', ')})`
                                    : `conic-gradient(${preset.colors.join(', ')})`,
                            }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} className={css({ display: 'none' })} />

      {/* Social Share */}
      <div
        className={css({
          animation: 'fadeIn 0.5s ease-in',
          animationDelay: '0.5s',
          animationFillMode: 'both',
        })}
      >
        <SocialShare
          toolName="Gradient Generator"
          toolUrl="/tools/gradient-generator"
          description="Create stunning CSS gradients visually with unlimited color stops and export options"
          hashtags={['CSS', 'Gradient', 'WebDesign', 'CSSTools', 'FrontendDev']}
        />
      </div>

      {/* Related Tools */}
      <div
        className={css({
          animation: 'fadeIn 0.5s ease-in',
          animationDelay: '0.7s',
          animationFillMode: 'both',
        })}
      >
        <RelatedTools currentToolPath="/tools/gradient-generator" category="design" />
      </div>

      {/* Tool Rating */}
      <div
        className={css({
          animation: 'fadeIn 0.5s ease-in',
          animationDelay: '0.8s',
          animationFillMode: 'both',
        })}
      >
        <ToolRating toolId="/tools/gradient-generator" toolName="Gradient Generator" />
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
