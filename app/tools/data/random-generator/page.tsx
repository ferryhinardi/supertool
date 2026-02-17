'use client'

import { Check, Copy, Dices, RefreshCw, RotateCcw } from 'lucide-react'
import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type GeneratorType = 'number' | 'string' | 'uuid' | 'password'

const GENERATOR_TYPES: { id: GeneratorType; label: string; description: string }[] = [
  { id: 'number', label: 'Random Number', description: 'Generate integers or decimals in a range' },
  { id: 'string', label: 'Random String', description: 'Alphanumeric, letters, or custom chars' },
  { id: 'uuid', label: 'UUID v4', description: 'Universally unique identifier' },
  { id: 'password', label: 'Password', description: 'Secure random passwords' },
]

// Generate cryptographically secure random integer
function getSecureRandomInt(min: number, max: number): number {
  // Swap min and max if min > max to prevent infinite loop
  if (min > max) {
    ;[min, max] = [max, min]
  }

  const range = max - min + 1
  const bytesNeeded = Math.ceil(Math.log2(range) / 8) || 1
  const maxValid = Math.floor(256 ** bytesNeeded / range) * range - 1

  let randomValue: number
  const array = new Uint8Array(bytesNeeded)

  do {
    crypto.getRandomValues(array)
    randomValue = array.reduce((acc, byte, i) => acc + byte * 256 ** i, 0)
  } while (randomValue > maxValid)

  return min + (randomValue % range)
}

// Generate random decimal
function getSecureRandomDecimal(min: number, max: number, decimals: number): number {
  const multiplier = 10 ** decimals
  const minInt = Math.round(min * multiplier)
  const maxInt = Math.round(max * multiplier)
  return getSecureRandomInt(minInt, maxInt) / multiplier
}

// Generate random string from charset
function getSecureRandomString(length: number, charset: string): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[getSecureRandomInt(0, charset.length - 1)]
  }
  return result
}

// Generate UUID v4
function generateUUIDv4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Set version (4) and variant (10xx)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// Generate password
function generatePassword(
  length: number,
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
): string {
  let charset = ''
  if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) charset += '0123456789'
  if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  return getSecureRandomString(length, charset)
}

