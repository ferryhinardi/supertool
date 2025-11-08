/**
 * QR Code Enhanced Export Service
 * Provides multiple export formats and print templates
 */

import { toJpeg, toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'webp' | 'jpeg'
export type PrintTemplate = 'business-card' | 'flyer' | 'product-label' | 'a4-sheet' | 'none'

export interface ExportOptions {
  format: ExportFormat
  dpi?: number // For PNG/JPEG (72, 150, 300, 600)
  quality?: number // For JPEG/WebP (0-1)
  template?: PrintTemplate
  metadata?: ExportMetadata
}

export interface ExportMetadata {
  title?: string
  description?: string
  url?: string
  createdAt?: string
  qrType?: string
}

export interface BatchExportItem {
  id: string
  svgElement: SVGSVGElement
  filename: string
  metadata?: ExportMetadata
}

/**
 * Convert SVG element to high-DPI PNG
 */
export async function exportToPNG(
  svgElement: SVGSVGElement,
  filename: string,
  dpi = 300,
  _metadata?: ExportMetadata
): Promise<void> {
  try {
    const baseSize = svgElement.width.baseVal.value
    const scaleFactor = dpi / 72 // 72 is default DPI
    const scaledSize = baseSize * scaleFactor

    // Create a temporary container with scaled SVG
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = `${scaledSize}px`
    container.style.height = `${scaledSize}px`
    document.body.appendChild(container)

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement
    svgClone.setAttribute('width', String(scaledSize))
    svgClone.setAttribute('height', String(scaledSize))
    container.appendChild(svgClone)

    const dataUrl = await toPng(container, {
      width: scaledSize,
      height: scaledSize,
      pixelRatio: 1,
    })

    document.body.removeChild(container)

    // Download
    const link = document.createElement('a')
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('PNG export failed:', error)
    throw new Error('Failed to export PNG')
  }
}

/**
 * Convert SVG element to JPEG
 */
export async function exportToJPEG(
  svgElement: SVGSVGElement,
  filename: string,
  quality = 0.95,
  dpi = 300
): Promise<void> {
  try {
    const baseSize = svgElement.width.baseVal.value
    const scaleFactor = dpi / 72
    const scaledSize = baseSize * scaleFactor

    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = `${scaledSize}px`
    container.style.height = `${scaledSize}px`
    container.style.backgroundColor = 'white' // JPEG needs background
    document.body.appendChild(container)

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement
    svgClone.setAttribute('width', String(scaledSize))
    svgClone.setAttribute('height', String(scaledSize))
    container.appendChild(svgClone)

    const dataUrl = await toJpeg(container, {
      width: scaledSize,
      height: scaledSize,
      quality,
      pixelRatio: 1,
    })

    document.body.removeChild(container)

    const link = document.createElement('a')
    link.download = filename.endsWith('.jpg') ? filename : `${filename}.jpg`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('JPEG export failed:', error)
    throw new Error('Failed to export JPEG')
  }
}

/**
 * Convert SVG element to WebP
 */
export async function exportToWebP(
  svgElement: SVGSVGElement,
  filename: string,
  quality = 0.9
): Promise<void> {
  try {
    const size = svgElement.width.baseVal.value

    // First convert to PNG
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    document.body.appendChild(container)
    container.appendChild(svgElement.cloneNode(true))

    const pngDataUrl = await toPng(container, {
      width: size,
      height: size,
    })
    document.body.removeChild(container)

    // Convert PNG to WebP
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas context not available')

    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        resolve()
      }
      img.onerror = reject
      img.src = pngDataUrl
    })

    const webpDataUrl = canvas.toDataURL('image/webp', quality)

    const link = document.createElement('a')
    link.download = filename.endsWith('.webp') ? filename : `${filename}.webp`
    link.href = webpDataUrl
    link.click()
  } catch (error) {
    console.error('WebP export failed:', error)
    throw new Error('Failed to export WebP')
  }
}

