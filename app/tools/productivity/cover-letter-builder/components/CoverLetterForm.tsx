// Cover Letter Form Component
// Form for editing all cover letter fields

'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { css } from '@/styled-system/css'
import type { CoverLetterData, LetterContent, PersonalInfo, RecipientInfo } from '../types'
import { generateSampleContent, getDefaultSalutation } from '../utils'

interface CoverLetterFormProps {
  data: CoverLetterData
  onChange: (data: CoverLetterData) => void
}

export function CoverLetterForm({ data, onChange }: CoverLetterFormProps) {
  // Update personal info
  const handlePersonalChange = useCallback(
    (field: keyof PersonalInfo, value: string) => {
      onChange({
        ...data,
        personal: { ...data.personal, [field]: value },
        updatedAt: new Date().toISOString(),
      })
    },
    [data, onChange]
  )

  // Update recipient info
  const handleRecipientChange = useCallback(
    (field: keyof RecipientInfo, value: string) => {
      const newData = {
        ...data,
        recipient: { ...data.recipient, [field]: value },
        updatedAt: new Date().toISOString(),
      }

      // Auto-update salutation when hiring manager name changes
      if (field === 'hiringManagerName') {
        newData.salutation = getDefaultSalutation(value)
      }

      onChange(newData)
    },
    [data, onChange]
  )

  // Update letter content
  const handleContentChange = useCallback(
    (field: keyof LetterContent, value: string) => {
      onChange({
        ...data,
        content: { ...data.content, [field]: value },
        updatedAt: new Date().toISOString(),
      })
    },
    [data, onChange]
  )

  // Generate sample content
  const handleGenerateSample = useCallback(() => {
    if (!data.position || !data.recipient.companyName) {
      alert('Please enter a position and company name first')
      return
    }

    const sample = generateSampleContent(data.position, data.recipient.companyName)
    onChange({
      ...data,
      content: sample,
      updatedAt: new Date().toISOString(),
    })
  }, [data, onChange])

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        h: 'full',
        overflowY: 'auto',
        pb: '4',
      })}
    >
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={data.personal.fullName}
              onChange={(e) => handlePersonalChange('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={data.personal.email}
                onChange={(e) => handlePersonalChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={data.personal.phone}
                onChange={(e) => handlePersonalChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.personal.location}
              onChange={(e) => handlePersonalChange('location', e.target.value)}
              placeholder="New York, NY"
            />
          </div>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <Label htmlFor="linkedin">LinkedIn (optional)</Label>
              <Input
                id="linkedin"
                value={data.personal.linkedin || ''}
                onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio (optional)</Label>
              <Input
                id="portfolio"
                value={data.personal.portfolio || ''}
                onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                placeholder="johndoe.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Recipient Information</CardTitle>
          <CardDescription>Company and hiring manager details</CardDescription>
        </CardHeader>
        <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={data.recipient.companyName}
              onChange={(e) => handleRecipientChange('companyName', e.target.value)}
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <Label htmlFor="position">Position Applying For *</Label>
            <Input
              id="position"
              value={data.position}
              onChange={(e) =>
                onChange({ ...data, position: e.target.value, updatedAt: new Date().toISOString() })
              }
              placeholder="Senior Software Engineer"
            />
          </div>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <Label htmlFor="hiringManagerName">Hiring Manager Name</Label>
              <Input
                id="hiringManagerName"
                value={data.recipient.hiringManagerName || ''}
                onChange={(e) => handleRecipientChange('hiringManagerName', e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="hiringManagerTitle">Manager Title</Label>
              <Input
                id="hiringManagerTitle"
                value={data.recipient.hiringManagerTitle || ''}
                onChange={(e) => handleRecipientChange('hiringManagerTitle', e.target.value)}
                placeholder="Engineering Manager"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="department">Department (optional)</Label>
            <Input
              id="department"
              value={data.recipient.department || ''}
              onChange={(e) => handleRecipientChange('department', e.target.value)}
              placeholder="Engineering Department"
            />
          </div>
        </CardContent>
      </Card>

      {/* Letter Content */}
      <Card>
        <CardHeader>
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            })}
          >
            <div>
              <CardTitle>Letter Content</CardTitle>
              <CardDescription>Write your cover letter</CardDescription>
            </div>
            <button
              type="button"
              onClick={handleGenerateSample}
              className={css({
                px: '3',
                py: '1',
                fontSize: 'xs',
                bg: 'blue.500',
                color: 'white',
                rounded: 'md',
                cursor: 'pointer',
                _hover: { bg: 'blue.600' },
              })}
            >
              Generate Sample
            </button>
          </div>
        </CardHeader>
        <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
          <div>
            <Label htmlFor="opening">Opening Paragraph *</Label>
            <Textarea
              id="opening"
              value={data.content.opening}
              onChange={(e) => handleContentChange('opening', e.target.value)}
              placeholder="Introduce yourself and state your interest in the position..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="body">Body (2-3 paragraphs) *</Label>
            <Textarea
              id="body"
              value={data.content.body}
              onChange={(e) => handleContentChange('body', e.target.value)}
              placeholder="Describe your relevant experience, skills, and achievements..."
              rows={8}
            />
          </div>
          <div>
            <Label htmlFor="closing">Closing Paragraph *</Label>
            <Textarea
              id="closing"
              value={data.content.closing}
              onChange={(e) => handleContentChange('closing', e.target.value)}
              placeholder="Express enthusiasm and summarize your fit..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="callToAction">Call to Action</Label>
            <Textarea
              id="callToAction"
              value={data.content.callToAction}
              onChange={(e) => handleContentChange('callToAction', e.target.value)}
              placeholder="Request an interview or next steps..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Letter Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Letter Settings</CardTitle>
          <CardDescription>Salutation and signature</CardDescription>
        </CardHeader>
        <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
          <div>
            <Label htmlFor="salutation">Salutation</Label>
            <select
              id="salutation"
              value={data.salutation}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange({
                  ...data,
                  salutation: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'gray.700',
                rounded: 'md',
                bg: 'gray.900',
                color: 'gray.50',
                cursor: 'pointer',
                _focus: { outline: 'none', borderColor: 'blue.500' },
              })}
            >
              <option value="Dear Hiring Manager">Dear Hiring Manager</option>
              <option value="Dear Hiring Team">Dear Hiring Team</option>
              <option value="To Whom It May Concern">To Whom It May Concern</option>
              {data.recipient.hiringManagerName && (
                <option value={getDefaultSalutation(data.recipient.hiringManagerName)}>
                  {getDefaultSalutation(data.recipient.hiringManagerName)}
                </option>
              )}
            </select>
          </div>
          <div>
            <Label htmlFor="signature">Closing Signature</Label>
            <select
              id="signature"
              value={data.signature}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange({
                  ...data,
                  signature: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'gray.700',
                rounded: 'md',
                bg: 'gray.900',
                color: 'gray.50',
                cursor: 'pointer',
                _focus: { outline: 'none', borderColor: 'blue.500' },
              })}
            >
              <option value="Sincerely">Sincerely</option>
              <option value="Best regards">Best regards</option>
              <option value="Kind regards">Kind regards</option>
              <option value="Respectfully">Respectfully</option>
              <option value="Warm regards">Warm regards</option>
            </select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) =>
                onChange({ ...data, date: e.target.value, updatedAt: new Date().toISOString() })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
