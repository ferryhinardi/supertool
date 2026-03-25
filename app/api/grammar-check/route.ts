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

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Validate text length (max 10000 characters)
    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      )
    }

    // Define system prompt for grammar and spelling check
    const systemPrompt = `You are an expert grammar and spelling checker. Analyze the provided text and identify all issues with:
1. Grammar errors (subject-verb agreement, tense consistency, sentence structure, etc.)
2. Spelling mistakes
3. Punctuation errors
4. Style improvements (wordiness, passive voice, unclear phrasing)
5. Clarity and readability issues

For each issue found, provide:
- The problematic text segment
- The type of issue (grammar, spelling, punctuation, style, clarity)
- A brief explanation of the issue
- A suggested correction
- The position in the text (character offset and length)

Format your response as JSON with:
- "issues": an array of objects, each containing:
  - "text": the problematic text segment
  - "type": one of "grammar", "spelling", "punctuation", "style", "clarity"
  - "message": brief explanation of the issue
  - "suggestion": the corrected text
  - "offset": character position where the issue starts
  - "length": length of the problematic text
- "correctedText": the full text with all corrections applied
- "summary": an object with counts of each issue type

If no issues are found, return an empty issues array.
Do not add extra commentary or explanations outside the JSON structure.`

    const userPrompt = `Check the following text for grammar, spelling, and style issues:

${text}`

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
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No analysis generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: {
      issues?: Array<{
        text: string
        type: string
        message: string
        suggestion: string
        offset: number
        length: number
      }>
      correctedText?: string
      summary?: Record<string, number>
    }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse grammar check results. Please try again.' },
        { status: 500 }
      )
    }

    const { issues, correctedText, summary } = parsedContent

    if (!issues) {
      return NextResponse.json({ error: 'No issues data in response' }, { status: 500 })
    }

    return NextResponse.json({
      issues,
      correctedText: correctedText || text,
      summary: summary || {},
      originalLength: text.length,
      issueCount: issues.length,
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error checking grammar:', error)

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
      { error: 'Failed to check grammar. Please try again.' },
      { status: 500 }
    )
  }
}
