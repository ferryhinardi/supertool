'use client'

import { motion } from 'framer-motion'
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
  type PasswordAnalysis,
} from './utils'

function PasswordStrengthContent() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)

  useEffect(() => {
    trackToolEvent('password_strength_open', {})
  }, [])

  useEffect(() => {
    if (password) {
      const result = analyzePassword(password)
      setAnalysis(result)

      if (password.length >= 3) {
        trackToolEvent('password_strength_checked', {
          score: result.score,
          length: result.length,
          strength_level: result.strengthLevel,
        })
      }
    } else {
      setAnalysis(null)
    }
  }, [password])

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'yellow.500/30',
            bg: 'yellow.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <ShieldAlert className={css({ h: '5', w: '5', color: 'yellow.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'yellow.300' })}>
            Powered by zxcvbn
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'yellow.400',
            gradientVia: 'orange.400',
            gradientTo: 'red.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Password Strength Analyzer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Measure password entropy and security strength with visual feedback. Detect common
          patterns, dictionary words, and get actionable recommendations.
        </p>
      </motion.div>

      {/* Password Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'yellow.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
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
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: { borderColor: 'yellow.500', ring: '2px', ringColor: 'yellow.500/20' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  p: '2',
                  rounded: 'md',
                  bg: 'transparent',
                  border: 'none',
                  color: 'gray.400',
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({ spaceY: '3' })}
              >
                {/* Strength Meter */}
                <div className={css({ spaceY: '2' })}>
                  <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
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
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
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
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
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
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>Score</div>
                    <div className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.200' })}>
                      {analysis.score} / 4
                    </div>
                  </div>

                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
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
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Character Requirements */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
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
                    bg: analysis.hasLowercase ? 'green.500/10' : 'gray.800/50',
                    p: '3',
                  })}
                >
                  {analysis.hasLowercase ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'gray.500' })} />
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
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>a-z</div>
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
                    bg: analysis.hasUppercase ? 'green.500/10' : 'gray.800/50',
                    p: '3',
                  })}
                >
                  {analysis.hasUppercase ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'gray.500' })} />
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
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>A-Z</div>
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
                    bg: analysis.hasNumbers ? 'green.500/10' : 'gray.800/50',
                    p: '3',
                  })}
                >
                  {analysis.hasNumbers ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'gray.500' })} />
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
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>0-9</div>
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
                    bg: analysis.hasSymbols ? 'green.500/10' : 'gray.800/50',
                    p: '3',
                  })}
                >
                  {analysis.hasSymbols ? (
                    <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  ) : (
                    <XCircle className={css({ h: '5', w: '5', color: 'gray.500' })} />
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
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>!@#$%^&*</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pattern Detection */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
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
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
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
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
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
                      <div className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>
                        {analysis.feedback.warning}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Suggestions */}
      {analysis && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
                    bg: 'purple.500/20',
                    color: 'purple.300',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    _hover: { bg: 'purple.500/30' },
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
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '3',
                    })}
                  >
                    <Lock
                      className={css({
                        h: '5',
                        w: '5',
                        color: 'purple.400',
                        flexShrink: '0',
                        mt: '0.5',
                      })}
                    />
                    <span className={css({ fontSize: 'sm', color: 'gray.300' })}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Security Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
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
      </motion.div>

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
