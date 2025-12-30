// Cover Letter Builder Types
// Simplified structure focused on cover letter content

export type TemplateId = 'modern' | 'classic' | 'professional' | 'creative' | 'minimal'

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  portfolio?: string
}

export interface RecipientInfo {
  companyName: string
  hiringManagerName?: string
  hiringManagerTitle?: string
  companyAddress?: string
  department?: string
}

export interface LetterContent {
  opening: string // Introduction paragraph
  body: string // Main content (2-3 paragraphs combined)
  closing: string // Closing paragraph
  callToAction: string // Final sentence with call to action
}

export interface CoverLetterData {
  id: string
  personal: PersonalInfo
  recipient: RecipientInfo
  position: string // Job title applying for
  content: LetterContent
  date: string // Date of writing
  salutation: string // "Dear [Name]" or "Dear Hiring Manager"
  signature: string // "Sincerely" or "Best regards"
  templateId: TemplateId
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: TemplateId
  name: string
  description: string
  features: string[]
  preview: string // Description of visual style
}

// Empty cover letter template
export const EMPTY_COVER_LETTER: CoverLetterData = {
  id: '',
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  recipient: {
    companyName: '',
    hiringManagerName: '',
    hiringManagerTitle: '',
    companyAddress: '',
    department: '',
  },
  position: '',
  content: {
    opening: '',
    body: '',
    closing: '',
    callToAction: '',
  },
  date: new Date().toISOString().split('T')[0],
  salutation: 'Dear Hiring Manager',
  signature: 'Sincerely',
  templateId: 'modern',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Template metadata
export const COVER_LETTER_TEMPLATES: Record<TemplateId, Template> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with contemporary typography and accent colors',
    features: ['Color accents', 'Modern fonts', 'Clean layout', 'Professional'],
    preview: 'Blue accents with sans-serif typography',
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional business letter format with timeless elegance',
    features: ['Traditional layout', 'Serif fonts', 'Formal structure', 'Timeless'],
    preview: 'Black and white with classic serif fonts',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate-ready design with structured layout',
    features: ['Corporate style', 'Structured layout', 'Clear sections', 'Business-focused'],
    preview: 'Navy blue accents with professional formatting',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold design for creative industries and startups',
    features: ['Bold colors', 'Creative layout', 'Unique design', 'Eye-catching'],
    preview: 'Vibrant colors with creative typography',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant with maximum readability',
    features: ['Clean design', 'Minimal styling', 'High readability', 'Simple'],
    preview: 'Black text on white with subtle accents',
  },
}

// Helper function to validate cover letter data
export function validateCoverLetter(data: CoverLetterData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.personal.fullName) errors.push('Full name is required')
  if (!data.personal.email) errors.push('Email is required')
  if (!data.recipient.companyName) errors.push('Company name is required')
  if (!data.position) errors.push('Position is required')
  if (!data.content.opening) errors.push('Opening paragraph is required')
  if (!data.content.body) errors.push('Body content is required')
  if (!data.content.closing) errors.push('Closing paragraph is required')

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper function to estimate word count
export function getWordCount(data: CoverLetterData): number {
  const allText = [
    data.content.opening,
    data.content.body,
    data.content.closing,
    data.content.callToAction,
  ].join(' ')

  return allText.split(/\s+/).filter((word) => word.length > 0).length
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
