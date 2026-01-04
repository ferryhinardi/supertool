'use client'

import { motion } from 'framer-motion'
import { Check, Copy, ImagePlus, Sparkles, Upload, Wand2, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface CaptionResult {
  caption: string
  type: string
}

type CaptionType = 'altText' | 'detailed' | 'seo' | 'social'

const CAPTION_TYPES: {
  value: CaptionType
  label: string
  description: string
  icon: typeof Sparkles
}[] = [
  {
    value: 'altText',
    label: 'Alt Text',
    description: 'Accessibility-focused (screen readers)',
    icon: Check,
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Comprehensive image description',
    icon: Sparkles,
  },
  { value: 'seo', label: 'SEO', description: 'Search engine optimized caption', icon: Zap },
  {
    value: 'social',
    label: 'Social Media',
    description: 'Engaging social media caption',
    icon: Wand2,
  },
]

function AIImageCaptionContent() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [captionType, setCaptionType] = useState<CaptionType>('altText')
  const [captions, setCaptions] = useState<CaptionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('ai_caption_open', {})
  }, [])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      trackToolEvent('ai_caption_error', { error: 'invalid_file_type' })
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image file is too large (max 20MB)')
      trackToolEvent('ai_caption_error', { error: 'file_too_large' })
      return
    }

    setSelectedImage(file)
    setCaptions([]) // Clear previous captions

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    trackToolEvent('ai_caption_upload', { size: file.size, type: file.type })
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleGenerateCaption = async () => {
    if (!imagePreview) {
      toast.error('Please select an image first')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ai-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imagePreview,
          captionType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate caption')
      }

      const newCaption: CaptionResult = {
        caption: data.caption,
        type: captionType,
      }

      setCaptions([newCaption, ...captions])
      toast.success('Caption generated successfully!')

      trackToolEvent('ai_caption_generate', {
        caption_type: captionType,
        tokens: data.usage?.total_tokens || 0,
      })
    } catch (error) {
      console.error('Error generating caption:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate caption'
      toast.error(errorMessage)

      trackToolEvent('ai_caption_error', {
        error: 'generation_failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setCaptions([])
    setCopiedIndex(null)
  }

  const handleCopy = (caption: string, index: number) => {
    navigator.clipboard.writeText(caption)
    toast.success('Caption copied to clipboard')
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)

    trackToolEvent('ai_caption_copy', { caption_type: captions[index].type })
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
          <ImagePlus className={css({ h: '5', w: '5', color: 'pink.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'pink.300' })}>
            AI-Powered • Accessibility • SEO
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
          AI Image Caption Generator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Generate descriptive alt text and captions for your images using AI. Improve
          accessibility, SEO, and social media engagement with intelligent image descriptions.
        </p>
      </motion.div>

      {/* Upload Section */}
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
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image to generate AI-powered captions (JPEG, PNG, WebP, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedImage ? (
              // biome-ignore lint/a11y/useSemanticElements: drag-drop functionality requires div element
              <div
                role="button"
                tabIndex={0}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={css({
                  position: 'relative',
                  cursor: 'pointer',
                  rounded: 'xl',
                  border: '2px dashed',
                  borderColor: isDragOver ? 'pink.500' : 'gray.700',
                  bg: isDragOver ? 'pink.500/10' : 'gray.900/30',
                  transition: 'all 0.3s',
                  _hover: { borderColor: 'pink.500/50', bg: 'gray.900/50' },
                })}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className={css({
                    position: 'absolute',
                    inset: '0',
                    zIndex: '10',
                    h: 'full',
                    w: 'full',
                    cursor: 'pointer',
                    opacity: '0',
                  })}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: '6',
                    py: '12',
                    textAlign: 'center',
                    cursor: 'pointer',
                  })}
                >
                  <div
                    className={css({
                      mb: '4',
                      rounded: 'full',
                      p: '4',
                      bg: isDragOver ? 'pink.500' : 'gray.800',
                      transition: 'all 0.3s',
                    })}
                  >
                    <Upload className={css({ h: '8', w: '8', color: 'white' })} />
                  </div>

                  <p className={css({ mb: '2', fontSize: 'sm', color: 'white' })}>
                    <span className={css({ fontWeight: 'semibold' })}>Click to upload</span> or drag
                    and drop
                  </p>

                  <p className={css({ fontSize: 'xs', color: 'white' })}>
                    JPEG, PNG, WebP, or any image format • Max 20MB
                  </p>

                  {isDragOver && (
                    <p
                      className={css({
                        mt: '4',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'pink.400',
                      })}
                    >
                      Drop image here
                    </p>
                  )}
                </label>
              </div>
            ) : (
              <div className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    position: 'relative',
                    rounded: 'lg',
                    overflow: 'hidden',
                    bg: 'gray.800',
                    maxH: '96',
                  })}
                >
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={css({
                        w: 'full',
                        h: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                      })}
                    />
                  )}
                </div>
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                  })}
                >
                  <p className={css({ fontSize: 'xs', color: 'white', mb: '1' })}>File Name</p>
                  <p className={css({ fontSize: 'sm', color: 'gray.200', fontFamily: 'mono' })}>
                    {selectedImage.name}
                  </p>
                </div>
                <Button
                  onClick={handleClear}
                  className={css({
                    w: 'full',
                    gap: '2',
                    bg: 'gray.800',
                    color: 'white',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <X className={css({ h: '4', w: '4' })} />
                  Clear Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Caption Type Selection */}
      {selectedImage && (
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
              <CardTitle>Select Caption Type</CardTitle>
              <CardDescription>Choose the type of caption you want to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: '1',
                    sm: '2',
                    md: '4',
                  },
                  gap: '3',
                })}
              >
                {CAPTION_TYPES.map((type) => {
                  const isActive = captionType === type.value
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.value}
                      onClick={() => setCaptionType(type.value)}
                      className={css({
                        h: 'auto',
                        flexDirection: 'column',
                        gap: '2',
                        py: '4',
                        px: '3',
                        bg: isActive ? 'pink.500/20' : 'gray.800/50',
                        border: '1px solid',
                        borderColor: isActive ? 'pink.500/50' : 'gray.700/50',
                        color: isActive ? 'pink.300' : 'gray.400',
                        transition: 'all 0.2s',
                        _hover: {
                          bg: isActive ? 'pink.500/30' : 'gray.800',
                          borderColor: isActive ? 'pink.500/70' : 'gray.600',
                          transform: 'translateY(-2px)',
                        },
                      })}
                    >
                      <Icon className={css({ h: '5', w: '5' })} />
                      <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                        {type.label}
                      </span>
                      <span
                        className={css({ fontSize: 'xs', color: 'white', textAlign: 'center' })}
                      >
                        {type.description}
                      </span>
                    </Button>
                  )
                })}
              </div>

              <Button
                onClick={handleGenerateCaption}
                disabled={loading || !selectedImage}
                className={css({
                  w: 'full',
                  mt: '6',
                  gap: '2',
                  h: '12',
                  bg: 'pink.500',
                  color: 'white',
                  fontWeight: 'semibold',
                  _hover: { bg: 'pink.600' },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                {loading ? (
                  <>
                    <div
                      className={css({
                        display: 'inline-block',
                        rounded: 'full',
                        border: '2px solid',
                        borderColor: 'white',
                        borderTopColor: 'transparent',
                        h: '5',
                        w: '5',
                        animation: 'spin 1s linear infinite',
                      })}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className={css({ h: '5', w: '5' })} />
                    Generate Caption
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Captions Results */}
      {captions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Check className={css({ h: '5', w: '5', color: 'green.400' })} />
                <CardTitle>Generated Captions</CardTitle>
                <Badge
                  className={css({
                    bg: 'green.500/20',
                    color: 'green.300',
                    border: '1px solid',
                    borderColor: 'green.500/30',
                  })}
                >
                  {captions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'grid', gap: '3' })}>
                {captions.map((result, index) => {
                  const typeInfo = CAPTION_TYPES.find((t) => t.value === result.type)
                  const isCopied = copiedIndex === index

                  return (
                    <div
                      key={`${result.type}-${index}`}
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        spaceY: '3',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        })}
                      >
                        <Badge
                          className={css({
                            bg: 'pink.500/20',
                            color: 'pink.300',
                            border: '1px solid',
                            borderColor: 'pink.500/30',
                          })}
                        >
                          {typeInfo?.label}
                        </Badge>
                        <Button
                          onClick={() => handleCopy(result.caption, index)}
                          size="sm"
                          className={css({
                            gap: '2',
                            bg: isCopied ? 'green.500/20' : 'transparent',
                            color: isCopied ? 'green.400' : 'gray.500',
                            _hover: {
                              bg: isCopied ? 'green.500/30' : 'gray.700',
                              color: isCopied ? 'green.400' : 'pink.400',
                            },
                          })}
                        >
                          {isCopied ? (
                            <>
                              <Check className={css({ h: '4', w: '4' })} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className={css({ h: '4', w: '4' })} />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <p
                        className={css({
                          fontSize: 'sm',
                          color: 'gray.200',
                          lineHeight: '1.6',
                        })}
                      >
                        {result.caption}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'cyan.500/20',
            bg: 'rgba(6, 182, 212, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'cyan.300',
            })}
          >
            Pro Tips
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Alt Text:</strong> Use this mode for WCAG-compliant accessibility (ideal for
              screen readers)
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Detailed:</strong> Choose for comprehensive product descriptions or
              documentation
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>SEO:</strong> Select to improve image search rankings with keyword-rich
              captions
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Social Media:</strong> Pick for engaging, shareable content on platforms
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Generate multiple caption types for the same image to compare and choose the best
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              All processing uses OpenAI Vision API - ensure your API key is configured
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function AIImageCaptionPage() {
  return <AIImageCaptionContent />
}
