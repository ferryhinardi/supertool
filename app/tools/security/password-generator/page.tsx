'use client'

import {
  AlertTriangle,
  Clock,
  Copy,
  Download,
  History,
  Key,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Zap,
} from 'lucide-react'
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import {
  TOOL_COLORS,
  ToolMobilePicker,
  type ToolOperation,
  ToolOperationGrid,
} from '@/components/features/tool-components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import type { PasswordHistory } from './utils'
import {
  calculateStrength,
  checkCommonPassword,
  checkPasswordPwned,
  clearHistory,
  deleteFromHistory,
  exportBulkToCSV,
  exportHistoryToCSV,
  generateBulkPasswords,
  generateDiceware,
  generateFromTemplate,
  generatePassword,
  generatePronounceable,
  getPasswordHistory,
  PASSWORD_TEMPLATES,
  savePasswordToHistory,
  toggleFavorite,
} from './utils'

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

// Password Generation Mode Operations
const PASSWORD_MODE_OPERATIONS: ToolOperation[] = [
  {
    id: 'random',
    label: 'Random',
    icon: Key,
    color: TOOL_COLORS.primary,
    description: 'Traditional random character password',
  },
  {
    id: 'diceware',
    label: 'Diceware',
    icon: Sparkles,
    color: TOOL_COLORS.secondary,
    description: 'Word-based passphrase (memorable)',
  },
  {
    id: 'pronounceable',
    label: 'Pronounceable',
    icon: Zap,
    color: TOOL_COLORS.warning,
    description: 'Easy to say and remember',
  },
  {
    id: 'template',
    label: 'Template',
    icon: Shield,
    color: TOOL_COLORS.success,
    description: 'Pre-defined patterns (banking, WiFi, etc)',
  },
]

