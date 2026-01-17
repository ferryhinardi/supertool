'use client'

import { AnimatePresence, motion, Reorder } from 'framer-motion'
import {
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileUp,
  GripVertical,
  History,
  Loader2,
  QrCode,
  RotateCcw,
  Search,
  Share2,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { QRCodeSVG } from 'qrcode.react'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { supabase } from '@/lib/auth/supabaseClient'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_CONCURRENT_UPLOADS = 3
const HISTORY_STORAGE_KEY = 'uploadToolHistory'
const FAVORITES_STORAGE_KEY = 'uploadToolFavorites'
const MAX_HISTORY_ITEMS = 100

// Expiration options in milliseconds
const EXPIRATION_OPTIONS = [
  { label: '1 Hour', value: 60 * 60 * 1000 },
  { label: '24 Hours', value: 24 * 60 * 60 * 1000 },
  { label: '7 Days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 Days', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Never', value: 0 },
] as const

// Types
interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  publicUrl?: string
  error?: string
}

interface UploadHistoryItem {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  publicUrl: string
  uploadedAt: number
  expiresAt?: number // Optional expiration timestamp
}

interface FavoriteItem {
  id: string
  fileName: string
  publicUrl: string
  addedAt: number
}

interface ShareModalState {
  isOpen: boolean
  url: string
  fileName: string
}

interface QRModalState {
  isOpen: boolean
  url: string
  fileName: string
}

// FAQ Data
const faqs = [
  {
    question: 'What is the maximum file size I can upload?',
    answer:
      'The maximum file size per upload is 10MB. This limit ensures fast and reliable uploads while keeping the service free for all users. For larger files, consider using compression or splitting your content into smaller parts.',
  },
  {
    question: 'How long are uploaded files stored?',
    answer:
      'Files are stored securely in cloud storage with CDN delivery. Public URLs remain accessible as long as the storage service is active. For sensitive files, consider using expiring links or password protection (coming soon).',
  },
  {
    question: 'Can I upload multiple files at once?',
    answer:
      'Yes! You can select multiple files at once or drag and drop several files into the upload zone. Files are uploaded in parallel with up to 3 concurrent uploads for optimal speed. You can reorder files in the queue by dragging them.',
  },
  {
    question: 'What file types are supported?',
    answer:
      'All common file types are supported including images (JPG, PNG, GIF, WebP, SVG), documents (PDF, DOC, DOCX, TXT), videos (MP4, WebM, MOV), audio (MP3, WAV, OGG), and archives (ZIP, RAR). There are no restrictions on file extensions.',
  },
  {
    question: 'Are my uploads private and secure?',
    answer:
      'Files are uploaded to secure cloud storage with encryption in transit. Public URLs can be shared with anyone who has the link. For additional security, avoid uploading sensitive personal data and use unique file names.',
  },
  {
    question: 'Can I track my upload history?',
    answer:
      'Yes! Your upload history is automatically saved locally in your browser. You can view past uploads, copy URLs again, add files to favorites for quick access, search through history, and export your upload history to CSV format.',
  },
]

// Related Tools
const _relatedTools = [
  {
    name: 'Image Converter',
    href: '/tools/media/image-converter',
    description: 'Convert images between formats',
  },
  {
    name: 'PDF Tools',
    href: '/tools/productivity/pdf-tools',
    description: 'Merge, split, and edit PDFs',
  },
  {
    name: 'QR Code Generator',
    href: '/tools/productivity/qr-code',
    description: 'Generate QR codes for your links',
  },
]

// Utility Functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function anonymizeFileName(fileName: string): string {
  // For analytics - don't track actual file names
  const ext = fileName.split('.').pop() || 'unknown'
  return `file.${ext}`
}

