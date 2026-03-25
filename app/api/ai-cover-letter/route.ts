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

    const { action, data } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'No action provided' }, { status: 400 })
    }

    let systemPrompt = ''
    let userPrompt = ''

    // Generate different content based on action type
    switch (action) {
      case 'generate-opening':
        systemPrompt = `You are an expert career coach and professional writer specializing in cover letters. Generate a compelling opening paragraph for a cover letter that immediately captures attention and expresses genuine interest in the position.

The opening should:
- Be 2-4 sentences long
- Express enthusiasm for the specific role and company
- Briefly mention a key qualification or achievement
- Set a professional yet engaging tone

Format your response as JSON with one field:
- "opening": the opening paragraph as a string`

        userPrompt = `Generate an opening paragraph for a cover letter with the following details:

Position: ${data.position || 'the position'}
Company: ${data.companyName || 'the company'}
Candidate Name: ${data.fullName || 'the candidate'}
Key Skills/Experience: ${data.context || 'relevant experience'}

Make it compelling and specific to this role.`
        break

      case 'generate-body':
        systemPrompt = `You are an expert career coach and professional writer specializing in cover letters. Generate 2-3 body paragraphs that demonstrate qualifications and fit for the position.

The body should:
- Highlight 2-3 key achievements or experiences
- Connect qualifications to the job requirements
- Show understanding of the company/role
- Be specific and results-oriented
- Be 150-250 words total

Format your response as JSON with one field:
- "body": the body paragraphs as a string (use double line breaks between paragraphs)`

        userPrompt = `Generate body paragraphs for a cover letter with the following details:

Position: ${data.position || 'the position'}
Company: ${data.companyName || 'the company'}
Department: ${data.department || 'the team'}
Candidate Background: ${data.context || 'relevant experience and skills'}

Make it specific and achievement-focused.`
        break

      case 'generate-closing':
        systemPrompt = `You are an expert career coach and professional writer specializing in cover letters. Generate a strong closing paragraph that encourages action and expresses gratitude.

The closing should:
- Be 2-3 sentences long
- Express enthusiasm for next steps
- Thank the reader for their time and consideration
- Maintain a confident yet respectful tone

Format your response as JSON with one field:
- "closing": the closing paragraph as a string`

        userPrompt = `Generate a closing paragraph for a cover letter for the following position:

Position: ${data.position || 'the position'}
Company: ${data.companyName || 'the company'}
Hiring Manager: ${data.hiringManagerName || 'Hiring Manager'}

Make it professional and action-oriented.`
        break

      case 'improve-content':
        systemPrompt = `You are an expert editor specializing in cover letters. Improve the provided cover letter content by:
- Strengthening weak language
- Making it more specific and impactful
- Ensuring professional tone
- Removing clichés and generic phrases
- Keeping the same general structure and length

Format your response as JSON with three fields:
- "improved": the improved version
- "suggestions": array of 3-5 specific improvements made
- "score": a score from 1-10 rating the original content`

        userPrompt = `Improve this cover letter content:

${data.content}

Position: ${data.position || 'the position'}
Company: ${data.companyName || 'the company'}`
        break

      case 'check-tone':
        systemPrompt = `You are an expert career coach. Analyze the tone of the provided cover letter content and provide feedback.

Format your response as JSON with these fields:
- "tone": describe the overall tone (e.g., "professional and enthusiastic", "too formal", "too casual")
- "score": a score from 1-10 rating the appropriateness of the tone
- "suggestions": array of 2-4 specific suggestions to improve the tone
- "strengths": array of 1-2 things that are working well`

        userPrompt = `Analyze the tone of this cover letter:

${data.content}

Industry/Company Context: ${data.companyName || 'corporate'} - ${data.department || 'general'}`
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

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
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const result = response.choices[0].message.content
    if (!result) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsedResult = JSON.parse(result)

    return NextResponse.json({
      success: true,
      data: parsedResult,
    })
  } catch (error) {
    console.error('AI Cover Letter API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate content',
      },
      { status: 500 }
    )
  }
}
