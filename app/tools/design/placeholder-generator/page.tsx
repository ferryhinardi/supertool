'use client'

import { Check, Copy, Download, ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

import {
  colorPalette,
  downloadFile,
  generateSVG,
  type SizePreset,
  sizePresets,
  svgToDataURL,
  svgToPNG,
} from './templates'

// Category labels
const categories: Array<{ id: SizePreset['category']; label: string }> = [
  { id: 'web', label: 'Web' },
  { id: 'social', label: 'Social Media' },
  { id: 'video', label: 'Video' },
  { id: 'print', label: 'Print' },
  { id: 'ad', label: 'Ad Banners' },
]

export default function PlaceholderGeneratorPage() {
  // State
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('#cccccc')
  const [text, setText] = useState('800 × 600')
  const [textColor, setTextColor] = useState('#333333')
  const [fontSize, setFontSize] = useState(48)
  const [previewSVG, setPreviewSVG] = useState('')
  const [activeCategory, setActiveCategory] = useState<SizePreset['category']>('web')
  const [copiedDataURL, setCopiedDataURL] = useState(false)
  const [recentSizes, setRecentSizes] = useState<Array<{ width: number; height: number }>>([])

  // Load recent sizes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('placeholder_recent_sizes')
    if (stored) {
      try {
        setRecentSizes(JSON.parse(stored))
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  // Generate preview whenever inputs change
  useEffect(() => {
    const svg = generateSVG(width, height, bgColor, text, textColor, fontSize)
    setPreviewSVG(svg)
  }, [width, height, bgColor, text, textColor, fontSize])

  // Update text when dimensions change (only if text matches old dimensions)
  useEffect(() => {
    const dimensionPattern = /^\d+\s*[×x]\s*\d+$/
    if (dimensionPattern.test(text.trim())) {
      setText(`${width} × ${height}`)
    }
  }, [width, height, text])

  // Handle dimension change
  const handleDimensionChange = (newWidth: number, newHeight: number) => {
    setWidth(newWidth)
    setHeight(newHeight)

    // Add to recent sizes
    const newRecent = [
      { width: newWidth, height: newHeight },
      ...recentSizes.filter((s) => !(s.width === newWidth && s.height === newHeight)),
    ].slice(0, 5)

    setRecentSizes(newRecent)
    localStorage.setItem('placeholder_recent_sizes', JSON.stringify(newRecent))

    trackToolEvent('placeholder_generator_size_changed', {
      width: newWidth,
      height: newHeight,
    })
  }

  // Handle preset click
  const handlePresetClick = (preset: SizePreset) => {
    handleDimensionChange(preset.width, preset.height)
    trackToolEvent('placeholder_generator_preset_selected', {
      preset: preset.name,
      width: preset.width,
      height: preset.height,
    })
  }

  // Handle color change
  const handleColorChange = (type: 'bg' | 'text', color: string) => {
    if (type === 'bg') {
      setBgColor(color)
    } else {
      setTextColor(color)
    }
    trackToolEvent('placeholder_generator_color_changed', {
      type,
      color,
    })
  }

  // Copy data URL to clipboard
  const handleCopyDataURL = async () => {
    const dataURL = svgToDataURL(previewSVG)
    await navigator.clipboard.writeText(dataURL)
    setCopiedDataURL(true)
    setTimeout(() => setCopiedDataURL(false), 2000)
    trackToolEvent('placeholder_generator_copied', {
      width,
      height,
      format: 'data_url',
    })
  }

  // Download SVG
  const handleDownloadSVG = () => {
    const dataURL = svgToDataURL(previewSVG)
    downloadFile(dataURL, `placeholder-${width}x${height}.svg`)
    trackToolEvent('placeholder_generator_downloaded', {
      width,
      height,
      format: 'svg',
    })
  }

  // Download PNG
  const handleDownloadPNG = () => {
    svgToPNG(previewSVG, width, height, (dataURL) => {
      downloadFile(dataURL, `placeholder-${width}x${height}.png`)
      trackToolEvent('placeholder_generator_downloaded', {
        width,
        height,
        format: 'png',
      })
    })
  }

  // Filter presets by category
  const filteredPresets = sizePresets.filter((preset) => preset.category === activeCategory)

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
      <div className={css({ spaceY: '3' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <div
            className={css({
              p: '3',
              borderRadius: 'xl',
              bgGradient: 'to-r',
              gradientFrom: 'pink.500',
              gradientTo: 'rose.500',
            })}
          >
            <ImagePlus className={css({ w: '6', h: '6', color: 'white' })} />
          </div>
          <div>
            <h1
              className={css({
                fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                fontWeight: 'bold',
                letterSpacing: 'tight',
              })}
            >
              Placeholder Image Generator
            </h1>
            <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
              Generate custom placeholder images with custom dimensions, colors, and text
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: { base: '6', lg: '8' },
          w: 'full',
        })}
      >
        {/* Left Column - Controls */}
        <div className={css({ spaceY: '6' })}>
          {/* Dimensions */}
          <Card>
            <CardContent className={css({ spaceY: '4' })}>
              <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Dimensions</h2>

              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '4',
                })}
              >
                <div className={css({ spaceY: '2' })}>
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min={1}
                    max={10000}
                    value={width}
                    onChange={(e) => handleDimensionChange(Number(e.target.value), height)}
                  />
                </div>
                <div className={css({ spaceY: '2' })}>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={1}
                    max={10000}
                    value={height}
                    onChange={(e) => handleDimensionChange(width, Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Recent Sizes */}
              {recentSizes.length > 0 && (
                <div className={css({ spaceY: '2' })}>
                  <Label>Recent Sizes</Label>
                  <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                    {recentSizes.map((size, index) => (
                      <Button
                        key={`${size.width}-${size.height}-${index}`}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDimensionChange(size.width, size.height)}
                      >
                        {size.width} × {size.height}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardContent className={css({ spaceY: '4' })}>
              <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Colors</h2>

              <div className={css({ spaceY: '4' })}>
                {/* Background Color */}
                <div className={css({ spaceY: '2' })}>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                    <input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleColorChange('bg', e.target.value)}
                      className={css({
                        w: '12',
                        h: '10',
                        borderRadius: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        cursor: 'pointer',
                      })}
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => handleColorChange('bg', e.target.value)}
                      placeholder="#cccccc"
                      className={css({ flex: '1' })}
                    />
                  </div>

                  {/* Color Palette */}
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(11, 1fr)',
                      gap: '1',
                      mt: '2',
                    })}
                  >
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange('bg', color)}
                        className={css({
                          w: 'full',
                          h: '8',
                          borderRadius: 'md',
                          border: '2px solid',
                          borderColor: bgColor === color ? 'pink.500' : 'gray.700',
                          cursor: 'pointer',
                          transition: 'all',
                          _hover: { transform: 'scale(1.1)' },
                        })}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Background color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className={css({ spaceY: '2' })}>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                    <input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className={css({
                        w: '12',
                        h: '10',
                        borderRadius: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        cursor: 'pointer',
                      })}
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      placeholder="#333333"
                      className={css({ flex: '1' })}
                    />
                  </div>

                  {/* Color Palette */}
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(11, 1fr)',
                      gap: '1',
                      mt: '2',
                    })}
                  >
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange('text', color)}
                        className={css({
                          w: 'full',
                          h: '8',
                          borderRadius: 'md',
                          border: '2px solid',
                          borderColor: textColor === color ? 'pink.500' : 'gray.700',
                          cursor: 'pointer',
                          transition: 'all',
                          _hover: { transform: 'scale(1.1)' },
                        })}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Text color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text */}
          <Card>
            <CardContent className={css({ spaceY: '4' })}>
              <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Text</h2>

              <div className={css({ spaceY: '4' })}>
                <div className={css({ spaceY: '2' })}>
                  <Label htmlFor="text">Text Overlay</Label>
                  <Input
                    id="text"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter custom text"
                  />
                </div>

                <div className={css({ spaceY: '2' })}>
                  <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                  <input
                    id="font-size"
                    type="range"
                    min={8}
                    max={200}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className={css({
                      w: 'full',
                      h: '2',
                      borderRadius: 'full',
                      appearance: 'none',
                      bg: 'gray.700',
                      cursor: 'pointer',
                      '&::-webkit-slider-thumb': {
                        appearance: 'none',
                        w: '4',
                        h: '4',
                        borderRadius: 'full',
                        bg: 'pink.500',
                        cursor: 'pointer',
                      },
                      '&::-moz-range-thumb': {
                        w: '4',
                        h: '4',
                        borderRadius: 'full',
                        bg: 'pink.500',
                        cursor: 'pointer',
                        border: 'none',
                      },
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Actions */}
        <div className={css({ spaceY: '6' })}>
          {/* Preview */}
          <Card>
            <CardContent className={css({ spaceY: '4' })}>
              <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Preview</h2>

              <div
                className={css({
                  w: 'full',
                  maxH: '96',
                  overflow: 'auto',
                  borderRadius: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.900',
                  p: '4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is generated internally, not from user input */}
                <div dangerouslySetInnerHTML={{ __html: previewSVG }} />
              </div>

              {/* Actions */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: '2',
                })}
              >
                <Button
                  onClick={handleCopyDataURL}
                  variant="outline"
                  className={css({ w: 'full' })}
                >
                  {copiedDataURL ? (
                    <>
                      <Check className={css({ w: '4', h: '4', mr: '2' })} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                      Copy Data URL
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadSVG}
                  variant="outline"
                  className={css({ w: 'full' })}
                >
                  <Download className={css({ w: '4', h: '4', mr: '2' })} />
                  Download SVG
                </Button>
                <Button
                  onClick={handleDownloadPNG}
                  variant="default"
                  className={css({ w: 'full' })}
                >
                  <Download className={css({ w: '4', h: '4', mr: '2' })} />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardContent className={css({ spaceY: '4' })}>
              <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Size Presets</h2>

              {/* Category Tabs */}
              <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveCategory(category.id)
                      trackToolEvent('placeholder_generator_preset_selected', {
                        category: category.id,
                      })
                    }}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Preset Grid */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '2',
                  maxH: '96',
                  overflow: 'auto',
                })}
              >
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={css({
                      p: '3',
                      borderRadius: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all',
                      _hover: {
                        bg: 'gray.800',
                        borderColor: 'pink.500',
                      },
                    })}
                  >
                    <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {preset.name}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.400' })}>
                      {preset.width} × {preset.height}
                    </div>
                    {preset.description && (
                      <div className={css({ fontSize: 'xs', color: 'gray.500', mt: '1' })}>
                        {preset.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card>
        <CardContent className={css({ spaceY: '3' })}>
          <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Tips</h2>
          <ul
            className={css({
              listStyle: 'disc',
              pl: '5',
              spaceY: '2',
              color: 'gray.400',
              fontSize: 'sm',
            })}
          >
            <li>Enter custom dimensions or use presets for common sizes</li>
            <li>Click color swatches for quick color selection</li>
            <li>SVG format is lightweight and scales perfectly at any size</li>
            <li>PNG format provides better compatibility with image editing tools</li>
            <li>Data URL can be used directly in HTML/CSS (img src or background-image)</li>
            <li>Recent sizes are saved locally for quick access</li>
            <li>Perfect for mockups, prototypes, wireframes, and design placeholders</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
