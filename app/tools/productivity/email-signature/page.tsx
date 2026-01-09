'use client'

import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Github,
  Globe,
  Image,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Palette,
  Phone,
  RotateCcw,
  Smartphone,
  Sparkles,
  Twitter,
  User,
  Youtube,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  defaultSignatureData,
  defaultSignatureStyle,
  fontFamilies,
  generateSignatureHtml,
  generateSignaturePlainText,
  type SignatureData,
  type SignatureStyle,
  type TemplateType,
  templatePresets,
  validateSignatureData,
} from './utils'

const STORAGE_KEY = 'email-signature-data'
const STYLE_STORAGE_KEY = 'email-signature-style'

export default function EmailSignatureGenerator() {
  const [data, setData] = useState<SignatureData>(defaultSignatureData)
  const [style, setStyle] = useState<SignatureStyle>(defaultSignatureStyle)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    contact: true,
    social: false,
    branding: false,
    style: false,
    additional: false,
  })

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      const savedStyle = localStorage.getItem(STYLE_STORAGE_KEY)
      if (savedData) {
        setData({ ...defaultSignatureData, ...JSON.parse(savedData) })
      }
      if (savedStyle) {
        setStyle({ ...defaultSignatureStyle, ...JSON.parse(savedStyle) })
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(style))
    } catch {
      // Ignore localStorage errors
    }
  }, [data, style])

  // Generate HTML signature
  const signatureHtml = useMemo(() => generateSignatureHtml(data, style), [data, style])

  // Generate plain text signature
  const signaturePlainText = useMemo(() => generateSignaturePlainText(data), [data])

  // Validation
  const validation = useMemo(() => validateSignatureData(data), [data])

  const updateData = useCallback((field: keyof SignatureData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateStyle = useCallback(
    <K extends keyof SignatureStyle>(field: K, value: SignatureStyle[K]) => {
      setStyle((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const applyTemplate = useCallback((template: TemplateType) => {
    const preset = templatePresets[template]
    setStyle((prev) => ({ ...prev, ...preset.style, template }))
    trackToolEvent('email_signature_template', { template })
    toast.success(`Applied ${preset.name} template`)
  }, [])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const copyToClipboard = useCallback(
    async (type: 'html' | 'text') => {
      try {
        const content = type === 'html' ? signatureHtml : signaturePlainText
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        trackToolEvent('email_signature_copy', { format: type })
        toast.success(`${type === 'html' ? 'HTML' : 'Plain text'} signature copied to clipboard`)
      } catch {
        toast.error('Failed to copy to clipboard')
      }
    },
    [signatureHtml, signaturePlainText]
  )

  const downloadSignature = useCallback(
    (type: 'html' | 'text') => {
      const content = type === 'html' ? signatureHtml : signaturePlainText
      const filename = type === 'html' ? 'email-signature.html' : 'email-signature.txt'
      const mimeType = type === 'html' ? 'text/html' : 'text/plain'

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      trackToolEvent('email_signature_download', { format: type })
      toast.success(`Downloaded ${filename}`)
    },
    [signatureHtml, signaturePlainText]
  )

  const resetSignature = useCallback(() => {
    setData(defaultSignatureData)
    setStyle(defaultSignatureStyle)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STYLE_STORAGE_KEY)
    trackToolEvent('email_signature_reset', {})
    toast.success('Signature reset to defaults')
  }, [])

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode
  ) => (
    <Card
      className={css({
        bg: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        mb: '4',
      })}
    >
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className={css({
          w: 'full',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '4',
          cursor: 'pointer',
          bg: 'transparent',
          border: 'none',
          color: 'inherit',
          textAlign: 'left',
          '&:hover': { bg: 'rgba(255, 255, 255, 0.02)' },
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <span className={css({ color: 'purple.400' })}>{icon}</span>
          <span className={css({ fontWeight: '600', fontSize: 'md' })}>{title}</span>
        </div>
        {expandedSections[id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expandedSections[id] && (
        <CardContent className={css({ pt: '0', pb: '4', px: '4' })}>{children}</CardContent>
      )}
    </Card>
  )

  const renderInput = (
    label: string,
    field: keyof SignatureData,
    placeholder: string,
    type: 'text' | 'email' | 'url' | 'tel' = 'text',
    icon?: React.ReactNode
  ) => (
    <div className={css({ mb: '3' })}>
      <Label
        className={css({
          fontSize: 'sm',
          mb: '1',
          display: 'flex',
          alignItems: 'center',
          gap: '2',
        })}
      >
        {icon}
        {label}
      </Label>
      <Input
        type={type}
        value={data[field]}
        onChange={(e) => updateData(field, e.target.value)}
        placeholder={placeholder}
        className={css({
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          '&:focus': { borderColor: 'purple.500' },
        })}
      />
    </div>
  )

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
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
          })}
        >
          <div
            className={css({
              p: '3',
              rounded: 'xl',
              bg: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid rgba(147, 51, 234, 0.3)',
            })}
          >
            <Mail className={css({ w: '8', h: '8', color: 'purple.400' })} />
          </div>
          <h1
            className={css({
              fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientTo: 'pink.400',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Email Signature Generator
          </h1>
        </div>
        <p
          className={css({
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
            fontSize: { base: 'sm', md: 'md' },
          })}
        >
          Create professional HTML email signatures with customizable templates, social icons, and
          branding options. Works with Gmail, Outlook, Apple Mail, and more.
        </p>
        <div
          className={css({ display: 'flex', gap: '2', justifyContent: 'center', flexWrap: 'wrap' })}
        >
          <Badge variant="outline">Free</Badge>
          <Badge variant="outline">No Sign-up</Badge>
          <Badge variant="outline">HTML & Plain Text</Badge>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: '6',
        })}
      >
        {/* Editor Panel */}
        <div className={css({ spaceY: '4' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '2',
            })}
          >
            <h2 className={css({ fontSize: 'lg', fontWeight: '600' })}>Signature Details</h2>
            <Button variant="ghost" size="sm" onClick={resetSignature}>
              <RotateCcw size={16} className={css({ mr: '1' })} />
              Reset
            </Button>
          </div>

          {/* Personal Info */}
          {renderSection(
            'personal',
            'Personal Information',
            <User size={20} />,
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '3',
              })}
            >
              <div className={css({ gridColumn: { sm: 'span 2' } })}>
                {renderInput('Full Name *', 'fullName', 'John Doe', 'text', <User size={14} />)}
              </div>
              {renderInput('Job Title', 'jobTitle', 'Senior Developer', 'text')}
              {renderInput('Pronouns', 'pronouns', 'he/him', 'text')}
              {renderInput('Company', 'company', 'Acme Inc.', 'text', <Building2 size={14} />)}
              {renderInput('Department', 'department', 'Engineering', 'text')}
            </div>
          )}

          {/* Contact Info */}
          {renderSection(
            'contact',
            'Contact Information',
            <Phone size={20} />,
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '3',
              })}
            >
              {renderInput('Email', 'email', 'john@example.com', 'email', <Mail size={14} />)}
              {renderInput('Phone', 'phone', '+1 (555) 123-4567', 'tel', <Phone size={14} />)}
              {renderInput(
                'Mobile',
                'mobile',
                '+1 (555) 987-6543',
                'tel',
                <Smartphone size={14} />
              )}
              {renderInput('Website', 'website', 'www.example.com', 'url', <Globe size={14} />)}
              <div className={css({ gridColumn: { sm: 'span 2' } })}>
                {renderInput('Calendly/Meeting Link', 'calendlyUrl', 'calendly.com/johndoe', 'url')}
              </div>
            </div>
          )}

          {/* Address */}
          {renderSection(
            'address',
            'Address',
            <MapPin size={20} />,
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '3',
              })}
            >
              <div className={css({ gridColumn: { sm: 'span 2' } })}>
                {renderInput('Street Address', 'address', '123 Main Street', 'text')}
              </div>
              {renderInput('City', 'city', 'San Francisco', 'text')}
              {renderInput('State/Province', 'state', 'CA', 'text')}
              {renderInput('ZIP/Postal Code', 'zipCode', '94102', 'text')}
              {renderInput('Country', 'country', 'USA', 'text')}
            </div>
          )}

          {/* Social Links */}
          {renderSection(
            'social',
            'Social Media',
            <Linkedin size={20} />,
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '3',
              })}
            >
              {renderInput(
                'LinkedIn',
                'linkedin',
                'johndoe or full URL',
                'text',
                <Linkedin size={14} />
              )}
              {renderInput('Twitter/X', 'twitter', '@johndoe', 'text', <Twitter size={14} />)}
              {renderInput('GitHub', 'github', 'johndoe', 'text', <Github size={14} />)}
              {renderInput('Instagram', 'instagram', '@johndoe', 'text', <Instagram size={14} />)}
              {renderInput('YouTube', 'youtube', '@johndoe', 'text', <Youtube size={14} />)}
              {renderInput('Facebook', 'facebook', 'johndoe', 'text')}
            </div>
          )}

          {/* Branding */}
          {renderSection(
            'branding',
            'Images & Branding',
            <Image size={20} />,
            <div className={css({ spaceY: '3' })}>
              {renderInput('Profile Image URL', 'profileImageUrl', 'https://...', 'url')}
              {renderInput('Company Logo URL', 'logoUrl', 'https://...', 'url')}
              {renderInput('Banner Image URL', 'bannerUrl', 'https://...', 'url')}
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                Tip: Use HTTPS URLs for images. Recommended sizes: Profile 150x150px, Logo 200x60px
              </p>
            </div>
          )}

          {/* Style Options */}
          {renderSection(
            'style',
            'Style & Layout',
            <Palette size={20} />,
            <div className={css({ spaceY: '4' })}>
              {/* Template Selection */}
              <div>
                <Label className={css({ fontSize: 'sm', mb: '2', display: 'block' })}>
                  Template
                </Label>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: '2',
                  })}
                >
                  {(Object.keys(templatePresets) as TemplateType[]).map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className={css({
                        p: '3',
                        rounded: 'lg',
                        border: '2px solid',
                        borderColor:
                          style.template === template ? 'purple.500' : 'rgba(255, 255, 255, 0.1)',
                        bg:
                          style.template === template
                            ? 'rgba(147, 51, 234, 0.1)'
                            : 'rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'purple.400',
                          bg: 'rgba(147, 51, 234, 0.05)',
                        },
                      })}
                    >
                      <div className={css({ fontSize: 'sm', fontWeight: '500' })}>
                        {templatePresets[template].name}
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {templatePresets[template].description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Primary Color
                  </Label>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <input
                      type="color"
                      value={style.primaryColor}
                      onChange={(e) => updateStyle('primaryColor', e.target.value)}
                      className={css({
                        w: '10',
                        h: '10',
                        rounded: 'lg',
                        border: 'none',
                        cursor: 'pointer',
                      })}
                    />
                    <Input
                      value={style.primaryColor}
                      onChange={(e) => updateStyle('primaryColor', e.target.value)}
                      className={css({ flex: '1' })}
                    />
                  </div>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Secondary Color
                  </Label>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <input
                      type="color"
                      value={style.secondaryColor}
                      onChange={(e) => updateStyle('secondaryColor', e.target.value)}
                      className={css({
                        w: '10',
                        h: '10',
                        rounded: 'lg',
                        border: 'none',
                        cursor: 'pointer',
                      })}
                    />
                    <Input
                      value={style.secondaryColor}
                      onChange={(e) => updateStyle('secondaryColor', e.target.value)}
                      className={css({ flex: '1' })}
                    />
                  </div>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Text Color
                  </Label>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <input
                      type="color"
                      value={style.textColor}
                      onChange={(e) => updateStyle('textColor', e.target.value)}
                      className={css({
                        w: '10',
                        h: '10',
                        rounded: 'lg',
                        border: 'none',
                        cursor: 'pointer',
                      })}
                    />
                    <Input
                      value={style.textColor}
                      onChange={(e) => updateStyle('textColor', e.target.value)}
                      className={css({ flex: '1' })}
                    />
                  </div>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Link Color
                  </Label>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <input
                      type="color"
                      value={style.linkColor}
                      onChange={(e) => updateStyle('linkColor', e.target.value)}
                      className={css({
                        w: '10',
                        h: '10',
                        rounded: 'lg',
                        border: 'none',
                        cursor: 'pointer',
                      })}
                    />
                    <Input
                      value={style.linkColor}
                      onChange={(e) => updateStyle('linkColor', e.target.value)}
                      className={css({ flex: '1' })}
                    />
                  </div>
                </div>
              </div>

              {/* Layout Options */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Layout
                  </Label>
                  <select
                    value={style.layout}
                    onChange={(e) =>
                      updateStyle('layout', e.target.value as SignatureStyle['layout'])
                    }
                    className={css({
                      w: 'full',
                      p: '2',
                      rounded: 'md',
                      bg: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'inherit',
                    })}
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Font Family
                  </Label>
                  <select
                    value={style.fontFamily}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                    className={css({
                      w: 'full',
                      p: '2',
                      rounded: 'md',
                      bg: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'inherit',
                    })}
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Font Size: {style.fontSize}px
                  </Label>
                  <input
                    type="range"
                    min="10"
                    max="18"
                    value={style.fontSize}
                    onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                    className={css({ w: 'full' })}
                  />
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Image Size: {style.imageSize}px
                  </Label>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    value={style.imageSize}
                    onChange={(e) => updateStyle('imageSize', Number(e.target.value))}
                    className={css({ w: 'full' })}
                  />
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Image Shape
                  </Label>
                  <select
                    value={style.imageShape}
                    onChange={(e) =>
                      updateStyle('imageShape', e.target.value as SignatureStyle['imageShape'])
                    }
                    className={css({
                      w: 'full',
                      p: '2',
                      rounded: 'md',
                      bg: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'inherit',
                    })}
                  >
                    <option value="circle">Circle</option>
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Divider Style
                  </Label>
                  <select
                    value={style.dividerStyle}
                    onChange={(e) =>
                      updateStyle('dividerStyle', e.target.value as SignatureStyle['dividerStyle'])
                    }
                    className={css({
                      w: 'full',
                      p: '2',
                      rounded: 'md',
                      bg: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'inherit',
                    })}
                  >
                    <option value="line">Line</option>
                    <option value="dots">Dots</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                    Social Icon Style
                  </Label>
                  <select
                    value={style.socialIconStyle}
                    onChange={(e) =>
                      updateStyle(
                        'socialIconStyle',
                        e.target.value as SignatureStyle['socialIconStyle']
                      )
                    }
                    className={css({
                      w: 'full',
                      p: '2',
                      rounded: 'md',
                      bg: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'inherit',
                    })}
                  >
                    <option value="colored">Colored</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="rounded">Rounded Background</option>
                  </select>
                </div>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <input
                    type="checkbox"
                    id="showSocialIcons"
                    checked={style.showSocialIcons}
                    onChange={(e) => updateStyle('showSocialIcons', e.target.checked)}
                  />
                  <Label htmlFor="showSocialIcons" className={css({ fontSize: 'sm' })}>
                    Show Social Icons
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Additional */}
          {renderSection(
            'additional',
            'Additional Fields',
            <FileText size={20} />,
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                {renderInput('Custom Field 1 Label', 'customField1Label', 'e.g., License #')}
                {renderInput('Custom Field 1 Value', 'customField1Value', 'e.g., ABC123')}
                {renderInput('Custom Field 2 Label', 'customField2Label', 'e.g., Booking')}
                {renderInput('Custom Field 2 Value', 'customField2Value', 'e.g., Link or text')}
              </div>
              <div>
                <Label className={css({ fontSize: 'sm', mb: '1', display: 'block' })}>
                  Disclaimer / Legal Text
                </Label>
                <Textarea
                  value={data.disclaimer}
                  onChange={(e) => updateData('disclaimer', e.target.value)}
                  placeholder="This email and any attachments are confidential..."
                  rows={3}
                  className={css({
                    bg: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className={css({ spaceY: '4' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '2',
            })}
          >
            <h2 className={css({ fontSize: 'lg', fontWeight: '600' })}>Preview</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className={css({ ml: '1' })}>{showPreview ? 'Hide' : 'Show'}</span>
            </Button>
          </div>

          {/* Validation Errors */}
          {!validation.valid && (
            <Card
              className={css({
                bg: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'red.500/30',
                mb: '4',
              })}
            >
              <CardContent className={css({ py: '3' })}>
                <div className={css({ fontSize: 'sm', color: 'red.400' })}>
                  {validation.errors.map((error, idx) => (
                    <div key={idx}>• {error}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Preview */}
          {showPreview && (
            <Card
              className={css({
                bg: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              })}
            >
              <CardHeader className={css({ py: '3', bg: 'gray.100' })}>
                <CardTitle className={css({ fontSize: 'sm', color: 'gray.600' })}>
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent className={css({ p: '4', bg: 'white' })}>
                <div
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Email signature HTML preview for user to verify
                  dangerouslySetInnerHTML={{ __html: signatureHtml }}
                  className={css({ color: 'gray.900' })}
                />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ fontSize: 'md' })}>Export Signature</CardTitle>
              <CardDescription>Copy or download your email signature</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '3',
                })}
              >
                <Button
                  onClick={() => copyToClipboard('html')}
                  className={css({
                    bg: 'linear-gradient(135deg, #9333ea, #ec4899)',
                    color: 'white',
                    '&:hover': { opacity: 0.9 },
                  })}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className={css({ ml: '2' })}>Copy HTML</span>
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard('text')}>
                  <Copy size={16} />
                  <span className={css({ ml: '2' })}>Copy Plain Text</span>
                </Button>
                <Button variant="outline" onClick={() => downloadSignature('html')}>
                  <Download size={16} />
                  <span className={css({ ml: '2' })}>Download HTML</span>
                </Button>
                <Button variant="outline" onClick={() => downloadSignature('text')}>
                  <Download size={16} />
                  <span className={css({ ml: '2' })}>Download Text</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({ fontSize: 'md', display: 'flex', alignItems: 'center', gap: '2' })}
              >
                <Sparkles size={18} className={css({ color: 'purple.400' })} />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol
                className={css({
                  listStyleType: 'decimal',
                  pl: '4',
                  spaceY: '2',
                  fontSize: 'sm',
                  color: 'gray.400',
                })}
              >
                <li>Fill in your details in the form on the left</li>
                <li>Choose a template and customize colors/layout</li>
                <li>Click "Copy HTML" to copy the signature</li>
                <li>
                  <strong>Gmail:</strong> Settings → See all settings → Signature → Paste
                </li>
                <li>
                  <strong>Outlook:</strong> Settings → Mail → Compose → Signature → Paste
                </li>
                <li>
                  <strong>Apple Mail:</strong> Preferences → Signatures → Create new → Paste
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Tool Rating */}
          <ToolRating toolId="email-signature" toolName="Email Signature Generator" />

          {/* Social Share */}
          <SocialShare
            toolName="Email Signature Generator"
            toolUrl="https://supertool.dev/tools/productivity/email-signature"
            description="Create professional HTML email signatures with customizable templates"
            hashtags={['emailsignature', 'productivity', 'devtools']}
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className={css({ mt: '10' })}>
        <h2
          className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            mb: '6',
            textAlign: 'center',
          })}
        >
          Frequently Asked Questions
        </h2>
        <FAQAccordion
          faqs={[
            {
              question: 'How do I add my email signature to Gmail?',
              answer:
                'Open Gmail Settings (gear icon) → Click "See all settings" → Scroll to "Signature" section → Click "Create new" → Paste the copied HTML signature → Save changes.',
            },
            {
              question: 'How do I add my signature to Outlook?',
              answer:
                'In Outlook.com: Settings → View all Outlook settings → Mail → Compose and reply → Email signature → Paste your signature. For desktop Outlook: File → Options → Mail → Signatures.',
            },
            {
              question: 'Why are my images not showing?',
              answer:
                'Images must be hosted on a publicly accessible HTTPS URL. Use image hosting services like Imgur, Google Drive (with public link), or your company website. Local file paths will not work.',
            },
            {
              question: 'Can I use my own fonts?',
              answer:
                'Email clients have limited font support. We provide web-safe fonts that work across all email clients. Custom fonts may not display correctly in all email applications.',
            },
            {
              question: 'Why does my signature look different in some email clients?',
              answer:
                'Different email clients render HTML differently. Our signatures are optimized for maximum compatibility, but some variations may occur. The table-based layout ensures the best cross-client support.',
            },
            {
              question: 'Is my data saved?',
              answer:
                'Yes, your signature data is saved locally in your browser. It never leaves your device and is not sent to any server. Your information is 100% private.',
            },
          ]}
        />
      </div>

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/productivity/email-signature" category="productivity" />
    </main>
  )
}
