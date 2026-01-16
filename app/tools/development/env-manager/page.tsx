'use client'

import {
  AlertTriangle,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Key,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { css } from '@/styled-system/css'

interface EnvVariable {
  id: string
  key: string
  value: string
  isSecret: boolean
  group: string
}

type ExportFormat = 'env' | 'json' | 'yaml' | 'shell' | 'example'

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /api_key/i,
  /apikey/i,
  /auth/i,
  /credential/i,
  /private/i,
  /access/i,
  /bearer/i,
  /jwt/i,
]

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))
}

function getGroupFromKey(key: string): string {
  const parts = key.split('_')
  if (parts.length >= 2) {
    return parts[0].toUpperCase()
  }
  return 'GENERAL'
}

function validateEnvKey(key: string): { valid: boolean; error?: string } {
  if (!key) return { valid: false, error: 'Key is required' }
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
    return {
      valid: false,
      error: 'Key must start with uppercase letter and contain only A-Z, 0-9, _',
    }
  }
  return { valid: true }
}

function parseEnvContent(content: string): EnvVariable[] {
  const lines = content.split('\n')
  const variables: EnvVariable[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex === -1) continue

    const key = trimmed.slice(0, equalIndex).trim()
    let value = trimmed.slice(equalIndex + 1).trim()

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key) {
      variables.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        key,
        value,
        isSecret: isSensitiveKey(key),
        group: getGroupFromKey(key),
      })
    }
  }

  return variables
}

function exportToFormat(variables: EnvVariable[], format: ExportFormat): string {
  switch (format) {
    case 'env':
      return variables.map((v) => `${v.key}=${v.value}`).join('\n')

    case 'json': {
      const jsonObj = variables.reduce(
        (acc, v) => {
          acc[v.key] = v.value
          return acc
        },
        {} as Record<string, string>
      )
      return JSON.stringify(jsonObj, null, 2)
    }

    case 'yaml':
      return variables.map((v) => `${v.key}: "${v.value.replace(/"/g, '\\"')}"`).join('\n')

    case 'shell':
      return variables.map((v) => `export ${v.key}="${v.value.replace(/"/g, '\\"')}"`).join('\n')

    case 'example':
      return variables
        .map((v) => {
          const placeholder = v.isSecret ? 'your_secret_here' : 'your_value_here'
          return `${v.key}=${placeholder}`
        })
        .join('\n')

    default:
      return ''
  }
}

const examples = [
  {
    name: 'Node.js App',
    content: `NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=sk-1234567890
JWT_SECRET=mysupersecret
REDIS_URL=redis://localhost:6379`,
  },
  {
    name: 'Next.js App',
    content: `NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=UA-12345
DATABASE_URL=postgres://user:pass@host:5432/db
NEXTAUTH_SECRET=random-secret-string
NEXTAUTH_URL=http://localhost:3000`,
  },
  {
    name: 'AWS Services',
    content: `AWS_ACCESS_KEY_ID=AKIA1234567890
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG
AWS_REGION=us-east-1
S3_BUCKET=my-bucket-name
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/queue`,
  },
]

const faqs = [
  {
    question: 'What is an environment variable manager?',
    answer:
      'An environment variable manager helps you parse, edit, validate, and convert .env files. It detects sensitive values, groups variables by prefix, and exports to multiple formats including .env, JSON, YAML, and shell scripts.',
  },
  {
    question: 'How are sensitive variables detected?',
    answer:
      'Variables are automatically flagged as sensitive if their key contains patterns like PASSWORD, SECRET, KEY, TOKEN, API_KEY, AUTH, CREDENTIAL, PRIVATE, ACCESS, BEARER, or JWT. These are masked by default for security.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'You can export to: .env (standard format), JSON (for programmatic use), YAML (for Docker/K8s configs), Shell (with export statements), and .env.example (with placeholder values for documentation).',
  },
  {
    question: 'What are the naming conventions for env variables?',
    answer:
      'Environment variable keys should: start with an uppercase letter, contain only uppercase letters (A-Z), numbers (0-9), and underscores (_). Use prefixes to group related variables (e.g., DATABASE_, AWS_, NEXT_PUBLIC_).',
  },
  {
    question: 'Is my data stored or sent anywhere?',
    answer:
      'No! All processing happens entirely in your browser. Your environment variables never leave your device. This tool is completely client-side for maximum security.',
  },
]

