'use client'

import { Check, Copy, Download, FileImage, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ConversionSettings {
  width: number
  height: number
  backgroundColor: string
  quality: number
  maintainAspectRatio: boolean
}

export default function SvgToPngConverter() {
  const [svgFile, setSvgFile] = useState<File | null>(null)
  const [svgPreview, setSvgPreview] = useState<string>('')
  const [pngDataUrl, setPngDataUrl] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<ConversionSettings>({
    width: 800,
    height: 600,
    backgroundColor: 'transparent',
    quality: 1,
    maintainAspectRatio: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('svg')) {
      setError('Please upload a valid SVG file')
      trackToolEvent('svg_to_png_error', { error: 'Invalid file type' })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('SVG file must be less than 10MB')
      trackToolEvent('svg_to_png_error', { error: 'File too large' })
      return
    }

    setError('')
    setSvgFile(file)
    setPngDataUrl('')

    // Read SVG content
    const reader = new FileReader()
    reader.onload = (event) => {
      const svgContent = event.target?.result as string
      setSvgPreview(svgContent)

      // Extract dimensions from SVG
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')

      if (svgElement) {
        const viewBox = svgElement.getAttribute('viewBox')
        const width = svgElement.getAttribute('width')
        const height = svgElement.getAttribute('height')

        let svgWidth = 800
        let svgHeight = 600

        if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number)
          svgWidth = vbWidth
          svgHeight = vbHeight
        } else if (width && height) {
          svgWidth = Number.parseFloat(width)
          svgHeight = Number.parseFloat(height)
        }

        setSettings((prev) => ({
          ...prev,
          width: svgWidth,
          height: svgHeight,
        }))
      }
    }
    reader.readAsText(file)
    trackToolEvent('svg_to_png_upload', { fileSize: file.size })
  }, [])

  const convertToPng = useCallback(async () => {
    if (!svgPreview || !canvasRef.current) return

    setIsConverting(true)
    setError('')

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      // Set canvas dimensions
      canvas.width = settings.width
      canvas.height = settings.height

      // Set background
      if (settings.backgroundColor !== 'transparent') {
        ctx.fillStyle = settings.backgroundColor
        ctx.fillRect(0, 0, settings.width, settings.height)
      }

      // Create image from SVG
      const img = new Image()
      const svgBlob = new Blob([svgPreview], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        // Draw image on canvas
        if (settings.maintainAspectRatio) {
          const scale = Math.min(settings.width / img.width, settings.height / img.height)
          const x = (settings.width - img.width * scale) / 2
          const y = (settings.height - img.height * scale) / 2
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        } else {
          ctx.drawImage(img, 0, 0, settings.width, settings.height)
        }

        // Convert to PNG
        const pngUrl = canvas.toDataURL('image/png', settings.quality)
        setPngDataUrl(pngUrl)
        setIsConverting(false)
        trackToolEvent('svg_to_png_success', {
          width: settings.width,
          height: settings.height,
          backgroundColor: settings.backgroundColor,
        })

        URL.revokeObjectURL(url)
      }

      img.onerror = () => {
        setError('Failed to load SVG image')
        setIsConverting(false)
        trackToolEvent('svg_to_png_error', { error: 'Image load failed' })
        URL.revokeObjectURL(url)
      }

      img.src = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setIsConverting(false)
      trackToolEvent('svg_to_png_error', { error: String(err) })
    }
  }, [svgPreview, settings])

  const downloadPng = useCallback(() => {
    if (!pngDataUrl) return

    const link = document.createElement('a')
    const fileName = svgFile?.name.replace('.svg', '.png') || 'converted.png'
    link.href = pngDataUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    trackToolEvent('svg_to_png_download', { fileName })
  }, [pngDataUrl, svgFile])

  const copyToClipboard = useCallback(async () => {
    if (!pngDataUrl) return

    try {
      const response = await fetch(pngDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackToolEvent('svg_to_png_copy')
    } catch {
      setError('Failed to copy to clipboard')
      trackToolEvent('svg_to_png_error', { error: 'Copy failed' })
    }
  }, [pngDataUrl])

  const clearAll = useCallback(() => {
    setSvgFile(null)
    setSvgPreview('')
    setPngDataUrl('')
    setError('')
    setSettings({
      width: 800,
      height: 600,
      backgroundColor: 'transparent',
      quality: 1,
      maintainAspectRatio: true,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    trackToolEvent('svg_to_png_clear')
  }, [])

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
            justifyContent: 'center',
            w: '16',
            h: '16',
            rounded: '2xl',
            bgGradient: 'to-br',
            gradientFrom: 'purple.500',
            gradientTo: 'pink.500',
            mb: '4',
          })}
        >
          <FileImage className={css({ w: '8', h: '8', color: 'white' })} />
        </div>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
            color: 'transparent',
          })}
        >
          SVG to PNG Converter
        </h1>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Convert SVG files to high-quality PNG images with customizable dimensions and background
          colors
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: { base: '6', lg: '8' },
          w: 'full',
        })}
      >
        {/* Left Panel - Upload & Settings */}
        <div className={css({ spaceY: '6' })}>
          {/* Upload Section */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: '2xl',
              p: { base: '6', sm: '8' },
              spaceY: '6',
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              Upload SVG
            </h2>

            {/* biome-ignore lint/a11y/useSemanticElements: Drop zone requires div for drag-and-drop file upload functionality */}
            <div
              role="button"
              tabIndex={0}
              className={css({
                border: '2px dashed',
                borderColor: svgFile ? 'purple.500' : 'rgba(255, 255, 255, 0.1)',
                rounded: 'xl',
                p: { base: '8', sm: '12' },
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'purple.400',
                  bg: 'rgba(139, 92, 246, 0.05)',
                },
              })}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileUpload}
                className={css({ display: 'none' })}
              />
              <Upload
                className={css({ w: '12', h: '12', mx: 'auto', mb: '4', color: 'gray.400' })}
              />
              <p className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'white', mb: '2' })}>
                {svgFile ? svgFile.name : 'Click to upload SVG file'}
              </p>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>Maximum file size: 10MB</p>
            </div>

            {error && (
              <div
                className={css({
                  p: '4',
                  bg: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid',
                  borderColor: 'red.500',
                  rounded: 'lg',
                  color: 'red.400',
                  fontSize: 'sm',
                })}
              >
                {error}
              </div>
            )}
          </div>

          {/* Settings Section */}
          {svgFile && (
            <div
              className={css({
                bg: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rounded: '2xl',
                p: { base: '6', sm: '8' },
                spaceY: '6',
              })}
            >
              <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
                Conversion Settings
              </h2>

              {/* Dimensions */}
              <div className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div>
                    <label
                      htmlFor="svg-width-input"
                      className={css({
                        display: 'block',
                        fontSize: 'sm',
                        color: 'gray.400',
                        mb: '2',
                      })}
                    >
                      Width (px)
                    </label>
                    <input
                      id="svg-width-input"
                      type="number"
                      value={settings.width}
                      onChange={(e) => setSettings({ ...settings, width: Number(e.target.value) })}
                      className={css({
                        w: 'full',
                        px: '4',
                        py: '3',
                        bg: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        rounded: 'lg',
                        color: 'white',
                        fontSize: 'sm',
                        _focus: {
                          outline: 'none',
                          borderColor: 'purple.500',
                        },
                      })}
                      min="1"
                      max="4096"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="svg-height-input"
                      className={css({
                        display: 'block',
                        fontSize: 'sm',
                        color: 'gray.400',
                        mb: '2',
                      })}
                    >
                      Height (px)
                    </label>
                    <input
                      id="svg-height-input"
                      type="number"
                      value={settings.height}
                      onChange={(e) => setSettings({ ...settings, height: Number(e.target.value) })}
                      className={css({
                        w: 'full',
                        px: '4',
                        py: '3',
                        bg: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        rounded: 'lg',
                        color: 'white',
                        fontSize: 'sm',
                        _focus: {
                          outline: 'none',
                          borderColor: 'purple.500',
                        },
                      })}
                      min="1"
                      max="4096"
                    />
                  </div>
                </div>

                {/* Maintain Aspect Ratio */}
                <label
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    cursor: 'pointer',
                  })}
                >
                  <input
                    type="checkbox"
                    checked={settings.maintainAspectRatio}
                    onChange={(e) =>
                      setSettings({ ...settings, maintainAspectRatio: e.target.checked })
                    }
                    className={css({
                      w: '5',
                      h: '5',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      bg: 'rgba(0, 0, 0, 0.3)',
                      cursor: 'pointer',
                    })}
                  />
                  <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    Maintain aspect ratio
                  </span>
                </label>
              </div>

              {/* Background Color */}
              <div>
                <label
                  htmlFor="svg-bg-color"
                  className={css({ display: 'block', fontSize: 'sm', color: 'gray.400', mb: '2' })}
                >
                  Background Color
                </label>
                <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                  {['transparent', '#FFFFFF', '#000000', '#F3F4F6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSettings({ ...settings, backgroundColor: color })}
                      className={css({
                        w: '12',
                        h: '12',
                        rounded: 'lg',
                        border: '2px solid',
                        borderColor:
                          settings.backgroundColor === color
                            ? 'purple.500'
                            : 'rgba(255, 255, 255, 0.1)',
                        bg: color === 'transparent' ? 'transparent' : color,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'purple.400',
                        },
                      })}
                      style={{
                        backgroundImage:
                          color === 'transparent'
                            ? 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)'
                            : undefined,
                        backgroundSize: color === 'transparent' ? '10px 10px' : undefined,
                        backgroundPosition:
                          color === 'transparent' ? '0 0, 0 5px, 5px -5px, -5px 0px' : undefined,
                      }}
                    >
                      {settings.backgroundColor === color && (
                        <Check
                          className={css({
                            w: '6',
                            h: '6',
                            color: color === '#000000' ? 'white' : 'black',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          })}
                        />
                      )}
                    </button>
                  ))}
                  <input
                    id="svg-bg-color"
                    type="color"
                    value={
                      settings.backgroundColor === 'transparent'
                        ? '#FFFFFF'
                        : settings.backgroundColor
                    }
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className={css({
                      w: '12',
                      h: '12',
                      rounded: 'lg',
                      border: '2px solid',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      _hover: {
                        borderColor: 'purple.400',
                      },
                    })}
                  />
                </div>
              </div>

              {/* Quality Slider */}
              <div>
                <label
                  htmlFor="svg-quality"
                  className={css({ display: 'block', fontSize: 'sm', color: 'gray.400', mb: '2' })}
                >
                  Quality: {Math.round(settings.quality * 100)}%
                </label>
                <input
                  id="svg-quality"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.quality}
                  onChange={(e) =>
                    setSettings({ ...settings, quality: Number.parseFloat(e.target.value) })
                  }
                  className={css({
                    w: 'full',
                    cursor: 'pointer',
                  })}
                />
              </div>

              {/* Convert Button */}
              <Button
                onClick={convertToPng}
                disabled={isConverting}
                className={css({
                  w: 'full',
                  h: '12',
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.500',
                  gradientTo: 'pink.500',
                  _hover: {
                    opacity: 0.9,
                  },
                  _disabled: {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                })}
              >
                {isConverting ? 'Converting...' : 'Convert to PNG'}
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Preview & Download */}
        <div className={css({ spaceY: '6' })}>
          {/* SVG Preview */}
          {svgPreview && (
            <div
              className={css({
                bg: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rounded: '2xl',
                p: { base: '6', sm: '8' },
                spaceY: '4',
              })}
            >
              <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
                SVG Preview
              </h2>
              <div
                className={css({
                  w: 'full',
                  minH: '64',
                  bg: 'rgba(0, 0, 0, 0.3)',
                  rounded: 'lg',
                  p: '4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                })}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG content is user-uploaded for preview purposes
                dangerouslySetInnerHTML={{ __html: svgPreview }}
              />
            </div>
          )}

          {/* PNG Result */}
          {pngDataUrl && (
            <div
              className={css({
                bg: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rounded: '2xl',
                p: { base: '6', sm: '8' },
                spaceY: '4',
              })}
            >
              <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
                PNG Result
              </h2>
              <div
                className={css({
                  w: 'full',
                  minH: '64',
                  bg: 'rgba(0, 0, 0, 0.3)',
                  rounded: 'lg',
                  p: '4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                })}
                style={{
                  backgroundImage:
                    settings.backgroundColor === 'transparent'
                      ? 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)'
                      : undefined,
                  backgroundSize:
                    settings.backgroundColor === 'transparent' ? '20px 20px' : undefined,
                  backgroundPosition:
                    settings.backgroundColor === 'transparent'
                      ? '0 0, 0 10px, 10px -10px, -10px 0px'
                      : undefined,
                }}
              >
                <img
                  src={pngDataUrl}
                  alt="PNG Result"
                  className={css({ maxW: 'full', maxH: '96', objectFit: 'contain' })}
                />
              </div>

              {/* Action Buttons */}
              <div
                className={css({
                  display: 'flex',
                  gap: '3',
                  flexWrap: 'wrap',
                })}
              >
                <Button
                  onClick={downloadPng}
                  className={css({
                    flex: '1',
                    minW: '32',
                    h: '12',
                    bgGradient: 'to-r',
                    gradientFrom: 'purple.500',
                    gradientTo: 'pink.500',
                    _hover: {
                      opacity: 0.9,
                    },
                  })}
                >
                  <Download className={css({ w: '5', h: '5', mr: '2' })} />
                  Download PNG
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  className={css({
                    flex: '1',
                    minW: '32',
                    h: '12',
                  })}
                >
                  {copied ? (
                    <>
                      <Check className={css({ w: '5', h: '5', mr: '2' })} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className={css({ w: '5', h: '5', mr: '2' })} />
                      Copy Image
                    </>
                  )}
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className={css({
                    minW: '32',
                    h: '12',
                  })}
                >
                  <X className={css({ w: '5', h: '5', mr: '2' })} />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for conversion */}
      <canvas ref={canvasRef} className={css({ display: 'none' })} />
    </main>
  )
}
