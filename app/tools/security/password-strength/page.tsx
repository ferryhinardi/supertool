'use client'

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Info,
  Lock,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import { SecurityToolHeader } from '@/components/features/tools/SecurityToolHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  analyzePassword,
  generatePasswordSuggestions,
  getPasswordStrengthPercentage,
  getStrengthColor,
  getStrengthLabel,
} from './utils'

function PasswordStrengthContent() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    trackToolEvent('password_strength_open', {})
  }, [])

  const analysis = useMemo(() => (password ? analyzePassword(password) : null), [password])

  useEffect(() => {
    if (analysis && password.length >= 3) {
      trackToolEvent('password_strength_checked', {
        score: analysis.score,
        length: analysis.length,
        strength_level: analysis.strengthLevel,
      })
    }
  }, [analysis, password])

  const suggestions = useMemo(() => {
    if (!analysis) return []
    return generatePasswordSuggestions(analysis)
  }, [analysis])

  const handleCopyFeedback = () => {
    if (!analysis) return

    const feedback = `Password Strength: ${getStrengthLabel(analysis.strengthLevel)}
Score: ${analysis.score}/4
Length: ${analysis.length}
Entropy: ${analysis.entropy} bits
Crack Time: ${analysis.crackTimeDisplay}

Suggestions:
${suggestions.map((s) => `• ${s}`).join('\n')}`

    navigator.clipboard.writeText(feedback)
    toast.success('Analysis copied to clipboard!')

    trackToolEvent('password_strength_copy', {
      strength_level: analysis.strengthLevel,
    })
  }

  const strengthPercentage = analysis ? getPasswordStrengthPercentage(analysis.score) : 0
  const strengthColor = analysis ? getStrengthColor(analysis.strengthLevel) : 'gray'
  const strengthLabel = analysis ? getStrengthLabel(analysis.strengthLevel) : 'No Password'

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
      <SecurityToolHeader
        title="Password Strength Analyzer"
        description="Measure password entropy and security strength with visual feedback. Detect common patterns, dictionary words, and get actionable recommendations."
        eyebrow="Password assessment"
        icon={ShieldAlert}
        highlights={['Entropy scoring', 'Pattern detection', 'Powered by zxcvbn']}
      />

      {/* Password Input */}
      <div className={css({ w: 'full' })}>
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'brand.surface',
          })}
        >
          <CardHeader>
            <CardTitle>Enter Your Password</CardTitle>
            <CardDescription>Your password is never sent to any server</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ position: 'relative' })}>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password here..."
                className={css({
                  h: '14',
                  pr: '12',
                  fontSize: 'lg',
                  bg: 'brand.surfaceRaised',
                  border: '1px solid',
                  borderColor: 'brand.line',
                  _focus: { borderColor: 'emerald.500', ring: '2px', ringColor: 'emerald.500/20' },
                })}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  p: '2',
                  minW: '11',
                  minH: '11',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'md',
                  bg: 'transparent',
                  border: 'none',
                  color: 'brand.ink',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { color: 'gray.200', bg: 'gray.800' },
                })}
              >
                {showPassword ? (
                  <EyeOff className={css({ h: '5', w: '5' })} />
                ) : (
                  <Eye className={css({ h: '5', w: '5' })} />
                )}
              </button>
            </div>

            {analysis && (
              <div
                className={css({
                  spaceY: '3',
                })}
              >
                {/* Strength Meter */}
                <div className={css({ spaceY: '2' })}>
                  <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}
                    >
                      Password Strength
                    </span>
                    <Badge
                      className={css({
                        bg: `${strengthColor}.500/20`,
                        color: `${strengthColor}.300`,
                        border: '1px solid',
                        borderColor: `${strengthColor}.500/30`,
                      })}
                    >
                      {strengthLabel}
                    </Badge>
                  </div>
                  <Progress
                    value={strengthPercentage}
                    className={css({
                      h: '3',
                      bg: 'gray.800',
                      '& > div': {
                        bg: `${strengthColor}.500`,
                        transition: 'all 0.3s',
                      },
                    })}
                  />
                </div>

                {/* Stats Grid */}
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '3',
                  })}
                >
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'brand.line',
                      bg: 'brand.surfaceRaised',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'brand.ink', mb: '1' })}>
                      Length
                    </div>
                    <div className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.200' })}>
                      {analysis.length} characters
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'brand.line',
                      bg: 'brand.surfaceRaised',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'brand.ink', mb: '1' })}>
                      Entropy
                    </div>
                    <div className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.200' })}>
                      {analysis.entropy} bits
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'brand.line',
                      bg: 'brand.surfaceRaised',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'brand.ink', mb: '1' })}>
                      Score
                    </div>
                    <div className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.200' })}>
                      {analysis.score} / 4
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'brand.line',
                      bg: 'brand.surfaceRaised',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'brand.ink', mb: '1' })}>
                      Crack Time
                    </div>
                    <div
                      className={css({
                        fontSize: 'xl',
                        fontWeight: 'bold',
                        color: 'gray.200',
                        wordBreak: 'break-word',
                      })}
                    >
                      {analysis.crackTimeDisplay}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Character Requirements */}
      {analysis && (
        <div className={css({ w: 'full' })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'brand.line',
              bg: 'brand.surface',
            })}
          >
            <CardHeader>
              <CardTitle>Character Analysis</CardTitle>
              <CardDescription>
                Check what types of characters your password contains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: analysis.hasLowercase ? 'green.500/30' : 'gray.700',
                    bg: analysis.hasLowercase ? 'green.500/10' : 'brand.surfaceRaised',
                    p: '3',
                  })}
                >
                  {analysis.hasLowercase ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'brand.ink' })} />
                  )}
                  <div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: analysis.hasLowercase ? 'green.300' : 'gray.400',
                      })}
                    >
                      Lowercase Letters
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'brand.ink' })}>a-z</div>
                  </div>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: analysis.hasUppercase ? 'green.500/30' : 'gray.700',
                    bg: analysis.hasUppercase ? 'green.500/10' : 'brand.surfaceRaised',
                    p: '3',
                  })}
                >
                  {analysis.hasUppercase ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'brand.ink' })} />
                  )}
                  <div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: analysis.hasUppercase ? 'green.300' : 'gray.400',
                      })}
                    >
                      Uppercase Letters
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'brand.ink' })}>A-Z</div>
                  </div>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: analysis.hasNumbers ? 'green.500/30' : 'gray.700',
                    bg: analysis.hasNumbers ? 'green.500/10' : 'brand.surfaceRaised',
                    p: '3',
                  })}
                >
                  {analysis.hasNumbers ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'brand.ink' })} />
                  )}
                  <div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: analysis.hasNumbers ? 'green.300' : 'gray.400',
                      })}
                    >
                      Numbers
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'brand.ink' })}>0-9</div>
                  </div>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: analysis.hasSymbols ? 'green.500/30' : 'gray.700',
                    bg: analysis.hasSymbols ? 'green.500/10' : 'brand.surfaceRaised',
                    p: '3',
                  })}
                >
                  {analysis.hasSymbols ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'brand.ink' })} />
                  )}
                  <div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: analysis.hasSymbols ? 'green.300' : 'gray.400',
                      })}
                    >
                      Special Characters
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'brand.ink' })}>!@#$%^&*</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pattern Detection */}
      {analysis && (
        <div className={css({ w: 'full' })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/20',
              bg: 'brand.surface',
            })}
          >
            <CardHeader>
              <CardTitle>Pattern Detection</CardTitle>
              <CardDescription>Identified security weaknesses in your password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: analysis.hasSequences ? 'red.500/30' : 'green.500/30',
                    bg: analysis.hasSequences ? 'red.500/10' : 'green.500/10',
                    p: '3',
                  })}
                >
                  {analysis.hasSequences ? (
                    <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  ) : (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  )}
                  <div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: analysis.hasSequences ? 'red.300' : 'green.300',
                      })}
                    >
                      {analysis.hasSequences ? 'Sequences Detected' : 'No Sequences'}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'brand.ink' })}>
                      Common patterns like abc, 123, qwerty
                    </div>
                  </div>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: analysis.hasRepeats ? 'red.500/30' : 'green.500/30',
                    bg: analysis.hasRepeats ? 'red.500/10' : 'green.500/10',
                    p: '3',
                  })}
                >
                  {analysis.hasRepeats ? (
                    <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  ) : (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  )}
                  <div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: analysis.hasRepeats ? 'red.300' : 'green.300',
                      })}
                    >
                      {analysis.hasRepeats ? 'Repeated Characters' : 'No Repeats'}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'brand.ink' })}>
                      Repeated characters like aaa, 111
                    </div>
                  </div>
                </div>

                {analysis.feedback.warning && (
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'start',
                      gap: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'yellow.500/30',
                      bg: 'yellow.500/10',
                      p: '3',
                    })}
                  >
                    <Info
                      className={css({ h: '5', w: '5', color: 'yellow.400', flexShrink: '0' })}
                    />
                    <div>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'yellow.300',
                        })}
                      >
                        Warning
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'brand.ink', mt: '1' })}>
                        {analysis.feedback.warning}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestions */}
      {analysis && suggestions.length > 0 && (
        <div className={css({ w: 'full' })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'emerald.500/20',
              bg: 'brand.surface',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <div>
                  <CardTitle>Improvement Suggestions</CardTitle>
                  <CardDescription>Make your password stronger</CardDescription>
                </div>
                <Button
                  onClick={handleCopyFeedback}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: 'emerald.500/20',
                    color: 'emerald.400',
                    border: '1px solid',
                    borderColor: 'emerald.500/30',
                    _hover: { bg: 'emerald.500/30' },
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className={css({ spaceY: '3' })}>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className={css({
                      display: 'flex',
                      alignItems: 'start',
                      gap: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'brand.line',
                      bg: 'brand.surfaceRaised',
                      p: '3',
                    })}
                  >
                    <Lock
                      className={css({
                        h: '5',
                        w: '5',
                        color: 'emerald.400',
                        flexShrink: '0',
                        mt: '0.5',
                      })}
                    />
                    <span className={css({ fontSize: 'sm', color: 'brand.ink' })}>
                      {suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <div className={css({ w: 'full' })}>
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'brand.surface',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'teal.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'teal.400' })}>
                  Security Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'brand.ink' })}>
                  <li>• Use at least 12 characters for strong passwords</li>
                  <li>• Mix uppercase, lowercase, numbers, and special characters</li>
                  <li>• Avoid common words, names, and predictable patterns</li>
                  <li>• Consider using a passphrase with 4+ random words</li>
                  <li>• Never reuse passwords across different accounts</li>
                  <li>• Use a password manager to generate and store complex passwords</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Suggestions */}
      <AffiliateSuggestion tool="password-strength" variant="banner" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function PasswordStrengthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordStrengthContent />
    </Suspense>
  )
}
