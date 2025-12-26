'use client'

import exifr from 'exifr'
import { motion } from 'framer-motion'
import {
  Camera,
  Copy,
  Download,
  Image as ImageIcon,
  Info,
  MapPin,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface MetadataEntry {
  label: string
  value: string
  category: 'exif' | 'gps' | 'camera' | 'technical'
}

interface ParsedMetadata {
  exif: MetadataEntry[]
  gps: MetadataEntry[]
  camera: MetadataEntry[]
  technical: MetadataEntry[]
  raw: Record<string, unknown>
}

function ImageMetadataContent() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('image_metadata_open', {})
  }, [])

  const parseMetadata = async (file: File) => {
    try {
      setLoading(true)
      const data = await exifr.parse(file, { translateKeys: true, translateValues: true })

      if (!data || Object.keys(data).length === 0) {
        toast.error('No metadata found in this image')
        setMetadata(null)
        return
      }

      const parsed: ParsedMetadata = {
        exif: [],
        gps: [],
        camera: [],
        technical: [],
        raw: data,
      }

      // EXIF Data
      if (data.DateTimeOriginal || data.CreateDate) {
        const dateValue = data.DateTimeOriginal || data.CreateDate
        parsed.exif.push({
          label: 'Date Taken',
          value: dateValue instanceof Date ? dateValue.toLocaleString() : String(dateValue),
          category: 'exif',
        })
      }
      if (data.Make) {
        parsed.exif.push({ label: 'Camera Make', value: String(data.Make), category: 'exif' })
      }
      if (data.Model) {
        parsed.exif.push({ label: 'Camera Model', value: String(data.Model), category: 'exif' })
      }
      if (data.Orientation) {
        parsed.exif.push({
          label: 'Orientation',
          value: String(data.Orientation),
          category: 'exif',
        })
      }
      if (data.Software) {
        parsed.exif.push({ label: 'Software', value: String(data.Software), category: 'exif' })
      }

      // GPS Data
      if (data.latitude && data.longitude) {
        parsed.gps.push({
          label: 'Latitude',
          value: `${Number(data.latitude).toFixed(6)}°`,
          category: 'gps',
        })
        parsed.gps.push({
          label: 'Longitude',
          value: `${Number(data.longitude).toFixed(6)}°`,
          category: 'gps',
        })
        parsed.gps.push({
          label: 'Google Maps',
          value: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
          category: 'gps',
        })
      }
      if (data.GPSAltitude) {
        parsed.gps.push({
          label: 'Altitude',
          value: `${Number(data.GPSAltitude).toFixed(2)}m`,
          category: 'gps',
        })
      }

      // Camera Settings
      if (data.FNumber || data.ApertureValue) {
        const aperture = data.FNumber || data.ApertureValue
        parsed.camera.push({
          label: 'Aperture',
          value: `f/${Number(aperture).toFixed(1)}`,
          category: 'camera',
        })
      }
      if (data.ExposureTime || data.ShutterSpeedValue) {
        const exposure = data.ExposureTime || data.ShutterSpeedValue
        parsed.camera.push({
          label: 'Shutter Speed',
          value: typeof exposure === 'number' ? `1/${Math.round(1 / exposure)}s` : String(exposure),
          category: 'camera',
        })
      }
      if (data.ISO) {
        parsed.camera.push({ label: 'ISO', value: String(data.ISO), category: 'camera' })
      }
      if (data.FocalLength) {
        parsed.camera.push({
          label: 'Focal Length',
          value: `${Number(data.FocalLength).toFixed(0)}mm`,
          category: 'camera',
        })
      }
      if (data.LensModel) {
        parsed.camera.push({ label: 'Lens', value: String(data.LensModel), category: 'camera' })
      }
      if (data.Flash) {
        parsed.camera.push({ label: 'Flash', value: String(data.Flash), category: 'camera' })
      }

      // Technical Data
      if (data.ImageWidth || data.ExifImageWidth) {
        const width = data.ImageWidth || data.ExifImageWidth
        parsed.technical.push({
          label: 'Width',
          value: `${width}px`,
          category: 'technical',
        })
      }
      if (data.ImageHeight || data.ExifImageHeight) {
        const height = data.ImageHeight || data.ExifImageHeight
        parsed.technical.push({
          label: 'Height',
          value: `${height}px`,
          category: 'technical',
        })
      }
      if (data.ColorSpace) {
        parsed.technical.push({
          label: 'Color Space',
          value: String(data.ColorSpace),
          category: 'technical',
        })
      }
      if (data.XResolution && data.YResolution) {
        parsed.technical.push({
          label: 'Resolution',
          value: `${data.XResolution} x ${data.YResolution} dpi`,
          category: 'technical',
        })
      }

      setMetadata(parsed)
      trackToolEvent('image_metadata_parse', {
        has_gps: parsed.gps.length > 0,
        has_camera: parsed.camera.length > 0,
      })
    } catch (error) {
      console.error('Error parsing metadata:', error)
      toast.error('Failed to parse image metadata')
      setMetadata(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Image file is too large (max 50MB)')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Parse metadata
    parseMetadata(file)
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

  const handleClear = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setMetadata(null)
    trackToolEvent('image_metadata_clear', {})
  }

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard')
    trackToolEvent('image_metadata_copy', {})
  }

  const handleDownloadJSON = () => {
    if (!metadata) return

    const json = JSON.stringify(metadata.raw, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedImage?.name || 'image'}_metadata.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Metadata downloaded as JSON')
    trackToolEvent('image_metadata_download', {})
  }

  const renderMetadataSection = (
    title: string,
    icon: React.ReactNode,
    entries: MetadataEntry[],
    gradient: string
  ) => {
    if (entries.length === 0) return null

    return (
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'gray.700/50',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            {icon}
            <CardTitle className={css({ fontSize: 'lg' })}>{title}</CardTitle>
            <Badge
              className={css({
                bg: `${gradient}/20`,
                color: `${gradient}`,
                border: '1px solid',
                borderColor: `${gradient}/30`,
              })}
            >
              {entries.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className={css({ display: 'grid', gap: '3' })}>
            {entries.map((entry, index) => (
              <div
                key={`${entry.label}-${index}`}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700/50',
                  bg: 'gray.800/30',
                  p: '3',
                  gap: '3',
                })}
              >
                <div className={css({ flex: '1', minW: '0' })}>
                  <p className={css({ fontSize: 'xs', color: 'white', mb: '1' })}>{entry.label}</p>
                  {entry.label === 'Google Maps' ? (
                    <a
                      href={entry.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={css({
                        fontSize: 'sm',
                        color: 'blue.400',
                        textDecoration: 'underline',
                        _hover: { color: 'blue.300' },
                      })}
                    >
                      View on Google Maps
                    </a>
                  ) : (
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.200',
                        fontFamily: 'mono',
                        wordBreak: 'break-all',
                      })}
                    >
                      {entry.value}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleCopy(entry.value)}
                  size="sm"
                  className={css({
                    flexShrink: '0',
                    p: '2',
                    h: 'auto',
                    bg: 'transparent',
                    color: 'white',
                    _hover: { bg: 'gray.700', color: 'blue.400' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
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
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Camera className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            EXIF • GPS • Camera Settings
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
          Image Metadata Viewer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Extract EXIF data, GPS location, camera settings, and technical metadata from your photos.
          Perfect for photographers and image professionals.
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
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image to view its metadata (JPEG, PNG, HEIC, TIFF, etc.)
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
                  borderColor: isDragOver ? 'blue.500' : 'gray.700',
                  bg: isDragOver ? 'blue.500/10' : 'gray.900/30',
                  transition: 'all 0.3s',
                  _hover: { borderColor: 'blue.500/50', bg: 'gray.900/50' },
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
                      bg: isDragOver ? 'blue.500' : 'gray.800',
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
                    JPEG, PNG, HEIC, TIFF, or any image format • Max 50MB
                  </p>

                  {isDragOver && (
                    <p
                      className={css({
                        mt: '4',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'blue.400',
                      })}
                    >
                      Drop image here
                    </p>
                  )}
                </label>
              </div>
            ) : (
              <div className={css({ display: 'grid', gap: '4', md: { gridTemplateColumns: '2' } })}>
                <div
                  className={css({
                    position: 'relative',
                    rounded: 'lg',
                    overflow: 'hidden',
                    bg: 'gray.800',
                  })}
                >
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={css({ w: 'full', h: 'auto', display: 'block' })}
                    />
                  )}
                </div>
                <div className={css({ spaceY: '3' })}>
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
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '4',
                    })}
                  >
                    <p className={css({ fontSize: 'xs', color: 'white', mb: '1' })}>File Size</p>
                    <p className={css({ fontSize: 'sm', color: 'gray.200', fontFamily: 'mono' })}>
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      onClick={handleClear}
                      className={css({
                        flex: '1',
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'gray.700' },
                      })}
                    >
                      <X className={css({ h: '4', w: '4' })} />
                      Clear
                    </Button>
                    {metadata && (
                      <Button
                        onClick={handleDownloadJSON}
                        className={css({
                          flex: '1',
                          gap: '2',
                          bg: 'blue.500/20',
                          color: 'blue.300',
                          _hover: { bg: 'blue.500/30' },
                        })}
                      >
                        <Download className={css({ h: '4', w: '4' })} />
                        Download JSON
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={css({ textAlign: 'center', py: '8' })}
        >
          <div
            className={css({
              display: 'inline-block',
              rounded: 'full',
              border: '4px solid',
              borderColor: 'gray.700',
              borderTopColor: 'blue.500',
              h: '12',
              w: '12',
              animation: 'spin 1s linear infinite',
            })}
          />
          <p className={css({ mt: '4', color: 'white' })}>Parsing metadata...</p>
        </motion.div>
      )}

      {/* Metadata Sections */}
      {metadata && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({
            display: 'grid',
            gap: { base: '6', md: '6' },
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
          })}
        >
          {renderMetadataSection(
            'EXIF Data',
            <Info className={css({ h: '5', w: '5', color: 'blue.400' })} />,
            metadata.exif,
            'blue.500'
          )}
          {renderMetadataSection(
            'GPS Location',
            <MapPin className={css({ h: '5', w: '5', color: 'green.400' })} />,
            metadata.gps,
            'green.500'
          )}
          {renderMetadataSection(
            'Camera Settings',
            <Camera className={css({ h: '5', w: '5', color: 'purple.400' })} />,
            metadata.camera,
            'purple.500'
          )}
          {renderMetadataSection(
            'Technical Details',
            <Settings className={css({ h: '5', w: '5', color: 'orange.400' })} />,
            metadata.technical,
            'orange.500'
          )}
        </motion.div>
      )}

      {/* No Metadata Message */}
      {metadata &&
        !loading &&
        metadata.exif.length === 0 &&
        metadata.gps.length === 0 &&
        metadata.camera.length === 0 &&
        metadata.technical.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'yellow.500/20',
                bg: 'yellow.500/5',
              })}
            >
              <CardContent
                withTopPadding
                className={css({ pt: '8', pb: '8', textAlign: 'center' })}
              >
                <ImageIcon
                  className={css({ h: '12', w: '12', mx: 'auto', mb: '4', color: 'yellow.400' })}
                />
                <h3
                  className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'yellow.300' })}
                >
                  No Metadata Found
                </h3>
                <p className={css({ mt: '2', color: 'white' })}>
                  This image doesn't contain any EXIF metadata, or it has been stripped during
                  processing.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  About Image Metadata
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                  <li>
                    • <strong>EXIF data</strong> includes camera make, model, date taken, and
                    software used
                  </li>
                  <li>
                    • <strong>GPS location</strong> shows where the photo was taken (if available)
                  </li>
                  <li>
                    • <strong>Camera settings</strong> reveal aperture, shutter speed, ISO, and
                    focal length
                  </li>
                  <li>
                    • <strong>Technical details</strong> include image dimensions, color space, and
                    resolution
                  </li>
                  <li>
                    • All processing happens locally in your browser - your images never leave your
                    device
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function ImageMetadataPage() {
  return <ImageMetadataContent />
}
