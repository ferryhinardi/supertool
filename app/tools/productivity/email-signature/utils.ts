// Email Signature Generator Utilities

export interface SignatureData {
  // Personal Info
  fullName: string
  jobTitle: string
  company: string
  department: string
  // Contact Info
  email: string
  phone: string
  mobile: string
  fax: string
  website: string
  // Address
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  // Social Links
  linkedin: string
  twitter: string
  facebook: string
  instagram: string
  youtube: string
  github: string
  // Branding
  logoUrl: string
  bannerUrl: string
  profileImageUrl: string
  // Additional
  disclaimer: string
  pronouns: string
  calendlyUrl: string
  customField1Label: string
  customField1Value: string
  customField2Label: string
  customField2Value: string
}

export interface SignatureStyle {
  template: TemplateType
  primaryColor: string
  secondaryColor: string
  textColor: string
  linkColor: string
  fontFamily: string
  fontSize: number
  imageSize: number
  showSocialIcons: boolean
  socialIconStyle: 'colored' | 'monochrome' | 'rounded'
  layout: 'horizontal' | 'vertical' | 'compact'
  dividerStyle: 'line' | 'none' | 'dots'
  imageShape: 'circle' | 'square' | 'rounded'
}

export type TemplateType =
  | 'professional'
  | 'modern'
  | 'minimal'
  | 'creative'
  | 'corporate'
  | 'elegant'

export const defaultSignatureData: SignatureData = {
  fullName: '',
  jobTitle: '',
  company: '',
  department: '',
  email: '',
  phone: '',
  mobile: '',
  fax: '',
  website: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  linkedin: '',
  twitter: '',
  facebook: '',
  instagram: '',
  youtube: '',
  github: '',
  logoUrl: '',
  bannerUrl: '',
  profileImageUrl: '',
  disclaimer: '',
  pronouns: '',
  calendlyUrl: '',
  customField1Label: '',
  customField1Value: '',
  customField2Label: '',
  customField2Value: '',
}

export const defaultSignatureStyle: SignatureStyle = {
  template: 'professional',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  textColor: '#374151',
  linkColor: '#6366f1',
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
  imageSize: 80,
  showSocialIcons: true,
  socialIconStyle: 'colored',
  layout: 'horizontal',
  dividerStyle: 'line',
  imageShape: 'circle',
}

export const fontFamilies = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
]

export const templatePresets: Record<
  TemplateType,
  { name: string; description: string; style: Partial<SignatureStyle> }
> = {
  professional: {
    name: 'Professional',
    description: 'Clean and business-focused design',
    style: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      textColor: '#1f2937',
      linkColor: '#1e40af',
      layout: 'horizontal',
      dividerStyle: 'line',
      socialIconStyle: 'colored',
    },
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary style with gradient accents',
    style: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      textColor: '#374151',
      linkColor: '#6366f1',
      layout: 'horizontal',
      dividerStyle: 'line',
      socialIconStyle: 'rounded',
    },
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and understated',
    style: {
      primaryColor: '#374151',
      secondaryColor: '#6b7280',
      textColor: '#374151',
      linkColor: '#374151',
      layout: 'vertical',
      dividerStyle: 'none',
      socialIconStyle: 'monochrome',
    },
  },
  creative: {
    name: 'Creative',
    description: 'Bold colors and expressive layout',
    style: {
      primaryColor: '#ec4899',
      secondaryColor: '#f97316',
      textColor: '#1f2937',
      linkColor: '#ec4899',
      layout: 'horizontal',
      dividerStyle: 'dots',
      socialIconStyle: 'colored',
    },
  },
  corporate: {
    name: 'Corporate',
    description: 'Traditional business signature',
    style: {
      primaryColor: '#0f172a',
      secondaryColor: '#334155',
      textColor: '#0f172a',
      linkColor: '#0f172a',
      layout: 'horizontal',
      dividerStyle: 'line',
      socialIconStyle: 'monochrome',
    },
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated and refined',
    style: {
      primaryColor: '#78350f',
      secondaryColor: '#b45309',
      textColor: '#292524',
      linkColor: '#78350f',
      layout: 'vertical',
      dividerStyle: 'line',
      socialIconStyle: 'colored',
    },
  },
}

// Social media icon SVGs (inline for email compatibility)
export const socialIcons: Record<string, string> = {
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
}

export const socialColors: Record<string, string> = {
  linkedin: '#0077b5',
  twitter: '#000000',
  facebook: '#1877f2',
  instagram: '#e4405f',
  youtube: '#ff0000',
  github: '#333333',
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char)
}

