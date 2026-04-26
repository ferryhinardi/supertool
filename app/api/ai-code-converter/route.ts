import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type {
  ConversionOptions,
  ConversionResponse,
} from '@/app/tools/development/ai-code-converter/templates'
import { generateSystemPrompt } from '@/app/tools/development/ai-code-converter/templates'
import { getSupabaseServer } from '@/lib/auth/supabaseServer'
import { checkPremiumAccess, recordUsage } from '@/lib/services/premium-gate'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('authorization')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || undefined

    let userId: string | undefined

    if (authorizationHeader?.startsWith('Bearer ')) {
      const token = authorizationHeader.slice('Bearer '.length)
      const supabase = getSupabaseServer()
      const {
        data: { user },
      } = await supabase.auth.getUser(token)
      userId = user?.id
    }

    const premiumAccess = await checkPremiumAccess({
      userId,
      metricName: 'ai-code-converter',
      freeQuotaPerDay: 10,
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

    const body = await request.json()
    const {
      sourceCode,
      sourceLanguage,
      targetLanguage,
      options,
    }: {
      sourceCode: string
      sourceLanguage: string
      targetLanguage: string
      options: ConversionOptions
    } = body

    // Validation
    if (!sourceCode || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceCode, sourceLanguage, or targetLanguage' },
        { status: 400 }
      )
    }

    // Validate source code length (max 10000 characters for safety)
    if (sourceCode.length > 10000) {
      return NextResponse.json(
        { error: 'Source code is too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      )
    }

    // Check if converting to the same language
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json(
        { error: 'Source and target languages cannot be the same.' },
        { status: 400 }
      )
    }

    // Generate system prompt based on options
    const systemPrompt = generateSystemPrompt(sourceLanguage, targetLanguage, options)

    const userPrompt = `Convert this code:

\`\`\`${sourceLanguage}
${sourceCode}
\`\`\`

Convert it to ${targetLanguage}.`

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
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No conversion generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: {
      convertedCode?: string
      explanation?: string
      warnings?: string[]
    }

    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse conversion. Please try again.' },
        { status: 500 }
      )
    }

    const { convertedCode, explanation, warnings } = parsedContent

    if (!convertedCode) {
      return NextResponse.json(
        { error: 'No converted code in response. Please try again.' },
        { status: 500 }
      )
    }

    const result: ConversionResponse = {
      convertedCode,
      explanation: explanation || undefined,
      warnings: warnings || [],
      usage: response.usage
        ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
          }
        : undefined,
    }

    if (userId) {
      await recordUsage({
        userId,
        metricName: 'ai-code-converter',
        quantity: 1,
      })
    }

    const remainingAfterUsage =
      userId && premiumAccess.reason === 'within-quota'
        ? Math.max(0, premiumAccess.remaining - 1)
        : premiumAccess.remaining

    return NextResponse.json({
      ...result,
      remaining: remainingAfterUsage,
    })
  } catch (error: unknown) {
    console.error('Error converting code:', error)

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
      { error: 'Failed to convert code. Please try again.' },
      { status: 500 }
    )
  }
}
