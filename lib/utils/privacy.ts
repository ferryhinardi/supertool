/**
 * Privacy Utilities
 * Functions for anonymizing user data while maintaining readability
 */

/**
 * Anonymize a full name by showing only first name and last initial
 * Examples:
 * - "John Doe" -> "John D."
 * - "Jane Smith" -> "Jane S."
 * - "Anonymous" -> "Anonymous"
 * - "" -> "Anonymous Supporter"
 * - "John" -> "John"
 */
export function anonymizeName(fullName: string | null | undefined): string {
  if (!fullName || fullName.trim() === '') {
    return 'Anonymous Supporter'
  }

  const trimmed = fullName.trim()
  const parts = trimmed.split(/\s+/)

  // If single name, return as-is
  if (parts.length === 1) {
    return parts[0]
  }

  // Return first name + last initial
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1][0]
  return `${firstName} ${lastInitial}.`
}

/**
 * Format relative time from timestamp
 * Examples:
 * - "2 minutes ago"
 * - "1 hour ago"
 * - "3 days ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'just now'
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  // For dates older than 30 days, show month/year
  return past.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/**
 * Anonymize email address
 * Example: "john.doe@example.com" -> "j***@example.com"
 */
export function anonymizeEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) {
    return 'anonymous@supporter.com'
  }

  const [localPart, domain] = email.split('@')
  if (localPart.length <= 1) {
    return `${localPart}***@${domain}`
  }

  return `${localPart[0]}***@${domain}`
}
