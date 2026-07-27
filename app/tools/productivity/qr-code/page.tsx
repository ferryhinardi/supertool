'use client'

import type { Html5Qrcode } from 'html5-qrcode'
import JSZip from 'jszip'
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  Contact,
  Copy,
  Download,
  FileDown,
  FileText,
  FileUp,
  Globe,
  History,
  Image as ImageIcon,
  Link,
  Mail,
  MapPin,
  MessageSquare,
  PackageOpen,
  Phone,
  Printer,
  QrCode,
  ScanLine,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wifi,
  X,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  TOOL_COLORS,
  ToolMobilePicker,
  type ToolOperation,
  ToolOperationGrid,
} from '@/components/features/tool-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { trackToolEvent } from '@/lib/services/analytics'
import {
  type ExportFormat,
  exportToJPEG,
  exportToPDF,
  exportToPNG,
  exportToSVG,
  exportToWebP,
  type PrintTemplate,
} from '@/lib/tools/qr/qr-export-service'
import type { QRHistoryItem } from '@/lib/tools/qr/qr-history-service'
import {
  clearHistory,
  deleteHistoryItem,
  exportHistory,
  getFilteredHistory,
  getHistory,
  importHistory,
  saveToHistory,
  toggleFavorite,
} from '@/lib/tools/qr/qr-history-service'
import {
  parseQRData,
  type ScanResult,
  scanFromFile,
  startWebcamScanner,
  stopWebcamScanner,
  type ValidationResult,
  validateQRCode,
} from '@/lib/tools/qr/qr-scanner-service'
import {
  generateAppStoreQR,
  generateEmailQR,
  generateEventQR,
  generateGeoQR,
  generatePhoneQR,
  generateSMSQR,
  generateSocialQR,
  generateWhatsAppQR,
} from '@/lib/tools/qr/qr-types'
import { css } from '@/styled-system/css'

export type QRCodeType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'sms'
  | 'phone'
  | 'whatsapp'
  | 'geo'
  | 'event'
  | 'appstore'
  | 'social'
type QRStylePreset =
  | 'classic'
  | 'modern'
  | 'branded'
  | 'minimalist'
  | 'professional'
  | 'vibrant'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'neon'
type QRCornerStyle = 'square' | 'rounded' | 'extra-rounded' | 'dot'
type QRDotStyle = 'square' | 'rounded' | 'dots' | 'classy'

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

interface EmailConfig {
  to: string
  subject: string
  body: string
}

interface SMSConfig {
  phone: string
  message: string
}

interface PhoneConfig {
  phone: string
}

interface WhatsAppConfig {
  phone: string
  message: string
}

interface GeoConfig {
  latitude: string
  longitude: string
  label?: string
}

interface EventConfig {
  title: string
  location: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  description: string
}

interface AppStoreConfig {
  platform: 'ios' | 'android'
  appId: string
}

interface SocialConfig {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube'
  handle: string
}

interface QRStyleConfig {
  preset: QRStylePreset
  cornerStyle: QRCornerStyle
  dotStyle: QRDotStyle
  hasGradient: boolean
  gradientColor1: string
  gradientColor2: string
  hasLogo: boolean
  logoUrl: string
  logoSize: number
  logoOpacity: number
  logoPosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
  logoMask: 'none' | 'circle' | 'square' | 'rounded'
  eyeColor: string
  hasEyeStyle: boolean
  hasFrame: boolean
  frameText: string
  frameColor: string
}

interface BulkQRItem {
  id: string
  type: QRCodeType
  content: string
  label?: string
  customColor?: string
}

interface BulkGenerationState {
  items: BulkQRItem[]
  isGenerating: boolean
  progress: number
  totalItems: number
}

// Style presets configuration
const stylePresets: Record<QRStylePreset, Partial<QRStyleConfig>> = {
  classic: {
    preset: 'classic',
    cornerStyle: 'square',
    dotStyle: 'square',
    hasGradient: false,
    hasEyeStyle: false,
    hasFrame: false,
  },
  modern: {
    preset: 'modern',
    cornerStyle: 'rounded',
    dotStyle: 'rounded',
    hasGradient: true,
    gradientColor1: '#8B5CF6',
    gradientColor2: '#EC4899',
    hasEyeStyle: true,
    eyeColor: '#8B5CF6',
    hasFrame: false,
  },
  branded: {
    preset: 'branded',
    cornerStyle: 'extra-rounded',
    dotStyle: 'classy',
    hasGradient: false,
    hasEyeStyle: true,
    hasFrame: true,
  },
  minimalist: {
    preset: 'minimalist',
    cornerStyle: 'square',
    dotStyle: 'dots',
    hasGradient: false,
    hasEyeStyle: false,
    hasFrame: false,
  },
  professional: {
    preset: 'professional',
    cornerStyle: 'rounded',
    dotStyle: 'square',
    hasGradient: false,
    hasEyeStyle: true,
    eyeColor: '#1E293B',
    hasFrame: true,
    frameColor: '#1E293B',
  },
  vibrant: {
    preset: 'vibrant',
    cornerStyle: 'extra-rounded',
    dotStyle: 'rounded',
    hasGradient: true,
    gradientColor1: '#F59E0B',
    gradientColor2: '#EF4444',
    hasEyeStyle: true,
    eyeColor: '#DC2626',
    hasFrame: false,
  },
  ocean: {
    preset: 'ocean',
    cornerStyle: 'rounded',
    dotStyle: 'rounded',
    hasGradient: true,
    gradientColor1: '#0EA5E9',
    gradientColor2: '#06B6D4',
    hasEyeStyle: true,
    eyeColor: '#0284C7',
    hasFrame: false,
  },
  sunset: {
    preset: 'sunset',
    cornerStyle: 'extra-rounded',
    dotStyle: 'rounded',
    hasGradient: true,
    gradientColor1: '#F97316',
    gradientColor2: '#FB923C',
    hasEyeStyle: true,
    eyeColor: '#EA580C',
    hasFrame: false,
  },
  forest: {
    preset: 'forest',
    cornerStyle: 'rounded',
    dotStyle: 'classy',
    hasGradient: true,
    gradientColor1: '#10B981',
    gradientColor2: '#059669',
    hasEyeStyle: true,
    eyeColor: '#047857',
    hasFrame: false,
  },
  neon: {
    preset: 'neon',
    cornerStyle: 'extra-rounded',
    dotStyle: 'dots',
    hasGradient: true,
    gradientColor1: '#A855F7',
    gradientColor2: '#EC4899',
    hasEyeStyle: true,
    eyeColor: '#D946EF',
    hasFrame: true,
    frameColor: '#C026D3',
  },
}

