import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Loan & Mortgage Calculator with Amortization Schedule',
  description:
    'Free online loan and mortgage calculator with detailed amortization schedule. Calculate monthly payments, total interest, and compare different loan scenarios. Perfect for home loans, auto loans, and personal loans with extra payment options.',
  keywords: [
    'loan calculator',
    'mortgage calculator',
    'amortization calculator',
    'monthly payment calculator',
    'home loan calculator',
    'auto loan calculator',
    'personal loan calculator',
    'interest calculator',
    'payment schedule',
    'loan comparison',
    'extra payment calculator',
    'mortgage amortization',
  ],
  category: 'finance',
  path: '/tools/loan-calculator',
})

export default function LoanCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
