'use client'

import Ajv from 'ajv'
import { JSONPath } from 'jsonpath-plus'
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileJson,
  GitCompare,
  Lightbulb,
  ListTree,
  Minimize2,
  Search,
  Settings2,
  Sparkles,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTrackToolView } from '@/hooks/useRecentTools'
import { trackToolEvent } from '@/lib/analytics'
import { tools } from '@/lib/tools'
import { css } from '@/styled-system/css'

// Dynamically import CodeMirror to reduce initial bundle size (~200KB)
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

const faqs = [
  {
    question: 'What is JSON beautifier and why do I need it?',
    answer:
      'A JSON beautifier formats compressed or minified JSON data into a readable, indented structure. It helps developers debug API responses, review configuration files, and understand complex JSON structures by adding proper indentation, line breaks, and syntax highlighting. This is essential for developers working with REST APIs, configuration management, data analysis, and web development.',
  },
  {
    question: 'Is my JSON data safe when using this tool?',
    answer:
      'Yes, absolutely. All JSON formatting, validation, and beautification happens entirely in your browser using client-side JavaScript. Your data never leaves your device and is not sent to any server, ensuring complete privacy and security. This makes it safe to format sensitive data like API keys, configuration files, or customer data.',
  },
  {
    question: 'Can I validate JSON syntax with this tool?',
    answer:
      'Yes! The JSON beautifier automatically validates your JSON syntax as you type. It will highlight errors and show you exactly where syntax issues occur, making it easy to fix malformed JSON quickly. You can also validate JSON against JSON Schema for advanced validation with custom rules and data types.',
  },
  {
    question: 'What is the difference between beautify and minify?',
    answer:
      'Beautify adds indentation, line breaks, and spacing to make JSON human-readable. Minify does the opposite - it removes all unnecessary whitespace to create the smallest possible file size, which is useful for production environments to reduce bandwidth usage. Use beautify for development and debugging, and minify for production deployments.',
  },
  {
    question: 'How do I format JSON from API responses?',
    answer:
      'Copy the JSON response from your API testing tool (Postman, Insomnia, cURL, etc.) and paste it directly into the editor. Click "Beautify" to format it with proper indentation. The tool automatically detects and formats nested objects and arrays, making complex API responses easy to read and understand.',
  },
  {
    question: 'Can I convert JSON to TypeScript interfaces?',
    answer:
      'Yes! Switch to the "TypeScript" view mode and click "Generate TypeScript Interface" to automatically create TypeScript type definitions from your JSON data. This is perfect for frontend developers working with APIs who need to quickly generate type-safe interfaces for their TypeScript projects.',
  },
  {
    question: 'What are the keyboard shortcuts?',
    answer:
      'The editor supports standard keyboard shortcuts: Ctrl+B (or Cmd+B on Mac) to beautify, Ctrl+M to minify, and Ctrl+C to copy. The CodeMirror editor also supports common editing shortcuts like Ctrl+Z for undo, Ctrl+F for find, and Tab for indentation.',
  },
  {
    question: 'How do I compare two JSON files?',
    answer:
      'Switch to the "Compare" view mode, paste your first JSON in the left editor and the second JSON in the right editor. Click "Compare JSONs" to see a detailed diff showing added, removed, and changed properties. This is useful for comparing API responses, configuration versions, or debugging data changes.',
  },
]

// Schema templates
const SCHEMA_TEMPLATES = {
  user: {
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0 },
      active: { type: 'boolean' },
    },
  },
  apiResponse: {
    type: 'object',
    required: ['status', 'data'],
    properties: {
      status: { type: 'string', enum: ['success', 'error'] },
      data: { type: 'object' },
      message: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },
  config: {
    type: 'object',
    required: ['name', 'version'],
    properties: {
      name: { type: 'string' },
      version: { type: 'string' },
      settings: {
        type: 'object',
        properties: {
          debug: { type: 'boolean' },
          timeout: { type: 'number' },
        },
      },
    },
  },
}

type ViewMode = 'editor' | 'tree' | 'schema' | 'diff' | 'typescript'

