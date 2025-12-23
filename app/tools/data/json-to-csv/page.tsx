'use client'

import { AlertCircle, Copy, Download, FileSpreadsheet, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Dynamically import CodeMirror to reduce initial bundle size (~200KB)
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

export default function JSONToCSVPage() {
  const [jsonInput, setJsonInput] = useState(
    '[\n  {\n    "name": "John Doe",\n    "age": 30,\n    "email": "john@example.com"\n  },\n  {\n    "name": "Jane Smith",\n    "age": 25,\n    "email": "jane@example.com"\n  }\n]'
  )
  const [delimiter, setDelimiter] = useState(',')
  const [flattenNested, setFlattenNested] = useState(true)

  // Dynamically load json extension
  // biome-ignore lint/suspicious/noExplicitAny: CodeMirror extension is dynamically loaded and has complex types
  const [jsonExtension, setJsonExtension] = useState<any>(null)

  useEffect(() => {
    const loadExtension = async () => {
      const { json } = await import('@codemirror/lang-json')
      setJsonExtension(json())
    }
    loadExtension()
  }, [])

  // Calculate stats and preview
  const { stats, csvOutput, isValid, error } = useMemo(() => {
    // Flatten nested objects
    const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
      const flattened: Record<string, unknown> = {}

      Object.keys(obj).forEach((key) => {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey))
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value)
        } else {
          flattened[newKey] = value
        }
      })

      return flattened
    }

    // Escape CSV field
    const escapeCSVField = (field: unknown): string => {
      if (field === null || field === undefined) return ''
      const str = String(field)
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Convert JSON to CSV
    const convertToCSVInner = (data: Record<string, unknown>[]): string => {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Input must be a non-empty array of objects')
      }

      // Process data
      const processedData = flattenNested ? data.map((item) => flattenObject(item)) : data

      // Get all unique headers
      const headers = Array.from(new Set(processedData.flatMap((obj) => Object.keys(obj)))).sort()

      // Create CSV header row
      const headerRow = headers.map((h) => escapeCSVField(h)).join(delimiter)

      // Create CSV data rows
      const dataRows = processedData.map((obj) => {
        return headers.map((header) => escapeCSVField(obj[header])).join(delimiter)
      })

      return [headerRow, ...dataRows].join('\n')
    }

    try {
      const parsed = JSON.parse(jsonInput)

      if (!Array.isArray(parsed)) {
        return {
          stats: null,
          csvOutput: '',
          isValid: false,
          error: 'Input must be an array of objects',
        }
      }

      if (parsed.length === 0) {
        return {
          stats: null,
          csvOutput: '',
          isValid: false,
          error: 'Array cannot be empty',
        }
      }

      const csv = convertToCSVInner(parsed as Record<string, unknown>[])
      const lines = csv.split('\n')
      const columns = lines[0].split(delimiter).length

      return {
        stats: {
          rows: parsed.length,
          columns,
          totalLines: lines.length,
          chars: csv.length,
        },
        csvOutput: csv,
        isValid: true,
        error: null,
      }
    } catch (err) {
      return {
        stats: null,
        csvOutput: '',
        isValid: false,
        error: err instanceof Error ? err.message : 'Invalid JSON format',
      }
    }
  }, [jsonInput, delimiter, flattenNested])

  const handleCopy = async () => {
    if (!isValid || !csvOutput) {
      toast.error('No valid CSV to copy')
      return
    }

    await navigator.clipboard.writeText(csvOutput)
    toast.success('CSV copied to clipboard 📋')
    trackToolEvent('json_copy', {
      output_length: csvOutput.length,
    })
  }

  const handleDownload = () => {
    if (!isValid || !csvOutput) {
      toast.error('No valid CSV to download')
      return
    }

    const blob = new Blob([csvOutput], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('CSV file downloaded 📥')
    trackToolEvent('json_download', {
      file_size_kb: Math.round(blob.size / 1024),
    })
  }

  const handleReset = () => {
    setJsonInput(
      '[\n  {\n    "name": "John Doe",\n    "age": 30,\n    "email": "john@example.com"\n  },\n  {\n    "name": "Jane Smith",\n    "age": 25,\n    "email": "jane@example.com"\n  }\n]'
    )
    setDelimiter(',')
    setFlattenNested(true)
    toast.success('Reset to default example')
  }

  return (
    <TooltipProvider>
      <main
        className={css({
          mx: 'auto',
          maxW: '1400px',
          w: 'full',
          px: { base: '4', sm: '6', md: '8' },
          py: { base: '6', sm: '8', md: '10' },
          spaceY: { base: '4', sm: '6', md: '8' },
        })}
      >
        {/* Header */}
        <div className={css({ spaceY: '3' })}>
          <div
            className={css({ display: 'flex', alignItems: 'center', gap: { base: '3', sm: '4' } })}
          >
            <div
              className={css({
                animation: 'pulse',
                rounded: { base: 'xl', sm: '2xl' },
                bgGradient: 'to-br',
                gradientFrom: 'teal.600',
                gradientVia: 'green.600',
                gradientTo: 'emerald.700',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(20, 184, 166, 0.6)',
              })}
              style={{ animationDuration: '2s' }}
            >
              <FileSpreadsheet
                className={css({
                  h: { base: '6', sm: '8' },
                  w: { base: '6', sm: '8' },
                  color: 'white',
                })}
              />
            </div>
            <div>
              <h1
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'teal.300',
                  gradientVia: 'green.400',
                  gradientTo: 'emerald.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  color: 'transparent',
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                JSON to CSV Converter
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Convert JSON data to CSV with nested object support
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: isValid ? 'teal.500/30' : 'red.500/30',
            bg: isValid ? 'rgba(20, 184, 166, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: isValid
              ? '0 20px 25px rgba(20, 184, 166, 0.2)'
              : '0 20px 25px rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              alignItems: { base: 'start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { base: '3', sm: '4' },
            })}
          >
            {isValid && stats ? (
              <>
                <div
                  className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Badge
                    variant="outline"
                    size="sm"
                    className={css({
                      borderColor: 'teal.500/50',
                      bg: 'teal.500/10',
                      px: { base: '2.5', sm: '3', md: '4' },
                      py: { base: '1.5', sm: '1.5', md: '2' },
                      fontSize: { base: 'xs', sm: 'sm' },
                      color: 'teal.200',
                    })}
                  >
                    📊 {stats.rows} rows
                  </Badge>
                  <Badge
                    variant="outline"
                    size="sm"
                    className={css({
                      borderColor: 'green.500/50',
                      bg: 'green.500/10',
                      px: { base: '2.5', sm: '3', md: '4' },
                      py: { base: '1.5', sm: '1.5', md: '2' },
                      fontSize: { base: 'xs', sm: 'sm' },
                      color: 'green.200',
                    })}
                  >
                    📋 {stats.columns} columns
                  </Badge>
                  <Badge
                    variant="outline"
                    size="sm"
                    className={css({
                      borderColor: 'emerald.500/50',
                      bg: 'emerald.500/10',
                      px: { base: '2.5', sm: '3', md: '4' },
                      py: { base: '1.5', sm: '1.5', md: '2' },
                      fontSize: { base: 'xs', sm: 'sm' },
                      color: 'emerald.200',
                    })}
                  >
                    📝 {stats.chars.toLocaleString()} chars
                  </Badge>
                </div>

                <Badge
                  variant="success"
                  size="sm"
                  className={css({
                    animation: 'pulse',
                    bgGradient: 'to-r',
                    gradientFrom: 'green.500',
                    gradientTo: 'emerald.600',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    fontWeight: 'semibold',
                    color: 'white',
                    shadow: 'lg',
                    boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.5)',
                  })}
                >
                  ✅ Valid
                </Badge>
              </>
            ) : (
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                <span className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'teal.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h2
            className={css({
              mb: '4',
              fontSize: { base: 'lg', sm: 'xl' },
              fontWeight: 'bold',
              color: 'teal.300',
            })}
          >
            Configuration
          </h2>

          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
              gap: '4',
            })}
          >
            <Field>
              <FieldLabel
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Delimiter
              </FieldLabel>
              <FieldInput
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value || ',')}
                maxLength={1}
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  _focus: {
                    borderColor: 'teal.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(20, 184, 166, 0.3)',
                  },
                })}
              />
            </Field>

            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
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
                  checked={flattenNested}
                  onChange={(e) => setFlattenNested(e.target.checked)}
                  className={css({
                    h: '5',
                    w: '5',
                    rounded: 'md',
                    cursor: 'pointer',
                  })}
                />
                <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Flatten nested objects
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: { base: '2', sm: '3' },
          })}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCopy}
                disabled={!isValid}
                size="lg"
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                  _disabled: {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                })}
              >
                <Copy
                  className={css({
                    h: { base: '4', sm: '5' },
                    w: { base: '4', sm: '5' },
                  })}
                />
                Copy CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy CSV output to clipboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleDownload}
                disabled={!isValid}
                size="lg"
                variant="default"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                  _disabled: {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                })}
              >
                <Download
                  className={css({
                    h: { base: '4', sm: '5' },
                    w: { base: '4', sm: '5' },
                  })}
                />
                Download CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as CSV file</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                })}
              >
                <RefreshCw
                  className={css({
                    h: { base: '4', sm: '5' },
                    w: { base: '4', sm: '5' },
                  })}
                />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to default example</TooltipContent>
          </Tooltip>
        </div>

        {/* JSON Input Editor */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'teal.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'teal.500/20',
              bg: 'rgba(20, 184, 166, 0.05)',
              px: { base: '4', sm: '6' },
              py: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'sm', sm: 'base' },
                fontWeight: 'semibold',
                color: 'teal.300',
              })}
            >
              JSON Input
            </h3>
          </div>
          {jsonExtension && (
            <CodeMirror
              value={jsonInput}
              height="300px"
              extensions={[jsonExtension]}
              onChange={setJsonInput}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                searchKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
              className={css({ fontSize: { base: 'sm', sm: 'base' } })}
            />
          )}
        </div>

        {/* CSV Output Preview */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'green.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'green.500/20',
              bg: 'rgba(34, 197, 94, 0.05)',
              px: { base: '4', sm: '6' },
              py: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'sm', sm: 'base' },
                fontWeight: 'semibold',
                color: 'green.300',
              })}
            >
              CSV Output Preview
            </h3>
          </div>
          <div
            className={css({
              maxH: '300px',
              overflow: 'auto',
              p: { base: '4', sm: '6' },
            })}
          >
            {isValid && csvOutput ? (
              <pre
                className={css({
                  fontFamily: 'mono',
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'gray.300',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                })}
              >
                {csvOutput}
              </pre>
            ) : (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: '8',
                  color: 'gray.500',
                })}
              >
                Enter valid JSON array to see CSV output
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'teal.500/20',
            bg: 'rgba(20, 184, 166, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'teal.300',
            })}
          >
            How to Use
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Paste your JSON array in the editor above
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Configure delimiter (default: comma) and flattening options
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Preview the CSV output in real-time
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Copy to clipboard or download as a CSV file
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              Nested objects are flattened using dot notation (e.g., &ldquo;address.city&rdquo;)
            </li>
          </ul>
        </div>

        {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

        <ToolSearch />
      </main>
    </TooltipProvider>
  )
}