function RandomGeneratorContent() {
  const [generatorType, setGeneratorType] = useQueryState(
    'type',
    parseAsStringEnum<GeneratorType>(['number', 'string', 'uuid', 'password']).withDefault('number')
  )
  const [count, setCount] = useQueryState('count', parseAsInteger.withDefault(1))

  // Number options
  const [minNum, setMinNum] = useState(1)
  const [maxNum, setMaxNum] = useState(100)
  const [useDecimals, setUseDecimals] = useState(false)
  const [decimalPlaces, setDecimalPlaces] = useState(2)

  // String options
  const [stringLength, setStringLength] = useState(16)
  const [stringCharset, setStringCharset] = useState<
    'alphanumeric' | 'letters' | 'numbers' | 'custom'
  >('alphanumeric')
  const [customCharset, setCustomCharset] = useState('')

  // Password options
  const [passwordLength, setPasswordLength] = useState(16)
  const [pwdUppercase, setPwdUppercase] = useState(true)
  const [pwdLowercase, setPwdLowercase] = useState(true)
  const [pwdNumbers, setPwdNumbers] = useState(true)
  const [pwdSymbols, setPwdSymbols] = useState(true)

  // Results
  const [results, setResults] = useState<Array<{ id: string; value: string }>>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    trackToolEvent('random_generator_open', {})
  }, [])

  const generate = useCallback(() => {
    const newResults: Array<{ id: string; value: string }> = []
    const actualCount = Math.min(Math.max(1, count), 100)

    // Warn user if min > max for number generation (values will be swapped automatically)
    if (generatorType === 'number' && minNum > maxNum) {
      toast.warning('Min is greater than max. Values have been swapped automatically.')
    }

    for (let i = 0; i < actualCount; i++) {
      let value = ''
      switch (generatorType) {
        case 'number':
          if (useDecimals) {
            value = getSecureRandomDecimal(minNum, maxNum, decimalPlaces).toFixed(decimalPlaces)
          } else {
            value = getSecureRandomInt(minNum, maxNum).toString()
          }
          break

        case 'string': {
          let charset = ''
          switch (stringCharset) {
            case 'alphanumeric':
              charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
              break
            case 'letters':
              charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
              break
            case 'numbers':
              charset = '0123456789'
              break
            case 'custom':
              charset =
                customCharset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
              break
          }
          value = getSecureRandomString(stringLength, charset)
          break
        }

        case 'uuid':
          value = generateUUIDv4()
          break

        case 'password':
          if (!pwdUppercase && !pwdLowercase && !pwdNumbers && !pwdSymbols) {
            toast.warning('No character types selected. Using default alphanumeric charset.')
          }
          value = generatePassword(passwordLength, {
            uppercase: pwdUppercase,
            lowercase: pwdLowercase,
            numbers: pwdNumbers,
            symbols: pwdSymbols,
          })
          break
      }
      newResults.push({ id: crypto.randomUUID(), value })
    }

    setResults(newResults)
    trackToolEvent('random_generator_generate', { type: generatorType, count: actualCount })
    toast.success(`Generated ${actualCount} ${generatorType}${actualCount > 1 ? 's' : ''}!`)
  }, [
    generatorType,
    count,
    minNum,
    maxNum,
    useDecimals,
    decimalPlaces,
    stringLength,
    stringCharset,
    customCharset,
    passwordLength,
    pwdUppercase,
    pwdLowercase,
    pwdNumbers,
    pwdSymbols,
  ])

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      toast.success('Copied to clipboard!')
      trackToolEvent('random_generator_copy', {})
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  const handleCopyAll = useCallback(async () => {
    if (results.length === 0) return
    try {
      await navigator.clipboard.writeText(results.map((r) => r.value).join('\n'))
      toast.success('Copied all to clipboard!')
      trackToolEvent('random_generator_copy', { all: true })
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [results])

  const handleClear = useCallback(() => {
    setResults([])
    trackToolEvent('random_generator_clear', {})
    toast.success('Cleared!')
  }, [])

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
            bg: 'green.500/10',
            color: 'green.400',
            border: '1px solid',
            borderColor: 'green.500/20',
          })}
        >
          <Dices className={css({ w: '3', h: '3', mr: '1' })} />
          Data Tool
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
              gradientFrom: 'green.400',
              gradientTo: 'emerald.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Random
          </span>{' '}
          <span className={css({ color: 'gray.100' })}>Generator</span>
        </h1>
        <p
          className={css({
            fontSize: { base: 'md', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Generate cryptographically secure random numbers, strings, UUIDs, and passwords. Perfect
          for testing, development, and security applications.
        </p>
      </div>

      {/* Generator Type Selection */}
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
            <CardTitle className={css({ color: 'gray.100' })}>Generator Type</CardTitle>
            <CardDescription>Choose what type of random data to generate</CardDescription>
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
              {GENERATOR_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setGeneratorType(type.id)}
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: generatorType === type.id ? 'green.500' : 'gray.700',
                    bg: generatorType === type.id ? 'green.500/10' : 'gray.800/50',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'green.500/50',
                      bg: 'green.500/5',
                    },
                  })}
                >
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: generatorType === type.id ? 'green.400' : 'gray.200',
                    })}
                  >
                    {type.label}
                  </div>
                  <div
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.500',
                      mt: '1',
                    })}
                  >
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options */}
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
            <CardTitle className={css({ color: 'gray.100' })}>Options</CardTitle>
            <CardDescription>Configure the generator settings</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Count */}
            <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
              <label
                htmlFor="random-gen-count"
                className={css({ fontSize: 'sm', color: 'gray.300', minW: '100px' })}
              >
                Count (1-100)
              </label>
              <Input
                id="random-gen-count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) =>
                  setCount(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))
                }
                className={css({
                  w: '100px',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              />
            </div>

            {/* Number Options */}
            {generatorType === 'number' && (
              <div className={css({ spaceY: '3', pt: '2' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4',
                    flexWrap: 'wrap',
                  })}
                >
                  <label
                    htmlFor="random-gen-min"
                    className={css({ fontSize: 'sm', color: 'gray.300', minW: '100px' })}
                  >
                    Min
                  </label>
                  <Input
                    id="random-gen-min"
                    type="number"
                    value={minNum}
                    onChange={(e) => setMinNum(parseInt(e.target.value, 10) || 0)}
                    className={css({
                      w: '120px',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                  <label
                    htmlFor="random-gen-max"
                    className={css({ fontSize: 'sm', color: 'gray.300', minW: '50px' })}
                  >
                    Max
                  </label>
                  <Input
                    id="random-gen-max"
                    type="number"
                    value={maxNum}
                    onChange={(e) => setMaxNum(parseInt(e.target.value, 10) || 100)}
                    className={css({
                      w: '120px',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
                  <label
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      cursor: 'pointer',
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={useDecimals}
                      onChange={(e) => setUseDecimals(e.target.checked)}
                      className={css({ w: '4', h: '4' })}
                    />
                    <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Use decimals</span>
                  </label>
                  {useDecimals && (
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={decimalPlaces}
                      onChange={(e) =>
                        setDecimalPlaces(
                          Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 2))
                        )
                      }
                      className={css({
                        w: '80px',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  )}
                </div>
              </div>
            )}

            {/* String Options */}
            {generatorType === 'string' && (
              <div className={css({ spaceY: '3', pt: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
                  <label
                    htmlFor="random-gen-string-length"
                    className={css({ fontSize: 'sm', color: 'gray.300', minW: '100px' })}
                  >
                    Length
                  </label>
                  <Input
                    id="random-gen-string-length"
                    type="number"
                    min={1}
                    max={256}
                    value={stringLength}
                    onChange={(e) =>
                      setStringLength(
                        Math.min(256, Math.max(1, parseInt(e.target.value, 10) || 16))
                      )
                    }
                    className={css({
                      w: '100px',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
                <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                  {(['alphanumeric', 'letters', 'numbers', 'custom'] as const).map((charset) => (
                    <button
                      type="button"
                      key={charset}
                      onClick={() => setStringCharset(charset)}
                      className={css({
                        px: '3',
                        py: '1.5',
                        rounded: 'md',
                        fontSize: 'sm',
                        border: '1px solid',
                        borderColor: stringCharset === charset ? 'green.500' : 'gray.700',
                        bg: stringCharset === charset ? 'green.500/10' : 'gray.800/50',
                        color: stringCharset === charset ? 'green.400' : 'gray.300',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        _hover: { borderColor: 'green.500/50' },
                      })}
                    >
                      {charset}
                    </button>
                  ))}
                </div>
                {stringCharset === 'custom' && (
                  <Input
                    type="text"
                    placeholder="Enter custom characters..."
                    value={customCharset}
                    onChange={(e) => setCustomCharset(e.target.value)}
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                )}
              </div>
            )}

            {/* Password Options */}
            {generatorType === 'password' && (
              <div className={css({ spaceY: '3', pt: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
                  <label
                    htmlFor="random-gen-password-length"
                    className={css({ fontSize: 'sm', color: 'gray.300', minW: '100px' })}
                  >
                    Length
                  </label>
                  <Input
                    id="random-gen-password-length"
                    type="number"
                    min={4}
                    max={128}
                    value={passwordLength}
                    onChange={(e) =>
                      setPasswordLength(
                        Math.min(128, Math.max(4, parseInt(e.target.value, 10) || 16))
                      )
                    }
                    className={css({
                      w: '100px',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
                <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap' })}>
                  {[
                    { label: 'Uppercase (A-Z)', state: pwdUppercase, setter: setPwdUppercase },
                    { label: 'Lowercase (a-z)', state: pwdLowercase, setter: setPwdLowercase },
                    { label: 'Numbers (0-9)', state: pwdNumbers, setter: setPwdNumbers },
                    { label: 'Symbols (!@#$...)', state: pwdSymbols, setter: setPwdSymbols },
                  ].map((opt) => (
                    <label
                      key={opt.label}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        cursor: 'pointer',
                      })}
                    >
                      <input
                        type="checkbox"
                        checked={opt.state}
                        onChange={(e) => opt.setter(e.target.checked)}
                        className={css({ w: '4', h: '4' })}
                      />
                      <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className={css({ display: 'flex', gap: '3', pt: '2' })}>
              <Button
                onClick={generate}
                className={css({
                  bg: 'green.500',
                  color: 'white',
                  _hover: { bg: 'green.600' },
                })}
              >
                <RefreshCw className={css({ w: '4', h: '4', mr: '2' })} />
                Generate
              </Button>
              {results.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCopyAll}
                    className={css({
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className={css({
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    <RotateCcw className={css({ w: '4', h: '4', mr: '2' })} />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results.length > 0 && (
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
              <CardTitle className={css({ color: 'gray.100' })}>
                Results ({results.length})
              </CardTitle>
              <CardDescription>Click on any result to copy it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '2' })}>
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: '3',
                      rounded: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _hover: { borderColor: 'green.500/50' },
                    })}
                  >
                    <code
                      className={css({
                        fontSize: 'sm',
                        color: 'green.300',
                        fontFamily: 'mono',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        mr: '3',
                      })}
                    >
                      {result.value}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => handleCopy(result.value, result.id)}
                      aria-label={copied === result.id ? 'Copied' : 'Copy to clipboard'}
                      className={css({
                        color: 'gray.400',
                        flexShrink: 0,
                        _hover: { color: 'green.400', bg: 'green.500/10' },
                      })}
                    >
                      {copied === result.id ? (
                        <Check className={css({ w: '4', h: '4', color: 'green.400' })} />
                      ) : (
                        <Copy className={css({ w: '4', h: '4' })} />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ Section */}
      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/data/random-generator" />

      {/* Social Share & Rating */}
      <div className={css({ spaceY: '6' })}>
        <SocialShare
          toolName="Random Generator"
          toolUrl="/tools/data/random-generator"
          description="Generate random numbers, strings, UUIDs, and passwords"
        />
        <ToolRating toolId="random-generator" toolName="Random Generator" />
      </div>
    </main>
  )
}

export default function RandomGeneratorPage() {
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
      <RandomGeneratorContent />
    </Suspense>
  )
}
