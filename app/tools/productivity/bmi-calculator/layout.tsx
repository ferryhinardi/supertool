import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'BMI Calculator & Health Tracker',
  description:
    'Free BMI calculator with health recommendations and BMI chart. Calculate your Body Mass Index, get personalized health insights, and track your progress. Accurate BMI calculation with imperial and metric units.',
  keywords: [
    'bmi calculator',
    'body mass index',
    'bmi chart',
    'health calculator',
    'weight calculator',
    'ideal weight',
    'bmi checker',
    'calculate bmi',
    'bmi tool',
    'health tracker',
    'fitness calculator',
    'bmi online',
  ],
  category: 'health',
  path: '/tools/bmi-calculator',
})

export default function BMICalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
