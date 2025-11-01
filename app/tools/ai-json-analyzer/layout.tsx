import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI JSON Analyzer - Analyze JSON Structure with AI',
  description:
    'Analyze JSON data structure with AI-powered insights. Get natural language summaries, pattern detection, optimization recommendations, and relationship mapping for complex JSON objects and arrays. Understand your data better.',
  keywords: [
    'AI JSON analyzer',
    'JSON structure analyzer',
    'JSON pattern detection',
    'JSON data insights',
    'JSON optimization',
    'JSON analysis tool',
    'AI data analysis',
    'JSON relationships',
    'JSON understanding',
    'data structure analyzer',
    'JSON parser',
    'JSON validator',
    'AI data tool',
    'JSON helper',
    'data analysis',
  ],
  category: 'development',
  path: '/tools/ai-json-analyzer',
})

export default function AIJSONAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
