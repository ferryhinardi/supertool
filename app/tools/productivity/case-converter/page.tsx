'use client'

import { Check, Copy, RotateCcw, Sparkles, Type } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type CaseType =
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE'
  | 'kebab-case'
  | 'TRAIN-CASE'
  | 'dot.case'
  | 'Title Case'
  | 'Sentence case'
  | 'lowercase'
  | 'UPPERCASE'

const CASE_TYPES: { id: CaseType; label: string; example: string }[] = [
  { id: 'camelCase', label: 'camelCase', example: 'myVariableName' },
  { id: 'PascalCase', label: 'PascalCase', example: 'MyClassName' },
  { id: 'snake_case', label: 'snake_case', example: 'my_variable_name' },
  { id: 'SCREAMING_SNAKE_CASE', label: 'SCREAMING_SNAKE_CASE', example: 'MY_CONSTANT_NAME' },
  { id: 'kebab-case', label: 'kebab-case', example: 'my-url-slug' },
  { id: 'TRAIN-CASE', label: 'TRAIN-CASE', example: 'My-Header-Name' },
  { id: 'dot.case', label: 'dot.case', example: 'my.config.key' },
  { id: 'Title Case', label: 'Title Case', example: 'My Document Title' },
  { id: 'Sentence case', label: 'Sentence case', example: 'My sentence here' },
  { id: 'lowercase', label: 'lowercase', example: 'all lowercase text' },
  { id: 'UPPERCASE', label: 'UPPERCASE', example: 'ALL UPPERCASE TEXT' },
]

// Utility function to split text into words
function splitIntoWords(text: string): string[] {
  // Handle camelCase and PascalCase by inserting spaces before uppercase letters
  const withSpaces = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')

  // Split by common separators
  return withSpaces.split(/[\s_\-.]+/).filter((word) => word.length > 0)
}

// Convert to different case types
function convertCase(text: string, caseType: CaseType): string {
  if (!text.trim()) return ''

  const words = splitIntoWords(text)
  if (words.length === 0) return ''

  switch (caseType) {
    case 'camelCase':
      return words
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('')

    case 'PascalCase':
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')

    case 'snake_case':
      return words.map((word) => word.toLowerCase()).join('_')

    case 'SCREAMING_SNAKE_CASE':
      return words.map((word) => word.toUpperCase()).join('_')

    case 'kebab-case':
      return words.map((word) => word.toLowerCase()).join('-')

    case 'TRAIN-CASE':
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-')

    case 'dot.case':
      return words.map((word) => word.toLowerCase()).join('.')

    case 'Title Case':
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

    case 'Sentence case':
      return words
        .map((word, index) =>
          index === 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
        )
        .join(' ')

    case 'lowercase':
      return words.map((word) => word.toLowerCase()).join(' ')

    case 'UPPERCASE':
      return words.map((word) => word.toUpperCase()).join(' ')

    default:
      return text
  }
}

