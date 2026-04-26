import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSupabaseServer } from '@/lib/auth/supabaseServer'
import { checkPremiumAccess, recordUsage } from '@/lib/services/premium-gate'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
      metricName: 'ai-image-caption',
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

    const { image, captionType } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be a base64-encoded image.' },
        { status: 400 }
      )
    }

    // Define prompts based on caption type
    const prompts = {
      altText:
        'Generate a concise, descriptive alt text for this image suitable for accessibility (screen readers). Focus on the main subject and important details. Keep it under 125 characters. Do not include phrases like "image of" or "picture of".',
      detailed:
        'Provide a detailed, descriptive caption for this image. Include information about the subject, setting, colors, mood, composition, and any notable details. Write 2-3 sentences.',
      seo: 'Generate an SEO-optimized caption for this image that includes relevant keywords while remaining natural and descriptive. Focus on what makes this image searchable and relevant. Write 1-2 sentences.',
      social:
        'Create an engaging social media caption for this image. Make it catchy, relatable, and shareable while accurately describing the content. Use a conversational tone. Write 1-2 sentences.',
    }

    const prompt = prompts[captionType as keyof typeof prompts] || prompts.detailed

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'low', // Use low detail for faster/cheaper processing
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const caption = response.choices[0]?.message?.content

    if (!caption) {
      return NextResponse.json({ error: 'No caption generated' }, { status: 500 })
    }

    if (userId) {
      await recordUsage({
        userId,
        metricName: 'ai-image-caption',
        quantity: 1,
      })
    }

    const remainingAfterUsage =
      userId && premiumAccess.reason === 'within-quota'
        ? Math.max(0, premiumAccess.remaining - 1)
        : premiumAccess.remaining

    return NextResponse.json({
      caption,
      usage: response.usage,
      remaining: remainingAfterUsage,
    })
  } catch (error: unknown) {
    console.error('Error generating caption:', error)

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
      { error: 'Failed to generate caption. Please try again.' },
      { status: 500 }
    )
  }
}
