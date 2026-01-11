import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Cover Letter Builder - Create Professional Cover Letters',
  description:
    'Free online cover letter builder. Create professional, customized cover letters with templates for any industry. AI-powered suggestions, formatting options, and export to PDF or Word. Perfect for job applications.',
  keywords: [
    'cover letter builder',
    'cover letter generator',
    'cover letter maker',
    'create cover letter',
    'professional cover letter',
    'cover letter template',
    'job application letter',
    'cover letter writer',
    'free cover letter builder',
    'cover letter pdf',
    'application letter generator',
    'career tool',
  ],
  category: 'productivity',
  path: '/tools/productivity/cover-letter-builder',
})

export default function CoverLetterBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
