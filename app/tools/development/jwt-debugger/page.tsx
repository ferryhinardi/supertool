'use client'

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Heart,
  Key,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { useToolHistory } from '@/hooks/tools/useToolHistory'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  type DecodedJWT,
  decodeJWT,
  generateJWT,
  type JWTAlgorithm,
  type JWTHistoryData,
  SAMPLE_TOKENS,
  verifyJWT,
} from './utils'

function JWTDebuggerContent() {
  useTrackToolView({
    toolId: 'jwt-debugger',
    title: 'JWT Debugger',
    href: '/tools/development/jwt-debugger',
    iconName: 'ShieldCheck',
    gradient: 'from-blue-500 to-cyan-500',
  })

  const [token, setToken] = useState('')
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [algorithm, setAlgorithm] = useState<JWTAlgorithm>('HS256')

  // Generator state
  const [payloadInput, setPayloadInput] = useState(
    JSON.stringify(
      { sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000) },
      null,
      2
    )
  )
  const [generatedToken, setGeneratedToken] = useState('')

  // Decoded state
  const [decodedToken, setDecodedToken] = useState<DecodedJWT | null>(null)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    error?: string
  } | null>(null)

  // History
  const history = useToolHistory<JWTHistoryData>({
    storageKey: 'jwt_debugger_history',
    maxItems: 50,
  })

  const [historySearch, setHistorySearch] = useState('')
  const [historySortBy, setHistorySortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest')
  const showFavoritesOnly = false // Reserved for future implementation

  // Decode token automatically
  useEffect(() => {
    if (!token) {
      setDecodedToken(null)
      setVerificationResult(null)
      return
    }

    const decoded = decodeJWT(token)
    setDecodedToken(decoded)
    trackToolEvent('jwt_debugger_decode', { hasToken: true })

    // Auto verify if we have a secret
    if (secret && decoded.isValid) {
      verifyJWT(token, secret, algorithm).then((result) => {
        setVerificationResult(result)
        if (result.isValid) {
          trackToolEvent('jwt_debugger_verify', { algorithm, success: true })
        }
      })
    }
  }, [token, secret, algorithm])

  // Handle token input
  const handleTokenChange = (value: string) => {
    setToken(value.trim())
  }

  // Handle verification
  const handleVerify = async () => {
    if (!token || !decodedToken?.isValid) {
      toast.error('Please enter a valid JWT token')
      return
    }

    if (!secret) {
      toast.error('Please enter a secret key')
      return
    }

    const result = await verifyJWT(token, secret, algorithm)
    setVerificationResult(result)

    if (result.isValid) {
      toast.success('Signature verified successfully!')
      trackToolEvent('jwt_debugger_verify', { algorithm, success: true })

      // Save to history
      if (decodedToken.payload) {
        history.addItem({
          token,
          algorithm,
          payload: decodedToken.payload,
          isExpired: decodedToken.claims?.isExpired || false,
        })
      }
    } else {
      toast.error(`Verification failed: ${result.error}`)
      trackToolEvent('jwt_debugger_verify', { algorithm, success: false })
    }
  }

  // Handle token generation
  const handleGenerate = async () => {
    try {
      const payload = JSON.parse(payloadInput)
      const newToken = await generateJWT(payload, secret, algorithm)
      setGeneratedToken(newToken)
      setToken(newToken) // Also set as current token
      toast.success('JWT token generated successfully!')
      trackToolEvent('jwt_debugger_generate', { algorithm })
    } catch (error) {
      toast.error(
        `Failed to generate token: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Copy to clipboard
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
      trackToolEvent('jwt_debugger_copy', { type: label })
    } catch (_error) {
      toast.error('Failed to copy')
    }
  }

  // Load sample token
  const handleLoadSample = (sample: {
    name: string
    algorithm: string
    secret: string
    token: string
  }) => {
    setToken(sample.token)
    setSecret(sample.secret)
    setAlgorithm(sample.algorithm as JWTAlgorithm)
    toast.success(`Loaded: ${sample.name}`)
  }

  // History functions
  const loadHistoryItem = (item: JWTHistoryData) => {
    setToken(item.token)
    setAlgorithm(item.algorithm)
    toast.success('Loaded from history')
    trackToolEvent('jwt_debugger_history_load', {})
  }

  const deleteHistoryItem = (id: string) => {
    history.deleteItem(id)
    toast.success('Removed from history')
    trackToolEvent('jwt_debugger_history_delete', {})
  }

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      history.clearAll()
      toast.success('History cleared')
      trackToolEvent('jwt_debugger_history_clear', {})
    }
  }

  const toggleFavorite = (id: string) => {
    history.toggleFavorite(id)
    trackToolEvent('jwt_debugger_history_favorite', {})
  }

  const filteredHistory = useMemo(() => {
    return history.getFilteredItems({
      searchQuery: historySearch,
      searchFields: ['token', 'algorithm'],
      sortBy: historySortBy,
      showFavoritesOnly,
    })
  }, [history, historySearch, historySortBy])

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
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
            rounded: 'full',
            border: '1px solid',
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <ShieldCheck className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            Decode • Verify • Generate
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
            color: 'transparent',
            letterSpacing: 'tight',
          })}
        >
          JWT Debugger
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'lg', md: 'xl' },
            color: 'white',
            lineHeight: 'relaxed',
          })}
        >
          Decode, verify, and generate JSON Web Tokens with full algorithm support and claims
          validation
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: '1fr 2fr', lg: '1fr 1fr 1fr' },
          gap: '6',
        })}
      >
        {/* Left Column - Input & Controls */}
        <div
          className={css({
            gridColumn: { base: '1 / -1', md: '1 / 2', lg: '1 / 3' },
            spaceY: '6',
          })}
        >
          {/* Token Input */}
          <Card>
            <CardHeader>
              <CardTitle>Encoded Token</CardTitle>
              <CardDescription>Paste your JWT token here to decode and verify</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <Textarea
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className={css({ minH: '32', fontFamily: 'mono', fontSize: 'sm' })}
              />

              {decodedToken && !decodedToken.isValid && (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    p: '3',
                    rounded: 'lg',
                    bg: 'red.500/10',
                    border: '1px solid',
                    borderColor: 'red.500/30',
                  })}
                >
                  <XCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  <span className={css({ fontSize: 'sm', color: 'red.300' })}>
                    {decodedToken.error}
                  </span>
                </div>
              )}

              {/* Sample Tokens */}
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Sample Tokens:
                </h3>
                <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                  {SAMPLE_TOKENS.map((sample) => (
                    <Button
                      key={sample.name}
                      onClick={() => handleLoadSample(sample)}
                      variant="outline"
                      size="sm"
                    >
                      {sample.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Controls */}
          {decodedToken?.isValid && (
            <Card>
              <CardHeader>
                <CardTitle>Verify Signature</CardTitle>
                <CardDescription>Enter secret key to verify the JWT signature</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div>
                    <label
                      htmlFor="algorithm-select"
                      className={css({
                        display: 'block',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        mb: '2',
                      })}
                    >
                      Algorithm
                    </label>
                    <select
                      id="algorithm-select"
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value as JWTAlgorithm)}
                      className={css({
                        w: 'full',
                        px: '3',
                        py: '2',
                        rounded: 'lg',
                        bg: 'gray.800',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        color: 'white',
                      })}
                    >
                      <option value="HS256">HS256</option>
                      <option value="HS384">HS384</option>
                      <option value="HS512">HS512</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="secret-key-input"
                      className={css({
                        display: 'block',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        mb: '2',
                      })}
                    >
                      Secret Key
                    </label>
                    <Input
                      id="secret-key-input"
                      type="password"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="your-256-bit-secret"
                    />
                  </div>
                </div>

                <Button onClick={handleVerify} className={css({ w: 'full' })}>
                  <Key className={css({ mr: '2', h: '4', w: '4' })} />
                  Verify Signature
                </Button>

                {verificationResult && (
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      p: '3',
                      rounded: 'lg',
                      bg: verificationResult.isValid ? 'green.500/10' : 'red.500/10',
                      border: '1px solid',
                      borderColor: verificationResult.isValid ? 'green.500/30' : 'red.500/30',
                    })}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className={css({ h: '5', w: '5', color: 'green.400' })} />
                    ) : (
                      <ShieldAlert className={css({ h: '5', w: '5', color: 'red.400' })} />
                    )}
                    <span
                      className={css({
                        fontSize: 'sm',
                        color: verificationResult.isValid ? 'green.300' : 'red.300',
                      })}
                    >
                      {verificationResult.isValid
                        ? 'Signature verified!'
                        : verificationResult.error}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generate Token */}
          <Card>
            <CardHeader>
              <CardTitle>Generate JWT</CardTitle>
              <CardDescription>Create a new JWT token with custom payload</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div>
                <label
                  htmlFor="payload-input"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Payload (JSON)
                </label>
                <Textarea
                  id="payload-input"
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                  placeholder='{"sub": "1234567890", "name": "John Doe"}'
                  className={css({ minH: '32', fontFamily: 'mono', fontSize: 'sm' })}
                />
              </div>

              <Button onClick={handleGenerate} className={css({ w: 'full' })}>
                Generate Token
              </Button>

              {generatedToken && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      bg: 'gray.800',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      fontFamily: 'mono',
                      fontSize: 'xs',
                      wordBreak: 'break-all',
                    })}
                  >
                    {generatedToken}
                  </div>
                  <Button
                    onClick={() => handleCopy(generatedToken, 'Generated token')}
                    variant="outline"
                    size="sm"
                    className={css({ w: 'full' })}
                  >
                    <Copy className={css({ mr: '2', h: '4', w: '4' })} />
                    Copy Token
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Decoded Output */}
        <div
          className={css({
            gridColumn: { base: '1 / -1', md: '2 / 3', lg: '3 / 4' },
            spaceY: '6',
          })}
        >
          {/* Header */}
          {decodedToken?.isValid && decodedToken.header && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  Header
                  <Button
                    onClick={() =>
                      handleCopy(JSON.stringify(decodedToken.header, null, 2), 'Header')
                    }
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'gray.800',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    fontSize: 'xs',
                    overflow: 'auto',
                  })}
                >
                  {JSON.stringify(decodedToken.header, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Payload */}
          {decodedToken?.isValid && decodedToken.payload && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  Payload
                  <Button
                    onClick={() =>
                      handleCopy(JSON.stringify(decodedToken.payload, null, 2), 'Payload')
                    }
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* Claims validation */}
                {decodedToken.claims && (
                  <div className={css({ spaceY: '2' })}>
                    {decodedToken.claims.isExpired && (
                      <Badge variant="destructive">
                        <AlertCircle className={css({ mr: '1', h: '3', w: '3' })} />
                        Expired
                      </Badge>
                    )}
                    {decodedToken.claims.exp && (
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          fontSize: 'xs',
                          color: 'white',
                        })}
                      >
                        <Clock className={css({ h: '3', w: '3' })} />
                        Expires: {new Date(decodedToken.claims.exp * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                <pre
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'gray.800',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    fontSize: 'xs',
                    overflow: 'auto',
                  })}
                >
                  {JSON.stringify(decodedToken.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <CardTitle>History</CardTitle>
                {history.items.length > 0 && (
                  <Button onClick={clearAllHistory} variant="ghost" size="sm">
                    <Trash2 className={css({ h: '4', w: '4' })} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {/* Search and filters */}
              {history.items.length > 0 && (
                <div className={css({ spaceY: '3' })}>
                  <div className={css({ position: 'relative' })}>
                    <Search
                      className={css({
                        position: 'absolute',
                        left: '3',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        h: '4',
                        w: '4',
                        color: 'white',
                      })}
                    />
                    <Input
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search history..."
                      className={css({ pl: '10' })}
                    />
                  </div>

                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      onClick={() => setHistorySortBy('newest')}
                      variant={historySortBy === 'newest' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Newest
                    </Button>
                    <Button
                      onClick={() => setHistorySortBy('oldest')}
                      variant={historySortBy === 'oldest' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Oldest
                    </Button>
                    <Button
                      onClick={() => setHistorySortBy('favorites')}
                      variant={historySortBy === 'favorites' ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Heart className={css({ mr: '1', h: '3', w: '3' })} />
                      Favorites
                    </Button>
                  </div>
                </div>
              )}

              {/* History items */}
              <div className={css({ spaceY: '2', maxH: '96', overflowY: 'auto' })}>
                {filteredHistory.length === 0 && (
                  <p
                    className={css({
                      textAlign: 'center',
                      fontSize: 'sm',
                      color: 'white',
                      py: '8',
                    })}
                  >
                    {history.items.length === 0 ? 'No history yet' : 'No matching items'}
                  </p>
                )}

                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                      transition: 'all 0.2s',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'space-between',
                        mb: '2',
                      })}
                    >
                      <div className={css({ flex: '1', minW: '0' })}>
                        <Badge variant="outline" className={css({ mb: '1' })}>
                          {item.data.algorithm}
                        </Badge>
                        {item.data.isExpired && (
                          <Badge variant="destructive" className={css({ ml: '1' })}>
                            Expired
                          </Badge>
                        )}
                        <p className={css({ fontSize: 'xs', color: 'white', mt: '1' })}>
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className={css({ display: 'flex', gap: '1' })}>
                        <Button onClick={() => toggleFavorite(item.id)} variant="ghost" size="sm">
                          <Heart
                            className={css({
                              h: '3',
                              w: '3',
                              color: item.isFavorite ? 'red.400' : 'gray.400',
                              fill: item.isFavorite ? 'red.400' : 'none',
                            })}
                          />
                        </Button>
                        <Button
                          onClick={() => deleteHistoryItem(item.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className={css({ h: '3', w: '3' })} />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => loadHistoryItem(item.data)}
                      variant="outline"
                      size="sm"
                      className={css({ w: 'full' })}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Tool */}
          <Card>
            <CardHeader>
              <CardTitle>Just Need Quick Decoding?</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="/tools/development/jwt-decoder"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'amber.500/10',
                  border: '1px solid',
                  borderColor: 'amber.500/30',
                  _hover: { bg: 'amber.500/20' },
                  transition: 'all 0.2s',
                })}
              >
                <Key className={css({ h: '6', w: '6', color: 'amber.400' })} />
                <div>
                  <p className={css({ fontWeight: 'semibold', color: 'white' })}>JWT Decoder</p>
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Lightweight tool for quick JWT inspection without verification
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default function JWTDebuggerPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            minH: 'screen',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <div className={css({ textAlign: 'center', spaceY: '4' })}>
            <div
              className={css({
                display: 'inline-block',
                w: '16',
                h: '16',
                border: '4px solid',
                borderColor: 'gray.700',
                borderTopColor: 'blue.500',
                rounded: 'full',
                animation: 'spin 1s linear infinite',
              })}
            />
            <p className={css({ color: 'white' })}>Loading JWT Debugger...</p>
          </div>
        </div>
      }
    >
      <ToolSearch />
      <JWTDebuggerContent />
    </Suspense>
  )
}