// Tree node component
function TreeNode({ data, path = 'root' }: { data: unknown; path?: string }) {
  const [expanded, setExpanded] = useState(true)

  if (data === null) {
    return <span className={css({ color: 'gray.500', fontStyle: 'italic' })}>null</span>
  }

  if (typeof data !== 'object') {
    const color =
      typeof data === 'string'
        ? 'green.400'
        : typeof data === 'number'
          ? 'blue.400'
          : typeof data === 'boolean'
            ? 'purple.400'
            : 'gray.400'
    return <span className={css({ color })}>{JSON.stringify(data)}</span>
  }

  const isArray = Array.isArray(data)
  const entries = isArray ? data : Object.entries(data)
  const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0

  if (isEmpty) {
    return <span className={css({ color: 'gray.500' })}>{isArray ? '[]' : '{}'}</span>
  }

  return (
    <div className={css({ ml: '4' })}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '1',
          cursor: 'pointer',
          color: 'gray.300',
          _hover: { color: 'white' },
        })}
      >
        {expanded ? (
          <ChevronDown className={css({ h: '4', w: '4' })} />
        ) : (
          <ChevronRight className={css({ h: '4', w: '4' })} />
        )}
        <span>{isArray ? `Array[${data.length}]` : 'Object'}</span>
      </button>
      {expanded && (
        <div
          className={css({ ml: '4', borderLeft: '1px solid', borderColor: 'gray.700', pl: '2' })}
        >
          {isArray
            ? entries.map((item: unknown, idx: number) => (
                <div key={`${path}-${idx}`} className={css({ my: '1' })}>
                  <span className={css({ color: 'blue.400' })}>[{idx}]</span>:{' '}
                  <TreeNode data={item} path={`${path}[${idx}]`} />
                </div>
              ))
            : entries.map(([key, value]: [string, unknown]) => (
                <div key={`${path}-${key}`} className={css({ my: '1' })}>
                  <span className={css({ color: 'cyan.400' })}>{key}</span>:{' '}
                  <TreeNode data={value} path={`${path}.${key}`} />
                </div>
              ))}
        </div>
      )}
    </div>
  )
}

// JSON to TypeScript interface generator
function generateTypeScriptInterface(obj: unknown, interfaceName = 'Root'): string {
  if (typeof obj !== 'object' || obj === null) {
    return `type ${interfaceName} = ${typeof obj}`
  }

  const lines: string[] = [`interface ${interfaceName} {`]

  for (const [key, value] of Object.entries(obj)) {
    const tsType = getTypeScriptType(value)
    lines.push(`  ${key}: ${tsType};`)
  }

  lines.push('}')
  return lines.join('\n')
}

function getTypeScriptType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    const firstType = getTypeScriptType(value[0])
    return `${firstType}[]`
  }
  if (typeof value === 'object') {
    const props = Object.entries(value)
      .map(([k, v]) => `${k}: ${getTypeScriptType(v)}`)
      .join('; ')
    return `{ ${props} }`
  }
  return typeof value
}

// Generate sample data from schema
function generateSampleFromSchema(schema: Record<string, unknown>): unknown {
  if (!schema || typeof schema !== 'object') return null

  if (schema.type === 'object') {
    const obj: Record<string, unknown> = {}
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [key, prop] of Object.entries(schema.properties)) {
        obj[key] = generateSampleFromSchema(prop as Record<string, unknown>)
      }
    }
    return obj
  }

  if (schema.type === 'array') {
    return [generateSampleFromSchema((schema.items || {}) as Record<string, unknown>)]
  }

  if (schema.type === 'string') {
    if (schema.format === 'email') return 'user@example.com'
    if (schema.format === 'date-time') return new Date().toISOString()
    if (Array.isArray(schema.enum)) return schema.enum[0]
    return 'example'
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return typeof schema.minimum === 'number' ? schema.minimum : 0
  }

  if (schema.type === 'boolean') {
    return true
  }

  return null
}

