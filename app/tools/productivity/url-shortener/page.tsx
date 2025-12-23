'use client'

import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Lightbulb,
  Link as LinkIcon,
  QrCode,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { css } from '@/styled-system/css'

const faqs = [
  {
    question: 'How do I create a shortened URL?',
    answer:
      'Simply paste your long URL into the input field and click "Shorten". You can optionally add a custom alias to make your link memorable (e.g., supertool.id/mylink). The short link is generated instantly and you can copy it to share. All shortened URLs are stored securely in our database with analytics tracking enabled.',
  },
  {
    question: 'Can I customize the shortened link with my own alias?',
    answer:
      'Yes! You can create custom short links with memorable aliases instead of random strings. Enter your desired alias when creating the short URL. Custom aliases are first-come, first-served and must be unique. This is perfect for branding, marketing campaigns, or creating easy-to-remember links for sharing.',
  },
  {
    question: 'Do shortened links expire or stop working?',
    answer:
      'No, shortened URLs created on our platform do not expire and will work indefinitely. Once created, your short link remains active permanently unless you manually delete it from your dashboard. This ensures your shared links in social media, documents, or printed materials continue working long-term.',
  },
  {
    question: 'What analytics are tracked for my shortened URLs?',
    answer:
      'We track click counts, geographic locations (country/city), referrer sources, device types (desktop/mobile/tablet), browsers, operating systems, and timestamp data for each click. All analytics are anonymous and respect user privacy. You can view detailed statistics on your dashboard to measure link performance and audience insights.',
  },
  {
    question: 'Is it safe to use shortened URLs for sensitive links?',
    answer:
      "While our URL shortener uses secure HTTPS connections and doesn't expose original URLs publicly, we recommend caution with sensitive links. Shortened URLs can mask the destination, which may be flagged by security systems. For highly sensitive content, consider password-protecting the destination or using direct links in secure channels.",
  },
  {
    question: 'Can I generate QR codes for my shortened URLs?',
    answer:
      'Yes! Every shortened URL can generate a scannable QR code instantly. Simply click the QR icon next to your short link to view the QR code. You can download it as a PNG image for printing on marketing materials, business cards, posters, or digital displays. QR codes make sharing physical-to-digital seamless and are perfect for events, retail, and offline marketing.',
  },
  {
    question: 'How can I track link performance and analytics?',
    answer:
      'Each shortened URL includes built-in analytics tracking. View total clicks, unique visitors, geographic locations, referrer sources, device types, and click timestamps on your dashboard. Analytics help you measure campaign effectiveness, understand your audience, and optimize marketing strategies. All tracking is privacy-focused and complies with data protection standards.',
  },
  {
    question: 'What makes a good custom alias for URL shortening?',
    answer:
      'Effective custom aliases are short, memorable, and relevant to the content. Use lowercase letters, numbers, and hyphens only. Avoid special characters or spaces. Examples: "sale-2025", "webinar-signup", or "product-launch". Keep it under 20 characters for best results. Good aliases improve brand recognition, click-through rates, and are easier to type manually.',
  },
  {
    question: 'Can I edit or update a shortened URL after creation?',
    answer:
      'Once a shortened URL is created, the short code or alias cannot be changed to maintain link integrity and prevent broken links. However, you can delete the shortened URL and create a new one with a different alias. If you need to update the destination URL, consider creating a new short link and updating references to point to the new link.',
  },
  {
    question: 'Are shortened URLs good for SEO and social media sharing?',
    answer:
      'Shortened URLs are excellent for social media where character limits matter (Twitter, SMS, etc.). They look cleaner and are easier to share verbally or in print. For SEO, search engines follow redirects properly, so link equity passes through. Custom aliases with keywords can improve click-through rates. However, for SEO-critical content, direct URLs with descriptive paths may be preferable.',
  },
]

interface ShortenedUrl {
  id: string
  shortCode: string
  originalUrl: string
  shortUrl: string
  createdAt: string
  isActive: boolean
  totalClicks: number
  uniqueVisitors: number
  lastClicked?: string
}

