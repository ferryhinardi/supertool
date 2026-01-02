'use client'

import { Check, Download, FileImage, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif'

interface ConversionResult {
  dataUrl: string
  size: number
  format: ImageFormat
}

export default function ImageFormatConverterPage() {
  const [originalImage, setOriginalImage] = useState<{
    dataUrl: string
    name: string
    size: number
    format: string
  } | null>(null)
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(0.9)
  const [convertedImage, setConvertedImage] = useState<ConversionResult | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setOriginalImage({
        dataUrl,
        name: file.name,
        size: file.size,
        format: file.type.split('/')[1] || 'unknown',
      })
      setConvertedImage(null)
      setDownloaded(false)

      trackToolEvent('image_format_converter_upload', {
        original_format: file.type.split('/')[1],
        file_size: file.size,
      })
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Convert image
  const convertImage = useCallback(async () => {
    if (!originalImage) return

    setIsConverting(true)
    setError(null)
    setDownloaded(false)

    try {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setError('Failed to get canvas context')
          setIsConverting(false)
          return
        }

        // For JPEG, fill white background (no transparency)
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        // Convert to blob
        const mimeType = `image/${outputFormat === 'jpeg' ? 'jpeg' : outputFormat}`
        const qualityValue = outputFormat === 'png' || outputFormat === 'gif' ? undefined : quality

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError('Failed to convert image')
              setIsConverting(false)
              return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string
              setConvertedImage({
                dataUrl,
                size: blob.size,
                format: outputFormat,
              })
              setIsConverting(false)

              trackToolEvent('image_format_converter_convert', {
                from_format: originalImage.format,
                to_format: outputFormat,
                quality,
                original_size: originalImage.size,
                converted_size: blob.size,
                size_reduction: ((1 - blob.size / originalImage.size) * 100).toFixed(2),
              })
            }
            reader.readAsDataURL(blob)
          },
          mimeType,
          qualityValue
        )
      }

      img.onerror = () => {
        setError('Failed to load image')
        setIsConverting(false)
      }

      img.src = originalImage.dataUrl
    } catch {
      setError('An error occurred during conversion')
      setIsConverting(false)
    }
  }, [originalImage, outputFormat, quality])

  // Download converted image
  const handleDownload = useCallback(() => {
    if (!convertedImage || !originalImage) return

    const link = document.createElement('a')
    link.href = convertedImage.dataUrl
    const baseName = originalImage.name.split('.').slice(0, -1).join('.')
    link.download = `${baseName}.${outputFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)

    trackToolEvent('image_format_converter_download', {
      format: outputFormat,
      size: convertedImage.size,
    })
  }, [convertedImage, originalImage, outputFormat])

  // Reset
  const handleReset = useCallback(() => {
    setOriginalImage(null)
    setConvertedImage(null)
    setError(null)
    setDownloaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  // Calculate size reduction
  const sizeReduction =
    originalImage && convertedImage
      ? ((1 - convertedImage.size / originalImage.size) * 100).toFixed(1)
      : null

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
              gradientFrom: 'purple.500',
              gradientTo: 'indigo.500',
            })}
          >
            <FileImage className={css({ w: '6', h: '6', color: 'white' })} />
          </div>
          <div>
            <h1
              className={css({
                fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                fontWeight: 'bold',
                letterSpacing: 'tight',
              })}
            >
              Image Format Converter
            </h1>
            <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
              Convert images between PNG, JPEG, WEBP, and GIF formats
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={css({ spaceY: '6' })}>
        {/* Upload Section */}
        {!originalImage ? (
          <Card>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload image file"
                className={css({
                  border: '2px dashed',
                  borderColor: 'gray.700',
                  borderRadius: 'lg',
                  p: { base: '8', sm: '12' },
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all',
                  _hover: {
                    borderColor: 'purple.500',
                    bg: 'gray.800/50',
                  },
                })}
              >
                <Upload
                  className={css({ w: '12', h: '12', mx: 'auto', mb: '4', color: 'gray.400' })}
                />
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '2' })}>
                  Upload Image
                </h3>
                <p className={css({ color: 'gray.400', fontSize: 'sm', mb: '4' })}>
                  Drag and drop your image here, or click to browse
                </p>
                <p className={css({ color: 'gray.500', fontSize: 'xs' })}>
                  Supports: PNG, JPEG, WEBP, GIF (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className={css({ display: 'none' })}
                />
              </div>

              {error && (
                <div
                  className={css({
                    p: '3',
                    borderRadius: 'lg',
                    bg: 'red.900/20',
                    border: '1px solid',
                    borderColor: 'red.800',
                    color: 'red.400',
                    fontSize: 'sm',
                  })}
                >
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Conversion Settings */}
            <Card>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>
                    Conversion Settings
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <X className={css({ w: '4', h: '4', mr: '2' })} />
                    Reset
                  </Button>
                </div>

                {/* Original Image Info */}
                <div
                  className={css({
                    p: '3',
                    borderRadius: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                    Original Image
                  </div>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    })}
                  >
                    <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                      {originalImage.name}
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                      {originalImage.format.toUpperCase()} • {formatFileSize(originalImage.size)}
                    </span>
                  </div>
                </div>

                {/* Format Selection */}
                <div className={css({ spaceY: '2' })}>
                  <Label>Output Format</Label>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                      gap: '2',
                    })}
                  >
                    {(['png', 'jpeg', 'webp', 'gif'] as ImageFormat[]).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => {
                          setOutputFormat(format)
                          setConvertedImage(null)
                          trackToolEvent('image_format_converter_format_change', {
                            format,
                          })
                        }}
                        className={css({
                          p: '3',
                          borderRadius: 'lg',
                          border: '2px solid',
                          borderColor: outputFormat === format ? 'purple.500' : 'gray.700',
                          bg: outputFormat === format ? 'purple.900/20' : 'gray.800/50',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all',
                          _hover: {
                            borderColor: 'purple.500',
                          },
                        })}
                      >
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            textTransform: 'uppercase',
                          })}
                        >
                          {format}
                        </div>
                        <div className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>
                          {format === 'png' && 'Lossless'}
                          {format === 'jpeg' && 'High Quality'}
                          {format === 'webp' && 'Modern'}
                          {format === 'gif' && 'Animated'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider (only for JPEG and WEBP) */}
                {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                  <div className={css({ spaceY: '2' })}>
                    <Label>Quality: {Math.round(quality * 100)}%</Label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => {
                        setQuality(Number(e.target.value))
                        setConvertedImage(null)
                      }}
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
                          bg: 'purple.500',
                          cursor: 'pointer',
                        },
                        '&::-moz-range-thumb': {
                          w: '4',
                          h: '4',
                          borderRadius: 'full',
                          bg: 'purple.500',
                          cursor: 'pointer',
                          border: 'none',
                        },
                      })}
                    />
                    <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      Higher quality = larger file size
                    </p>
                  </div>
                )}

                {/* Convert Button */}
                <Button
                  onClick={convertImage}
                  disabled={isConverting}
                  className={css({ w: 'full' })}
                >
                  {isConverting ? 'Converting...' : 'Convert Image'}
                </Button>
              </CardContent>
            </Card>

            {/* Preview & Results */}
            {convertedImage && (
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
                  gap: '6',
                  w: 'full',
                })}
              >
                {/* Original */}
                <Card>
                  <CardContent className={css({ spaceY: '4' })}>
                    <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Original</h3>
                    <div
                      className={css({
                        borderRadius: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        overflow: 'hidden',
                        bg: 'gray.900',
                      })}
                    >
                      <img
                        src={originalImage.dataUrl}
                        alt="Original"
                        className={css({ w: 'full', h: 'auto', display: 'block' })}
                      />
                    </div>
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                      {originalImage.format.toUpperCase()} • {formatFileSize(originalImage.size)}
                    </div>
                  </CardContent>
                </Card>

                {/* Converted */}
                <Card>
                  <CardContent className={css({ spaceY: '4' })}>
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      })}
                    >
                      <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Converted</h3>
                      {sizeReduction && (
                        <div
                          className={css({
                            px: '2',
                            py: '1',
                            borderRadius: 'md',
                            bg: Number(sizeReduction) > 0 ? 'green.900/20' : 'orange.900/20',
                            color: Number(sizeReduction) > 0 ? 'green.400' : 'orange.400',
                            fontSize: 'xs',
                            fontWeight: 'semibold',
                          })}
                        >
                          {Number(sizeReduction) > 0 ? '-' : '+'}
                          {Math.abs(Number(sizeReduction))}%
                        </div>
                      )}
                    </div>
                    <div
                      className={css({
                        borderRadius: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        overflow: 'hidden',
                        bg: 'gray.900',
                      })}
                    >
                      <img
                        src={convertedImage.dataUrl}
                        alt="Converted"
                        className={css({ w: 'full', h: 'auto', display: 'block' })}
                      />
                    </div>
                    <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                      {outputFormat.toUpperCase()} • {formatFileSize(convertedImage.size)}
                    </div>
                    <Button onClick={handleDownload} className={css({ w: 'full' })}>
                      {downloaded ? (
                        <>
                          <Check className={css({ w: '4', h: '4', mr: '2' })} />
                          Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className={css({ w: '4', h: '4', mr: '2' })} />
                          Download {outputFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Tips */}
        <Card>
          <CardContent className={css({ spaceY: '3' })}>
            <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Format Comparison</h2>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: '4',
              })}
            >
              <div
                className={css({
                  p: '3',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontSize: 'sm', fontWeight: 'semibold', mb: '2' })}>PNG</div>
                <ul
                  className={css({
                    listStyle: 'disc',
                    pl: '4',
                    spaceY: '1',
                    fontSize: 'xs',
                    color: 'gray.400',
                  })}
                >
                  <li>Lossless compression</li>
                  <li>Supports transparency</li>
                  <li>Best for graphics, logos</li>
                  <li>Larger file size</li>
                </ul>
              </div>

              <div
                className={css({
                  p: '3',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontSize: 'sm', fontWeight: 'semibold', mb: '2' })}>JPEG</div>
                <ul
                  className={css({
                    listStyle: 'disc',
                    pl: '4',
                    spaceY: '1',
                    fontSize: 'xs',
                    color: 'gray.400',
                  })}
                >
                  <li>Lossy compression</li>
                  <li>No transparency</li>
                  <li>Best for photos</li>
                  <li>Smaller file size</li>
                </ul>
              </div>

              <div
                className={css({
                  p: '3',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontSize: 'sm', fontWeight: 'semibold', mb: '2' })}>WEBP</div>
                <ul
                  className={css({
                    listStyle: 'disc',
                    pl: '4',
                    spaceY: '1',
                    fontSize: 'xs',
                    color: 'gray.400',
                  })}
                >
                  <li>Modern format</li>
                  <li>Supports transparency</li>
                  <li>Best compression</li>
                  <li>Smallest file size</li>
                </ul>
              </div>

              <div
                className={css({
                  p: '3',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontSize: 'sm', fontWeight: 'semibold', mb: '2' })}>GIF</div>
                <ul
                  className={css({
                    listStyle: 'disc',
                    pl: '4',
                    spaceY: '1',
                    fontSize: 'xs',
                    color: 'gray.400',
                  })}
                >
                  <li>Supports animation</li>
                  <li>Limited colors (256)</li>
                  <li>Best for simple graphics</li>
                  <li>Variable size</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
