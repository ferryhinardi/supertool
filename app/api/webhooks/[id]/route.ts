import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Handle all HTTP methods
async function handleWebhook(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const params = await context.params
  const endpointId = params.id

  try {
    // Fetch webhook endpoint
    const { data: endpoint, error: fetchError } = await supabaseAdmin
      .from('webhook_endpoints')
      .select('*')
      .eq('id', endpointId)
      .single()

    if (fetchError || !endpoint) {
      return NextResponse.json({ error: 'Webhook endpoint not found' }, { status: 404 })
    }

    // Check if endpoint is active
    if (!endpoint.is_active) {
      return NextResponse.json({ error: 'Webhook endpoint is inactive' }, { status: 410 })
    }

    // Check if endpoint is expired
    const expiresAt = new Date(endpoint.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Webhook endpoint has expired' }, { status: 410 })
    }

    // Extract request data
    const method = request.method
    const url = new URL(request.url)

    // Parse headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Parse query params
    const queryParams: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value
    })

    // Read request body
    let body: string | null = null
    let bodySize = 0
    try {
      const contentType = request.headers.get('content-type') || ''
      if (method !== 'GET' && method !== 'HEAD') {
        if (contentType.includes('application/json')) {
          const jsonBody = await request.json()
          body = JSON.stringify(jsonBody)
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          const formObj: Record<string, string> = {}
          formData.forEach((value, key) => {
            formObj[key] = value.toString()
          })
          body = JSON.stringify(formObj)
        } else {
          body = await request.text()
        }
        bodySize = new TextEncoder().encode(body).length
      }
    } catch (error) {
      console.error('Error reading request body:', error)
      body = '[Error reading body]'
    }

    // Calculate response time
    const responseTime = Date.now() - startTime

    // Log webhook request
    const { error: logError } = await supabaseAdmin.from('webhook_requests').insert({
      endpoint_id: endpointId,
      method,
      headers,
      query_params: queryParams,
      body,
      body_size: bodySize,
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
      response_time_ms: responseTime,
    })

    if (logError) {
      console.error('Error logging webhook request:', logError)
      // Continue anyway - we still want to return the configured response
    }

    // Return configured response
    const responseHeaders = new Headers()
    for (const [key, value] of Object.entries(endpoint.response_headers)) {
      responseHeaders.set(key, String(value))
    }

    return NextResponse.json(endpoint.response_body, {
      status: endpoint.response_status_code,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Export handlers for all HTTP methods
export const GET = handleWebhook
export const POST = handleWebhook
export const PUT = handleWebhook
export const PATCH = handleWebhook
export const DELETE = handleWebhook
export const HEAD = handleWebhook
export const OPTIONS = handleWebhook
