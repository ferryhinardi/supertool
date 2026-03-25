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

    const { text, tone, style, variants } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (!tone) {
      return NextResponse.json({ error: 'No tone specified' }, { status: 400 })
    }

    // Validate text length (max 5000 characters for safety)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      )
    }

    // Build tone description based on selection
    const toneDescriptions: Record<string, string> = {
      professional: 'professional, formal, and business-appropriate',
      casual: 'casual, conversational, and friendly',
      friendly: 'warm, friendly, and approachable',
      formal: 'formal, structured, and academic',
      persuasive: 'persuasive, compelling, and action-oriented',
      creative: 'creative, imaginative, and expressive',
      concise: 'concise, brief, and to-the-point',
      detailed: 'detailed, comprehensive, and thorough',
      humorous: 'humorous, witty, and entertaining',
      empathetic: 'empathetic, understanding, and compassionate',
    }

    const toneDescription = toneDescriptions[tone] || 'appropriate and engaging'

    // Build style instruction
    let styleInstruction = ''
    if (style === 'simple') {
      styleInstruction = 'Use simple, easy-to-understand language. Avoid complex words and jargon.'
    } else if (style === 'advanced') {
      styleInstruction =
        'Use sophisticated vocabulary and complex sentence structures. Make it sound professional and polished.'
    } else {
      styleInstruction = 'Use clear, balanced language that is neither too simple nor too complex.'
    }

    // Number of variants to generate (1-3)
    const numVariants = Math.min(Math.max(1, variants || 1), 3)

    // Define system prompt for text rewriting
    const systemPrompt = `You are an expert copywriter and content editor. Your task is to rewrite text while:
1. Preserving the original meaning and key information
2. Adjusting the tone to be ${toneDescription}
3. ${styleInstruction}
4. Maintaining clarity and readability
5. Keeping the same approximate length (±20%)
6. Fixing any grammar or spelling errors in the original

Generate ${numVariants} different ${numVariants > 1 ? 'variants' : 'variant'} of the rewritten text.

Format your response as JSON with:
- "variants": an array of ${numVariants} rewritten text ${numVariants > 1 ? 'versions' : 'version'}
- "improvements": a brief list of 2-3 key improvements made

Do not add extra commentary or explanations outside the JSON structure.`

    const userPrompt = `Rewrite the following text with a ${tone} tone:

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
      max_tokens: 2000,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No rewritten text generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: { variants?: string[]; improvements?: string[] }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse rewritten text. Please try again.' },
        { status: 500 }
      )
    }

    const { variants: rewrittenVariants, improvements } = parsedContent

    if (!rewrittenVariants || rewrittenVariants.length === 0) {
      return NextResponse.json({ error: 'No variants in response' }, { status: 500 })
    }

    return NextResponse.json({
      variants: rewrittenVariants,
      improvements: improvements || [],
      tone,
      style: style || 'balanced',
      originalLength: text.length,
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error rewriting text:', error)

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
      { error: 'Failed to rewrite text. Please try again.' },
      { status: 500 }
    )
  }
}
