'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Heart,
  HelpCircle,
  Mail,
  MessageSquare,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  TOOL_COLORS,
  ToolMobilePicker,
  type ToolOperation,
  ToolOperationGrid,
} from '@/components/features/tool-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Types
type EmailTone = 'formal' | 'professional' | 'friendly' | 'casual'
type TemplateCategory =
  | 'follow-up'
  | 'introduction'
  | 'thank-you'
  | 'rejection'
  | 'inquiry'
  | 'custom'

interface EmailTemplate {
  id: string
  name: string
  category: TemplateCategory
  subject: string
  body: string
  tone: EmailTone
  isCustom?: boolean
  createdAt?: number
}

interface TemplateVariable {
  key: string
  label: string
  placeholder: string
}

// Common variables for templates
const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: '{{name}}', label: 'Recipient Name', placeholder: 'John Doe' },
  { key: '{{company}}', label: 'Company Name', placeholder: 'Acme Inc.' },
  { key: '{{date}}', label: 'Date', placeholder: new Date().toLocaleDateString() },
  { key: '{{position}}', label: 'Position/Role', placeholder: 'Marketing Manager' },
  { key: '{{sender}}', label: 'Your Name', placeholder: 'Jane Smith' },
  { key: '{{email}}', label: 'Your Email', placeholder: 'jane@example.com' },
  { key: '{{phone}}', label: 'Your Phone', placeholder: '+1 234 567 8900' },
]

