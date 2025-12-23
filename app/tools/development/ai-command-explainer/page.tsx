'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Lightbulb,
  Loader2,
  MessageSquare,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface ExplanationResult {
  commandType: string
  overallPurpose: string
  breakdown: Array<{ part: string; explanation: string }>
  parameters: Array<{ parameter: string; description: string }>
  safetyWarnings: string[]
  alternatives: string[]
}

const EXAMPLE_COMMANDS = [
  {
    title: 'Docker Container Management',
    command: 'docker run -d -p 8080:80 --name myapp -v /data:/app/data nginx:latest',
  },
  {
    title: 'Git Interactive Rebase',
    command: 'git rebase -i HEAD~5 && git push --force-with-lease origin main',
  },
  {
    title: 'Find and Delete Files',
    command: 'find . -name "*.log" -type f -mtime +30 -exec rm {} \\;',
  },
  {
    title: 'Kubernetes Pod Inspection',
    command: 'kubectl get pods -n production -l app=backend -o jsonpath="{.items[*].status.podIP}"',
  },
]

function AICommandExplainerContent() {
  const [command, setCommand] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('ai_command_explainer_open', {})
  }, [])

  const handleExplain = async () => {
    if (!command.trim()) {
      toast.error('Please enter a command to explain')
      return
    }

    setIsLoading(true)
    setError(null)
    setExplanation(null)

    try {
      const response = await fetch('/api/ai-command-explainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain command')
      }

      setExplanation(data)
      toast.success('Command explained successfully!')

      trackToolEvent('ai_command_explainer_explain', {
        command_type: data.commandType,
        has_warnings: data.safetyWarnings.length > 0,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to explain command'
      setError(errorMessage)
      toast.error(errorMessage)

      trackToolEvent('ai_command_explainer_error', {
        error: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(command)
    toast.success('Command copied to clipboard!')

    trackToolEvent('ai_command_explainer_copy', {})
  }

  const handleLoadExample = (exampleCommand: string) => {
    setCommand(exampleCommand)
    setExplanation(null)
    setError(null)
    toast.success('Example loaded!')

    trackToolEvent('ai_command_explainer_load_example', {})
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
          <MessageSquare className={css({ h: '5', w: '5', color: 'green.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.300' })}>
            AI-Powered • GPT-4o-mini
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
          Understand complex CLI commands with AI assistance. Get detailed breakdowns, parameter
          explanations, safety warnings, and alternative suggestions.
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
            <CardDescription>Paste any CLI command to get a detailed explanation</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ position: 'relative' })}>
              <Terminal
                className={css({
                  position: 'absolute',
                  left: '3',
                  top: '3',
                  h: '5',
                  w: '5',
                  color: 'gray.500',
                  pointerEvents: 'none',
                })}
              />
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g., docker run -d -p 8080:80 nginx:latest"
                rows={4}
                className={css({
                  w: 'full',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  px: '10',
                  py: '3',
                  fontSize: 'base',
                  fontFamily: 'mono',
                  color: 'gray.200',
                  resize: 'vertical',
                  transition: 'all 0.2s',
                  _focus: {
                    outline: 'none',
                    borderColor: 'green.500',
                    ring: '2px',
                    ringColor: 'green.500/20',
                  },
                  _placeholder: { color: 'gray.500' },
                })}
              />
            </div>

            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleExplain}
                disabled={isLoading || !command.trim()}
                className={css({
                  gap: '2',
                  bg: 'green.500/20',
                  border: '1px solid',
                  borderColor: 'green.500/50',
                  color: 'green.300',
                  _hover: {
                    bg: 'green.500/30',
                    borderColor: 'green.500/70',
                  },
                  _disabled: {
                    opacity: '0.5',
                    cursor: 'not-allowed',
                  },
                })}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={css({ h: '4', w: '4', animation: 'spin' })} />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Sparkles className={css({ h: '4', w: '4' })} />
                    Explain Command
                  </>
                )}
              </Button>

              <Button
                onClick={handleCopyCommand}
                disabled={!command.trim()}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'gray.400',
                  _hover: { bg: 'gray.700' },
                  _disabled: {
                    opacity: '0.5',
                    cursor: 'not-allowed',
                  },
                })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy
              </Button>
            </div>

            {error && (
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'red.500/30',
                  bg: 'red.500/10',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <AlertTriangle className={css({ h: '5', w: '5', color: 'red.400' })} />
                  <span className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Example Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Example Commands</CardTitle>
            <CardDescription>
              Try these complex commands to see detailed explanations
            </CardDescription>
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
                  key={example.command}
                  type="button"
                  onClick={() => handleLoadExample(example.command)}
                  className={css({
                    textAlign: 'left',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    _hover: {
                      bg: 'gray.800',
                      borderColor: 'teal.500/50',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <h4
                      className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'teal.300' })}
                    >
                      {example.title}
                    </h4>
                    <code
                      className={css({
                        display: 'block',
                        fontSize: 'xs',
                        fontFamily: 'mono',
                        color: 'gray.400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {example.command}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Explanation Results */}
      {explanation && (
        <>
          {/* Overall Purpose */}
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
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <CardTitle>Command Type: {explanation.commandType}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className={css({ fontSize: 'base', color: 'gray.300', lineHeight: '1.8' })}>
                  {explanation.overallPurpose}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Safety Warnings */}
          {explanation.safetyWarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'red.500/30',
                  bg: 'red.500/5',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <AlertTriangle className={css({ h: '5', w: '5', color: 'red.400' })} />
                    <CardTitle className={css({ color: 'red.300' })}>Safety Warnings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className={css({ spaceY: '2' })}>
                    {explanation.safetyWarnings.map((warning) => (
                      <li
                        key={warning}
                        className={css({
                          fontSize: 'sm',
                          color: 'red.200',
                          pl: '4',
                          position: 'relative',
                          _before: {
                            content: '"⚠"',
                            position: 'absolute',
                            left: '0',
                          },
                        })}
                      >
                        {warning}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Command Breakdown */}
          {explanation.breakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'teal.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <BookOpen className={css({ h: '5', w: '5', color: 'teal.400' })} />
                    <CardTitle>Command Breakdown</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={css({ spaceY: '4' })}>
                    {explanation.breakdown.map((item) => (
                      <div
                        key={item.part}
                        className={css({
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '4',
                        })}
                      >
                        <code
                          className={css({
                            display: 'block',
                            fontSize: 'sm',
                            fontFamily: 'mono',
                            fontWeight: 'bold',
                            color: 'teal.300',
                            mb: '2',
                          })}
                        >
                          {item.part}
                        </code>
                        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Parameters */}
          {explanation.parameters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'cyan.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>Parameters & Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={css({ spaceY: '3' })}>
                    {explanation.parameters.map((param) => (
                      <div
                        key={param.parameter}
                        className={css({
                          display: 'flex',
                          gap: '3',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '3',
                        })}
                      >
                        <Badge
                          className={css({
                            bg: 'cyan.500/20',
                            color: 'cyan.300',
                            border: '1px solid',
                            borderColor: 'cyan.500/30',
                            fontFamily: 'mono',
                            fontSize: 'xs',
                            flexShrink: '0',
                          })}
                        >
                          {param.parameter}
                        </Badge>
                        <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          {param.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Alternatives */}
          {explanation.alternatives.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'yellow.500/20',
                  bg: 'yellow.500/5',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <Lightbulb className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                    <CardTitle>Alternative Suggestions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className={css({ spaceY: '2' })}>
                    {explanation.alternatives.map((alt) => (
                      <li
                        key={alt}
                        className={css({
                          fontSize: 'sm',
                          color: 'gray.300',
                          pl: '4',
                          position: 'relative',
                          _before: {
                            content: '"💡"',
                            position: 'absolute',
                            left: '0',
                          },
                        })}
                      >
                        {alt}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'green.500/20',
            bg: 'green.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'green.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'green.300' })}>
                  How It Works
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• AI analyzes your command and identifies the shell/tool type</li>
                  <li>• Get detailed breakdowns of each command component</li>
                  <li>• Understand what each flag and parameter does</li>
                  <li>• Receive safety warnings for potentially dangerous operations</li>
                  <li>• Discover safer or more efficient alternatives</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function AICommandExplainerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AICommandExplainerContent />
    </Suspense>
  )
}
