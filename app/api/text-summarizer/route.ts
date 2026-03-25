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

    const { text, length, format } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (!length || !['short', 'medium', 'long'].includes(length)) {
      return NextResponse.json({ error: 'Invalid length option' }, { status: 400 })
    }

    if (!format || !['bullets', 'paragraph'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format option' }, { status: 400 })
    }

    // Define length instructions
    const lengthInstructions: Record<string, string> = {
      short: '2-3 sentences or 3-4 bullet points',
      medium: '1 paragraph (4-6 sentences) or 5-7 bullet points',
      long: '2-3 paragraphs or 8-12 bullet points',
    }

    // Define system prompt for summarization
    const systemPrompt = `You are an expert text summarizer. Your task is to create clear, concise, and accurate summaries that capture the main ideas and key points of the provided text. Focus on the most important information and present it in a well-structured way.

For the response, provide:
1. A summary in the requested format and length
2. Key highlights (3-5 main points from the text)

Format your response as JSON with two fields:
- "summary": the main summary text
- "highlights": an array of 3-5 key points (strings)

Guidelines:
- Maintain factual accuracy - don't add information not in the original text
- Use clear, professional language
- For bullet points, start each point with a capital letter and end with a period
- For paragraphs, use proper sentence structure and transitions
- Capture the essence and main takeaways of the text`

    const formatInstruction =
      format === 'bullets'
        ? 'Format the summary as clear bullet points. Each bullet should be a complete thought.'
        : 'Format the summary as a cohesive paragraph with proper transitions between ideas.'

    const userPrompt = `Summarize the following text. 
Length: ${lengthInstructions[length]}
Format: ${formatInstruction}

Text to summarize:
${text}

Remember to provide both the summary and key highlights in JSON format.`

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
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No summary generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: { summary?: string; highlights?: string[] }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse summary. Please try again.' },
        { status: 500 }
      )
    }

    const { summary, highlights } = parsedContent

    if (!summary) {
      return NextResponse.json({ error: 'No summary in response' }, { status: 500 })
    }

    // Calculate word and character counts
    const wordCount = summary.split(/\s+/).filter((word) => word.length > 0).length
    const charCount = summary.length

    return NextResponse.json({
      summary,
      highlights: highlights || [],
      stats: {
        wordCount,
        charCount,
        originalWordCount: text.split(/\s+/).filter((word: string) => word.length > 0).length,
        originalCharCount: text.length,
      },
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error generating summary:', error)

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
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    )
  }
}