// Pre-built templates
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'follow-up-1',
    name: 'Job Application Follow-up',
    category: 'follow-up',
    subject: 'Following Up on My Application - {{position}}',
    body: `Dear {{name}},

I hope this email finds you well. I wanted to follow up on my application for the {{position}} position at {{company}} that I submitted on {{date}}.

I remain very enthusiastic about the opportunity to join your team and contribute to {{company}}'s success. I believe my skills and experience align well with what you're looking for.

Please let me know if you need any additional information from my side. I would welcome the chance to discuss how I can add value to your organization.

Thank you for your time and consideration.

Best regards,
{{sender}}
{{email}}
{{phone}}`,
    tone: 'professional',
  },
  {
    id: 'follow-up-2',
    name: 'Meeting Follow-up',
    category: 'follow-up',
    subject: 'Great Meeting Today - Next Steps',
    body: `Hi {{name}},

Thank you for taking the time to meet with me today. I really enjoyed our conversation about {{company}} and the exciting projects you're working on.

As discussed, here are the next steps:
- [Action item 1]
- [Action item 2]
- [Action item 3]

I'll follow up on these items and send you an update by {{date}}.

Looking forward to our continued collaboration!

Best,
{{sender}}`,
    tone: 'professional',
  },
  {
    id: 'introduction-1',
    name: 'Professional Introduction',
    category: 'introduction',
    subject: 'Introduction - {{sender}} from {{company}}',
    body: `Dear {{name}},

I hope this message finds you well. My name is {{sender}}, and I'm reaching out from {{company}}.

I came across your work in [industry/field] and was impressed by [specific achievement or project]. I believe there could be some great synergies between what we're doing at {{company}} and your expertise.

I would love to schedule a brief call to introduce myself properly and explore potential collaboration opportunities.

Would you be available for a 15-minute call sometime next week?

Looking forward to connecting with you.

Best regards,
{{sender}}
{{position}}
{{company}}
{{email}}`,
    tone: 'professional',
  },
  {
    id: 'introduction-2',
    name: 'Networking Introduction',
    category: 'introduction',
    subject: 'Connecting from [Event/Platform]',
    body: `Hi {{name}},

I hope you're having a great day! My name is {{sender}}, and I wanted to reach out after [meeting you at / seeing your profile on] [event/platform].

Your work on [specific project or achievement] really caught my attention, and I'd love to learn more about your journey and experiences.

Would you be open to grabbing a virtual coffee sometime? I'm flexible with timing and happy to work around your schedule.

Looking forward to connecting!

Cheers,
{{sender}}`,
    tone: 'friendly',
  },
  {
    id: 'thank-you-1',
    name: 'Interview Thank You',
    category: 'thank-you',
    subject: 'Thank You for the Interview - {{position}}',
    body: `Dear {{name}},

Thank you so much for taking the time to interview me for the {{position}} position at {{company}} today.

I truly enjoyed learning more about the role and the team. Our conversation reinforced my enthusiasm for this opportunity, and I'm even more excited about the possibility of contributing to {{company}}.

I was particularly interested in [specific topic discussed]. It aligns perfectly with my experience in [relevant skill/experience], and I'm confident I could make meaningful contributions from day one.

Thank you again for this opportunity. Please don't hesitate to reach out if you need any additional information.

Best regards,
{{sender}}
{{email}}
{{phone}}`,
    tone: 'professional',
  },
  {
    id: 'thank-you-2',
    name: 'Client Thank You',
    category: 'thank-you',
    subject: 'Thank You for Your Business',
    body: `Dear {{name}},

I wanted to take a moment to express my sincere gratitude for choosing {{company}} for your [product/service] needs.

Your trust in our team means the world to us, and we're committed to exceeding your expectations. It's clients like you who make our work so rewarding.

If you have any questions, feedback, or need any assistance, please don't hesitate to reach out. We're always here to help.

Thank you again for your business. We look forward to a long and successful partnership!

Warm regards,
{{sender}}
{{position}}
{{company}}`,
    tone: 'professional',
  },
  {
    id: 'rejection-1',
    name: 'Polite Rejection',
    category: 'rejection',
    subject: 'Re: Your Proposal',
    body: `Dear {{name}},

Thank you for reaching out and for your interest in [collaboration/proposal/opportunity].

After careful consideration, I regret to inform you that we won't be able to move forward at this time. This decision was not easy, and it doesn't reflect on the quality of your proposal.

I genuinely appreciate the time and effort you invested in preparing your proposal. If circumstances change in the future, I would be happy to revisit this conversation.

Thank you again for thinking of us. I wish you all the best in your future endeavors.

Best regards,
{{sender}}
{{company}}`,
    tone: 'formal',
  },
  {
    id: 'rejection-2',
    name: 'Job Rejection Response',
    category: 'rejection',
    subject: 'Re: Application for {{position}}',
    body: `Dear {{name}},

Thank you for considering me for the {{position}} role and for informing me of your decision.

While I'm disappointed that I wasn't selected, I appreciate the opportunity to have interviewed with your team at {{company}}. I gained valuable insights about your organization and the industry.

I remain very interested in {{company}} and would welcome the opportunity to be considered for future positions that match my qualifications.

Thank you again for your time and consideration. I wish you and the team continued success.

Best regards,
{{sender}}`,
    tone: 'professional',
  },
  {
    id: 'inquiry-1',
    name: 'Product/Service Inquiry',
    category: 'inquiry',
    subject: 'Inquiry About Your Services',
    body: `Dear {{name}},

I hope this email finds you well. I am reaching out to inquire about [specific product/service] offered by {{company}}.

I am currently looking for [describe what you need], and I believe your [product/service] might be a good fit for our requirements.

Could you please provide more information about:
- Pricing and packages available
- Implementation timeline
- Support and maintenance options

I would also appreciate it if we could schedule a call to discuss our specific needs in more detail.

Thank you for your time, and I look forward to hearing from you.

Best regards,
{{sender}}
{{position}}
{{email}}`,
    tone: 'professional',
  },
  {
    id: 'inquiry-2',
    name: 'Information Request',
    category: 'inquiry',
    subject: 'Request for Information',
    body: `Hi {{name}},

I'm reaching out because I'm interested in learning more about [topic/subject].

I've been researching [area of interest] and came across {{company}}. I have a few questions that I hope you might be able to help with:

1. [Question 1]
2. [Question 2]
3. [Question 3]

Any insights or resources you could share would be greatly appreciated.

Thanks in advance for your help!

Best,
{{sender}}
{{email}}`,
    tone: 'friendly',
  },
]

