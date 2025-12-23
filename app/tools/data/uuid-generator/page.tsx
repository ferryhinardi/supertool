'use client'

import { motion } from 'framer-motion'
import { Check, Copy, Hash, Info, Loader2, RefreshCw, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// UUID validation regex pattern
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Validate UUID format and return version
function validateUUID(uuid: string): { valid: boolean; version?: number; error?: string } {
  if (!uuid || uuid.trim() === '') {
    return { valid: false, error: 'UUID cannot be empty' }
  }

  const trimmedUuid = uuid.trim()

  if (!UUID_PATTERN.test(trimmedUuid)) {
    return { valid: false, error: 'Invalid UUID format' }
  }

  // Extract version from the UUID (13th character)
  const version = Number.parseInt(trimmedUuid[14], 16)

  if (version < 1 || version > 5) {
    return { valid: false, error: `Invalid UUID version: ${version}` }
  }

  return { valid: true, version }
}

// Generate UUID v4 using Web Crypto API
function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Generate multiple UUIDs
function generateBulkUUIDs(count: number): string[] {
  const uuids: string[] = []
  for (let i = 0; i < count; i++) {
    uuids.push(generateUUIDv4())
  }
  return uuids
}

// Copy to clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

export default function UUIDGeneratorPage() {
  const [generatedUUID, setGeneratedUUID] = useState('')
  const [bulkCount, setBulkCount] = useState('10')
  const [bulkUUIDs, setBulkUUIDs] = useState<string[]>([])
  const [validateInput, setValidateInput] = useState('')
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    version?: number
    error?: string
  } | null>(null)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [isGenerating, setIsGenerating] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('uuid_generator_open', {})
  }, [])

  // Generate initial UUID
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount
  useEffect(() => {
    handleGenerateSingle()
  }, [])

  const handleGenerateSingle = () => {
    const uuid = generateUUIDv4()
    setGeneratedUUID(uuid)
    trackToolEvent('uuid_generate_single', {})
  }

  const handleGenerateBulk = () => {
    const count = Number.parseInt(bulkCount, 10)

    if (Number.isNaN(count) || count < 1 || count > 100) {
      toast.error('Please enter a number between 1 and 100')
      return
    }

    setIsGenerating(true)

    // Simulate processing time for better UX
    setTimeout(() => {
      const uuids = generateBulkUUIDs(count)
      setBulkUUIDs(uuids)
      setIsGenerating(false)
      toast.success(`Generated ${count} UUIDs!`)

      trackToolEvent('uuid_generate_bulk', { count })
    }, 300)
  }

  const handleValidate = () => {
    const result = validateUUID(validateInput)
    setValidationResult(result)

    if (result.valid) {
      toast.success(`Valid UUID v${result.version}!`)
    } else {
      toast.error(result.error || 'Invalid UUID')
    }

    trackToolEvent('uuid_validate', {
      valid: result.valid,
      ...(result.version !== undefined && { version: result.version }),
    })
  }

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text)

    if (success) {
      setCopiedStates({ ...copiedStates, [key]: true })
      toast.success('Copied to clipboard!')

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false })
      }, 2000)

      trackToolEvent('uuid_copy', { type: key })
    } else {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleCopyAllBulk = async () => {
    const allUUIDs = bulkUUIDs.join('\n')
    const success = await copyToClipboard(allUUIDs)

    if (success) {
      toast.success(`Copied all ${bulkUUIDs.length} UUIDs!`)
      trackToolEvent('uuid_copy_bulk', { count: bulkUUIDs.length })
    } else {
      toast.error('Failed to copy to clipboard')
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
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Hash className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            UUID v1-v5 • Bulk Generation
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          UUID Generator & Validator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Generate unique identifiers (v1-v5) with bulk generation support. Validate UUID format and
          version instantly. Perfect for database keys and API identifiers.
        </p>
      </motion.div>

      {/* Single UUID Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Generate UUID</CardTitle>
            <CardDescription>Generate a cryptographically secure UUID v4</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ display: 'flex', gap: '3', alignItems: 'center' })}>
              <Input
                readOnly
                value={generatedUUID}
                className={css({
                  flex: '1',
                  h: '14',
                  fontSize: 'lg',
                  fontFamily: 'mono',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  color: 'blue.300',
                  cursor: 'default',
                })}
              />
              <Button
                onClick={handleGenerateSingle}
                className={css({
                  h: '14',
                  gap: '2',
                  minW: '32',
                  bg: 'blue.500/20',
                  border: '1px solid',
                  borderColor: 'blue.500/50',
                  color: 'blue.300',
                  _hover: {
                    bg: 'blue.500/30',
                  },
                })}
              >
                <RefreshCw className={css({ h: '5', w: '5' })} />
                Generate
              </Button>
              <Button
                onClick={() => handleCopy(generatedUUID, 'single')}
                className={css({
                  h: '14',
                  gap: '2',
                  minW: '28',
                  bg: copiedStates.single ? 'green.500/20' : 'gray.800',
                  border: '1px solid',
                  borderColor: copiedStates.single ? 'green.500/50' : 'gray.700',
                  color: copiedStates.single ? 'green.300' : 'gray.400',
                  _hover: {
                    bg: copiedStates.single ? 'green.500/30' : 'gray.700',
                  },
                })}
              >
                {copiedStates.single ? (
                  <>
                    <Check className={css({ h: '5', w: '5' })} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className={css({ h: '5', w: '5' })} />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Info className={css({ h: '4', w: '4', color: 'gray.500' })} />
              <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                UUID v4 uses cryptographically secure random generation
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk UUID Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
            <CardTitle>Bulk UUID Generation</CardTitle>
            <CardDescription>Generate multiple UUIDs at once (up to 100)</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ display: 'flex', gap: '3', alignItems: 'center' })}>
              <div className={css({ flex: '1', spaceY: '2' })}>
                <label
                  htmlFor="bulk-count"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Number of UUIDs
                </label>
                <Input
                  id="bulk-count"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  className={css({
                    h: '14',
                    fontSize: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'cyan.500', ring: '2px', ringColor: 'cyan.500/20' },
                  })}
                />
              </div>
              <Button
                onClick={handleGenerateBulk}
                disabled={isGenerating}
                className={css({
                  h: '14',
                  gap: '2',
                  minW: '32',
                  mt: '7',
                  bg: 'cyan.500/20',
                  border: '1px solid',
                  borderColor: 'cyan.500/50',
                  color: 'cyan.300',
                  _hover: {
                    bg: 'cyan.500/30',
                  },
                  _disabled: {
                    opacity: '0.5',
                    cursor: 'not-allowed',
                  },
                })}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className={css({ h: '5', w: '5', animation: 'spin' })} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className={css({ h: '5', w: '5' })} />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {bulkUUIDs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({ spaceY: '3' })}
              >
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <Badge
                    className={css({
                      bg: 'cyan.500/20',
                      color: 'cyan.300',
                      border: '1px solid',
                      borderColor: 'cyan.500/30',
                    })}
                  >
                    {bulkUUIDs.length} UUIDs Generated
                  </Badge>
                  <Button
                    onClick={handleCopyAllBulk}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'cyan.300' },
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                    Copy All
                  </Button>
                </div>

                <textarea
                  readOnly
                  value={bulkUUIDs.join('\n')}
                  className={css({
                    w: 'full',
                    h: '64',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'cyan.500/30',
                    bg: 'gray.800/50',
                    p: '4',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'cyan.300',
                    resize: 'vertical',
                    _focus: {
                      outline: 'none',
                      borderColor: 'cyan.500',
                      ring: '2px',
                      ringColor: 'cyan.500/20',
                    },
                  })}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* UUID Validator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
            <CardTitle>UUID Validator</CardTitle>
            <CardDescription>Validate UUID format and check version</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ display: 'flex', gap: '3', alignItems: 'start' })}>
              <div className={css({ flex: '1', spaceY: '2' })}>
                <Input
                  placeholder="Enter UUID to validate (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                  value={validateInput}
                  onChange={(e) => {
                    setValidateInput(e.target.value)
                    setValidationResult(null)
                  }}
                  className={css({
                    h: '14',
                    fontSize: 'base',
                    fontFamily: 'mono',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'purple.500', ring: '2px', ringColor: 'purple.500/20' },
                  })}
                />
              </div>
              <Button
                onClick={handleValidate}
                disabled={!validateInput.trim()}
                className={css({
                  h: '14',
                  gap: '2',
                  minW: '32',
                  bg: 'purple.500/20',
                  border: '1px solid',
                  borderColor: 'purple.500/50',
                  color: 'purple.300',
                  _hover: {
                    bg: 'purple.500/30',
                  },
                  _disabled: {
                    opacity: '0.5',
                    cursor: 'not-allowed',
                  },
                })}
              >
                <Check className={css({ h: '5', w: '5' })} />
                Validate
              </Button>
            </div>

            {validationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: validationResult.valid ? 'green.500/30' : 'red.500/30',
                  bg: validationResult.valid ? 'green.500/10' : 'red.500/10',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  {validationResult.valid ? (
                    <>
                      <Check className={css({ h: '6', w: '6', color: 'green.400' })} />
                      <div>
                        <p
                          className={css({
                            fontSize: 'base',
                            fontWeight: 'semibold',
                            color: 'green.300',
                          })}
                        >
                          Valid UUID
                        </p>
                        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          Version: {validationResult.version}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className={css({ h: '6', w: '6', color: 'red.400' })} />
                      <div>
                        <p
                          className={css({
                            fontSize: 'base',
                            fontWeight: 'semibold',
                            color: 'red.300',
                          })}
                        >
                          Invalid UUID
                        </p>
                        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          {validationResult.error}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'teal.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'teal.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'teal.300' })}>
                  UUID Information
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>
                    • <strong>UUID v1:</strong> Timestamp-based, includes MAC address (predictable
                    but unique)
                  </li>
                  <li>
                    • <strong>UUID v4:</strong> Random generation (most common, cryptographically
                    secure)
                  </li>
                  <li>
                    • <strong>UUID v5:</strong> SHA-1 hashing with namespace (deterministic based on
                    input)
                  </li>
                  <li>• All UUIDs are 128-bit identifiers guaranteed to be universally unique</li>
                  <li>
                    • Perfect for database primary keys, distributed systems, and API identifiers
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