function CaseConverterContent() {
  const [input, setInput] = useState('')
  const [selectedCase, setSelectedCase] = useState<CaseType>('camelCase')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    trackToolEvent('case_converter_open', {})
  }, [])

  const output = convertCase(input, selectedCase)

  const handleCopy = useCallback(async (text: string, caseType: string) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(caseType)
      toast.success('Copied to clipboard!')
      trackToolEvent('case_converter_copy', { case_type: caseType })
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  const handleClear = useCallback(() => {
    setInput('')
    trackToolEvent('case_converter_clear', {})
    toast.success('Cleared!')
  }, [])

  const handleCaseSelect = useCallback(
    (caseType: CaseType) => {
      setSelectedCase(caseType)
      if (input.trim()) {
        trackToolEvent('case_converter_convert', { case_type: caseType })
      }
    },
    [input]
  )

  // Generate all case previews
  const allCasePreviews = CASE_TYPES.map((caseType) => ({
    ...caseType,
    result: convertCase(input, caseType.id),
  }))

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
        <Badge
          className={css({
            bg: 'purple.500/10',
            color: 'purple.400',
            border: '1px solid',
            borderColor: 'purple.500/20',
          })}
        >
          <Type className={css({ w: '3', h: '3', mr: '1' })} />
          Productivity Tool
        </Badge>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            letterSpacing: 'tight',
            lineHeight: 'tight',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientTo: 'pink.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Case
          </span>{' '}
          <span className={css({ color: 'gray.100' })}>Converter</span>
        </h1>
        <p
          className={css({
            fontSize: { base: 'md', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Preview all
          case formats at once.
        </p>
      </div>

      {/* Input Card */}
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
            borderColor: 'purple.500/20',
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
                flexWrap: 'wrap',
                gap: '2',
              })}
            >
              <div>
                <CardTitle className={css({ color: 'gray.100' })}>Input Text</CardTitle>
                <CardDescription>Enter text to convert between different cases</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!input}
                className={css({
                  borderColor: 'gray.700',
                  _hover: { bg: 'gray.800' },
                })}
              >
                <RotateCcw className={css({ w: '4', h: '4', mr: '2' })} />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
              className={css({
                minH: '100px',
                fontFamily: 'mono',
                fontSize: 'sm',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
                _focus: {
                  borderColor: 'purple.500',
                  ring: '1px',
                  ringColor: 'purple.500',
                },
              })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Case Selection & Output */}
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
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ color: 'gray.100' })}>Select Case Type</CardTitle>
            <CardDescription>Choose your desired output format</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: '3',
                w: 'full',
              })}
            >
              {CASE_TYPES.map((caseType) => (
                <button
                  type="button"
                  key={caseType.id}
                  onClick={() => handleCaseSelect(caseType.id)}
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: selectedCase === caseType.id ? 'purple.500' : 'gray.700',
                    bg: selectedCase === caseType.id ? 'purple.500/10' : 'gray.800/50',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'purple.500/50',
                      bg: 'purple.500/5',
                    },
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: selectedCase === caseType.id ? 'purple.400' : 'gray.200',
                      fontFamily: 'mono',
                    })}
                  >
                    {caseType.label}
                  </div>
                  <div
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.500',
                      mt: '1',
                      fontFamily: 'mono',
                    })}
                  >
                    {caseType.example}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Output */}
            {output && (
              <div className={css({ mt: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: '2',
                  })}
                >
                  <span
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Result ({selectedCase})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output, selectedCase)}
                    className={css({
                      color: 'gray.400',
                      _hover: { color: 'purple.400', bg: 'purple.500/10' },
                    })}
                  >
                    {copied === selectedCase ? (
                      <Check className={css({ w: '4', h: '4', mr: '1', color: 'green.400' })} />
                    ) : (
                      <Copy className={css({ w: '4', h: '4', mr: '1' })} />
                    )}
                    {copied === selectedCase ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'purple.300',
                    wordBreak: 'break-all',
                  })}
                >
                  {output}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Cases Preview */}
      {input.trim() && (
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
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({
                  color: 'gray.100',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Sparkles className={css({ w: '5', h: '5', color: 'purple.400' })} />
                All Cases Preview
              </CardTitle>
              <CardDescription>See your text in all available formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                  w: 'full',
                })}
              >
                {allCasePreviews.map((preview) => (
                  <div
                    key={preview.id}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/30',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: '2',
                      })}
                    >
                      <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {preview.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(preview.result, preview.id)}
                        aria-label={copied === preview.id ? 'Copied' : `Copy ${preview.label}`}
                        className={css({
                          h: '6',
                          px: '2',
                          color: 'gray.500',
                          _hover: { color: 'purple.400', bg: 'purple.500/10' },
                        })}
                      >
                        {copied === preview.id ? (
                          <Check className={css({ w: '3', h: '3', color: 'green.400' })} />
                        ) : (
                          <Copy className={css({ w: '3', h: '3' })} />
                        )}
                      </Button>
                    </div>
                    <div
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.300',
                        fontFamily: 'mono',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {preview.result || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/productivity/case-converter" />

      {/* Social Share & Rating */}
      <div className={css({ spaceY: '6' })}>
        <SocialShare
          toolName="Case Converter"
          toolUrl="/tools/productivity/case-converter"
          description="Convert text between different case formats"
        />
        <ToolRating toolId="case-converter" toolName="Case Converter" />
      </div>
    </main>
  )
}

export default function CaseConverterPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minH: '50vh',
            color: 'gray.400',
          })}
        >
          Loading...
        </div>
      }
    >
      <CaseConverterContent />
    </Suspense>
  )
}
