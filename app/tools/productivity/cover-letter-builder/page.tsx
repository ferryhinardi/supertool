'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { AISuggestions } from './components/AISuggestions'
import { CoverLetterForm } from './components/CoverLetterForm'
import { CoverLetterTips } from './components/CoverLetterTips'
import { ClassicTemplate } from './components/templates/ClassicTemplate'
import { CreativeTemplate } from './components/templates/CreativeTemplate'
import { ExecutiveTemplate } from './components/templates/ExecutiveTemplate'
import { MinimalTemplate } from './components/templates/MinimalTemplate'
import { ModernTemplate } from './components/templates/ModernTemplate'
import { ProfessionalTemplate } from './components/templates/ProfessionalTemplate'
import { TechTemplate } from './components/templates/TechTemplate'
import {
  exportCoverLetterToPDF,
  exportCoverLetterToTextPDF,
  getSuggestedFileName,
} from './lib/pdfExport'
import type { CoverLetterData, TemplateId } from './types'
import { COVER_LETTER_TEMPLATES, EMPTY_COVER_LETTER } from './types'
import {
  checkLength,
  clearLocalStorage,
  exportToJSON,
  generateId,
  getWordCount,
  importFromJSON,
  loadFromLocalStorage,
  saveToLocalStorage,
  validateCoverLetter,
} from './utils'

const STORAGE_KEY = 'supertool-cover-letter-builder'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

