/**
 * Favicon Generator Utilities
 * Handles image processing, resizing, and format conversion for favicon generation
 */

export const FAVICON_SIZES = [16, 32, 48, 64, 128, 180] as const
export type FaviconSize = (typeof FAVICON_SIZES)[number]

export interface GeneratedFavicon {
  size: FaviconSize
  dataUrl: string
  blob: Blob
}

/**
 * Loads an image from a file or data URL
 */
export async function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))

    if (typeof source === 'string') {
      img.src = source
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(source)
    }
  })
}

/**
 * Validates if a file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/svg+xml',
    'image/webp',
  ]
  return validTypes.includes(file.type)
}

/**
 * Resizes an image to a specific size using canvas
 */
export async function resizeImage(
  img: HTMLImageElement,
  size: FaviconSize,
  quality = 0.95
): Promise<GeneratedFavicon> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Calculate dimensions to maintain aspect ratio and center the image
  const scale = Math.min(size / img.width, size / img.height)
  const scaledWidth = img.width * scale
  const scaledHeight = img.height * scale
  const x = (size - scaledWidth) / 2
  const y = (size - scaledHeight) / 2

  // Draw the image
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

  // Convert to blob and data URL
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('Failed to create blob'))
      },
      'image/png',
      quality
    )
  })

  const dataUrl = canvas.toDataURL('image/png', quality)

  return { size, dataUrl, blob }
}

/**
 * Generates favicons in all standard sizes
 */
export async function generateFavicons(source: File | string): Promise<GeneratedFavicon[]> {
  const img = await loadImage(source)
  const favicons = await Promise.all(FAVICON_SIZES.map((size) => resizeImage(img, size)))
  return favicons
}

/**
 * Creates an emoji-based favicon
 */
export async function generateEmojiIcon(
  emoji: string,
  size: FaviconSize
): Promise<GeneratedFavicon> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Set background (transparent)
  ctx.clearRect(0, 0, size, size)

  // Draw emoji
  const fontSize = Math.floor(size * 0.75)
  ctx.font = `${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('Failed to create blob'))
      },
      'image/png',
      1
    )
  })

  const dataUrl = canvas.toDataURL('image/png', 1)

  return { size, dataUrl, blob }
}

/**
 * Generates all emoji favicons
 */
export async function generateEmojiFavicons(emoji: string): Promise<GeneratedFavicon[]> {
  const favicons = await Promise.all(FAVICON_SIZES.map((size) => generateEmojiIcon(emoji, size)))
  return favicons
}

/**
 * Creates an ICO file from multiple PNG images
 * ICO format supports multiple sizes in a single file
 */
export async function createIcoFile(favicons: GeneratedFavicon[]): Promise<Blob> {
  // For ICO files, we'll use the standard sizes (16, 32, 48)
  const icoSizes = favicons.filter((f) => [16, 32, 48].includes(f.size))

  // Simple ICO file creation (header + directory + image data)
  const imageDataPromises = icoSizes.map(async (favicon) => {
    const blob = favicon.blob
    const arrayBuffer = await blob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  })

  const imageDataArray = await Promise.all(imageDataPromises)

  // Calculate total file size
  const headerSize = 6 // ICONDIR
  const directorySize = 16 * icoSizes.length // ICONDIRENTRY for each image
  const totalSize =
    headerSize + directorySize + imageDataArray.reduce((sum, data) => sum + data.length, 0)

  // Create buffer
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // Write ICONDIR header
  view.setUint16(0, 0, true) // Reserved (must be 0)
  view.setUint16(2, 1, true) // Type (1 for ICO)
  view.setUint16(4, icoSizes.length, true) // Number of images

  // Write ICONDIRENTRY for each image
  let offset = headerSize + directorySize
  for (let i = 0; i < icoSizes.length; i++) {
    const entryOffset = headerSize + i * 16
    const size = icoSizes[i].size
    const imageData = imageDataArray[i]

    view.setUint8(entryOffset, size) // Width
    view.setUint8(entryOffset + 1, size) // Height
    view.setUint8(entryOffset + 2, 0) // Color palette
    view.setUint8(entryOffset + 3, 0) // Reserved
    view.setUint16(entryOffset + 4, 1, true) // Color planes
    view.setUint16(entryOffset + 6, 32, true) // Bits per pixel
    view.setUint32(entryOffset + 8, imageData.length, true) // Image data size
    view.setUint32(entryOffset + 12, offset, true) // Image data offset

    // Write image data
    bytes.set(imageData, offset)
    offset += imageData.length
  }

  return new Blob([buffer], { type: 'image/x-icon' })
}

/**
 * Generates HTML link tags for favicons
 */
export function generateHtmlTags(sizes: FaviconSize[]): string {
  const tags: string[] = []

  // Standard favicon
  tags.push('<!-- Standard Favicon -->')
  tags.push('<link rel="icon" type="image/x-icon" href="/favicon.ico">')

  // PNG icons for different sizes
  tags.push('\n<!-- PNG Icons -->')
  for (const size of sizes) {
    if (size === 180) {
      tags.push(
        `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/apple-touch-icon.png">`
      )
    } else {
      tags.push(
        `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">`
      )
    }
  }

  return tags.join('\n')
}

/**
 * Creates a ZIP file containing all favicons
 */
export async function createZipFile(_favicons: GeneratedFavicon[], icoBlob: Blob): Promise<Blob> {
  // This is a simple implementation. For production, you might want to use a library like JSZip
  // For now, we'll return the ICO file as the main download
  // In a full implementation, you would bundle all PNGs + ICO + HTML file
  return icoBlob
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
