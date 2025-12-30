/**
 * Resume Builder - Type Definitions
 * Comprehensive types for building ATS-friendly resumes
 */

// ============================================================================
// Personal Information
// ============================================================================

export interface PersonalInfo {
  fullName: string
  professionalTitle: string
  email: string
  phone: string
  location: string // City, State/Country
  website?: string
  linkedin?: string
  github?: string
  portfolio?: string
  summary: string // Professional summary/objective
}

// ============================================================================
// Work Experience
// ============================================================================

export interface WorkExperience {
  id: string
  company: string
  position: string
  location: string
  startDate: string // Format: YYYY-MM
  endDate: string | 'Present'
  current: boolean
  achievements: string[] // Bullet points
  description?: string // Optional role description
  technologies?: string[] // Tech stack used
}

// ============================================================================
// Education
// ============================================================================

export interface Education {
  id: string
  institution: string
  degree: string // e.g., "Bachelor of Science in Computer Science"
  field?: string // Major/field of study
  location: string
  startDate: string
  endDate: string | 'Present'
  current: boolean
  gpa?: string
  honors?: string // e.g., "Summa Cum Laude", "Dean's List"
  achievements?: string[] // Academic achievements
}

// ============================================================================
// Skills
// ============================================================================

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  proficiency?: SkillProficiency
}

export type SkillCategory =
  | 'technical'
  | 'programming'
  | 'frameworks'
  | 'tools'
  | 'languages'
  | 'soft-skills'
  | 'other'

export interface SkillGroup {
  category: string // Custom category name
  skills: string[] // Skill names
}

// ============================================================================
// Projects
// ============================================================================

export interface Project {
  id: string
  name: string
  description: string
  role?: string
  startDate?: string
  endDate?: string
  technologies: string[]
  url?: string
  github?: string
  highlights: string[] // Key achievements/features
}

// ============================================================================
// Certifications
// ============================================================================

export interface Certification {
  id: string
  name: string
  issuer: string // Organization that issued
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  description?: string
}

// ============================================================================
// Languages
// ============================================================================

export type LanguageProficiency =
  | 'native'
  | 'fluent'
  | 'professional'
  | 'intermediate'
  | 'elementary'

export interface Language {
  id: string
  name: string
  proficiency: LanguageProficiency
}

// ============================================================================
// Awards & Honors
// ============================================================================

export interface Award {
  id: string
  title: string
  issuer: string
  date: string
  description?: string
}

// ============================================================================
// Volunteer Experience
// ============================================================================

export interface VolunteerExperience {
  id: string
  organization: string
  role: string
  location: string
  startDate: string
  endDate: string | 'Present'
  current: boolean
  description: string
  achievements?: string[]
}

// ============================================================================
// Publications
// ============================================================================

export interface Publication {
  id: string
  title: string
  publisher: string
  date: string
  url?: string
  authors?: string[]
  description?: string
}

// ============================================================================
// Complete Resume Data Model
// ============================================================================

export interface ResumeData {
  id: string
  name: string // Resume version name (e.g., "Software Engineer - Google")
  personal: PersonalInfo
  experience: WorkExperience[]
  education: Education[]
  skills: SkillGroup[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
  awards: Award[]
  volunteer: VolunteerExperience[]
  publications: Publication[]
  sectionOrder: ResumeSection[] // Order of sections to display
  template: TemplateId
  theme: ResumeTheme
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Resume Sections
// ============================================================================

export type ResumeSection =
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'awards'
  | 'volunteer'
  | 'publications'

export const SECTION_LABELS: Record<ResumeSection, string> = {
  personal: 'Personal Information',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  awards: 'Awards & Honors',
  volunteer: 'Volunteer Experience',
  publications: 'Publications',
}

export const DEFAULT_SECTION_ORDER: ResumeSection[] = [
  'personal',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
]

// ============================================================================
// Templates
// ============================================================================

export type TemplateId =
  | 'modern'
  | 'classic'
  | 'professional'
  | 'minimal'
  | 'creative'
  | 'executive'
  | 'two-column'
  | 'compact'
  | 'elegant'
  | 'tech'

export interface Template {
  id: TemplateId
  name: string
  description: string
  preview: string // Preview image URL or component
  atsScore: number // How ATS-friendly (0-100)
  category: TemplateCategory
  layout: 'single-column' | 'two-column'
  features: string[]
}

export type TemplateCategory = 'modern' | 'classic' | 'creative' | 'technical' | 'executive'

// ============================================================================
// Theme Customization
// ============================================================================

export interface ResumeTheme {
  primaryColor: string // Main accent color
  textColor: string
  headingColor: string
  backgroundColor: string
  fontFamily: ResumeFontFamily
  fontSize: number // Base font size in pt
  lineHeight: number
  spacing: 'compact' | 'normal' | 'relaxed'
}

export type ResumeFontFamily =
  | 'Arial'
  | 'Calibri'
  | 'Georgia'
  | 'Times New Roman'
  | 'Helvetica'
  | 'Roboto'
  | 'Open Sans'
  | 'Lato'

export const DEFAULT_THEME: ResumeTheme = {
  primaryColor: '#2563eb',
  textColor: '#1f2937',
  headingColor: '#111827',
  backgroundColor: '#ffffff',
  fontFamily: 'Calibri',
  fontSize: 11,
  lineHeight: 1.5,
  spacing: 'normal',
}

// ============================================================================
// ATS Optimization
// ============================================================================

export interface ATSScore {
  overall: number // 0-100
  formatScore: number // Checks for ATS-friendly format
  keywordScore: number // Keyword density and relevance
  contentScore: number // Content quality and completeness
  suggestions: ATSSuggestion[]
}

export interface ATSSuggestion {
  type: 'error' | 'warning' | 'info'
  category: 'format' | 'keywords' | 'content' | 'length'
  message: string
  section?: ResumeSection
  fix?: string // Suggested fix
}

// ============================================================================
// AI Content Generation
// ============================================================================

export interface AIContentRequest {
  type: 'achievement' | 'summary' | 'description' | 'keywords'
  context: {
    role?: string
    company?: string
    industry?: string
    yearsOfExperience?: number
    skills?: string[]
    currentContent?: string
  }
}

export interface AIContentResponse {
  suggestions: string[]
  keywords: string[]
  improvements?: string[]
}

// ============================================================================
// Export Options
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'json' | 'txt'
  pageSize: 'A4' | 'Letter'
  includePageNumbers: boolean
  includeLinks: boolean
  colorMode: 'color' | 'grayscale'
  watermark?: string
}

// ============================================================================
// Helper Functions & Constants
// ============================================================================

export const PROFICIENCY_LABELS: Record<SkillProficiency, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export const LANGUAGE_PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
  native: 'Native',
  fluent: 'Fluent',
  professional: 'Professional Working Proficiency',
  intermediate: 'Limited Working Proficiency',
  elementary: 'Elementary Proficiency',
}

export const ACTION_VERBS = [
  'Achieved',
  'Analyzed',
  'Built',
  'Created',
  'Designed',
  'Developed',
  'Engineered',
  'Established',
  'Implemented',
  'Improved',
  'Increased',
  'Led',
  'Managed',
  'Optimized',
  'Reduced',
  'Streamlined',
]

// Empty template for new resumes
export const EMPTY_RESUME: Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'My Resume',
  personal: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  volunteer: [],
  publications: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  template: 'modern',
  theme: DEFAULT_THEME,
}
