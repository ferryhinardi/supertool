'use client'

import { getAdsConfig } from '@/lib/services/ads-config'
import { css } from '@/styled-system/css'

/**
 * Tool categories that support affiliate marketing
 */
export type AffiliateTool =
  | 'password-generator'
  | 'password-strength'
  | 'encryption-tool'
  | 'image-optimizer'
  | 'api-tester'
  | 'upload'

interface AffiliateProduct {
  name: string
  description: string
  url: string
  cta: string
  icon?: string
}

interface AffiliateSuggestionProps {
  /**
   * Tool type to show relevant affiliate suggestions
   */
  tool: AffiliateTool
  /**
   * Custom className for styling
   */
  className?: string
  /**
   * Layout variant
   */
  variant?: 'banner' | 'card' | 'inline'
}

/**
 * Get affiliate suggestions based on tool type
 */
function getAffiliateProducts(tool: AffiliateTool, config: any): AffiliateProduct[] {
  const { partners } = config.affiliates

  switch (tool) {
    case 'password-generator':
    case 'password-strength':
      return [
        partners.passwordManagers.onePassword && {
          name: '1Password',
          description: 'Store and manage all your passwords securely',
          url: `https://1password.com${partners.passwordManagers.onePassword}`,
          cta: 'Try 1Password',
          icon: '🔐',
        },
        partners.passwordManagers.bitwarden && {
          name: 'Bitwarden',
          description: 'Open-source password manager you can trust',
          url: `https://bitwarden.com${partners.passwordManagers.bitwarden}`,
          cta: 'Try Bitwarden',
          icon: '🔒',
        },
        partners.passwordManagers.dashlane && {
          name: 'Dashlane',
          description: 'Simple, secure password management',
          url: `https://www.dashlane.com${partners.passwordManagers.dashlane}`,
          cta: 'Try Dashlane',
          icon: '🛡️',
        },
      ].filter(Boolean) as AffiliateProduct[]

    case 'encryption-tool':
      return [
        partners.vpn.nordvpn && {
          name: 'NordVPN',
          description: 'Secure your internet connection with military-grade encryption',
          url: `https://nordvpn.com${partners.vpn.nordvpn}`,
          cta: 'Get NordVPN',
          icon: '🔐',
        },
        partners.vpn.expressvpn && {
          name: 'ExpressVPN',
          description: 'High-speed, secure, and private VPN service',
          url: `https://www.expressvpn.com${partners.vpn.expressvpn}`,
          cta: 'Get ExpressVPN',
          icon: '🚀',
        },
      ].filter(Boolean) as AffiliateProduct[]

    case 'image-optimizer':
      return [
        partners.imageCdn.cloudinary && {
          name: 'Cloudinary',
          description: 'Automated image optimization and transformation',
          url: `https://cloudinary.com${partners.imageCdn.cloudinary}`,
          cta: 'Try Cloudinary',
          icon: '☁️',
        },
        partners.imageCdn.tinypng && {
          name: 'TinyPNG Pro',
          description: 'Advanced image compression with API access',
          url: `https://tinypng.com${partners.imageCdn.tinypng}`,
          cta: 'Upgrade to Pro',
          icon: '🖼️',
        },
      ].filter(Boolean) as AffiliateProduct[]

    case 'api-tester':
      return [
        partners.developerTools.postman && {
          name: 'Postman',
          description: 'Complete API development environment',
          url: `https://www.postman.com${partners.developerTools.postman}`,
          cta: 'Try Postman',
          icon: '📮',
        },
        partners.developerTools.insomnia && {
          name: 'Insomnia',
          description: 'Powerful REST and GraphQL API client',
          url: `https://insomnia.rest${partners.developerTools.insomnia}`,
          cta: 'Try Insomnia',
          icon: '🌙',
        },
      ].filter(Boolean) as AffiliateProduct[]

    case 'upload':
      return [
        partners.hosting.cloudflare && {
          name: 'Cloudflare',
          description: 'Global CDN and security for your files',
          url: `https://www.cloudflare.com${partners.hosting.cloudflare}`,
          cta: 'Try Cloudflare',
          icon: '☁️',
        },
        partners.hosting.supabase && {
          name: 'Supabase',
          description: 'Open source Firebase alternative with storage',
          url: `https://supabase.com${partners.hosting.supabase}`,
          cta: 'Try Supabase',
          icon: '⚡',
        },
      ].filter(Boolean) as AffiliateProduct[]

    default:
      return []
  }
}

