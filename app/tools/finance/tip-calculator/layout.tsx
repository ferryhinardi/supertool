import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Tip Calculator - Calculate Tips & Split Bills',
  description:
    'Free online tip calculator. Calculate tips based on service quality, split bills among groups, and customize tip percentages. Perfect for restaurants, delivery, and service tipping with rounding options.',
  keywords: [
    'tip calculator',
    'tip calculator online',
    'calculate tip',
    'gratuity calculator',
    'restaurant tip calculator',
    'bill splitter',
    'split bill calculator',
    'service tip calculator',
    'tip percentage calculator',
    'dining calculator',
    'how much to tip',
    'tip guide',
  ],
  category: 'finance',
  path: '/tools/finance/tip-calculator',
})

export default function TipCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
