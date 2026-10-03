'use client'

import { Copy, EyeOff, Info, Sparkles, Trash2, Upload } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SecurityToolHeader } from '@/components/features/tools/SecurityToolHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Zero-width characters for encoding
const ZERO_WIDTH_CHARS = {
  ZERO: '\u200B', // Zero-width space
  ONE: '\u200C', // Zero-width non-joiner
  SEPARATOR: '\u200D', // Zero-width joiner (used as separator)
  MARKER: '\uFEFF', // Zero-width no-break space (marker at start/end)
}

/**
 * Encode a message into zero-width characters
 */
function encodeMessage(message: string): string {
  if (!message) return ''

  // Convert each character to binary, then to zero-width chars
  const binaryString = message
    .split('')
    .map((char) => {
      const binary = char.charCodeAt(0).toString(2).padStart(16, '0')
      return binary
        .split('')
        .map((bit) => (bit === '0' ? ZERO_WIDTH_CHARS.ZERO : ZERO_WIDTH_CHARS.ONE))
        .join('')
    })
    .join(ZERO_WIDTH_CHARS.SEPARATOR)

  return ZERO_WIDTH_CHARS.MARKER + binaryString + ZERO_WIDTH_CHARS.MARKER
}

/**
 * Decode zero-width characters back to message
 */
function decodeMessage(text: string): string {
  try {
    // Extract only zero-width characters
    const zeroWidthOnly = text
      .split('')
      .filter((char) => Object.values(ZERO_WIDTH_CHARS).includes(char))
      .join('')

    // Remove markers
    const withoutMarkers = zeroWidthOnly.replace(new RegExp(ZERO_WIDTH_CHARS.MARKER, 'g'), '')

    // Split by separator
    const charBinaries = withoutMarkers.split(ZERO_WIDTH_CHARS.SEPARATOR)

    // Convert each binary sequence back to character
    const decoded = charBinaries
      .filter((binary) => binary.length > 0)
      .map((binary) => {
        const binaryStr = binary
          .split('')
          .map((char) => (char === ZERO_WIDTH_CHARS.ZERO ? '0' : '1'))
          .join('')
        return String.fromCharCode(Number.parseInt(binaryStr, 2))
      })
      .join('')

    return decoded
  } catch (error) {
    console.error('Decode error:', error)
    return ''
  }
}

/**
 * Check if text contains hidden message
 */
function hasHiddenMessage(text: string): boolean {
  const markerCount = (text.match(new RegExp(ZERO_WIDTH_CHARS.MARKER, 'g')) || []).length
  return markerCount >= 2
}

