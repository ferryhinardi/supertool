import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Age Calculator - Calculate Exact Age in Years, Months, Days',
  description:
    'Free online age calculator. Calculate your exact age in years, months, weeks, and days. Find age between two dates, upcoming birthday countdown, and birth year facts. Perfect for birthdays, milestones, and age verification.',
  keywords: [
    'age calculator',
    'calculate age',
    'age calculator online',
    'how old am i',
    'date of birth calculator',
    'birthday calculator',
    'exact age calculator',
    'age in days',
    'age between dates',
    'birthday countdown',
    'chronological age calculator',
    'age difference calculator',
  ],
  category: 'productivity',
  path: '/tools/productivity/age-calculator',
})

export default function AgeCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
