'use client'

import { motion } from 'framer-motion'
import { Braces, Check, Code, Copy, Lightbulb, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface SnippetResult {
  code: string
  language: string
  explanation: string
}

type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'sql'
  | 'bash'
  | 'regex'

const LANGUAGES: {
  value: ProgrammingLanguage
  label: string
  icon: typeof Code
}[] = [
  { value: 'javascript', label: 'JavaScript', icon: Code },
  { value: 'typescript', label: 'TypeScript', icon: Code },
  { value: 'python', label: 'Python', icon: Code },
  { value: 'java', label: 'Java', icon: Code },
  { value: 'go', label: 'Go', icon: Code },
  { value: 'rust', label: 'Rust', icon: Code },
  { value: 'php', label: 'PHP', icon: Code },
  { value: 'ruby', label: 'Ruby', icon: Code },
  { value: 'sql', label: 'SQL', icon: Code },
  { value: 'bash', label: 'Bash', icon: Code },
  { value: 'regex', label: 'RegEx', icon: Code },
]

function AISnippetGeneratorContent() {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState<ProgrammingLanguage>('javascript')
  const [snippet, setSnippet] = useState<SnippetResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('ai_snippet_open', {})
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description of what you want to generate')
      return
    }

    setLoading(true)
    setSnippet(null)

    try {
      const response = await fetch('/api/ai-snippet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate snippet')
      }

      setSnippet({
        code: data.code,
        language: data.language,
        explanation: data.explanation,
      })

      toast.success('Code snippet generated successfully!')

      trackToolEvent('ai_snippet_generate', {
        language,
        prompt_length: prompt.length,
        tokens: data.usage?.total_tokens || 0,
      })
    } catch (error) {
      console.error('Error generating snippet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate snippet'
      toast.error(errorMessage)

      trackToolEvent('ai_snippet_error', {
        error: 'generation_failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code)
      toast.success('Code copied to clipboard')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      trackToolEvent('ai_snippet_copy', { language })
    }
  }

  const handleClear = () => {
    setPrompt('')
    setSnippet(null)
    setCopied(false)
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
            borderColor: 'orange.500/30',
            bg: 'orange.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Braces className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            AI-Powered • Multi-Language • Context-Aware
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'amber.400',
            gradientTo: 'yellow.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Snippet Generator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Generate code snippets instantly with AI. Create functions, classes, regex patterns, SQL
          queries, and more. Describe what you need, and let AI write the code for you.
        </p>
      </motion.div>

      {/* Prompt Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Describe Your Code</CardTitle>
            <CardDescription>
              Tell us what you want to create and we'll generate the code for you
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a function that validates an email address using regex&#10;Example: Write a SQL query to find the top 5 customers by total purchases&#10;Example: Generate a Python function to calculate fibonacci numbers"
              className={css({
                minH: '32',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
                color: 'gray.200',
                fontFamily: 'mono',
                fontSize: 'sm',
                resize: 'vertical',
                _focus: {
                  borderColor: 'orange.500/50',
                  outline: 'none',
                },
              })}
            />

            {/* Language Selection */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                Programming Language
              </div>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(6, 1fr)',
                  },
                  gap: '2',
                  w: 'full',
                })}
              >
                {LANGUAGES.map((lang) => {
                  const isActive = language === lang.value
                  return (
                    <Button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: isActive ? 'orange.500/20' : 'gray.800/50',
                        border: '1px solid',
                        borderColor: isActive ? 'orange.500/50' : 'gray.700/50',
                        color: isActive ? 'orange.300' : 'gray.400',
                        transition: 'all 0.2s',
                        _hover: {
                          bg: isActive ? 'orange.500/30' : 'gray.800',
                          borderColor: isActive ? 'orange.500/70' : 'gray.600',
                        },
                      })}
                    >
                      {lang.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className={css({ display: 'flex', gap: '3' })}>
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={css({
                  flex: '1',
                  gap: '2',
                  h: '12',
                  bg: 'orange.500',
                  color: 'white',
                  fontWeight: 'semibold',
                  _hover: { bg: 'orange.600' },
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className={css({ h: '5', w: '5' })} />
                    Generate Code
                  </>
                )}
              </Button>

              {snippet && (
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
      </motion.div>

      {/* Generated Snippet */}
      {snippet && (
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
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Check className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <CardTitle>Generated Code</CardTitle>
                  <Badge
                    className={css({
                      bg: 'orange.500/20',
                      color: 'orange.300',
                      border: '1px solid',
                      borderColor: 'orange.500/30',
                    })}
                  >
                    {snippet.language.toUpperCase()}
                  </Badge>
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
                      color: copied ? 'green.400' : 'orange.400',
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
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {/* Code Block */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.950',
                  p: '4',
                  overflow: 'auto',
                })}
              >
                <pre
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.200',
                    fontFamily: 'mono',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  })}
                >
                  <code>{snippet.code}</code>
                </pre>
              </div>

              {/* Explanation */}
              {snippet.explanation && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'blue.500/20',
                    bg: 'blue.500/5',
                    p: '4',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                    <Lightbulb
                      className={css({ h: '5', w: '5', color: 'blue.400', flexShrink: '0' })}
                    />
                    <div className={css({ spaceY: '2' })}>
                      <h4
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'blue.300',
                        })}
                      >
                        How it works
                      </h4>
                      <p
                        className={css({
                          fontSize: 'sm',
                          color: 'white',
                          lineHeight: '1.6',
                        })}
                      >
                        {snippet.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: snippet ? 0.3 : 0.2, duration: 0.5 }}
      >
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'cyan.500/20',
            bg: 'rgba(6, 182, 212, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'cyan.300',
            })}
          >
            Pro Tips
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Be Specific:</strong> Include function names, parameters, and expected
              behavior in your description
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Edge Cases:</strong> Mention constraints like "handle null values" or
              "optimize for large arrays"
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Break It Down:</strong> For complex logic, use smaller focused prompts for
              better results
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Production Ready:</strong> Include context like "following best practices" or
              "with error handling"
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Review and test generated code before using in production
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              All code generation uses OpenAI GPT models - ensure your API key is configured
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function AISnippetGeneratorPage() {
  return <AISnippetGeneratorContent />
}
