'use client'

import JSZip from 'jszip'
import {
  Check,
  Download,
  Image as ImageIcon,
  Maximize2,
  RotateCcw,
  Smartphone,
  X,
  ZoomIn,
} from 'lucide-react'
import { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { PLATFORM_PRESETS, PLATFORMS, type Platform } from './presets'

interface ResizedImage {
  presetId: string
  presetName: string
  platform: string
  width: number
  height: number
  dataUrl: string
  blob: Blob
}

const MAX_FILE_SIZE = 20 * 1024 * 1024

function resizeImageToPreset(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // "Cover" fit: scale to fill, center-crop overflow
      const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
      const scaledW = img.width * scale
      const scaledH = img.height * scale
      const offsetX = (targetWidth - scaledW) / 2
      const offsetY = (targetHeight - scaledH) / 2

      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH)

      const dataUrl = canvas.toDataURL('image/png')
      canvas.toBlob((b) => {
        if (b) {
          resolve({ dataUrl, blob: b })
        } else {
          reject(new Error('Failed to create blob'))
        }
      }, 'image/png')
    } catch (error) {
      reject(error)
    }
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

function SocialMediaResizerContent() {
  useTrackToolView({
    toolId: 'social-media-resizer',
    title: 'Social Media Image Resizer',
    href: '/tools/design/social-media-resizer',
    iconName: 'Smartphone',
    gradient: 'from-cyan-500 to-blue-500',
  })

  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set())
  const [customWidth, setCustomWidth] = useState<number | ''>(800)
  const [customHeight, setCustomHeight] = useState<number | ''>(600)
  const [useCustom, setUseCustom] = useState(false)
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activePreview, setActivePreview] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')
  const previewModalRef = useRef<HTMLDivElement>(null)

  const filteredPresets = useMemo(() => {
    if (platformFilter === 'all') return PLATFORM_PRESETS
    return PLATFORM_PRESETS.filter((p) => p.platform === platformFilter)
  }, [platformFilter])

  const handleImageUpload = useCallback(
    (files: FileList) => {
      const file = files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be under 20MB')
        return
      }

      // Clean up previous preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      const url = URL.createObjectURL(file)
      setSourceImage(file)
      setImagePreview(url)
      setResizedImages([])

      // Load to get natural dimensions
      const img = new Image()
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = url

      trackToolEvent('social_resizer_upload', { fileType: file.type })
      toast.success('Image uploaded successfully')
    },
    [imagePreview]
  )

  const handleClearImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setSourceImage(null)
    setImagePreview(null)
    setImageDimensions(null)
    setSelectedPresets(new Set())
    setResizedImages([])
    setActivePreview(null)
    trackToolEvent('social_resizer_clear')
  }, [imagePreview])

  const togglePreset = useCallback((presetId: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev)
      if (next.has(presetId)) {
        next.delete(presetId)
      } else {
        next.add(presetId)
      }
      return next
    })
    trackToolEvent('social_resizer_preset_toggle', { preset: presetId })
  }, [])

  const selectAllForPlatform = useCallback((platform: Platform) => {
    const platformPresets = PLATFORM_PRESETS.filter((p) => p.platform === platform)
    setSelectedPresets((prev) => {
      const next = new Set(prev)
      for (const p of platformPresets) {
        next.add(p.id)
      }
      return next
    })
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedPresets(new Set())
  }, [])

  const totalSelected = selectedPresets.size + (useCustom ? 1 : 0)

  const handleResize = useCallback(async () => {
    if (!imagePreview || totalSelected === 0) return

    setIsProcessing(true)
    setResizedImages([])

    try {
      const img = await loadImage(imagePreview)
      const results: ResizedImage[] = []

      // Resize for each selected preset
      for (const presetId of selectedPresets) {
        const preset = PLATFORM_PRESETS.find((p) => p.id === presetId)
        if (!preset) continue

        const { dataUrl, blob } = await resizeImageToPreset(img, preset.width, preset.height)

        const platformInfo = PLATFORMS.find((p) => p.id === preset.platform)
        results.push({
          presetId: preset.id,
          presetName: preset.name,
          platform: platformInfo?.name ?? preset.platform,
          width: preset.width,
          height: preset.height,
          dataUrl,
          blob,
        })
      }

      // Custom dimensions
      if (useCustom && customWidth && customHeight) {
        const w = Number(customWidth)
        const h = Number(customHeight)
        if (w > 0 && h > 0 && w <= 4096 && h <= 4096) {
          const { dataUrl, blob } = await resizeImageToPreset(img, w, h)
          results.push({
            presetId: 'custom',
            presetName: 'Custom',
            platform: 'Custom',
            width: w,
            height: h,
            dataUrl,
            blob,
          })
        }
      }

      setResizedImages(results)
      trackToolEvent('social_resizer_resize', { count: results.length })
      toast.success(`Resized to ${results.length} format${results.length > 1 ? 's' : ''}`)
    } catch (error) {
      trackToolEvent('social_resizer_error')
      toast.error(`Resize failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [imagePreview, totalSelected, selectedPresets, useCustom, customWidth, customHeight])

  const handleDownloadSingle = useCallback((image: ResizedImage) => {
    const url = URL.createObjectURL(image.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${image.platform.toLowerCase()}-${image.presetName.toLowerCase().replace(/\s+/g, '-')}-${image.width}x${image.height}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    trackToolEvent('social_resizer_download_single', { preset: image.presetId })
  }, [])

  const handleDownloadAll = useCallback(async () => {
    if (resizedImages.length === 0) return

    try {
      const zip = new JSZip()

      for (const img of resizedImages) {
        const folder = zip.folder(img.platform.toLowerCase().replace(/[\s/]+/g, '-'))
        if (folder) {
          const filename = `${img.presetName.toLowerCase().replace(/\s+/g, '-')}-${img.width}x${img.height}.png`
          folder.file(filename, img.blob)
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'social-media-images.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      trackToolEvent('social_resizer_download_zip', { count: resizedImages.length })
      toast.success('ZIP downloaded')
    } catch (_error) {
      toast.error('Failed to create ZIP')
    }
  }, [resizedImages])

  const previewImage = useMemo(() => {
    if (!activePreview) return null
    return resizedImages.find((img) => img.presetId === activePreview) ?? null
  }, [activePreview, resizedImages])

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
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'cyan.500/30',
            bg: 'cyan.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Smartphone className={css({ h: '5', w: '5', color: 'cyan.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'cyan.300',
            })}
          >
            All Platforms • Batch Resize • Download
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'cyan.400',
            gradientTo: 'blue.400',
            bgClip: 'text',
            color: 'transparent',
            letterSpacing: 'tight',
          })}
        >
          Social Media Image Resizer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'lg', md: 'xl' },
            color: 'white',
            lineHeight: 'relaxed',
          })}
        >
          Resize images for Instagram, Facebook, Twitter/X, LinkedIn, YouTube, and more. Select
          presets, resize in bulk, and download as ZIP.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ImageIcon className={css({ h: '5', w: '5', display: 'inline', mr: '2' })} />
            Upload Image
          </CardTitle>
          <CardDescription>Upload an image to resize for social media (max 20MB)</CardDescription>
        </CardHeader>
        <CardContent>
          {!sourceImage ? (
            <DragDropZone
              onFilesSelected={handleImageUpload}
              accept="image/*"
              maxSize={MAX_FILE_SIZE}
            />
          ) : (
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                alignItems: { base: 'stretch', sm: 'center' },
                gap: '4',
              })}
            >
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={css({
                    w: { base: 'full', sm: '48' },
                    h: '32',
                    objectFit: 'cover',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                />
              )}
              <div className={css({ flex: '1', spaceY: '2' })}>
                <p
                  className={css({
                    fontWeight: 'medium',
                    color: 'white',
                    wordBreak: 'break-all',
                  })}
                >
                  {sourceImage.name}
                </p>
                <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                  <span
                    className={css({
                      fontSize: 'xs',
                      px: '2',
                      py: '0.5',
                      rounded: 'full',
                      bg: 'cyan.500/20',
                      color: 'cyan.300',
                      border: '1px solid',
                      borderColor: 'cyan.500/30',
                    })}
                  >
                    {(sourceImage.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {imageDimensions && (
                    <span
                      className={css({
                        fontSize: 'xs',
                        px: '2',
                        py: '0.5',
                        rounded: 'full',
                        bg: 'blue.500/20',
                        color: 'blue.300',
                        border: '1px solid',
                        borderColor: 'blue.500/30',
                      })}
                    >
                      {imageDimensions.width} × {imageDimensions.height}
                    </span>
                  )}
                </div>
              </div>
              <Button onClick={handleClearImage} variant="outline" className={css({ minH: '11' })}>
                <RotateCcw className={css({ h: '4', w: '4', mr: '2' })} />
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preset Selection */}
      {sourceImage && (
        <Card>
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                alignItems: { base: 'start', sm: 'center' },
                justifyContent: 'space-between',
                gap: '3',
              })}
            >
              <div>
                <CardTitle>
                  <Maximize2
                    className={css({
                      h: '5',
                      w: '5',
                      display: 'inline',
                      mr: '2',
                    })}
                  />
                  Select Sizes
                </CardTitle>
                <CardDescription>
                  Choose platform presets or enter custom dimensions
                </CardDescription>
              </div>
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button onClick={deselectAll} variant="outline" size="sm">
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Platform Filter Tabs */}
            <div
              className={css({
                display: 'flex',
                gap: '2',
                overflowX: 'auto',
                pb: '2',
                '&::-webkit-scrollbar': { display: 'none' },
              })}
            >
              <Button
                onClick={() => setPlatformFilter('all')}
                variant={platformFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={css({ flexShrink: 0 })}
              >
                All
              </Button>
              {PLATFORMS.map((platform) => (
                <Button
                  key={platform.id}
                  onClick={() => setPlatformFilter(platform.id)}
                  variant={platformFilter === platform.id ? 'default' : 'outline'}
                  size="sm"
                  className={css({ flexShrink: 0 })}
                >
                  {platform.name}
                </Button>
              ))}
            </div>

            {/* Select All for Current Platform */}
            {platformFilter !== 'all' && (
              <Button
                onClick={() => selectAllForPlatform(platformFilter)}
                variant="outline"
                size="sm"
              >
                <Check className={css({ h: '4', w: '4', mr: '1' })} />
                Select All {PLATFORMS.find((p) => p.id === platformFilter)?.name}
              </Button>
            )}

            {/* Preset Grid */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: '3',
              })}
            >
              {filteredPresets.map((preset) => {
                const isSelected = selectedPresets.has(preset.id)
                const platformInfo = PLATFORMS.find((p) => p.id === preset.platform)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => togglePreset(preset.id)}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '2px solid',
                      borderColor: isSelected ? 'cyan.500' : 'gray.700',
                      bg: isSelected ? 'cyan.500/10' : 'gray.800/50',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        borderColor: isSelected ? 'cyan.400' : 'gray.600',
                        bg: isSelected ? 'cyan.500/15' : 'gray.800',
                      },
                      minH: '11',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: '1',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'semibold',
                          color: 'gray.400',
                          textTransform: 'uppercase',
                          letterSpacing: 'wide',
                        })}
                        style={{ color: platformInfo?.color }}
                      >
                        {platformInfo?.name}
                      </span>
                      {isSelected && (
                        <Check
                          className={css({
                            h: '4',
                            w: '4',
                            color: 'cyan.400',
                          })}
                        />
                      )}
                    </div>
                    <p
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      {preset.name}
                    </p>
                    <p
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.400',
                        mt: '0.5',
                      })}
                    >
                      {preset.width} × {preset.height} ({preset.aspectRatio})
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Custom Dimensions */}
            <div
              className={css({
                p: '4',
                rounded: 'lg',
                border: '1px solid',
                borderColor: useCustom ? 'cyan.500/30' : 'gray.700',
                bg: useCustom ? 'cyan.500/5' : 'gray.800/30',
              })}
            >
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  cursor: 'pointer',
                  mb: useCustom ? '3' : '0',
                })}
              >
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className={css({ w: '4', h: '4', accentColor: 'cyan.500' })}
                />
                <span
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'white',
                  })}
                >
                  Custom dimensions
                </span>
              </label>
              {useCustom && (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                  })}
                >
                  <div className={css({ flex: '1' })}>
                    <label
                      htmlFor="custom-width"
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.400',
                        display: 'block',
                        mb: '1',
                      })}
                    >
                      Width (px)
                    </label>
                    <Input
                      id="custom-width"
                      type="number"
                      min={1}
                      max={4096}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  <span
                    className={css({
                      color: 'gray.500',
                      mt: '5',
                      fontSize: 'lg',
                    })}
                  >
                    ×
                  </span>
                  <div className={css({ flex: '1' })}>
                    <label
                      htmlFor="custom-height"
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.400',
                        display: 'block',
                        mb: '1',
                      })}
                    >
                      Height (px)
                    </label>
                    <Input
                      id="custom-height"
                      type="number"
                      min={1}
                      max={4096}
                      value={customHeight}
                      onChange={(e) =>
                        setCustomHeight(e.target.value ? Number(e.target.value) : '')
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      {sourceImage && (
        <div className={css({ display: 'flex', justifyContent: 'center' })}>
          <Button
            onClick={handleResize}
            disabled={totalSelected === 0 || isProcessing}
            className={css({ minH: '12', px: '8', fontSize: 'lg' })}
          >
            {isProcessing ? (
              <>
                <div
                  className={css({
                    w: '5',
                    h: '5',
                    border: '2px solid',
                    borderColor: 'gray.400',
                    borderTopColor: 'white',
                    rounded: 'full',
                    animation: 'spin 1s linear infinite',
                    mr: '2',
                  })}
                />
                Processing...
              </>
            ) : (
              <>
                <Smartphone className={css({ h: '5', w: '5', mr: '2' })} />
                Resize {totalSelected} Image{totalSelected !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {resizedImages.length > 0 && (
        <Card>
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                alignItems: { base: 'start', sm: 'center' },
                justifyContent: 'space-between',
                gap: '3',
              })}
            >
              <CardTitle>
                {resizedImages.length} Image
                {resizedImages.length !== 1 ? 's' : ''} Resized
              </CardTitle>
              <Button onClick={handleDownloadAll} className={css({ minH: '11' })}>
                <Download className={css({ h: '4', w: '4', mr: '2' })} />
                Download All as ZIP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: '4',
              })}
            >
              {resizedImages.map((image) => (
                <div
                  key={image.presetId}
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    overflow: 'hidden',
                    bg: 'gray.800/50',
                    transition: 'all 0.2s',
                    _hover: { borderColor: 'gray.600' },
                  })}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreview(image.presetId)
                      trackToolEvent('social_resizer_preview', {
                        preset: image.presetId,
                      })
                    }}
                    className={css({
                      w: 'full',
                      h: '40',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bg: 'gray.900',
                      cursor: 'pointer',
                      position: 'relative',
                      border: 'none',
                      p: '0',
                    })}
                  >
                    <img
                      src={image.dataUrl}
                      alt={`${image.platform} ${image.presetName}`}
                      className={css({
                        maxW: 'full',
                        maxH: 'full',
                        objectFit: 'contain',
                      })}
                    />
                    <div
                      className={css({
                        position: 'absolute',
                        inset: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bg: 'black/0',
                        transition: 'all 0.2s',
                        _hover: { bg: 'black/40' },
                      })}
                    >
                      <ZoomIn
                        className={css({
                          h: '6',
                          w: '6',
                          color: 'white',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          _groupHover: { opacity: 1 },
                        })}
                      />
                    </div>
                  </button>
                  <div className={css({ p: '3', spaceY: '2' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      })}
                    >
                      <div>
                        <p
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          {image.platform}
                        </p>
                        <p
                          className={css({
                            fontSize: 'xs',
                            color: 'gray.400',
                          })}
                        >
                          {image.presetName} — {image.width} × {image.height}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDownloadSingle(image)}
                        variant="outline"
                        size="sm"
                        aria-label={`Download ${image.platform} ${image.presetName}`}
                        className={css({ minH: '11' })}
                      >
                        <Download className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {activePreview && previewImage && (
        <div
          ref={previewModalRef}
          role="dialog"
          aria-label="Image preview"
          className={css({
            position: 'fixed',
            inset: '0',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'black/80',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
          })}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setActivePreview(null)}
            className={css({
              position: 'absolute',
              inset: '0',
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
            })}
          />
          <div
            className={css({
              position: 'relative',
              zIndex: 1,
              maxW: '90vw',
              maxH: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4',
              animation: 'scaleIn 0.2s ease-out',
            })}
          >
            <img
              src={previewImage.dataUrl}
              alt={`${previewImage.platform} ${previewImage.presetName}`}
              className={css({
                maxW: 'full',
                maxH: '70vh',
                objectFit: 'contain',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.600',
              })}
            />
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
              })}
            >
              <span className={css({ color: 'white', fontSize: 'sm' })}>
                {previewImage.platform} — {previewImage.presetName} ({previewImage.width} ×{' '}
                {previewImage.height})
              </span>
              <Button
                onClick={() => handleDownloadSingle(previewImage)}
                size="sm"
                className={css({ minH: '11' })}
              >
                <Download className={css({ h: '4', w: '4', mr: '1' })} />
                Download
              </Button>
              <Button
                onClick={() => setActivePreview(null)}
                variant="outline"
                size="sm"
                className={css({ minH: '11' })}
              >
                <X className={css({ h: '4', w: '4' })} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <Card>
        <CardContent withTopPadding className={css({ textAlign: 'center', spaceY: '2' })}>
          <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
            All processing happens in your browser. Your images are never uploaded to any server.
          </p>
          <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
            For best results, use high-resolution source images (at least 2000px on the longest
            side).
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default function SocialMediaResizerPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            minH: 'screen',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <div className={css({ textAlign: 'center', spaceY: '4' })}>
            <div
              className={css({
                display: 'inline-block',
                w: '16',
                h: '16',
                border: '4px solid',
                borderColor: 'gray.700',
                borderTopColor: 'cyan.500',
                rounded: 'full',
                animation: 'spin 1s linear infinite',
              })}
            />
            <p className={css({ color: 'white' })}>Loading Social Media Resizer...</p>
          </div>
        </div>
      }
    >
      <ToolSearch />
      <SocialMediaResizerContent />
    </Suspense>
  )
}
