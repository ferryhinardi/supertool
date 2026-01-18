'use client'

import {
  Activity,
  AlertCircle,
  Check,
  Clock,
  Copy,
  Eye,
  Globe,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/auth/auth-store'
import { supabase } from '@/lib/auth/supabaseClient'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  formatBytes,
  formatRelativeTime,
  formatWebhookUrl,
  generateCurlCommand,
  type HttpMethod,
  prettyPrintJson,
  RESPONSE_TEMPLATES,
  type WebhookEndpoint,
  type WebhookRequest,
} from './templates'

export default function WebhookTesterPage() {
  const { user, openAuthModal } = useAuthStore()
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('success')

  // Request log state
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null)
  const [requests, setRequests] = useState<WebhookRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(null)

  // Track page view
  useEffect(() => {
    trackToolEvent('webhook_tester_open')
  }, [])

  const fetchEndpoints = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/webhooks/create', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEndpoints(data)
      } else {
        toast.error('Failed to fetch webhook endpoints')
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error)
      toast.error('Failed to fetch webhook endpoints')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchRequests = useCallback(async (endpointId: string) => {
    try {
      const { data, error } = await supabase
        .from('webhook_requests')
        .select('*')
        .eq('endpoint_id', endpointId)
        .order('received_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to fetch webhook requests')
    }
  }, [])

  // Fetch endpoints on mount
  useEffect(() => {
    if (user) {
      fetchEndpoints()
    } else {
      setIsLoading(false)
    }
  }, [user, fetchEndpoints])

  // Set up realtime subscription for selected endpoint
  useEffect(() => {
    if (!selectedEndpointId) return

    // Fetch initial requests
    fetchRequests(selectedEndpointId)

    // Subscribe to new requests
    const channel = supabase
      .channel(`webhook_requests:${selectedEndpointId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_requests',
          filter: `endpoint_id=eq.${selectedEndpointId}`,
        },
        (payload) => {
          setRequests((prev) => [payload.new as WebhookRequest, ...prev])
          toast.success('New webhook request received!')
          trackToolEvent('webhook_tester_request_received')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedEndpointId, fetchRequests])

  const createEndpoint = async () => {
    if (!user) {
      openAuthModal('sign-in')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter a webhook name')
      return
    }

    try {
      setIsCreating(true)
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        toast.error('Please sign in to create webhooks')
        return
      }

      const template = RESPONSE_TEMPLATES.find((t) => t.id === selectedTemplate)
      const response = await fetch('/api/webhooks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          response_status_code: template?.statusCode || 200,
          response_body: template?.body || { success: true, message: 'Webhook received' },
        }),
      })

      if (response.ok) {
        const newEndpoint = await response.json()
        setEndpoints((prev) => [newEndpoint, ...prev])
        setName('')
        setDescription('')
        setSelectedTemplate('success')
        setShowCreateForm(false)
        toast.success('Webhook endpoint created!')
        trackToolEvent('webhook_tester_create')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to create webhook endpoint')
      }
    } catch (error) {
      console.error('Error creating endpoint:', error)
      toast.error('Failed to create webhook endpoint')
    } finally {
      setIsCreating(false)
    }
  }

  const toggleEndpoint = async (endpoint: WebhookEndpoint) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const { error } = await supabase
        .from('webhook_endpoints')
        .update({ is_active: !endpoint.is_active })
        .eq('id', endpoint.id)

      if (error) throw error

      setEndpoints((prev) =>
        prev.map((e) => (e.id === endpoint.id ? { ...e, is_active: !e.is_active } : e))
      )
      toast.success(`Webhook ${!endpoint.is_active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling endpoint:', error)
      toast.error('Failed to update webhook endpoint')
    }
  }

  const deleteEndpoint = async (endpoint: WebhookEndpoint) => {
    if (!confirm(`Delete webhook "${endpoint.name}"?`)) return

    try {
      const { error } = await supabase.from('webhook_endpoints').delete().eq('id', endpoint.id)

      if (error) throw error

      setEndpoints((prev) => prev.filter((e) => e.id !== endpoint.id))
      if (selectedEndpointId === endpoint.id) {
        setSelectedEndpointId(null)
        setRequests([])
      }
      toast.success('Webhook endpoint deleted')
    } catch (error) {
      console.error('Error deleting endpoint:', error)
      toast.error('Failed to delete webhook endpoint')
    }
  }

  const copyUrl = (endpointId: string) => {
    const url = formatWebhookUrl(endpointId)
    navigator.clipboard.writeText(url)
    toast.success('Webhook URL copied to clipboard!')
    trackToolEvent('webhook_tester_copy_url')
  }

  const copyCurl = (request: WebhookRequest) => {
    const endpoint = endpoints.find((e) => e.id === request.endpoint_id)
    if (!endpoint) return

    const url = formatWebhookUrl(endpoint.id)
    const body = request.body ? JSON.parse(request.body) : undefined
    const curl = generateCurlCommand(url, request.method as HttpMethod, undefined, body)

    navigator.clipboard.writeText(curl)
    toast.success('cURL command copied!')
  }

  const exportRequest = (request: WebhookRequest) => {
    const data = {
      method: request.method,
      headers: request.headers,
      query_params: request.query_params,
      body: request.body ? JSON.parse(request.body) : null,
      received_at: request.received_at,
      ip_address: request.ip_address,
      user_agent: request.user_agent,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webhook-request-${request.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Request exported!')
  }

  // If not authenticated, show sign-in prompt
  if (!user && !isLoading) {
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
        <div className={css({ textAlign: 'center', spaceY: '3' })}>
          <h1
            className={css({
              fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3',
            })}
          >
            <Activity className={css({ color: 'green.400' })} />
            <span>Webhook Tester</span>
          </h1>
          <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
            Test and debug webhooks in real-time
          </p>
        </div>

        <div
          className={css({
            p: { base: '6', sm: '8' },
            bg: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderRadius: 'xl',
            textAlign: 'center',
          })}
        >
          <AlertCircle
            className={css({ w: '16', h: '16', mx: 'auto', mb: '4', color: 'blue.400' })}
          />
          <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '3' })}>
            Sign In Required
          </h2>
          <p className={css({ color: 'gray.300', fontSize: 'lg', mb: '6' })}>
            Please sign in to create and manage webhook endpoints
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('sign-in')}
            className={css({
              px: '6',
              py: '3',
              bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: 'lg',
              fontWeight: 'semibold',
              borderRadius: 'lg',
              cursor: 'pointer',
              transition: 'all 0.3s',
              _hover: {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
              },
            })}
          >
            Sign In
          </button>
        </div>
      </main>
    )
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
      <div className={css({ textAlign: 'center', spaceY: '3' })}>
        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
          })}
        >
          <Activity className={css({ color: 'green.400' })} />
          <span>Webhook Tester</span>
        </h1>
        <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
          Test and debug webhooks in real-time
        </p>
      </div>

      {isLoading ? (
        <div className={css({ textAlign: 'center', py: '12' })}>
          <Loader2
            className={css({ w: '12', h: '12', mx: 'auto', animation: 'spin 1s linear infinite' })}
          />
          <p className={css({ color: 'gray.400', mt: '4' })}>Loading webhooks...</p>
        </div>
      ) : (
        <>
          {/* Create Endpoint Button */}
          <div className={css({ display: 'flex', justifyContent: 'flex-end' })}>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '4',
                py: '2',
                bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: 'sm',
                fontWeight: 'semibold',
                borderRadius: 'lg',
                cursor: 'pointer',
                transition: 'all 0.3s',
                _hover: {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                },
              })}
            >
              {showCreateForm ? (
                <X className={css({ w: '4', h: '4' })} />
              ) : (
                <Plus className={css({ w: '4', h: '4' })} />
              )}
              {showCreateForm ? 'Cancel' : 'Create Webhook'}
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div
              className={css({
                p: { base: '4', sm: '6' },
                bg: 'rgba(17, 24, 39, 0.6)',
                border: '2px solid',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                borderRadius: 'xl',
                spaceY: '4',
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>
                Create Webhook Endpoint
              </h3>

              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="webhook-name"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Name <span className={css({ color: 'red.400' })}>*</span>
                </label>
                <input
                  id="webhook-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Webhook"
                  maxLength={100}
                  className={css({
                    w: 'full',
                    px: '4',
                    py: '3',
                    bg: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 'lg',
                    color: 'white',
                    fontSize: 'sm',
                    outline: 'none',
                    transition: 'all 0.2s',
                    _focus: {
                      borderColor: 'rgba(139, 92, 246, 0.6)',
                      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    },
                  })}
                />
              </div>

              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="webhook-description"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Description (optional)
                </label>
                <textarea
                  id="webhook-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Webhook for testing my API integration"
                  rows={2}
                  className={css({
                    w: 'full',
                    px: '4',
                    py: '3',
                    bg: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 'lg',
                    color: 'white',
                    fontSize: 'sm',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.2s',
                    _focus: {
                      borderColor: 'rgba(139, 92, 246, 0.6)',
                      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    },
                  })}
                />
              </div>

              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="webhook-template"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Response Template
                </label>
                <select
                  id="webhook-template"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className={css({
                    w: 'full',
                    px: '4',
                    py: '3',
                    bg: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 'lg',
                    color: 'white',
                    fontSize: 'sm',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _focus: {
                      borderColor: 'rgba(139, 92, 246, 0.6)',
                      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    },
                  })}
                >
                  {RESPONSE_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={createEndpoint}
                disabled={isCreating || !name.trim()}
                className={css({
                  w: 'full',
                  px: '4',
                  py: '3',
                  bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  borderRadius: 'lg',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2',
                  _hover: {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                  },
                  _disabled: {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    transform: 'none',
                  },
                })}
              >
                {isCreating ? (
                  <>
                    <Loader2
                      className={css({ w: '4', h: '4', animation: 'spin 1s linear infinite' })}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className={css({ w: '4', h: '4' })} />
                    Create Webhook
                  </>
                )}
              </button>
            </div>
          )}

          {/* Endpoints List */}
          {endpoints.length === 0 ? (
            <div
              className={css({
                p: { base: '8', sm: '12' },
                bg: 'rgba(17, 24, 39, 0.6)',
                border: '2px dashed',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                borderRadius: 'xl',
                textAlign: 'center',
              })}
            >
              <Globe
                className={css({ w: '16', h: '16', mx: 'auto', mb: '4', color: 'gray.500' })}
              />
              <h3 className={css({ fontSize: 'xl', fontWeight: 'semibold', mb: '2' })}>
                No Webhook Endpoints Yet
              </h3>
              <p className={css({ color: 'gray.400', mb: '6' })}>
                Create your first webhook endpoint to start testing
              </p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className={css({
                  px: '4',
                  py: '2',
                  bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  borderRadius: 'lg',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  _hover: {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                  },
                })}
              >
                Create Webhook
              </button>
            </div>
          ) : (
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
                gap: '6',
              })}
            >
              {/* Endpoints Column */}
              <div className={css({ spaceY: '4' })}>
                <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold' })}>Your Webhooks</h2>
                <div className={css({ spaceY: '3' })}>
                  {endpoints.map((endpoint) => (
                    <button
                      type="button"
                      key={endpoint.id}
                      className={css({
                        p: '4',
                        w: 'full',
                        textAlign: 'left',
                        bg: 'rgba(17, 24, 39, 0.6)',
                        border: '1px solid',
                        borderColor:
                          selectedEndpointId === endpoint.id
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'rgba(139, 92, 246, 0.2)',
                        borderRadius: 'xl',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        _hover: {
                          borderColor: 'rgba(139, 92, 246, 0.4)',
                        },
                      })}
                      onClick={() => setSelectedEndpointId(endpoint.id)}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: '3',
                        })}
                      >
                        <div>
                          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '1' })}>
                            {endpoint.name}
                          </h3>
                          {endpoint.description && (
                            <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                              {endpoint.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1',
                            px: '2',
                            py: '1',
                            bg: endpoint.is_active
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'md',
                          })}
                        >
                          <div
                            className={css({
                              w: '2',
                              h: '2',
                              borderRadius: 'full',
                              bg: endpoint.is_active ? 'green.400' : 'red.400',
                            })}
                          />
                          <span
                            className={css({
                              fontSize: 'xs',
                              color: endpoint.is_active ? 'green.400' : 'red.400',
                            })}
                          >
                            {endpoint.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div
                        className={css({
                          p: '2',
                          bg: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: 'md',
                          mb: '3',
                        })}
                      >
                        <code
                          className={css({
                            fontSize: 'xs',
                            color: 'gray.300',
                            wordBreak: 'break-all',
                          })}
                        >
                          {formatWebhookUrl(endpoint.id)}
                        </code>
                      </div>

                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        })}
                      >
                        <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          <span>{endpoint.request_count} requests</span>
                          <span className={css({ mx: '2' })}>•</span>
                          <span>{formatRelativeTime(endpoint.created_at)}</span>
                        </div>

                        {/* biome-ignore lint/a11y/useSemanticElements: Button group container, fieldset not appropriate here */}
                        <div
                          role="group"
                          className={css({ display: 'flex', gap: '2' })}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => copyUrl(endpoint.id)}
                            className={css({
                              p: '1.5',
                              bg: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid',
                              borderColor: 'rgba(139, 92, 246, 0.3)',
                              borderRadius: 'md',
                              color: 'purple.400',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              _hover: {
                                bg: 'rgba(139, 92, 246, 0.2)',
                              },
                            })}
                            title="Copy URL"
                          >
                            <Copy className={css({ w: '3.5', h: '3.5' })} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleEndpoint(endpoint)}
                            className={css({
                              p: '1.5',
                              bg: endpoint.is_active
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid',
                              borderColor: endpoint.is_active
                                ? 'rgba(239, 68, 68, 0.3)'
                                : 'rgba(34, 197, 94, 0.3)',
                              borderRadius: 'md',
                              color: endpoint.is_active ? 'red.400' : 'green.400',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              _hover: {
                                bg: endpoint.is_active
                                  ? 'rgba(239, 68, 68, 0.2)'
                                  : 'rgba(34, 197, 94, 0.2)',
                              },
                            })}
                            title={endpoint.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {endpoint.is_active ? (
                              <PowerOff className={css({ w: '3.5', h: '3.5' })} />
                            ) : (
                              <Power className={css({ w: '3.5', h: '3.5' })} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteEndpoint(endpoint)}
                            className={css({
                              p: '1.5',
                              bg: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid',
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                              borderRadius: 'md',
                              color: 'red.400',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              _hover: {
                                bg: 'rgba(239, 68, 68, 0.2)',
                              },
                            })}
                            title="Delete"
                          >
                            <Trash2 className={css({ w: '3.5', h: '3.5' })} />
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Requests Column */}
              <div className={css({ spaceY: '4' })}>
                <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold' })}>Request Log</h2>
                {!selectedEndpointId ? (
                  <div
                    className={css({
                      p: { base: '8', sm: '12' },
                      bg: 'rgba(17, 24, 39, 0.6)',
                      border: '2px dashed',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: 'xl',
                      textAlign: 'center',
                    })}
                  >
                    <Eye
                      className={css({ w: '12', h: '12', mx: 'auto', mb: '3', color: 'gray.500' })}
                    />
                    <p className={css({ color: 'gray.400' })}>
                      Select a webhook to view its request log
                    </p>
                  </div>
                ) : requests.length === 0 ? (
                  <div
                    className={css({
                      p: { base: '8', sm: '12' },
                      bg: 'rgba(17, 24, 39, 0.6)',
                      border: '2px dashed',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: 'xl',
                      textAlign: 'center',
                    })}
                  >
                    <Clock
                      className={css({ w: '12', h: '12', mx: 'auto', mb: '3', color: 'gray.500' })}
                    />
                    <p className={css({ color: 'gray.400' })}>No requests yet</p>
                    <p className={css({ color: 'gray.500', fontSize: 'sm', mt: '2' })}>
                      Send a request to your webhook URL to see it here
                    </p>
                  </div>
                ) : (
                  <div className={css({ spaceY: '2', maxH: '600px', overflowY: 'auto' })}>
                    {requests.map((request) => (
                      <button
                        type="button"
                        key={request.id}
                        className={css({
                          w: 'full',
                          textAlign: 'left',
                          p: '3',
                          bg: 'rgba(17, 24, 39, 0.6)',
                          border: '1px solid',
                          borderColor: 'rgba(139, 92, 246, 0.2)',
                          borderRadius: 'lg',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          _hover: {
                            borderColor: 'rgba(139, 92, 246, 0.4)',
                          },
                        })}
                        onClick={() => setSelectedRequest(request)}
                      >
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
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2',
                            })}
                          >
                            <span
                              className={css({
                                px: '2',
                                py: '0.5',
                                fontSize: 'xs',
                                fontWeight: 'bold',
                                bg: 'rgba(139, 92, 246, 0.2)',
                                color: 'purple.300',
                                borderRadius: 'md',
                              })}
                            >
                              {request.method}
                            </span>
                            <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                              {formatRelativeTime(request.received_at)}
                            </span>
                          </div>
                          <Eye className={css({ w: '4', h: '4', color: 'gray.500' })} />
                        </div>

                        <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          <div className={css({ mb: '1' })}>
                            IP: {request.ip_address || 'Unknown'}
                          </div>
                          {request.body && <div>Body: {formatBytes(request.body_size)}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Request Inspector Modal */}
      {selectedRequest && (
        // biome-ignore lint/a11y/useSemanticElements: Modal backdrop overlay for click-to-close, not a true interactive button
        <div
          role="button"
          tabIndex={0}
          className={css({
            position: 'fixed',
            inset: '0',
            bg: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '50',
            p: '4',
          })}
          onClick={() => setSelectedRequest(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSelectedRequest(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={css({
              w: 'full',
              maxW: '4xl',
              maxH: '90vh',
              bg: 'rgba(17, 24, 39, 0.95)',
              border: '2px solid',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderRadius: 'xl',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            })}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={css({
                p: '4',
                borderBottom: '1px solid',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <div>
                <h3 className={css({ fontSize: 'xl', fontWeight: 'semibold', mb: '1' })}>
                  Request Details
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  {selectedRequest.method} • {formatRelativeTime(selectedRequest.received_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className={css({
                  p: '2',
                  color: 'gray.400',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  _hover: {
                    color: 'white',
                  },
                })}
              >
                <X className={css({ w: '6', h: '6' })} />
              </button>
            </div>

            {/* Modal Content */}
            <div className={css({ p: '4', overflowY: 'auto', spaceY: '4' })}>
              {/* Metadata */}
              <div>
                <h4
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    mb: '2',
                    color: 'gray.300',
                  })}
                >
                  Metadata
                </h4>
                <div
                  className={css({
                    p: '3',
                    bg: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'lg',
                    fontSize: 'xs',
                    fontFamily: 'mono',
                    spaceY: '1',
                  })}
                >
                  <div>
                    <span className={css({ color: 'gray.500' })}>IP Address:</span>{' '}
                    <span className={css({ color: 'gray.300' })}>
                      {selectedRequest.ip_address || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className={css({ color: 'gray.500' })}>User Agent:</span>{' '}
                    <span className={css({ color: 'gray.300' })}>
                      {selectedRequest.user_agent || 'Unknown'}
                    </span>
                  </div>
                  {selectedRequest.response_time_ms !== null && (
                    <div>
                      <span className={css({ color: 'gray.500' })}>Response Time:</span>{' '}
                      <span className={css({ color: 'gray.300' })}>
                        {selectedRequest.response_time_ms}ms
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Headers */}
              <div>
                <h4
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    mb: '2',
                    color: 'gray.300',
                  })}
                >
                  Headers
                </h4>
                <pre
                  className={css({
                    p: '3',
                    bg: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'lg',
                    fontSize: 'xs',
                    fontFamily: 'mono',
                    overflow: 'auto',
                    color: 'gray.300',
                  })}
                >
                  {prettyPrintJson(selectedRequest.headers)}
                </pre>
              </div>

              {/* Query Parameters */}
              {Object.keys(selectedRequest.query_params).length > 0 && (
                <div>
                  <h4
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      mb: '2',
                      color: 'gray.300',
                    })}
                  >
                    Query Parameters
                  </h4>
                  <pre
                    className={css({
                      p: '3',
                      bg: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 'lg',
                      fontSize: 'xs',
                      fontFamily: 'mono',
                      overflow: 'auto',
                      color: 'gray.300',
                    })}
                  >
                    {prettyPrintJson(selectedRequest.query_params)}
                  </pre>
                </div>
              )}

              {/* Body */}
              {selectedRequest.body && (
                <div>
                  <h4
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      mb: '2',
                      color: 'gray.300',
                    })}
                  >
                    Body ({formatBytes(selectedRequest.body_size)})
                  </h4>
                  <pre
                    className={css({
                      p: '3',
                      bg: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 'lg',
                      fontSize: 'xs',
                      fontFamily: 'mono',
                      overflow: 'auto',
                      maxH: '300px',
                      color: 'gray.300',
                    })}
                  >
                    {selectedRequest.body}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={css({
                p: '4',
                borderTop: '1px solid',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                gap: '3',
                justifyContent: 'flex-end',
              })}
            >
              <button
                type="button"
                onClick={() => copyCurl(selectedRequest)}
                className={css({
                  px: '4',
                  py: '2',
                  bg: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: 'lg',
                  color: 'purple.400',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  _hover: {
                    bg: 'rgba(139, 92, 246, 0.2)',
                  },
                })}
              >
                <Copy className={css({ w: '4', h: '4' })} />
                Copy cURL
              </button>

              <button
                type="button"
                onClick={() => exportRequest(selectedRequest)}
                className={css({
                  px: '4',
                  py: '2',
                  bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  borderRadius: 'lg',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  _hover: {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                  },
                })}
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div
        className={css({
          p: { base: '4', sm: '6' },
          bg: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          borderRadius: 'xl',
        })}
      >
        <h3
          className={css({
            fontSize: 'lg',
            fontWeight: 'semibold',
            mb: '3',
            color: 'blue.300',
          })}
        >
          💡 Pro Tips
        </h3>
        <ul className={css({ spaceY: '2', color: 'gray.300', fontSize: 'sm' })}>
          <li>• Webhook endpoints automatically expire after 7 days for security</li>
          <li>• Click on a request to view full details including headers and body</li>
          <li>• Use the response templates to simulate different API responses</li>
          <li>• Inactive webhooks won't accept new requests but keep their history</li>
          <li>• Copy the cURL command to easily recreate requests</li>
        </ul>
      </div>
    </main>
  )
}