function PasswordGeneratorContent() {
  const [password, setPassword] = useState('')
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([])
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [checkingPwned, setCheckingPwned] = useState(false)
  const [pwnedResult, setPwnedResult] = useState<{ isPwned: boolean; count: number } | null>(null)

  // URL state
  const [length, setLength] = useQueryState('length', parseAsInteger.withDefault(16))
  const [uppercase, setUppercase] = useQueryState('uppercase', parseAsBoolean.withDefault(true))
  const [lowercase, setLowercase] = useQueryState('lowercase', parseAsBoolean.withDefault(true))
  const [numbers, setNumbers] = useQueryState('numbers', parseAsBoolean.withDefault(true))
  const [symbols, setSymbols] = useQueryState('symbols', parseAsBoolean.withDefault(true))
  const [mode, setMode] = useQueryState('mode', parseAsString.withDefault('random'))

  // Local state
  const [bulkCount, setBulkCount] = useState(10)
  const [dicewareWords, setDicewareWords] = useState(6)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('banking')

  const options: PasswordOptions = {
    length,
    uppercase,
    lowercase,
    numbers,
    symbols,
  }

  const strength = calculateStrength(password)
  const isCommon = password && checkCommonPassword(password)

  // Load history on mount
  useEffect(() => {
    setPasswordHistory(getPasswordHistory())
  }, [])

  const handleGenerate = () => {
    try {
      let newPassword = ''

      switch (mode) {
        case 'random':
          newPassword = generatePassword(options)
          trackToolEvent('password_generate_random', {
            length: options.length,
            has_uppercase: options.uppercase,
            has_lowercase: options.lowercase,
            has_numbers: options.numbers,
            has_symbols: options.symbols,
          })
          break
        case 'diceware':
          newPassword = generateDiceware(dicewareWords, '-')
          trackToolEvent('password_generate_diceware', { words: dicewareWords })
          break
        case 'pronounceable':
          newPassword = generatePronounceable(length)
          trackToolEvent('password_generate_pronounceable', { length })
          break
        case 'template':
          newPassword = generateFromTemplate(selectedTemplate)
          trackToolEvent('password_generate_template', { template: selectedTemplate })
          break
      }

      setPassword(newPassword)
      savePasswordToHistory(newPassword)
      setPasswordHistory(getPasswordHistory())
      setPwnedResult(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate password')
    }
  }

  const handleBulkGenerate = () => {
    try {
      const passwords = generateBulkPasswords(bulkCount, options)
      setBulkPasswords(passwords)
      trackToolEvent('password_bulk_generate', { count: bulkCount, unique: passwords.length })
      toast.success(`Generated ${passwords.length} unique passwords`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate passwords')
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      trackToolEvent('password_copy', { success: true })
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownloadBulk = () => {
    try {
      const csv = exportBulkToCSV(bulkPasswords)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `passwords-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      trackToolEvent('password_bulk_export', { count: bulkPasswords.length })
      toast.success('Downloaded passwords CSV')
    } catch {
      toast.error('Failed to download passwords')
    }
  }

  const handleCheckPwned = async () => {
    if (!password) return

    setCheckingPwned(true)
    setPwnedResult(null)

    try {
      const result = await checkPasswordPwned(password)
      setPwnedResult(result)
      trackToolEvent('password_pwned_check', { isPwned: result.isPwned })

      if (result.isPwned) {
        toast.error(`⚠️ Password found in ${result.count.toLocaleString()} breaches!`)
      } else {
        toast.success('✅ Password not found in known breaches')
      }
    } catch (_error) {
      toast.error('Failed to check password')
    } finally {
      setCheckingPwned(false)
    }
  }

  const handleFavorite = (pwd: string) => {
    toggleFavorite(pwd)
    setPasswordHistory(getPasswordHistory())
  }

  const handleDeleteHistory = (pwd: string) => {
    deleteFromHistory(pwd)
    setPasswordHistory(getPasswordHistory())
    toast.success('Removed from history')
  }

  const handleClearHistory = () => {
    clearHistory()
    setPasswordHistory([])
    toast.success('History cleared')
  }

  const handleExportHistory = () => {
    try {
      const csv = exportHistoryToCSV(passwordHistory)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `password-history-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      trackToolEvent('password_history_export', { count: passwordHistory.length })
      toast.success('Downloaded history CSV')
    } catch {
      toast.error('Failed to export history')
    }
  }

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    if (key === 'length') setLength(value as number)
    else if (key === 'uppercase') setUppercase(value as boolean)
    else if (key === 'lowercase') setLowercase(value as boolean)
    else if (key === 'numbers') setNumbers(value as boolean)
    else if (key === 'symbols') setSymbols(value as boolean)
  }

  const atLeastOneSelected =
    options.uppercase || options.lowercase || options.numbers || options.symbols

  // Keyboard shortcuts
  const { showHelp, setShowHelp, modifierKey } = useKeyboardShortcuts({
    onExecute: handleGenerate,
    onCopy: password ? () => handleCopy(password) : undefined,
    onHistory: () => setShowHistory(!showHistory),
    onReset: () => {
      setPassword('')
      setPwnedResult(null)
      setShowHistory(false)
    },
  })

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
          animationDelay: '0.0s',
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
            borderColor: 'red.500/30',
            bg: 'red.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'red.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'red.300',
            })}
          >
            Password Generator Pro
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'red.400',
            gradientVia: 'pink.400',
            gradientTo: 'rose.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Password Generator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Generate cryptographically secure passwords with advanced strength analysis, pattern-based
          generation, breach checking, and password history management.
        </p>
      </div>

      {/* Generation Mode Selector - Desktop */}
      <div
        className={css({
          display: { base: 'none', md: 'block' },
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.3s',
          opacity: 0,
        })}
      >
        <ToolOperationGrid
          operations={PASSWORD_MODE_OPERATIONS}
          selectedOperation={mode}
          onOperationChange={(newMode) => setMode(newMode)}
          columns={{ base: 1, sm: 2, md: 2, lg: 4 }}
          analyticsCategory="password_generator"
        />
      </div>

      {/* Generation Mode Selector - Mobile */}
      <div
        className={css({
          display: { base: 'block', md: 'none' },
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.3s',
          opacity: 0,
        })}
      >
        <ToolMobilePicker
          label={`Mode: ${PASSWORD_MODE_OPERATIONS.find((op) => op.id === mode)?.label || 'Random'}`}
          title="Choose Password Mode"
          description="Select the type of password to generate"
          color={PASSWORD_MODE_OPERATIONS.find((op) => op.id === mode)?.color}
        >
          <ToolOperationGrid
            operations={PASSWORD_MODE_OPERATIONS}
            selectedOperation={mode}
            onOperationChange={(newMode) => setMode(newMode)}
            columns={{ base: 1, sm: 2 }}
            analyticsCategory="password_generator"
          />
        </ToolMobilePicker>
      </div>

      <div
        className={css({
          display: 'grid',
          gap: { base: '6', lg: '8' },
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          w: 'full',
        })}
      >
        {/* Password Generator */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'red.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            w: 'full',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <Shield className={css({ h: '5', w: '5', color: 'red.400' })} />
              <CardTitle>Generate Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Generated Password Display */}
            {password && (
              <div className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    position: 'relative',
                    overflow: 'hidden',
                    rounded: 'lg',
                    border: '2px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.900/50',
                    p: '4',
                  })}
                >
                  <div
                    className={css({
                      fontFamily: 'mono',
                      fontSize: { base: 'md', sm: 'lg' },
                      fontWeight: 'bold',
                      color: 'white',
                      overflowWrap: 'break-word',
                      pr: '10',
                    })}
                  >
                    {password}
                  </div>
                  <Button
                    onClick={() => handleCopy(password)}
                    variant="ghost"
                    aria-label="Copy password to clipboard"
                    className={css({
                      position: 'absolute',
                      top: '2',
                      right: '2',
                      minH: '11',
                      minW: '11',
                      p: '2',
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>

                {/* Common Password Warning */}
                {isCommon && (
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                      alignItems: 'start',
                      rounded: 'lg',
                      bg: 'red.500/10',
                      border: '1px solid',
                      borderColor: 'red.500/30',
                      p: '3',
                    })}
                  >
                    <AlertTriangle
                      className={css({ h: '4', w: '4', color: 'red.400', mt: '0.5' })}
                    />
                    <div className={css({ fontSize: 'sm', color: 'red.300' })}>
                      Warning: This password contains a common pattern. Generate a new one!
                    </div>
                  </div>
                )}

                {/* Enhanced Strength Meter */}
                <div className={css({ spaceY: '3' })}>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <span
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                      })}
                    >
                      Password Strength
                    </span>
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'bold' })}
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div
                    className={css({
                      h: '3',
                      overflow: 'hidden',
                      rounded: 'full',
                      bg: 'gray.800',
                    })}
                  >
                    <div
                      className={css({
                        h: 'full',
                        rounded: 'full',
                        transition: 'all 0.3s',
                      })}
                      style={{
                        width: `${((strength.score + 1) / 5) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>

                  {/* Advanced metrics */}
                  <div
                    className={css({
                      display: 'grid',
                      gap: '2',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                    })}
                  >
                    <div
                      className={css({
                        rounded: 'lg',
                        bg: 'gray.900/50',
                        p: '3',
                      })}
                    >
                      <div className={css({ fontSize: 'xs', color: 'white' })}>Entropy</div>
                      <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'white' })}>
                        {strength.entropy?.toFixed(1) || 'N/A'} bits
                      </div>
                    </div>
                    <div
                      className={css({
                        rounded: 'lg',
                        bg: 'gray.900/50',
                        p: '3',
                      })}
                    >
                      <div className={css({ fontSize: 'xs', color: 'white' })}>Crack Time</div>
                      <div
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'bold',
                          color: 'white',
                        })}
                      >
                        {strength.crackTime || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  {strength.feedback.length > 0 && (
                    <ul
                      className={css({
                        spaceY: '1',
                        pl: '4',
                        fontSize: 'sm',
                        color: 'white',
                      })}
                    >
                      {strength.feedback.map((tip) => (
                        <li key={tip}>• {tip}</li>
                      ))}
                    </ul>
                  )}

                  {/* HIBP Check */}
                  <div className={css({ pt: '2' })}>
                    <Button
                      onClick={handleCheckPwned}
                      disabled={checkingPwned}
                      variant="outline"
                      className={css({
                        w: 'full',
                        minH: '11',
                        py: { base: '3', sm: '3.5', md: '4' },
                      })}
                    >
                      {checkingPwned ? (
                        <>
                          <Clock
                            className={css({
                              h: '4',
                              w: '4',
                              animation: 'spin 1s linear infinite',
                            })}
                          />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Shield className={css({ h: '4', w: '4' })} />
                          Check if Pwned
                        </>
                      )}
                    </Button>

                    {pwnedResult && (
                      <div
                        className={css({
                          mt: '2',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: pwnedResult.isPwned ? 'red.500/30' : 'green.500/30',
                          bg: pwnedResult.isPwned ? 'red.500/10' : 'green.500/10',
                          p: '3',
                        })}
                      >
                        <div
                          className={css({
                            fontSize: 'sm',
                            color: pwnedResult.isPwned ? 'red.300' : 'green.300',
                          })}
                        >
                          {pwnedResult.isPwned
                            ? `⚠️ Found in ${pwnedResult.count.toLocaleString()} breaches!`
                            : '✅ Not found in known breaches'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mode-specific options */}
            {mode === 'random' && (
              <>
                {/* Password Length */}
                <Field>
                  <FieldLabel htmlFor="length-slider">Password Length: {options.length}</FieldLabel>
                  <input
                    id="length-slider"
                    type="range"
                    min="8"
                    max="64"
                    value={options.length}
                    onChange={(e) => updateOption('length', parseInt(e.target.value, 10))}
                    className={css({
                      w: 'full',
                      h: '2',
                      rounded: 'full',
                      bg: 'gray.700',
                      cursor: 'pointer',
                      _focusVisible: {
                        outline: 'none',
                        ring: '2px',
                        ringColor: 'red.500',
                      },
                    })}
                  />
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'xs',
                      color: 'white',
                    })}
                  >
                    <span>8</span>
                    <span>64</span>
                  </div>
                </Field>

                {/* Character Sets */}
                <div className={css({ spaceY: '3' })}>
                  <FieldLabel>Character Types</FieldLabel>
                  <div
                    className={css({
                      display: 'grid',
                      gap: '3',
                      gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                      w: 'full',
                    })}
                  >
                    {[
                      {
                        key: 'uppercase' as const,
                        label: 'Uppercase (A-Z)',
                        example: 'ABC',
                      },
                      {
                        key: 'lowercase' as const,
                        label: 'Lowercase (a-z)',
                        example: 'abc',
                      },
                      {
                        key: 'numbers' as const,
                        label: 'Numbers (0-9)',
                        example: '123',
                      },
                      {
                        key: 'symbols' as const,
                        label: 'Symbols (!@#)',
                        example: '!@#',
                      },
                    ].map(({ key, label, example }) => (
                      <label
                        key={key}
                        htmlFor={`checkbox-${key}`}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: options[key] ? 'red.500/50' : 'gray.700',
                          bg: options[key] ? 'red.500/10' : 'gray.900/30',
                          p: '3',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          _hover: {
                            borderColor: 'red.500/70',
                            bg: 'red.500/15',
                          },
                        })}
                      >
                        <input
                          id={`checkbox-${key}`}
                          type="checkbox"
                          checked={options[key]}
                          onChange={(e) => updateOption(key, e.target.checked)}
                          className={css({
                            h: '4',
                            w: '4',
                            rounded: 'sm',
                            border: '2px solid',
                            borderColor: 'gray.600',
                            cursor: 'pointer',
                            _checked: { bg: 'red.500', borderColor: 'red.500' },
                          })}
                        />
                        <div className={css({ flex: '1' })}>
                          <div
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'white',
                            })}
                          >
                            {label}
                          </div>
                          <div
                            className={css({
                              fontFamily: 'mono',
                              fontSize: 'xs',
                              color: 'white',
                            })}
                          >
                            {example}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {!atLeastOneSelected && (
                    <p className={css({ fontSize: 'sm', color: 'red.400' })}>
                      ⚠️ Select at least one character type
                    </p>
                  )}
                </div>
              </>
            )}

            {mode === 'diceware' && (
              <Field>
                <FieldLabel htmlFor="diceware-words">Number of Words: {dicewareWords}</FieldLabel>
                <input
                  id="diceware-words"
                  type="range"
                  min="4"
                  max="10"
                  value={dicewareWords}
                  onChange={(e) => setDicewareWords(parseInt(e.target.value, 10))}
                  className={css({
                    w: 'full',
                    h: '2',
                    rounded: 'full',
                    bg: 'gray.700',
                    cursor: 'pointer',
                  })}
                />
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'xs',
                    color: 'white',
                  })}
                >
                  <span>4 words</span>
                  <span>10 words</span>
                </div>
                <p className={css({ fontSize: 'xs', color: 'white', mt: '2' })}>
                  6 words ≈ 77 bits of entropy (recommended)
                </p>
              </Field>
            )}

            {mode === 'pronounceable' && (
              <Field>
                <FieldLabel htmlFor="pronounce-length">Password Length: {length}</FieldLabel>
                <input
                  id="pronounce-length"
                  type="range"
                  min="8"
                  max="32"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value, 10))}
                  className={css({
                    w: 'full',
                    h: '2',
                    rounded: 'full',
                    bg: 'gray.700',
                    cursor: 'pointer',
                  })}
                />
              </Field>
            )}

            {mode === 'template' && (
              <Field>
                <FieldLabel htmlFor="template-select">Select Template</FieldLabel>
                <select
                  id="template-select"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className={css({
                    w: 'full',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.900',
                    color: 'white',
                    p: '3',
                    fontSize: 'sm',
                    cursor: 'pointer',
                  })}
                >
                  {PASSWORD_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
                <p className={css({ fontSize: 'xs', color: 'white', mt: '2' })}>
                  Example: {PASSWORD_TEMPLATES.find((t) => t.id === selectedTemplate)?.example}
                </p>
              </Field>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={mode === 'random' && !atLeastOneSelected}
              className={css({
                w: 'full',
                h: '12',
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'white',
              })}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #ec4899)',
              }}
            >
              <RefreshCw className={css({ h: '5', w: '5' })} />
              Generate Password
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Generation */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'yellow.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            w: 'full',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <Zap className={css({ h: '5', w: '5', color: 'yellow.400' })} />
              <CardTitle>Bulk Generation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            <Field>
              <FieldLabel htmlFor="bulk-count">Number of Passwords</FieldLabel>
              <FieldInput
                id="bulk-count"
                type="number"
                min="1"
                max="100"
                value={bulkCount}
                onChange={(e) =>
                  setBulkCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))
                }
                className={css({ h: '12' })}
              />
              <p className={css({ fontSize: 'sm', color: 'white' })}>
                Generate up to 100 unique passwords at once
              </p>
            </Field>

            <div className={css({ display: 'flex', gap: '3' })}>
              <Button
                onClick={handleBulkGenerate}
                disabled={mode === 'random' && !atLeastOneSelected}
                className={css({ flex: '1', h: '12' })}
              >
                <Zap className={css({ h: '5', w: '5' })} />
                Generate {bulkCount}
              </Button>
              {bulkPasswords.length > 0 && (
                <Button onClick={handleDownloadBulk} variant="outline" className={css({ h: '12' })}>
                  <Download className={css({ h: '5', w: '5' })} />
                </Button>
              )}
            </div>

            {bulkPasswords.length > 0 && (
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'white',
                    })}
                  >
                    Generated {bulkPasswords.length} passwords
                  </p>
                  <Button
                    onClick={() => setBulkPasswords([])}
                    variant="ghost"
                    className={css({
                      fontSize: 'xs',
                      minH: '11',
                      py: { base: '3', sm: '3.5', md: '4' },
                    })}
                  >
                    Clear
                  </Button>
                </div>
                <div
                  className={css({
                    maxH: '96',
                    overflow: 'auto',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.900/30',
                    p: '3',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    {bulkPasswords.map((pwd) => (
                      <div
                        key={pwd}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          rounded: 'md',
                          bg: 'gray.900/50',
                          p: '2',
                          _hover: { bg: 'gray.900/70' },
                        })}
                      >
                        <span
                          className={css({
                            flex: '1',
                            fontFamily: 'mono',
                            fontSize: 'sm',
                            overflowWrap: 'break-word',
                          })}
                        >
                          {pwd}
                        </span>
                        <Button
                          onClick={() => handleCopy(pwd)}
                          variant="ghost"
                          className={css({
                            minH: '11',
                            minW: '11',
                            p: '2',
                          })}
                        >
                          <Copy className={css({ h: '3', w: '3' })} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password History */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'blue.500/20',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
          w: 'full',
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
              <History className={css({ h: '5', w: '5', color: 'blue.400' })} />
              <CardTitle>Password History</CardTitle>
              <span className={css({ fontSize: 'sm', color: 'white' })}>
                (Last {passwordHistory.length})
              </span>
            </div>
            <div className={css({ display: 'flex', gap: '2' })}>
              {passwordHistory.length > 0 && (
                <>
                  <Button
                    onClick={handleExportHistory}
                    variant="outline"
                    className={css({
                      minH: '11',
                      py: { base: '3', sm: '3.5', md: '4' },
                    })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
                    Export
                  </Button>
                  <Button
                    onClick={handleClearHistory}
                    variant="outline"
                    className={css({
                      minH: '11',
                      py: { base: '3', sm: '3.5', md: '4' },
                    })}
                  >
                    Clear All
                  </Button>
                </>
              )}
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="ghost"
                className={css({
                  minH: '11',
                  py: { base: '3', sm: '3.5', md: '4' },
                })}
              >
                {showHistory ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showHistory && passwordHistory.length > 0 && (
          <CardContent>
            <div className={css({ spaceY: '2' })}>
              {passwordHistory.map((entry, index) => (
                <div
                  key={`${entry.password}-${index}`}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: entry.favorite ? 'yellow.500/30' : 'gray.700',
                    bg: entry.favorite ? 'yellow.500/5' : 'gray.900/30',
                    p: '3',
                  })}
                >
                  <button
                    type="button"
                    onClick={() => handleFavorite(entry.password)}
                    className={css({
                      flexShrink: '0',
                      minH: '11',
                      minW: '11',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: entry.favorite ? 'yellow.400' : 'gray.600',
                      _hover: { color: 'yellow.400' },
                    })}
                  >
                    {entry.favorite ? (
                      <Star className={css({ h: '4', w: '4', fill: 'currentColor' })} />
                    ) : (
                      <Star className={css({ h: '4', w: '4' })} />
                    )}
                  </button>
                  <div className={css({ flex: '1', minW: '0' })}>
                    <div
                      className={css({
                        fontFamily: 'mono',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'white',
                        overflowWrap: 'break-word',
                      })}
                    >
                      {entry.password}
                    </div>
                    <div
                      className={css({
                        display: 'flex',
                        gap: '3',
                        fontSize: 'xs',
                        color: 'white',
                        mt: '1',
                      })}
                    >
                      <span style={{ color: entry.strength.color }}>{entry.strength.label}</span>
                      <span>•</span>
                      <span>{entry.length} chars</span>
                      <span>•</span>
                      <span>{entry.strength.entropy?.toFixed(1)} bits</span>
                      <span>•</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopy(entry.password)}
                    variant="ghost"
                    className={css({
                      minH: '11',
                      minW: '11',
                      p: '2',
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteHistory(entry.password)}
                    variant="ghost"
                    className={css({
                      minH: '11',
                      minW: '11',
                      p: '2',
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4', color: 'red.400' })} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {showHistory && passwordHistory.length === 0 && (
          <CardContent>
            <div
              className={css({
                textAlign: 'center',
                py: '8',
                color: 'white',
              })}
            >
              <History className={css({ h: '12', w: '12', mx: 'auto', mb: '3', opacity: '0.3' })} />
              <p>No password history yet. Generate a password to get started!</p>
            </div>
          </CardContent>
        )}
      </Card>

      <SocialShare
        toolName="Password Generator"
        toolUrl="/tools/password-generator"
        description="Generate secure passwords with our free password generator - supports Diceware, pronounceable passwords, and HIBP breach checking"
        hashtags={['Password', 'Security', 'CyberSecurity', 'WebSecurity']}
      />
      <RelatedTools currentToolPath="/tools/password-generator" category="security" />
      <ToolRating toolId="/tools/password-generator" toolName="Password Generator" />

      {/* Affiliate Suggestions */}
      <AffiliateSuggestion tool="password-generator" variant="banner" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
      <ToolSearch />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={[
          { key: `${modifierKey}+Enter`, label: 'Generate', description: 'Generate new password' },
          { key: `${modifierKey}+C`, label: 'Copy', description: 'Copy password' },
          { key: `${modifierKey}+H`, label: 'History', description: 'Toggle history panel' },
          { key: `${modifierKey}+R`, label: 'Reset', description: 'Reset form' },
          { key: `${modifierKey}+/`, label: 'Help', description: 'Show this help' },
        ]}
      />
    </main>
  )
}

export default function PasswordGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordGeneratorContent />
    </Suspense>
  )
}
