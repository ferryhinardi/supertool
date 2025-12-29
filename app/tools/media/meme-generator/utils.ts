import type { MemeConfig, TextBox } from './types'

/**
 * Load an image from URL or File
 */
export function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))

    if (typeof source === 'string') {
      img.src = source
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(source)
    }
  })
}

/**
 * Render text on canvas with proper styling
 */
export function renderTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  textBox: TextBox,
  canvasWidth: number,
  canvasHeight: number
) {
  const { text, x, y, fontSize, fontFamily, color, strokeColor, strokeWidth, align, uppercase } =
    textBox

  const displayText = uppercase ? text.toUpperCase() : text
  const xPos = (x / 100) * canvasWidth
  const yPos = (y / 100) * canvasHeight

  // Set font
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textAlign = align
  ctx.textBaseline = 'top'

  // Add shadow for readability
  if (textBox.shadowEnabled) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  }

  // Draw stroke (outline)
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2
    ctx.strokeText(displayText, xPos, yPos)
  }

  // Draw fill text
  ctx.fillStyle = color
  ctx.fillText(displayText, xPos, yPos)

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Wrap text to fit within canvas width
 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(`${currentLine} ${word}`).width
    if (width < maxWidth) {
      currentLine += ` ${word}`
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

/**
 * Generate meme image from config
 */
export async function generateMeme(config: MemeConfig): Promise<string> {
  const { template, customImage, textBoxes, canvasWidth, canvasHeight } = config

  // Create canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  // Set canvas size
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // Load and draw base image
  const imageSource = customImage || template?.imageUrl
  if (!imageSource) throw new Error('No image source provided')

  const img = await loadImage(imageSource)

  // Draw image to fit canvas
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

  // Draw text boxes
  for (const textBox of textBoxes) {
    if (textBox.text.trim()) {
      renderTextOnCanvas(ctx, textBox, canvasWidth, canvasHeight)
    }
  }

  // Return as data URL
  return canvas.toDataURL('image/png')
}

/**
 * Download meme as image file
 */
export function downloadMeme(dataUrl: string, filename = 'meme.png') {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Calculate optimal font size based on canvas dimensions
 */
export function calculateOptimalFontSize(canvasWidth: number): number {
  // Base calculation: 5% of canvas width
  return Math.max(20, Math.min(72, canvasWidth * 0.05))
}

/**
 * Get text box preset positions
 */
export function getPresetPosition(position: 'top' | 'middle' | 'bottom' | 'custom'): { y: number } {
  switch (position) {
    case 'top':
      return { y: 5 }
    case 'middle':
      return { y: 45 }
    case 'bottom':
      return { y: 85 }
    default:
      return { y: 50 }
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' }
  }

  return { valid: true }
}

/**
 * Create default text boxes for template
 */
export function createDefaultTextBoxes(boxCount: number): TextBox[] {
  const boxes: TextBox[] = []

  if (boxCount >= 1) {
    boxes.push({
      id: 'top',
      text: '',
      position: 'top',
      x: 50,
      y: 5,
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      align: 'center',
      uppercase: true,
      shadowEnabled: true,
      rotation: 0,
    })
  }

  if (boxCount >= 2) {
    boxes.push({
      id: 'bottom',
      text: '',
      position: 'bottom',
      x: 50,
      y: 85,
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      align: 'center',
      uppercase: true,
      shadowEnabled: true,
      rotation: 0,
    })
  }

  // Add middle box if needed
  if (boxCount >= 3) {
    boxes.push({
      id: 'middle',
      text: '',
      position: 'middle',
      x: 50,
      y: 45,
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      align: 'center',
      uppercase: true,
      shadowEnabled: true,
      rotation: 0,
    })
  }

  return boxes
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}
