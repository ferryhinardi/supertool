'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Image as ImageIcon,
  Loader2,
  Maximize,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { css } from '@/styled-system/css'

type DeviceSize = 'mobile' | 'tablet' | 'desktop'
type CaptureMode = 'viewport' | 'fullpage'

interface DeviceConfig {
  width: number
  height: number
  label: string
  icon: React.ElementType
}

const DEVICE_SIZES: Record<DeviceSize, DeviceConfig> = {
  mobile: { width: 375, height: 667, label: 'Mobile (375x667)', icon: Smartphone },
  tablet: { width: 768, height: 1024, label: 'Tablet (768x1024)', icon: Tablet },
  desktop: { width: 1920, height: 1080, label: 'Desktop (1920x1080)', icon: Monitor },
}

export default function WebsiteScreenshotPage() {
  const [url, setUrl] = useState('')
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop')
  const [captureMode, setCaptureMode] = useState<CaptureMode>('viewport')
  const [isLoading, setIsLoading] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (input: string): boolean => {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const normalizeUrl = (input: string): string => {
    return input.startsWith('http') ? input : `https://${input}`
  }

  const captureScreenshot = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    if (!validateUrl(url)) {
      toast.error('Please enter a valid URL (e.g., example.com or https://example.com)')
      return
    }

    setIsLoading(true)
    setError(null)
    setScreenshotUrl(null)

    try {
      const normalizedUrl = normalizeUrl(url)
      const device = DEVICE_SIZES[deviceSize]

      // Call our server-side API endpoint that securely handles the screenshot capture
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          width: device.width,
          height: device.height,
          fullPage: captureMode === 'fullpage',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Screenshot service returned ${response.status}`)
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)

      setScreenshotUrl(imageUrl)
      toast.success('Screenshot captured successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture screenshot'
      setError(errorMessage)
      toast.error('Failed to capture screenshot. Please check the URL and try again.')
      console.error('Screenshot error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadScreenshot = async () => {
    if (!screenshotUrl) return

    try {
      const response = await fetch(screenshotUrl)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `screenshot-${deviceSize}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(downloadUrl)
      toast.success('Screenshot downloaded!')
    } catch (err) {
      toast.error('Failed to download screenshot')
      console.error('Download error:', err)
    }
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
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'purple.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Smartphone className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            Website Screenshot Tool
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'blue.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Website Screenshot Capture
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'base', sm: 'lg' },
            color: 'gray.400',
          })}
        >
          Capture high-resolution screenshots of any website. Choose device size, full-page or
          viewport capture, and download instantly.
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the URL of the website you want to capture</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* URL Input */}
            <div className={css({ display: 'flex', gap: '2' })}>
              <Input
                type="text"
                placeholder="example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    captureScreenshot()
                  }
                }}
                className={css({ flex: '1' })}
                disabled={isLoading}
              />
              <Button
                onClick={captureScreenshot}
                disabled={isLoading || !url.trim()}
                className={css({ gap: '2' })}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={css({ h: '4', w: '4', animation: 'spin' })} />
                    Capturing...
                  </>
                ) : (
                  <>
                    <ImageIcon className={css({ h: '4', w: '4' })} />
                    Capture
                  </>
                )}
              </Button>
            </div>

            {/* Device Size Selection */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                Device Size
              </div>
              <div
                className={css({
                  display: 'grid',
                  gap: '4',
                  w: 'full',
                  gridTemplateColumns: {
                    base: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                })}
              >
                {(Object.keys(DEVICE_SIZES) as DeviceSize[]).map((size) => {
                  const device = DEVICE_SIZES[size]
                  const Icon = device.icon
                  const isSelected = deviceSize === size

                  return (
                    <Button
                      key={size}
                      onClick={() => setDeviceSize(size)}
                      variant={isSelected ? 'default' : 'outline'}
                      className={css({
                        h: 'auto',
                        flexDirection: 'column',
                        gap: '2',
                        p: '4',
                        border: '1px solid',
                        borderColor: isSelected ? 'purple.500/50' : 'gray.700',
                        bg: isSelected ? 'purple.500/20' : 'transparent',
                        _hover: {
                          borderColor: isSelected ? 'purple.500/50' : 'purple.500/30',
                        },
                      })}
                      disabled={isLoading}
                    >
                      <Icon
                        className={css({
                          h: '6',
                          w: '6',
                          color: isSelected ? 'purple.300' : 'gray.400',
                        })}
                      />
                      <div className={css({ textAlign: 'center' })}>
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: isSelected ? 'purple.200' : 'gray.300',
                          })}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </div>
                        <div
                          className={css({
                            fontSize: 'xs',
                            color: isSelected ? 'purple.400' : 'gray.500',
                          })}
                        >
                          {device.width}x{device.height}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Capture Mode Selection */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                Capture Mode
              </div>
              <div
                className={css({
                  display: 'grid',
                  w: 'full',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                <Button
                  onClick={() => setCaptureMode('viewport')}
                  variant={captureMode === 'viewport' ? 'default' : 'outline'}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    p: '4',
                    border: '1px solid',
                    borderColor: captureMode === 'viewport' ? 'purple.500/50' : 'gray.700',
                    bg: captureMode === 'viewport' ? 'purple.500/20' : 'transparent',
                    _hover: {
                      borderColor: captureMode === 'viewport' ? 'purple.500/50' : 'purple.500/30',
                    },
                  })}
                  disabled={isLoading}
                >
                  <Eye
                    className={css({
                      h: '6',
                      w: '6',
                      color: captureMode === 'viewport' ? 'purple.300' : 'gray.400',
                    })}
                  />
                  <div className={css({ textAlign: 'center' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: captureMode === 'viewport' ? 'purple.200' : 'gray.300',
                      })}
                    >
                      Viewport Only
                    </div>
                    <div
                      className={css({
                        fontSize: 'xs',
                        color: captureMode === 'viewport' ? 'purple.400' : 'gray.500',
                      })}
                    >
                      Capture visible area
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCaptureMode('fullpage')}
                  variant={captureMode === 'fullpage' ? 'default' : 'outline'}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    p: '4',
                    border: '1px solid',
                    borderColor: captureMode === 'fullpage' ? 'purple.500/50' : 'gray.700',
                    bg: captureMode === 'fullpage' ? 'purple.500/20' : 'transparent',
                    _hover: {
                      borderColor: captureMode === 'fullpage' ? 'purple.500/50' : 'purple.500/30',
                    },
                  })}
                  disabled={isLoading}
                >
                  <Maximize
                    className={css({
                      h: '6',
                      w: '6',
                      color: captureMode === 'fullpage' ? 'purple.300' : 'gray.400',
                    })}
                  />
                  <div className={css({ textAlign: 'center' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: captureMode === 'fullpage' ? 'purple.200' : 'gray.300',
                      })}
                    >
                      Full Page
                    </div>
                    <div
                      className={css({
                        fontSize: 'xs',
                        color: captureMode === 'fullpage' ? 'purple.400' : 'gray.500',
                      })}
                    >
                      Capture entire page
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'red.500/20',
              bg: 'red.500/10',
            })}
          >
            <CardContent
              withTopPadding
              className={css({ display: 'flex', alignItems: 'center', gap: '3', p: '4' })}
            >
              <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
              <p className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Screenshot Preview */}
      {screenshotUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
            })}
          >
            <CardHeader
              className={css({
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <div>
                <CardTitle>Screenshot Preview</CardTitle>
                <CardDescription>
                  {DEVICE_SIZES[deviceSize].label} -{' '}
                  {captureMode === 'fullpage' ? 'Full Page' : 'Viewport'}
                </CardDescription>
              </div>
              <Button onClick={downloadScreenshot} className={css({ gap: '2' })}>
                <Download className={css({ h: '4', w: '4' })} />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  overflow: 'auto',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800',
                  p: '4',
                })}
              >
                <div
                  className={css({ position: 'relative', mx: 'auto' })}
                  style={{ maxHeight: '600px', maxWidth: '100%' }}
                >
                  <Image
                    src={screenshotUrl}
                    alt="Website screenshot"
                    width={DEVICE_SIZES[deviceSize].width}
                    height={DEVICE_SIZES[deviceSize].height}
                    className={css({ mx: 'auto', rounded: 'md', shadow: 'xl' })}
                    style={{ maxHeight: '600px', width: 'auto', height: 'auto' }}
                    unoptimized
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={css({
          display: 'grid',
          w: 'full',
          gap: '4',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        })}
      >
        {[
          {
            icon: Smartphone,
            title: 'Multiple Devices',
            desc: 'Mobile, tablet, and desktop sizes',
          },
          {
            icon: Maximize,
            title: 'Full Page Capture',
            desc: 'Capture entire scrollable page',
          },
          {
            icon: ImageIcon,
            title: 'High Resolution',
            desc: '2x pixel density for sharp images',
          },
          {
            icon: Download,
            title: 'Instant Download',
            desc: 'Download as PNG immediately',
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/30',
            })}
          >
            <CardContent withTopPadding className={css({ p: '6' })}>
              <feature.icon className={css({ mb: '3', h: '8', w: '8', color: 'purple.400' })} />
              <h3 className={css({ mb: '2', fontWeight: 'semibold', color: 'gray.200' })}>
                {feature.title}
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/10',
          })}
        >
          <CardContent
            withTopPadding
            className={css({ display: 'flex', alignItems: 'start', gap: '3', p: '4' })}
          >
            <CheckCircle
              className={css({ mt: '0.5', h: '5', w: '5', flexShrink: '0', color: 'blue.400' })}
            />
            <div className={css({ spaceY: '1', fontSize: 'sm' })}>
              <p className={css({ fontWeight: 'semibold', color: 'blue.300' })}>
                Privacy & Performance
              </p>
              <p className={css({ color: 'blue.400' })}>
                Screenshots are processed through a third-party API service. No screenshots are
                stored on our servers. The captured images are temporarily downloaded to your
                browser and can be saved locally.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
