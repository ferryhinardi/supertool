'use client'

import { AlertCircle, Copy, Download, RefreshCw, Table } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Dynamically import CodeMirror to reduce initial bundle size (~200KB)
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

type Alignment = 'left' | 'center' | 'right'

export default function JSONToMarkdownTablePage() {
  const [jsonInput, setJsonInput] = useState(
    '[\n  {\n    "name": "John Doe",\n    "age": 30,\n    "city": "New York"\n  },\n  {\n    "name": "Jane Smith",\n    "age": 25,\n    "city": "Los Angeles"\n  },\n  {\n    "name": "Bob Johnson",\n    "age": 35,\n    "city": "Chicago"\n  }\n]'
  )
  const [alignment, setAlignment] = useState<Alignment>('left')
  const [customHeaders, setCustomHeaders] = useState('')

  // Dynamically load json extension
  // biome-ignore lint/suspicious/noExplicitAny: Extension type is complex and dynamically loaded
  const [jsonExtension, setJsonExtension] = useState<any>(null)

  useEffect(() => {
    const loadExtension = async () => {
      const { json } = await import('@codemirror/lang-json')
      setJsonExtension(json())
    }
    loadExtension()
  }, [])

  // Calculate stats and preview
  const { stats, markdownOutput, isValid, error } = useMemo(() => {
    // Create alignment separator
    const getAlignmentSeparator = (align: Alignment): string => {
      switch (align) {
        case 'left':
          return ':---'
        case 'center':
          return ':---:'
        case 'right':
          return '---:'
        default:
          return '---'
      }
    }

    // Escape markdown special characters in cell content
    const escapeMarkdownCell = (field: unknown): string => {
      if (field === null || field === undefined) return ''
      const str = String(field)
      // Escape pipe characters and newlines
      return str.replace(/\|/g, '\\|').replace(/\n/g, ' ')
    }

    // Convert JSON to Markdown Table
    const convertToMarkdownInner = (data: Record<string, unknown>[]): string => {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Input must be a non-empty array of objects')
      }

      // Get all unique headers from all objects
      const headers = Array.from(new Set(data.flatMap((obj) => Object.keys(obj)))).sort()

      if (headers.length === 0) {
        throw new Error('Objects must have at least one property')
      }

      // Use custom headers if provided, otherwise use original headers
      const displayHeaders =
        customHeaders.trim() !== '' ? customHeaders.split(',').map((h) => h.trim()) : headers

      // Ensure custom headers count matches actual headers
      if (customHeaders.trim() !== '' && displayHeaders.length !== headers.length) {
        throw new Error(
          `Custom headers count (${displayHeaders.length}) must match columns count (${headers.length})`
        )
      }

      // Create header row
      const headerRow = `| ${displayHeaders.join(' | ')} |`

      // Create alignment row
      const alignmentSeparator = getAlignmentSeparator(alignment)
      const separatorRow = `| ${headers.map(() => alignmentSeparator).join(' | ')} |`

      // Create data rows
      const dataRows = data.map((obj) => {
        const cells = headers.map((header) => escapeMarkdownCell(obj[header]))
        return `| ${cells.join(' | ')} |`
      })

      return [headerRow, separatorRow, ...dataRows].join('\n')
    }

    try {
      const parsed = JSON.parse(jsonInput)

      if (!Array.isArray(parsed)) {
        return {
          stats: null,
          markdownOutput: '',
          isValid: false,
          error: 'Input must be an array of objects',
        }
      }

      if (parsed.length === 0) {
        return {
          stats: null,
          markdownOutput: '',
          isValid: false,
          error: 'Array cannot be empty',
        }
      }

      const markdown = convertToMarkdownInner(parsed as Record<string, unknown>[])
      const lines = markdown.split('\n')
      const columns = Array.from(
        new Set((parsed as Record<string, unknown>[]).flatMap((obj) => Object.keys(obj)))
      ).length

      return {
        stats: {
          rows: parsed.length,
          columns,
          totalLines: lines.length,
          chars: markdown.length,
        },
        markdownOutput: markdown,
        isValid: true,
        error: null,
      }
    } catch (err) {
      return {
        stats: null,
        markdownOutput: '',
        isValid: false,
        error: err instanceof Error ? err.message : 'Invalid JSON format',
      }
    }
  }, [jsonInput, alignment, customHeaders])

  const handleCopy = async () => {
    if (!isValid || !markdownOutput) {
      toast.error('No valid Markdown table to copy')
      return
    }

    await navigator.clipboard.writeText(markdownOutput)
    toast.success('Markdown table copied to clipboard')
    trackToolEvent('json_markdown_copy', {
      output_length: markdownOutput.length,
    })
  }

  const handleDownload = () => {
    if (!isValid || !markdownOutput) {
      toast.error('No valid Markdown table to download')
      return
    }

    const blob = new Blob([markdownOutput], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `table-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Markdown file downloaded')
    trackToolEvent('json_markdown_download', {
      file_size_kb: Math.round(blob.size / 1024),
    })
  }

  const handleReset = () => {
    setJsonInput(
      '[\n  {\n    "name": "John Doe",\n    "age": 30,\n    "city": "New York"\n  },\n  {\n    "name": "Jane Smith",\n    "age": 25,\n    "city": "Los Angeles"\n  },\n  {\n    "name": "Bob Johnson",\n    "age": 35,\n    "city": "Chicago"\n  }\n]'
    )
    setAlignment('left')
    setCustomHeaders('')
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
                gradientFrom: 'purple.600',
                gradientVia: 'pink.600',
                gradientTo: 'purple.700',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.6)',
              })}
              style={{ animationDuration: '2s' }}
            >
              <Table
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
                  gradientFrom: 'purple.300',
                  gradientVia: 'pink.400',
                  gradientTo: 'purple.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  color: 'transparent',
                  filter:
                    'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
                })}
              >
                JSON to Markdown Table
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Convert JSON arrays to beautifully formatted Markdown tables
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: isValid ? 'purple.500/30' : 'red.500/30',
            bg: isValid ? 'rgba(168, 85, 247, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: isValid
              ? '0 20px 25px rgba(168, 85, 247, 0.2)'
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
                      border: '1px solid',
                      borderColor: 'purple.500/50',
                      bg: 'purple.500/10',
                      px: { base: '2.5', sm: '3', md: '4' },
                      py: { base: '1.5', sm: '1.5', md: '2' },
                      fontSize: { base: 'xs', sm: 'sm' },
                      color: 'purple.200',
                    })}
                  >
                    {stats.rows} rows
                  </Badge>
                  <Badge
                    variant="outline"
                    size="sm"
                    className={css({
                      border: '1px solid',
                      borderColor: 'pink.500/50',
                      bg: 'pink.500/10',
                      px: { base: '2.5', sm: '3', md: '4' },
                      py: { base: '1.5', sm: '1.5', md: '2' },
                      fontSize: { base: 'xs', sm: 'sm' },
                      color: 'pink.200',
                    })}
                  >
                    {stats.columns} columns
                  </Badge>
                  <Badge
                    variant="outline"
                    size="sm"
                    className={css({
                      border: '1px solid',
                      borderColor: 'purple.400/50',
                      bg: 'purple.400/10',
                      px: { base: '2.5', sm: '3', md: '4' },
                      py: { base: '1.5', sm: '1.5', md: '2' },
                      fontSize: { base: 'xs', sm: 'sm' },
                      color: 'purple.200',
                    })}
                  >
                    {stats.chars.toLocaleString()} chars
                  </Badge>
                </div>

                <Badge
                  variant="success"
                  size="sm"
                  className={css({
                    animation: 'pulse',
                    bgGradient: 'to-r',
                    gradientFrom: 'purple.500',
                    gradientTo: 'pink.600',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    fontWeight: 'semibold',
                    color: 'white',
                    shadow: 'lg',
                    boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.5)',
                  })}
                >
                  Valid
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
            borderColor: 'purple.500/20',
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
              color: 'purple.300',
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
              <FieldLabel className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                Column Alignment
              </FieldLabel>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value as Alignment)}
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  w: 'full',
                  cursor: 'pointer',
                  _focus: {
                    borderColor: 'purple.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(168, 85, 247, 0.3)',
                  },
                })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </Field>

            <Field>
              <FieldLabel className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                Custom Headers (comma-separated, optional)
              </FieldLabel>
              <input
                type="text"
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                placeholder="Name, Age, Location"
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  w: 'full',
                  _focus: {
                    borderColor: 'purple.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(168, 85, 247, 0.3)',
                  },
                  _placeholder: {
                    color: 'white',
                  },
                })}
              />
            </Field>
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
                <Copy className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })} />
                Copy Markdown
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Markdown table to clipboard</TooltipContent>
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
                  className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })}
                />
                Download .md
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as Markdown file</TooltipContent>
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
                  className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })}
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
            borderColor: 'purple.500/20',
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
              borderColor: 'purple.500/20',
              bg: 'rgba(168, 85, 247, 0.05)',
              px: { base: '4', sm: '6' },
              py: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'sm', sm: 'base' },
                fontWeight: 'semibold',
                color: 'purple.300',
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

        {/* Markdown Output Preview */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'pink.500/20',
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
              borderColor: 'pink.500/20',
              bg: 'rgba(236, 72, 153, 0.05)',
              px: { base: '4', sm: '6' },
              py: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'sm', sm: 'base' },
                fontWeight: 'semibold',
                color: 'pink.300',
              })}
            >
              Markdown Output Preview
            </h3>
          </div>
          <div
            className={css({
              maxH: '300px',
              overflow: 'auto',
              p: { base: '4', sm: '6' },
            })}
          >
            {isValid && markdownOutput ? (
              <pre
                className={css({
                  fontFamily: 'mono',
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'white',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                })}
              >
                {markdownOutput}
              </pre>
            ) : (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: '8',
                  color: 'white',
                })}
              >
                Enter valid JSON array to see Markdown table
              </div>
            )}
          </div>
        </div>

        {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

        <ToolSearch />
      </main>
    </TooltipProvider>
  )
}
