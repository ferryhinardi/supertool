'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Maximize,
  Eye,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

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

      // Using ScreenshotOne API (Free tier available)
      // You can replace this with any screenshot service API
      // Alternative services: ApiFlash, ScreenshotAPI, URLBox, etc.

      // For demo purposes, we'll use a screenshot API that doesn't require authentication
      // In production, you should use your own API key
      const screenshotApiUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(normalizedUrl)}&viewport_width=${device.width}&viewport_height=${device.height}&device_scale_factor=2&format=png&block_ads=true&block_cookie_banners=true&block_trackers=true&cache=false${captureMode === 'fullpage' ? '&full_page=true' : ''}`

      // Note: In production, you should make this request through your own API endpoint
      // to keep your API key secure. For now, we'll use the public endpoint
      const response = await fetch(screenshotApiUrl)

      if (!response.ok) {
        throw new Error(`Screenshot service returned ${response.status}`)
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
    <div
      className="space-y-8"
      style={{
        margin: '0 auto',
        maxWidth: '1400px',
        width: '100%',
        padding: '2rem 1rem',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2">
          <Smartphone className="h-5 w-5 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">Website Screenshot Tool</span>
        </div>

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Website Screenshot Capture
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
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
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the URL of the website you want to capture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="flex gap-2">
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
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={captureScreenshot}
                disabled={isLoading || !url.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Capture
                  </>
                )}
              </Button>
            </div>

            {/* Device Size Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Device Size</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(Object.keys(DEVICE_SIZES) as DeviceSize[]).map((size) => {
                  const device = DEVICE_SIZES[size]
                  const Icon = device.icon
                  const isSelected = deviceSize === size

                  return (
                    <Button
                      key={size}
                      onClick={() => setDeviceSize(size)}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-auto flex-col gap-2 p-4 ${
                        isSelected
                          ? 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30'
                          : 'border-gray-700 hover:border-purple-500/30'
                      }`}
                      disabled={isLoading}
                    >
                      <Icon
                        className={`h-6 w-6 ${isSelected ? 'text-purple-300' : 'text-gray-400'}`}
                      />
                      <div className="text-center">
                        <div
                          className={`text-sm font-semibold ${isSelected ? 'text-purple-200' : 'text-gray-300'}`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </div>
                        <div
                          className={`text-xs ${isSelected ? 'text-purple-400' : 'text-gray-500'}`}
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
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Capture Mode</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => setCaptureMode('viewport')}
                  variant={captureMode === 'viewport' ? 'default' : 'outline'}
                  className={`h-auto flex-col gap-2 p-4 ${
                    captureMode === 'viewport'
                      ? 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30'
                      : 'border-gray-700 hover:border-purple-500/30'
                  }`}
                  disabled={isLoading}
                >
                  <Eye
                    className={`h-6 w-6 ${captureMode === 'viewport' ? 'text-purple-300' : 'text-gray-400'}`}
                  />
                  <div className="text-center">
                    <div
                      className={`text-sm font-semibold ${captureMode === 'viewport' ? 'text-purple-200' : 'text-gray-300'}`}
                    >
                      Viewport Only
                    </div>
                    <div
                      className={`text-xs ${captureMode === 'viewport' ? 'text-purple-400' : 'text-gray-500'}`}
                    >
                      Capture visible area
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCaptureMode('fullpage')}
                  variant={captureMode === 'fullpage' ? 'default' : 'outline'}
                  className={`h-auto flex-col gap-2 p-4 ${
                    captureMode === 'fullpage'
                      ? 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30'
                      : 'border-gray-700 hover:border-purple-500/30'
                  }`}
                  disabled={isLoading}
                >
                  <Maximize
                    className={`h-6 w-6 ${captureMode === 'fullpage' ? 'text-purple-300' : 'text-gray-400'}`}
                  />
                  <div className="text-center">
                    <div
                      className={`text-sm font-semibold ${captureMode === 'fullpage' ? 'text-purple-200' : 'text-gray-300'}`}
                    >
                      Full Page
                    </div>
                    <div
                      className={`text-xs ${captureMode === 'fullpage' ? 'text-purple-400' : 'text-gray-500'}`}
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
          <Card className="border-red-500/20 bg-red-500/10">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
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
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Screenshot Preview</CardTitle>
                <CardDescription>
                  {DEVICE_SIZES[deviceSize].label} -{' '}
                  {captureMode === 'fullpage' ? 'Full Page' : 'Viewport'}
                </CardDescription>
              </div>
              <Button onClick={downloadScreenshot} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border border-gray-700 bg-gray-800 p-4">
                <img
                  src={screenshotUrl}
                  alt="Website screenshot"
                  className="mx-auto max-w-full rounded shadow-xl"
                  style={{ maxHeight: '600px' }}
                />
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
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
        ].map((feature, i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/30">
            <CardContent className="p-6">
              <feature.icon className="mb-3 h-8 w-8 text-purple-400" />
              <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
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
        <Card className="border-blue-500/20 bg-blue-500/10">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-blue-300">Privacy & Performance</p>
              <p className="text-blue-400">
                Screenshots are processed through a third-party API service. No screenshots are
                stored on our servers. The captured images are temporarily downloaded to your
                browser and can be saved locally.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