export default function URLShortenerPage() {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [selectedUrl, setSelectedUrl] = useState<ShortenedUrl | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)

  // Load shortened URLs from Supabase on mount
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetch('/api/urls')
        if (response.ok) {
          const data = await response.json()
          interface UrlResponse {
            shortCode: string
            originalUrl: string
            createdAt: string
            isActive: boolean
            totalClicks?: number
            uniqueVisitors?: number
            lastClicked?: string
          }
          const urls = data.urls.map((url: UrlResponse) => ({
            id: url.shortCode, // Use shortCode as id for consistency
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            shortUrl: `${window.location.protocol}//${window.location.host}/s/${url.shortCode}`,
            createdAt: url.createdAt,
            isActive: url.isActive,
            totalClicks: url.totalClicks || 0,
            uniqueVisitors: url.uniqueVisitors || 0,
            lastClicked: url.lastClicked,
          }))
          setShortenedUrls(urls)
        }
      } catch (error) {
        console.error('Failed to load shortened URLs:', error)
      }
    }
    fetchUrls()
  }, [])

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
        isActive: true,
        totalClicks: 0,
        uniqueVisitors: 0,
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

  const handleDownloadQR = (_shortUrl: string, shortCode: string) => {
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

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  const handleDelete = async (shortCode: string) => {
    // Remove from local state immediately for better UX
    setShortenedUrls((prev) => prev.filter((u) => u.shortCode !== shortCode))
    if (selectedUrl?.shortCode === shortCode) {
      setSelectedUrl(null)
    }
    toast.success('URL removed from list')

    // Note: In production, you might want to add a DELETE endpoint
    // to actually remove or deactivate URLs from the database
  }

  const stats = useMemo(() => {
    const total = shortenedUrls.length
    const totalClicks = shortenedUrls.reduce((sum, url) => sum + (url.totalClicks || 0), 0)
    const avgClicks = total > 0 ? (totalClicks / total).toFixed(1) : '0'
    return { total, totalClicks, avgClicks }
  }, [shortenedUrls])

  // Keyboard shortcuts
  const { showHelp, setShowHelp, modifierKey } = useKeyboardShortcuts({
    onExecute: isValidUrl ? handleShorten : undefined,
    onCopy:
      shortenedUrls.length > 0
        ? () => handleCopy(shortenedUrls[0].shortUrl, 'Short URL')
        : undefined,
    onReset: () => {
      setUrl('')
      setCustomAlias('')
      setShortenedUrls([])
    },
  })

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
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'cyan.300',
            })}
          >
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
              <p
                className={css({
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  color: 'cyan.400',
                })}
              >
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
              <p
                className={css({
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  color: 'blue.400',
                })}
              >
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
              <p
                className={css({
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  color: 'purple.400',
                })}
              >
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
            <label
              htmlFor="url-input"
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.200',
              })}
            >
              Enter URL to shorten
            </label>
            <div className={css({ display: 'flex', gap: '2' })}>
              <div className={css({ position: 'relative', flex: '1' })}>
                <Input
                  id="url-input"
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
            <label
              htmlFor="custom-alias"
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.200',
              })}
            >
              Custom alias <span className={css({ color: 'gray.500' })}>(optional)</span>
            </label>
            <Input
              id="custom-alias"
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
              <h3
                className={css({
                  fontSize: 'lg',
                  fontWeight: 'semibold',
                  color: 'cyan.300',
                })}
              >
                Your Shortened URL
              </h3>
              <Badge className={css({ bg: 'green.500/20', color: 'green.300' })}>Active</Badge>
            </div>

            <div className={css({ spaceY: '3' })}>
              <div>
                <div
                  className={css({
                    fontSize: 'xs',
                    fontWeight: 'medium',
                    color: 'gray.400',
                  })}
                >
                  Short URL
                </div>
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
                    variant="ghost"
                    onClick={() => handleCopy(selectedUrl.shortUrl, 'Short URL')}
                    aria-label="Copy short URL to clipboard"
                    className={css({
                      minH: '11',
                      minW: '11',
                      _hover: {
                        bg: 'cyan.500/20',
                      },
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setShowQR(showQR === selectedUrl.shortCode ? null : selectedUrl.shortCode)
                    }
                    aria-label="Show QR code"
                    className={css({
                      minH: '11',
                      minW: '11',
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
                <div
                  className={css({
                    fontSize: 'xs',
                    fontWeight: 'medium',
                    color: 'gray.400',
                  })}
                >
                  Original URL
                </div>
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
            <h2
              className={css({
                fontSize: '2xl',
                fontWeight: 'bold',
                color: 'gray.200',
              })}
            >
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
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                      })}
                    >
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
                        variant="ghost"
                        onClick={() => handleCopy(item.shortUrl, 'Short URL')}
                        aria-label="Copy short URL"
                        className={css({
                          h: '11',
                          w: '11',
                          p: '0',
                          minH: '11',
                          minW: '11',
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
                      <span
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1',
                        })}
                      >
                        <Calendar className={css({ h: '3', w: '3' })} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1',
                        })}
                      >
                        <TrendingUp className={css({ h: '3', w: '3' })} />
                        {item.totalClicks} clicks
                      </span>
                    </div>
                  </div>

                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                    })}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUrl(item)}
                      aria-label="Show QR code"
                      className={css({
                        gap: '2',
                        minH: '11',
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
                      variant="outline"
                      onClick={() => handleDelete(item.shortCode)}
                      aria-label="Delete shortened URL"
                      className={css({
                        minH: '11',
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
          borderColor: 'green.500/20',
          bg: 'green.900/10',
          p: { base: '4', sm: '4' },
        })}
      >
        <div className={css({ display: 'flex', gap: '3' })}>
          <CheckCircle2
            className={css({
              h: '5',
              w: '5',
              flexShrink: '0',
              color: 'green.400',
            })}
          />
          <div className={css({ spaceY: '1' })}>
            <p
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'green.300',
              })}
            >
              Cloud Storage Enabled
            </p>
            <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
              Your URLs are stored in Supabase with real-time analytics tracking. All shortened
              links are persistent and accessible across devices. Click tracking is enabled
              automatically.
            </p>
          </div>
        </div>
      </Card>

      {/* Pro Tips Section */}
      <Card
        className={css({
          border: '2px solid',
          borderColor: 'cyan.500/20',
          bg: 'rgba(6, 182, 212, 0.05)',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Sparkles className={css({ h: '5', w: '5', color: 'cyan.400' })} />
            Pro Tips
          </CardTitle>
          <CardDescription>
            Expert strategies for creating effective short links that drive results
          </CardDescription>
        </CardHeader>
        <CardContent className={css({ spaceY: '3' })}>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
            <div
              className={css({
                p: '3',
                rounded: 'lg',
                bg: 'cyan.500/5',
                borderLeft: '3px solid',
                borderColor: 'cyan.500',
              })}
            >
              <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>
                  Custom Aliases for Brand Recognition:
                </strong>{' '}
                Use memorable, descriptive aliases that match your campaign (e.g.,
                "spring-promo-2025" instead of random codes). Keep it short (8-15 characters), use
                hyphens for readability, and include relevant keywords for better recall and
                click-through rates.
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'lg',
                bg: 'cyan.500/5',
                borderLeft: '3px solid',
                borderColor: 'cyan.500',
              })}
            >
              <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>
                  Track and Analyze Performance:
                </strong>{' '}
                Monitor your link analytics to understand audience behavior. Track click patterns,
                geographic distribution, device types, and traffic sources. Use this data to
                optimize timing, targeting, and content for future campaigns.
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'lg',
                bg: 'cyan.500/5',
                borderLeft: '3px solid',
                borderColor: 'cyan.500',
              })}
            >
              <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>
                  QR Codes for Physical Marketing:
                </strong>{' '}
                Generate QR codes for print materials, product packaging, business cards, and event
                signage. Test scannability at actual size, ensure adequate contrast, and position
                codes at eye level. Include a shortened URL underneath as a fallback.
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'lg',
                bg: 'cyan.500/5',
                borderLeft: '3px solid',
                borderColor: 'cyan.500',
              })}
            >
              <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>
                  Link Management Best Practices:
                </strong>{' '}
                Organize links by campaign or category in the history dashboard. Delete expired
                promotional links to keep your workspace clean. Review analytics regularly to
                identify top-performing content and distribution channels.
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'lg',
                bg: 'cyan.500/5',
                borderLeft: '3px solid',
                borderColor: 'cyan.500',
              })}
            >
              <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>Social Media Optimization:</strong>{' '}
                Short links save character count on Twitter, look cleaner on Instagram, and improve
                click-through rates across all platforms. Test links before posting, use link
                preview cards when available, and track which platforms drive the most engagement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <Card
        className={css({
          border: '2px solid',
          borderColor: 'blue.500/30',
          bg: 'rgba(59, 130, 246, 0.05)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
        })}
      >
        <CardHeader>
          <CardTitle
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              fontSize: 'xl',
              fontWeight: 'bold',
            })}
          >
            <Lightbulb className={css({ h: '6', w: '6', color: 'blue.400' })} />
            How to Use URL Shortener
          </CardTitle>
          <CardDescription>
            Follow these simple steps to create and share your short links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: '1fr 1fr' },
              gap: { base: '4', md: '6' },
            })}
          >
            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <Badge
                variant="outline"
                className={css({
                  minH: '10',
                  minW: '10',
                  h: '10',
                  w: '10',
                  rounded: 'full',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bg: 'purple.500/10',
                  borderColor: 'purple.500',
                  borderWidth: '2px',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'purple.300',
                  flexShrink: 0,
                })}
              >
                1
              </Badge>
              <div className={css({ flex: '1', minW: '0' })}>
                <h3
                  className={css({
                    fontWeight: 'semibold',
                    color: 'gray.100',
                    mb: '2',
                    fontSize: { base: 'sm', sm: 'base' },
                  })}
                >
                  Enter Your Long URL
                </h3>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    lineHeight: '1.6',
                  })}
                >
                  Paste the long URL you want to shorten into the input field. The tool validates
                  the URL format automatically and shows a green checkmark when ready.
                </p>
              </div>
            </div>

            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <Badge
                variant="outline"
                className={css({
                  minH: '10',
                  minW: '10',
                  h: '10',
                  w: '10',
                  rounded: 'full',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bg: 'pink.500/10',
                  borderColor: 'pink.500',
                  borderWidth: '2px',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'pink.300',
                  flexShrink: 0,
                })}
              >
                2
              </Badge>
              <div className={css({ flex: '1', minW: '0' })}>
                <h3
                  className={css({
                    fontWeight: 'semibold',
                    color: 'gray.100',
                    mb: '2',
                    fontSize: { base: 'sm', sm: 'base' },
                  })}
                >
                  Customize Your Link (Optional)
                </h3>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    lineHeight: '1.6',
                  })}
                >
                  Add a custom alias for branded, memorable links (e.g., "summer-sale-2025"). Leave
                  blank for auto-generated short codes. Use only lowercase, numbers, and hyphens.
                </p>
              </div>
            </div>

            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <Badge
                variant="outline"
                className={css({
                  minH: '10',
                  minW: '10',
                  h: '10',
                  w: '10',
                  rounded: 'full',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bg: 'blue.500/10',
                  borderColor: 'blue.500',
                  borderWidth: '2px',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'blue.300',
                  flexShrink: 0,
                })}
              >
                3
              </Badge>
              <div className={css({ flex: '1', minW: '0' })}>
                <h3
                  className={css({
                    fontWeight: 'semibold',
                    color: 'gray.100',
                    mb: '2',
                    fontSize: { base: 'sm', sm: 'base' },
                  })}
                >
                  Generate and Copy Your Short Link
                </h3>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    lineHeight: '1.6',
                  })}
                >
                  Click "Shorten URL" to instantly create your short link. Copy it to clipboard with
                  one click, or generate a QR code for physical sharing and print materials.
                </p>
              </div>
            </div>

            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <Badge
                variant="outline"
                className={css({
                  minH: '10',
                  minW: '10',
                  h: '10',
                  w: '10',
                  rounded: 'full',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bg: 'green.500/10',
                  borderColor: 'green.500',
                  borderWidth: '2px',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'green.300',
                  flexShrink: 0,
                })}
              >
                4
              </Badge>
              <div className={css({ flex: '1', minW: '0' })}>
                <h3
                  className={css({
                    fontWeight: 'semibold',
                    color: 'gray.100',
                    mb: '2',
                    fontSize: { base: 'sm', sm: 'base' },
                  })}
                >
                  Share and Track Performance
                </h3>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    lineHeight: '1.6',
                  })}
                >
                  Share your short link on social media, emails, or print. Track clicks, locations,
                  devices, and referrers through the built-in analytics dashboard. Monitor
                  performance in real-time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SocialShare
        toolName="URL Shortener"
        toolUrl="https://supertool.id/tools/url-shortener"
        description="Create short, memorable links with custom aliases, QR codes, and real-time analytics tracking - perfect for marketing campaigns and social media sharing!"
        hashtags={['URLShortener', 'LinkManagement', 'Marketing', 'Analytics']}
      />

      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/url-shortener" category="productivity" />
      <ToolRating toolId="/tools/url-shortener" toolName="URL Shortener" />
      <ToolSearch />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={[
          { key: `${modifierKey}+Enter`, label: 'Shorten', description: 'Shorten URL' },
          { key: `${modifierKey}+C`, label: 'Copy', description: 'Copy latest short URL' },
          { key: `${modifierKey}+R`, label: 'Reset', description: 'Reset form' },
          { key: `${modifierKey}+/`, label: 'Help', description: 'Show this help' },
        ]}
      />
    </div>
  )
}
