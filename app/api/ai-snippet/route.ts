import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkRateLimit } from '@/lib/rate-limit'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const { prompt, language } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    if (!language) {
      return NextResponse.json({ error: 'No language specified' }, { status: 400 })
    }

    // Define system prompt for code generation
    const systemPrompt = `You are an expert programmer and code assistant. Generate clean, efficient, and well-commented code snippets based on user requirements. Follow best practices for the specified programming language. Always include brief inline comments explaining key parts of the code.

For the response, provide:
1. The code snippet (properly formatted and indented)
2. A brief explanation of how it works

Format your response as JSON with two fields:
- "code": the actual code snippet as a string (with proper line breaks)
- "explanation": a 2-3 sentence explanation of how the code works

Do not include markdown code blocks or backticks in the "code" field - just the raw code.`

    const userPrompt = `Generate a ${language} code snippet for the following requirement:

${prompt}

Ensure the code follows ${language} best practices and conventions.`

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
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No code generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: { code?: string; explanation?: string }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse generated code. Please try again.' },
        { status: 500 }
      )
    }

    const { code, explanation } = parsedContent

    if (!code) {
      return NextResponse.json({ error: 'No code in response' }, { status: 500 })
    }

    return NextResponse.json({
      code,
      language,
      explanation: explanation || 'Code snippet generated successfully.',
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error generating snippet:', error)

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
      { error: 'Failed to generate code snippet. Please try again.' },
      { status: 500 }
    )
  }
}
