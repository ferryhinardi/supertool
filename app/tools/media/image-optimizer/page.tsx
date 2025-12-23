'use client'

import imageCompression from 'browser-image-compression'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  Download,
  FileImage,
  Image as ImageIcon,
  Lightbulb,
  Maximize2,
  Settings,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AffiliateSuggestion } from '@/components/features/AffiliateSuggestion'
import { DragDropZone } from '@/components/features/DragDropZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Progress } from '@/components/ui/progress'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface ImageFile {
  id: string
  file: File
  preview: string
  originalSize: number
  compressedSize?: number
  compressedBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

type OutputFormat = 'jpeg' | 'png' | 'webp'

export default function ImageOptimizerPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Track page visit
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'image_optimizer',
      label: 'tool_opened',
    })
  }, [])

  const handleFilesSelected = useCallback((files: FileList) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'))

    trackEvent({
      action: 'files_added',
      category: 'image_optimizer',
      label: 'image_upload',
      value: imageFiles.length,
    })

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'pending',
      progress: 0,
    }))

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const optimizeImage = async (imageFile: ImageFile) => {
    const startTime = Date.now()

    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageFile.id ? { ...img, status: 'processing', progress: 0 } : img
        )
      )

      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        fileType: `image/${outputFormat}`,
        initialQuality: quality / 100,
        onProgress: (progress: number) => {
          setImages((prev) =>
            prev.map((img) => (img.id === imageFile.id ? { ...img, progress } : img))
          )
        },
      }

      const compressedBlob = await imageCompression(imageFile.file, options)

      const processingTime = Date.now() - startTime

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageFile.id
            ? {
                ...img,
                compressedBlob,
                compressedSize: compressedBlob.size,
                status: 'completed',
                progress: 100,
              }
            : img
        )
      )

      trackEvent({
        action: 'image_optimized',
        category: 'image_optimizer',
        label: outputFormat,
        value: Math.round(processingTime / 1000), // processing time in seconds
      })
    } catch (error) {
      console.error('Error optimizing image:', error)
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageFile.id
            ? {
                ...img,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to optimize image',
              }
            : img
        )
      )

      trackEvent({
        action: 'optimization_error',
        category: 'image_optimizer',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const handleOptimizeAll = async () => {
    setIsProcessing(true)
    const pendingImages = images.filter((img) => img.status === 'pending')

    for (const image of pendingImages) {
      await optimizeImage(image)
    }

    setIsProcessing(false)
  }

  const handleDownload = (imageFile: ImageFile) => {
    if (!imageFile.compressedBlob) return

    const url = URL.createObjectURL(imageFile.compressedBlob)
    const a = document.createElement('a')
    a.href = url
    const originalName = imageFile.file.name.split('.').slice(0, -1).join('.')
    a.download = `${originalName}_optimized.${outputFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackEvent({
      action: 'image_downloaded',
      category: 'image_optimizer',
      label: outputFormat,
    })
  }

  const handleDownloadAll = () => {
    const completedImages = images.filter((img) => img.status === 'completed')
    completedImages.forEach((img) => {
      setTimeout(() => handleDownload(img), 100)
    })

    trackEvent({
      action: 'batch_download',
      category: 'image_optimizer',
      label: 'download_all',
      value: completedImages.length,
    })
  }

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleClearAll = () => {
    for (const img of images) {
      URL.revokeObjectURL(img.preview)
    }
    setImages([])
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const calculateSavings = (original: number, compressed?: number) => {
    if (!compressed) return 0
    return Math.round(((original - compressed) / original) * 100)
  }

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressedSize || 0), 0)
  const totalSavings =
    totalOriginalSize > 0 ? calculateSavings(totalOriginalSize, totalCompressedSize) : 0

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
          width: '100%',
          maxWidth: '1400px',
        }}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'teal.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <ImageIcon className={css({ h: '5', w: '5', color: 'teal.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'teal.300',
            })}
          >
            Professional Image Optimization
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'teal.400',
              gradientVia: 'cyan.400',
              gradientTo: 'blue.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Image Optimizer & Converter
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'gray.400',
          })}
        >
          Compress and optimize images up to 80% smaller without visible quality loss. Convert
          between JPG, PNG, and WebP formats with batch processing.
        </p>
      </motion.div>

      {/* Stats Summary */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: '4',
            w: 'full',
            maxW: '1400px',
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'teal.400',
                  })}
                >
                  {images.length}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Total Images</div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'blue.400',
                  })}
                >
                  {formatBytes(totalOriginalSize)}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Original Size</div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'green.400',
                  })}
                >
                  {formatBytes(totalCompressedSize)}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Compressed Size</div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'purple.400',
                  })}
                >
                  {totalSavings}%
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Space Saved</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({ w: 'full', lg: { gridColumn: 'span 1' } })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Settings className={css({ h: '5', w: '5', color: 'teal.400' })} />
                  Optimization Settings
                </CardTitle>
                <CardDescription>Configure compression and output options</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '6' })}>
                {/* Output Format */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="output-format"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Output Format
                  </label>
                  <div
                    id="output-format"
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '2',
                    })}
                  >
                    {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((format) => (
                      <Button
                        key={format}
                        variant={outputFormat === format ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOutputFormat(format)}
                        className={css({
                          border: '1px solid',
                          borderColor: outputFormat === format ? 'teal.500/50' : 'gray.700',
                          bg: outputFormat === format ? 'teal.500/20' : 'transparent',
                          color: outputFormat === format ? 'teal.200' : 'inherit',
                        })}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div className={css({ spaceY: '3' })}>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <label
                      htmlFor="quality-slider"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Quality
                    </label>
                    <span
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'bold',
                        color: 'teal.400',
                      })}
                    >
                      {quality}%
                    </span>
                  </div>
                  <input
                    id="quality-slider"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className={css({ w: 'full', accentColor: 'teal.500' })}
                  />
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'xs',
                      color: 'gray.500',
                    })}
                  >
                    <span>Lower size</span>
                    <span>Higher quality</span>
                  </div>
                </div>

                {/* Max Dimensions */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="max-dimensions"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Max Dimensions
                  </label>
                  <div
                    id="max-dimensions"
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2',
                    })}
                  >
                    <div>
                      <label
                        htmlFor="max-width"
                        className={css({
                          mb: '1',
                          display: 'block',
                          fontSize: 'xs',
                          color: 'gray.400',
                        })}
                      >
                        Width (px)
                      </label>
                      <input
                        id="max-width"
                        type="number"
                        value={maxWidth}
                        onChange={(e) => setMaxWidth(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          rounded: 'md',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800',
                          px: '3',
                          py: '2',
                          fontSize: 'sm',
                          color: 'gray.100',
                          _focus: {
                            borderColor: 'teal.500',
                            outline: 'none',
                          },
                        })}
                        min="100"
                        max="10000"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="max-height"
                        className={css({
                          mb: '1',
                          display: 'block',
                          fontSize: 'xs',
                          color: 'gray.400',
                        })}
                      >
                        Height (px)
                      </label>
                      <input
                        id="max-height"
                        type="number"
                        value={maxHeight}
                        onChange={(e) => setMaxHeight(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          rounded: 'md',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800',
                          px: '3',
                          py: '2',
                          fontSize: 'sm',
                          color: 'gray.100',
                          _focus: {
                            borderColor: 'teal.500',
                            outline: 'none',
                          },
                        })}
                        min="100"
                        max="10000"
                      />
                    </div>
                  </div>
                  <label
                    className={css({
                      display: 'flex',
                      cursor: 'pointer',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'sm',
                      color: 'gray.300',
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className={css({
                        h: '4',
                        w: '4',
                        rounded: 'sm',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        color: 'teal.500',
                        _focus: {
                          ring: '2',
                          ringColor: 'teal.500',
                          ringOffset: '0',
                        },
                      })}
                    />
                    Maintain aspect ratio
                  </label>
                </div>

                {/* Action Buttons */}
                <div className={css({ spaceY: '2', pt: '4' })}>
                  <Button
                    onClick={handleOptimizeAll}
                    disabled={images.length === 0 || isProcessing}
                    className={css({
                      w: 'full',
                      gap: '2',
                      bg: 'teal.600',
                      _hover: {
                        bg: 'teal.700',
                      },
                    })}
                  >
                    <Zap className={css({ h: '4', w: '4' })} />
                    Optimize All Images
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadAll}
                    disabled={!images.some((img) => img.status === 'completed')}
                    className={css({ w: 'full', gap: '2' })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
                    Download All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={images.length === 0}
                    className={css({
                      w: 'full',
                      gap: '2',
                      border: '1px solid',
                      borderColor: 'red.500/30',
                      color: 'red.400',
                      _hover: {
                        bg: 'red.500/10',
                      },
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload & Images Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={css({ w: 'full', lg: { gridColumn: 'span 2' } })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <FileImage className={css({ h: '5', w: '5', color: 'teal.400' })} />
                  Images ({images.length})
                </CardTitle>
                <CardDescription>
                  Drag & drop images or click to browse. Supports JPG, PNG, WebP, GIF.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
                {/* Drag & Drop Zone */}
                {images.length === 0 ? (
                  <DragDropZone
                    onFilesSelected={handleFilesSelected}
                    accept="image/*"
                    maxSize={50 * 1024 * 1024}
                    multiple
                  />
                ) : (
                  <>
                    <DragDropZone
                      onFilesSelected={handleFilesSelected}
                      accept="image/*"
                      maxSize={50 * 1024 * 1024}
                      multiple
                      className={css({ py: '8' })}
                    />

                    <div
                      className={css({
                        maxH: '[600px]',
                        spaceY: '3',
                        overflowY: 'auto',
                        pr: '2',
                      })}
                    >
                      <AnimatePresence>
                        {images.map((image) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={css({
                              rounded: 'lg',
                              border: '1px solid',
                              borderColor: 'gray.800',
                              bg: 'gray.900/80',
                              p: '4',
                            })}
                          >
                            <div
                              className={css({ display: 'flex', alignItems: 'start', gap: '4' })}
                            >
                              {/* Image Preview */}
                              <div
                                className={css({
                                  position: 'relative',
                                  h: '20',
                                  w: '20',
                                  flexShrink: '0',
                                  overflow: 'hidden',
                                  rounded: 'lg',
                                  bg: 'gray.800',
                                })}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.preview}
                                  alt={image.file.name}
                                  className={css({
                                    h: 'full',
                                    w: 'full',
                                    objectFit: 'cover',
                                  })}
                                />
                                {image.status === 'completed' && (
                                  <div
                                    className={css({
                                      position: 'absolute',
                                      inset: '0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bg: 'teal.500/20',
                                    })}
                                  >
                                    <CheckCircle
                                      className={css({ h: '6', w: '6', color: 'teal.400' })}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Image Info */}
                              <div className={css({ minW: '0', flex: '1' })}>
                                <div
                                  className={css({
                                    mb: '2',
                                    display: 'flex',
                                    alignItems: 'start',
                                    justifyContent: 'space-between',
                                    gap: '2',
                                  })}
                                >
                                  <div className={css({ minW: '0', flex: '1' })}>
                                    <p
                                      className={css({
                                        truncate: true,
                                        fontSize: 'sm',
                                        fontWeight: 'medium',
                                        color: 'gray.200',
                                      })}
                                    >
                                      {image.file.name}
                                    </p>
                                    <div
                                      className={css({
                                        mt: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3',
                                        fontSize: 'xs',
                                        color: 'gray.500',
                                      })}
                                    >
                                      <span>{formatBytes(image.originalSize)}</span>
                                      {image.compressedSize && (
                                        <>
                                          <span>→</span>
                                          <span className={css({ color: 'teal.400' })}>
                                            {formatBytes(image.compressedSize)}
                                          </span>
                                          <span
                                            className={css({
                                              rounded: 'md',
                                              bg: 'teal.500/20',
                                              px: '2',
                                              py: '0.5',
                                              color: 'teal.300',
                                            })}
                                          >
                                            {calculateSavings(
                                              image.originalSize,
                                              image.compressedSize
                                            )}
                                            % saved
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className={css({ display: 'flex', gap: '1' })}>
                                    {image.status === 'completed' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDownload(image)}
                                        className={css({
                                          h: '8',
                                          w: '8',
                                          p: '0',
                                          color: 'teal.400',
                                          _hover: {
                                            bg: 'teal.500/20',
                                          },
                                        })}
                                      >
                                        <Download className={css({ h: '4', w: '4' })} />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemove(image.id)}
                                      className={css({
                                        h: '8',
                                        w: '8',
                                        p: '0',
                                        color: 'red.400',
                                        _hover: {
                                          bg: 'red.500/20',
                                        },
                                      })}
                                    >
                                      <Trash2 className={css({ h: '4', w: '4' })} />
                                    </Button>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                {image.status === 'processing' && (
                                  <div className={css({ spaceY: '1' })}>
                                    <Progress value={image.progress} className={css({ h: '2' })} />
                                    <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                      Optimizing... {image.progress}%
                                    </p>
                                  </div>
                                )}

                                {/* Error Message */}
                                {image.status === 'error' && (
                                  <p className={css({ fontSize: 'xs', color: 'red.400' })}>
                                    {image.error}
                                  </p>
                                )}

                                {/* Status */}
                                {image.status === 'pending' && (
                                  <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                    Ready to optimize
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1', sm: '2', lg: '4' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {[
          {
            icon: Sparkles,
            title: 'Smart Compression',
            description: 'Up to 80% size reduction without visible quality loss',
          },
          {
            icon: Zap,
            title: 'Batch Processing',
            description: 'Optimize multiple images at once for faster workflow',
          },
          {
            icon: Maximize2,
            title: 'Resize & Convert',
            description: 'Resize dimensions and convert between formats',
          },
          {
            icon: ImageIcon,
            title: 'Multiple Formats',
            description: 'Support for JPG, PNG, WebP, and more',
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bgGradient: 'to-br',
              gradientFrom: 'gray.900/50',
              gradientTo: 'gray.900/30',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent>
              <div className={css({ p: '6' })}>
                <feature.icon
                  className={css({
                    mb: '3',
                    h: '8',
                    w: '8',
                    color: 'teal.400',
                  })}
                />
                <h3
                  className={css({
                    mb: '2',
                    fontWeight: 'semibold',
                    color: 'gray.200',
                  })}
                >
                  {feature.title}
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.500' })}>{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <CardTitle
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: '2xl',
                })}
              >
                <Lightbulb className={css({ h: '6', w: '6', color: 'teal.400' })} />
                How to Use Image Optimizer
              </CardTitle>
              <CardDescription>
                Follow these simple steps to optimize and compress your images
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  1
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Upload Your Images
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Drag and drop your images into the upload zone, or click to browse your files.
                    Supports JPG, PNG, WebP, and GIF formats up to 50MB each.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  2
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Configure Settings
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Select your desired output format (JPEG, PNG, or WebP), adjust quality level
                    (10-100%), and set maximum dimensions if you want to resize your images.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  3
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Optimize Images
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Click "Optimize All Images" to process your entire batch. Watch the real-time
                    progress as each image is compressed, and see instant file size savings.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  4
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Download Optimized Files
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Download individual optimized images or use "Download All" for batch downloads.
                    Each file is renamed with "_optimized" suffix for easy identification.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <CardTitle
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: '2xl',
                })}
              >
                <Lightbulb className={css({ h: '6', w: '6', color: 'teal.400' })} />
                How to Use Image Optimizer
              </CardTitle>
              <CardDescription>
                Follow these simple steps to optimize and compress your images
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  1
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Upload Your Images
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Drag and drop your images into the upload zone, or click to browse your files.
                    Supports JPG, PNG, WebP, and GIF formats up to 50MB each.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  2
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Configure Settings
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Select your desired output format (JPEG, PNG, or WebP), adjust quality level
                    (10-100%), and set maximum dimensions if you want to resize your images.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  3
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Optimize Images
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Click "Optimize All Images" to process your entire batch. Watch the real-time
                    progress as each image is compressed, and see instant file size savings.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    flexShrink: '0',
                    h: '6',
                    w: '6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    color: 'teal.300',
                  })}
                >
                  4
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200', mb: '1' })}>
                    Download Optimized Files
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Download individual optimized images or use "Download All" for batch downloads.
                    Each file is renamed with "_optimized" suffix for easy identification.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <SocialShare
          toolName="Image Optimizer"
          toolUrl="/tools/image-optimizer"
          description="Free online tool to compress and optimize images without quality loss. Batch processing, format conversion, and smart resizing"
          hashtags={['ImageOptimizer', 'WebPerformance', 'ImageCompression', 'WebDev', 'Developer']}
        />
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <FAQAccordion
          faqs={[
            {
              question: 'How does image optimization work?',
              answer:
                'Image optimization uses advanced compression algorithms to reduce file size while maintaining visual quality. The tool analyzes your image, removes unnecessary metadata, applies lossy or lossless compression based on your quality settings, and can convert to more efficient formats like WebP. This process can reduce file sizes by up to 80% without noticeable quality loss at recommended settings.',
            },
            {
              question: 'What quality setting should I use?',
              answer:
                'For most web use cases, a quality setting of 75-85% provides the best balance between file size and visual quality. Higher settings (85-100%) are recommended for professional photography or print materials where maximum quality is essential. Lower settings (60-75%) work well for thumbnails, background images, or situations where faster loading is prioritized over perfect quality.',
            },
            {
              question: 'Can I optimize multiple images at once?',
              answer:
                'Yes, our tool supports batch processing of multiple images simultaneously. Upload all your images at once, configure your desired settings, and click "Optimize All Images" to process them together. You can then download all optimized images with a single click. This feature is perfect for bulk photo processing, website migrations, or preparing multiple images for social media.',
            },
            {
              question: 'What image formats are supported?',
              answer:
                'The tool supports all common web image formats including JPEG/JPG, PNG, WebP, and GIF. You can upload images in any of these formats and convert them to JPEG, PNG, or WebP output. WebP is recommended for web use as it offers superior compression compared to JPEG and PNG, resulting in smaller files with equivalent visual quality.',
            },
            {
              question: 'Should I use WebP format?',
              answer:
                'WebP is highly recommended for modern web applications as it provides 25-35% better compression than JPEG and PNG while maintaining similar visual quality. All modern browsers support WebP, making it ideal for websites, web apps, and digital content. However, if you need compatibility with older systems or software, JPEG and PNG remain solid universal choices.',
            },
            {
              question: 'What happens when I resize images?',
              answer:
                'The resize feature scales your images to fit within the specified maximum dimensions while maintaining aspect ratio (if enabled). For example, setting max dimensions to 1920x1080 will resize a 4000x3000 image down to 1440x1080, preserving the original proportions. This is useful for optimizing high-resolution photos for web use, reducing both dimensions and file size.',
            },
            {
              question: 'How much file size reduction can I expect?',
              answer:
                'File size reduction varies based on the original image and your settings, but typically ranges from 40-80%. High-resolution photos often see the greatest savings, sometimes reducing from 5MB to under 500KB. Images already optimized may see smaller reductions. The tool displays real-time compression results so you can see exact savings for each image.',
            },
            {
              question: 'Are my images stored on your servers?',
              answer:
                'No, all image processing happens entirely in your browser using client-side JavaScript. Your images never leave your device or get uploaded to any server. This ensures complete privacy and security for your photos. All processing is done locally, which also means faster optimization without network delays and no storage limits.',
            },
            {
              question: 'Can I download my optimized images?',
              answer:
                'Yes, after optimization completes, you can download images individually by clicking the download button on each image, or use "Download All" to download all optimized images at once. Downloaded files are automatically renamed with "_optimized" suffix in your chosen output format, making it easy to distinguish them from originals.',
            },
            {
              question: 'What is the maximum file size I can upload?',
              answer:
                'Each image can be up to 50MB in size, which is sufficient for even high-resolution professional photos. You can upload multiple images simultaneously with no limit on the total number. For extremely large images (20MB+), processing may take longer but will still complete successfully. If you encounter issues with very large files, try resizing them first.',
            },
          ]}
        />
      </motion.div>

      {/* Related Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <RelatedTools currentToolPath="/tools/image-optimizer" category="media" />
      </motion.div>

      {/* Tool Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <ToolRating toolId="/tools/image-optimizer" toolName="Image Optimizer" />
      </motion.div>

      {/* Affiliate Suggestions */}
      <AffiliateSuggestion tool="image-optimizer" variant="banner" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
