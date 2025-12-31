'use client'

import { jsPDF } from 'jspdf'
import { Check, Copy, Download, FileText, Scale, Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  type CompanyInfo,
  type DocumentType,
  generateCookiePolicy,
  generatePrivacyPolicy,
  generateTermsOfService,
  INDUSTRIES,
  type IndustryType,
  JURISDICTIONS,
  type JurisdictionType,
  type TemplateOptions,
} from './templates'

export default function PrivacyPolicyGeneratorPage() {
  const [documentType, setDocumentType] = useState<DocumentType>('privacy-policy')
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    websiteUrl: '',
    contactEmail: '',
    country: 'United States',
    state: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  })

  const [options, setOptions] = useState<TemplateOptions>({
    industry: 'general',
    jurisdiction: ['international'],
    includeAnalytics: true,
    includeCookies: true,
    includeThirdPartyServices: false,
    includeDataRetention: true,
    includeChildrenPrivacy: true,
    includeCaliforniaRights: false,
    includeGDPRRights: false,
  })

  useEffect(() => {
    trackToolEvent('privacy_policy_generator_open')
  }, [])

  // Generate document
  const generatedDocument = useMemo(() => {
    if (!companyInfo.companyName || !companyInfo.websiteUrl || !companyInfo.contactEmail) {
      return ''
    }

    if (documentType === 'privacy-policy') {
      return generatePrivacyPolicy(companyInfo, options)
    }
    if (documentType === 'cookie-policy') {
      return generateCookiePolicy(companyInfo)
    }
    if (documentType === 'terms-of-service') {
      return generateTermsOfService(companyInfo, options.industry)
    }
    return ''
  }, [companyInfo, options, documentType])

  // Handle jurisdiction toggle
  const toggleJurisdiction = (jurisdictionId: JurisdictionType) => {
    setOptions((prev) => {
      const isSelected = prev.jurisdiction.includes(jurisdictionId)

      // Can't deselect international
      if (jurisdictionId === 'international' && isSelected) {
        return prev
      }

      const newJurisdictions = isSelected
        ? prev.jurisdiction.filter((j) => j !== jurisdictionId)
        : [...prev.jurisdiction, jurisdictionId]

      // Update related options
      const newOptions = { ...prev, jurisdiction: newJurisdictions }
      if (jurisdictionId === 'eu-gdpr') {
        newOptions.includeGDPRRights = !isSelected
      }
      if (jurisdictionId === 'ccpa') {
        newOptions.includeCaliforniaRights = !isSelected
      }

      trackToolEvent('privacy_policy_jurisdiction_select', { jurisdiction: jurisdictionId })
      return newOptions
    })
  }

  // Copy to clipboard
  const handleCopy = () => {
    if (!generatedDocument) {
      toast.error('Please fill in all required fields first')
      return
    }

    navigator.clipboard.writeText(generatedDocument)
    toast.success('Copied to clipboard!')
    trackToolEvent('privacy_policy_copy')
  }

  // Download as HTML
  const handleDownloadHTML = () => {
    if (!generatedDocument) {
      toast.error('Please fill in all required fields first')
      return
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentType === 'privacy-policy' ? 'Privacy Policy' : documentType === 'cookie-policy' ? 'Cookie Policy' : 'Terms of Service'} - ${companyInfo.companyName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 { font-size: 2.5em; margin-bottom: 0.5em; }
        h2 { font-size: 1.8em; margin-top: 1.5em; border-bottom: 2px solid #6366f1; padding-bottom: 0.3em; }
        h3 { font-size: 1.3em; margin-top: 1.2em; }
        p { margin: 1em 0; }
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        strong { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: 600; }
    </style>
</head>
<body>
${generatedDocument
  .split('\n')
  .map((line) => {
    if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`
    if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`
    if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`
    if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`
    if (line.startsWith('**') && line.endsWith('**')) {
      return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`
    }
    if (line.trim() === '') return '<br>'
    if (line.startsWith('|')) return line // Table markdown (would need full markdown parser)
    return `<p>${line}</p>`
  })
  .join('\n')}
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentType}-${companyInfo.companyName.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('HTML file downloaded!')
    trackToolEvent('privacy_policy_download_html', { documentType })
  }

  // Download as PDF
  const handleDownloadPDF = () => {
    if (!generatedDocument) {
      toast.error('Please fill in all required fields first')
      return
    }

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxLineWidth = pageWidth - margin * 2
      let cursorY = margin

      // Process markdown-like content
      const lines = generatedDocument.split('\n')

      for (const line of lines) {
        // Check if we need a new page
        if (cursorY > pageHeight - margin) {
          doc.addPage()
          cursorY = margin
        }

        if (line.startsWith('# ')) {
          // H1
          doc.setFontSize(24)
          doc.setFont('helvetica', 'bold')
          const text = line.substring(2)
          const splitText = doc.splitTextToSize(text, maxLineWidth)
          doc.text(splitText, margin, cursorY)
          cursorY += splitText.length * 12 + 10
        } else if (line.startsWith('## ')) {
          // H2
          doc.setFontSize(18)
          doc.setFont('helvetica', 'bold')
          const text = line.substring(3)
          const splitText = doc.splitTextToSize(text, maxLineWidth)
          doc.text(splitText, margin, cursorY)
          cursorY += splitText.length * 9 + 8
        } else if (line.startsWith('### ')) {
          // H3
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          const text = line.substring(4)
          const splitText = doc.splitTextToSize(text, maxLineWidth)
          doc.text(splitText, margin, cursorY)
          cursorY += splitText.length * 7 + 6
        } else if (line.startsWith('- ')) {
          // Bullet point
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
          const text = `• ${line.substring(2)}`
          const splitText = doc.splitTextToSize(text, maxLineWidth - 10)
          doc.text(splitText, margin + 5, cursorY)
          cursorY += splitText.length * 6 + 3
        } else if (line.trim() !== '' && !line.startsWith('|')) {
          // Normal paragraph
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
          const splitText = doc.splitTextToSize(line, maxLineWidth)
          doc.text(splitText, margin, cursorY)
          cursorY += splitText.length * 6 + 4
        } else if (line.trim() === '') {
          // Empty line
          cursorY += 4
        }
      }

      doc.save(`${documentType}-${companyInfo.companyName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
      toast.success('PDF downloaded successfully!')
      trackToolEvent('privacy_policy_download_pdf', { documentType })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const documentTypes: Array<{ id: DocumentType; label: string; icon: React.ElementType }> = [
    { id: 'privacy-policy', label: 'Privacy Policy', icon: Shield },
    { id: 'cookie-policy', label: 'Cookie Policy', icon: FileText },
    { id: 'terms-of-service', label: 'Terms of Service', icon: Scale },
  ]

  const canGenerate = companyInfo.companyName && companyInfo.websiteUrl && companyInfo.contactEmail

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            mb: '3',
            px: '3',
            py: '1.5',
            bg: 'green.500/10',
            rounded: 'full',
          })}
        >
          <Shield className={css({ w: '4', h: '4', color: 'green.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'green.400' })}>
            Privacy Policy Generator
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'green.400',
            gradientTo: 'blue.400',
            bgClip: 'text',
            mb: '3',
          })}
        >
          Generate Legal Documents Instantly
        </h1>

        <p
          className={css({
            fontSize: { base: 'sm', sm: 'base', md: 'lg' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Create GDPR & CCPA compliant privacy policies, cookie policies, and terms of service for
          your website or app. Free, professional, and legally sound templates.
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '400px 1fr' },
          gap: '6',
          alignItems: 'start',
        })}
      >
        {/* Left Sidebar - Form */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
          {/* Document Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Document Type</CardTitle>
              <CardDescription>Choose the type of document to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                {documentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setDocumentType(type.id)
                        trackToolEvent('privacy_policy_document_type_select', { type: type.id })
                      }}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3',
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: documentType === type.id ? 'green.500' : 'gray.800',
                        bg: documentType === type.id ? 'green.500/10' : 'gray.900',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          borderColor: 'green.500',
                          bg: 'green.500/5',
                        },
                      })}
                    >
                      <Icon
                        className={css({
                          w: '5',
                          h: '5',
                          color: documentType === type.id ? 'green.400' : 'gray.500',
                        })}
                      />
                      <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                        {type.label}
                      </span>
                      {documentType === type.id && (
                        <Check
                          className={css({ w: '4', h: '4', color: 'green.400', ml: 'auto' })}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Enter your business details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <div>
                  <label
                    htmlFor="company-name"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Company Name *
                  </label>
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="Acme Inc."
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="website-url"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Website URL *
                  </label>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={companyInfo.websiteUrl}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, websiteUrl: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Contact Email *
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="legal@example.com"
                    value={companyInfo.contactEmail}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Country *
                  </label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="United States"
                    value={companyInfo.country}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, country: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    State/Province (Optional)
                  </label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="California"
                    value={companyInfo.state}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="effective-date"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Effective Date
                  </label>
                  <Input
                    id="effective-date"
                    type="date"
                    value={companyInfo.effectiveDate}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, effectiveDate: e.target.value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry & Jurisdiction (Privacy Policy only) */}
          {documentType === 'privacy-policy' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Industry</CardTitle>
                  <CardDescription>Select your business type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry.id}
                        type="button"
                        onClick={() => {
                          setOptions((prev) => ({ ...prev, industry: industry.id as IndustryType }))
                          trackToolEvent('privacy_policy_industry_select', {
                            industry: industry.id,
                          })
                        }}
                        className={css({
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                          p: '3',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: options.industry === industry.id ? 'green.500' : 'gray.800',
                          bg: options.industry === industry.id ? 'green.500/10' : 'gray.900',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left',
                          _hover: {
                            borderColor: 'green.500',
                            bg: 'green.500/5',
                          },
                        })}
                      >
                        <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                          {industry.label}
                        </span>
                        <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          {industry.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jurisdiction</CardTitle>
                  <CardDescription>Select applicable privacy laws</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                    {JURISDICTIONS.map((jurisdiction) => (
                      <button
                        key={jurisdiction.id}
                        type="button"
                        onClick={() => toggleJurisdiction(jurisdiction.id as JurisdictionType)}
                        disabled={jurisdiction.required}
                        className={css({
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                          p: '3',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: options.jurisdiction.includes(
                            jurisdiction.id as JurisdictionType
                          )
                            ? 'green.500'
                            : 'gray.800',
                          bg: options.jurisdiction.includes(jurisdiction.id as JurisdictionType)
                            ? 'green.500/10'
                            : 'gray.900',
                          cursor: jurisdiction.required ? 'not-allowed' : 'pointer',
                          opacity: jurisdiction.required ? 0.6 : 1,
                          transition: 'all 0.2s',
                          textAlign: 'left',
                          _hover: !jurisdiction.required
                            ? {
                                borderColor: 'green.500',
                                bg: 'green.500/5',
                              }
                            : undefined,
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            w: 'full',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {jurisdiction.label}
                          </span>
                          {options.jurisdiction.includes(jurisdiction.id as JurisdictionType) && (
                            <Check
                              className={css({ w: '4', h: '4', color: 'green.400', ml: 'auto' })}
                            />
                          )}
                        </div>
                        <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          {jurisdiction.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optional Sections */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Sections</CardTitle>
                  <CardDescription>Customize your policy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                    {[
                      { key: 'includeAnalytics', label: 'Analytics & Tracking' },
                      { key: 'includeCookies', label: 'Cookies Usage' },
                      { key: 'includeThirdPartyServices', label: 'Third-Party Integrations' },
                      { key: 'includeDataRetention', label: 'Data Retention Policy' },
                      { key: 'includeChildrenPrivacy', label: "Children's Privacy (COPPA)" },
                    ].map((option) => (
                      <label
                        key={option.key}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          cursor: 'pointer',
                        })}
                      >
                        <input
                          type="checkbox"
                          checked={options[option.key as keyof TemplateOptions] as boolean}
                          onChange={(e) => {
                            setOptions((prev) => ({ ...prev, [option.key]: e.target.checked }))
                            trackToolEvent('privacy_policy_option_toggle', { option: option.key })
                          }}
                          className={css({
                            w: '4',
                            h: '4',
                            rounded: 'sm',
                            cursor: 'pointer',
                          })}
                        />
                        <span className={css({ fontSize: 'sm' })}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right Panel - Preview */}
        <Card>
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                flexWrap: 'wrap',
                gap: '4',
              })}
            >
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {canGenerate
                    ? 'Your generated document'
                    : 'Fill in the required fields to generate'}
                </CardDescription>
              </div>
              {canGenerate && (
                <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                    Copy
                  </Button>
                  <Button onClick={handleDownloadHTML} variant="outline" size="sm">
                    <Download className={css({ w: '4', h: '4', mr: '2' })} />
                    HTML
                  </Button>
                  <Button onClick={handleDownloadPDF} size="sm">
                    <Download className={css({ w: '4', h: '4', mr: '2' })} />
                    PDF
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                p: '6',
                bg: 'gray.900',
                rounded: 'lg',
                minH: '600px',
                maxH: '800px',
                overflow: 'auto',
                fontFamily: 'system-ui',
                fontSize: 'sm',
                lineHeight: '1.8',
              })}
            >
              {canGenerate ? (
                <div
                  className={css({
                    '& h1': { fontSize: '2xl', fontWeight: 'bold', mb: '4' },
                    '& h2': {
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      mt: '6',
                      mb: '3',
                      borderBottom: '2px solid',
                      borderColor: 'green.500',
                      pb: '2',
                    },
                    '& h3': { fontSize: 'lg', fontWeight: 'semibold', mt: '4', mb: '2' },
                    '& p': { mb: '3', color: 'gray.300' },
                    '& ul, & ol': { mb: '3', pl: '6' },
                    '& li': { mb: '1', color: 'gray.300' },
                    '& strong': { fontWeight: 'semibold', color: 'white' },
                  })}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown conversion for preview only
                  dangerouslySetInnerHTML={{
                    __html: generatedDocument
                      .split('\n')
                      .map((line) => {
                        if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`
                        if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`
                        if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`
                        if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`
                        }
                        if (line.trim() === '') return '<br>'
                        if (line.startsWith('|')) return `<pre>${line}</pre>`
                        return `<p>${line}</p>`
                      })
                      .join('\n'),
                  }}
                />
              ) : (
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minH: '500px',
                    textAlign: 'center',
                    color: 'gray.500',
                  })}
                >
                  <Shield className={css({ w: '16', h: '16', mb: '4', opacity: 0.3 })} />
                  <p className={css({ fontSize: 'lg', fontWeight: 'medium', mb: '2' })}>
                    Fill in the required fields
                  </p>
                  <p className={css({ fontSize: 'sm' })}>
                    Enter your company information to generate a professional legal document
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Important Legal Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'yellow.400' })}>
                Legal Disclaimer
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                This tool generates template documents for informational purposes only. It does not
                constitute legal advice. Consult with a qualified attorney before using these
                documents.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'green.400' })}>
                Customization
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Review and modify the generated document to match your specific business practices
                and requirements. Every business is unique.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'blue.400' })}>
                Regular Updates
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Privacy laws change frequently. Review and update your privacy policy regularly to
                ensure continued compliance with current regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
