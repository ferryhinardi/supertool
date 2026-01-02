/**
 * Donation Tiers Configuration
 * Preset donation amounts with icons and descriptions
 */

export interface DonationTier {
  id: string
  name: string
  icon: string
  amount: number // Amount in cents
  description: string
  popular?: boolean
}

export const DONATION_TIERS: DonationTier[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    icon: '☕',
    amount: 500, // $5.00
    description: 'Buy us a coffee to fuel development',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    icon: '🍕',
    amount: 1500, // $15.00
    description: 'Treat the team to pizza',
    popular: true,
  },
  {
    id: 'rocket',
    name: 'Rocket Fuel',
    icon: '🚀',
    amount: 5000, // $50.00
    description: 'Supercharge development',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '💎',
    amount: 10000, // $100.00
    description: 'Become a platinum supporter',
  },
]

/**
 * Format amount in cents to USD string
 */
export function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Parse USD string to cents
 */
export function parseAmount(usd: string): number {
  const cleaned = usd.replace(/[^0-9.]/g, '')
  const amount = Number.parseFloat(cleaned)
  return Math.round(amount * 100)
}

/**
 * Validate donation amount
 */
export function isValidAmount(cents: number): boolean {
  return cents >= 100 && cents <= 1000000 // $1.00 to $10,000.00
}

/**
 * Get donation tier by ID
 */
export function getDonationTier(id: string): DonationTier | undefined {
  return DONATION_TIERS.find((tier) => tier.id === id)
}

/**
 * Get donation tier by amount
 */
export function getDonationTierByAmount(cents: number): DonationTier | undefined {
  return DONATION_TIERS.find((tier) => tier.amount === cents)
}
