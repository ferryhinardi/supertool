import { describe, expect, it } from 'vitest'

import {
  defaultSignatureData,
  defaultSignatureStyle,
  ensureProtocol,
  escapeHtml,
  fontFamilies,
  formatPhoneLink,
  generateAddressHtml,
  generateContactHtml,
  generateDivider,
  generateSignatureHtml,
  generateSignaturePlainText,
  generateSocialIconsHtml,
  getImageBorderRadius,
  getSocialUrl,
  type SignatureData,
  type SignatureStyle,
  socialColors,
  socialIcons,
  templatePresets,
  validateSignatureData,
} from '../utils'

describe('escapeHtml', () => {
  it('should return empty string for empty input', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should escape ampersand', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar')
  })

  it('should escape less than sign', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b')
  })

  it('should escape greater than sign', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s')
  })

  it('should escape multiple special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })
})

describe('formatPhoneLink', () => {
  it('should strip non-digit characters except +', () => {
    expect(formatPhoneLink('+1 (555) 123-4567')).toBe('+15551234567')
  })

  it('should preserve leading +', () => {
    expect(formatPhoneLink('+44 20 7946 0958')).toBe('+442079460958')
  })

  it('should handle phone without country code', () => {
    expect(formatPhoneLink('(555) 123-4567')).toBe('5551234567')
  })

  it('should handle plain digits', () => {
    expect(formatPhoneLink('5551234567')).toBe('5551234567')
  })

  it('should remove dots and spaces', () => {
    expect(formatPhoneLink('555.123.4567')).toBe('5551234567')
  })
})

describe('ensureProtocol', () => {
  it('should return empty string for empty input', () => {
    expect(ensureProtocol('')).toBe('')
  })

  it('should add https:// if missing', () => {
    expect(ensureProtocol('example.com')).toBe('https://example.com')
  })

  it('should preserve existing https://', () => {
    expect(ensureProtocol('https://example.com')).toBe('https://example.com')
  })

  it('should preserve existing http://', () => {
    expect(ensureProtocol('http://example.com')).toBe('http://example.com')
  })

  it('should handle URLs with paths', () => {
    expect(ensureProtocol('example.com/path/to/page')).toBe('https://example.com/path/to/page')
  })
})

describe('getSocialUrl', () => {
  it('should return empty string for empty value', () => {
    expect(getSocialUrl('linkedin', '')).toBe('')
  })

  it('should build LinkedIn URL from handle', () => {
    expect(getSocialUrl('linkedin', 'johndoe')).toBe('https://linkedin.com/in/johndoe')
  })

  it('should build Twitter URL from handle', () => {
    expect(getSocialUrl('twitter', 'johndoe')).toBe('https://twitter.com/johndoe')
  })

  it('should build GitHub URL from handle', () => {
    expect(getSocialUrl('github', 'johndoe')).toBe('https://github.com/johndoe')
  })

  it('should build Facebook URL from handle', () => {
    expect(getSocialUrl('facebook', 'johndoe')).toBe('https://facebook.com/johndoe')
  })

  it('should build Instagram URL from handle', () => {
    expect(getSocialUrl('instagram', 'johndoe')).toBe('https://instagram.com/johndoe')
  })

  it('should build YouTube URL from handle', () => {
    expect(getSocialUrl('youtube', 'johndoe')).toBe('https://youtube.com/@johndoe')
  })

  it('should remove @ prefix from handle', () => {
    expect(getSocialUrl('twitter', '@johndoe')).toBe('https://twitter.com/johndoe')
  })

  it('should return full URL if already provided', () => {
    expect(getSocialUrl('linkedin', 'https://linkedin.com/in/johndoe')).toBe(
      'https://linkedin.com/in/johndoe'
    )
  })

  it('should return http URL as-is', () => {
    expect(getSocialUrl('twitter', 'http://twitter.com/johndoe')).toBe('http://twitter.com/johndoe')
  })

  it('should return value for unknown platform', () => {
    expect(getSocialUrl('unknown', 'somehandle')).toBe('somehandle')
  })
})

