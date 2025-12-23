'use client'

export interface PDFFile {
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
  splitBlob2?: Blob
  imageBlobs?: Blob[]
}

export type CompressionLevel = 'low' | 'medium' | 'high'
export type OperationType =
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
  | 'reorder'
  | 'duplicatePages'
  | 'addPageNumbers'
  | 'extractText'

interface ProcessOptions {
  compressionLevel?: CompressionLevel
  splitPageNumber?: number
  watermarkText?: string
  watermarkOpacity?: number
  watermarkRotation?: number
  watermarkPosition?:
    | 'center'
    | 'diagonal'
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  watermarkColor?: string
  watermarkFontSize?: number
  watermarkPattern?: boolean
  extractStartPage?: number
  extractEndPage?: number
  rotationAngle?: number
  imageToPdfPageSize?: 'A4' | 'Letter' | 'Legal' | 'Original'
  imageToPdfFitMode?: 'contain' | 'cover' | 'fill'
  pagesToDelete?: number[] // Array of page numbers (1-indexed) to delete
  password?: string // Password for encryption
  ownerPassword?: string // Owner password for permissions (optional)
  userPermissions?: {
    printing?: boolean
    modifying?: boolean
    copying?: boolean
    annotating?: boolean
    fillingForms?: boolean
    contentAccessibility?: boolean
    documentAssembly?: boolean
  }
  pagesToDuplicate?: number[] // Array of page numbers (1-indexed) to duplicate
  duplicateCount?: number // How many times to duplicate each selected page (default: 1)
  unlockPassword?: string // Password to unlock a protected PDF
  pageOrder?: number[] // Array of page numbers (1-indexed) in desired order for reorder operation
  pageNumberPosition?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  pageNumberFormat?: 'numbers' | 'roman-lower' | 'roman-upper' | 'page-of-total'
  pageNumberFontSize?: number
  pageNumberStartFrom?: number // Starting page number (default: 1)
}

/**
 * Batch processor for PDF operations with parallel processing
 */
export class PDFBatchProcessor {
  private updateCallback: (id: string, updates: Partial<PDFFile>) => void

  constructor(updateCallback: (id: string, updates: Partial<PDFFile>) => void) {
    this.updateCallback = updateCallback
  }

