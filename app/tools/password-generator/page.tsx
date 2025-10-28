'use client'

import { Copy, Download, Key, RefreshCw, Shield, Zap } from 'lucide-react'
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'
import { calculateStrength, generatePassword } from './utils'

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

function PasswordGeneratorContent() {
  const [password, setPassword] = useState('')
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([])
  const [length, setLength] = useQueryState('length', parseAsInteger.withDefault(16))
  const [uppercase, setUppercase] = useQueryState('uppercase', parseAsBoolean.withDefault(true))
  const [lowercase, setLowercase] = useQueryState('lowercase', parseAsBoolean.withDefault(true))
  const [numbers, setNumbers] = useQueryState('numbers', parseAsBoolean.withDefault(true))
  const [symbols, setSymbols] = useQueryState('symbols', parseAsBoolean.withDefault(true))
  const [bulkCount, setBulkCount] = useState(10)

  const options: PasswordOptions = {
    length,
    uppercase,
    lowercase,
    numbers,
    symbols,
  }

  const strength = calculateStrength(password)

  const handleGenerate = () => {
    try {
      const newPassword = generatePassword(options)
      setPassword(newPassword)
      trackToolEvent('password_generate', {
        length: options.length,
        has_uppercase: options.uppercase,
        has_lowercase: options.lowercase,
        has_numbers: options.numbers,
        has_symbols: options.symbols,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate password')
    }
  }

  const handleBulkGenerate = () => {
    try {
      const passwords: string[] = []
      for (let i = 0; i < bulkCount; i++) {
        passwords.push(generatePassword(options))
      }
      setBulkPasswords(passwords)
      trackToolEvent('password_bulk_generate', { count: bulkCount })
      toast.success(`Generated ${bulkCount} passwords 🔐`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate passwords')
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      trackToolEvent('password_copy', { success: true })
      toast.success('Copied to clipboard! 📋')
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownloadBulk = () => {
    try {
      const blob = new Blob([bulkPasswords.join('\n')], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `passwords-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      trackToolEvent('password_download', { count: bulkPasswords.length })
      toast.success('Downloaded passwords file 💾')
    } catch {
      toast.error('Failed to download passwords')
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

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        spaceY: '8',
        px: '4',
        py: '8',
        md: { px: '6' },
        lg: { px: '8' },
      })}
    >
      {/* Header */}
      <div className={css({ spaceY: '4', textAlign: 'center' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
          })}
        >
          <div
            className={css({
              display: 'flex',
              h: '16',
              w: '16',
              alignItems: 'center',
              justifyContent: 'center',
              rounded: 'full',
              bgGradient: 'to-br',
              gradientFrom: 'red.500',
              gradientTo: 'pink.500',
              shadow: 'lg',
              boxShadow: '0 10px 15px rgba(239, 68, 68, 0.3)',
            })}
          >
            <Key className={css({ h: '8', w: '8', color: 'white' })} />
          </div>
          <h1
            className={css({ fontSize: '4xl', fontWeight: 'extrabold', md: { fontSize: '5xl' } })}
          >
            Password Generator
          </h1>
        </div>
        <p className={css({ fontSize: 'lg', color: 'gray.400', mx: 'auto', maxW: '2xl' })}>
          Generate cryptographically secure passwords with customizable length and character sets.
          Includes password strength meter and bulk generation.
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gap: '8',
          lg: { gridTemplateColumns: '2', gridTemplateRows: 'auto' },
        })}
      >
        {/* Password Generator */}
        <Card className="glass" style={{ padding: '24px' }}>
          <div className={css({ spaceY: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Shield className={css({ h: '5', w: '5', color: 'red.400' })} />
              <h2 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Generate Password</h2>
            </div>

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
                    bg: 'rgba(17, 24, 39, 0.5)',
                    p: '4',
                  })}
                >
                  <div
                    className={css({
                      fontFamily: 'mono',
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      color: 'white',
                      overflowWrap: 'break-word',
                    })}
                  >
                    {password}
                  </div>
                  <Button
                    onClick={() => handleCopy(password)}
                    variant="ghost"
                    size="sm"
                    className={css({
                      position: 'absolute',
                      top: '2',
                      right: '2',
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>

                {/* Strength Meter */}
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.400' })}
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
                    className={css({ h: '2', overflow: 'hidden', rounded: 'full', bg: 'gray.800' })}
                  >
                    <div
                      className={css({ h: 'full', rounded: 'full', transition: 'all 0.3s' })}
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  {strength.feedback.length > 0 && (
                    <ul
                      className={css({ spaceY: '1', pl: '4', fontSize: 'sm', color: 'gray.400' })}
                    >
                      {strength.feedback.map((tip) => (
                        <li key={tip}>• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Password Length */}
            <Field>
              <FieldLabel>Password Length: {options.length}</FieldLabel>
              <input
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
                  _focusVisible: { outline: 'none', ring: '2px', ringColor: 'red.500' },
                })}
              />
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'xs',
                  color: 'gray.500',
                })}
              >
                <span>8</span>
                <span>64</span>
              </div>
            </Field>

            {/* Character Sets */}
            <div className={css({ spaceY: '3' })}>
              <FieldLabel>Character Types</FieldLabel>
              <div className={css({ display: 'grid', gap: '3', sm: { gridTemplateColumns: '2' } })}>
                {[
                  { key: 'uppercase' as const, label: 'Uppercase (A-Z)', example: 'ABC' },
                  { key: 'lowercase' as const, label: 'Lowercase (a-z)', example: 'abc' },
                  { key: 'numbers' as const, label: 'Numbers (0-9)', example: '123' },
                  { key: 'symbols' as const, label: 'Symbols (!@#)', example: '!@#' },
                ].map(({ key, label, example }) => (
                  <label
                    key={key}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: options[key] ? 'red.500/50' : 'gray.700',
                      bg: options[key] ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 24, 39, 0.3)',
                      p: '3',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'red.500/70', bg: 'rgba(239, 68, 68, 0.15)' },
                    })}
                  >
                    <input
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
                      <div className={css({ fontSize: 'sm', fontWeight: 'medium' })}>{label}</div>
                      <div
                        className={css({ fontFamily: 'mono', fontSize: 'xs', color: 'gray.500' })}
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

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!atLeastOneSelected}
              className={css({ w: 'full', h: '12', fontSize: 'lg', fontWeight: 'bold' })}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #ec4899)',
              }}
            >
              <RefreshCw className={css({ h: '5', w: '5' })} />
              Generate Password
            </Button>
          </div>
        </Card>

        {/* Bulk Generation */}
        <Card className="glass" style={{ padding: '24px' }}>
          <div className={css({ spaceY: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Zap className={css({ h: '5', w: '5', color: 'yellow.400' })} />
              <h2 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Bulk Generation</h2>
            </div>

            <Field>
              <FieldLabel>Number of Passwords</FieldLabel>
              <FieldInput
                type="number"
                min="1"
                max="100"
                value={bulkCount}
                onChange={(e) =>
                  setBulkCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))
                }
                className={css({ h: '12' })}
              />
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                Generate up to 100 passwords at once
              </p>
            </Field>

            <div className={css({ display: 'flex', gap: '3' })}>
              <Button
                onClick={handleBulkGenerate}
                disabled={!atLeastOneSelected}
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
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.400' })}>
                    Generated {bulkPasswords.length} passwords
                  </p>
                  <Button
                    onClick={() => setBulkPasswords([])}
                    variant="ghost"
                    size="sm"
                    className={css({ fontSize: 'xs' })}
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
                    bg: 'rgba(17, 24, 39, 0.3)',
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
                          bg: 'rgba(17, 24, 39, 0.5)',
                          p: '2',
                          _hover: { bg: 'rgba(17, 24, 39, 0.7)' },
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
                        <Button onClick={() => handleCopy(pwd)} variant="ghost" size="sm">
                          <Copy className={css({ h: '3', w: '3' })} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Security Notice */}
      <Card
        className={css({
          border: '1px solid rgba(59, 130, 246, 0.2)',
          bg: 'rgba(59, 130, 246, 0.05)',
        })}
        style={{ padding: '20px' }}
      >
        <div className={css({ display: 'flex', gap: '4', alignItems: 'start' })}>
          <Shield className={css({ h: '6', w: '6', color: 'blue.400', flexShrink: '0' })} />
          <div className={css({ spaceY: '2' })}>
            <h3 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'blue.400' })}>
              Security Notice
            </h3>
            <ul className={css({ spaceY: '1', fontSize: 'sm', color: 'gray.400' })}>
              <li>
                • Passwords are generated using cryptographically secure random numbers
                (crypto.getRandomValues)
              </li>
              <li>
                • All generation happens locally in your browser - no data is sent to any server
              </li>
              <li>
                • For maximum security, use passwords with at least 16 characters and all character
                types
              </li>
              <li>• Never reuse passwords across different accounts</li>
              <li>• Consider using a password manager to store generated passwords securely</li>
            </ul>
          </div>
        </div>
      </Card>
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