// QR Code Type Operations
const QR_TYPE_OPERATIONS: ToolOperation[] = [
  { id: 'url', label: 'URL', icon: Link, color: TOOL_COLORS.primary, description: 'Website link' },
  {
    id: 'text',
    label: 'Text',
    icon: FileText,
    color: TOOL_COLORS.secondary,
    description: 'Plain text',
  },
  {
    id: 'wifi',
    label: 'WiFi',
    icon: Wifi,
    color: TOOL_COLORS.info,
    description: 'Network credentials',
  },
  {
    id: 'vcard',
    label: 'vCard',
    icon: Contact,
    color: TOOL_COLORS.purple,
    description: 'Contact info',
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: TOOL_COLORS.warning,
    description: 'Email address',
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: MessageSquare,
    color: TOOL_COLORS.teal,
    description: 'Text message',
  },
  {
    id: 'phone',
    label: 'Phone',
    icon: Phone,
    color: TOOL_COLORS.success,
    description: 'Phone number',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageSquare,
    color: TOOL_COLORS.success,
    description: 'WhatsApp chat',
  },
  {
    id: 'geo',
    label: 'Location',
    icon: MapPin,
    color: TOOL_COLORS.error,
    description: 'GPS coordinates',
  },
  {
    id: 'event',
    label: 'Event',
    icon: Calendar,
    color: TOOL_COLORS.indigo,
    description: 'Calendar event',
  },
  {
    id: 'appstore',
    label: 'App Store',
    icon: ShoppingBag,
    color: TOOL_COLORS.pink,
    description: 'App download',
  },
  {
    id: 'social',
    label: 'Social',
    icon: Globe,
    color: TOOL_COLORS.orange,
    description: 'Social media',
  },
]

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
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    to: '',
    subject: '',
    body: '',
  })
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    phone: '',
    message: '',
  })
  const [phoneConfig, setPhoneConfig] = useState<PhoneConfig>({
    phone: '',
  })
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    phone: '',
    message: '',
  })
  const [geoConfig, setGeoConfig] = useState<GeoConfig>({
    latitude: '',
    longitude: '',
    label: '',
  })
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    title: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  })
  const [appStoreConfig, setAppStoreConfig] = useState<AppStoreConfig>({
    platform: 'ios',
    appId: '',
  })
  const [socialConfig, setSocialConfig] = useState<SocialConfig>({
    platform: 'instagram',
    handle: '',
  })
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [includeMargin, setIncludeMargin] = useState(true)

  // Advanced styling state
  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>({
    preset: 'classic',
    cornerStyle: 'square',
    dotStyle: 'square',
    hasGradient: false,
    gradientColor1: '#8B5CF6',
    gradientColor2: '#EC4899',
    hasLogo: false,
    logoUrl: '',
    logoSize: 20,
    logoOpacity: 100,
    logoPosition: 'center',
    logoMask: 'none',
    eyeColor: '#000000',
    hasEyeStyle: false,
    hasFrame: false,
    frameText: '',
    frameColor: '#000000',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  // Bulk generation state
  const [bulkState, setBulkState] = useState<BulkGenerationState>({
    items: [],
    isGenerating: false,
    progress: 0,
    totalItems: 0,
  })
  const [showBulkMode, setShowBulkMode] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)

  // History state
  const [history, setHistory] = useState<QRHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<QRCodeType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const historyInputRef = useRef<HTMLInputElement>(null)

  // Enhanced export state
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportDPI, setExportDPI] = useState(300)
  const [exportQuality, setExportQuality] = useState(0.95)
  const [printTemplate, setPrintTemplate] = useState<PrintTemplate>('none')

  // Scanner state
  const [showScanner, setShowScanner] = useState(false)
  const [scannerMode, setScannerMode] = useState<'webcam' | 'file'>('webcam')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanFileInputRef = useRef<HTMLInputElement>(null)

  // Scan Analytics state
  const [enableTracking, setEnableTracking] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState<string>('')
  const [trackingCode, setTrackingCode] = useState<string>('')
  const [isCreatingTrackingUrl, setIsCreatingTrackingUrl] = useState(false)

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory())
  }, [])

  // Get filtered history
  const filteredHistory = getFilteredHistory(searchQuery, typeFilter, sortBy, showFavoritesOnly)

  // Create tracking URL for scan analytics
  const createTrackingUrl = useCallback(
    async (originalUrl: string) => {
      setIsCreatingTrackingUrl(true)
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: originalUrl }),
        })

        if (!response.ok) {
          throw new Error('Failed to create tracking URL')
        }

        const data = await response.json()
        setTrackingUrl(data.shortUrl)
        setTrackingCode(data.shortCode)
        toast.success('Tracking URL created! View analytics after scanning.')
        trackToolEvent('qr_tracking_enabled', { type })
      } catch (error) {
        console.error('Error creating tracking URL:', error)
        toast.error('Failed to create tracking URL')
        setEnableTracking(false)
      } finally {
        setIsCreatingTrackingUrl(false)
      }
    },
    [type]
  )

  // Handle tracking toggle
  useEffect(() => {
    if (enableTracking && type === 'url' && urlInput && !trackingUrl) {
      // Only create tracking URL for URL type and when URL is valid
      if (urlInput.startsWith('http://') || urlInput.startsWith('https://')) {
        createTrackingUrl(urlInput)
      } else {
        toast.error('Tracking requires a valid URL starting with http:// or https://')
        setEnableTracking(false)
      }
    } else if (!enableTracking) {
      // Clear tracking data when disabled
      setTrackingUrl('')
      setTrackingCode('')
    }
  }, [enableTracking, type, urlInput, trackingUrl, createTrackingUrl])

  const getQRValue = () => {
    switch (type) {
      case 'url':
        // Use tracking URL if analytics is enabled and tracking URL is available
        return enableTracking && trackingUrl ? trackingUrl : urlInput
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
      case 'email':
        return generateEmailQR(emailConfig)
      case 'sms':
        return generateSMSQR(smsConfig)
      case 'phone':
        return generatePhoneQR(phoneConfig)
      case 'whatsapp':
        return generateWhatsAppQR(whatsappConfig)
      case 'geo':
        return generateGeoQR(geoConfig)
      case 'event':
        return generateEventQR(eventConfig)
      case 'appstore':
        return generateAppStoreQR(appStoreConfig)
      case 'social':
        return generateSocialQR(socialConfig)
      default:
        return ''
    }
  }

  const qrValue = getQRValue()
  const hasValidInput = qrValue.trim().length > 0

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setLogoFile(file)

    // Convert to data URL for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setStyleConfig({ ...styleConfig, hasLogo: true, logoUrl: dataUrl })
      toast.success('Logo uploaded successfully')
      trackToolEvent('qr_logo_upload', { fileType: file.type })
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setStyleConfig({ ...styleConfig, hasLogo: false, logoUrl: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Logo removed')
  }

  const applyStylePreset = (preset: QRStylePreset) => {
    const presetConfig = stylePresets[preset]
    setStyleConfig({
      ...styleConfig,
      ...presetConfig,
      // Keep existing logo settings
      hasLogo: styleConfig.hasLogo,
      logoUrl: styleConfig.logoUrl,
      logoSize: styleConfig.logoSize,
      logoOpacity: styleConfig.logoOpacity,
      logoPosition: styleConfig.logoPosition,
      logoMask: styleConfig.logoMask,
    })

    // Apply preset colors to main colors if not using gradient
    if (!presetConfig.hasGradient) {
      if (preset === 'modern') {
        setFgColor('#8B5CF6')
      } else if (preset === 'professional') {
        setFgColor('#1E293B')
      } else if (preset === 'vibrant') {
        setFgColor('#F59E0B')
      }
    }

    toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} style applied`)
    trackToolEvent('qr_style_preset', { preset })
  }

  // Bulk generation handlers
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())

        if (lines.length === 0) {
          toast.error('CSV file is empty')
          return
        }

        // Parse CSV (expecting: type,content,label,customColor)
        const items: BulkQRItem[] = []
        const headers = lines[0]
          .toLowerCase()
          .split(',')
          .map((h) => h.trim())

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim())
          if (values.length < 2) continue

          const typeIdx = headers.indexOf('type')
          const contentIdx = headers.indexOf('content')
          const labelIdx = headers.indexOf('label')
          const colorIdx = headers.indexOf('color')

          const qrType = (values[typeIdx] || 'url') as QRCodeType
          const content = values[contentIdx] || ''

          if (!content) continue

          items.push({
            id: `bulk-${Date.now()}-${i}`,
            type: qrType,
            content,
            label: labelIdx >= 0 ? values[labelIdx] : `QR ${i}`,
            customColor: colorIdx >= 0 ? values[colorIdx] : undefined,
          })
        }

        if (items.length === 0) {
          toast.error('No valid QR codes found in CSV')
          return
        }

        if (items.length > 500) {
          toast.error('Maximum 500 QR codes per batch')
          return
        }

        setBulkState({
          items,
          isGenerating: false,
          progress: 0,
          totalItems: items.length,
        })
        setShowBulkMode(true)
        toast.success(`Loaded ${items.length} QR codes from CSV`)
        trackToolEvent('qr_bulk_generate', { count: items.length })
      } catch (error) {
        console.error('CSV parse error:', error)
        toast.error('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const downloadSampleCSV = () => {
    const sampleCSV = `type,content,label,color
url,https://example.com,Website QR,#000000
text,Hello World,Text QR,#8B5CF6
url,https://github.com,GitHub,#000000`

    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'qr-bulk-sample.csv'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Sample CSV downloaded')
  }

  const generateBulkQRCodes = async () => {
    if (bulkState.items.length === 0) {
      toast.error('No QR codes to generate')
      return
    }

    setBulkState({ ...bulkState, isGenerating: true, progress: 0 })

    try {
      const zip = new JSZip()
      const folder = zip.folder('qr-codes')

      for (let i = 0; i < bulkState.items.length; i++) {
        const item = bulkState.items[i]

        // Create a temporary container for QR code generation
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        document.body.appendChild(tempContainer)

        // Create React root and render QR code
        const tempSvgId = `bulk-qr-${i}`
        tempContainer.innerHTML = `<div id="${tempSvgId}"></div>`

        // Dynamically import and render QRCodeSVG
        const { renderToString } = await import('react-dom/server')
        const { QRCodeSVG } = await import('qrcode.react')

        const qrSvgString = renderToString(
          QRCodeSVG({
            value: item.content,
            size: size,
            bgColor: bgColor,
            fgColor: item.customColor || fgColor,
            level: 'H',
            includeMargin: includeMargin,
          })
        )

        // Create canvas and draw QR code
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        if (ctx) {
          // Convert SVG string to image
          const svgBlob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(svgBlob)
          const img = new Image()

          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0)
              URL.revokeObjectURL(url)
              resolve()
            }
            img.onerror = () => {
              URL.revokeObjectURL(url)
              resolve()
            }
            img.src = url
          })

          // Convert canvas to blob and add to zip
          const fileName = `${item.label?.replace(/[^a-z0-9]/gi, '_') || item.id}.png`
          await new Promise<void>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob && folder) {
                folder.file(fileName, blob)
              }
              resolve()
            })
          })
        }

        // Cleanup
        document.body.removeChild(tempContainer)

        // Update progress
        setBulkState({
          ...bulkState,
          isGenerating: true,
          progress: Math.round(((i + 1) / bulkState.items.length) * 100),
          totalItems: bulkState.items.length,
        })

        // Small delay to prevent UI freeze
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.download = `qr-codes-bulk-${Date.now()}.zip`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`Generated ${bulkState.items.length} QR codes successfully!`)
      trackToolEvent('qr_batch_export', { count: bulkState.items.length })

      setBulkState({
        items: [],
        isGenerating: false,
        progress: 0,
        totalItems: 0,
      })
      setShowBulkMode(false)
    } catch (error) {
      console.error('Bulk generation error:', error)
      toast.error('Failed to generate QR codes')
      setBulkState({ ...bulkState, isGenerating: false })
    }
  }

  const clearBulkQueue = () => {
    setBulkState({
      items: [],
      isGenerating: false,
      progress: 0,
      totalItems: 0,
    })
    setShowBulkMode(false)
    if (csvInputRef.current) {
      csvInputRef.current.value = ''
    }
    toast.success('Bulk queue cleared')
  }

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

            // Draw logo if present
            if (styleConfig.hasLogo && styleConfig.logoUrl) {
              const logoImg = new Image()
              logoImg.onload = () => {
                const logoSize = (size * styleConfig.logoSize) / 100
                const logoX = (size - logoSize) / 2
                const logoY = (size - logoSize) / 2

                ctx.globalAlpha = styleConfig.logoOpacity / 100

                // Apply mask
                if (styleConfig.logoMask === 'circle') {
                  ctx.save()
                  ctx.beginPath()
                  ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2)
                  ctx.closePath()
                  ctx.clip()
                  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
                  ctx.restore()
                } else if (styleConfig.logoMask === 'rounded') {
                  ctx.save()
                  const radius = 8
                  ctx.beginPath()
                  ctx.moveTo(logoX + radius, logoY)
                  ctx.lineTo(logoX + logoSize - radius, logoY)
                  ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + radius)
                  ctx.lineTo(logoX + logoSize, logoY + logoSize - radius)
                  ctx.quadraticCurveTo(
                    logoX + logoSize,
                    logoY + logoSize,
                    logoX + logoSize - radius,
                    logoY + logoSize
                  )
                  ctx.lineTo(logoX + radius, logoY + logoSize)
                  ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - radius)
                  ctx.lineTo(logoX, logoY + radius)
                  ctx.quadraticCurveTo(logoX, logoY, logoX + radius, logoY)
                  ctx.closePath()
                  ctx.clip()
                  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
                  ctx.restore()
                } else {
                  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
                }

                ctx.globalAlpha = 1.0

                canvas.toBlob((blob) => {
                  if (blob) {
                    const link = document.createElement('a')
                    link.download = `qrcode-${Date.now()}.png`
                    link.href = URL.createObjectURL(blob)
                    link.click()
                    URL.revokeObjectURL(link.href)
                    toast.success('QR code downloaded as PNG 🎉')
                    trackToolEvent('qr_code_download', { format: 'png', type, hasLogo: true })
                  }
                })
              }
              logoImg.src = styleConfig.logoUrl
            } else {
              canvas.toBlob((blob) => {
                if (blob) {
                  const link = document.createElement('a')
                  link.download = `qrcode-${Date.now()}.png`
                  link.href = URL.createObjectURL(blob)
                  link.click()
                  URL.revokeObjectURL(link.href)
                  toast.success('QR code downloaded as PNG 🎉')
                  trackToolEvent('qr_code_download', { format: 'png', type, hasLogo: false })
                }
              })
            }
          }
          URL.revokeObjectURL(url)
        }
        img.src = url
      } else {
        // SVG export with logo embedded
        const svg = document.getElementById('qr-code-svg')
        if (!svg) {
          toast.error('QR code not found')
          return
        }

        let svgData = new XMLSerializer().serializeToString(svg)

        // Add logo to SVG if present
        if (styleConfig.hasLogo && styleConfig.logoUrl) {
          const logoSize = (size * styleConfig.logoSize) / 100
          const logoX = (size - logoSize) / 2
          const logoY = (size - logoSize) / 2

          const logoElement = `<image href="${styleConfig.logoUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" opacity="${styleConfig.logoOpacity / 100}" ${
            styleConfig.logoMask === 'circle'
              ? `clip-path="circle(${logoSize / 2}px at ${logoSize / 2}px ${logoSize / 2}px)"`
              : styleConfig.logoMask === 'rounded'
                ? `style="border-radius: 8px;"`
                : ''
          } />`

          svgData = svgData.replace('</svg>', `${logoElement}</svg>`)
        }

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        const link = document.createElement('a')
        link.download = `qrcode-${Date.now()}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        toast.success('QR code downloaded as SVG 🎉')
        trackToolEvent('qr_code_download', {
          format: 'svg',
          type,
          hasLogo: styleConfig.hasLogo,
        })
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download QR code')
    }
  }

  // Generate QR thumbnail for history
  const generateQRThumbnail = (): string => {
    try {
      const svg = document.getElementById('qr-code-svg')
      if (!svg) return ''

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      return URL.createObjectURL(svgBlob)
    } catch {
      return ''
    }
  }

  // Load QR from history
  const handleLoadFromHistory = (item: QRHistoryItem) => {
    setType(item.type)

    // Set content based on type
    switch (item.type) {
      case 'url':
        setUrlInput(item.content)
        break
      case 'text':
        setTextInput(item.content)
        break
      case 'wifi': {
        // Parse WiFi string
        const ssidMatch = item.content.match(/S:([^;]+)/)
        const passwordMatch = item.content.match(/P:([^;]+)/)
        const encryptionMatch = item.content.match(/T:([^;]+)/)
        const hiddenMatch = item.content.match(/H:([^;]+)/)

        setWifiConfig({
          ssid: ssidMatch?.[1] || '',
          password: passwordMatch?.[1] || '',
          encryption: (encryptionMatch?.[1] as 'WPA' | 'WEP' | 'nopass') || 'WPA',
          hidden: hiddenMatch?.[1] === 'true',
        })
        break
      }
      case 'vcard': {
        // Parse vCard string (simplified)
        const fnMatch = item.content.match(/FN:([^\n]+)/)
        const phoneMatch = item.content.match(/TEL:([^\n]+)/)
        const emailMatch = item.content.match(/EMAIL:([^\n]+)/)
        const orgMatch = item.content.match(/ORG:([^\n]+)/)
        const urlMatch = item.content.match(/URL:([^\n]+)/)
        const adrMatch = item.content.match(/ADR:;;([^\n;]+)/)

        const name = fnMatch?.[1]?.split(' ') || ['', '']
        setVcardConfig({
          firstName: name[0] || '',
          lastName: name[1] || '',
          phone: phoneMatch?.[1] || '',
          email: emailMatch?.[1] || '',
          organization: orgMatch?.[1] || '',
          website: urlMatch?.[1] || '',
          address: adrMatch?.[1] || '',
        })
        break
      }
    }

    // Apply style config
    setStyleConfig(item.styleConfig as QRStyleConfig)

    toast.success('QR code loaded from history')
    trackToolEvent('qr_history_load', { type: item.type })
  }

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id)
    setHistory(getHistory())
    trackToolEvent('qr_history_favorite', {})
  }

  // Delete from history
  const handleDeleteFromHistory = (id: string) => {
    deleteHistoryItem(id)
    setHistory(getHistory())
    toast.success('QR code removed from history')
    trackToolEvent('qr_history_delete', {})
  }

  // Clear all history
  const handleClearHistory = () => {
    if (history.length === 0) {
      toast.error('History is already empty')
      return
    }

    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      clearHistory()
      setHistory([])
      toast.success('History cleared')
      trackToolEvent('qr_history_clear', {})
    }
  }

  // Export history
  const handleExportHistory = () => {
    try {
      const json = exportHistory()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qr-history-${Date.now()}.json`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      toast.success('History exported successfully')
      trackToolEvent('qr_history_export', { count: history.length })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export history')
    }
  }

  // Import history
  const handleImportHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a JSON file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const count = importHistory(json)
        setHistory(getHistory())
        toast.success(`Imported ${count} QR code${count !== 1 ? 's' : ''} successfully`)
        trackToolEvent('qr_history_import', { count })

        if (historyInputRef.current) {
          historyInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import history: Invalid format')
      }
    }
    reader.readAsText(file)
  }

  // Enhanced export handler
  const handleEnhancedExport = async () => {
    if (!hasValidInput) {
      toast.error('Please enter content to generate QR code')
      return
    }

    const svgElement = document.getElementById('qr-code-svg') as unknown as SVGSVGElement
    if (!svgElement) {
      toast.error('QR code not found')
      return
    }

    try {
      const filename = `qrcode-${Date.now()}`
      const metadata = {
        title: type === 'url' ? urlInput : 'QR Code',
        description: qrValue.substring(0, 100),
        url: type === 'url' ? urlInput : undefined,
        createdAt: new Date().toISOString(),
        qrType: type,
      }

      switch (exportFormat) {
        case 'png':
          await exportToPNG(svgElement, filename, exportDPI)
          trackToolEvent('qr_export_png_dpi', { dpi: exportDPI, type })
          toast.success(`QR code exported as PNG (${exportDPI} DPI) 🎉`)
          break
        case 'jpeg':
          await exportToJPEG(svgElement, filename, exportQuality, exportDPI)
          trackToolEvent('qr_export_jpeg', { quality: exportQuality, dpi: exportDPI, type })
          toast.success(`QR code exported as JPEG 🎉`)
          break
        case 'webp':
          await exportToWebP(svgElement, filename, exportQuality)
          trackToolEvent('qr_export_webp', { quality: exportQuality, type })
          toast.success(`QR code exported as WebP 🎉`)
          break
        case 'svg':
          exportToSVG(svgElement, filename)
          trackToolEvent('qr_code_download', { format: 'svg', type })
          toast.success(`QR code exported as SVG 🎉`)
          break
        case 'pdf':
          await exportToPDF(svgElement, filename, printTemplate, metadata)
          trackToolEvent('qr_export_pdf', { template: printTemplate, type })
          toast.success(`QR code exported as PDF 🎉`)
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export QR code')
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

          // Draw logo if present
          if (styleConfig.hasLogo && styleConfig.logoUrl) {
            const logoImg = new Image()
            logoImg.onload = async () => {
              const logoSize = (size * styleConfig.logoSize) / 100
              const logoX = (size - logoSize) / 2
              const logoY = (size - logoSize) / 2

              ctx.globalAlpha = styleConfig.logoOpacity / 100

              // Apply mask
              if (styleConfig.logoMask === 'circle') {
                ctx.save()
                ctx.beginPath()
                ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
                ctx.restore()
              } else if (styleConfig.logoMask === 'rounded') {
                ctx.save()
                const radius = 8
                ctx.beginPath()
                ctx.moveTo(logoX + radius, logoY)
                ctx.lineTo(logoX + logoSize - radius, logoY)
                ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + radius)
                ctx.lineTo(logoX + logoSize, logoY + logoSize - radius)
                ctx.quadraticCurveTo(
                  logoX + logoSize,
                  logoY + logoSize,
                  logoX + logoSize - radius,
                  logoY + logoSize
                )
                ctx.lineTo(logoX + radius, logoY + logoSize)
                ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - radius)
                ctx.lineTo(logoX, logoY + radius)
                ctx.quadraticCurveTo(logoX, logoY, logoX + radius, logoY)
                ctx.closePath()
                ctx.clip()
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
                ctx.restore()
              } else {
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
              }

              ctx.globalAlpha = 1.0

              canvas.toBlob(async (blob) => {
                if (blob) {
                  try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                    toast.success('QR code copied to clipboard 📋')
                    trackToolEvent('qr_code_copy', { type, hasLogo: true })
                  } catch (error) {
                    console.error('Copy error:', error)
                    toast.error('Failed to copy QR code')
                  }
                }
              })
            }
            logoImg.src = styleConfig.logoUrl
          } else {
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                  toast.success('QR code copied to clipboard 📋')
                  trackToolEvent('qr_code_copy', { type, hasLogo: false })
                } catch (error) {
                  console.error('Copy error:', error)
                  toast.error('Failed to copy QR code')
                }
              }
            })
          }
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy QR code')
    }
  }

  // Scanner handlers
  const handleStartWebcamScanner = async () => {
    try {
      setIsScanning(true)
      setScanResult(null)
      trackToolEvent('qr_scanner_webcam_start')

      const scanner = await startWebcamScanner(
        'qr-scanner-video',
        (result) => {
          setScanResult(result)
          setIsScanning(false)
          toast.success('QR code scanned successfully!')
          trackToolEvent('qr_scanner_webcam_success', { dataType: parseQRData(result.data).type })

          // Auto-stop scanner after successful scan
          if (scannerRef.current) {
            stopWebcamScanner(scannerRef.current)
            scannerRef.current = null
          }
        },
        (error) => {
          console.error('Scanner error:', error)
          toast.error(error)
          setIsScanning(false)
        }
      )

      scannerRef.current = scanner
    } catch (error) {
      console.error('Failed to start scanner:', error)
      toast.error('Failed to start camera scanner')
      setIsScanning(false)
    }
  }

  const handleStopWebcamScanner = () => {
    if (scannerRef.current) {
      stopWebcamScanner(scannerRef.current)
      scannerRef.current = null
      setIsScanning(false)
      toast.info('Scanner stopped')
    }
  }

  const handleScanFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    trackToolEvent('qr_scanner_file_upload')

    await scanFromFile(
      file,
      (result) => {
        setScanResult(result)
        toast.success('QR code scanned from file!')
        trackToolEvent('qr_scanner_file_success', { dataType: parseQRData(result.data).type })
      },
      (error) => {
        console.error('Failed to scan file:', error)
        toast.error('No QR code found in image')
      }
    )
  }

  const handleValidateCurrentQR = () => {
    if (!hasValidInput) {
      toast.error('Please generate a QR code first')
      return
    }

    try {
      trackToolEvent('qr_validate_run')
      const svgElement = document.getElementById('qr-code-svg') as unknown as SVGSVGElement
      if (!svgElement) {
        toast.error('QR code not found')
        return
      }

      const validation = validateQRCode(svgElement)
      setValidationResult(validation)
      trackToolEvent('qr_validate_score', { score: validation.score })

      if (validation.score >= 80) {
        toast.success(`Great! Scannability score: ${validation.score}/100`)
      } else if (validation.score >= 60) {
        toast.warning(`Good, but can be improved. Score: ${validation.score}/100`)
      } else {
        toast.error(`Poor scannability. Score: ${validation.score}/100`)
      }
    } catch (error) {
      console.error('Validation error:', error)
      toast.error('Failed to validate QR code')
    }
  }

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopWebcamScanner(scannerRef.current)
      }
    }
  }, [])

  // Save current QR to history
  const handleSaveToHistory = () => {
    if (!hasValidInput) {
      toast.error('Please generate a QR code first')
      return
    }

    try {
      const thumbnail = generateQRThumbnail()
      const _newItem = saveToHistory({
        type,
        content: qrValue,
        isFavorite: false,
        styleConfig,
        thumbnail,
      })

      setHistory(getHistory())
      toast.success('QR code saved to history')
      trackToolEvent('qr_history_save', { type })
    } catch (error) {
      console.error('Failed to save to history:', error)
      toast.error('Failed to save to history')
    }
  }

  // Keyboard shortcuts
  const { showHelp, setShowHelp, modifierKey } = useKeyboardShortcuts({
    onCopy: hasValidInput ? copyQRCode : undefined,
    onSave: hasValidInput ? handleSaveToHistory : undefined,
    onHistory: () => setShowHistory(!showHistory),
    onReset: () => {
      setUrlInput('')
      setTextInput('')
    },
  })

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

            {/* Desktop: Operation Grid */}
            <div className={css({ display: { base: 'none', md: 'block' } })}>
              <ToolOperationGrid
                operations={QR_TYPE_OPERATIONS}
                selectedOperation={type}
                onOperationChange={(newType) => setType(newType as QRCodeType)}
                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                analyticsCategory="qr_code"
              />
            </div>

            {/* Mobile: Bottom Sheet Picker */}
            <div className={css({ display: { base: 'block', md: 'none' } })}>
              <ToolMobilePicker
                label={`Type: ${QR_TYPE_OPERATIONS.find((op) => op.id === type)?.label || 'URL'}`}
                title="Choose QR Code Type"
                description="Select the type of data to encode in your QR code"
                color={QR_TYPE_OPERATIONS.find((op) => op.id === type)?.color}
              >
                <ToolOperationGrid
                  operations={QR_TYPE_OPERATIONS}
                  selectedOperation={type}
                  onOperationChange={(newType) => setType(newType as QRCodeType)}
                  columns={{ base: 1, sm: 2 }}
                  analyticsCategory="qr_code"
                />
              </ToolMobilePicker>
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
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '2',
                    })}
                  >
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
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
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

            {type === 'email' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    value={emailConfig.to}
                    onChange={(e) => setEmailConfig({ ...emailConfig, to: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Subject (optional)</FieldLabel>
                  <Input
                    placeholder="Email subject"
                    value={emailConfig.subject}
                    onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Body (optional)</FieldLabel>
                  <Textarea
                    placeholder="Email body text..."
                    value={emailConfig.body}
                    onChange={(e) => setEmailConfig({ ...emailConfig, body: e.target.value })}
                    rows={4}
                  />
                </Field>
              </div>
            )}

            {type === 'sms' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    placeholder="+1234567890"
                    value={smsConfig.phone}
                    onChange={(e) => setSmsConfig({ ...smsConfig, phone: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Message (optional)</FieldLabel>
                  <Textarea
                    placeholder="Pre-filled message text..."
                    value={smsConfig.message}
                    onChange={(e) => setSmsConfig({ ...smsConfig, message: e.target.value })}
                    rows={4}
                  />
                </Field>
              </div>
            )}

            {type === 'phone' && (
              <Field>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  placeholder="+1234567890"
                  value={phoneConfig.phone}
                  onChange={(e) => setPhoneConfig({ ...phoneConfig, phone: e.target.value })}
                />
              </Field>
            )}

            {type === 'whatsapp' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Phone Number (with country code)</FieldLabel>
                  <Input
                    placeholder="1234567890"
                    value={whatsappConfig.phone}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, phone: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Pre-filled Message (optional)</FieldLabel>
                  <Textarea
                    placeholder="Hello! I'd like to..."
                    value={whatsappConfig.message}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, message: e.target.value })
                    }
                    rows={4}
                  />
                </Field>
              </div>
            )}

            {type === 'geo' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <Field>
                    <FieldLabel>Latitude</FieldLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="37.7749"
                      value={geoConfig.latitude}
                      onChange={(e) => setGeoConfig({ ...geoConfig, latitude: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Longitude</FieldLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-122.4194"
                      value={geoConfig.longitude}
                      onChange={(e) => setGeoConfig({ ...geoConfig, longitude: e.target.value })}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Label (optional)</FieldLabel>
                  <Input
                    placeholder="Location name"
                    value={geoConfig.label}
                    onChange={(e) => setGeoConfig({ ...geoConfig, label: e.target.value })}
                  />
                </Field>
              </div>
            )}

            {type === 'event' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Event Title</FieldLabel>
                  <Input
                    placeholder="Team Meeting"
                    value={eventConfig.title}
                    onChange={(e) => setEventConfig({ ...eventConfig, title: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Location (optional)</FieldLabel>
                  <Input
                    placeholder="Conference Room A"
                    value={eventConfig.location}
                    onChange={(e) => setEventConfig({ ...eventConfig, location: e.target.value })}
                  />
                </Field>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <Field>
                    <FieldLabel>Start Date</FieldLabel>
                    <Input
                      type="date"
                      value={eventConfig.startDate}
                      onChange={(e) =>
                        setEventConfig({ ...eventConfig, startDate: e.target.value })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Start Time</FieldLabel>
                    <Input
                      type="time"
                      value={eventConfig.startTime}
                      onChange={(e) =>
                        setEventConfig({ ...eventConfig, startTime: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <Field>
                    <FieldLabel>End Date</FieldLabel>
                    <Input
                      type="date"
                      value={eventConfig.endDate}
                      onChange={(e) => setEventConfig({ ...eventConfig, endDate: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>End Time</FieldLabel>
                    <Input
                      type="time"
                      value={eventConfig.endTime}
                      onChange={(e) => setEventConfig({ ...eventConfig, endTime: e.target.value })}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Description (optional)</FieldLabel>
                  <Textarea
                    placeholder="Event details..."
                    value={eventConfig.description}
                    onChange={(e) =>
                      setEventConfig({ ...eventConfig, description: e.target.value })
                    }
                    rows={3}
                  />
                </Field>
              </div>
            )}

            {type === 'appstore' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Platform</FieldLabel>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2',
                    })}
                  >
                    {(['ios', 'android'] as const).map((platform) => (
                      <Button
                        key={platform}
                        onClick={() => setAppStoreConfig({ ...appStoreConfig, platform })}
                        variant={appStoreConfig.platform === platform ? 'default' : 'outline'}
                        size="sm"
                        className="capitalize"
                      >
                        {platform === 'ios' ? 'iOS App Store' : 'Google Play'}
                      </Button>
                    ))}
                  </div>
                </Field>
                <Field>
                  <FieldLabel>App ID</FieldLabel>
                  <Input
                    placeholder={
                      appStoreConfig.platform === 'ios'
                        ? 'e.g., 123456789'
                        : 'e.g., com.example.app'
                    }
                    value={appStoreConfig.appId}
                    onChange={(e) =>
                      setAppStoreConfig({ ...appStoreConfig, appId: e.target.value })
                    }
                  />
                </Field>
              </div>
            )}

            {type === 'social' && (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <Field>
                  <FieldLabel>Platform</FieldLabel>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                      gap: '2',
                    })}
                  >
                    {(
                      ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube'] as const
                    ).map((platform) => (
                      <Button
                        key={platform}
                        onClick={() => setSocialConfig({ ...socialConfig, platform })}
                        variant={socialConfig.platform === platform ? 'default' : 'outline'}
                        size="sm"
                        className="capitalize"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Username/Handle</FieldLabel>
                  <Input
                    placeholder={
                      socialConfig.platform === 'youtube'
                        ? '@username or channel/UCxxxxxx'
                        : '@username'
                    }
                    value={socialConfig.handle}
                    onChange={(e) => setSocialConfig({ ...socialConfig, handle: e.target.value })}
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
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
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
                    color: 'white',
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

              {type === 'url' && (
                <div className={css({ mt: '2' })}>
                  <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <input
                      type="checkbox"
                      checked={enableTracking}
                      onChange={(e) => setEnableTracking(e.target.checked)}
                      className="h-4 w-4 rounded"
                      disabled={isCreatingTrackingUrl || !urlInput}
                    />
                    <span className="text-sm">
                      Enable Scan Analytics{' '}
                      <Badge variant="secondary" className="ml-1">
                        Pro
                      </Badge>
                    </span>
                  </label>
                  <p
                    className={css({
                      mt: '1',
                      fontSize: 'xs',
                      color: 'white',
                    })}
                  >
                    Track scans with privacy-friendly analytics
                  </p>
                  {enableTracking && trackingUrl && (
                    <div
                      className={css({
                        mt: '2',
                        p: '2',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'violet.500/30',
                        bg: 'rgba(139, 92, 246, 0.1)',
                      })}
                    >
                      <p className={css({ fontSize: 'xs', color: 'white', mb: '1' })}>
                        Tracking URL created:
                      </p>
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: 'violet.300',
                          wordBreak: 'break-all',
                        })}
                      >
                        {trackingUrl}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 text-xs"
                        onClick={() => {
                          window.open(`/api/analytics/${trackingCode}`, '_blank')
                          trackToolEvent('qr_tracking_view_analytics', { type })
                        }}
                      >
                        View Analytics
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Style Presets Section */}
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
              Style Presets
            </h2>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(5, 1fr)',
                },
                gap: '3',
              })}
            >
              {(
                [
                  'classic',
                  'modern',
                  'branded',
                  'minimalist',
                  'professional',
                  'vibrant',
                  'ocean',
                  'sunset',
                  'forest',
                  'neon',
                ] as const
              ).map((preset) => (
                <Button
                  key={preset}
                  onClick={() => applyStylePreset(preset)}
                  variant={styleConfig.preset === preset ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Logo Upload Section */}
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
              Logo / Icon
            </h2>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
              {!styleConfig.hasLogo ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                  <p
                    className={css({
                      mt: '2',
                      fontSize: 'sm',
                      color: 'white',
                      textAlign: 'center',
                    })}
                  >
                    Max 5MB • PNG, JPG, SVG supported
                  </p>
                </div>
              ) : (
                <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3',
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'violet.500/30',
                      bg: 'rgba(139, 92, 246, 0.1)',
                    })}
                  >
                    <ImageIcon className="h-5 w-5 text-violet-400" />
                    <span className="flex-1 text-sm text-gray-200 truncate">
                      {logoFile?.name || 'Logo uploaded'}
                    </span>
                    <Button onClick={removeLogo} size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Field>
                    <FieldLabel>Logo Size: {styleConfig.logoSize}%</FieldLabel>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="5"
                      value={styleConfig.logoSize}
                      onChange={(e) =>
                        setStyleConfig({ ...styleConfig, logoSize: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Logo Opacity: {styleConfig.logoOpacity}%</FieldLabel>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="10"
                      value={styleConfig.logoOpacity}
                      onChange={(e) =>
                        setStyleConfig({ ...styleConfig, logoOpacity: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Logo Mask</FieldLabel>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '2',
                      })}
                    >
                      {(['none', 'circle', 'square', 'rounded'] as const).map((mask) => (
                        <Button
                          key={mask}
                          onClick={() => setStyleConfig({ ...styleConfig, logoMask: mask })}
                          variant={styleConfig.logoMask === mask ? 'default' : 'outline'}
                          size="sm"
                          className="capitalize"
                        >
                          {mask}
                        </Button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Generation Section */}
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
              Bulk QR Generation
            </h2>
            <p className={css({ fontSize: 'sm', color: 'white' })}>
              Generate up to 500 QR codes at once from a CSV file
            </p>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
              {!showBulkMode ? (
                <>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: '3',
                    })}
                  >
                    <Button
                      onClick={() => csvInputRef.current?.click()}
                      variant="default"
                      className="w-full"
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload CSV
                    </Button>
                    <Button onClick={downloadSampleCSV} variant="outline" className="w-full">
                      <FileDown className="mr-2 h-4 w-4" />
                      Download Sample
                    </Button>
                  </div>
                  <div
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'violet.500/30',
                      bg: 'rgba(139, 92, 246, 0.05)',
                    })}
                  >
                    <p className={css({ fontSize: 'sm', color: 'white', mb: '2' })}>CSV Format:</p>
                    <code
                      className={css({
                        fontSize: 'xs',
                        color: 'violet.300',
                        display: 'block',
                        fontFamily: 'mono',
                      })}
                    >
                      type,content,label,color
                      <br />
                      url,https://example.com,Website,#000000
                    </code>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={css({
                      p: '4',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'violet.500/30',
                      bg: 'rgba(139, 92, 246, 0.1)',
                    })}
                  >
                    <div
                      className={css({ display: 'flex', justifyContent: 'space-between', mb: '2' })}
                    >
                      <span className={css({ fontSize: 'sm', color: 'gray.200' })}>
                        {bulkState.items.length} QR codes ready
                      </span>
                      {bulkState.isGenerating && (
                        <span className={css({ fontSize: 'sm', color: 'violet.300' })}>
                          {bulkState.progress}%
                        </span>
                      )}
                    </div>
                    {bulkState.isGenerating && (
                      <div
                        className={css({
                          w: 'full',
                          h: '2',
                          bg: 'gray.700',
                          rounded: 'full',
                          overflow: 'hidden',
                        })}
                      >
                        <div
                          className={css({
                            h: 'full',
                            bg: 'violet.500',
                            transition: 'width 0.3s ease',
                          })}
                          style={{ width: `${bulkState.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: '3',
                    })}
                  >
                    <Button
                      onClick={generateBulkQRCodes}
                      disabled={bulkState.isGenerating || bulkState.items.length === 0}
                      variant="default"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate & Download ZIP
                    </Button>
                    <Button
                      onClick={clearBulkQueue}
                      disabled={bulkState.isGenerating}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Queue
                    </Button>
                  </div>
                </>
              )}
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
                <div ref={qrRef} className={css({ position: 'relative', display: 'inline-block' })}>
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={qrValue}
                    size={size}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    level="H"
                    includeMargin={includeMargin}
                  />
                  {styleConfig.hasLogo && styleConfig.logoUrl && (
                    <div
                      className={css({
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                      style={{
                        width: `${(size * styleConfig.logoSize) / 100}px`,
                        height: `${(size * styleConfig.logoSize) / 100}px`,
                        opacity: styleConfig.logoOpacity / 100,
                      }}
                    >
                      <img
                        src={styleConfig.logoUrl}
                        alt="Logo"
                        className={css({
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        })}
                        style={{
                          borderRadius:
                            styleConfig.logoMask === 'circle'
                              ? '50%'
                              : styleConfig.logoMask === 'rounded'
                                ? '8px'
                                : styleConfig.logoMask === 'square'
                                  ? '0'
                                  : '0',
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className={css({ textAlign: 'center' })}>
                  <QrCode
                    className={css({
                      mx: 'auto',
                      h: '16',
                      w: '16',
                      color: 'white',
                      opacity: 0.5,
                    })}
                  />
                  <p className={css({ mt: '2', color: 'white' })}>
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
              <Button
                onClick={handleSaveToHistory}
                disabled={!hasValidInput}
                variant="outline"
                className={css({ flex: '1' })}
              >
                <History className="mr-2 h-4 w-4" />
                Save to History
              </Button>
            </div>
          </div>

          {/* Enhanced Export Options */}
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'emerald.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <h2
                className={css({
                  fontSize: { base: 'lg', sm: 'xl' },
                  fontWeight: 'bold',
                  color: 'emerald.300',
                })}
              >
                Enhanced Export Options
              </h2>
              <Button
                onClick={() => setShowExportOptions(!showExportOptions)}
                variant="ghost"
                size="sm"
              >
                {showExportOptions ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showExportOptions && (
              <>
                <p className={css({ fontSize: 'sm', color: 'white' })}>
                  Export your QR code in various formats with professional quality settings for
                  printing and digital use.
                </p>

                <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                  {/* Format Selection */}
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                      })}
                    >
                      <FileText className="mr-2 h-4 w-4 inline" />
                      Export Format
                    </div>
                    <select
                      value={exportFormat}
                      onChange={(e) =>
                        setExportFormat(e.target.value as 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf')
                      }
                      className={css({
                        w: 'full',
                        px: '3',
                        py: '2',
                        bg: 'rgba(17, 24, 39, 0.8)',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        rounded: 'lg',
                        color: 'white',
                        fontSize: 'sm',
                        _focus: {
                          outline: 'none',
                          borderColor: 'emerald.500',
                          ring: '2px',
                          ringColor: 'emerald.500/20',
                        },
                      })}
                    >
                      <option value="png">PNG - High quality raster (best for web)</option>
                      <option value="jpeg">JPEG - Compressed raster (smaller file size)</option>
                      <option value="webp">WebP - Modern format (best compression)</option>
                      <option value="svg">SVG - Vector format (scalable)</option>
                      <option value="pdf">PDF - Print-ready document</option>
                    </select>
                  </div>

                  {/* DPI Selection (PNG/JPEG only) */}
                  {(exportFormat === 'png' || exportFormat === 'jpeg') && (
                    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        })}
                      >
                        <Settings className="mr-2 h-4 w-4 inline" />
                        DPI (Dots Per Inch) - {exportDPI}
                      </div>
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                        <input
                          type="range"
                          min="72"
                          max="600"
                          step="78"
                          value={exportDPI}
                          onChange={(e) => setExportDPI(Number(e.target.value))}
                          className={css({
                            flex: '1',
                            h: '2',
                            bg: 'gray.700',
                            rounded: 'full',
                            appearance: 'none',
                            cursor: 'pointer',
                            _focusVisible: {
                              outline: '2px solid',
                              outlineColor: 'emerald.500',
                              outlineOffset: '2px',
                            },
                          })}
                        />
                        <span
                          className={css({
                            fontSize: 'xs',
                            color: 'white',
                            minW: '20',
                            textAlign: 'right',
                          })}
                        >
                          {exportDPI === 72 && 'Screen (72)'}
                          {exportDPI === 150 && 'Standard (150)'}
                          {exportDPI === 300 && 'Print (300)'}
                          {exportDPI === 378 && 'High (378)'}
                          {exportDPI === 456 && 'Pro (456)'}
                          {exportDPI === 534 && 'Ultra (534)'}
                          {exportDPI === 600 && 'Max (600)'}
                        </span>
                      </div>
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        72 DPI for screens, 150+ for standard printing, 300+ for professional
                        printing
                      </p>
                    </div>
                  )}

                  {/* Quality Selection (JPEG/WebP only) */}
                  {(exportFormat === 'jpeg' || exportFormat === 'webp') && (
                    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        })}
                      >
                        <Settings className="mr-2 h-4 w-4 inline" />
                        Quality - {Math.round(exportQuality * 100)}%
                      </div>
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={exportQuality}
                          onChange={(e) => setExportQuality(Number(e.target.value))}
                          className={css({
                            flex: '1',
                            h: '2',
                            bg: 'gray.700',
                            rounded: 'full',
                            appearance: 'none',
                            cursor: 'pointer',
                            _focusVisible: {
                              outline: '2px solid',
                              outlineColor: 'emerald.500',
                              outlineOffset: '2px',
                            },
                          })}
                        />
                        <span
                          className={css({
                            fontSize: 'xs',
                            color: 'white',
                            minW: '20',
                            textAlign: 'right',
                          })}
                        >
                          {exportQuality <= 0.5 && 'Low'}
                          {exportQuality > 0.5 && exportQuality < 0.8 && 'Medium'}
                          {exportQuality >= 0.8 && 'High'}
                        </span>
                      </div>
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Higher quality = larger file size. Recommended: 80% or higher
                      </p>
                    </div>
                  )}

                  {/* Print Template Selection (PDF only) */}
                  {exportFormat === 'pdf' && (
                    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        })}
                      >
                        <Printer className="mr-2 h-4 w-4 inline" />
                        Print Template
                      </div>
                      <select
                        value={printTemplate}
                        onChange={(e) =>
                          setPrintTemplate(
                            e.target.value as
                              | 'business-card'
                              | 'flyer'
                              | 'product-label'
                              | 'a4-sheet'
                          )
                        }
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          bg: 'rgba(17, 24, 39, 0.8)',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          rounded: 'lg',
                          color: 'white',
                          fontSize: 'sm',
                          _focus: {
                            outline: 'none',
                            borderColor: 'emerald.500',
                            ring: '2px',
                            ringColor: 'emerald.500/20',
                          },
                        })}
                      >
                        <option value="business-card">Business Card (3.5" × 2")</option>
                        <option value="flyer">Flyer (8.5" × 11")</option>
                        <option value="product-label">Product Label (4" × 6")</option>
                        <option value="a4-sheet">A4 Sheet (210mm × 297mm)</option>
                      </select>
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Choose a template optimized for your printing needs
                      </p>
                    </div>
                  )}

                  {/* File Size Estimation */}
                  <div
                    className={css({
                      p: '3',
                      bg: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid',
                      borderColor: 'emerald.500/30',
                      rounded: 'lg',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <PackageOpen className="h-4 w-4 text-emerald.400" />
                      <span className={css({ fontSize: 'sm', color: 'white' })}>
                        Estimated File Size:{' '}
                        <strong className={css({ color: 'emerald.400' })}>
                          {exportFormat === 'png' &&
                            (exportDPI <= 150
                              ? '~50-100 KB'
                              : exportDPI <= 300
                                ? '~100-200 KB'
                                : '~200-500 KB')}
                          {exportFormat === 'jpeg' &&
                            (exportQuality <= 0.5
                              ? '~20-50 KB'
                              : exportQuality <= 0.8
                                ? '~50-100 KB'
                                : '~100-150 KB')}
                          {exportFormat === 'webp' &&
                            (exportQuality <= 0.5
                              ? '~15-40 KB'
                              : exportQuality <= 0.8
                                ? '~40-80 KB'
                                : '~80-120 KB')}
                          {exportFormat === 'svg' && '~2-5 KB'}
                          {exportFormat === 'pdf' &&
                            (printTemplate === 'business-card'
                              ? '~50-100 KB'
                              : printTemplate === 'product-label'
                                ? '~100-200 KB'
                                : '~200-400 KB')}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Export Button */}
                  <Button
                    onClick={handleEnhancedExport}
                    disabled={!hasValidInput}
                    className={css({
                      w: 'full',
                      bg: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))',
                      _hover: {
                        bg: 'linear-gradient(135deg, rgb(5, 150, 105), rgb(4, 120, 87))',
                      },
                    })}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export with Options
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* QR Scanner & Validator Section */}
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'cyan.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <h2
                className={css({
                  fontSize: { base: 'lg', sm: 'xl' },
                  fontWeight: 'bold',
                  color: 'cyan.300',
                })}
              >
                QR Scanner & Validator
              </h2>
              <Button onClick={() => setShowScanner(!showScanner)} variant="ghost" size="sm">
                {showScanner ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showScanner && (
              <>
                <p className={css({ fontSize: 'sm', color: 'white' })}>
                  Scan QR codes using your webcam or upload an image. Validate your generated QR
                  codes for scannability and get optimization recommendations.
                </p>

                {/* Scanner Mode Tabs */}
                <div
                  className={css({
                    display: 'flex',
                    gap: '2',
                    borderBottom: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <button
                    type="button"
                    onClick={() => setScannerMode('webcam')}
                    className={css({
                      px: '4',
                      py: '2',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      bg: scannerMode === 'webcam' ? 'cyan.500/20' : 'transparent',
                      color: scannerMode === 'webcam' ? 'cyan.300' : 'gray.400',
                      borderBottom: scannerMode === 'webcam' ? '2px solid' : 'none',
                      borderBottomColor: 'cyan.500',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: 'cyan.500/10',
                        color: 'cyan.200',
                      },
                    })}
                  >
                    <Camera className="inline mr-2 h-4 w-4" />
                    Webcam Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannerMode('file')}
                    className={css({
                      px: '4',
                      py: '2',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      bg: scannerMode === 'file' ? 'cyan.500/20' : 'transparent',
                      color: scannerMode === 'file' ? 'cyan.300' : 'gray.400',
                      borderBottom: scannerMode === 'file' ? '2px solid' : 'none',
                      borderBottomColor: 'cyan.500',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: 'cyan.500/10',
                        color: 'cyan.200',
                      },
                    })}
                  >
                    <Upload className="inline mr-2 h-4 w-4" />
                    Upload Image
                  </button>
                </div>

                {/* Webcam Scanner */}
                {scannerMode === 'webcam' && (
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                    <div
                      id="qr-scanner-video"
                      className={css({
                        w: 'full',
                        minH: '300px',
                        bg: 'gray.900',
                        rounded: 'lg',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      })}
                    >
                      {!isScanning && (
                        <div className={css({ textAlign: 'center', color: 'white', p: '6' })}>
                          <ScanLine className="mx-auto h-12 w-12 mb-3" />
                          <p>Click Start Scanner to begin</p>
                        </div>
                      )}
                    </div>
                    <div className={css({ display: 'flex', gap: '3' })}>
                      {!isScanning ? (
                        <Button
                          onClick={handleStartWebcamScanner}
                          className={css({ flex: '1', bg: 'cyan.600', _hover: { bg: 'cyan.700' } })}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Start Scanner
                        </Button>
                      ) : (
                        <Button
                          onClick={handleStopWebcamScanner}
                          variant="outline"
                          className={css({ flex: '1', borderColor: 'red.500', color: 'red.400' })}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Stop Scanner
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* File Upload Scanner */}
                {scannerMode === 'file' && (
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                    <button
                      type="button"
                      onClick={() => scanFileInputRef.current?.click()}
                      className={css({
                        w: 'full',
                        minH: '200px',
                        bg: 'gray.900',
                        border: '2px dashed',
                        borderColor: 'cyan.500/30',
                        rounded: 'lg',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'cyan.500/50',
                          bg: 'gray.800',
                        },
                      })}
                    >
                      <Upload className="h-12 w-12 text-cyan.400 mb-3" />
                      <p className={css({ color: 'white', fontSize: 'sm' })}>
                        Click to upload QR code image
                      </p>
                      <p className={css({ color: 'white', fontSize: 'xs', mt: '2' })}>
                        PNG, JPG, or WebP
                      </p>
                    </button>
                    <input
                      ref={scanFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleScanFromFile}
                      className={css({ display: 'none' })}
                    />
                    {/* Hidden element for file scanning */}
                    <div id="qr-scanner-file-temp" style={{ display: 'none' }} />
                  </div>
                )}

                {/* Scan Result Display */}
                {scanResult && (
                  <div
                    className={css({
                      p: '4',
                      bg: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid',
                      borderColor: 'cyan.500/30',
                      rounded: 'lg',
                    })}
                  >
                    <div
                      className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '3' })}
                    >
                      <CheckCircle2 className="h-5 w-5 text-cyan.400" />
                      <span
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'cyan.300' })}
                      >
                        Scan Result
                      </span>
                    </div>
                    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                      <div>
                        <span className={css({ fontSize: 'xs', color: 'white' })}>Type: </span>
                        <Badge variant="outline" className={css({ ml: '2' })}>
                          {parseQRData(scanResult.data).type.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className={css({ fontSize: 'xs', color: 'white' })}>Data: </span>
                        <span
                          className={css({
                            fontSize: 'sm',
                            color: 'gray.200',
                            wordBreak: 'break-all',
                          })}
                        >
                          {scanResult.data.length > 100
                            ? `${scanResult.data.substring(0, 100)}...`
                            : scanResult.data}
                        </span>
                      </div>
                      <div>
                        <span className={css({ fontSize: 'xs', color: 'white' })}>Parsed: </span>
                        <span className={css({ fontSize: 'sm', color: 'cyan.300' })}>
                          {parseQRData(scanResult.data).displayText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Section */}
                <div className={css({ borderTop: '1px solid', borderColor: 'gray.700', pt: '4' })}>
                  <h3
                    className={css({
                      fontSize: 'md',
                      fontWeight: 'semibold',
                      color: 'cyan.300',
                      mb: '3',
                    })}
                  >
                    Validate Generated QR Code
                  </h3>
                  <Button
                    onClick={handleValidateCurrentQR}
                    disabled={!hasValidInput}
                    variant="outline"
                    className={css({ w: 'full', borderColor: 'cyan.500', color: 'cyan.400' })}
                  >
                    <ScanLine className="mr-2 h-4 w-4" />
                    Validate Current QR Code
                  </Button>
                </div>

                {/* Validation Results */}
                {validationResult && (
                  <div
                    className={css({
                      p: '4',
                      bg:
                        validationResult.score >= 80
                          ? 'rgba(16, 185, 129, 0.1)'
                          : validationResult.score >= 60
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid',
                      borderColor:
                        validationResult.score >= 80
                          ? 'emerald.500/30'
                          : validationResult.score >= 60
                            ? 'amber.500/30'
                            : 'red.500/30',
                      rounded: 'lg',
                    })}
                  >
                    <div
                      className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '3' })}
                    >
                      {validationResult.score >= 80 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald.400" />
                      ) : (
                        <AlertTriangle
                          className={css({
                            h: '5',
                            w: '5',
                            color: validationResult.score >= 60 ? 'amber.400' : 'red.400',
                          })}
                        />
                      )}
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color:
                            validationResult.score >= 80
                              ? 'emerald.300'
                              : validationResult.score >= 60
                                ? 'amber.300'
                                : 'red.300',
                        })}
                      >
                        Scannability Score: {validationResult.score}/100
                      </span>
                    </div>

                    {validationResult.issues.length > 0 && (
                      <div className={css({ mb: '3' })}>
                        <p
                          className={css({
                            fontSize: 'xs',
                            fontWeight: 'medium',
                            color: 'white',
                            mb: '2',
                          })}
                        >
                          Issues:
                        </p>
                        <ul
                          className={css({
                            listStyle: 'disc',
                            pl: '5',
                            fontSize: 'xs',
                            color: 'white',
                          })}
                        >
                          {validationResult.issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.recommendations.length > 0 && (
                      <div>
                        <p
                          className={css({
                            fontSize: 'xs',
                            fontWeight: 'medium',
                            color: 'white',
                            mb: '2',
                          })}
                        >
                          Recommendations:
                        </p>
                        <ul
                          className={css({
                            listStyle: 'disc',
                            pl: '5',
                            fontSize: 'xs',
                            color: 'white',
                          })}
                        >
                          {validationResult.recommendations.map((rec) => (
                            <li key={rec}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div
                      className={css({
                        mt: '3',
                        pt: '3',
                        borderTop: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    >
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Estimated Scan Distance:{' '}
                        <strong className={css({ color: 'gray.200' })}>
                          {validationResult.details.estimatedScanDistance}
                        </strong>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* History Section */}
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
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <h2
                className={css({
                  fontSize: { base: 'lg', sm: 'xl' },
                  fontWeight: 'bold',
                  color: 'violet.300',
                })}
              >
                History & Management
              </h2>
              <Button onClick={() => setShowHistory(!showHistory)} variant="ghost" size="sm">
                {showHistory ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showHistory && (
              <>
                <p className={css({ fontSize: 'sm', color: 'white' })}>
                  {history.length === 0
                    ? 'No saved QR codes yet. Generate and save QR codes to see them here.'
                    : `${history.length} saved QR code${history.length !== 1 ? 's' : ''} (max 20)`}
                </p>

                {history.length > 0 && (
                  <>
                    {/* Search and Filter Controls */}
                    <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                      <div className={css({ position: 'relative' })}>
                        <Search
                          className={css({
                            position: 'absolute',
                            left: '3',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            h: '4',
                            w: '4',
                            color: 'white',
                          })}
                        />
                        <Input
                          type="text"
                          placeholder="Search by content, label, or type..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={css({ pl: '10' })}
                        />
                      </div>

                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: {
                            base: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                          },
                          gap: '2',
                        })}
                      >
                        <Field>
                          <FieldLabel>Type</FieldLabel>
                          <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as QRCodeType | 'all')}
                            className={css({
                              w: 'full',
                              rounded: 'md',
                              border: '1px solid',
                              borderColor: 'violet.500/30',
                              bg: 'rgba(17, 24, 39, 0.5)',
                              px: '3',
                              py: '2',
                              fontSize: 'sm',
                              color: 'gray.200',
                              _focus: { outline: 'none', borderColor: 'violet.500' },
                            })}
                          >
                            <option value="all">All Types</option>
                            <option value="url">URL</option>
                            <option value="text">Text</option>
                            <option value="wifi">WiFi</option>
                            <option value="vcard">vCard</option>
                          </select>
                        </Field>

                        <Field>
                          <FieldLabel>Sort</FieldLabel>
                          <select
                            value={sortBy}
                            onChange={(e) =>
                              setSortBy(e.target.value as 'newest' | 'oldest' | 'favorites')
                            }
                            className={css({
                              w: 'full',
                              rounded: 'md',
                              border: '1px solid',
                              borderColor: 'violet.500/30',
                              bg: 'rgba(17, 24, 39, 0.5)',
                              px: '3',
                              py: '2',
                              fontSize: 'sm',
                              color: 'gray.200',
                              _focus: { outline: 'none', borderColor: 'violet.500' },
                            })}
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="favorites">Favorites First</option>
                          </select>
                        </Field>

                        <Button
                          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                          variant={showFavoritesOnly ? 'default' : 'outline'}
                          size="sm"
                          className={css({ h: '10', alignSelf: 'end' })}
                        >
                          <Star
                            className={css({
                              mr: '2',
                              h: '4',
                              w: '4',
                              fill: showFavoritesOnly ? 'currentColor' : 'none',
                            })}
                          />
                          Favorites
                        </Button>

                        <Button
                          onClick={handleClearHistory}
                          variant="outline"
                          size="sm"
                          className={css({ h: '10', alignSelf: 'end' })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear All
                        </Button>
                      </div>

                      {/* Export/Import Controls */}
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: '2',
                        })}
                      >
                        <Button onClick={handleExportHistory} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export History (JSON)
                        </Button>
                        <div>
                          <input
                            ref={historyInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImportHistory}
                            className="hidden"
                          />
                          <Button
                            onClick={() => historyInputRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Import History (JSON)
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* History Grid */}
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: {
                          base: '1fr',
                          sm: 'repeat(2, 1fr)',
                          lg: 'repeat(3, 1fr)',
                        },
                        gap: '4',
                        mt: '2',
                      })}
                    >
                      {filteredHistory.length === 0 ? (
                        <div
                          className={css({
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            py: '8',
                            color: 'white',
                          })}
                        >
                          No matching QR codes found
                        </div>
                      ) : (
                        filteredHistory.map((item) => (
                          <div
                            key={item.id}
                            className={css({
                              rounded: 'lg',
                              border: '1px solid',
                              borderColor: item.isFavorite ? 'violet.500/50' : 'violet.500/20',
                              bg: 'rgba(17, 24, 39, 0.3)',
                              p: '3',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '3',
                              transition: 'all 0.2s',
                              _hover: { borderColor: 'violet.500/70', bg: 'rgba(17, 24, 39, 0.5)' },
                            })}
                          >
                            {/* Thumbnail */}
                            <button
                              type="button"
                              className={css({
                                w: 'full',
                                aspectRatio: '1',
                                rounded: 'md',
                                bg: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: 'none',
                                p: '0',
                              })}
                              onClick={() => handleLoadFromHistory(item)}
                            >
                              <img
                                src={item.thumbnail}
                                alt="QR Code"
                                className={css({ w: 'full', h: 'full', objectFit: 'contain' })}
                              />
                            </button>

                            {/* Info */}
                            <div
                              className={css({
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2',
                              })}
                            >
                              <div
                                className={css({
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                })}
                              >
                                <Badge className="capitalize">{item.type}</Badge>
                                <button
                                  onClick={() => handleToggleFavorite(item.id)}
                                  className={css({
                                    p: '1',
                                    rounded: 'sm',
                                    transition: 'all 0.2s',
                                    _hover: { bg: 'rgba(139, 92, 246, 0.2)' },
                                  })}
                                  type="button"
                                  aria-label={
                                    item.isFavorite ? 'Remove from favorites' : 'Add to favorites'
                                  }
                                >
                                  <Star
                                    className={css({
                                      h: '4',
                                      w: '4',
                                      color: 'violet.400',
                                      fill: item.isFavorite ? 'currentColor' : 'none',
                                    })}
                                  />
                                </button>
                              </div>

                              <p
                                className={css({
                                  fontSize: 'xs',
                                  color: 'white',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                })}
                              >
                                {item.label || item.content}
                              </p>

                              <p className={css({ fontSize: 'xs', color: 'white' })}>
                                {new Date(item.timestamp).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Actions */}
                            <div
                              className={css({
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '2',
                              })}
                            >
                              <Button
                                onClick={() => handleLoadFromHistory(item)}
                                size="sm"
                                variant="outline"
                                className={css({ fontSize: 'xs' })}
                              >
                                Load
                              </Button>
                              <Button
                                onClick={() => handleDeleteFromHistory(item.id)}
                                size="sm"
                                variant="ghost"
                                className={css({ fontSize: 'xs' })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
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
                <span className={css({ fontSize: 'sm', color: 'white' })}>
                  URL, Text, WiFi, vCard support
                </span>
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>Customizable</Badge>
                <span className={css({ fontSize: 'sm', color: 'white' })}>
                  Colors, size, and margins
                </span>
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>High Resolution</Badge>
                <span className={css({ fontSize: 'sm', color: 'white' })}>
                  Up to 512px with error correction
                </span>
              </div>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge>Multiple Formats</Badge>
                <span className={css({ fontSize: 'sm', color: 'white' })}>PNG and SVG exports</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips Section */}
      <Card
        className={css({
          border: '2px solid',
          borderColor: 'cyan.500/20',
          bg: 'rgba(6, 182, 212, 0.05)',
          backdropFilter: 'blur(16px)',
          animation: 'slideInFromBottom 0.5s ease-out 0.1s both',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Sparkles className={css({ h: '5', w: '5', color: 'cyan.400' })} />
            Pro Tips
          </CardTitle>
          <CardDescription>
            Expert advice for creating effective QR codes that scan perfectly every time
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
              <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>Optimize for Print:</strong> Always
                use SVG format for printed materials (business cards, posters, packaging) as they
                scale infinitely without pixelation. For best results, ensure minimum 2cm × 2cm size
                and test scannability at the actual print size before mass production.
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
              <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>Logo Integration Done Right:</strong>{' '}
                When adding a logo, increase error correction to H (highest) and keep logo size
                under 20% of the QR code area. Ensure your logo has good contrast with the QR code
                background and test scanning from multiple angles and distances.
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
              <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>Color Contrast Matters:</strong> Dark
                foreground on light background works best (70% contrast minimum). Avoid low contrast
                combinations, inverted colors on glossy surfaces, or gradient foregrounds that
                reduce scannability. Test your color scheme with the validation tool before
                deployment.
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
              <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>
                  Dynamic QR Codes for Campaigns:
                </strong>{' '}
                Use URL shorteners with tracking for marketing campaigns instead of encoding long
                URLs directly. This lets you update the destination without reprinting, track scan
                analytics, A/B test landing pages, and gather geographic data on user engagement.
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
              <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'cyan.300' })}>Strategic Placement Tips:</strong>{' '}
                Position QR codes at eye level (4-5 feet), ensure adequate lighting, provide
                scanning distance guidance (arm's length for 2cm codes), avoid curved surfaces that
                distort the pattern, and always include a text fallback URL for accessibility.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SocialShare
        toolName="QR Code Generator"
        toolUrl="/tools/qr-code"
        description="Create custom QR codes for free - URLs, WiFi, vCards, and more with instant generation and high-resolution downloads"
        hashtags={['QRCode', 'Marketing', 'Business', 'WebDev']}
      />
      <RelatedTools currentToolPath="/tools/qr-code" category="productivity" />
      <ToolRating toolId="/tools/qr-code" toolName="QR Code Generator" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={[
          { key: `${modifierKey}+C`, label: 'Copy', description: 'Copy QR code' },
          { key: `${modifierKey}+S`, label: 'Save', description: 'Save to history' },
          { key: `${modifierKey}+H`, label: 'History', description: 'Toggle history panel' },
          { key: `${modifierKey}+R`, label: 'Reset', description: 'Reset form' },
          { key: `${modifierKey}+/`, label: 'Help', description: 'Show this help' },
        ]}
      />
    </main>
  )
}
