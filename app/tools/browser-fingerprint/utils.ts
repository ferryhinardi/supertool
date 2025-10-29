/**
 * Browser Fingerprint Detection Utilities
 * Collects various browser and device characteristics for fingerprinting
 */

export interface FingerprintData {
  // Basic Browser Info
  userAgent: string
  platform: string
  language: string
  languages: string[]
  cookieEnabled: boolean
  doNotTrack: string | null

  // Screen & Display
  screenResolution: string
  availableScreenResolution: string
  colorDepth: number
  pixelRatio: number
  touchSupport: {
    maxTouchPoints: number
    touchEvent: boolean
    touchStart: boolean
  }

  // Hardware
  hardwareConcurrency: number
  deviceMemory: number | undefined

  // Graphics
  canvas: string
  webgl: {
    vendor: string
    renderer: string
    version: string
    shadingLanguageVersion: string
    unmaskedVendor: string
    unmaskedRenderer: string
  } | null

  // Audio
  audioFingerprint: string

  // Fonts
  fonts: string[]

  // Timezone & Location
  timezone: string
  timezoneOffset: number

  // Storage
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean

  // Browser Features
  plugins: string[]
  mimeTypes: string[]
  adBlocker: boolean
}

/**
 * Generate a hash from string using simple hash algorithm
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get basic browser information
 */
export function getBasicInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || null,
  }
}

/**
 * Get screen and display information
 */
export function getScreenInfo() {
  return {
    screenResolution: `${screen.width}x${screen.height}`,
    availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    touchSupport: {
      maxTouchPoints: navigator.maxTouchPoints || 0,
      touchEvent: 'ontouchstart' in window,
      touchStart: 'ontouchstart' in window,
    },
  }
}

/**
 * Get hardware information
 */
export function getHardwareInfo() {
  return {
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory,
  }
}

/**
 * Generate canvas fingerprint
 */
export function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'unsupported'

    canvas.width = 280
    canvas.height = 60

    // Draw text with different styles
    ctx.textBaseline = 'top'
    ctx.font = '14px "Arial"'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('BrowserPrint 🖨️', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('BrowserPrint 🖨️', 4, 17)

    // Draw shapes
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgb(255,0,255)'
    ctx.beginPath()
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgb(0,255,255)'
    ctx.beginPath()
    ctx.arc(100, 50, 50, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()

    const dataURL = canvas.toDataURL()
    return simpleHash(dataURL)
  } catch (_error) {
    return 'error'
  }
}

/**
 * Get WebGL information
 */
export function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return null

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

    return {
      vendor: gl.getParameter(gl.VENDOR) || '',
      renderer: gl.getParameter(gl.RENDERER) || '',
      version: gl.getParameter(gl.VERSION) || '',
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '',
      unmaskedVendor: debugInfo
        ? gl.getParameter(
            (debugInfo as unknown as { UNMASKED_VENDOR_WEBGL: number }).UNMASKED_VENDOR_WEBGL
          ) || ''
        : 'not available',
      unmaskedRenderer: debugInfo
        ? gl.getParameter(
            (debugInfo as unknown as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL
          ) || ''
        : 'not available',
    }
  } catch (_error) {
    return null
  }
}

/**
 * Generate audio context fingerprint
 */
export function getAudioFingerprint(): string {
  try {
    type AudioContextConstructor = new () => AudioContext
    const AudioContextClass =
      (
        window as unknown as {
          AudioContext?: AudioContextConstructor
          webkitAudioContext?: AudioContextConstructor
        }
      ).AudioContext ||
      (
        window as unknown as {
          AudioContext?: AudioContextConstructor
          webkitAudioContext?: AudioContextConstructor
        }
      ).webkitAudioContext
    if (!AudioContextClass) return 'unsupported'

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const analyser = context.createAnalyser()
    const gainNode = context.createGain()
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1)

    gainNode.gain.value = 0 // Mute

    oscillator.type = 'triangle'
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(0)

    const fingerprint = `${context.sampleRate}-${analyser.frequencyBinCount}`
    oscillator.stop()
    context.close()

    return simpleHash(fingerprint)
  } catch (_error) {
    return 'error'
  }
}

/**
 * Detect installed fonts
 */
