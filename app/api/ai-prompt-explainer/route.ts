import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
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

    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    // Validate prompt length (max 5000 characters)
    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      )
    }

    // Define system prompt for prompt analysis
    const systemPrompt = `You are an expert in prompt engineering and AI interaction optimization. Analyze user prompts and provide constructive feedback on how to improve them for better AI model results.

Evaluate prompts based on:
1. Clarity - Is the intent clear and unambiguous?
2. Specificity - Are the requirements specific enough?
3. Context - Is sufficient context provided?

For the response, provide:
1. Overall analysis of the prompt's quality
2. Scores for clarity, specificity, and context (1-10 scale)
3. Specific suggestions for improvement
4. Best practices that apply to this type of prompt
5. An optimized version of the prompt

Format your response as JSON with these fields:
- "analysis": A 2-3 sentence overall assessment of the prompt
- "structure": An object containing:
  - "clarity": Number (1-10)
  - "specificity": Number (1-10)
  - "context": Number (1-10)
- "suggestions": An array of specific improvement suggestions (3-5 items)
- "bestPractices": An array of prompt engineering best practices applicable to this prompt (2-4 items)
- "optimizedPrompt": An improved version of the prompt that demonstrates the suggestions

Be constructive and educational. Focus on practical improvements.`

    const userPrompt = `Analyze and optimize this AI prompt:

"${prompt}"

Provide a comprehensive analysis with actionable suggestions for improvement.`

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
      return NextResponse.json({ error: 'No analysis generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: {
      analysis?: string
      structure?: {
        clarity: number
        specificity: number
        context: number
      }
      suggestions?: string[]
      bestPractices?: string[]
      optimizedPrompt?: string
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

    const { analysis, structure, suggestions, bestPractices, optimizedPrompt } = parsedContent

    if (!analysis || !structure || !optimizedPrompt) {
      return NextResponse.json({ error: 'Incomplete analysis in response' }, { status: 500 })
    }

    return NextResponse.json({
      analysis,
      structure,
      suggestions: suggestions || [],
      bestPractices: bestPractices || [],
      optimizedPrompt,
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error analyzing prompt:', error)

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
      { error: 'Failed to analyze prompt. Please try again.' },
      { status: 500 }
    )
  }
}