/**
 * Export SVG as downloadable file
 */
export function exportToSVG(svgElement: SVGSVGElement, filename: string): void {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('SVG export failed:', error)
    throw new Error('Failed to export SVG')
  }
}

/**
 * Export QR code as PDF with optional print template
 */
export async function exportToPDF(
  svgElement: SVGSVGElement,
  filename: string,
  template: PrintTemplate = 'none',
  metadata?: ExportMetadata
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Convert SVG to PNG for embedding
    const size = svgElement.width.baseVal.value
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    document.body.appendChild(container)
    container.appendChild(svgElement.cloneNode(true))

    const imgDataUrl = await toPng(container, {
      width: size * 2, // Higher resolution for print
      height: size * 2,
    })
    document.body.removeChild(container)

    if (template === 'business-card') {
      // Business card: 85mm x 55mm
      pdf.setFontSize(10)
      pdf.text(metadata?.title || 'Scan to connect', 10, 10)
      pdf.addImage(imgDataUrl, 'PNG', 10, 15, 40, 40)
      if (metadata?.description) {
        pdf.setFontSize(8)
        pdf.text(metadata.description, 55, 25, { maxWidth: 25 })
      }
    } else if (template === 'flyer') {
      // A4 centered with title
      pdf.setFontSize(24)
      pdf.text(metadata?.title || 'Scan QR Code', 105, 30, { align: 'center' })
      pdf.addImage(imgDataUrl, 'PNG', 55, 50, 100, 100)
      if (metadata?.description) {
        pdf.setFontSize(12)
        pdf.text(metadata.description, 105, 160, { align: 'center', maxWidth: 150 })
      }
    } else if (template === 'product-label') {
      // Product label: 100mm x 70mm
      pdf.setFontSize(16)
      pdf.text(metadata?.title || 'Product Information', 10, 15)
      pdf.addImage(imgDataUrl, 'PNG', 10, 25, 50, 50)
      if (metadata?.description) {
        pdf.setFontSize(10)
        pdf.text(metadata.description, 70, 35, { maxWidth: 60 })
      }
    } else if (template === 'a4-sheet') {
      // Multiple QR codes on A4 (2x4 grid)
      pdf.setFontSize(12)
      pdf.text(metadata?.title || 'QR Codes', 105, 15, { align: 'center' })

      const qrSize = 40
      const spacing = 10
      const startX = 20
      const startY = 30

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          const x = startX + col * (qrSize + spacing + 60)
          const y = startY + row * (qrSize + spacing + 20)
          pdf.addImage(imgDataUrl, 'PNG', x, y, qrSize, qrSize)
          if (metadata?.description) {
            pdf.setFontSize(8)
            pdf.text(metadata.description, x, y + qrSize + 5, { maxWidth: qrSize })
          }
        }
      }
    } else {
      // Simple centered QR code
      pdf.addImage(imgDataUrl, 'PNG', 55, 50, 100, 100)
      if (metadata?.title) {
        pdf.setFontSize(16)
        pdf.text(metadata.title, 105, 40, { align: 'center' })
      }
    }

    // Add metadata footer
    if (metadata?.createdAt) {
      pdf.setFontSize(8)
      pdf.setTextColor(128)
      pdf.text(`Generated: ${metadata.createdAt}`, 10, 290)
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('Failed to export PDF')
  }
}

/**
 * Export multiple QR codes as ZIP file
 */
