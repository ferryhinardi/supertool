/**
 * Resume Preview Component
 * Renders the selected template with resume data
 * Templates are lazy-loaded for optimal bundle size
 */

import { lazy, Suspense } from 'react'
import { css } from '@/styled-system/css'
import type { ResumeData, TemplateId } from '../types'

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

// Loading fallback component
function TemplateLoading() {
  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'white',
        color: 'rgb(107, 114, 128)',
        fontSize: '14px',
      })}
    >
      Loading template...
    </div>
  )
}

export function ResumePreview({ data, templateId }: ResumePreviewProps) {
  // Render the selected template with lazy loading
  const renderTemplate = () => {
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
  }

  return <Suspense fallback={<TemplateLoading />}>{renderTemplate()}</Suspense>
}
