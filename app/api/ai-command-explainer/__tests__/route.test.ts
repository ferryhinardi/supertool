import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI before importing the route - use vi.hoisted for proper hoisting
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

describe('AI Command Explainer API Route', () => {
  const originalEnv = process.env.OPENAI_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    if (originalEnv) {
      process.env.OPENAI_API_KEY = originalEnv
    } else {
      delete process.env.OPENAI_API_KEY
    }
  })

  describe('POST /api/ai-command-explainer', () => {
    it('should return 500 if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })

    it('should return 400 if command is missing', async () => {
      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No command provided')
    })

    it('should return 400 if command exceeds maximum length', async () => {
      const longCommand = 'a'.repeat(2001)
      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: longCommand }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Command is too long')
    })

    it('should successfully explain a simple bash command', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                commandType: 'bash',
                overallPurpose:
                  'Lists all files in the current directory with detailed information.',
                breakdown: [
                  { part: 'ls', explanation: 'List directory contents' },
                  { part: '-la', explanation: 'Show all files including hidden, in long format' },
                ],
                parameters: [
                  { parameter: '-l', description: 'Use long listing format' },
                  { parameter: '-a', description: 'Show all files including hidden ones' },
                ],
                safetyWarnings: [],
                alternatives: ['ls -lah for human-readable sizes'],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.commandType).toBe('bash')
      expect(data.overallPurpose).toContain('Lists all files')
      expect(data.breakdown).toHaveLength(2)
      expect(data.parameters).toHaveLength(2)
      expect(data.safetyWarnings).toHaveLength(0)
      expect(data.alternatives).toHaveLength(1)
      expect(data.usage).toBeDefined()
    })

    it('should explain a dangerous command with safety warnings', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                commandType: 'bash',
                overallPurpose: 'Forcefully removes all files and directories recursively.',
                breakdown: [
                  { part: 'rm', explanation: 'Remove files or directories' },
                  { part: '-rf', explanation: 'Recursive and force flags' },
                  { part: '/', explanation: 'Root directory' },
                ],
                parameters: [
                  { parameter: '-r', description: 'Remove directories recursively' },
                  { parameter: '-f', description: 'Force removal without prompting' },
                ],
                safetyWarnings: [
                  'EXTREMELY DANGEROUS: This command will delete all files on the system',
                  'This operation is irreversible',
                ],
                alternatives: ['Use rm with specific paths instead of root directory'],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 80, total_tokens: 180 },
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'rm -rf /' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.commandType).toBe('bash')
      expect(data.safetyWarnings).toHaveLength(2)
      expect(data.safetyWarnings[0]).toContain('DANGEROUS')
    })

    it('should explain a git command', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                commandType: 'git',
                overallPurpose: 'Commits staged changes with a message.',
                breakdown: [
                  { part: 'git', explanation: 'Git version control' },
                  { part: 'commit', explanation: 'Create a new commit' },
                  { part: '-m "message"', explanation: 'Specify commit message inline' },
                ],
                parameters: [{ parameter: '-m', description: 'Commit message flag' }],
                safetyWarnings: [],
                alternatives: [],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 60, total_tokens: 160 },
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'git commit -m "initial commit"' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.commandType).toBe('git')
      expect(data.breakdown).toHaveLength(3)
    })

    it('should explain a docker command', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                commandType: 'docker',
                overallPurpose: 'Runs a container from an image with port mapping.',
                breakdown: [
                  { part: 'docker run', explanation: 'Run a new container' },
                  { part: '-p 8080:80', explanation: 'Map port 8080 to 80' },
                  { part: 'nginx', explanation: 'The image to run' },
                ],
                parameters: [{ parameter: '-p', description: 'Publish container ports to host' }],
                safetyWarnings: [],
                alternatives: ['docker compose for complex setups'],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 70, total_tokens: 170 },
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'docker run -p 8080:80 nginx' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.commandType).toBe('docker')
    })

    it('should handle command at maximum allowed length', async () => {
      const maxCommand = 'a'.repeat(2000)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                commandType: 'unknown',
                overallPurpose: 'A very long command.',
                breakdown: [],
                parameters: [],
                safetyWarnings: [],
                alternatives: [],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: maxCommand }),
      })

      const response = await POST(request as unknown as NextRequest)

      // Should not return 400 for command at exactly max length
      expect(response.status).not.toBe(400)
    })

    it('should return 500 if OpenAI returns no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No explanation generated')
    })

    it('should return 500 if OpenAI returns invalid JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'invalid json content' } }],
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to parse explanation')
    })

    it('should return 500 if OpenAI response is missing required fields', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                breakdown: [],
                parameters: [],
              }),
            },
          },
        ],
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Incomplete explanation in response')
    })

    it('should handle missing optional fields gracefully', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                commandType: 'bash',
                overallPurpose: 'Lists files.',
                // Missing breakdown, parameters, safetyWarnings, alternatives
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.commandType).toBe('bash')
      expect(data.breakdown).toEqual([])
      expect(data.parameters).toEqual([])
      expect(data.safetyWarnings).toEqual([])
      expect(data.alternatives).toEqual([])
    })

    it('should handle OpenAI 401 authentication error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(401, undefined, 'Invalid API key', undefined)
      )

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid OpenAI API key')
    })

    it('should handle OpenAI 429 rate limit error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(429, undefined, 'Rate limit exceeded', undefined)
      )

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should handle other OpenAI API errors', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(503, undefined, 'Service unavailable', undefined)
      )

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toContain('OpenAI API error')
    })

    it('should handle generic errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'))

      const request = new Request('http://localhost:3000/api/ai-command-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'ls -la' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to explain command')
    })
  })
})
