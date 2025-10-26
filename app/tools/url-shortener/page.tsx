'use client'

import { useState, useEffect, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Link as LinkIcon,
  Copy,
  Download,
  QrCode,
  BarChart3,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Trash2,
} from 'lucide-react'

interface ShortenedUrl {
  id: string
  shortCode: string
  originalUrl: string
  shortUrl: string
  createdAt: string
  clicks: number
  analytics?: {
    totalClicks: number
    uniqueVisitors: number
    lastClicked?: string
  }
}

export default function URLShortenerPage() {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [selectedUrl, setSelectedUrl] = useState<ShortenedUrl | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)

  // Load shortened URLs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('shortenedUrls')
    if (stored) {
      try {
        setShortenedUrls(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to load shortened URLs:', error)
      }
    }
  }, [])

  // Save to localStorage whenever shortenedUrls changes
  useEffect(() => {
    if (shortenedUrls.length > 0) {
      localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls))
    }
  }, [shortenedUrls])

  // Validate URL
  const isValidUrl = useMemo(() => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }, [url])

  const handleShorten = async () => {
    if (!isValidUrl) {
      toast.error('Please enter a valid URL')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          customAlias: customAlias || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL')
      }

      const newUrl: ShortenedUrl = {
        id: data.id,
        shortCode: data.shortCode,
        originalUrl: url,
        shortUrl: data.shortUrl,
        createdAt: new Date().toISOString(),
        clicks: 0,
      }

      setShortenedUrls((prev) => [newUrl, ...prev])
      setSelectedUrl(newUrl)
      setUrl('')
      setCustomAlias('')
      toast.success('URL shortened successfully! 🎉')
    } catch (error) {
      console.error('Error shortening URL:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to shorten URL')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard! 📋`)
  }

  const handleDownloadQR = (shortUrl: string, shortCode: string) => {
    const svg = document.getElementById(`qr-${shortCode}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${shortCode}.png`
      downloadLink.href = pngFile
      downloadLink.click()

      toast.success('QR code downloaded! 📥')
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handleDelete = (id: string) => {
    setShortenedUrls((prev) => prev.filter((u) => u.id !== id))
    if (selectedUrl?.id === id) {
      setSelectedUrl(null)
    }
    toast.success('URL deleted successfully')
  }

  const stats = useMemo(() => {
    const total = shortenedUrls.length
    const totalClicks = shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)
    const avgClicks = total > 0 ? (totalClicks / total).toFixed(1) : '0'
    return { total, totalClicks, avgClicks }
  }, [shortenedUrls])

  return (
    <div
      className="space-y-8"
      style={{
        margin: '0 auto',
        maxWidth: '1280px',
        width: '100%',
        padding: '2rem 1rem',
      }}
    >
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-300">Free URL Shortener</span>
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            URL Shortener & Analytics
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Create short, memorable links with custom aliases. Track clicks and generate QR codes for
          easy sharing.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total URLs</p>
              <p className="text-3xl font-bold text-cyan-400">{stats.total}</p>
            </div>
            <LinkIcon className="h-10 w-10 text-cyan-400/50" />
          </div>
        </Card>
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Clicks</p>
              <p className="text-3xl font-bold text-blue-400">{stats.totalClicks}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400/50" />
          </div>
        </Card>
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Clicks</p>
              <p className="text-3xl font-bold text-purple-400">{stats.avgClicks}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-400/50" />
          </div>
        </Card>
      </div>

      {/* URL Input Section */}
      <Card className="border-cyan-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Enter URL to shorten</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                  className="h-12 border-gray-700 bg-gray-800 pr-10"
                />
                {url && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isValidUrl ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleShorten}
                disabled={!isValidUrl || isLoading}
                className="h-12 gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-8 hover:from-cyan-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Shortening...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    Shorten URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Custom Alias (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Custom alias <span className="text-gray-500">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="my-custom-link"
              value={customAlias}
              onChange={(e) =>
                setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }
              className="h-12 border-gray-700 bg-gray-800"
            />
            <p className="text-xs text-gray-500">
              Use lowercase letters, numbers, and hyphens only. Leave empty for auto-generated short
              code.
            </p>
          </div>
        </div>
      </Card>

      {/* Selected URL Details */}
      {selectedUrl && (
        <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cyan-300">Your Shortened URL</h3>
              <Badge className="bg-green-500/20 text-green-300">Active</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400">Short URL</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <a
                    href={selectedUrl.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate font-mono text-lg font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    {selectedUrl.shortUrl}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(selectedUrl.shortUrl, 'Short URL')}
                    className="hover:bg-cyan-500/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setShowQR(showQR === selectedUrl.shortCode ? null : selectedUrl.shortCode)
                    }
                    className="hover:bg-cyan-500/20"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400">Original URL</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                  <span className="flex-1 truncate text-sm text-gray-300">
                    {selectedUrl.originalUrl}
                  </span>
                  <a
                    href={selectedUrl.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            {showQR === selectedUrl.shortCode && (
              <div className="flex items-center justify-center space-y-3 rounded-lg border border-cyan-500/30 bg-white p-6">
                <div className="text-center">
                  <QRCodeSVG
                    id={`qr-${selectedUrl.shortCode}`}
                    value={selectedUrl.shortUrl}
                    size={200}
                    level="H"
                    includeMargin
                  />
                  <Button
                    onClick={() => handleDownloadQR(selectedUrl.shortUrl, selectedUrl.shortCode)}
                    className="mt-4 gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* URLs List */}
      {shortenedUrls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-200">Your Shortened URLs</h2>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
              {shortenedUrls.length} {shortenedUrls.length === 1 ? 'URL' : 'URLs'}
            </Badge>
          </div>

          <div className="space-y-3">
            {shortenedUrls.map((item) => (
              <Card
                key={item.id}
                className="border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-gray-900/80"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-lg font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        {item.shortUrl}
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(item.shortUrl, 'Short URL')}
                        className="h-8 w-8 p-0 hover:bg-cyan-500/20"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="truncate text-sm text-gray-400">{item.originalUrl}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {item.clicks} clicks
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUrl(item)}
                      className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10"
                    >
                      <QrCode className="h-4 w-4" />
                      QR Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <Card className="border-blue-500/20 bg-blue-900/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-300">Note about URL storage</p>
            <p className="text-xs text-gray-400">
              URLs are stored locally in your browser. To enable cloud storage, analytics tracking,
              and persistent links, please set up Supabase by following the instructions in the
              database setup documentation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
