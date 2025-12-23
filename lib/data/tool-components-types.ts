/**
 * Shared Types for Reusable Tool Components
 *
 * These types are used across all tool UI components to ensure
 * consistency and type safety.
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Operation Definition
 * Represents a single operation/mode in a tool
 */
export interface ToolOperation {
  /** Unique identifier for the operation */
  id: string
  /** Display label */
  label: string
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Hex color code for theming */
  color: string
  /** Brief description (1-2 sentences) */
  description?: string
  /** Optional category for grouping */
  category?: string
  /** Whether operation is disabled */
  disabled?: boolean
  /** Badge text (e.g., "New", "Beta") */
  badge?: string
  /** Keyboard shortcut hint */
  shortcut?: string
}

/**
 * Operation Category
 * Groups related operations together
 */
export interface ToolOperationCategory {
  /** Category identifier */
  id: string
  /** Display label */
  label: string
  /** Operations in this category */
  operations: ToolOperation[]
  /** Optional icon for the category */
  icon?: LucideIcon
}

/**
 * Empty State Configuration
 */
export interface ToolEmptyStateProps {
  /** Icon to display */
  icon: LucideIcon
  /** Main heading */
  title: string
  /** Supporting description */
  description: string
  /** List of helpful tips */
  tips?: string[]
  /** Call-to-action button label */
  actionLabel?: string
  /** Call-to-action handler */
  onAction?: () => void
  /** Custom color scheme (hex) */
  color?: string
}

/**
 * Processing State
 */
export interface ToolProcessingState {
  /** Whether processing is active */
  isProcessing: boolean
  /** Progress percentage (0-100) */
  progress: number
  /** Current status message */
  status: string
  /** File being processed */
  fileName?: string
  /** Estimated time remaining */
  estimatedTime?: string
  /** Whether operation can be cancelled */
  cancellable?: boolean
  /** Error message if failed */
  error?: string
}

/**
 * Keyboard Shortcut
 */
export interface ToolKeyboardShortcut {
  /** Key combination (e.g., "Ctrl+S", "Cmd+K") */
  key: string
  /** What the shortcut does */
  description: string
  /** Group/category for organization */
  category?: string
  /** Platform-specific (mac, windows, linux) */
  platform?: 'mac' | 'windows' | 'linux' | 'all'
}

/**
 * Drag & Drop Item
 * Generic interface for draggable list items
 */
export interface ToolDragItem {
  /** Unique identifier */
  id: string
  /** Display content */
  [key: string]: unknown
}

/**
 * Grid Layout Configuration
 */
export interface ToolGridLayout {
  /** Base (mobile) columns */
  base?: number
  /** Small tablet columns */
  sm?: number
  /** Tablet columns */
  md?: number
  /** Desktop columns */
  lg?: number
  /** Large desktop columns */
  xl?: number
}

/**
 * Animation Presets
 */
export const TOOL_ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  fadeInFast: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  stagger: (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 },
  }),
  bottomSheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
} as const

/**
 * Standard Layout Configurations
 */
export const TOOL_LAYOUT = {
  page: {
    mx: 'auto' as const,
    maxW: '7xl' as const,
    w: 'full' as const,
    px: { base: '4', sm: '6', md: '8' } as const,
    py: { base: '6', sm: '8', md: '10' } as const,
    spaceY: { base: '6', sm: '8', md: '10' } as const,
  },
  card: {
    border: '1px solid' as const,
    borderColor: 'gray.800' as const,
    bg: 'gray.900/50' as const,
    backdropFilter: 'blur(16px)' as const,
    rounded: 'lg' as const,
  },
  grid: {
    display: 'grid' as const,
    gap: { base: '4', sm: '6' } as const,
    gridTemplateColumns: {
      base: '1fr',
      sm: 'repeat(2, 1fr)',
      lg: 'repeat(3, 1fr)',
    } as const,
    w: 'full' as const,
  },
} as const

/**
 * Standard Color Palette
 */
export const TOOL_COLORS = {
  primary: '#ef4444', // red.500
  secondary: '#3b82f6', // blue.500
  success: '#10b981', // green.500
  warning: '#f59e0b', // amber.500
  error: '#dc2626', // red.600
  info: '#06b6d4', // cyan.500
  purple: '#a855f7', // purple.500
  orange: '#f97316', // orange.500
  teal: '#14b8a6', // teal.500
  pink: '#ec4899', // pink.500
  indigo: '#6366f1', // indigo.500
  yellow: '#eab308', // yellow.500
} as const

/**
 * Touch Target Minimum Sizes (accessibility)
 */
export const TOUCH_TARGET = {
  minHeight: '44px',
  minWidth: '44px',
  preferredHeight: '48px',
  preferredWidth: '48px',
} as const
