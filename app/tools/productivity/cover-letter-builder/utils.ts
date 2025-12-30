// Cover Letter Builder Utility Functions

import type { CoverLetterData } from './types'

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Save to localStorage
export function saveToLocalStorage(storageKey: string, data: CoverLetterData): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Load from localStorage
export function loadFromLocalStorage(storageKey: string): CoverLetterData | null {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
  }
  return null
}

// Clear localStorage
export function clearLocalStorage(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

// Export to JSON file
export function exportToJSON(data: CoverLetterData): void {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cover-letter-${data.personal.fullName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    console.error('Failed to export JSON')
    throw new Error('Failed to export JSON')
  }
}

// Import from JSON file
export async function importFromJSON(file: File): Promise<CoverLetterData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result
        if (!result) {
          reject(new Error('Failed to read file'))
          return
        }
        const data = JSON.parse(result as string)
        resolve(data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Calculate reading time estimate (average 200 words per minute)
export function estimateReadingTime(data: CoverLetterData): string {
  const allText = [
    data.content.opening,
    data.content.body,
    data.content.closing,
    data.content.callToAction,
  ].join(' ')

  const wordCount = allText.split(/\s+/).filter((word) => word.length > 0).length
  const minutes = Math.ceil(wordCount / 200)
  return `${minutes} min read`
}

// Get character count for each section
export function getCharacterCounts(data: CoverLetterData): {
  opening: number
  body: number
  closing: number
  callToAction: number
  total: number
} {
  return {
    opening: data.content.opening.length,
    body: data.content.body.length,
    closing: data.content.closing.length,
    callToAction: data.content.callToAction.length,
    total:
      data.content.opening.length +
      data.content.body.length +
      data.content.closing.length +
      data.content.callToAction.length,
  }
}

// Suggest optimal length based on industry best practices
export function getSuggestedLength(): {
  min: number
  max: number
  optimal: number
} {
  return {
    min: 250, // words
    max: 400, // words
    optimal: 300, // words
  }
}

// Get word count from cover letter content
export function getWordCount(data: CoverLetterData): number {
  const allText = [
    data.content.opening,
    data.content.body,
    data.content.closing,
    data.content.callToAction,
  ].join(' ')

  return allText.split(/\s+/).filter((word) => word.length > 0).length
}

// Check if cover letter meets recommended length
export function checkLength(data: CoverLetterData): {
  status: 'short' | 'optimal' | 'long'
  message: string
  wordCount: number
} {
  const wordCount = getWordCount(data)
  const { min, max } = getSuggestedLength()

  if (wordCount < min) {
    return {
      status: 'short',
      message: `Your cover letter is ${min - wordCount} words shorter than recommended.`,
      wordCount,
    }
  }
  if (wordCount > max) {
    return {
      status: 'long',
      message: `Your cover letter is ${wordCount - max} words longer than recommended.`,
      wordCount,
    }
  }
  return {
    status: 'optimal',
    message: 'Your cover letter length is optimal!',
    wordCount,
  }
}

// Validate cover letter completeness
export function validateCoverLetter(data: CoverLetterData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Personal Info validation
  if (!data.personal.fullName.trim()) {
    errors.push('Full name is required')
  }
  if (!data.personal.email.trim()) {
    errors.push('Email is required')
  }
  if (data.personal.email.trim() && !isValidEmail(data.personal.email)) {
    errors.push('Valid email is required')
  }

  // Recipient Info validation
  if (!data.recipient.companyName.trim()) {
    errors.push('Company name is required')
  }
  if (!data.position.trim()) {
    errors.push('Position is required')
  }

  // Content validation
  if (!data.content.opening.trim()) {
    errors.push('Opening paragraph is required')
  }
  if (!data.content.body.trim()) {
    errors.push('Body content is required')
  }
  if (!data.content.closing.trim()) {
    errors.push('Closing paragraph is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate sample cover letter content
export function generateSampleContent(
  position: string,
  companyName: string
): {
  opening: string
  body: string
  closing: string
  callToAction: string
} {
  return {
    opening: `I am writing to express my strong interest in the ${position} position at ${companyName}. With my background in [your field] and proven track record of [key achievement], I am confident I would be a valuable addition to your team.`,
    body: `Throughout my career, I have developed expertise in [skill 1], [skill 2], and [skill 3]. In my previous role at [Previous Company], I successfully [achievement 1] and [achievement 2], which resulted in [positive outcome]. I am particularly drawn to ${companyName} because of [reason 1] and [reason 2].\n\nYour commitment to [company value] aligns perfectly with my professional values. I am excited about the opportunity to contribute to [specific project or initiative] and help ${companyName} achieve [company goal].`,
    closing: `I am enthusiastic about the opportunity to bring my skills and experience to ${companyName}. I believe my background in [relevant experience] makes me an ideal candidate for this position.`,
    callToAction:
      'I would welcome the opportunity to discuss how my qualifications align with your needs. Thank you for considering my application.',
  }
}

// Get default salutation based on hiring manager name
export function getDefaultSalutation(hiringManagerName?: string): string {
  if (hiringManagerName?.trim()) {
    // Extract first and last name
    const nameParts = hiringManagerName.trim().split(/\s+/)
    if (nameParts.length > 0) {
      return `Dear ${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    }
  }
  return 'Dear Hiring Manager'
}

// Create a copy of cover letter with new ID
export function duplicateCoverLetter(data: CoverLetterData): CoverLetterData {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}
