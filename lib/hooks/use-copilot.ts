'use client'

/**
 * GitHub Copilot Chat Hook
 *
 * Main hook for managing chat interactions with GitHub Copilot SDK.
 * Handles SSE streaming, message state, and error recovery.
 */

import { useCallback, useRef } from 'react'
import { create } from 'zustand'
import type {
  CopilotContext,
  CopilotError,
  CopilotMessage,
  FileAttachment,
  GeneratedFile,
  StreamEvent,
  TokenUsage,
  ToolCall,
} from '@/lib/services/copilot'

// ============================================
// State Types
// ============================================

interface CopilotChatState {
  messages: CopilotMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: CopilotError | null
  currentStreamContent: string
  pendingToolCalls: ToolCall[]
  /** Files generated during the current streaming response */
  pendingGeneratedFiles: GeneratedFile[]

  // Actions
  addMessage: (message: CopilotMessage) => void
  updateLastMessage: (content: string, generatedFiles?: GeneratedFile[]) => void
  setMessages: (messages: CopilotMessage[]) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void
  setError: (error: CopilotError | null) => void
  setStreamContent: (content: string) => void
  appendStreamContent: (content: string) => void
  addToolCall: (toolCall: ToolCall) => void
  clearToolCalls: () => void
  addGeneratedFile: (file: GeneratedFile) => void
  clearGeneratedFiles: () => void
  reset: () => void
}

// ============================================
// Zustand Store
// ============================================

const useCopilotStore = create<CopilotChatState>((set) => ({
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  currentStreamContent: '',
  pendingToolCalls: [],
  pendingGeneratedFiles: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content, generatedFiles) =>
    set((state) => {
      const messages = [...state.messages]
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        messages[messages.length - 1] = {
          ...lastMessage,
          content,
          generatedFiles: generatedFiles ?? lastMessage.generatedFiles,
        }
      }
      return { messages }
    }),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setLoading: (isLoading) => set({ isLoading }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setError: (error) => set({ error }),

  setStreamContent: (currentStreamContent) => set({ currentStreamContent }),

  appendStreamContent: (content) =>
    set((state) => {
      const newContent = state.currentStreamContent + content
      return { currentStreamContent: newContent }
    }),

  addToolCall: (toolCall) =>
    set((state) => ({
      pendingToolCalls: [...state.pendingToolCalls, toolCall],
    })),

  clearToolCalls: () => set({ pendingToolCalls: [] }),

  addGeneratedFile: (file) =>
    set((state) => ({
      pendingGeneratedFiles: [...state.pendingGeneratedFiles, file],
    })),

  clearGeneratedFiles: () => set({ pendingGeneratedFiles: [] }),

  reset: () =>
    set({
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      currentStreamContent: '',
      pendingToolCalls: [],
      pendingGeneratedFiles: [],
    }),
}))

// ============================================
// Helper Functions
// ============================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function parseSSEEvent(line: string): StreamEvent | null {
  if (!line.startsWith('data: ')) {
    return null
  }

  const data = line.slice(6) // Remove 'data: ' prefix

  if (data === '[DONE]') {
    return { type: 'done' }
  }

  try {
    const parsed = JSON.parse(data) as StreamEvent
    return parsed
  } catch {
    // If parsing fails, treat as token content
    return { type: 'token', content: data }
  }
}

// ============================================
// Main Hook
// ============================================

interface UseCopilotOptions {
  onError?: (error: CopilotError) => void
  onToolCall?: (toolCall: ToolCall) => void
  onGeneratedFile?: (file: GeneratedFile) => void
  onComplete?: (message: CopilotMessage) => void
  maxRetries?: number
  retryDelay?: number
}

interface UseCopilotReturn {
  // State
  messages: CopilotMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: CopilotError | null
  currentStreamContent: string
  pendingToolCalls: ToolCall[]
  pendingGeneratedFiles: GeneratedFile[]

  // Actions
  sendMessage: (
    sessionId: string,
    message: string,
    context?: CopilotContext,
    attachments?: FileAttachment[]
  ) => Promise<void>
  clearMessages: () => void
  clearError: () => void
  abort: () => void
  reset: () => void
}

