import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/data/metadata'

export const metadata: Metadata = {
  title: 'JWT Debugger - Decode & Verify JSON Web Tokens | SuperTool',
  description:
    'Decode, verify, and generate JSON Web Tokens (JWT) with support for multiple algorithms (HS256, HS384, HS512, RS256, RS384, RS512). View header, payload, and signature. Perfect for debugging authentication tokens.',
  keywords: [
    'jwt debugger',
    'jwt decoder',
    'json web token',
    'jwt verify',
    'jwt generator',
    'token debugger',
    'decode jwt',
    'verify jwt signature',
    'jwt parser',
    'jwt validator',
  ],
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    url: 'https://supertool.id/tools/development/jwt-debugger',
    title: 'JWT Debugger - Decode & Verify JSON Web Tokens',
    description:
      'Decode, verify, and generate JSON Web Tokens (JWT) with support for multiple algorithms. View header, payload, and signature.',
    type: 'website',
  },
  twitter: {
    images: [DEFAULT_OG_IMAGE.url],
    card: 'summary_large_image',
    title: 'JWT Debugger - Decode & Verify JSON Web Tokens',
    description:
      'Decode, verify, and generate JSON Web Tokens (JWT) with support for multiple algorithms. View header, payload, and signature.',
  },
  alternates: {
    canonical: 'https://supertool.id/tools/development/jwt-debugger',
  },
}

export default function JWTDebuggerLayout({ children }: { children: React.ReactNode }) {
  return children
}
