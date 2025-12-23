import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'URL Shortener & Link Management',
  description:
    'Free URL shortener with custom aliases and analytics. Create short links, track clicks, and manage your shortened URLs. Fast, secure, and privacy-focused link shortener with detailed statistics.',
  keywords: [
    'url shortener',
    'link shortener',
    'short url',
    'shorten link',
    'tiny url',
    'url redirect',
    'link management',
    'short link',
    'custom url',
    'link analytics',
    'url tracker',
    'link statistics',
  ],
  category: 'utilities',
  path: '/tools/url-shortener',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('URL Shortener & Link Management')

const faqs = [
  {
    question: 'How do I create a shortened URL?',
    answer:
      'Simply paste your long URL into the input field and click "Shorten". You can optionally add a custom alias to make your link memorable (e.g., supertool.id/mylink). The short link is generated instantly and you can copy it to share. All shortened URLs are stored securely in our database with analytics tracking enabled.',
  },
  {
    question: 'Can I customize the shortened link with my own alias?',
    answer:
      'Yes! You can create custom short links with memorable aliases instead of random strings. Enter your desired alias when creating the short URL. Custom aliases are first-come, first-served and must be unique. This is perfect for branding, marketing campaigns, or creating easy-to-remember links for sharing.',
  },
  {
    question: 'Do shortened links expire or stop working?',
    answer:
      'No, shortened URLs created on our platform do not expire and will work indefinitely. Once created, your short link remains active permanently unless you manually delete it from your dashboard. This ensures your shared links in social media, documents, or printed materials continue working long-term.',
  },
  {
    question: 'What analytics are tracked for my shortened URLs?',
    answer:
      'We track click counts, geographic locations (country/city), referrer sources, device types (desktop/mobile/tablet), browsers, operating systems, and timestamp data for each click. All analytics are anonymous and respect user privacy. You can view detailed statistics on your dashboard to measure link performance and audience insights.',
  },
  {
    question: 'Is it safe to use shortened URLs for sensitive links?',
    answer:
      "While our URL shortener uses secure HTTPS connections and doesn't expose original URLs publicly, we recommend caution with sensitive links. Shortened URLs can mask the destination, which may be flagged by security systems. For highly sensitive content, consider password-protecting the destination or using direct links in secure channels.",
  },
]

export default function URLShortenerLayout({ children }: { children: React.ReactNode }) {
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
