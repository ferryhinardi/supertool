import * as tls from 'node:tls'
import { type NextRequest, NextResponse } from 'next/server'

interface SSLCertificate {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  daysUntilExpiry: number
  serialNumber: string
  signatureAlgorithm: string
  keySize: number
  protocol: string
  san: string[]
}

interface SSLCheckResult {
  valid: boolean
  certificate: SSLCertificate | null
  securityScore: number
  warnings: string[]
  recommendations: string[]
  error?: string
}

/**
 * Calculate security score based on certificate and TLS configuration
 */
function calculateSecurityScore(
  cert: tls.DetailedPeerCertificate,
  protocol: string,
  daysUntilExpiry: number
): number {
  let score = 100

  // Expiry check (0-30 points)
  if (daysUntilExpiry <= 0) {
    score -= 30
  } else if (daysUntilExpiry <= 7) {
    score -= 20
  } else if (daysUntilExpiry <= 30) {
    score -= 10
  }

  // Protocol check (0-25 points)
  if (protocol === 'TLSv1.3') {
    score -= 0
  } else if (protocol === 'TLSv1.2') {
    score -= 10
  } else {
    score -= 25
  }

  // Key size check (0-20 points)
  const keySize = cert.bits || 0
  if (keySize < 2048) {
    score -= 20
  } else if (keySize < 4096) {
    score -= 5
  }

  // Signature algorithm (0-25 points)
  const sigAlg = cert.asn1Curve || ''
  if (sigAlg.toLowerCase().includes('sha1')) {
    score -= 25
  } else if (!sigAlg.toLowerCase().includes('sha256') && !sigAlg.toLowerCase().includes('sha384')) {
    score -= 10
  }

  return Math.max(0, score)
}

/**
 * Generate warnings based on certificate analysis
 */
function generateWarnings(
  cert: tls.DetailedPeerCertificate,
  protocol: string,
  daysUntilExpiry: number
): string[] {
  const warnings: string[] = []

  if (daysUntilExpiry <= 30) {
    warnings.push(`Certificate expires in ${daysUntilExpiry} days`)
  }

  if (daysUntilExpiry <= 0) {
    warnings.push('Certificate has expired')
  }

  if (protocol !== 'TLSv1.3' && protocol !== 'TLSv1.2') {
    warnings.push(`Using outdated TLS protocol: ${protocol}`)
  }

  const keySize = cert.bits || 0
  if (keySize < 2048) {
    warnings.push(`Weak encryption key size: ${keySize} bits`)
  }

  const sigAlg = cert.asn1Curve || ''
  if (sigAlg.toLowerCase().includes('sha1')) {
    warnings.push('Using deprecated SHA-1 signature algorithm')
  }

  return warnings
}

/**
 * Generate security recommendations
 */
function generateRecommendations(
  cert: tls.DetailedPeerCertificate,
  protocol: string,
  daysUntilExpiry: number
): string[] {
  const recommendations: string[] = []

  if (daysUntilExpiry <= 30) {
    recommendations.push('Renew certificate before expiry to avoid service disruption')
  }

  if (protocol !== 'TLSv1.3') {
    recommendations.push('Upgrade to TLS 1.3 for better security and performance')
  }

  const keySize = cert.bits || 0
  if (keySize < 4096) {
    recommendations.push('Consider using 4096-bit RSA keys for enhanced security')
  }

  if (protocol !== 'TLSv1.3' && protocol !== 'TLSv1.2') {
    recommendations.push('Disable support for TLS 1.0 and TLS 1.1 immediately')
  }

  recommendations.push('Enable HTTP Strict Transport Security (HSTS) headers')
  recommendations.push("Set up automated certificate renewal with Let's Encrypt or similar")
  recommendations.push('Monitor certificate expiration and set up alerts')

  return recommendations
}

/**
 * Extract Subject Alternative Names from certificate
 */
function extractSAN(cert: tls.DetailedPeerCertificate): string[] {
  const san: string[] = []

  if (cert.subjectaltname) {
    const parts = cert.subjectaltname.split(', ')
    for (const part of parts) {
      if (part.startsWith('DNS:')) {
        san.push(part.substring(4))
      } else if (part.startsWith('IP Address:')) {
        san.push(part.substring(11))
      }
    }
  }

  return san
}