function SteganographyContent() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [coverText, setCoverText] = useState('')
  const [secretMessage, setSecretMessage] = useState('')
  const [decodedMessage, setDecodedMessage] = useState('')
  const [encodedResult, setEncodedResult] = useState('')

  // Track page visit
  useEffect(() => {
    trackToolEvent('steganography_open', {})
  }, [])

  const handleEncode = () => {
    if (!coverText.trim()) {
      toast.error('Please enter cover text')
      return
    }
    if (!secretMessage.trim()) {
      toast.error('Please enter a secret message')
      return
    }

    try {
      const encoded = encodeMessage(secretMessage)
      // Insert encoded message at the beginning of cover text
      const result = encoded + coverText
      setEncodedResult(result)
      toast.success('Message encoded successfully!')

      trackToolEvent('steganography_encode', {
        cover_text_length: coverText.length,
        secret_message_length: secretMessage.length,
      })
    } catch (error) {
      console.error('Encoding error:', error)
      toast.error('Failed to encode message')
      trackToolEvent('steganography_error', { action: 'encode' })
    }
  }

  const handleDecode = () => {
    if (!coverText.trim()) {
      toast.error('Please paste text to decode')
      return
    }

    try {
      if (!hasHiddenMessage(coverText)) {
        toast.error('No hidden message detected in this text')
        setDecodedMessage('')
        trackToolEvent('steganography_error', { action: 'decode_no_message' })
        return
      }

      const decoded = decodeMessage(coverText)
      if (!decoded) {
        toast.error('Failed to decode message')
        setDecodedMessage('')
        trackToolEvent('steganography_error', { action: 'decode_invalid' })
        return
      }

      setDecodedMessage(decoded)
      toast.success('Message decoded successfully!')

      trackToolEvent('steganography_decode', {
        decoded_length: decoded.length,
      })
    } catch (error) {
      console.error('Decoding error:', error)
      toast.error('Failed to decode message')
      setDecodedMessage('')
      trackToolEvent('steganography_error', { action: 'decode' })
    }
  }

  const handleCopyEncoded = async () => {
    try {
      await navigator.clipboard.writeText(encodedResult)
      toast.success('Encoded text copied to clipboard!')
      trackToolEvent('steganography_copy', { type: 'encoded' })
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
      trackToolEvent('steganography_error', { action: 'copy_encoded' })
    }
  }

  const handleCopyDecoded = async () => {
    try {
      await navigator.clipboard.writeText(decodedMessage)
      toast.success('Decoded message copied!')
      trackToolEvent('steganography_copy', { type: 'decoded' })
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
      trackToolEvent('steganography_error', { action: 'copy_decoded' })
    }
  }

  const handleReset = () => {
    setCoverText('')
    setSecretMessage('')
    setDecodedMessage('')
    setEncodedResult('')
  }

  const handleLoadExample = () => {
    if (mode === 'encode') {
      setCoverText('This is a completely normal message with nothing suspicious about it.')
      setSecretMessage('Secret: The meeting is at midnight')
      toast.success('Example loaded!')
    } else {
      // Pre-encoded example
      const exampleSecret = 'Hello World'
      const exampleCover = 'This is normal text.'
      const encoded = encodeMessage(exampleSecret)
      setCoverText(encoded + exampleCover)
      toast.success('Example loaded! Click Decode to reveal the secret.')
    }
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
      <SecurityToolHeader
        title="Text Steganography Tool"
        description="Hide secret messages within plain text using invisible zero-width characters. Encode and decode hidden text that is completely invisible to the naked eye."
        eyebrow="Hidden message workspace"
        icon={EyeOff}
        highlights={['Zero-width text', 'Encode or decode']}
      />

      {/* Mode Selector */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          gap: '3',
        })}
      >
        <Button
          onClick={() => {
            setMode('encode')
            handleReset()
          }}
          className={css({
            gap: '2',
            bg: mode === 'encode' ? 'emerald.500/20' : 'brand.surfaceRaised',
            border: '1px solid',
            borderColor: mode === 'encode' ? 'emerald.500/50' : 'gray.700/50',
            color: mode === 'encode' ? 'emerald.300' : 'brand.muted',
            _hover: {
              bg: mode === 'encode' ? 'emerald.500/30' : 'gray.800',
              borderColor: mode === 'encode' ? 'emerald.500/70' : 'gray.600',
            },
          })}
        >
          <Upload className={css({ h: '4', w: '4' })} />
          Encode Message
        </Button>
        <Button
          onClick={() => {
            setMode('decode')
            handleReset()
          }}
          className={css({
            gap: '2',
            bg: mode === 'decode' ? 'emerald.500/20' : 'brand.surfaceRaised',
            border: '1px solid',
            borderColor: mode === 'decode' ? 'emerald.500/50' : 'gray.700/50',
            color: mode === 'decode' ? 'emerald.300' : 'brand.muted',
            _hover: {
              bg: mode === 'decode' ? 'emerald.500/30' : 'gray.800',
              borderColor: mode === 'decode' ? 'emerald.500/70' : 'gray.600',
            },
          })}
        >
          <EyeOff className={css({ h: '4', w: '4' })} />
          Decode Message
        </Button>
      </div>

      {/* Encode Mode */}
      {mode === 'encode' && (
        <div className={css({ w: 'full' })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'emerald.500/20',
              bg: 'brand.surface',
            })}
          >
            <CardHeader>
              <CardTitle>Encode Secret Message</CardTitle>
              <CardDescription>
                Enter your cover text and secret message to hide it invisibly
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Cover Text */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="cover-text"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}
                >
                  Cover Text (visible)
                </label>
                <textarea
                  id="cover-text"
                  value={coverText}
                  onChange={(e) => setCoverText(e.target.value)}
                  placeholder="Enter normal text that will be visible..."
                  rows={4}
                  className={css({
                    w: 'full',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    px: '4',
                    py: '3',
                    fontSize: 'base',
                    color: 'gray.200',
                    resize: 'vertical',
                    _focus: {
                      outline: 'none',
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                    _placeholder: { color: 'brand.ink' },
                  })}
                />
              </div>

              {/* Secret Message */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="secret-message"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}
                >
                  Secret Message (will be hidden)
                </label>
                <textarea
                  id="secret-message"
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  placeholder="Enter your secret message to hide..."
                  rows={4}
                  className={css({
                    w: 'full',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    px: '4',
                    py: '3',
                    fontSize: 'base',
                    color: 'gray.200',
                    resize: 'vertical',
                    _focus: {
                      outline: 'none',
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                    _placeholder: { color: 'brand.ink' },
                  })}
                />
                {secretMessage && (
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Info className={css({ h: '4', w: '4', color: 'brand.ink' })} />
                    <span className={css({ fontSize: 'sm', color: 'brand.ink' })}>
                      {secretMessage.length} characters
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                <Button
                  onClick={handleEncode}
                  className={css({
                    gap: '2',
                    bg: 'emerald.500/20',
                    border: '1px solid',
                    borderColor: 'emerald.500/50',
                    color: 'brand.ink',
                    _hover: { bg: 'emerald.500/30' },
                  })}
                >
                  <EyeOff className={css({ h: '4', w: '4' })} />
                  Encode Message
                </Button>
                <Button
                  onClick={handleLoadExample}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'brand.ink',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <Sparkles className={css({ h: '4', w: '4' })} />
                  Load Example
                </Button>
                <Button
                  onClick={handleReset}
                  className={css({
                    gap: '2',
                    bg: 'transparent',
                    color: 'brand.ink',
                    _hover: { bg: 'red.500/20', color: 'red.400' },
                  })}
                >
                  <Trash2 className={css({ h: '4', w: '4' })} />
                  Clear
                </Button>
              </div>

              {/* Encoded Result */}
              {encodedResult && (
                <div
                  className={css({
                    spaceY: '3',
                  })}
                >
                  <label
                    htmlFor="encoded-result"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}
                  >
                    Encoded Text (contains hidden message)
                  </label>
                  <div className={css({ position: 'relative' })}>
                    <textarea
                      id="encoded-result"
                      value={encodedResult}
                      readOnly
                      rows={6}
                      className={css({
                        w: 'full',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'emerald.500/30',
                        bg: 'emerald.500/10',
                        px: '4',
                        py: '3',
                        fontSize: 'base',
                        fontWeight: 'medium',
                        color: 'brand.ink',
                        resize: 'vertical',
                        cursor: 'default',
                      })}
                    />
                    <Button
                      onClick={handleCopyEncoded}
                      className={css({
                        position: 'absolute',
                        top: '2',
                        right: '2',
                        gap: '2',
                        bg: 'gray.800',
                        color: 'brand.ink',
                        _hover: { bg: 'gray.700' },
                      })}
                      size="sm"
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                  </div>
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'green.500/20',
                      bg: 'green.500/10',
                      p: '4',
                    })}
                  >
                    <div
                      className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}
                    >
                      <Info className={css({ h: '4', w: '4', color: 'green.400' })} />
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.300',
                        })}
                      >
                        Success!
                      </span>
                    </div>
                    <p className={css({ fontSize: 'sm', color: 'brand.ink' })}>
                      Your secret message is now hidden in the text above. Share it with anyone -
                      they will only see the cover text, but you can decode it later to reveal the
                      secret.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Decode Mode */}
      {mode === 'decode' && (
        <div className={css({ w: 'full' })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'emerald.500/20',
              bg: 'brand.surface',
            })}
          >
            <CardHeader>
              <CardTitle>Decode Hidden Message</CardTitle>
              <CardDescription>
                Paste text containing a hidden message to reveal the secret
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Text to Decode */}
              <div className={css({ spaceY: '3' })}>
                <label
                  htmlFor="text-to-decode"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}
                >
                  Text to Decode
                </label>
                <textarea
                  id="text-to-decode"
                  value={coverText}
                  onChange={(e) => setCoverText(e.target.value)}
                  placeholder="Paste text that might contain a hidden message..."
                  rows={6}
                  className={css({
                    w: 'full',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    px: '4',
                    py: '3',
                    fontSize: 'base',
                    color: 'gray.200',
                    resize: 'vertical',
                    _focus: {
                      outline: 'none',
                      borderColor: 'emerald.500',
                      ring: '2px',
                      ringColor: 'emerald.500/20',
                    },
                    _placeholder: { color: 'brand.ink' },
                  })}
                />
                {coverText && (
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Info className={css({ h: '4', w: '4', color: 'brand.ink' })} />
                    <span className={css({ fontSize: 'sm', color: 'brand.ink' })}>
                      {hasHiddenMessage(coverText)
                        ? 'Hidden message detected!'
                        : 'No hidden message detected'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                <Button
                  onClick={handleDecode}
                  className={css({
                    gap: '2',
                    bg: 'emerald.500/20',
                    border: '1px solid',
                    borderColor: 'emerald.500/50',
                    color: 'brand.ink',
                    _hover: { bg: 'emerald.500/30' },
                  })}
                >
                  <EyeOff className={css({ h: '4', w: '4' })} />
                  Decode Message
                </Button>
                <Button
                  onClick={handleLoadExample}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'brand.ink',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <Sparkles className={css({ h: '4', w: '4' })} />
                  Load Example
                </Button>
                <Button
                  onClick={handleReset}
                  className={css({
                    gap: '2',
                    bg: 'transparent',
                    color: 'brand.ink',
                    _hover: { bg: 'red.500/20', color: 'red.400' },
                  })}
                >
                  <Trash2 className={css({ h: '4', w: '4' })} />
                  Clear
                </Button>
              </div>

              {/* Decoded Message */}
              {decodedMessage && (
                <div
                  className={css({
                    spaceY: '3',
                  })}
                >
                  <label
                    htmlFor="decoded-message"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}
                  >
                    Decoded Secret Message
                  </label>
                  <div className={css({ position: 'relative' })}>
                    <textarea
                      id="decoded-message"
                      value={decodedMessage}
                      readOnly
                      rows={4}
                      className={css({
                        w: 'full',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'emerald.500/30',
                        bg: 'emerald.500/10',
                        px: '4',
                        py: '3',
                        fontSize: 'base',
                        fontWeight: 'medium',
                        color: 'brand.ink',
                        resize: 'vertical',
                        cursor: 'default',
                      })}
                    />
                    <Button
                      onClick={handleCopyDecoded}
                      className={css({
                        position: 'absolute',
                        top: '2',
                        right: '2',
                        gap: '2',
                        bg: 'gray.800',
                        color: 'brand.ink',
                        _hover: { bg: 'gray.700' },
                      })}
                      size="sm"
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                  </div>
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'green.500/20',
                      bg: 'green.500/10',
                      p: '4',
                    })}
                  >
                    <div
                      className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}
                    >
                      <Info className={css({ h: '4', w: '4', color: 'green.400' })} />
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.300',
                        })}
                      >
                        Decoded Successfully!
                      </span>
                    </div>
                    <p className={css({ fontSize: 'sm', color: 'brand.ink' })}>
                      The hidden message has been revealed. This message was completely invisible in
                      the original text.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function SteganographyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SteganographyContent />
    </Suspense>
  )
}