/**
 * Format phone number for tel: link
 */
export function formatPhoneLink(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

/**
 * Ensure URL has protocol
 */
export function ensureProtocol(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

/**
 * Get social profile URL from username/handle
 */
export function getSocialUrl(platform: string, value: string): string {
  if (!value) return ''

  // If it's already a full URL, return it
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  // Remove @ prefix if present
  const handle = value.replace(/^@/, '')

  const baseUrls: Record<string, string> = {
    linkedin: 'https://linkedin.com/in/',
    twitter: 'https://twitter.com/',
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/@',
    github: 'https://github.com/',
  }

  return baseUrls[platform] ? `${baseUrls[platform]}${handle}` : value
}

/**
 * Generate image border radius based on shape
 */
export function getImageBorderRadius(shape: SignatureStyle['imageShape']): string {
  switch (shape) {
    case 'circle':
      return '50%'
    case 'rounded':
      return '8px'
    default:
      return '0'
  }
}

/**
 * Generate divider HTML
 */
export function generateDivider(style: SignatureStyle): string {
  switch (style.dividerStyle) {
    case 'line':
      return `<tr><td colspan="2" style="padding: 10px 0;"><hr style="border: none; border-top: 1px solid ${style.secondaryColor}; margin: 0;" /></td></tr>`
    case 'dots':
      return `<tr><td colspan="2" style="padding: 10px 0; text-align: center; color: ${style.secondaryColor}; letter-spacing: 4px;">• • •</td></tr>`
    default:
      return ''
  }
}

/**
 * Generate social icons HTML
 */
export function generateSocialIconsHtml(data: SignatureData, style: SignatureStyle): string {
  const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github'] as const
  const icons: string[] = []

  for (const platform of platforms) {
    const value = data[platform]
    if (!value) continue

    const url = getSocialUrl(platform, value)
    const color = style.socialIconStyle === 'monochrome' ? style.textColor : socialColors[platform]
    const bgColor =
      style.socialIconStyle === 'rounded' ? `${socialColors[platform]}20` : 'transparent'
    const borderRadius = style.socialIconStyle === 'rounded' ? '4px' : '0'
    const padding = style.socialIconStyle === 'rounded' ? '4px' : '0'

    icons.push(`
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-right: 8px; text-decoration: none; color: ${color}; background-color: ${bgColor}; border-radius: ${borderRadius}; padding: ${padding};">
        ${socialIcons[platform].replace('currentColor', color)}
      </a>
    `)
  }

  if (icons.length === 0) return ''

  return `<div style="margin-top: 10px;">${icons.join('')}</div>`
}

/**
 * Generate contact info HTML
 */
export function generateContactHtml(data: SignatureData, style: SignatureStyle): string {
  const items: string[] = []
  const separator = `<span style="color: ${style.secondaryColor}; margin: 0 8px;">|</span>`

  if (data.email) {
    items.push(
      `<a href="mailto:${escapeHtml(data.email)}" style="color: ${style.linkColor}; text-decoration: none;">${escapeHtml(data.email)}</a>`
    )
  }

  if (data.phone) {
    items.push(
      `<a href="tel:${formatPhoneLink(data.phone)}" style="color: ${style.linkColor}; text-decoration: none;">${escapeHtml(data.phone)}</a>`
    )
  }

  if (data.mobile && data.mobile !== data.phone) {
    items.push(
      `<a href="tel:${formatPhoneLink(data.mobile)}" style="color: ${style.linkColor}; text-decoration: none;">${escapeHtml(data.mobile)}</a>`
    )
  }

  if (data.website) {
    const url = ensureProtocol(data.website)
    const displayUrl = data.website.replace(/^https?:\/\//, '')
    items.push(
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color: ${style.linkColor}; text-decoration: none;">${escapeHtml(displayUrl)}</a>`
    )
  }

  if (data.calendlyUrl) {
    const url = ensureProtocol(data.calendlyUrl)
    items.push(
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color: ${style.linkColor}; text-decoration: none;">Schedule a meeting</a>`
    )
  }

  return items.join(separator)
}

/**
 * Generate address HTML
 */
export function generateAddressHtml(data: SignatureData, style: SignatureStyle): string {
  const parts: string[] = []

  if (data.address) parts.push(data.address)

  const cityStateZip: string[] = []
  if (data.city) cityStateZip.push(data.city)
  if (data.state) cityStateZip.push(data.state)
  if (data.zipCode) cityStateZip.push(data.zipCode)

  if (cityStateZip.length > 0) parts.push(cityStateZip.join(', '))
  if (data.country) parts.push(data.country)

  if (parts.length === 0) return ''

  return `<div style="color: ${style.textColor}; font-size: ${style.fontSize - 2}px; margin-top: 5px;">${escapeHtml(parts.join(' | '))}</div>`
}

/**
 * Generate the full HTML email signature
 */
export function generateSignatureHtml(data: SignatureData, style: SignatureStyle): string {
  const hasImage = data.profileImageUrl || data.logoUrl
  const imageUrl = data.profileImageUrl || data.logoUrl
  const borderRadius = getImageBorderRadius(style.imageShape)

  // Generate name and title section
  const nameHtml = data.fullName
    ? `<div style="font-size: ${style.fontSize + 4}px; font-weight: bold; color: ${style.primaryColor}; margin-bottom: 2px;">${escapeHtml(data.fullName)}${data.pronouns ? ` <span style="font-weight: normal; font-size: ${style.fontSize - 2}px; color: ${style.secondaryColor};">(${escapeHtml(data.pronouns)})</span>` : ''}</div>`
    : ''

  const titleHtml = data.jobTitle
    ? `<div style="font-size: ${style.fontSize}px; color: ${style.textColor}; margin-bottom: 2px;">${escapeHtml(data.jobTitle)}</div>`
    : ''

  const companyHtml =
    data.company || data.department
      ? `<div style="font-size: ${style.fontSize}px; color: ${style.secondaryColor};">${[data.department, data.company].filter(Boolean).map(escapeHtml).join(' | ')}</div>`
      : ''

  // Generate image HTML
  const imageHtml = hasImage
    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.fullName || 'Profile')}" width="${style.imageSize}" height="${style.imageSize}" style="border-radius: ${borderRadius}; object-fit: cover; display: block;" />`
    : ''

  // Generate contact info
  const contactHtml = generateContactHtml(data, style)

  // Generate address
  const addressHtml = generateAddressHtml(data, style)

  // Generate social icons
  const socialHtml = style.showSocialIcons ? generateSocialIconsHtml(data, style) : ''

  // Generate custom fields
  let customFieldsHtml = ''
  if (data.customField1Label && data.customField1Value) {
    customFieldsHtml += `<div style="font-size: ${style.fontSize - 2}px; color: ${style.textColor}; margin-top: 5px;"><strong>${escapeHtml(data.customField1Label)}:</strong> ${escapeHtml(data.customField1Value)}</div>`
  }
  if (data.customField2Label && data.customField2Value) {
    customFieldsHtml += `<div style="font-size: ${style.fontSize - 2}px; color: ${style.textColor}; margin-top: 3px;"><strong>${escapeHtml(data.customField2Label)}:</strong> ${escapeHtml(data.customField2Value)}</div>`
  }

  // Generate disclaimer
  const disclaimerHtml = data.disclaimer
    ? `<div style="font-size: ${style.fontSize - 3}px; color: ${style.secondaryColor}; margin-top: 15px; font-style: italic; max-width: 500px;">${escapeHtml(data.disclaimer)}</div>`
    : ''

  // Generate banner
  const bannerHtml = data.bannerUrl
    ? `<div style="margin-top: 15px;"><img src="${escapeHtml(data.bannerUrl)}" alt="Banner" style="max-width: 100%; height: auto; border-radius: 4px;" /></div>`
    : ''

  // Build the signature based on layout
  if (style.layout === 'vertical') {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: ${style.fontFamily}; font-size: ${style.fontSize}px; line-height: 1.4;">
        ${hasImage ? `<tr><td style="padding-bottom: 10px;">${imageHtml}</td></tr>` : ''}
        <tr><td>${nameHtml}${titleHtml}${companyHtml}</td></tr>
        ${generateDivider(style)}
        <tr><td style="padding-top: 5px;">${contactHtml}</td></tr>
        ${addressHtml ? `<tr><td>${addressHtml}</td></tr>` : ''}
        ${customFieldsHtml ? `<tr><td>${customFieldsHtml}</td></tr>` : ''}
        ${socialHtml ? `<tr><td>${socialHtml}</td></tr>` : ''}
        ${bannerHtml ? `<tr><td>${bannerHtml}</td></tr>` : ''}
        ${disclaimerHtml ? `<tr><td>${disclaimerHtml}</td></tr>` : ''}
      </table>
    `
  }

  if (style.layout === 'compact') {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: ${style.fontFamily}; font-size: ${style.fontSize}px; line-height: 1.4;">
        <tr>
          ${hasImage ? `<td style="vertical-align: middle; padding-right: 12px;">${imageHtml}</td>` : ''}
          <td style="vertical-align: middle;">
            ${nameHtml}${titleHtml}${companyHtml}
            <div style="margin-top: 5px;">${contactHtml}</div>
            ${socialHtml}
          </td>
        </tr>
        ${bannerHtml ? `<tr><td colspan="2">${bannerHtml}</td></tr>` : ''}
        ${disclaimerHtml ? `<tr><td colspan="2">${disclaimerHtml}</td></tr>` : ''}
      </table>
    `
  }

  // Default: horizontal layout
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family: ${style.fontFamily}; font-size: ${style.fontSize}px; line-height: 1.4;">
      <tr>
        ${hasImage ? `<td style="vertical-align: top; padding-right: 15px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td>${imageHtml}</td></tr></table></td>` : ''}
        <td style="vertical-align: top; ${hasImage ? `border-left: 2px solid ${style.primaryColor}; padding-left: 15px;` : ''}">
          ${nameHtml}${titleHtml}${companyHtml}
          ${generateDivider({
            ...style,
            dividerStyle: style.dividerStyle === 'none' ? 'none' : 'line',
          })
            .replace('<tr><td colspan="2"', '<div')
            .replace('</td></tr>', '</div>')}
          <div style="margin-top: 8px;">${contactHtml}</div>
          ${addressHtml}
          ${customFieldsHtml}
          ${socialHtml}
        </td>
      </tr>
      ${bannerHtml ? `<tr><td colspan="2">${bannerHtml}</td></tr>` : ''}
      ${disclaimerHtml ? `<tr><td colspan="2">${disclaimerHtml}</td></tr>` : ''}
    </table>
  `
}

/**
 * Generate plain text version of signature
 */
export function generateSignaturePlainText(data: SignatureData): string {
  const lines: string[] = []

  if (data.fullName) {
    lines.push(data.fullName + (data.pronouns ? ` (${data.pronouns})` : ''))
  }
  if (data.jobTitle) lines.push(data.jobTitle)
  if (data.department || data.company) {
    lines.push([data.department, data.company].filter(Boolean).join(' | '))
  }

  lines.push('')

  if (data.email) lines.push(`Email: ${data.email}`)
  if (data.phone) lines.push(`Phone: ${data.phone}`)
  if (data.mobile && data.mobile !== data.phone) lines.push(`Mobile: ${data.mobile}`)
  if (data.fax) lines.push(`Fax: ${data.fax}`)
  if (data.website) lines.push(`Web: ${data.website}`)
  if (data.calendlyUrl) lines.push(`Schedule: ${data.calendlyUrl}`)

  const addressParts: string[] = []
  if (data.address) addressParts.push(data.address)
  if (data.city) addressParts.push(data.city)
  if (data.state) addressParts.push(data.state)
  if (data.zipCode) addressParts.push(data.zipCode)
  if (data.country) addressParts.push(data.country)
  if (addressParts.length > 0) {
    lines.push('')
    lines.push(addressParts.join(', '))
  }

  const socialLines: string[] = []
  if (data.linkedin) socialLines.push(`LinkedIn: ${getSocialUrl('linkedin', data.linkedin)}`)
  if (data.twitter) socialLines.push(`Twitter: ${getSocialUrl('twitter', data.twitter)}`)
  if (data.github) socialLines.push(`GitHub: ${getSocialUrl('github', data.github)}`)
  if (socialLines.length > 0) {
    lines.push('')
    lines.push(...socialLines)
  }

  if (data.customField1Label && data.customField1Value) {
    lines.push('')
    lines.push(`${data.customField1Label}: ${data.customField1Value}`)
  }
  if (data.customField2Label && data.customField2Value) {
    lines.push(`${data.customField2Label}: ${data.customField2Value}`)
  }

  if (data.disclaimer) {
    lines.push('')
    lines.push(data.disclaimer)
  }

  return lines.join('\n')
}

/**
 * Validate signature data
 */
export function validateSignatureData(data: SignatureData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.fullName?.trim()) {
    errors.push('Full name is required')
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format')
  }

  if (data.website && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(data.website)) {
    errors.push('Invalid website URL')
  }

  if (data.logoUrl && !/^https?:\/\/.+/i.test(data.logoUrl)) {
    errors.push('Logo URL must be a valid HTTPS URL')
  }

  if (data.profileImageUrl && !/^https?:\/\/.+/i.test(data.profileImageUrl)) {
    errors.push('Profile image URL must be a valid HTTPS URL')
  }

  if (data.bannerUrl && !/^https?:\/\/.+/i.test(data.bannerUrl)) {
    errors.push('Banner URL must be a valid HTTPS URL')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
