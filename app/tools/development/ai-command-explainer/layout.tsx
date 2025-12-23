import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/data/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.app'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Command Explainer - Understand Complex CLI Commands',
  description:
    'Explain complex CLI commands with AI assistance. Get detailed breakdowns, parameter explanations, safety warnings, and alternative suggestions for bash, git, docker, kubectl, and more. Free AI-powered command-line tool explainer.',
  keywords: [
    'AI command explainer',
    'CLI command help',
    'terminal command explained',
    'bash command explainer',
    'git command help',
    'docker command explained',
    'kubectl command help',
    'command line assistant',
    'shell command breakdown',
    'command parameter explanation',
    'CLI help tool',
    'terminal helper',
    'command safety checker',
    'bash script explainer',
    'command line tutorial',
  ],
  category: 'development',
  path: '/tools/ai-command-explainer',
})

// Structured data for SEO
const breadcrumbSchema = generateBreadcrumbSchema(
  [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/#tools' },
    { name: 'AI Command Explainer', url: '/tools/ai-command-explainer' },
  ],
  baseUrl
)

const softwareSchema = generateSoftwareApplicationSchema(
  {
    name: 'AI Command Explainer',
    description:
      'Explain complex CLI commands with AI assistance. Understand bash, git, docker, kubectl commands with detailed breakdowns, parameter explanations, safety warnings, and alternatives.',
    url: '/tools/ai-command-explainer',
    category: 'development',
    keywords: [
      'AI command explainer',
      'CLI command help',
      'terminal command explained',
      'bash command explainer',
      'command line assistant',
    ],
  },
  baseUrl
)

const faqSchema = generateFAQSchema([
  {
    question: 'What is the AI Command Explainer tool?',
    answer:
      'The AI Command Explainer is an AI-powered tool that breaks down complex CLI commands into easy-to-understand explanations. It analyzes commands from various shells and tools (bash, git, docker, kubectl, npm, etc.) and provides detailed breakdowns, parameter descriptions, safety warnings, and alternative suggestions.',
  },
  {
    question: 'How does the command explanation work?',
    answer:
      'Simply paste any CLI command into the input field and click "Explain Command". Our AI will identify the command type, explain its overall purpose, break down each component, detail what each flag/parameter does, highlight safety concerns, and suggest alternatives if applicable.',
  },
  {
    question: 'What types of commands can be explained?',
    answer:
      'The tool can explain commands from various shells and tools including bash/shell scripts, git version control, docker containers, kubernetes (kubectl), npm/yarn package managers, system administration commands, and many more. It recognizes and explains flags, options, pipes, redirects, and complex command chains.',
  },
  {
    question: 'Does it warn about dangerous commands?',
    answer:
      'Yes! The AI analyzes commands for potentially dangerous operations like file deletions (rm -rf), force operations (--force), sudo privileges, overwriting data, and more. It provides clear safety warnings to help you understand the risks before executing commands.',
  },
  {
    question: 'Is my command data secure?',
    answer:
      'Yes, your commands are processed securely and are not stored on our servers. The data is sent to OpenAI API for analysis and immediately discarded after processing. We prioritize your privacy and data security.',
  },
])

const howToSchema = generateHowToSchema(
  'How to Explain CLI Commands with AI',
  'Learn how to understand complex command-line commands using AI-powered explanations',
  [
    {
      name: 'Enter Command',
      text: 'Paste or type your CLI command (up to 2000 characters) into the input field on the AI Command Explainer page.',
    },
    {
      name: 'Explain Command',
      text: 'Click the "Explain Command" button to send your command to the AI for analysis.',
    },
    {
      name: 'Review Command Type',
      text: 'See the identified command type (bash, git, docker, etc.) and read the overall purpose of what the command does.',
    },
    {
      name: 'Study Breakdown',
      text: 'Review the detailed breakdown of each command component, including flags, parameters, operators, and arguments.',
    },
    {
      name: 'Check Safety Warnings',
      text: 'Read any safety warnings about potentially dangerous operations and understand the risks before executing.',
    },
    {
      name: 'Explore Alternatives',
      text: 'Review alternative commands or safer approaches suggested by the AI for accomplishing the same task.',
    },
  ],
  baseUrl,
  '/tools/ai-command-explainer'
)

export default function AICommandExplainerLayout({ children }: { children: React.ReactNode }) {
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
