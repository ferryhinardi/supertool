import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSupabaseServer } from '@/lib/auth/supabaseServer'
import { getClientIdentifier } from '@/lib/services/api/rate-limiter'
import { checkPremiumAccess, recordUsage } from '@/lib/services/premium-gate'

const DEFAULT_MAX_PAYLOAD_BYTES = 100_000

function getMaxPayloadBytes() {
  const configuredValue = Number(process.env.AI_JSON_ANALYZER_MAX_PAYLOAD_BYTES)

  if (Number.isFinite(configuredValue) && configuredValue > 0) {
    return configuredValue
  }

  return DEFAULT_MAX_PAYLOAD_BYTES
}

function normalizeAnalysisList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    )
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return [value]
  }

  return []
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const clientIdentifier = getClientIdentifier(request)
    const ipAddress = clientIdentifier === 'unknown' ? undefined : clientIdentifier

    let userId: string | undefined

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      const supabase = getSupabaseServer()
      const { data } = await supabase.auth.getUser(token)
      userId = data.user?.id
    }

    const premiumAccess = await checkPremiumAccess({
      userId,
      metricName: 'ai-json-analyzer',
      freeQuotaPerDay: 8,
      ipAddress,
    })

    if (!premiumAccess.allowed) {
      return NextResponse.json(
        {
          status: 'paywall',
          reason: premiumAccess.reason,
          remaining: premiumAccess.remaining,
        },
        { status: 402 }
      )
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
        },
        { status: 500 }
      )
    }

    const rawBody = await request.text()
    const payloadSize = new TextEncoder().encode(rawBody).length

    if (payloadSize > getMaxPayloadBytes()) {
      return NextResponse.json(
        { error: 'JSON payload is too large. Please reduce the size and try again.' },
        { status: 413 }
      )
    }

    let requestBody: { jsonData?: unknown }

    try {
      requestBody = JSON.parse(rawBody) as { jsonData?: unknown }
    } catch (parseError) {
      console.error('Invalid request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body. Please send valid JSON.' },
        { status: 400 }
      )
    }

    const { jsonData } = requestBody

    if (!jsonData) {
      return NextResponse.json({ error: 'No JSON data provided' }, { status: 400 })
    }

    // Validate JSON format
    let parsedJson: unknown
    try {
      parsedJson = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    } catch (parseError) {
      console.error('Invalid JSON format:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON format. Please provide valid JSON data.' },
        { status: 400 }
      )
    }

    // Define system prompt for JSON analysis
    const systemPrompt = `You are an expert data analyst specializing in JSON structure analysis. Analyze the provided JSON data and provide comprehensive insights about its structure, patterns, and relationships.

Format your response as JSON with these exact fields:
- "summary": A 2-3 sentence natural language overview of what this JSON data represents
- "structure": Explanation of the JSON hierarchy (nested objects, arrays, depth levels)
- "patterns": Array patterns, common data types, naming conventions detected
- "insights": Optimization tips, potential issues, data quality observations
- "relationships": How different fields relate to each other, dependencies, logical groupings

Be specific and reference actual field names from the JSON. Provide actionable insights.`

    const userPrompt = `Analyze this JSON data structure and provide detailed insights:

${JSON.stringify(parsedJson, null, 2)}

Provide a comprehensive analysis covering structure, patterns, insights, and relationships.`

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No analysis generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: {
      summary?: string
      structure?: string
      patterns?: string | string[]
      insights?: string | string[]
      relationships?: string | string[]
    }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse analysis. Please try again.' },
        { status: 500 }
      )
    }

    const { summary, structure, patterns, insights, relationships } = parsedContent

    if (!summary || !structure) {
      return NextResponse.json({ error: 'Incomplete analysis response' }, { status: 500 })
    }

    if (userId && premiumAccess.reason === 'subscription') {
      await recordUsage({
        userId,
        metricName: 'ai-json-analyzer',
        quantity: 1,
      })
    }

    return NextResponse.json({
      summary,
      structure: structure || 'No structure analysis available.',
      patterns: normalizeAnalysisList(patterns),
      insights: normalizeAnalysisList(insights),
      relationships: normalizeAnalysisList(relationships),
      usage: response.usage,
      remaining: premiumAccess.remaining,
    })
  } catch (error: unknown) {
    console.error('Error analyzing JSON:', error)

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your configuration.' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze JSON. Please try again.' },
      { status: 500 }
    )
  }
}
