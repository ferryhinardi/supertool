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

    const { text, fileName, pageCount, options } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided from PDF' }, { status: 400 })
    }

    // Default options
    const summaryLength = options?.length || 'medium' // short, medium, long
    const includeTechnical = options?.includeTechnical || false
    const language = options?.language || 'en'

    // Define system prompt for PDF summarization
    const systemPrompt = `You are an expert document analyzer specializing in PDF content analysis and summarization. 
Your task is to provide clear, actionable insights from PDF documents.

Analyze the document and provide a comprehensive summary with the following structure:

Format your response as JSON with these fields:
- "summary": The main summary of the document content
- "keyPoints": Array of 5-10 most important points from the document
- "documentType": Classification of document type (e.g., "Research Paper", "Business Report", "Invoice", "Contract", "Manual", "Academic", "Technical Documentation", etc.)
- "mainTopics": Array of 3-5 main topics/themes covered
- "actionItems": Array of action items or recommendations (if applicable, otherwise empty array)
- "technicalTerms": Array of important technical terms or jargon used (if applicable)
- "pageAnalysis": Brief analysis noting if document is well-structured, complete, or if any sections appear cut off

Guidelines:
- Be factually accurate - only include information present in the document
- Use clear, professional language
- Identify the document's purpose and primary message
- Highlight critical information that readers should know
- Note any data, statistics, or figures that are significant
${includeTechnical ? '- Include technical details and terminology analysis' : '- Keep language accessible and non-technical'}
- If document appears incomplete or truncated, note this in pageAnalysis`

    const userPrompt = `Analyze this PDF document and provide a comprehensive summary.

Document Metadata:
- File Name: ${fileName || 'Unknown'}
- Total Pages: ${pageCount || 'Unknown'}
- Summary Length: ${summaryLength}
- Language: ${language}

Document Content:
${text}

Provide analysis in ${language === 'en' ? 'English' : language} following the JSON format specified.`

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
      max_tokens: summaryLength === 'long' ? 3000 : summaryLength === 'medium' ? 2000 : 1500,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No summary generated' }, { status: 500 })
    }

    // Parse the JSON response
    let parsedContent: {
      summary?: string
      keyPoints?: string[]
      documentType?: string
      mainTopics?: string[]
      actionItems?: string[]
      technicalTerms?: string[]
      pageAnalysis?: string
    }
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse summary. Please try again.' },
        { status: 500 }
      )
    }

    const {
      summary,
      keyPoints,
      documentType,
      mainTopics,
      actionItems,
      technicalTerms,
      pageAnalysis,
    } = parsedContent

    if (!summary) {
      return NextResponse.json({ error: 'No summary in response' }, { status: 500 })
    }

    // Calculate statistics
    const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length
    const charCount = text.length
    const estimatedReadingTime = Math.ceil(wordCount / 200) // Average reading speed

    return NextResponse.json({
      summary,
      keyPoints: keyPoints || [],
      documentType: documentType || 'Unknown',
      mainTopics: mainTopics || [],
      actionItems: actionItems || [],
      technicalTerms: technicalTerms || [],
      pageAnalysis: pageAnalysis || '',
      metadata: {
        fileName: fileName || 'Unknown',
        pageCount: pageCount || 0,
        wordCount,
        charCount,
        estimatedReadingTime,
      },
      usage: response.usage,
    })
  } catch (error: unknown) {
    console.error('Error generating PDF summary:', error)

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
      { error: 'Failed to generate PDF summary. Please try again.' },
      { status: 500 }
    )
  }
}
