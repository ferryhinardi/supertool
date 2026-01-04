import * as jose from 'jose'

export type JWTAlgorithm = 'HS256' | 'HS384' | 'HS512'

export interface DecodedJWT {
  isValid: boolean
  header?: jose.JWTHeaderParameters
  payload?: jose.JWTPayload
  signature?: string
  error?: string
  claims?: {
    iss?: string
    sub?: string
    aud?: string | string[]
    exp?: number
    nbf?: number
    iat?: number
    jti?: string
    isExpired?: boolean
  }
}

export interface JWTHistoryData {
  token: string
  algorithm: JWTAlgorithm
  payload: jose.JWTPayload
  isExpired: boolean
}

/**
 * Decode a JWT token without verification
 */
export function decodeJWT(token: string): DecodedJWT {
  try {
    // Validate basic structure
    const parts = token.split('.')
    if (parts.length !== 3) {
      return {
        isValid: false,
        error: 'Invalid JWT format: must have 3 parts separated by dots',
      }
    }

    // Decode header
    const headerB64 = parts[0]
    const header = JSON.parse(
      atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'))
    ) as jose.JWTHeaderParameters

    // Decode payload
    const payloadB64 = parts[1]
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    ) as jose.JWTPayload

    // Extract signature
    const signature = parts[2]

    // Extract standard claims
    const claims = {
      iss: payload.iss,
      sub: payload.sub,
      aud: payload.aud,
      exp: payload.exp,
      nbf: payload.nbf,
      iat: payload.iat,
      jti: payload.jti,
      isExpired: payload.exp ? Date.now() / 1000 > payload.exp : false,
    }

    return {
      isValid: true,
      header,
      payload,
      signature,
      claims,
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to decode JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Verify a JWT token with a secret
 */
export async function verifyJWT(
  token: string,
  secret: string,
  algorithm: JWTAlgorithm = 'HS256'
): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Create secret key - use SubtleCrypto API for browser compatibility
    const secretKey = new TextEncoder().encode(secret)

    // Import key using SubtleCrypto for jsdom/browser environment compatibility
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: { name: `SHA-${algorithm.slice(2)}` } },
      false,
      ['verify']
    )

    // Verify the token
    await jose.jwtVerify(token, cryptoKey, {
      algorithms: [algorithm],
    })

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

/**
 * Generate a JWT token
 */
export async function generateJWT(
  payload: jose.JWTPayload,
  secret: string,
  algorithm: JWTAlgorithm = 'HS256'
): Promise<string> {
  try {
    // Create secret key
    const secretKey = new TextEncoder().encode(secret)

    // Create JWT
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: algorithm, typ: 'JWT' })
      .setIssuedAt()
      .sign(secretKey)

    return jwt
  } catch (error) {
    throw new Error(
      `Failed to generate JWT: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Sample JWT tokens for testing
 */
export const SAMPLE_TOKENS = [
  {
    name: 'Valid HS256',
    algorithm: 'HS256',
    secret: 'your-256-bit-secret',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  {
    name: 'With Expiration',
    algorithm: 'HS256',
    secret: 'secret-key',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkphbmUgU21pdGgiLCJpYXQiOjE3MzE1NjAwMDAsImV4cCI6MTczMTU2MzYwMH0.ZvHfJvQvJkH3d8OB5LqGxY8xqz_2Xz1KFdLqGxYzKxY',
  },
  {
    name: 'With Claims',
    algorithm: 'HS256',
    secret: 'secret-key',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.XQBO4LchfjTmGNT_DMJlQxsb_cCJ3p7RwPjBwTpGvZ8',
  },
] as const

/**
 * Validate JWT claims
 */
export function validateClaims(payload: jose.JWTPayload): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check expiration
  if (payload.exp) {
    const now = Date.now() / 1000
    if (now > payload.exp) {
      errors.push('Token has expired')
    } else if (now > payload.exp - 300) {
      // Within 5 minutes of expiration
      warnings.push('Token will expire soon')
    }
  }

  // Check not before
  if (payload.nbf) {
    const now = Date.now() / 1000
    if (now < payload.nbf) {
      errors.push('Token is not yet valid (nbf claim)')
    }
  }

  // Check issued at
  if (payload.iat) {
    const now = Date.now() / 1000
    if (payload.iat > now) {
      warnings.push('Token issued in the future')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
