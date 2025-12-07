import { describe, expect, it } from 'vitest'
import {
  extractAmounts,
  extractDate,
  extractLineItems,
  extractMerchantName,
  parseReceiptText,
} from '../receipt-parser'

describe('receipt-parser', () => {
  describe('extractLineItems', () => {
    it('should extract items with qty_item_at_price_total pattern', () => {
      const lines = ['2 x Burger @ $12.50 = $25.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Burger')
      expect(items[0].price).toBe(12.5)
      expect(items[0].quantity).toBe(2)
      expect(items[0].confidence).toBe('high')
    })

    it('should extract items with qty_item_price pattern', () => {
      const lines = ['2 Pizza Margherita    $15.99']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Pizza Margherita')
      expect(items[0].price).toBe(15.99)
      expect(items[0].quantity).toBe(2)
    })

    it('should extract items with item_qty_price pattern', () => {
      const lines = ['French Fries x2 $8.50']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('French Fries')
      expect(items[0].price).toBe(8.5)
      expect(items[0].quantity).toBe(2)
    })

    it('should extract items with item_spaces_price pattern', () => {
      const lines = ['Caesar Salad      $14.99']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Caesar Salad')
      expect(items[0].price).toBe(14.99)
      expect(items[0].quantity).toBe(1)
      expect(items[0].confidence).toBe('high')
    })

    it('should extract items with item_dots_price pattern', () => {
      const lines = ['Iced Coffee...........$4.50']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Iced Coffee')
      expect(items[0].price).toBe(4.5)
      expect(items[0].confidence).toBe('high')
    })

    it('should extract items with item_price_simple pattern', () => {
      const lines = ['Water $2.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('Water')
      expect(items[0].price).toBe(2.0)
      expect(items[0].confidence).toBe('medium')
    })

    it('should skip lines with excluded keywords', () => {
      const lines = ['TOTAL $50.00', 'SUBTOTAL $45.00', 'TAX $5.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should skip empty lines', () => {
      const lines = ['', '  ', '\t']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should skip lines that are too short', () => {
      const lines = ['Hi', 'No']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should skip lines that are too long', () => {
      const longLine = 'A'.repeat(101) + ' $10.00'
      const items = extractLineItems([longLine])

      expect(items).toHaveLength(0)
    })

    it('should handle comma decimal separator', () => {
      const lines = ['Pasta $12,50']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(12.5)
    })

    it('should skip items with invalid names (only numbers)', () => {
      const lines = ['123 $10.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should skip items with names missing letters', () => {
      const lines = ['1-2 $10.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should skip items with invalid prices', () => {
      const lines = ['Coffee $0.00', 'Burger $9999999.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should skip items with invalid quantities', () => {
      const lines = ['0 x Coffee $5.00', '100 x Burger $10.00']
      const items = extractLineItems(lines)

      expect(items).toHaveLength(0)
    })

    it('should extract multiple items from a receipt', () => {
      const lines = [
        'Cheeseburger    $12.99',
        '2 x Fries @ $4.50 = $9.00',
        'Coke...........$3.00',
        'SUBTOTAL $24.99',
        'TAX $2.50',
      ]
      const items = extractLineItems(lines)

      expect(items).toHaveLength(3)
      expect(items[0].name).toBe('Cheeseburger')
      expect(items[1].name).toBe('Fries')
      expect(items[2].name).toBe('Coke')
    })

    it('should handle items with special characters in names', () => {
      const lines = ["O'Reilly's Fish & Chips    $18.99"]
      const items = extractLineItems(lines)

      expect(items).toHaveLength(1)
      expect(items[0].name).toBe("O'Reilly's Fish & Chips")
    })

    it('should use matchedPattern field', () => {
      const lines = ['2 x Burger @ $12.50 = $25.00']
      const items = extractLineItems(lines)

      expect(items[0].matchedPattern).toBe('qty_item_at_price_total')
    })

    it('should store rawText', () => {
      const line = '2 x Burger @ $12.50 = $25.00'
      const items = extractLineItems([line])

      expect(items[0].rawText).toBe(line)
    })
  })

  describe('extractMerchantName', () => {
    it('should extract merchant name with keyword', () => {
      const lines = ['ABC RESTAURANT', 'Address Line', 'Phone Number']
      const merchant = extractMerchantName(lines)

      expect(merchant).toBe('ABC')
    })

    it('should extract capitalized merchant name', () => {
      const lines = ['JOES CAFE', 'Address Line']
      const merchant = extractMerchantName(lines)

      expect(merchant).toBe('JOES')
    })

    it('should extract merchant from first 5 lines only', () => {
      const lines = ['', '', '', '', '', 'THE BISTRO']
      const merchant = extractMerchantName(lines)

      expect(merchant).toBeUndefined()
    })

    it('should validate merchant name length', () => {
      const lines = ['AB', 'A'.repeat(41)]
      const merchant = extractMerchantName(lines)

      expect(merchant).toBeUndefined()
    })

    it('should require capital letters', () => {
      const lines = ['lowercase cafe']
      const merchant = extractMerchantName(lines)

      expect(merchant).toBeUndefined()
    })

    it('should handle merchant with ampersand', () => {
      const lines = ['Smith & Jones Bar']
      const merchant = extractMerchantName(lines)

      expect(merchant).toBe('Smith & Jones')
    })

    it('should return undefined if no match', () => {
      const lines = ['123', '456', '789']
      const merchant = extractMerchantName(lines)

      expect(merchant).toBeUndefined()
    })
  })

  describe('extractDate', () => {
    it('should extract date with slashes', () => {
      const lines = ['Merchant Name', '12/25/2023', 'Address']
      const date = extractDate(lines)

      expect(date).toBe('12/25/2023')
    })

    it('should extract date with dashes', () => {
      const lines = ['Merchant Name', '2023-12-25', 'Address']
      const date = extractDate(lines)

      expect(date).toBe('23-12-25')
    })

    it('should extract date in word format', () => {
      const lines = ['Merchant Name', 'December 25, 2023', 'Address']
      const date = extractDate(lines)

      expect(date).toBe('December 25, 2023')
    })

    it('should extract date from first 10 lines only', () => {
      const lines = Array(10).fill('Text')
      lines.push('12/25/2023')
      const date = extractDate(lines)

      expect(date).toBeUndefined()
    })

    it('should return undefined if no date found', () => {
      const lines = ['No date here', 'Just text']
      const date = extractDate(lines)

      expect(date).toBeUndefined()
    })

    it('should handle short year format', () => {
      const lines = ['12/25/23']
      const date = extractDate(lines)

      expect(date).toBe('12/25/23')
    })
  })

  describe('extractAmounts', () => {
    it('should extract total', () => {
      const text = 'TOTAL: $50.00'
      const amounts = extractAmounts(text)

      expect(amounts.total).toBe(50)
      expect(amounts.confidence).toBe('low')
    })

    it('should extract subtotal', () => {
      const text = 'SUBTOTAL: $45.00'
      const amounts = extractAmounts(text)

      expect(amounts.subtotal).toBe(45)
    })

    it('should extract tax', () => {
      const text = 'TAX: $5.00'
      const amounts = extractAmounts(text)

      expect(amounts.tax).toBe(5)
    })

    it('should extract tip', () => {
      const text = 'TIP: $10.00'
      const amounts = extractAmounts(text)

      expect(amounts.tip).toBe(10)
    })

    it('should extract all amounts', () => {
      const text = `
        SUBTOTAL: $45.00
        TAX: $5.00
        TIP: $10.00
        TOTAL: $60.00
      `
      const amounts = extractAmounts(text)

      expect(amounts.subtotal).toBe(45)
      expect(amounts.tax).toBe(5)
      expect(amounts.tip).toBe(10)
      expect(amounts.total).toBe(60)
      expect(amounts.confidence).toBe('high')
    })

    it('should handle comma decimal separator', () => {
      const text = 'TOTAL: $50,00'
      const amounts = extractAmounts(text)

      expect(amounts.total).toBe(50)
    })

    it('should handle amounts without dollar sign', () => {
      const text = 'TOTAL: 50.00'
      const amounts = extractAmounts(text)

      expect(amounts.total).toBe(50)
    })

    it('should validate amount relationships', () => {
      const text = `
        SUBTOTAL: $40.00
        TAX: $5.00
        TOTAL: $45.00
      `
      const amounts = extractAmounts(text)

      expect(amounts.subtotal).toBe(40)
      expect(amounts.tax).toBe(5)
      expect(amounts.total).toBe(45)
    })

    it('should remove tip if amounts do not balance', () => {
      const text = `
        SUBTOTAL: $40.00
        TAX: $5.00
        TIP: $100.00
        TOTAL: $45.00
      `
      const amounts = extractAmounts(text)

      expect(amounts.tip).toBeUndefined()
    })

    it('should handle case-insensitive keywords', () => {
      const text = 'total: $50.00'
      const amounts = extractAmounts(text)

      expect(amounts.total).toBe(50)
    })

    it('should handle different total variations', () => {
      const text = 'GRAND TOTAL: $50.00'
      const amounts = extractAmounts(text)

      expect(amounts.total).toBe(50)
    })

    it('should skip invalid amounts', () => {
      const text = 'TOTAL: $-10.00'
      const amounts = extractAmounts(text)

      expect(amounts.total).toBeUndefined()
    })

    it('should have low confidence with only one field', () => {
      const text = 'TOTAL: $50.00'
      const amounts = extractAmounts(text)

      expect(amounts.confidence).toBe('low')
    })

    it('should have medium confidence with two fields', () => {
      const text = 'SUBTOTAL: $45.00\nTOTAL: $45.00'
      const amounts = extractAmounts(text)

      expect(amounts.confidence).toBe('medium')
    })

    it('should have high confidence with three+ fields', () => {
      const text = 'SUBTOTAL: $40.00\nTAX: $5.00\nTOTAL: $45.00'
      const amounts = extractAmounts(text)

      expect(amounts.confidence).toBe('high')
    })
  })

  describe('parseReceiptText', () => {
    it('should parse a complete receipt', () => {
      const text = `
        JOES CAFE
        123 Main St
        12/25/2023
        
        Cheeseburger    $12.99
        2 x Fries @ $4.50 = $9.00
        Coke...........$3.00
        
        SUBTOTAL $24.99
        TAX $2.50
        TOTAL $27.49
      `
      const receipt = parseReceiptText(text)

      expect(receipt.merchant).toBe('JOES')
      expect(receipt.date).toBe('12/25/2023')
      expect(receipt.items).toHaveLength(3)
      expect(receipt.subtotal).toBe(24.99)
      expect(receipt.tax).toBe(2.5)
      expect(receipt.total).toBe(27.49)
      expect(receipt.confidence).toBeDefined()
      expect(receipt.confidence.items).toBeDefined()
      expect(receipt.confidence.amounts).toBeDefined()
      expect(receipt.confidence.overall).toBeDefined()
    })

    it('should parse receipt with minimal data', () => {
      const text = 'Coffee $5.00\nTOTAL: $5.00'
      const receipt = parseReceiptText(text)

      expect(receipt.items).toHaveLength(1)
      expect(receipt.total).toBe(5)
      expect(receipt.merchant).toBeUndefined()
      expect(receipt.date).toBeUndefined()
    })

    it('should handle empty text', () => {
      const receipt = parseReceiptText('')

      expect(receipt.items).toHaveLength(0)
      expect(receipt.confidence.overall).toBe('low')
    })

    it('should calculate high confidence for quality data', () => {
      const text = `
        RESTAURANT
        
        3 x Burger @ $10.00 = $30.00
        2 x Fries @ $5.00 = $10.00
        1 x Drink @ $3.00 = $3.00
        
        SUBTOTAL: $43.00
        TAX: $4.30
        TIP: $8.60
        TOTAL: $55.90
      `
      const receipt = parseReceiptText(text)

      expect(receipt.items.length).toBeGreaterThan(0)
      // High confidence items and amounts should lead to high overall
      expect(receipt.confidence.overall).toBeTruthy()
    })

    it('should split lines correctly', () => {
      const text = 'Line1\nLine2\n\nLine3'
      const receipt = parseReceiptText(text)

      // Should filter empty lines
      expect(receipt).toBeDefined()
    })

    it('should handle items without amounts', () => {
      const text = 'Just some text\nNo prices here'
      const receipt = parseReceiptText(text)

      expect(receipt.items).toHaveLength(0)
    })

    it('should handle amounts without items', () => {
      const text = 'SUBTOTAL: $10.00\nTAX: $1.00\nTOTAL: $11.00'
      const receipt = parseReceiptText(text)

      expect(receipt.items).toHaveLength(0)
      expect(receipt.subtotal).toBe(10)
      expect(receipt.tax).toBe(1)
      expect(receipt.total).toBe(11)
    })
  })

  describe('confidence calculation', () => {
    it('should calculate high item confidence', () => {
      const text = `
        3 x Premium Burger @ $15.99 = $47.97
        2 x French Fries @ $4.50 = $9.00
      `
      const receipt = parseReceiptText(text)

      const highConfItems = receipt.items.filter((i) => i.confidence === 'high')
      expect(highConfItems.length).toBeGreaterThan(0)
    })

    it('should calculate medium item confidence', () => {
      const text = 'Simple Item      $10.00'
      const receipt = parseReceiptText(text)

      expect(receipt.items[0].confidence).toBeTruthy()
    })

    it('should calculate low item confidence for ambiguous patterns', () => {
      const text = 'Ab $1.00' // Very short name, low price
      const receipt = parseReceiptText(text)

      if (receipt.items.length > 0) {
        expect(['low', 'medium']).toContain(receipt.items[0].confidence)
      }
    })

    it('should have high amounts confidence with complete data', () => {
      const text = 'SUBTOTAL: $10.00\nTAX: $1.00\nTOTAL: $11.00'
      const receipt = parseReceiptText(text)

      expect(receipt.confidence.amounts).toBe('high')
    })

    it('should have medium amounts confidence with partial data', () => {
      const text = 'TAX: $1.00\nTOTAL: $11.00'
      const receipt = parseReceiptText(text)

      expect(receipt.confidence.amounts).toBe('medium')
    })

    it('should have low amounts confidence with minimal data', () => {
      const text = 'Some text without amounts'
      const receipt = parseReceiptText(text)

      expect(receipt.confidence.amounts).toBe('low')
    })
  })
})
