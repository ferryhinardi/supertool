'use client'

import { motion } from 'framer-motion'
import {
  CaseLower,
  CaseSensitive,
  CaseUpper,
  Check,
  Clipboard,
  Copy,
  Download,
  RotateCcw,
  Settings,
  Sparkles,
  Type,
} from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

export const dynamic = 'force-dynamic'

type CaseTransform = 'uppercase' | 'lowercase' | 'titlecase' | 'sentencecase'

interface FormatSettings {
  autoFormat: boolean
  tabSize: 2 | 4 | 8
  removeEmptyLines: boolean
  trimLines: boolean
  normalizeLineBreaks: boolean
}

interface HistoryItem {
  id: string
  timestamp: number
  original: string
  formatted: string
  preview: string
}

const defaultSettings: FormatSettings = {
  autoFormat: true,
  tabSize: 4,
  removeEmptyLines: false,
  trimLines: true,
  normalizeLineBreaks: true,
}

function ClipboardFormatterPageContent() {
  const [inputText, setInputText] = useQueryState('input', parseAsString.withDefault(''))
  const [outputText, setOutputText] = useState('')
  const [settings, setSettings] = useState<FormatSettings>(defaultSettings)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [pasteDetected, setPasteDetected] = useState(false)

  // Load settings and history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('clipboard-formatter-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      const savedHistory = localStorage.getItem('clipboard-formatter-history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clipboard-formatter-settings', JSON.stringify(settings))
    }
  }, [settings])

  // Format text based on settings
  const formatText = useCallback(
    (text: string): string => {
      let result = text

      // Normalize line breaks
      if (settings.normalizeLineBreaks) {
        result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      }

      // Convert tabs to spaces
      result = result.replace(/\t/g, ' '.repeat(settings.tabSize))

      // Trim lines
      if (settings.trimLines) {
        result = result
          .split('\n')
          .map((line) => line.trim())
          .join('\n')
      }

      // Remove empty lines
      if (settings.removeEmptyLines) {
        result = result
          .split('\n')
          .filter((line) => line.length > 0)
          .join('\n')
      }

      return result
    },
    [settings]
  )

  // Apply case transformation
  const applyCaseTransform = (text: string, transform: CaseTransform): string => {
    switch (transform) {
      case 'uppercase':
        return text.toUpperCase()
      case 'lowercase':
        return text.toLowerCase()
      case 'titlecase':
        return text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
        )
      case 'sentencecase':
        return text.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()).toLowerCase()
      default:
        return text
    }
  }

  // Auto-format when input changes
  useEffect(() => {
    if (settings.autoFormat && inputText) {
      const formatted = formatText(inputText)
      setOutputText(formatted)
    } else {
      setOutputText(inputText)
    }
  }, [inputText, settings, formatText])

  // Handle paste event
  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported')
      }

      const text = await navigator.clipboard.readText()
      setInputText(text)
      setPasteDetected(true)

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        original: text,
        formatted: formatText(text),
        preview: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
      }

      const newHistory = [historyItem, ...history.slice(0, 4)]
      setHistory(newHistory)
      localStorage.setItem('clipboard-formatter-history', JSON.stringify(newHistory))

      trackToolEvent('clipboard_paste', {
        text_length: text.length,
        auto_format: settings.autoFormat,
      })

      setTimeout(() => setPasteDetected(false), 2000)
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  // Handle manual format
  const handleFormat = () => {
    const formatted = formatText(inputText)
    setOutputText(formatted)

    trackToolEvent('clipboard_format', {
      operations: Object.entries(settings)
        .filter(([_key, value]) => value === true)
        .map(([key]) => key),
    })
  }

  // Handle case transformation
  const handleCaseTransform = (transform: CaseTransform) => {
    const transformed = applyCaseTransform(outputText || inputText, transform)
    setOutputText(transformed)

    trackToolEvent('clipboard_case_transform', { transform })
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      trackToolEvent('clipboard_copy_formatted', {
        text_length: outputText.length,
      })
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Download as file
  const downloadText = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-text-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackToolEvent('clipboard_download', { size: outputText.length })
  }

  // Reset
  const handleReset = () => {
    setInputText('')
    setOutputText('')
    trackToolEvent('clipboard_reset')
  }

  // Load from history
  const loadFromHistory = (item: HistoryItem) => {
    setInputText(item.original)
    setOutputText(item.formatted)
    trackToolEvent('clipboard_load_history')
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('clipboard-formatter-history')
    trackToolEvent('clipboard_clear_history')
  }

  // Stats
  const stats = useMemo(() => {
    const input = inputText || ''
    const output = outputText || ''

    return {
      inputChars: input.length,
      inputWords: input.trim() ? input.trim().split(/\s+/).length : 0,
      inputLines: input ? input.split('\n').length : 0,
      outputChars: output.length,
      outputWords: output.trim() ? output.trim().split(/\s+/).length : 0,
      outputLines: output ? output.split('\n').length : 0,
      charsRemoved: input.length - output.length,
    }
  }, [inputText, outputText])

  return (
    <div
      className={css({
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
        padding: { base: '4', md: '8' },
      })}
    >
      <div
        className={css({
          maxWidth: '7xl',
          margin: '0 auto',
        })}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4',
              marginBottom: '8',
            })}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <Clipboard
                className={css({
                  width: '16',
                  height: '16',
                  color: 'green.400',
                })}
              />
            </motion.div>

            <h1
              className={css({
                fontSize: { base: '3xl', md: '5xl' },
                fontWeight: 'bold',
                textAlign: 'center',
                background: 'linear-gradient(to right, #10b981, #14b8a6)',
                backgroundClip: 'text',
                color: 'transparent',
              })}
            >
              Clipboard Formatter
            </h1>

            <p
              className={css({
                fontSize: { base: 'lg', md: 'xl' },
                color: 'gray.400',
                textAlign: 'center',
                maxWidth: '2xl',
              })}
            >
              Paste and format text instantly. Remove extra whitespace, normalize line breaks, and
              apply transformations.
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1', lg: 'repeat(3, 1fr)' },
            gap: '6',
            marginBottom: '8',
          })}
        >
          {/* Input Section */}
          <div
            className={css({
              gridColumn: { base: 'span 1', lg: 'span 2' },
            })}
          >
            <Card>
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <CardTitle>Input Text</CardTitle>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                    })}
                  >
                    <Button onClick={handlePaste} variant="secondary" size="sm">
                      <Clipboard
                        className={css({
                          width: '4',
                          height: '4',
                          marginRight: '2',
                        })}
                      />
                      Paste from Clipboard
                    </Button>
                    <Button
                      onClick={() => setShowSettings(!showSettings)}
                      variant="secondary"
                      size="sm"
                    >
                      <Settings
                        className={css({
                          width: '4',
                          height: '4',
                        })}
                      />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Paste or type text to format. Auto-format is{' '}
                  {settings.autoFormat ? 'enabled' : 'disabled'}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type your text here..."
                  className={css({
                    minHeight: '400px',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                  })}
                />

                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4',
                    fontSize: 'sm',
                    color: 'gray.500',
                  })}
                >
                  <span>
                    {stats.inputChars} chars, {stats.inputWords} words, {stats.inputLines} lines
                  </span>
                  {pasteDetected && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={css({ color: 'green.400' })}
                    >
                      <Check
                        className={css({
                          width: '4',
                          height: '4',
                          display: 'inline',
                          marginRight: '1',
                        })}
                      />
                      Pasted!
                    </motion.span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card
                  className={css({
                    marginTop: '4',
                  })}
                >
                  <CardHeader>
                    <CardTitle>Format Settings</CardTitle>
                    <CardDescription>Customize how text is formatted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: { base: '1', md: '2' },
                        gap: '4',
                      })}
                    >
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
                          checked={settings.autoFormat}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              autoFormat: e.target.checked,
                            })
                          }
                        />
                        <span>Auto-format on input</span>
                      </label>

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
                          checked={settings.trimLines}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              trimLines: e.target.checked,
                            })
                          }
                        />
                        <span>Trim lines</span>
                      </label>

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
                          checked={settings.removeEmptyLines}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              removeEmptyLines: e.target.checked,
                            })
                          }
                        />
                        <span>Remove empty lines</span>
                      </label>

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
                          checked={settings.normalizeLineBreaks}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              normalizeLineBreaks: e.target.checked,
                            })
                          }
                        />
                        <span>Normalize line breaks</span>
                      </label>

                      <div>
                        <label
                          htmlFor="tab-size-select"
                          className={css({
                            display: 'block',
                            marginBottom: '2',
                            fontSize: 'sm',
                          })}
                        >
                          Tab size (spaces)
                        </label>
                        <select
                          id="tab-size-select"
                          value={settings.tabSize}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              tabSize: Number.parseInt(e.target.value, 10) as 2 | 4 | 8,
                            })
                          }
                          className={css({
                            padding: '2',
                            borderRadius: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            background: 'gray.800',
                            color: 'white',
                          })}
                        >
                          <option value="2">2 spaces</option>
                          <option value="4">4 spaces</option>
                          <option value="8">8 spaces</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <CardTitle>History</CardTitle>
                  {history.length > 0 && (
                    <Button onClick={clearHistory} variant="secondary" size="sm">
                      Clear
                    </Button>
                  )}
                </div>
                <CardDescription>Last 5 clipboard items</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p
                    className={css({
                      textAlign: 'center',
                      color: 'gray.500',
                      fontSize: 'sm',
                    })}
                  >
                    No history yet. Paste some text to get started.
                  </p>
                ) : (
                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2',
                    })}
                  >
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        type="button"
                        className={css({
                          padding: '3',
                          borderRadius: 'md',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          background: 'gray.800',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          _hover: {
                            borderColor: 'green.500',
                            background: 'gray.700',
                          },
                        })}
                      >
                        <p
                          className={css({
                            fontSize: 'xs',
                            color: 'gray.400',
                            marginBottom: '1',
                          })}
                        >
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                        <p
                          className={css({
                            fontSize: 'sm',
                            color: 'white',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          })}
                        >
                          {item.preview}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '4',
              })}
            >
              <div>
                <CardTitle>Formatted Output</CardTitle>
                <CardDescription>
                  {stats.charsRemoved > 0
                    ? `Removed ${stats.charsRemoved} characters`
                    : 'Apply transformations or let auto-format do its magic'}
                </CardDescription>
              </div>

              <div
                className={css({
                  display: 'flex',
                  gap: '2',
                  flexWrap: 'wrap',
                })}
              >
                <Button
                  onClick={() => handleCaseTransform('uppercase')}
                  variant="secondary"
                  size="sm"
                >
                  <CaseUpper
                    className={css({
                      width: '4',
                      height: '4',
                      marginRight: '1',
                    })}
                  />
                  UPPER
                </Button>
                <Button
                  onClick={() => handleCaseTransform('lowercase')}
                  variant="secondary"
                  size="sm"
                >
                  <CaseLower
                    className={css({
                      width: '4',
                      height: '4',
                      marginRight: '1',
                    })}
                  />
                  lower
                </Button>
                <Button
                  onClick={() => handleCaseTransform('titlecase')}
                  variant="secondary"
                  size="sm"
                >
                  <CaseSensitive
                    className={css({
                      width: '4',
                      height: '4',
                      marginRight: '1',
                    })}
                  />
                  Title
                </Button>
                <Button
                  onClick={() => handleCaseTransform('sentencecase')}
                  variant="secondary"
                  size="sm"
                >
                  <Type
                    className={css({
                      width: '4',
                      height: '4',
                      marginRight: '1',
                    })}
                  />
                  Sentence
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              placeholder="Formatted text will appear here..."
              className={css({
                minHeight: '400px',
                fontFamily: 'mono',
                fontSize: 'sm',
                background: 'gray.900',
              })}
            />

            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4',
                fontSize: 'sm',
                color: 'gray.500',
              })}
            >
              <span>
                {stats.outputChars} chars, {stats.outputWords} words, {stats.outputLines} lines
              </span>
            </div>

            <div
              className={css({
                display: 'flex',
                gap: '3',
                marginTop: '6',
                flexWrap: 'wrap',
              })}
            >
              {!settings.autoFormat && (
                <Button onClick={handleFormat} disabled={!inputText}>
                  <Sparkles
                    className={css({
                      width: '4',
                      height: '4',
                      marginRight: '2',
                    })}
                  />
                  Format Text
                </Button>
              )}

              <Button onClick={copyToClipboard} disabled={!outputText} variant="secondary">
                {copied ? (
                  <>
                    <Check
                      className={css({
                        width: '4',
                        height: '4',
                        marginRight: '2',
                      })}
                    />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy
                      className={css({
                        width: '4',
                        height: '4',
                        marginRight: '2',
                      })}
                    />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <Button onClick={downloadText} disabled={!outputText} variant="secondary">
                <Download
                  className={css({
                    width: '4',
                    height: '4',
                    marginRight: '2',
                  })}
                />
                Download
              </Button>

              <Button onClick={handleReset} variant="secondary">
                <RotateCcw
                  className={css({
                    width: '4',
                    height: '4',
                    marginRight: '2',
                  })}
                />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card
          className={css({
            marginTop: '8',
          })}
        >
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1', md: '2' },
                gap: '4',
              })}
            >
              <div>
                <h3
                  className={css({
                    fontWeight: 'semibold',
                    marginBottom: '2',
                    color: 'green.400',
                  })}
                >
                  Quick Start
                </h3>
                <ul
                  className={css({
                    listStyle: 'disc',
                    paddingLeft: '5',
                    color: 'gray.400',
                    fontSize: 'sm',
                    '& li': {
                      marginBottom: '2',
                    },
                  })}
                >
                  <li>
                    Click &quot;Paste from Clipboard&quot; or type directly into the input area
                  </li>
                  <li>Text is automatically formatted based on your settings</li>
                  <li>Toggle auto-format off to format manually</li>
                  <li>Use case transformation buttons for quick changes</li>
                  <li>Access your last 5 clipboard items from the history sidebar</li>
                </ul>
              </div>

              <div>
                <h3
                  className={css({
                    fontWeight: 'semibold',
                    marginBottom: '2',
                    color: 'green.400',
                  })}
                >
                  Format Options
                </h3>
                <ul
                  className={css({
                    listStyle: 'disc',
                    paddingLeft: '5',
                    color: 'gray.400',
                    fontSize: 'sm',
                    '& li': {
                      marginBottom: '2',
                    },
                  })}
                >
                  <li>
                    <strong>Trim Lines:</strong> Remove leading and trailing whitespace from each
                    line
                  </li>
                  <li>
                    <strong>Remove Empty Lines:</strong> Filter out blank lines
                  </li>
                  <li>
                    <strong>Normalize Line Breaks:</strong> Convert all line endings to Unix format
                    (\n)
                  </li>
                  <li>
                    <strong>Tab Size:</strong> Convert tabs to 2, 4, or 8 spaces
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ClipboardFormatterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClipboardFormatterPageContent />
    </Suspense>
  )
}
