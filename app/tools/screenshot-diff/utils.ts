import pixelmatch from 'pixelmatch'

export interface ComparisonResult {
  diffPixels: number
  totalPixels: number
  percentageDiff: number
  diffImageData: ImageData
}

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Load an image file and return its ImageData
 */
export async function loadImageFromFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        // Create canvas to extract ImageData
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        resolve(imageData)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Compare two images and return diff results
 */
export function compareImages(
  img1: ImageData,
  img2: ImageData,
  options: {
    threshold?: number // 0 to 1, default 0.1
    includeAA?: boolean // anti-aliasing detection, default true
  } = {}
): ComparisonResult {
  const { threshold = 0.1, includeAA = true } = options

  // Validate dimensions match
  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error(
      `Image dimensions must match. Image 1: ${img1.width}x${img1.height}, Image 2: ${img2.width}x${img2.height}`
    )
  }

  const { width, height } = img1
  const totalPixels = width * height

  // Create diff image data
  const diffData = new Uint8ClampedArray(width * height * 4)

  // Run pixelmatch comparison
  const diffPixels = pixelmatch(img1.data, img2.data, diffData, width, height, {
    threshold,
    includeAA,
    alpha: 0.1,
    diffColor: [255, 0, 255], // Magenta for diff pixels
  })

  const percentageDiff = (diffPixels / totalPixels) * 100

  // Create ImageData for diff
  const diffImageData = new ImageData(diffData, width, height)

  return {
    diffPixels,
    totalPixels,
    percentageDiff,
    diffImageData,
  }
}

/**
 * Resize image to match target dimensions
 */
export function resizeImage(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Create temporary canvas with original image
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = imageData.width
  tempCanvas.height = imageData.height
  const tempCtx = tempCanvas.getContext('2d')

  if (!tempCtx) {
    throw new Error('Failed to get temp canvas context')
  }

  tempCtx.putImageData(imageData, 0, 0)

  // Resize to target dimensions
  canvas.width = targetWidth
  canvas.height = targetHeight
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)

  return ctx.getImageData(0, 0, targetWidth, targetHeight)
}

/**
 * Get image dimensions without loading full image data
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Convert ImageData to data URL for display
 */
export function imageDataToDataURL(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * Download image as PNG file
 */
export function downloadImage(imageData: ImageData, filename: string): void {
  const dataURL = imageDataToDataURL(imageData)
  const link = document.createElement('a')
  link.href = dataURL
  link.download = filename
  link.click()
}
