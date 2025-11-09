import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/metadata'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Split Bill Calculator',
  description:
    'Free bill splitting calculator with receipt scanning and custom tip calculation. Split bills easily among friends, calculate tips, and track who owes what. Perfect for group dinners and shared expenses.',
  keywords: [
    'split bill',
    'bill splitter',
    'tip calculator',
    'receipt scanner',
    'expense split',
    'shared expenses',
    'group payment',
    'bill calculator',
    'split check',
    'divide bill',
    'restaurant bill split',
    'expense sharing',
  ],
  category: 'finance',
  path: '/tools/split-bill',
  ogTitle: 'Free Split Bill Calculator - Divide Restaurant Bills & Calculate Tips Instantly',
  ogDescription:
    'Split bills fairly in seconds! 🧾 AI-powered receipt scanner, automatic tip calculation, and easy sharing. Perfect for group dinners and shared expenses. 100% free.',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Split Bill Calculator')

const faqs = [
  {
    question: 'How do I split a bill with this calculator?',
    answer:
      'Simply add all participants, enter the total bill amount, select tip percentage, and our calculator automatically divides the total equally among all people. You can also use the receipt scanner feature to quickly extract items from a photo of your receipt.',
  },
  {
    question: 'Can I split bills unequally among people?',
    answer:
      'Yes! Our advanced split mode allows you to assign different amounts or specific items to different people. This is perfect when some people ordered more expensive items or when splitting by what each person actually consumed.',
  },
  {
    question: 'How does the tip calculation work?',
    answer:
      'You can choose from preset tip percentages (10%, 15%, 18%, 20%, 25%) or enter a custom amount. The tip is added to the total bill before splitting among participants. You can also choose whether to apply tip before or after tax.',
  },
  {
    question: 'Does the receipt scanner work with any receipt?',
    answer:
      'The receipt scanner works best with clear, well-lit photos of printed receipts. It uses OCR technology to extract item names and prices. While it works with most standard restaurant receipts, you may need to verify and adjust the extracted data for best accuracy.',
  },
]

const howToSteps = [
  {
    name: 'Add participants to the bill',
    text: 'Click "Add Person" to include everyone who will be splitting the bill. Enter each person\'s name to identify who owes what. You can add as many participants as needed for your group dining or shared expense situation.',
  },
  {
    name: 'Enter the total bill amount and tax',
    text: "Input the total bill amount from your receipt. If there's tax, enter the tax amount or percentage separately. This ensures accurate calculations. You can also scan your receipt using the camera feature to automatically extract these values.",
  },
  {
    name: 'Select tip percentage',
    text: 'Choose a tip percentage from the preset options (10%, 15%, 18%, 20%, 25%) or enter a custom tip amount. The tip will be calculated on the subtotal and divided equally among all participants, or you can assign custom tip amounts per person.',
  },
  {
    name: 'Review individual amounts and share',
    text: 'The calculator automatically displays how much each person owes, including their share of tax and tip. Review the breakdown, mark payments as received, and use the share button to send a summary link to all participants via text or social media.',
  },
]

export default function SplitBillLayout({ children }: { children: React.ReactNode }) {
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
      <Script
        id="howto-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateHowToSchema(
              'How to Split a Bill with Friends',
              'Learn how to fairly split restaurant bills, shared expenses, and group payments with automatic tip calculation and receipt scanning using our free bill splitter tool.',
              howToSteps,
              baseUrl,
              '/tools/split-bill'
            )
          ),
        }}
      />
    </>
  )
}
