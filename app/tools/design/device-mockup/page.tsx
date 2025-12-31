'use client'

import { Download, Monitor, RotateCw, Smartphone, Tablet, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { DEVICE_FRAMES, type DeviceFrame, getDevicesByCategory } from './device-frames'

type BackgroundType = 'solid' | 'gradient' | 'none'

interface BackgroundConfig {
  type: BackgroundType
  solidColor: string
  gradientStart: string
  gradientEnd: string
  gradientAngle: number
}

export default function DeviceMockupPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<DeviceFrame | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | DeviceFrame['category']>('all')
  const [isLandscape, setIsLandscape] = useState(false)
  const [background, setBackground] = useState<BackgroundConfig>({
    type: 'gradient',
    solidColor: '#6366f1',
    gradientStart: '#6366f1',
    gradientEnd: '#ec4899',
    gradientAngle: 135,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track page view
  useEffect(() => {
    trackToolEvent('mockup_generator_open')
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      toast.success('Image uploaded successfully!')
      trackToolEvent('mockup_image_upload')
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle device selection
  const handleDeviceSelect = (device: DeviceFrame) => {
    setSelectedDevice(device)
    setIsLandscape(false)
    trackToolEvent('mockup_device_select', { device: device.id })
  }

  // Toggle orientation
  const toggleOrientation = () => {
    setIsLandscape((prev) => !prev)
    trackToolEvent('mockup_orientation_toggle', { isLandscape: !isLandscape })
  }

  // Generate mockup on canvas
  const generateMockup = useCallback(async () => {
    if (!uploadedImage || !selectedDevice || !canvasRef.current) return

    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const device = selectedDevice
      const actualScreenWidth = isLandscape ? device.screenHeight : device.screenWidth
      const actualScreenHeight = isLandscape ? device.screenWidth : device.screenHeight
      const actualFrameWidth = isLandscape ? device.frameHeight : device.frameWidth
      const actualFrameHeight = isLandscape ? device.frameWidth : device.frameHeight

      // Set canvas size with padding for background
      const padding = 100
      canvas.width = actualFrameWidth + padding * 2
      canvas.height = actualFrameHeight + padding * 2

      // Draw background
      if (background.type === 'solid') {
        ctx.fillStyle = background.solidColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (background.type === 'gradient') {
        const angle = (background.gradientAngle * Math.PI) / 180
        const x1 = canvas.width / 2 - (Math.cos(angle) * canvas.width) / 2
        const y1 = canvas.height / 2 - (Math.sin(angle) * canvas.height) / 2
        const x2 = canvas.width / 2 + (Math.cos(angle) * canvas.width) / 2
        const y2 = canvas.height / 2 + (Math.sin(angle) * canvas.height) / 2

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, background.gradientStart)
        gradient.addColorStop(1, background.gradientEnd)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Calculate frame position (centered)
      const frameX = padding
      const frameY = padding

      // Draw device shadow
      ctx.shadowColor = device.shadowColor
      ctx.shadowBlur = 40
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 20

      // Draw device frame
      ctx.fillStyle = device.frameColor
      ctx.beginPath()
      ctx.roundRect(frameX, frameY, actualFrameWidth, actualFrameHeight, device.borderRadius)
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw notch if exists (for iPhones/MacBooks)
      if (device.notchHeight && !isLandscape) {
        ctx.fillStyle = '#000000'
        const notchWidth = actualScreenWidth * 0.3
        const notchX = frameX + device.screenX + (actualScreenWidth - notchWidth) / 2
        const notchY = frameY + device.screenY
        ctx.beginPath()
        ctx.roundRect(notchX, notchY, notchWidth, device.notchHeight, device.notchHeight / 2)
        ctx.fill()
      }

      // Draw camera (for phones)
      if (device.cameraRadius && !isLandscape) {
        ctx.fillStyle = '#1a1a1a'
        const cameraX = frameX + actualFrameWidth / 2
        const cameraY = frameY + 10
        ctx.beginPath()
        ctx.arc(cameraX, cameraY, device.cameraRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Load and draw screenshot
      const img = new Image()
      img.onload = () => {
        const screenX = frameX + device.screenX
        const screenY = frameY + device.screenY

        // Save context state
        ctx.save()

        // Clip to screen area with border radius
        ctx.beginPath()
        ctx.roundRect(
          screenX,
          screenY,
          actualScreenWidth,
          actualScreenHeight,
          device.borderRadius - 5
        )
        ctx.clip()

        // Calculate scaling to fit/cover the screen
        const scaleX = actualScreenWidth / img.width
        const scaleY = actualScreenHeight / img.height
        const scale = Math.max(scaleX, scaleY)

        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale

        // Center the image
        const offsetX = screenX + (actualScreenWidth - scaledWidth) / 2
        const offsetY = screenY + (actualScreenHeight - scaledHeight) / 2

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

        // Restore context state
        ctx.restore()

        setIsGenerating(false)
        trackToolEvent('mockup_generate_success', { device: device.id })
        toast.success('Mockup generated successfully!')
      }

      img.onerror = () => {
        setIsGenerating(false)
        toast.error('Failed to load image')
      }

      img.src = uploadedImage
    } catch (error) {
      console.error('Error generating mockup:', error)
      setIsGenerating(false)
      toast.error('Failed to generate mockup')
    }
  }, [uploadedImage, selectedDevice, isLandscape, background])

  // Auto-generate when all inputs are ready
  useEffect(() => {
    if (uploadedImage && selectedDevice) {
      generateMockup()
    }
  }, [uploadedImage, selectedDevice, generateMockup])

  // Export mockup
  const handleExport = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mockup-${selectedDevice?.id}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)

      trackToolEvent('mockup_export', { device: selectedDevice?.id || 'unknown' })
      toast.success('Mockup exported successfully!')
    }, 'image/png')
  }

  // Filter devices by category
  const filteredDevices =
    selectedCategory === 'all' ? DEVICE_FRAMES : getDevicesByCategory(selectedCategory)

  const categories: Array<{
    id: 'all' | DeviceFrame['category']
    label: string
    icon: React.ElementType
  }> = [
    { id: 'all', label: 'All Devices', icon: Monitor },
    { id: 'phone', label: 'Phones', icon: Smartphone },
    { id: 'tablet', label: 'Tablets', icon: Tablet },
    { id: 'laptop', label: 'Laptops', icon: Monitor },
    { id: 'desktop', label: 'Desktops', icon: Monitor },
  ]

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
      <div className={css({ textAlign: 'center' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            mb: '3',
            px: '3',
            py: '1.5',
            bg: 'blue.500/10',
            rounded: 'full',
          })}
        >
          <Monitor className={css({ w: '4', h: '4', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'blue.400' })}>
            Device Mockup Generator
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
            mb: '3',
          })}
        >
          Create Professional Device Mockups
        </h1>

        <p
          className={css({
            fontSize: { base: 'sm', sm: 'base', md: 'lg' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Upload your screenshot and showcase it in realistic device frames. Perfect for
          presentations, portfolios, and app store previews.
        </p>
      </div>

      {/* Upload Section */}
      {!uploadedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Screenshot</CardTitle>
            <CardDescription>Upload your app or website screenshot to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: '12',
                border: '2px dashed',
                borderColor: 'gray.700',
                rounded: 'lg',
                bg: 'gray.900/50',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'blue.500',
                  bg: 'blue.500/5',
                },
              })}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click()
                }
              }}
              role="button"
              tabIndex={0}
            >
              <Upload className={css({ w: '12', h: '12', color: 'gray.500', mb: '4' })} />
              <p className={css({ fontSize: 'lg', fontWeight: 'medium', mb: '2' })}>
                Click to upload or drag and drop
              </p>
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                PNG, JPG, WebP (Max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className={css({ display: 'none' })}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Editor */}
      {uploadedImage && (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: '1fr 400px' },
            gap: '6',
            alignItems: 'start',
          })}
        >
          {/* Preview Canvas */}
          <Card>
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    {selectedDevice ? selectedDevice.name : 'Select a device frame'}
                  </CardDescription>
                </div>
                <div className={css({ display: 'flex', gap: '2' })}>
                  {selectedDevice && (
                    <Button onClick={toggleOrientation} variant="outline" size="sm">
                      <RotateCw className={css({ w: '4', h: '4', mr: '2' })} />
                      Rotate
                    </Button>
                  )}
                  <Button onClick={handleExport} disabled={!selectedDevice || isGenerating}>
                    <Download className={css({ w: '4', h: '4', mr: '2' })} />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minH: '400px',
                  bg: 'gray.900',
                  rounded: 'lg',
                  overflow: 'auto',
                  p: '4',
                })}
              >
                {selectedDevice ? (
                  <canvas
                    ref={canvasRef}
                    className={css({
                      maxW: 'full',
                      maxH: '600px',
                      h: 'auto',
                    })}
                  />
                ) : (
                  <p className={css({ color: 'gray.500', textAlign: 'center' })}>
                    Select a device frame to preview your mockup
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls Sidebar */}
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
            {/* Device Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Device Frame</CardTitle>
                <CardDescription>Choose a device to showcase your screenshot</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className={css({ display: 'flex', gap: '2', mb: '4', flexWrap: 'wrap' })}>
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5',
                          px: '3',
                          py: '1.5',
                          rounded: 'md',
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          border: '1px solid',
                          borderColor: selectedCategory === cat.id ? 'blue.500' : 'gray.700',
                          bg: selectedCategory === cat.id ? 'blue.500/10' : 'transparent',
                          color: selectedCategory === cat.id ? 'blue.400' : 'gray.400',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          _hover: {
                            borderColor: 'blue.500',
                            bg: 'blue.500/5',
                          },
                        })}
                      >
                        <Icon className={css({ w: '4', h: '4' })} />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>

                {/* Device List */}
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2',
                    maxH: '400px',
                    overflow: 'auto',
                  })}
                >
                  {filteredDevices.map((device) => (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => handleDeviceSelect(device)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: selectedDevice?.id === device.id ? 'blue.500' : 'gray.800',
                        bg: selectedDevice?.id === device.id ? 'blue.500/10' : 'gray.900',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'blue.500',
                          bg: 'blue.500/5',
                        },
                      })}
                    >
                      <div className={css({ textAlign: 'left' })}>
                        <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                          {device.name}
                        </p>
                        <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          {device.screenWidth} × {device.screenHeight}
                        </p>
                      </div>
                      {device.popular && (
                        <span
                          className={css({
                            px: '2',
                            py: '0.5',
                            rounded: 'full',
                            fontSize: 'xs',
                            fontWeight: 'medium',
                            bg: 'purple.500/20',
                            color: 'purple.400',
                          })}
                        >
                          Popular
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Background Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Background</CardTitle>
                <CardDescription>Customize the background appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                  {/* Background Type */}
                  <div>
                    <div
                      className={css({
                        display: 'block',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        mb: '2',
                      })}
                    >
                      Type
                    </div>
                    <div className={css({ display: 'flex', gap: '2' })}>
                      {(['none', 'solid', 'gradient'] as BackgroundType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBackground((prev) => ({ ...prev, type }))}
                          className={css({
                            flex: 1,
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            border: '1px solid',
                            borderColor: background.type === type ? 'blue.500' : 'gray.700',
                            bg: background.type === type ? 'blue.500/10' : 'transparent',
                            color: background.type === type ? 'blue.400' : 'gray.400',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s',
                            _hover: {
                              borderColor: 'blue.500',
                            },
                          })}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solid Color */}
                  {background.type === 'solid' && (
                    <div>
                      <label
                        htmlFor="solid-color"
                        className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          mb: '2',
                        })}
                      >
                        Color
                      </label>
                      <div className={css({ display: 'flex', gap: '2' })}>
                        <input
                          id="solid-color"
                          type="color"
                          value={background.solidColor}
                          onChange={(e) =>
                            setBackground((prev) => ({ ...prev, solidColor: e.target.value }))
                          }
                          className={css({ w: '12', h: '10', rounded: 'md', cursor: 'pointer' })}
                        />
                        <Input
                          type="text"
                          value={background.solidColor}
                          onChange={(e) =>
                            setBackground((prev) => ({ ...prev, solidColor: e.target.value }))
                          }
                          className={css({ flex: 1 })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Gradient Colors */}
                  {background.type === 'gradient' && (
                    <>
                      <div>
                        <label
                          htmlFor="gradient-start"
                          className={css({
                            display: 'block',
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            mb: '2',
                          })}
                        >
                          Gradient Start
                        </label>
                        <div className={css({ display: 'flex', gap: '2' })}>
                          <input
                            id="gradient-start"
                            type="color"
                            value={background.gradientStart}
                            onChange={(e) =>
                              setBackground((prev) => ({ ...prev, gradientStart: e.target.value }))
                            }
                            className={css({ w: '12', h: '10', rounded: 'md', cursor: 'pointer' })}
                          />
                          <Input
                            type="text"
                            value={background.gradientStart}
                            onChange={(e) =>
                              setBackground((prev) => ({ ...prev, gradientStart: e.target.value }))
                            }
                            className={css({ flex: 1 })}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="gradient-end"
                          className={css({
                            display: 'block',
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            mb: '2',
                          })}
                        >
                          Gradient End
                        </label>
                        <div className={css({ display: 'flex', gap: '2' })}>
                          <input
                            id="gradient-end"
                            type="color"
                            value={background.gradientEnd}
                            onChange={(e) =>
                              setBackground((prev) => ({ ...prev, gradientEnd: e.target.value }))
                            }
                            className={css({ w: '12', h: '10', rounded: 'md', cursor: 'pointer' })}
                          />
                          <Input
                            type="text"
                            value={background.gradientEnd}
                            onChange={(e) =>
                              setBackground((prev) => ({ ...prev, gradientEnd: e.target.value }))
                            }
                            className={css({ flex: 1 })}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="gradient-angle"
                          className={css({
                            display: 'block',
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            mb: '2',
                          })}
                        >
                          Angle: {background.gradientAngle}°
                        </label>
                        <input
                          id="gradient-angle"
                          type="range"
                          min="0"
                          max="360"
                          value={background.gradientAngle}
                          onChange={(e) =>
                            setBackground((prev) => ({
                              ...prev,
                              gradientAngle: Number(e.target.value),
                            }))
                          }
                          className={css({ w: 'full' })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Change Image */}
            <Button
              onClick={() => {
                setUploadedImage(null)
                setSelectedDevice(null)
              }}
              variant="outline"
              className={css({ w: 'full' })}
            >
              <Upload className={css({ w: '4', h: '4', mr: '2' })} />
              Change Image
            </Button>
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'blue.400' })}>
                Best Practices
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Use high-resolution screenshots (1080p or higher) for the best results. Make sure
                your screenshot matches the device aspect ratio for perfect fit.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'blue.400' })}>
                Gradient Backgrounds
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Create eye-catching mockups with gradient backgrounds. Experiment with different
                angles and colors to match your brand.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'blue.400' })}>
                Export Quality
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Mockups are exported in high-resolution PNG format, perfect for presentations,
                portfolios, and app store screenshots.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
