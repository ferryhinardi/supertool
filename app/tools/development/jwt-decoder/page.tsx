'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Info,
  Key,
  Shield,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface JWTHeader {
  alg?: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}

interface DecodedJWT {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  raw: {
    header: string
    payload: string
    signature: string
  }
}

function JWTDecoderContent() {
  useTrackToolView({
    toolId: 'jwt-decoder',
    title: 'JWT Decoder',
    href: '/tools/development/jwt-decoder',
    iconName: 'Key',
    gradient: 'from-amber-500 to-orange-500',
  })

  const [jwtToken, setJwtToken] = useState('')
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [showSignature, setShowSignature] = useState(false)

  const decodeJWT = (token: string) => {
    try {
      setError(null)

      // Validate JWT structure
      const parts = token.trim().split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.')
      }

      const [headerB64, payloadB64, signature] = parts

      // Decode header
      const headerJson = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'))
      const header = JSON.parse(headerJson) as JWTHeader

      // Decode payload
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
      const payload = JSON.parse(payloadJson) as JWTPayload

      // Check expiration
      if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000)
        const now = new Date()
        setIsExpired(expiryDate < now)
      } else {
        setIsExpired(false)
      }

      const decoded: DecodedJWT = {
        header,
        payload,
        signature,
        raw: {
          header: headerB64,
          payload: payloadB64,
          signature,
        },
      }

      setDecodedJWT(decoded)
      toast.success('JWT decoded successfully!')

      trackToolEvent('jwt_decoder_decode', {
        algorithm: header.alg || 'unknown',
        has_expiry: !!payload.exp,
        is_expired: isExpired,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decode JWT'
      setError(errorMessage)
      setDecodedJWT(null)
      toast.error(errorMessage)
    }
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setJwtToken(value)

    if (value.trim()) {
      decodeJWT(value)
    } else {
      setDecodedJWT(null)
      setError(null)
    }
  }

  const handleClear = () => {
    setJwtToken('')
    setDecodedJWT(null)
    setError(null)
    setIsExpired(false)
    trackToolEvent('jwt_decoder_clear', {})
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
    trackToolEvent('jwt_decoder_copy', { field: label.toLowerCase() })
  }

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const renderJSON = (obj: unknown, depth = 0): React.ReactNode => {
    if (obj === null || obj === undefined) {
      return <span className={css({ color: 'white' })}>null</span>
    }

    if (typeof obj !== 'object') {
      const color =
        typeof obj === 'string'
          ? 'green.400'
          : typeof obj === 'number'
            ? 'blue.400'
            : typeof obj === 'boolean'
              ? 'purple.400'
              : 'gray.400'

      return (
        <span className={css({ color })}>{typeof obj === 'string' ? `"${obj}"` : String(obj)}</span>
      )
    }

    if (Array.isArray(obj)) {
      return (
        <div className={css({ pl: depth > 0 ? '4' : '0' })}>
          <span className={css({ color: 'white' })}>[</span>
          {obj.map((item, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: array items have no unique identifier
            <div key={`arr-item-${depth}-${idx}`} className={css({ pl: '4' })}>
              {renderJSON(item, depth + 1)}
              {idx < obj.length - 1 && <span className={css({ color: 'white' })}>,</span>}
            </div>
          ))}
          <span className={css({ color: 'white' })}>]</span>
        </div>
      )
    }

    return (
      <div className={css({ pl: depth > 0 ? '4' : '0' })}>
        <span className={css({ color: 'white' })}>{`{`}</span>
        {Object.entries(obj).map(([key, value], idx, arr) => (
          <div key={key} className={css({ pl: '4' })}>
            <span className={css({ color: 'cyan.400' })}>{`"${key}"`}</span>
            <span className={css({ color: 'white' })}>: </span>
            {renderJSON(value, depth + 1)}
            {idx < arr.length - 1 && <span className={css({ color: 'white' })}>,</span>}
          </div>
        ))}
        <span className={css({ color: 'white' })}>{'}'}</span>
      </div>
    )
  }

  return (
    <main
      className={css({
        maxW: '7xl',
        mx: 'auto',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'indigo.500/30',
            bg: 'indigo.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Shield className={css({ h: '5', w: '5', color: 'indigo.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'indigo.300' })}>
            Secure • Client-Side • No Server Storage
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            background:
              'linear-gradient(to right, var(--colors-indigo-400), var(--colors-purple-400), var(--colors-pink-400))',
            backgroundClip: 'text',
          })}
          style={{ WebkitTextFillColor: 'transparent' }}
        >
          JWT Decoder & Inspector
        </h1>

        <p
          className={css({
            maxW: '3xl',
            mx: 'auto',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Decode, verify, and validate JSON Web Tokens securely in your browser. View header,
          payload, and signature. All processing happens locally.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'indigo.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>JWT Token Input</CardTitle>
            <CardDescription>Paste your JWT token below to decode and inspect it</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Token Input */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="jwt-token-input"
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'white',
                })}
              >
                JWT Token
              </label>
              <textarea
                id="jwt-token-input"
                value={jwtToken}
                onChange={handleTokenChange}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                className={css({
                  w: 'full',
                  minH: '32',
                  p: '3',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  borderRadius: 'md',
                  bg: 'gray.800/50',
                  color: 'gray.100',
                  fontSize: 'sm',
                  fontFamily: 'mono',
                  resize: 'vertical',
                  _focus: {
                    outline: 'none',
                    borderColor: 'indigo.500',
                    ring: '2px',
                    ringColor: 'indigo.500/20',
                  },
                })}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                  p: '4',
                  border: '1px solid',
                  borderColor: 'red.500/30',
                  bg: 'red.500/10',
                  borderRadius: 'md',
                  animation: 'scaleIn 0.5s ease-out forwards',
                  opacity: 0,
                })}
              >
                <AlertCircle
                  className={css({ h: '5', w: '5', color: 'red.400', flexShrink: '0' })}
                />
                <p className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleClear}
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <X className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decoded JWT Display */}
      {decodedJWT && (
        <>
          {/* Expiration Warning */}
          {isExpired && (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                p: '4',
                border: '1px solid',
                borderColor: 'orange.500/30',
                bg: 'orange.500/10',
                borderRadius: 'md',
                animation: 'slideUp 0.5s ease-out forwards',
                opacity: 0,
              })}
            >
              <Clock className={css({ h: '5', w: '5', color: 'orange.400', flexShrink: '0' })} />
              <div>
                <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
                  Token Expired
                </p>
                <p className={css({ fontSize: 'xs', color: 'orange.400' })}>
                  This JWT token has expired and should not be accepted.
                </p>
              </div>
            </div>
          )}

          {!isExpired && decodedJWT.payload.exp && (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                p: '4',
                border: '1px solid',
                borderColor: 'green.500/30',
                bg: 'green.500/10',
                borderRadius: 'md',
                animation: 'slideUp 0.5s ease-out forwards',
                opacity: 0,
              })}
            >
              <CheckCircle2
                className={css({ h: '5', w: '5', color: 'green.400', flexShrink: '0' })}
              />
              <div>
                <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.300' })}>
                  Token Valid
                </p>
                <p className={css({ fontSize: 'xs', color: 'green.400' })}>
                  Expires: {formatTimestamp(decodedJWT.payload.exp)}
                </p>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'indigo.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Shield className={css({ h: '5', w: '5', color: 'indigo.400' })} />
                    <CardTitle className={css({ fontSize: 'lg' })}>Header</CardTitle>
                  </div>
                  <Button
                    onClick={() => handleCopy(JSON.stringify(decodedJWT.header, null, 2), 'Header')}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
                <CardDescription>Token type and cryptographic algorithm</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    p: '4',
                    bg: 'gray.800/50',
                    borderRadius: 'md',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    overflowX: 'auto',
                  })}
                >
                  {renderJSON(decodedJWT.header)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payload Section */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.2s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'purple.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Info className={css({ h: '5', w: '5', color: 'purple.400' })} />
                    <CardTitle className={css({ fontSize: 'lg' })}>Payload</CardTitle>
                  </div>
                  <Button
                    onClick={() =>
                      handleCopy(JSON.stringify(decodedJWT.payload, null, 2), 'Payload')
                    }
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
                <CardDescription>Claims and user data</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    p: '4',
                    bg: 'gray.800/50',
                    borderRadius: 'md',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    overflowX: 'auto',
                  })}
                >
                  {renderJSON(decodedJWT.payload)}
                </div>

                {/* Standard Claims Info */}
                <div className={css({ mt: '4', spaceY: '2' })}>
                  <h4 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'white' })}>
                    Standard Claims
                  </h4>
                  <div className={css({ display: 'grid', gap: '2', fontSize: 'sm' })}>
                    {decodedJWT.payload.iss && (
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          gap: '2',
                        })}
                      >
                        <span className={css({ color: 'white', minW: { base: '0', sm: '16' } })}>
                          Issuer (iss):
                        </span>
                        <span className={css({ color: 'white', overflowWrap: 'anywhere' })}>
                          {decodedJWT.payload.iss}
                        </span>
                      </div>
                    )}
                    {decodedJWT.payload.sub && (
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          gap: '2',
                        })}
                      >
                        <span className={css({ color: 'white', minW: { base: '0', sm: '16' } })}>
                          Subject (sub):
                        </span>
                        <span className={css({ color: 'white', overflowWrap: 'anywhere' })}>
                          {decodedJWT.payload.sub}
                        </span>
                      </div>
                    )}
                    {decodedJWT.payload.aud && (
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          gap: '2',
                        })}
                      >
                        <span className={css({ color: 'white', minW: { base: '0', sm: '16' } })}>
                          Audience (aud):
                        </span>
                        <span className={css({ color: 'white', overflowWrap: 'anywhere' })}>
                          {Array.isArray(decodedJWT.payload.aud)
                            ? decodedJWT.payload.aud.join(', ')
                            : decodedJWT.payload.aud}
                        </span>
                      </div>
                    )}
                    {decodedJWT.payload.exp && (
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          gap: '2',
                        })}
                      >
                        <span className={css({ color: 'white', minW: { base: '0', sm: '16' } })}>
                          Expiration (exp):
                        </span>
                        <span className={css({ color: 'white', overflowWrap: 'anywhere' })}>
                          {formatTimestamp(decodedJWT.payload.exp)}
                        </span>
                      </div>
                    )}
                    {decodedJWT.payload.iat && (
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          gap: '2',
                        })}
                      >
                        <span className={css({ color: 'white', minW: { base: '0', sm: '16' } })}>
                          Issued At (iat):
                        </span>
                        <span className={css({ color: 'white', overflowWrap: 'anywhere' })}>
                          {formatTimestamp(decodedJWT.payload.iat)}
                        </span>
                      </div>
                    )}
                    {decodedJWT.payload.nbf && (
                      <div
                        className={css({
                          display: 'flex',
                          flexDirection: { base: 'column', sm: 'row' },
                          gap: '2',
                        })}
                      >
                        <span className={css({ color: 'white', minW: { base: '0', sm: '16' } })}>
                          Not Before (nbf):
                        </span>
                        <span className={css({ color: 'white', overflowWrap: 'anywhere' })}>
                          {formatTimestamp(decodedJWT.payload.nbf)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Section */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.3s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'pink.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Key className={css({ h: '5', w: '5', color: 'pink.400' })} />
                    <CardTitle className={css({ fontSize: 'lg' })}>Signature</CardTitle>
                  </div>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      onClick={() => setShowSignature(!showSignature)}
                      variant="ghost"
                      size="sm"
                    >
                      {showSignature ? (
                        <EyeOff className={css({ h: '4', w: '4' })} />
                      ) : (
                        <Eye className={css({ h: '4', w: '4' })} />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleCopy(decodedJWT.signature, 'Signature')}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Cryptographic signature to verify token authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    p: '4',
                    bg: 'gray.800/50',
                    borderRadius: 'md',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    overflowX: 'auto',
                    wordBreak: 'break-all',
                  })}
                >
                  {showSignature ? (
                    <span className={css({ color: 'pink.400' })}>{decodedJWT.signature}</span>
                  ) : (
                    <span className={css({ color: 'white' })}>
                      {'•'.repeat(Math.min(decodedJWT.signature.length, 64))}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Educational Section */}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.4s',
          opacity: 0,
        })}
      >
        <Card className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}>
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>What is JWT?</CardTitle>
          </CardHeader>
          <CardContent className={css({ spaceY: '3', fontSize: 'sm', color: 'white' })}>
            <p>
              JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting
              information between parties as a JSON object. JWTs are commonly used for
              authentication and information exchange.
            </p>
            <p>A JWT consists of three parts separated by dots:</p>
            <ul className={css({ listStyleType: 'disc', pl: '5', spaceY: '1' })}>
              <li>
                <strong className={css({ color: 'indigo.400' })}>Header:</strong> Token type and
                algorithm
              </li>
              <li>
                <strong className={css({ color: 'purple.400' })}>Payload:</strong> Claims and user
                data
              </li>
              <li>
                <strong className={css({ color: 'pink.400' })}>Signature:</strong> Verification
                signature
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}>
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3', fontSize: 'sm', color: 'white' })}>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Authentication:</strong> Verify user
                  identity after login
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Authorization:</strong> Control access
                  to protected resources
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Information Exchange:</strong>{' '}
                  Securely transmit data between services
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>API Security:</strong> Protect REST
                  APIs and microservices
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Related Tool */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.5s',
          opacity: 0,
        })}
      >
        <Card
          className={css({ border: '1px solid', borderColor: 'blue.500/20', bg: 'gray.900/50' })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Need More Features?</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="/tools/development/jwt-debugger"
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                p: '4',
                borderRadius: 'lg',
                bg: 'blue.500/10',
                border: '1px solid',
                borderColor: 'blue.500/30',
                _hover: { bg: 'blue.500/20' },
                transition: 'all 0.2s',
              })}
            >
              <ShieldCheck className={css({ h: '6', w: '6', color: 'blue.400' })} />
              <div>
                <p className={css({ fontWeight: 'semibold', color: 'white' })}>JWT Debugger</p>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Verify signatures, generate tokens, and access history
                </p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={null}>
        <ToolSearch />
      </Suspense>
    </main>
  )
}

export default function JWTDecoderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JWTDecoderContent />
    </Suspense>
  )
}