export default function EnvManager() {
  useTrackToolView({
    toolId: 'env-manager',
    title: 'Environment Variable Manager',
    href: '/tools/development/env-manager',
    iconName: 'Key',
    gradient: 'from-emerald-500 to-teal-500',
  })

  const [rawInput, setRawInput] = useState('')
  const [variables, setVariables] = useState<EnvVariable[]>([])
  const [showSecrets, setShowSecrets] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('env')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  // Parse input and update variables
  const handleParse = useCallback(() => {
    if (!rawInput.trim()) {
      toast.error('Please enter some environment variables')
      return
    }
    const parsed = parseEnvContent(rawInput)
    if (parsed.length === 0) {
      toast.error('No valid environment variables found')
      return
    }
    setVariables(parsed)
    toast.success(`Parsed ${parsed.length} variables`)
  }, [rawInput])

  // Add new variable
  const handleAddVariable = useCallback(() => {
    const validation = validateEnvKey(newKey)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }
    if (variables.some((v) => v.key === newKey)) {
      toast.error('Variable with this key already exists')
      return
    }

    const newVar: EnvVariable = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      key: newKey,
      value: newValue,
      isSecret: isSensitiveKey(newKey),
      group: getGroupFromKey(newKey),
    }

    setVariables([...variables, newVar])
    setNewKey('')
    setNewValue('')
    toast.success('Variable added')
  }, [newKey, newValue, variables])

  // Delete variable
  const handleDeleteVariable = useCallback(
    (id: string) => {
      setVariables(variables.filter((v) => v.id !== id))
      toast.success('Variable deleted')
    },
    [variables]
  )

  // Update variable
  const handleUpdateVariable = useCallback(
    (id: string, field: 'key' | 'value', value: string) => {
      setVariables(
        variables.map((v) => {
          if (v.id === id) {
            const updated = { ...v, [field]: value }
            if (field === 'key') {
              updated.isSecret = isSensitiveKey(value)
              updated.group = getGroupFromKey(value)
            }
            return updated
          }
          return v
        })
      )
    },
    [variables]
  )

  // Export output
  const exportOutput = useMemo(() => {
    return exportToFormat(variables, exportFormat)
  }, [variables, exportFormat])

  // Group variables
  const groupedVariables = useMemo(() => {
    const groups: Record<string, EnvVariable[]> = {}
    for (const v of variables) {
      if (!groups[v.group]) {
        groups[v.group] = []
      }
      groups[v.group].push(v)
    }
    return groups
  }, [variables])

  // Stats
  const stats = useMemo(() => {
    const total = variables.length
    const secrets = variables.filter((v) => v.isSecret).length
    const groups = Object.keys(groupedVariables).length
    return { total, secrets, groups }
  }, [variables, groupedVariables])

  const handleCopy = () => {
    if (!exportOutput) {
      toast.error('No variables to copy')
      return
    }
    navigator.clipboard.writeText(exportOutput)
    toast.success('Copied to clipboard!')
  }

  const handleClear = () => {
    setRawInput('')
    setVariables([])
    toast.info('Cleared all data')
  }

  const handleLoadExample = (content: string) => {
    setRawInput(content)
    const parsed = parseEnvContent(content)
    setVariables(parsed)
    toast.success(`Loaded example with ${parsed.length} variables`)
  }

  const handleDownload = () => {
    if (!exportOutput) {
      toast.error('No variables to download')
      return
    }
    const extensions: Record<ExportFormat, string> = {
      env: '.env',
      json: '.json',
      yaml: '.yaml',
      shell: '.sh',
      example: '.env.example',
    }
    const blob = new Blob([exportOutput], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `environment${extensions[exportFormat]}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded')
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
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
            borderColor: 'emerald.500/30',
            bg: 'emerald.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Key className={css({ h: '5', w: '5', color: 'emerald.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'emerald.300',
            })}
          >
            Environment Variables
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'emerald.400',
            gradientVia: 'teal.400',
            gradientTo: 'cyan.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Environment Variable Manager
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Parse, edit, validate, and convert .env files. Detect sensitive values, group by prefix,
          and export to multiple formats.
        </p>
      </div>

      {/* Main Tool Area */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: '6',
          w: 'full',
        })}
      >
        {/* Input Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Upload className={css({ h: '5', w: '5', color: 'emerald.400' })} />
              <span>Input .env Content</span>
            </CardTitle>
            <CardDescription>Paste your .env file content to parse and manage</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              placeholder={`DATABASE_URL=postgres://localhost:5432/mydb
API_KEY=sk-1234567890
NODE_ENV=development`}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className={css({
                minH: '200px',
                fontFamily: 'mono',
                fontSize: 'sm',
                resize: 'vertical',
              })}
            />
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              <Button onClick={handleParse} className={css({ gap: '2', minH: '11' })}>
                <FileText className={css({ h: '4', w: '4' })} />
                Parse Variables
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className={css({ gap: '2', minH: '11' })}
              >
                <RotateCcw className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Download className={css({ h: '5', w: '5', color: 'teal.400' })} />
              <span>Export Output</span>
              {stats.total > 0 && (
                <div className={css({ display: 'flex', gap: '2', ml: 'auto' })}>
                  <Badge
                    variant="default"
                    className={css({ bg: 'emerald.500/20', color: 'emerald.400' })}
                  >
                    {stats.total} vars
                  </Badge>
                  {stats.secrets > 0 && (
                    <Badge
                      variant="outline"
                      className={css({ borderColor: 'orange.500/50', color: 'orange.400' })}
                    >
                      {stats.secrets} secrets
                    </Badge>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription>Choose format and export your variables</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Format Selection */}
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              {(['env', 'json', 'yaml', 'shell', 'example'] as ExportFormat[]).map((format) => (
                <Button
                  key={format}
                  variant={exportFormat === format ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat(format)}
                  className={css({ minH: '9' })}
                >
                  {format === 'example' ? '.env.example' : `.${format}`}
                </Button>
              ))}
            </div>

            {/* Output Preview */}
            <div
              className={css({
                p: '4',
                rounded: 'lg',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700/50',
                minH: '150px',
                maxH: '300px',
                overflow: 'auto',
              })}
            >
              {exportOutput ? (
                <pre
                  className={css({
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'teal.300',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  })}
                >
                  {exportOutput}
                </pre>
              ) : (
                <span className={css({ color: 'gray.500', fontSize: 'sm' })}>
                  Parse some variables to see the export output...
                </span>
              )}
            </div>

            <div className={css({ display: 'flex', gap: '2' })}>
              <Button
                onClick={handleCopy}
                disabled={!exportOutput}
                className={css({ gap: '2', flex: '1', minH: '11' })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!exportOutput}
                variant="outline"
                className={css({ gap: '2', flex: '1', minH: '11' })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variables Editor */}
      {variables.length > 0 && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
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
              <div>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Key className={css({ h: '5', w: '5', color: 'cyan.400' })} />
                  Variables Editor
                </CardTitle>
                <CardDescription>
                  {stats.groups} groups, {stats.secrets} sensitive values detected
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
                className={css({ gap: '2' })}
              >
                {showSecrets ? (
                  <EyeOff className={css({ h: '4', w: '4' })} />
                ) : (
                  <Eye className={css({ h: '4', w: '4' })} />
                )}
                {showSecrets ? 'Hide' : 'Show'} Secrets
              </Button>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Add New Variable */}
            <div
              className={css({
                display: 'flex',
                gap: '3',
                p: '4',
                rounded: 'lg',
                bg: 'gray.800/30',
                border: '1px solid',
                borderColor: 'gray.700/50',
                flexWrap: { base: 'wrap', md: 'nowrap' },
              })}
            >
              <Input
                placeholder="VARIABLE_NAME"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className={css({ flex: '1', minW: '150px', fontFamily: 'mono' })}
              />
              <Input
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className={css({ flex: '2', minW: '200px', fontFamily: 'mono' })}
              />
              <Button onClick={handleAddVariable} className={css({ gap: '2', minH: '10' })}>
                <Plus className={css({ h: '4', w: '4' })} />
                Add
              </Button>
            </div>

            {/* Grouped Variables */}
            {Object.entries(groupedVariables).map(([group, vars]) => (
              <div key={group} className={css({ spaceY: '3' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Badge variant="outline" className={css({ fontSize: 'xs' })}>
                    {group}
                  </Badge>
                  <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                    {vars.length} variable{vars.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={css({ spaceY: '2' })}>
                  {vars.map((variable) => (
                    <div
                      key={variable.id}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        bg: variable.isSecret ? 'orange.500/10' : 'gray.800/30',
                        border: '1px solid',
                        borderColor: variable.isSecret ? 'orange.500/20' : 'gray.700/50',
                        flexWrap: { base: 'wrap', md: 'nowrap' },
                      })}
                    >
                      {variable.isSecret && (
                        <AlertTriangle
                          className={css({ h: '4', w: '4', color: 'orange.400', flexShrink: '0' })}
                        />
                      )}
                      <Input
                        value={variable.key}
                        onChange={(e) =>
                          handleUpdateVariable(variable.id, 'key', e.target.value.toUpperCase())
                        }
                        className={css({
                          flex: '1',
                          minW: '120px',
                          fontFamily: 'mono',
                          fontSize: 'sm',
                        })}
                      />
                      <span className={css({ color: 'gray.500' })}>=</span>
                      <Input
                        type={variable.isSecret && !showSecrets ? 'password' : 'text'}
                        value={variable.value}
                        onChange={(e) => handleUpdateVariable(variable.id, 'value', e.target.value)}
                        className={css({
                          flex: '2',
                          minW: '150px',
                          fontFamily: 'mono',
                          fontSize: 'sm',
                        })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVariable(variable.id)}
                        className={css({
                          flexShrink: '0',
                          color: 'red.400',
                          _hover: { bg: 'red.500/10' },
                        })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Examples */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'blue.500/20',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Sparkles className={css({ h: '5', w: '5', color: 'blue.400' })} />
            Example Configurations
          </CardTitle>
          <CardDescription>Click an example to load it</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: '4',
              w: 'full',
            })}
          >
            {examples.map((example) => (
              <button
                type="button"
                key={example.name}
                onClick={() => handleLoadExample(example.content)}
                className={css({
                  p: '4',
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700/50',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  _hover: {
                    borderColor: 'emerald.500/50',
                    bg: 'gray.800/80',
                  },
                })}
              >
                <div className={css({ fontWeight: 'medium', color: 'white', mb: '2' })}>
                  {example.name}
                </div>
                <pre
                  className={css({
                    fontSize: 'xs',
                    fontFamily: 'mono',
                    color: 'gray.400',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxH: '80px',
                  })}
                >
                  {example.content}
                </pre>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <FAQAccordion faqs={faqs} />

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/development/env-manager" category="development" />

      {/* Rating */}
      <ToolRating toolId="env-manager" toolName="Environment Variable Manager" />

      {/* Search */}
      <ToolSearch />
    </main>
  )
}
