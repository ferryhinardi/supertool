/**
 * Layout Constants
 *
 * Centralized constants for layout measurements and configurations.
 * Eliminates magic numbers and provides single source of truth.
 */

// ============================================
// Header Heights
// ============================================

/** Main navigation header height in pixels */
export const HEADER_HEIGHT = 64

/** Header height as CSS value */
export const HEADER_HEIGHT_PX = `${HEADER_HEIGHT}px`

// ============================================
// Viewport Calculations
// ============================================

/** Full viewport height minus header */
export const MAIN_CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px)`

/** Source panel max height calculation */
export const SOURCE_PANEL_MAX_HEIGHT = `calc(100vh - 140px)`

// ============================================
// Sidebar Dimensions
// ============================================

export const SIDEBAR_WIDTH = {
  base: '280px',
  lg: '320px',
} as const

export const SOURCE_PANEL_WIDTH = {
  base: '320px',
  lg: '380px',
} as const

// ============================================
// Animation Offsets
// ============================================

/** Sidebar slide animation offset */
export const SIDEBAR_ANIMATION_OFFSET = -300

/** Source panel slide animation offset */
export const SOURCE_PANEL_ANIMATION_OFFSET = 300

// ============================================
// Default Configuration
// ============================================

/** Default GitHub repository for Copilot context */
export const DEFAULT_COPILOT_REPO =
  process.env.NEXT_PUBLIC_COPILOT_DEFAULT_REPO || 'ferryhinardi/supertool'

// ============================================
// Z-Index Layers
// ============================================

export const Z_INDEX = {
  overlay: 10,
  sourcePanelOverlay: 15,
  sidebar: 20,
  modal: 50,
} as const

// ============================================
// Breakpoints (for reference, matches Panda CSS)
// ============================================

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const