export function useCopilot(options: UseCopilotOptions = {}): UseCopilotReturn {
  const {
    onError,
    onToolCall,
    onGeneratedFile,
    onComplete,
    maxRetries = 3,
    retryDelay = 1000,
  } = options

  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    currentStreamContent,
    pendingToolCalls,
    pendingGeneratedFiles,
    addMessage,
    updateLastMessage,
    clearMessages,
    setLoading,
    setStreaming,
    setError,
    setStreamContent,
    addToolCall,
    clearToolCalls,
    addGeneratedFile,
    clearGeneratedFiles,
    reset,
  } = useCopilotStore()

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setLoading(false)
    setStreaming(false)
  }, [setLoading, setStreaming])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const sendMessage = useCallback(
    async (
      sessionId: string,
      message: string,
      context?: CopilotContext,
      attachments?: FileAttachment[]
    ) => {
      // Abort any existing request
      abort()

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      const { signal } = abortControllerRef.current

      // Add user message to state
      const userMessage: CopilotMessage = {
        id: generateMessageId(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
        attachments,
      }
      addMessage(userMessage)

      // Reset state for new request
      setLoading(true)
      setError(null)
      setStreamContent('')
      clearToolCalls()
      clearGeneratedFiles()

      let assistantMessage: CopilotMessage | null = null
      let usage: TokenUsage | undefined
      const toolCalls: ToolCall[] = []
      const generatedFiles: GeneratedFile[] = []

      try {
        const response = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            message,
            context,
            attachments,
            stream: true,
          }),
          signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          const copilotError: CopilotError = {
            type: errorData.error?.type || 'UNKNOWN_ERROR',
            message: errorData.error?.message || 'Request failed',
            code: errorData.error?.code,
            retryable: response.status >= 500 || response.status === 429,
            retryAfter:
              response.status === 429
                ? parseInt(response.headers.get('Retry-After') || '60', 10) * 1000
                : undefined,
          }

          // Handle retry for retryable errors
          if (copilotError.retryable && retryCountRef.current < maxRetries) {
            retryCountRef.current++
            const delay = copilotError.retryAfter || retryDelay * retryCountRef.current
            await new Promise((resolve) => setTimeout(resolve, delay))
            return sendMessage(sessionId, message, context, attachments)
          }

          throw copilotError
        }

        // Reset retry count on successful response
        retryCountRef.current = 0

        // Create placeholder assistant message
        assistantMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        }
        addMessage(assistantMessage)
        setStreaming(true)

        // Process SSE stream
        const reader = response.body?.getReader()
        if (!reader) {
          throw {
            type: 'NETWORK_ERROR',
            message: 'No response body',
            retryable: true,
          } as CopilotError
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue

            const event = parseSSEEvent(line)
            if (!event) continue

            switch (event.type) {
              case 'token':
                if (event.content) {
                  // Use getState() to get the current content, append, and update in one operation
                  // This avoids race conditions with batched state updates
                  const currentContent = useCopilotStore.getState().currentStreamContent
                  const newContent = currentContent + event.content
                  setStreamContent(newContent)
                  updateLastMessage(newContent)
                }
                break

              case 'tool_call':
                if (event.toolCall) {
                  toolCalls.push(event.toolCall)
                  addToolCall(event.toolCall)
                  onToolCall?.(event.toolCall)
                }
                break

              case 'tool_result':
                // Tool results are handled by the API, just update UI if needed
                break

              case 'generated_file':
                if (event.generatedFile) {
                  generatedFiles.push(event.generatedFile)
                  addGeneratedFile(event.generatedFile)
                  onGeneratedFile?.(event.generatedFile)
                  // Update message to include generated files
                  const currentContent = useCopilotStore.getState().currentStreamContent
                  updateLastMessage(currentContent, [...generatedFiles])
                }
                break

              case 'done':
                if (event.usage) {
                  usage = event.usage
                }
                break

              case 'error':
                if (event.error) {
                  throw event.error
                }
                break
            }
          }
        }

        // Finalize assistant message
        if (assistantMessage) {
          const finalContent = useCopilotStore.getState().currentStreamContent
          const finalGeneratedFiles = useCopilotStore.getState().pendingGeneratedFiles
          assistantMessage = {
            ...assistantMessage,
            content: finalContent,
            generatedFiles: finalGeneratedFiles.length > 0 ? finalGeneratedFiles : undefined,
            metadata: {
              toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
              usage,
            },
          }
          updateLastMessage(
            finalContent,
            finalGeneratedFiles.length > 0 ? finalGeneratedFiles : undefined
          )
          onComplete?.(assistantMessage)
        }
      } catch (err) {
        const copilotError: CopilotError = (err as CopilotError).type
          ? (err as CopilotError)
          : {
              type: signal.aborted ? 'TIMEOUT' : 'UNKNOWN_ERROR',
              message: err instanceof Error ? err.message : 'Unknown error occurred',
              retryable: false,
            }

        setError(copilotError)
        onError?.(copilotError)

        // Remove the incomplete assistant message if there was an error
        if (assistantMessage && !assistantMessage.content) {
          const currentMessages = useCopilotStore.getState().messages
          useCopilotStore.setState({
            messages: currentMessages.slice(0, -1),
          })
        }
      } finally {
        setLoading(false)
        setStreaming(false)
        abortControllerRef.current = null
      }
    },
    [
      abort,
      addGeneratedFile,
      addMessage,
      addToolCall,
      clearGeneratedFiles,
      clearToolCalls,
      maxRetries,
      onComplete,
      onError,
      onGeneratedFile,
      onToolCall,
      retryDelay,
      setError,
      setLoading,
      setStreamContent,
      setStreaming,
      updateLastMessage,
    ]
  )

  return {
    // State
    messages,
    isLoading,
    isStreaming,
    error,
    currentStreamContent,
    pendingToolCalls,
    pendingGeneratedFiles,

    // Actions
    sendMessage,
    clearMessages,
    clearError,
    abort,
    reset,
  }
}

// Export store for advanced use cases
export { useCopilotStore }
