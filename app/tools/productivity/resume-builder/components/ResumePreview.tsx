/**
 * Resume Preview Component
 * Renders the selected template with resume data
 * Templates are lazy-loaded for optimal bundle size
 * Features: Smooth transitions, skeleton loader, error boundary
 */

import { lazy, Suspense, useMemo } from 'react'
import { css } from '@/styled-system/css'
import type { ResumeData, TemplateId } from '../types'
import { TemplateErrorBoundary } from './TemplateErrorBoundary'

// Lazy load templates for optimal bundle size
const ModernTemplate = lazy(() =>
  import('./templates/ModernTemplate').then((mod) => ({ default: mod.ModernTemplate }))
)
const ClassicTemplate = lazy(() =>
  import('./templates/ClassicTemplate').then((mod) => ({ default: mod.ClassicTemplate }))
)
const TechTemplate = lazy(() =>
  import('./templates/TechTemplate').then((mod) => ({ default: mod.TechTemplate }))
)
const ProfessionalTemplate = lazy(() =>
  import('./templates/ProfessionalTemplate').then((mod) => ({
    default: mod.ProfessionalTemplate,
  }))
)
const MinimalTemplate = lazy(() =>
  import('./templates/MinimalTemplate').then((mod) => ({ default: mod.MinimalTemplate }))
)
const CreativeTemplate = lazy(() =>
  import('./templates/CreativeTemplate').then((mod) => ({ default: mod.CreativeTemplate }))
)
const ExecutiveTemplate = lazy(() =>
  import('./templates/ExecutiveTemplate').then((mod) => ({ default: mod.ExecutiveTemplate }))
)
const TwoColumnTemplate = lazy(() =>
  import('./templates/TwoColumnTemplate').then((mod) => ({ default: mod.TwoColumnTemplate }))
)
const CompactTemplate = lazy(() =>
  import('./templates/CompactTemplate').then((mod) => ({ default: mod.CompactTemplate }))
)
const ElegantTemplate = lazy(() =>
  import('./templates/ElegantTemplate').then((mod) => ({ default: mod.ElegantTemplate }))
)

interface ResumePreviewProps {
  data: ResumeData
  templateId: TemplateId
}

// Skeleton loader with resume-like structure
function TemplateSkeleton() {
  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        p: '8',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      })}
    >
      {/* Header skeleton */}
      <div className={css({ mb: '6' })}>
        <div
          className={css({
            h: '8',
            w: '60%',
            bg: 'rgb(229, 231, 235)',
            rounded: 'md',
            mb: '2',
          })}
        />
        <div
          className={css({
            h: '4',
            w: '40%',
            bg: 'rgb(243, 244, 246)',
            rounded: 'md',
            mb: '1',
          })}
        />
        <div
          className={css({
            h: '4',
            w: '50%',
            bg: 'rgb(243, 244, 246)',
            rounded: 'md',
          })}
        />
      </div>

      {/* Section skeleton */}
      <div className={css({ mb: '6' })}>
        <div
          className={css({
            h: '5',
            w: '30%',
            bg: 'rgb(229, 231, 235)',
            rounded: 'md',
            mb: '3',
          })}
        />
        <div className={css({ spaceY: '2' })}>
          <div className={css({ h: '3', w: '90%', bg: 'rgb(243, 244, 246)', rounded: 'sm' })} />
          <div className={css({ h: '3', w: '85%', bg: 'rgb(243, 244, 246)', rounded: 'sm' })} />
          <div className={css({ h: '3', w: '80%', bg: 'rgb(243, 244, 246)', rounded: 'sm' })} />
        </div>
      </div>

      {/* Another section skeleton */}
      <div className={css({ mb: '6' })}>
        <div
          className={css({
            h: '5',
            w: '35%',
            bg: 'rgb(229, 231, 235)',
            rounded: 'md',
            mb: '3',
          })}
        />
        <div className={css({ spaceY: '2' })}>
          <div className={css({ h: '3', w: '95%', bg: 'rgb(243, 244, 246)', rounded: 'sm' })} />
          <div className={css({ h: '3', w: '88%', bg: 'rgb(243, 244, 246)', rounded: 'sm' })} />
          <div className={css({ h: '3', w: '92%', bg: 'rgb(243, 244, 246)', rounded: 'sm' })} />
        </div>
      </div>

      {/* Skills section skeleton */}
      <div className={css({ mb: '6' })}>
        <div
          className={css({
            h: '5',
            w: '25%',
            bg: 'rgb(229, 231, 235)',
            rounded: 'md',
            mb: '3',
          })}
        />
        <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
          <div className={css({ h: '6', w: '20%', bg: 'rgb(243, 244, 246)', rounded: 'full' })} />
          <div className={css({ h: '6', w: '25%', bg: 'rgb(243, 244, 246)', rounded: 'full' })} />
          <div className={css({ h: '6', w: '18%', bg: 'rgb(243, 244, 246)', rounded: 'full' })} />
          <div className={css({ h: '6', w: '22%', bg: 'rgb(243, 244, 246)', rounded: 'full' })} />
        </div>
      </div>
    </div>
  )
}

export function ResumePreview({ data, templateId }: ResumePreviewProps) {
  // Memoize template rendering to ensure it updates when templateId changes
  const template = useMemo(() => {
    switch (templateId) {
      case 'modern':
        return <ModernTemplate data={data} />
      case 'classic':
        return <ClassicTemplate data={data} />
      case 'tech':
        return <TechTemplate data={data} />
      case 'professional':
        return <ProfessionalTemplate data={data} />
      case 'minimal':
        return <MinimalTemplate data={data} />
      case 'creative':
        return <CreativeTemplate data={data} />
      case 'executive':
        return <ExecutiveTemplate data={data} />
      case 'two-column':
        return <TwoColumnTemplate data={data} />
      case 'compact':
        return <CompactTemplate data={data} />
      case 'elegant':
        return <ElegantTemplate data={data} />
      default:
        return <ModernTemplate data={data} />
    }
  }, [templateId, data])

  return (
    <TemplateErrorBoundary>
      <Suspense fallback={<TemplateSkeleton />}>
        <div key={templateId} className={css({ w: 'full', h: 'full' })}>
          {template}
        </div>
      </Suspense>
    </TemplateErrorBoundary>
  )
}
