'use client'

import { motion } from 'framer-motion'
import {
  Check,
  Crop,
  Download,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  Palette,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface Filter {
  id: string
  name: string
  apply: (ctx: CanvasRenderingContext2D, imageData: ImageData) => ImageData
  premium?: boolean
}

interface Adjustment {
  id: string
  name: string
  value: number
  min: number
  max: number
  step: number
}

interface HistoryItem {
  imageData: ImageData
  adjustments: Adjustment[]
  filter: string | null
}

const filters: Filter[] = [
  {
    id: 'none',
    name: 'Original',
    apply: (_ctx, imageData) => imageData,
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    apply: (_ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg
        data[i + 1] = avg
        data[i + 2] = avg
      }
      return imageData
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    apply: (_ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
      }
      return imageData
    },
  },
  {
    id: 'invert',
    name: 'Invert',
    apply: (_ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
      return imageData
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    apply: (_ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2)
        data[i + 1] = Math.min(255, data[i + 1] * 1.1)
        data[i + 2] = Math.min(255, data[i + 2] * 0.8)
      }
      return imageData
    },
    premium: true,
  },
  {
    id: 'cool',
    name: 'Cool',
    apply: (_ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 0.9)
        data[i + 1] = Math.min(255, data[i + 1] * 1.0)
        data[i + 2] = Math.min(255, data[i + 2] * 1.2)
      }
      return imageData
    },
    premium: true,
  },
  {
    id: 'warm',
    name: 'Warm',
    apply: (_ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2)
        data[i + 1] = Math.min(255, data[i + 1] * 1.05)
        data[i + 2] = Math.min(255, data[i + 2] * 0.8)
      }
      return imageData
    },
    premium: true,
  },
]

