'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  FileCode,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface CommandExplanation {
  summary: string
  breakdown: Array<{
    component: string
    explanation: string
  }>
  warnings: string[]
  alternatives: string[]
  commandType: string
}

const EXAMPLE_COMMANDS = [
  {
    label: 'Git Force Push',
    command: 'git push origin main --force',
    type: 'git',
  },
  {
    label: 'Docker Multi-Stage',
    command: 'docker build --target production -t myapp:latest .',
    type: 'docker',
  },
  {
    label: 'Find & Delete',
    command: 'find . -name "*.log" -type f -delete',
    type: 'bash',
  },
  {
    label: 'Kubectl Scale',
    command: 'kubectl scale deployment/nginx --replicas=3',
    type: 'k8s',
  },
]

function AICommandExplainerContent() {
  const [command, setCommand] = useState('')
  const [explanation, setExplanation] = useState<CommandExplanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Track page visit
  useEffect(() => {
    trackEvent({ action: 'open', category: 'ai_command_explainer' })
  }, [])

  const handleExplain = async () => {
    if (!command.trim()) {
      toast.error('Please enter a command to explain')
      return
    }

    setLoading(true)
    setExplanation(null)

    try {
      const response = await fetch('/api/ai-command-explainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain command')
      }

      setExplanation({
        summary: data.summary,
        breakdown: data.breakdown,
        warnings: data.warnings || [],
        alternatives: data.alternatives || [],
        commandType: data.commandType,
      })

      toast.success('Command explained successfully!')

      trackEvent({
        action: 'explain',
        category: 'ai_command_explainer',
        label: data.commandType,
        value: data.usage?.total_tokens || 0,
      })
    } catch (error) {
      console.error('Error explaining command:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to explain command'
      toast.error(errorMessage)

      trackEvent({
        action: 'error',
        category: 'ai_command_explainer',
        label: 'explanation_failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    trackEvent({ action: 'copy', category: 'ai_command_explainer' })
  }

  const handleClear = () => {
    setCommand('')
    setExplanation(null)
    setCopied(false)
  }

  const handleLoadExample = (exampleCommand: string) => {
    setCommand(exampleCommand)
    setExplanation(null)

    trackEvent({ action: 'load_example', category: 'ai_command_explainer' })
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
            borderColor: 'green.500/30',
            bg: 'green.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'green.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.300' })}>
            Powered by AI • Bash, Git, Docker, kubectl
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'green.400',
            gradientVia: 'teal.400',
            gradientTo: 'cyan.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Command Explainer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Understand complex CLI commands in plain English. Get detailed breakdowns, safety
          warnings, and alternative suggestions powered by AI.
        </p>
      </motion.div>

      {/* Command Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'green.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Enter Command</CardTitle>
            <CardDescription>
              Paste any bash, git, docker, kubectl, or other CLI command for detailed explanation
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              placeholder="e.g., git push origin main --force&#10;docker run -d -p 8080:80 nginx&#10;find . -name '*.log' -type f -delete"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className={css({
                minH: '32',
                fontFamily: 'mono',
                fontSize: 'sm',
                bg: 'gray.950/50',
                border: '1px solid',
                borderColor: 'gray.700',
                _focus: {
                  borderColor: 'green.500',
                  ring: '2px',
                  ringColor: 'green.500/20',
                },
              })}
            />

            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                gap: '3',
                justifyContent: 'space-between',
              })}
            >
              <Button
                onClick={handleExplain}
                disabled={loading || !command.trim()}
                className={css({
                  flex: { sm: '1' },
                  gap: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'green.500',
                  gradientTo: 'teal.500',
                  color: 'white',
                  _hover: {
                    opacity: 0.9,
                    transform: 'translateY(-1px)',
                  },
                  _disabled: {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                })}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                    >
                      <MessageSquare className={css({ h: '5', w: '5' })} />
                    </motion.div>
                    Explaining...
                  </>
                ) : (
                  <>
                    <MessageSquare className={css({ h: '5', w: '5' })} />
                    Explain Command
                  </>
                )}
              </Button>

              {(command || explanation) && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className={css({
                    gap: '2',
                    borderColor: 'gray.700',
                    color: 'gray.400',
                    _hover: {
                      bg: 'gray.800',
                      borderColor: 'gray.600',
                    },
                  })}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Example Commands */}
      {!explanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Lightbulb className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                Example Commands
              </CardTitle>
              <CardDescription>Click an example to try it out</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                {EXAMPLE_COMMANDS.map((example) => (
                  <button
                    type="button"
                    key={example.command}
                    onClick={() => handleLoadExample(example.command)}
                    className={css({
                      p: '4',
                      textAlign: 'left',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700/50',
                      bg: 'gray.800/30',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      _hover: {
                        borderColor: 'green.500/50',
                        bg: 'gray.800/50',
                        transform: 'translateY(-2px)',
                      },
                    })}
                  >
                    <div
                      className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}
                    >
                      <Badge
                        className={css({
                          fontSize: 'xs',
                          bg: 'green.500/20',
                          color: 'green.300',
                          border: 'none',
                        })}
                      >
                        {example.type}
                      </Badge>
                      <span
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                      >
                        {example.label}
                      </span>
                    </div>
                    <code
                      className={css({
                        display: 'block',
                        fontFamily: 'mono',
                        fontSize: 'xs',
                        color: 'gray.400',
                        overflowX: 'auto',
                      })}
                    >
                      {example.command}
                    </code>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Explanation Result */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={css({ spaceY: '6' })}
        >
          {/* Summary */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <Terminal className={css({ h: '5', w: '5', color: 'green.400' })} />
                <div className={css({ flex: '1' })}>
                  <CardTitle>Command Summary</CardTitle>
                  <CardDescription>
                    <Badge
                      className={css({
                        mt: '2',
                        fontSize: 'xs',
                        bg: 'green.500/20',
                        color: 'green.300',
                        border: 'none',
                      })}
                    >
                      {explanation.commandType}
                    </Badge>
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleCopy(command)}
                  size="sm"
                  variant="outline"
                  className={css({
                    gap: '2',
                    borderColor: 'gray.700',
                    color: 'gray.400',
                    _hover: {
                      bg: 'gray.800',
                      borderColor: 'gray.600',
                    },
                  })}
                >
                  {copied ? (
                    <Check className={css({ h: '4', w: '4' })} />
                  ) : (
                    <Copy className={css({ h: '4', w: '4' })} />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className={css({ fontSize: 'base', color: 'gray.300', lineHeight: 'relaxed' })}>
                {explanation.summary}
              </p>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <FileCode className={css({ h: '5', w: '5', color: 'cyan.400' })} />
                Command Breakdown
              </CardTitle>
              <CardDescription>
                Detailed explanation of each component and parameter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '4' })}>
                {explanation.breakdown.map((item, idx) => (
                  <div
                    key={`${item.component}-${idx}`}
                    className={css({
                      p: '4',
                      rounded: 'lg',
                      bg: 'gray.800/30',
                      border: '1px solid',
                      borderColor: 'gray.700/30',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minW: '6',
                          h: '6',
                          rounded: 'full',
                          bg: 'green.500/20',
                          color: 'green.300',
                          fontSize: 'xs',
                          fontWeight: 'bold',
                        })}
                      >
                        {idx + 1}
                      </div>
                      <div className={css({ flex: '1', minW: '0' })}>
                        <code
                          className={css({
                            display: 'block',
                            fontFamily: 'mono',
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'cyan.300',
                            mb: '2',
                            overflowX: 'auto',
                          })}
                        >
                          {item.component}
                        </code>
                        <p
                          className={css({
                            fontSize: 'sm',
                            color: 'gray.400',
                            lineHeight: 'relaxed',
                          })}
                        >
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {explanation.warnings.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'red.500/30',
                bg: 'red.950/30',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <AlertTriangle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  Safety Warnings
                </CardTitle>
                <CardDescription>
                  Important considerations before running this command
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={css({ spaceY: '3' })}>
                  {explanation.warnings.map((warning, idx) => (
                    <div
                      key={`warning-${idx}-${warning.substring(0, 20)}`}
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        bg: 'red.950/50',
                        border: '1px solid',
                        borderColor: 'red.500/20',
                      })}
                    >
                      <AlertTriangle
                        className={css({ h: '5', w: '5', color: 'red.400', flexShrink: '0' })}
                      />
                      <p
                        className={css({ fontSize: 'sm', color: 'red.200', lineHeight: 'relaxed' })}
                      >
                        {warning}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternatives */}
          {explanation.alternatives.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'blue.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <ArrowRight className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  Alternative Commands
                </CardTitle>
                <CardDescription>Safer or more efficient alternatives to consider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={css({ spaceY: '3' })}>
                  {explanation.alternatives.map((alt, idx) => (
                    <div
                      key={`alt-${idx}-${alt.substring(0, 20)}`}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        bg: 'gray.800/30',
                        border: '1px solid',
                        borderColor: 'gray.700/30',
                      })}
                    >
                      <code
                        className={css({
                          flex: '1',
                          fontFamily: 'mono',
                          fontSize: 'sm',
                          color: 'blue.300',
                          overflowX: 'auto',
                        })}
                      >
                        {alt}
                      </code>
                      <Button
                        onClick={() => handleCopy(alt)}
                        size="sm"
                        variant="ghost"
                        aria-label="Copy alternative command"
                        className={css({
                          gap: '2',
                          color: 'gray.400',
                          _hover: {
                            bg: 'gray.700',
                            color: 'white',
                          },
                        })}
                      >
                        <Copy className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'green.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Lightbulb className={css({ h: '5', w: '5', color: 'yellow.400' })} />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3' })}>
              {[
                'Use this tool before running unfamiliar commands to understand their impact',
                'Pay attention to safety warnings for destructive commands',
                'Try alternative suggestions for safer or more efficient approaches',
                'Copy breakdown components to learn command syntax step by step',
              ].map((tip) => (
                <li
                  key={tip.substring(0, 30)}
                  className={css({
                    display: 'flex',
                    alignItems: 'start',
                    gap: '3',
                    fontSize: 'sm',
                    color: 'gray.400',
                  })}
                >
                  <Check className={css({ h: '5', w: '5', color: 'green.400', flexShrink: '0' })} />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

export default function AICommandExplainerPage() {
  return (
    <Suspense fallback={null}>
      <AICommandExplainerContent />
    </Suspense>
  )
}
