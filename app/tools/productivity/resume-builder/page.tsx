'use client'

import {
  ArrowRight,
  Briefcase,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Maximize2,
  Save,
  Sparkles,
  User,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDebounce } from '@/hooks/common/useDebounce'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import { EducationForm } from './components/EducationForm'
import { ExperienceForm } from './components/ExperienceForm'
import { PersonalInfoForm } from './components/PersonalInfoForm'
import { ProjectsForm } from './components/ProjectsForm'
import { ResumePreview } from './components/ResumePreview'
import { SkillsForm } from './components/SkillsForm'
import { TemplateThumbnail } from './components/TemplateThumbnail'
import { exportResumeToPDF, exportResumeToSimplePDF } from './lib/pdfExport'
import { RESUME_TEMPLATES } from './templates'
import type {
  Education,
  PersonalInfo,
  Project,
  ResumeData,
  ResumeSection,
  SkillGroup,
  TemplateId,
  WorkExperience,
} from './types'
import { EMPTY_RESUME } from './types'
import {
  calculateATSScore,
  exportToJSON,
  generateId,
  loadFromLocalStorage,
  saveToLocalStorage,
} from './utils'

const STORAGE_KEY = 'supertool-resume-builder'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

// Convert templates object to array
const TEMPLATES = Object.values(RESUME_TEMPLATES)