export default function PhotoEditorPage() {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('none')
  const [adjustments, setAdjustments] = useState<Adjustment[]>([
    { id: 'brightness', name: 'Brightness', value: 100, min: 0, max: 200, step: 1 },
    { id: 'contrast', name: 'Contrast', value: 100, min: 0, max: 200, step: 1 },
    { id: 'saturation', name: 'Saturation', value: 100, min: 0, max: 200, step: 1 },
  ])
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [_history, setHistory] = useState<HistoryItem[]>([])
  const [_historyIndex, setHistoryIndex] = useState(-1)
  const [activeTab, setActiveTab] = useState<'filters' | 'adjustments' | 'transform' | 'ai'>(
    'filters'
  )
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Apply all effects to canvas
  const applyEffects = useCallback(() => {
    if (!canvasRef.current || !uploadedImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to image size
    canvas.width = uploadedImage.width
    canvas.height = uploadedImage.height

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw image
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    // Apply adjustments
    const brightnessAdj = adjustments.find((a) => a.id === 'brightness')
    const contrastAdj = adjustments.find((a) => a.id === 'contrast')
    const saturationAdj = adjustments.find((a) => a.id === 'saturation')

    ctx.filter = `brightness(${brightnessAdj?.value || 100}%) contrast(${contrastAdj?.value || 100}%) saturate(${saturationAdj?.value || 100}%)`
    ctx.drawImage(canvas, 0, 0)
    ctx.filter = 'none'

    // Apply filter
    const filter = filters.find((f) => f.id === selectedFilter)
    if (filter && filter.id !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const filteredData = filter.apply(ctx, imageData)
      ctx.putImageData(filteredData, 0, 0)
    }
  }, [uploadedImage, selectedFilter, adjustments, rotation, flipH, flipV])

  useEffect(() => {
    applyEffects()
  }, [applyEffects])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setUploadedImage(img)
        setSelectedFilter('none')
        setAdjustments([
          { id: 'brightness', name: 'Brightness', value: 100, min: 0, max: 200, step: 1 },
          { id: 'contrast', name: 'Contrast', value: 100, min: 0, max: 200, step: 1 },
          { id: 'saturation', name: 'Saturation', value: 100, min: 0, max: 200, step: 1 },
        ])
        setRotation(0)
        setFlipH(false)
        setFlipV(false)
        setHistory([])
        setHistoryIndex(-1)
        toast.success('Image uploaded successfully')
        trackToolEvent('photo_editor_upload', { file_size: file.size })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleFilterClick = (filterId: string) => {
    const filter = filters.find((f) => f.id === filterId)
    if (filter?.premium) {
      toast.error('This filter is only available in the Premium plan')
      trackToolEvent('photo_editor_premium_upsell', { feature: 'filter', filter_id: filterId })
      return
    }

    setSelectedFilter(filterId)
    trackToolEvent('photo_editor_filter_apply', { filter_id: filterId })
  }

  const handleAdjustmentChange = (id: string, value: number) => {
    setAdjustments((prev) => prev.map((adj) => (adj.id === id ? { ...adj, value } : adj)))
    trackToolEvent('photo_editor_adjustment', { adjustment_id: id, value })
  }

  const handleRotate = (direction: 'left' | 'right') => {
    setRotation((prev) => (direction === 'left' ? prev - 90 : prev + 90))
    trackToolEvent('photo_editor_rotate', { direction })
  }

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      setFlipH((prev) => !prev)
    } else {
      setFlipV((prev) => !prev)
    }
    trackToolEvent('photo_editor_flip', { direction })
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edited-photo-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Image downloaded successfully')
      trackToolEvent('photo_editor_export', { format: 'png' })
    })
  }

  const handleReset = () => {
    setSelectedFilter('none')
    setAdjustments([
      { id: 'brightness', name: 'Brightness', value: 100, min: 0, max: 200, step: 1 },
      { id: 'contrast', name: 'Contrast', value: 100, min: 0, max: 200, step: 1 },
      { id: 'saturation', name: 'Saturation', value: 100, min: 0, max: 200, step: 1 },
    ])
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    toast.success('All changes reset')
    trackToolEvent('photo_editor_reset', {})
  }

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description for the image')
      return
    }

    setIsGenerating(true)
    trackToolEvent('photo_editor_ai_generate_start', { prompt_length: aiPrompt.length })

    try {
      const response = await fetch('/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setGeneratedImageUrl(data.imageUrl)

      // Load generated image into editor
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setUploadedImage(img)
        toast.success('AI image generated successfully!')
        trackToolEvent('photo_editor_ai_generate_success', { prompt_length: aiPrompt.length })
      }
      img.src = data.imageUrl
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
      trackToolEvent('photo_editor_ai_generate_error', { error: String(error) })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
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
            borderColor: 'purple.500/30',
            bg: 'purple.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            Professional Photo Editor • AI-Powered
          </span>
          <Badge
            className={css({
              bg: 'gradient-to-r from-yellow-500 to-orange-500',
              color: 'white',
              fontSize: 'xs',
              px: '2',
              py: '0.5',
            })}
          >
            PREMIUM
          </Badge>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'orange.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Photo Editor
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Professional photo editing with advanced filters, adjustments, and AI-powered image
          generation. Edit photos in your browser with powerful tools and effects.
        </p>
      </motion.div>

      {/* Main Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Photo Editor</CardTitle>
            <CardDescription>
              Upload an image or generate one with AI, then edit with professional tools
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Tabs */}
            <div
              className={css({
                display: 'flex',
                gap: '2',
                borderBottom: '1px solid',
                borderColor: 'gray.800',
                pb: '2',
                flexWrap: 'wrap',
              })}
            >
              {[
                { id: 'filters', label: 'Filters', icon: Palette },
                { id: 'adjustments', label: 'Adjustments', icon: Settings },
                { id: 'transform', label: 'Transform', icon: Crop },
                { id: 'ai', label: 'AI Generate', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      px: '4',
                      py: '2',
                      rounded: 'lg',
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      bg: activeTab === tab.id ? 'purple.500/20' : 'transparent',
                      color: activeTab === tab.id ? 'purple.300' : 'gray.400',
                      border: '1px solid',
                      borderColor: activeTab === tab.id ? 'purple.500/50' : 'transparent',
                      _hover: {
                        bg: activeTab === tab.id ? 'purple.500/30' : 'gray.800/50',
                        color: activeTab === tab.id ? 'purple.300' : 'gray.300',
                      },
                    })}
                  >
                    <Icon className={css({ h: '4', w: '4' })} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Upload Section */}
            {!uploadedImage && activeTab !== 'ai' && (
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minH: '96',
                  border: '2px dashed',
                  borderColor: 'purple.500/30',
                  rounded: 'lg',
                  bg: 'purple.500/5',
                  p: '8',
                  spaceY: '4',
                })}
              >
                <Upload className={css({ h: '16', w: '16', color: 'purple.400' })} />
                <div className={css({ textAlign: 'center', spaceY: '2' })}>
                  <p className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                    Upload a photo to start editing
                  </p>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Supports JPG, PNG, WebP (Max 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={css({ display: 'none' })}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className={css({
                    gap: '2',
                    bg: 'purple.500/20',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    minH: '11',
                    px: '6',
                    _hover: {
                      bg: 'purple.500/30',
                    },
                  })}
                >
                  <Upload className={css({ h: '5', w: '5' })} />
                  Choose Image
                </Button>
              </div>
            )}

            {/* AI Generation Tab */}
            {activeTab === 'ai' && (
              <div className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'purple.500/10',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                    <Sparkles className={css({ h: '5', w: '5', color: 'purple.400', mt: '1' })} />
                    <div className={css({ spaceY: '2' })}>
                      <h3
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'semibold',
                          color: 'purple.300',
                        })}
                      >
                        AI Image Generation
                      </h3>
                      <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                        Describe the image you want to create and our AI will generate it for you.
                        Premium feature powered by OpenAI DALL-E.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="ai-prompt"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Image Description
                  </label>
                  <Input
                    id="ai-prompt"
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., A serene mountain landscape at sunset with vibrant colors..."
                    className={css({
                      h: '14',
                      fontSize: 'base',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _focus: {
                        borderColor: 'purple.500',
                        ring: '2px',
                        ringColor: 'purple.500/20',
                      },
                    })}
                  />
                </div>

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className={css({
                    w: 'full',
                    gap: '2',
                    minH: '12',
                    bg: 'purple.500/20',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    _hover: {
                      bg: 'purple.500/30',
                    },
                    _disabled: {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    },
                  })}
                >
                  {isGenerating ? (
                    <>
                      <Loader2
                        className={css({ h: '5', w: '5', animation: 'spin 1s linear infinite' })}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className={css({ h: '5', w: '5' })} />
                      Generate Image with AI
                    </>
                  )}
                </Button>

                {generatedImageUrl && (
                  <div className={css({ mt: '4', textAlign: 'center' })}>
                    <p className={css({ fontSize: 'sm', color: 'green.400', mb: '2' })}>
                      Image generated! It's now loaded in the editor above.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Canvas and Controls */}
            {uploadedImage && activeTab !== 'ai' && (
              <div className={css({ spaceY: '6' })}>
                {/* Canvas */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minH: '96',
                    bg: 'gray.800/30',
                    rounded: 'lg',
                    p: '4',
                    overflow: 'auto',
                  })}
                >
                  <canvas
                    ref={canvasRef}
                    className={css({
                      maxW: 'full',
                      maxH: '96',
                      rounded: 'lg',
                      shadow: 'xl',
                    })}
                  />
                </div>

                {/* Filters Tab */}
                {activeTab === 'filters' && (
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: {
                        base: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: '3',
                      w: 'full',
                    })}
                  >
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => handleFilterClick(filter.id)}
                        className={css({
                          position: 'relative',
                          p: '4',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor:
                            selectedFilter === filter.id ? 'purple.500/50' : 'gray.700/50',
                          bg: selectedFilter === filter.id ? 'purple.500/20' : 'gray.800/50',
                          color: selectedFilter === filter.id ? 'purple.300' : 'gray.400',
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          _hover: {
                            bg: selectedFilter === filter.id ? 'purple.500/30' : 'gray.800',
                            borderColor:
                              selectedFilter === filter.id ? 'purple.500/70' : 'gray.600',
                            transform: 'translateY(-2px)',
                          },
                        })}
                      >
                        {filter.name}
                        {filter.premium && (
                          <Badge
                            className={css({
                              position: 'absolute',
                              top: '2',
                              right: '2',
                              bg: 'yellow.500',
                              color: 'black',
                              fontSize: '2xs',
                              px: '1.5',
                              py: '0.5',
                            })}
                          >
                            PRO
                          </Badge>
                        )}
                        {selectedFilter === filter.id && (
                          <Check
                            className={css({
                              position: 'absolute',
                              bottom: '2',
                              right: '2',
                              h: '4',
                              w: '4',
                              color: 'purple.400',
                            })}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Adjustments Tab */}
                {activeTab === 'adjustments' && (
                  <div className={css({ spaceY: '6' })}>
                    {adjustments.map((adj) => (
                      <div key={adj.id} className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          })}
                        >
                          <label
                            htmlFor={`adj-${adj.id}`}
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'gray.300',
                            })}
                          >
                            {adj.name}
                          </label>
                          <span className={css({ fontSize: 'sm', color: 'purple.400' })}>
                            {adj.value}
                          </span>
                        </div>
                        <input
                          id={`adj-${adj.id}`}
                          type="range"
                          min={adj.min}
                          max={adj.max}
                          step={adj.step}
                          value={adj.value}
                          onChange={(e) => handleAdjustmentChange(adj.id, Number(e.target.value))}
                          style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgb(55 65 81)',
                            cursor: 'pointer',
                            appearance: 'none',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Transform Tab */}
                {activeTab === 'transform' && (
                  <div className={css({ spaceY: '4' })}>
                    <div className={css({ spaceY: '3' })}>
                      <h3
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'gray.300',
                        })}
                      >
                        Rotate
                      </h3>
                      <div className={css({ display: 'flex', gap: '3' })}>
                        <Button
                          onClick={() => handleRotate('left')}
                          className={css({
                            flex: '1',
                            gap: '2',
                            bg: 'gray.800',
                            _hover: { bg: 'gray.700' },
                          })}
                        >
                          <RotateCcw className={css({ h: '4', w: '4' })} />
                          Rotate Left
                        </Button>
                        <Button
                          onClick={() => handleRotate('right')}
                          className={css({
                            flex: '1',
                            gap: '2',
                            bg: 'gray.800',
                            _hover: { bg: 'gray.700' },
                          })}
                        >
                          <RotateCw className={css({ h: '4', w: '4' })} />
                          Rotate Right
                        </Button>
                      </div>
                    </div>

                    <div className={css({ spaceY: '3' })}>
                      <h3
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'gray.300',
                        })}
                      >
                        Flip
                      </h3>
                      <div className={css({ display: 'flex', gap: '3' })}>
                        <Button
                          onClick={() => handleFlip('horizontal')}
                          className={css({
                            flex: '1',
                            gap: '2',
                            bg: flipH ? 'purple.500/20' : 'gray.800',
                            border: '1px solid',
                            borderColor: flipH ? 'purple.500/50' : 'transparent',
                            _hover: {
                              bg: flipH ? 'purple.500/30' : 'gray.700',
                            },
                          })}
                        >
                          <FlipHorizontal className={css({ h: '4', w: '4' })} />
                          Horizontal
                        </Button>
                        <Button
                          onClick={() => handleFlip('vertical')}
                          className={css({
                            flex: '1',
                            gap: '2',
                            bg: flipV ? 'purple.500/20' : 'gray.800',
                            border: '1px solid',
                            borderColor: flipV ? 'purple.500/50' : 'transparent',
                            _hover: {
                              bg: flipV ? 'purple.500/30' : 'gray.700',
                            },
                          })}
                        >
                          <FlipVertical className={css({ h: '4', w: '4' })} />
                          Vertical
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: { base: 'column', sm: 'row' },
                    gap: '3',
                    pt: '4',
                    borderTop: '1px solid',
                    borderColor: 'gray.800',
                  })}
                >
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className={css({
                      flex: '1',
                      gap: '2',
                      minH: '11',
                    })}
                  >
                    <RotateCcw className={css({ h: '5', w: '5' })} />
                    Reset All
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className={css({
                      flex: '1',
                      gap: '2',
                      minH: '11',
                    })}
                  >
                    <Upload className={css({ h: '5', w: '5' })} />
                    New Image
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className={css({
                      flex: '1',
                      gap: '2',
                      minH: '11',
                      bg: 'purple.500/20',
                      border: '1px solid',
                      borderColor: 'purple.500/50',
                      color: 'purple.300',
                      _hover: {
                        bg: 'purple.500/30',
                      },
                    })}
                  >
                    <Download className={css({ h: '5', w: '5' })} />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Premium Features
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• AI-powered image generation with DALL-E</li>
                  <li>• Professional filters: Vintage, Cool, Warm, and more</li>
                  <li>• Advanced adjustments: Brightness, Contrast, Saturation</li>
                  <li>• Transform tools: Rotate, Flip, Crop</li>
                  <li>• Export in high quality PNG format</li>
                  <li>• All processing happens locally in your browser</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
