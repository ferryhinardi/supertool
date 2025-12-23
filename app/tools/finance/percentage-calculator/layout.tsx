import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Percentage Calculator - Calculate Percentages, Discounts & More',
  description:
    'Free online percentage calculator with 7 calculation modes. Calculate percentages, discounts, tips, tax, percentage change, and more. Instant results with detailed formulas. Perfect for shopping, finance, and everyday math.',
  keywords: [
    'percentage calculator',
    'percent calculator',
    'calculate percentage',
    'discount calculator',
    'tip calculator',
    'tax calculator',
    'percentage change',
    'percentage increase',
    'percentage decrease',
    'percent of number',
    'what percent',
    'sales tax calculator',
    'percentage formula',
  ],
  category: 'finance',
  path: '/tools/percentage-calculator',
})

export default function PercentageCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
