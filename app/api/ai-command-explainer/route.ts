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

    // Validate command length (max 2000 characters for safety)
    if (command.length > 2000) {
      return NextResponse.json(
        { error: 'Command is too long. Maximum 2000 characters allowed.' },
        { status: 400 }
      )
    }

    // Define system prompt for command explanation
    const systemPrompt = `You are an expert in command-line interfaces, shell scripting, and system administration. Your task is to explain CLI commands in a clear, educational way.

When given a command, provide a comprehensive explanation with:
1. **Command Type**: Identify the shell/tool (bash, git, docker, kubectl, npm, etc.)
2. **Overall Purpose**: What does this command accomplish?
3. **Breakdown**: Explain each part of the command (command, flags, arguments, operators)
4. **Parameters**: Detail what each flag/option does
5. **Safety Warnings**: Highlight any potentially dangerous operations (deletions, overwrites, sudo, etc.)
6. **Alternatives**: Suggest safer or more common alternatives if applicable

Format your response as JSON with:
- "commandType": string (e.g., "bash", "git", "docker")
- "overallPurpose": string (1-2 sentences explaining what the command does)
- "breakdown": array of objects with "part" (string) and "explanation" (string)
- "parameters": array of objects with "parameter" (string) and "description" (string)
- "safetyWarnings": array of strings (warnings about dangerous operations, empty array if none)
- "alternatives": array of strings (alternative commands or safer approaches, empty array if none)

Be concise but thorough. Use plain English. Assume the user has basic command-line knowledge but wants to understand the specifics.

Do not add extra commentary outside the JSON structure.`

    const userPrompt = `Explain this command:

${command}`

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
      commandType?: string
      overallPurpose?: string
      breakdown?: Array<{ part: string; explanation: string }>
      parameters?: Array<{ parameter: string; description: string }>
      safetyWarnings?: string[]
      alternatives?: string[]
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

    const { commandType, overallPurpose, breakdown, parameters, safetyWarnings, alternatives } =
      parsedContent

    if (!commandType || !overallPurpose) {
      return NextResponse.json({ error: 'Incomplete explanation in response' }, { status: 500 })
    }

    return NextResponse.json({
      commandType,
      overallPurpose,
      breakdown: breakdown || [],
      parameters: parameters || [],
      safetyWarnings: safetyWarnings || [],
      alternatives: alternatives || [],
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
