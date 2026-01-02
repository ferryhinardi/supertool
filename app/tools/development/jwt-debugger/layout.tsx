import type { Metadata } from 'next'

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
    title: 'JWT Debugger - Decode & Verify JSON Web Tokens',
    description:
      'Decode, verify, and generate JSON Web Tokens (JWT) with support for multiple algorithms. View header, payload, and signature.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JWT Debugger - Decode & Verify JSON Web Tokens',
    description:
      'Decode, verify, and generate JSON Web Tokens (JWT) with support for multiple algorithms. View header, payload, and signature.',
  },
}

export default function JWTDebuggerLayout({ children }: { children: React.ReactNode }) {
  return children
}
