import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/data/metadata'

export const metadata: Metadata = {
  title: 'Privacy Policy Generator | Free GDPR & CCPA Compliant Templates',
  description:
    'Generate professional privacy policies instantly. GDPR and CCPA compliant templates for SaaS, e-commerce, blogs, and mobile apps. Includes cookie policy and terms of service generator. Download as HTML or PDF.',
  keywords: [
    'privacy policy generator',
    'free privacy policy',
    'GDPR privacy policy',
    'CCPA compliance',
    'privacy policy template',
    'cookie policy generator',
    'terms of service generator',
    'legal document generator',
    'website privacy policy',
    'app privacy policy',
    'ecommerce privacy policy',
    'saas privacy policy',
  ],
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    url: 'https://supertool.id/tools/productivity/privacy-policy-generator',
    title: 'Privacy Policy Generator | GDPR & CCPA Compliant',
    description:
      'Create professional, legally compliant privacy policies in minutes. Free templates for all industries with GDPR and CCPA support.',
    type: 'website',
  },
  twitter: {
    images: [DEFAULT_OG_IMAGE.url],
    card: 'summary_large_image',
    title: 'Privacy Policy Generator',
    description:
      'Generate GDPR & CCPA compliant privacy policies instantly. Free templates for any business.',
  },
  alternates: {
    canonical: 'https://supertool.id/tools/productivity/privacy-policy-generator',
  },
}

export default function PrivacyPolicyGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
