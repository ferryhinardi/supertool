'use client'

import { motion } from 'framer-motion'
import {
  Check,
  Copy,
  Download,
  FileCode,
  Info,
  Lightbulb,
  RotateCcw,
  Search,
  Terminal,
  Zap,
} from 'lucide-react'
import { parseAsBoolean, useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent, trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export const dynamic = 'force-dynamic'

interface RegexPattern {
  id: string
  name: string
  pattern: string
  description: string
  example: string
}

const commonPatterns: RegexPattern[] = [
  {
    id: 'email',
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    description: 'Matches standard email addresses',
    example: 'user@example.com',
  },
  {
    id: 'url',
    name: 'URL',
    pattern: 'https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/[^\\s]*)?',
    description: 'Matches HTTP/HTTPS URLs',
    example: 'https://example.com/path',
  },
  {
    id: 'phone-us',
    name: 'US Phone',
    pattern: '\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}',
    description: 'Matches US phone numbers',
    example: '(123) 456-7890',
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    description: 'Matches IPv4 addresses',
    example: '192.168.1.1',
  },
  {
    id: 'hex-color',
    name: 'Hex Color',
    pattern: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b',
    description: 'Matches hex color codes',
    example: '#FF5733',
  },
  {
    id: 'date',
    name: 'Date (YYYY-MM-DD)',
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    description: 'Matches ISO date format',
    example: '2025-11-08',
  },
  {
    id: 'time',
    name: 'Time (HH:MM)',
    pattern: '([01]?[0-9]|2[0-3]):[0-5][0-9]',
    description: 'Matches 24-hour time format',
    example: '14:30',
  },
  {
    id: 'credit-card',
    name: 'Credit Card',
    pattern: '\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}',
    description: 'Matches credit card numbers',
    example: '1234-5678-9012-3456',
  },
  {
    id: 'username',
    name: 'Username',
    pattern: '^[a-zA-Z0-9_-]{3,16}$',
    description: 'Matches usernames (3-16 chars)',
    example: 'user_name123',
  },
  {
    id: 'password',
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Matches strong passwords (8+ chars, uppercase, lowercase, digit, special)',
    example: 'MyP@ssw0rd',
  },
  {
    id: 'slug',
    name: 'URL Slug',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    description: 'Matches URL slugs',
    example: 'my-url-slug',
  },
  {
    id: 'hashtag',
    name: 'Hashtag',
    pattern: '#[a-zA-Z0-9_]+',
    description: 'Matches hashtags',
    example: '#JavaScript',
  },
]

const faqs = [
  {
    question: 'What is a regular expression (regex)?',
    answer:
      'A regular expression (regex) is a sequence of characters that defines a search pattern. It\'s used for pattern matching within strings, allowing you to find, validate, or replace text based on specific rules. For example, the pattern "\\d{3}" matches exactly three digits.',
  },
  {
    question: 'What regex flags are supported?',
    answer:
      'The tool supports all standard JavaScript regex flags: g (global - find all matches), i (case-insensitive), m (multiline - ^ and $ match line boundaries), s (dotAll - . matches newlines), u (unicode), and y (sticky - matches from lastIndex). You can combine multiple flags for advanced matching.',
  },
  {
    question: 'How do I test my regex pattern?',
    answer:
      'Enter your regex pattern in the "Pattern" field, add flags if needed, and type or paste your test text in the "Test String" area. Matches will be highlighted in real-time, showing you exactly what your pattern captures. You can see match groups, match count, and detailed match information below.',
  },
  {
    question: 'What are capture groups and how do they work?',
    answer:
      'Capture groups are portions of a regex pattern enclosed in parentheses () that extract specific parts of a match. For example, in the pattern "(\\d{3})-(\\d{4})", the first group captures three digits and the second captures four digits. Named groups like (?<year>\\d{4}) let you reference captures by name.',
  },
  {
    question: 'Can I use this tool to learn regex?',
    answer:
      'Yes! The tool includes a pattern library with common regex examples, real-time highlighting of matches, detailed explanations of each pattern template, and instant feedback as you type. Start with pre-built patterns, modify them, and see results immediately to learn how regex works.',
  },
]

interface MatchInfo {
  match: string
  index: number
  groups: (string | undefined)[]
}

function RegexTesterContent() {
  const [pattern, setPattern] = useQueryState('pattern', { defaultValue: '' })
  const [testString, setTestString] = useQueryState('test', { defaultValue: '' })
  const [flagGlobal, setFlagGlobal] = useQueryState('g', parseAsBoolean.withDefault(false))
  const [flagCaseInsensitive, setFlagCaseInsensitive] = useQueryState(
    'i',
    parseAsBoolean.withDefault(false)
  )
  const [flagMultiline, setFlagMultiline] = useQueryState('m', parseAsBoolean.withDefault(false))
  const [flagDotAll, setFlagDotAll] = useQueryState('s', parseAsBoolean.withDefault(false))
  const [flagUnicode, setFlagUnicode] = useQueryState('u', parseAsBoolean.withDefault(false))
  const [flagSticky, setFlagSticky] = useQueryState('y', parseAsBoolean.withDefault(false))
  const [copied, setCopied] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<string>('')

  // Track page visit
  useEffect(() => {
    trackToolEvent('regex_tester_open', {})
  }, [])

  // Build regex flags
  const flags = useMemo(() => {
    let f = ''
    if (flagGlobal) f += 'g'
    if (flagCaseInsensitive) f += 'i'
    if (flagMultiline) f += 'm'
    if (flagDotAll) f += 's'
    if (flagUnicode) f += 'u'
    if (flagSticky) f += 'y'
    return f
  }, [flagGlobal, flagCaseInsensitive, flagMultiline, flagDotAll, flagUnicode, flagSticky])

  // Test regex and get matches
  const matchResult = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [], error: null, matchCount: 0 }
    }

    try {
      const regex = new RegExp(pattern, flags)
      const matches: MatchInfo[] = []

      if (flagGlobal) {
        let match: RegExpExecArray | null
        // biome-ignore lint/suspicious/noAssignInExpressions: Required for regex.exec() iteration pattern
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          })
          // Prevent infinite loop on zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          })
        }
      }

      return { matches, error: null, matchCount: matches.length }
    } catch (error) {
      return {
        matches: [],
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
        matchCount: 0,
      }
    }
  }, [pattern, testString, flags, flagGlobal])

  // Highlight matches in test string
  const highlightedText = useMemo(() => {
    if (!testString || matchResult.matches.length === 0) {
      return testString
    }

    const parts: { text: string; isMatch: boolean }[] = []
    let lastIndex = 0

    matchResult.matches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push({
          text: testString.slice(lastIndex, match.index),
          isMatch: false,
        })
      }
      parts.push({
        text: match.match,
        isMatch: true,
      })
      lastIndex = match.index + match.match.length
    })

    if (lastIndex < testString.length) {
      parts.push({
        text: testString.slice(lastIndex),
        isMatch: false,
      })
    }

    return parts
  }, [testString, matchResult.matches])

  const handleLoadPattern = (patternData: RegexPattern) => {
    setPattern(patternData.pattern)
    setTestString(patternData.example)
    setSelectedPattern(patternData.id)
    setFlagGlobal(true)

    trackEvent({
      action: 'regex_pattern_loaded',
      category: 'regex_tester',
      label: patternData.id,
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pattern)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    trackEvent({
      action: 'regex_copied',
      category: 'regex_tester',
      label: 'copy_pattern',
    })
  }

  const handleDownload = () => {
    const content = `Regex Pattern: ${pattern}\nFlags: ${flags}\nTest String:\n${testString}\n\nMatches: ${matchResult.matchCount}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'regex-test.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackEvent({
      action: 'regex_downloaded',
      category: 'regex_tester',
      label: 'download_test',
    })
  }

  const handleReset = () => {
    setPattern('')
    setTestString('')
    setFlagGlobal(false)
    setFlagCaseInsensitive(false)
    setFlagMultiline(false)
    setFlagDotAll(false)
    setFlagUnicode(false)
    setFlagSticky(false)
    setSelectedPattern('')
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ spaceY: '4', textAlign: 'center' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'fuchsia.500/20',
            bg: 'fuchsia.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <Terminal className={css({ h: '5', w: '5', color: 'fuchsia.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fuchsia.300' })}>
            Real-Time Pattern Testing
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'fuchsia.400',
              gradientVia: 'pink.400',
              gradientTo: 'rose.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Regex Pattern Library & Tester
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'gray.400',
          })}
        >
          Interactive regular expression tester with real-time matching and group capturing. Explore
          pre-built pattern templates for emails, URLs, phone numbers, and more.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardContent>
            <div className={css({ p: '4', textAlign: 'center' })}>
              <div
                className={css({
                  mb: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'green.500',
                  gradientTo: 'emerald.500',
                  bgClip: 'text',
                  color: 'transparent',
                  fontSize: '3xl',
                  fontWeight: 'bold',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {matchResult.matchCount}
              </div>
              <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Matches Found</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardContent>
            <div className={css({ p: '4', textAlign: 'center' })}>
              <div
                className={css({
                  mb: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'blue.500',
                  gradientTo: 'cyan.500',
                  bgClip: 'text',
                  color: 'transparent',
                  fontSize: '3xl',
                  fontWeight: 'bold',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {flags.length || '0'}
              </div>
              <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Flags Active</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardContent>
            <div className={css({ p: '4', textAlign: 'center' })}>
              <div
                className={css({
                  mb: '2',
                  color: matchResult.error ? 'red.400' : 'green.400',
                  fontSize: '3xl',
                  fontWeight: 'bold',
                })}
              >
                {matchResult.error ? '✗' : '✓'}
              </div>
              <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Pattern Status</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardContent>
            <div className={css({ p: '4', textAlign: 'center' })}>
              <div
                className={css({
                  mb: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.500',
                  gradientTo: 'pink.500',
                  bgClip: 'text',
                  color: 'transparent',
                  fontSize: '3xl',
                  fontWeight: 'bold',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {pattern.length}
              </div>
              <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Pattern Length</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          w: 'full',
        })}
      >
        {/* Main Testing Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({ spaceY: '6' })}
        >
          {/* Pattern Input */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '4',
                  })}
                >
                  <div>
                    <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <FileCode className={css({ h: '5', w: '5', color: 'fuchsia.400' })} />
                      Regex Pattern
                    </CardTitle>
                    <CardDescription>Enter your regular expression pattern</CardDescription>
                  </div>
                  <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!pattern}
                      className={css({ gap: '2' })}
                    >
                      {copied ? (
                        <>
                          <Check className={css({ h: '4', w: '4' })} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className={css({ h: '4', w: '4' })} />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!pattern}
                      className={css({ gap: '2' })}
                    >
                      <Download className={css({ h: '4', w: '4' })} />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!pattern && !testString}
                      className={css({ gap: '2' })}
                    >
                      <RotateCcw className={css({ h: '4', w: '4' })} />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
                <div className={css({ spaceY: '2' })}>
                  <Input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter regex pattern (e.g., \d{3}-\d{3}-\d{4})"
                    className={css({ fontFamily: 'mono', fontSize: 'lg' })}
                  />
                  {matchResult.error && (
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        rounded: 'md',
                        bg: 'red.500/10',
                        px: '3',
                        py: '2',
                        color: 'red.400',
                        fontSize: 'sm',
                      })}
                    >
                      <Info className={css({ h: '4', w: '4', flexShrink: '0' })} />
                      {matchResult.error}
                    </div>
                  )}
                </div>

                {/* Flags */}
                <div className={css({ spaceY: '2' })}>
                  <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                    Flags
                  </div>
                  <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '3' })}>
                    {[
                      { label: 'g (global)', value: flagGlobal, setter: setFlagGlobal },
                      {
                        label: 'i (case-insensitive)',
                        value: flagCaseInsensitive,
                        setter: setFlagCaseInsensitive,
                      },
                      { label: 'm (multiline)', value: flagMultiline, setter: setFlagMultiline },
                      { label: 's (dotAll)', value: flagDotAll, setter: setFlagDotAll },
                      { label: 'u (unicode)', value: flagUnicode, setter: setFlagUnicode },
                      { label: 'y (sticky)', value: flagSticky, setter: setFlagSticky },
                    ].map((flag) => (
                      <label
                        key={flag.label}
                        className={css({
                          display: 'flex',
                          cursor: 'pointer',
                          alignItems: 'center',
                          gap: '2',
                        })}
                      >
                        <input
                          type="checkbox"
                          checked={flag.value}
                          onChange={(e) => flag.setter(e.target.checked)}
                          className={css({
                            h: '4',
                            w: '4',
                            rounded: 'default',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'gray.800',
                            color: 'fuchsia.500',
                            _focus: {
                              ring: '2',
                              ringColor: 'fuchsia.500',
                              ringOffset: '0',
                            },
                          })}
                        />
                        <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                          {flag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test String */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Search className={css({ h: '5', w: '5', color: 'pink.400' })} />
                  Test String
                </CardTitle>
                <CardDescription>Enter text to test your regex pattern against</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <Textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Paste or type your test text here..."
                  className={css({
                    minH: '[300px]',
                    fontFamily: 'mono',
                    fontSize: 'base',
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Highlighted Results */}
          {testString && pattern && !matchResult.error && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
                backdropFilter: 'blur(4px)',
              })}
            >
              <CardHeader>
                <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Zap className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                    Highlighted Matches
                  </CardTitle>
                  <CardDescription>
                    {matchResult.matchCount > 0
                      ? `${matchResult.matchCount} match${matchResult.matchCount > 1 ? 'es' : ''} found`
                      : 'No matches found'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                  <div
                    className={css({
                      rounded: 'md',
                      bg: 'gray.800/50',
                      p: '4',
                      fontFamily: 'mono',
                      fontSize: 'sm',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    })}
                  >
                    {Array.isArray(highlightedText) ? (
                      highlightedText.map((part, idx) => (
                        <span
                          key={`${part.text}-${idx}-${part.isMatch}`}
                          className={css({
                            bg: part.isMatch ? 'yellow.400/30' : 'transparent',
                            color: part.isMatch ? 'yellow.200' : 'gray.300',
                            fontWeight: part.isMatch ? 'bold' : 'normal',
                          })}
                        >
                          {part.text}
                        </span>
                      ))
                    ) : (
                      <span className={css({ color: 'gray.300' })}>{highlightedText}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Match Details */}
          {matchResult.matches.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
                backdropFilter: 'blur(4px)',
              })}
            >
              <CardHeader>
                <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Info className={css({ h: '5', w: '5', color: 'blue.400' })} />
                    Match Details
                  </CardTitle>
                  <CardDescription>Detailed information about each match</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '3' })}>
                  {matchResult.matches.map((match, idx) => (
                    <div
                      key={`match-${match.index}-${match.match}-${idx}`}
                      className={css({
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '3',
                        spaceY: '2',
                      })}
                    >
                      <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                        <span
                          className={css({
                            rounded: 'full',
                            bg: 'fuchsia.500/20',
                            px: '2',
                            py: '1',
                            color: 'fuchsia.300',
                            fontSize: 'xs',
                            fontWeight: 'medium',
                          })}
                        >
                          Match {idx + 1}
                        </span>
                        <span
                          className={css({
                            rounded: 'full',
                            bg: 'blue.500/20',
                            px: '2',
                            py: '1',
                            color: 'blue.300',
                            fontSize: 'xs',
                            fontWeight: 'medium',
                          })}
                        >
                          Index: {match.index}
                        </span>
                      </div>
                      <div className={css({ spaceY: '1' })}>
                        <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          Full Match:
                        </div>
                        <div
                          className={css({
                            fontFamily: 'mono',
                            fontSize: 'sm',
                            color: 'yellow.300',
                            fontWeight: 'bold',
                          })}
                        >
                          {match.match}
                        </div>
                      </div>
                      {match.groups.length > 0 && match.groups.some((g) => g !== undefined) && (
                        <div className={css({ spaceY: '1' })}>
                          <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                            Capture Groups:
                          </div>
                          {match.groups.map((group, gIdx) =>
                            group !== undefined ? (
                              <div
                                key={`group-${gIdx}-${group}`}
                                className={css({
                                  fontFamily: 'mono',
                                  fontSize: 'sm',
                                  color: 'green.300',
                                })}
                              >
                                Group {gIdx + 1}: {group}
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Pattern Library */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Lightbulb className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                  Pattern Library
                </CardTitle>
                <CardDescription>Common regex patterns to get started</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '2' })}>
                {commonPatterns.map((patternData) => {
                  const isSelected = selectedPattern === patternData.id
                  return (
                    <Button
                      key={patternData.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadPattern(patternData)}
                      className={css({
                        w: 'full',
                        justifyContent: 'start',
                        border: '1px solid',
                        borderColor: isSelected ? 'fuchsia.500/50' : 'gray.700',
                        bg: isSelected ? 'fuchsia.500/10' : 'transparent',
                        textAlign: 'left',
                        h: 'auto',
                        py: '3',
                        _hover: {
                          borderColor: 'fuchsia.500/50',
                          bg: 'fuchsia.500/10',
                        },
                      })}
                    >
                      <div className={css({ flex: '1', spaceY: '1' })}>
                        <div className={css({ fontWeight: 'semibold', color: 'gray.200' })}>
                          {patternData.name}
                        </div>
                        <div className={css({ fontSize: 'xs', color: 'gray.400' })}>
                          {patternData.description}
                        </div>
                        <div
                          className={css({
                            fontFamily: 'mono',
                            fontSize: 'xs',
                            color: isSelected ? 'fuchsia.300' : 'gray.500',
                          })}
                        >
                          {patternData.pattern}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/regex-tester" category="development" />
      <ToolRating toolId="/tools/regex-tester" toolName="Regex Pattern Library & Tester" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function RegexTesterPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            h: 'screen',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <div className={css({ color: 'gray.400' })}>Loading...</div>
        </div>
      }
    >
      <RegexTesterContent />
    </Suspense>
  )
}
