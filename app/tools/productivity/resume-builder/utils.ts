/**
 * Resume Builder - Utility Functions
 * Validation, ATS scoring, formatting, and helper functions
 */

import type {
  ATSScore,
  ATSSuggestion,
  Certification,
  Education,
  Project,
  ResumeData,
  WorkExperience,
} from './types'
import { ACTION_VERBS } from './types'

// ============================================================================
// Validation Functions
// ============================================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Accepts various formats: (123) 456-7890, 123-456-7890, +1 123 456 7890, etc.
  const phoneRegex = /^[\d\s()+-]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateLinkedIn(url: string): boolean {
  return url.includes('linkedin.com/in/')
}

export function validateGitHub(url: string): boolean {
  return url.includes('github.com/')
}

// ============================================================================
// Date Formatting & Validation
// ============================================================================

export function formatDate(date: string): string {
  if (date === 'Present') return 'Present'
  try {
    const [year, month] = date.split('-')
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const monthIndex = Number.parseInt(month, 10) - 1
    return `${monthNames[monthIndex]} ${year}`
  } catch {
    return date
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return `${start} – ${end}`
}

export function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = endDate === 'Present' ? new Date() : new Date(endDate)

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())

  if (months < 1) return 'Less than 1 month'
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`

  return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
}

// ============================================================================
// ATS Scoring & Optimization
// ============================================================================

export function calculateATSScore(resume: ResumeData): ATSScore {
  const suggestions: ATSSuggestion[] = []
  let formatScore = 100
  let keywordScore = 0
  let contentScore = 0

  // Format checks
  const formatChecks = checkFormat(resume)
  formatScore -= formatChecks.penalties
  suggestions.push(...formatChecks.suggestions)

  // Keyword checks
  const keywordChecks = checkKeywords(resume)
  keywordScore = keywordChecks.score
  suggestions.push(...keywordChecks.suggestions)

  // Content checks
  const contentChecks = checkContent(resume)
  contentScore = contentChecks.score
  suggestions.push(...contentChecks.suggestions)

  const overall = Math.round(formatScore * 0.3 + keywordScore * 0.4 + contentScore * 0.3)

  return {
    overall: Math.max(0, Math.min(100, overall)),
    formatScore: Math.max(0, formatScore),
    keywordScore: Math.max(0, keywordScore),
    contentScore: Math.max(0, contentScore),
    suggestions,
  }
}

function checkFormat(resume: ResumeData): { penalties: number; suggestions: ATSSuggestion[] } {
  const suggestions: ATSSuggestion[] = []
  let penalties = 0

  // Check contact info
  if (!resume.personal.email || !validateEmail(resume.personal.email)) {
    suggestions.push({
      type: 'error',
      category: 'format',
      section: 'personal',
      message: 'Add a valid email address',
      fix: 'Include a professional email address in your contact information',
    })
    penalties += 10
  }

  if (!resume.personal.phone || !validatePhone(resume.personal.phone)) {
    suggestions.push({
      type: 'error',
      category: 'format',
      section: 'personal',
      message: 'Add a valid phone number',
      fix: 'Include a phone number with area code',
    })
    penalties += 10
  }

  if (!resume.personal.location) {
    suggestions.push({
      type: 'warning',
      category: 'format',
      section: 'personal',
      message: 'Add your location (City, State)',
      fix: 'Including location helps with local job searches',
    })
    penalties += 5
  }

  // Check summary length
  const summaryLength = resume.personal.summary.length
  if (summaryLength < 100) {
    suggestions.push({
      type: 'warning',
      category: 'content',
      section: 'personal',
      message: 'Professional summary is too short',
      fix: 'Write a summary of 100-300 characters highlighting your key qualifications',
    })
    penalties += 5
  } else if (summaryLength > 500) {
    suggestions.push({
      type: 'warning',
      category: 'content',
      section: 'personal',
      message: 'Professional summary is too long',
      fix: 'Keep your summary concise (100-300 characters)',
    })
    penalties += 3
  }

  return { penalties, suggestions }
}

function checkKeywords(resume: ResumeData): { score: number; suggestions: ATSSuggestion[] } {
  const suggestions: ATSSuggestion[] = []
  let score = 0

  // Extract all text content
  const allText = extractAllText(resume).toLowerCase()

  // Count action verbs
  const actionVerbCount = ACTION_VERBS.filter((verb) => allText.includes(verb.toLowerCase())).length

  if (actionVerbCount >= 5) {
    score += 30
  } else if (actionVerbCount >= 3) {
    score += 20
    suggestions.push({
      type: 'info',
      category: 'keywords',
      message: `Use more action verbs (currently ${actionVerbCount}/5)`,
      fix: `Start bullet points with strong action verbs like: ${ACTION_VERBS.slice(0, 5).join(', ')}`,
    })
  } else {
    score += 10
    suggestions.push({
      type: 'warning',
      category: 'keywords',
      message: 'Add more action verbs to your achievements',
      fix: `Start bullet points with action verbs: ${ACTION_VERBS.slice(0, 5).join(', ')}`,
    })
  }

  // Check for quantifiable achievements (numbers)
  const numberMatches = allText.match(/\d+[%$kmb]?/g) || []
  const quantifiableCount = numberMatches.length

  if (quantifiableCount >= 8) {
    score += 30
  } else if (quantifiableCount >= 5) {
    score += 20
    suggestions.push({
      type: 'info',
      category: 'keywords',
      message: 'Add more quantifiable achievements',
      fix: 'Include specific numbers, percentages, and metrics in your bullet points',
    })
  } else {
    score += 10
    suggestions.push({
      type: 'warning',
      category: 'keywords',
      message: 'Add quantifiable achievements with numbers and metrics',
      fix: 'Example: "Increased sales by 25%" instead of "Improved sales"',
    })
  }

  // Check for technical skills
  const skillsCount = resume.skills.reduce((sum, group) => sum + group.skills.length, 0)
  if (skillsCount >= 10) {
    score += 20
  } else if (skillsCount >= 5) {
    score += 10
  } else {
    suggestions.push({
      type: 'warning',
      category: 'keywords',
      section: 'skills',
      message: 'Add more relevant skills',
      fix: 'Include both technical and soft skills relevant to your target role',
    })
  }

  // Industry keywords check
  const hasIndustryKeywords = checkIndustryKeywords(allText)
  if (hasIndustryKeywords) {
    score += 20
  } else {
    suggestions.push({
      type: 'info',
      category: 'keywords',
      message: 'Include industry-specific keywords',
      fix: 'Research job descriptions for your target role and include relevant keywords',
    })
  }

  return { score: Math.min(100, score), suggestions }
}

function checkContent(resume: ResumeData): { score: number; suggestions: ATSSuggestion[] } {
  const suggestions: ATSSuggestion[] = []
  let score = 0

  // Check work experience
  if (resume.experience.length === 0) {
    suggestions.push({
      type: 'error',
      category: 'content',
      section: 'experience',
      message: 'Add work experience',
      fix: 'Include at least one work experience entry',
    })
  } else {
    score += 30

    // Check for achievements in experience
    const hasAchievements = resume.experience.some((exp) => exp.achievements.length >= 2)
    if (hasAchievements) {
      score += 10
    } else {
      suggestions.push({
        type: 'warning',
        category: 'content',
        section: 'experience',
        message: 'Add more achievements to your work experience',
        fix: 'Include 3-5 bullet points per role highlighting your achievements and impact',
      })
    }
  }

  // Check education
  if (resume.education.length === 0) {
    suggestions.push({
      type: 'warning',
      category: 'content',
      section: 'education',
      message: 'Add education background',
      fix: 'Include your highest degree or relevant education',
    })
  } else {
    score += 20
  }

  // Check skills
  if (resume.skills.length === 0) {
    suggestions.push({
      type: 'warning',
      category: 'content',
      section: 'skills',
      message: 'Add relevant skills',
      fix: 'Include technical and soft skills relevant to your target role',
    })
  } else {
    score += 20
  }

  // Bonus for additional sections
  if (resume.projects.length > 0) score += 10
  if (resume.certifications.length > 0) score += 10
  if (resume.languages.length > 1) score += 5
  if (resume.volunteer.length > 0) score += 5

  // Check total resume length
  const totalWords = estimateWordCount(resume)
  if (totalWords < 200) {
    suggestions.push({
      type: 'warning',
      category: 'length',
      message: 'Resume is too short',
      fix: 'Add more details about your experience and achievements (aim for 400-800 words)',
    })
  } else if (totalWords > 1000) {
    suggestions.push({
      type: 'info',
      category: 'length',
      message: 'Resume might be too long',
      fix: 'Consider condensing content to fit on 1-2 pages (aim for 400-800 words)',
    })
  }

  return { score: Math.min(100, score), suggestions }
}

function extractAllText(resume: ResumeData): string {
  const texts: string[] = [
    resume.personal.summary,
    ...resume.experience.flatMap((exp) => [exp.position, exp.company, ...exp.achievements]),
    ...resume.education.flatMap((edu) => [edu.degree, edu.institution]),
    ...resume.skills.flatMap((group) => group.skills),
    ...resume.projects.flatMap((proj) => [proj.name, proj.description, ...proj.highlights]),
  ]
  return texts.join(' ')
}

function estimateWordCount(resume: ResumeData): number {
  const text = extractAllText(resume)
  return text.split(/\s+/).filter(Boolean).length
}

function checkIndustryKeywords(text: string): boolean {
  const commonKeywords = [
    'software',
    'development',
    'engineering',
    'management',
    'design',
    'analysis',
    'strategy',
    'leadership',
    'innovation',
    'collaboration',
  ]
  return commonKeywords.some((keyword) => text.includes(keyword))
}

// ============================================================================
// Content Optimization
// ============================================================================

export function suggestActionVerbs(currentText: string): string[] {
  const used = ACTION_VERBS.filter((verb) => currentText.toLowerCase().includes(verb.toLowerCase()))
  const unused = ACTION_VERBS.filter((verb) => !used.includes(verb))
  return unused.slice(0, 10)
}

export function optimizeBulletPoint(text: string): {
  isOptimized: boolean
  suggestions: string[]
} {
  const suggestions: string[] = []
  let isOptimized = true

  // Check if starts with action verb
  const startsWithActionVerb = ACTION_VERBS.some((verb) =>
    text.trim().toLowerCase().startsWith(verb.toLowerCase())
  )

  if (!startsWithActionVerb) {
    suggestions.push('Start with an action verb')
    isOptimized = false
  }

  // Check for quantifiable results
  const hasNumbers = /\d+[%$kmb]?/.test(text)
  if (!hasNumbers) {
    suggestions.push('Include quantifiable results (numbers, percentages)')
    isOptimized = false
  }

  // Check length
  const wordCount = text.split(/\s+/).length
  if (wordCount < 10) {
    suggestions.push('Add more details (aim for 10-20 words)')
    isOptimized = false
  } else if (wordCount > 30) {
    suggestions.push('Make it more concise (aim for 10-20 words)')
    isOptimized = false
  }

  return { isOptimized, suggestions }
}

// ============================================================================
// Export & Storage Helpers
// ============================================================================

export function exportToJSON(resume: ResumeData): string {
  return JSON.stringify(resume, null, 2)
}

export function importFromJSON(json: string): ResumeData | null {
  try {
    const data = JSON.parse(json)
    // Basic validation
    if (!data.personal || !data.experience || !data.education) {
      return null
    }
    return data as ResumeData
  } catch {
    return null
  }
}

export function saveToLocalStorage(key: string, resume: ResumeData): void {
  try {
    localStorage.setItem(key, JSON.stringify(resume))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export function loadFromLocalStorage(key: string): ResumeData | null {
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data) as ResumeData
  } catch {
    return null
  }
}

export function clearLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

// ============================================================================
// ID Generation
// ============================================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// ============================================================================
// Text Processing
// ============================================================================

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

// ============================================================================
// Sort & Filter Helpers
// ============================================================================

export function sortExperienceByDate(experience: WorkExperience[]): WorkExperience[] {
  return [...experience].sort((a, b) => {
    const aEnd = a.endDate === 'Present' ? new Date() : new Date(a.endDate)
    const bEnd = b.endDate === 'Present' ? new Date() : new Date(b.endDate)
    return bEnd.getTime() - aEnd.getTime()
  })
}

export function sortEducationByDate(education: Education[]): Education[] {
  return [...education].sort((a, b) => {
    const aEnd = a.endDate === 'Present' ? new Date() : new Date(a.endDate)
    const bEnd = b.endDate === 'Present' ? new Date() : new Date(b.endDate)
    return bEnd.getTime() - aEnd.getTime()
  })
}

export function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aDate = a.endDate ? new Date(a.endDate) : new Date()
    const bDate = b.endDate ? new Date(b.endDate) : new Date()
    return bDate.getTime() - aDate.getTime()
  })
}

export function sortCertificationsByDate(certs: Certification[]): Certification[] {
  return [...certs].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  )
}
