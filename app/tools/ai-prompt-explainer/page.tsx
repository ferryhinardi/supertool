'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface PromptAnalysis {
  analysis: string
  structure: {
    clarity: number
    specificity: number
    context: number
  }
  suggestions: string[]
  bestPractices: string[]
  optimizedPrompt: string
}

const EXAMPLE_PROMPTS = [
  {
    label: 'Content Writing',
    prompt: 'Write an article about AI',
    category: 'general',
  },
  {
    label: 'Code Generation',
    prompt: 'Create a function to sort an array',
    category: 'technical',
  },
  {
    label: 'Data Analysis',
    prompt: 'Analyze this dataset and tell me insights',
    category: 'analytical',
  },
  {
    label: 'Creative Writing',
    prompt: 'Write a story',
    category: 'creative',
  },
]

function AIPromptExplainerContent() {
  const [prompt, setPrompt] = useState('')
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Track page visit
  useEffect(() => {
    trackEvent({ action: 'open', category: 'ai_prompt_explainer' })
  }, [])

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to analyze')
      return
    }

    setLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai-prompt-explainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze prompt')
      }

      setAnalysis({
        analysis: data.analysis,
        structure: data.structure,
        suggestions: data.suggestions || [],
        bestPractices: data.bestPractices || [],
        optimizedPrompt: data.optimizedPrompt,
      })

      toast.success('Prompt analyzed successfully!')

      trackEvent({
        action: 'analyze',
        category: 'ai_prompt_explainer',
        value: data.usage?.total_tokens || 0,
      })
    } catch (error) {
      console.error('Error analyzing prompt:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze prompt'
      toast.error(errorMessage)

      trackEvent({
        action: 'error',
        category: 'ai_prompt_explainer',
        label: 'analysis_failed',
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

    trackEvent({ action: 'copy', category: 'ai_prompt_explainer' })
  }

  const handleClear = () => {
    setPrompt('')
    setAnalysis(null)
    setCopied(false)
  }

  const handleLoadExample = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    setAnalysis(null)

    trackEvent({ action: 'load_example', category: 'ai_prompt_explainer' })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'green.400'
    if (score >= 6) return 'yellow.400'
    return 'red.400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'green.500/20'
    if (score >= 6) return 'yellow.500/20'
    return 'red.500/20'
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
            borderColor: 'purple.500/30',
            bg: 'purple.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            Powered by AI • Prompt Engineering Best Practices
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Prompt Explainer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Analyze and optimize your AI prompts for better results. Get expert insights on clarity,
          structure, and effectiveness with AI-powered analysis.
        </p>
      </motion.div>

      {/* Prompt Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Enter Your Prompt</CardTitle>
            <CardDescription>
              Paste any AI prompt to get detailed analysis and optimization suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              placeholder="e.g., Write a blog post about machine learning&#10;Create a Python function that processes user data&#10;Explain quantum computing to a beginner"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={css({
                minH: '32',
                fontSize: 'sm',
                bg: 'gray.950/50',
                border: '1px solid',
                borderColor: 'gray.700',
                _focus: {
                  borderColor: 'purple.500',
                  ring: '2px',
                  ringColor: 'purple.500/20',
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
                onClick={handleAnalyze}
                disabled={loading || !prompt.trim()}
                className={css({
                  flex: { sm: '1' },
                  gap: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.500',
                  gradientTo: 'pink.500',
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MessageSquare className={css({ h: '5', w: '5' })} />
                    Analyze Prompt
                  </>
                )}
              </Button>

              {(prompt || analysis) && (
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

      {/* Example Prompts */}
      {!analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
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
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Lightbulb className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                Example Prompts
              </CardTitle>
              <CardDescription>Click an example to analyze it</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    type="button"
                    key={example.prompt}
                    onClick={() => handleLoadExample(example.prompt)}
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
                        borderColor: 'purple.500/50',
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
                          bg: 'purple.500/20',
                          color: 'purple.300',
                          border: 'none',
                        })}
                      >
                        {example.category}
                      </Badge>
                      <span
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                      >
                        {example.label}
                      </span>
                    </div>
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.400',
                        lineHeight: 'relaxed',
                      })}
                    >
                      {example.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={css({ spaceY: '6' })}
        >
          {/* Overall Analysis */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Target className={css({ h: '5', w: '5', color: 'purple.400' })} />
                Overall Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={css({ fontSize: 'base', color: 'gray.300', lineHeight: 'relaxed' })}>
                {analysis.analysis}
              </p>
            </CardContent>
          </Card>

          {/* Structure Scores */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Zap className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                Prompt Quality Scores
              </CardTitle>
              <CardDescription>Evaluation of your prompt structure and clarity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '4' })}>
                {Object.entries(analysis.structure).map(([key, score]) => (
                  <div key={key} className={css({ spaceY: '2' })}>
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.300',
                          textTransform: 'capitalize',
                        })}
                      >
                        {key}
                      </span>
                      <Badge
                        className={css({
                          fontSize: 'xs',
                          bg: getScoreBgColor(score),
                          color: getScoreColor(score),
                          border: 'none',
                        })}
                      >
                        {score}/10
                      </Badge>
                    </div>
                    <div
                      className={css({
                        h: '2',
                        rounded: 'full',
                        bg: 'gray.800',
                        overflow: 'hidden',
                      })}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 10}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={css({
                          h: 'full',
                          rounded: 'full',
                        })}
                        style={{
                          backgroundColor: `var(--colors-${getScoreColor(score).replace('.', '-')})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
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
                  <Lightbulb className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  Improvement Suggestions
                </CardTitle>
                <CardDescription>Ways to enhance your prompt effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={css({ spaceY: '3' })}>
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div
                      key={`suggestion-${idx}-${suggestion.substring(0, 20)}`}
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        bg: 'gray.800/30',
                        border: '1px solid',
                        borderColor: 'gray.700/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minW: '6',
                          h: '6',
                          rounded: 'full',
                          bg: 'blue.500/20',
                          color: 'blue.300',
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          flexShrink: '0',
                        })}
                      >
                        {idx + 1}
                      </div>
                      <p
                        className={css({
                          fontSize: 'sm',
                          color: 'gray.300',
                          lineHeight: 'relaxed',
                        })}
                      >
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Best Practices */}
          {analysis.bestPractices.length > 0 && (
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
                  <Check className={css({ h: '5', w: '5', color: 'green.400' })} />
                  Best Practices Applied
                </CardTitle>
                <CardDescription>Prompt engineering principles in your prompt</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className={css({ spaceY: '2' })}>
                  {analysis.bestPractices.map((practice, idx) => (
                    <li
                      key={`practice-${idx}-${practice.substring(0, 20)}`}
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        gap: '3',
                        fontSize: 'sm',
                        color: 'gray.300',
                      })}
                    >
                      <Check
                        className={css({ h: '5', w: '5', color: 'green.400', flexShrink: '0' })}
                      />
                      {practice}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Optimized Prompt */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <div className={css({ flex: '1' })}>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <ArrowRight className={css({ h: '5', w: '5', color: 'purple.400' })} />
                    Optimized Prompt
                  </CardTitle>
                  <CardDescription>AI-improved version for better results</CardDescription>
                </div>
                <Button
                  onClick={() => handleCopy(analysis.optimizedPrompt)}
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
              <p
                className={css({
                  p: '4',
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'purple.500/20',
                  fontSize: 'sm',
                  color: 'gray.200',
                  lineHeight: 'relaxed',
                  whiteSpace: 'pre-wrap',
                })}
              >
                {analysis.optimizedPrompt}
              </p>
            </CardContent>
          </Card>
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
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <AlertCircle className={css({ h: '5', w: '5', color: 'yellow.400' })} />
              Pro Tips for Better Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3' })}>
              {[
                'Be specific and clear about what you want the AI to do',
                'Provide context and background information when relevant',
                'Use examples to illustrate the format or style you need',
                'Break complex tasks into smaller, manageable steps',
                'Specify constraints like length, tone, or target audience',
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
                  <Check
                    className={css({ h: '5', w: '5', color: 'purple.400', flexShrink: '0' })}
                  />
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

export default function AIPromptExplainerPage() {
  return (
    <Suspense fallback={null}>
      <AIPromptExplainerContent />
    </Suspense>
  )
}
