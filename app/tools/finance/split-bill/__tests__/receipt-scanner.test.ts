import { describe, expect, it } from 'vitest'

describe('Receipt Scanner Logic', () => {
  // Mock text extraction function (same as in ReceiptScanner.tsx)
  const extractAmountsFromText = (text: string) => {
    const data: {
      subtotal?: number
      tax?: number
      tip?: number
      total?: number
    } = {}

    const amountPattern = /\$?\s*(\d{1,6}(?:[.,]\d{2}))/g

    const patterns = {
      total: /(?:^|\s)(?:TOTAL|AMOUNT\s*DUE|BALANCE\s*DUE)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
      subtotal:
        /(?:^|\s)(?:SUB\s*TOTAL|SUBTOTAL|SUB-TOTAL|(?<!AMOUNT\s)AMOUNT(?!\s*DUE))[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
      tax: /(?:^|\s)(?:TAX|GST|VAT|SALES\s*TAX)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
      tip: /(?:^|\s)(?:TIP|GRATUITY|SERVICE\s*CHARGE)[:\s]*\$?\s*(\d{1,6}(?:[.,]\d{2}))/i,
    }

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern)
      if (match?.[1]) {
        const amount = parseFloat(match[1].replace(',', '.'))
        if (!Number.isNaN(amount) && amount > 0) {
          data[key as keyof typeof data] = amount
        }
      }
    }

    if (!data.subtotal && data.total) {
      data.subtotal = data.total
    }

    if (!data.total) {
      const amounts: number[] = []
      let match: RegExpExecArray | null = null
      match = amountPattern.exec(text)
      while (match !== null) {
        const amount = parseFloat(match[1].replace(',', '.'))
        if (!Number.isNaN(amount) && amount > 0) {
          amounts.push(amount)
        }
        match = amountPattern.exec(text)
      }
      if (amounts.length > 0) {
        data.total = Math.max(...amounts)
        if (!data.subtotal) {
          data.subtotal = data.total
        }
      }
    }

    return data
  }

  it('should extract subtotal from receipt text', () => {
    const text = 'SUBTOTAL: $45.50'
    const result = extractAmountsFromText(text)
    expect(result.subtotal).toBe(45.5)
  })

  it('should extract tax from receipt text', () => {
    const text = 'TAX: $3.64'
    const result = extractAmountsFromText(text)
    expect(result.tax).toBe(3.64)
  })

  it('should extract tip from receipt text', () => {
    const text = 'TIP: $8.00'
    const result = extractAmountsFromText(text)
    expect(result.tip).toBe(8.0)
  })

  it('should extract total from receipt text', () => {
    const text = 'TOTAL: $57.14'
    const result = extractAmountsFromText(text)
    expect(result.total).toBe(57.14)
  })

  it('should extract all amounts from complete receipt', () => {
    const text = `
      Restaurant Receipt
      SUBTOTAL: $45.50
      TAX: $3.64
      TIP: $8.00
      TOTAL: $57.14
    `
    const result = extractAmountsFromText(text)
    expect(result.subtotal).toBe(45.5)
    expect(result.tax).toBe(3.64)
    expect(result.tip).toBe(8.0)
    // Note: The function only extracts the first match of each pattern
    // Since SUBTOTAL comes first and matches, it sets subtotal
    // Then TOTAL matches and sets total - this is correct behavior
    expect(result.total).toBe(57.14)
  })

  it('should handle comma decimal separator', () => {
    const text = 'TOTAL: $45,50'
    const result = extractAmountsFromText(text)
    expect(result.total).toBe(45.5)
  })

  it('should handle amounts without dollar sign', () => {
    const text = 'SUBTOTAL: 45.50'
    const result = extractAmountsFromText(text)
    expect(result.subtotal).toBe(45.5)
  })

  it('should use total as subtotal if subtotal not found', () => {
    const text = 'TOTAL: $100.00'
    const result = extractAmountsFromText(text)
    expect(result.subtotal).toBe(100.0)
    expect(result.total).toBe(100.0)
  })

  it('should find largest amount as total when no explicit total', () => {
    const text = 'Item 1: $10.00\nItem 2: $25.50\nItem 3: $15.00'
    const result = extractAmountsFromText(text)
    expect(result.total).toBe(25.5)
  })

  it('should handle various subtotal formats', () => {
    const variations = [
      'SUB TOTAL: $45.50',
      'SUBTOTAL: $45.50',
      'SUB-TOTAL: $45.50',
      'AMOUNT: $45.50',
    ]

    variations.forEach((text) => {
      const result = extractAmountsFromText(text)
      expect(result.subtotal).toBe(45.5)
    })
  })

  it('should handle various tax formats', () => {
    const variations = ['TAX: $3.64', 'GST: $3.64', 'VAT: $3.64', 'SALES TAX: $3.64']

    variations.forEach((text) => {
      const result = extractAmountsFromText(text)
      expect(result.tax).toBe(3.64)
    })
  })

  it('should handle various tip formats', () => {
    const variations = ['TIP: $8.00', 'GRATUITY: $8.00', 'SERVICE CHARGE: $8.00']

    variations.forEach((text) => {
      const result = extractAmountsFromText(text)
      expect(result.tip).toBe(8.0)
    })
  })

  it('should return empty object for invalid text', () => {
    const text = 'No amounts here'
    const result = extractAmountsFromText(text)
    // Should return empty object when no amounts found
    expect(Object.keys(result).length).toBe(0)
  })

  it('should handle case-insensitive matching', () => {
    const text = 'subtotal: $45.50\ntax: $3.64\ntotal: $49.14'
    const result = extractAmountsFromText(text)
    expect(result.subtotal).toBe(45.5)
    expect(result.tax).toBe(3.64)
    expect(result.total).toBe(49.14)
  })
})
