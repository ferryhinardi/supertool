import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Snippet Generator - Generate Code Snippets with AI',
  description:
    'Generate code snippets instantly with AI. Create functions, classes, regex patterns, SQL queries, and more in multiple programming languages. Free tier includes basic snippets, unlimited generation with Pro subscription.',
  keywords: [
    'AI code generator',
    'code snippet generator',
    'AI snippet',
    'code generation',
    'function generator',
    'class generator',
    'regex generator',
    'SQL query generator',
    'javascript generator',
    'python generator',
    'typescript generator',
    'code assistant',
    'AI developer tool',
    'programming helper',
    'code automation',
  ],
  category: 'development',
  path: '/tools/ai-snippet-generator',
})

export default function AISnippetGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
