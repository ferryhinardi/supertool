'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  Code,
  Copy,
  Download,
  History,
  Play,
  Settings,
  Sparkles,
  Star,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface GraphQLResponse {
  data?: unknown
  errors?: Array<{ message: string; locations?: unknown[]; path?: string[] }>
}

interface QueryHistory {
  query: string
  variables: string
  endpoint: string
  timestamp: number
  favorite?: boolean
}

function GraphQLPlaygroundContent() {
  // State
  const [endpoint, setEndpoint] = useState(
    'https://swapi-graphql.netlify.app/.netlify/functions/index'
  )
  const [query, setQuery] = useState(`# Welcome to GraphQL Playground!
# Try this example query:

query GetFilm {
  film(filmID: 1) {
    title
    director
    releaseDate
    openingCrawl
  }
}`)
  const [variables, setVariables] = useState('{}')
  const [headers, setHeaders] = useState('{}')
  const [response, setResponse] = useState<GraphQLResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<QueryHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('graphql_playground_open', {})
    // Load history from localStorage
    const savedHistory = localStorage.getItem('graphql_history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (_error) {
        // Invalid history data
      }
    }
  }, [])

  // Save history to localStorage
  const saveHistory = (newHistory: QueryHistory[]) => {
    setHistory(newHistory)
    localStorage.setItem('graphql_history', JSON.stringify(newHistory.slice(0, 50))) // Keep last 50
  }

  // Execute GraphQL query
  const executeQuery = async () => {
    if (!endpoint.trim()) {
      toast.error('Please enter a GraphQL endpoint URL')
      return
    }

    if (!query.trim()) {
      toast.error('Please enter a GraphQL query')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      // Parse variables
      let parsedVariables = {}
      if (variables.trim()) {
        try {
          parsedVariables = JSON.parse(variables)
        } catch (_error) {
          toast.error('Invalid JSON in variables')
          setLoading(false)
          return
        }
      }

      // Parse headers
      let parsedHeaders = {}
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers)
        } catch (_error) {
          toast.error('Invalid JSON in headers')
          setLoading(false)
          return
        }
      }

      // Make GraphQL request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
        body: JSON.stringify({
          query,
          variables: parsedVariables,
        }),
      })

      if (!response.ok) {
        toast.error(`HTTP Error: ${response.status} ${response.statusText}`)
        setLoading(false)
        return
      }

      const data = (await response.json()) as GraphQLResponse
      setResponse(data)

      // Add to history
      const newHistoryItem: QueryHistory = {
        query,
        variables,
        endpoint,
        timestamp: Date.now(),
      }
      const newHistory = [newHistoryItem, ...history]
      saveHistory(newHistory)

      trackToolEvent('graphql_query_execute', {
        has_variables: variables.trim().length > 0,
        has_headers: headers.trim().length > 0,
        has_errors: (data.errors?.length || 0) > 0,
      })

      if (data.errors && data.errors.length > 0) {
        toast.error(`Query returned ${data.errors.length} error(s)`)
      } else {
        toast.success('Query executed successfully!')
      }
    } catch (error) {
      console.error('GraphQL query error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to execute query')
      trackToolEvent('graphql_query_error', {})
    } finally {
      setLoading(false)
    }
  }

  // Copy response to clipboard
  const copyResponse = async () => {
    if (!response) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      toast.success('Response copied to clipboard!')
      trackToolEvent('graphql_response_copy', {})
    } catch (_error) {
      toast.error('Failed to copy response')
    }
  }

  // Download response as JSON
  const downloadResponse = () => {
    if (!response) return
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `graphql-response-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    trackToolEvent('graphql_response_download', {})
  }

  // Load query from history
  const loadFromHistory = (item: QueryHistory) => {
    setQuery(item.query)
    setVariables(item.variables)
    setEndpoint(item.endpoint)
    setShowHistory(false)
    toast.success('Query loaded from history')
    trackToolEvent('graphql_history_load', {})
  }

  // Toggle favorite
  const toggleFavorite = (timestamp: number) => {
    const newHistory = history.map((item) =>
      item.timestamp === timestamp ? { ...item, favorite: !item.favorite } : item
    )
    saveHistory(newHistory)
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('graphql_history')
    toast.success('History cleared')
    trackToolEvent('graphql_history_clear', {})
  }

  // Sample queries
  const sampleQueries = [
    {
      name: 'Star Wars - Get Film',
      endpoint: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
      query: `query GetFilm {
  film(filmID: 1) {
    title
    director
    releaseDate
    openingCrawl
  }
}`,
      variables: '{}',
    },
    {
      name: 'Countries API',
      endpoint: 'https://countries.trevorblades.com/graphql',
      query: `query GetCountries {
  countries {
    code
    name
    capital
    currency
  }
}`,
      variables: '{}',
    },
    {
      name: 'SpaceX API',
      endpoint: 'https://spacex-production.up.railway.app/',
      query: `query GetLaunches {
  launches(limit: 5) {
    mission_name
    launch_date_local
    launch_success
    rocket {
      rocket_name
    }
  }
}`,
      variables: '{}',
    },
  ]

  const loadSampleQuery = (sample: (typeof sampleQueries)[0]) => {
    setEndpoint(sample.endpoint)
    setQuery(sample.query)
    setVariables(sample.variables)
    toast.success(`Loaded: ${sample.name}`)
    trackToolEvent('graphql_sample_load', { sample: sample.name })
  }

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
        className={css({ spaceY: '4' })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            gap: '4',
            flexWrap: 'wrap',
          })}
        >
          <div className={css({ spaceY: '2', flex: '1', minW: '0' })}>
            <h1
              className={css({
                fontSize: { base: '3xl', sm: '4xl' },
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #7c3aed, #ec4899)',
                backgroundClip: 'text',
                color: 'transparent',
              })}
            >
              GraphQL Playground
            </h1>
            <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
              Test GraphQL APIs with query builder, schema explorer, and real-time validation
            </p>
          </div>
          <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
            <Badge variant="secondary">
              <Sparkles className={css({ w: '3', h: '3' })} />
              Interactive
            </Badge>
            <Badge variant="secondary">
              <Code className={css({ w: '3', h: '3' })} />
              Developer Tool
            </Badge>
          </div>
        </div>

        {/* Tool Search */}
        <Suspense fallback={<div>Loading...</div>}>
          <ToolSearch />
        </Suspense>
      </motion.div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '1fr' },
          gap: '6',
          w: 'full',
        })}
      >
        {/* Endpoint Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Settings className={css({ w: '5', h: '5' })} />
              Configuration
            </CardTitle>
            <CardDescription>Set your GraphQL endpoint and headers</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ spaceY: '2' })}>
              <Label htmlFor="endpoint">GraphQL Endpoint</Label>
              <Input
                id="endpoint"
                type="url"
                placeholder="https://api.example.com/graphql"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>

            <Tabs defaultValue="headers" className={css({ w: 'full' })}>
              <TabsList>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="samples">Sample Queries</TabsTrigger>
              </TabsList>
              <TabsContent value="headers" className={css({ spaceY: '2' })}>
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  placeholder='{ "Authorization": "Bearer token" }'
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  rows={3}
                />
              </TabsContent>
              <TabsContent value="samples" className={css({ spaceY: '2' })}>
                <div className={css({ display: 'grid', gap: '2' })}>
                  {sampleQueries.map((sample) => (
                    <Button
                      key={sample.name}
                      variant="outline"
                      onClick={() => loadSampleQuery(sample)}
                      className={css({ justifyContent: 'start' })}
                    >
                      <Sparkles className={css({ w: '4', h: '4' })} />
                      {sample.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Query Editor */}
        <Card>
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Code className={css({ w: '5', h: '5' })} />
              Query Editor
            </CardTitle>
            <CardDescription>Write your GraphQL query</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              placeholder="Enter your GraphQL query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={12}
              className={css({ fontFamily: 'mono', fontSize: 'sm' })}
            />

            <div className={css({ spaceY: '2' })}>
              <Label htmlFor="variables">Variables (JSON)</Label>
              <Textarea
                id="variables"
                placeholder='{ "id": 1 }'
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                rows={4}
                className={css({ fontFamily: 'mono', fontSize: 'sm' })}
              />
            </div>

            <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
              <Button onClick={executeQuery} disabled={loading}>
                <Play className={css({ w: '4', h: '4' })} />
                {loading ? 'Executing...' : 'Execute Query'}
              </Button>
              <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
                <History className={css({ w: '4', h: '4' })} />
                History ({history.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response Viewer */}
        {response && (
          <Card>
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <BookOpen className={css({ w: '5', h: '5' })} />
                Response
              </CardTitle>
              <CardDescription>
                {response.errors && response.errors.length > 0
                  ? `${response.errors.length} error(s) found`
                  : 'Query executed successfully'}
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {/* Response Data */}
              <div
                className={css({
                  bg: 'gray.900',
                  rounded: 'lg',
                  p: '4',
                  overflow: 'auto',
                  maxH: '96',
                })}
              >
                <pre className={css({ fontSize: 'sm', fontFamily: 'mono', color: 'gray.100' })}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>

              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                <Button variant="outline" onClick={copyResponse}>
                  <Copy className={css({ w: '4', h: '4' })} />
                  Copy Response
                </Button>
                <Button variant="outline" onClick={downloadResponse}>
                  <Download className={css({ w: '4', h: '4' })} />
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Panel */}
        {showHistory && (
          <Card>
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Clock className={css({ w: '5', h: '5' })} />
                  Query History
                </CardTitle>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    Clear All
                  </Button>
                )}
              </div>
              <CardDescription>Load previous queries</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className={css({ textAlign: 'center', color: 'gray.400', py: '8' })}>
                  No query history yet. Execute a query to see it here.
                </p>
              ) : (
                <div className={css({ spaceY: '2', maxH: '96', overflow: 'auto' })}>
                  {history.map((item) => (
                    <button
                      key={item.timestamp}
                      type="button"
                      className={css({
                        p: '3',
                        rounded: 'lg',
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        w: 'full',
                        textAlign: 'left',
                        _hover: { borderColor: 'purple.500', bg: 'gray.800' },
                      })}
                      onClick={() => loadFromHistory(item)}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          justifyContent: 'space-between',
                          gap: '2',
                        })}
                      >
                        <div className={css({ flex: '1', minW: '0' })}>
                          <p className={css({ fontSize: 'sm', color: 'gray.300', truncate: true })}>
                            {item.query.split('\n')[0].slice(0, 60)}...
                          </p>
                          <p className={css({ fontSize: 'xs', color: 'gray.500', mt: '1' })}>
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(item.timestamp)
                          }}
                        >
                          <Star
                            className={css({
                              w: '4',
                              h: '4',
                              fill: item.favorite ? 'yellow.400' : 'transparent',
                              stroke: item.favorite ? 'yellow.400' : 'currentColor',
                            })}
                          />
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
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
            <Feature
              icon={Play}
              title="Execute Queries"
              description="Run GraphQL queries and mutations"
            />
            <Feature
              icon={Code}
              title="Variables Support"
              description="Pass dynamic variables to queries"
            />
            <Feature
              icon={Settings}
              title="Custom Headers"
              description="Add authentication and custom headers"
            />
            <Feature
              icon={History}
              title="Query History"
              description="Access and reuse previous queries"
            />
            <Feature icon={Star} title="Favorites" description="Save frequently used queries" />
            <Feature
              icon={Download}
              title="Export Results"
              description="Download responses as JSON"
            />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className={css({ display: 'flex', gap: '3', alignItems: 'start' })}>
      <div
        className={css({
          p: '2',
          rounded: 'lg',
          bg: 'purple.500/10',
          color: 'purple.400',
          flexShrink: '0',
        })}
      >
        <Icon className={css({ w: '5', h: '5' })} />
      </div>
      <div className={css({ flex: '1', minW: '0' })}>
        <h3 className={css({ fontWeight: 'semibold', fontSize: 'sm' })}>{title}</h3>
        <p className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>{description}</p>
      </div>
    </div>
  )
}

export default function GraphQLPlaygroundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GraphQLPlaygroundContent />
    </Suspense>
  )
}