// Tone adjustments
const TONE_MODIFIERS: Record<EmailTone, { greeting: string; closing: string; style: string }> = {
  formal: {
    greeting: 'Dear',
    closing: 'Yours sincerely,',
    style: 'Uses formal language, proper titles, and structured paragraphs',
  },
  professional: {
    greeting: 'Dear',
    closing: 'Best regards,',
    style: 'Business appropriate, clear and concise, maintains professionalism',
  },
  friendly: {
    greeting: 'Hi',
    closing: 'Best,',
    style: 'Warm and approachable while remaining respectful',
  },
  casual: {
    greeting: 'Hey',
    closing: 'Cheers,',
    style: 'Relaxed and conversational, suitable for familiar contacts',
  },
}

// Category operations for the grid
const CATEGORY_OPERATIONS: ToolOperation[] = [
  {
    id: 'follow-up',
    label: 'Follow-up',
    icon: MessageSquare,
    color: TOOL_COLORS.primary,
    description: 'Check-in emails',
  },
  {
    id: 'introduction',
    label: 'Introduction',
    icon: UserPlus,
    color: TOOL_COLORS.secondary,
    description: 'First contact',
  },
  {
    id: 'thank-you',
    label: 'Thank You',
    icon: Heart,
    color: TOOL_COLORS.error,
    description: 'Gratitude emails',
  },
  {
    id: 'rejection',
    label: 'Rejection',
    icon: X,
    color: TOOL_COLORS.warning,
    description: 'Polite declines',
  },
  {
    id: 'inquiry',
    label: 'Inquiry',
    icon: HelpCircle,
    color: TOOL_COLORS.info,
    description: 'Questions & requests',
  },
  {
    id: 'custom',
    label: 'My Templates',
    icon: Star,
    color: TOOL_COLORS.success,
    description: 'Saved templates',
  },
]

// FAQs for SEO
const faqs = [
  {
    question: 'What types of email templates are available?',
    answer:
      'Our email template builder offers five categories of pre-built templates: Follow-up emails for checking in after meetings or applications, Introduction emails for networking and first contact, Thank You emails for expressing gratitude, Rejection emails for polite declines, and Inquiry emails for questions and information requests. You can also create and save your own custom templates.',
  },
  {
    question: 'How do I use variable placeholders in email templates?',
    answer:
      'Variable placeholders like {{name}}, {{company}}, and {{date}} act as dynamic fields that get replaced with actual values. Simply fill in the variable values in the sidebar, and they will automatically update throughout your email. This saves time when sending similar emails to different recipients.',
  },
  {
    question: 'Can I adjust the tone of my email templates?',
    answer:
      'Yes! Each template can be adjusted between four tone levels: Formal (for official communications), Professional (business appropriate), Friendly (warm but respectful), and Casual (relaxed and conversational). The tone adjuster provides guidance on appropriate greetings, closings, and overall style for each tone level.',
  },
  {
    question: 'Are my custom templates saved permanently?',
    answer:
      "Custom templates are saved to your browser's local storage, meaning they persist between sessions on the same device and browser. However, clearing your browser data will remove them. For permanent storage, we recommend copying your templates to a document or note-taking app as backup.",
  },
  {
    question: 'Can I edit the pre-built email templates?',
    answer:
      'Absolutely! All pre-built templates serve as starting points that you can fully customize. Edit the subject line, body content, or any part of the template directly in the editor. You can then save your modified version as a custom template for future use.',
  },
  {
    question: 'How do I copy my finished email?',
    answer:
      'Once you\'ve customized your template and filled in all variables, click the "Copy to Clipboard" button. This copies the complete email with all placeholders replaced by your actual values. You can then paste it directly into your email client.',
  },
  {
    question: "What's the best way to write a follow-up email?",
    answer:
      'A good follow-up email should be concise, reference your previous interaction, provide value or a clear purpose, and include a specific call to action. Our follow-up templates are designed with these best practices in mind, helping you craft effective follow-ups for various situations like job applications, meetings, or sales outreach.',
  },
  {
    question: 'How do I write a professional rejection email?',
    answer:
      'A professional rejection email should be prompt, gracious, and clear while remaining respectful. Thank the recipient for their time/proposal, clearly but kindly communicate your decision, avoid over-explaining, and leave the door open for future opportunities if appropriate. Our rejection templates help you strike this delicate balance.',
  },
  {
    question: 'Can I use these templates for cold outreach?',
    answer:
      "Yes, our Introduction templates are perfect for cold outreach and networking. They're designed to be engaging without being pushy, establish credibility, and propose clear next steps. Remember to personalize each email with specific details about the recipient to improve response rates.",
  },
  {
    question: 'Is this email template builder free to use?',
    answer:
      'Yes, our email template builder is completely free to use with no registration required. All features including pre-built templates, custom template creation, variable placeholders, and tone adjustment are available at no cost. Your data stays in your browser for privacy.',
  },
]

