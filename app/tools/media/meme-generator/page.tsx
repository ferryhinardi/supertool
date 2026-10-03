'use client'

import {
  AlertCircle,
  Check,
  Download,
  Image as ImageIcon,
  Search,
  Settings2,
  Sparkles,
  Type,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MediaToolHeader } from '@/components/features/tools/MediaToolHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { getTemplatesByCategory, MEME_TEMPLATES, searchTemplates } from './templates'
import { CATEGORY_INFO, type MemeConfig, type MemeTemplate, type TextBox } from './types'
import {
  createDefaultTextBoxes,
  downloadMeme,
  formatFileSize,
  generateMeme,
  validateImageFile,
} from './utils'

export default function MemeGeneratorPage() {
  useTrackToolView({
    toolId: 'meme-generator',
    title: 'Meme Generator',
    href: '/tools/media/meme-generator',
    iconName: 'Sparkles',
    gradient: 'from-purple-500 to-pink-500',
  })

  // State
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null)
  const [customImage, setCustomImage] = useState<File | null>(null)
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Filter templates
  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === 'all'
      ? MEME_TEMPLATES
      : getTemplatesByCategory(selectedCategory)

  // Handle template selection
  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template)
    setCustomImage(null)
    setCanvasSize({ width: template.width, height: template.height })

    // Create default text boxes
    const boxes = createDefaultTextBoxes(template.boxCount)
    setTextBoxes(boxes)
    setGeneratedMeme(null)

    trackToolEvent('meme_template_select')
  }

  // Handle custom image upload
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file')
      return
    }

    setCustomImage(file)
    setSelectedTemplate(null)

    // Load image to get dimensions
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setCanvasSize({ width: img.width, height: img.height })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)

    // Create default 2 text boxes for custom image
    const boxes = createDefaultTextBoxes(2)
    setTextBoxes(boxes)
    setGeneratedMeme(null)

    trackToolEvent('meme_custom_upload')
    toast.success('Image uploaded successfully')
  }

  // Update text box
  const handleTextChange = (id: string, text: string) => {
    setTextBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, text } : box)))
  }

  // Update text box style
  const handleTextStyleChange = (
    id: string,
    property: keyof TextBox,
    value: string | number | boolean
  ) => {
    setTextBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, [property]: value } : box)))
  }

  // Generate meme
  const handleGenerateMeme = useCallback(async () => {
    if (!selectedTemplate && !customImage) {
      toast.error('Please select a template or upload an image')
      return
    }

    setIsGenerating(true)
    try {
      const config: MemeConfig = {
        template: selectedTemplate,
        customImage,
        textBoxes,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
      }

      const memeDataUrl = await generateMeme(config)
      setGeneratedMeme(memeDataUrl)
      trackToolEvent('meme_generate')
      toast.success('Meme generated successfully!')
    } catch (error) {
      console.error('Error generating meme:', error)
      toast.error('Failed to generate meme')
      trackToolEvent('meme_generate_error')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTemplate, customImage, textBoxes, canvasSize])

  // Download meme
  const handleDownload = () => {
    if (!generatedMeme) return

    const timestamp = Date.now()
    const filename = `meme-${timestamp}.png`
    downloadMeme(generatedMeme, filename)
    trackToolEvent('meme_download')
    toast.success('Meme downloaded!')
  }

  // Reset
  const handleReset = () => {
    setSelectedTemplate(null)
    setCustomImage(null)
    setTextBoxes([])
    setGeneratedMeme(null)
    setSearchQuery('')
    trackToolEvent('meme_reset')
  }

  // Auto-generate on text change (debounced)
  useEffect(() => {
    if (!selectedTemplate && !customImage) return
    if (textBoxes.every((box) => !box.text.trim())) return

    const timer = setTimeout(() => {
      handleGenerateMeme()
    }, 500)

    return () => clearTimeout(timer)
  }, [textBoxes, selectedTemplate, customImage, handleGenerateMeme])

  return (
    <div
      className={css({
        minH: '100vh',
        bg: 'brand.canvas',
        color: 'brand.ink',
      })}
    >
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
        <MediaToolHeader
          title="Meme Generator"
          description="Create viral memes in seconds. Choose from 25+ popular templates or upload your own image. Add text, customize fonts, and download your masterpiece."
          eyebrow="Creative studio"
          icon={Sparkles}
          highlights={['Popular templates', 'Custom text']}
        />

        {/* Main Content */}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: { base: '6', lg: '8' },
            alignItems: 'start',
          })}
        >
          {/* Left Panel - Template Selector */}
          <div className={css({ w: 'full' })}>
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <ImageIcon className={css({ w: '5', h: '5' })} />
                  Select Template
                </CardTitle>
                <CardDescription>Choose a popular meme template or upload your own</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* Custom Image Upload */}
                <div className={css({ spaceY: '2' })}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className={css({ display: 'none' })}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className={css({ w: 'full' })}
                  >
                    <Upload className={css({ w: '4', h: '4', mr: '2' })} />
                    Upload Custom Image
                  </Button>
                  {customImage && (
                    <Badge
                      variant="secondary"
                      className={css({ w: 'full', justifyContent: 'center' })}
                    >
                      {customImage.name} ({formatFileSize(customImage.size)})
                    </Badge>
                  )}
                </div>

                {/* Search */}
                <div className={css({ position: 'relative' })}>
                  <Search
                    className={css({
                      position: 'absolute',
                      left: '3',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      w: '4',
                      h: '4',
                      color: 'brand.muted',
                    })}
                  />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={css({ pl: '10' })}
                  />
                </div>

                {/* Category Filter */}
                <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                  {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                    if (key === 'custom') return null
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(key)
                          setSearchQuery('')
                        }}
                        className={css({
                          px: '3',
                          py: '1.5',
                          minH: '11',
                          borderRadius: 'full',
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          bg: selectedCategory === key ? 'orange.600' : 'gray.800',
                          color: selectedCategory === key ? 'white' : 'gray.300',
                          border: '1px solid',
                          borderColor: selectedCategory === key ? 'orange.500' : 'gray.700',
                          _hover: {
                            bg: selectedCategory === key ? 'orange.700' : 'gray.700',
                          },
                        })}
                        data-touch-chip
                      >
                        {info.emoji} {info.label}
                      </button>
                    )
                  })}
                </div>

                {/* Template Grid */}
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '3',
                    maxH: '96',
                    overflowY: 'auto',
                  })}
                >
                  {filteredTemplates.length === 0 ? (
                    <div
                      className={css({
                        gridColumn: 'span 2',
                        textAlign: 'center',
                        py: '8',
                        color: 'brand.muted',
                      })}
                    >
                      <AlertCircle className={css({ w: '8', h: '8', mx: 'auto', mb: '2' })} />
                      <p>No templates found</p>
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleSelectTemplate(template)}
                        className={css({
                          position: 'relative',
                          borderRadius: 'lg',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '2px solid',
                          borderColor:
                            selectedTemplate?.id === template.id ? 'orange.500' : 'gray.700',
                          _hover: {
                            transform: 'scale(1.05)',
                            borderColor: 'orange.400',
                          },
                        })}
                      >
                        <img
                          src={template.imageUrl}
                          alt={template.name}
                          className={css({ w: 'full', h: '32', objectFit: 'cover' })}
                        />
                        <div
                          className={css({
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            p: '2',
                            bg: 'rgba(0, 0, 0, 0.8)',
                            fontSize: 'xs',
                            fontWeight: 'medium',
                            color: 'brand.ink',
                          })}
                        >
                          {template.name}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div
                            className={css({
                              position: 'absolute',
                              top: '2',
                              right: '2',
                              bg: 'orange.600',
                              p: '1',
                              borderRadius: 'full',
                            })}
                          >
                            <Check className={css({ w: '3', h: '3', color: 'brand.ink' })} />
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Editor */}
          <div
            className={css({
              spaceY: '6',
            })}
          >
            {/* Text Boxes */}
            {(selectedTemplate || customImage) && (
              <Card>
                <CardHeader>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Type className={css({ w: '5', h: '5' })} />
                    Text Editor
                  </CardTitle>
                  <CardDescription>Add your meme text</CardDescription>
                </CardHeader>
                <CardContent className={css({ spaceY: '4' })}>
                  {textBoxes.map((box, index) => (
                    <div key={box.id} className={css({ spaceY: '2' })}>
                      <label
                        htmlFor={`text-${box.id}`}
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'brand.muted',
                        })}
                      >
                        Text {index + 1} ({box.position})
                      </label>
                      <Input
                        id={`text-${box.id}`}
                        value={box.text}
                        onChange={(e) => handleTextChange(box.id, e.target.value)}
                        placeholder={`Enter ${box.position} text...`}
                        className={css({ fontSize: 'lg' })}
                      />

                      {/* Font Controls */}
                      {showSettings && (
                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '2',
                          })}
                        >
                          <div>
                            <label
                              htmlFor={`fontSize-${box.id}`}
                              className={css({ fontSize: 'xs', color: 'brand.muted' })}
                            >
                              Font Size
                            </label>
                            <Input
                              id={`fontSize-${box.id}`}
                              type="number"
                              value={box.fontSize}
                              onChange={(e) =>
                                handleTextStyleChange(box.id, 'fontSize', Number(e.target.value))
                              }
                              min={12}
                              max={120}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`color-${box.id}`}
                              className={css({ fontSize: 'xs', color: 'brand.muted' })}
                            >
                              Color
                            </label>
                            <Input
                              id={`color-${box.id}`}
                              type="color"
                              value={box.color}
                              onChange={(e) =>
                                handleTextStyleChange(box.id, 'color', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Settings Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(!showSettings)}
                    className={css({ w: 'full' })}
                  >
                    <Settings2 className={css({ w: '4', h: '4', mr: '2' })} />
                    {showSettings ? 'Hide' : 'Show'} Advanced Settings
                  </Button>

                  {/* Action Buttons */}
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      onClick={handleGenerateMeme}
                      disabled={isGenerating || textBoxes.every((box) => !box.text.trim())}
                      className={css({ flex: '1' })}
                    >
                      <Sparkles className={css({ w: '4', h: '4', mr: '2' })} />
                      {isGenerating ? 'Generating...' : 'Generate Meme'}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <X className={css({ w: '4', h: '4' })} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            {generatedMeme && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Meme</CardTitle>
                  <CardDescription>Right-click to save or use the download button</CardDescription>
                </CardHeader>
                <CardContent className={css({ spaceY: '4' })}>
                  <div
                    className={css({
                      position: 'relative',
                      borderRadius: 'lg',
                      overflow: 'hidden',
                    })}
                  >
                    <img
                      src={generatedMeme}
                      alt="Generated meme"
                      className={css({ w: 'full', h: 'auto' })}
                    />
                  </div>
                  <Button onClick={handleDownload} className={css({ w: 'full' })}>
                    <Download className={css({ w: '4', h: '4', mr: '2' })} />
                    Download Meme
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Placeholder */}
            {!selectedTemplate && !customImage && (
              <Card>
                <CardContent
                  className={css({ py: '16', textAlign: 'center', color: 'brand.muted' })}
                >
                  <ImageIcon className={css({ w: '16', h: '16', mx: 'auto', mb: '4' })} />
                  <p className={css({ fontSize: 'lg', fontWeight: 'medium' })}>
                    Select a template or upload an image to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
