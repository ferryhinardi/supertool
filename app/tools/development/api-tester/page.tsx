'use client'

import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github-dark.css'
import {
  BookmarkPlus,
  Copy,
  Download,
  Eye,
  EyeOff,
  Globe,
  History,
  Info,
  Loader2,
  Play,
  Plus,
  Save,
  Settings,
  Terminal,
  Trash2,
  X,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Register JSON language for syntax highlighting
hljs.registerLanguage('json', json)

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const
type HttpMethod = (typeof HTTP_METHODS)[number]

const AUTH_TYPES = ['none', 'bearer', 'basic', 'api-key'] as const
type AuthType = (typeof AUTH_TYPES)[number]

const BODY_TYPES = ['none', 'json', 'text', 'form-data'] as const
type BodyType = (typeof BODY_TYPES)[number]

interface Header {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface QueryParam {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface FormDataItem {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface RequestConfig {
  method: HttpMethod
  url: string
  queryParams: QueryParam[]
  headers: Header[]
  authType: AuthType
  authToken: string
  authUsername: string
  authPassword: string
  authApiKey: string
  bodyType: BodyType
  bodyJson: string
  bodyText: string
  formData: FormDataItem[]
}

interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
}

interface SavedPreset extends RequestConfig {
  id: string
  name: string
  createdAt: number
}

interface HistoryItem extends RequestConfig {
  id: string
  timestamp: number
  response?: ResponseData
}

interface EnvVariable {
  id: string
  key: string
  value: string
  enabled: boolean
  secret: boolean
}

interface Environment {
  id: string
  name: string
  variables: EnvVariable[]
  createdAt: number
}

function ApiTesterContent() {
  // Request Configuration
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('')
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: nanoid(), key: '', value: '', enabled: true },
  ])
  const [headers, setHeaders] = useState<Header[]>([
    { id: nanoid(), key: '', value: '', enabled: true },
  ])
  const [authType, setAuthType] = useState<AuthType>('none')
  const [authToken, setAuthToken] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authApiKey, setAuthApiKey] = useState('')
  const [bodyType, setBodyType] = useState<BodyType>('none')
  const [bodyJson, setBodyJson] = useState('{\n  \n}')
  const [bodyText, setBodyText] = useState('')
  const [formData, setFormData] = useState<FormDataItem[]>([
    { id: nanoid(), key: '', value: '', enabled: true },
  ])

  // Response State
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Presets & History
  const [presets, setPresets] = useState<SavedPreset[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('apiTesterPresets')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  })

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('apiTesterHistory')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  })

  const [showPresets, setShowPresets] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeRequestTab, setActiveRequestTab] = useState<'params' | 'auth' | 'headers' | 'body'>(
    'params'
  )

  // Environments
  const [environments, setEnvironments] = useState<Environment[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('apiTesterEnvironments')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  })

  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('apiTesterActiveEnvironment')
  })

  const [showEnvironments, setShowEnvironments] = useState(false)
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null)

  // Save presets, history, and environments
  useEffect(() => {
    if (typeof window !== 'undefined' && presets.length > 0) {
      localStorage.setItem('apiTesterPresets', JSON.stringify(presets))
    }
  }, [presets])

  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 0) {
      localStorage.setItem('apiTesterHistory', JSON.stringify(history.slice(0, 50))) // Keep last 50
    }
  }, [history])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiTesterEnvironments', JSON.stringify(environments))
    }
  }, [environments])

  useEffect(() => {
    if (typeof window !== 'undefined' && activeEnvironmentId) {
      localStorage.setItem('apiTesterActiveEnvironment', activeEnvironmentId)
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('apiTesterActiveEnvironment')
    }
  }, [activeEnvironmentId])

  // Track page visit
  useEffect(() => {
    trackToolEvent('api_tester_open', {})
  }, [])

  // Keyboard shortcuts
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleSendRequest is stable and doesn't need to be in deps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Enter to send request
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (url.trim() && !loading) {
          trackToolEvent('api_tester_keyboard_shortcut_used', { shortcut: 'cmd_enter' })
          handleSendRequest()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [url, loading])

  const getCurrentConfig = (): RequestConfig => ({
    method,
    url,
    queryParams,
    headers,
    authType,
    authToken,
    authUsername,
    authPassword,
    authApiKey,
    bodyType,
    bodyJson,
    bodyText,
    formData,
  })

  const loadConfig = (config: RequestConfig) => {
    setMethod(config.method)
    setUrl(config.url)
    setQueryParams(config.queryParams)
    setHeaders(config.headers)
    setAuthType(config.authType)
    setAuthToken(config.authToken)
    setAuthUsername(config.authUsername)
    setAuthPassword(config.authPassword)
    setAuthApiKey(config.authApiKey || '')
    setBodyType(config.bodyType)
    setBodyJson(config.bodyJson)
    setBodyText(config.bodyText)
    setFormData(config.formData)
  }

  // Get active environment
  const activeEnvironment = useMemo(() => {
    return environments.find((env) => env.id === activeEnvironmentId) || null
  }, [environments, activeEnvironmentId])

  // Variable substitution function
  const substituteVariables = (text: string): string => {
    if (!activeEnvironment) return text

    let result = text
    activeEnvironment.variables
      .filter((v) => v.enabled && v.key.trim())
      .forEach((v) => {
        const regex = new RegExp(`{{\\s*${v.key.trim()}\\s*}}`, 'g')
        result = result.replace(regex, v.value)
      })

    return result
  }

  // Environment management functions
  const createEnvironment = (name: string) => {
    const newEnv: Environment = {
      id: nanoid(),
      name,
      variables: [{ id: nanoid(), key: '', value: '', enabled: true, secret: false }],
      createdAt: Date.now(),
    }
    setEnvironments([...environments, newEnv])
    setActiveEnvironmentId(newEnv.id)
    trackToolEvent('api_tester_environment_created', { environmentName: name })
    toast.success(`Environment "${name}" created`)
  }

  const updateEnvironment = (id: string, updates: Partial<Environment>) => {
    setEnvironments(environments.map((env) => (env.id === id ? { ...env, ...updates } : env)))
    trackToolEvent('api_tester_environment_updated', { environmentId: id })
  }

  const deleteEnvironment = (id: string) => {
    const env = environments.find((e) => e.id === id)
    setEnvironments(environments.filter((e) => e.id !== id))
    if (activeEnvironmentId === id) {
      setActiveEnvironmentId(null)
    }
    trackToolEvent('api_tester_environment_deleted', { environmentName: env?.name || '' })
    toast.success('Environment deleted')
  }

  const duplicateEnvironment = (id: string) => {
    const env = environments.find((e) => e.id === id)
    if (env) {
      const newEnv: Environment = {
        ...env,
        id: nanoid(),
        name: `${env.name} (Copy)`,
        variables: env.variables.map((v) => ({ ...v, id: nanoid() })),
        createdAt: Date.now(),
      }
      setEnvironments([...environments, newEnv])
      trackToolEvent('api_tester_environment_duplicated', { environmentName: env.name })
      toast.success(`Environment duplicated: ${newEnv.name}`)
    }
  }

  const handleSendRequest = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    const startTime = performance.now()

    try {
      // Build headers with variable substitution
      const requestHeaders: HeadersInit = {}

      // Add custom headers
      headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          requestHeaders[substituteVariables(h.key.trim())] = substituteVariables(h.value.trim())
        })

      // Add auth headers with variable substitution
      if (authType === 'bearer' && authToken.trim()) {
        requestHeaders.Authorization = `Bearer ${substituteVariables(authToken.trim())}`
      } else if (authType === 'basic' && authUsername.trim()) {
        const username = substituteVariables(authUsername.trim())
        const password = substituteVariables(authPassword.trim())
        const encoded = btoa(`${username}:${password}`)
        requestHeaders.Authorization = `Basic ${encoded}`
      } else if (authType === 'api-key' && authApiKey.trim()) {
        requestHeaders['X-API-Key'] = substituteVariables(authApiKey.trim())
      }

      // Build body with variable substitution
      let requestBody: BodyInit | undefined

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'json' && bodyJson.trim()) {
          try {
            const substitutedJson = substituteVariables(bodyJson)
            JSON.parse(substitutedJson) // Validate
            requestBody = substitutedJson
            requestHeaders['Content-Type'] = 'application/json'
          } catch {
            throw new Error('Invalid JSON in request body')
          }
        } else if (bodyType === 'text' && bodyText.trim()) {
          requestBody = substituteVariables(bodyText)
          requestHeaders['Content-Type'] = 'text/plain'
        } else if (bodyType === 'form-data') {
          const formDataObj = new FormData()
          formData
            .filter((f) => f.enabled && f.key.trim())
            .forEach((f) => {
              formDataObj.append(
                substituteVariables(f.key.trim()),
                substituteVariables(f.value.trim())
              )
            })
          requestBody = formDataObj
        }
      }

      // Build URL with query parameters and variable substitution
      let requestUrl = substituteVariables(url.trim())
      const enabledParams = queryParams.filter((p) => p.enabled && p.key.trim())
      if (enabledParams.length > 0) {
        const urlObj = new URL(requestUrl)
        enabledParams.forEach((p) => {
          urlObj.searchParams.append(
            substituteVariables(p.key.trim()),
            substituteVariables(p.value.trim())
          )
        })
        requestUrl = urlObj.toString()
      }

      // Make request
      const res = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: requestBody,
      })

      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      // Get response headers
      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // Get response body
      const contentType = res.headers.get('content-type') || ''
      let responseBody = ''

      if (contentType.includes('application/json')) {
        const json = await res.json()
        responseBody = JSON.stringify(json, null, 2)
      } else {
        responseBody = await res.text()
      }

      const responseSize = new Blob([responseBody]).size

      const responseData: ResponseData = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: responseTime,
        size: responseSize,
      }

      setResponse(responseData)

      // Add to history
      const historyItem: HistoryItem = {
        id: nanoid(),
        timestamp: Date.now(),
        ...getCurrentConfig(),
        response: responseData,
      }
      setHistory([historyItem, ...history])

      trackToolEvent('api_tester_send_request', {
        method,
        status: res.status,
        time: responseTime,
      })

      toast.success(`Request completed in ${responseTime}ms`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed'
      setError(errorMessage)
      toast.error(errorMessage)

      trackToolEvent('api_tester_send_request', {
        method,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreset = () => {
    const name = prompt('Enter preset name:')
    if (!name?.trim()) return

    const preset: SavedPreset = {
      id: nanoid(),
      name: name.trim(),
      createdAt: Date.now(),
      ...getCurrentConfig(),
    }

    setPresets([preset, ...presets])
    toast.success('Preset saved!')

    trackToolEvent('api_tester_save_preset', {})
  }

  const handleLoadPreset = (preset: SavedPreset) => {
    loadConfig(preset)
    setShowPresets(false)
    toast.success(`Loaded preset: ${preset.name}`)

    trackToolEvent('api_tester_load_preset', {})
  }

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id))
    toast.success('Preset deleted')

    trackToolEvent('api_tester_delete_preset', {})
  }

  const handleLoadHistory = (item: HistoryItem) => {
    loadConfig(item)
    if (item.response) {
      setResponse(item.response)
    }
    setShowHistory(false)
    toast.success('Loaded from history')
  }

  const handleClearHistory = () => {
    if (confirm('Clear all history?')) {
      setHistory([])
      localStorage.removeItem('apiTesterHistory')
      toast.success('History cleared')
    }
  }

  const handleCopyResponse = () => {
    if (!response) return
    navigator.clipboard.writeText(response.body)
    toast.success('Response copied to clipboard')

    trackToolEvent('api_tester_copy_response', {})
  }

  const handleDownloadResponse = () => {
    if (!response) return
    const blob = new Blob([response.body], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Response downloaded')
  }

  const addHeader = () => {
    setHeaders([...headers, { id: nanoid(), key: '', value: '', enabled: true }])
  }

  const updateHeader = (id: string, field: keyof Header, value: string | boolean) => {
    setHeaders(headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
  }

  const removeHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id))
  }

  const addQueryParam = () => {
    trackToolEvent('api_tester_add_query_param', {})
    setQueryParams([...queryParams, { id: nanoid(), key: '', value: '', enabled: true }])
  }

  const updateQueryParam = (id: string, field: keyof QueryParam, value: string | boolean) => {
    setQueryParams(queryParams.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter((q) => q.id !== id))
  }

  const addFormDataItem = () => {
    setFormData([...formData, { id: nanoid(), key: '', value: '', enabled: true }])
  }

  const updateFormDataItem = (id: string, field: keyof FormDataItem, value: string | boolean) => {
    setFormData(formData.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const removeFormDataItem = (id: string) => {
    setFormData(formData.filter((f) => f.id !== id))
  }

  const statusColor = useMemo(() => {
    if (!response) return 'gray'
    if (response.status >= 200 && response.status < 300) return 'green'
    if (response.status >= 300 && response.status < 400) return 'blue'
    if (response.status >= 400 && response.status < 500) return 'orange'
    return 'red'
  }, [response])

  const highlightedResponseBody = useMemo(() => {
    if (!response) return ''
    try {
      // Try to parse and highlight as JSON
      JSON.parse(response.body)
      return hljs.highlight(response.body, { language: 'json' }).value
    } catch {
      // If not JSON, return as is
      return response.body
    }
  }, [response])

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
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Terminal className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            REST API Testing Tool
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          API Request Tester
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Test REST APIs directly in your browser. Send requests with custom headers, body, and
          authentication. Save presets and track history.
        </p>
      </div>

      {/* Actions */}
      <div
        className={css({
          display: 'flex',
          gap: '3',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        <Button
          onClick={handleSavePreset}
          className={css({
            gap: '2',
            bg: 'gray.800',
            color: 'white',
            _hover: { bg: 'gray.700' },
          })}
        >
          <Save className={css({ h: '4', w: '4' })} />
          Save Preset
        </Button>
        <Button
          onClick={() => setShowPresets(!showPresets)}
          className={css({
            gap: '2',
            bg: 'gray.800',
            color: 'white',
            _hover: { bg: 'gray.700' },
          })}
        >
          <BookmarkPlus className={css({ h: '4', w: '4' })} />
          Presets ({presets.length})
        </Button>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          className={css({
            gap: '2',
            bg: 'gray.800',
            color: 'white',
            _hover: { bg: 'gray.700' },
          })}
        >
          <History className={css({ h: '4', w: '4' })} />
          History ({history.length})
        </Button>
        <Button
          onClick={() => setShowEnvironments(!showEnvironments)}
          className={css({
            gap: '2',
            bg: activeEnvironmentId ? 'green.900/40' : 'gray.800',
            color: activeEnvironmentId ? 'green.300' : 'gray.300',
            border: activeEnvironmentId ? '1px solid' : 'none',
            borderColor: activeEnvironmentId ? 'green.500/30' : 'transparent',
            _hover: { bg: activeEnvironmentId ? 'green.900/60' : 'gray.700' },
          })}
        >
          <Globe className={css({ h: '4', w: '4' })} />
          {activeEnvironment ? activeEnvironment.name : `Environments (${environments.length})`}
        </Button>
      </div>

      {/* Presets Panel */}
      {showPresets && (
        <div className={css({ animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <CardTitle>Saved Presets</CardTitle>
                <Button
                  onClick={() => setShowPresets(false)}
                  size="sm"
                  className={css({
                    bg: 'transparent',
                    color: 'white',
                    _hover: { bg: 'gray.800' },
                  })}
                >
                  <X className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {presets.length === 0 ? (
                <p className={css({ textAlign: 'center', color: 'white', py: '8' })}>
                  No presets saved yet
                </p>
              ) : (
                <div className={css({ display: 'grid', gap: '3' })}>
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        _hover: { bg: 'gray.800', borderColor: 'purple.500/50' },
                      })}
                    >
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        className={css({
                          flex: '1',
                          textAlign: 'left',
                          bg: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          p: '0',
                        })}
                      >
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                          <Badge
                            className={css({
                              bg: 'blue.500/20',
                              color: 'blue.300',
                              border: '1px solid',
                              borderColor: 'blue.500/30',
                            })}
                          >
                            {preset.method}
                          </Badge>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'white',
                            })}
                          >
                            {preset.name}
                          </span>
                          <span className={css({ fontSize: 'xs', color: 'white', truncate: true })}>
                            {preset.url}
                          </span>
                        </div>
                      </button>
                      <Button
                        onClick={() => handleDeletePreset(preset.id)}
                        size="sm"
                        className={css({
                          bg: 'transparent',
                          color: 'white',
                          _hover: { bg: 'red.500/20', color: 'red.400' },
                        })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className={css({ animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'cyan.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <CardTitle>Request History</CardTitle>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={handleClearHistory}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'transparent',
                      color: 'white',
                      _hover: { bg: 'red.500/20', color: 'red.400' },
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                    Clear
                  </Button>
                  <Button
                    onClick={() => setShowHistory(false)}
                    size="sm"
                    className={css({
                      bg: 'transparent',
                      color: 'white',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    <X className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className={css({ textAlign: 'center', color: 'white', py: '8' })}>
                  No requests yet
                </p>
              ) : (
                <div className={css({ display: 'grid', gap: '3', maxH: '96', overflowY: 'auto' })}>
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLoadHistory(item)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        textAlign: 'left',
                        cursor: 'pointer',
                        _hover: { bg: 'gray.800', borderColor: 'cyan.500/50' },
                        w: 'full',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          flex: '1',
                        })}
                      >
                        <Badge
                          className={css({
                            bg: 'blue.500/20',
                            color: 'blue.300',
                            border: '1px solid',
                            borderColor: 'blue.500/30',
                          })}
                        >
                          {item.method}
                        </Badge>
                        {item.response && (
                          <Badge
                            className={css({
                              bg: `${item.response.status >= 200 && item.response.status < 300 ? 'green' : 'red'}.500/20`,
                              color: `${item.response.status >= 200 && item.response.status < 300 ? 'green' : 'red'}.300`,
                              border: '1px solid',
                              borderColor: `${item.response.status >= 200 && item.response.status < 300 ? 'green' : 'red'}.500/30`,
                            })}
                          >
                            {item.response.status}
                          </Badge>
                        )}
                        <span className={css({ fontSize: 'sm', color: 'white', truncate: true })}>
                          {item.url}
                        </span>
                      </div>
                      <span className={css({ fontSize: 'xs', color: 'white' })}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Environments Panel */}
      {showEnvironments && (
        <div className={css({ animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 })}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <div>
                  <CardTitle>Environments</CardTitle>
                  <CardDescription>
                    Manage environment variables. Use {'{{'} variableName {'}}'} syntax in requests.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowEnvironments(false)}
                  size="sm"
                  className={css({
                    bg: 'transparent',
                    color: 'white',
                    _hover: { bg: 'gray.800' },
                  })}
                >
                  <X className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '4' })}>
                {/* Environment List */}
                <div className={css({ spaceY: '3' })}>
                  {environments.length === 0 ? (
                    <p className={css({ textAlign: 'center', color: 'white', py: '8' })}>
                      No environments yet. Create one to get started.
                    </p>
                  ) : (
                    <div className={css({ display: 'grid', gap: '3' })}>
                      {environments.map((env) => (
                        <div
                          key={env.id}
                          className={css({
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor:
                              activeEnvironmentId === env.id ? 'green.500/50' : 'gray.700',
                            bg: activeEnvironmentId === env.id ? 'green.900/20' : 'gray.800/50',
                            p: '4',
                          })}
                        >
                          <div
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: editingEnvironment?.id === env.id ? '4' : '0',
                            })}
                          >
                            <div
                              className={css({ display: 'flex', alignItems: 'center', gap: '3' })}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveEnvironmentId(
                                    activeEnvironmentId === env.id ? null : env.id
                                  )
                                  trackToolEvent('api_tester_environment_activated', {
                                    environmentName: env.name,
                                  })
                                }}
                                className={css({
                                  p: '2',
                                  rounded: 'md',
                                  _hover: { bg: 'gray.700' },
                                })}
                              >
                                {activeEnvironmentId === env.id ? (
                                  <Globe className={css({ h: '5', w: '5', color: 'green.400' })} />
                                ) : (
                                  <Globe className={css({ h: '5', w: '5', color: 'white' })} />
                                )}
                              </button>
                              <div>
                                <h3
                                  className={css({
                                    fontWeight: 'semibold',
                                    color:
                                      activeEnvironmentId === env.id ? 'green.300' : 'gray.300',
                                  })}
                                >
                                  {env.name}
                                </h3>
                                <p className={css({ fontSize: 'xs', color: 'white' })}>
                                  {env.variables.filter((v) => v.enabled && v.key.trim()).length}{' '}
                                  variables
                                </p>
                              </div>
                            </div>
                            <div className={css({ display: 'flex', gap: '2' })}>
                              <Button
                                onClick={() => {
                                  setEditingEnvironment(
                                    editingEnvironment?.id === env.id ? null : env
                                  )
                                }}
                                size="sm"
                                className={css({
                                  gap: '2',
                                  bg: 'transparent',
                                  color: 'white',
                                  _hover: { bg: 'blue.500/20', color: 'blue.400' },
                                })}
                              >
                                <Settings className={css({ h: '4', w: '4' })} />
                                {editingEnvironment?.id === env.id ? 'Hide' : 'Edit'}
                              </Button>
                              <Button
                                onClick={() => duplicateEnvironment(env.id)}
                                size="sm"
                                className={css({
                                  bg: 'transparent',
                                  color: 'white',
                                  _hover: { bg: 'cyan.500/20', color: 'cyan.400' },
                                })}
                              >
                                <Copy className={css({ h: '4', w: '4' })} />
                              </Button>
                              <Button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete environment "${env.name}"? This cannot be undone.`
                                    )
                                  ) {
                                    deleteEnvironment(env.id)
                                  }
                                }}
                                size="sm"
                                className={css({
                                  bg: 'transparent',
                                  color: 'white',
                                  _hover: { bg: 'red.500/20', color: 'red.400' },
                                })}
                              >
                                <Trash2 className={css({ h: '4', w: '4' })} />
                              </Button>
                            </div>
                          </div>

                          {/* Variables Editor */}
                          {editingEnvironment?.id === env.id && (
                            <div
                              className={css({
                                spaceY: '3',
                                pt: '4',
                                borderTop: '1px solid',
                                borderColor: 'gray.700',
                              })}
                            >
                              {/* Environment Name */}
                              <div>
                                <label
                                  htmlFor="env-name"
                                  className={css({
                                    display: 'block',
                                    fontSize: 'sm',
                                    fontWeight: 'medium',
                                    color: 'white',
                                    mb: '2',
                                  })}
                                >
                                  Environment Name
                                </label>
                                <Input
                                  id="env-name"
                                  value={env.name}
                                  onChange={(e) => {
                                    updateEnvironment(env.id, { name: e.target.value })
                                  }}
                                  placeholder="e.g., Production, Staging, Development"
                                  className={css({
                                    bg: 'gray.900/50',
                                    border: '1px solid',
                                    borderColor: 'gray.700',
                                    color: 'gray.100',
                                    _focus: { borderColor: 'green.500' },
                                  })}
                                />
                              </div>

                              {/* Variables List */}
                              <div>
                                <div
                                  className={css({
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: '2',
                                  })}
                                >
                                  <div
                                    className={css({
                                      fontSize: 'sm',
                                      fontWeight: 'medium',
                                      color: 'white',
                                    })}
                                  >
                                    Variables
                                  </div>
                                  <Button
                                    onClick={() => {
                                      const newVar: EnvVariable = {
                                        id: nanoid(),
                                        key: '',
                                        value: '',
                                        enabled: true,
                                        secret: false,
                                      }
                                      updateEnvironment(env.id, {
                                        variables: [...env.variables, newVar],
                                      })
                                      trackToolEvent('api_tester_environment_variable_added', {})
                                    }}
                                    size="sm"
                                    className={css({
                                      gap: '2',
                                      bg: 'green.500/20',
                                      color: 'green.300',
                                      _hover: { bg: 'green.500/30' },
                                    })}
                                  >
                                    <Plus className={css({ h: '4', w: '4' })} />
                                    Add Variable
                                  </Button>
                                </div>

                                <div className={css({ spaceY: '2' })}>
                                  {env.variables.map((variable, index) => (
                                    <div
                                      key={variable.id}
                                      className={css({
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr 1fr auto auto auto',
                                        gap: '2',
                                        alignItems: 'center',
                                        p: '2',
                                        rounded: 'md',
                                        bg: 'gray.800/50',
                                      })}
                                    >
                                      {/* Enabled checkbox */}
                                      <input
                                        type="checkbox"
                                        checked={variable.enabled}
                                        onChange={(e) => {
                                          const updated = [...env.variables]
                                          updated[index] = {
                                            ...variable,
                                            enabled: e.target.checked,
                                          }
                                          updateEnvironment(env.id, { variables: updated })
                                        }}
                                        className={css({
                                          h: '4',
                                          w: '4',
                                          cursor: 'pointer',
                                        })}
                                      />

                                      {/* Key input */}
                                      <Input
                                        value={variable.key}
                                        onChange={(e) => {
                                          const updated = [...env.variables]
                                          updated[index] = {
                                            ...variable,
                                            key: e.target.value,
                                          }
                                          updateEnvironment(env.id, { variables: updated })
                                        }}
                                        placeholder="Variable name (e.g., API_KEY)"
                                        className={css({
                                          h: '8',
                                          fontSize: 'sm',
                                          bg: 'gray.900/50',
                                          border: '1px solid',
                                          borderColor: 'gray.700',
                                          color: 'gray.100',
                                          _focus: { borderColor: 'green.500' },
                                        })}
                                      />

                                      {/* Value input */}
                                      <div className={css({ position: 'relative' })}>
                                        <Input
                                          type={variable.secret ? 'password' : 'text'}
                                          value={variable.value}
                                          onChange={(e) => {
                                            const updated = [...env.variables]
                                            updated[index] = {
                                              ...variable,
                                              value: e.target.value,
                                            }
                                            updateEnvironment(env.id, { variables: updated })
                                          }}
                                          placeholder="Value"
                                          className={css({
                                            h: '8',
                                            fontSize: 'sm',
                                            bg: 'gray.900/50',
                                            border: '1px solid',
                                            borderColor: 'gray.700',
                                            color: 'gray.100',
                                            _focus: { borderColor: 'green.500' },
                                          })}
                                        />
                                      </div>

                                      {/* Secret toggle */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...env.variables]
                                          updated[index] = {
                                            ...variable,
                                            secret: !variable.secret,
                                          }
                                          updateEnvironment(env.id, { variables: updated })
                                        }}
                                        className={css({
                                          p: '2',
                                          rounded: 'md',
                                          color: variable.secret ? 'green.400' : 'gray.500',
                                          _hover: { bg: 'gray.700' },
                                        })}
                                        title={variable.secret ? 'Hide value' : 'Show value'}
                                      >
                                        {variable.secret ? (
                                          <EyeOff className={css({ h: '4', w: '4' })} />
                                        ) : (
                                          <Eye className={css({ h: '4', w: '4' })} />
                                        )}
                                      </button>

                                      {/* Info button */}
                                      <button
                                        type="button"
                                        className={css({
                                          p: '2',
                                          rounded: 'md',
                                          color: 'white',
                                          _hover: { bg: 'gray.700', color: 'blue.400' },
                                        })}
                                        title={`Use {{${variable.key}}} in your requests`}
                                      >
                                        <Info className={css({ h: '4', w: '4' })} />
                                      </button>

                                      {/* Delete button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = env.variables.filter(
                                            (v) => v.id !== variable.id
                                          )
                                          updateEnvironment(env.id, { variables: updated })
                                        }}
                                        className={css({
                                          p: '2',
                                          rounded: 'md',
                                          color: 'white',
                                          _hover: { bg: 'red.500/20', color: 'red.400' },
                                        })}
                                      >
                                        <X className={css({ h: '4', w: '4' })} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create New Environment */}
                <Button
                  onClick={() => {
                    const name = prompt('Enter environment name:')
                    if (name?.trim()) {
                      createEnvironment(name.trim())
                    }
                  }}
                  className={css({
                    gap: '2',
                    w: 'full',
                    bg: 'green.500/20',
                    color: 'green.300',
                    border: '1px solid',
                    borderColor: 'green.500/30',
                    _hover: { bg: 'green.500/30' },
                  })}
                >
                  <Plus className={css({ h: '4', w: '4' })} />
                  Create New Environment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Configuration */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.2s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Request Configuration</CardTitle>
            <CardDescription>Configure your API request</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* URL & Method */}
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Request URL
                </div>
                <div className={css({ fontSize: 'xs', color: 'white' })}>
                  Tip: Press{' '}
                  <kbd
                    className={css({
                      px: '1.5',
                      py: '0.5',
                      rounded: 'sm',
                      bg: 'gray.700',
                      fontSize: 'xs',
                      fontWeight: 'semibold',
                    })}
                  >
                    ⌘
                  </kbd>
                  +
                  <kbd
                    className={css({
                      px: '1.5',
                      py: '0.5',
                      rounded: 'sm',
                      bg: 'gray.700',
                      fontSize: 'xs',
                      fontWeight: 'semibold',
                    })}
                  >
                    Enter
                  </kbd>{' '}
                  to send
                </div>
              </div>
              <div className={css({ display: 'flex', gap: '3' })}>
                <select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value as HttpMethod)
                    trackToolEvent('api_tester_method_change', { method: e.target.value })
                  }}
                  className={css({
                    h: '12',
                    minW: '32',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
                    fontWeight: 'semibold',
                    color: 'gray.200',
                    cursor: 'pointer',
                    _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    _focus: {
                      outline: 'none',
                      borderColor: 'blue.500',
                      ring: '2px',
                      ringColor: 'blue.500/20',
                    },
                  })}
                >
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className={css({
                    h: '12',
                    fontSize: 'base',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                  })}
                />
                <Button
                  onClick={handleSendRequest}
                  disabled={loading || !url.trim()}
                  className={css({
                    h: '12',
                    gap: '2',
                    px: '6',
                    bg: 'blue.500',
                    color: 'white',
                    fontWeight: 'semibold',
                    _hover: { bg: 'blue.600' },
                    _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                  })}
                >
                  {loading ? (
                    <>
                      <Loader2 className={css({ h: '5', w: '5', animation: 'spin' })} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Play className={css({ h: '5', w: '5' })} />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Request Configuration Tabs */}
            <div className={css({ borderTop: '1px solid', borderColor: 'gray.800', pt: '4' })}>
              <div
                className={css({
                  display: 'flex',
                  gap: '2',
                  borderBottom: '1px solid',
                  borderColor: 'gray.800',
                  mb: '4',
                })}
              >
                {[
                  {
                    id: 'params',
                    label: 'Params',
                    count: queryParams.filter((p) => p.enabled && p.key).length,
                  },
                  { id: 'auth', label: 'Auth', count: authType !== 'none' ? 1 : 0 },
                  {
                    id: 'headers',
                    label: 'Headers',
                    count: headers.filter((h) => h.enabled && h.key).length,
                  },
                  {
                    id: 'body',
                    label: 'Body',
                    count: ['POST', 'PUT', 'PATCH'].includes(method) && bodyType !== 'none' ? 1 : 0,
                  },
                ].map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      setActiveRequestTab(tab.id as typeof activeRequestTab)
                      trackToolEvent('api_tester_tab_change', { tab: tab.id })
                    }}
                    className={css({
                      px: '4',
                      py: '2',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: activeRequestTab === tab.id ? 'blue.400' : 'gray.400',
                      borderBottom: '2px solid',
                      borderColor: activeRequestTab === tab.id ? 'blue.500' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { color: activeRequestTab === tab.id ? 'blue.300' : 'gray.300' },
                    })}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={css({
                          ml: '2',
                          px: '2',
                          py: '0.5',
                          fontSize: 'xs',
                          rounded: 'full',
                          bg: activeRequestTab === tab.id ? 'blue.500/20' : 'gray.800',
                          color: activeRequestTab === tab.id ? 'blue.300' : 'gray.500',
                        })}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeRequestTab === 'params' && (
                <div className={css({ spaceY: '3' })}>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                      Query Parameters
                    </div>
                    <Button
                      onClick={addQueryParam}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'gray.700' },
                      })}
                    >
                      + Add Parameter
                    </Button>
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    {queryParams.map((param) => (
                      <div
                        key={param.id}
                        className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                      >
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateQueryParam(param.id, 'enabled', e.target.checked)}
                          className={css({ w: '4', h: '4', cursor: 'pointer' })}
                        />
                        <Input
                          type="text"
                          value={param.key}
                          onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                          placeholder="Parameter name"
                          className={css({
                            h: '10',
                            flex: '1',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            _focus: {
                              borderColor: 'blue.500',
                              ring: '2px',
                              ringColor: 'blue.500/20',
                            },
                          })}
                        />
                        <Input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}
                          placeholder="Parameter value"
                          className={css({
                            h: '10',
                            flex: '1',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            _focus: {
                              borderColor: 'blue.500',
                              ring: '2px',
                              ringColor: 'blue.500/20',
                            },
                          })}
                        />
                        <Button
                          onClick={() => removeQueryParam(param.id)}
                          size="sm"
                          className={css({
                            bg: 'transparent',
                            color: 'white',
                            _hover: { bg: 'red.500/20', color: 'red.400' },
                          })}
                        >
                          <X className={css({ h: '4', w: '4' })} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeRequestTab === 'auth' && (
                <div className={css({ spaceY: '3' })}>
                  <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                    Authentication
                  </div>
                  <select
                    value={authType}
                    onChange={(e) => {
                      const newAuthType = e.target.value as AuthType
                      if (newAuthType === 'api-key') {
                        trackToolEvent('api_tester_use_api_key_auth', {})
                      }
                      setAuthType(newAuthType)
                    }}
                    className={css({
                      h: '10',
                      w: 'full',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      px: '4',
                      fontSize: 'base',
                      color: 'gray.200',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                      _focus: {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    <option value="none">No Authentication</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="api-key">API Key</option>
                  </select>

                  {authType === 'bearer' && (
                    <Input
                      type="text"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Enter bearer token"
                      className={css({
                        h: '10',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                      })}
                    />
                  )}

                  {authType === 'basic' && (
                    <div
                      className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3' })}
                    >
                      <Input
                        type="text"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="Username"
                        className={css({
                          h: '10',
                          bg: 'gray.800/50',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          _focus: {
                            borderColor: 'blue.500',
                            ring: '2px',
                            ringColor: 'blue.500/20',
                          },
                        })}
                      />
                      <Input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Password"
                        className={css({
                          h: '10',
                          bg: 'gray.800/50',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          _focus: {
                            borderColor: 'blue.500',
                            ring: '2px',
                            ringColor: 'blue.500/20',
                          },
                        })}
                      />
                    </div>
                  )}

                  {authType === 'api-key' && (
                    <Input
                      type="text"
                      value={authApiKey}
                      onChange={(e) => setAuthApiKey(e.target.value)}
                      placeholder="Enter API key (will be sent as X-API-Key header)"
                      className={css({
                        h: '10',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                      })}
                    />
                  )}
                </div>
              )}

              {activeRequestTab === 'headers' && (
                <div className={css({ spaceY: '3' })}>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    })}
                  >
                    <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                      Headers
                    </div>
                    <Button
                      onClick={addHeader}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'gray.700' },
                      })}
                    >
                      + Add Header
                    </Button>
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    {headers.map((header) => (
                      <div
                        key={header.id}
                        className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                      >
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                          className={css({ w: '4', h: '4', cursor: 'pointer' })}
                        />
                        <Input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                          placeholder="Header name"
                          className={css({
                            h: '10',
                            flex: '1',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            _focus: {
                              borderColor: 'blue.500',
                              ring: '2px',
                              ringColor: 'blue.500/20',
                            },
                          })}
                        />
                        <Input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                          placeholder="Header value"
                          className={css({
                            h: '10',
                            flex: '1',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            _focus: {
                              borderColor: 'blue.500',
                              ring: '2px',
                              ringColor: 'blue.500/20',
                            },
                          })}
                        />
                        <Button
                          onClick={() => removeHeader(header.id)}
                          size="sm"
                          className={css({
                            bg: 'transparent',
                            color: 'white',
                            _hover: { bg: 'red.500/20', color: 'red.400' },
                          })}
                        >
                          <X className={css({ h: '4', w: '4' })} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeRequestTab === 'body' && ['POST', 'PUT', 'PATCH'].includes(method) && (
                <div className={css({ spaceY: '3' })}>
                  <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                    Request Body
                  </div>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value as BodyType)}
                    className={css({
                      h: '10',
                      w: 'full',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                      px: '4',
                      fontSize: 'base',
                      color: 'gray.200',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                      _focus: {
                        outline: 'none',
                        borderColor: 'blue.500',
                        ring: '2px',
                        ringColor: 'blue.500/20',
                      },
                    })}
                  >
                    <option value="none">No Body</option>
                    <option value="json">JSON</option>
                    <option value="text">Plain Text</option>
                    <option value="form-data">Form Data</option>
                  </select>

                  {bodyType === 'json' && (
                    <Textarea
                      value={bodyJson}
                      onChange={(e) => setBodyJson(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={8}
                      className={css({
                        fontFamily: 'mono',
                        fontSize: 'sm',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                      })}
                    />
                  )}

                  {bodyType === 'text' && (
                    <Textarea
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Enter text content"
                      rows={8}
                      className={css({
                        fontFamily: 'mono',
                        fontSize: 'sm',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                      })}
                    />
                  )}

                  {bodyType === 'form-data' && (
                    <div className={css({ spaceY: '2' })}>
                      <Button
                        onClick={addFormDataItem}
                        size="sm"
                        className={css({
                          gap: '2',
                          bg: 'gray.800',
                          color: 'white',
                          _hover: { bg: 'gray.700' },
                        })}
                      >
                        + Add Field
                      </Button>
                      {formData.map((item) => (
                        <div
                          key={item.id}
                          className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                        >
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) =>
                              updateFormDataItem(item.id, 'enabled', e.target.checked)
                            }
                            className={css({ w: '4', h: '4', cursor: 'pointer' })}
                          />
                          <Input
                            type="text"
                            value={item.key}
                            onChange={(e) => updateFormDataItem(item.id, 'key', e.target.value)}
                            placeholder="Field name"
                            className={css({
                              h: '10',
                              flex: '1',
                              bg: 'gray.800/50',
                              border: '1px solid',
                              borderColor: 'gray.700',
                              _focus: {
                                borderColor: 'blue.500',
                                ring: '2px',
                                ringColor: 'blue.500/20',
                              },
                            })}
                          />
                          <Input
                            type="text"
                            value={item.value}
                            onChange={(e) => updateFormDataItem(item.id, 'value', e.target.value)}
                            placeholder="Field value"
                            className={css({
                              h: '10',
                              flex: '1',
                              bg: 'gray.800/50',
                              border: '1px solid',
                              borderColor: 'gray.700',
                              _focus: {
                                borderColor: 'blue.500',
                                ring: '2px',
                                ringColor: 'blue.500/20',
                              },
                            })}
                          />
                          <Button
                            onClick={() => removeFormDataItem(item.id)}
                            size="sm"
                            className={css({
                              bg: 'transparent',
                              color: 'white',
                              _hover: { bg: 'red.500/20', color: 'red.400' },
                            })}
                          >
                            <X className={css({ h: '4', w: '4' })} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeRequestTab === 'body' && !['POST', 'PUT', 'PATCH'].includes(method) && (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  <Info className={css({ h: '5', w: '5', color: 'white' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    Request body is only available for POST, PUT, and PATCH requests
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response */}
      {(response || error) && (
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: error ? 'red.500/20' : `${statusColor}.500/20`,
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
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <CardTitle>Response</CardTitle>
                  {response && (
                    <>
                      <Badge
                        className={css({
                          bg: `${statusColor}.500/20`,
                          color: `${statusColor}.300`,
                          border: '1px solid',
                          borderColor: `${statusColor}.500/30`,
                        })}
                      >
                        {response.status} {response.statusText}
                      </Badge>
                      <Badge
                        className={css({
                          bg: 'blue.500/20',
                          color: 'blue.300',
                          border: '1px solid',
                          borderColor: 'blue.500/30',
                        })}
                      >
                        {response.time}ms
                      </Badge>
                      <Badge
                        className={css({
                          bg: 'cyan.500/20',
                          color: 'cyan.300',
                          border: '1px solid',
                          borderColor: 'cyan.500/30',
                        })}
                      >
                        {(response.size / 1024).toFixed(2)} KB
                      </Badge>
                    </>
                  )}
                </div>
                {response && (
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      onClick={handleCopyResponse}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'gray.700' },
                      })}
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                    <Button
                      onClick={handleDownloadResponse}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'gray.700' },
                      })}
                    >
                      <Download className={css({ h: '4', w: '4' })} />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {error && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'red.500/30',
                    bg: 'red.500/10',
                    p: '4',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</p>
                </div>
              )}

              {response && (
                <>
                  {/* Response Headers */}
                  <div className={css({ spaceY: '2' })}>
                    <h4 className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                      Response Headers
                    </h4>
                    <div
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        maxH: '40',
                        overflowY: 'auto',
                      })}
                    >
                      <pre className={css({ fontSize: 'xs', fontFamily: 'mono', color: 'white' })}>
                        {Object.entries(response.headers)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join('\n')}
                      </pre>
                    </div>
                  </div>

                  {/* Response Body */}
                  <div className={css({ spaceY: '2' })}>
                    <h4 className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                      Response Body
                    </h4>
                    <div
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        maxH: '96',
                        overflowY: 'auto',
                      })}
                    >
                      <pre
                        className={css({
                          fontSize: 'xs',
                          fontFamily: 'mono',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        })}
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized by highlight.js
                        dangerouslySetInnerHTML={{ __html: highlightedResponseBody }}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.4s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Info className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Features
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                  <li>
                    • Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
                  </li>
                  <li>• Custom headers and authentication (Bearer token, Basic Auth)</li>
                  <li>• Multiple body formats (JSON, plain text, form data)</li>
                  <li>• Save request presets for quick access</li>
                  <li>• Track request history with responses</li>
                  <li>• View response headers, status codes, and timing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Suggestions */}
      <AffiliateSuggestion tool="api-tester" variant="banner" />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function ApiTesterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApiTesterContent />
    </Suspense>
  )
}