/**
 * Affiliate Suggestion Component
 * Shows contextual product recommendations based on the tool being used
 */
export function AffiliateSuggestion({
  tool,
  className,
  variant = 'banner',
}: AffiliateSuggestionProps) {
  const config = getAdsConfig()

  if (!config.affiliates.enabled) {
    return null
  }

  const products = getAffiliateProducts(tool, config)

  if (products.length === 0) {
    return null
  }

  // Banner variant - horizontal layout
  if (variant === 'banner') {
    return (
      <div
        className={className}
        data-affiliate-tool={tool}
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px',
        }}
      >
        <p
          className={css({
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'blue.400',
            mb: '3',
          })}
        >
          💡 Recommended Tools
        </p>
        <div
          className={css({
            display: 'flex',
            gap: '4',
            flexWrap: 'wrap',
          })}
        >
          {products.map((product) => (
            <a
              key={product.name}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={css({
                flex: '1',
                minW: '200px',
                p: '3',
                rounded: 'md',
                bg: 'rgba(17, 24, 39, 0.5)',
                border: '1px solid',
                borderColor: 'gray.700',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'blue.500',
                  transform: 'translateY(-2px)',
                },
              })}
            >
              <div
                className={css({
                  fontSize: 'lg',
                  mb: '1',
                })}
              >
                {product.icon}
              </div>
              <h3
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'gray.200',
                  mb: '1',
                })}
              >
                {product.name}
              </h3>
              <p
                className={css({
                  fontSize: 'xs',
                  color: 'gray.400',
                  mb: '2',
                })}
              >
                {product.description}
              </p>
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'blue.400',
                  fontWeight: 'medium',
                })}
              >
                {product.cta} →
              </span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  // Card variant - vertical cards
  if (variant === 'card') {
    return (
      <div className={className} data-affiliate-tool={tool}>
        <p
          className={css({
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.400',
            mb: '3',
          })}
        >
          Recommended for you
        </p>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1', md: products.length > 1 ? '2' : '1' },
            gap: '4',
          })}
        >
          {products.map((product) => (
            <a
              key={product.name}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={css({
                p: '4',
                rounded: 'lg',
                bg: 'rgba(17, 24, 39, 0.5)',
                border: '1px solid',
                borderColor: 'gray.700',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'blue.500',
                  transform: 'translateY(-2px)',
                },
              })}
            >
              <div
                className={css({
                  fontSize: '2xl',
                  mb: '2',
                })}
              >
                {product.icon}
              </div>
              <h3
                className={css({
                  fontSize: 'md',
                  fontWeight: 'semibold',
                  color: 'gray.200',
                  mb: '2',
                })}
              >
                {product.name}
              </h3>
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'gray.400',
                  mb: '3',
                })}
              >
                {product.description}
              </p>
              <span
                className={css({
                  fontSize: 'sm',
                  color: 'blue.400',
                  fontWeight: 'medium',
                })}
              >
                {product.cta} →
              </span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  // Inline variant - compact single line
  if (variant === 'inline' && products.length > 0) {
    const product = products[0]
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={className}
        data-affiliate-tool={tool}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#60a5fa',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
      >
        <span>{product.icon}</span>
        <span>
          {product.cta}: <strong>{product.name}</strong>
        </span>
        <span>→</span>
      </a>
    )
  }

  return null
}
