import type { LucideIcon } from 'lucide-react'
import { Code2, FileJson, Film, Lock, Palette, PiggyBank, Zap } from 'lucide-react'
import type { ToolCategory } from '@/lib/data/tools'
import { tools } from '@/lib/data/tools'

export type CategoryHubId = Exclude<ToolCategory, 'all'>

export interface CategoryHubConfig {
  id: CategoryHubId
  title: string
  shortName: string
  description: string
  icon: LucideIcon
  /** Explicit CSS gradient — avoid Panda bgGradient+via inheritance bugs */
  iconGradient: string
  titleGradient: string
  keywords: string[]
  ogTitle: string
  ogDescription: (count: number) => string
  path: string
}

export const CATEGORY_HUBS: Record<CategoryHubId, CategoryHubConfig> = {
  data: {
    id: 'data',
    title: 'Data Processing Tools',
    shortName: 'Data Processing',
    description:
      'Transform, convert, and format your data with our powerful collection of free online tools.',
    icon: FileJson,
    iconGradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    titleGradient: 'linear-gradient(to right, #c084fc, #f472b6, #c084fc)',
    keywords: [
      'data processing tools',
      'json formatter',
      'json beautifier',
      'csv converter',
      'online data tools',
      'free data tools',
    ],
    ogTitle: 'Free Data Processing Tools - Transform, Convert & Format Data Online',
    ogDescription: (count) =>
      `${count}+ free online tools to transform, convert, and format your data. No signup required.`,
    path: '/tools/data',
  },
  development: {
    id: 'development',
    title: 'Developer Tools',
    shortName: 'Developer Tools',
    description:
      'Debug, format, test, and ship faster with free browser-based developer utilities.',
    icon: Code2,
    iconGradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    titleGradient: 'linear-gradient(to right, #60a5fa, #22d3ee, #60a5fa)',
    keywords: [
      'developer tools',
      'regex tester',
      'jwt decoder',
      'url encoder',
      'api tools',
      'free developer tools',
    ],
    ogTitle: 'Free Developer Tools - Regex, JWT, URL Encoder & More',
    ogDescription: (count) =>
      `${count}+ free online developer tools for encoding, debugging, and formatting. No signup required.`,
    path: '/tools/development',
  },
  media: {
    id: 'media',
    title: 'Media Tools',
    shortName: 'Media Tools',
    description:
      'Optimize, convert, and enhance images, video, and other media files in your browser.',
    icon: Film,
    iconGradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    titleGradient: 'linear-gradient(to right, #fb923c, #f87171, #fb923c)',
    keywords: [
      'media tools',
      'image optimizer',
      'video converter',
      'image compressor',
      'free media tools',
    ],
    ogTitle: 'Free Media Tools - Image Optimizer, Video Converter & More',
    ogDescription: (count) =>
      `${count}+ free online tools to optimize, convert, and enhance your media files. No signup required.`,
    path: '/tools/media',
  },
  productivity: {
    id: 'productivity',
    title: 'Productivity Tools',
    shortName: 'Productivity',
    description:
      'Boost daily workflow with free tools for writing, time tracking, resumes, converters, and more.',
    icon: Zap,
    iconGradient: 'linear-gradient(135deg, #eab308, #f97316)',
    titleGradient: 'linear-gradient(to right, #facc15, #fb923c, #facc15)',
    keywords: [
      'productivity tools',
      'resume builder',
      'case converter',
      'unit converter',
      'free productivity tools',
      'online workflow tools',
    ],
    ogTitle: 'Free Productivity Tools - Resume Builder, Converters & More',
    ogDescription: (count) =>
      `${count}+ free online productivity tools to boost your workflow. No signup required.`,
    path: '/tools/productivity',
  },
  security: {
    id: 'security',
    title: 'Security Tools',
    shortName: 'Security',
    description:
      'Generate passwords, check strength, hash, encode, and encrypt privately in your browser.',
    icon: Lock,
    iconGradient: 'linear-gradient(135deg, #22c55e, #14b8a6)',
    titleGradient: 'linear-gradient(to right, #4ade80, #2dd4bf, #4ade80)',
    keywords: [
      'security tools',
      'password generator',
      'password strength',
      'hash generator',
      'base64 encoder',
      'free security tools',
    ],
    ogTitle: 'Free Security Tools - Password Generator, Hash & Encryption',
    ogDescription: (count) =>
      `${count}+ free browser-based security tools. Private by design — no signup required.`,
    path: '/tools/security',
  },
  finance: {
    id: 'finance',
    title: 'Finance Tools',
    shortName: 'Finance',
    description:
      'Calculate tips, loans, percentages, split bills, and convert currencies quickly online.',
    icon: PiggyBank,
    iconGradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    titleGradient: 'linear-gradient(to right, #34d399, #22d3ee, #34d399)',
    keywords: [
      'finance tools',
      'tip calculator',
      'loan calculator',
      'percentage calculator',
      'currency converter',
      'split bill',
    ],
    ogTitle: 'Free Finance Tools - Calculators, Currency & Split Bill',
    ogDescription: (count) =>
      `${count}+ free online finance calculators and converters. No signup required.`,
    path: '/tools/finance',
  },
  design: {
    id: 'design',
    title: 'Design & Visual Tools',
    shortName: 'Design & Visual',
    description:
      'Pick colors, build gradients, optimize SVG, generate placeholders, and create visual assets fast.',
    icon: Palette,
    iconGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    titleGradient: 'linear-gradient(to right, #f472b6, #a78bfa, #f472b6)',
    keywords: [
      'design tools',
      'color picker',
      'gradient generator',
      'svg optimizer',
      'favicon generator',
      'free design tools',
    ],
    ogTitle: 'Free Design Tools - Color Picker, Gradients & Visual Utilities',
    ogDescription: (count) => `${count}+ free online design and visual tools. No signup required.`,
    path: '/tools/design',
  },
}

export function getCategoryTools(category: CategoryHubId) {
  return tools.filter((tool) => tool.category === category && !tool.comingSoon)
}

export function getCategoryToolCount(category: CategoryHubId) {
  return getCategoryTools(category).length
}