  /**
   * Process multiple PDFs in parallel with Promise.allSettled
   */
  async processBatch(
    pdfs: PDFFile[],
    operation: OperationType,
    options: ProcessOptions = {}
  ): Promise<void> {
    const pendingPdfs = pdfs.filter((p) => p.status === 'pending')

    if (pendingPdfs.length === 0) return

    // Process in parallel
    const results = await Promise.allSettled(
      pendingPdfs.map((pdf) => this.processSingle(pdf, operation, options))
    )

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to process ${pendingPdfs[index].name}:`, result.reason)
      }
    })
  }

  /**
   * Process a single PDF file
   */
  private async processSingle(
    pdf: PDFFile,
    operation: OperationType,
    options: ProcessOptions
  ): Promise<void> {
    this.updateCallback(pdf.id, { status: 'processing', progress: 0 })

    try {
      switch (operation) {
        case 'split':
          await this.splitPDF(pdf, options.splitPageNumber || 1)
          break
        case 'compress':
          await this.compressPDF(pdf, options.compressionLevel || 'high')
          break
        case 'toImages':
          await this.convertToImages(pdf)
          break
        case 'imagesToPdf':
          await this.convertImagesToPDF(
            pdf,
            options.imageToPdfPageSize || 'A4',
            options.imageToPdfFitMode || 'contain'
          )
          break
        case 'watermark':
          await this.addWatermark(
            pdf,
            options.watermarkText || 'CONFIDENTIAL',
            options.watermarkOpacity || 0.3,
            {
              rotation: options.watermarkRotation,
              position: options.watermarkPosition,
              color: options.watermarkColor,
              fontSize: options.watermarkFontSize,
              pattern: options.watermarkPattern,
            }
          )
          break
        case 'extract':
          await this.extractPages(pdf, options.extractStartPage || 1, options.extractEndPage || 1)
          break
        case 'rotate':
          await this.rotatePDF(pdf, options.rotationAngle || 90)
          break
        case 'toWord':
          await this.convertToWord(pdf)
          break
        case 'grayscale':
          await this.convertToGrayscale(pdf)
          break
        case 'deletePages':
          await this.deletePages(pdf, options.pagesToDelete || [])
          break
        case 'protect':
          await this.protectPDF(
            pdf,
            options.password || '',
            options.ownerPassword,
            options.userPermissions
          )
          break
        case 'unlock':
          await this.unlockPDF(pdf, options.unlockPassword || '')
          break
        case 'reorder':
          await this.reorderPages(pdf, options.pageOrder || [])
          break
        case 'duplicatePages':
          await this.duplicatePages(
            pdf,
            options.pagesToDuplicate || [],
            options.duplicateCount || 1
          )
          break
        case 'addPageNumbers':
          await this.addPageNumbers(pdf, {
            position: options.pageNumberPosition || 'bottom-center',
            format: options.pageNumberFormat || 'numbers',
            fontSize: options.pageNumberFontSize || 12,
            startFrom: options.pageNumberStartFrom || 1,
          })
          break
        case 'extractText':
          await this.extractText(pdf)
          break
      }
    } catch (error) {
      console.error(`Error processing ${pdf.name}:`, error)
      this.updateCallback(pdf.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Processing failed',
      })
    }
  }

  /**
   * Smart compression that detects document type
   */
  private async compressPDF(pdf: PDFFile, level: CompressionLevel): Promise<void> {
    const pdfjs = await import('pdfjs-dist')
    const { PDFDocument } = await import('pdf-lib')

    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }

    this.updateCallback(pdf.id, { progress: 10 })

    const arrayBuffer = await pdf.file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfjsDoc = await loadingTask.promise

    // Detect if document is text-heavy or image-heavy
    const isTextHeavy = await this.detectTextHeavyDocument(pdfjsDoc)

    this.updateCallback(pdf.id, { progress: 20 })

    const pdfDoc = await PDFDocument.create()

    // Adjust quality based on document type
    let imageQuality: number
    let scale: number

    if (isTextHeavy) {
      // Text documents - preserve quality, focus on structure optimization
      imageQuality = level === 'high' ? 0.6 : level === 'medium' ? 0.8 : 0.9
      scale = level === 'high' ? 1.5 : level === 'medium' ? 2.0 : 2.5
    } else {
      // Image-heavy documents - aggressive compression
      imageQuality = level === 'high' ? 0.2 : level === 'medium' ? 0.5 : 0.7
      scale = level === 'high' ? 1.0 : level === 'medium' ? 1.5 : 2.0
    }

    for (let pageNum = 1; pageNum <= pdfjsDoc.numPages; pageNum++) {
      const page = await pdfjsDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale })

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
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          },
          'image/jpeg',
          imageQuality
        )
      })

      const jpegImage = await pdfDoc.embedJpg(await blob.arrayBuffer())
      const newPage = pdfDoc.addPage([viewport.width, viewport.height])
      newPage.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      })

      this.updateCallback(pdf.id, {
        progress: 20 + (pageNum / pdfjsDoc.numPages) * 70,
      })
    }

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    })

    const finalBlob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: finalBlob,
      processedSize: finalBlob.size,
    })
  }

  /**
   * Detect if document is text-heavy by analyzing text content
   */
  // biome-ignore lint/suspicious/noExplicitAny: pdfjs document types
  private async detectTextHeavyDocument(pdfDoc: any): Promise<boolean> {
    try {
      // Sample first 3 pages
      const pagesToSample = Math.min(3, pdfDoc.numPages)
      let totalTextLength = 0

      for (let i = 1; i <= pagesToSample; i++) {
        const page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent()
        // biome-ignore lint/suspicious/noExplicitAny: pdfjs text content structure
        const text = textContent.items.map((item: any) => item.str || '').join(' ')
        totalTextLength += text.length
      }

      // If average text length > 500 chars per page, consider it text-heavy
      return totalTextLength / pagesToSample > 500
    } catch {
      return false
    }
  }

  private async splitPDF(pdf: PDFFile, splitPageNumber: number): Promise<void> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()

    if (splitPageNumber < 1 || splitPageNumber > totalPages) {
      throw new Error('Invalid page number')
    }

    const pdf1 = await PDFDocument.create()
    const pages1 = await pdf1.copyPages(
      pdfDoc,
      Array.from({ length: splitPageNumber }, (_, i) => i)
    )
    for (const page of pages1) {
      pdf1.addPage(page)
    }

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

    const blob1 = new Blob([new Uint8Array(bytes1)], { type: 'application/pdf' })
    const blob2 = new Blob([new Uint8Array(bytes2)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob1,
      processedSize: blob1.size + blob2.size,
      splitBlob2: blob2,
    })
  }

  private async convertToImages(pdf: PDFFile): Promise<void> {
    const pdfjs = await import('pdfjs-dist')

    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }

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

      this.updateCallback(pdf.id, {
        progress: (pageNum / pdfDoc.numPages) * 100,
      })
    }

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      imageBlobs: images,
    })
  }

  private async addWatermark(
    pdf: PDFFile,
    text: string,
    opacity: number,
    options?: {
      rotation?: number
      position?:
        | 'center'
        | 'diagonal'
        | 'top'
        | 'bottom'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
      color?: string
      fontSize?: number
      pattern?: boolean
    }
  ): Promise<void> {
    const { PDFDocument, rgb, degrees } = await import('pdf-lib')
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

    const rotation = options?.rotation ?? -45
    const position = options?.position ?? 'diagonal'
    const fontSize = options?.fontSize ?? 50
    const colorHex = options?.color ?? '#b3b3b3'
    const pattern = options?.pattern ?? false
    const rgbColor = hexToRgb(colorHex)

    // biome-ignore lint/suspicious/noExplicitAny: pdf-lib page types
    pages.forEach((page: any, index: number) => {
      const { width, height } = page.getSize()

      const drawOptions = {
        size: fontSize,
        color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
        opacity: opacity,
        rotate: degrees(rotation),
      }

      if (pattern) {
        // Draw watermark multiple times in a grid pattern
        const spacingX = width / 3
        const spacingY = height / 3
        for (let xOffset = 0; xOffset < width; xOffset += spacingX) {
          for (let yOffset = 0; yOffset < height; yOffset += spacingY) {
            page.drawText(text, {
              x: xOffset,
              y: yOffset,
              ...drawOptions,
            })
          }
        }
      } else {
        // Single watermark at specified position
        const pos = getPosition(width, height, text.length, position, fontSize)
        page.drawText(text, {
          x: pos.x,
          y: pos.y,
          ...drawOptions,
        })
      }

      this.updateCallback(pdf.id, {
        progress: ((index + 1) / pages.length) * 100,
      })
    })

    const watermarkedBytes = await pdfDoc.save()
    const blob = new Blob([new Uint8Array(watermarkedBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  private async extractPages(pdf: PDFFile, startPage: number, endPage: number): Promise<void> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()

    if (startPage < 1 || endPage > totalPages || startPage > endPage) {
      throw new Error('Invalid page range')
    }

    const newPdf = await PDFDocument.create()
    const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage - 1)

    const pages = await newPdf.copyPages(pdfDoc, pageIndices)
    for (const page of pages) {
      newPdf.addPage(page)
    }

    const extractedBytes = await newPdf.save()
    const blob = new Blob([new Uint8Array(extractedBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Delete specific pages from PDF
   * @param pdf - PDF file to process
   * @param pagesToDelete - Array of 1-indexed page numbers to delete (e.g., [1, 3, 5])
   */
  private async deletePages(pdf: PDFFile, pagesToDelete: number[]): Promise<void> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()

    // Validate page numbers
    if (pagesToDelete.length === 0) {
      throw new Error('No pages selected for deletion')
    }

    if (pagesToDelete.length >= totalPages) {
      throw new Error('Cannot delete all pages from PDF')
    }

    const invalidPages = pagesToDelete.filter((page) => page < 1 || page > totalPages)
    if (invalidPages.length > 0) {
      throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}`)
    }

    // Create new PDF with only pages that are NOT in pagesToDelete
    const newPdf = await PDFDocument.create()
    const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (pageNum) => !pagesToDelete.includes(pageNum)
    )

    // Convert to 0-indexed for pdf-lib
    const pageIndices = pagesToKeep.map((p) => p - 1)

    // Copy pages to new document
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
    for (let i = 0; i < copiedPages.length; i++) {
      newPdf.addPage(copiedPages[i])

      // Update progress
      this.updateCallback(pdf.id, {
        progress: ((i + 1) / copiedPages.length) * 100,
      })
    }

    const resultBytes = await newPdf.save()
    const blob = new Blob([new Uint8Array(resultBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Protect PDF with password encryption
   * Note: This uses a server-side API for encryption as client-side encryption is limited
   * @param pdf - PDF file to protect
   * @param userPassword - Password required to open the PDF
   * @param ownerPassword - Optional owner password for advanced permissions
   * @param permissions - User permissions for the protected PDF
   */
  private async protectPDF(
    pdf: PDFFile,
    userPassword: string,
    ownerPassword?: string,
    permissions?: {
      printing?: boolean
      modifying?: boolean
      copying?: boolean
      annotating?: boolean
      fillingForms?: boolean
      contentAccessibility?: boolean
      documentAssembly?: boolean
    }
  ): Promise<void> {
    // Validate password
    if (!userPassword || userPassword.trim() === '') {
      throw new Error('Password is required')
    }

    if (userPassword.length < 4) {
      throw new Error('Password must be at least 4 characters long')
    }

    this.updateCallback(pdf.id, { progress: 10 })

    // Prepare form data
    const formData = new FormData()
    formData.append('file', pdf.file)
    formData.append('password', userPassword)
    if (ownerPassword) {
      formData.append('ownerPassword', ownerPassword)
    }
    if (permissions) {
      formData.append('permissions', JSON.stringify(permissions))
    }

    this.updateCallback(pdf.id, { progress: 30 })

    // Call server-side API for encryption
    const response = await fetch('/api/pdf-protect', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to protect PDF')
    }

    this.updateCallback(pdf.id, { progress: 80 })

    const blob = await response.blob()

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Unlock a password-protected PDF
   * @param pdf - PDF file to unlock
   * @param password - Password to unlock the PDF
   */
  private async unlockPDF(pdf: PDFFile, password: string): Promise<void> {
    // Validate password
    if (!password || password.trim() === '') {
      throw new Error('Password is required to unlock the PDF')
    }

    this.updateCallback(pdf.id, { progress: 10 })

    // Prepare form data
    const formData = new FormData()
    formData.append('file', pdf.file)
    formData.append('password', password)

    this.updateCallback(pdf.id, { progress: 30 })

    // Call server-side API for decryption
    const response = await fetch('/api/pdf-unlock', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to unlock PDF')
    }

    this.updateCallback(pdf.id, { progress: 80 })

    const blob = await response.blob()

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Reorder pages in a PDF according to a custom order
   * @param pdf - PDF file to process
   * @param pageOrder - Array of 1-indexed page numbers in desired order (e.g., [3, 1, 2])
   */
  private async reorderPages(pdf: PDFFile, pageOrder: number[]): Promise<void> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()

    // Validate page order
    if (pageOrder.length === 0) {
      throw new Error('Page order is required')
    }

    if (pageOrder.length !== totalPages) {
      throw new Error(
        `Page order must include all pages. Expected ${totalPages} pages, got ${pageOrder.length}`
      )
    }

    // Check for duplicates or invalid page numbers
    const uniquePages = new Set(pageOrder)
    if (uniquePages.size !== pageOrder.length) {
      throw new Error('Page order contains duplicate page numbers')
    }

    const invalidPages = pageOrder.filter((page) => page < 1 || page > totalPages)
    if (invalidPages.length > 0) {
      throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}`)
    }

    this.updateCallback(pdf.id, { progress: 20 })

    // Create new PDF with pages in the specified order
    const newPdf = await PDFDocument.create()

    // Convert 1-indexed page numbers to 0-indexed for pdf-lib
    const pageIndices = pageOrder.map((pageNum) => pageNum - 1)

    this.updateCallback(pdf.id, { progress: 40 })

    // Copy pages in the new order
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)

    this.updateCallback(pdf.id, { progress: 70 })

    // Add all copied pages to the new document
    for (const page of copiedPages) {
      newPdf.addPage(page)
    }

    this.updateCallback(pdf.id, { progress: 85 })

    // Save the reordered PDF
    const pdfBytes = await newPdf.save()
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Duplicate specific pages in a PDF
   * @param pdf - PDF file to process
   * @param pagesToDuplicate - Array of 1-indexed page numbers to duplicate (e.g., [1, 3, 5])
   * @param duplicateCount - How many times to duplicate each page (default: 1)
   */
  private async duplicatePages(
    pdf: PDFFile,
    pagesToDuplicate: number[],
    duplicateCount: number
  ): Promise<void> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()

    // Validate page numbers
    if (pagesToDuplicate.length === 0) {
      throw new Error('No pages selected for duplication')
    }

    if (duplicateCount < 1) {
      throw new Error('Duplicate count must be at least 1')
    }

    if (duplicateCount > 10) {
      throw new Error('Duplicate count cannot exceed 10')
    }

    const invalidPages = pagesToDuplicate.filter((page) => page < 1 || page > totalPages)
    if (invalidPages.length > 0) {
      throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}`)
    }

    this.updateCallback(pdf.id, { progress: 10 })

    // Create new PDF with duplicated pages
    const newPdf = await PDFDocument.create()

    // Build the new page order
    // For each original page, add it once, then if it's in pagesToDuplicate, add it N more times
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageIndex = pageNum - 1

      // Copy original page
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex])
      newPdf.addPage(copiedPage)

      // If this page should be duplicated, add copies
      if (pagesToDuplicate.includes(pageNum)) {
        for (let copy = 0; copy < duplicateCount; copy++) {
          const [duplicatedPage] = await newPdf.copyPages(pdfDoc, [pageIndex])
          newPdf.addPage(duplicatedPage)
        }
      }

      // Update progress
      this.updateCallback(pdf.id, {
        progress: 10 + (pageNum / totalPages) * 80,
      })
    }

    this.updateCallback(pdf.id, { progress: 90 })

    const resultBytes = await newPdf.save()
    const blob = new Blob([new Uint8Array(resultBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Add page numbers to PDF pages
   * @param pdf - PDF file to process
   * @param options - Page numbering options
   */
  private async addPageNumbers(
    pdf: PDFFile,
    options: {
      position:
        | 'top-left'
        | 'top-center'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-center'
        | 'bottom-right'
      format: 'numbers' | 'roman-lower' | 'roman-upper' | 'page-of-total'
      fontSize: number
      startFrom: number
    }
  ): Promise<void> {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()
    const totalPages = pages.length

    this.updateCallback(pdf.id, { progress: 10 })

    // Load font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    this.updateCallback(pdf.id, { progress: 20 })

    // Helper function to convert number to Roman numerals
    const toRoman = (num: number, uppercase: boolean): string => {
      const romanNumerals = [
        { value: 1000, symbol: 'M' },
        { value: 900, symbol: 'CM' },
        { value: 500, symbol: 'D' },
        { value: 400, symbol: 'CD' },
        { value: 100, symbol: 'C' },
        { value: 90, symbol: 'XC' },
        { value: 50, symbol: 'L' },
        { value: 40, symbol: 'XL' },
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' },
      ]

      let result = ''
      let remaining = num

      for (const { value, symbol } of romanNumerals) {
        while (remaining >= value) {
          result += symbol
          remaining -= value
        }
      }

      return uppercase ? result : result.toLowerCase()
    }

    // Format page number based on format option
    const formatPageNumber = (pageIndex: number): string => {
      const pageNum = pageIndex + options.startFrom

      switch (options.format) {
        case 'roman-lower':
          return toRoman(pageNum, false)
        case 'roman-upper':
          return toRoman(pageNum, true)
        case 'page-of-total':
          return `${pageNum} / ${totalPages + options.startFrom - 1}`
        case 'numbers':
        default:
          return pageNum.toString()
      }
    }

    // Add page numbers to each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const { width, height } = page.getSize()
      const pageNumberText = formatPageNumber(i)
      const textWidth = font.widthOfTextAtSize(pageNumberText, options.fontSize)
      const textHeight = options.fontSize

      // Calculate position
      let x = 0
      let y = 0
      const margin = 30

      switch (options.position) {
        case 'top-left':
          x = margin
          y = height - margin
          break
        case 'top-center':
          x = (width - textWidth) / 2
          y = height - margin
          break
        case 'top-right':
          x = width - textWidth - margin
          y = height - margin
          break
        case 'bottom-left':
          x = margin
          y = margin
          break
        case 'bottom-center':
          x = (width - textWidth) / 2
          y = margin
          break
        case 'bottom-right':
          x = width - textWidth - margin
          y = margin
          break
      }

      // Draw page number
      page.drawText(pageNumberText, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(0, 0, 0),
      })

      // Update progress
      this.updateCallback(pdf.id, {
        progress: 20 + ((i + 1) / totalPages) * 70,
      })
    }

    this.updateCallback(pdf.id, { progress: 95 })

    // Save the PDF with page numbers
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  /**
   * Extract text content from PDF
   * @param pdf - PDF file to extract text from
   */
  private async extractText(pdf: PDFFile): Promise<void> {
    const pdfjs = await import('pdfjs-dist')

    // Set up the worker
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }

    this.updateCallback(pdf.id, { progress: 10 })

    const arrayBuffer = await pdf.file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfDoc = await loadingTask.promise
    const totalPages = pdfDoc.numPages

    this.updateCallback(pdf.id, { progress: 20 })

    let extractedText = ''

    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Add page header
      extractedText += `\n========== Page ${pageNum} ==========\n\n`

      // Extract text items
      const pageText = textContent.items
        .map((item: any) => {
          return item.str
        })
        .join(' ')

      extractedText += pageText + '\n'

      // Update progress
      this.updateCallback(pdf.id, {
        progress: 20 + (pageNum / totalPages) * 70,
      })
    }

    this.updateCallback(pdf.id, { progress: 95 })

    // Create a text file blob
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  private async rotatePDF(pdf: PDFFile, angle: number): Promise<void> {
    const { PDFDocument, degrees } = await import('pdf-lib')
    const arrayBuffer = await pdf.file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()

    // biome-ignore lint/suspicious/noExplicitAny: pdf-lib page types
    pages.forEach((page: any, index: number) => {
      page.setRotation(degrees(angle))

      this.updateCallback(pdf.id, {
        progress: ((index + 1) / pages.length) * 100,
      })
    })

    const rotatedBytes = await pdfDoc.save()
    const blob = new Blob([new Uint8Array(rotatedBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  private async convertToWord(pdf: PDFFile): Promise<void> {
    const pdfjs = await import('pdfjs-dist')
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')

    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }

    const arrayBuffer = await pdf.file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfDoc = await loadingTask.promise

    // biome-ignore lint/suspicious/noExplicitAny: docx library types
    const paragraphs: any[] = []

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const textContent = await page.getTextContent()

      this.updateCallback(pdf.id, {
        progress: (pageNum / pdfDoc.numPages) * 80,
      })

      // biome-ignore lint/suspicious/noExplicitAny: pdfjs text content items
      const lines: Map<number, any[]> = new Map()
      const tolerance = 2

      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const y = Math.round(item.transform[5] / tolerance) * tolerance
          if (!lines.has(y)) {
            lines.set(y, [])
          }
          lines.get(y)?.push(item)
        }
      }

      const sortedLines = Array.from(lines.entries()).sort((a, b) => b[0] - a[0])

      if (pdfDoc.numPages > 1) {
        paragraphs.push(
          new Paragraph({
            text: `--- Page ${pageNum} ---`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        )
      }

      for (const [, lineItems] of sortedLines) {
        lineItems.sort((a, b) => a.transform[4] - b.transform[4])

        const textRuns: InstanceType<typeof TextRun>[] = []
        let previousX = -1
        let previousFontSize = -1

        for (const item of lineItems) {
          const text = item.str
          const x = item.transform[4]
          const fontSize = item.transform[0]

          const isLarger = previousFontSize > 0 && fontSize > previousFontSize * 1.2

          if (previousX !== -1 && x - previousX > fontSize * 0.3) {
            textRuns.push(new TextRun(' '))
          }

          textRuns.push(
            new TextRun({
              text: text,
              bold: isLarger,
              size: Math.round(fontSize * 2),
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

      if (pageNum < pdfDoc.numPages) {
        paragraphs.push(
          new Paragraph({
            text: '',
            pageBreakBefore: true,
          })
        )
      }
    }

    this.updateCallback(pdf.id, { progress: 90 })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: blob,
      processedSize: blob.size,
    })
  }

  private async convertToGrayscale(pdf: PDFFile): Promise<void> {
    const pdfjs = await import('pdfjs-dist')
    const { PDFDocument } = await import('pdf-lib')

    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
    }

    const arrayBuffer = await pdf.file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfjsDoc = await loadingTask.promise

    const pdfDoc = await PDFDocument.create()

    for (let pageNum = 1; pageNum <= pdfjsDoc.numPages; pageNum++) {
      const page = await pdfjsDoc.getPage(pageNum)
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

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
      context.putImageData(imageData, 0, 0)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/png')
      })

      const pngImage = await pdfDoc.embedPng(await blob.arrayBuffer())
      const newPage = pdfDoc.addPage([viewport.width, viewport.height])
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      })

      this.updateCallback(pdf.id, {
        progress: (pageNum / pdfjsDoc.numPages) * 100,
      })
    }

    const grayscaleBytes = await pdfDoc.save()
    const finalBlob = new Blob([new Uint8Array(grayscaleBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: finalBlob,
      processedSize: finalBlob.size,
    })
  }

  private async convertImagesToPDF(
    pdf: PDFFile,
    pageSize: 'A4' | 'Letter' | 'Legal' | 'Original',
    fitMode: 'contain' | 'cover' | 'fill'
  ): Promise<void> {
    const { PDFDocument } = await import('pdf-lib')

    this.updateCallback(pdf.id, { progress: 10 })

    const pdfDoc = await PDFDocument.create()

    // Define page dimensions (in points: 1 point = 1/72 inch)
    const pageSizes = {
      A4: { width: 595, height: 842 }, // 210mm x 297mm
      Letter: { width: 612, height: 792 }, // 8.5" x 11"
      Legal: { width: 612, height: 1008 }, // 8.5" x 14"
      Original: { width: 0, height: 0 }, // Will be set based on image dimensions
    }

    const targetPageSize = pageSizes[pageSize]

    // Load image
    const arrayBuffer = await pdf.file.arrayBuffer()
    const mimeType = pdf.file.type

    let embeddedImage:
      | Awaited<ReturnType<typeof pdfDoc.embedPng>>
      | Awaited<ReturnType<typeof pdfDoc.embedJpg>>

    this.updateCallback(pdf.id, { progress: 30 })

    // Embed image based on type
    if (mimeType === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer)
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer)
    } else {
      // For other formats (like WebP), convert to PNG first
      const img = new Image()
      const blob = new Blob([arrayBuffer], { type: mimeType })
      const url = URL.createObjectURL(blob)

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')
      ctx.drawImage(img, 0, 0)

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to convert image to PNG'))
        }, 'image/png')
      })

      URL.revokeObjectURL(url)
      embeddedImage = await pdfDoc.embedPng(await pngBlob.arrayBuffer())
    }

    this.updateCallback(pdf.id, { progress: 60 })

    const imageWidth = embeddedImage.width
    const imageHeight = embeddedImage.height

    let pageWidth: number,
      pageHeight: number,
      x: number,
      y: number,
      drawWidth: number,
      drawHeight: number

    if (pageSize === 'Original') {
      // Use original image dimensions
      pageWidth = imageWidth
      pageHeight = imageHeight
      x = 0
      y = 0
      drawWidth = imageWidth
      drawHeight = imageHeight
    } else {
      pageWidth = targetPageSize.width
      pageHeight = targetPageSize.height

      // Calculate scaling based on fit mode
      const pageAspect = pageWidth / pageHeight
      const imageAspect = imageWidth / imageHeight

      if (fitMode === 'contain') {
        // Fit entire image within page, maintain aspect ratio
        if (imageAspect > pageAspect) {
          // Image is wider - fit to width
          drawWidth = pageWidth
          drawHeight = pageWidth / imageAspect
          x = 0
          y = (pageHeight - drawHeight) / 2
        } else {
          // Image is taller - fit to height
          drawHeight = pageHeight
          drawWidth = pageHeight * imageAspect
          x = (pageWidth - drawWidth) / 2
          y = 0
        }
      } else if (fitMode === 'cover') {
        // Cover entire page, crop image if needed
        if (imageAspect > pageAspect) {
          // Image is wider - fit to height and crop sides
          drawHeight = pageHeight
          drawWidth = pageHeight * imageAspect
          x = (pageWidth - drawWidth) / 2
          y = 0
        } else {
          // Image is taller - fit to width and crop top/bottom
          drawWidth = pageWidth
          drawHeight = pageWidth / imageAspect
          x = 0
          y = (pageHeight - drawHeight) / 2
        }
      } else {
        // fill - stretch to fit page (may distort)
        x = 0
        y = 0
        drawWidth = pageWidth
        drawHeight = pageHeight
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight])
    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    })

    this.updateCallback(pdf.id, { progress: 90 })

    const pdfBytes = await pdfDoc.save()
    const finalBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })

    this.updateCallback(pdf.id, {
      status: 'completed',
      progress: 100,
      processedBlob: finalBlob,
      processedSize: finalBlob.size,
    })
  }
}
