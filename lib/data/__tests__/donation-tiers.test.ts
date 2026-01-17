import { describe, expect, it } from 'vitest'

import {
  DONATION_TIERS,
  formatAmount,
  getDonationTier,
  getDonationTierByAmount,
  isValidAmount,
  parseAmount,
} from '../donation-tiers'

describe('donation-tiers', () => {
  describe('DONATION_TIERS', () => {
    it('should have 4 donation tiers', () => {
      expect(DONATION_TIERS).toHaveLength(4)
    })

    it('should have coffee tier at $5', () => {
      const coffee = DONATION_TIERS.find((t) => t.id === 'coffee')
      expect(coffee).toBeDefined()
      expect(coffee?.amount).toBe(500)
      expect(coffee?.name).toBe('Coffee')
      expect(coffee?.icon).toBe('☕')
    })

    it('should have pizza tier at $15 marked as popular', () => {
      const pizza = DONATION_TIERS.find((t) => t.id === 'pizza')
      expect(pizza).toBeDefined()
      expect(pizza?.amount).toBe(1500)
      expect(pizza?.popular).toBe(true)
    })

    it('should have rocket tier at $50', () => {
      const rocket = DONATION_TIERS.find((t) => t.id === 'rocket')
      expect(rocket).toBeDefined()
      expect(rocket?.amount).toBe(5000)
    })

    it('should have diamond tier at $100', () => {
      const diamond = DONATION_TIERS.find((t) => t.id === 'diamond')
      expect(diamond).toBeDefined()
      expect(diamond?.amount).toBe(10000)
    })

    it('should have all required properties on each tier', () => {
      for (const tier of DONATION_TIERS) {
        expect(tier.id).toBeDefined()
        expect(tier.name).toBeDefined()
        expect(tier.icon).toBeDefined()
        expect(tier.amount).toBeGreaterThan(0)
        expect(tier.description).toBeDefined()
      }
    })

    it('should have only one popular tier', () => {
      const popularTiers = DONATION_TIERS.filter((t) => t.popular)
      expect(popularTiers).toHaveLength(1)
    })

    it('should have tiers in ascending order by amount', () => {
      const amounts = DONATION_TIERS.map((t) => t.amount)
      const sortedAmounts = [...amounts].sort((a, b) => a - b)
      expect(amounts).toEqual(sortedAmounts)
    })
  })

  describe('formatAmount', () => {
    it('should format cents to USD with two decimals', () => {
      expect(formatAmount(500)).toBe('$5.00')
    })

    it('should format larger amounts correctly', () => {
      expect(formatAmount(1500)).toBe('$15.00')
      expect(formatAmount(5000)).toBe('$50.00')
      expect(formatAmount(10000)).toBe('$100.00')
    })

    it('should handle amounts with cents', () => {
      expect(formatAmount(599)).toBe('$5.99')
      expect(formatAmount(1)).toBe('$0.01')
      expect(formatAmount(99)).toBe('$0.99')
    })

    it('should handle zero', () => {
      expect(formatAmount(0)).toBe('$0.00')
    })

    it('should handle large amounts', () => {
      expect(formatAmount(100000)).toBe('$1000.00')
      expect(formatAmount(1000000)).toBe('$10000.00')
    })
  })

  describe('parseAmount', () => {
    it('should parse USD string to cents', () => {
      expect(parseAmount('$5.00')).toBe(500)
    })

    it('should parse without dollar sign', () => {
      expect(parseAmount('5.00')).toBe(500)
    })

    it('should parse whole numbers', () => {
      expect(parseAmount('10')).toBe(1000)
      expect(parseAmount('$10')).toBe(1000)
    })

    it('should handle cents correctly', () => {
      expect(parseAmount('$5.99')).toBe(599)
      expect(parseAmount('0.99')).toBe(99)
    })

    it('should handle extra characters', () => {
      expect(parseAmount('$ 5.00')).toBe(500)
      expect(parseAmount('USD 10.00')).toBe(1000)
    })

    it('should round to nearest cent', () => {
      expect(parseAmount('5.999')).toBe(600)
      expect(parseAmount('5.001')).toBe(500)
    })

    it('should handle zero', () => {
      expect(parseAmount('$0.00')).toBe(0)
      expect(parseAmount('0')).toBe(0)
    })
  })

  describe('isValidAmount', () => {
    it('should return true for minimum amount ($1)', () => {
      expect(isValidAmount(100)).toBe(true)
    })

    it('should return true for maximum amount ($10,000)', () => {
      expect(isValidAmount(1000000)).toBe(true)
    })

    it('should return true for amounts within range', () => {
      expect(isValidAmount(500)).toBe(true)
      expect(isValidAmount(1500)).toBe(true)
      expect(isValidAmount(5000)).toBe(true)
      expect(isValidAmount(10000)).toBe(true)
    })

    it('should return false for amounts below minimum', () => {
      expect(isValidAmount(99)).toBe(false)
      expect(isValidAmount(50)).toBe(false)
      expect(isValidAmount(0)).toBe(false)
    })

    it('should return false for amounts above maximum', () => {
      expect(isValidAmount(1000001)).toBe(false)
      expect(isValidAmount(2000000)).toBe(false)
    })

    it('should return false for negative amounts', () => {
      expect(isValidAmount(-100)).toBe(false)
      expect(isValidAmount(-1)).toBe(false)
    })
  })

  describe('getDonationTier', () => {
    it('should return tier by id', () => {
      const coffee = getDonationTier('coffee')
      expect(coffee).toBeDefined()
      expect(coffee?.name).toBe('Coffee')
    })

    it('should return all tiers by their ids', () => {
      expect(getDonationTier('coffee')).toBeDefined()
      expect(getDonationTier('pizza')).toBeDefined()
      expect(getDonationTier('rocket')).toBeDefined()
      expect(getDonationTier('diamond')).toBeDefined()
    })

    it('should return undefined for non-existent id', () => {
      expect(getDonationTier('non-existent')).toBeUndefined()
      expect(getDonationTier('')).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      expect(getDonationTier('Coffee')).toBeUndefined()
      expect(getDonationTier('COFFEE')).toBeUndefined()
    })
  })

  describe('getDonationTierByAmount', () => {
    it('should return tier by amount', () => {
      const tier = getDonationTierByAmount(500)
      expect(tier).toBeDefined()
      expect(tier?.id).toBe('coffee')
    })

    it('should return all tiers by their amounts', () => {
      expect(getDonationTierByAmount(500)?.id).toBe('coffee')
      expect(getDonationTierByAmount(1500)?.id).toBe('pizza')
      expect(getDonationTierByAmount(5000)?.id).toBe('rocket')
      expect(getDonationTierByAmount(10000)?.id).toBe('diamond')
    })

    it('should return undefined for non-tier amounts', () => {
      expect(getDonationTierByAmount(100)).toBeUndefined()
      expect(getDonationTierByAmount(1000)).toBeUndefined()
      expect(getDonationTierByAmount(600)).toBeUndefined()
    })

    it('should return undefined for zero', () => {
      expect(getDonationTierByAmount(0)).toBeUndefined()
    })

    it('should return undefined for negative amounts', () => {
      expect(getDonationTierByAmount(-500)).toBeUndefined()
    })
  })
})
