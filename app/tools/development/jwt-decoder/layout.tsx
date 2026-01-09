import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'JWT Decoder - Decode JSON Web Tokens Instantly',
  description:
    'Free online JWT decoder. Instantly decode and inspect JSON Web Tokens. View header, payload, and claims. Verify token expiration, issuer, and audience. Perfect for debugging authentication and API tokens.',
  keywords: [
    'jwt decoder',
    'decode jwt',
    'json web token decoder',
    'jwt parser',
    'jwt inspector',
    'jwt viewer',
    'decode token',
    'jwt claims viewer',
    'token decoder online',
    'jwt payload viewer',
    'jwt header decoder',
    'api token decoder',
  ],
  category: 'development',
  path: '/tools/development/jwt-decoder',
})

export default function JWTDecoderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
