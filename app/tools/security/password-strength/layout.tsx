import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Password Strength Analyzer',
  description:
    'Free online password strength analyzer powered by zxcvbn. Measure password entropy, detect patterns, check dictionary words, and get actionable security recommendations. Analyze password strength with visual feedback and estimated crack times for better password security.',
  keywords: [
    'password strength analyzer',
    'password strength checker',
    'password security',
    'password entropy calculator',
    'zxcvbn password',
    'password strength meter',
    'check password strength',
    'password security analysis',
    'password crack time',
    'password pattern detection',
    'secure password tool',
    'password recommendations',
  ],
  category: 'security',
  path: '/tools/password-strength',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Password Strength Analyzer')

const faqs = [
  {
    question: 'How does the password strength analyzer work?',
    answer:
      'Our password strength analyzer uses zxcvbn, an industry-standard library developed by Dropbox. It evaluates passwords by checking for common patterns, dictionary words, repeated characters, keyboard sequences, and calculating entropy based on character diversity. The tool provides a score from 0-4 and estimates crack time under different attack scenarios.',
  },
  {
    question: 'Is my password safe when using this tool?',
    answer:
      'Yes, absolutely. All password analysis happens entirely in your browser using client-side JavaScript. Your password never leaves your device and is not transmitted to any server. This ensures complete privacy and security for your sensitive password data.',
  },
  {
    question: 'What makes a password strong?',
    answer:
      'A strong password typically has at least 12 characters, includes a mix of uppercase and lowercase letters, numbers, and special characters, avoids common words and predictable patterns (like "123", "abc", "qwerty"), does not contain repeated characters, and is unique across different accounts. Consider using a passphrase with 4+ random words for memorable yet secure passwords.',
  },
  {
    question: 'What is password entropy and why does it matter?',
    answer:
      'Password entropy measures the unpredictability of a password in bits. Higher entropy means more possible combinations and harder to crack. Entropy is calculated based on the character set used (lowercase, uppercase, numbers, symbols) and password length. A password with 60+ bits of entropy is generally considered secure against most attacks.',
  },
  {
    question: 'How accurate is the crack time estimation?',
    answer:
      'The crack time estimation is based on realistic attack scenarios using modern hardware. It considers both online attacks (with rate limiting, ~10 attempts/second) and offline attacks (with password hashing like bcrypt, ~10,000 attempts/second). While actual crack times can vary, these estimates provide a good security baseline for evaluating password strength.',
  },
]

export default function PasswordStrengthLayout({ children }: { children: React.ReactNode }) {
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
