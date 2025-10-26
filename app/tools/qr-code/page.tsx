'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Download, Copy, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

type QRCodeType = 'url' | 'text' | 'wifi' | 'vcard'

interface WiFiConfig {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

interface VCardConfig {
  firstName: string
  lastName: string
  organization: string
  phone: string
  email: string
  website: string
  address: string
}

export default function QRCodePage() {
  const [type, setType] = useState<QRCodeType>('url')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  })
  const [vcardConfig, setVcardConfig] = useState<VCardConfig>({
    firstName: '',
    lastName: '',
    organization: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  })
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [includeMargin, setIncludeMargin] = useState(true)

  const getQRValue = () => {
    switch (type) {
      case 'url':
        return urlInput
      case 'text':
        return textInput
      case 'wifi':
        return `WIFI:T:${wifiConfig.encryption};S:${wifiConfig.ssid};P:${wifiConfig.password};H:${wifiConfig.hidden};`
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardConfig.firstName} ${vcardConfig.lastName}
N:${vcardConfig.lastName};${vcardConfig.firstName};;;
ORG:${vcardConfig.organization}
TEL:${vcardConfig.phone}
EMAIL:${vcardConfig.email}
URL:${vcardConfig.website}
ADR:;;${vcardConfig.address};;;;
END:VCARD`
      default:
        return ''
    }
  }

  const qrValue = getQRValue()
  const hasValidInput = qrValue.trim().length > 0

  const downloadQRCode = (format: 'png' | 'svg') => {
    if (!hasValidInput) {
      toast.error('Please enter content to generate QR code')
      return
    }

    try {
      if (format === 'png') {
        const canvas = document.createElement('canvas')
        const svg = document.getElementById('qr-code-svg') as unknown as SVGSVGElement
        if (!svg) {
          toast.error('QR code not found')
          return
        }

        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((blob) => {
              if (blob) {
                const link = document.createElement('a')
                link.download = `qrcode-${Date.now()}.png`
                link.href = URL.createObjectURL(blob)
                link.click()
                URL.revokeObjectURL(link.href)
                toast.success('QR code downloaded as PNG 🎉')
                trackToolEvent('qr_code_download', { format: 'png', type })
              }
            })
          }
          URL.revokeObjectURL(url)
        }
        img.src = url
      } else {
        const svg = document.getElementById('qr-code-svg')
        if (!svg) {
          toast.error('QR code not found')
          return
        }

        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        const link = document.createElement('a')
        link.download = `qrcode-${Date.now()}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        toast.success('QR code downloaded as SVG 🎉')
        trackToolEvent('qr_code_download', { format: 'svg', type })
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download QR code')
    }
  }

  const copyQRCode = async () => {
    if (!hasValidInput) {
      toast.error('Please enter content to generate QR code')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const svg = document.getElementById('qr-code-svg') as unknown as SVGSVGElement
      if (!svg) {
        toast.error('QR code not found')
        return
      }

      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = async () => {
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                toast.success('QR code copied to clipboard 📋')
                trackToolEvent('qr_code_copy', { type })
              } catch (error) {
                console.error('Copy error:', error)
                toast.error('Failed to copy QR code')
              }
            }
          })
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy QR code')
    }
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        display: 'flex',
        flexDirection: 'column',
        gap: { base: '6', sm: '8' },
      })}
    >
      {/* Header */}
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
        <div
          className={css({ display: 'flex', alignItems: 'center', gap: { base: '3', sm: '4' } })}
        >
          <div
            className="animate-pulse rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 p-2.5 shadow-2xl shadow-violet-500/60 sm:rounded-2xl sm:p-4"
            style={{ animationDuration: '2s' }}
          >
            <QrCode className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-300 bg-clip-text text-2xl font-extrabold text-transparent drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
              QR Code Generator
            </h1>
            <p className="text-sm text-gray-200 sm:text-base md:text-lg">
              Create customizable QR codes for URLs, text, WiFi, and contact cards
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* Input Section */}
        <div
          className={css({ display: 'flex', flexDirection: 'column', gap: { base: '4', md: '6' } })}
        >
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'violet.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'violet.300',
              })}
            >
              QR Code Type
            </h2>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '2', sm: '4' },
                gap: '3',
              })}
            >
              {(['url', 'text', 'wifi', 'vcard'] as const).map((t) => (
                <Button
                  key={t}
                  onClick={() => {
                    setType(t)
                    trackToolEvent('qr_code_type_change', { type: t })
                  }}
                  variant={type === t ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'violet.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'violet.300',
              })}
            >
              Content
            </h2>
            {type === 'url' && (
              <Field>
                <FieldLabel>URL</FieldLabel>
                <Input
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </Field>
            )}

            {type === 'text' && (
              <Field>
                <FieldLabel>Text</FieldLabel>
                <Textarea
                  placeholder="Enter any text..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                />
              </Field>
            )}

            {type === 'wifi' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Network Name (SSID)</FieldLabel>
                  <Input
                    placeholder="My WiFi Network"
                    value={wifiConfig.ssid}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="WiFi password"
                    value={wifiConfig.password}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Security</FieldLabel>
                  <div className={css({ display: 'grid', gridTemplateColumns: '3', gap: '2' })}>
                    {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                      <Button
                        key={enc}
                        onClick={() => setWifiConfig({ ...wifiConfig, encryption: enc })}
                        variant={wifiConfig.encryption === enc ? 'default' : 'outline'}
                        size="sm"
                      >
                        {enc === 'nopass' ? 'None' : enc}
                      </Button>
                    ))}
                  </div>
                </Field>
                <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <input
                    type="checkbox"
                    checked={wifiConfig.hidden}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Hidden network</span>
                </label>
              </div>
            )}

            {type === 'vcard' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1', sm: '2' },
                    gap: '4',
                  })}
                >
                  <Field>
                    <FieldLabel>First Name</FieldLabel>
                    <Input
                      placeholder="John"
                      value={vcardConfig.firstName}
                      onChange={(e) =>
                        setVcardConfig({ ...vcardConfig, firstName: e.target.value })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input
                      placeholder="Doe"
                      value={vcardConfig.lastName}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, lastName: e.target.value })}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Organization</FieldLabel>
                  <Input
                    placeholder="Company Name"
                    value={vcardConfig.organization}
                    onChange={(e) =>
                      setVcardConfig({ ...vcardConfig, organization: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <Input
                    placeholder="+1 234 567 8900"
                    value={vcardConfig.phone}
                    onChange={(e) => setVcardConfig({ ...vcardConfig, phone: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={vcardConfig.email}
                    onChange={(e) => setVcardConfig({ ...vcardConfig, email: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Website</FieldLabel>
                  <Input
                    placeholder="https://example.com"
                    value={vcardConfig.website}
                    onChange={(e) => setVcardConfig({ ...vcardConfig, website: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    placeholder="123 Main St, City, Country"
                    value={vcardConfig.address}
                    onChange={(e) => setVcardConfig({ ...vcardConfig, address: e.target.value })}
                  />
                </Field>
              </div>
            )}
          </div>

          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'violet.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'violet.300',
              })}
            >
              Customization
            </h2>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1', sm: '2' },
                  gap: '4',
                })}
              >
                <Field>
                  <FieldLabel>Foreground Color</FieldLabel>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Background Color</FieldLabel>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </Field>
              </div>
              <Field>
                <FieldLabel>Size: {size}px</FieldLabel>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
                <div
                  className={css({
                    mt: '1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'xs',
                    color: 'gray.400',
                  })}
                >
                  <span>128px</span>
                  <span>512px</span>
                </div>
              </Field>
              <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <input
                  type="checkbox"
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">Include margin</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div
          className={css({ display: 'flex', flexDirection: 'column', gap: { base: '4', md: '6' } })}
        >
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'violet.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'violet.300',
              })}
            >
              Preview
            </h2>
            <div
              className={css({
                display: 'flex',
                minH: '300px',
                alignItems: 'center',
                justifyContent: 'center',
                rounded: 'lg',
                border: '2px dashed',
                borderColor: 'violet.500/30',
                p: '8',
              })}
              style={{ backgroundColor: bgColor }}
            >
              {hasValidInput ? (
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrValue}
                  size={size}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="H"
                  includeMargin={includeMargin}
                />
              ) : (
                <div className={css({ textAlign: 'center' })}>
                  <QrCode
                    className={css({
                      mx: 'auto',
                      h: '16',
                      w: '16',
                      color: 'gray.400',
                      opacity: 0.5,
                    })}
                  />
                  <p className={css({ mt: '2', color: 'gray.400' })}>
                    Enter content to generate QR code
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'violet.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'violet.300',
              })}
            >
              Actions
            </h2>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '3' })}>
              <Button
                onClick={() => downloadQRCode('png')}
                disabled={!hasValidInput}
                className={css({ flex: '1' })}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button
                onClick={() => downloadQRCode('svg')}
                disabled={!hasValidInput}
                variant="outline"
                className={css({ flex: '1' })}
              >
                <Download className="mr-2 h-4 w-4" />
                Download SVG
              </Button>
              <Button
                onClick={copyQRCode}
                disabled={!hasValidInput}
                variant="outline"
                className={css({ flex: '1' })}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Image
              </Button>
            </div>
          </div>

          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'violet.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '3',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'base', sm: 'lg' },
                fontWeight: 'bold',
                color: 'violet.300',
              })}
            >
              Features
            </h2>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>Multiple Types</Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  URL, Text, WiFi, vCard support
                </span>
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>Customizable</Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Colors, size, and margins
                </span>
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>High Resolution</Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Up to 512px with error correction
                </span>
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>Multiple Formats</Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  PNG and SVG exports
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