export default function EmailTemplatesPage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('follow-up')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([])
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [selectedTone, setSelectedTone] = useState<EmailTone>('professional')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [showToneDropdown, setShowToneDropdown] = useState(false)

  // Load custom templates from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('emailTemplates')
      if (stored) {
        try {
          setCustomTemplates(JSON.parse(stored))
        } catch (error) {
          console.error('Failed to load custom templates:', error)
        }
      }
    }
  }, [])

  // Save custom templates to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && customTemplates.length > 0) {
      localStorage.setItem('emailTemplates', JSON.stringify(customTemplates))
    }
  }, [customTemplates])

  // Track page visit
  useEffect(() => {
    trackToolEvent('email_templates_open', {})
  }, [])

  // Get templates for current category
  const templatesForCategory = useMemo(() => {
    if (selectedCategory === 'custom') {
      return customTemplates
    }
    return DEFAULT_TEMPLATES.filter((t) => t.category === selectedCategory)
  }, [selectedCategory, customTemplates])

  // Replace variables in text
  const replaceVariables = useCallback(
    (text: string): string => {
      let result = text
      for (const variable of TEMPLATE_VARIABLES) {
        const value = variableValues[variable.key] || variable.placeholder
        result = result.replace(new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'), value)
      }
      return result
    },
    [variableValues]
  )

  // Get preview text with variables replaced
  const previewSubject = useMemo(
    () => replaceVariables(editedSubject),
    [editedSubject, replaceVariables]
  )
  const previewBody = useMemo(() => replaceVariables(editedBody), [editedBody, replaceVariables])

  // Handle template selection
  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setEditedSubject(template.subject)
    setEditedBody(template.body)
    setSelectedTone(template.tone)
    trackToolEvent('email_templates_select', { category: template.category })
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as TemplateCategory)
    setSelectedTemplate(null)
    setEditedSubject('')
    setEditedBody('')
    trackToolEvent('email_templates_category', { category })
  }

  // Handle copy to clipboard
  const handleCopy = async () => {
    const fullEmail = `Subject: ${previewSubject}\n\n${previewBody}`
    try {
      await navigator.clipboard.writeText(fullEmail)
      toast.success('Email copied to clipboard!')
      trackToolEvent('email_templates_copy', {})
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Handle copy body only
  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(previewBody)
      toast.success('Email body copied to clipboard!')
      trackToolEvent('email_templates_copy_body', {})
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Handle save custom template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      category: 'custom',
      subject: editedSubject,
      body: editedBody,
      tone: selectedTone,
      isCustom: true,
      createdAt: Date.now(),
    }

    setCustomTemplates([...customTemplates, newTemplate])
    setShowSaveDialog(false)
    setNewTemplateName('')
    toast.success('Template saved!')
    trackToolEvent('email_templates_save', {})
  }

  // Handle delete custom template
  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates(customTemplates.filter((t) => t.id !== id))
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null)
      setEditedSubject('')
      setEditedBody('')
    }
    toast.success('Template deleted')
    trackToolEvent('email_templates_delete', {})
  }

  // Handle download as text file
  const handleDownload = () => {
    const fullEmail = `Subject: ${previewSubject}\n\n${previewBody}`
    const blob = new Blob([fullEmail], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-template-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Template downloaded!')
    trackToolEvent('email_templates_download', {})
  }

  // Handle variable change
  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }))
  }

  // Clear all variables
  const handleClearVariables = () => {
    setVariableValues({})
    toast.success('Variables cleared')
  }

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'purple.500/30',
            bg: 'purple.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Mail className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            10+ Templates • 4 Tone Styles
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'rose.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Email Template Builder
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Create professional emails in seconds with pre-built templates, variable placeholders, and
          customizable tone settings. Save time on routine correspondence.
        </p>
      </motion.div>

      {/* Category Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Choose Template Category</CardTitle>
            <CardDescription>Select the type of email you want to create</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop: Operation Grid */}
            <div className={css({ display: { base: 'none', md: 'block' } })}>
              <ToolOperationGrid
                operations={CATEGORY_OPERATIONS}
                selectedOperation={selectedCategory}
                onOperationChange={handleCategoryChange}
                columns={{ base: 1, sm: 2, md: 3, lg: 6 }}
                analyticsCategory="email_templates"
              />
            </div>

            {/* Mobile: Bottom Sheet Picker */}
            <div className={css({ display: { base: 'block', md: 'none' } })}>
              <ToolMobilePicker
                label={`Category: ${CATEGORY_OPERATIONS.find((op) => op.id === selectedCategory)?.label || 'Follow-up'}`}
                title="Choose Email Category"
                description="Select the type of email template you need"
                color={CATEGORY_OPERATIONS.find((op) => op.id === selectedCategory)?.color}
              >
                <ToolOperationGrid
                  operations={CATEGORY_OPERATIONS}
                  selectedOperation={selectedCategory}
                  onOperationChange={handleCategoryChange}
                  columns={{ base: 1, sm: 2 }}
                  analyticsCategory="email_templates"
                />
              </ToolMobilePicker>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '300px 1fr 280px' },
          gap: '6',
        })}
      >
        {/* Template List */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            h: 'fit-content',
            maxH: { lg: '600px' },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <CardHeader className={css({ pb: '3' })}>
            <CardTitle className={css({ fontSize: 'lg' })}>Templates</CardTitle>
            <CardDescription>
              {selectedCategory === 'custom'
                ? `${customTemplates.length} saved template${customTemplates.length !== 1 ? 's' : ''}`
                : `${templatesForCategory.length} template${templatesForCategory.length !== 1 ? 's' : ''} available`}
            </CardDescription>
          </CardHeader>
          <CardContent
            className={css({
              flex: 1,
              overflow: 'auto',
              spaceY: '2',
              pb: '4',
            })}
          >
            {templatesForCategory.length === 0 ? (
              <div
                className={css({
                  textAlign: 'center',
                  py: '8',
                  color: 'gray.400',
                })}
              >
                <FileText
                  className={css({ h: '12', w: '12', mx: 'auto', mb: '3', opacity: 0.5 })}
                />
                <p className={css({ fontSize: 'sm' })}>No custom templates yet</p>
                <p className={css({ fontSize: 'xs', mt: '1' })}>
                  Create one by editing and saving a template
                </p>
              </div>
            ) : (
              templatesForCategory.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor:
                      selectedTemplate?.id === template.id ? 'purple.500/50' : 'gray.700',
                    bg: selectedTemplate?.id === template.id ? 'purple.500/10' : 'gray.800/50',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    w: 'full',
                    _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                      gap: '2',
                    })}
                  >
                    <div className={css({ flex: 1, minW: 0 })}>
                      <h4
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'white',
                          truncate: true,
                        })}
                      >
                        {template.name}
                      </h4>
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.400',
                          mt: '1',
                          truncate: true,
                        })}
                      >
                        {template.subject}
                      </p>
                    </div>
                    {template.isCustom && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(template.id)
                        }}
                        size="sm"
                        className={css({
                          h: '7',
                          w: '7',
                          p: '0',
                          bg: 'transparent',
                          color: 'gray.400',
                          _hover: { bg: 'red.500/20', color: 'red.400' },
                        })}
                      >
                        <Trash2 className={css({ h: '3.5', w: '3.5' })} />
                      </Button>
                    )}
                  </div>
                  <Badge
                    className={css({
                      mt: '2',
                      bg: 'gray.700',
                      color: 'gray.300',
                      fontSize: 'xs',
                      textTransform: 'capitalize',
                    })}
                  >
                    {template.tone}
                  </Badge>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '3',
              })}
            >
              <div>
                <CardTitle>Email Editor</CardTitle>
                <CardDescription>
                  {selectedTemplate
                    ? `Editing: ${selectedTemplate.name}`
                    : 'Select a template or start from scratch'}
                </CardDescription>
              </div>
              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                {/* Tone Selector */}
                <div className={css({ position: 'relative' })}>
                  <Button
                    onClick={() => setShowToneDropdown(!showToneDropdown)}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'white',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _hover: { bg: 'gray.700' },
                    })}
                  >
                    <Settings className={css({ h: '4', w: '4' })} />
                    Tone: {selectedTone}
                    <ChevronDown className={css({ h: '3', w: '3' })} />
                  </Button>
                  {showToneDropdown && (
                    <div
                      className={css({
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        mt: '2',
                        w: '64',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        p: '2',
                        zIndex: 50,
                        shadow: 'lg',
                      })}
                    >
                      {(Object.keys(TONE_MODIFIERS) as EmailTone[]).map((tone) => (
                        <button
                          type="button"
                          key={tone}
                          onClick={() => {
                            setSelectedTone(tone)
                            setShowToneDropdown(false)
                          }}
                          className={css({
                            p: '2',
                            rounded: 'md',
                            cursor: 'pointer',
                            bg: selectedTone === tone ? 'purple.500/20' : 'transparent',
                            w: 'full',
                            textAlign: 'left',
                            border: 'none',
                            _hover: { bg: 'gray.700' },
                          })}
                        >
                          <div
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            })}
                          >
                            <span
                              className={css({
                                fontSize: 'sm',
                                fontWeight: 'medium',
                                color: 'white',
                                textTransform: 'capitalize',
                              })}
                            >
                              {tone}
                            </span>
                            {selectedTone === tone && (
                              <Check className={css({ h: '4', w: '4', color: 'purple.400' })} />
                            )}
                          </div>
                          <p className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>
                            {TONE_MODIFIERS[tone].style}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Subject Line */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="email-subject"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
              >
                Subject Line
              </label>
              <Input
                id="email-subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Enter subject line..."
                className={css({
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: { borderColor: 'purple.500', ring: '2px', ringColor: 'purple.500/20' },
                })}
              />
            </div>

            {/* Email Body */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="email-body"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
              >
                Email Body
              </label>
              <textarea
                id="email-body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                placeholder="Enter email content..."
                rows={12}
                className={css({
                  w: 'full',
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  p: '3',
                  fontSize: 'sm',
                  color: 'white',
                  resize: 'vertical',
                  minH: '200px',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  _focus: {
                    outline: 'none',
                    borderColor: 'purple.500',
                    ring: '2px',
                    ringColor: 'purple.500/20',
                  },
                  _placeholder: { color: 'gray.500' },
                })}
              />
            </div>

            {/* Tone Info */}
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'purple.500/20',
                bg: 'purple.500/5',
                p: '3',
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                <Sparkles className={css({ h: '4', w: '4', color: 'purple.400' })} />
                <span
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.300' })}
                >
                  Tone Guide: {selectedTone}
                </span>
              </div>
              <div className={css({ fontSize: 'xs', color: 'gray.400', spaceY: '1' })}>
                <p>
                  <strong>Greeting:</strong> {TONE_MODIFIERS[selectedTone].greeting}
                </p>
                <p>
                  <strong>Closing:</strong> {TONE_MODIFIERS[selectedTone].closing}
                </p>
                <p>
                  <strong>Style:</strong> {TONE_MODIFIERS[selectedTone].style}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
              <Button
                onClick={handleCopy}
                disabled={!editedSubject && !editedBody}
                className={css({
                  gap: '2',
                  bg: 'purple.500',
                  color: 'white',
                  _hover: { bg: 'purple.600' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy Full Email
              </Button>
              <Button
                onClick={handleCopyBody}
                disabled={!editedBody}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'white',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _hover: { bg: 'gray.700' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy Body Only
              </Button>
              <Button
                onClick={() => setShowSaveDialog(true)}
                disabled={!editedSubject && !editedBody}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'white',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _hover: { bg: 'gray.700' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Save className={css({ h: '4', w: '4' })} />
                Save Template
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!editedSubject && !editedBody}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'white',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _hover: { bg: 'gray.700' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Variables Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            h: 'fit-content',
            maxH: { lg: '600px' },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <CardHeader className={css({ pb: '3' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <CardTitle className={css({ fontSize: 'lg' })}>Variables</CardTitle>
              <Button
                onClick={handleClearVariables}
                size="sm"
                className={css({
                  h: '7',
                  px: '2',
                  bg: 'transparent',
                  color: 'gray.400',
                  fontSize: 'xs',
                  _hover: { bg: 'gray.800', color: 'white' },
                })}
              >
                Clear All
              </Button>
            </div>
            <CardDescription>Fill in placeholder values</CardDescription>
          </CardHeader>
          <CardContent
            className={css({
              flex: 1,
              overflow: 'auto',
              spaceY: '3',
              pb: '4',
            })}
          >
            {TEMPLATE_VARIABLES.map((variable) => (
              <div key={variable.key} className={css({ spaceY: '1' })}>
                <label
                  htmlFor={`var-${variable.key}`}
                  className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'gray.300' })}
                >
                  {variable.label}
                </label>
                <Input
                  id={`var-${variable.key}`}
                  value={variableValues[variable.key] || ''}
                  onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                  placeholder={variable.placeholder}
                  className={css({
                    h: '8',
                    fontSize: 'sm',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'purple.500', ring: '2px', ringColor: 'purple.500/20' },
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500', fontFamily: 'mono' })}>
                  {variable.key}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Section */}
      {(editedSubject || editedBody) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Briefcase className={css({ h: '5', w: '5', color: 'green.400' })} />
                <CardTitle>Preview</CardTitle>
              </div>
              <CardDescription>
                This is how your email will look with variables replaced
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  overflow: 'hidden',
                })}
              >
                {/* Email Header */}
                <div
                  className={css({
                    borderBottom: '1px solid',
                    borderColor: 'gray.700',
                    p: '4',
                    bg: 'gray.800',
                  })}
                >
                  <div
                    className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}
                  >
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.400' })}
                    >
                      Subject:
                    </span>
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'white' })}
                    >
                      {previewSubject || 'No subject'}
                    </span>
                  </div>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      To: {variableValues['{{name}}'] || 'Recipient'}
                    </span>
                  </div>
                </div>

                {/* Email Body */}
                <div className={css({ p: '4' })}>
                  <pre
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.200',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      m: '0',
                    })}
                  >
                    {previewBody || 'No content yet...'}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        // biome-ignore lint/a11y/noStaticElementInteractions: Modal backdrop requires click-to-dismiss functionality
        <div
          role="presentation"
          className={css({
            position: 'fixed',
            inset: '0',
            bg: 'black/60',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            p: '4',
          })}
          onClick={() => setShowSaveDialog(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSaveDialog(false)
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={css({
              w: 'full',
              maxW: 'md',
              rounded: 'xl',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.900',
              p: '6',
              shadow: '2xl',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '4' })}
            >
              Save Template
            </h3>
            <div className={css({ spaceY: '4' })}>
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="template-name"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Template Name
                </label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter a name for this template..."
                  className={css({
                    bg: 'gray.800',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'purple.500' },
                  })}
                />
              </div>
              <div className={css({ display: 'flex', gap: '3', justifyContent: 'flex-end' })}>
                <Button
                  onClick={() => setShowSaveDialog(false)}
                  className={css({
                    bg: 'gray.800',
                    color: 'white',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  className={css({
                    bg: 'purple.500',
                    color: 'white',
                    _hover: { bg: 'purple.600' },
                  })}
                >
                  <Save className={css({ h: '4', w: '4', mr: '2' })} />
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* FAQ Section */}
      <FAQAccordion faqs={faqs} />

      {/* Tool Rating */}
      <ToolRating toolId="email-templates" toolName="Email Template Builder" />

      {/* Social Share */}
      <SocialShare
        toolName="Email Template Builder"
        toolUrl="/tools/productivity/email-templates"
        description="Create professional emails in seconds with customizable templates"
      />

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/productivity/email-templates" category="productivity" />
    </main>
  )
}
