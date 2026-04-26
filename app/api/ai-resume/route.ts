import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type {
  AIContentRequest,
  AIContentResponse,
} from '@/app/tools/productivity/resume-builder/types'
import { getSupabaseServer } from '@/lib/auth/supabaseServer'
import { checkPremiumAccess, recordUsage } from '@/lib/services/premium-gate'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildPrompt(type: AIContentRequest['type'], context: AIContentRequest['context']) {
  switch (type) {
    case 'achievement':
      return {
        systemPrompt: `You are an expert resume writer. Generate concise, quantified achievement bullet suggestions for a resume.

Format your response as JSON with these fields:
- "suggestions": array of 2-3 achievement bullet strings
- "keywords": array of relevant resume keywords
- "improvements": array of optional coaching notes`,
        userPrompt: `Create resume achievement suggestions for:
Role: ${context.role || 'Professional'}
Company: ${context.company || 'Current company'}
Industry: ${context.industry || 'General'}
Experience: ${context.yearsOfExperience || 0} years
Skills: ${(context.skills || []).join(', ') || 'General skills'}
Current content: ${context.currentContent || 'No current content provided'}`,
      }
    case 'description':
      return {
        systemPrompt: `You are an expert resume writer. Improve resume experience descriptions so they are concise, ATS-friendly, and impact-focused.

Format your response as JSON with these fields:
- "suggestions": array of 2-3 improved description strings
- "keywords": array of relevant ATS keywords
- "improvements": array of optional coaching notes`,
        userPrompt: `Improve this resume description:
Role: ${context.role || 'Professional'}
Company: ${context.company || 'Current company'}
Industry: ${context.industry || 'General'}
Skills: ${(context.skills || []).join(', ') || 'General skills'}
Current content: ${context.currentContent || 'No current content provided'}`,
      }
    case 'keywords':
      return {
        systemPrompt: `You are an expert ATS resume optimizer. Suggest relevant resume keywords for the role and industry.

Format your response as JSON with these fields:
- "suggestions": array of 1-2 short keyword usage suggestions
- "keywords": array of 5-8 relevant ATS keywords
- "improvements": array of optional coaching notes`,
        userPrompt: `Suggest ATS keywords for:
Role: ${context.role || 'Professional'}
Company: ${context.company || 'Target company'}
Industry: ${context.industry || 'General'}
Skills: ${(context.skills || []).join(', ') || 'General skills'}
Current content: ${context.currentContent || 'No current content provided'}`,
      }
    default:
      return {
        systemPrompt: `You are an expert resume writer. Generate a strong professional summary for a resume.

The summary should:
- be 2-4 sentences long
- highlight seniority, strengths, and impact
- stay ATS-friendly and concise

Format your response as JSON with these fields:
- "suggestions": array with 1-2 professional summary strings
- "keywords": array of relevant ATS keywords
- "improvements": array of optional coaching notes`,
        userPrompt: `Generate a resume summary for:
Role: ${context.role || 'Professional'}
Industry: ${context.industry || 'General'}
Experience: ${context.yearsOfExperience || 0} years
Skills: ${(context.skills || []).join(', ') || 'General skills'}
Current content: ${context.currentContent || 'No current content provided'}`,
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || undefined

    let userId: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      const supabase = getSupabaseServer()
      const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = data.user?.id
    }

    const premiumAccess = await checkPremiumAccess({
      userId,
      metricName: 'resume-builder',
      freeQuotaPerDay: 3,
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
        },
        { status: 500 }
      )
    }

    const body = (await request.json()) as AIContentRequest

    if (!body.type) {
      return NextResponse.json({ error: 'No AI content type provided' }, { status: 400 })
    }

    const { systemPrompt, userPrompt } = buildPrompt(body.type, body.context ?? {})

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const result = response.choices[0].message.content
    if (!result) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsedResult = JSON.parse(result) as AIContentResponse

    if (userId) {
      await recordUsage({
        userId,
        metricName: 'resume-builder',
        quantity: 1,
      })
    }

    const remainingAfterUsage =
      userId && premiumAccess.reason === 'within-quota'
        ? Math.max(0, premiumAccess.remaining - 1)
        : premiumAccess.remaining

    return NextResponse.json({
      success: true,
      data: parsedResult,
      remaining: remainingAfterUsage,
    })
  } catch (error) {
    console.error('AI Resume API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate resume content',
      },
      { status: 500 }
    )
  }
}