// Format remaining time for expiring links
function formatTimeRemaining(expiresAt: number): string {
  const now = Date.now()
  const remaining = expiresAt - now

  if (remaining <= 0) return 'Expired'

  const seconds = Math.floor(remaining / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h ${minutes % 60}m left`
  if (minutes > 0) return `${minutes}m left`
  return `${seconds}s left`
}

// Check if a link has expired
function isExpired(expiresAt?: number): boolean {
  if (!expiresAt || expiresAt === 0) return false
  return Date.now() > expiresAt
}

// Download QR code as PNG
function downloadQRCode(svgElement: SVGSVGElement | null, fileName: string): void {
  if (!svgElement) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    canvas.width = img.width * 2 // 2x for better quality
    canvas.height = img.height * 2
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = `qr-${fileName.replace(/\.[^/.]+$/, '')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  img.src = url
}

// Main Component Content
function UploadToolContent() {
  // URL state for tab management
  const [activeTab, setActiveTab] = useQueryState('tab', parseAsString.withDefault('upload'))

  // File queue state
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // History state with lazy initialization
  const [history, setHistory] = useState<UploadHistoryItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Favorites state with lazy initialization
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // UI state
  const [copied, setCopied] = useState<string | null>(null)
  const [historySearch, setHistorySearch] = useState('')

  // Modal states for sharing features
  const [qrModal, setQrModal] = useState<QRModalState>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const [shareModal, setShareModal] = useState<ShareModalState>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const [selectedExpiration, setSelectedExpiration] = useState<number>(0)

  // Ref for QR code SVG element
  const qrCodeRef = useRef<SVGSVGElement>(null)

  // Persist history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (history.length > 0) {
        localStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS))
        )
      } else {
        localStorage.removeItem(HISTORY_STORAGE_KEY)
      }
    }
  }, [history])

  // Persist favorites to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (favorites.length > 0) {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
      } else {
        localStorage.removeItem(FAVORITES_STORAGE_KEY)
      }
    }
  }, [favorites])

  // Track page visit
  useEffect(() => {
    trackToolEvent('upload_tool_open', {})
  }, [])

  // Filtered history based on search
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history
    const query = historySearch.toLowerCase()
    return history.filter(
      (item) =>
        item.fileName.toLowerCase().includes(query) || item.fileType.toLowerCase().includes(query)
    )
  }, [history, historySearch])

  // Handle file selection
  const handleFilesSelected = useCallback((files: FileList) => {
    const newFiles: QueuedFile[] = Array.from(files).map((file) => ({
      id: generateFileId(),
      file,
      status: 'pending' as const,
      progress: 0,
    }))

    setFileQueue((prev) => [...prev, ...newFiles])
    toast.info(`Added ${files.length} file${files.length > 1 ? 's' : ''} to queue`)

    trackToolEvent('upload_files_selected', {
      count: files.length,
      total_size: Array.from(files).reduce((sum, f) => sum + f.size, 0),
    })
  }, [])

  // Upload a single file
  const uploadFile = useCallback(async (queuedFile: QueuedFile): Promise<QueuedFile> => {
    const { file, id } = queuedFile

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        ...queuedFile,
        status: 'error',
        error: `File exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
      }
    }

    try {
      // Update status to uploading
      setFileQueue((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'uploading' as const, progress: 20 } : f))
      )

      const filePath = `${Date.now()}-${file.name}`

      // Simulate progress updates
      setFileQueue((prev) => prev.map((f) => (f.id === id ? { ...f, progress: 40 } : f)))

      const { error } = await supabase.storage.from('uploads').upload(filePath, file)

      if (error) throw error

      setFileQueue((prev) => prev.map((f) => (f.id === id ? { ...f, progress: 70 } : f)))

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath)

      setFileQueue((prev) => prev.map((f) => (f.id === id ? { ...f, progress: 100 } : f)))

      // Add to history
      const historyItem: UploadHistoryItem = {
        id: generateFileId(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        publicUrl: data.publicUrl,
        uploadedAt: Date.now(),
      }

      setHistory((prev) => [historyItem, ...prev])

      trackToolEvent('upload_file_success', {
        file_type: anonymizeFileName(file.name),
        file_size: file.size,
      })

      return {
        ...queuedFile,
        status: 'completed',
        progress: 100,
        publicUrl: data.publicUrl,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      trackToolEvent('upload_file_error', {
        error: errorMessage,
      })

      return {
        ...queuedFile,
        status: 'error',
        error: errorMessage,
      }
    }
  }, [])

  // Process upload queue
  const processQueue = useCallback(async () => {
    const pendingFiles = fileQueue.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Upload files with concurrency limit
    const chunks: QueuedFile[][] = []
    for (let i = 0; i < pendingFiles.length; i += MAX_CONCURRENT_UPLOADS) {
      chunks.push(pendingFiles.slice(i, i + MAX_CONCURRENT_UPLOADS))
    }

    // Track all upload results across chunks
    const allResults: QueuedFile[] = []

    for (const chunk of chunks) {
      const results = await Promise.all(chunk.map(uploadFile))
      allResults.push(...results)

      setFileQueue((prev) =>
        prev.map((f) => {
          const result = results.find((r) => r.id === f.id)
          return result || f
        })
      )
    }

    setIsUploading(false)

    // Count from actual results, not stale state
    const successCount = allResults.filter((f) => f.status === 'completed').length
    const errorCount = allResults.filter((f) => f.status === 'error').length

    if (successCount > 0 && errorCount === 0) {
      toast.success(`All ${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`)
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} uploaded, ${errorCount} failed`)
    } else if (errorCount > 0) {
      toast.error(`${errorCount} file${errorCount > 1 ? 's' : ''} failed to upload`)
    }
  }, [fileQueue, uploadFile])

  // Remove file from queue
  const removeFromQueue = useCallback((id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // Clear completed files
  const clearCompleted = useCallback(() => {
    setFileQueue((prev) => prev.filter((f) => f.status !== 'completed' && f.status !== 'error'))
    toast.info('Cleared completed uploads')
  }, [])

  // Reset queue
  const resetQueue = useCallback(() => {
    setFileQueue([])
    toast.info('Queue cleared')
  }, [])

  // Handle reorder
  const handleReorder = useCallback((newOrder: QueuedFile[]) => {
    setFileQueue(newOrder)
  }, [])

  // Copy URL to clipboard
  const handleCopy = useCallback(async (url: string, id?: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(id || url)
    toast.success('URL copied to clipboard!')

    setTimeout(() => setCopied(null), 2000)

    trackToolEvent('upload_url_copied', {})
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback(
    (item: UploadHistoryItem) => {
      const exists = favorites.find((f) => f.publicUrl === item.publicUrl)

      if (exists) {
        setFavorites((prev) => prev.filter((f) => f.publicUrl !== item.publicUrl))
        toast.info('Removed from favorites')
        trackToolEvent('upload_favorite_remove', {})
      } else {
        const newFavorite: FavoriteItem = {
          id: generateFileId(),
          fileName: item.fileName,
          publicUrl: item.publicUrl,
          addedAt: Date.now(),
        }
        setFavorites((prev) => [newFavorite, ...prev])
        toast.success('Added to favorites!')
        trackToolEvent('upload_favorite_add', {})
      }
    },
    [favorites]
  )

  // Remove from favorites
  const removeFromFavorites = useCallback((publicUrl: string) => {
    setFavorites((prev) => prev.filter((f) => f.publicUrl !== publicUrl))
    toast.info('Removed from favorites')
    trackToolEvent('upload_favorite_remove', {})
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([])
    toast.info('History cleared')
    trackToolEvent('upload_history_clear', {})
  }, [])

  // Export history to CSV
  const exportHistory = useCallback(() => {
    if (history.length === 0) {
      toast.error('No history to export')
      return
    }

    const csv = [
      ['Timestamp', 'File Name', 'Size', 'Type', 'URL'].join(','),
      ...history.map((item) =>
        [
          new Date(item.uploadedAt).toISOString(),
          `"${item.fileName.replace(/"/g, '""')}"`,
          formatFileSize(item.fileSize),
          item.fileType,
          item.publicUrl,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upload-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('History exported!')
    trackToolEvent('upload_history_export', { count: history.length })
  }, [history])

  // Check if URL is favorited
  const isFavorited = useCallback(
    (publicUrl: string) => favorites.some((f) => f.publicUrl === publicUrl),
    [favorites]
  )

  // Open QR code modal
  const openQRModal = useCallback((url: string, fileName: string) => {
    setQrModal({ isOpen: true, url, fileName })
    trackToolEvent('upload_qr_open', {})
  }, [])

  // Close QR code modal
  const closeQRModal = useCallback(() => {
    setQrModal({ isOpen: false, url: '', fileName: '' })
  }, [])

  // Download QR code
  const handleDownloadQR = useCallback(() => {
    downloadQRCode(qrCodeRef.current, qrModal.fileName)
    trackToolEvent('upload_qr_download', {})
    toast.success('QR code downloaded!')
  }, [qrModal.fileName])

  // Open share modal
  const openShareModal = useCallback((url: string, fileName: string) => {
    setShareModal({ isOpen: true, url, fileName })
    setSelectedExpiration(0)
    trackToolEvent('upload_share_open', {})
  }, [])

  // Close share modal
  const closeShareModal = useCallback(() => {
    setShareModal({ isOpen: false, url: '', fileName: '' })
    setSelectedExpiration(0)
  }, [])

  // Set expiration for a history item
  const setLinkExpiration = useCallback((publicUrl: string, expirationMs: number) => {
    const expiresAt = expirationMs === 0 ? 0 : Date.now() + expirationMs
    setHistory((prev) =>
      prev.map((item) => (item.publicUrl === publicUrl ? { ...item, expiresAt } : item))
    )
    const option = EXPIRATION_OPTIONS.find((o) => o.value === expirationMs)
    toast.success(`Link expiration set to ${option?.label || 'Never'}`)
    trackToolEvent('upload_expiration_set', { expiration: option?.label || 'Never' })
  }, [])

  // Copy with expiration notice
  const handleCopyWithExpiration = useCallback(async (url: string, expiresAt?: number) => {
    let textToCopy = url
    if (expiresAt && expiresAt > 0 && !isExpired(expiresAt)) {
      textToCopy = `${url}\n\nNote: This link expires in ${formatTimeRemaining(expiresAt)}`
    }
    await navigator.clipboard.writeText(textToCopy)
    toast.success('URL copied to clipboard!')
    trackToolEvent('upload_url_copied', {})
  }, [])

  // Social share URLs
  const getShareUrls = useCallback((url: string, fileName: string) => {
    const encodedUrl = encodeURIComponent(url)
    const text = encodeURIComponent(`Check out this file: ${fileName}`)
    return {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
      email: `mailto:?subject=${encodeURIComponent(`Shared file: ${fileName}`)}&body=${text}%0A%0A${encodedUrl}`,
    }
  }, [])

  // Get stats
  const stats = useMemo(() => {
    const pending = fileQueue.filter((f) => f.status === 'pending').length
    const uploading = fileQueue.filter((f) => f.status === 'uploading').length
    const completed = fileQueue.filter((f) => f.status === 'completed').length
    const errors = fileQueue.filter((f) => f.status === 'error').length
    return { pending, uploading, completed, errors, total: fileQueue.length }
  }, [fileQueue])

  return (
    <main
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
      })}
    >
      <div
        className={css({
          w: 'full',
          maxW: '1200px',
          spaceY: { base: '6', sm: '8' },
        })}
      >
        {/* Header */}
        <div className={css({ spaceY: { base: '3', sm: '4' } })}>
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              alignItems: { base: 'start', sm: 'center' },
              gap: { base: '3', sm: '4' },
            })}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={css({
                rounded: '2xl',
                bg: 'linear-gradient(to bottom right, #2563eb, #0891b2, #1d4ed8)',
                p: { base: '3', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.6)',
              })}
            >
              <FileUp
                className={css({
                  h: { base: '7', sm: '8' },
                  w: { base: '7', sm: '8' },
                  color: 'white',
                })}
              />
            </motion.div>
            <div className={css({ spaceY: { base: '1', sm: '2' } })}>
              <h1
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'blue.300',
                  gradientVia: 'cyan.400',
                  gradientTo: 'teal.300',
                  bgClip: 'text',
                  fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
                  fontWeight: 'extrabold',
                  lineHeight: 'tight',
                  color: 'transparent',
                  textShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                File Upload
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'white',
                  lineHeight: 'relaxed',
                })}
              >
                Upload files to cloud storage with instant sharing • Multi-file support
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={css({
            display: 'flex',
            gap: '2',
            p: '1',
            rounded: 'xl',
            bg: 'gray.900/50',
            border: '1px solid',
            borderColor: 'gray.700/50',
            w: 'fit-content',
          })}
        >
          {[
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'history', label: 'History', icon: History, count: history.length },
            { id: 'favorites', label: 'Favorites', icon: Star, count: favorites.length },
          ].map((tab) => (
            <Button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className={css({
                gap: '2',
                px: { base: '3', sm: '4' },
                py: '2',
                fontSize: { base: 'sm', sm: 'base' },
                ...(activeTab === tab.id
                  ? {
                      bg: 'blue.600',
                      color: 'white',
                    }
                  : {
                      color: 'gray.400',
                      _hover: { color: 'white', bg: 'gray.800' },
                    }),
              })}
            >
              <tab.icon className={css({ h: '4', w: '4' })} />
              <span className={css({ display: { base: 'none', sm: 'inline' } })}>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge
                  variant="secondary"
                  className={css({
                    ml: '1',
                    fontSize: 'xs',
                    px: '1.5',
                    py: '0.5',
                    minW: '5',
                    textAlign: 'center',
                  })}
                >
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={css({ spaceY: '6' })}
          >
            {/* Upload Card */}
            <Card className="glass-card border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <CardContent withTopPadding>
                <div
                  className={css({
                    spaceY: { base: '5', sm: '6' },
                    p: { base: '5', sm: '6', md: '8' },
                  })}
                >
                  {/* Drag Drop Zone */}
                  <DragDropZone
                    onFilesSelected={handleFilesSelected}
                    disabled={isUploading}
                    maxSize={MAX_FILE_SIZE}
                    multiple={true}
                  />

                  {/* File Queue */}
                  {fileQueue.length > 0 && (
                    <div className={css({ spaceY: '4' })}>
                      {/* Queue Header */}
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '2',
                        })}
                      >
                        <h3
                          className={css({
                            fontSize: { base: 'base', sm: 'lg' },
                            fontWeight: 'semibold',
                            color: 'white',
                          })}
                        >
                          Upload Queue ({stats.total} file{stats.total !== 1 ? 's' : ''})
                        </h3>
                        <div className={css({ display: 'flex', gap: '2' })}>
                          {(stats.completed > 0 || stats.errors > 0) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearCompleted}
                              className={css({ color: 'gray.400', _hover: { color: 'white' } })}
                            >
                              <Trash2 className={css({ h: '4', w: '4', mr: '1' })} />
                              Clear Done
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetQueue}
                            className={css({ color: 'gray.400', _hover: { color: 'white' } })}
                          >
                            <RotateCcw className={css({ h: '4', w: '4', mr: '1' })} />
                            Reset
                          </Button>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                        {stats.pending > 0 && (
                          <Badge variant="secondary">{stats.pending} pending</Badge>
                        )}
                        {stats.uploading > 0 && (
                          <Badge variant="info">{stats.uploading} uploading</Badge>
                        )}
                        {stats.completed > 0 && (
                          <Badge variant="success">{stats.completed} completed</Badge>
                        )}
                        {stats.errors > 0 && (
                          <Badge variant="destructive">{stats.errors} failed</Badge>
                        )}
                      </div>

                      {/* File List */}
                      <Reorder.Group
                        axis="y"
                        values={fileQueue}
                        onReorder={handleReorder}
                        className={css({ spaceY: '3' })}
                      >
                        <AnimatePresence>
                          {fileQueue.map((queuedFile) => (
                            <Reorder.Item
                              key={queuedFile.id}
                              value={queuedFile}
                              className={css({
                                listStyle: 'none',
                              })}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={css({
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3',
                                  p: '4',
                                  rounded: 'xl',
                                  border: '2px solid',
                                  borderColor:
                                    queuedFile.status === 'completed'
                                      ? 'green.500/30'
                                      : queuedFile.status === 'error'
                                        ? 'red.500/30'
                                        : queuedFile.status === 'uploading'
                                          ? 'blue.500/30'
                                          : 'gray.700/50',
                                  bg:
                                    queuedFile.status === 'completed'
                                      ? 'green.500/5'
                                      : queuedFile.status === 'error'
                                        ? 'red.500/5'
                                        : queuedFile.status === 'uploading'
                                          ? 'blue.500/5'
                                          : 'gray.900/50',
                                  transition: 'all 0.2s',
                                })}
                              >
                                {/* Drag Handle */}
                                <div
                                  className={css({
                                    cursor: queuedFile.status === 'pending' ? 'grab' : 'default',
                                    color: 'gray.500',
                                    _active: { cursor: 'grabbing' },
                                  })}
                                >
                                  <GripVertical className={css({ h: '5', w: '5' })} />
                                </div>

                                {/* File Info */}
                                <div className={css({ flex: 1, minW: 0 })}>
                                  <p
                                    className={css({
                                      fontWeight: 'medium',
                                      color: 'white',
                                      truncate: true,
                                      fontSize: { base: 'sm', sm: 'base' },
                                    })}
                                  >
                                    {queuedFile.file.name}
                                  </p>
                                  <p
                                    className={css({
                                      fontSize: 'xs',
                                      color: 'gray.400',
                                    })}
                                  >
                                    {formatFileSize(queuedFile.file.size)}
                                    {queuedFile.file.type && ` • ${queuedFile.file.type}`}
                                  </p>

                                  {/* Progress Bar */}
                                  {queuedFile.status === 'uploading' && (
                                    <div className={css({ mt: '2' })}>
                                      <Progress
                                        value={queuedFile.progress}
                                        showPercentage
                                        gradient
                                      />
                                    </div>
                                  )}

                                  {/* Error Message */}
                                  {queuedFile.error && (
                                    <p
                                      className={css({ fontSize: 'xs', color: 'red.400', mt: '1' })}
                                    >
                                      {queuedFile.error}
                                    </p>
                                  )}

                                  {/* Success URL */}
                                  {queuedFile.publicUrl && (
                                    <div
                                      className={css({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2',
                                        mt: '2',
                                      })}
                                    >
                                      <input
                                        type="text"
                                        value={queuedFile.publicUrl}
                                        readOnly
                                        className={css({
                                          flex: 1,
                                          px: '2',
                                          py: '1',
                                          fontSize: 'xs',
                                          fontFamily: 'mono',
                                          bg: 'gray.900/80',
                                          border: '1px solid',
                                          borderColor: 'gray.700',
                                          rounded: 'md',
                                          color: 'gray.300',
                                          minW: 0,
                                        })}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleCopy(queuedFile.publicUrl!, queuedFile.id)
                                        }
                                        className={css({ p: '1', h: 'auto' })}
                                      >
                                        {copied === queuedFile.id ? (
                                          <Check
                                            className={css({ h: '4', w: '4', color: 'green.400' })}
                                          />
                                        ) : (
                                          <Copy className={css({ h: '4', w: '4' })} />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className={css({ p: '1', h: 'auto' })}
                                      >
                                        <a
                                          href={queuedFile.publicUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className={css({ h: '4', w: '4' })} />
                                        </a>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          openQRModal(queuedFile.publicUrl!, queuedFile.file.name)
                                        }
                                        className={css({ p: '1', h: 'auto' })}
                                        title="Generate QR Code"
                                      >
                                        <QrCode className={css({ h: '4', w: '4' })} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          openShareModal(
                                            queuedFile.publicUrl!,
                                            queuedFile.file.name
                                          )
                                        }
                                        className={css({ p: '1', h: 'auto' })}
                                        title="Share"
                                      >
                                        <Share2 className={css({ h: '4', w: '4' })} />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Status Icon / Actions */}
                                <div className={css({ flexShrink: 0 })}>
                                  {queuedFile.status === 'uploading' && (
                                    <Loader2
                                      className={css({
                                        h: '5',
                                        w: '5',
                                        color: 'blue.400',
                                        animation: 'spin 1s linear infinite',
                                      })}
                                    />
                                  )}
                                  {queuedFile.status === 'completed' && (
                                    <Check
                                      className={css({ h: '5', w: '5', color: 'green.400' })}
                                    />
                                  )}
                                  {queuedFile.status === 'error' && (
                                    <X className={css({ h: '5', w: '5', color: 'red.400' })} />
                                  )}
                                  {queuedFile.status === 'pending' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFromQueue(queuedFile.id)}
                                      className={css({ p: '1', h: 'auto', color: 'gray.500' })}
                                    >
                                      <X className={css({ h: '4', w: '4' })} />
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            </Reorder.Item>
                          ))}
                        </AnimatePresence>
                      </Reorder.Group>

                      {/* Upload Button */}
                      {stats.pending > 0 && (
                        <Button
                          onClick={processQueue}
                          disabled={isUploading}
                          className={css({
                            w: 'full',
                            bgGradient: 'to-r',
                            gradientFrom: 'blue.600',
                            gradientVia: 'cyan.600',
                            gradientTo: 'teal.600',
                            py: '6',
                            fontSize: { base: 'base', sm: 'lg' },
                            fontWeight: 'semibold',
                            shadow: '2xl',
                            boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.5)',
                            _hover: {
                              transform: 'scale(1.02)',
                            },
                          })}
                          size="lg"
                        >
                          {isUploading ? (
                            <>
                              <Loader2
                                className={css({
                                  mr: '2',
                                  h: '5',
                                  w: '5',
                                  animation: 'spin 1s linear infinite',
                                })}
                              />
                              Uploading {stats.uploading} of {stats.pending + stats.uploading}...
                            </>
                          ) : (
                            <>
                              <Upload className={css({ mr: '2', h: '5', w: '5' })} />
                              Upload {stats.pending} File{stats.pending !== 1 ? 's' : ''}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={css({ spaceY: '6' })}
          >
            <Card className="glass-card border-2 border-purple-500/30 shadow-xl shadow-purple-500/20">
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '4',
                  })}
                >
                  <div>
                    <CardTitle
                      className={css({
                        bgGradient: 'to-r',
                        gradientFrom: 'purple.300',
                        gradientTo: 'pink.300',
                        bgClip: 'text',
                        color: 'transparent',
                      })}
                      style={{
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Upload History
                    </CardTitle>
                    <CardDescription className={css({ color: 'gray.400' })}>
                      {history.length} upload{history.length !== 1 ? 's' : ''} stored locally
                    </CardDescription>
                  </div>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportHistory}
                      disabled={history.length === 0}
                      className={css({
                        borderColor: 'purple.500/50',
                        _hover: { bg: 'purple.500/20' },
                      })}
                    >
                      <Download className={css({ h: '4', w: '4', mr: '1' })} />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearHistory}
                      disabled={history.length === 0}
                      className={css({
                        borderColor: 'red.500/50',
                        _hover: { bg: 'red.500/20' },
                      })}
                    >
                      <Trash2 className={css({ h: '4', w: '4', mr: '1' })} />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ spaceY: '4' })}>
                  {/* Search */}
                  <div className={css({ position: 'relative' })}>
                    <Search
                      className={css({
                        position: 'absolute',
                        left: '3',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        h: '4',
                        w: '4',
                        color: 'gray.500',
                      })}
                    />
                    <Input
                      type="text"
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className={css({ pl: '10' })}
                    />
                  </div>

                  {/* History List */}
                  {filteredHistory.length === 0 ? (
                    <div
                      className={css({
                        textAlign: 'center',
                        py: '12',
                        color: 'gray.500',
                      })}
                    >
                      <History
                        className={css({ h: '12', w: '12', mx: 'auto', mb: '4', opacity: 0.5 })}
                      />
                      <p>{history.length === 0 ? 'No uploads yet' : 'No matching uploads'}</p>
                    </div>
                  ) : (
                    <div className={css({ spaceY: '3', maxH: '500px', overflowY: 'auto' })}>
                      {filteredHistory.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3',
                            p: '4',
                            rounded: 'xl',
                            border: '1px solid',
                            borderColor: 'gray.700/50',
                            bg: 'gray.900/50',
                            _hover: { borderColor: 'purple.500/30', bg: 'gray.900/80' },
                            transition: 'all 0.2s',
                          })}
                        >
                          {/* File Info */}
                          <div className={css({ flex: 1, minW: 0 })}>
                            <p
                              className={css({
                                fontWeight: 'medium',
                                color: 'white',
                                truncate: true,
                              })}
                            >
                              {item.fileName}
                            </p>
                            <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
                              {formatFileSize(item.fileSize)} • {item.fileType}
                            </p>
                            <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                              {new Date(item.uploadedAt).toLocaleString()}
                            </p>
                            {/* Expiration countdown */}
                            {item.expiresAt && item.expiresAt > 0 && (
                              <p
                                className={css({
                                  fontSize: 'xs',
                                  color: isExpired(item.expiresAt) ? 'red.400' : 'orange.400',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1',
                                  mt: '1',
                                })}
                              >
                                <Clock className={css({ h: '3', w: '3' })} />
                                {isExpired(item.expiresAt)
                                  ? 'Link expired'
                                  : `Expires in ${formatTimeRemaining(item.expiresAt)}`}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className={css({ display: 'flex', gap: '1', flexWrap: 'wrap' })}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(item)}
                              className={css({
                                p: '2',
                                h: 'auto',
                                color: isFavorited(item.publicUrl) ? 'yellow.400' : 'gray.500',
                                _hover: { color: 'yellow.400' },
                              })}
                              title="Favorite"
                            >
                              <Star
                                className={css({ h: '4', w: '4' })}
                                fill={isFavorited(item.publicUrl) ? 'currentColor' : 'none'}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyWithExpiration(item.publicUrl, item.expiresAt)
                              }
                              className={css({ p: '2', h: 'auto' })}
                              title="Copy URL"
                            >
                              {copied === item.id ? (
                                <Check className={css({ h: '4', w: '4', color: 'green.400' })} />
                              ) : (
                                <Copy className={css({ h: '4', w: '4' })} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className={css({ p: '2', h: 'auto' })}
                              title="Open in new tab"
                            >
                              <a href={item.publicUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className={css({ h: '4', w: '4' })} />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openQRModal(item.publicUrl, item.fileName)}
                              className={css({ p: '2', h: 'auto' })}
                              title="Generate QR Code"
                            >
                              <QrCode className={css({ h: '4', w: '4' })} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openShareModal(item.publicUrl, item.fileName)}
                              className={css({ p: '2', h: 'auto' })}
                              title="Share"
                            >
                              <Share2 className={css({ h: '4', w: '4' })} />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={css({ spaceY: '6' })}
          >
            <Card className="glass-card border-2 border-yellow-500/30 shadow-xl shadow-yellow-500/20">
              <CardHeader>
                <div>
                  <CardTitle
                    className={css({
                      bgGradient: 'to-r',
                      gradientFrom: 'yellow.300',
                      gradientTo: 'orange.300',
                      bgClip: 'text',
                      color: 'transparent',
                    })}
                    style={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Favorites
                  </CardTitle>
                  <CardDescription className={css({ color: 'gray.400' })}>
                    {favorites.length} bookmarked file{favorites.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div
                    className={css({
                      textAlign: 'center',
                      py: '12',
                      color: 'gray.500',
                    })}
                  >
                    <Star
                      className={css({ h: '12', w: '12', mx: 'auto', mb: '4', opacity: 0.5 })}
                    />
                    <p>No favorites yet</p>
                    <p className={css({ fontSize: 'sm', mt: '1' })}>
                      Star uploads from history to add them here
                    </p>
                  </div>
                ) : (
                  <div className={css({ spaceY: '3' })}>
                    {favorites.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          p: '4',
                          rounded: 'xl',
                          border: '1px solid',
                          borderColor: 'yellow.500/20',
                          bg: 'yellow.500/5',
                          _hover: { borderColor: 'yellow.500/40' },
                          transition: 'all 0.2s',
                        })}
                      >
                        <Star
                          className={css({ h: '5', w: '5', color: 'yellow.400', flexShrink: 0 })}
                          fill="currentColor"
                        />
                        <div className={css({ flex: 1, minW: 0 })}>
                          <p
                            className={css({
                              fontWeight: 'medium',
                              color: 'white',
                              truncate: true,
                            })}
                          >
                            {item.fileName}
                          </p>
                          <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={css({ display: 'flex', gap: '1', flexWrap: 'wrap' })}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(item.publicUrl, item.id)}
                            className={css({ p: '2', h: 'auto' })}
                            title="Copy URL"
                          >
                            {copied === item.id ? (
                              <Check className={css({ h: '4', w: '4', color: 'green.400' })} />
                            ) : (
                              <Copy className={css({ h: '4', w: '4' })} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className={css({ p: '2', h: 'auto' })}
                            title="Open in new tab"
                          >
                            <a href={item.publicUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className={css({ h: '4', w: '4' })} />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openQRModal(item.publicUrl, item.fileName)}
                            className={css({ p: '2', h: 'auto' })}
                            title="Generate QR Code"
                          >
                            <QrCode className={css({ h: '4', w: '4' })} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openShareModal(item.publicUrl, item.fileName)}
                            className={css({ p: '2', h: 'auto' })}
                            title="Share"
                          >
                            <Share2 className={css({ h: '4', w: '4' })} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromFavorites(item.publicUrl)}
                            className={css({ p: '2', h: 'auto', color: 'red.400' })}
                            title="Remove from favorites"
                          >
                            <Trash2 className={css({ h: '4', w: '4' })} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        <Card className="glass-card border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/20">
          <CardHeader>
            <div className={css({ spaceY: { base: '2', sm: '3' }, p: { base: '2', sm: '3' } })}>
              <CardTitle
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'cyan.300',
                  gradientTo: 'blue.300',
                  bgClip: 'text',
                  fontSize: { base: 'xl', sm: '2xl' },
                  fontWeight: 'bold',
                  color: 'transparent',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Upload Information
              </CardTitle>
              <CardDescription
                className={css({ fontSize: { base: 'sm', sm: 'base' }, color: 'gray.300' })}
              >
                Files are stored securely in cloud storage with instant CDN delivery
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                p: { base: '2', sm: '3' },
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: { base: '4', sm: '5' },
                w: 'full',
              })}
            >
              {[
                { label: 'Max file size', value: '10 MB', color: 'purple' },
                { label: 'Concurrent uploads', value: '3 files', color: 'blue' },
                { label: 'Storage', value: 'Supabase Cloud', color: 'cyan' },
                { label: 'URL Type', value: 'Public CDN', color: 'teal' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={css({
                    rounded: 'lg',
                    border: '2px solid',
                    borderColor: `${stat.color}.500/30`,
                    bg: `${stat.color}.500/10`,
                    p: { base: '4', sm: '5' },
                    spaceY: '1',
                    transition: 'all 0.2s',
                    _hover: {
                      borderColor: `${stat.color}.500/50`,
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <p
                    className={css({
                      fontWeight: 'medium',
                      color: `${stat.color}.300`,
                      fontSize: 'xs',
                    })}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={css({
                      fontSize: { base: 'lg', sm: 'xl' },
                      fontWeight: 'bold',
                      color: 'white',
                    })}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <FAQAccordion faqs={faqs} />

        {/* Related Tools */}
        <RelatedTools currentToolPath="/tools/productivity/upload" category="Productivity" />

        {/* Social Share & Rating */}
        <div
          className={css({
            display: 'flex',
            flexDirection: { base: 'column', sm: 'row' },
            gap: '6',
            justifyContent: 'space-between',
            alignItems: { base: 'stretch', sm: 'center' },
          })}
        >
          <SocialShare
            toolName="File Upload Tool"
            toolUrl="/tools/productivity/upload"
            description="Upload files to cloud storage with instant sharing"
          />
          <ToolRating toolId="upload" toolName="File Upload Tool" />
        </div>

        {/* Affiliate Suggestions */}
        <AffiliateSuggestion tool="upload" variant="banner" />
      </div>

      <ToolSearch />

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={css({
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bg: 'black/80',
              backdropFilter: 'blur(4px)',
              p: '4',
            })}
            onClick={closeQRModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={css({
                bg: 'gray.900',
                border: '2px solid',
                borderColor: 'blue.500/30',
                rounded: '2xl',
                p: { base: '5', sm: '6' },
                maxW: 'md',
                w: 'full',
                shadow: '2xl',
                spaceY: '5',
              })}
            >
              {/* Modal Header */}
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <QrCode className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'white',
                    })}
                  >
                    QR Code
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeQRModal}
                  className={css({ p: '1', h: 'auto' })}
                >
                  <X className={css({ h: '5', w: '5' })} />
                </Button>
              </div>

              {/* File Name */}
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'gray.400',
                  truncate: true,
                  textAlign: 'center',
                })}
              >
                {qrModal.fileName}
              </p>

              {/* QR Code Display */}
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'center',
                  p: '4',
                  bg: 'white',
                  rounded: 'xl',
                })}
              >
                <QRCodeSVG
                  ref={qrCodeRef}
                  value={qrModal.url}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* URL Display */}
              <div className={css({ spaceY: '2' })}>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>File URL:</p>
                <input
                  type="text"
                  value={qrModal.url}
                  readOnly
                  className={css({
                    w: 'full',
                    px: '3',
                    py: '2',
                    fontSize: 'xs',
                    fontFamily: 'mono',
                    bg: 'gray.800',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    rounded: 'lg',
                    color: 'gray.300',
                  })}
                />
              </div>

              {/* Actions */}
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={handleDownloadQR}
                  className={css({
                    flex: 1,
                    bg: 'blue.600',
                    _hover: { bg: 'blue.700' },
                  })}
                >
                  <Download className={css({ h: '4', w: '4', mr: '2' })} />
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(qrModal.url)}
                  className={css({ flex: 1 })}
                >
                  <Copy className={css({ h: '4', w: '4', mr: '2' })} />
                  Copy URL
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={css({
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bg: 'black/80',
              backdropFilter: 'blur(4px)',
              p: '4',
            })}
            onClick={closeShareModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={css({
                bg: 'gray.900',
                border: '2px solid',
                borderColor: 'green.500/30',
                rounded: '2xl',
                p: { base: '5', sm: '6' },
                maxW: 'md',
                w: 'full',
                shadow: '2xl',
                spaceY: '5',
              })}
            >
              {/* Modal Header */}
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Share2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'white',
                    })}
                  >
                    Share File
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeShareModal}
                  className={css({ p: '1', h: 'auto' })}
                >
                  <X className={css({ h: '5', w: '5' })} />
                </Button>
              </div>

              {/* File Name */}
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'gray.400',
                  truncate: true,
                })}
              >
                {shareModal.fileName}
              </p>

              {/* Link Expiration */}
              <div className={css({ spaceY: '2' })}>
                <p
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'gray.300',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Clock className={css({ h: '4', w: '4' })} />
                  Link Expiration
                </p>
                <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                  {EXPIRATION_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={selectedExpiration === option.value ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedExpiration(option.value)
                        setLinkExpiration(shareModal.url, option.value)
                      }}
                      className={css({
                        fontSize: 'xs',
                        ...(selectedExpiration === option.value
                          ? { bg: 'green.600', borderColor: 'green.600' }
                          : { borderColor: 'gray.600' }),
                      })}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                  Note: Expiration is tracked locally and does not affect the actual file storage.
                </p>
              </div>

              {/* Social Share Buttons */}
              <div className={css({ spaceY: '2' })}>
                <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Share on Social
                </p>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2',
                  })}
                >
                  {[
                    { name: 'Twitter', key: 'twitter' as const, color: 'blue.400' },
                    { name: 'Facebook', key: 'facebook' as const, color: 'blue.600' },
                    { name: 'LinkedIn', key: 'linkedin' as const, color: 'blue.500' },
                    { name: 'WhatsApp', key: 'whatsapp' as const, color: 'green.500' },
                    { name: 'Telegram', key: 'telegram' as const, color: 'cyan.500' },
                    { name: 'Email', key: 'email' as const, color: 'gray.400' },
                  ].map((platform) => (
                    <Button
                      key={platform.key}
                      variant="outline"
                      size="sm"
                      asChild
                      className={css({
                        fontSize: 'xs',
                        borderColor: 'gray.700',
                        _hover: { borderColor: platform.color, color: platform.color },
                      })}
                    >
                      <a
                        href={getShareUrls(shareModal.url, shareModal.fileName)[platform.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackToolEvent('upload_share_social', { platform: platform.name })
                        }
                      >
                        {platform.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Copy Actions */}
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={() => handleCopy(shareModal.url)}
                  className={css({
                    flex: 1,
                    bg: 'green.600',
                    _hover: { bg: 'green.700' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4', mr: '2' })} />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openQRModal(shareModal.url, shareModal.fileName)}
                  className={css({ flex: 1 })}
                >
                  <QrCode className={css({ h: '4', w: '4', mr: '2' })} />
                  QR Code
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

// Main Export with Suspense
export default function UploadTool() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minH: '50vh',
          })}
        >
          <Loader2
            className={css({
              h: '8',
              w: '8',
              color: 'blue.400',
              animation: 'spin 1s linear infinite',
            })}
          />
        </div>
      }
    >
      <UploadToolContent />
    </Suspense>
  )
}
