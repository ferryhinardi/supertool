'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import {
  Archive,
  Copy,
  Droplet,
  Edit3,
  FileDown,
  FileOutput,
  FileText,
  Image as ImageIcon,
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
import { ComparisonView } from './components/ComparisonView'
import { EmptyState } from './components/EmptyState'
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog'
import { MobileOperationPicker } from './components/MobileOperationPicker'
import { OperationGrid } from './components/OperationGrid'
import { PresetsDialog } from './components/PresetsDialog'
import { ProcessingModal } from './components/ProcessingModal'
import { ReorderablePDFList } from './components/ReorderablePDFList'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useOperationHistory } from './hooks/useOperationHistory'
import { PDFBatchProcessor } from './PDFBatchProcessor'
import PDFPageEditFlow from './PDFPageEditFlow'
import { PDFThumbnail } from './PDFThumbnail'

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
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3)
  const [watermarkRotation, setWatermarkRotation] = useState(-45)
  const [watermarkPosition, setWatermarkPosition] = useState<
    | 'center'
    | 'diagonal'
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  >('diagonal')
  const [watermarkColor, setWatermarkColor] = useState('#b3b3b3')
  const [watermarkFontSize, setWatermarkFontSize] = useState(50)
  const [watermarkPattern, setWatermarkPattern] = useState(false)

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

  // New enhancements
  const [showPresets, setShowPresets] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPdf, setComparisonPdf] = useState<PDFFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchProcessorRef = useRef<PDFBatchProcessor | null>(null)

  // Initialize batch processor
  useEffect(() => {
    batchProcessorRef.current = new PDFBatchProcessor((id, updates) => {
      setPdfs((prev) => prev.map((pdf) => (pdf.id === id ? { ...pdf, ...updates } : pdf)))
    })
  }, [])

  // Operation history for undo/redo
  const { addSnapshot, undo, redo, canUndo, canRedo } = useOperationHistory<PDFFile[]>()

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
  const handleProcess = async () => {
    saveSnapshot(`process_${operation}`)
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
      } else {
        // Use batch processor for parallel processing
        if (batchProcessorRef.current) {
          await batchProcessorRef.current.processBatch(pdfs, operation, {
            compressionLevel,
            splitPageNumber,
            watermarkText,
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
    if (operation === 'toImages') {
      // Download all images
      const images = (pdf as PDFFile & { imageBlobs?: Blob[] }).imageBlobs
      if (!images) return

      images.forEach((blob, index) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${pdf.name.replace('.pdf', '')}_page_${index + 1}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })

      trackEvent({
        action: 'images_downloaded',
        category: 'pdf_tools',
        label: 'download_images',
        value: images.length,
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
    trackEvent({
      action: 'clear_all',
      category: 'pdf_tools',
      label: 'reset',
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
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
            color: 'gray.400',
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
            <CardContent>
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
                    color: 'gray.400',
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
            <CardContent>
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
                    color: 'gray.400',
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
            <CardContent>
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
                    color: 'gray.400',
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
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
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
            gridColumn: { base: 'span 1', lg: 'span 1' },
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
                        color: 'gray.300',
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
                        color: 'gray.500',
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
                        color: 'gray.300',
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
                          <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                            {level.desc}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <p
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.500',
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
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="watermark-text"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.300',
                        })}
                      >
                        Watermark Text
                      </label>
                      <input
                        id="watermark-text"
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
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
                            color: 'gray.300',
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
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          accentColor: 'red.500',
                        })}
                      />
                    </div>
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
                            color: 'gray.300',
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
                        onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          accentColor: 'red.500',
                        })}
                      />
                    </div>
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
                            color: 'gray.300',
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
                        onChange={(e) => setWatermarkRotation(Number(e.target.value))}
                        className={css({
                          w: 'full',
                          accentColor: 'red.500',
                        })}
                      />
                    </div>
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.300',
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
                            'center',
                            'diagonal',
                            'bottom',
                            'bottom-left',
                            'bottom-right',
                          ] as const
                        ).map((pos) => (
                          <Button
                            key={pos}
                            variant={watermarkPosition === pos ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setWatermarkPosition(pos)}
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
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor="watermark-color"
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.300',
                        })}
                      >
                        Color
                      </label>
                      <input
                        id="watermark-color"
                        type="color"
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
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
                        onChange={(e) => setWatermarkPattern(e.target.checked)}
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
                          color: 'gray.300',
                          cursor: 'pointer',
                        })}
                      >
                        Tile Pattern (Repeating Grid)
                      </label>
                    </div>
                  </>
                )}

                {operation === 'extract' && (
                  <div className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
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
                            color: 'gray.400',
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
                            color: 'gray.400',
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
                        color: 'gray.300',
                      })}
                    >
                      Rotation Angle
                    </div>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
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

                {operation === 'imagesToPdf' && (
                  <>
                    <div className={css({ spaceY: '2' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.300',
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
                          color: 'gray.300',
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
                            <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                              {mode.desc}
                            </span>
                          </Button>
                        ))}
                      </div>
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.500',
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
            gridColumn: { base: 'span 1', lg: 'span 2' },
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

                    <ReorderablePDFList
                      pdfs={pdfs}
                      onReorder={(reorderedPdfs) => setPdfs(reorderedPdfs)}
                      onRemove={handleRemove}
                      onDownload={handleDownload}
                      formatBytes={formatBytes}
                      renderThumbnail={(pdf) => <PDFThumbnail file={pdf.file} />}
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
            <CardContent>
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
                    color: 'gray.500',
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
      <ToolSearch />
    </main>
  )
}