export function getInstalledFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testFonts = [
    'Arial',
    'Courier New',
    'Georgia',
    'Times New Roman',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Arial Black',
    'Palatino',
    'Helvetica',
    'Tahoma',
    'Geneva',
    'Monaco',
    'Consolas',
  ]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const text = 'mmmmmmmmmmlli'
  const textSize = '72px'

  // Get base measurements
  const baseMeasurements = baseFonts.map((font) => {
    ctx.font = `${textSize} ${font}`
    return ctx.measureText(text).width
  })

  // Detect which fonts differ from base fonts
  const detectedFonts: string[] = []

  for (const font of testFonts) {
    let detected = false
    for (let i = 0; i < baseFonts.length; i++) {
      ctx.font = `${textSize} '${font}', ${baseFonts[i]}`
      const measurement = ctx.measureText(text).width
      if (measurement !== baseMeasurements[i]) {
        detected = true
        break
      }
    }
    if (detected) {
      detectedFonts.push(font)
    }
  }

  return detectedFonts
}

/**
 * Get timezone information
 */
export function getTimezoneInfo() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
  }
}

/**
 * Check storage availability
 */
export function getStorageInfo() {
  return {
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test')
        sessionStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    })(),
    indexedDB: !!window.indexedDB,
  }
}

/**
 * Get plugins and MIME types
 */
export function getPluginsInfo() {
  return {
    plugins: Array.from(navigator.plugins || []).map((p) => p.name),
    mimeTypes: Array.from(navigator.mimeTypes || []).map((m) => m.type),
  }
}

/**
 * Detect ad blocker
 */
export async function detectAdBlocker(): Promise<boolean> {
  try {
    // Create a bait element that ad blockers typically block
    const bait = document.createElement('div')
    bait.className = 'ad ads adsbox doubleclick ad-placement carbon-ads'
    bait.style.height = '1px'
    bait.style.position = 'absolute'
    bait.style.top = '-9999px'
    document.body.appendChild(bait)

    await new Promise((resolve) => setTimeout(resolve, 100))

    const isBlocked = bait.offsetHeight === 0 || bait.offsetWidth === 0
    document.body.removeChild(bait)

    return isBlocked
  } catch {
    return false
  }
}

/**
 * Collect all fingerprint data
 */
export async function collectFingerprint(): Promise<FingerprintData> {
  const basicInfo = getBasicInfo()
  const screenInfo = getScreenInfo()
  const hardwareInfo = getHardwareInfo()
  const canvas = getCanvasFingerprint()
  const webgl = getWebGLInfo()
  const audioFingerprint = getAudioFingerprint()
  const fonts = getInstalledFonts()
  const timezoneInfo = getTimezoneInfo()
  const storageInfo = getStorageInfo()
  const pluginsInfo = getPluginsInfo()
  const adBlocker = await detectAdBlocker()

  return {
    ...basicInfo,
    ...screenInfo,
    ...hardwareInfo,
    canvas,
    webgl,
    audioFingerprint,
    fonts,
    ...timezoneInfo,
    ...storageInfo,
    ...pluginsInfo,
    adBlocker,
  }
}

/**
 * Generate a unique fingerprint hash from all collected data
 */
export function generateFingerprintHash(data: FingerprintData): string {
  const components = [
    data.userAgent,
    data.platform,
    data.language,
    data.screenResolution,
    data.colorDepth.toString(),
    data.pixelRatio.toString(),
    data.hardwareConcurrency.toString(),
    data.canvas,
    data.audioFingerprint,
    data.fonts.join(','),
    data.timezone,
    JSON.stringify(data.webgl),
  ]

  return simpleHash(components.join('|'))
}

/**
 * Calculate uniqueness score (0-100)
 * Higher score means more unique/trackable
 */
export function calculateUniquenessScore(data: FingerprintData): number {
  let score = 0

  // User Agent (common on similar devices)
  if (data.userAgent) score += 5

  // Screen resolution (fairly unique)
  if (data.screenResolution) score += 10

  // Canvas fingerprint (very unique)
  if (data.canvas && data.canvas !== 'unsupported' && data.canvas !== 'error') score += 20

  // WebGL (very unique)
  if (data.webgl) score += 20

  // Audio fingerprint (unique)
  if (data.audioFingerprint && data.audioFingerprint !== 'unsupported') score += 15

  // Fonts (fairly unique)
  score += Math.min(data.fonts.length * 2, 10)

  // Hardware concurrency (somewhat unique)
  if (data.hardwareConcurrency > 0) score += 5

  // Timezone (not very unique but useful)
  if (data.timezone) score += 5

  // Touch support (adds variation)
  if (data.touchSupport.maxTouchPoints > 0) score += 5

  // Platform (common but useful)
  if (data.platform) score += 5

  return Math.min(score, 100)
}
