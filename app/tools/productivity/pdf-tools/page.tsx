'use client'

export const dynamic = 'force-dynamic'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import {
  Archive,
  BookmarkCheck,
  Copy,
  CopyPlus,
  Droplet,
  Edit3,
  FileDown,
  FileOutput,
  FileText,
  Globe,
  GripVertical,
  ImageDown,
  Image as ImageIcon,
  Info,
  Lock,
  Merge,
  Redo2,
  RotateCw,
  Settings,
  Sliders,
  Sparkles,
  Split,
  Trash2,
  Undo2,
  Zap,
} from 'lucide-react'
import type * as PdfLibTypes from 'pdf-lib'
import type * as PdfjsTypes from 'pdfjs-dist'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { PDFEditor } from '@/components/features/media/PDFEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { BatchQueue } from './components/BatchQueue'
import { BatchToolbar } from './components/BatchToolbar'
import { ComparisonView } from './components/ComparisonView'
import { DesktopUploadButton } from './components/DesktopUploadButton'
import { EmptyState } from './components/EmptyState'
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog'
import { MobileOperationPicker } from './components/MobileOperationPicker'
import { MobileUploadButton } from './components/MobileUploadButton'
import { OperationGrid } from './components/OperationGrid'
import { PDFThumbnail } from './components/PDFThumbnail'
import { PresetsDialog } from './components/PresetsDialog'
import { ProcessingModal } from './components/ProcessingModal'
import { ReorderablePDFList } from './components/ReorderablePDFList'
import { SummarizationDialog } from './components/SummarizationDialog'
import { WatermarkPreview } from './components/WatermarkPreview'
import { type WatermarkTemplate, WatermarkTemplates } from './components/WatermarkTemplates'
import { useBatchQueue } from './hooks/useBatchQueue'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useOperationHistory } from './hooks/useOperationHistory'
import { useRecentOperations } from './hooks/useRecentOperations'
import { PDFBatchProcessor } from './PDFBatchProcessor'
import PDFPageEditFlow from './PDFPageEditFlow'
import { extractTextFromPDF } from './utils/pdfTextExtractor'
import { generateQRCodeFile } from './utils/qrCodeGenerator'

// Dynamic import for pdf-lib (client-side only)
let pdfLib: typeof PdfLibTypes | null = null
let pdfLibInitPromise: Promise<typeof PdfLibTypes> | null = null

const loadPdfLib = async () => {
  if (pdfLib) return pdfLib
  if (pdfLibInitPromise) return pdfLibInitPromise

  pdfLibInitPromise = import('pdf-lib').then((module) => {
    pdfLib = module
    return module
  })

  return pdfLibInitPromise
}

// Dynamic import for pdfjs-dist (client-side only)
let pdfjsLib: typeof PdfjsTypes | null = null
let pdfjsInitPromise: Promise<typeof PdfjsTypes> | null = null

const initPdfjs = async () => {
  if (pdfjsLib) return pdfjsLib
  if (pdfjsInitPromise) return pdfjsInitPromise

  pdfjsInitPromise = import('pdfjs-dist').then(async (module) => {
    pdfjsLib = module
    if (typeof window !== 'undefined') {
      // Use local worker file from node_modules
      module.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }
    return module
  })

  return pdfjsInitPromise
}

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  processedBlob?: Blob
  processedSize?: number
}

interface Annotation {
  id: string
  type: 'select' | 'text' | 'highlight' | 'rectangle' | 'circle' | 'line'
  page: number
  x: number
  y: number
  width?: number
  height?: number
  x2?: number
  y2?: number
  text?: string
  color: string
  fontSize?: number
}

type OperationType =
  | 'merge'
  | 'split'
  | 'compress'
  | 'toImages'
  | 'imagesToPdf'
  | 'watermark'
  | 'extract'
  | 'rotate'
  | 'toWord'
  | 'edit'
  | 'grayscale'
  | 'deletePages'
  | 'protect'
  | 'unlock'
  | 'duplicatePages'
  | 'reorder'
  | 'addPageNumbers'
  | 'extractText'
  | 'editMetadata'
  | 'ocrExtract'
  | 'flatten'
  | 'addHeaderFooter'
  | 'addBookmarks'
  | 'extractImages'
  | 'optimizeWeb'
  | 'splitByBookmarks'
  | 'aiSummarize'

