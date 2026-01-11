import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI - must be hoisted
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      }
      static APIError = class APIError extends Error {
        status: number
        constructor(status: number, _error: unknown, message: string, _headers: unknown) {
          super(message)
          this.status = status
          this.name = 'APIError'
        }
      }
    },
  }
})

import OpenAI from 'openai'
import { POST } from '../route'

describe('POST /api/ai-pdf-summarize', () => {
  const originalEnv = process.env.OPENAI_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv
  })

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/ai-pdf-summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  const samplePdfText = `This is a sample PDF document content. 
It contains multiple paragraphs discussing various topics about software development.
The document covers best practices for code quality and testing.
It also discusses agile methodologies and continuous integration.
This document is intended for software engineers and technical leads.`

  describe('Configuration Validation', () => {
    it('should return 500 when OPENAI_API_KEY is not configured', async () => {
      process.env.OPENAI_API_KEY = ''

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 5,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })
  })

  describe('Input Validation', () => {
    it('should return 400 when text is missing', async () => {
      const request = createRequest({
        fileName: 'test.pdf',
        pageCount: 5,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No text provided')
    })

    it('should return 400 when text is empty', async () => {
      const request = createRequest({
        text: '',
        fileName: 'test.pdf',
        pageCount: 5,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No text provided')
    })
  })

  describe('Successful Summarization', () => {
    it('should successfully summarize PDF with default options', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'This document discusses software development best practices.',
                keyPoints: [
                  'Code quality is important',
                  'Testing improves reliability',
                  'CI/CD enables faster delivery',
                ],
                documentType: 'Technical Documentation',
                mainTopics: ['Software Development', 'Best Practices', 'CI/CD'],
                actionItems: ['Implement code reviews', 'Set up automated testing'],
                technicalTerms: ['CI/CD', 'Agile', 'Code Quality'],
                pageAnalysis: 'Document is well-structured and complete.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 200,
          completion_tokens: 150,
          total_tokens: 350,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'software-guide.pdf',
        pageCount: 5,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBe('This document discusses software development best practices.')
      expect(data.keyPoints).toHaveLength(3)
      expect(data.documentType).toBe('Technical Documentation')
      expect(data.mainTopics).toContain('Software Development')
      expect(data.actionItems).toHaveLength(2)
      expect(data.technicalTerms).toContain('CI/CD')
      expect(data.pageAnalysis).toContain('well-structured')
      expect(data.metadata).toBeDefined()
      expect(data.metadata.fileName).toBe('software-guide.pdf')
      expect(data.metadata.pageCount).toBe(5)
      expect(data.usage).toBeDefined()
    })

    it('should summarize with short length option', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Brief summary of software development practices.',
                keyPoints: ['Key point 1'],
                documentType: 'Manual',
                mainTopics: ['Development'],
                actionItems: [],
                technicalTerms: [],
                pageAnalysis: 'Complete document.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'guide.pdf',
        pageCount: 2,
        options: { length: 'short' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBeDefined()

      // Verify max_tokens is set for short length
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1500,
        })
      )
    })

    it('should summarize with long length option', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Comprehensive summary of the document...',
                keyPoints: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
                documentType: 'Research Paper',
                mainTopics: ['Topic 1', 'Topic 2', 'Topic 3'],
                actionItems: ['Action 1', 'Action 2'],
                technicalTerms: ['Term 1', 'Term 2'],
                pageAnalysis: 'Extensive analysis...',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 300,
          completion_tokens: 400,
          total_tokens: 700,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'research.pdf',
        pageCount: 50,
        options: { length: 'long' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.keyPoints).toHaveLength(5)

      // Verify max_tokens is set for long length
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 3000,
        })
      )
    })

    it('should include technical terms when includeTechnical is true', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Technical summary with detailed terminology.',
                keyPoints: ['Technical point'],
                documentType: 'Technical Documentation',
                mainTopics: ['Technology'],
                actionItems: [],
                technicalTerms: ['API', 'REST', 'GraphQL', 'Microservices'],
                pageAnalysis: 'Complete.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 200,
          completion_tokens: 100,
          total_tokens: 300,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'api-docs.pdf',
        pageCount: 10,
        options: { includeTechnical: true },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.technicalTerms).toContain('API')
      expect(data.technicalTerms).toContain('REST')
    })

    it('should handle different language option', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Resumen del documento en español.',
                keyPoints: ['Punto clave'],
                documentType: 'Informe',
                mainTopics: ['Desarrollo'],
                actionItems: [],
                technicalTerms: [],
                pageAnalysis: 'Documento completo.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 80,
          total_tokens: 230,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'documento.pdf',
        pageCount: 3,
        options: { language: 'es' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toContain('español')

      // Verify language is included in the prompt
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Language: es'),
            }),
          ]),
        })
      )
    })

    it('should handle missing optional fields in response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Minimal summary without optional fields.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 30,
          total_tokens: 130,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'minimal.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBe('Minimal summary without optional fields.')
      expect(data.keyPoints).toEqual([])
      expect(data.documentType).toBe('Unknown')
      expect(data.mainTopics).toEqual([])
      expect(data.actionItems).toEqual([])
      expect(data.technicalTerms).toEqual([])
      expect(data.pageAnalysis).toBe('')
    })

    it('should handle missing fileName and pageCount', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Summary of anonymous document.',
                keyPoints: ['Point 1'],
                documentType: 'Unknown',
                mainTopics: ['Topic'],
                actionItems: [],
                technicalTerms: [],
                pageAnalysis: 'Document analyzed.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      })

      const request = createRequest({
        text: samplePdfText,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.metadata.fileName).toBe('Unknown')
      expect(data.metadata.pageCount).toBe(0)
    })

    it('should calculate correct metadata statistics', async () => {
      const textWithKnownStats = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10'

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Summary of text with known statistics.',
                keyPoints: [],
                documentType: 'Test',
                mainTopics: [],
                actionItems: [],
                technicalTerms: [],
                pageAnalysis: '',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 30,
          total_tokens: 80,
        },
      })

      const request = createRequest({
        text: textWithKnownStats,
        fileName: 'stats.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.metadata.wordCount).toBe(10)
      expect(data.metadata.charCount).toBe(textWithKnownStats.length)
      expect(data.metadata.estimatedReadingTime).toBe(1) // 10 words / 200 wpm = 0.05, ceil = 1
    })
  })

  describe('OpenAI API Integration', () => {
    it('should call OpenAI with correct parameters for medium length', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Test summary.',
                keyPoints: [],
                documentType: 'Test',
                mainTopics: [],
                actionItems: [],
                technicalTerms: [],
                pageAnalysis: '',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 5,
        options: { length: 'medium' },
      })

      await POST(request)

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('expert document analyzer'),
          },
          {
            role: 'user',
            content: expect.stringContaining(samplePdfText),
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      })
    })

    it('should include file metadata in user prompt', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Summary.',
              }),
            },
          },
        ],
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'report-2024.pdf',
        pageCount: 15,
      })

      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string; content: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('File Name: report-2024.pdf')
      expect(userMessage.content).toContain('Total Pages: 15')
    })
  })

  describe('Response Validation', () => {
    it('should return 500 when OpenAI returns no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('No summary generated')
    })

    it('should return 500 when OpenAI response is not valid JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'not valid json' } }],
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to parse summary')
    })

    it('should return 500 when response has no summary', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                keyPoints: ['Some points'],
                documentType: 'Test',
              }),
            },
          },
        ],
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('No summary in response')
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when OpenAI API key is invalid', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(401, { error: 'invalid_api_key' }, 'Invalid API key', undefined)
      )

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid OpenAI API key')
    })

    it('should return 429 when rate limited', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(429, { error: 'rate_limit' }, 'Rate limit exceeded', undefined)
      )

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should return appropriate status for other OpenAI API errors', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(503, { error: 'service_unavailable' }, 'Service unavailable', undefined)
      )

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toContain('OpenAI API error')
    })

    it('should return 500 for OpenAI API errors without status', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(0, { error: 'unknown' }, 'Unknown error', undefined)
      )

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API error')
    })

    it('should return 500 for non-OpenAI errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'))

      const request = createRequest({
        text: samplePdfText,
        fileName: 'test.pdf',
        pageCount: 1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to generate PDF summary')
    })

    it('should handle request JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai-pdf-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate PDF summary. Please try again.')
    })
  })

  describe('Document Type Classification', () => {
    const documentTypes = [
      { type: 'Research Paper', fileName: 'research-findings.pdf' },
      { type: 'Business Report', fileName: 'quarterly-report.pdf' },
      { type: 'Invoice', fileName: 'invoice-001.pdf' },
      { type: 'Contract', fileName: 'service-agreement.pdf' },
      { type: 'Manual', fileName: 'user-guide.pdf' },
    ]

    documentTypes.forEach(({ type, fileName }) => {
      it(`should classify document as ${type}`, async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: `Summary of ${type.toLowerCase()}.`,
                  keyPoints: ['Key point'],
                  documentType: type,
                  mainTopics: ['Topic'],
                  actionItems: [],
                  technicalTerms: [],
                  pageAnalysis: 'Complete.',
                }),
              },
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        })

        const request = createRequest({
          text: `This is a ${type.toLowerCase()} document.`,
          fileName,
          pageCount: 5,
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.documentType).toBe(type)
      })
    })
  })

  describe('Summary Options Combinations', () => {
    it('should handle all options enabled', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Comprehensive technical summary.',
                keyPoints: Array(10).fill('Key point'),
                documentType: 'Technical Documentation',
                mainTopics: ['Topic 1', 'Topic 2', 'Topic 3'],
                actionItems: ['Action 1', 'Action 2'],
                technicalTerms: ['Term 1', 'Term 2', 'Term 3'],
                pageAnalysis: 'Detailed analysis of document structure.',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 500,
          completion_tokens: 500,
          total_tokens: 1000,
        },
      })

      const request = createRequest({
        text: samplePdfText,
        fileName: 'comprehensive.pdf',
        pageCount: 100,
        options: {
          length: 'long',
          includeTechnical: true,
          language: 'en',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.keyPoints).toHaveLength(10)
      expect(data.technicalTerms).toHaveLength(3)
      expect(data.mainTopics).toHaveLength(3)

      // Verify max_tokens is set for long length
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 3000,
        })
      )
    })
  })
})
