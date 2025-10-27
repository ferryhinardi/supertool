'use client'

import imageCompression from 'browser-image-compression'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  Download,
  FileImage,
  Image as ImageIcon,
  Maximize2,
  Settings,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { DragDropZone } from '@/components/features/DragDropZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
          <ImageIcon className="h-5 w-5 text-teal-400" />
          <span className="text-sm font-semibold text-teal-300">
            Professional Image Optimization
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '1400px',
          }}
          className="sm:grid-cols-4"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-teal-400">{images.length}</div>
                <div className="text-xs text-gray-400">Total Images</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-blue-400">
                  {formatBytes(totalOriginalSize)}
                </div>
                <div className="text-xs text-gray-400">Original Size</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-green-400">
                  {formatBytes(totalCompressedSize)}
                </div>
                <div className="text-xs text-gray-400">Compressed Size</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-purple-400">{totalSavings}%</div>
                <div className="text-xs text-gray-400">Space Saved</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1', lg: 'repeat(3, 1fr)' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ width: '100%' }}
          className="lg:col-span-1"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-teal-400" />
                  Optimization Settings
                </CardTitle>
                <CardDescription>Configure compression and output options</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '6' })}>
                {/* Output Format */}
                <div className={css({ spaceY: '2' })}>
                  <label htmlFor="output-format" className="text-sm font-medium text-gray-300">
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
                        className={`${
                          outputFormat === format
                            ? 'border-teal-500/50 bg-teal-500/20 text-teal-200'
                            : 'border-gray-700'
                        }`}
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
                    <label htmlFor="quality-slider" className="text-sm font-medium text-gray-300">
                      Quality
                    </label>
                    <span className="text-sm font-bold text-teal-400">{quality}%</span>
                  </div>
                  <input
                    id="quality-slider"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-teal-500"
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
                  <label htmlFor="max-dimensions" className="text-sm font-medium text-gray-300">
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
                      <label htmlFor="max-width" className="mb-1 block text-xs text-gray-400">
                        Width (px)
                      </label>
                      <input
                        id="max-width"
                        type="number"
                        value={maxWidth}
                        onChange={(e) => setMaxWidth(Number(e.target.value))}
                        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-teal-500 focus:outline-none"
                        min="100"
                        max="10000"
                      />
                    </div>
                    <div>
                      <label htmlFor="max-height" className="mb-1 block text-xs text-gray-400">
                        Height (px)
                      </label>
                      <input
                        id="max-height"
                        type="number"
                        value={maxHeight}
                        onChange={(e) => setMaxHeight(Number(e.target.value))}
                        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-teal-500 focus:outline-none"
                        min="100"
                        max="10000"
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                    />
                    Maintain aspect ratio
                  </label>
                </div>

                {/* Action Buttons */}
                <div className={css({ spaceY: '2', pt: '4' })}>
                  <Button
                    onClick={handleOptimizeAll}
                    disabled={images.length === 0 || isProcessing}
                    className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
                  >
                    <Zap className="h-4 w-4" />
                    Optimize All Images
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadAll}
                    disabled={!images.some((img) => img.status === 'completed')}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={images.length === 0}
                    className="w-full gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
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
          style={{ width: '100%' }}
          className="lg:col-span-2"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-teal-400" />
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
                      className="!py-8"
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
                                  className="h-full w-full object-cover"
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
                                    <CheckCircle className="h-6 w-6 text-teal-400" />
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
                                    <p className="truncate text-sm font-medium text-gray-200">
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
                                          <span className="text-teal-400">
                                            {formatBytes(image.compressedSize)}
                                          </span>
                                          <span className="rounded bg-teal-500/20 px-2 py-0.5 text-teal-300">
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
                                        className="h-8 w-8 p-0 text-teal-400 hover:bg-teal-500/20"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemove(image.id)}
                                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                {image.status === 'processing' && (
                                  <div className={css({ spaceY: '1' })}>
                                    <Progress value={image.progress} className="h-2" />
                                    <p className="text-xs text-gray-500">
                                      Optimizing... {image.progress}%
                                    </p>
                                  </div>
                                )}

                                {/* Error Message */}
                                {image.status === 'error' && (
                                  <p className="text-xs text-red-400">{image.error}</p>
                                )}

                                {/* Status */}
                                {image.status === 'pending' && (
                                  <p className="text-xs text-gray-500">Ready to optimize</p>
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
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr',
          width: '100%',
          maxWidth: '1400px',
        }}
        className="sm:grid-cols-2 lg:grid-cols-4"
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
            className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm"
          >
            <CardContent>
              <div className={css({ p: '6' })}>
                <feature.icon className="mb-3 h-8 w-8 text-teal-400" />
                <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </main>
  )
}