describe('getImageBorderRadius', () => {
  it('should return 50% for circle shape', () => {
    expect(getImageBorderRadius('circle')).toBe('50%')
  })

  it('should return 8px for rounded shape', () => {
    expect(getImageBorderRadius('rounded')).toBe('8px')
  })

  it('should return 0 for square shape', () => {
    expect(getImageBorderRadius('square')).toBe('0')
  })
})

describe('generateDivider', () => {
  const baseStyle: SignatureStyle = {
    ...defaultSignatureStyle,
    secondaryColor: '#8b5cf6',
  }

  it('should return line divider HTML', () => {
    const result = generateDivider({ ...baseStyle, dividerStyle: 'line' })
    expect(result).toContain('<hr')
    expect(result).toContain('border-top: 1px solid #8b5cf6')
  })

  it('should return dots divider HTML', () => {
    const result = generateDivider({ ...baseStyle, dividerStyle: 'dots' })
    expect(result).toContain('• • •')
    expect(result).toContain('color: #8b5cf6')
  })

  it('should return empty string for none divider style', () => {
    const result = generateDivider({ ...baseStyle, dividerStyle: 'none' })
    expect(result).toBe('')
  })
})

describe('generateSocialIconsHtml', () => {
  const baseStyle: SignatureStyle = {
    ...defaultSignatureStyle,
    showSocialIcons: true,
    socialIconStyle: 'colored',
  }

  it('should return empty string when no social links provided', () => {
    const result = generateSocialIconsHtml(defaultSignatureData, baseStyle)
    expect(result).toBe('')
  })

  it('should generate LinkedIn icon when provided', () => {
    const data: SignatureData = { ...defaultSignatureData, linkedin: 'johndoe' }
    const result = generateSocialIconsHtml(data, baseStyle)
    expect(result).toContain('https://linkedin.com/in/johndoe')
    expect(result).toContain('<svg')
  })

  it('should generate multiple social icons', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      linkedin: 'johndoe',
      twitter: 'johndoe',
      github: 'johndoe',
    }
    const result = generateSocialIconsHtml(data, baseStyle)
    expect(result).toContain('linkedin.com')
    expect(result).toContain('twitter.com')
    expect(result).toContain('github.com')
  })

  it('should use monochrome colors when socialIconStyle is monochrome', () => {
    const data: SignatureData = { ...defaultSignatureData, linkedin: 'johndoe' }
    const monochromeStyle: SignatureStyle = {
      ...baseStyle,
      socialIconStyle: 'monochrome',
      textColor: '#374151',
    }
    const result = generateSocialIconsHtml(data, monochromeStyle)
    expect(result).toContain('#374151')
  })

  it('should add background and border-radius for rounded style', () => {
    const data: SignatureData = { ...defaultSignatureData, linkedin: 'johndoe' }
    const roundedStyle: SignatureStyle = { ...baseStyle, socialIconStyle: 'rounded' }
    const result = generateSocialIconsHtml(data, roundedStyle)
    expect(result).toContain('border-radius: 4px')
    expect(result).toContain('padding: 4px')
  })
})