export default function CoverLetterBuilderPage() {
  // Track page view
  useTrackToolView({
    toolId: 'cover-letter-builder',
    title: 'Cover Letter Builder',
    href: '/tools/productivity/cover-letter-builder',
    iconName: 'FileText',
    gradient: 'from-purple-500 to-pink-500',
  })

  // State
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(() => {
    const loaded = loadFromLocalStorage(STORAGE_KEY)
    if (loaded) {
      trackToolEvent('cover_letter_loaded_from_storage', {})
      return loaded
    }
    return { ...EMPTY_COVER_LETTER, id: generateId() }
  })
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    () => coverLetter.templateId || 'modern'
  )
  const [isExporting, setIsExporting] = useState(false)
  const [_lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false)

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage(STORAGE_KEY, coverLetter)
      setLastSaved(new Date())
      setShowAutoSaveIndicator(true)
      setTimeout(() => setShowAutoSaveIndicator(false), 2000)
    }, AUTO_SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [coverLetter])

  // Track tool open
  useEffect(() => {
    trackToolEvent('cover_letter_builder_open', {})
  }, [])

  // Handlers
  const handleCoverLetterChange = useCallback((data: CoverLetterData) => {
    setCoverLetter(data)
    trackToolEvent('cover_letter_form_updated', {})
  }, [])

  const handleTemplateChange = useCallback((templateId: TemplateId) => {
    setSelectedTemplate(templateId)
    setCoverLetter((prev) => ({ ...prev, templateId }))
    trackToolEvent('cover_letter_template_changed', { template: templateId })
  }, [])

  const handleExportVisualPDF = useCallback(async () => {
    setIsExporting(true)
    try {
      const fileName = getSuggestedFileName(coverLetter, 'visual')
      await exportCoverLetterToPDF('cover-letter-preview', fileName)
      trackToolEvent('cover_letter_exported', { format: 'visual_pdf' })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [coverLetter])

  const handleExportTextPDF = useCallback(async () => {
    setIsExporting(true)
    try {
      const fileName = getSuggestedFileName(coverLetter, 'text')
      await exportCoverLetterToTextPDF(coverLetter, fileName)
      trackToolEvent('cover_letter_exported', { format: 'text_pdf' })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [coverLetter])

  const handleExportJSON = useCallback(() => {
    try {
      exportToJSON(coverLetter)
      trackToolEvent('cover_letter_exported', { format: 'json' })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export JSON. Please try again.')
    }
  }, [coverLetter])

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const imported = await importFromJSON(file)
        setCoverLetter(imported)
        setSelectedTemplate(imported.templateId || 'modern')
        trackToolEvent('cover_letter_imported', { format: 'json' })
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import JSON. Please check the file format.')
      }
    }
    input.click()
  }, [])

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearLocalStorage(STORAGE_KEY)
      setCoverLetter({ ...EMPTY_COVER_LETTER, id: generateId() })
      setSelectedTemplate('modern')
      trackToolEvent('cover_letter_cleared', {})
    }
  }, [])

  // Handle applying AI suggestions
  const handleApplyAISuggestion = useCallback((field: string, value: string) => {
    setCoverLetter((prev) => {
      const newData = { ...prev }
      // Support nested field paths like "content.opening"
      const fieldParts = field.split('.')
      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts
        if (parent === 'content' && child in newData.content) {
          newData.content = {
            ...newData.content,
            [child]: value,
          }
        } else if (parent === 'personal' && child in newData.personal) {
          newData.personal = {
            ...newData.personal,
            [child]: value,
          }
        } else if (parent === 'recipient' && child in newData.recipient) {
          newData.recipient = {
            ...newData.recipient,
            [child]: value,
          }
        }
      } else {
        // Handle direct fields
        ;(newData as Record<string, unknown>)[field] = value
      }
      return newData
    })
  }, [])

  // Template renderer
  const renderTemplate = () => {
    const props = { data: coverLetter }
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate {...props} />
      case 'classic':
        return <ClassicTemplate {...props} />
      case 'professional':
        return <ProfessionalTemplate {...props} />
      case 'creative':
        return <CreativeTemplate {...props} />
      case 'minimal':
        return <MinimalTemplate {...props} />
      case 'executive':
        return <ExecutiveTemplate {...props} />
      case 'tech':
        return <TechTemplate {...props} />
      default:
        return <ModernTemplate {...props} />
    }
  }

  // Validation
  const validation = validateCoverLetter(coverLetter)
  const lengthCheck = checkLength(coverLetter)
  const wordCount = getWordCount(coverLetter)

  return (
    <div className={css({ minH: '100vh', bg: 'gray.950', color: 'gray.50' })}>
      {/* Header */}
      <div
        className={css({
          borderBottom: '1px solid',
          borderColor: 'gray.800',
          py: '6',
          px: { base: '4', sm: '6' },
          bg: 'gray.900/50',
          backdropFilter: 'blur(8px)',
        })}
      >
        <div className={css({ maxW: '7xl', mx: 'auto' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '4',
            })}
          >
            <div>
              <h1
                className={css({
                  fontSize: { base: '2xl', sm: '3xl' },
                  fontWeight: 'bold',
                  mb: '2',
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.400',
                  gradientTo: 'pink.400',
                  bgClip: 'text',
                  color: 'transparent',
                })}
              >
                Cover Letter Builder
              </h1>
              <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
                Create professional cover letters with customizable templates
              </p>
            </div>
            {showAutoSaveIndicator && (
              <div
                className={css({
                  fontSize: 'xs',
                  color: 'green.400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <span>✓</span>
                <span>Auto-saved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '280px 1fr 300px' },
          gap: { base: '4', md: '6' },
          maxW: '7xl',
          mx: 'auto',
          p: { base: '4', sm: '6' },
          minH: 'calc(100vh - 140px)',
        })}
      >
        {/* LEFT SIDEBAR - Template Selector */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
            h: 'fit-content',
            position: { base: 'relative', lg: 'sticky' },
            top: { lg: '6' },
          })}
        >
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Choose a style</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2',
                })}
              >
                {Object.values(COVER_LETTER_TEMPLATES).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateChange(template.id)}
                    className={css({
                      p: '3',
                      textAlign: 'left',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: selectedTemplate === template.id ? 'purple.500' : 'gray.800',
                      bg: selectedTemplate === template.id ? 'purple.500/10' : 'gray.900',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        borderColor: 'purple.500',
                        bg: 'purple.500/5',
                      },
                    })}
                  >
                    <div
                      className={css({
                        fontWeight: 'medium',
                        mb: '1',
                        fontSize: 'sm',
                      })}
                    >
                      {template.name}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '3',
                fontSize: 'sm',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <span className={css({ color: 'gray.400' })}>Word Count:</span>
                <span
                  className={css({
                    fontWeight: 'bold',
                    color:
                      lengthCheck.status === 'optimal'
                        ? 'green.400'
                        : lengthCheck.status === 'short'
                          ? 'yellow.400'
                          : 'orange.400',
                  })}
                >
                  {wordCount}
                </span>
              </div>
              <div
                className={css({
                  fontSize: 'xs',
                  color: 'gray.500',
                  p: '2',
                  bg: 'gray.900',
                  rounded: 'md',
                })}
              >
                {lengthCheck.message}
              </div>
              {!validation.isValid && validation.errors.length > 0 && (
                <div
                  className={css({
                    fontSize: 'xs',
                    color: 'red.400',
                    p: '2',
                    bg: 'red.900/20',
                    rounded: 'md',
                    border: '1px solid',
                    borderColor: 'red.900',
                  })}
                >
                  <div className={css({ fontWeight: 'medium', mb: '1' })}>
                    ⚠️ {validation.errors.length} required field
                    {validation.errors.length > 1 ? 's' : ''} missing:
                  </div>
                  <ul className={css({ pl: '4', listStyle: 'disc' })}>
                    {validation.errors.slice(0, 3).map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
              <Link href="/tools/productivity/resume-builder">
                <Button variant="default" className={css({ w: 'full', fontSize: 'sm' })}>
                  Resume Builder
                  <ArrowRight className={css({ w: '4', h: '4', ml: '2' })} />
                </Button>
              </Link>
              <Button
                onClick={handleImportJSON}
                variant="outline"
                className={css({ w: 'full', fontSize: 'sm' })}
              >
                Import JSON
              </Button>
              <Button
                onClick={handleClearAll}
                variant="ghost"
                className={css({ w: 'full', fontSize: 'sm', color: 'red.400' })}
              >
                Clear All
              </Button>
            </CardContent>
          </Card>

          {/* Tips & Best Practices */}
          <CoverLetterTips />
        </div>

        {/* CENTER - Form */}
        <div
          className={css({
            overflowY: 'auto',
            maxH: { base: 'none', lg: 'calc(100vh - 180px)' },
            pr: { lg: '2' },
          })}
        >
          <CoverLetterForm data={coverLetter} onChange={handleCoverLetterChange} />
        </div>

        {/* RIGHT SIDEBAR - Preview & Export */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
            h: 'fit-content',
            position: { base: 'relative', lg: 'sticky' },
            top: { lg: '6' },
          })}
        >
          {/* Export Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>Download your cover letter</CardDescription>
            </CardHeader>
            <CardContent
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '2',
              })}
            >
              <Button
                onClick={handleExportVisualPDF}
                disabled={isExporting || !validation.isValid}
                className={css({ w: 'full' })}
              >
                {isExporting ? 'Exporting...' : '📄 Visual PDF'}
              </Button>
              <Button
                onClick={handleExportTextPDF}
                disabled={isExporting || !validation.isValid}
                variant="outline"
                className={css({ w: 'full' })}
              >
                📝 ATS-Friendly PDF
              </Button>
              <Button onClick={handleExportJSON} variant="ghost" className={css({ w: 'full' })}>
                💾 Export JSON
              </Button>
              {!validation.isValid && (
                <p
                  className={css({
                    fontSize: 'xs',
                    color: 'yellow.400',
                    textAlign: 'center',
                    mt: '1',
                  })}
                >
                  Complete required fields to export
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <AISuggestions
            coverLetter={coverLetter}
            onApplySuggestion={handleApplyAISuggestion}
            onAnalyticsEvent={(event, data) =>
              trackToolEvent(
                event as Parameters<typeof trackToolEvent>[0],
                data as Record<string, string | number | boolean | string[]>
              )
            }
          />

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Real-time preview</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  w: 'full',
                  overflow: 'hidden',
                  rounded: 'md',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  bg: 'white',
                  position: 'relative',
                })}
              >
                <div
                  id="cover-letter-preview"
                  className={css({
                    w: '210mm',
                    minH: '297mm',
                    bg: 'white',
                    transform: 'scale(0.28)',
                    transformOrigin: 'top left',
                    overflow: 'hidden',
                  })}
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                  }}
                >
                  {renderTemplate()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Help Text */}
      <div
        className={css({
          borderTop: '1px solid',
          borderColor: 'gray.800',
          py: '4',
          px: { base: '4', sm: '6' },
          mt: '8',
        })}
      >
        <div
          className={css({
            maxW: '7xl',
            mx: 'auto',
            fontSize: 'xs',
            color: 'gray.500',
            textAlign: 'center',
          })}
        >
          <p>
            💡 Tip: Your work is automatically saved every 30 seconds. Aim for 250-400 words for
            optimal cover letter length.
          </p>
        </div>
      </div>
    </div>
  )
}
