'use client'

import { motion } from 'framer-motion'
import {
  BookmarkPlus,
  Copy,
  Download,
  History,
  Info,
  Loader2,
  Play,
  Save,
  Terminal,
  Trash2,
  X,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const
type HttpMethod = (typeof HTTP_METHODS)[number]

const AUTH_TYPES = ['none', 'bearer', 'basic'] as const
type AuthType = (typeof AUTH_TYPES)[number]

const BODY_TYPES = ['none', 'json', 'text', 'form-data'] as const
type BodyType = (typeof BODY_TYPES)[number]

interface Header {
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
  headers: Header[]
  authType: AuthType
  authToken: string
  authUsername: string
  authPassword: string
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

function ApiTesterContent() {
  // Request Configuration
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Header[]>([
    { id: nanoid(), key: '', value: '', enabled: true },
  ])
  const [authType, setAuthType] = useState<AuthType>('none')
  const [authToken, setAuthToken] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
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

  // Save presets and history
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

  // Track page visit
  useEffect(() => {
    trackToolEvent('api_tester_open', {})
  }, [])

  const getCurrentConfig = (): RequestConfig => ({
    method,
    url,
    headers,
    authType,
    authToken,
    authUsername,
    authPassword,
    bodyType,
    bodyJson,
    bodyText,
    formData,
  })

  const loadConfig = (config: RequestConfig) => {
    setMethod(config.method)
    setUrl(config.url)
    setHeaders(config.headers)
    setAuthType(config.authType)
    setAuthToken(config.authToken)
    setAuthUsername(config.authUsername)
    setAuthPassword(config.authPassword)
    setBodyType(config.bodyType)
    setBodyJson(config.bodyJson)
    setBodyText(config.bodyText)
    setFormData(config.formData)
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
      // Build headers
      const requestHeaders: HeadersInit = {}

      // Add custom headers
      headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          requestHeaders[h.key.trim()] = h.value.trim()
        })

      // Add auth headers
      if (authType === 'bearer' && authToken.trim()) {
        requestHeaders.Authorization = `Bearer ${authToken.trim()}`
      } else if (authType === 'basic' && authUsername.trim()) {
        const encoded = btoa(`${authUsername.trim()}:${authPassword.trim()}`)
        requestHeaders.Authorization = `Basic ${encoded}`
      }

      // Build body
      let requestBody: BodyInit | undefined

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'json' && bodyJson.trim()) {
          try {
            JSON.parse(bodyJson) // Validate
            requestBody = bodyJson
            requestHeaders['Content-Type'] = 'application/json'
          } catch {
            throw new Error('Invalid JSON in request body')
          }
        } else if (bodyType === 'text' && bodyText.trim()) {
          requestBody = bodyText
          requestHeaders['Content-Type'] = 'text/plain'
        } else if (bodyType === 'form-data') {
          const formDataObj = new FormData()
          formData
            .filter((f) => f.enabled && f.key.trim())
            .forEach((f) => {
              formDataObj.append(f.key.trim(), f.value.trim())
            })
          requestBody = formDataObj
        }
      }

      // Make request
      const res = await fetch(url.trim(), {
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
            color: 'gray.400',
          })}
        >
          Test REST APIs directly in your browser. Send requests with custom headers, body, and
          authentication. Save presets and track history.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={css({ display: 'flex', gap: '3', justifyContent: 'center', flexWrap: 'wrap' })}
      >
        <Button
          onClick={handleSavePreset}
          className={css({
            gap: '2',
            bg: 'gray.800',
            color: 'gray.300',
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
            color: 'gray.300',
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
            color: 'gray.300',
            _hover: { bg: 'gray.700' },
          })}
        >
          <History className={css({ h: '4', w: '4' })} />
          History ({history.length})
        </Button>
      </motion.div>

      {/* Presets Panel */}
      {showPresets && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
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
                    color: 'gray.400',
                    _hover: { bg: 'gray.800' },
                  })}
                >
                  <X className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {presets.length === 0 ? (
                <p className={css({ textAlign: 'center', color: 'gray.500', py: '8' })}>
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
                              color: 'gray.300',
                            })}
                          >
                            {preset.name}
                          </span>
                          <span
                            className={css({ fontSize: 'xs', color: 'gray.500', truncate: true })}
                          >
                            {preset.url}
                          </span>
                        </div>
                      </button>
                      <Button
                        onClick={() => handleDeletePreset(preset.id)}
                        size="sm"
                        className={css({
                          bg: 'transparent',
                          color: 'gray.500',
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
        </motion.div>
      )}

      {/* History Panel */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
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
                      color: 'gray.400',
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
                      color: 'gray.400',
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
                <p className={css({ textAlign: 'center', color: 'gray.500', py: '8' })}>
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
                        <span
                          className={css({ fontSize: 'sm', color: 'gray.300', truncate: true })}
                        >
                          {item.url}
                        </span>
                      </div>
                      <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Request Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
              <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                Request URL
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

            {/* Authentication */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                Authentication
              </div>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as AuthType)}
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
                <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3' })}>
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
                      _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
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
                      _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                    })}
                  />
                </div>
              )}
            </div>

            {/* Headers */}
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Headers
                </div>
                <Button
                  onClick={addHeader}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
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
                        _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
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
                        _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                      })}
                    />
                    <Button
                      onClick={() => removeHeader(header.id)}
                      size="sm"
                      className={css({
                        bg: 'transparent',
                        color: 'gray.500',
                        _hover: { bg: 'red.500/20', color: 'red.400' },
                      })}
                    >
                      <X className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className={css({ spaceY: '3' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
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
                        color: 'gray.400',
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
                          onChange={(e) => updateFormDataItem(item.id, 'enabled', e.target.checked)}
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
                            color: 'gray.500',
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Response */}
      {(response || error) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
                        color: 'gray.400',
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
                        color: 'gray.400',
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
                    <h4
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
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
                      <pre
                        className={css({ fontSize: 'xs', fontFamily: 'mono', color: 'gray.400' })}
                      >
                        {Object.entries(response.headers)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join('\n')}
                      </pre>
                    </div>
                  </div>

                  {/* Response Body */}
                  <div className={css({ spaceY: '2' })}>
                    <h4
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
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
                          color: 'gray.300',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        })}
                      >
                        {response.body}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
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
              <Info className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Features
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
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
      </motion.div>
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
