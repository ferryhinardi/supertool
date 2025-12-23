/**
 * Local Storage utilities for Split Bill Calculator
 * Provides auto-save and restore functionality
 */

interface BillDraft {
  billAmount: string
  tipPercent: string
  taxPercent: string
  currency: string
  people: Array<{
    id: string
    name: string
    hasPaid: boolean
    percentage?: number
  }>
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    assignedTo: string[]
  }>
  splitType: 'equal' | 'percentage' | 'items'
  timestamp: string
}

interface BillTemplate {
  id: string
  name: string
  description?: string
  billAmount: string
  tipPercent: string
  taxPercent: string
  currency: string
  people: Array<{
    name: string
    percentage?: number
  }>
  splitType: 'equal' | 'percentage' | 'items'
  createdAt: string
}

const STORAGE_KEY = 'split-bill-draft'
const TEMPLATES_KEY = 'split-bill-templates'
const SETTINGS_KEY = 'split-bill-settings'

/**
 * Save current bill draft to localStorage
 */
export function saveBillDraft(draft: Omit<BillDraft, 'timestamp'>): void {
  if (typeof window === 'undefined') return

  try {
    const billDraft: BillDraft = {
      ...draft,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(billDraft))
  } catch (error) {
    console.error('Failed to save bill draft:', error)
  }
}

/**
 * Load saved bill draft from localStorage
 */
export function loadBillDraft(): BillDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const draft: BillDraft = JSON.parse(stored)

    // Check if draft is recent (within 7 days)
    const draftDate = new Date(draft.timestamp)
    const daysSince = (Date.now() - draftDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince > 7) {
      // Draft too old, delete it
      clearBillDraft()
      return null
    }

    return draft
  } catch (error) {
    console.error('Failed to load bill draft:', error)
    return null
  }
}

/**
 * Clear saved bill draft
 */
export function clearBillDraft(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear bill draft:', error)
  }
}

/**
 * Check if there's an unsaved draft
 */
export function hasUnsavedDraft(): boolean {
  return loadBillDraft() !== null
}

/**
 * Save a bill template
 */
export function saveBillTemplate(template: Omit<BillTemplate, 'id' | 'createdAt'>): string {
  if (typeof window === 'undefined') return ''

  try {
    const templates = loadBillTemplates()
    const newTemplate: BillTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    templates.push(newTemplate)
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))

    return newTemplate.id
  } catch (error) {
    console.error('Failed to save bill template:', error)
    return ''
  }
}

/**
 * Load all bill templates
 */
export function loadBillTemplates(): BillTemplate[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(TEMPLATES_KEY)
    if (!stored) return []

    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load bill templates:', error)
    return []
  }
}

/**
 * Delete a bill template
 */
export function deleteBillTemplate(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const templates = loadBillTemplates()
    const filtered = templates.filter((t) => t.id !== id)
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete bill template:', error)
  }
}

/**
 * Get a specific template
 */
export function getBillTemplate(id: string): BillTemplate | null {
  const templates = loadBillTemplates()
  return templates.find((t) => t.id === id) || null
}

/**
 * Save user settings
 */
export function saveSettings(settings: {
  defaultCurrency?: string
  defaultTipPercent?: string
  defaultTaxPercent?: string
}): void {
  if (typeof window === 'undefined') return

  try {
    const current = loadSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

/**
 * Load user settings
 */
export function loadSettings(): {
  defaultCurrency?: string
  defaultTipPercent?: string
  defaultTaxPercent?: string
} {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return {}

    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load settings:', error)
    return {}
  }
}
