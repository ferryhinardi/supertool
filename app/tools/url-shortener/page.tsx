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
import { css } from '@/styled-system/css'

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
      className={css({
        mx: 'auto',
        maxW: '1280px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
      })}
    >
      {/* Header */}
      <div className={css({ spaceY: { base: '4', sm: '4' }, textAlign: 'center' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <Sparkles className={css({ h: '4', w: '4', color: 'cyan.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'cyan.300' })}>
            Free URL Shortener
          </span>
        </div>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'extrabold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'cyan.400',
              gradientVia: 'blue.400',
              gradientTo: 'purple.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            URL Shortener & Analytics
          </span>
        </h1>
        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'base', sm: 'lg' },
            color: 'gray.400',
          })}
        >
          Create short, memorable links with custom aliases. Track clicks and generate QR codes for
          easy sharing.
        </p>
      </div>

      {/* Stats Cards */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1', sm: 'repeat(3, 1fr)' },
          gap: { base: '4', sm: '4' },
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bgGradient: 'to-br',
            gradientFrom: 'cyan.900/20',
            gradientTo: 'blue.900/20',
            p: { base: '5', sm: '6' },
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <div>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>Total URLs</p>
              <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'cyan.400' })}>
                {stats.total}
              </p>
            </div>
            <LinkIcon className={css({ h: '10', w: '10', color: 'cyan.400/50' })} />
          </div>
        </Card>
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bgGradient: 'to-br',
            gradientFrom: 'blue.900/20',
            gradientTo: 'purple.900/20',
            p: { base: '5', sm: '6' },
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <div>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Clicks</p>
              <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.400' })}>
                {stats.totalClicks}
              </p>
            </div>
            <TrendingUp className={css({ h: '10', w: '10', color: 'blue.400/50' })} />
          </div>
        </Card>
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bgGradient: 'to-br',
            gradientFrom: 'purple.900/20',
            gradientTo: 'pink.900/20',
            p: { base: '5', sm: '6' },
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <div>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>Avg. Clicks</p>
              <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'purple.400' })}>
                {stats.avgClicks}
              </p>
            </div>
            <BarChart3 className={css({ h: '10', w: '10', color: 'purple.400/50' })} />
          </div>
        </Card>
      </div>

      {/* URL Input Section */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'cyan.500/20',
          bg: 'rgba(17, 24, 39, 0.5)',
          p: { base: '5', sm: '6' },
          backdropFilter: 'blur(4px)',
        })}
      >
        <div className={css({ spaceY: { base: '4', sm: '4' } })}>
          <div className={css({ spaceY: '2' })}>
            <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.200' })}>
              Enter URL to shorten
            </label>
            <div className={css({ display: 'flex', gap: '2' })}>
              <div className={css({ position: 'relative', flex: '1' })}>
                <Input
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                  className={css({
                    h: { base: '12', sm: '12' },
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800',
                    pr: '10',
                  })}
                />
                {url && (
                  <div
                    className={css({
                      position: 'absolute',
                      insetY: '0',
                      right: '0',
                      display: 'flex',
                      alignItems: 'center',
                      pr: '3',
                    })}
                  >
                    {isValidUrl ? (
                      <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                    ) : (
                      <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleShorten}
                disabled={!isValidUrl || isLoading}
                className={css({
                  h: { base: '12', sm: '12' },
                  gap: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'cyan.500',
                  gradientTo: 'blue.500',
                  px: { base: '6', sm: '8' },
                  _hover: {
                    bgGradient: 'to-r',
                    gradientFrom: 'cyan.600',
                    gradientTo: 'blue.600',
                  },
                })}
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
          <div className={css({ spaceY: '2' })}>
            <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.200' })}>
              Custom alias <span className={css({ color: 'gray.500' })}>(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="my-custom-link"
              value={customAlias}
              onChange={(e) =>
                setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }
              className={css({
                h: { base: '12', sm: '12' },
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.800',
              })}
            />
            <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
              Use lowercase letters, numbers, and hyphens only. Leave empty for auto-generated short
              code.
            </p>
          </div>
        </div>
      </Card>

      {/* Selected URL Details */}
      {selectedUrl && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/30',
            bgGradient: 'to-br',
            gradientFrom: 'cyan.900/20',
            gradientTo: 'blue.900/20',
            p: { base: '5', sm: '6' },
            backdropFilter: 'blur(4px)',
          })}
        >
          <div className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                Your Shortened URL
              </h3>
              <Badge className={css({ bg: 'green.500/20', color: 'green.300' })}>Active</Badge>
            </div>

            <div className={css({ spaceY: '3' })}>
              <div>
                <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'gray.400' })}>
                  Short URL
                </label>
                <div
                  className={css({
                    mt: '1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'cyan.500/30',
                    bg: 'cyan.500/10',
                    p: '3',
                  })}
                >
                  <a
                    href={selectedUrl.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={css({
                      flex: '1',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'mono',
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'cyan.300',
                      _hover: {
                        color: 'cyan.200',
                      },
                    })}
                  >
                    {selectedUrl.shortUrl}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(selectedUrl.shortUrl, 'Short URL')}
                    className={css({
                      _hover: {
                        bg: 'cyan.500/20',
                      },
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setShowQR(showQR === selectedUrl.shortCode ? null : selectedUrl.shortCode)
                    }
                    className={css({
                      _hover: {
                        bg: 'cyan.500/20',
                      },
                    })}
                  >
                    <QrCode className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </div>

              <div>
                <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'gray.400' })}>
                  Original URL
                </label>
                <div
                  className={css({
                    mt: '1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'rgba(31, 41, 55, 0.5)',
                    p: '3',
                  })}
                >
                  <span
                    className={css({
                      flex: '1',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 'sm',
                      color: 'gray.300',
                    })}
                  >
                    {selectedUrl.originalUrl}
                  </span>
                  <a
                    href={selectedUrl.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={css({
                      color: 'gray.400',
                      _hover: {
                        color: 'gray.300',
                      },
                    })}
                  >
                    <ExternalLink className={css({ h: '4', w: '4' })} />
                  </a>
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            {showQR === selectedUrl.shortCode && (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  spaceY: '3',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'cyan.500/30',
                  bg: 'white',
                  p: '6',
                })}
              >
                <div className={css({ textAlign: 'center' })}>
                  <QRCodeSVG
                    id={`qr-${selectedUrl.shortCode}`}
                    value={selectedUrl.shortUrl}
                    size={200}
                    level="H"
                    includeMargin
                  />
                  <Button
                    onClick={() => handleDownloadQR(selectedUrl.shortUrl, selectedUrl.shortCode)}
                    className={css({
                      mt: '4',
                      gap: '2',
                      bgGradient: 'to-r',
                      gradientFrom: 'cyan.500',
                      gradientTo: 'blue.500',
                      _hover: {
                        bgGradient: 'to-r',
                        gradientFrom: 'cyan.600',
                        gradientTo: 'blue.600',
                      },
                    })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
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
        <div className={css({ spaceY: '4' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.200' })}>
              Your Shortened URLs
            </h2>
            <Badge variant="secondary" className={css({ bg: 'cyan.500/20', color: 'cyan.300' })}>
              {shortenedUrls.length} {shortenedUrls.length === 1 ? 'URL' : 'URLs'}
            </Badge>
          </div>

          <div className={css({ spaceY: '3' })}>
            {shortenedUrls.map((item) => (
              <Card
                key={item.id}
                className={css({
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.5)',
                  p: { base: '4', sm: '4' },
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s',
                  _hover: {
                    borderColor: 'cyan.500/30',
                    bg: 'rgba(17, 24, 39, 0.8)',
                  },
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: { base: 'column', sm: 'row' },
                    alignItems: { base: 'start', sm: 'center' },
                    justifyContent: { base: 'start', sm: 'space-between' },
                    gap: { base: '4', sm: '4' },
                  })}
                >
                  <div className={css({ flex: '1', spaceY: '2' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css({
                          fontFamily: 'mono',
                          fontSize: 'lg',
                          fontWeight: 'semibold',
                          color: 'cyan.400',
                          _hover: {
                            color: 'cyan.300',
                          },
                        })}
                      >
                        {item.shortUrl}
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(item.shortUrl, 'Short URL')}
                        className={css({
                          h: '8',
                          w: '8',
                          p: '0',
                          _hover: {
                            bg: 'cyan.500/20',
                          },
                        })}
                      >
                        <Copy className={css({ h: '3.5', w: '3.5' })} />
                      </Button>
                    </div>
                    <p
                      className={css({
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 'sm',
                        color: 'gray.400',
                      })}
                    >
                      {item.originalUrl}
                    </p>
                    <div
                      className={css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '2',
                        fontSize: 'xs',
                        color: 'gray.500',
                      })}
                    >
                      <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
                        <Calendar className={css({ h: '3', w: '3' })} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
                        <TrendingUp className={css({ h: '3', w: '3' })} />
                        {item.clicks} clicks
                      </span>
                    </div>
                  </div>

                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUrl(item)}
                      className={css({
                        gap: '2',
                        border: '1px solid',
                        borderColor: 'cyan.500/30',
                        _hover: {
                          bg: 'cyan.500/10',
                        },
                      })}
                    >
                      <QrCode className={css({ h: '4', w: '4' })} />
                      QR Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className={css({
                        gap: '2',
                        border: '1px solid',
                        borderColor: 'red.500/30',
                        color: 'red.400',
                        _hover: {
                          bg: 'red.500/10',
                          color: 'red.300',
                        },
                      })}
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'blue.500/20',
          bg: 'blue.900/10',
          p: { base: '4', sm: '4' },
        })}
      >
        <div className={css({ display: 'flex', gap: '3' })}>
          <AlertCircle className={css({ h: '5', w: '5', flexShrink: '0', color: 'blue.400' })} />
          <div className={css({ spaceY: '1' })}>
            <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'blue.300' })}>
              Note about URL storage
            </p>
            <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
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
