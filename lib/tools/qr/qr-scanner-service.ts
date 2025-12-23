import { Html5Qrcode } from 'html5-qrcode'

/**
 * QR Scanner Service
 * Provides QR code scanning from webcam and file upload,
 * plus validation and scannability testing features.
 */

// Scanner state type
export type ScannerState = 'idle' | 'scanning' | 'success' | 'error'

// Scan result type
export interface ScanResult {
  data: string
  timestamp: number
  format?: string
  type?: 'webcam' | 'file'
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  score: number // 0-100
  issues: string[]
  recommendations: string[]
  details: {
    hasValidContent: boolean
    hasGoodContrast: boolean
    hasAppropriateSize: boolean
    hasErrorCorrection: boolean
    estimatedScanDistance: string
  }
}

/**
 * Initialize and start webcam scanning
 */
export async function startWebcamScanner(
  elementId: string,
  onSuccess: (result: ScanResult) => void,
  onError: (error: string) => void
): Promise<Html5Qrcode> {
  try {
    const html5QrCode = new Html5Qrcode(elementId)

    // Get available cameras
    const devices = await Html5Qrcode.getCameras()
    if (!devices || devices.length === 0) {
      throw new Error('No cameras found')
    }

    // Prefer back camera on mobile devices
    const preferredCamera =
      devices.find((device) => device.label.toLowerCase().includes('back')) || devices[0]

    // Start scanning with configuration
    await html5QrCode.start(
      preferredCamera.id,
      {
        fps: 10, // Frames per second
        qrbox: { width: 250, height: 250 }, // Scanning area
        aspectRatio: 1.0,
      },
      (decodedText, decodedResult) => {
        // Success callback
        onSuccess({
          data: decodedText,
          timestamp: Date.now(),
          format: decodedResult.result.format?.formatName,
          type: 'webcam',
        })
      },
      (errorMessage) => {
        // Error callback (can be ignored for most cases - happens when no QR is detected)
        // Only log actual errors, not "No QR code found" messages
        if (!errorMessage.includes('NotFoundException')) {
          console.warn('QR Scanner:', errorMessage)
        }
      }
    )

    return html5QrCode
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start camera'
    onError(message)
    throw error
  }
}

/**
 * Stop webcam scanning
 */
export async function stopWebcamScanner(scanner: Html5Qrcode): Promise<void> {
  try {
    if (scanner.isScanning) {
      await scanner.stop()
    }
  } catch (error) {
    console.error('Error stopping scanner:', error)
  }
}

/**
 * Scan QR code from uploaded file
 */
export async function scanFromFile(
  file: File,
  onSuccess: (result: ScanResult) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Create temporary scanner instance
    const html5QrCode = new Html5Qrcode('qr-scanner-file-temp')

    const result = await html5QrCode.scanFile(file, true)

    onSuccess({
      data: result,
      timestamp: Date.now(),
      type: 'file',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scan QR code from file'
    onError(message)
  }
}

/**
 * Scan QR code from image URL (for validation)
 */
export async function scanFromImageUrl(imageUrl: string): Promise<string | null> {
  try {
    // Create a temporary image element
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    // Create canvas and draw image
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')

    ctx.drawImage(img, 0, 0)

    // Try to decode QR code
    const html5QrCode = new Html5Qrcode('qr-scanner-validation-temp')
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error('Failed to create blob'))
      })
    })

    const file = new File([blob], 'qr-validation.png', { type: 'image/png' })
    const result = await html5QrCode.scanFile(file, false)

    return result
  } catch (error) {
    console.error('Failed to scan from image URL:', error)
    return null
  }
}

/**
 * Validate QR code scannability
 */
export function validateQRCode(qrElement: SVGSVGElement | HTMLCanvasElement): ValidationResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Get QR code dimensions
  const width = qrElement instanceof SVGSVGElement ? qrElement.width.baseVal.value : qrElement.width
  const height =
    qrElement instanceof SVGSVGElement ? qrElement.height.baseVal.value : qrElement.height

  // Check size
  const hasAppropriateSize = width >= 200 && height >= 200
  if (!hasAppropriateSize) {
    issues.push('QR code size is too small (minimum 200px recommended)')
    recommendations.push('Increase QR code size to at least 200px for better scannability')
    score -= 20
  }

  // Check contrast (for SVG elements)
  let hasGoodContrast = true
  if (qrElement instanceof SVGSVGElement) {
    const paths = qrElement.querySelectorAll('path')
    if (paths.length > 0) {
      const fgColor = paths[0].getAttribute('fill') || '#000000'
      const bgRect = qrElement.querySelector('rect')
      const bgColor = bgRect?.getAttribute('fill') || '#FFFFFF'

      // Simple contrast check - dark foreground, light background
      const fgBrightness = getBrightness(fgColor)
      const bgBrightness = getBrightness(bgColor)
      hasGoodContrast = Math.abs(fgBrightness - bgBrightness) > 128

      if (!hasGoodContrast) {
        issues.push('Insufficient contrast between foreground and background colors')
        recommendations.push(
          'Use dark colors for the QR pattern and light colors for the background'
        )
        score -= 30
      }
    }
  }

  // Estimate scan distance based on size
  let estimatedScanDistance = 'Unknown'
  if (width >= 512) {
    estimatedScanDistance = 'Up to 10 feet (3 meters)'
  } else if (width >= 384) {
    estimatedScanDistance = 'Up to 6 feet (2 meters)'
  } else if (width >= 256) {
    estimatedScanDistance = 'Up to 3 feet (1 meter)'
  } else if (width >= 128) {
    estimatedScanDistance = 'Up to 1.5 feet (0.5 meters)'
  } else {
    estimatedScanDistance = 'Very close range only'
    issues.push('QR code may be too small for practical scanning distances')
    recommendations.push('Increase size for better scanning at reasonable distances')
    score -= 15
  }

  // Check error correction (assume medium by default)
  const hasErrorCorrection = true

  // General recommendations
  if (score === 100) {
    recommendations.push('QR code looks great! Should scan reliably in most conditions.')
  } else if (score >= 80) {
    recommendations.push('QR code should scan well in normal conditions.')
  } else if (score >= 60) {
    recommendations.push(
      'QR code may have scanning issues in some conditions. Consider the recommendations above.'
    )
  } else {
    recommendations.push(
      'QR code has significant issues. Please address the problems listed to ensure reliable scanning.'
    )
  }

  // Add general best practices
  if (score < 100) {
    recommendations.push('Test your QR code with multiple devices before mass production')
    recommendations.push('Print test samples to verify scannability in real-world conditions')
  }

  return {
    isValid: score >= 60,
    score: Math.max(0, score),
    issues,
    recommendations,
    details: {
      hasValidContent: true,
      hasGoodContrast,
      hasAppropriateSize,
      hasErrorCorrection,
      estimatedScanDistance,
    },
  }
}

