import { type NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

// AI Image Generation API Route using OpenAI DALL-E
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests per IP per minute to protect OpenAI quota
    const rateLimitResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }
    const body = await request.json()
    const { prompt } = body

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (prompt.length < 3 || prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt must be between 3 and 1000 characters' },
        { status: 400 }
      )
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
          details: 'Contact administrator to enable AI image generation.',
        },
        { status: 503 }
      )
    }

    // Call OpenAI DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)

      // Handle specific OpenAI errors
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your configuration.' },
          { status: 401 }
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded. Please try again later.',
            details: 'Too many requests to OpenAI API.',
          },
          { status: 429 }
        )
      }

      if (response.status === 400) {
        return NextResponse.json(
          {
            error: 'Invalid prompt or request.',
            details: errorData.error?.message || 'Please try a different prompt.',
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to generate image',
          details: errorData.error?.message || 'Unknown error occurred',
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract image URL from response
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL returned from OpenAI' }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      model: 'dall-e-3',
      size: '1024x1024',
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI image generation error:', error)

    // Handle network errors or unexpected issues
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to generate image',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while generating image' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    },
    { status: 405 }
  )
}