export async function exportBatchToZIP(
  items: BatchExportItem[],
  zipFilename: string,
  format: ExportFormat = 'png',
  options?: { dpi?: number; quality?: number }
): Promise<void> {
  try {
    const zip = new JSZip()
    const qrFolder = zip.folder('qr-codes')

    if (!qrFolder) throw new Error('Failed to create ZIP folder')

    // Generate metadata file
    const metadataContent = items
      .map(
        (item) =>
          `${item.filename}\n` +
          `Type: ${item.metadata?.qrType || 'N/A'}\n` +
          `Created: ${item.metadata?.createdAt || new Date().toISOString()}\n` +
          `URL: ${item.metadata?.url || 'N/A'}\n` +
          `Description: ${item.metadata?.description || 'N/A'}\n` +
          '---\n'
      )
      .join('\n')

    qrFolder.file('metadata.txt', metadataContent)

    // Export each QR code
    for (const item of items) {
      let fileData: string

      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(item.svgElement)
        qrFolder.file(`${item.filename}.svg`, svgData)
        continue
      }

      // For raster formats, convert to data URL
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      document.body.appendChild(container)

      const svgClone = item.svgElement.cloneNode(true) as SVGSVGElement
      const baseSize = item.svgElement.width.baseVal.value

      if (format === 'png' && options?.dpi) {
        const scaleFactor = options.dpi / 72
        const scaledSize = baseSize * scaleFactor
        svgClone.setAttribute('width', String(scaledSize))
        svgClone.setAttribute('height', String(scaledSize))
      }

      container.appendChild(svgClone)

      if (format === 'png') {
        fileData = await toPng(container, {
          width: svgClone.width.baseVal.value,
          height: svgClone.height.baseVal.value,
        })
        qrFolder.file(`${item.filename}.png`, fileData.split(',')[1], { base64: true })
      } else if (format === 'jpeg') {
        fileData = await toJpeg(container, {
          quality: options?.quality || 0.95,
          width: svgClone.width.baseVal.value,
          height: svgClone.height.baseVal.value,
        })
        qrFolder.file(`${item.filename}.jpg`, fileData.split(',')[1], { base64: true })
      } else if (format === 'webp') {
        // Convert via canvas
        const pngData = await toPng(container)
        const canvas = document.createElement('canvas')
        canvas.width = baseSize
        canvas.height = baseSize
        const ctx = canvas.getContext('2d')

        if (ctx) {
          const img = new Image()
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0)
              resolve()
            }
            img.onerror = reject
            img.src = pngData
          })

          const webpData = canvas.toDataURL('image/webp', options?.quality || 0.9)
          qrFolder.file(`${item.filename}.webp`, webpData.split(',')[1], { base64: true })
        }
      }

      document.body.removeChild(container)
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)

    const link = document.createElement('a')
    link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('ZIP export failed:', error)
    throw new Error('Failed to export ZIP')
  }
}

/**
 * Get recommended DPI for different use cases
 */
export function getRecommendedDPI(
  useCase: 'screen' | 'print-draft' | 'print-quality' | 'print-pro'
): number {
  switch (useCase) {
    case 'screen':
      return 72
    case 'print-draft':
      return 150
    case 'print-quality':
      return 300
    case 'print-pro':
      return 600
    default:
      return 300
  }
}

/**
 * Estimate file size for different formats
 */
export function estimateFileSize(
  size: number,
  format: ExportFormat,
  dpi = 300
): { value: number; unit: string } {
  const pixelCount = (size * (dpi / 72)) ** 2
  let bytes = 0

  switch (format) {
    case 'png':
      bytes = pixelCount * 0.8 // PNG compression ~80%
      break
    case 'jpeg':
      bytes = pixelCount * 0.15 // JPEG high compression ~15%
      break
    case 'webp':
      bytes = pixelCount * 0.12 // WebP better compression ~12%
      break
    case 'svg':
      bytes = size * 50 // SVG roughly 50 bytes per pixel dimension
      break
    case 'pdf':
      bytes = pixelCount * 0.5 + 50000 // PDF with overhead
      break
  }

  if (bytes < 1024) {
    return { value: Math.round(bytes), unit: 'B' }
  }
  if (bytes < 1024 * 1024) {
    return { value: Math.round(bytes / 1024), unit: 'KB' }
  }
  return { value: Math.round(bytes / (1024 * 1024)), unit: 'MB' }
}
