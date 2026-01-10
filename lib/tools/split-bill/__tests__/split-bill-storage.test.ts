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
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('saveBillDraft', () => {
    it('should save bill draft to localStorage', () => {
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [{ id: '1', name: 'Alice', hasPaid: false }],
        items: [],
        splitType: 'equal' as const,
      }

      saveBillDraft(draft)

      const savedData = localStorage.getItem('split-bill-draft')
      expect(savedData).not.toBeNull()
      expect(savedData).toContain('"billAmount":"100"')
    })

    it('should add timestamp to draft', () => {
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        items: [],
        splitType: 'equal' as const,
      }

      saveBillDraft(draft)

      const savedData = JSON.parse(localStorage.getItem('split-bill-draft') || '{}')
      expect(savedData.timestamp).toBeDefined()
      expect(new Date(savedData.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalSetItem = localStorage.setItem.bind(localStorage)

      // Temporarily override setItem to throw
      localStorage.setItem = () => {
        throw new Error('Storage full')
      }

      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        items: [],
        splitType: 'equal' as const,
      }

      // Should not throw
      expect(() => saveBillDraft(draft)).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save bill draft:', expect.any(Error))

      // Restore
      localStorage.setItem = originalSetItem
    })

    it('should save draft with people having percentages', () => {
      const draft = {
        billAmount: '200',
        tipPercent: '20',
        taxPercent: '10',
        currency: 'EUR',
        people: [
          { id: '1', name: 'Alice', hasPaid: true, percentage: 60 },
          { id: '2', name: 'Bob', hasPaid: false, percentage: 40 },
        ],
        items: [],
        splitType: 'percentage' as const,
      }

      saveBillDraft(draft)

      const savedData = JSON.parse(localStorage.getItem('split-bill-draft') || '{}')
      expect(savedData.people[0].percentage).toBe(60)
      expect(savedData.people[1].percentage).toBe(40)
    })

    it('should save draft with items', () => {
      const draft = {
        billAmount: '150',
        tipPercent: '18',
        taxPercent: '9',
        currency: 'GBP',
        people: [{ id: '1', name: 'Alice', hasPaid: false }],
        items: [
          { id: 'item1', name: 'Pizza', price: 25, quantity: 2, assignedTo: ['1'] },
          { id: 'item2', name: 'Salad', price: 12, quantity: 1, assignedTo: ['1'] },
        ],
        splitType: 'items' as const,
      }

      saveBillDraft(draft)

      const savedData = JSON.parse(localStorage.getItem('split-bill-draft') || '{}')
      expect(savedData.items).toHaveLength(2)
      expect(savedData.items[0].name).toBe('Pizza')
    })
  })

  describe('loadBillDraft', () => {
    it('should return null when no draft exists', () => {
      const result = loadBillDraft()
      expect(result).toBeNull()
    })

    it('should load existing draft from localStorage', () => {
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [{ id: '1', name: 'Alice', hasPaid: false }],
        items: [],
        splitType: 'equal',
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(draft))

      const result = loadBillDraft()

      expect(result).toEqual(draft)
    })

    it('should return null and clear draft if older than 7 days', () => {
      const oldTimestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        items: [],
        splitType: 'equal',
        timestamp: oldTimestamp,
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(draft))

      const result = loadBillDraft()

      expect(result).toBeNull()
      // Verify draft was cleared
      expect(localStorage.getItem('split-bill-draft')).toBeNull()
    })

    it('should return draft if within 7 days', () => {
      const recentTimestamp = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        items: [],
        splitType: 'equal',
        timestamp: recentTimestamp,
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(draft))

      const result = loadBillDraft()

      expect(result).toEqual(draft)
    })

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('split-bill-draft', 'invalid json')

      const result = loadBillDraft()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load bill draft:', expect.any(Error))
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalGetItem = localStorage.getItem.bind(localStorage)

      localStorage.getItem = () => {
        throw new Error('Access denied')
      }

      const result = loadBillDraft()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load bill draft:', expect.any(Error))

      localStorage.getItem = originalGetItem
    })
  })

  describe('clearBillDraft', () => {
    it('should remove draft from localStorage', () => {
      localStorage.setItem('split-bill-draft', JSON.stringify({ billAmount: '100' }))

      clearBillDraft()

      expect(localStorage.getItem('split-bill-draft')).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalRemoveItem = localStorage.removeItem.bind(localStorage)

      localStorage.removeItem = () => {
        throw new Error('Access denied')
      }

      expect(() => clearBillDraft()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to clear bill draft:', expect.any(Error))

      localStorage.removeItem = originalRemoveItem
    })
  })

  describe('hasUnsavedDraft', () => {
    it('should return true when draft exists and is recent', () => {
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        items: [],
        splitType: 'equal',
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(draft))

      expect(hasUnsavedDraft()).toBe(true)
    })

    it('should return false when no draft exists', () => {
      expect(hasUnsavedDraft()).toBe(false)
    })

    it('should return false when draft is too old', () => {
      const oldTimestamp = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      const draft = {
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        items: [],
        splitType: 'equal',
        timestamp: oldTimestamp,
      }

      localStorage.setItem('split-bill-draft', JSON.stringify(draft))

      expect(hasUnsavedDraft()).toBe(false)
    })
  })

  describe('saveBillTemplate', () => {
    it('should save new template and return id', () => {
      const template = {
        name: 'Weekly Lunch',
        description: 'Team lunch split',
        billAmount: '200',
        tipPercent: '20',
        taxPercent: '10',
        currency: 'USD',
        people: [{ name: 'Alice' }, { name: 'Bob' }],
        splitType: 'equal' as const,
      }

      const id = saveBillTemplate(template)

      expect(id).toMatch(/^template-\d+$/)
      const savedTemplates = JSON.parse(localStorage.getItem('split-bill-templates') || '[]')
      expect(savedTemplates).toHaveLength(1)
      expect(savedTemplates[0].name).toBe('Weekly Lunch')
    })

    it('should add template to existing templates', () => {
      const existingTemplates = [
        {
          id: 'template-1',
          name: 'Existing',
          billAmount: '100',
          tipPercent: '15',
          taxPercent: '8',
          currency: 'USD',
          people: [],
          splitType: 'equal',
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('split-bill-templates', JSON.stringify(existingTemplates))

      const newTemplate = {
        name: 'New Template',
        billAmount: '300',
        tipPercent: '18',
        taxPercent: '9',
        currency: 'EUR',
        people: [{ name: 'Charlie' }],
        splitType: 'percentage' as const,
      }

      saveBillTemplate(newTemplate)

      const savedTemplates = JSON.parse(localStorage.getItem('split-bill-templates') || '[]')
      expect(savedTemplates).toHaveLength(2)
    })

    it('should include createdAt timestamp', () => {
      const template = {
        name: 'Test Template',
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        splitType: 'equal' as const,
      }

      saveBillTemplate(template)

      const savedTemplates = JSON.parse(localStorage.getItem('split-bill-templates') || '[]')
      expect(savedTemplates[0].createdAt).toBeDefined()
    })

    it('should handle localStorage errors and return empty string', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalSetItem = localStorage.setItem.bind(localStorage)

      localStorage.setItem = () => {
        throw new Error('Storage full')
      }

      const template = {
        name: 'Test',
        billAmount: '100',
        tipPercent: '15',
        taxPercent: '8',
        currency: 'USD',
        people: [],
        splitType: 'equal' as const,
      }

      const result = saveBillTemplate(template)

      expect(result).toBe('')
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save bill template:', expect.any(Error))

      localStorage.setItem = originalSetItem
    })

    it('should save template with people percentages', () => {
      const template = {
        name: 'Percentage Split',
        billAmount: '500',
        tipPercent: '20',
        taxPercent: '10',
        currency: 'USD',
        people: [
          { name: 'Alice', percentage: 50 },
          { name: 'Bob', percentage: 30 },
          { name: 'Charlie', percentage: 20 },
        ],
        splitType: 'percentage' as const,
      }

      saveBillTemplate(template)

      const savedTemplates = JSON.parse(localStorage.getItem('split-bill-templates') || '[]')
      expect(savedTemplates[0].people[0].percentage).toBe(50)
    })
  })

  describe('loadBillTemplates', () => {
    it('should return empty array when no templates exist', () => {
      const result = loadBillTemplates()
      expect(result).toEqual([])
    })

    it('should return existing templates', () => {
      const templates = [
        {
          id: 'template-1',
          name: 'Template 1',
          billAmount: '100',
          tipPercent: '15',
          taxPercent: '8',
          currency: 'USD',
          people: [],
          splitType: 'equal',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template-2',
          name: 'Template 2',
          billAmount: '200',
          tipPercent: '20',
          taxPercent: '10',
          currency: 'EUR',
          people: [],
          splitType: 'percentage',
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('split-bill-templates', JSON.stringify(templates))

      const result = loadBillTemplates()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Template 1')
      expect(result[1].name).toBe('Template 2')
    })

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('split-bill-templates', 'invalid json')

      const result = loadBillTemplates()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load bill templates:', expect.any(Error))
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalGetItem = localStorage.getItem.bind(localStorage)

      localStorage.getItem = () => {
        throw new Error('Access denied')
      }

      const result = loadBillTemplates()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load bill templates:', expect.any(Error))

      localStorage.getItem = originalGetItem
    })
  })

  describe('deleteBillTemplate', () => {
    it('should delete template by id', () => {
      const templates = [
        {
          id: 'template-1',
          name: 'Template 1',
          billAmount: '100',
          tipPercent: '15',
          taxPercent: '8',
          currency: 'USD',
          people: [],
          splitType: 'equal',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template-2',
          name: 'Template 2',
          billAmount: '200',
          tipPercent: '20',
          taxPercent: '10',
          currency: 'EUR',
          people: [],
          splitType: 'percentage',
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('split-bill-templates', JSON.stringify(templates))

      deleteBillTemplate('template-1')

      const savedTemplates = JSON.parse(localStorage.getItem('split-bill-templates') || '[]')
      expect(savedTemplates).toHaveLength(1)
      expect(savedTemplates[0].id).toBe('template-2')
    })

    it('should do nothing when template id does not exist', () => {
      const templates = [
        {
          id: 'template-1',
          name: 'Template 1',
          billAmount: '100',
          tipPercent: '15',
          taxPercent: '8',
          currency: 'USD',
          people: [],
          splitType: 'equal',
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('split-bill-templates', JSON.stringify(templates))

      deleteBillTemplate('non-existent')

      const savedTemplates = JSON.parse(localStorage.getItem('split-bill-templates') || '[]')
      expect(savedTemplates).toHaveLength(1)
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalSetItem = localStorage.setItem.bind(localStorage)

      localStorage.setItem(
        'split-bill-templates',
        JSON.stringify([
          {
            id: 'template-1',
            name: 'Template 1',
            billAmount: '100',
            tipPercent: '15',
            taxPercent: '8',
            currency: 'USD',
            people: [],
            splitType: 'equal',
            createdAt: new Date().toISOString(),
          },
        ])
      )

      // Override setItem after the initial set
      localStorage.setItem = () => {
        throw new Error('Access denied')
      }

      expect(() => deleteBillTemplate('template-1')).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete bill template:', expect.any(Error))

      localStorage.setItem = originalSetItem
    })
  })

  describe('getBillTemplate', () => {
    it('should return template by id', () => {
      const templates = [
        {
          id: 'template-1',
          name: 'Template 1',
          billAmount: '100',
          tipPercent: '15',
          taxPercent: '8',
          currency: 'USD',
          people: [],
          splitType: 'equal',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template-2',
          name: 'Template 2',
          billAmount: '200',
          tipPercent: '20',
          taxPercent: '10',
          currency: 'EUR',
          people: [],
          splitType: 'percentage',
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('split-bill-templates', JSON.stringify(templates))

      const result = getBillTemplate('template-2')

      expect(result?.name).toBe('Template 2')
      expect(result?.billAmount).toBe('200')
    })

    it('should return null when template does not exist', () => {
      const templates = [
        {
          id: 'template-1',
          name: 'Template 1',
          billAmount: '100',
          tipPercent: '15',
          taxPercent: '8',
          currency: 'USD',
          people: [],
          splitType: 'equal',
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('split-bill-templates', JSON.stringify(templates))

      const result = getBillTemplate('non-existent')

      expect(result).toBeNull()
    })

    it('should return null when no templates exist', () => {
      const result = getBillTemplate('any-id')

      expect(result).toBeNull()
    })
  })

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings = {
        defaultCurrency: 'EUR',
        defaultTipPercent: '20',
        defaultTaxPercent: '10',
      }

      saveSettings(settings)

      const savedSettings = localStorage.getItem('split-bill-settings')
      expect(savedSettings).not.toBeNull()
      expect(savedSettings).toContain('"defaultCurrency":"EUR"')
    })

    it('should merge with existing settings', () => {
      const existingSettings = {
        defaultCurrency: 'USD',
        defaultTipPercent: '15',
      }
      localStorage.setItem('split-bill-settings', JSON.stringify(existingSettings))

      saveSettings({ defaultTaxPercent: '8' })

      const savedSettings = JSON.parse(localStorage.getItem('split-bill-settings') || '{}')
      expect(savedSettings.defaultCurrency).toBe('USD')
      expect(savedSettings.defaultTipPercent).toBe('15')
      expect(savedSettings.defaultTaxPercent).toBe('8')
    })

    it('should override existing settings', () => {
      const existingSettings = {
        defaultCurrency: 'USD',
        defaultTipPercent: '15',
      }
      localStorage.setItem('split-bill-settings', JSON.stringify(existingSettings))

      saveSettings({ defaultCurrency: 'GBP', defaultTipPercent: '20' })

      const savedSettings = JSON.parse(localStorage.getItem('split-bill-settings') || '{}')
      expect(savedSettings.defaultCurrency).toBe('GBP')
      expect(savedSettings.defaultTipPercent).toBe('20')
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalSetItem = localStorage.setItem.bind(localStorage)

      localStorage.setItem = () => {
        throw new Error('Storage full')
      }

      expect(() => saveSettings({ defaultCurrency: 'EUR' })).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error))

      localStorage.setItem = originalSetItem
    })
  })

  describe('loadSettings', () => {
    it('should return empty object when no settings exist', () => {
      const result = loadSettings()
      expect(result).toEqual({})
    })

    it('should return existing settings', () => {
      const settings = {
        defaultCurrency: 'EUR',
        defaultTipPercent: '20',
        defaultTaxPercent: '10',
      }
      localStorage.setItem('split-bill-settings', JSON.stringify(settings))

      const result = loadSettings()

      expect(result).toEqual(settings)
    })

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('split-bill-settings', 'invalid json')

      const result = loadSettings()

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error))
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalGetItem = localStorage.getItem.bind(localStorage)

      localStorage.getItem = () => {
        throw new Error('Access denied')
      }

      const result = loadSettings()

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error))

      localStorage.getItem = originalGetItem
    })

    it('should return partial settings', () => {
      const settings = {
        defaultCurrency: 'EUR',
      }
      localStorage.setItem('split-bill-settings', JSON.stringify(settings))

      const result = loadSettings()

      expect(result).toEqual({ defaultCurrency: 'EUR' })
      expect(result.defaultTipPercent).toBeUndefined()
    })
  })

  // Note: SSR safety tests are skipped because manipulating globalThis.window
  // in jsdom causes issues with the test environment's beforeAll hook
  // The source code already handles SSR correctly by checking `typeof window === 'undefined'`
})
