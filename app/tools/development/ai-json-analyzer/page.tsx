'use client'

import { Brain, Check, Copy, Lightbulb, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface AnalysisResult {
  summary: string
  structure: string
  patterns: string[]
  insights: string[]
  relationships: string[]
}

function AIJsonAnalyzerContent() {
  const [jsonInput, setJsonInput] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('ai_json_open', {})
  }, [])

  const handleAnalyze = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data to analyze')
      return
    }

    // Validate JSON
    try {
      JSON.parse(jsonInput)
    } catch (_error) {
      toast.error('Invalid JSON format. Please check your input.')
      trackToolEvent('ai_json_error', {
        error: 'invalid_json',
      })
      return
    }

    setLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai-json-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonData: jsonInput.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze JSON')
      }

      setAnalysis({
        summary: data.summary,
        structure: data.structure,
        patterns: data.patterns || [],
        insights: data.insights || [],
        relationships: data.relationships || [],
      })

      toast.success('JSON analyzed successfully!')

      trackToolEvent('ai_json_analyze', {
        json_size: jsonInput.length,
        tokens: data.usage?.total_tokens || 0,
      })
    } catch (error) {
      console.error('Error analyzing JSON:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze JSON'
      toast.error(errorMessage)

      trackToolEvent('ai_json_error', {
        error: 'analysis_failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (analysis) {
      const fullAnalysis = `
Summary:
${analysis.summary}

Structure:
${analysis.structure}

Patterns:
${analysis.patterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Insights:
${analysis.insights.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}

Relationships:
${analysis.relationships.map((r, i) => `${i + 1}. ${r}`).join('\n')}
      `.trim()

      navigator.clipboard.writeText(fullAnalysis)
      toast.success('Analysis copied to clipboard')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      trackToolEvent('ai_json_copy', {})
    }
  }

  const handleClear = () => {
    setJsonInput('')
    setAnalysis(null)
    setCopied(false)
  }

  const handleLoadExample = () => {
    const exampleJson = {
      users: [
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'admin',
          orders: [
            { orderId: 'A123', total: 250.5, status: 'completed' },
            { orderId: 'A124', total: 89.99, status: 'pending' },
          ],
        },
        {
          id: 2,
          name: 'Bob Smith',
          email: 'bob@example.com',
          role: 'user',
          orders: [{ orderId: 'B456', total: 150.0, status: 'completed' }],
        },
      ],
      metadata: {
        totalUsers: 2,
        generatedAt: '2025-01-15T10:30:00Z',
      },
    }
    setJsonInput(JSON.stringify(exampleJson, null, 2))
    toast.success('Example JSON loaded')
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
          <Brain className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            AI-Powered • Pattern Detection • Debug Insights
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'indigo.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI JSON Analyzer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Understand complex JSON structures with AI-powered analysis. Get natural language
          summaries, detect patterns, explain data relationships, and debug JSON with GPT
          intelligence.
        </p>
      </div>

      {/* JSON Input Section */}
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
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Enter Your JSON</CardTitle>
            <CardDescription>
              Paste your JSON data and let AI analyze its structure and patterns
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"users": [{"id": 1, "name": "Alice", "role": "admin"}], "metadata": {"count": 1}}'
              className={css({
                minH: '64',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
                color: 'gray.200',
                fontFamily: 'mono',
                fontSize: 'sm',
                resize: 'vertical',
                _focus: {
                  borderColor: 'blue.500/50',
                  outline: 'none',
                },
              })}
            />

            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !jsonInput.trim()}
                className={css({
                  flex: '1',
                  gap: '2',
                  h: '12',
                  bg: 'blue.500',
                  color: 'white',
                  fontWeight: 'semibold',
                  _hover: { bg: 'blue.600' },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                {loading ? (
                  <>
                    <div
                      className={css({
                        display: 'inline-block',
                        rounded: 'full',
                        border: '2px solid',
                        borderColor: 'white',
                        borderTopColor: 'transparent',
                        h: '5',
                        w: '5',
                        animation: 'spin 1s linear infinite',
                      })}
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className={css({ h: '5', w: '5' })} />
                    Analyze JSON
                  </>
                )}
              </Button>

              <Button
                onClick={handleLoadExample}
                disabled={loading}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'white',
                  _hover: { bg: 'gray.700' },
                  _disabled: { opacity: '0.5' },
                })}
              >
                Load Example
              </Button>

              {analysis && (
                <Button
                  onClick={handleClear}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'white',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div
          className={css({
            spaceY: '6',
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0,
          })}
        >
          {/* Summary Card */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
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
                  <Check className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <CardTitle>Analysis Complete</CardTitle>
                </div>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: copied ? 'green.500/20' : 'gray.800',
                    color: copied ? 'green.400' : 'gray.400',
                    _hover: {
                      bg: copied ? 'green.500/30' : 'gray.700',
                      color: copied ? 'green.400' : 'blue.400',
                    },
                  })}
                >
                  {copied ? (
                    <>
                      <Check className={css({ h: '4', w: '4' })} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Summary */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'blue.500/20',
                  bg: 'blue.500/5',
                  p: '4',
                })}
              >
                <h3
                  className={css({
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'blue.300',
                    mb: '3',
                  })}
                >
                  Summary
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                  {analysis.summary}
                </p>
              </div>

              {/* Structure */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'purple.500/20',
                  bg: 'purple.500/5',
                  p: '4',
                })}
              >
                <h3
                  className={css({
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'purple.300',
                    mb: '3',
                  })}
                >
                  Structure Analysis
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white', lineHeight: '1.6' })}>
                  {analysis.structure}
                </p>
              </div>

              {/* Patterns */}
              {analysis.patterns.length > 0 && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'orange.500/20',
                    bg: 'orange.500/5',
                    p: '4',
                  })}
                >
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'orange.300',
                      mb: '3',
                    })}
                  >
                    Detected Patterns
                  </h3>
                  <ul className={css({ spaceY: '2' })}>
                    {analysis.patterns.map((pattern) => (
                      <li
                        key={pattern}
                        className={css({
                          fontSize: 'sm',
                          color: 'white',
                          pl: '4',
                          position: 'relative',
                          _before: {
                            content: '"•"',
                            position: 'absolute',
                            left: '0',
                            color: 'orange.400',
                          },
                        })}
                      >
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'cyan.500/20',
                    bg: 'cyan.500/5',
                    p: '4',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'start', gap: '3', mb: '3' })}>
                    <Lightbulb className={css({ h: '5', w: '5', color: 'cyan.400', mt: '0.5' })} />
                    <h3
                      className={css({
                        fontSize: 'lg',
                        fontWeight: 'semibold',
                        color: 'cyan.300',
                      })}
                    >
                      Insights & Recommendations
                    </h3>
                  </div>
                  <ul className={css({ spaceY: '2' })}>
                    {analysis.insights.map((insight) => (
                      <li
                        key={insight}
                        className={css({
                          fontSize: 'sm',
                          color: 'white',
                          pl: '4',
                          position: 'relative',
                          _before: {
                            content: '"•"',
                            position: 'absolute',
                            left: '0',
                            color: 'cyan.400',
                          },
                        })}
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relationships */}
              {analysis.relationships.length > 0 && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'green.500/20',
                    bg: 'green.500/5',
                    p: '4',
                  })}
                >
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'green.300',
                      mb: '3',
                    })}
                  >
                    Data Relationships
                  </h3>
                  <ul className={css({ spaceY: '2' })}>
                    {analysis.relationships.map((relationship) => (
                      <li
                        key={relationship}
                        className={css({
                          fontSize: 'sm',
                          color: 'white',
                          pl: '4',
                          position: 'relative',
                          _before: {
                            content: '"•"',
                            position: 'absolute',
                            left: '0',
                            color: 'green.400',
                          },
                        })}
                      >
                        {relationship}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <div className={css({ animation: 'slideUp 0.5s ease-out forwards', opacity: 0 })}>
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'indigo.500/20',
            bg: 'indigo.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Brain className={css({ h: '6', w: '6', color: 'indigo.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3
                  className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'indigo.300' })}
                >
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                  <li>• Works best with structured JSON data from APIs, configs, or databases</li>
                  <li>
                    • AI can detect nested relationships, array patterns, and data inconsistencies
                  </li>
                  <li>
                    • Use insights to optimize your data structure or identify potential issues
                  </li>
                  <li>• Try the example JSON to see what kind of analysis you can expect</li>
                  <li>• All analysis uses OpenAI GPT models - ensure your API key is configured</li>
                  <li>• Your JSON data is processed securely and not stored on our servers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function AIJsonAnalyzerPage() {
  return <AIJsonAnalyzerContent />
}