export default function ResumeBuilderPage() {
  useTrackToolView({
    toolId: 'resume-builder',
    title: 'Resume Builder',
    href: '/tools/productivity/resume-builder',
    iconName: 'FileText',
    gradient: 'from-blue-500 to-cyan-500',
  })

  // Track tool open on mount
  useEffect(() => {
    trackToolEvent('resume_builder_open', {})
  }, [])

  // Core state
  const [resume, setResume] = useState<ResumeData>(() => {
    // Initialize with full ResumeData structure
    return {
      ...EMPTY_RESUME,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern')
  const [activeSection, setActiveSection] = useState<ResumeSection>('personal')
  const [zoom, setZoom] = useState<number>(100)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  // Debounce resume data to prevent excessive re-renders during typing
  const debouncedResume = useDebounce(resume, 300)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    trackToolEvent('resume_builder_open', {})
    const saved = loadFromLocalStorage(STORAGE_KEY)
    if (saved) {
      setResume(saved)
      trackToolEvent('resume_load', { had_saved_data: true })
      toast.success('Resume loaded from previous session')
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage(STORAGE_KEY, resume)
      setLastSaved(new Date())
      trackToolEvent('resume_auto_save', {})
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [resume])

  // Calculate ATS score with memoization to prevent unnecessary recalculations
  const atsScore = useMemo(() => calculateATSScore(resume), [resume])

  // Debug: Log template changes
  useEffect(() => {
    console.log('🔄 Preview rendering with template:', selectedTemplate)
  }, [selectedTemplate])

  // Track ATS score changes
  useEffect(() => {
    trackToolEvent('resume_ats_score_calculated', {
      overall: atsScore.overall,
      format: atsScore.formatScore,
      keywords: atsScore.keywordScore,
      content: atsScore.contentScore,
    })
  }, [atsScore.overall, atsScore.formatScore, atsScore.keywordScore, atsScore.contentScore])

  // Manual save
  const handleSave = useCallback(() => {
    saveToLocalStorage(STORAGE_KEY, resume)
    setLastSaved(new Date())
    trackToolEvent('resume_save', {})
    toast.success('Resume saved successfully')
  }, [resume])

  // Export to JSON
  const handleExportJSON = useCallback(() => {
    const json = exportToJSON(resume)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    trackToolEvent('resume_export_json', {})
    toast.success('Resume exported as JSON')
  }, [resume])

  // Export to PDF (HTML-based with preview rendering)
  const handleExportPDF = useCallback(async () => {
    try {
      toast.info('Generating PDF...')
      await exportResumeToPDF('resume-preview', {
        filename: `${resume.personal.fullName || 'resume'}-${Date.now()}.pdf`,
      })
      trackToolEvent('resume_export_pdf', { template: selectedTemplate })
      toast.success('Resume exported as PDF')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF')
    }
  }, [resume.personal.fullName, selectedTemplate])

  // Export to Simple PDF (text-based, more ATS-friendly)
  const handleExportSimplePDF = useCallback(() => {
    try {
      exportResumeToSimplePDF(resume, {
        filename: `${resume.personal.fullName || 'resume'}-${Date.now()}.pdf`,
      })
      trackToolEvent('resume_export_simple_pdf', {})
      toast.success('Resume exported as Simple PDF (ATS-friendly)')
    } catch (error) {
      console.error('Simple PDF export error:', error)
      toast.error('Failed to export PDF')
    }
  }, [resume])

  // Template change handler
  const handleTemplateChange = useCallback((templateId: TemplateId) => {
    console.log('🎨 Template changed to:', templateId)
    setSelectedTemplate(templateId)
    trackToolEvent('resume_template_change', { template: templateId })
  }, [])

  // Update handler for personal info
  const handlePersonalInfoChange = useCallback((personalInfo: PersonalInfo) => {
    setResume((prev) => ({
      ...prev,
      personal: personalInfo,
      updatedAt: new Date().toISOString(),
    }))
    trackToolEvent('resume_personal_info_update', {
      has_name: !!personalInfo.fullName,
      has_email: !!personalInfo.email,
      has_phone: !!personalInfo.phone,
      has_summary: !!personalInfo.summary,
    })
  }, [])

  // Update handler for experience
  const handleExperienceChange = useCallback(
    (experience: WorkExperience[]) => {
      const prev = resume.experience
      setResume((current) => ({
        ...current,
        experience,
        updatedAt: new Date().toISOString(),
      }))

      // Track add/remove
      if (experience.length > prev.length) {
        trackToolEvent('resume_experience_add', { total_entries: experience.length })
      } else if (experience.length < prev.length) {
        trackToolEvent('resume_experience_remove', { total_entries: experience.length })
      }
    },
    [resume.experience]
  )

  // Update handler for education
  const handleEducationChange = useCallback(
    (education: Education[]) => {
      const prev = resume.education
      setResume((current) => ({
        ...current,
        education,
        updatedAt: new Date().toISOString(),
      }))

      // Track add/remove
      if (education.length > prev.length) {
        trackToolEvent('resume_education_add', { total_entries: education.length })
      } else if (education.length < prev.length) {
        trackToolEvent('resume_education_remove', { total_entries: education.length })
      }
    },
    [resume.education]
  )

  // Update handler for skills
  const handleSkillsChange = useCallback(
    (skills: SkillGroup[]) => {
      const prev = resume.skills
      setResume((current) => ({
        ...current,
        skills,
        updatedAt: new Date().toISOString(),
      }))

      // Track add/remove category
      if (skills.length > prev.length) {
        trackToolEvent('resume_skills_add_category', { total_categories: skills.length })
      } else if (skills.length < prev.length) {
        trackToolEvent('resume_skills_remove_category', { total_categories: skills.length })
      }
    },
    [resume.skills]
  )

  // Update handler for projects
  const handleProjectsChange = useCallback(
    (projects: Project[]) => {
      const prev = resume.projects
      setResume((current) => ({
        ...current,
        projects,
        updatedAt: new Date().toISOString(),
      }))

      // Track add/remove
      if (projects.length > prev.length) {
        trackToolEvent('resume_project_add', { total_entries: projects.length })
      } else if (projects.length < prev.length) {
        trackToolEvent('resume_project_remove', { total_entries: projects.length })
      }
    },
    [resume.projects]
  )

  // Section navigation items
  const sections = [
    { id: 'personal' as ResumeSection, label: 'Personal Info', icon: User },
    { id: 'experience' as ResumeSection, label: 'Experience', icon: Briefcase },
    { id: 'education' as ResumeSection, label: 'Education', icon: GraduationCap },
    { id: 'skills' as ResumeSection, label: 'Skills', icon: Wrench },
    { id: 'projects' as ResumeSection, label: 'Projects', icon: Sparkles },
  ]

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        display: 'flex',
        flexDirection: 'column',
        gap: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div
        className={css({
          textAlign: 'center',
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            mb: '3',
            px: '3',
            py: '1.5',
            bg: 'blue.500/10',
            rounded: 'full',
          })}
        >
          <FileText className={css({ w: '4', h: '4', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'blue.400' })}>
            Professional Resume Builder
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            mb: '3',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientTo: 'cyan.400',
            bgClip: 'text',
            color: 'transparent',
          })}
        >
          Resume Builder
        </h1>

        <p
          className={css({
            fontSize: { base: 'base', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Create ATS-friendly resumes with professional templates and AI-powered suggestions
        </p>
      </div>

      {/* Action Bar */}
      <div
        className={css({
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: '4',
          bg: 'gray.800',
          rounded: 'lg',
          border: '1px solid',
          borderColor: 'gray.700',
        })}
      >
        <div className={css({ display: 'flex', gap: '2', alignItems: 'center', flexWrap: 'wrap' })}>
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className={css({ w: '4', h: '4', mr: '2' })} />
            Save
          </Button>
          <Button
            onClick={() => setShowMobilePreview(true)}
            variant="outline"
            size="sm"
            className={css({ display: { base: 'inline-flex', lg: 'none' } })}
          >
            <Eye className={css({ w: '4', h: '4', mr: '2' })} />
            Preview
          </Button>
          <Button onClick={handleExportPDF} variant="default" size="sm">
            <Download className={css({ w: '4', h: '4', mr: '2' })} />
            Export PDF
          </Button>
          <Button onClick={handleExportSimplePDF} variant="outline" size="sm">
            <Download className={css({ w: '4', h: '4', mr: '2' })} />
            Simple PDF
          </Button>
          <Button onClick={handleExportJSON} variant="ghost" size="sm">
            <Download className={css({ w: '4', h: '4', mr: '2' })} />
            JSON
          </Button>
          <Link href="/tools/productivity/cover-letter-builder">
            <Button variant="ghost" size="sm">
              <FileText className={css({ w: '4', h: '4', mr: '2' })} />
              Cover Letter
              <ArrowRight className={css({ w: '4', h: '4', ml: '2' })} />
            </Button>
          </Link>
        </div>

        {lastSaved && (
          <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}

        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: '3',
            py: '1.5',
            bg: atsScore.overall >= 80 ? 'green.500/10' : 'yellow.500/10',
            rounded: 'full',
          })}
        >
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
            ATS Score:
          </span>
          <span
            className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: atsScore.overall >= 80 ? 'green.400' : 'yellow.400',
            })}
          >
            {atsScore.overall}/100
          </span>
        </div>
      </div>

      {/* Mobile Template Selector - Horizontal Scroll */}
      <Card className={css({ display: { base: 'block', lg: 'none' } })}>
        <CardHeader>
          <CardTitle className={css({ fontSize: 'lg' })}>Templates</CardTitle>
          <CardDescription>Swipe to see all templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'flex',
              gap: '3',
              overflowX: 'auto',
              pb: '2',
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                bg: 'gray.600',
                rounded: 'full',
              },
            })}
          >
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={css({
                  minW: '120px',
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2',
                })}
              >
                <TemplateThumbnail
                  templateId={template.id}
                  isSelected={selectedTemplate === template.id}
                  onClick={() => handleTemplateChange(template.id)}
                />
                <div className={css({ textAlign: 'center' })}>
                  <div className={css({ fontWeight: 'medium', fontSize: 'sm', color: 'gray.50' })}>
                    {template.name}
                  </div>
                  <div className={css({ fontSize: 'xs', color: 'gray.400' })}>
                    ATS: {template.atsScore}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Layout - 2 Columns */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'minmax(0, 1fr) 420px' },
          gap: '6',
          alignItems: 'start',
        })}
      >
        {/* Left Side - Templates (Desktop) + Forms + ATS Score */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
          {/* Desktop Template Selector */}
          <Card className={css({ display: { base: 'none', lg: 'block' } })}>
            <CardHeader>
              <CardTitle className={css({ fontSize: 'lg' })}>Templates</CardTitle>
              <CardDescription>Choose a professional template</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '3',
                  w: 'full',
                })}
              >
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}
                  >
                    <TemplateThumbnail
                      templateId={template.id}
                      isSelected={selectedTemplate === template.id}
                      onClick={() => handleTemplateChange(template.id)}
                    />
                    <div className={css({ textAlign: 'center' })}>
                      <div
                        className={css({ fontWeight: 'medium', fontSize: 'sm', color: 'gray.50' })}
                      >
                        {template.name}
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'gray.400' })}>
                        ATS: {template.atsScore}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Section Tabs */}
          <div
            className={css({
              display: 'flex',
              gap: '2',
              mb: '4',
              overflowX: 'auto',
              pb: '2',
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                bg: 'gray.600',
                rounded: 'full',
              },
            })}
          >
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(section.id)
                    trackToolEvent('resume_section_change', { section: section.id })
                  }}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    px: '4',
                    py: '2',
                    rounded: 'md',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: activeSection === section.id ? 'blue.500' : 'gray.700',
                    bg: activeSection === section.id ? 'blue.500/20' : 'gray.800',
                    color: activeSection === section.id ? 'blue.300' : 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      borderColor: 'blue.500',
                      color: 'blue.300',
                      bg: activeSection === section.id ? 'blue.500/20' : 'gray.750',
                    },
                  })}
                >
                  <Icon className={css({ w: '4', h: '4' })} />
                  {section.label}
                </button>
              )
            })}
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {sections.find((s) => s.id === activeSection)?.label || 'Section'}
              </CardTitle>
              <CardDescription>Fill in your information for this section</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSection === 'personal' && (
                <PersonalInfoForm data={resume.personal} onChange={handlePersonalInfoChange} />
              )}
              {activeSection === 'experience' && (
                <ExperienceForm data={resume.experience} onChange={handleExperienceChange} />
              )}
              {activeSection === 'education' && (
                <EducationForm data={resume.education} onChange={handleEducationChange} />
              )}
              {activeSection === 'skills' && (
                <SkillsForm data={resume.skills} onChange={handleSkillsChange} />
              )}
              {activeSection === 'projects' && (
                <ProjectsForm data={resume.projects} onChange={handleProjectsChange} />
              )}
              {activeSection !== 'personal' &&
                activeSection !== 'experience' &&
                activeSection !== 'education' &&
                activeSection !== 'skills' &&
                activeSection !== 'projects' && (
                  <div className={css({ color: 'gray.400', textAlign: 'center', py: '12' })}>
                    Form components for {activeSection} will be implemented next...
                  </div>
                )}
            </CardContent>
          </Card>

          {/* ATS Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className={css({ fontSize: 'lg' })}>ATS Analysis</CardTitle>
              <CardDescription>How well your resume performs with ATS systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                <div>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: '1',
                      fontSize: 'sm',
                    })}
                  >
                    <span className={css({ color: 'gray.300' })}>Format</span>
                    <span className={css({ fontWeight: 'medium', color: 'gray.100' })}>
                      {atsScore.formatScore}/100
                    </span>
                  </div>
                  <div
                    className={css({
                      h: '2',
                      bg: 'gray.800',
                      rounded: 'full',
                      overflow: 'hidden',
                    })}
                  >
                    <div
                      className={css({
                        h: 'full',
                        bg: 'blue.500',
                        transition: 'width 0.3s',
                      })}
                      style={{ width: `${atsScore.formatScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: '1',
                      fontSize: 'sm',
                    })}
                  >
                    <span className={css({ color: 'gray.300' })}>Keywords</span>
                    <span className={css({ fontWeight: 'medium', color: 'gray.100' })}>
                      {atsScore.keywordScore}/100
                    </span>
                  </div>
                  <div
                    className={css({
                      h: '2',
                      bg: 'gray.800',
                      rounded: 'full',
                      overflow: 'hidden',
                    })}
                  >
                    <div
                      className={css({
                        h: 'full',
                        bg: 'green.500',
                        transition: 'width 0.3s',
                      })}
                      style={{ width: `${atsScore.keywordScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: '1',
                      fontSize: 'sm',
                    })}
                  >
                    <span className={css({ color: 'gray.300' })}>Content</span>
                    <span className={css({ fontWeight: 'medium', color: 'gray.100' })}>
                      {atsScore.contentScore}/100
                    </span>
                  </div>
                  <div
                    className={css({
                      h: '2',
                      bg: 'gray.800',
                      rounded: 'full',
                      overflow: 'hidden',
                    })}
                  >
                    <div
                      className={css({
                        h: 'full',
                        bg: 'cyan.500',
                        transition: 'width 0.3s',
                      })}
                      style={{ width: `${atsScore.contentScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Sticky Preview */}
        <aside
          className={css({
            display: { base: 'none', lg: 'block' },
            position: 'sticky',
            top: '4',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 2rem)',
          })}
        >
          <Card>
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div>
                  <CardTitle className={css({ fontSize: 'lg' })}>Preview</CardTitle>
                  <CardDescription>
                    {TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Modern'} Template
                  </CardDescription>
                </div>
                <div className={css({ display: 'flex', gap: '1', alignItems: 'center' })}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom((prev) => Math.max(50, prev - 25))}
                    disabled={zoom <= 50}
                    className={css({ h: '8', w: '8' })}
                    title="Zoom out"
                  >
                    <ZoomOut className={css({ h: '4', w: '4' })} />
                  </Button>
                  <span
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.400',
                      minW: '12',
                      textAlign: 'center',
                    })}
                  >
                    {zoom}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom((prev) => Math.min(150, prev + 25))}
                    disabled={zoom >= 150}
                    className={css({ h: '8', w: '8' })}
                    title="Zoom in"
                  >
                    <ZoomIn className={css({ h: '4', w: '4' })} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(100)}
                    disabled={zoom === 100}
                    className={css({ h: '8', w: '8' })}
                    title="Reset zoom"
                  >
                    <Maximize2 className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                id="resume-preview"
                className={css({
                  aspectRatio: '8.5/11',
                  bg: 'white',
                  rounded: 'md',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  position: 'relative',
                })}
              >
                {/* Template Name Badge - Visible indicator */}
                <div
                  className={css({
                    position: 'absolute',
                    top: '2',
                    right: '2',
                    bg: 'blue.500',
                    color: 'white',
                    px: '2',
                    py: '1',
                    rounded: 'md',
                    fontSize: 'xs',
                    fontWeight: 'bold',
                    zIndex: 10,
                    pointerEvents: 'none',
                  })}
                >
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                </div>
                <div
                  className={css({
                    w: 'full',
                    h: 'full',
                    overflow: 'auto',
                  })}
                >
                  <div
                    className={css({
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.2s ease-in-out',
                      w: 'full',
                      minH: 'full',
                    })}
                  >
                    <ResumePreview data={resume} templateId={selectedTemplate} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <button
          type="button"
          className={css({
            position: 'fixed',
            inset: 0,
            bg: 'rgba(0, 0, 0, 0.8)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: '4',
            border: 'none',
            cursor: 'pointer',
          })}
          onClick={() => setShowMobilePreview(false)}
          aria-label="Close preview"
        >
          <div
            className={css({
              bg: 'white',
              rounded: 'lg',
              maxW: '4xl',
              w: 'full',
              maxH: '90vh',
              overflow: 'auto',
              position: 'relative',
            })}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMobilePreview(false)
            }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div
              className={css({
                position: 'sticky',
                top: 0,
                bg: 'white',
                p: '4',
                borderBottom: '1px solid',
                borderColor: 'gray.200',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.900' })}>
                Resume Preview
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMobilePreview(false)}>
                Close
              </Button>
            </div>
            <div className={css({ p: '4' })}>
              <ResumePreview data={resume} templateId={selectedTemplate} />
            </div>
          </div>
        </button>
      )}
    </main>
  )
}
