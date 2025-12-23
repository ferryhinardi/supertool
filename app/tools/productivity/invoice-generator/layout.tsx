import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Invoice Generator - Create Professional Invoices',
  description:
    'Free online invoice generator. Create professional invoices with custom templates, tax calculations, and client management. Export to PDF instantly. Perfect for freelancers and small businesses.',
  keywords: [
    'invoice generator',
    'free invoice',
    'invoice template',
    'create invoice',
    'invoice maker',
    'pdf invoice',
    'business invoice',
    'freelance invoice',
    'invoice creator',
    'professional invoice',
    'invoice builder',
    'tax invoice',
    'billing invoice',
    'invoice pdf generator',
  ],
  category: 'productivity',
  path: '/tools/invoice-generator',
})

export default function InvoiceGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
