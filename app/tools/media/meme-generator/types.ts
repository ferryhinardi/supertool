export type MemeCategory =
  | 'classic'
  | 'reaction'
  | 'wholesome'
  | 'relatable'
  | 'trending'
  | 'animals'
  | 'office'
  | 'political'
  | 'custom'

export type TextPosition = 'top' | 'middle' | 'bottom' | 'custom'

export interface MemeTemplate {
  id: string
  name: string
  category: MemeCategory
  imageUrl: string
  defaultTopText?: string
  defaultBottomText?: string
  width: number
  height: number
  boxCount: number // Number of text boxes (1 = top only, 2 = top+bottom, etc.)
  keywords: string[]
  popularity: number // 1-10
}

export interface TextBox {
  id: string
  text: string
  position: TextPosition
  x: number // percentage 0-100
  y: number // percentage 0-100
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
  strokeWidth: number
  align: 'left' | 'center' | 'right'
  uppercase: boolean
  shadowEnabled: boolean
  rotation: number
}

export interface MemeConfig {
  template: MemeTemplate | null
  customImage: File | null
  textBoxes: TextBox[]
  canvasWidth: number
  canvasHeight: number
}

export interface FontOption {
  name: string
  value: string
  preview: string
}

// Popular meme fonts
export const MEME_FONTS: FontOption[] = [
  { name: 'Impact', value: 'Impact, sans-serif', preview: 'CLASSIC MEME TEXT' },
  { name: 'Arial Black', value: 'Arial Black, sans-serif', preview: 'Bold Sans Serif' },
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive', preview: 'Comic Sans Text' },
  { name: 'Anton', value: 'Anton, sans-serif', preview: 'STRONG BOLD' },
  { name: 'Bebas Neue', value: 'Bebas Neue, sans-serif', preview: 'MODERN SANS' },
]

export const DEFAULT_TEXT_BOX: Omit<TextBox, 'id'> = {
  text: '',
  position: 'top',
  x: 50,
  y: 10,
  fontSize: 48,
  fontFamily: 'Impact, sans-serif',
  color: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 3,
  align: 'center',
  uppercase: true,
  shadowEnabled: true,
  rotation: 0,
}

export const CATEGORY_INFO: Record<
  MemeCategory,
  { label: string; description: string; emoji: string }
> = {
  classic: {
    label: 'Classic',
    description: 'Timeless meme formats',
    emoji: '🎭',
  },
  reaction: {
    label: 'Reaction',
    description: 'Express your feelings',
    emoji: '😮',
  },
  wholesome: {
    label: 'Wholesome',
    description: 'Positive and uplifting',
    emoji: '🤗',
  },
  relatable: {
    label: 'Relatable',
    description: 'Everyday situations',
    emoji: '🤝',
  },
  trending: {
    label: 'Trending',
    description: 'Hot right now',
    emoji: '🔥',
  },
  animals: {
    label: 'Animals',
    description: 'Cute and funny pets',
    emoji: '🐶',
  },
  office: {
    label: 'Office',
    description: 'Work-related humor',
    emoji: '💼',
  },
  political: {
    label: 'Political',
    description: 'Political commentary',
    emoji: '🗳️',
  },
  custom: {
    label: 'Custom',
    description: 'Upload your own',
    emoji: '📤',
  },
}
