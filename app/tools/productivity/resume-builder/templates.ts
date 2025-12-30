/**
 * Resume Builder - Template Definitions
 * 10+ ATS-friendly resume templates with metadata
 */

import type { Template, TemplateId } from './types'

export const RESUME_TEMPLATES: Record<TemplateId, Template> = {
  modern: {
    id: 'modern',
    name: 'Modern Professional',
    description:
      'Clean, contemporary design with subtle color accents. Perfect for tech, creative, and modern industries.',
    preview: '/templates/modern-preview.png',
    atsScore: 95,
    category: 'modern',
    layout: 'single-column',
    features: ['Color accents', 'Clean typography', 'ATS-friendly', 'Professional look'],
  },

  classic: {
    id: 'classic',
    name: 'Classic Traditional',
    description:
      'Timeless design with traditional formatting. Ideal for conservative industries like finance, law, and government.',
    preview: '/templates/classic-preview.png',
    atsScore: 100,
    category: 'classic',
    layout: 'single-column',
    features: ['Traditional format', '100% ATS-safe', 'Professional', 'Universally accepted'],
  },

  professional: {
    id: 'professional',
    name: 'Professional Executive',
    description:
      'Sophisticated design for experienced professionals and executives. Emphasizes achievements and leadership.',
    preview: '/templates/professional-preview.png',
    atsScore: 92,
    category: 'executive',
    layout: 'single-column',
    features: ['Executive-level design', 'Achievement-focused', 'Premium look', 'ATS-compatible'],
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    description:
      'Ultra-clean, minimalist design with maximum whitespace. Perfect for designers, artists, and creative professionals.',
    preview: '/templates/minimal-preview.png',
    atsScore: 90,
    category: 'modern',
    layout: 'single-column',
    features: ['Minimalist design', 'Generous whitespace', 'Modern typography', 'Clean layout'],
  },

  creative: {
    id: 'creative',
    name: 'Creative Bold',
    description:
      'Eye-catching design with bold typography and unique layout. Best for creative roles in marketing, design, and media.',
    preview: '/templates/creative-preview.png',
    atsScore: 75,
    category: 'creative',
    layout: 'two-column',
    features: ['Bold design', 'Unique layout', 'Eye-catching', 'Creative industries'],
  },

  executive: {
    id: 'executive',
    name: 'Executive Leadership',
    description:
      'Premium design for C-level executives and senior leaders. Emphasizes strategic impact and leadership experience.',
    preview: '/templates/executive-preview.png',
    atsScore: 88,
    category: 'executive',
    layout: 'single-column',
    features: ['C-level appropriate', 'Leadership focus', 'Premium design', 'Impact-oriented'],
  },

  'two-column': {
    id: 'two-column',
    name: 'Two-Column Modern',
    description:
      'Space-efficient two-column layout. Ideal for fitting more content on one page while maintaining readability.',
    preview: '/templates/two-column-preview.png',
    atsScore: 85,
    category: 'modern',
    layout: 'two-column',
    features: ['Space-efficient', 'Two-column layout', 'Modern design', 'Content-rich'],
  },

  compact: {
    id: 'compact',
    name: 'Compact Efficient',
    description:
      'Maximizes space with compact formatting. Perfect for experienced professionals with extensive history.',
    preview: '/templates/compact-preview.png',
    atsScore: 93,
    category: 'classic',
    layout: 'single-column',
    features: ['Space-efficient', 'Compact design', 'Fits more content', 'ATS-friendly'],
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant Professional',
    description:
      'Refined design with elegant typography and subtle details. Suitable for high-end professional roles.',
    preview: '/templates/elegant-preview.png',
    atsScore: 90,
    category: 'modern',
    layout: 'single-column',
    features: ['Elegant typography', 'Refined design', 'Professional', 'Sophisticated'],
  },

  tech: {
    id: 'tech',
    name: 'Tech Engineer',
    description:
      'Optimized for software engineers and tech professionals. Highlights technical skills and projects prominently.',
    preview: '/templates/tech-preview.png',
    atsScore: 97,
    category: 'technical',
    layout: 'single-column',
    features: ['Tech-optimized', 'Skills-focused', 'Project highlights', 'GitHub/portfolio links'],
  },
}

// Template categories for filtering
export const TEMPLATE_CATEGORIES = {
  all: 'All Templates',
  modern: 'Modern',
  classic: 'Classic',
  creative: 'Creative',
  technical: 'Technical',
  executive: 'Executive',
} as const

// Get templates by category
export function getTemplatesByCategory(category: string): Template[] {
  if (category === 'all') {
    return Object.values(RESUME_TEMPLATES)
  }
  return Object.values(RESUME_TEMPLATES).filter((t) => t.category === category)
}

// Get template by ID
export function getTemplateById(id: TemplateId): Template | undefined {
  return RESUME_TEMPLATES[id]
}

// Get high ATS score templates (90+)
export function getATSOptimizedTemplates(): Template[] {
  return Object.values(RESUME_TEMPLATES).filter((t) => t.atsScore >= 90)
}

// Sort templates by ATS score
export function getTemplatesSortedByATS(): Template[] {
  return Object.values(RESUME_TEMPLATES).sort((a, b) => b.atsScore - a.atsScore)
}

// Recommended templates for specific roles
export const ROLE_TEMPLATE_RECOMMENDATIONS: Record<string, TemplateId[]> = {
  'software-engineer': ['tech', 'modern', 'professional'],
  designer: ['creative', 'minimal', 'elegant'],
  executive: ['executive', 'professional', 'elegant'],
  finance: ['classic', 'professional', 'compact'],
  marketing: ['creative', 'modern', 'two-column'],
  'data-scientist': ['tech', 'modern', 'professional'],
  'product-manager': ['professional', 'modern', 'elegant'],
  sales: ['modern', 'professional', 'two-column'],
  teacher: ['classic', 'professional', 'compact'],
  healthcare: ['classic', 'professional', 'compact'],
  legal: ['classic', 'professional', 'elegant'],
  student: ['modern', 'minimal', 'compact'],
}

// Get recommended templates for a role
export function getRecommendedTemplates(role: string): Template[] {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '-')
  const templateIds = ROLE_TEMPLATE_RECOMMENDATIONS[normalizedRole] || [
    'modern',
    'classic',
    'professional',
  ]
  return templateIds.map((id) => RESUME_TEMPLATES[id]).filter(Boolean)
}
