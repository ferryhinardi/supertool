/**
 * Session Export Utilities
 * Export Copilot chat sessions as Markdown files
 */

import type { CopilotMessage, CopilotSession } from '@/lib/services/copilot/types'

/**
 * Format a timestamp as a readable time string
 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a timestamp as a readable date string
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get a display label for the message role
 */
function getRoleLabel(role: CopilotMessage['role']): string {
  switch (role) {
    case 'user':
      return 'User'
    case 'assistant':
      return 'Assistant'
    case 'system':
      return 'System'
    default:
      return 'Unknown'
  }
}

/**
 * Format attachments information for markdown
 */
function formatAttachments(attachments: CopilotMessage['attachments']): string {
  if (!attachments || attachments.length === 0) return ''

  const attachmentLines = attachments.map((attachment) => {
    const sizeKB = (attachment.size / 1024).toFixed(1)
    return `- 📎 ${attachment.name} (${attachment.type}, ${sizeKB} KB)`
  })

  return `\n\n**Attachments:**\n${attachmentLines.join('\n')}`
}

/**
 * Format generated files information for markdown
 */
function formatGeneratedFiles(generatedFiles: CopilotMessage['generatedFiles']): string {
  if (!generatedFiles || generatedFiles.length === 0) return ''

  const fileLines = generatedFiles.map((file) => {
    const sizeKB = (file.size / 1024).toFixed(1)
    const description = file.description ? ` - ${file.description}` : ''
    return `- 📄 ${file.name} (${sizeKB} KB)${description}`
  })

  return `\n\n**Generated Files:**\n${fileLines.join('\n')}`
}

/**
 * Format a single message as markdown
 */
function formatMessage(message: CopilotMessage): string {
  const roleLabel = getRoleLabel(message.role)
  const time = formatTime(message.timestamp)
  const attachments = formatAttachments(message.attachments)
  const generatedFiles = formatGeneratedFiles(message.generatedFiles)

  return `## ${roleLabel} (${time})

${message.content}${attachments}${generatedFiles}`
}

/**
 * Format context information for markdown
 */
function formatContext(context: CopilotSession['context']): string {
  const parts: string[] = []

  if (context.owner && context.repo) {
    parts.push(`**Repository:** ${context.owner}/${context.repo}`)
  }

  if (context.prNumber) {
    parts.push(`**PR Number:** #${context.prNumber}`)
  }

  if (context.files && context.files.length > 0) {
    const fileCount = context.files.length
    parts.push(`**Files in Context:** ${fileCount} file${fileCount === 1 ? '' : 's'}`)
  }

  if (context.customInstructions) {
    parts.push(`**Custom Instructions:** ${context.customInstructions}`)
  }

  if (parts.length === 0) return ''

  return `## Context

${parts.join('\n')}

---

`
}

/**
 * Format a complete session as Markdown
 */
export function formatSessionAsMarkdown(session: CopilotSession): string {
  const exportDate = formatDate(Date.now())
  const createdDate = formatDate(session.createdAt)
  const messageCount = session.messages.length

  // Filter out system messages for export (they're typically internal)
  const visibleMessages = session.messages.filter((msg) => msg.role !== 'system')

  const header = `# ${session.name}

*Exported on ${exportDate}*

**Created:** ${createdDate}  
**Messages:** ${messageCount}

---

`

  const context = formatContext(session.context)

  const messages = visibleMessages.map(formatMessage).join('\n\n---\n\n')

  const footer = `

---

*Exported from SuperTool Copilot*
`

  return header + context + messages + footer
}

/**
 * Generate a safe filename from session name
 */
function generateFilename(sessionName: string): string {
  // Remove or replace unsafe characters
  const safeName = sessionName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) // Limit length

  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return `chat-${safeName || 'export'}-${timestamp}.md`
}

/**
 * Download a file to the user's device
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export a session as a Markdown file and trigger download
 */
export function downloadSessionAsMarkdown(session: CopilotSession): void {
  const markdown = formatSessionAsMarkdown(session)
  const filename = generateFilename(session.name)
  downloadFile(markdown, filename, 'text/markdown')
}
