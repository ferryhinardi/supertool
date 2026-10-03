'use client'

import { Check, Copy, RotateCcw, Sparkles, Type } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SoftSupportCard } from '@/components/features/monetization/SoftSupportCard'
import { ProductivityToolHeader } from '@/components/features/tools/ProductivityToolHeader'
import { ToolPageFrame } from '@/components/features/tools/workspace/ToolPageFrame'
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
    <ToolPageFrame>
      <ProductivityToolHeader
        title="Case Converter"
        description="Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Preview every format at once."
        eyebrow="Text productivity"
        icon={Type}
        highlights={['11 case formats', 'Instant preview']}
      />

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: { base: '4', lg: '6' },
          w: 'full',
          alignItems: 'start',
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'brand.line',
            bg: 'brand.surface',
            w: 'full',
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
                <CardTitle className={css({ color: 'brand.ink' })}>Input Text</CardTitle>
                <CardDescription>Enter text to convert between different cases</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!input}
                className={css({ minH: '11' })}
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
              aria-label="Input text"
              placeholder="Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
              className={css({
                minH: '100px',
                fontFamily: 'mono',
                fontSize: 'sm',
                bg: 'brand.canvas',
                border: '1px solid',
                borderColor: 'brand.line',
                color: 'brand.ink',
                _focus: {
                  borderColor: 'brand.amber',
                  ring: '1px',
                  ringColor: 'brand.amber',
                },
              })}
            />
          </CardContent>
        </Card>

        <Card
          className={css({
            border: '1px solid',
            borderColor: 'brand.line',
            bg: 'brand.surface',
            w: 'full',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ color: 'brand.ink' })}>Select Case Type</CardTitle>
            <CardDescription>Choose your desired output format</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: '3',
                w: 'full',
              })}
            >
              {CASE_TYPES.map((caseType) => (
                <button
                  type="button"
                  key={caseType.id}
                  aria-pressed={selectedCase === caseType.id}
                  onClick={() => handleCaseSelect(caseType.id)}
                  className={css({
                    minH: '11',
                    p: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: selectedCase === caseType.id ? 'brand.amber' : 'brand.line',
                    bg: selectedCase === caseType.id ? 'brand.surfaceRaised' : 'brand.canvas',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'orange.500',
                    },
                    _focusVisible: {
                      outline: '2px solid',
                      outlineColor: 'brand.amber',
                      outlineOffset: '2px',
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: selectedCase === caseType.id ? 'brand.amber' : 'brand.ink',
                      fontFamily: 'mono',
                      overflowWrap: 'anywhere',
                    })}
                  >
                    {caseType.label}
                  </div>
                  <div
                    className={css({
                      fontSize: 'xs',
                      color: 'brand.muted',
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
                      color: 'brand.ink',
                    })}
                  >
                    Result ({selectedCase})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output, selectedCase)}
                    className={css({ minH: '11', color: 'brand.muted' })}
                  >
                    {copied === selectedCase ? (
                      <Check className={css({ w: '4', h: '4', mr: '1', color: 'brand.mint' })} />
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
                    bg: 'brand.surfaceRaised',
                    border: '1px solid',
                    borderColor: 'brand.amber',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'brand.amber',
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
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'brand.line',
            bg: 'brand.surface',
            w: 'full',
          })}
        >
          <CardHeader>
            <CardTitle
              className={css({
                color: 'brand.ink',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <Sparkles className={css({ w: '5', h: '5', color: 'brand.amber' })} aria-hidden />
              All Cases Preview
            </CardTitle>
            <CardDescription>See your text in all available formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
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
                    borderColor: 'brand.line',
                    bg: 'brand.canvas',
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
                    <span className={css({ fontSize: 'xs', color: 'brand.muted' })}>
                      {preview.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(preview.result, preview.id)}
                      aria-label={copied === preview.id ? 'Copied' : `Copy ${preview.label}`}
                      className={css({
                        minH: '11',
                        minW: '11',
                        color: 'brand.muted',
                      })}
                    >
                      {copied === preview.id ? (
                        <Check className={css({ w: '4', h: '4', color: 'brand.mint' })} />
                      ) : (
                        <Copy className={css({ w: '4', h: '4' })} />
                      )}
                    </Button>
                  </div>
                  <div
                    className={css({
                      fontSize: 'sm',
                      color: 'brand.ink',
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
      )}

      <SoftSupportCard toolId="case-converter" />

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
    </ToolPageFrame>
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
