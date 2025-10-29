/**
 * Encryption & Decryption Utilities using Web Crypto API (AES-256-GCM)
 * All encryption happens client-side for maximum security
 */

export interface EncryptionResult {
  encrypted: string // Base64 encoded encrypted data
  iv: string // Base64 encoded initialization vector
  salt: string // Base64 encoded salt for key derivation
}

export interface PasswordStrength {
  score: number // 0-4
  label: string // 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  color: string // Color for UI display
  suggestions: string[]
}

/**
 * Derive a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
    'deriveBits',
    'deriveKey',
  ])

  // Derive AES-256 key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt text with AES-256-GCM
 */
export async function encryptText(plaintext: string, password: string): Promise<EncryptionResult> {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty')
  }
  if (!password) {
    throw new Error('Password cannot be empty')
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Derive key from password
  const key = await deriveKey(password, salt)

  // Encrypt data
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  // Convert to base64 for easy storage/transport
  return {
    encrypted: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  }
}

/**
 * Decrypt text with AES-256-GCM
 */
export async function decryptText(
  encrypted: string,
  iv: string,
  salt: string,
  password: string
): Promise<string> {
  if (!encrypted || !iv || !salt) {
    throw new Error('Missing encryption data')
  }
  if (!password) {
    throw new Error('Password cannot be empty')
  }

  try {
    // Convert from base64
    const encryptedBuffer = base64ToArrayBuffer(encrypted)
    const ivBuffer = base64ToArrayBuffer(iv)
    const saltBuffer = base64ToArrayBuffer(salt)

    // Derive key from password
    const key = await deriveKey(password, new Uint8Array(saltBuffer))

    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
      key,
      encryptedBuffer
    )

    // Convert back to text
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch {
    throw new Error('Decryption failed. Incorrect password or corrupted data.')
  }
}

/**
 * Encrypt file data
 */
export async function encryptFile(
  fileData: ArrayBuffer,
  password: string
): Promise<EncryptionResult> {
  if (!fileData || fileData.byteLength === 0) {
    throw new Error('File data cannot be empty')
  }
  if (!password) {
    throw new Error('Password cannot be empty')
  }

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Derive key from password
  const key = await deriveKey(password, salt)

  // Encrypt file data - ensure we have a proper ArrayBuffer view
  const dataView = fileData instanceof ArrayBuffer ? new Uint8Array(fileData) : fileData
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataView)

  return {
    encrypted: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  }
}

/**
 * Decrypt file data
 */
export async function decryptFile(
  encrypted: string,
  iv: string,
  salt: string,
  password: string
): Promise<ArrayBuffer> {
  if (!encrypted || !iv || !salt) {
    throw new Error('Missing encryption data')
  }
  if (!password) {
    throw new Error('Password cannot be empty')
  }

  try {
    // Convert from base64
    const encryptedBuffer = base64ToArrayBuffer(encrypted)
    const ivBuffer = base64ToArrayBuffer(iv)
    const saltBuffer = base64ToArrayBuffer(salt)

    // Derive key from password
    const key = await deriveKey(password, new Uint8Array(saltBuffer))

    // Decrypt file data - wrap in Uint8Array for Node.js compatibility
    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
      key,
      new Uint8Array(encryptedBuffer)
    )
  } catch {
    throw new Error('Decryption failed. Incorrect password or corrupted data.')
  }
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'red.500',
      suggestions: ['Enter a password'],
    }
  }

  let score = 0
  const suggestions: string[] = []

  // Length check (most important factor)
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (password.length < 8) suggestions.push('Use at least 8 characters')

  // Character variety
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

  if (varietyCount >= 3) score++
  if (!hasLower || !hasUpper) suggestions.push('Mix uppercase and lowercase')
  if (!hasNumber) suggestions.push('Add numbers')
  if (!hasSpecial) suggestions.push('Add special characters')

  // Common patterns (reduce score)
  const commonPatterns = [/^123/, /password/i, /qwerty/i, /abc/i, /111/, /^(.)\1+$/] // repeated chars
  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 1)
    suggestions.push('Avoid common patterns')
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, score))

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['red.500', 'orange.500', 'yellow.500', 'green.500', 'emerald.500']

  return {
    score,
    label: labels[score],
    color: colors[score],
    suggestions: suggestions.slice(0, 3), // Max 3 suggestions
  }
}

/**
 * Create shareable encrypted link
 */
export function createEncryptedLink(result: EncryptionResult): string {
  const data = {
    e: result.encrypted,
    i: result.iv,
    s: result.salt,
  }
  const encoded = btoa(JSON.stringify(data))
  return `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encoded)}`
}

/**
 * Parse encrypted link
 */
export function parseEncryptedLink(url: string): EncryptionResult | null {
  try {
    const urlObj = new URL(url)
    const dataParam = urlObj.searchParams.get('data')
    if (!dataParam) return null

    const decoded = JSON.parse(atob(decodeURIComponent(dataParam)))
    return {
      encrypted: decoded.e,
      iv: decoded.i,
      salt: decoded.s,
    }
  } catch {
    return null
  }
}

/**
 * Helper: ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Helper: Base64 to ArrayBuffer
 * Returns a properly aligned ArrayBuffer for Web Crypto API compatibility
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  // Return a new ArrayBuffer copy to ensure proper alignment in Node.js
  return bytes.buffer.slice(0)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}
