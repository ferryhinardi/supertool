'use client'

import { motion } from 'framer-motion'
import * as yaml from 'js-yaml'
import { ArrowLeftRight, Check, Copy, Download, FileJson, Info, Sparkles } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

type ConversionDirection = 'yaml-to-json' | 'json-to-yaml'

function YamlJsonConverterContent() {
  const [direction, setDirection] = useState<ConversionDirection>('yaml-to-json')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('yaml_json_converter_open', {})
  }, [])

  // Perform conversion
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText('')
      setError(null)
      return
    }

    try {
      let result: string
      if (direction === 'yaml-to-json') {
        // Parse YAML to object
        const parsed = yaml.load(inputText)
        // Convert to JSON with pretty formatting
        result = JSON.stringify(parsed, null, 2)
      } else {
        // Parse JSON to object
        const parsed = JSON.parse(inputText)
        // Convert to YAML
        result = yaml.dump(parsed, {
          indent: 2,
          lineWidth: -1, // Don't wrap lines
          noRefs: true, // Don't use anchors/aliases
        })
      }
      setOutputText(result)
      setError(null)

      trackToolEvent('yaml_json_converter_convert', {
        direction,
        input_length: inputText.length,
        success: true,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid input format'
      setError(errorMessage)
      setOutputText('')

      trackToolEvent('yaml_json_converter_convert', {
        direction,
        input_length: inputText.length,
        success: false,
        error: errorMessage,
      })
    }
  }, [inputText, direction])

  const handleSwapDirection = () => {
    const newDirection: ConversionDirection =
      direction === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json'
    setDirection(newDirection)

    // Swap input and output if output exists
    if (outputText) {
      setInputText(outputText)
      setOutputText('')
    }

    trackToolEvent('yaml_json_converter_swap', { new_direction: newDirection })
  }

  const handleCopyToClipboard = async () => {
    if (!outputText) return

    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)

      trackToolEvent('yaml_json_converter_copy', { direction })
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    if (!outputText) return

    const extension = direction === 'yaml-to-json' ? 'json' : 'yaml'
    const mimeType = direction === 'yaml-to-json' ? 'application/json' : 'text/yaml'
    const blob = new Blob([outputText], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Downloaded as ${extension.toUpperCase()}!`)
    trackToolEvent('yaml_json_converter_download', { direction, format: extension })
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setError(null)
    trackToolEvent('yaml_json_converter_clear', {})
  }

  const handleLoadExample = () => {
    const exampleYaml = `# Example YAML Configuration
name: SuperTool
version: 1.0.0
description: A collection of useful developer tools

features:
  - JSON Formatter
  - YAML Converter
  - QR Code Generator
  - Password Generator

settings:
  theme: dark
  language: en
  notifications:
    email: true
    push: false
  
developers:
  - name: John Doe
    role: Frontend Developer
    skills:
      - React
      - TypeScript
      - CSS
  - name: Jane Smith
    role: Backend Developer
    skills:
      - Node.js
      - PostgreSQL
      - Docker`

    const exampleJson = `{
  "name": "SuperTool",
  "version": "1.0.0",
  "description": "A collection of useful developer tools",
  "features": [
    "JSON Formatter",
    "YAML Converter",
    "QR Code Generator",
    "Password Generator"
  ],
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "developers": [
    {
      "name": "John Doe",
      "role": "Frontend Developer",
      "skills": ["React", "TypeScript", "CSS"]
    },
    {
      "name": "Jane Smith",
      "role": "Backend Developer",
      "skills": ["Node.js", "PostgreSQL", "Docker"]
    }
  ]
}`

    setInputText(direction === 'yaml-to-json' ? exampleYaml : exampleJson)
    trackToolEvent('yaml_json_converter_load_example', { direction })
  }

  const inputLabel = direction === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'
  const outputLabel = direction === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'
  const inputPlaceholder =
    direction === 'yaml-to-json' ? 'Paste your YAML here...' : 'Paste your JSON here...'

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
            borderColor: 'green.500/30',
            bg: 'green.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <FileJson className={css({ h: '5', w: '5', color: 'green.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.300' })}>
            Bidirectional Conversion • Syntax Validation
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'green.400',
            gradientVia: 'emerald.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          YAML ↔ JSON Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Convert between YAML and JSON formats instantly with syntax validation and formatting.
          Perfect for configuration files, API responses, and data transformation.
        </p>
      </motion.div>

      {/* Conversion Direction Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <CardTitle>Conversion Direction</CardTitle>
            <CardDescription>Choose how you want to convert your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                gap: '3',
                alignItems: 'center',
              })}
            >
              <Button
                onClick={() => setDirection('yaml-to-json')}
                className={css({
                  flex: '1',
                  h: 'auto',
                  py: '4',
                  px: '6',
                  gap: '2',
                  bg: direction === 'yaml-to-json' ? 'green.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: direction === 'yaml-to-json' ? 'green.500/50' : 'gray.700/50',
                  color: direction === 'yaml-to-json' ? 'green.300' : 'gray.400',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: direction === 'yaml-to-json' ? 'green.500/30' : 'gray.800',
                    borderColor: direction === 'yaml-to-json' ? 'green.500/70' : 'gray.600',
                  },
                })}
              >
                <span className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>YAML → JSON</span>
              </Button>

              <Button
                onClick={handleSwapDirection}
                className={css({
                  gap: '2',
                  rounded: 'full',
                  bg: 'green.500/20',
                  border: '1px solid',
                  borderColor: 'green.500/50',
                  color: 'green.300',
                  _hover: {
                    bg: 'green.500/30',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s',
                  },
                })}
              >
                <ArrowLeftRight className={css({ h: '5', w: '5' })} />
              </Button>

              <Button
                onClick={() => setDirection('json-to-yaml')}
                className={css({
                  flex: '1',
                  h: 'auto',
                  py: '4',
                  px: '6',
                  gap: '2',
                  bg: direction === 'json-to-yaml' ? 'green.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: direction === 'json-to-yaml' ? 'green.500/50' : 'gray.700/50',
                  color: direction === 'json-to-yaml' ? 'green.300' : 'gray.400',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: direction === 'json-to-yaml' ? 'green.500/30' : 'gray.800',
                    borderColor: direction === 'json-to-yaml' ? 'green.500/70' : 'gray.600',
                  },
                })}
              >
                <span className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>JSON → YAML</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
            gap: '4',
          })}
        >
          {/* Input */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
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
                })}
              >
                <CardTitle>{inputLabel}</CardTitle>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={handleLoadExample}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'green.400' },
                    })}
                  >
                    Load Example
                  </Button>
                  <Button
                    onClick={handleClear}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'red.400' },
                    })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={inputPlaceholder}
                className={css({
                  w: 'full',
                  minH: '96',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: error ? 'red.500/50' : 'gray.700',
                  bg: 'gray.800/50',
                  p: '4',
                  fontSize: 'sm',
                  fontFamily: 'mono',
                  color: 'gray.200',
                  resize: 'vertical',
                  _focus: {
                    outline: 'none',
                    borderColor: error ? 'red.500' : 'green.500',
                    ring: '2px',
                    ringColor: error ? 'red.500/20' : 'green.500/20',
                  },
                  _placeholder: { color: 'gray.500' },
                })}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={css({
                    mt: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'red.500/30',
                    bg: 'red.500/10',
                    p: '3',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                    <Info className={css({ h: '4', w: '4', color: 'red.400', flexShrink: '0' })} />
                    <div>
                      <p
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'red.300' })}
                      >
                        Validation Error
                      </p>
                      <p className={css({ fontSize: 'xs', color: 'red.400', mt: '1' })}>{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Output */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
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
                })}
              >
                <CardTitle>{outputLabel}</CardTitle>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={handleCopyToClipboard}
                    disabled={!outputText}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'green.400' },
                      _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                    })}
                  >
                    {copied ? (
                      <Check className={css({ h: '4', w: '4' })} />
                    ) : (
                      <Copy className={css({ h: '4', w: '4' })} />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={!outputText}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'green.400' },
                      _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                    })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={outputText}
                readOnly
                placeholder="Converted output will appear here..."
                className={css({
                  w: 'full',
                  minH: '96',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'green.500/30',
                  bg: 'green.500/5',
                  p: '4',
                  fontSize: 'sm',
                  fontFamily: 'mono',
                  color: 'green.200',
                  resize: 'vertical',
                  cursor: outputText ? 'text' : 'default',
                  _placeholder: { color: 'gray.500' },
                })}
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'emerald.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles
                className={css({ h: '6', w: '6', color: 'emerald.400', flexShrink: '0' })}
              />
              <div className={css({ spaceY: '2' })}>
                <h3
                  className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'emerald.300' })}
                >
                  Features & Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Real-time conversion as you type</li>
                  <li>• Automatic syntax validation with detailed error messages</li>
                  <li>• Pretty formatting with proper indentation</li>
                  <li>• Copy to clipboard or download converted files</li>
                  <li>• Supports complex nested structures and arrays</li>
                  <li>• All processing happens in your browser - your data stays private</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

export default function YamlJsonConverterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YamlJsonConverterContent />
    </Suspense>
  )
}
