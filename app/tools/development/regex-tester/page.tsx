'use client'

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Code,
  Copy,
  FileText,
  Info,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DevelopmentToolHeader } from '@/components/features/tools/DevelopmentToolHeader'
import { ToolPageFrame } from '@/components/features/tools/workspace/ToolPageFrame'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  CODE_LANGUAGES,
  FLAG_DESCRIPTIONS,
  generateCode,
  highlightMatches,
  REGEX_PATTERNS,
  type RegexFlag,
  type RegexMatch,
  type RegexPattern,
  testRegex,
} from './templates'

export default function RegexTesterPage() {
  // State
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState<RegexFlag[]>(['g'])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [showPatterns, setShowPatterns] = useState(true)
  const [showCode, setShowCode] = useState(false)

  // Track page view for Recent Tools feature
  useTrackToolView({
    toolId: 'regex-tester',
    title: 'Regex Tester',
    href: '/tools/development/regex-tester',
    iconName: 'Search',
    gradient: 'from-purple-500 to-pink-500',
  })

  const { matches, isValid, error, hasMatch } = useMemo(() => {
    if (!pattern) {
      return {
        matches: [] as RegexMatch[],
        isValid: true,
        error: undefined as string | undefined,
        hasMatch: false,
      }
    }
    const result = testRegex(pattern, flags, testString)
    return {
      matches: result.matches,
      isValid: result.isValid,
      error: result.error,
      hasMatch: result.isValid && result.hasMatch,
    }
  }, [pattern, flags, testString])

  useEffect(() => {
    if (hasMatch) {
      trackToolEvent('regex_tester_match_found', {
        match_count: matches.length,
      })
    }
  }, [hasMatch, matches.length])

  const toggleFlag = (flag: RegexFlag) => {
    setFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]))
    trackToolEvent('regex_tester_flag_toggled', { flag })
  }

  const loadPattern = (regexPattern: RegexPattern) => {
    setPattern(regexPattern.pattern)
    setFlags(regexPattern.flags)
    setTestString(regexPattern.examples[0] || '')
    setShowPatterns(false)
    trackToolEvent('regex_tester_pattern_loaded', {
      pattern_id: regexPattern.id,
    })
    toast.success(`Loaded: ${regexPattern.name}`)
  }

  const clearAll = () => {
    setPattern('')
    setTestString('')
    setFlags(['g'])
    trackToolEvent('regex_tester_cleared')
  }

  const copyPattern = () => {
    const flagsStr = flags.join('')
    const regexStr = `/${pattern}/${flagsStr}`
    navigator.clipboard.writeText(regexStr)
    toast.success('Pattern copied to clipboard')
    trackToolEvent('regex_tester_pattern_copied')
  }

  const copyCode = () => {
    const code = generateCode(pattern, flags, selectedLanguage)
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
    trackToolEvent('regex_tester_code_copied', { language: selectedLanguage })
  }

  const filteredPatterns =
    selectedCategory === 'all'
      ? REGEX_PATTERNS
      : REGEX_PATTERNS.filter((p) => p.category === selectedCategory)

  const highlighted = highlightMatches(testString, matches)

  return (
    <ToolPageFrame>
      {/* Header */}
      <DevelopmentToolHeader
        title="Regex Tester"
        description="Test and validate regular expressions with live matching, syntax highlighting, and ready-to-use code."
        eyebrow="Developer workspace"
        icon={Search}
        highlights={['Live matching', 'Multi-language code']}
      />

      {/* Pattern Library */}
      <div
        className={css({
          bg: 'brand.surface',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'brand.line',
          p: { base: '4', sm: '6' },
          spaceY: '4',
        })}
      >
        <button
          type="button"
          onClick={() => setShowPatterns(!showPatterns)}
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            w: 'full',
            minH: '11',
            cursor: 'pointer',
            _hover: { opacity: 0.8 },
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <FileText className={css({ w: '5', h: '5', color: 'brand.blue' })} />
            <h2 className={css({ fontSize: 'lg', fontWeight: '600', color: 'white' })}>
              Common Patterns
            </h2>
          </div>
          <ChevronDown
            className={css({
              w: '5',
              h: '5',
              color: 'brand.muted',
              transform: showPatterns ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            })}
          />
        </button>

        {showPatterns && (
          <>
            {/* Category filter */}
            <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
              {['all', 'validation', 'extraction', 'formatting', 'advanced'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={css({
                    px: '3',
                    py: '1.5',
                    minH: '11',
                    borderRadius: 'lg',
                    fontSize: 'sm',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    bg: selectedCategory === category ? 'blue.500' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === category ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid',
                    borderColor:
                      selectedCategory === category ? 'brand.blue' : 'rgba(255, 255, 255, 0.1)',
                    _hover: {
                      bg: selectedCategory === category ? 'blue.600' : 'rgba(255, 255, 255, 0.1)',
                    },
                  })}
                  data-touch-chip
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Pattern list */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
                gap: '3',
                w: 'full',
              })}
            >
              {filteredPatterns.map((regexPattern) => (
                <button
                  key={regexPattern.id}
                  type="button"
                  onClick={() => loadPattern(regexPattern)}
                  className={css({
                    p: '4',
                    bg: 'brand.canvas',
                    borderRadius: 'lg',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'brand.surfaceRaised',
                      borderColor: 'brand.blue',
                    },
                  })}
                >
                  <div className={css({ fontWeight: '600', color: 'white', mb: '1' })}>
                    {regexPattern.name}
                  </div>
                  <div
                    className={css({
                      fontSize: 'sm',
                      color: 'brand.muted',
                      mb: '2',
                    })}
                  >
                    {regexPattern.description}
                  </div>
                  <code
                    className={css({
                      fontSize: 'xs',
                      fontFamily: 'mono',
                      color: 'brand.cyan',
                      bg: 'blue.500/10',
                      px: '2',
                      py: '1',
                      borderRadius: 'md',
                      display: 'inline-block',
                    })}
                  >
                    /{regexPattern.pattern}/{regexPattern.flags.join('')}
                  </code>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Regex Pattern Input */}
      <div
        className={css({
          bg: 'brand.surface',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'brand.line',
          p: { base: '4', sm: '6' },
          spaceY: '4',
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <Code className={css({ w: '5', h: '5', color: 'brand.blue' })} />
          <h2 className={css({ fontSize: 'lg', fontWeight: '600', color: 'white' })}>
            Regular Expression
          </h2>
        </div>

        {/* Pattern input */}
        <div>
          <label
            htmlFor="pattern"
            className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: '500',
              color: 'brand.ink',
              mb: '2',
            })}
          >
            Pattern
          </label>
          <div className={css({ position: 'relative' })}>
            <div
              className={css({
                position: 'absolute',
                left: '3',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 'sm',
                color: 'brand.muted',
                fontFamily: 'mono',
              })}
            >
              /
            </div>
            <input
              id="pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter your regex pattern here..."
              className={css({
                w: 'full',
                px: '3',
                py: '3',
                pl: '6',
                pr: '16',
                bg: 'brand.canvas',
                border: '1px solid',
                borderColor: isValid ? 'rgba(255, 255, 255, 0.2)' : 'red.500',
                borderRadius: 'lg',
                color: 'white',
                fontSize: 'sm',
                fontFamily: 'mono',
                outline: 'none',
                transition: 'all 0.2s',
                _focus: {
                  borderColor: isValid ? 'brand.blue' : 'red.500',
                  boxShadow: isValid
                    ? '0 0 0 3px rgba(107, 165, 255, 0.28)'
                    : '0 0 0 3px rgba(239, 68, 68, 0.1)',
                },
                _placeholder: {
                  color: 'brand.muted',
                },
              })}
            />
            <div
              className={css({
                position: 'absolute',
                right: '3',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              {pattern && isValid && (
                <CheckCircle2 className={css({ w: '5', h: '5', color: 'green.400' })} />
              )}
              {pattern && !isValid && (
                <XCircle className={css({ w: '5', h: '5', color: 'red.400' })} />
              )}
              <div
                className={css({
                  fontSize: 'sm',
                  color: 'brand.muted',
                  fontFamily: 'mono',
                })}
              >
                /{flags.join('')}
              </div>
            </div>
          </div>
          {error && (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                mt: '2',
                fontSize: 'sm',
                color: 'red.400',
              })}
            >
              <AlertCircle className={css({ w: '4', h: '4' })} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Flags */}
        <div>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
            <div className={css({ fontSize: 'sm', fontWeight: '500', color: 'white' })}>Flags</div>
            <div className={css({ position: 'relative', display: 'inline-block' })}>
              <Info className={css({ w: '4', h: '4', color: 'brand.muted' })} />
            </div>
          </div>
          <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
            {(['g', 'i', 'm', 's', 'u', 'y'] as RegexFlag[]).map((flag) => (
              <button
                key={flag}
                type="button"
                onClick={() => toggleFlag(flag)}
                title={FLAG_DESCRIPTIONS[flag]}
                className={css({
                  px: '4',
                  py: '2',
                  borderRadius: 'lg',
                  fontSize: 'sm',
                  fontWeight: '600',
                  fontFamily: 'mono',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bg: flags.includes(flag) ? 'blue.500' : 'rgba(255, 255, 255, 0.05)',
                  color: flags.includes(flag) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid',
                  borderColor: flags.includes(flag) ? 'brand.blue' : 'rgba(255, 255, 255, 0.1)',
                  _hover: {
                    bg: flags.includes(flag) ? 'blue.600' : 'rgba(255, 255, 255, 0.1)',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                {flags.includes(flag) && <Check className={css({ w: '4', h: '4' })} />}
                {flag}
              </button>
            ))}
          </div>
          <div className={css({ fontSize: 'xs', color: 'brand.muted', mt: '2' })}>
            Hover over flags to see their descriptions
          </div>
        </div>

        {/* Action buttons */}
        <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
          <button
            type="button"
            onClick={copyPattern}
            disabled={!pattern}
            className={css({
              px: '4',
              py: '2',
              bg: 'brand.surfaceRaised',
              border: '1px solid',
              borderColor: 'brand.line',
              borderRadius: 'lg',
              fontSize: 'sm',
              fontWeight: '500',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              _hover: {
                bg: 'brand.surfaceRaised',
              },
              _disabled: {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            })}
          >
            <Copy className={css({ w: '4', h: '4' })} />
            Copy Pattern
          </button>
          <button
            type="button"
            onClick={clearAll}
            className={css({
              px: '4',
              py: '2',
              bg: 'brand.surfaceRaised',
              border: '1px solid',
              borderColor: 'brand.line',
              borderRadius: 'lg',
              fontSize: 'sm',
              fontWeight: '500',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              _hover: {
                bg: 'brand.surfaceRaised',
              },
            })}
          >
            <RotateCcw className={css({ w: '4', h: '4' })} />
            Clear All
          </button>
        </div>
      </div>

      {/* Test String Input */}
      <div
        className={css({
          bg: 'brand.surface',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'brand.line',
          p: { base: '4', sm: '6' },
          spaceY: '4',
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <FileText className={css({ w: '5', h: '5', color: 'brand.blue' })} />
          <h2 className={css({ fontSize: 'lg', fontWeight: '600', color: 'white' })}>
            Test String
          </h2>
        </div>

        <div>
          <label
            htmlFor="test-string"
            className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: '500',
              color: 'brand.ink',
              mb: '2',
            })}
          >
            Text to match against
          </label>
          <textarea
            id="test-string"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test your regex pattern..."
            rows={6}
            className={css({
              w: 'full',
              px: '3',
              py: '3',
              bg: 'brand.canvas',
              border: '1px solid',
              borderColor: 'brand.line',
              borderRadius: 'lg',
              color: 'white',
              fontSize: 'sm',
              fontFamily: 'mono',
              outline: 'none',
              resize: 'vertical',
              transition: 'all 0.2s',
              _focus: {
                borderColor: 'brand.blue',
                boxShadow: '0 0 0 3px rgba(107, 165, 255, 0.28)',
              },
              _placeholder: {
                color: 'brand.muted',
              },
            })}
          />
        </div>

        {/* Match results */}
        {pattern && testString && isValid && (
          <div
            className={css({
              p: '4',
              bg: 'brand.canvas',
              borderRadius: 'lg',
              border: '1px solid',
              borderColor: matches.length > 0 ? 'green.500/20' : 'brand.line',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '3' })}>
              {matches.length > 0 ? (
                <CheckCircle2 className={css({ w: '5', h: '5', color: 'green.400' })} />
              ) : (
                <XCircle className={css({ w: '5', h: '5', color: 'brand.muted' })} />
              )}
              <span className={css({ fontSize: 'sm', fontWeight: '600', color: 'white' })}>
                {matches.length > 0
                  ? `${matches.length} match${matches.length === 1 ? '' : 'es'} found`
                  : 'No matches found'}
              </span>
            </div>

            {highlighted.length > 0 && (
              <div
                className={css({
                  fontSize: 'sm',
                  fontFamily: 'mono',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                })}
              >
                {highlighted.map((segment, idx) =>
                  segment.isMatch ? (
                    <span
                      key={`match-${segment.index}-${segment.text.slice(0, 10)}`}
                      className={css({
                        bg: 'rgba(34, 197, 94, 0.2)',
                        color: 'green.300',
                        px: '1',
                        py: '0.5',
                        borderRadius: 'sm',
                        border: '1px solid',
                        borderColor: 'green.500/30',
                      })}
                    >
                      {segment.text}
                    </span>
                  ) : (
                    <span
                      key={`text-${idx}-${segment.text.slice(0, 10)}`}
                      className={css({ color: 'brand.muted' })}
                    >
                      {segment.text}
                    </span>
                  )
                )}
              </div>
            )}

            {/* Match details */}
            {matches.length > 0 && (
              <div className={css({ mt: '3', spaceY: '2' })}>
                <div
                  className={css({
                    fontSize: 'xs',
                    fontWeight: '600',
                    color: 'brand.muted',
                    textTransform: 'uppercase',
                    letterSpacing: 'wide',
                  })}
                >
                  Match Details
                </div>
                {matches.map((match, idx) => (
                  <div
                    key={`match-${match.index}-${match.match.slice(0, 10)}`}
                    className={css({
                      p: '2',
                      bg: 'brand.canvas',
                      borderRadius: 'md',
                      fontSize: 'xs',
                      fontFamily: 'mono',
                    })}
                  >
                    <div className={css({ color: 'brand.muted' })}>
                      Match {idx + 1} at index {match.index}:
                    </div>
                    <div className={css({ color: 'green.300', mt: '1' })}>"{match.match}"</div>
                    {match.groups && Object.keys(match.groups).length > 0 && (
                      <div className={css({ mt: '1', color: 'brand.muted' })}>
                        Groups: {JSON.stringify(match.groups)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Generation */}
      <div
        className={css({
          bg: 'brand.surface',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'brand.line',
          p: { base: '4', sm: '6' },
          spaceY: '4',
        })}
      >
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            w: 'full',
            cursor: 'pointer',
            _hover: { opacity: 0.8 },
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Code className={css({ w: '5', h: '5', color: 'brand.blue' })} />
            <h2 className={css({ fontSize: 'lg', fontWeight: '600', color: 'white' })}>
              Code Generation
            </h2>
          </div>
          <ChevronDown
            className={css({
              w: '5',
              h: '5',
              color: 'brand.muted',
              transform: showCode ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            })}
          />
        </button>

        {showCode && (
          <>
            {/* Language selector */}
            <div>
              <label
                htmlFor="language"
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: '500',
                  color: 'brand.ink',
                  mb: '2',
                })}
              >
                Language
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={css({
                  w: 'full',
                  px: '3',
                  py: '2',
                  bg: 'brand.canvas',
                  border: '1px solid',
                  borderColor: 'brand.line',
                  borderRadius: 'lg',
                  color: 'white',
                  fontSize: 'sm',
                  outline: 'none',
                  cursor: 'pointer',
                  _focus: {
                    borderColor: 'brand.blue',
                    boxShadow: '0 0 0 3px rgba(107, 165, 255, 0.28)',
                  },
                })}
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Generated code */}
            {pattern && (
              <div>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: '2',
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: '500',
                      color: 'brand.ink',
                    })}
                  >
                    Generated Code
                  </div>
                  <button
                    type="button"
                    onClick={copyCode}
                    className={css({
                      px: '3',
                      py: '1.5',
                      bg: 'blue.500',
                      borderRadius: 'lg',
                      fontSize: 'sm',
                      fontWeight: '500',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      _hover: {
                        bg: 'blue.600',
                      },
                    })}
                  >
                    <Copy className={css({ w: '4', h: '4' })} />
                    Copy Code
                  </button>
                </div>
                <pre
                  className={css({
                    p: '4',
                    bg: 'brand.canvas',
                    borderRadius: 'lg',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    fontSize: 'sm',
                    fontFamily: 'mono',
                    color: 'brand.ink',
                    overflowX: 'auto',
                    lineHeight: '1.6',
                  })}
                >
                  <code>{generateCode(pattern, flags, selectedLanguage)}</code>
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tips */}
      <div
        className={css({
          bg: 'blue.500/10',
          border: '1px solid',
          borderColor: 'blue.500/30',
          borderRadius: 'xl',
          p: { base: '4', sm: '6' },
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
          <Info className={css({ w: '5', h: '5', color: 'blue.400', flexShrink: 0, mt: '0.5' })} />
          <div className={css({ flex: 1 })}>
            <h3 className={css({ fontSize: 'sm', fontWeight: '600', color: 'white', mb: '2' })}>
              Quick Tips
            </h3>
            <ul className={css({ fontSize: 'sm', color: 'brand.muted', spaceY: '1' })}>
              <li>• Use the common patterns library to get started quickly</li>
              <li>• Test with multiple strings to ensure your regex works in all cases</li>
              <li>• Enable the 'g' flag to find all matches instead of just the first one</li>
              <li>• Use named capture groups for better code readability</li>
              <li>• Generate code in your preferred language and copy it to your project</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolPageFrame>
  )
}
