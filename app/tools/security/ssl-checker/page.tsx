'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

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

function SSLCheckerContent() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SSLCheckResult | null>(null)

  useEffect(() => {
    trackToolEvent('ssl_checker_open', {})
  }, [])

  const normalizeUrl = (input: string): string => {
    let normalized = input.trim()

    // Remove protocol if present
    normalized = normalized.replace(/^(https?:\/\/)/, '')

    // Remove path and query strings
    normalized = normalized.split('/')[0]
    normalized = normalized.split('?')[0]

    return normalized
  }

  const checkSSL = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    const domain = normalizeUrl(url)
    setLoading(true)
    setResult(null)

    try {
      // Call our API endpoint to check SSL
      const response = await fetch('/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check SSL certificate')
      }

      const data = (await response.json()) as SSLCheckResult

      setResult(data)

      trackToolEvent('ssl_check_complete', {
        valid: data.valid,
        security_score: data.securityScore,
        days_until_expiry: data.certificate?.daysUntilExpiry ?? 0,
        has_warnings: data.warnings.length > 0,
      })

      if (data.valid) {
        toast.success('SSL certificate is valid!')
      } else {
        toast.error('SSL certificate has issues')
      }
    } catch (error) {
      console.error('SSL check error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to check SSL certificate'

      setResult({
        valid: false,
        certificate: null,
        securityScore: 0,
        warnings: [],
        recommendations: [],
        error: errorMessage,
      })

      toast.error(errorMessage)
      trackToolEvent('ssl_check_error', {})
    } finally {
      setLoading(false)
    }
  }

  const handleCopyReport = () => {
    if (!result) return

    let report = `SSL/TLS Certificate Report for ${url}\n\n`

    if (result.error) {
      report += `Error: ${result.error}\n`
    } else if (result.certificate) {
      const cert = result.certificate
      report += `Status: ${result.valid ? 'Valid' : 'Invalid'}\n`
      report += `Security Score: ${result.securityScore}/100\n\n`
      report += `Certificate Details:\n`
      report += `Subject: ${cert.subject}\n`
      report += `Issuer: ${cert.issuer}\n`
      report += `Valid From: ${new Date(cert.validFrom).toLocaleDateString()}\n`
      report += `Valid Until: ${new Date(cert.validTo).toLocaleDateString()}\n`
      report += `Days Until Expiry: ${cert.daysUntilExpiry}\n`
      report += `Protocol: ${cert.protocol}\n`
      report += `Key Size: ${cert.keySize} bits\n`
      report += `Signature Algorithm: ${cert.signatureAlgorithm}\n`
      report += `Serial Number: ${cert.serialNumber}\n`

      if (cert.san.length > 0) {
        report += `\nSubject Alternative Names:\n${cert.san.map((name) => `• ${name}`).join('\n')}\n`
      }

      if (result.warnings.length > 0) {
        report += `\nWarnings:\n${result.warnings.map((w) => `⚠️ ${w}`).join('\n')}\n`
      }

      if (result.recommendations.length > 0) {
        report += `\nRecommendations:\n${result.recommendations.map((r) => `💡 ${r}`).join('\n')}\n`
      }
    }

    navigator.clipboard.writeText(report)
    toast.success('Report copied to clipboard!')
    trackToolEvent('ssl_report_copy', {})
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    if (score >= 40) return 'orange'
    return 'red'
  }

  const getExpiryStatus = (
    days: number
  ): { color: string; label: string; icon: typeof CheckCircle2 } => {
    if (days > 30) return { color: 'green', label: 'Valid', icon: CheckCircle2 }
    if (days > 7) return { color: 'yellow', label: 'Expiring Soon', icon: AlertCircle }
    if (days > 0) return { color: 'orange', label: 'Expiring Very Soon', icon: AlertCircle }
    return { color: 'red', label: 'Expired', icon: XCircle }
  }

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
        className={css({ spaceY: '4', animation: 'slideUp 0.5s ease-out forwards', opacity: 0 })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '12',
              h: '12',
              borderRadius: 'lg',
              bgGradient: 'to-br',
              gradientFrom: 'teal.500',
              gradientTo: 'cyan.500',
            })}
          >
            <ShieldCheck className={css({ w: '6', h: '6', color: 'white' })} />
          </div>
          <div>
            <h1
              className={css({
                fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                fontWeight: 'bold',
                color: 'fg.default',
              })}
            >
              SSL/TLS Certificate Checker
            </h1>
            <p className={css({ color: 'fg.muted', fontSize: { base: 'sm', sm: 'md' } })}>
              Inspect SSL certificates, check expiration dates, and get security recommendations
            </p>
          </div>
        </div>

        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
          <Badge variant="secondary">
            <Shield className={css({ w: '3', h: '3', mr: '1' })} />
            Certificate Details
          </Badge>
          <Badge variant="secondary">
            <Clock className={css({ w: '3', h: '3', mr: '1' })} />
            Expiry Tracking
          </Badge>
          <Badge variant="secondary">
            <Lock className={css({ w: '3', h: '3', mr: '1' })} />
            Security Analysis
          </Badge>
          <Badge variant="secondary">
            <Sparkles className={css({ w: '3', h: '3', mr: '1' })} />
            Recommendations
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: { base: '6', lg: '8' },
          w: 'full',
        })}
      >
        {/* Left Column - SSL Checker */}
        <div className={css({ spaceY: { base: '6', sm: '8' }, w: 'full' })}>
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Check SSL Certificate</CardTitle>
              <CardDescription>
                Enter a website URL to inspect its SSL/TLS certificate and security configuration
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div className={css({ spaceY: '2' })}>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <div className={css({ position: 'relative', flex: '1' })}>
                    <Globe
                      className={css({
                        position: 'absolute',
                        left: '3',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        w: '4',
                        h: '4',
                        color: 'fg.muted',
                      })}
                    />
                    <Input
                      type="text"
                      placeholder="example.com or https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          checkSSL()
                        }
                      }}
                      className={css({ pl: '10' })}
                      disabled={loading}
                    />
                  </div>
                  <Button onClick={checkSSL} disabled={loading || !url.trim()}>
                    {loading ? 'Checking...' : 'Check SSL'}
                  </Button>
                </div>
                <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                  Enter a domain name (e.g., google.com) or full URL
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className={css({ animation: 'slideUp 0.5s ease-out forwards', opacity: 0 })}>
              {result.error ? (
                <Card>
                  <CardContent className={css({ pt: '6' })}>
                    <div
                      className={css({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        py: '8',
                        spaceY: '4',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          w: '16',
                          h: '16',
                          borderRadius: 'full',
                          bg: 'red.500/10',
                        })}
                      >
                        <XCircle className={css({ w: '8', h: '8', color: 'red.500' })} />
                      </div>
                      <div>
                        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '2' })}>
                          Unable to Check SSL Certificate
                        </h3>
                        <p className={css({ color: 'fg.muted' })}>{result.error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : result.certificate ? (
                <>
                  {/* Security Score */}
                  <Card>
                    <CardHeader>
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                        })}
                      >
                        <div>
                          <CardTitle>Security Score</CardTitle>
                          <CardDescription>Overall SSL/TLS security assessment</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleCopyReport}>
                          <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                          Copy Report
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className={css({ spaceY: '4' })}>
                      <div className={css({ textAlign: 'center', spaceY: '2' })}>
                        <div
                          className={css({
                            fontSize: '5xl',
                            fontWeight: 'bold',
                            color: `${getScoreColor(result.securityScore)}.500`,
                          })}
                        >
                          {result.securityScore}
                          <span className={css({ fontSize: '2xl', color: 'fg.muted' })}>/100</span>
                        </div>
                        <Progress value={result.securityScore} className={css({ h: '2' })} />
                        <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>
                          {result.securityScore >= 80
                            ? 'Excellent security configuration'
                            : result.securityScore >= 60
                              ? 'Good security with some improvements needed'
                              : result.securityScore >= 40
                                ? 'Fair security, improvements recommended'
                                : 'Poor security, immediate action required'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Certificate Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificate Details</CardTitle>
                      <CardDescription>
                        SSL/TLS certificate information and validity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={css({ spaceY: '4' })}>
                      {/* Expiry Status */}
                      <div
                        className={css({
                          p: '4',
                          borderRadius: 'lg',
                          bg: `${getExpiryStatus(result.certificate.daysUntilExpiry).color}.500/10`,
                          border: '1px solid',
                          borderColor: `${getExpiryStatus(result.certificate.daysUntilExpiry).color}.500/20`,
                        })}
                      >
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                          {(() => {
                            const Icon = getExpiryStatus(result.certificate.daysUntilExpiry).icon
                            return (
                              <Icon
                                className={css({
                                  w: '5',
                                  h: '5',
                                  color: `${getExpiryStatus(result.certificate.daysUntilExpiry).color}.500`,
                                })}
                              />
                            )
                          })()}
                          <div className={css({ flex: '1' })}>
                            <div className={css({ fontWeight: 'semibold', fontSize: 'sm' })}>
                              {getExpiryStatus(result.certificate.daysUntilExpiry).label}
                            </div>
                            <div className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                              {result.certificate.daysUntilExpiry > 0
                                ? `Expires in ${result.certificate.daysUntilExpiry} day${result.certificate.daysUntilExpiry !== 1 ? 's' : ''}`
                                : `Expired ${Math.abs(result.certificate.daysUntilExpiry)} day${Math.abs(result.certificate.daysUntilExpiry) !== 1 ? 's' : ''} ago`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Certificate Info Grid */}
                      <div className={css({ spaceY: '3' })}>
                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Subject
                          </span>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              wordBreak: 'break-all',
                            })}
                          >
                            {result.certificate.subject}
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>Issuer</span>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              wordBreak: 'break-all',
                            })}
                          >
                            {result.certificate.issuer}
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Valid From
                          </span>
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {new Date(result.certificate.validFrom).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Valid Until
                          </span>
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {new Date(result.certificate.validTo).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Protocol
                          </span>
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {result.certificate.protocol}
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Key Size
                          </span>
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {result.certificate.keySize} bits
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                            borderBottom: '1px solid',
                            borderColor: 'border.default',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Signature
                          </span>
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {result.certificate.signatureAlgorithm}
                          </span>
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '2',
                            py: '2',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
                            Serial Number
                          </span>
                          <span
                            className={css({
                              fontSize: 'xs',
                              fontFamily: 'mono',
                              wordBreak: 'break-all',
                            })}
                          >
                            {result.certificate.serialNumber}
                          </span>
                        </div>
                      </div>

                      {/* Subject Alternative Names */}
                      {result.certificate.san.length > 0 && (
                        <div className={css({ spaceY: '2' })}>
                          <h4 className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                            Subject Alternative Names
                          </h4>
                          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                            {result.certificate.san.map((name) => (
                              <Badge key={name} variant="secondary">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle
                          className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                        >
                          <ShieldAlert className={css({ w: '5', h: '5', color: 'orange.500' })} />
                          Security Warnings
                        </CardTitle>
                        <CardDescription>Issues found in the SSL/TLS configuration</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={css({ spaceY: '3' })}>
                          {result.warnings.map((warning) => (
                            <div
                              key={warning}
                              className={css({
                                display: 'flex',
                                gap: '3',
                                p: '3',
                                borderRadius: 'md',
                                bg: 'orange.500/10',
                                border: '1px solid',
                                borderColor: 'orange.500/20',
                              })}
                            >
                              <AlertCircle
                                className={css({
                                  w: '5',
                                  h: '5',
                                  color: 'orange.500',
                                  flexShrink: '0',
                                  mt: '0.5',
                                })}
                              />
                              <p className={css({ fontSize: 'sm' })}>{warning}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle
                          className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                        >
                          <Sparkles className={css({ w: '5', h: '5', color: 'blue.500' })} />
                          Security Recommendations
                        </CardTitle>
                        <CardDescription>
                          Suggested improvements for better security
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={css({ spaceY: '3' })}>
                          {result.recommendations.map((rec) => (
                            <div
                              key={rec}
                              className={css({
                                display: 'flex',
                                gap: '3',
                                p: '3',
                                borderRadius: 'md',
                                bg: 'blue.500/10',
                                border: '1px solid',
                                borderColor: 'blue.500/20',
                              })}
                            >
                              <CheckCircle2
                                className={css({
                                  w: '5',
                                  h: '5',
                                  color: 'blue.500',
                                  flexShrink: '0',
                                  mt: '0.5',
                                })}
                              />
                              <p className={css({ fontSize: 'sm' })}>{rec}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Column - Ads & Info */}
        <div className={css({ spaceY: { base: '6', sm: '8' }, w: 'full' })}>
          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className={css({ fontSize: 'lg' })}>SSL/TLS Tips</CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', gap: '3' })}>
                <CheckCircle2
                  className={css({
                    w: '5',
                    h: '5',
                    color: 'green.500',
                    flexShrink: '0',
                    mt: '0.5',
                  })}
                />
                <div>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                    Certificate Expiry
                  </p>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                    Renew certificates at least 30 days before expiry to avoid downtime
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <CheckCircle2
                  className={css({
                    w: '5',
                    h: '5',
                    color: 'green.500',
                    flexShrink: '0',
                    mt: '0.5',
                  })}
                />
                <div>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>Modern Protocols</p>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                    Use TLS 1.2 or higher. Disable older protocols like SSL 3.0 and TLS 1.0
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <CheckCircle2
                  className={css({
                    w: '5',
                    h: '5',
                    color: 'green.500',
                    flexShrink: '0',
                    mt: '0.5',
                  })}
                />
                <div>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>Strong Encryption</p>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                    Use 2048-bit or higher key sizes for RSA certificates
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <CheckCircle2
                  className={css({
                    w: '5',
                    h: '5',
                    color: 'green.500',
                    flexShrink: '0',
                    mt: '0.5',
                  })}
                />
                <div>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>Trusted CA</p>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                    Always use certificates from trusted Certificate Authorities
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <CheckCircle2
                  className={css({
                    w: '5',
                    h: '5',
                    color: 'green.500',
                    flexShrink: '0',
                    mt: '0.5',
                  })}
                />
                <div>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                    Certificate Monitoring
                  </p>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                    Set up automated monitoring and alerts for certificate expiration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Tool */}
      <Suspense fallback={null}>
        <ToolSearch />
      </Suspense>
    </main>
  )
}

export default function SSLCheckerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SSLCheckerContent />
    </Suspense>
  )
}