function JSONBeautifyContent() {
  // Find tool data for tracking
  const toolData = tools.find((t) => t.href === '/tools/json-beautify')

  // Track tool view
  useTrackToolView({
    toolId: toolData?.href || '/tools/json-beautify',
    title: toolData?.title || 'JSON Beautifier',
    href: toolData?.href || '/tools/json-beautify',
    iconName: 'FileJson',
    gradient: toolData?.gradient || 'from-purple-500 to-pink-500',
  })

  const [value, setValue] = useQueryState('json', {
    defaultValue: '{\n  "example": true,\n  "message": "Welcome to SuperTool!"\n}',
  })

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('editor')

  // Schema validation state
  const [schema, setSchema] = useState('')
  const [schemaErrors, setSchemaErrors] = useState<string[]>([])

  // Diff state
  const [compareJson, setCompareJson] = useState('')
  const [diffResult, setDiffResult] = useState<{ added: string[]; removed: string[] } | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<unknown[]>([])

  // Formatting options
  const [indentSize, setIndentSize] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)

  // TypeScript interface
  const [tsInterface, setTsInterface] = useState('')

  // Dynamically load json extension
  // biome-ignore lint/suspicious/noExplicitAny: CodeMirror extension type is complex
  const [jsonExtension, setJsonExtension] = useState<any>(null)

  useEffect(() => {
    const loadExtension = async () => {
      const { json } = await import('@codemirror/lang-json')
      setJsonExtension(json())
    }
    loadExtension()
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const lines = value.split('\n').length
    const chars = value.length
    let isValid = false
    let objDepth = 0

    try {
      const parsed = JSON.parse(value)
      isValid = true
      // Calculate object depth
      const getDepth = (obj: unknown): number => {
        if (obj == null || typeof obj !== 'object') return 0
        return (
          1 + Math.max(0, ...Object.values(obj as Record<string, unknown>).map((v) => getDepth(v)))
        )
      }
      objDepth = getDepth(parsed)
    } catch {
      isValid = false
    }

    return { lines, chars, isValid, objDepth }
  }, [value])

  const handleBeautify = () => {
    try {
      const obj = JSON.parse(value)
      const formatted = sortKeys
        ? JSON.stringify(sortObjectKeys(obj), null, indentSize)
        : JSON.stringify(obj, null, indentSize)
      setValue(formatted)
      toast.success('JSON beautified successfully 🎉')
      trackToolEvent('json_beautify', {
        success: true,
        input_length: value.length,
      })
    } catch {
      toast.error('Invalid JSON format ⚠️')
      trackToolEvent('json_beautify', {
        success: false,
        error_type: 'parse_error',
      })
    }
  }

  const handleMinify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj))
      toast.success('JSON minified ✅')
      trackToolEvent('json_minify', {
        success: true,
        input_length: value.length,
      })
    } catch {
      toast.error('Invalid JSON format ⚠️')
      trackToolEvent('json_minify', {
        success: false,
      })
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard 📋')
    trackToolEvent('json_copy', {
      output_length: value.length,
    })
  }

  const handleDownload = () => {
    if (!stats.isValid) {
      toast.error('Cannot download invalid JSON')
      return
    }

    const blob = new Blob([value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('JSON file downloaded 📥')
    trackToolEvent('json_download', {
      file_size_kb: Math.round(blob.size / 1024),
    })
  }

  // Validate schema
  const validateSchema = () => {
    try {
      const jsonObj = JSON.parse(value)
      const schemaObj = JSON.parse(schema)
      const ajv = new Ajv({ allErrors: true })
      const validate = ajv.compile(schemaObj)
      const valid = validate(jsonObj)

      if (valid) {
        setSchemaErrors([])
        toast.success('✅ JSON is valid against schema!')
        trackToolEvent('json_schema_validate', { success: true })
      } else {
        const errors = validate.errors?.map((err) => `${err.instancePath} ${err.message}`) || []
        setSchemaErrors(errors)
        toast.error(`Schema validation failed: ${errors.length} errors`)
        trackToolEvent('json_schema_validate', { success: false, error_count: errors.length })
      }
    } catch (err) {
      toast.error('Invalid JSON or Schema')
      setSchemaErrors(['Invalid JSON or Schema format'])
    }
  }

  // Load schema template
  const loadSchemaTemplate = (template: keyof typeof SCHEMA_TEMPLATES) => {
    setSchema(JSON.stringify(SCHEMA_TEMPLATES[template], null, 2))
    toast.success(`Loaded ${template} schema template`)
    trackToolEvent('json_schema_template', { template })
  }

  // Generate sample data
  const handleGenerateSample = () => {
    try {
      const schemaObj = JSON.parse(schema)
      const sample = generateSampleFromSchema(schemaObj)
      setValue(JSON.stringify(sample, null, 2))
      toast.success('Sample data generated from schema')
      trackToolEvent('json_generate_sample', { success: true })
    } catch {
      toast.error('Invalid schema format')
    }
  }

  // Search JSON
  const handleSearch = () => {
    try {
      const jsonObj = JSON.parse(value)
      const results = JSONPath({ path: searchQuery, json: jsonObj })
      setSearchResults(results)
      toast.success(`Found ${results.length} matches`)
      trackToolEvent('json_search', { query_length: searchQuery.length, results: results.length })
    } catch (err) {
      toast.error('Invalid JSONPath query or JSON')
      setSearchResults([])
    }
  }

  // Generate TypeScript interface
  const handleGenerateTypeScript = () => {
    try {
      const jsonObj = JSON.parse(value)
      const interfaceStr = generateTypeScriptInterface(jsonObj)
      setTsInterface(interfaceStr)
      toast.success('TypeScript interface generated')
      trackToolEvent('json_to_typescript', { success: true })
    } catch {
      toast.error('Invalid JSON format')
    }
  }

  // Copy TypeScript interface
  const handleCopyTypeScript = async () => {
    await navigator.clipboard.writeText(tsInterface)
    toast.success('TypeScript interface copied')
    trackToolEvent('json_typescript_copy', {})
  }

  // Sort object keys recursively
  const sortObjectKeys = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce(
          (acc, key) => {
            acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
            return acc
          },
          {} as Record<string, unknown>
        )
    }
    return obj
  }

  // Compare JSONs
  const handleCompare = () => {
    try {
      const json1 = JSON.parse(value) as unknown
      const json2 = JSON.parse(compareJson) as unknown

      // Simple diff implementation
      const diff = {
        added: findDifferences(json2, json1),
        removed: findDifferences(json1, json2),
      }

      setDiffResult(diff)
      toast.success('Comparison complete')
      trackToolEvent('json_compare', { success: true })
    } catch {
      toast.error('Invalid JSON in one or both inputs')
    }
  }

  const findDifferences = (obj1: unknown, obj2: unknown, path = ''): string[] => {
    const diffs: string[] = []

    if (typeof obj1 !== typeof obj2) {
      diffs.push(`${path || 'root'}: type changed`)
      return diffs
    }

    if (typeof obj1 !== 'object' || obj1 === null) {
      if (obj1 !== obj2) {
        diffs.push(`${path || 'root'}: ${JSON.stringify(obj1)} → ${JSON.stringify(obj2)}`)
      }
      return diffs
    }

    const record1 = obj1 as Record<string, unknown>
    const record2 = obj2 as Record<string, unknown>

    for (const key of Object.keys(record1)) {
      if (!(key in record2)) {
        diffs.push(`${path}.${key}: removed`)
      } else {
        diffs.push(...findDifferences(record1[key], record2[key], path ? `${path}.${key}` : key))
      }
    }

    for (const key of Object.keys(record2)) {
      if (!(key in record1)) {
        diffs.push(`${path}.${key}: added`)
      }
    }

    return diffs
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
                animation: 'pulse 2s infinite',
                rounded: { base: 'xl', sm: '2xl' },
                bgGradient: 'to-br',
                gradientFrom: 'purple.600',
                gradientVia: 'pink.600',
                gradientTo: 'purple.700',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.6)',
              })}
            >
              <FileJson
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
                  gradientTo: 'blue.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  color: 'transparent',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                JSON Beautifier Pro
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Advanced JSON tools: Format, validate, compare, and generate TypeScript
              </p>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'blue.500/30',
            bg: 'rgba(59, 130, 246, 0.05)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Lightbulb className={css({ h: '5', w: '5' })} />
              How to Use JSON Beautifier
            </CardTitle>
            <CardDescription>
              Follow these simple steps to format, validate, and work with your JSON data
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'purple.500/20',
                    borderColor: 'purple.500/50',
                    flexShrink: 0,
                  })}
                >
                  1
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    Paste Your JSON
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    Copy your JSON data from API responses, config files, or any source and paste it
                    into the editor below. Works with minified or formatted JSON.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'pink.500/20',
                    borderColor: 'pink.500/50',
                    flexShrink: 0,
                  })}
                >
                  2
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    Choose Your Action
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    Click <strong>Beautify</strong> to format with indentation,{' '}
                    <strong>Minify</strong> to compress, or explore advanced features like schema
                    validation, comparison, and TypeScript generation.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'blue.500/20',
                    borderColor: 'blue.500/50',
                    flexShrink: 0,
                  })}
                >
                  3
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    Copy or Download
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    Use the <strong>Copy</strong> button to copy formatted JSON to your clipboard,
                    or <strong>Download</strong> as a .json file. All processing happens in your
                    browser - your data never leaves your device.
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Features */}
            <div
              className={css({
                mt: '4',
                p: '4',
                rounded: 'lg',
                bg: 'purple.500/10',
                border: '1px solid',
                borderColor: 'purple.500/30',
              })}
            >
              <h3
                className={css({
                  fontWeight: 'semibold',
                  color: 'purple.200',
                  mb: '2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Sparkles className={css({ h: '4', w: '4' })} />
                Pro Features
              </h3>
              <ul className={css({ spaceY: '1', fontSize: 'sm', color: 'gray.300' })}>
                <li>
                  <strong className={css({ color: 'gray.100' })}>Tree View:</strong> Visualize JSON
                  structure in an interactive hierarchical tree
                </li>
                <li>
                  <strong className={css({ color: 'gray.100' })}>Schema Validation:</strong>{' '}
                  Validate JSON against JSON Schema with detailed error messages
                </li>
                <li>
                  <strong className={css({ color: 'gray.100' })}>JSON Diff:</strong> Compare two
                  JSON objects and see differences highlighted
                </li>
                <li>
                  <strong className={css({ color: 'gray.100' })}>TypeScript Generator:</strong>{' '}
                  Automatically generate TypeScript interfaces from JSON
                </li>
                <li>
                  <strong className={css({ color: 'gray.100' })}>JSONPath Search:</strong> Query
                  JSON data using JSONPath expressions
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Selector */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '3', sm: '4' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
            <Button
              size="sm"
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              onClick={() => setViewMode('editor')}
              className={css({ gap: '2' })}
            >
              <Code2 className={css({ h: '4', w: '4' })} />
              Editor
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              onClick={() => setViewMode('tree')}
              className={css({ gap: '2' })}
            >
              <ListTree className={css({ h: '4', w: '4' })} />
              Tree View
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'schema' ? 'default' : 'outline'}
              onClick={() => setViewMode('schema')}
              className={css({ gap: '2' })}
            >
              <AlertCircle className={css({ h: '4', w: '4' })} />
              Schema Validation
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'diff' ? 'default' : 'outline'}
              onClick={() => setViewMode('diff')}
              className={css({ gap: '2' })}
            >
              <GitCompare className={css({ h: '4', w: '4' })} />
              Compare
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'typescript' ? 'default' : 'outline'}
              onClick={() => setViewMode('typescript')}
              className={css({ gap: '2' })}
            >
              <ArrowLeftRight className={css({ h: '4', w: '4' })} />
              TypeScript
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: '0 20px 25px rgba(139, 92, 246, 0.2)',
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
            <div
              className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2' })}
            >
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'purple.500/50',
                  bg: 'purple.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'purple.200',
                })}
              >
                📏 {stats.lines} lines
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'blue.500/50',
                  bg: 'blue.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'blue.200',
                })}
              >
                📝 {stats.chars.toLocaleString()} chars
              </Badge>
              {stats.isValid && (
                <Badge
                  variant="outline"
                  size="sm"
                  className={css({
                    borderColor: 'cyan.500/50',
                    bg: 'cyan.500/10',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    color: 'cyan.200',
                  })}
                >
                  🌲 Depth: {stats.objDepth}
                </Badge>
              )}
            </div>

            <Badge
              variant={stats.isValid ? 'success' : 'destructive'}
              size="sm"
              className={css({
                animation: 'pulse 2s infinite',
                px: { base: '2.5', sm: '3', md: '4' },
                py: { base: '1.5', sm: '1.5', md: '2' },
                fontSize: { base: 'xs', sm: 'sm' },
                fontWeight: 'semibold',
                bgGradient: stats.isValid ? 'to-r' : 'to-r',
                gradientFrom: stats.isValid ? 'green.500' : 'red.500',
                gradientTo: stats.isValid ? 'emerald.600' : 'rose.600',
                color: 'white',
                shadow: 'lg',
                boxShadow: stats.isValid
                  ? '0 10px 15px rgba(34, 197, 94, 0.5)'
                  : '0 10px 15px rgba(239, 68, 68, 0.5)',
              })}
            >
              {stats.isValid ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </Badge>
          </div>
        </div>

        {/* Main Content - Changes based on view mode */}
        {viewMode === 'editor' && (
          <>
            {/* Search & Formatting Options */}
            <Card
              className={css({
                border: '2px solid',
                borderColor: 'cyan.500/30',
                bg: 'rgba(6, 182, 212, 0.05)',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Settings2 className={css({ h: '5', w: '5' })} />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {/* JSONPath Search */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="jsonpath-search"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    JSONPath Search (e.g., $.users[*].email)
                  </label>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Input
                      id="jsonpath-search"
                      placeholder="$.path.to.property"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={css({ flex: '1' })}
                    />
                    <Button onClick={handleSearch} className={css({ gap: '2' })}>
                      <Search className={css({ h: '4', w: '4' })} />
                      Search
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div
                      className={css({
                        mt: '2',
                        p: '3',
                        rounded: 'lg',
                        bg: 'cyan.500/10',
                        border: '1px solid',
                        borderColor: 'cyan.500/30',
                      })}
                    >
                      <p className={css({ fontSize: 'sm', fontWeight: 'medium', mb: '2' })}>
                        Found {searchResults.length} result(s):
                      </p>
                      <pre
                        className={css({
                          fontSize: 'sm',
                          color: 'gray.300',
                          overflowX: 'auto',
                        })}
                      >
                        {JSON.stringify(searchResults, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Formatting Options */}
                <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap' })}>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="indent-size"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
                      Indent Size
                    </label>
                    <select
                      id="indent-size"
                      value={indentSize}
                      onChange={(e) => setIndentSize(Number(e.target.value))}
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        px: '3',
                        py: '2',
                        fontSize: 'sm',
                        color: 'gray.200',
                      })}
                    >
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces</option>
                      <option value="8">8 spaces</option>
                    </select>
                  </div>

                  <div className={css({ display: 'flex', alignItems: 'end', gap: '2' })}>
                    <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <input
                        type="checkbox"
                        checked={sortKeys}
                        onChange={(e) => setSortKeys(e.target.checked)}
                        className={css({ h: '4', w: '4' })}
                      />
                      <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                        Sort Keys Alphabetically
                      </span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editor */}
            <div
              className={css({
                rounded: { base: 'xl', sm: '2xl' },
                border: '2px solid',
                borderColor: 'purple.500/30',
                bg: 'rgba(139, 92, 246, 0.05)',
                p: { base: '3', sm: '4' },
                overflow: 'hidden',
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(16px)',
              })}
            >
              <div className={css({ overflowX: 'auto' })}>
                {jsonExtension && (
                  <CodeMirror
                    value={value}
                    height="500px"
                    theme="dark"
                    extensions={[jsonExtension]}
                    onChange={(val) => setValue(val)}
                    className={css({ fontSize: { base: 'sm', sm: 'base' } })}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: true,
                      highlightActiveLine: true,
                      foldGutter: true,
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === 'tree' && (
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'purple.500/30',
              bg: 'rgba(139, 92, 246, 0.05)',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <ListTree className={css({ h: '5', w: '5' })} />
                Tree View
              </CardTitle>
              <CardDescription>Interactive hierarchical view of your JSON data</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  p: '4',
                  rounded: 'lg',
                  bg: 'gray.900/50',
                  maxH: '600px',
                  overflowY: 'auto',
                  fontFamily: 'mono',
                  fontSize: 'sm',
                })}
              >
                {stats.isValid ? (
                  <TreeNode data={JSON.parse(value)} />
                ) : (
                  <p className={css({ color: 'red.400' })}>
                    Invalid JSON - Cannot render tree view
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'schema' && (
          <div
            className={css({
              display: 'grid',
              gap: '4',
              gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
            })}
          >
            <Card
              className={css({
                border: '2px solid',
                borderColor: 'purple.500/30',
                bg: 'rgba(139, 92, 246, 0.05)',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>JSON Data</CardTitle>
                <CardDescription>Your JSON to validate</CardDescription>
              </CardHeader>
              <CardContent>
                {jsonExtension && (
                  <CodeMirror
                    value={value}
                    height="400px"
                    theme="dark"
                    extensions={[jsonExtension]}
                    onChange={(val) => setValue(val)}
                    className={css({ fontSize: 'sm' })}
                  />
                )}
              </CardContent>
            </Card>

            <Card
              className={css({
                border: '2px solid',
                borderColor: 'blue.500/30',
                bg: 'rgba(59, 130, 246, 0.05)',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>JSON Schema</CardTitle>
                <CardDescription>
                  <div className={css({ display: 'flex', gap: '2', mt: '2', flexWrap: 'wrap' })}>
                    <Button size="sm" variant="outline" onClick={() => loadSchemaTemplate('user')}>
                      User
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadSchemaTemplate('apiResponse')}
                    >
                      API Response
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadSchemaTemplate('config')}
                    >
                      Config
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '3' })}>
                {jsonExtension && (
                  <CodeMirror
                    value={schema}
                    height="300px"
                    theme="dark"
                    extensions={[jsonExtension]}
                    onChange={(val) => setSchema(val)}
                    className={css({ fontSize: 'sm' })}
                  />
                )}
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button onClick={validateSchema} className={css({ flex: '1', gap: '2' })}>
                    <Check className={css({ h: '4', w: '4' })} />
                    Validate
                  </Button>
                  <Button
                    onClick={handleGenerateSample}
                    variant="outline"
                    className={css({ gap: '2' })}
                  >
                    <Lightbulb className={css({ h: '4', w: '4' })} />
                    Generate Sample
                  </Button>
                </div>
                {schemaErrors.length > 0 && (
                  <div
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      bg: 'red.500/10',
                      border: '1px solid',
                      borderColor: 'red.500/30',
                    })}
                  >
                    <p
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        mb: '2',
                        color: 'red.400',
                      })}
                    >
                      Validation Errors:
                    </p>
                    {schemaErrors.map((err, idx) => (
                      <p key={idx} className={css({ fontSize: 'sm', color: 'red.300' })}>
                        • {err}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'diff' && (
          <div className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'grid',
                gap: '4',
                gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
              })}
            >
              <Card
                className={css({
                  border: '2px solid',
                  borderColor: 'purple.500/30',
                  bg: 'rgba(139, 92, 246, 0.05)',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>JSON 1 (Original)</CardTitle>
                </CardHeader>
                <CardContent>
                  {jsonExtension && (
                    <CodeMirror
                      value={value}
                      height="300px"
                      theme="dark"
                      extensions={[jsonExtension]}
                      onChange={(val) => setValue(val)}
                      className={css({ fontSize: 'sm' })}
                    />
                  )}
                </CardContent>
              </Card>

              <Card
                className={css({
                  border: '2px solid',
                  borderColor: 'blue.500/30',
                  bg: 'rgba(59, 130, 246, 0.05)',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>JSON 2 (Compare)</CardTitle>
                </CardHeader>
                <CardContent>
                  {jsonExtension && (
                    <CodeMirror
                      value={compareJson}
                      height="300px"
                      theme="dark"
                      extensions={[jsonExtension]}
                      onChange={(val) => setCompareJson(val)}
                      className={css({ fontSize: 'sm' })}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <Button onClick={handleCompare} className={css({ w: 'full', gap: '2' })}>
              <GitCompare className={css({ h: '5', w: '5' })} />
              Compare JSONs
            </Button>

            {diffResult && (
              <Card
                className={css({
                  border: '2px solid',
                  borderColor: 'cyan.500/30',
                  bg: 'rgba(6, 182, 212, 0.05)',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>Comparison Result</CardTitle>
                </CardHeader>
                <CardContent className={css({ spaceY: '4' })}>
                  {diffResult.removed.length > 0 && (
                    <div>
                      <h4
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'red.400',
                          mb: '2',
                        })}
                      >
                        Removed/Changed in JSON 2:
                      </h4>
                      {diffResult.removed.map((diff: string, idx: number) => (
                        <p key={idx} className={css({ fontSize: 'sm', color: 'red.300' })}>
                          - {diff}
                        </p>
                      ))}
                    </div>
                  )}
                  {diffResult.added.length > 0 && (
                    <div>
                      <h4
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'green.400',
                          mb: '2',
                        })}
                      >
                        Added/Changed in JSON 2:
                      </h4>
                      {diffResult.added.map((diff: string, idx: number) => (
                        <p key={idx} className={css({ fontSize: 'sm', color: 'green.300' })}>
                          + {diff}
                        </p>
                      ))}
                    </div>
                  )}
                  {diffResult.removed.length === 0 && diffResult.added.length === 0 && (
                    <p className={css({ color: 'green.400' })}>✅ JSONs are identical</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {viewMode === 'typescript' && (
          <div className={css({ spaceY: '4' })}>
            <Card
              className={css({
                border: '2px solid',
                borderColor: 'purple.500/30',
                bg: 'rgba(139, 92, 246, 0.05)',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>JSON Input</CardTitle>
              </CardHeader>
              <CardContent>
                {jsonExtension && (
                  <CodeMirror
                    value={value}
                    height="300px"
                    theme="dark"
                    extensions={[jsonExtension]}
                    onChange={(val) => setValue(val)}
                    className={css({ fontSize: 'sm' })}
                  />
                )}
              </CardContent>
            </Card>

            <Button onClick={handleGenerateTypeScript} className={css({ w: 'full', gap: '2' })}>
              <ArrowLeftRight className={css({ h: '5', w: '5' })} />
              Generate TypeScript Interface
            </Button>

            {tsInterface && (
              <Card
                className={css({
                  border: '2px solid',
                  borderColor: 'blue.500/30',
                  bg: 'rgba(59, 130, 246, 0.05)',
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
                    <CardTitle>TypeScript Interface</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyTypeScript}
                      className={css({ gap: '2' })}
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre
                    className={css({
                      p: '4',
                      rounded: 'lg',
                      bg: 'gray.900/50',
                      fontSize: 'sm',
                      color: 'gray.300',
                      overflowX: 'auto',
                      fontFamily: 'mono',
                    })}
                  >
                    {tsInterface}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons - Always visible */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: '0 20px 25px rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'auto' },
              gap: '2',
              sm: { display: 'flex', flexWrap: 'wrap' },
            })}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBeautify}
                  className={css({
                    position: 'relative',
                    overflow: 'hidden',
                    bgGradient: 'to-r',
                    gradientFrom: 'purple.600',
                    gradientVia: 'pink.600',
                    gradientTo: 'blue.600',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'white',
                    shadow: '2xl',
                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.5)',
                    transition: 'all 0.3s',
                    _hover: {
                      transform: 'scale(1.05)',
                      gradientFrom: 'purple.700',
                      gradientVia: 'pink.700',
                      gradientTo: 'blue.700',
                      boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.6)',
                    },
                  })}
                >
                  <Sparkles
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Beautify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>
                  Format JSON with indentation (Ctrl+B)
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={handleMinify}
                  className={css({
                    border: '2px solid',
                    borderColor: 'blue.500/50',
                    bgGradient: 'to-r',
                    gradientFrom: 'blue.500/20',
                    gradientTo: 'cyan.500/20',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'blue.100',
                    _hover: {
                      transform: 'scale(1.05)',
                      borderColor: 'blue.500/70',
                      gradientFrom: 'blue.500/30',
                      gradientTo: 'cyan.500/30',
                      color: 'white',
                    },
                  })}
                >
                  <Minimize2
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Minify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>
                  Compress JSON to single line (Ctrl+M)
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className={css({
                    border: '2px solid',
                    borderColor: 'purple.500/50',
                    bg: 'purple.500/10',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'purple.100',
                    _hover: {
                      transform: 'scale(1.05)',
                      borderColor: 'purple.500/70',
                      bg: 'purple.500/20',
                      color: 'white',
                    },
                  })}
                >
                  <Copy
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>Copy to clipboard (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!stats.isValid}
                  className={css({
                    border: '2px solid',
                    borderColor: 'pink.500/50',
                    bg: 'pink.500/10',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'pink.100',
                    _hover: {
                      transform: 'scale(1.05)',
                      borderColor: 'pink.500/70',
                      bg: 'pink.500/20',
                      color: 'white',
                    },
                    _disabled: {
                      opacity: 0.5,
                    },
                  })}
                >
                  <Download
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>Download as .json file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <SocialShare
          toolName="JSON Beautifier"
          toolUrl="/tools/json-beautify"
          description="Format and validate JSON with this free online JSON beautifier - minify, compare, and convert JSON to TypeScript"
          hashtags={['JSON', 'WebDev', 'Developer', 'Productivity']}
        />

        <FAQAccordion faqs={faqs} />
        <RelatedTools currentToolPath="/tools/json-beautify" category="data" />
        <ToolRating toolId="/tools/json-beautify" toolName="JSON Beautifier" />
      </main>
    </TooltipProvider>
  )
}

export default function JSONBeautifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JSONBeautifyContent />
    </Suspense>
  )
}
