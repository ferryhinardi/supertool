// TypeScript types and utilities for JWT Debugger

export interface JWTHeader {
  alg: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

export interface JWTPayload {
  iss?: string // Issuer
  sub?: string // Subject
  aud?: string | string[] // Audience
  exp?: number // Expiration time
  nbf?: number // Not before
  iat?: number // Issued at
  jti?: string // JWT ID
  [key: string]: unknown
}

export interface DecodedJWT {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  raw: {
    header: string
    payload: string
    signature: string
  }
}

export type JWTAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'PS256'
  | 'PS384'
  | 'PS512'

export const JWT_ALGORITHMS: Array<{ value: JWTAlgorithm; label: string; type: string }> = [
  { value: 'HS256', label: 'HS256 (HMAC + SHA256)', type: 'symmetric' },
  { value: 'HS384', label: 'HS384 (HMAC + SHA384)', type: 'symmetric' },
  { value: 'HS512', label: 'HS512 (HMAC + SHA512)', type: 'symmetric' },
  { value: 'RS256', label: 'RS256 (RSA + SHA256)', type: 'asymmetric' },
  { value: 'RS384', label: 'RS384 (RSA + SHA384)', type: 'asymmetric' },
  { value: 'RS512', label: 'RS512 (RSA + SHA512)', type: 'asymmetric' },
  { value: 'ES256', label: 'ES256 (ECDSA + SHA256)', type: 'asymmetric' },
  { value: 'ES384', label: 'ES384 (ECDSA + SHA384)', type: 'asymmetric' },
  { value: 'ES512', label: 'ES512 (ECDSA + SHA512)', type: 'asymmetric' },
  { value: 'PS256', label: 'PS256 (RSA-PSS + SHA256)', type: 'asymmetric' },
  { value: 'PS384', label: 'PS384 (RSA-PSS + SHA384)', type: 'asymmetric' },
  { value: 'PS512', label: 'PS512 (RSA-PSS + SHA512)', type: 'asymmetric' },
]

/**
 * Decode JWT without verification
 */
export function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format: must have 3 parts')
    }

    const [headerB64, payloadB64, signatureB64] = parts

    // Decode header
    const headerJson = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'))
    const header = JSON.parse(headerJson) as JWTHeader

    // Decode payload
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson) as JWTPayload

    return {
      header,
      payload,
      signature: signatureB64,
      raw: {
        header: headerB64,
        payload: payloadB64,
        signature: signatureB64,
      },
    }
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Check if JWT is expired
 */
export function isExpired(exp?: number): boolean {
  if (!exp) return false
  return Date.now() >= exp * 1000
}

/**
 * Get time until expiration
 */
export function getTimeUntilExpiration(exp?: number): string {
  if (!exp) return 'No expiration'

  const now = Date.now()
  const expMs = exp * 1000
  const diff = expMs - now

  if (diff <= 0) return 'Expired'

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

/**
 * Sample JWT for testing
 */
export const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.4Adcj0qI7Kk_hQc1Z7cYq2FfPPv0w8hQqHq8LnGUZOc'

/**
 * Sample secret for testing
 */
export const SAMPLE_SECRET = 'your-256-bit-secret'

/**
 * Generate default payload
 */
export function generateDefaultPayload(): JWTPayload {
  const now = Math.floor(Date.now() / 1000)
  return {
    sub: '1234567890',
    name: 'John Doe',
    iat: now,
    exp: now + 3600, // 1 hour from now
  }
}

/**
 * Pretty print JSON
 */
export function prettyPrintJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

/**
 * Validate JSON string
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}
