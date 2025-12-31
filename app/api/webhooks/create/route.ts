import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import type { CreateEndpointRequest } from '@/app/tools/development/webhook-tester/templates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    const body: CreateEndpointRequest = await request.json()

    // Validation
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (body.name.length > 100) {
      return NextResponse.json({ error: 'Name must be less than 100 characters' }, { status: 400 })
    }

    // Create webhook endpoint
    const { data: endpoint, error: createError } = await supabaseAdmin
      .from('webhook_endpoints')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        response_status_code: body.response_status_code || 200,
        response_body: body.response_body || { success: true, message: 'Webhook received' },
        response_headers: body.response_headers || { 'Content-Type': 'application/json' },
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating webhook endpoint:', createError)
      return NextResponse.json({ error: 'Failed to create webhook endpoint' }, { status: 500 })
    }

    return NextResponse.json(endpoint)
  } catch (error) {
    console.error('Error in webhook creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    // Fetch user's webhook endpoints
    const { data: endpoints, error: fetchError } = await supabaseAdmin
      .from('webhook_endpoints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching webhook endpoints:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch webhook endpoints' }, { status: 500 })
    }

    return NextResponse.json(endpoints)
  } catch (error) {
    console.error('Error in webhook fetch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