describe('generateContactHtml', () => {
  const baseStyle: SignatureStyle = {
    ...defaultSignatureStyle,
    linkColor: '#6366f1',
    secondaryColor: '#8b5cf6',
  }

  it('should return empty string when no contact info provided', () => {
    const result = generateContactHtml(defaultSignatureData, baseStyle)
    expect(result).toBe('')
  })

  it('should generate email link', () => {
    const data: SignatureData = { ...defaultSignatureData, email: 'john@example.com' }
    const result = generateContactHtml(data, baseStyle)
    expect(result).toContain('mailto:john@example.com')
    expect(result).toContain('john@example.com')
  })

  it('should generate phone link', () => {
    const data: SignatureData = { ...defaultSignatureData, phone: '+1 (555) 123-4567' }
    const result = generateContactHtml(data, baseStyle)
    expect(result).toContain('tel:+15551234567')
  })

  it('should generate website link', () => {
    const data: SignatureData = { ...defaultSignatureData, website: 'example.com' }
    const result = generateContactHtml(data, baseStyle)
    expect(result).toContain('https://example.com')
    expect(result).toContain('example.com')
  })

  it('should not duplicate mobile if same as phone', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      phone: '555-123-4567',
      mobile: '555-123-4567',
    }
    const result = generateContactHtml(data, baseStyle)
    const phoneMatches = result.match(/555-123-4567/g)
    expect(phoneMatches?.length).toBe(1)
  })

  it('should include mobile if different from phone', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      phone: '555-123-4567',
      mobile: '555-987-6543',
    }
    const result = generateContactHtml(data, baseStyle)
    expect(result).toContain('555-123-4567')
    expect(result).toContain('555-987-6543')
  })

  it('should include Calendly link', () => {
    const data: SignatureData = { ...defaultSignatureData, calendlyUrl: 'calendly.com/john' }
    const result = generateContactHtml(data, baseStyle)
    expect(result).toContain('https://calendly.com/john')
    expect(result).toContain('Schedule a meeting')
  })

  it('should separate items with separator', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      email: 'john@example.com',
      phone: '555-123-4567',
    }
    const result = generateContactHtml(data, baseStyle)
    expect(result).toContain('|')
  })
})

describe('generateAddressHtml', () => {
  const baseStyle: SignatureStyle = {
    ...defaultSignatureStyle,
    textColor: '#374151',
    fontSize: 14,
  }

  it('should return empty string when no address provided', () => {
    const result = generateAddressHtml(defaultSignatureData, baseStyle)
    expect(result).toBe('')
  })

  it('should generate address with street', () => {
    const data: SignatureData = { ...defaultSignatureData, address: '123 Main St' }
    const result = generateAddressHtml(data, baseStyle)
    expect(result).toContain('123 Main St')
  })

  it('should generate city, state, zip combination', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    }
    const result = generateAddressHtml(data, baseStyle)
    expect(result).toContain('New York, NY, 10001')
  })

  it('should include country', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      city: 'London',
      country: 'United Kingdom',
    }
    const result = generateAddressHtml(data, baseStyle)
    expect(result).toContain('London')
    expect(result).toContain('United Kingdom')
  })

  it('should use reduced font size', () => {
    const result = generateAddressHtml(
      { ...defaultSignatureData, city: 'Test City' },
      { ...baseStyle, fontSize: 14 }
    )
    expect(result).toContain('font-size: 12px')
  })
})

