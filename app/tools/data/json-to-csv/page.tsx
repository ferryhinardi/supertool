'use client'

import { AlertCircle, Check, Copy, Download, FileSpreadsheet, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataToolHeader } from '@/components/features/tools/DataToolHeader'
import {
  dataActionBarClass,
  dataConfigClass,
  dataPanelClass,
  dataPanelHeaderClass,
  dataPanelTitleClass,
  dataSplitClass,
} from '@/components/features/tools/data-workspace'
import { ToolPageFrame } from '@/components/features/tools/workspace/ToolPageFrame'
import { Button } from '@/components/ui/button'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { accessibleOneDark } from '@/lib/codemirror/accessible-one-dark'
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

  const actionButtonClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    minH: '11',
    fontSize: { base: 'sm', sm: 'md' },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  })

  return (
    <TooltipProvider>
      <ToolPageFrame>
        <DataToolHeader
          icon={FileSpreadsheet}
          eyebrow="Data Processing"
          title="JSON to CSV Converter"
          description="Convert JSON data to CSV with nested object support"
          highlights={['Flatten nested', 'Custom delimiter', 'Browser preview']}
        />

        <output
          aria-live="polite"
          className={css({
            display: 'flex',
            flexDirection: { base: 'column', sm: 'row' },
            alignItems: { base: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: '3',
            rounded: 'xl',
            border: '1px solid',
            borderColor: isValid ? 'brand.mint' : 'brand.rose',
            bg: 'brand.surface',
            p: { base: '4', sm: '5' },
            w: 'full',
          })}
        >
          {isValid && stats ? (
            <>
              <ul
                className={css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '2',
                  listStyle: 'none',
                  p: '0',
                  m: '0',
                })}
              >
                <li
                  className={css({
                    minH: '11',
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: '3',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    color: 'brand.ink',
                    fontSize: 'sm',
                  })}
                >
                  {stats.rows} rows
                </li>
                <li
                  className={css({
                    minH: '11',
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: '3',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    color: 'brand.ink',
                    fontSize: 'sm',
                  })}
                >
                  {stats.columns} columns
                </li>
                <li
                  className={css({
                    minH: '11',
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: '3',
                    rounded: 'full',
                    border: '1px solid',
                    borderColor: 'brand.line',
                    bg: 'brand.surfaceRaised',
                    color: 'brand.ink',
                    fontSize: 'sm',
                  })}
                >
                  {stats.chars.toLocaleString()} chars
                </li>
              </ul>
              <p
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2',
                  minH: '11',
                  px: '3',
                  rounded: 'full',
                  bg: 'rgba(78, 224, 174, 0.12)',
                  color: 'brand.mint',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                })}
              >
                <Check className={css({ h: '4', w: '4' })} aria-hidden />
                Valid
              </p>
            </>
          ) : (
            <p
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                minH: '11',
                color: 'brand.rose',
                fontSize: 'sm',
              })}
            >
              <AlertCircle className={css({ h: '5', w: '5' })} aria-hidden />
              <span>{error}</span>
            </p>
          )}
        </output>

        <section className={dataConfigClass} aria-labelledby="json-csv-config">
          <h2
            id="json-csv-config"
            className={css({
              mb: '4',
              fontSize: { base: 'lg', sm: 'xl' },
              fontWeight: 'bold',
              color: 'brand.ink',
            })}
          >
            Configuration
          </h2>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: '4',
              w: 'full',
            })}
          >
            <Field>
              <FieldLabel
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'brand.ink',
                })}
              >
                Delimiter
              </FieldLabel>
              <FieldInput
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value || ',')}
                maxLength={1}
                aria-label="Delimiter"
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'brand.line',
                  bg: 'brand.canvas',
                  minH: '11',
                  px: '4',
                  py: '2',
                  color: 'brand.ink',
                  _focusVisible: {
                    borderColor: 'brand.violet',
                    outline: '2px solid',
                    outlineColor: 'brand.violetBright',
                    outlineOffset: '2px',
                  },
                })}
              />
            </Field>

            <div className={css({ display: 'flex', alignItems: 'center' })}>
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  minH: '11',
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
                <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'brand.ink' })}>
                  Flatten nested objects
                </span>
              </label>
            </div>
          </div>
        </section>

        <div className={dataSplitClass}>
          <section className={dataPanelClass} aria-labelledby="json-csv-input">
            <div className={dataPanelHeaderClass}>
              <h2 id="json-csv-input" className={dataPanelTitleClass}>
                JSON Input
              </h2>
            </div>
            {jsonExtension && (
              <CodeMirror
                value={jsonInput}
                height="320px"
                extensions={[jsonExtension]}
                onChange={setJsonInput}
                theme={accessibleOneDark}
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
                className={css({ fontSize: { base: 'sm', sm: 'md' } })}
              />
            )}
          </section>

          <section className={dataPanelClass} aria-labelledby="json-csv-output">
            <div className={dataPanelHeaderClass}>
              <h2 id="json-csv-output" className={dataPanelTitleClass}>
                CSV Output Preview
              </h2>
            </div>
            <div
              className={css({
                minH: { base: '240px', lg: '320px' },
                maxH: { base: '360px', lg: '480px' },
                overflow: 'auto',
                p: { base: '4', sm: '5' },
              })}
            >
              {isValid && csvOutput ? (
                <pre
                  className={css({
                    fontFamily: 'mono',
                    fontSize: { base: 'xs', sm: 'sm' },
                    color: 'brand.ink',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  })}
                >
                  {csvOutput}
                </pre>
              ) : (
                <p
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minH: '200px',
                    textAlign: 'center',
                    color: 'brand.muted',
                    fontSize: 'sm',
                  })}
                >
                  Enter valid JSON array to see CSV output
                </p>
              )}
            </div>
          </section>
        </div>

        <div className={dataActionBarClass}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCopy}
                disabled={!isValid}
                size="lg"
                variant="outline"
                className={actionButtonClass}
              >
                <Copy className={css({ h: '4', w: '4' })} aria-hidden />
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
                className={actionButtonClass}
              >
                <Download className={css({ h: '4', w: '4' })} aria-hidden />
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
                className={actionButtonClass}
              >
                <RefreshCw className={css({ h: '4', w: '4' })} aria-hidden />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to default example</TooltipContent>
          </Tooltip>
        </div>

        <ToolSearch />
      </ToolPageFrame>
    </TooltipProvider>
  )
}