/**
 * POST /api/ssl-check
 * Check SSL/TLS certificate for a domain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain } = body as { domain: string }

    // Validate domain
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        {
          valid: false,
          certificate: null,
          securityScore: 0,
          warnings: [],
          recommendations: [],
          error: 'Invalid domain provided',
        } satisfies SSLCheckResult,
        { status: 400 }
      )
    }

    // Remove protocol, path, and port from domain
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
      .split('/')[0]
      .trim()

    if (!cleanDomain) {
      return NextResponse.json(
        {
          valid: false,
          certificate: null,
          securityScore: 0,
          warnings: [],
          recommendations: [],
          error: 'Invalid domain format',
        } satisfies SSLCheckResult,
        { status: 400 }
      )
    }

    // Connect to domain and retrieve certificate
    const result = await new Promise<SSLCheckResult>((resolve) => {
      const socket = tls.connect(
        443,
        cleanDomain,
        {
          servername: cleanDomain,
          rejectUnauthorized: false, // Allow self-signed certs for analysis
        },
        () => {
          const cert = socket.getPeerCertificate(true)
          const protocol = socket.getProtocol() || 'unknown'

          if (!cert || Object.keys(cert).length === 0) {
            socket.end()
            resolve({
              valid: false,
              certificate: null,
              securityScore: 0,
              warnings: ['Unable to retrieve certificate'],
              recommendations: ['Verify that the domain has a valid SSL certificate'],
              error: 'No certificate found',
            })
            return
          }

          // Parse certificate dates
          const validFrom = cert.valid_from
          const validTo = cert.valid_to
          const expiryDate = new Date(validTo)
          const now = new Date()
          const daysUntilExpiry = Math.floor(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )

          // Extract certificate information
          const subject =
            typeof cert.subject === 'object'
              ? cert.subject.CN || JSON.stringify(cert.subject)
              : String(cert.subject)

          const issuer =
            typeof cert.issuer === 'object'
              ? cert.issuer.CN || JSON.stringify(cert.issuer)
              : String(cert.issuer)

          const certificate: SSLCertificate = {
            subject,
            issuer,
            validFrom,
            validTo,
            daysUntilExpiry,
            serialNumber: cert.serialNumber || 'N/A',
            signatureAlgorithm: cert.asn1Curve || 'N/A',
            keySize: cert.bits || 0,
            protocol,
            san: extractSAN(cert),
          }

          // Calculate security score
          const securityScore = calculateSecurityScore(cert, protocol, daysUntilExpiry)

          // Generate warnings and recommendations
          const warnings = generateWarnings(cert, protocol, daysUntilExpiry)
          const recommendations = generateRecommendations(cert, protocol, daysUntilExpiry)

          socket.end()

          resolve({
            valid: daysUntilExpiry > 0,
            certificate,
            securityScore,
            warnings,
            recommendations,
          })
        }
      )

      socket.on('error', (err) => {
        socket.destroy()
        resolve({
          valid: false,
          certificate: null,
          securityScore: 0,
          warnings: [`Connection error: ${err.message}`],
          recommendations: [
            'Verify the domain is accessible',
            'Check if SSL/TLS is properly configured',
            'Ensure port 443 is open',
          ],
          error: err.message,
        })
      })

      socket.setTimeout(10000)
      socket.on('timeout', () => {
        socket.destroy()
        resolve({
          valid: false,
          certificate: null,
          securityScore: 0,
          warnings: ['Connection timeout'],
          recommendations: ['Check if the domain is accessible', 'Verify firewall settings'],
          error: 'Connection timeout after 10 seconds',
        })
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[SSL Check Error]', error)
    return NextResponse.json(
      {
        valid: false,
        certificate: null,
        securityScore: 0,
        warnings: ['Failed to check SSL certificate'],
        recommendations: ['Try again or verify domain is correct'],
        error: error instanceof Error ? error.message : 'Unknown error',
      } satisfies SSLCheckResult,
      { status: 500 }
    )
  }
}