describe('generateSignatureHtml', () => {
  const baseStyle: SignatureStyle = { ...defaultSignatureStyle }

  it('should generate HTML table structure', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: 'John Doe' }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('<table')
    expect(result).toContain('</table>')
  })

  it('should include name in output', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: 'John Doe' }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('John Doe')
  })

  it('should include pronouns with name', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      pronouns: 'he/him',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('he/him')
  })

  it('should include job title', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      jobTitle: 'Software Engineer',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('Software Engineer')
  })

  it('should include company and department', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      company: 'Acme Corp',
      department: 'Engineering',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('Acme Corp')
    expect(result).toContain('Engineering')
  })

  it('should include profile image when provided', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      profileImageUrl: 'https://example.com/photo.jpg',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('https://example.com/photo.jpg')
    expect(result).toContain('<img')
  })

  it('should use logo when no profile image', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      logoUrl: 'https://example.com/logo.png',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('https://example.com/logo.png')
  })

  it('should include banner when provided', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      bannerUrl: 'https://example.com/banner.jpg',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('https://example.com/banner.jpg')
  })

  it('should include disclaimer when provided', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      disclaimer: 'This email is confidential.',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('This email is confidential.')
  })

  it('should include custom fields when provided', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      customField1Label: 'Employee ID',
      customField1Value: '12345',
    }
    const result = generateSignatureHtml(data, baseStyle)
    expect(result).toContain('Employee ID')
    expect(result).toContain('12345')
  })

  it('should generate vertical layout', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      profileImageUrl: 'https://example.com/photo.jpg',
    }
    const verticalStyle: SignatureStyle = { ...baseStyle, layout: 'vertical' }
    const result = generateSignatureHtml(data, verticalStyle)
    expect(result).toContain('<table')
  })

  it('should generate compact layout', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      profileImageUrl: 'https://example.com/photo.jpg',
    }
    const compactStyle: SignatureStyle = { ...baseStyle, layout: 'compact' }
    const result = generateSignatureHtml(data, compactStyle)
    expect(result).toContain('vertical-align: middle')
  })

  it('should apply font family from style', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: 'John Doe' }
    const customStyle: SignatureStyle = { ...baseStyle, fontFamily: 'Georgia, serif' }
    const result = generateSignatureHtml(data, customStyle)
    expect(result).toContain('Georgia, serif')
  })

  it('should apply primary color from style', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: 'John Doe' }
    const customStyle: SignatureStyle = { ...baseStyle, primaryColor: '#ff0000' }
    const result = generateSignatureHtml(data, customStyle)
    expect(result).toContain('#ff0000')
  })
})

describe('generateSignaturePlainText', () => {
  it('should include name', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: 'John Doe' }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('John Doe')
  })

  it('should include pronouns with name', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      pronouns: 'he/him',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('John Doe (he/him)')
  })

  it('should include job title', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      jobTitle: 'Software Engineer',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Software Engineer')
  })

  it('should include company and department', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      company: 'Acme Corp',
      department: 'Engineering',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Engineering | Acme Corp')
  })

  it('should include email with label', () => {
    const data: SignatureData = { ...defaultSignatureData, email: 'john@example.com' }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Email: john@example.com')
  })

  it('should include phone with label', () => {
    const data: SignatureData = { ...defaultSignatureData, phone: '555-123-4567' }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Phone: 555-123-4567')
  })

  it('should include mobile if different from phone', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      phone: '555-123-4567',
      mobile: '555-987-6543',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Mobile: 555-987-6543')
  })

  it('should not include mobile if same as phone', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      phone: '555-123-4567',
      mobile: '555-123-4567',
    }
    const result = generateSignaturePlainText(data)
    expect(result).not.toContain('Mobile:')
  })

  it('should include fax', () => {
    const data: SignatureData = { ...defaultSignatureData, fax: '555-999-8888' }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Fax: 555-999-8888')
  })

  it('should include website', () => {
    const data: SignatureData = { ...defaultSignatureData, website: 'example.com' }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Web: example.com')
  })

  it('should include Calendly URL', () => {
    const data: SignatureData = { ...defaultSignatureData, calendlyUrl: 'calendly.com/john' }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Schedule: calendly.com/john')
  })

  it('should include full address', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('123 Main St, New York, NY, 10001, USA')
  })

  it('should include social links with full URLs', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      linkedin: 'johndoe',
      twitter: 'johndoe',
      github: 'johndoe',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('LinkedIn: https://linkedin.com/in/johndoe')
    expect(result).toContain('Twitter: https://twitter.com/johndoe')
    expect(result).toContain('GitHub: https://github.com/johndoe')
  })

  it('should include custom fields', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      customField1Label: 'Employee ID',
      customField1Value: '12345',
      customField2Label: 'Extension',
      customField2Value: '100',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('Employee ID: 12345')
    expect(result).toContain('Extension: 100')
  })

  it('should include disclaimer', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      disclaimer: 'This email is confidential.',
    }
    const result = generateSignaturePlainText(data)
    expect(result).toContain('This email is confidential.')
  })
})

