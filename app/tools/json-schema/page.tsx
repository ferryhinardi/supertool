'use client'

import { json } from '@codemirror/lang-json'
import CodeMirror from '@uiw/react-codemirror'
import { CheckCircle, Code, Copy, Download, Sparkles, XCircle } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Suspense, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTrackToolView } from '@/hooks/useRecentTools'
import { trackToolEvent } from '@/lib/analytics'
import { tools } from '@/lib/tools'
import { css } from '@/styled-system/css'
import { formatSchema, generateSchema, type JSONSchema, validateSchema } from './utils'

export const dynamic = 'force-dynamic'

function JSONSchemaContent() {
  // Find tool data for tracking
  const toolData = tools.find((t) => t.href === '/tools/json-schema')

  // Track tool view
  useTrackToolView({
    toolId: toolData?.href || '/tools/json-schema',
    title: toolData?.title || 'JSON Schema Generator',
    href: toolData?.href || '/tools/json-schema',
    iconName: 'Code',
    gradient: toolData?.gradient || 'from-purple-500 to-indigo-500',
  })

  const [inputJson, setInputJson] = useQueryState('input', {
    defaultValue: JSON.stringify(
      {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        tags: ['developer', 'designer'],
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          zipCode: '94101',
        },
      },
      null,
      2
    ),
  })

  const [schemaTitle, setSchemaTitle] = useState('')
  const [schemaDescription, setSchemaDescription] = useState('')
  const [detectRequired, setDetectRequired] = useState(true)
  const [detectFormats, setDetectFormats] = useState(true)

  // Validate input JSON and generate schema
  const result = useMemo(() => {
    try {
      const schema = generateSchema(inputJson, {
        includeSchema: true,
        title: schemaTitle || undefined,
        description: schemaDescription || undefined,
        detectRequired,
        detectFormats,
      })

      const validation = validateSchema(schema)

      return {
        schema,
        schemaString: formatSchema(schema),
        isValid: true,
        validation,
        error: undefined,
      }
    } catch (error) {
      return {
        schema: null,
        schemaString: '',
        isValid: false,
        validation: { valid: false, error: 'Invalid JSON input' },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }, [inputJson, schemaTitle, schemaDescription, detectRequired, detectFormats])

  // Calculate stats
  const stats = useMemo(() => {
    if (!result.schema) {
      return { properties: 0, depth: 0, required: 0 }
    }

    const countProperties = (schema: JSONSchema): number => {
      let count = 0
      if (schema.properties) {
        count += Object.keys(schema.properties).length
        for (const prop of Object.values(schema.properties)) {
          count += countProperties(prop)
        }
      }
      if (schema.items) {
        count += countProperties(schema.items)
      }
      return count
    }

    const getDepth = (schema: JSONSchema): number => {
      if (!schema || typeof schema !== 'object') return 0
      let depth = 0
      if (schema.properties) {
        depth = Math.max(
          depth,
          1 + Math.max(0, ...Object.values(schema.properties).map((p) => getDepth(p)))
        )
      }
      if (schema.items) {
        depth = Math.max(depth, 1 + getDepth(schema.items))
      }
      return depth
    }

    return {
      properties: countProperties(result.schema),
      depth: getDepth(result.schema),
      required: result.schema.required?.length || 0,
    }
  }, [result.schema])

  const handleGenerate = () => {
    if (result.isValid) {
      toast.success('Schema generated successfully')
      trackToolEvent('json_schema_generate', {
        success: true,
        properties: stats.properties,
        depth: stats.depth,
      })
    } else {
      toast.error(result.error || 'Invalid JSON input')
      trackToolEvent('json_schema_generate', {
        success: false,
        error_type: 'parse_error',
      })
    }
  }

  const handleCopy = async () => {
    if (!result.schemaString) {
      toast.error('No schema to copy')
      return
    }

    await navigator.clipboard.writeText(result.schemaString)
    toast.success('Schema copied to clipboard')
    trackToolEvent('json_schema_copy', {
      schema_size: result.schemaString.length,
    })
  }

  const handleDownload = () => {
    if (!result.schemaString) {
      toast.error('No schema to download')
      return
    }

    const blob = new Blob([result.schemaString], { type: 'application/schema+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schema-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Schema downloaded')
    trackToolEvent('json_schema_download', {
      file_size_kb: Math.round(blob.size / 1024),
    })
  }

  return (
    <TooltipProvider>
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
        <div className={css({ textAlign: 'center', spaceY: '4' })}>
          <div
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3',
              rounded: 'full',
              border: '1px solid',
              borderColor: 'purple.500/30',
              bg: 'purple.500/10',
              px: '5',
              py: '2',
              backdropFilter: 'blur(8px)',
            })}
          >
            <Code className={css({ h: '5', w: '5', color: 'purple.400' })} />
            <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
              Auto Generate • Type Inference • Validation
            </span>
          </div>

          <h1
            className={css({
              fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
              fontWeight: 'extrabold',
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientVia: 'pink.400',
              gradientTo: 'indigo.400',
              bgClip: 'text',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            JSON Schema Generator
          </h1>

          <p
            className={css({
              mx: 'auto',
              maxW: '3xl',
              fontSize: { base: 'lg', sm: 'xl' },
              color: 'gray.400',
            })}
          >
            Automatically generate JSON Schema from sample JSON data with type inference, format
            detection, and validation
          </p>
        </div>

        {/* Stats Bar */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '4' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '3',
              })}
            >
              <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                <Badge
                  className={css({
                    bg: 'purple.500/20',
                    color: 'purple.300',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                  })}
                >
                  {stats.properties} Properties
                </Badge>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                  })}
                >
                  Depth: {stats.depth}
                </Badge>
                <Badge
                  className={css({
                    bg: 'cyan.500/20',
                    color: 'cyan.300',
                    border: '1px solid',
                    borderColor: 'cyan.500/30',
                  })}
                >
                  {stats.required} Required
                </Badge>
              </div>

              <Badge
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  bg: result.isValid ? 'green.500/20' : 'red.500/20',
                  color: result.isValid ? 'green.300' : 'red.300',
                  border: '1px solid',
                  borderColor: result.isValid ? 'green.500/30' : 'red.500/30',
                })}
              >
                {result.isValid ? (
                  <>
                    <CheckCircle className={css({ h: '4', w: '4' })} />
                    Valid JSON
                  </>
                ) : (
                  <>
                    <XCircle className={css({ h: '4', w: '4' })} />
                    Invalid JSON
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Schema Options</CardTitle>
            <CardDescription>Customize schema generation settings</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '4',
              })}
            >
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="schema-title"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Schema Title (Optional)
                </label>
                <input
                  id="schema-title"
                  type="text"
                  value={schemaTitle}
                  onChange={(e) => setSchemaTitle(e.target.value)}
                  placeholder="My Schema"
                  className={css({
                    w: 'full',
                    h: '10',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    color: 'gray.200',
                    fontSize: 'sm',
                    transition: 'all 0.2s',
                    _focus: {
                      outline: 'none',
                      borderColor: 'purple.500',
                      ring: '2px',
                      ringColor: 'purple.500/20',
                    },
                  })}
                />
              </div>

              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="schema-description"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Schema Description (Optional)
                </label>
                <input
                  id="schema-description"
                  type="text"
                  value={schemaDescription}
                  onChange={(e) => setSchemaDescription(e.target.value)}
                  placeholder="Schema description"
                  className={css({
                    w: 'full',
                    h: '10',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    color: 'gray.200',
                    fontSize: 'sm',
                    transition: 'all 0.2s',
                    _focus: {
                      outline: 'none',
                      borderColor: 'purple.500',
                      ring: '2px',
                      ringColor: 'purple.500/20',
                    },
                  })}
                />
              </div>
            </div>

            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4',
              })}
            >
              <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <input
                  type="checkbox"
                  checked={detectRequired}
                  onChange={(e) => setDetectRequired(e.target.checked)}
                  className={css({
                    h: '4',
                    w: '4',
                    rounded: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.600',
                    bg: 'gray.800',
                    cursor: 'pointer',
                  })}
                />
                <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                  Detect Required Fields
                </span>
              </label>

              <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <input
                  type="checkbox"
                  checked={detectFormats}
                  onChange={(e) => setDetectFormats(e.target.checked)}
                  className={css({
                    h: '4',
                    w: '4',
                    rounded: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.600',
                    bg: 'gray.800',
                    cursor: 'pointer',
                  })}
                />
                <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                  Detect String Formats
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Input/Output Editors */}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
            gap: { base: '6', sm: '8' },
            w: 'full',
          })}
        >
          {/* Input JSON */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Input JSON</CardTitle>
              <CardDescription>Paste your sample JSON data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ rounded: 'lg', overflow: 'hidden' })}>
                <CodeMirror
                  value={inputJson}
                  height="400px"
                  theme="dark"
                  extensions={[json()]}
                  onChange={(val) => setInputJson(val)}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generated Schema */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'indigo.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Generated Schema</CardTitle>
              <CardDescription>JSON Schema Draft 2020-12</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ rounded: 'lg', overflow: 'hidden' })}>
                <CodeMirror
                  value={result.schemaString}
                  height="400px"
                  theme="dark"
                  extensions={[json()]}
                  readOnly
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '4' })}>
            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: '3',
              })}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleGenerate}
                    className={css({
                      gap: '2',
                      bg: 'purple.600',
                      color: 'white',
                      _hover: { bg: 'purple.700' },
                    })}
                  >
                    <Sparkles className={css({ h: '4', w: '4' })} />
                    Generate Schema
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate JSON Schema from input</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopy}
                    disabled={!result.isValid}
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.300',
                      _hover: { bg: 'gray.700' },
                      _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                    })}
                  >
                    <Copy className={css({ h: '4', w: '4' })} />
                    Copy Schema
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy schema to clipboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDownload}
                    disabled={!result.isValid}
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.300',
                      _hover: { bg: 'gray.700' },
                      _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                    })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
                    Download
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download as .json file</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Features
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Automatic type inference from sample JSON data</li>
                  <li>• Detects string formats (email, URI, date-time, UUID)</li>
                  <li>• Identifies required fields based on non-null values</li>
                  <li>• Supports nested objects and arrays</li>
                  <li>• Generates JSON Schema Draft 2020-12 compatible output</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </TooltipProvider>
  )
}

export default function JSONSchemaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JSONSchemaContent />
    </Suspense>
  )
}
