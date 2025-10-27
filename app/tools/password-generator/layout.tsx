import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Secure Password Generator',
  description:
    'Generate strong, random passwords with customizable length and character types. Create secure passwords with uppercase, lowercase, numbers, and special characters. Privacy-focused with instant generation.',
  keywords: [
    'password generator',
    'random password',
    'strong password',
    'secure password',
    'password maker',
    'password creator',
    'generate password',
    'random password generator',
    'secure password generator',
    'password strength',
    'passphrase generator',
    'complex password',
  ],
  category: 'security',
  path: '/tools/password-generator',
})

export default function PasswordGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