describe('validateSignatureData', () => {
  it('should return valid for complete data with name', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: 'John Doe' }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return error when name is missing', () => {
    const result = validateSignatureData(defaultSignatureData)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Full name is required')
  })

  it('should return error when name is only whitespace', () => {
    const data: SignatureData = { ...defaultSignatureData, fullName: '   ' }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Full name is required')
  })

  it('should return error for invalid email format', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      email: 'invalid-email',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid email format')
  })

  it('should accept valid email format', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      email: 'john@example.com',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(true)
  })

  it('should return error for invalid website URL', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      website: 'not a url',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid website URL')
  })

  it('should accept valid website URL', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      website: 'example.com',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(true)
  })

  it('should accept website URL with protocol', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      website: 'https://example.com/path',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(true)
  })

  it('should return error for logo URL without protocol', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      logoUrl: 'example.com/logo.png',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Logo URL must be a valid HTTPS URL')
  })

  it('should accept valid logo URL', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      logoUrl: 'https://example.com/logo.png',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(true)
  })

  it('should return error for profile image URL without protocol', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      profileImageUrl: 'example.com/photo.jpg',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Profile image URL must be a valid HTTPS URL')
  })

  it('should return error for banner URL without protocol', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: 'John Doe',
      bannerUrl: 'example.com/banner.jpg',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Banner URL must be a valid HTTPS URL')
  })

  it('should return multiple errors when multiple validations fail', () => {
    const data: SignatureData = {
      ...defaultSignatureData,
      fullName: '',
      email: 'invalid',
      website: 'not valid',
    }
    const result = validateSignatureData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})

describe('defaultSignatureData', () => {
  it('should have all required fields', () => {
    expect(defaultSignatureData).toHaveProperty('fullName')
    expect(defaultSignatureData).toHaveProperty('jobTitle')
    expect(defaultSignatureData).toHaveProperty('company')
    expect(defaultSignatureData).toHaveProperty('department')
    expect(defaultSignatureData).toHaveProperty('email')
    expect(defaultSignatureData).toHaveProperty('phone')
    expect(defaultSignatureData).toHaveProperty('mobile')
    expect(defaultSignatureData).toHaveProperty('fax')
    expect(defaultSignatureData).toHaveProperty('website')
    expect(defaultSignatureData).toHaveProperty('address')
    expect(defaultSignatureData).toHaveProperty('city')
    expect(defaultSignatureData).toHaveProperty('state')
    expect(defaultSignatureData).toHaveProperty('zipCode')
    expect(defaultSignatureData).toHaveProperty('country')
    expect(defaultSignatureData).toHaveProperty('linkedin')
    expect(defaultSignatureData).toHaveProperty('twitter')
    expect(defaultSignatureData).toHaveProperty('facebook')
    expect(defaultSignatureData).toHaveProperty('instagram')
    expect(defaultSignatureData).toHaveProperty('youtube')
    expect(defaultSignatureData).toHaveProperty('github')
    expect(defaultSignatureData).toHaveProperty('logoUrl')
    expect(defaultSignatureData).toHaveProperty('bannerUrl')
    expect(defaultSignatureData).toHaveProperty('profileImageUrl')
    expect(defaultSignatureData).toHaveProperty('disclaimer')
    expect(defaultSignatureData).toHaveProperty('pronouns')
    expect(defaultSignatureData).toHaveProperty('calendlyUrl')
    expect(defaultSignatureData).toHaveProperty('customField1Label')
    expect(defaultSignatureData).toHaveProperty('customField1Value')
    expect(defaultSignatureData).toHaveProperty('customField2Label')
    expect(defaultSignatureData).toHaveProperty('customField2Value')
  })

  it('should have empty string as default for all fields', () => {
    for (const value of Object.values(defaultSignatureData)) {
      expect(value).toBe('')
    }
  })
})

