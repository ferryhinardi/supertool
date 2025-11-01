import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.app'

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

// Structured data for SEO
const breadcrumbSchema = generateBreadcrumbSchema(
  [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/#tools' },
    { name: 'AI JSON Analyzer', url: '/tools/ai-json-analyzer' },
  ],
  baseUrl
)

const softwareSchema = generateSoftwareApplicationSchema(
  {
    name: 'AI JSON Analyzer',
    description:
      'Analyze JSON data structure with AI-powered insights. Get natural language summaries, pattern detection, optimization recommendations, and relationship mapping.',
    url: '/tools/ai-json-analyzer',
    category: 'development',
    keywords: [
      'AI JSON analyzer',
      'JSON structure analyzer',
      'JSON pattern detection',
      'JSON data insights',
      'JSON optimization',
    ],
  },
  baseUrl
)

const faqSchema = generateFAQSchema([
  {
    question: 'What is the AI JSON Analyzer tool?',
    answer:
      'The AI JSON Analyzer is an AI-powered tool that analyzes JSON data structures and provides natural language summaries, pattern detection, optimization recommendations, and relationship mapping. It uses OpenAI GPT models to understand complex JSON structures and provide actionable insights.',
  },
  {
    question: 'How does the AI JSON analysis work?',
    answer:
      'Simply paste your JSON data into the analyzer, and our AI will examine the structure, detect patterns, identify relationships between fields, and provide optimization suggestions. The analysis includes a summary, structure explanation, detected patterns, insights, and data relationships.',
  },
  {
    question: 'Is my JSON data secure?',
    answer:
      'Yes, your JSON data is processed securely and is not stored on our servers. The data is sent to OpenAI API for analysis and immediately discarded after processing. We prioritize your privacy and data security.',
  },
  {
    question: 'What kind of insights can I get from JSON analysis?',
    answer:
      'You will receive a comprehensive analysis including: a natural language summary of what the JSON represents, structure explanation (hierarchy, nesting, arrays), detected patterns (naming conventions, data types), optimization tips and potential issues, and how different fields relate to each other.',
  },
  {
    question: 'Do I need an OpenAI API key to use this tool?',
    answer:
      'The tool requires an OpenAI API key to be configured on the server side. If you are using the hosted version, the API key is already configured. If you are self-hosting, you need to add your OPENAI_API_KEY to environment variables.',
  },
])

const howToSchema = generateHowToSchema(
  'How to Analyze JSON with AI',
  'Learn how to analyze JSON data structure using AI-powered insights',
  [
    {
      name: 'Paste JSON Data',
      text: 'Copy your JSON data and paste it into the text area on the AI JSON Analyzer page.',
    },
    {
      name: 'Click Analyze',
      text: 'Click the "Analyze JSON" button to start the AI analysis process.',
    },
    {
      name: 'Review Analysis',
      text: 'Review the comprehensive analysis including summary, structure, patterns, insights, and relationships.',
    },
    {
      name: 'Copy Results',
      text: 'Use the "Copy Analysis" button to copy the full analysis to your clipboard for future reference.',
    },
  ],
  baseUrl,
  '/tools/ai-json-analyzer'
)

export default function AIJSONAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  )
}