/**
 * Calculate brightness of a hex color
 */
function getBrightness(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Parse RGB values
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Calculate perceived brightness (ITU-R BT.709)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Get recommended settings based on use case
 */
export function getRecommendedSettings(useCase: string): {
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  description: string
} {
  switch (useCase) {
    case 'business-card':
      return {
        size: 300,
        errorCorrection: 'H',
        description: 'Business cards require smaller sizes with high error correction',
      }
    case 'poster':
      return {
        size: 512,
        errorCorrection: 'M',
        description: 'Posters can use larger sizes for scanning from a distance',
      }
    case 'product-label':
      return {
        size: 256,
        errorCorrection: 'Q',
        description: 'Product labels need medium size with good error correction',
      }
    case 'digital':
      return {
        size: 256,
        errorCorrection: 'M',
        description: 'Digital displays work well with medium settings',
      }
    case 'outdoor':
      return {
        size: 384,
        errorCorrection: 'H',
        description: 'Outdoor use requires larger size and high error correction',
      }
    default:
      return {
        size: 256,
        errorCorrection: 'M',
        description: 'General purpose settings',
      }
  }
}

/**
 * Parse scanned QR code data and identify type
 */
export function parseQRData(data: string): {
  type: string
  parsed: Record<string, string>
  displayText: string
} {
  // Check for URL
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return {
      type: 'URL',
      parsed: { url: data },
      displayText: data,
    }
  }

  // Check for WiFi
  if (data.startsWith('WIFI:')) {
    const wifi = parseWiFiString(data)
    return {
      type: 'WiFi',
      parsed: wifi,
      displayText: `WiFi: ${wifi.ssid || 'Unknown Network'}`,
    }
  }

  // Check for vCard
  if (data.startsWith('BEGIN:VCARD')) {
    const vcard = parseVCardString(data)
    return {
      type: 'vCard',
      parsed: vcard,
      displayText: `Contact: ${vcard.name || 'Unknown'}`,
    }
  }

  // Check for email
  if (data.startsWith('mailto:')) {
    return {
      type: 'Email',
      parsed: { email: data.replace('mailto:', '') },
      displayText: data.replace('mailto:', ''),
    }
  }

  // Check for phone
  if (data.startsWith('tel:')) {
    return {
      type: 'Phone',
      parsed: { phone: data.replace('tel:', '') },
      displayText: data.replace('tel:', ''),
    }
  }

  // Check for SMS
  if (data.startsWith('sms:') || data.startsWith('smsto:')) {
    return {
      type: 'SMS',
      parsed: { phone: data.replace(/^sms(to)?:/, '') },
      displayText: data.replace(/^sms(to)?:/, ''),
    }
  }

  // Plain text
  return {
    type: 'Text',
    parsed: { text: data },
    displayText: data,
  }
}

/**
 * Parse WiFi QR code data
 */
function parseWiFiString(data: string): Record<string, string> {
  const result: Record<string, string> = {}

  // Format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
  const matches = data.match(/T:([^;]*);?|S:([^;]*);?|P:([^;]*);?|H:([^;]*);?/g)

  if (matches) {
    for (const match of matches) {
      const [key, value] = match.split(':')
      if (key === 'T') result.encryption = value.replace(';', '')
      if (key === 'S') result.ssid = value.replace(';', '')
      if (key === 'P') result.password = value.replace(';', '')
      if (key === 'H') result.hidden = value.replace(';', '')
    }
  }

  return result
}

/**
 * Parse vCard QR code data
 */
function parseVCardString(data: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = data.split('\n')

  for (const line of lines) {
    if (line.startsWith('FN:')) result.name = line.substring(3).trim()
    if (line.startsWith('ORG:')) result.organization = line.substring(4).trim()
    if (line.startsWith('TEL:')) result.phone = line.substring(4).trim()
    if (line.startsWith('EMAIL:')) result.email = line.substring(6).trim()
    if (line.startsWith('URL:')) result.url = line.substring(4).trim()
    if (line.startsWith('ADR:')) result.address = line.substring(4).trim()
  }

  return result
}
