'use client'

import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'
import {
  CheckCircle,
  Download,
  Eye,
  FileImage,
  Image as ImageIcon,
  Maximize2,
  Settings,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Progress } from '@/components/ui/progress'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ImageFile {
  id: string
  file: File
  preview: string
  originalSize: number
  compressedSize?: number
  compressedBlob?: Blob
  compressedPreview?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif'

interface QualityPreset {
  name: string
  quality: number
  maxWidth: number
  maxHeight: number
  description: string
}

const QUALITY_PRESETS: QualityPreset[] = [
  {
    name: 'Web',
    quality: 70,
    maxWidth: 1920,
    maxHeight: 1080,
    description: 'Optimized for websites',
  },
  {
    name: 'Print',
    quality: 95,
    maxWidth: 4096,
    maxHeight: 4096,
    description: 'High quality for printing',
  },
  {
    name: 'Email',
    quality: 60,
    maxWidth: 1200,
    maxHeight: 800,
    description: 'Small size for emails',
  },
  {
    name: 'Social',
    quality: 80,
    maxWidth: 1080,
    maxHeight: 1080,
    description: 'Perfect for social media',
  },
]

export default function ImageOptimizerPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [stripMetadata, setStripMetadata] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedCompare, setExpandedCompare] = useState<string | null>(null)
  const [comparePosition, setComparePosition] = useState(50)

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
        preserveExif: !stripMetadata,
        onProgress: (progress: number) => {
          setImages((prev) =>
            prev.map((img) => (img.id === imageFile.id ? { ...img, progress } : img))
          )
        },
      }

      const compressedBlob = await imageCompression(imageFile.file, options)
      const compressedPreview = URL.createObjectURL(compressedBlob)

      const processingTime = Date.now() - startTime

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageFile.id
            ? {
                ...img,
                compressedBlob,
                compressedPreview,
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

  const handleDownloadAll = async () => {
    const completedImages = images.filter((img) => img.status === 'completed' && img.compressedBlob)

    if (completedImages.length === 0) return

    // If only one image, download directly
    if (completedImages.length === 1) {
      handleDownload(completedImages[0])
      return
    }

    // For multiple images, create a ZIP file
    const zip = new JSZip()

    for (const img of completedImages) {
      if (img.compressedBlob) {
        const originalName = img.file.name.split('.').slice(0, -1).join('.')
        const fileName = `${originalName}_optimized.${outputFormat}`
        zip.file(fileName, img.compressedBlob)
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `optimized_images_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      trackEvent({
        action: 'batch_download_zip',
        category: 'image_optimizer',
        label: 'download_all_zip',
        value: completedImages.length,
      })
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      // Fallback to individual downloads if ZIP creation fails
      for (const img of completedImages) {
        setTimeout(() => handleDownload(img), 100)
      }

      trackEvent({
        action: 'batch_download_fallback',
        category: 'image_optimizer',
        label: 'download_all_individual',
        value: completedImages.length,
      })
    }
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
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4',
          textAlign: 'center',
          w: 'full',
          maxW: '1400px',
        })}
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
            color: 'white',
          })}
        >
          Compress and optimize images up to 80% smaller without visible quality loss. Convert
          between JPG, PNG, and WebP formats with batch processing.
        </p>
      </div>

      {/* Stats Summary */}
      {images.length > 0 && (
        <div
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
            <CardContent withTopPadding>
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
                <div className={css({ fontSize: 'xs', color: 'white' })}>Total Images</div>
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
            <CardContent withTopPadding>
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
                <div className={css({ fontSize: 'xs', color: 'white' })}>Original Size</div>
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
            <CardContent withTopPadding>
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
                <div className={css({ fontSize: 'xs', color: 'white' })}>Compressed Size</div>
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
            <CardContent withTopPadding>
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
                <div className={css({ fontSize: 'xs', color: 'white' })}>Space Saved</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: '1fr 2fr', lg: '1fr 1fr 1fr' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {/* Settings Panel */}
        <div
          className={css({ w: 'full', gridColumn: { base: '1 / -1', md: '1 / 2', lg: '1 / 2' } })}
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
                      color: 'white',
                    })}
                  >
                    Output Format
                  </label>
                  <div
                    id="output-format"
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '2',
                    })}
                  >
                    {(['jpeg', 'png', 'webp', 'avif'] as OutputFormat[]).map((format) => (
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
                        color: 'white',
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
                      color: 'white',
                    })}
                  >
                    <span>Lower size</span>
                    <span>Higher quality</span>
                  </div>

                  {/* Quality Presets */}
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2',
                      pt: '2',
                    })}
                  >
                    {QUALITY_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuality(preset.quality)
                          setMaxWidth(preset.maxWidth)
                          setMaxHeight(preset.maxHeight)
                          trackEvent({
                            action: 'preset_applied',
                            category: 'image_optimizer',
                            label: preset.name.toLowerCase(),
                          })
                        }}
                        className={css({
                          border: '1px solid',
                          borderColor: 'gray.700',
                          fontSize: 'xs',
                          _hover: {
                            borderColor: 'teal.500/50',
                            bg: 'teal.500/10',
                          },
                        })}
                        title={preset.description}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Max Dimensions */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="max-dimensions"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'white',
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
                          color: 'white',
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
                          color: 'white',
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
                      color: 'white',
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
                  <label
                    className={css({
                      display: 'flex',
                      cursor: 'pointer',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'sm',
                      color: 'white',
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={stripMetadata}
                      onChange={(e) => setStripMetadata(e.target.checked)}
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
                    <span>
                      Strip metadata (EXIF, GPS, etc.)
                      <span
                        className={css({
                          display: 'block',
                          fontSize: 'xs',
                          color: 'gray.400',
                          mt: '0.5',
                        })}
                      >
                        Removes location and camera data for privacy
                      </span>
                    </span>
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
        </div>

        {/* Upload & Images Panel */}
        <div
          className={css({ w: 'full', gridColumn: { base: '1 / -1', md: '2 / 3', lg: '2 / 4' } })}
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
                      {images.map((image) => (
                        <div
                          key={image.id}
                          className={css({
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor: 'gray.800',
                            bg: 'gray.900/80',
                            p: '4',
                          })}
                        >
                          <div
                            className={css({
                              display: 'flex',
                              flexDirection: { base: 'column', sm: 'row' },
                              alignItems: { base: 'stretch', sm: 'start' },
                              gap: '4',
                            })}
                          >
                            {/* Image Preview */}
                            <div
                              className={css({
                                position: 'relative',
                                h: { base: '40', sm: '20' },
                                w: { base: 'full', sm: '20' },
                                flexShrink: '0',
                                overflow: 'hidden',
                                rounded: 'lg',
                                bg: 'gray.800',
                              })}
                            >
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
                                      color: 'white',
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
                                  {image.status === 'completed' && image.compressedPreview && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setExpandedCompare(
                                          expandedCompare === image.id ? null : image.id
                                        )
                                        setComparePosition(50)
                                        trackEvent({
                                          action: 'compare_view_toggled',
                                          category: 'image_optimizer',
                                          label: expandedCompare === image.id ? 'closed' : 'opened',
                                        })
                                      }}
                                      className={css({
                                        h: '8',
                                        w: '8',
                                        p: '0',
                                        color:
                                          expandedCompare === image.id ? 'cyan.400' : 'gray.400',
                                        _hover: {
                                          bg: 'cyan.500/20',
                                          color: 'cyan.400',
                                        },
                                      })}
                                      title="Compare before/after"
                                    >
                                      <Eye className={css({ h: '4', w: '4' })} />
                                    </Button>
                                  )}
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
                                  <p className={css({ fontSize: 'xs', color: 'white' })}>
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
                                <p className={css({ fontSize: 'xs', color: 'white' })}>
                                  Ready to optimize
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Before/After Comparison Slider */}

                          {expandedCompare === image.id && image.compressedPreview && (
                            <div
                              className={css({
                                mt: '4',
                                overflow: 'hidden',
                              })}
                            >
                              <div
                                className={css({
                                  rounded: 'lg',
                                  border: '1px solid',
                                  borderColor: 'cyan.500/30',
                                  bg: 'gray.800/50',
                                  p: '4',
                                })}
                              >
                                <div
                                  className={css({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: '3',
                                  })}
                                >
                                  <span
                                    className={css({
                                      fontSize: 'sm',
                                      fontWeight: 'medium',
                                      color: 'cyan.300',
                                    })}
                                  >
                                    Before/After Comparison
                                  </span>
                                  <span
                                    className={css({
                                      fontSize: 'xs',
                                      color: 'gray.400',
                                    })}
                                  >
                                    Drag slider to compare
                                  </span>
                                </div>

                                {/* Comparison Container */}
                                <div
                                  role="slider"
                                  aria-label="Image comparison slider"
                                  aria-valuenow={Math.round(comparePosition)}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  tabIndex={0}
                                  className={css({
                                    position: 'relative',
                                    overflow: 'hidden',
                                    rounded: 'md',
                                    bg: 'gray.900',
                                    aspectRatio: '16 / 9',
                                    userSelect: 'none',
                                    cursor: 'ew-resize',
                                    _focus: {
                                      outline: '2px solid',
                                      outlineColor: 'cyan.500',
                                      outlineOffset: '2px',
                                    },
                                  })}
                                  onMouseMove={(e) => {
                                    if (e.buttons === 1) {
                                      const rect = e.currentTarget.getBoundingClientRect()
                                      const x = e.clientX - rect.left
                                      const percentage = Math.max(
                                        0,
                                        Math.min(100, (x / rect.width) * 100)
                                      )
                                      setComparePosition(percentage)
                                    }
                                  }}
                                  onTouchMove={(e) => {
                                    const touch = e.touches[0]
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const x = touch.clientX - rect.left
                                    const percentage = Math.max(
                                      0,
                                      Math.min(100, (x / rect.width) * 100)
                                    )
                                    setComparePosition(percentage)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'ArrowLeft') {
                                      setComparePosition((prev) => Math.max(0, prev - 5))
                                    } else if (e.key === 'ArrowRight') {
                                      setComparePosition((prev) => Math.min(100, prev + 5))
                                    }
                                  }}
                                >
                                  {/* Original Image (Background - Full) */}
                                  <img
                                    src={image.preview}
                                    alt="Original"
                                    className={css({
                                      position: 'absolute',
                                      inset: '0',
                                      h: 'full',
                                      w: 'full',
                                      objectFit: 'contain',
                                    })}
                                    draggable={false}
                                  />

                                  {/* Optimized Image (Foreground - Clipped) */}
                                  <div
                                    className={css({
                                      position: 'absolute',
                                      inset: '0',
                                      overflow: 'hidden',
                                    })}
                                    style={{
                                      clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
                                    }}
                                  >
                                    <img
                                      src={image.compressedPreview}
                                      alt="Optimized"
                                      className={css({
                                        h: 'full',
                                        w: 'full',
                                        objectFit: 'contain',
                                      })}
                                      draggable={false}
                                    />
                                  </div>

                                  {/* Slider Handle */}
                                  <div
                                    className={css({
                                      position: 'absolute',
                                      top: '0',
                                      bottom: '0',
                                      w: '1',
                                      bg: 'cyan.400',
                                      cursor: 'ew-resize',
                                      zIndex: '10',
                                      _after: {
                                        content: '""',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        w: '8',
                                        h: '8',
                                        rounded: 'full',
                                        bg: 'cyan.400',
                                        border: '2px solid',
                                        borderColor: 'white',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                                      },
                                    })}
                                    style={{ left: `${comparePosition}%` }}
                                  />

                                  {/* Labels */}
                                  <div
                                    className={css({
                                      position: 'absolute',
                                      top: '2',
                                      left: '2',
                                      rounded: 'md',
                                      bg: 'gray.900/80',
                                      px: '2',
                                      py: '1',
                                      fontSize: 'xs',
                                      fontWeight: 'medium',
                                      color: 'gray.300',
                                      backdropFilter: 'blur(4px)',
                                    })}
                                  >
                                    Optimized
                                  </div>
                                  <div
                                    className={css({
                                      position: 'absolute',
                                      top: '2',
                                      right: '2',
                                      rounded: 'md',
                                      bg: 'gray.900/80',
                                      px: '2',
                                      py: '1',
                                      fontSize: 'xs',
                                      fontWeight: 'medium',
                                      color: 'gray.300',
                                      backdropFilter: 'blur(4px)',
                                    })}
                                  >
                                    Original
                                  </div>
                                </div>

                                {/* Slider Control */}
                                <div className={css({ mt: '3' })}>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={comparePosition}
                                    onChange={(e) => setComparePosition(Number(e.target.value))}
                                    className={css({
                                      w: 'full',
                                      accentColor: 'cyan.500',
                                      cursor: 'pointer',
                                    })}
                                    aria-label="Comparison slider"
                                  />
                                  <div
                                    className={css({
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      mt: '1',
                                      fontSize: 'xs',
                                      color: 'gray.400',
                                    })}
                                  >
                                    <span>
                                      Optimized ({formatBytes(image.compressedSize || 0)})
                                    </span>
                                    <span>Original ({formatBytes(image.originalSize)})</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Info */}
      <div
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
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
            <CardContent withTopPadding>
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
                <p className={css({ fontSize: 'sm', color: 'white' })}>{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Social Share */}
      <div
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
      </div>

      {/* Related Tools */}
      <div
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <RelatedTools currentToolPath="/tools/image-optimizer" category="media" />
      </div>

      {/* Tool Rating */}
      <div
        className={css({
          w: 'full',
          maxW: '1400px',
        })}
      >
        <ToolRating toolId="/tools/image-optimizer" toolName="Image Optimizer" />
      </div>

      {/* Affiliate Suggestions */}
      <AffiliateSuggestion tool="image-optimizer" variant="banner" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
