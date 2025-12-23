import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Unit Converter (Length, Weight, Temperature)',
  description:
    'Free online unit converter for length, weight, temperature, volume, area, and more. Convert between metric and imperial units instantly. Accurate conversion with support for 100+ units across multiple categories.',
  keywords: [
    'unit converter',
    'length converter',
    'weight converter',
    'temperature converter',
    'metric converter',
    'imperial converter',
    'convert units',
    'measurement converter',
    'volume converter',
    'area converter',
    'distance converter',
    'mass converter',
  ],
  category: 'utilities',
  path: '/tools/unit-converter',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Unit Converter')

const faqs = [
  {
    question: 'What types of units can I convert with this tool?',
    answer:
      'Our converter supports 30+ unit categories including: length/distance (meters, feet, miles, kilometers), weight/mass (grams, pounds, kilograms, ounces), temperature (Celsius, Fahrenheit, Kelvin), volume (liters, gallons, cups, milliliters), area (square meters, acres, hectares), speed (mph, km/h, knots), time, pressure, energy, power, and data storage units.',
  },
  {
    question: 'How accurate are the unit conversions?',
    answer:
      'All conversions use precise mathematical formulas and industry-standard conversion factors with up to 10 decimal places of precision. For example, temperature conversions use exact formulas: °C = (°F - 32) × 5/9. We regularly verify conversion accuracy against scientific standards to ensure reliability for both casual and professional use.',
  },
  {
    question: 'Can I convert between metric and imperial units?',
    answer:
      'Yes! The converter seamlessly handles conversions between metric (SI) and imperial (US/UK) measurement systems. Convert pounds to kilograms, miles to kilometers, Fahrenheit to Celsius, gallons to liters, and vice versa. This is especially useful for international travel, recipe conversions, or working with specifications from different countries.',
  },
  {
    question: 'How do I convert Celsius to Fahrenheit or vice versa?',
    answer:
      'Select Temperature from the category dropdown, enter your value, choose Celsius or Fahrenheit as the source unit, and select the target unit. The conversion happens instantly. Formula: °F = (°C × 9/5) + 32 or °C = (°F - 32) × 5/9. Our tool also supports Kelvin for scientific calculations.',
  },
  {
    question: 'Can I save my favorite unit conversions?',
    answer:
      'Yes! You can mark frequently used conversions as favorites for quick access. Simply click the star icon next to any conversion pair (e.g., kg to lbs, miles to km) and it will appear in your favorites list. Favorites are saved locally in your browser for instant loading on future visits.',
  },
]

export default function UnitConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  )
}
