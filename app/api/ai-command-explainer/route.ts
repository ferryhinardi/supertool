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

    const { command } = await request.json()

    if (!command) {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 })
    }

    // Define system prompt for command explanation
    const systemPrompt = `You are an expert systems administrator and CLI command explainer. Analyze and explain complex command-line commands (bash, git, docker, kubectl, etc.) in plain English. Break down each component, flag, and argument clearly.

For the response, provide:
1. A brief summary of what the command does
2. A detailed breakdown of each part of the command
3. Any safety warnings if the command could be dangerous or destructive
4. Alternative or safer commands if applicable

Format your response as JSON with these fields:
- "summary": A 1-2 sentence overview of what the command does
- "breakdown": An array of objects, each containing:
  - "component": The part of the command (e.g., "git", "-f", "origin main")
  - "explanation": What this component does
- "warnings": An array of warning strings (if any safety concerns exist, otherwise empty array)
- "alternatives": An array of alternative command strings (if applicable, otherwise empty array)
- "commandType": The type of command (e.g., "git", "bash", "docker", "kubectl", "general")

Be concise but thorough. Focus on practical understanding.`

    const userPrompt = `Explain this command:

${command}

Provide a clear breakdown suitable for users learning about CLI commands.`

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
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No explanation generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: {
      summary?: string
      breakdown?: Array<{ component: string; explanation: string }>
      warnings?: string[]
      alternatives?: string[]
      commandType?: string
    }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse explanation. Please try again.' },
        { status: 500 }
      )
    }

    const { summary, breakdown, warnings, alternatives, commandType } = parsedContent

    if (!summary || !breakdown) {
      return NextResponse.json({ error: 'Incomplete explanation in response' }, { status: 500 })
    }

    return NextResponse.json({
      summary,
      breakdown,
      warnings: warnings || [],
      alternatives: alternatives || [],
      commandType: commandType || 'general',
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error explaining command:', error)

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
      { error: 'Failed to explain command. Please try again.' },
      { status: 500 }
    )
  }
}