describe('defaultSignatureStyle', () => {
  it('should have all required fields', () => {
    expect(defaultSignatureStyle).toHaveProperty('template')
    expect(defaultSignatureStyle).toHaveProperty('primaryColor')
    expect(defaultSignatureStyle).toHaveProperty('secondaryColor')
    expect(defaultSignatureStyle).toHaveProperty('textColor')
    expect(defaultSignatureStyle).toHaveProperty('linkColor')
    expect(defaultSignatureStyle).toHaveProperty('fontFamily')
    expect(defaultSignatureStyle).toHaveProperty('fontSize')
    expect(defaultSignatureStyle).toHaveProperty('imageSize')
    expect(defaultSignatureStyle).toHaveProperty('showSocialIcons')
    expect(defaultSignatureStyle).toHaveProperty('socialIconStyle')
    expect(defaultSignatureStyle).toHaveProperty('layout')
    expect(defaultSignatureStyle).toHaveProperty('dividerStyle')
    expect(defaultSignatureStyle).toHaveProperty('imageShape')
  })

  it('should have expected default values', () => {
    expect(defaultSignatureStyle.template).toBe('professional')
    expect(defaultSignatureStyle.layout).toBe('horizontal')
    expect(defaultSignatureStyle.showSocialIcons).toBe(true)
    expect(defaultSignatureStyle.dividerStyle).toBe('line')
    expect(defaultSignatureStyle.imageShape).toBe('circle')
  })
})

describe('templatePresets', () => {
  it('should have all 6 templates', () => {
    expect(templatePresets).toHaveProperty('professional')
    expect(templatePresets).toHaveProperty('modern')
    expect(templatePresets).toHaveProperty('minimal')
    expect(templatePresets).toHaveProperty('creative')
    expect(templatePresets).toHaveProperty('corporate')
    expect(templatePresets).toHaveProperty('elegant')
  })

  it('should have name and description for each template', () => {
    for (const preset of Object.values(templatePresets)) {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('description')
      expect(preset).toHaveProperty('style')
      expect(typeof preset.name).toBe('string')
      expect(typeof preset.description).toBe('string')
    }
  })

  it('should have style properties for each template', () => {
    for (const preset of Object.values(templatePresets)) {
      expect(preset.style).toHaveProperty('primaryColor')
      expect(preset.style).toHaveProperty('secondaryColor')
      expect(preset.style).toHaveProperty('textColor')
      expect(preset.style).toHaveProperty('linkColor')
    }
  })
})

describe('fontFamilies', () => {
  it('should have multiple font options', () => {
    expect(fontFamilies.length).toBeGreaterThan(0)
  })

  it('should have label and value for each font', () => {
    for (const font of fontFamilies) {
      expect(font).toHaveProperty('label')
      expect(font).toHaveProperty('value')
      expect(typeof font.label).toBe('string')
      expect(typeof font.value).toBe('string')
    }
  })

  it('should include Arial', () => {
    const arial = fontFamilies.find((f) => f.label === 'Arial')
    expect(arial).toBeDefined()
    expect(arial?.value).toContain('Arial')
  })
})

describe('socialIcons', () => {
  it('should have SVG for all platforms', () => {
    expect(socialIcons).toHaveProperty('linkedin')
    expect(socialIcons).toHaveProperty('twitter')
    expect(socialIcons).toHaveProperty('facebook')
    expect(socialIcons).toHaveProperty('instagram')
    expect(socialIcons).toHaveProperty('youtube')
    expect(socialIcons).toHaveProperty('github')
  })

  it('should have valid SVG content', () => {
    for (const svg of Object.values(socialIcons)) {
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
    }
  })
})

describe('socialColors', () => {
  it('should have colors for all platforms', () => {
    expect(socialColors).toHaveProperty('linkedin')
    expect(socialColors).toHaveProperty('twitter')
    expect(socialColors).toHaveProperty('facebook')
    expect(socialColors).toHaveProperty('instagram')
    expect(socialColors).toHaveProperty('youtube')
    expect(socialColors).toHaveProperty('github')
  })

  it('should have valid hex colors', () => {
    for (const color of Object.values(socialColors)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
