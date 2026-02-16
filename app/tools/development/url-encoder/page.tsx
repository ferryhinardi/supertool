'use client'

import { ArrowLeftRight, Check, Copy, Link2, RotateCcw, Sparkles } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
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

type EncodingMethod = 'encodeURI' | 'encodeURIComponent' | 'decodeURI' | 'decodeURIComponent'

const ENCODING_METHODS: { id: EncodingMethod; label: string; description: string }[] = [
  {
    id: 'encodeURIComponent',
    label: 'encodeURIComponent',
    description: 'Encodes all special characters (recommended for query params)',
  },
  {
    id: 'encodeURI',
    label: 'encodeURI',
    description: 'Preserves URL structure (://?#)',
  },
  {
    id: 'decodeURIComponent',
    label: 'decodeURIComponent',
    description: 'Decodes all special characters',
  },
  {
    id: 'decodeURI',
    label: 'decodeURI',
    description: 'Decodes preserving URL structure',
  },
]

function URLEncoderContent() {
  const [method, setMethod] = useQueryState(
    'method',
    parseAsStringEnum<EncodingMethod>([
      'encodeURI',
      'encodeURIComponent',
      'decodeURI',
      'decodeURIComponent',
    ]).withDefault('encodeURIComponent')
  )
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    trackToolEvent('url_encoder_open', {})
  }, [])

  const processInput = useCallback((text: string, selectedMethod: EncodingMethod) => {
    if (!text.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      let result: string
      switch (selectedMethod) {
        case 'encodeURI':
          result = encodeURI(text)
          break
        case 'encodeURIComponent':
          result = encodeURIComponent(text)
          break
        case 'decodeURI':
          result = decodeURI(text)
          break
        case 'decodeURIComponent':
          result = decodeURIComponent(text)
          break
        default:
          result = text
      }
      setOutput(result)
      setError(null)

      // Track encode/decode action
      const isEncode = selectedMethod.startsWith('encode')
      trackToolEvent(isEncode ? 'url_encoder_encode' : 'url_encoder_decode', {
        method: selectedMethod,
      })
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'An error occurred during processing')
    }
  }, [])

  useEffect(() => {
    processInput(input, method)
  }, [input, method, processInput])

  const handleCopy = useCallback(async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast.success('Copied to clipboard!')
      trackToolEvent('url_encoder_copy', {})
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    trackToolEvent('url_encoder_clear', {})
    toast.success('Cleared!')
  }, [])

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output)
      // Toggle between encode/decode
      if (method === 'encodeURIComponent') {
        setMethod('decodeURIComponent')
      } else if (method === 'decodeURIComponent') {
        setMethod('encodeURIComponent')
      } else if (method === 'encodeURI') {
        setMethod('decodeURI')
      } else if (method === 'decodeURI') {
        setMethod('encodeURI')
      }
    }
  }, [output, method, setMethod])

  const isEncode = method.startsWith('encode')

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
            bg: 'cyan.500/10',
            color: 'cyan.400',
            border: '1px solid',
            borderColor: 'cyan.500/20',
          })}
        >
          <Link2 className={css({ w: '3', h: '3', mr: '1' })} />
          Development Tool
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
              gradientFrom: 'cyan.400',
              gradientTo: 'blue.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            URL Encoder
          </span>{' '}
          <span className={css({ color: 'gray.100' })}>& Decoder</span>
        </h1>
        <p
          className={css({
            fontSize: { base: 'md', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Encode and decode URLs with encodeURI, encodeURIComponent, and their decode counterparts.
          Perfect for handling special characters in URLs and query parameters.
        </p>
      </div>

      {/* Method Selection */}
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
            borderColor: 'cyan.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ color: 'gray.100' })}>Encoding Method</CardTitle>
            <CardDescription>Choose how to encode or decode your URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: '3',
                w: 'full',
              })}
            >
              {ENCODING_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: method === m.id ? 'cyan.500' : 'gray.700',
                    bg: method === m.id ? 'cyan.500/10' : 'gray.800/50',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'cyan.500/50',
                      bg: 'cyan.500/5',
                    },
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: method === m.id ? 'cyan.400' : 'gray.200',
                      fontFamily: 'mono',
                    })}
                  >
                    {m.label}
                  </div>
                  <div
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.500',
                      mt: '1',
                    })}
                  >
                    {m.description}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input/Output */}
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
            borderColor: 'cyan.500/20',
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
                <CardTitle className={css({ color: 'gray.100' })}>
                  {isEncode ? 'Encode' : 'Decode'} URL
                </CardTitle>
                <CardDescription>
                  {isEncode
                    ? 'Enter text to encode for safe URL usage'
                    : 'Enter encoded text to decode'}
                </CardDescription>
              </div>
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwap}
                  disabled={!output}
                  className={css({
                    borderColor: 'gray.700',
                    _hover: { bg: 'gray.800' },
                  })}
                >
                  <ArrowLeftRight className={css({ w: '4', h: '4', mr: '2' })} />
                  Swap
                </Button>
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
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Input */}
            <div>
              <label
                htmlFor="url-encoder-input"
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Input {isEncode ? '(Plain Text)' : '(Encoded)'}
              </label>
              <Textarea
                id="url-encoder-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isEncode
                    ? 'Enter text to encode, e.g., Hello World! or https://example.com/path?query=value'
                    : 'Enter encoded text, e.g., Hello%20World%21'
                }
                className={css({
                  minH: '120px',
                  fontFamily: 'mono',
                  fontSize: 'sm',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: {
                    borderColor: 'cyan.500',
                    ring: '1px',
                    ringColor: 'cyan.500',
                  },
                })}
              />
            </div>

            {/* Output */}
            <div>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: '2',
                })}
              >
                <label
                  htmlFor="url-encoder-output"
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'gray.300',
                  })}
                >
                  Output {isEncode ? '(Encoded)' : '(Plain Text)'}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                  className={css({
                    color: 'gray.400',
                    _hover: { color: 'cyan.400', bg: 'cyan.500/10' },
                  })}
                >
                  {copied ? (
                    <Check className={css({ w: '4', h: '4', mr: '1', color: 'green.400' })} />
                  ) : (
                    <Copy className={css({ w: '4', h: '4', mr: '1' })} />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              {error ? (
                <div
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'red.500/10',
                    border: '1px solid',
                    borderColor: 'red.500/20',
                    color: 'red.400',
                    fontSize: 'sm',
                    fontFamily: 'mono',
                  })}
                >
                  Error: {error}
                </div>
              ) : (
                <Textarea
                  id="url-encoder-output"
                  value={output}
                  readOnly
                  placeholder="Output will appear here..."
                  className={css({
                    minH: '120px',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    bg: 'gray.800/30',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    color: output ? 'cyan.300' : 'gray.500',
                  })}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
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
            borderColor: 'cyan.500/20',
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
              <Sparkles className={css({ w: '5', h: '5', color: 'cyan.400' })} />
              Quick Examples
            </CardTitle>
            <CardDescription>Click to try these common encoding scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: '3',
                w: 'full',
              })}
            >
              {[
                { label: 'URL with spaces', value: 'Hello World' },
                { label: 'Special chars', value: 'name=John&age=30' },
                { label: 'Full URL', value: 'https://example.com/path?q=test value' },
                { label: 'Unicode', value: 'Caf\u00E9 \u2615 \u4E2D\u6587' },
                { label: 'Email in URL', value: 'user@example.com' },
                { label: 'Encoded string', value: 'Hello%20World%21' },
              ].map((example) => (
                <button
                  type="button"
                  key={example.label}
                  onClick={() => {
                    setInput(example.value)
                    // Auto-select decode if the example looks encoded
                    if (example.value.includes('%')) {
                      setMethod('decodeURIComponent')
                    } else {
                      setMethod('encodeURIComponent')
                    }
                  }}
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/30',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'cyan.500/50',
                      bg: 'cyan.500/5',
                    },
                  })}
                >
                  <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
                    {example.label}
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
                    {example.value}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/development/url-encoder" />

      {/* Social Share & Rating */}
      <div className={css({ spaceY: '6' })}>
        <SocialShare
          toolName="URL Encoder/Decoder"
          toolUrl="/tools/development/url-encoder"
          description="Encode and decode URLs with multiple methods"
        />
        <ToolRating toolId="url-encoder" toolName="URL Encoder/Decoder" />
      </div>
    </main>
  )
}

export default function URLEncoderPage() {
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
      <URLEncoderContent />
    </Suspense>
  )
}
