import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearBillDraft,
  deleteBillTemplate,
  getBillTemplate,
  hasUnsavedDraft,
  loadBillDraft,
  loadBillTemplates,
  loadSettings,
  saveBillDraft,
  saveBillTemplate,
  saveSettings,
} from '../split-bill-storage'

describe('split-bill-storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
    // Use fake timers with a fixed start time
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createMockDraft = (overrides = {}) => ({
    billAmount: '100.00',
    tipPercent: '15',
    taxPercent: '8',
    currency: 'USD',
    people: [
      { id: '1', name: 'Alice', hasPaid: false },
      { id: '2', name: 'Bob', hasPaid: true },
    ],
    items: [],
    splitType: 'equal' as const,
    ...overrides,
  })

  const createMockTemplate = (overrides = {}) => ({
    name: 'Default Template',
    description: 'A test template',
    billAmount: '100.00',
    tipPercent: '15',
    taxPercent: '8',
    currency: 'USD',
    people: [{ name: 'Person 1' }, { name: 'Person 2' }],
    splitType: 'equal' as const,
    ...overrides,
  })

  describe('saveBillDraft', () => {
    it('should save draft to localStorage with timestamp', () => {
      const draft = createMockDraft()
      saveBillDraft(draft)

      const stored = localStorage.getItem('split-bill-draft')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.billAmount).toBe('100.00')
      expect(parsed.timestamp).toBeDefined()
      expect(typeof parsed.timestamp).toBe('string')
    })

    it('should save all draft properties correctly', () => {
      const draft = createMockDraft({
        billAmount: '250.50',
        tipPercent: '20',
        taxPercent: '10',
        currency: 'EUR',
      })

      saveBillDraft(draft)
      const stored = JSON.parse(localStorage.getItem('split-bill-draft')!)

      expect(stored.billAmount).toBe('250.50')
      expect(stored.tipPercent).toBe('20')
      expect(stored.taxPercent).toBe('10')
      expect(stored.currency).toBe('EUR')
      expect(stored.people.length).toBe(2)
      expect(stored.splitType).toBe('equal')
    })

    it('should handle different split types', () => {
      const percentageDraft = createMockDraft({
        splitType: 'percentage',
        people: [
          { id: '1', name: 'Alice', hasPaid: false, percentage: 60 },
          { id: '2', name: 'Bob', hasPaid: false, percentage: 40 },
        ],
      })

      saveBillDraft(percentageDraft)
      const stored = JSON.parse(localStorage.getItem('split-bill-draft')!)

      expect(stored.splitType).toBe('percentage')
      expect(stored.people[0].percentage).toBe(60)
      expect(stored.people[1].percentage).toBe(40)
    })

    it('should handle items split type', () => {
      const itemsDraft = createMockDraft({
        splitType: 'items',
        items: [
          { id: '1', name: 'Pizza', price: 20, quantity: 2, assignedTo: ['1', '2'] },
          { id: '2', name: 'Drinks', price: 5, quantity: 3, assignedTo: ['1'] },
        ],
      })

      saveBillDraft(itemsDraft)
      const stored = JSON.parse(localStorage.getItem('split-bill-draft')!)

      expect(stored.splitType).toBe('items')
      expect(stored.items.length).toBe(2)
      expect(stored.items[0].name).toBe('Pizza')
      expect(stored.items[1].assignedTo).toEqual(['1'])
    })

    it('should not throw in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      expect(() => saveBillDraft(createMockDraft())).not.toThrow()

      global.window = originalWindow
    })

    it('should validate timestamp format', () => {
      const draft = createMockDraft()
      saveBillDraft(draft)

      const loaded = loadBillDraft()
      expect(loaded?.timestamp).toBeDefined()
      // ISO 8601 format validation
      expect(new Date(loaded!.timestamp).toISOString()).toBe(loaded!.timestamp)
    })
  })

  describe('loadBillDraft', () => {
    it('should load saved draft from localStorage', () => {
      const draft = createMockDraft()
      saveBillDraft(draft)

      const loaded = loadBillDraft()
      expect(loaded).not.toBeNull()
      expect(loaded?.billAmount).toBe('100.00')
      expect(loaded?.people.length).toBe(2)
    })

    it('should return null when no draft exists', () => {
      const loaded = loadBillDraft()
      expect(loaded).toBeNull()
    })

    it('should return null and clear draft older than 7 days', () => {
      const oldDraft = {
        ...createMockDraft(),
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(oldDraft))

      const loaded = loadBillDraft()
      expect(loaded).toBeNull()
      expect(localStorage.getItem('split-bill-draft')).toBeNull()
    })

    it('should return draft within 7 days', () => {
      const recentDraft = {
        ...createMockDraft(),
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(recentDraft))

      const loaded = loadBillDraft()
      expect(loaded).not.toBeNull()
      expect(loaded?.billAmount).toBe('100.00')
    })

    it('should return draft within the 7-day threshold', () => {
      const sixDaysAgo = {
        ...createMockDraft(),
        timestamp: new Date(Date.now() - 6.9 * 24 * 60 * 60 * 1000).toISOString(),
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(sixDaysAgo))

      const loaded = loadBillDraft()
      expect(loaded).not.toBeNull()
    })

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('split-bill-draft', 'invalid json')

      const loaded = loadBillDraft()
      expect(loaded).toBeNull()
    })

    it('should return null in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      const loaded = loadBillDraft()
      expect(loaded).toBeNull()

      global.window = originalWindow
    })
  })

  describe('clearBillDraft', () => {
    it('should remove draft from localStorage', () => {
      saveBillDraft(createMockDraft())
      expect(localStorage.getItem('split-bill-draft')).not.toBeNull()

      clearBillDraft()
      expect(localStorage.getItem('split-bill-draft')).toBeNull()
    })

    it('should not throw when clearing non-existent draft', () => {
      expect(() => clearBillDraft()).not.toThrow()
    })

    it('should not throw in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      expect(() => clearBillDraft()).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('hasUnsavedDraft', () => {
    it('should return true when draft exists', () => {
      saveBillDraft(createMockDraft())
      expect(hasUnsavedDraft()).toBe(true)
    })

    it('should return false when no draft exists', () => {
      expect(hasUnsavedDraft()).toBe(false)
    })

    it('should return false when draft is too old', () => {
      const oldDraft = {
        ...createMockDraft(),
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(oldDraft))
      expect(hasUnsavedDraft()).toBe(false)
    })
  })

  describe('saveBillTemplate', () => {
    it('should save template with generated ID and timestamp', () => {
      const template = createMockTemplate()
      const id = saveBillTemplate(template)

      expect(id).toBeTruthy()
      expect(id).toContain('template-')

      const templates = loadBillTemplates()
      expect(templates.length).toBe(1)
      expect(templates[0].id).toBe(id)
      expect(templates[0].name).toBe('Default Template')
      expect(templates[0].createdAt).toBeDefined()
    })

    it('should save all template properties', () => {
      const template = createMockTemplate({
        name: 'Dinner Template',
        description: 'For dinner with friends',
        billAmount: '150.00',
        tipPercent: '20',
        currency: 'GBP',
      })

      saveBillTemplate(template)
      const templates = loadBillTemplates()

      expect(templates[0].name).toBe('Dinner Template')
      expect(templates[0].description).toBe('For dinner with friends')
      expect(templates[0].billAmount).toBe('150.00')
      expect(templates[0].tipPercent).toBe('20')
      expect(templates[0].currency).toBe('GBP')
    })

    it('should save multiple templates', () => {
      saveBillTemplate(createMockTemplate({ name: 'Template 1' }))
      vi.advanceTimersByTime(1)
      saveBillTemplate(createMockTemplate({ name: 'Template 2' }))
      vi.advanceTimersByTime(1)
      saveBillTemplate(createMockTemplate({ name: 'Template 3' }))

      const templates = loadBillTemplates()
      expect(templates.length).toBe(3)
      expect(templates.map((t) => t.name)).toEqual(['Template 1', 'Template 2', 'Template 3'])
    })

    it('should generate unique IDs for each template', () => {
      const id1 = saveBillTemplate(createMockTemplate())
      vi.advanceTimersByTime(1)
      const id2 = saveBillTemplate(createMockTemplate())
      vi.advanceTimersByTime(1)
      const id3 = saveBillTemplate(createMockTemplate())

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('should return empty string in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      const id = saveBillTemplate(createMockTemplate())
      expect(id).toBe('')

      global.window = originalWindow
    })
  })

  describe('loadBillTemplates', () => {
    it('should return empty array when no templates exist', () => {
      const templates = loadBillTemplates()
      expect(templates).toEqual([])
    })

    it('should load all saved templates', () => {
      saveBillTemplate(createMockTemplate({ name: 'Template 1' }))
      vi.advanceTimersByTime(1)
      saveBillTemplate(createMockTemplate({ name: 'Template 2' }))

      const templates = loadBillTemplates()
      expect(templates.length).toBe(2)
    })

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('split-bill-templates', 'invalid json')

      const templates = loadBillTemplates()
      expect(templates).toEqual([])
    })

    it('should return empty array in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      const templates = loadBillTemplates()
      expect(templates).toEqual([])

      global.window = originalWindow
    })
  })

  describe('deleteBillTemplate', () => {
    it('should delete specific template by ID', () => {
      const id1 = saveBillTemplate(createMockTemplate({ name: 'Template 1' }))
      vi.advanceTimersByTime(1)
      const id2 = saveBillTemplate(createMockTemplate({ name: 'Template 2' }))
      vi.advanceTimersByTime(1)
      const id3 = saveBillTemplate(createMockTemplate({ name: 'Template 3' }))

      deleteBillTemplate(id2)

      const templates = loadBillTemplates()
      expect(templates.length).toBe(2)
      expect(templates.find((t) => t.id === id1)).toBeDefined()
      expect(templates.find((t) => t.id === id2)).toBeUndefined()
      expect(templates.find((t) => t.id === id3)).toBeDefined()
    })

    it('should not affect other templates when deleting', () => {
      saveBillTemplate(createMockTemplate({ name: 'Keep This' }))
      vi.advanceTimersByTime(1)
      const id2 = saveBillTemplate(createMockTemplate({ name: 'Delete This' }))

      deleteBillTemplate(id2)

      const templates = loadBillTemplates()
      expect(templates.length).toBe(1)
      expect(templates[0].name).toBe('Keep This')
    })

    it('should handle deleting non-existent template', () => {
      saveBillTemplate(createMockTemplate())

      deleteBillTemplate('non-existent-id')

      const templates = loadBillTemplates()
      expect(templates.length).toBe(1)
    })

    it('should not throw in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      expect(() => deleteBillTemplate('any-id')).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('getBillTemplate', () => {
    it('should return specific template by ID', () => {
      const id1 = saveBillTemplate(createMockTemplate({ name: 'Template 1' }))
      vi.advanceTimersByTime(1)
      const id2 = saveBillTemplate(createMockTemplate({ name: 'Template 2' }))

      // Test both templates can be retrieved
      const template1 = getBillTemplate(id1)
      const template2 = getBillTemplate(id2)

      expect(template1).not.toBeNull()
      expect(template1?.name).toBe('Template 1')
      expect(template1?.id).toBe(id1)

      expect(template2).not.toBeNull()
      expect(template2?.name).toBe('Template 2')
      expect(template2?.id).toBe(id2)
    })

    it('should return null for non-existent ID', () => {
      saveBillTemplate(createMockTemplate())

      const template = getBillTemplate('non-existent-id')
      expect(template).toBeNull()
    })

    it('should return null when no templates exist', () => {
      const template = getBillTemplate('any-id')
      expect(template).toBeNull()
    })

    it('should return template with all properties', () => {
      const templateData = createMockTemplate({
        name: 'Full Template',
        description: 'Complete template',
        billAmount: '200.00',
        tipPercent: '18',
        taxPercent: '9',
        currency: 'CAD',
      })

      const id = saveBillTemplate(templateData)
      const template = getBillTemplate(id)

      expect(template?.name).toBe('Full Template')
      expect(template?.description).toBe('Complete template')
      expect(template?.billAmount).toBe('200.00')
      expect(template?.tipPercent).toBe('18')
      expect(template?.taxPercent).toBe('9')
      expect(template?.currency).toBe('CAD')
    })
  })

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      saveSettings({
        defaultCurrency: 'EUR',
        defaultTipPercent: '20',
        defaultTaxPercent: '10',
      })

      const stored = localStorage.getItem('split-bill-settings')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.defaultCurrency).toBe('EUR')
      expect(parsed.defaultTipPercent).toBe('20')
      expect(parsed.defaultTaxPercent).toBe('10')
    })

    it('should merge with existing settings', () => {
      saveSettings({ defaultCurrency: 'USD', defaultTipPercent: '15' })
      saveSettings({ defaultTaxPercent: '8' })

      const settings = loadSettings()
      expect(settings.defaultCurrency).toBe('USD')
      expect(settings.defaultTipPercent).toBe('15')
      expect(settings.defaultTaxPercent).toBe('8')
    })

    it('should overwrite existing values', () => {
      saveSettings({ defaultCurrency: 'USD' })
      saveSettings({ defaultCurrency: 'EUR' })

      const settings = loadSettings()
      expect(settings.defaultCurrency).toBe('EUR')
    })

    it('should handle partial settings updates', () => {
      saveSettings({ defaultCurrency: 'GBP', defaultTipPercent: '18', defaultTaxPercent: '5' })
      saveSettings({ defaultTipPercent: '20' })

      const settings = loadSettings()
      expect(settings.defaultCurrency).toBe('GBP')
      expect(settings.defaultTipPercent).toBe('20')
      expect(settings.defaultTaxPercent).toBe('5')
    })

    it('should not throw in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      expect(() => saveSettings({ defaultCurrency: 'USD' })).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('loadSettings', () => {
    it('should return empty object when no settings exist', () => {
      const settings = loadSettings()
      expect(settings).toEqual({})
    })

    it('should load saved settings', () => {
      saveSettings({
        defaultCurrency: 'JPY',
        defaultTipPercent: '10',
        defaultTaxPercent: '5',
      })

      const settings = loadSettings()
      expect(settings.defaultCurrency).toBe('JPY')
      expect(settings.defaultTipPercent).toBe('10')
      expect(settings.defaultTaxPercent).toBe('5')
    })

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('split-bill-settings', 'invalid json')

      const settings = loadSettings()
      expect(settings).toEqual({})
    })

    it('should return empty object in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      const settings = loadSettings()
      expect(settings).toEqual({})

      global.window = originalWindow
    })

    it('should handle optional properties', () => {
      saveSettings({ defaultCurrency: 'USD' })

      const settings = loadSettings()
      expect(settings.defaultCurrency).toBe('USD')
      expect(settings.defaultTipPercent).toBeUndefined()
      expect(settings.defaultTaxPercent).toBeUndefined()
    })
  })
})
