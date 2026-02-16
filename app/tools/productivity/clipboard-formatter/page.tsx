'use client'

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
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
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
  }, [inputText, formatText, settings.autoFormat])

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
        <div>
          <Clipboard
            className={css({
              width: '16',
              height: '16',
              color: 'green.400',
              mx: 'auto',
            })}
          />
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
          Clipboard Formatter
        </h1>

        <p
          className={css({
            fontSize: { base: 'lg', md: 'xl' },
            color: 'white',
            textAlign: 'center',
            maxWidth: '3xl',
            mx: 'auto',
          })}
        >
          Paste and format text instantly. Remove extra whitespace, normalize line breaks, and apply
          transformations.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: '1fr 2fr', lg: '1fr 1fr 1fr' },
          gap: '6',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        {/* Input Section */}
        <div
          className={css({
            gridColumn: { base: '1 / -1', md: '1 / 2', lg: '1 / 3' },
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
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '4',
                  flexWrap: 'wrap',
                })}
              >
                <div className={css({ flex: '1', minWidth: '0' })}>
                  <CardTitle className={css({ color: 'gray.100' })}>Input Text</CardTitle>
                  <CardDescription className={css({ color: 'white', mt: '1.5' })}>
                    Paste or type text to format. Auto-format is{' '}
                    {settings.autoFormat ? 'enabled' : 'disabled'}.
                  </CardDescription>
                </div>
                <div
                  className={css({
                    display: 'flex',
                    gap: '2',
                    flexShrink: '0',
                    flexWrap: 'wrap',
                  })}
                >
                  <Button onClick={handlePaste} variant="secondary" size="sm">
                    <Clipboard
                      className={css({
                        w: '4',
                        h: '4',
                        mr: '2',
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
                        w: '4',
                        h: '4',
                      })}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here..."
                className={css({
                  minH: '400px',
                  fontFamily: 'mono',
                  fontSize: 'sm',
                })}
              />

              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: '4',
                  fontSize: 'sm',
                  color: 'white',
                  flexWrap: 'wrap',
                  gap: '2',
                })}
              >
                <span>
                  {stats.inputChars} chars, {stats.inputWords} words, {stats.inputLines} lines
                </span>
                {pasteDetected && (
                  <span className={css({ color: 'green.400', animation: 'fadeIn 0.3s ease-out' })}>
                    <Check
                      className={css({
                        w: '4',
                        h: '4',
                        display: 'inline',
                        mr: '1',
                      })}
                    />
                    Pasted!
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings Panel */}
          {showSettings && (
            <div className={css({ animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 })}>
              <Card
                className={css({
                  mt: '4',
                  border: '1px solid',
                  borderColor: 'gray.700/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle className={css({ color: 'gray.100' })}>Format Settings</CardTitle>
                  <CardDescription className={css({ color: 'white' })}>
                    Customize how text is formatted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                      gap: '4',
                    })}
                  >
                    <label
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        cursor: 'pointer',
                        color: 'white',
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
                        color: 'white',
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
                        color: 'white',
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
                        color: 'white',
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
                          mb: '2',
                          fontSize: 'sm',
                          color: 'white',
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
                          p: '2',
                          rounded: 'md',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800',
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
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div>
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
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <CardTitle className={css({ color: 'gray.100' })}>History</CardTitle>
                {history.length > 0 && (
                  <Button onClick={clearHistory} variant="secondary" size="sm">
                    Clear
                  </Button>
                )}
              </div>
              <CardDescription className={css({ color: 'white' })}>
                Last 5 clipboard items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p
                  className={css({
                    textAlign: 'center',
                    color: 'white',
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
                        p: '3',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'green.500',
                          bg: 'gray.700',
                        },
                      })}
                    >
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: 'white',
                          mb: '1',
                        })}
                      >
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                      <p
                        className={css({
                          fontSize: 'sm',
                          color: 'gray.200',
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
      <div
        className={css({
          gridColumn: { base: '1 / -1', md: '2 / 3', lg: '3 / 4' },
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
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '4',
              })}
            >
              <div className={css({ flex: '1', minWidth: '0' })}>
                <CardTitle className={css({ color: 'gray.100' })}>Formatted Output</CardTitle>
                <CardDescription className={css({ color: 'white', mt: '1.5' })}>
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
                      w: '4',
                      h: '4',
                      mr: '1',
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
                      w: '4',
                      h: '4',
                      mr: '1',
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
                      w: '4',
                      h: '4',
                      mr: '1',
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
                      w: '4',
                      h: '4',
                      mr: '1',
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
                minH: '400px',
                fontFamily: 'mono',
                fontSize: 'sm',
                bg: 'gray.900',
              })}
            />

            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                mt: '4',
                fontSize: 'sm',
                color: 'white',
                flexWrap: 'wrap',
                gap: '2',
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
                mt: '6',
                flexWrap: 'wrap',
              })}
            >
              {!settings.autoFormat && (
                <Button onClick={handleFormat} disabled={!inputText}>
                  <Sparkles
                    className={css({
                      w: '4',
                      h: '4',
                      mr: '2',
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
                        w: '4',
                        h: '4',
                        mr: '2',
                      })}
                    />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy
                      className={css({
                        w: '4',
                        h: '4',
                        mr: '2',
                      })}
                    />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <Button onClick={downloadText} disabled={!outputText} variant="secondary">
                <Download
                  className={css({
                    w: '4',
                    h: '4',
                    mr: '2',
                  })}
                />
                Download
              </Button>

              <Button onClick={handleReset} variant="secondary">
                <RotateCcw
                  className={css({
                    w: '4',
                    h: '4',
                    mr: '2',
                  })}
                />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Tips */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.3s',
          opacity: 0,
        })}
      >
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'amber.500/20',
            bg: 'rgba(251, 191, 36, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'amber.300',
            })}
          >
            Pro Tips
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Click &quot;Paste from Clipboard&quot; or type directly into the input area
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Toggle auto-format off in settings to format manually when needed
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Use case transformation buttons for quick text conversions
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Access your last 5 clipboard items from the history sidebar
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              All settings are saved automatically in your browser
            </li>
          </ul>
        </div>
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function ClipboardFormatterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClipboardFormatterPageContent />
    </Suspense>
  )
}
