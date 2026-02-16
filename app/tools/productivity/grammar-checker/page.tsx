'use client'

import { AlertCircle, CheckCircle2, Copy, Loader2, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface GrammarIssue {
  text: string
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'clarity'
  message: string
  suggestion: string
  offset: number
  length: number
}

interface CheckResult {
  issues: GrammarIssue[]
  correctedText: string
  summary: Record<string, number>
  originalLength: number
  issueCount: number
}

const issueTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  grammar: { bg: 'red.500/10', text: 'red.300', border: 'red.500/30' },
  spelling: { bg: 'orange.500/10', text: 'orange.300', border: 'orange.500/30' },
  punctuation: { bg: 'yellow.500/10', text: 'yellow.300', border: 'yellow.500/30' },
  style: { bg: 'blue.500/10', text: 'blue.300', border: 'blue.500/30' },
  clarity: { bg: 'purple.500/10', text: 'purple.300', border: 'purple.500/30' },
}

export default function GrammarCheckerPage() {
  const [text, setText] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    trackToolEvent('grammar_checker_open', {})
  }, [])

  const handleCheck = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to check')
      return
    }

    setIsChecking(true)
    setError(null)
    setResult(null)
    setSelectedIssue(null)

    try {
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check grammar')
      }

      setResult(data)
      trackToolEvent('grammar_checker_check', {
        text_length: text.length,
        issue_count: data.issueCount,
      })

      if (data.issueCount === 0) {
        toast.success('Perfect! No issues found.')
      } else {
        toast.success(`Found ${data.issueCount} issue${data.issueCount === 1 ? '' : 's'}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check grammar'
      setError(errorMessage)
      toast.error(errorMessage)
      trackToolEvent('grammar_checker_error', { error: errorMessage })
    } finally {
      setIsChecking(false)
    }
  }

  const handleApplyFix = (issue: GrammarIssue, _index: number) => {
    const before = text.substring(0, issue.offset)
    const after = text.substring(issue.offset + issue.length)
    const newText = before + issue.suggestion + after

    setText(newText)
    setResult(null)
    toast.success('Fix applied! Check again to verify.')
    trackToolEvent('grammar_checker_apply_fix', { issue_type: issue.type })
  }

  const handleCopy = (textToCopy: string, label: string) => {
    navigator.clipboard.writeText(textToCopy)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setSelectedIssue(null)
    setError(null)
    toast.success('Cleared')
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
            borderColor: 'green.500/30',
            bg: 'green.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Type className={css({ h: '5', w: '5', color: 'green.400' })} />
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
          Grammar & Spell Checker
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Check your text for grammar, spelling, punctuation, and style issues. Get instant
          suggestions powered by AI.
        </p>
      </div>

      {/* Input Section */}
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
            borderColor: 'green.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Enter Your Text</CardTitle>
            <CardDescription>
              Paste or type your text to check for grammar and spelling issues
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className={css({
                w: 'full',
                minH: '64',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.800/50',
                px: '4',
                py: '3',
                fontSize: 'base',
                color: 'gray.200',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'all 0.2s',
                _focus: {
                  outline: 'none',
                  borderColor: 'green.500',
                  ring: '2px',
                  ringColor: 'green.500/20',
                },
                _placeholder: { color: 'white' },
              })}
            />

            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '3',
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <span className={css({ fontSize: 'sm', color: 'white' })}>
                  {text.length.toLocaleString()} / 10,000 characters
                </span>
                {text.length > 10000 && (
                  <Badge
                    className={css({
                      bg: 'red.500/20',
                      color: 'red.300',
                      border: '1px solid',
                      borderColor: 'red.500/30',
                    })}
                  >
                    Too long
                  </Badge>
                )}
              </div>

              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={handleClear}
                  disabled={!text}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'white',
                    _hover: { bg: 'gray.700' },
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCheck}
                  disabled={!text || isChecking || text.length > 10000}
                  className={css({
                    gap: '2',
                    bg: 'green.500',
                    color: 'white',
                    _hover: { bg: 'green.600' },
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className={css({ h: '4', w: '4', animation: 'spin' })} />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className={css({ h: '4', w: '4' })} />
                      Check Grammar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className={css({ animation: 'scaleIn 0.3s ease-out forwards', opacity: 0 })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'red.500/30',
              bg: 'red.500/10',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '4', pb: '4' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                <span className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Summary */}
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
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <CardTitle>Analysis Complete</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: {
                      base: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: '4',
                  })}
                >
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      p: '4',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', color: 'white', mb: '1' })}>
                      Total Issues
                    </div>
                    <div
                      className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.300' })}
                    >
                      {result.issueCount}
                    </div>
                  </div>

                  {Object.entries(result.summary).map(([type, count]) => (
                    <div
                      key={type}
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                      })}
                    >
                      <div className={css({ fontSize: 'sm', color: 'white', mb: '1' })}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                      <div
                        className={css({
                          fontSize: '2xl',
                          fontWeight: 'bold',
                          color: issueTypeColors[type]?.text || 'gray.300',
                        })}
                      >
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          {result.issues.length > 0 && (
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
                  borderColor: 'green.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>Issues Found</CardTitle>
                  <CardDescription>
                    Click on an issue to see details and apply fixes
                  </CardDescription>
                </CardHeader>
                <CardContent className={css({ spaceY: '3' })}>
                  {result.issues.map((issue, index) => {
                    const colors = issueTypeColors[issue.type] || issueTypeColors.style
                    const isSelected = selectedIssue === index
                    const issueKey = `${issue.offset}-${issue.text}-${issue.type}`

                    return (
                      <button
                        key={issueKey}
                        type="button"
                        className={css({
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: isSelected ? colors.border : 'gray.700',
                          bg: isSelected ? colors.bg : 'gray.800/50',
                          p: '4',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          textAlign: 'left',
                          w: 'full',
                          _hover: { bg: colors.bg, borderColor: colors.border },
                        })}
                        onClick={() => setSelectedIssue(isSelected ? null : index)}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'start',
                            justifyContent: 'space-between',
                            gap: '3',
                          })}
                        >
                          <div className={css({ flex: '1', spaceY: '2' })}>
                            <div
                              className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                            >
                              <Badge
                                className={css({
                                  bg: colors.bg,
                                  color: colors.text,
                                  border: '1px solid',
                                  borderColor: colors.border,
                                })}
                              >
                                {issue.type}
                              </Badge>
                              <span className={css({ fontSize: 'sm', color: 'white' })}>
                                "{issue.text}"
                              </span>
                            </div>

                            {isSelected && (
                              <div
                                className={css({
                                  spaceY: '2',
                                  mt: '3',
                                  animation: 'fadeIn 0.5s ease-out forwards',
                                  opacity: 0,
                                })}
                              >
                                <div className={css({ fontSize: 'sm', color: 'white' })}>
                                  {issue.message}
                                </div>
                                <div
                                  className={css({
                                    rounded: 'md',
                                    border: '1px solid',
                                    borderColor: 'green.500/30',
                                    bg: 'green.500/10',
                                    p: '3',
                                  })}
                                >
                                  <div
                                    className={css({ fontSize: 'xs', color: 'green.400', mb: '1' })}
                                  >
                                    Suggested Fix:
                                  </div>
                                  <div className={css({ fontSize: 'sm', color: 'green.300' })}>
                                    "{issue.suggestion}"
                                  </div>
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApplyFix(issue, index)
                                  }}
                                  className={css({
                                    gap: '2',
                                    bg: 'green.500',
                                    color: 'white',
                                    _hover: { bg: 'green.600' },
                                  })}
                                  size="sm"
                                >
                                  <CheckCircle2 className={css({ h: '4', w: '4' })} />
                                  Apply Fix
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Corrected Text */}
          {result.correctedText && result.issueCount > 0 && (
            <div
              className={css({
                animation: 'slideUp 0.5s ease-out forwards',
                animationDelay: '0.4s',
                opacity: 0,
              })}
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
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <CardTitle>Corrected Text</CardTitle>
                    <Button
                      onClick={() => handleCopy(result.correctedText, 'Corrected text')}
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'gray.700' },
                      })}
                      size="sm"
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'green.500/30',
                      bg: 'green.500/5',
                      p: '4',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      fontSize: 'base',
                      color: 'white',
                    })}
                  >
                    {result.correctedText}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Tips */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.5s',
          opacity: 0,
        })}
      >
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'teal.500/20',
            bg: 'rgba(20, 184, 166, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'teal.300',
            })}
          >
            Pro Tips
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Click on any issue to see detailed explanations and suggested fixes
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Apply fixes individually to maintain control over your writing style
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Use the corrected text as a reference or copy it directly to your clipboard
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Maximum text length: 10,000 characters per check
            </li>
          </ul>
        </div>
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
