'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { jsPDF } from 'jspdf'
import {
  CheckCircle,
  Download,
  FileImage,
  FileText,
  Lightbulb,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Worker as TesseractWorker } from 'tesseract.js'
import { DragDropZone } from '@/components/features/DragDropZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface ImageFile {
  id: string
  file: File
  preview: string
  width: number
  height: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5'
type PageOrientation = 'portrait' | 'landscape'
type ImageFit = 'contain' | 'cover' | 'fill' | 'scale-down'

const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('A4')
  const [orientation, setOrientation] = useState<PageOrientation>('portrait')
  const [imageFit, setImageFit] = useState<ImageFit>('contain')
  const [margin, setMargin] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [enableOCR, setEnableOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState<string>('')

  // Track page visit
  useEffect(() => {
    trackToolEvent('image_to_pdf_opened', {
      timestamp: new Date().toISOString(),
    })
  }, [])

  const loadImageDimensions = useCallback(
    (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          resolve({ width: img.width, height: img.height })
          URL.revokeObjectURL(img.src)
        }
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })
    },
    []
  )

  const handleFilesSelected = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'))

      if (imageFiles.length === 0) {
        toast.error('Please select valid image files')
        return
      }

      trackToolEvent('images_added', {
        count: imageFiles.length,
      })

      try {
        const newImages: ImageFile[] = await Promise.all(
          imageFiles.map(async (file) => {
            const dimensions = await loadImageDimensions(file)
            return {
              id: Math.random().toString(36).substring(7),
              file,
              preview: URL.createObjectURL(file),
              width: dimensions.width,
              height: dimensions.height,
              status: 'pending' as const,
            }
          })
        )

        setImages((prev) => [...prev, ...newImages])
        toast.success(`Added ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`)
      } catch (error) {
        console.error('Error loading images:', error)
        toast.error('Failed to load some images')
      }
    },
    [loadImageDimensions]
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
    toast.success('Image removed')
  }, [])

  const clearAll = useCallback(() => {
    for (const img of images) {
      URL.revokeObjectURL(img.preview)
    }
    setImages([])
    setProgress(0)
    toast.success('All images cleared')
  }, [images])

  const generatePDF = useCallback(async () => {
    if (images.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setOcrProgress('')

    try {
      trackToolEvent('pdf_generation_started', {
        imageCount: images.length,
        pageSize,
        orientation,
        imageFit,
        enableOCR,
      })

      const startTime = Date.now()

      // Get page dimensions
      const pageDimensions = PAGE_SIZES[pageSize]
      const pageWidth = orientation === 'portrait' ? pageDimensions.width : pageDimensions.height
      const pageHeight = orientation === 'portrait' ? pageDimensions.height : pageDimensions.width

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [pageWidth, pageHeight],
      })

      // Load Tesseract if OCR is enabled
      let ocrWorker: Tesseract.Worker | null = null
      if (enableOCR) {
        setOcrProgress('Loading OCR engine...')
        const { createWorker } = await import('tesseract.js')
        ocrWorker = await createWorker('eng')
        setOcrProgress('OCR engine ready')
      }

      // Process each image
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        setProgress(((i + 1) / images.length) * 100)

        try {
          // Add new page for subsequent images
          if (i > 0) {
            pdf.addPage()
          }

          // Load image into canvas to get image data
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = reject
            img.src = image.preview
          })

          // Calculate image dimensions based on fit mode
          const availableWidth = pageWidth - margin * 2
          const availableHeight = pageHeight - margin * 2

          let imgWidth = availableWidth
          let imgHeight = availableHeight
          let x = margin
          let y = margin

          if (imageFit === 'contain' || imageFit === 'scale-down') {
            // Maintain aspect ratio and fit within page
            const imgAspectRatio = img.width / img.height
            const pageAspectRatio = availableWidth / availableHeight

            if (imgAspectRatio > pageAspectRatio) {
              // Image is wider
              imgWidth = availableWidth
              imgHeight = availableWidth / imgAspectRatio
              y = margin + (availableHeight - imgHeight) / 2
            } else {
              // Image is taller
              imgHeight = availableHeight
              imgWidth = availableHeight * imgAspectRatio
              x = margin + (availableWidth - imgWidth) / 2
            }
          } else if (imageFit === 'cover') {
            // Cover entire page while maintaining aspect ratio
            const imgAspectRatio = img.width / img.height
            const pageAspectRatio = availableWidth / availableHeight

            if (imgAspectRatio > pageAspectRatio) {
              imgHeight = availableHeight
              imgWidth = availableHeight * imgAspectRatio
              x = margin - (imgWidth - availableWidth) / 2
            } else {
              imgWidth = availableWidth
              imgHeight = availableWidth / imgAspectRatio
              y = margin - (imgHeight - availableHeight) / 2
            }
          }
          // 'fill' mode uses full available space (default values)

          // If OCR is enabled, extract text first and add it behind the image
          if (enableOCR && ocrWorker) {
            setOcrProgress(`Extracting text from image ${i + 1}/${images.length}...`)

            // Perform OCR to extract text
            const {
              data: { text },
            } = await ocrWorker.recognize(img)

            // Add extracted text as searchable layer (will be behind the image)
            if (text.trim()) {
              // Use very small font size and light color to make text minimally visible
              // but still searchable/selectable in the PDF
              pdf.setFontSize(6)
              pdf.setTextColor(250, 250, 250) // Very light gray - barely visible

              // Add text as searchable content
              // Split text into lines that fit within the image area
              const lines = pdf.splitTextToSize(text.trim(), imgWidth - 10)
              let textY = y + 4

              for (const line of lines) {
                if (textY < y + imgHeight - 4) {
                  pdf.text(line, x + 5, textY)
                  textY += 3 // Line height in mm
                }
              }
            }
          }

          // Create canvas to ensure proper image rendering
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d', { willReadFrequently: false })
          if (!ctx) {
            throw new Error('Could not get canvas context')
          }

          // Set canvas size to match image
          canvas.width = img.width
          canvas.height = img.height

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, img.width, img.height)

          // Wait for canvas to finish rendering
          await new Promise((resolve) => setTimeout(resolve, 10))

          // Convert to data URL with high quality
          const imgData = canvas.toDataURL('image/jpeg', 0.95)

          // Verify we have valid image data
          if (!imgData || imgData === 'data:,') {
            throw new Error('Failed to generate image data')
          }

          // Add image to PDF on top of the text (image will cover the text layer)
          pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)

          // Update image status
          setImages((prev) =>
            prev.map((img) => (img.id === image.id ? { ...img, status: 'completed' } : img))
          )
        } catch (error) {
          console.error(`Error processing image ${i}:`, error)
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, status: 'error', error: 'Failed to process' } : img
            )
          )
        }
      }

      // Cleanup OCR worker
      if (ocrWorker) {
        await ocrWorker.terminate()
      }

      // Save PDF
      const fileName = `images-to-pdf-${Date.now()}.pdf`
      pdf.save(fileName)

      const duration = Date.now() - startTime

      trackToolEvent('pdf_generated', {
        imageCount: images.length,
        pageSize,
        orientation,
        imageFit,
        enableOCR,
        duration,
        success: true,
      })

      toast.success('PDF generated successfully! 🎉')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')

      trackToolEvent('pdf_generation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsGenerating(false)
      setProgress(0)
      setOcrProgress('')
    }
  }, [images, pageSize, orientation, imageFit, margin, enableOCR])

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      for (const img of images) {
        URL.revokeObjectURL(img.preview)
      }
    }
  }, [images])

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
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <FileText className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'blue.300',
            })}
          >
            Convert Images to PDF • Free Forever
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Image to PDF Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Convert JPG, PNG, WebP, and other image formats to PDF instantly. Combine multiple images
          into a single PDF document with customizable page settings.
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
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Select one or more images to convert to PDF. Drag and drop supported.
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            <DragDropZone
              onFilesSelected={handleFilesSelected}
              accept="image/*"
              multiple
              maxSize={10 * 1024 * 1024}
            />

            {images.length > 0 && (
              <div className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                    })}
                  >
                    <FileImage className={css({ h: '5', w: '5', color: 'blue.400' })} />
                    <span
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      {images.length} image{images.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className={css({
                      gap: '2',
                      color: 'red.400',
                      _hover: { bg: 'red.500/10' },
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                    Clear All
                  </Button>
                </div>

                {/* Image Preview Grid */}
                <div
                  className={css({
                    display: 'grid',
                    w: 'full',
                    gap: '4',
                    gridTemplateColumns: {
                      base: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    },
                  })}
                >
                  <AnimatePresence mode="popLayout">
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        className={css({
                          position: 'relative',
                          overflow: 'hidden',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '3',
                        })}
                      >
                        <div className={css({ spaceY: '2' })}>
                          {/* Image Preview */}
                          <div
                            className={css({
                              position: 'relative',
                              aspectRatio: '16/9',
                              overflow: 'hidden',
                              rounded: 'md',
                              bg: 'gray.900',
                            })}
                          >
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className={css({
                                h: 'full',
                                w: 'full',
                                objectFit: 'cover',
                              })}
                            />

                            {/* Status Badge */}
                            {image.status === 'completed' && (
                              <div
                                className={css({
                                  position: 'absolute',
                                  top: '2',
                                  right: '2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1',
                                  rounded: 'md',
                                  bg: 'green.500/90',
                                  px: '2',
                                  py: '1',
                                })}
                              >
                                <CheckCircle className={css({ h: '3', w: '3', color: 'white' })} />
                                <span className={css({ fontSize: 'xs', color: 'white' })}>
                                  Done
                                </span>
                              </div>
                            )}

                            {image.status === 'error' && (
                              <div
                                className={css({
                                  position: 'absolute',
                                  top: '2',
                                  right: '2',
                                  rounded: 'md',
                                  bg: 'red.500/90',
                                  px: '2',
                                  py: '1',
                                  fontSize: 'xs',
                                  color: 'white',
                                })}
                              >
                                Error
                              </div>
                            )}

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className={css({
                                position: 'absolute',
                                top: '2',
                                left: '2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                rounded: 'md',
                                bg: 'red.500/90',
                                p: '1.5',
                                color: 'white',
                                transition: 'all 0.2s',
                                _hover: { bg: 'red.600' },
                              })}
                              aria-label="Remove image"
                            >
                              <X className={css({ h: '3.5', w: '3.5' })} />
                            </button>
                          </div>

                          {/* Image Info */}
                          <div className={css({ spaceY: '1' })}>
                            <p
                              className={css({
                                fontSize: 'xs',
                                fontWeight: 'medium',
                                color: 'gray.300',
                                truncate: true,
                              })}
                            >
                              {image.file.name}
                            </p>
                            <div
                              className={css({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2',
                                fontSize: 'xs',
                                color: 'gray.500',
                              })}
                            >
                              <span>
                                {image.width} × {image.height}
                              </span>
                              <span>•</span>
                              <span>{(image.file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Settings className={css({ h: '5', w: '5', color: 'blue.400' })} />
                <CardTitle>PDF Settings</CardTitle>
              </div>
              <CardDescription>Customize your PDF output</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  w: 'full',
                  gap: '6',
                  gridTemplateColumns: {
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                  },
                })}
              >
                {/* Page Size */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="page-size"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Page Size
                  </label>
                  <select
                    id="page-size"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSize)}
                    className={css({
                      h: '10',
                      w: 'full',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      px: '4',
                      fontSize: 'sm',
                      color: 'gray.200',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                      _focus: {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="Letter">Letter (216 × 279 mm)</option>
                    <option value="Legal">Legal (216 × 356 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="orientation"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Orientation
                  </label>
                  <select
                    id="orientation"
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                    className={css({
                      h: '10',
                      w: 'full',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      px: '4',
                      fontSize: 'sm',
                      color: 'gray.200',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                      _focus: {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Image Fit */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="image-fit"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Image Fit
                  </label>
                  <select
                    id="image-fit"
                    value={imageFit}
                    onChange={(e) => setImageFit(e.target.value as ImageFit)}
                    className={css({
                      h: '10',
                      w: 'full',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      px: '4',
                      fontSize: 'sm',
                      color: 'gray.200',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                      _focus: {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    <option value="contain">Contain (fit within page)</option>
                    <option value="cover">Cover (fill page)</option>
                    <option value="fill">Fill (stretch to page)</option>
                    <option value="scale-down">Scale Down (shrink only)</option>
                  </select>
                </div>

                {/* Margin */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="margin"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Margin: {margin}mm
                  </label>
                  <input
                    id="margin"
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className={css({
                      h: '2',
                      w: 'full',
                      appearance: 'none',
                      rounded: 'full',
                      bg: 'gray.700',
                      cursor: 'pointer',
                    })}
                    style={{
                      WebkitAppearance: 'none',
                    }}
                  />
                </div>

                {/* OCR Toggle */}
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: '4',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: enableOCR ? 'blue.500/30' : 'gray.700',
                    bg: enableOCR ? 'blue.500/10' : 'gray.800/50',
                    transition: 'all 300ms',
                  })}
                >
                  <div className={css({ spaceY: '1' })}>
                    <label
                      htmlFor="enable-ocr"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                        cursor: 'pointer',
                      })}
                    >
                      Extract Text (OCR)
                    </label>
                    <p
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.500',
                      })}
                    >
                      Convert image text to searchable PDF text
                    </p>
                  </div>
                  <button
                    id="enable-ocr"
                    type="button"
                    role="switch"
                    aria-checked={enableOCR}
                    onClick={() => setEnableOCR(!enableOCR)}
                    className={css({
                      position: 'relative',
                      display: 'inline-flex',
                      h: '6',
                      w: '11',
                      flexShrink: 0,
                      cursor: 'pointer',
                      rounded: 'full',
                      border: '2px solid transparent',
                      transition: 'all 200ms',
                      bg: enableOCR ? 'blue.500' : 'gray.700',
                      _focus: {
                        outline: 'none',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                        ringOffset: '2px',
                      },
                    })}
                  >
                    <span
                      className={css({
                        display: 'inline-block',
                        h: '5',
                        w: '5',
                        transform: enableOCR ? 'translateX(20px)' : 'translateX(0)',
                        rounded: 'full',
                        bg: 'white',
                        shadow: 'lg',
                        transition: 'all 200ms',
                      })}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generate Button */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4',
          })}
        >
          {isGenerating && (
            <div className={css({ w: 'full', maxW: 'md', spaceY: '2' })}>
              <Progress value={progress} />
              <p
                className={css({
                  textAlign: 'center',
                  fontSize: 'sm',
                  color: 'gray.400',
                })}
              >
                {ocrProgress || `Generating PDF... ${Math.round(progress)}%`}
              </p>
            </div>
          )}

          <Button
            onClick={generatePDF}
            disabled={isGenerating || images.length === 0}
            size="lg"
            className={css({
              gap: '2',
              minH: '12',
              px: '8',
              bg: 'blue.500/20',
              border: '1px solid',
              borderColor: 'blue.500/50',
              color: 'blue.300',
              _hover: {
                bg: 'blue.500/30',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s',
              },
              _disabled: {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            })}
          >
            <Download className={css({ h: '5', w: '5' })} />
            {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
          </Button>
        </motion.div>
      )}

      {/* Pro Tips */}
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
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Lightbulb className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Drag and drop multiple images to add them all at once</li>
                  <li>• Images are processed in the order they appear in the grid</li>
                  <li>• Choose "Contain" to fit images without cropping</li>
                  <li>• Use "Cover" to fill the entire page with your images</li>
                  <li>• All processing happens locally in your browser - no uploads required</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/image-to-pdf" category="media" />

      {/* Social Share */}
      <SocialShare
        toolName="Image to PDF Converter"
        toolUrl="/tools/image-to-pdf"
        description="Convert JPG, PNG, and other images to PDF instantly. No registration required!"
      />

      {/* Tool Rating */}
      <ToolRating toolId="image-to-pdf" toolName="Image to PDF Converter" />
    </main>
  )
}
