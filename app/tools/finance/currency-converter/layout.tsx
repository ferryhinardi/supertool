import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Currency Converter - Real-time Exchange Rates',
  description:
    'Free online currency converter with real-time exchange rates for 150+ world currencies. Convert USD, EUR, GBP, JPY, IDR and more instantly. Accurate, fast, and easy to use.',
  keywords: [
    'currency converter',
    'exchange rate',
    'currency exchange',
    'convert currency',
    'usd to idr',
    'eur to usd',
    'gbp to usd',
    'forex converter',
    'money converter',
    'foreign exchange',
    'currency calculator',
    'real-time rates',
    'live exchange rates',
    'world currencies',
  ],
  category: 'finance',
  path: '/tools/currency-converter',
})

export default function CurrencyConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
