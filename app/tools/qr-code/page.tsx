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
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 p-2">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">QR Code Generator</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Create customizable QR codes for URLs, text, WiFi, and contact cards with high-resolution
          downloads
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="glass rounded-lg p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">QR Code Type</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

          <div className="glass rounded-lg p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Content</h2>
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
              <div className="space-y-4">
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
                  <div className="grid grid-cols-3 gap-2">
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
                <label className="flex items-center gap-2">
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
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="glass rounded-lg p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Customization</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Foreground Color</FieldLabel>
                  <div className="flex gap-2">
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
                  <div className="flex gap-2">
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
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>128px</span>
                  <span>512px</span>
                </div>
              </Field>
              <label className="flex items-center gap-2">
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
        <div className="space-y-6">
          <div className="glass rounded-lg p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Preview</h2>
            <div
              className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border p-8"
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
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">Enter content to generate QR code</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-lg p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => downloadQRCode('png')}
                disabled={!hasValidInput}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button
                onClick={() => downloadQRCode('svg')}
                disabled={!hasValidInput}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download SVG
              </Button>
              <Button
                onClick={copyQRCode}
                disabled={!hasValidInput}
                variant="outline"
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Image
              </Button>
            </div>
          </div>

          <div className="glass rounded-lg p-6 shadow-lg">
            <h2 className="mb-3 text-lg font-semibold">Features</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>Multiple Types</Badge>
                <span className="text-sm text-muted-foreground">
                  URL, Text, WiFi, vCard support
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Customizable</Badge>
                <span className="text-sm text-muted-foreground">Colors, size, and margins</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>High Resolution</Badge>
                <span className="text-sm text-muted-foreground">
                  Up to 512px with error correction
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Multiple Formats</Badge>
                <span className="text-sm text-muted-foreground">PNG and SVG exports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