export default function PDFToolsPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([])
  const [operation, setOperation] = useState<OperationType>('merge')
  const [isProcessing, setIsProcessing] = useState(false)

  // Edit options
  const [editingPdf, setEditingPdf] = useState<PDFFile | null>(null)
  const [_isEditorOpen, setIsEditorOpen] = useState(false)

  // Split options
  const [splitPageNumber, setSplitPageNumber] = useState(1)

  // Compress options
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('high')

  // Watermark options
  const [watermarkType, setWatermarkType] = useState<'text' | 'image' | 'qr'>('text')
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3)
  const [watermarkRotation, setWatermarkRotation] = useState(-45)
  const [watermarkPosition, setWatermarkPosition] = useState<
    | 'center'
    | 'diagonal'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  >('diagonal')
  const [watermarkColor, setWatermarkColor] = useState('#b3b3b3')
  const [watermarkFontSize, setWatermarkFontSize] = useState(50)
  const [watermarkPattern, setWatermarkPattern] = useState(false)
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null)
  const [watermarkImageScale, setWatermarkImageScale] = useState(1.0)
  const [watermarkQRText, setWatermarkQRText] = useState('')
  const [currentTemplateName, setCurrentTemplateName] = useState<string>('Custom')

  // Reset completed PDFs to pending when watermark settings change
  // biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally depend on all watermark settings
  useEffect(() => {
    if (operation === 'watermark') {
      setPdfs((prev) =>
        prev.map((pdf) =>
          pdf.status === 'completed'
            ? {
                ...pdf,
                status: 'pending',
                processedBlob: undefined,
                processedSize: undefined,
                progress: 0,
              }
            : pdf
        )
      )
    }
  }, [
    watermarkType,
    watermarkText,
    watermarkOpacity,
    watermarkRotation,
    watermarkPosition,
    watermarkColor,
    watermarkFontSize,
    watermarkPattern,
    watermarkImage,
    watermarkImageScale,
    watermarkQRText,
    operation,
  ])

  // Extract pages options
  const [extractStartPage, setExtractStartPage] = useState(1)
  const [extractEndPage, setExtractEndPage] = useState(1)

  // Rotate options
  const [rotationAngle, setRotationAngle] = useState(90)

  // Images to PDF options
  const [imageToPdfPageSize, setImageToPdfPageSize] = useState<
    'A4' | 'Letter' | 'Legal' | 'Original'
  >('A4')
  const [imageToPdfFitMode, setImageToPdfFitMode] = useState<'contain' | 'cover' | 'fill'>(
    'contain'
  )

  // Delete pages options
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())

  // Unlock options
  const [unlockPassword, setUnlockPassword] = useState('')

  // Duplicate pages options
  const [duplicateCount, setDuplicateCount] = useState(1)

  // Reorder pages options
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [focusedPageIndex, setFocusedPageIndex] = useState<number>(-1)

  // Page numbering options
  const [pageNumberPosition, setPageNumberPosition] = useState<
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  >('bottom-center')
  const [pageNumberFormat, setPageNumberFormat] = useState<
    'numbers' | 'roman-lower' | 'roman-upper' | 'page-of-total'
  >('numbers')
  const [pageNumberFontSize, setPageNumberFontSize] = useState(12)
  const [pageNumberStartFrom, setPageNumberStartFrom] = useState(1)

  // Metadata editor options
  const [metadataTitle, setMetadataTitle] = useState('')
  const [metadataAuthor, setMetadataAuthor] = useState('')
  const [metadataSubject, setMetadataSubject] = useState('')
  const [metadataKeywords, setMetadataKeywords] = useState('')
  const [metadataCreator, setMetadataCreator] = useState('')
  const [metadataProducer, setMetadataProducer] = useState('')

  // OCR options
  const [ocrLanguage, setOcrLanguage] = useState('eng')

  // Protection options
  const [password, setPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [allowPrinting, setAllowPrinting] = useState(true)
  const [allowModifying, setAllowModifying] = useState(false)
  const [allowCopying, setAllowCopying] = useState(true)

  // Header/Footer options
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('Page {page} of {total}')
  const [headerPosition, setHeaderPosition] = useState<'left' | 'center' | 'right'>('center')
  const [footerPosition, setFooterPosition] = useState<'left' | 'center' | 'right'>('center')
  const [headerFooterFontSize, setHeaderFooterFontSize] = useState(10)
  const [includePageNumbers, setIncludePageNumbers] = useState(true)

  // Bookmark options
  const [bookmarks, setBookmarks] = useState<
    Array<{ title: string; pageNumber: number; level?: number }>
  >([{ title: 'Chapter 1', pageNumber: 1, level: 0 }])

  // New enhancements
  const [showPresets, setShowPresets] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPdf, setComparisonPdf] = useState<PDFFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchProcessorRef = useRef<PDFBatchProcessor | null>(null)

  // AI Summarization options
  const [showSummarization, setShowSummarization] = useState(false)
  const [summarizationResult, setSummarizationResult] = useState<{
    summary: string
    keyPoints: string[]
    documentType: string
    mainTopics: string[]
    actionItems: string[]
    technicalTerms: string[]
    pageAnalysis: string
    metadata: {
      fileName: string
      pageCount: number
      wordCount: number
      charCount: number
      estimatedReadingTime: number
    }
  } | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  // Initialize batch processor
  useEffect(() => {
    batchProcessorRef.current = new PDFBatchProcessor((id, updates) => {
      setPdfs((prev) => prev.map((pdf) => (pdf.id === id ? { ...pdf, ...updates } : pdf)))
    })
  }, [])

  // Batch queue management
  const batchQueue = useBatchQueue(pdfs, setPdfs)

  // Operation history for undo/redo
  const { addSnapshot, undo, redo, canUndo, canRedo } = useOperationHistory<PDFFile[]>()

  // Track recently used operations
  const { trackOperation, recentOperations, getRecentOperationTypes } = useRecentOperations()

  // Track operation changes for recently used
  useEffect(() => {
    trackOperation(operation)
  }, [operation, trackOperation])
  // Save snapshot before each operation
  const saveSnapshot = useCallback(
    (operation: string) => {
      addSnapshot(operation, pdfs)
    },
    [pdfs, addSnapshot]
  )

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUpload: () => fileInputRef.current?.click(),
    onProcess: () => !isProcessing && pdfs.length > 0 && handleProcess(),
    onDownloadAll: () => handleDownloadAll(),
    onClear: () => handleClearAll(),
    onCancel: () => {
      if (editingPdf) {
        setEditingPdf(null)
        setIsEditorOpen(false)
      }
    },
    onUndo: () => {
      const snapshot = undo()
      if (snapshot) {
        setPdfs(snapshot.data)
        toast.success('Undid last operation')
      }
    },
    onRedo: () => {
      const snapshot = redo()
      if (snapshot) {
        setPdfs(snapshot.data)
        toast.success('Redid operation')
      }
    },
    enabled: !isProcessing,
  })

  // Track page visit
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'pdf_tools',
      label: 'tool_opened',
    })
  }, [])

  // Show toast when batch processing is paused/resumed
  useEffect(() => {
    if (pdfs.length > 1) {
      if (batchQueue.isPaused) {
        toast.info('Batch processing paused')
      }
    }
  }, [batchQueue.isPaused, pdfs.length])

  // Handle watermark template selection
  const handleTemplateSelect = useCallback((template: WatermarkTemplate) => {
    setWatermarkText(template.text)
    setWatermarkOpacity(template.opacity)
    setWatermarkRotation(template.rotation)
    setWatermarkPosition(template.position)
    setWatermarkColor(template.color)
    setWatermarkFontSize(template.fontSize)
    setWatermarkPattern(template.pattern)
    setCurrentTemplateName(template.name)
    setWatermarkType('text')
    toast.success(`Applied ${template.name} template`)
  }, [])

  // Handle watermark image upload
  const handleWatermarkImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    setWatermarkImage(file)
    setWatermarkType('image')
    setCurrentTemplateName('Custom')
    toast.success('Image uploaded successfully')
  }, [])

  // Handle QR code generation
  const handleGenerateQRCode = useCallback(async (text: string) => {
    if (!text || text.trim() === '') {
      toast.error('Please enter text for QR code')
      return
    }

    try {
      const qrFile = await generateQRCodeFile(text, 'watermark-qr.png', 300)
      setWatermarkImage(qrFile)
      setWatermarkType('qr')
      setWatermarkQRText(text)
      setCurrentTemplateName('Custom')
      toast.success('QR code generated successfully')
    } catch (error) {
      toast.error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }, [])

  const handleFilesSelected = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    const pdfFiles = fileArray.filter((file) => file.type === 'application/pdf')
    const imageFiles = fileArray.filter(
      (file) =>
        file.type.startsWith('image/') &&
        (file.type === 'image/jpeg' ||
          file.type === 'image/jpg' ||
          file.type === 'image/png' ||
          file.type === 'image/webp')
    )

    const allFiles = [...pdfFiles, ...imageFiles]

    if (allFiles.length === 0) {
      toast.error('Please upload PDF or image files (JPG, PNG, WebP)')
      return
    }

    trackEvent({
      action: 'files_added',
      category: 'pdf_tools',
      label: pdfFiles.length > 0 ? 'pdf_upload' : 'image_upload',
      value: allFiles.length,
    })

    const { PDFDocument } = await loadPdfLib()

    const newPdfs: PDFFile[] = await Promise.all(
      allFiles.map(async (file) => {
        let pages = 0

        if (file.type === 'application/pdf') {
          try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)
            pages = pdfDoc.getPageCount()
          } catch (error) {
            console.error('Error reading PDF:', error)
          }
        } else {
          // Images count as 1 page when converted to PDF
          pages = 1
        }

        return {
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          pages,
          status: 'pending' as const,
          progress: 0,
        }
      })
    )

    setPdfs((prev) => [...prev, ...newPdfs])
  }, [])

  const updatePdfStatus = (
    id: string,
    updates: Partial<PDFFile>,
    callback?: (pdf: PDFFile) => PDFFile
  ) => {
    setPdfs((prev) =>
      prev.map((pdf) => {
        if (pdf.id === id) {
          const updated = { ...pdf, ...updates }
          return callback ? callback(updated) : updated
        }
        return pdf
      })
    )
  }

  // Legacy processing functions kept for merge operation and as fallback
  // All other operations now use PDFBatchProcessor for parallel processing
  const mergePDFs = async () => {
    if (pdfs.length < 2) return

    const startTime = Date.now()
    setIsProcessing(true)

    try {
      const { PDFDocument } = await loadPdfLib()
      const mergedPdf = await PDFDocument.create()

      for (let i = 0; i < pdfs.length; i++) {
        const pdf = pdfs[i]
        updatePdfStatus(pdf.id, { status: 'processing', progress: (i / pdfs.length) * 50 })

        const arrayBuffer = await pdf.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        for (const page of pages) {
          mergedPdf.addPage(page)
        }
      }

      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' })

      // Mark first PDF as completed with merged result
      updatePdfStatus(pdfs[0].id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob,
        processedSize: blob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pdfs_merged',
        category: 'pdf_tools',
        label: 'merge',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error merging PDFs:', error)
      pdfs.forEach((pdf) => {
        updatePdfStatus(pdf.id, {
          status: 'error',
          error: 'Failed to merge PDFs',
        })
      })

      trackEvent({
        action: 'merge_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }

    setIsProcessing(false)
  }

  const _splitPDF = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      const { PDFDocument } = await loadPdfLib()
      const arrayBuffer = await pdf.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()

      if (splitPageNumber < 1 || splitPageNumber > totalPages) {
        throw new Error('Invalid page number')
      }

      // Create first part (pages 1 to splitPageNumber)
      const pdf1 = await PDFDocument.create()
      const pages1 = await pdf1.copyPages(
        pdfDoc,
        Array.from({ length: splitPageNumber }, (_, i) => i)
      )
      for (const page of pages1) {
        pdf1.addPage(page)
      }

      // Create second part (remaining pages)
      const pdf2 = await PDFDocument.create()
      const pages2 = await pdf2.copyPages(
        pdfDoc,
        Array.from({ length: totalPages - splitPageNumber }, (_, i) => i + splitPageNumber)
      )
      for (const page of pages2) {
        pdf2.addPage(page)
      }

      const bytes1 = await pdf1.save()
      const bytes2 = await pdf2.save()

      // For split, we'll create two download buttons
      const blob1 = new Blob([new Uint8Array(bytes1)], { type: 'application/pdf' })
      const blob2 = new Blob([new Uint8Array(bytes2)], { type: 'application/pdf' })

      // Store both parts (we'll use processedBlob for part 1 and add custom handling for part 2)
      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob1,
        processedSize: blob1.size + blob2.size,
      })

      // Store part 2 in a custom property (we'll handle this in download)
      setPdfs((prev) =>
        prev.map((p) =>
          p.id === pdf.id ? { ...p, splitBlob2: blob2 as Blob & { splitBlob2?: Blob } } : p
        )
      )

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pdf_split',
        category: 'pdf_tools',
        label: 'split',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error splitting PDF:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to split PDF',
      })

      trackEvent({
        action: 'split_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _compressPDF = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      // Initialize both libraries
      const pdfjs = await initPdfjs()
      const { PDFDocument } = await loadPdfLib()

      // Calculate quality based on compression level
      const qualityMap = {
        low: 0.9, // 10% compression
        medium: 0.5, // 50% compression
        high: 0.2, // 80% compression
      }
      const imageQuality = qualityMap[compressionLevel]

      updatePdfStatus(pdf.id, { progress: 10 })

      // Load PDF with pdfjs for rendering
      const arrayBuffer = await pdf.file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdfjsDoc = await loadingTask.promise

      updatePdfStatus(pdf.id, { progress: 20 })

      // Create new PDF document
      const pdfDoc = await PDFDocument.create()

      // Process each page
      for (let pageNum = 1; pageNum <= pdfjsDoc.numPages; pageNum++) {
        const page = await pdfjsDoc.getPage(pageNum)

        // Use lower scale for higher compression
        const scale = compressionLevel === 'high' ? 1.0 : compressionLevel === 'medium' ? 1.5 : 2.0
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')

        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise

        // Convert to JPEG with compression for better file size reduction
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Failed to create blob'))
            },
            'image/jpeg',
            imageQuality
          )
        })

        // Embed compressed image in new PDF
        const jpegImage = await pdfDoc.embedJpg(await blob.arrayBuffer())
        const newPage = pdfDoc.addPage([viewport.width, viewport.height])
        newPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        })

        updatePdfStatus(pdf.id, {
          status: 'processing',
          progress: 20 + (pageNum / pdfjsDoc.numPages) * 70,
        })
      }

      updatePdfStatus(pdf.id, { progress: 95 })

      // Save the compressed PDF with additional optimizations
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      const finalBlob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' })

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: finalBlob,
        processedSize: finalBlob.size,
      })

      const processingTime = Date.now() - startTime
      const compressionRatio = Math.round(((pdf.size - finalBlob.size) / pdf.size) * 100)

      trackEvent({
        action: 'pdf_compressed',
        category: 'pdf_tools',
        label: 'compress',
        value: Math.round(processingTime / 1000),
      })

      console.log(
        `Compression complete: ${pdf.size} -> ${finalBlob.size} (${compressionRatio}% reduction)`
      )
    } catch (error) {
      console.error('Error compressing PDF:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to compress PDF',
      })

      trackEvent({
        action: 'compress_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _convertToImages = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      // Initialize pdfjs dynamically
      const pdfjs = await initPdfjs()

      const arrayBuffer = await pdf.file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdfDoc = await loadingTask.promise

      const images: Blob[] = []

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          }, 'image/png')
        })

        images.push(blob)

        updatePdfStatus(pdf.id, {
          status: 'processing',
          progress: (pageNum / pdfDoc.numPages) * 100,
        })
      }

      // Store images array in custom property
      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
      })

      setPdfs((prev) =>
        prev.map((p) =>
          p.id === pdf.id ? { ...p, imageBlobs: images as Blob[] & { imageBlobs?: Blob[] } } : p
        )
      )

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pdf_to_images',
        category: 'pdf_tools',
        label: 'convert_to_images',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error converting to images:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to convert to images',
      })

      trackEvent({
        action: 'to_images_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _convertToGrayscale = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      // Initialize both libraries
      const pdfjs = await initPdfjs()
      const { PDFDocument } = await loadPdfLib()

      // Load PDF with pdfjs for rendering
      const arrayBuffer = await pdf.file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdfjsDoc = await loadingTask.promise

      // Create new PDF document
      const pdfDoc = await PDFDocument.create()

      for (let pageNum = 1; pageNum <= pdfjsDoc.numPages; pageNum++) {
        const page = await pdfjsDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise

        // Convert to grayscale
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          // Calculate luminance using standard formula
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
          data[i] = gray // Red
          data[i + 1] = gray // Green
          data[i + 2] = gray // Blue
          // Alpha channel (data[i + 3]) remains unchanged
        }
        context.putImageData(imageData, 0, 0)

        // Convert canvas to PNG blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          }, 'image/png')
        })

        // Embed image in new PDF
        const pngImage = await pdfDoc.embedPng(await blob.arrayBuffer())
        const newPage = pdfDoc.addPage([viewport.width, viewport.height])
        newPage.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        })

        updatePdfStatus(pdf.id, {
          status: 'processing',
          progress: (pageNum / pdfjsDoc.numPages) * 100,
        })
      }

      const grayscaleBytes = await pdfDoc.save()
      const finalBlob = new Blob([new Uint8Array(grayscaleBytes)], { type: 'application/pdf' })

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: finalBlob,
        processedSize: finalBlob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'grayscale_converted',
        category: 'pdf_tools',
        label: 'grayscale',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error converting to grayscale:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to convert to grayscale',
      })

      trackEvent({
        action: 'grayscale_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _addWatermark = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      const { PDFDocument, rgb, degrees } = await loadPdfLib()
      const arrayBuffer = await pdf.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      // Helper function to convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? {
              r: parseInt(result[1], 16) / 255,
              g: parseInt(result[2], 16) / 255,
              b: parseInt(result[3], 16) / 255,
            }
          : { r: 0.7, g: 0.7, b: 0.7 }
      }

      // Helper function to calculate position
      const getPosition = (
        width: number,
        height: number,
        textLength: number,
        position: string,
        fontSize: number
      ) => {
        const estimatedWidth = textLength * fontSize * 0.5
        switch (position) {
          case 'center':
            return { x: width / 2 - estimatedWidth / 2, y: height / 2 }
          case 'diagonal':
            return { x: width / 2 - textLength * 10, y: height / 2 }
          case 'top':
            return { x: width / 2 - estimatedWidth / 2, y: height - 50 }
          case 'bottom':
            return { x: width / 2 - estimatedWidth / 2, y: 50 }
          case 'top-left':
            return { x: 50, y: height - 50 }
          case 'top-right':
            return { x: width - estimatedWidth - 50, y: height - 50 }
          case 'bottom-left':
            return { x: 50, y: 50 }
          case 'bottom-right':
            return { x: width - estimatedWidth - 50, y: 50 }
          default:
            return { x: width / 2 - textLength * 10, y: height / 2 }
        }
      }

      const rgbColor = hexToRgb(watermarkColor)

      // biome-ignore lint/suspicious/noExplicitAny: pdf-lib types compatibility
      pages.forEach((page: any, index: number) => {
        const { width, height } = page.getSize()

        const drawOptions = {
          size: watermarkFontSize,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          opacity: watermarkOpacity,
          rotate: degrees(watermarkRotation),
        }

        if (watermarkPattern) {
          // Draw watermark multiple times in a grid pattern
          const spacingX = width / 3
          const spacingY = height / 3
          for (let xOffset = 0; xOffset < width; xOffset += spacingX) {
            for (let yOffset = 0; yOffset < height; yOffset += spacingY) {
              page.drawText(watermarkText, {
                x: xOffset,
                y: yOffset,
                ...drawOptions,
              })
            }
          }
        } else {
          // Single watermark at specified position
          const pos = getPosition(
            width,
            height,
            watermarkText.length,
            watermarkPosition,
            watermarkFontSize
          )
          page.drawText(watermarkText, {
            x: pos.x,
            y: pos.y,
            ...drawOptions,
          })
        }

        updatePdfStatus(pdf.id, {
          status: 'processing',
          progress: ((index + 1) / pages.length) * 100,
        })
      })

      const watermarkedBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(watermarkedBytes)], { type: 'application/pdf' })

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob,
        processedSize: blob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'watermark_added',
        category: 'pdf_tools',
        label: 'watermark',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error adding watermark:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to add watermark',
      })

      trackEvent({
        action: 'watermark_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _extractPages = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      const { PDFDocument } = await loadPdfLib()
      const arrayBuffer = await pdf.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()

      if (
        extractStartPage < 1 ||
        extractEndPage > totalPages ||
        extractStartPage > extractEndPage
      ) {
        throw new Error('Invalid page range')
      }

      const newPdf = await PDFDocument.create()
      const pageIndices = Array.from(
        { length: extractEndPage - extractStartPage + 1 },
        (_, i) => i + extractStartPage - 1
      )

      const pages = await newPdf.copyPages(pdfDoc, pageIndices)
      for (const page of pages) {
        newPdf.addPage(page)
      }

      const extractedBytes = await newPdf.save()
      const blob = new Blob([new Uint8Array(extractedBytes)], { type: 'application/pdf' })

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob,
        processedSize: blob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pages_extracted',
        category: 'pdf_tools',
        label: 'extract',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error extracting pages:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to extract pages',
      })

      trackEvent({
        action: 'extract_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _rotatePDF = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      const { PDFDocument, degrees } = await loadPdfLib()
      const arrayBuffer = await pdf.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      // biome-ignore lint/suspicious/noExplicitAny: pdf-lib types compatibility
      pages.forEach((page: any, index: number) => {
        page.setRotation(degrees(rotationAngle))

        updatePdfStatus(pdf.id, {
          status: 'processing',
          progress: ((index + 1) / pages.length) * 100,
        })
      })

      const rotatedBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(rotatedBytes)], { type: 'application/pdf' })

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob,
        processedSize: blob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pdf_rotated',
        category: 'pdf_tools',
        label: 'rotate',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error rotating PDF:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to rotate PDF',
      })

      trackEvent({
        action: 'rotate_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const _convertToWord = async (pdf: PDFFile) => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 0 })

    try {
      // Initialize pdfjs dynamically
      const pdfjs = await initPdfjs()
      // Import docx library dynamically
      const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')

      const arrayBuffer = await pdf.file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdfDoc = await loadingTask.promise

      // biome-ignore lint/suspicious/noExplicitAny: pdfjs document structure
      const paragraphs: any[] = []

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum)
        const textContent = await page.getTextContent()

        updatePdfStatus(pdf.id, {
          status: 'processing',
          progress: (pageNum / pdfDoc.numPages) * 80, // Reserve 20% for DOCX generation
        })

        // Group text items by line (similar Y coordinates)
        // biome-ignore lint/suspicious/noExplicitAny: pdfjs text content items
        const lines: Map<number, any[]> = new Map()
        const tolerance = 2 // Y-coordinate tolerance for grouping

        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            const y = Math.round(item.transform[5] / tolerance) * tolerance
            if (!lines.has(y)) {
              lines.set(y, [])
            }
            lines.get(y)?.push(item)
          }
        }

        // Sort lines by Y coordinate (top to bottom)
        const sortedLines = Array.from(lines.entries()).sort((a, b) => b[0] - a[0])

        // Add page header if multiple pages
        if (pdfDoc.numPages > 1) {
          paragraphs.push(
            new Paragraph({
              text: `--- Page ${pageNum} ---`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 120 },
            })
          )
        }

        // Convert each line to a paragraph
        for (const [_, lineItems] of sortedLines) {
          // Sort items in line by X coordinate (left to right)
          lineItems.sort((a, b) => a.transform[4] - b.transform[4])

          const textRuns: InstanceType<typeof TextRun>[] = []
          let previousX = -1
          let previousFontSize = -1

          for (const item of lineItems) {
            const text = item.str
            const x = item.transform[4]
            const fontSize = item.transform[0]

            // Detect if this is a potential heading (larger font)
            const isLarger = previousFontSize > 0 && fontSize > previousFontSize * 1.2

            // Add space between words if X gap is significant
            if (previousX !== -1 && x - previousX > fontSize * 0.3) {
              textRuns.push(new TextRun(' '))
            }

            textRuns.push(
              new TextRun({
                text: text,
                bold: isLarger,
                size: Math.round(fontSize * 2), // Convert to half-points
              })
            )

            previousX = x + text.length * fontSize * 0.5
            previousFontSize = fontSize
          }

          if (textRuns.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                spacing: { after: 120 },
              })
            )
          }
        }

        // Add page break between pages (except last page)
        if (pageNum < pdfDoc.numPages) {
          paragraphs.push(
            new Paragraph({
              text: '',
              pageBreakBefore: true,
            })
          )
        }
      }

      updatePdfStatus(pdf.id, {
        status: 'processing',
        progress: 90,
      })

      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      })

      // Generate DOCX blob
      const blob = await Packer.toBlob(doc)

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob,
        processedSize: blob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pdf_to_word',
        category: 'pdf_tools',
        label: 'convert_to_word',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error converting to Word:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to convert to Word',
      })

      trackEvent({
        action: 'to_word_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  // Apply annotations to PDF using pdf-lib
  const applyAnnotationsToPDF = async (pdf: PDFFile, annotations: Annotation[]): Promise<void> => {
    const startTime = Date.now()
    updatePdfStatus(pdf.id, { status: 'processing', progress: 10 })

    try {
      const { PDFDocument, rgb } = await loadPdfLib()
      const arrayBuffer = await pdf.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Helper to convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? {
              r: Number.parseInt(result[1], 16) / 255,
              g: Number.parseInt(result[2], 16) / 255,
              b: Number.parseInt(result[3], 16) / 255,
            }
          : { r: 0, g: 0, b: 0 }
      }

      updatePdfStatus(pdf.id, { progress: 30 })

      // Group annotations by page
      const annotationsByPage = annotations.reduce(
        (acc, ann) => {
          if (!acc[ann.page]) acc[ann.page] = []
          acc[ann.page].push(ann)
          return acc
        },
        {} as Record<number, Annotation[]>
      )

      updatePdfStatus(pdf.id, { progress: 50 })

      // Apply annotations to each page
      for (const [pageNum, pageAnnotations] of Object.entries(annotationsByPage)) {
        const pageIndex = Number.parseInt(pageNum, 10) - 1
        const page = pdfDoc.getPages()[pageIndex]
        if (!page) continue

        const { height } = page.getSize()

        for (const ann of pageAnnotations) {
          const color = hexToRgb(ann.color)
          // Convert coordinates (canvas has origin at top-left, PDF has origin at bottom-left)
          const pdfY = height - ann.y

          switch (ann.type) {
            case 'text':
              if (ann.text) {
                page.drawText(ann.text, {
                  x: ann.x,
                  y: pdfY,
                  size: ann.fontSize || 16,
                  color: rgb(color.r, color.g, color.b),
                })
              }
              break

            case 'highlight':
              if (ann.width && ann.height) {
                page.drawRectangle({
                  x: ann.x,
                  y: pdfY - (ann.height || 0),
                  width: ann.width,
                  height: ann.height,
                  color: rgb(color.r, color.g, color.b),
                  opacity: 0.3,
                })
              }
              break

            case 'rectangle':
              if (ann.width && ann.height) {
                page.drawRectangle({
                  x: ann.x,
                  y: pdfY - (ann.height || 0),
                  width: ann.width,
                  height: ann.height,
                  borderColor: rgb(color.r, color.g, color.b),
                  borderWidth: 2,
                })
              }
              break

            case 'circle':
              if (ann.width && ann.height) {
                const radius = Math.sqrt(ann.width ** 2 + ann.height ** 2) / 2
                page.drawCircle({
                  x: ann.x,
                  y: pdfY,
                  size: radius,
                  borderColor: rgb(color.r, color.g, color.b),
                  borderWidth: 2,
                })
              }
              break

            case 'line':
              if (ann.x2 !== undefined && ann.y2 !== undefined) {
                const pdfY2 = height - ann.y2
                page.drawLine({
                  start: { x: ann.x, y: pdfY },
                  end: { x: ann.x2, y: pdfY2 },
                  color: rgb(color.r, color.g, color.b),
                  thickness: 2,
                })
              }
              break
          }
        }
      }

      updatePdfStatus(pdf.id, { progress: 80 })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })

      updatePdfStatus(pdf.id, {
        status: 'completed',
        progress: 100,
        processedBlob: blob,
        processedSize: blob.size,
      })

      const processingTime = Date.now() - startTime
      trackEvent({
        action: 'pdf_edited',
        category: 'pdf_tools',
        label: 'edit_pdf',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error editing PDF:', error)
      updatePdfStatus(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to edit PDF',
      })

      trackEvent({
        action: 'edit_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  // AI Summarization handler
  const handleAISummarize = async () => {
    if (pdfs.length === 0) {
      toast.error('Please upload a PDF file first')
      return
    }

    if (pdfs.length > 1) {
      toast.error('AI Summarization works with one PDF at a time. Please upload only one file.')
      return
    }

    const pdf = pdfs[0]
    setIsSummarizing(true)
    setShowSummarization(true)
    setSummarizationResult(null)

    try {
      trackEvent({
        action: 'ai_summarize_start',
        category: 'pdf_tools',
        label: 'ai_summarize',
      })

      // Extract text from PDF
      toast.info('Extracting text from PDF...')
      const extractedData = await extractTextFromPDF(pdf.file, {
        maxPages: 50, // Limit to first 50 pages for performance
        onProgress: (current, total) => {
          console.log(`Extracting page ${current} of ${total}`)
        },
      })

      if (!extractedData.text || extractedData.text.trim().length < 100) {
        throw new Error(
          'Could not extract enough text from PDF. The PDF might be scanned or image-based. Try using OCR first.'
        )
      }

      // Call AI API
      toast.info('Analyzing document with AI...')
      const response = await fetch('/api/ai-pdf-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: extractedData.text,
          fileName: pdf.name,
          pageCount: extractedData.pageCount,
          options: {
            length: 'medium',
            includeTechnical: true,
            language: 'en',
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }

      const result = await response.json()
      setSummarizationResult(result)
      toast.success('AI summary generated successfully!')

      trackEvent({
        action: 'ai_summarize_complete',
        category: 'pdf_tools',
        label: 'ai_summarize',
      })
    } catch (error) {
      console.error('AI Summarization error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate AI summary')
      setShowSummarization(false)

      trackEvent({
        action: 'ai_summarize_error',
        category: 'pdf_tools',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleProcess = async () => {
    saveSnapshot(`process_${operation}`)

    // Check if batch processing is paused
    if (batchQueue.isPaused && pdfs.length > 1) {
      toast.error('Batch processing is paused. Please resume to continue.')
      return
    }

    setIsProcessing(true)

    try {
      if (operation === 'merge') {
        await mergePDFs()
      } else if (operation === 'edit') {
        const pendingPdfs = pdfs.filter((p) => p.status === 'pending')
        if (pendingPdfs.length > 0) {
          setEditingPdf(pendingPdfs[0])
          setIsEditorOpen(true)
        }
        setIsProcessing(false)
        return
      } else if (operation === 'aiSummarize') {
        setIsProcessing(false)
        await handleAISummarize()
        return
      } else {
        // Use batch processor for parallel processing
        if (batchProcessorRef.current) {
          await batchProcessorRef.current.processBatch(pdfs, operation, {
            compressionLevel,
            splitPageNumber,
            watermarkType,
            watermarkText,
            watermarkImage,
            watermarkImageScale,
            watermarkOpacity,
            watermarkRotation,
            watermarkPosition,
            watermarkColor,
            watermarkFontSize,
            watermarkPattern,
            extractStartPage,
            extractEndPage,
            rotationAngle,
            imageToPdfPageSize,
            imageToPdfFitMode,
            pagesToDelete: Array.from(selectedPages),
            unlockPassword,
            pagesToDuplicate: Array.from(selectedPages),
            duplicateCount,
            pageOrder,
            pageNumberPosition,
            pageNumberFormat,
            pageNumberFontSize,
            pageNumberStartFrom,
            metadataTitle,
            metadataAuthor,
            metadataSubject,
            metadataKeywords: metadataKeywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean),
            metadataCreator,
            metadataProducer,
            ocrLanguage,
            password,
            ownerPassword,
            userPermissions: {
              printing: allowPrinting,
              modifying: allowModifying,
              copying: allowCopying,
            },
            headerText,
            footerText,
            headerPosition,
            footerPosition,
            headerFooterFontSize,
            includePageNumbers,
            bookmarks,
          })

          toast.success(
            `Successfully processed ${pdfs.filter((p) => p.status === 'completed').length} files`
          )
        }
      }
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process PDFs')
    }

    setIsProcessing(false)
  }

  const handleDownloadAll = () => {
    const completed = pdfs.filter((p) => p.status === 'completed')
    if (completed.length === 0) {
      toast.error('No completed PDFs to download')
      return
    }

    for (const pdf of completed) {
      handleDownload(pdf)
    }
    toast.success(`Downloaded ${completed.length} files`)

    trackEvent({
      action: 'download_all',
      category: 'pdf_tools',
      label: operation,
      value: completed.length,
    })
  }

  const handleDownload = (pdf: PDFFile) => {
    if (operation === 'toImages' || operation === 'extractImages') {
      // Download all images
      const images = (pdf as PDFFile & { imageBlobs?: Blob[] }).imageBlobs
      if (!images) return

      images.forEach((blob, index) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        if (operation === 'extractImages') {
          a.download = `${pdf.name.replace('.pdf', '')}_image_${index + 1}.png`
        } else {
          a.download = `${pdf.name.replace('.pdf', '')}_page_${index + 1}.png`
        }
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })

      trackEvent({
        action: operation === 'extractImages' ? 'images_extracted' : 'images_downloaded',
        category: 'pdf_tools',
        label: operation === 'extractImages' ? 'extract_images' : 'download_images',
        value: images.length,
      })
    } else if (operation === 'splitByBookmarks') {
      // Download all split PDFs
      const splitPdfs = (pdf as PDFFile & { splitPdfs?: Array<{ blob: Blob; name: string }> })
        .splitPdfs
      if (!splitPdfs) return

      splitPdfs.forEach((split, index) => {
        setTimeout(() => {
          const url = URL.createObjectURL(split.blob)
          const a = document.createElement('a')
          a.href = url
          a.download = split.name
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, index * 100) // Stagger downloads to avoid browser blocking
      })

      trackEvent({
        action: 'split_by_bookmarks_downloaded',
        category: 'pdf_tools',
        label: 'download_split_bookmarks',
        value: splitPdfs.length,
      })
    } else if (operation === 'split') {
      // Download both parts
      if (!pdf.processedBlob) return

      const blob2 = (pdf as PDFFile & { splitBlob2?: Blob }).splitBlob2

      // Download part 1
      const url1 = URL.createObjectURL(pdf.processedBlob)
      const a1 = document.createElement('a')
      a1.href = url1
      a1.download = `${pdf.name.replace('.pdf', '')}_part1.pdf`
      document.body.appendChild(a1)
      a1.click()
      document.body.removeChild(a1)
      URL.revokeObjectURL(url1)

      // Download part 2 if exists
      if (blob2) {
        setTimeout(() => {
          const url2 = URL.createObjectURL(blob2)
          const a2 = document.createElement('a')
          a2.href = url2
          a2.download = `${pdf.name.replace('.pdf', '')}_part2.pdf`
          document.body.appendChild(a2)
          a2.click()
          document.body.removeChild(a2)
          URL.revokeObjectURL(url2)
        }, 100)
      }

      trackEvent({
        action: 'split_pdfs_downloaded',
        category: 'pdf_tools',
        label: 'download_split',
      })
    } else {
      // Download single PDF or DOCX
      if (!pdf.processedBlob) return

      const url = URL.createObjectURL(pdf.processedBlob)
      const a = document.createElement('a')
      a.href = url

      let suffix = ''
      let extension = '.pdf'

      switch (operation) {
        case 'merge':
          suffix = '_merged'
          break
        case 'compress':
          suffix = '_compressed'
          break
        case 'imagesToPdf':
          suffix = ''
          extension = '.pdf'
          break
        case 'watermark':
          suffix = '_watermarked'
          break
        case 'extract':
          suffix = '_extracted'
          break
        case 'rotate':
          suffix = '_rotated'
          break
        case 'toWord':
          suffix = ''
          extension = '.docx'
          break
        case 'edit':
          suffix = '_edited'
          break
        case 'grayscale':
          suffix = '_grayscale'
          break
        case 'deletePages':
          suffix = '_pages_deleted'
          break
        case 'unlock':
          suffix = '_unlocked'
          break
        case 'duplicatePages':
          suffix = '_pages_duplicated'
          break
        case 'reorder':
          suffix = '_reordered'
          break
        case 'addPageNumbers':
          suffix = '_numbered'
          break
        case 'extractText':
          suffix = ''
          extension = '.txt'
          break
        case 'editMetadata':
          suffix = '_metadata_updated'
          break
        case 'ocrExtract':
          suffix = '_ocr'
          extension = '.txt'
          break
        case 'protect':
          suffix = '_protected'
          break
        case 'flatten':
          suffix = '_flattened'
          break
        case 'addHeaderFooter':
          suffix = '_header_footer'
          break
        case 'addBookmarks':
          suffix = '_bookmarks'
          break
        case 'optimizeWeb':
          suffix = '_optimized'
          break
      }

      // Handle different file name patterns for image to PDF
      if (operation === 'imagesToPdf') {
        const nameWithoutExt = pdf.name.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        a.download = `${nameWithoutExt}${suffix}${extension}`
      } else {
        a.download = pdf.name.replace('.pdf', `${suffix}${extension}`)
      }
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      trackEvent({
        action: 'pdf_downloaded',
        category: 'pdf_tools',
        label: operation,
      })
    }
  }

  const handleRemove = (id: string) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id))
  }

  const handleClearAll = () => {
    setPdfs([])
    setSelectedPages(new Set())
    trackEvent({
      action: 'clear_all',
      category: 'pdf_tools',
      label: 'reset',
    })
  }

  // Toggle page selection for deletePages operation
  const handleTogglePageSelection = (pageNumber: number) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber)
      } else {
        newSet.add(pageNumber)
      }
      return newSet
    })
  }

  // Select all pages
  const handleSelectAllPages = () => {
    if (pdfs.length > 0 && pdfs[0]) {
      const allPages = Array.from({ length: pdfs[0].pages }, (_, i) => i + 1)
      setSelectedPages(new Set(allPages))
    }
  }

  // Deselect all pages
  const handleDeselectAllPages = () => {
    setSelectedPages(new Set())
  }

  // Reset selected pages when operation changes
  useEffect(() => {
    if (operation !== 'deletePages' && operation !== 'duplicatePages') {
      setSelectedPages(new Set())
    }
    if (operation !== 'duplicatePages') {
      setDuplicateCount(1)
    }
    if (operation !== 'unlock') {
      setUnlockPassword('')
    }
    if (operation !== 'reorder') {
      setPageOrder([])
    }
  }, [operation])

  // Initialize page order when operation is reorder and PDF is loaded
  useEffect(() => {
    if (operation === 'reorder' && pdfs.length > 0 && pdfs[0] && pageOrder.length === 0) {
      const pages = Array.from({ length: pdfs[0].pages }, (_, i) => i + 1)
      setPageOrder(pages)
    }
  }, [operation, pdfs, pageOrder.length])

  // Reset focused page when switching operations or clearing pages
  useEffect(() => {
    if (operation !== 'reorder' || pageOrder.length === 0) {
      setFocusedPageIndex(-1)
    } else if (focusedPageIndex >= pageOrder.length) {
      setFocusedPageIndex(pageOrder.length - 1)
    }
  }, [operation, pageOrder.length, focusedPageIndex])

  // Keyboard shortcuts for reorder operation
  useEffect(() => {
    if (operation !== 'reorder' || pageOrder.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Arrow Up: Navigate to previous page
      if (e.key === 'ArrowUp' && !cmdOrCtrl && !e.shiftKey) {
        e.preventDefault()
        setFocusedPageIndex((prev) => (prev <= 0 ? 0 : prev - 1))
      }

      // Arrow Down: Navigate to next page
      if (e.key === 'ArrowDown' && !cmdOrCtrl && !e.shiftKey) {
        e.preventDefault()
        setFocusedPageIndex((prev) =>
          prev >= pageOrder.length - 1 ? pageOrder.length - 1 : prev + 1
        )
      }

      // Ctrl/Cmd + Arrow Up: Move focused page up
      if (e.key === 'ArrowUp' && cmdOrCtrl && focusedPageIndex > 0) {
        e.preventDefault()
        setPageOrder((items) => {
          const newItems = [...items]
          const temp = newItems[focusedPageIndex]
          newItems[focusedPageIndex] = newItems[focusedPageIndex - 1]
          newItems[focusedPageIndex - 1] = temp
          return newItems
        })
        setFocusedPageIndex((prev) => prev - 1)
      }

      // Ctrl/Cmd + Arrow Down: Move focused page down
      if (
        e.key === 'ArrowDown' &&
        cmdOrCtrl &&
        focusedPageIndex >= 0 &&
        focusedPageIndex < pageOrder.length - 1
      ) {
        e.preventDefault()
        setPageOrder((items) => {
          const newItems = [...items]
          const temp = newItems[focusedPageIndex]
          newItems[focusedPageIndex] = newItems[focusedPageIndex + 1]
          newItems[focusedPageIndex + 1] = temp
          return newItems
        })
        setFocusedPageIndex((prev) => prev + 1)
      }

      // Ctrl/Cmd + Home: Move focused page to top
      if (e.key === 'Home' && cmdOrCtrl && focusedPageIndex > 0) {
        e.preventDefault()
        setPageOrder((items) => {
          const newItems = [...items]
          const page = newItems.splice(focusedPageIndex, 1)[0]
          newItems.unshift(page)
          return newItems
        })
        setFocusedPageIndex(0)
      }

      // Ctrl/Cmd + End: Move focused page to bottom
      if (
        e.key === 'End' &&
        cmdOrCtrl &&
        focusedPageIndex >= 0 &&
        focusedPageIndex < pageOrder.length - 1
      ) {
        e.preventDefault()
        setPageOrder((items) => {
          const newItems = [...items]
          const page = newItems.splice(focusedPageIndex, 1)[0]
          newItems.push(page)
          return newItems
        })
        setFocusedPageIndex(pageOrder.length - 1)
      }

      // Tab: Focus first page if none focused
      if (e.key === 'Tab' && !e.shiftKey && focusedPageIndex === -1 && pageOrder.length > 0) {
        e.preventDefault()
        setFocusedPageIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [operation, pageOrder, focusedPageIndex])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  // Drag and drop sensors for reorder
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPageOrder((items) => {
        const oldIndex = items.indexOf(active.id as number)
        const newIndex = items.indexOf(over.id as number)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Sortable page item component
  function SortablePageItem({
    pageNum,
    index,
    isFocused,
  }: {
    pageNum: number
    index: number
    isFocused: boolean
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: pageNum,
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setFocusedPageIndex(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setFocusedPageIndex(index)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Page ${pageNum}`}
        className={css({
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          p: '3',
          rounded: 'md',
          bg: isFocused ? 'purple.500/20' : 'gray.800',
          border: '2px solid',
          borderColor: isFocused ? 'purple.500' : 'gray.700',
          cursor: 'grab',
          transition: 'all 0.2s',
          _hover: {
            borderColor: 'purple.500',
            bg: isFocused ? 'purple.500/20' : 'gray.750',
          },
          _active: {
            cursor: 'grabbing',
          },
        })}
      >
        <GripVertical
          className={css({
            h: '5',
            w: '5',
            color: 'white',
            flexShrink: 0,
          })}
        />
        <PDFThumbnail file={pdfs[0].file} pageNumber={pageNum} width={60} height={80} />
        <div className={css({ fontSize: 'sm', color: 'white' })}>Page {pageNum}</div>
      </div>
    )
  }

  const operations = [
    { value: 'merge', label: 'Merge PDFs', icon: Merge },
    { value: 'split', label: 'Split PDF', icon: Split },
    { value: 'compress', label: 'Compress', icon: Archive },
    { value: 'toImages', label: 'To Images', icon: ImageIcon },
    { value: 'imagesToPdf', label: 'Images to PDF', icon: FileDown },
    { value: 'watermark', label: 'Watermark', icon: Droplet },
    { value: 'extract', label: 'Extract Pages', icon: Copy },
    { value: 'rotate', label: 'Rotate', icon: RotateCw },
    { value: 'toWord', label: 'PDF to Word', icon: FileOutput },
    { value: 'edit', label: 'Edit PDF', icon: Edit3 },
    { value: 'grayscale', label: 'Grayscale', icon: Settings },
  ]

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4',
          textAlign: 'center',
          w: 'full',
          maxW: '1400px',
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'red.500/20',
            bg: 'red.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <FileText
            className={css({
              h: '5',
              w: '5',
              color: 'red.400',
            })}
          />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'red.300',
            })}
          >
            Professional PDF Processing
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'red.400',
              gradientVia: 'orange.400',
              gradientTo: 'yellow.400',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            PDF Tools Suite
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'white',
          })}
        >
          Merge, split, compress, watermark, and convert PDFs. Convert images to PDF with powerful
          browser-based tools. 100% secure - all processing happens on your device.
        </p>

        {/* Keyboard Shortcuts Help */}
        <div className={css({ display: 'flex', justifyContent: 'center', mt: '4' })}>
          <KeyboardShortcutsDialog />
        </div>
      </motion.div>
      {/* Stats Summary */}
      {pdfs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={css({
            display: 'grid',
            w: 'full',
            gap: '4',
            gridTemplateColumns: {
              base: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
            },
            maxW: '1400px',
          })}
        >
          <Card
            className={css({
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent withTopPadding>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'red.400',
                  })}
                >
                  {pdfs.length}
                </div>
                <div
                  className={css({
                    fontSize: 'xs',
                    color: 'white',
                  })}
                >
                  Total PDFs
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={css({
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent withTopPadding>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'orange.400',
                  })}
                >
                  {pdfs.reduce((sum, pdf) => sum + pdf.pages, 0)}
                </div>
                <div
                  className={css({
                    fontSize: 'xs',
                    color: 'white',
                  })}
                >
                  Total Pages
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={css({
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent withTopPadding>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div
                  className={css({
                    mb: '2',
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'yellow.400',
                  })}
                >
                  {formatBytes(pdfs.reduce((sum, pdf) => sum + pdf.size, 0))}
                </div>
                <div
                  className={css({
                    fontSize: 'xs',
                    color: 'white',
                  })}
                >
                  Total Size
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: '1fr 2fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({
            w: 'full',
            gridColumn: { base: 'span 1', md: 'span 1', lg: 'span 1' },
          })}
        >
          <Card
            className={css({
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Settings
                    className={css({
                      h: '5',
                      w: '5',
                      color: 'red.400',
                    })}
                  />
                  Operations
                </CardTitle>
                <CardDescription>Choose a PDF operation to perform</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '6' })}>
                {/* Operation Selection */}
                {/* Desktop: Grid Layout */}
                <div className={css({ display: { base: 'none', lg: 'block' } })}>
                  <OperationGrid
                    selectedOperation={operation}
                    onOperationChange={setOperation}
                    disabled={isProcessing}
                  />
                </div>

                {/* Mobile: Bottom Sheet */}
                <div className={css({ display: { base: 'block', lg: 'none' } })}>
                  <MobileOperationPicker
                    selectedOperation={operation}
                    onOperationChange={setOperation}
                    operationLabel={
                      operations.find((op) => op.value === operation)?.label || 'Select Operation'
                    }
                    disabled={isProcessing}
                  />
                </div>

                {/* Operation-specific settings */}
                {operation === 'split' && (
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="split-page"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      Split at Page
                    </label>
                    <input
                      id="split-page"
                      type="number"
                      value={splitPageNumber}
                      onChange={(e) => setSplitPageNumber(Number(e.target.value))}
                      className={css({
                        w: 'full',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        px: '3',
                        py: '2',
                        fontSize: 'sm',
                        color: 'gray.100',
                        _focus: {
                          borderColor: 'red.500',
                          outline: 'none',
                        },
                      })}
                      min="1"
                    />
                    <p
                      className={css({
                        fontSize: 'xs',
                        color: 'white',
                      })}
                    >
                      Pages 1-N will be in part 1
                    </p>
                  </div>
                )}

                {operation === 'compress' && (
                  <div className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      Compression Level
                    </div>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2',
                        w: 'full',
                      })}
                    >
                      {[
                        { value: 'low' as const, label: 'Low', desc: '~10%' },
                        { value: 'medium' as const, label: 'Medium', desc: '~50%' },
                        { value: 'high' as const, label: 'High', desc: '~80%' },
                      ].map((level) => (
                        <Button
                          key={level.value}
                          variant={compressionLevel === level.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCompressionLevel(level.value)}
                          className={css({
                            flexDirection: 'column',
                            h: 'auto',
                            py: '3',
                            ...(compressionLevel === level.value
                              ? {
                                  borderColor: 'red.500/50',
                                  bg: 'red.500/20',
                                  color: 'red.200',
                                }
                              : {
                                  borderColor: 'gray.700',
                                }),
                          })}
                        >
                          <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                            {level.label}
                          </span>
                          <span className={css({ fontSize: 'xs', color: 'white' })}>
                            {level.desc}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <p
                      className={css({
                        fontSize: 'xs',
                        color: 'white',
                      })}
                    >
                      {compressionLevel === 'high'
                        ? 'Maximum compression - Best for documents with images'
                        : compressionLevel === 'medium'
                          ? 'Balanced compression - Good quality with smaller size'
                          : 'Minimal compression - Preserves quality'}
                    </p>
                    <div
                      className={css({
                        mt: '3',
                        p: '3',
                        rounded: 'md',
                        bg: 'yellow.500/10',
                        borderColor: 'yellow.500/20',
                        border: '1px solid',
                      })}
                    >
                      <p className={css({ fontSize: 'xs', color: 'yellow.200' })}>
                        <Sparkles
                          className={css({
                            display: 'inline',
                            h: '3',
                            w: '3',
                            mr: '1',
                          })}
                        />
                        High compression converts pages to images for maximum size reduction
                      </p>
                    </div>
                  </div>
                )}

                {operation === 'watermark' && (
                  <>
                    {/* Watermark Templates */}
                    <WatermarkTemplates
                      onSelectTemplate={handleTemplateSelect}
                      currentTemplate={currentTemplateName}
                    />

                    {/* Watermark Type Selection */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Watermark Type
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '2',
                        })}
                      >
                        <Button
                          variant={watermarkType === 'text' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setWatermarkType('text')
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({ fontSize: 'xs' })}
                        >
                          Text
                        </Button>
                        <Button
                          variant={watermarkType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setWatermarkType('image')
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({ fontSize: 'xs' })}
                        >
                          Image
                        </Button>
                        <Button
                          variant={watermarkType === 'qr' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setWatermarkType('qr')
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({ fontSize: 'xs' })}
                        >
                          QR Code
                        </Button>
                      </div>
                    </div>

                    {/* Conditional Input Based on Type */}
                    {watermarkType === 'text' && (
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="watermark-text"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          Watermark Text
                        </label>
                        <input
                          id="watermark-text"
                          type="text"
                          value={watermarkText}
                          onChange={(e) => {
                            setWatermarkText(e.target.value)
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({
                            w: 'full',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'gray.800',
                            px: '3',
                            py: '2',
                            fontSize: 'sm',
                            color: 'gray.100',
                            _focus: {
                              borderColor: 'red.500',
                              outline: 'none',
                            },
                          })}
                        />
                      </div>
                    )}

                    {watermarkType === 'image' && (
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="watermark-image-upload"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          Upload Image
                        </label>
                        <input
                          id="watermark-image-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleWatermarkImageUpload(file)
                          }}
                          className={css({
                            w: 'full',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'gray.800',
                            px: '3',
                            py: '2',
                            fontSize: 'sm',
                            color: 'gray.100',
                          })}
                        />
                        {watermarkImage && (
                          <div
                            className={css({
                              fontSize: 'xs',
                              color: 'white',
                            })}
                          >
                            Selected: {watermarkImage.name}
                          </div>
                        )}
                      </div>
                    )}

                    {watermarkType === 'qr' && (
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="watermark-qr-text"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          QR Code Text/URL
                        </label>
                        <div className={css({ display: 'flex', gap: '2' })}>
                          <input
                            id="watermark-qr-text"
                            type="text"
                            value={watermarkQRText}
                            onChange={(e) => setWatermarkQRText(e.target.value)}
                            placeholder="Enter text or URL for QR code"
                            className={css({
                              flex: '1',
                              rounded: 'md',
                              border: '1px solid',
                              borderColor: 'gray.700',
                              bg: 'gray.800',
                              px: '3',
                              py: '2',
                              fontSize: 'sm',
                              color: 'gray.100',
                              _focus: {
                                borderColor: 'red.500',
                                outline: 'none',
                              },
                            })}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleGenerateQRCode(watermarkQRText)}
                            disabled={!watermarkQRText.trim()}
                          >
                            Generate
                          </Button>
                        </div>
                        {watermarkImage && watermarkType === 'qr' && (
                          <div
                            className={css({
                              fontSize: 'xs',
                              color: 'green.400',
                            })}
                          >
                            QR code generated successfully
                          </div>
                        )}
                      </div>
                    )}

                    {/* Opacity Slider */}
                    <div className={css({ spaceY: '3' })}>
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        })}
                      >
                        <label
                          htmlFor="watermark-opacity"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          Opacity
                        </label>
                        <span
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'bold',
                            color: 'red.400',
                          })}
                        >
                          {Math.round(watermarkOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        id="watermark-opacity"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={watermarkOpacity}
                        onChange={(e) => {
                          setWatermarkOpacity(Number(e.target.value))
                          setCurrentTemplateName('Custom')
                        }}
                        className={css({
                          w: 'full',
                          accentColor: 'red.500',
                        })}
                      />
                    </div>

                    {/* Conditional Size Control */}
                    {watermarkType === 'text' ? (
                      <div className={css({ spaceY: '3' })}>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <label
                            htmlFor="watermark-font-size"
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'white',
                            })}
                          >
                            Font Size
                          </label>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'bold',
                              color: 'red.400',
                            })}
                          >
                            {watermarkFontSize}px
                          </span>
                        </div>
                        <input
                          id="watermark-font-size"
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={watermarkFontSize}
                          onChange={(e) => {
                            setWatermarkFontSize(Number(e.target.value))
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({
                            w: 'full',
                            accentColor: 'red.500',
                          })}
                        />
                      </div>
                    ) : (
                      <div className={css({ spaceY: '3' })}>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <label
                            htmlFor="watermark-image-scale"
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'white',
                            })}
                          >
                            Image Scale
                          </label>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'bold',
                              color: 'red.400',
                            })}
                          >
                            {watermarkImageScale.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          id="watermark-image-scale"
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={watermarkImageScale}
                          onChange={(e) => {
                            setWatermarkImageScale(Number(e.target.value))
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({
                            w: 'full',
                            accentColor: 'red.500',
                          })}
                        />
                      </div>
                    )}

                    {/* Rotation Slider */}
                    <div className={css({ spaceY: '3' })}>
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        })}
                      >
                        <label
                          htmlFor="watermark-rotation"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          Rotation
                        </label>
                        <span
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'bold',
                            color: 'red.400',
                          })}
                        >
                          {watermarkRotation}°
                        </span>
                      </div>
                      <input
                        id="watermark-rotation"
                        type="range"
                        min="-180"
                        max="180"
                        step="15"
                        value={watermarkRotation}
                        onChange={(e) => {
                          setWatermarkRotation(Number(e.target.value))
                          setCurrentTemplateName('Custom')
                        }}
                        className={css({
                          w: 'full',
                          accentColor: 'red.500',
                        })}
                      />
                    </div>

                    {/* Position Grid - Now with left and right */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Position
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '2',
                        })}
                      >
                        {(
                          [
                            'top-left',
                            'top',
                            'top-right',
                            'left',
                            'center',
                            'right',
                            'bottom-left',
                            'diagonal',
                            'bottom',
                            'bottom-right',
                          ] as const
                        ).map((pos) => (
                          <Button
                            key={pos}
                            variant={watermarkPosition === pos ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setWatermarkPosition(pos)
                              setCurrentTemplateName('Custom')
                            }}
                            className={css({
                              fontSize: 'xs',
                              textTransform: 'capitalize',
                            })}
                          >
                            {pos.replace('-', ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Color Picker - Only for Text */}
                    {watermarkType === 'text' && (
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="watermark-color"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          Color
                        </label>
                        <input
                          id="watermark-color"
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => {
                            setWatermarkColor(e.target.value)
                            setCurrentTemplateName('Custom')
                          }}
                          className={css({
                            w: 'full',
                            h: '10',
                            cursor: 'pointer',
                            borderRadius: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                          })}
                        />
                      </div>
                    )}

                    {/* Pattern Checkbox */}
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                      })}
                    >
                      <input
                        type="checkbox"
                        id="watermark-pattern"
                        checked={watermarkPattern}
                        onChange={(e) => {
                          setWatermarkPattern(e.target.checked)
                          setCurrentTemplateName('Custom')
                        }}
                        className={css({
                          w: '4',
                          h: '4',
                          cursor: 'pointer',
                          accentColor: 'red.500',
                        })}
                      />
                      <label
                        htmlFor="watermark-pattern"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                          cursor: 'pointer',
                        })}
                      >
                        Tile Pattern (Repeating Grid)
                      </label>
                    </div>

                    {/* Watermark Preview */}
                    <WatermarkPreview
                      type={watermarkType}
                      text={watermarkText}
                      image={watermarkImage}
                      opacity={watermarkOpacity}
                      rotation={watermarkRotation}
                      position={watermarkPosition}
                      color={watermarkColor}
                      fontSize={watermarkFontSize}
                      imageScale={watermarkImageScale}
                      pattern={watermarkPattern}
                    />
                  </>
                )}

                {operation === 'extract' && (
                  <div className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      Page Range
                    </div>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '2',
                        w: 'full',
                      })}
                    >
                      <div>
                        <label
                          htmlFor="extract-from"
                          className={css({
                            mb: '1',
                            display: 'block',
                            fontSize: 'xs',
                            color: 'white',
                          })}
                        >
                          From
                        </label>
                        <input
                          id="extract-from"
                          type="number"
                          value={extractStartPage}
                          onChange={(e) => setExtractStartPage(Number(e.target.value))}
                          className={css({
                            w: 'full',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'gray.800',
                            px: '3',
                            py: '2',
                            fontSize: 'sm',
                            color: 'gray.100',
                            _focus: {
                              borderColor: 'red.500',
                              outline: 'none',
                            },
                          })}
                          min="1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="extract-to"
                          className={css({
                            mb: '1',
                            display: 'block',
                            fontSize: 'xs',
                            color: 'white',
                          })}
                        >
                          To
                        </label>
                        <input
                          id="extract-to"
                          type="number"
                          value={extractEndPage}
                          onChange={(e) => setExtractEndPage(Number(e.target.value))}
                          className={css({
                            w: 'full',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'gray.800',
                            px: '3',
                            py: '2',
                            fontSize: 'sm',
                            color: 'gray.100',
                            _focus: {
                              borderColor: 'red.500',
                              outline: 'none',
                            },
                          })}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'rotate' && (
                  <div className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      Rotation Angle
                    </div>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                        gap: '2',
                        w: 'full',
                      })}
                    >
                      {[90, 180, 270, 360].map((angle) => (
                        <Button
                          key={angle}
                          variant={rotationAngle === angle ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRotationAngle(angle)}
                          className={css({
                            ...(rotationAngle === angle
                              ? {
                                  borderColor: 'red.500/50',
                                  bg: 'red.500/20',
                                  color: 'red.200',
                                }
                              : {
                                  borderColor: 'gray.700',
                                }),
                          })}
                        >
                          {angle}°
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {operation === 'deletePages' && pdfs.length > 0 && pdfs[0] && (
                  <div className={css({ spaceY: '4' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Select Pages to Delete ({selectedPages.size} selected)
                      </div>
                      <div className={css({ display: 'flex', gap: '2' })}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllPages}
                          disabled={selectedPages.size === pdfs[0].pages}
                          className={css({
                            fontSize: 'xs',
                            borderColor: 'gray.700',
                          })}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAllPages}
                          disabled={selectedPages.size === 0}
                          className={css({
                            fontSize: 'xs',
                            borderColor: 'gray.700',
                          })}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Page grid with checkboxes */}
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: {
                          base: 'repeat(3, 1fr)',
                          sm: 'repeat(4, 1fr)',
                          md: 'repeat(5, 1fr)',
                        },
                        gap: '2',
                        w: 'full',
                        maxH: '400px',
                        overflowY: 'auto',
                        p: '2',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                      })}
                    >
                      {Array.from({ length: pdfs[0].pages }, (_, i) => i + 1).map((pageNum) => {
                        const isSelected = selectedPages.has(pageNum)
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleTogglePageSelection(pageNum)}
                            className={css({
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: '3',
                              rounded: 'md',
                              border: '2px solid',
                              borderColor: isSelected ? 'red.500' : 'gray.700',
                              bg: isSelected ? 'red.500/10' : 'gray.800',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              _hover: {
                                borderColor: isSelected ? 'red.400' : 'gray.600',
                                bg: isSelected ? 'red.500/20' : 'gray.700',
                              },
                              _focus: {
                                outline: '2px solid',
                                outlineColor: 'red.500',
                                outlineOffset: '2px',
                              },
                            })}
                            aria-label={`${isSelected ? 'Deselect' : 'Select'} page ${pageNum}`}
                          >
                            {/* Checkbox indicator */}
                            <div
                              className={css({
                                position: 'absolute',
                                top: '1',
                                right: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                h: '5',
                                w: '5',
                                rounded: 'sm',
                                bg: isSelected ? 'red.500' : 'gray.700',
                                border: '1px solid',
                                borderColor: isSelected ? 'red.400' : 'gray.600',
                              })}
                            >
                              {isSelected && (
                                <svg
                                  className={css({ h: '3', w: '3', color: 'white' })}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <title>Selected</title>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Page number */}
                            <div
                              className={css({
                                fontSize: 'lg',
                                fontWeight: 'bold',
                                color: isSelected ? 'red.300' : 'gray.300',
                              })}
                            >
                              {pageNum}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Warning message */}
                    {selectedPages.size > 0 && (
                      <div
                        className={css({
                          p: '3',
                          rounded: 'md',
                          bg: 'red.500/10',
                          border: '1px solid',
                          borderColor: 'red.500/30',
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'start',
                            gap: '2',
                          })}
                        >
                          <Trash2
                            className={css({
                              h: '4',
                              w: '4',
                              color: 'red.400',
                              flexShrink: 0,
                              mt: '0.5',
                            })}
                          />
                          <div className={css({ fontSize: 'xs', color: 'red.200' })}>
                            <strong>Warning:</strong> {selectedPages.size} page
                            {selectedPages.size === 1 ? '' : 's'} will be permanently deleted from
                            the PDF.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Unlock PDF password input */}
                {operation === 'unlock' && (
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="unlock-password"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      PDF Password
                    </label>
                    <input
                      id="unlock-password"
                      type="password"
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      placeholder="Enter PDF password"
                      className={css({
                        w: 'full',
                        px: '4',
                        py: '2',
                        rounded: 'md',
                        bg: 'gray.800',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        color: 'gray.200',
                        fontSize: 'sm',
                        _placeholder: {
                          color: 'white',
                        },
                        _focus: {
                          outline: 'none',
                          borderColor: 'green.500',
                          ring: '2px',
                          ringColor: 'green.500/20',
                        },
                      })}
                    />
                    <p className={css({ fontSize: 'xs', color: 'white' })}>
                      Enter the password to unlock and remove protection from the PDF
                    </p>
                  </div>
                )}

                {operation === 'duplicatePages' && pdfs.length > 0 && pdfs[0] && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Duplicate count selector */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="duplicate-count"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Copies to Create
                      </label>
                      <input
                        id="duplicate-count"
                        type="number"
                        min={1}
                        max={10}
                        value={duplicateCount}
                        onChange={(e) => setDuplicateCount(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          px: '4',
                          py: '2',
                          rounded: 'md',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          color: 'gray.200',
                          fontSize: 'sm',
                          _focus: {
                            outline: 'none',
                            borderColor: 'blue.500',
                            ring: '2px',
                            ringColor: 'blue.500/20',
                          },
                        })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Each selected page will be duplicated {duplicateCount} time
                        {duplicateCount === 1 ? '' : 's'}
                      </p>
                    </div>

                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Select Pages to Duplicate ({selectedPages.size} selected)
                      </div>
                      <div className={css({ display: 'flex', gap: '2' })}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllPages}
                          disabled={selectedPages.size === pdfs[0].pages}
                          className={css({
                            fontSize: 'xs',
                            borderColor: 'gray.700',
                          })}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAllPages}
                          disabled={selectedPages.size === 0}
                          className={css({
                            fontSize: 'xs',
                            borderColor: 'gray.700',
                          })}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Page grid with checkboxes */}
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: {
                          base: 'repeat(3, 1fr)',
                          sm: 'repeat(4, 1fr)',
                          md: 'repeat(5, 1fr)',
                        },
                        gap: '2',
                        w: 'full',
                        maxH: '400px',
                        overflowY: 'auto',
                        p: '2',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                      })}
                    >
                      {Array.from({ length: pdfs[0].pages }, (_, i) => i + 1).map((pageNum) => {
                        const isSelected = selectedPages.has(pageNum)
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleTogglePageSelection(pageNum)}
                            className={css({
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: '3',
                              rounded: 'md',
                              border: '2px solid',
                              borderColor: isSelected ? 'blue.500' : 'gray.700',
                              bg: isSelected ? 'blue.500/10' : 'gray.800',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              _hover: {
                                borderColor: isSelected ? 'blue.400' : 'gray.600',
                                bg: isSelected ? 'blue.500/20' : 'gray.700',
                              },
                              _focus: {
                                outline: '2px solid',
                                outlineColor: 'blue.500',
                                outlineOffset: '2px',
                              },
                            })}
                            aria-label={`${isSelected ? 'Deselect' : 'Select'} page ${pageNum}`}
                          >
                            {/* Checkbox indicator */}
                            <div
                              className={css({
                                position: 'absolute',
                                top: '1',
                                right: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                h: '5',
                                w: '5',
                                rounded: 'sm',
                                bg: isSelected ? 'blue.500' : 'gray.700',
                                border: '1px solid',
                                borderColor: isSelected ? 'blue.400' : 'gray.600',
                              })}
                            >
                              {isSelected && (
                                <svg
                                  className={css({ h: '3', w: '3', color: 'white' })}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <title>Selected</title>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Page number */}
                            <div
                              className={css({
                                fontSize: 'lg',
                                fontWeight: 'bold',
                                color: isSelected ? 'blue.300' : 'gray.300',
                              })}
                            >
                              {pageNum}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Info message */}
                    {selectedPages.size > 0 && (
                      <div
                        className={css({
                          p: '3',
                          rounded: 'md',
                          bg: 'blue.500/10',
                          border: '1px solid',
                          borderColor: 'blue.500/30',
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'start',
                            gap: '2',
                          })}
                        >
                          <CopyPlus
                            className={css({
                              h: '4',
                              w: '4',
                              color: 'blue.400',
                              flexShrink: 0,
                              mt: '0.5',
                            })}
                          />
                          <div className={css({ fontSize: 'xs', color: 'blue.200' })}>
                            {selectedPages.size} page{selectedPages.size === 1 ? '' : 's'} will be
                            duplicated {duplicateCount} time
                            {duplicateCount === 1 ? '' : 's'} each. Total new pages:{' '}
                            {selectedPages.size * duplicateCount}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reorder pages drag-and-drop UI */}
                {operation === 'reorder' && pdfs.length > 0 && pdfs[0] && pageOrder.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      })}
                    >
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Drag Pages to Reorder ({pageOrder.length} pages)
                      </div>
                    </div>

                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'purple.500/10',
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Sparkles
                          className={css({
                            h: '4',
                            w: '4',
                            color: 'purple.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div className={css({ fontSize: 'sm', color: 'purple.200', spaceY: '1' })}>
                          <div>Drag pages up or down to change their order in the PDF</div>
                          <div className={css({ fontSize: 'xs', color: 'purple.300', mt: '2' })}>
                            <strong>Keyboard shortcuts:</strong> ↑/↓ to navigate • Ctrl/⌘+↑/↓ to
                            move • Ctrl/⌘+Home/End to move to top/bottom
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Drag and drop list */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={pageOrder} strategy={verticalListSortingStrategy}>
                        <div className={css({ spaceY: '2' })}>
                          {pageOrder.map((pageNum, index) => (
                            <SortablePageItem
                              key={pageNum}
                              pageNum={pageNum}
                              index={index}
                              isFocused={focusedPageIndex === index}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* Add Page Numbers UI */}
                {operation === 'addPageNumbers' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Position Selection */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Position
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                          gap: '2',
                          w: 'full',
                        })}
                      >
                        {[
                          { value: 'top-left' as const, label: 'Top Left' },
                          { value: 'top-center' as const, label: 'Top Center' },
                          { value: 'top-right' as const, label: 'Top Right' },
                          { value: 'bottom-left' as const, label: 'Bottom Left' },
                          { value: 'bottom-center' as const, label: 'Bottom Center' },
                          { value: 'bottom-right' as const, label: 'Bottom Right' },
                        ].map((pos) => (
                          <Button
                            key={pos.value}
                            variant={pageNumberPosition === pos.value ? 'default' : 'outline'}
                            onClick={() => setPageNumberPosition(pos.value)}
                            className={css({
                              flex: 1,
                              bg:
                                pageNumberPosition === pos.value
                                  ? 'sky.500'
                                  : 'rgba(255, 255, 255, 0.05)',
                              borderColor:
                                pageNumberPosition === pos.value
                                  ? 'sky.500'
                                  : 'rgba(255, 255, 255, 0.1)',
                              color: pageNumberPosition === pos.value ? 'white' : 'gray.300',
                              _hover: {
                                bg:
                                  pageNumberPosition === pos.value
                                    ? 'sky.600'
                                    : 'rgba(255, 255, 255, 0.1)',
                                borderColor:
                                  pageNumberPosition === pos.value ? 'sky.600' : 'sky.500',
                              },
                            })}
                          >
                            {pos.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Format
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: '2',
                          w: 'full',
                        })}
                      >
                        {[
                          { value: 'numbers' as const, label: '1, 2, 3...' },
                          { value: 'roman-lower' as const, label: 'i, ii, iii...' },
                          { value: 'roman-upper' as const, label: 'I, II, III...' },
                          { value: 'page-of-total' as const, label: '1 / 10' },
                        ].map((fmt) => (
                          <Button
                            key={fmt.value}
                            variant={pageNumberFormat === fmt.value ? 'default' : 'outline'}
                            onClick={() => setPageNumberFormat(fmt.value)}
                            className={css({
                              flex: 1,
                              bg:
                                pageNumberFormat === fmt.value
                                  ? 'sky.500'
                                  : 'rgba(255, 255, 255, 0.05)',
                              borderColor:
                                pageNumberFormat === fmt.value
                                  ? 'sky.500'
                                  : 'rgba(255, 255, 255, 0.1)',
                              color: pageNumberFormat === fmt.value ? 'white' : 'gray.300',
                              _hover: {
                                bg:
                                  pageNumberFormat === fmt.value
                                    ? 'sky.600'
                                    : 'rgba(255, 255, 255, 0.1)',
                                borderColor: pageNumberFormat === fmt.value ? 'sky.600' : 'sky.500',
                              },
                            })}
                          >
                            {fmt.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        })}
                      >
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                          })}
                        >
                          Font Size
                        </div>
                        <div
                          className={css({
                            fontSize: 'sm',
                            color: 'sky.400',
                            fontWeight: 'medium',
                          })}
                        >
                          {pageNumberFontSize}pt
                        </div>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="24"
                        value={pageNumberFontSize}
                        onChange={(e) => setPageNumberFontSize(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          accentColor: 'sky.500',
                        })}
                      />
                    </div>

                    {/* Starting Number */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Start From
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={pageNumberStartFrom}
                        onChange={(e) => setPageNumberStartFrom(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          rounded: 'md',
                          bg: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: 'sm',
                          _focus: {
                            outline: 'none',
                            borderColor: 'sky.500',
                          },
                        })}
                      />
                    </div>

                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'sky.500/10',
                        border: '1px solid',
                        borderColor: 'sky.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Sparkles
                          className={css({
                            h: '4',
                            w: '4',
                            color: 'sky.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div className={css({ fontSize: 'sm', color: 'sky.200' })}>
                          Page numbers will be added to all pages automatically
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Metadata UI */}
                {operation === 'editMetadata' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'cyan.500/10',
                        border: '1px solid',
                        borderColor: 'cyan.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Sparkles
                          className={css({
                            h: '4',
                            w: '4',
                            color: 'cyan.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div className={css({ fontSize: 'sm', color: 'cyan.200' })}>
                          Edit PDF document properties like title, author, and keywords.
                          Modification date will be updated automatically.
                        </div>
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className={css({ spaceY: '3' })}>
                      {/* Title */}
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="metadata-title"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                            display: 'block',
                          })}
                        >
                          Title
                        </label>
                        <input
                          id="metadata-title"
                          type="text"
                          value={metadataTitle}
                          onChange={(e) => setMetadataTitle(e.target.value)}
                          placeholder="Document title"
                          className={css({
                            w: 'full',
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            bg: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: 'sm',
                            _placeholder: { color: 'white' },
                            _focus: {
                              outline: 'none',
                              borderColor: 'cyan.500',
                            },
                          })}
                        />
                      </div>

                      {/* Author */}
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="metadata-author"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                            display: 'block',
                          })}
                        >
                          Author
                        </label>
                        <input
                          id="metadata-author"
                          type="text"
                          value={metadataAuthor}
                          onChange={(e) => setMetadataAuthor(e.target.value)}
                          placeholder="Author name"
                          className={css({
                            w: 'full',
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            bg: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: 'sm',
                            _placeholder: { color: 'white' },
                            _focus: {
                              outline: 'none',
                              borderColor: 'cyan.500',
                            },
                          })}
                        />
                      </div>

                      {/* Subject */}
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="metadata-subject"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                            display: 'block',
                          })}
                        >
                          Subject
                        </label>
                        <input
                          id="metadata-subject"
                          type="text"
                          value={metadataSubject}
                          onChange={(e) => setMetadataSubject(e.target.value)}
                          placeholder="Document subject"
                          className={css({
                            w: 'full',
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            bg: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: 'sm',
                            _placeholder: { color: 'white' },
                            _focus: {
                              outline: 'none',
                              borderColor: 'cyan.500',
                            },
                          })}
                        />
                      </div>

                      {/* Keywords */}
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="metadata-keywords"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                            display: 'block',
                          })}
                        >
                          Keywords
                        </label>
                        <input
                          id="metadata-keywords"
                          type="text"
                          value={metadataKeywords}
                          onChange={(e) => setMetadataKeywords(e.target.value)}
                          placeholder="keyword1, keyword2, keyword3"
                          className={css({
                            w: 'full',
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            bg: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: 'sm',
                            _placeholder: { color: 'white' },
                            _focus: {
                              outline: 'none',
                              borderColor: 'cyan.500',
                            },
                          })}
                        />
                        <p className={css({ fontSize: 'xs', color: 'white' })}>
                          Separate keywords with commas
                        </p>
                      </div>

                      {/* Creator */}
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="metadata-creator"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                            display: 'block',
                          })}
                        >
                          Creator
                        </label>
                        <input
                          id="metadata-creator"
                          type="text"
                          value={metadataCreator}
                          onChange={(e) => setMetadataCreator(e.target.value)}
                          placeholder="Creating application"
                          className={css({
                            w: 'full',
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            bg: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: 'sm',
                            _placeholder: { color: 'white' },
                            _focus: {
                              outline: 'none',
                              borderColor: 'cyan.500',
                            },
                          })}
                        />
                      </div>

                      {/* Producer */}
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor="metadata-producer"
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'white',
                            display: 'block',
                          })}
                        >
                          Producer
                        </label>
                        <input
                          id="metadata-producer"
                          type="text"
                          value={metadataProducer}
                          onChange={(e) => setMetadataProducer(e.target.value)}
                          placeholder="PDF producer"
                          className={css({
                            w: 'full',
                            px: '3',
                            py: '2',
                            rounded: 'md',
                            bg: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: 'sm',
                            _placeholder: { color: 'white' },
                            _focus: {
                              outline: 'none',
                              borderColor: 'cyan.500',
                            },
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'ocrExtract' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'purple.500/10',
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Sparkles
                          className={css({
                            h: '5',
                            w: '5',
                            color: 'purple.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div>
                          <p className={css({ fontSize: 'sm', color: 'purple.300' })}>
                            OCR (Optical Character Recognition) will extract text from scanned PDFs
                            and images. Processing may take longer depending on file size and number
                            of pages.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Language selection */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="ocr-language"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'purple.400',
                          display: 'block',
                        })}
                      >
                        OCR Language
                      </label>
                      <select
                        id="ocr-language"
                        value={ocrLanguage}
                        onChange={(e) => setOcrLanguage(e.target.value)}
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          rounded: 'md',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'purple.500/30',
                          color: 'gray.200',
                          fontSize: 'sm',
                          _focus: {
                            outline: '2px solid',
                            outlineColor: 'purple.500',
                            outlineOffset: '0',
                          },
                        })}
                      >
                        <option value="eng">English</option>
                        <option value="spa">Spanish</option>
                        <option value="fra">French</option>
                        <option value="deu">German</option>
                        <option value="ita">Italian</option>
                        <option value="por">Portuguese</option>
                        <option value="rus">Russian</option>
                        <option value="ara">Arabic</option>
                        <option value="chi_sim">Chinese (Simplified)</option>
                        <option value="chi_tra">Chinese (Traditional)</option>
                        <option value="jpn">Japanese</option>
                        <option value="kor">Korean</option>
                        <option value="hin">Hindi</option>
                        <option value="nld">Dutch</option>
                        <option value="pol">Polish</option>
                        <option value="tur">Turkish</option>
                        <option value="vie">Vietnamese</option>
                        <option value="tha">Thai</option>
                      </select>
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Select the language of the text in your scanned document for better accuracy
                      </p>
                    </div>
                  </div>
                )}

                {operation === 'flatten' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'amber.500/10',
                        border: '1px solid',
                        borderColor: 'amber.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Info
                          className={css({
                            h: '5',
                            w: '5',
                            color: 'amber.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div>
                          <p className={css({ fontSize: 'sm', color: 'amber.300' })}>
                            Flattening will convert all form fields and annotations to static
                            content, making the PDF non-editable and more portable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'protect' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'green.500/10',
                        border: '1px solid',
                        borderColor: 'green.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Lock
                          className={css({
                            h: '5',
                            w: '5',
                            color: 'green.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div>
                          <p className={css({ fontSize: 'sm', color: 'green.300' })}>
                            Add password protection to secure your PDF. You can set a user password
                            (required to open) and optionally an owner password (for permissions
                            control).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Password inputs */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="user-password"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.400',
                          display: 'block',
                        })}
                      >
                        User Password (Required)
                      </label>
                      <input
                        id="user-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password to open PDF"
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          rounded: 'md',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'green.500/30',
                          color: 'gray.200',
                          fontSize: 'sm',
                          _focus: {
                            outline: '2px solid',
                            outlineColor: 'green.500',
                            outlineOffset: '0',
                          },
                        })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Minimum 4 characters required
                      </p>
                    </div>

                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="owner-password"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.400',
                          display: 'block',
                        })}
                      >
                        Owner Password (Optional)
                      </label>
                      <input
                        id="owner-password"
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Enter owner password for permissions"
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          rounded: 'md',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'green.500/30',
                          color: 'gray.200',
                          fontSize: 'sm',
                          _focus: {
                            outline: '2px solid',
                            outlineColor: 'green.500',
                            outlineOffset: '0',
                          },
                        })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        For advanced permission control
                      </p>
                    </div>

                    {/* Permissions */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.400',
                          display: 'block',
                        })}
                      >
                        Permissions
                      </div>
                      <div className={css({ spaceY: '2' })}>
                        <label
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            cursor: 'pointer',
                          })}
                        >
                          <input
                            type="checkbox"
                            checked={allowPrinting}
                            onChange={(e) => setAllowPrinting(e.target.checked)}
                            className={css({ w: '4', h: '4', rounded: 'sm', cursor: 'pointer' })}
                          />
                          <span className={css({ fontSize: 'sm', color: 'white' })}>
                            Allow Printing
                          </span>
                        </label>
                        <label
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            cursor: 'pointer',
                          })}
                        >
                          <input
                            type="checkbox"
                            checked={allowModifying}
                            onChange={(e) => setAllowModifying(e.target.checked)}
                            className={css({ w: '4', h: '4', rounded: 'sm', cursor: 'pointer' })}
                          />
                          <span className={css({ fontSize: 'sm', color: 'white' })}>
                            Allow Modifying
                          </span>
                        </label>
                        <label
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            cursor: 'pointer',
                          })}
                        >
                          <input
                            type="checkbox"
                            checked={allowCopying}
                            onChange={(e) => setAllowCopying(e.target.checked)}
                            className={css({ w: '4', h: '4', rounded: 'sm', cursor: 'pointer' })}
                          />
                          <span className={css({ fontSize: 'sm', color: 'white' })}>
                            Allow Copying
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'addHeaderFooter' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'purple.500/10',
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Info
                          className={css({
                            h: '5',
                            w: '5',
                            color: 'purple.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div>
                          <p className={css({ fontSize: 'sm', color: 'purple.300' })}>
                            Add custom headers and footers to all pages. Use placeholders like{' '}
                            {'{page}'} and {'{total}'} for dynamic page numbers.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Header text */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="header-text"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'purple.400',
                          display: 'block',
                        })}
                      >
                        Header Text
                      </label>
                      <input
                        id="header-text"
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="e.g., My Document"
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          rounded: 'md',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'purple.500/30',
                          color: 'gray.200',
                          fontSize: 'sm',
                          _focus: {
                            outline: '2px solid',
                            outlineColor: 'purple.500',
                            outlineOffset: '0',
                          },
                        })}
                      />
                      <div className={css({ display: 'flex', gap: '2', mt: '2' })}>
                        {(['left', 'center', 'right'] as const).map((pos) => (
                          <Button
                            key={pos}
                            onClick={() => setHeaderPosition(pos)}
                            variant={headerPosition === pos ? 'default' : 'outline'}
                            size="sm"
                            className={css({
                              flex: '1',
                              textTransform: 'capitalize',
                            })}
                          >
                            {pos}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Footer text */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="footer-text"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'purple.400',
                          display: 'block',
                        })}
                      >
                        Footer Text
                      </label>
                      <input
                        id="footer-text"
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="e.g., Page {page} of {total}"
                        className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          rounded: 'md',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'purple.500/30',
                          color: 'gray.200',
                          fontSize: 'sm',
                          _focus: {
                            outline: '2px solid',
                            outlineColor: 'purple.500',
                            outlineOffset: '0',
                          },
                        })}
                      />
                      <div className={css({ display: 'flex', gap: '2', mt: '2' })}>
                        {(['left', 'center', 'right'] as const).map((pos) => (
                          <Button
                            key={pos}
                            onClick={() => setFooterPosition(pos)}
                            variant={footerPosition === pos ? 'default' : 'outline'}
                            size="sm"
                            className={css({
                              flex: '1',
                              textTransform: 'capitalize',
                            })}
                          >
                            {pos}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Font size */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="header-footer-font-size"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'purple.400',
                          display: 'block',
                        })}
                      >
                        Font Size: {headerFooterFontSize}px
                      </label>
                      <input
                        id="header-footer-font-size"
                        type="range"
                        min="8"
                        max="20"
                        value={headerFooterFontSize}
                        onChange={(e) => setHeaderFooterFontSize(Number(e.target.value))}
                        className={css({ w: 'full' })}
                      />
                    </div>

                    {/* Include page numbers checkbox */}
                    <div className={css({ spaceY: '2' })}>
                      <label
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          cursor: 'pointer',
                        })}
                      >
                        <input
                          type="checkbox"
                          checked={includePageNumbers}
                          onChange={(e) => setIncludePageNumbers(e.target.checked)}
                          className={css({ w: '4', h: '4', rounded: 'sm', cursor: 'pointer' })}
                        />
                        <span className={css({ fontSize: 'sm', color: 'white' })}>
                          Replace {'{page}'} and {'{total}'} with actual page numbers
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {operation === 'addBookmarks' && pdfs.length > 0 && (
                  <div className={css({ spaceY: '4' })}>
                    {/* Info message */}
                    <div
                      className={css({
                        p: '3',
                        rounded: 'md',
                        bg: 'sky.500/10',
                        border: '1px solid',
                        borderColor: 'sky.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                        })}
                      >
                        <Info
                          className={css({
                            h: '5',
                            w: '5',
                            color: 'sky.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <div>
                          <p className={css({ fontSize: 'sm', color: 'sky.300' })}>
                            Add bookmarks to create a table of contents. A TOC page will be inserted
                            at the beginning of your PDF.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bookmarks list */}
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'sky.400',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        })}
                      >
                        <span>Bookmarks</span>
                        <Button
                          onClick={() =>
                            setBookmarks([
                              ...bookmarks,
                              {
                                title: `Chapter ${bookmarks.length + 1}`,
                                pageNumber: 1,
                                level: 0,
                              },
                            ])
                          }
                          variant="outline"
                          size="sm"
                        >
                          Add Bookmark
                        </Button>
                      </div>

                      <div className={css({ spaceY: '2' })}>
                        {bookmarks.map((bookmark, index) => (
                          <div
                            key={index}
                            className={css({
                              display: 'flex',
                              gap: '2',
                              alignItems: 'start',
                              p: '2',
                              rounded: 'md',
                              bg: 'gray.800/50',
                              border: '1px solid',
                              borderColor: 'sky.500/20',
                            })}
                          >
                            <div className={css({ flex: '1', spaceY: '2' })}>
                              <input
                                type="text"
                                value={bookmark.title}
                                onChange={(e) => {
                                  const newBookmarks = [...bookmarks]
                                  newBookmarks[index].title = e.target.value
                                  setBookmarks(newBookmarks)
                                }}
                                placeholder="Bookmark title"
                                className={css({
                                  w: 'full',
                                  px: '2',
                                  py: '1',
                                  rounded: 'md',
                                  bg: 'gray.800',
                                  border: '1px solid',
                                  borderColor: 'sky.500/30',
                                  color: 'gray.200',
                                  fontSize: 'sm',
                                })}
                              />
                              <div className={css({ display: 'flex', gap: '2' })}>
                                <input
                                  type="number"
                                  min="1"
                                  value={bookmark.pageNumber}
                                  onChange={(e) => {
                                    const newBookmarks = [...bookmarks]
                                    newBookmarks[index].pageNumber = Number(e.target.value)
                                    setBookmarks(newBookmarks)
                                  }}
                                  placeholder="Page"
                                  className={css({
                                    w: '20',
                                    px: '2',
                                    py: '1',
                                    rounded: 'md',
                                    bg: 'gray.800',
                                    border: '1px solid',
                                    borderColor: 'sky.500/30',
                                    color: 'gray.200',
                                    fontSize: 'sm',
                                  })}
                                />
                                <select
                                  value={bookmark.level || 0}
                                  onChange={(e) => {
                                    const newBookmarks = [...bookmarks]
                                    newBookmarks[index].level = Number(e.target.value)
                                    setBookmarks(newBookmarks)
                                  }}
                                  className={css({
                                    px: '2',
                                    py: '1',
                                    rounded: 'md',
                                    bg: 'gray.800',
                                    border: '1px solid',
                                    borderColor: 'sky.500/30',
                                    color: 'gray.200',
                                    fontSize: 'sm',
                                  })}
                                >
                                  <option value="0">Level 1</option>
                                  <option value="1">Level 2</option>
                                  <option value="2">Level 3</option>
                                </select>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                const newBookmarks = bookmarks.filter((_, i) => i !== index)
                                setBookmarks(newBookmarks)
                              }}
                              variant="ghost"
                              size="sm"
                              className={css({ color: 'red.400' })}
                            >
                              <Trash2 className={css({ h: '4', w: '4' })} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'extractImages' && pdfs.length > 0 && (
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: '#f59e0b/10',
                      borderWidth: '1px',
                      borderColor: '#f59e0b/20',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                      <ImageDown
                        className={css({
                          h: '5',
                          w: '5',
                          color: '#f59e0b',
                          flexShrink: '0',
                          mt: '0.5',
                        })}
                      />
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.200',
                          })}
                        >
                          Extract Embedded Images
                        </div>
                        <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.5' })}>
                          All embedded images will be extracted from the PDF and saved as individual
                          PNG files. Original image quality will be preserved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'optimizeWeb' && pdfs.length > 0 && (
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: '#06b6d4/10',
                      borderWidth: '1px',
                      borderColor: '#06b6d4/20',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                      <Globe
                        className={css({
                          h: '5',
                          w: '5',
                          color: '#06b6d4',
                          flexShrink: '0',
                          mt: '0.5',
                        })}
                      />
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.200',
                          })}
                        >
                          Optimize for Web Viewing
                        </div>
                        <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.5' })}>
                          Optimizes your PDF for faster loading on websites by removing unused
                          objects and creating an efficient document structure. All content and
                          metadata will be preserved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'splitByBookmarks' && pdfs.length > 0 && (
                  <div
                    className={css({
                      p: '4',
                      borderRadius: 'lg',
                      bg: '#a855f7/10',
                      borderWidth: '1px',
                      borderColor: '#a855f7/20',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                      <BookmarkCheck
                        className={css({
                          h: '5',
                          w: '5',
                          color: '#a855f7',
                          flexShrink: '0',
                          mt: '0.5',
                        })}
                      />
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.200',
                          })}
                        >
                          Split by Bookmarks
                        </div>
                        <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.5' })}>
                          Splits your PDF into separate files at each top-level bookmark. Your PDF
                          must have existing bookmarks. Each file will be automatically named based
                          on the bookmark title.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'imagesToPdf' && (
                  <>
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Page Size
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '2',
                          w: 'full',
                        })}
                      >
                        {[
                          { value: 'A4' as const, label: 'A4' },
                          { value: 'Letter' as const, label: 'Letter' },
                          { value: 'Legal' as const, label: 'Legal' },
                          { value: 'Original' as const, label: 'Original' },
                        ].map((size) => (
                          <Button
                            key={size.value}
                            variant={imageToPdfPageSize === size.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImageToPdfPageSize(size.value)}
                            className={css({
                              ...(imageToPdfPageSize === size.value
                                ? {
                                    borderColor: 'red.500/50',
                                    bg: 'red.500/20',
                                    color: 'red.200',
                                  }
                                : {
                                    borderColor: 'gray.700',
                                  }),
                            })}
                          >
                            {size.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                        })}
                      >
                        Fit Mode
                      </div>
                      <div
                        className={css({
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '2',
                          w: 'full',
                        })}
                      >
                        {[
                          { value: 'contain' as const, label: 'Contain', desc: 'Fit entire image' },
                          { value: 'cover' as const, label: 'Cover', desc: 'Fill page' },
                          { value: 'fill' as const, label: 'Fill', desc: 'Stretch' },
                        ].map((mode) => (
                          <Button
                            key={mode.value}
                            variant={imageToPdfFitMode === mode.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImageToPdfFitMode(mode.value)}
                            className={css({
                              flexDirection: 'column',
                              h: 'auto',
                              py: '3',
                              ...(imageToPdfFitMode === mode.value
                                ? {
                                    borderColor: 'red.500/50',
                                    bg: 'red.500/20',
                                    color: 'red.200',
                                  }
                                : {
                                    borderColor: 'gray.700',
                                  }),
                            })}
                          >
                            <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                              {mode.label}
                            </span>
                            <span className={css({ fontSize: 'xs', color: 'white' })}>
                              {mode.desc}
                            </span>
                          </Button>
                        ))}
                      </div>
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: 'white',
                        })}
                      >
                        {imageToPdfFitMode === 'contain'
                          ? 'Fits entire image within page, maintains aspect ratio'
                          : imageToPdfFitMode === 'cover'
                            ? 'Fills entire page, may crop image edges'
                            : 'Stretches image to fill page, may distort'}
                      </p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className={css({ spaceY: '2', pt: '4' })}>
                  <Button
                    onClick={handleProcess}
                    disabled={pdfs.length === 0 || isProcessing}
                    className={css({
                      w: 'full',
                      gap: '2',
                      bg: 'red.600',
                      _hover: {
                        bg: 'red.700',
                      },
                    })}
                  >
                    <Zap
                      className={css({
                        h: '4',
                        w: '4',
                      })}
                    />
                    Process PDFs
                  </Button>

                  {/* Undo/Redo buttons */}
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2',
                    })}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const snapshot = undo()
                        if (snapshot) {
                          setPdfs(snapshot.data)
                          toast.success('Undid operation')
                        }
                      }}
                      disabled={!canUndo}
                      className={css({
                        gap: '2',
                        fontSize: 'xs',
                      })}
                    >
                      <Undo2 className={css({ h: '3', w: '3' })} />
                      Undo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const snapshot = redo()
                        if (snapshot) {
                          setPdfs(snapshot.data)
                          toast.success('Redid operation')
                        }
                      }}
                      disabled={!canRedo}
                      className={css({
                        gap: '2',
                        fontSize: 'xs',
                      })}
                    >
                      <Redo2 className={css({ h: '3', w: '3' })} />
                      Redo
                    </Button>
                  </div>

                  {/* Presets button for compression */}
                  {operation === 'compress' && (
                    <Button
                      variant="outline"
                      onClick={() => setShowPresets(true)}
                      className={css({
                        w: 'full',
                        gap: '2',
                        borderColor: 'purple.500/30',
                        color: 'purple.400',
                        _hover: {
                          bg: 'purple.500/10',
                        },
                      })}
                    >
                      <Sliders
                        className={css({
                          h: '4',
                          w: '4',
                        })}
                      />
                      Use Preset
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={pdfs.length === 0}
                    className={css({
                      w: 'full',
                      gap: '2',
                      borderColor: 'red.500/30',
                      color: 'red.400',
                      _hover: {
                        bg: 'red.500/10',
                      },
                    })}
                  >
                    <Trash2
                      className={css({
                        h: '4',
                        w: '4',
                      })}
                    />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload & PDFs Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={css({
            w: 'full',
            gridColumn: { base: 'span 1', md: 'span 1', lg: 'span 2' },
          })}
        >
          <Card
            className={css({
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <FileText
                    className={css({
                      h: '5',
                      w: '5',
                      color: 'red.400',
                    })}
                  />
                  PDF Files ({pdfs.length})
                </CardTitle>
                <CardDescription>
                  {operation === 'merge'
                    ? 'Upload 2+ PDFs to merge them into one'
                    : 'Drag & drop or click to upload PDF files'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
                {/* Drag & Drop Zone */}
                {pdfs.length === 0 ? (
                  <>
                    <DragDropZone
                      onFilesSelected={handleFilesSelected}
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      maxSize={100 * 1024 * 1024}
                      multiple
                    />
                    <EmptyState
                      operation={operation}
                      onUploadClick={() => fileInputRef.current?.click()}
                      onOperationChange={setOperation}
                    />
                    {/* Mobile-specific upload buttons with camera support */}
                    <MobileUploadButton
                      onFilesSelected={handleFilesSelected}
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      disabled={isProcessing}
                    />
                  </>
                ) : (
                  <>
                    <DragDropZone
                      onFilesSelected={handleFilesSelected}
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      maxSize={100 * 1024 * 1024}
                      multiple
                      className={css({
                        py: '8',
                      })}
                    />

                    {/* Batch Operations Dashboard - Show when 2+ files */}
                    {pdfs.length > 1 && (
                      <>
                        <BatchToolbar
                          pdfs={pdfs}
                          isPaused={batchQueue.isPaused}
                          onPauseResume={batchQueue.togglePause}
                          onCancelAll={batchQueue.cancelAll}
                          onRetryFailed={batchQueue.retryFailed}
                          onDownloadAll={handleDownloadAll}
                          onClearCompleted={batchQueue.clearCompleted}
                        />
                        <BatchQueue
                          pdfs={pdfs}
                          onDownload={handleDownload}
                          onRetry={(pdf) => batchQueue.retryFile(pdf.id)}
                          onRemove={(pdf) => batchQueue.removeFile(pdf.id)}
                        />
                      </>
                    )}

                    <ReorderablePDFList
                      pdfs={pdfs}
                      onReorder={(reorderedPdfs) => setPdfs(reorderedPdfs)}
                      onRemove={handleRemove}
                      onDownload={handleDownload}
                      formatBytes={formatBytes}
                      renderThumbnail={(pdf) => <PDFThumbnail file={pdf.file} />}
                      disabled={isProcessing}
                    />

                    {/* Mobile upload button for adding more files */}
                    <MobileUploadButton
                      onFilesSelected={handleFilesSelected}
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      disabled={isProcessing}
                    />

                    {/* Desktop upload button for adding more files (visible only on lg+ screens) */}
                    <DesktopUploadButton
                      onFilesSelected={handleFilesSelected}
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      disabled={isProcessing}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={css({
          display: 'grid',
          w: 'full',
          gap: '4',
          gridTemplateColumns: {
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          maxW: '1400px',
        })}
      >
        {[
          {
            icon: Sparkles,
            title: 'Secure Processing',
            description: '100% browser-based. Your files never leave your device.',
          },
          {
            icon: Zap,
            title: 'Fast & Efficient',
            description: 'Process PDFs instantly with no file size limits.',
          },
          {
            icon: Merge,
            title: '8 Powerful Tools',
            description: 'Merge, split, compress, convert to Word/images, and more.',
          },
          {
            icon: FileText,
            title: 'Professional Quality',
            description: 'Industry-standard PDF processing capabilities.',
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              borderColor: 'gray.800',
              bgGradient: 'to-br',
              gradientFrom: 'gray.900/50',
              gradientTo: 'gray.900/30',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent withTopPadding>
              <div className={css({ p: '6' })}>
                <feature.icon
                  className={css({
                    mb: '3',
                    h: '8',
                    w: '8',
                    color: 'red.400',
                  })}
                />
                <h3
                  className={css({
                    mb: '2',
                    fontWeight: 'semibold',
                    color: 'gray.200',
                  })}
                >
                  {feature.title}
                </h3>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'white',
                  })}
                >
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* PDF Page Editor - Reorder/Remove pages */}
      {editingPdf && operation === 'edit' ? (
        <PDFPageEditFlow
          pdfFile={editingPdf.file}
          onApply={async (newOrder: number[]) => {
            // Use pdf-lib to reorder/remove pages and update the PDF
            const { PDFDocument } = await loadPdfLib()
            const arrayBuffer = await editingPdf.file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)
            const newPdf = await PDFDocument.create()
            const copiedPages = await newPdf.copyPages(pdfDoc, newOrder)
            copiedPages.forEach((page) => {
              newPdf.addPage(page)
            })
            const pdfBytes = await newPdf.save()
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
            updatePdfStatus(editingPdf.id, {
              status: 'completed',
              progress: 100,
              processedBlob: blob,
              processedSize: blob.size,
            })
            setEditingPdf(null)
          }}
          onCancel={() => {
            setEditingPdf(null)
          }}
        />
      ) : null}

      {/* PDF Editor - Annotations */}
      {editingPdf && operation !== 'edit' && (
        <PDFEditor
          pdfFile={editingPdf.file}
          onSave={async (annotations) => {
            setIsEditorOpen(false)
            if (annotations.length > 0) {
              await applyAnnotationsToPDF(editingPdf, annotations)
            }
            setEditingPdf(null)
          }}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingPdf(null)
          }}
        />
      )}

      {/* Compression Presets Dialog */}
      {showPresets && (
        <PresetsDialog
          onSelect={(preset) => {
            setCompressionLevel(preset.level)
            toast.success(`Applied ${preset.name} preset`)
          }}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* Comparison View */}
      {showComparison && comparisonPdf && comparisonPdf.processedBlob && (
        <ComparisonView
          originalFile={comparisonPdf.file}
          processedBlob={comparisonPdf.processedBlob}
          originalSize={comparisonPdf.size}
          processedSize={comparisonPdf.processedSize || comparisonPdf.size}
          onDownload={() => {
            const url = URL.createObjectURL(comparisonPdf.processedBlob!)
            const a = document.createElement('a')
            a.href = url
            a.download = `${comparisonPdf.name.replace('.pdf', '')}-${operation}.pdf`
            a.click()
            URL.revokeObjectURL(url)
          }}
          onClose={() => {
            setShowComparison(false)
            setComparisonPdf(null)
          }}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            handleFilesSelected(e.target.files)
          }
        }}
      />
      <ProcessingModal
        pdfs={pdfs}
        operation={operation}
        isOpen={isProcessing && pdfs.some((p) => p.status === 'processing')}
        onClose={() => {
          if (pdfs.every((p) => p.status !== 'processing')) {
            setIsProcessing(false)
          }
        }}
        canClose={pdfs.every((p) => p.status !== 'processing')}
      />
      <SummarizationDialog
        isOpen={showSummarization}
        onClose={() => {
          setShowSummarization(false)
          setSummarizationResult(null)
        }}
        result={summarizationResult}
        isLoading={isSummarizing}
      />
      <ToolSearch />
    </main>
  )
}
