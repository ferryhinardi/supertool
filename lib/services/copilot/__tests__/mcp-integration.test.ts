/**
 * MCP Integration Tests
 *
 * Tests for the MCP (Model Context Protocol) integration with OpenAI function calling.
 * Covers:
 * - convertMcpToolsToOpenAI: Converts MCP tool definitions to OpenAI format
 * - executeToolCalls: Executes tool calls from OpenAI responses
 */

import type OpenAI from 'openai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MCPToolDefinition, ToolCall, ToolResult } from '../types'

// Mock the MCP tools module
vi.mock('../mcp-tools', () => ({
  getMCPToolRegistry: vi.fn(),
}))

describe('MCP Integration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('convertMcpToolsToOpenAI', () => {
    it('should convert MCP tool definitions to OpenAI function calling format', async () => {
      const mockToolDefinitions: Omit<MCPToolDefinition, 'handler'>[] = [
        {
          name: 'get_repository',
          description: 'Get repository information',
          inputSchema: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'list_issues',
          description: 'List issues in a repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              state: { type: 'string', enum: ['open', 'closed', 'all'] },
            },
            required: ['owner', 'repo'],
          },
        },
      ]

      const mockRegistry = {
        getToolDefinitions: vi.fn().mockReturnValue(mockToolDefinitions),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { convertMcpToolsToOpenAI } = await import('../client-manager')
      const result = convertMcpToolsToOpenAI()

      expect(result).toHaveLength(2)

      // Verify first tool conversion
      expect(result[0]).toEqual({
        type: 'function',
        function: {
          name: 'get_repository',
          description: 'Get repository information',
          parameters: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
            },
            required: ['owner', 'repo'],
          },
        },
      })

      // Verify second tool conversion
      expect(result[1]).toEqual({
        type: 'function',
        function: {
          name: 'list_issues',
          description: 'List issues in a repository',
          parameters: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              state: { type: 'string', enum: ['open', 'closed', 'all'] },
            },
            required: ['owner', 'repo'],
          },
        },
      })
    })

    it('should return empty array when no tools are registered', async () => {
      const mockRegistry = {
        getToolDefinitions: vi.fn().mockReturnValue([]),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { convertMcpToolsToOpenAI } = await import('../client-manager')
      const result = convertMcpToolsToOpenAI()

      expect(result).toEqual([])
      expect(mockRegistry.getToolDefinitions).toHaveBeenCalledOnce()
    })

    it('should handle tools with complex input schemas', async () => {
      const mockToolDefinitions: Omit<MCPToolDefinition, 'handler'>[] = [
        {
          name: 'create_pull_request',
          description: 'Create a new pull request',
          inputSchema: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              title: { type: 'string', description: 'PR title' },
              body: { type: 'string', description: 'PR description' },
              head: { type: 'string', description: 'Head branch' },
              base: { type: 'string', description: 'Base branch' },
              draft: { type: 'boolean', description: 'Create as draft' },
            },
            required: ['owner', 'repo', 'title', 'head', 'base'],
          },
        },
      ]

      const mockRegistry = {
        getToolDefinitions: vi.fn().mockReturnValue(mockToolDefinitions),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { convertMcpToolsToOpenAI } = await import('../client-manager')
      const result = convertMcpToolsToOpenAI()

      expect(result).toHaveLength(1)
      // Cast to access function property safely
      const tool = result[0] as OpenAI.Chat.Completions.ChatCompletionTool & {
        function: { name: string; parameters: unknown }
      }
      expect(tool.function.name).toBe('create_pull_request')
      expect(tool.function.parameters).toEqual(mockToolDefinitions[0].inputSchema)
    })
  })

  describe('executeToolCalls', () => {
    it('should execute tool calls and return formatted results', async () => {
      const mockToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [
        {
          id: 'call_123',
          type: 'function',
          function: {
            name: 'get_repository',
            arguments: JSON.stringify({ owner: 'facebook', repo: 'react' }),
          },
        },
      ]

      const mockToolResult: ToolResult = {
        toolCallId: 'call_123',
        result: {
          name: 'react',
          full_name: 'facebook/react',
          description: 'A JavaScript library for building user interfaces',
          stargazers_count: 200000,
        },
      }

      const mockRegistry = {
        execute: vi.fn().mockResolvedValue(mockToolResult),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { executeToolCalls } = await import('../client-manager')
      const results = await executeToolCalls(
        mockToolCalls as OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall[]
      )

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        role: 'tool',
        tool_call_id: 'call_123',
        content: JSON.stringify(mockToolResult.result),
      })

      // Verify the execute was called with correct arguments
      expect(mockRegistry.execute).toHaveBeenCalledWith({
        id: 'call_123',
        name: 'get_repository',
        arguments: { owner: 'facebook', repo: 'react' },
      } satisfies ToolCall)
    })

    it('should handle multiple tool calls sequentially', async () => {
      const mockToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [
        {
          id: 'call_1',
          type: 'function',
          function: {
            name: 'get_repository',
            arguments: JSON.stringify({ owner: 'vercel', repo: 'next.js' }),
          },
        },
        {
          id: 'call_2',
          type: 'function',
          function: {
            name: 'list_issues',
            arguments: JSON.stringify({ owner: 'vercel', repo: 'next.js', state: 'open' }),
          },
        },
      ]

      const mockResults: ToolResult[] = [
        {
          toolCallId: 'call_1',
          result: { name: 'next.js', stargazers_count: 100000 },
        },
        {
          toolCallId: 'call_2',
          result: [
            { number: 1, title: 'Issue 1' },
            { number: 2, title: 'Issue 2' },
          ],
        },
      ]

      let callIndex = 0
      const mockRegistry = {
        execute: vi.fn().mockImplementation(() => {
          const result = mockResults[callIndex]
          callIndex++
          return Promise.resolve(result)
        }),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { executeToolCalls } = await import('../client-manager')
      const results = await executeToolCalls(
        mockToolCalls as OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall[]
      )

      expect(results).toHaveLength(2)
      expect(results[0].tool_call_id).toBe('call_1')
      expect(results[1].tool_call_id).toBe('call_2')
      expect(mockRegistry.execute).toHaveBeenCalledTimes(2)
    })

    it('should handle tool execution errors gracefully', async () => {
      const mockToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [
        {
          id: 'call_error',
          type: 'function',
          function: {
            name: 'get_repository',
            arguments: JSON.stringify({ owner: 'invalid', repo: 'repo' }),
          },
        },
      ]

      const mockErrorResult: ToolResult = {
        toolCallId: 'call_error',
        result: null,
        error: 'Repository not found',
      }

      const mockRegistry = {
        execute: vi.fn().mockResolvedValue(mockErrorResult),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { executeToolCalls } = await import('../client-manager')
      const results = await executeToolCalls(
        mockToolCalls as OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall[]
      )

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        role: 'tool',
        tool_call_id: 'call_error',
        content: JSON.stringify({ error: 'Repository not found' }),
      })
    })

    it('should handle empty arguments string', async () => {
      const mockToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [
        {
          id: 'call_empty',
          type: 'function',
          function: {
            name: 'get_user',
            arguments: '',
          },
        },
      ]

      const mockResult: ToolResult = {
        toolCallId: 'call_empty',
        result: { username: 'default_user' },
      }

      const mockRegistry = {
        execute: vi.fn().mockResolvedValue(mockResult),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { executeToolCalls } = await import('../client-manager')
      const results = await executeToolCalls(
        mockToolCalls as OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall[]
      )

      expect(results).toHaveLength(1)
      expect(mockRegistry.execute).toHaveBeenCalledWith({
        id: 'call_empty',
        name: 'get_user',
        arguments: {},
      })
    })

    it('should handle empty tool calls array', async () => {
      const mockRegistry = {
        execute: vi.fn(),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { executeToolCalls } = await import('../client-manager')
      const results = await executeToolCalls([])

      expect(results).toEqual([])
      expect(mockRegistry.execute).not.toHaveBeenCalled()
    })

    it('should handle mixed success and error results', async () => {
      const mockToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [
        {
          id: 'call_success',
          type: 'function',
          function: {
            name: 'get_repository',
            arguments: JSON.stringify({ owner: 'facebook', repo: 'react' }),
          },
        },
        {
          id: 'call_fail',
          type: 'function',
          function: {
            name: 'get_repository',
            arguments: JSON.stringify({ owner: 'invalid', repo: 'notfound' }),
          },
        },
        {
          id: 'call_success_2',
          type: 'function',
          function: {
            name: 'list_issues',
            arguments: JSON.stringify({ owner: 'vercel', repo: 'next.js' }),
          },
        },
      ]

      const mockResults: ToolResult[] = [
        { toolCallId: 'call_success', result: { name: 'react' } },
        { toolCallId: 'call_fail', result: null, error: 'Not found' },
        { toolCallId: 'call_success_2', result: [{ number: 1 }] },
      ]

      let callIndex = 0
      const mockRegistry = {
        execute: vi.fn().mockImplementation(() => {
          const result = mockResults[callIndex]
          callIndex++
          return Promise.resolve(result)
        }),
      }

      const { getMCPToolRegistry } = await import('../mcp-tools')
      vi.mocked(getMCPToolRegistry).mockReturnValue(
        mockRegistry as unknown as ReturnType<typeof getMCPToolRegistry>
      )

      const { executeToolCalls } = await import('../client-manager')
      const results = await executeToolCalls(
        mockToolCalls as OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall[]
      )

      expect(results).toHaveLength(3)

      // First call: success
      expect(JSON.parse(results[0].content as string)).toEqual({ name: 'react' })

      // Second call: error
      expect(JSON.parse(results[1].content as string)).toEqual({ error: 'Not found' })

      // Third call: success
      expect(JSON.parse(results[2].content as string)).toEqual([{ number: 1 }])
    })
  })
})
