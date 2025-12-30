/**
 * Template Thumbnail Component
 * Renders SVG-based preview thumbnails for resume templates
 */

import type { ReactElement } from 'react'
import { css } from '@/styled-system/css'
import type { TemplateId } from '../types'

interface TemplateThumbnailProps {
  templateId: TemplateId
  isSelected?: boolean
  onClick?: () => void
}

export function TemplateThumbnail({ templateId, isSelected, onClick }: TemplateThumbnailProps) {
  const thumbnails: Record<TemplateId, ReactElement> = {
    modern: <ModernThumbnail />,
    classic: <ClassicThumbnail />,
    tech: <TechThumbnail />,
    professional: <ProfessionalThumbnail />,
    minimal: <MinimalThumbnail />,
    creative: <CreativeThumbnail />,
    executive: <ExecutiveThumbnail />,
    'two-column': <TwoColumnThumbnail />,
    compact: <CompactThumbnail />,
    elegant: <ElegantThumbnail />,
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={css({
        w: 'full',
        h: '200px',
        border: '2px solid',
        borderColor: isSelected ? 'rgb(59, 130, 246)' : 'rgb(229, 231, 235)',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        bg: 'white',
        _hover: {
          borderColor: isSelected ? 'rgb(37, 99, 235)' : 'rgb(209, 213, 219)',
          transform: 'scale(1.02)',
        },
      })}
    >
      {thumbnails[templateId]}
    </button>
  )
}

// Modern Template Thumbnail
function ModernThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Modern template preview"
    >
      <title>Modern Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="20" y="20" width="80" height="8" fill="rgb(17, 24, 39)" />
      <rect x="20" y="32" width="60" height="4" fill="rgb(107, 114, 128)" />
      <rect x="20" y="40" width="90" height="3" fill="rgb(156, 163, 175)" />
      <rect x="20" y="60" width="40" height="5" fill="rgb(59, 130, 246)" />
      <rect x="20" y="70" width="170" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="76" width="160" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="82" width="150" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="100" width="50" height="5" fill="rgb(59, 130, 246)" />
      <rect x="20" y="110" width="170" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="116" width="165" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="122" width="140" height="2" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Classic Template Thumbnail
function ClassicThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Classic template preview"
    >
      <title>Classic Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="55" y="25" width="100" height="10" fill="rgb(17, 24, 39)" />
      <rect x="70" y="40" width="70" height="4" fill="rgb(107, 114, 128)" />
      <line x1="20" y1="55" x2="190" y2="55" stroke="rgb(209, 213, 219)" strokeWidth="1" />
      <rect x="20" y="70" width="170" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="78" width="160" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="86" width="155" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="100" width="170" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="108" width="165" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="116" width="150" height="3" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Tech Template Thumbnail
function TechThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Tech template preview"
    >
      <title>Tech Template Preview</title>
      <rect width="210" height="297" fill="rgb(15, 23, 42)" />
      <rect x="20" y="20" width="80" height="8" fill="rgb(34, 211, 238)" />
      <rect x="20" y="32" width="60" height="4" fill="rgb(148, 163, 184)" />
      <rect x="20" y="50" width="170" height="3" fill="rgb(71, 85, 105)" />
      <rect x="30" y="58" width="160" height="3" fill="rgb(71, 85, 105)" />
      <rect x="30" y="66" width="150" height="3" fill="rgb(71, 85, 105)" />
      <rect x="20" y="80" width="170" height="3" fill="rgb(71, 85, 105)" />
      <rect x="30" y="88" width="155" height="3" fill="rgb(71, 85, 105)" />
      <rect x="30" y="96" width="145" height="3" fill="rgb(71, 85, 105)" />
    </svg>
  )
}

// Professional Template Thumbnail
function ProfessionalThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Professional template preview"
    >
      <title>Professional Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="20" y="20" width="85" height="9" fill="rgb(30, 58, 138)" />
      <rect x="20" y="34" width="65" height="4" fill="rgb(107, 114, 128)" />
      <line x1="20" y1="48" x2="190" y2="48" stroke="rgb(30, 58, 138)" strokeWidth="2" />
      <rect x="20" y="60" width="45" height="5" fill="rgb(30, 58, 138)" />
      <rect x="20" y="72" width="170" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="78" width="165" height="2" fill="rgb(229, 231, 235)" />
      <rect x="20" y="84" width="160" height="2" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Minimal Template Thumbnail
function MinimalThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Minimal template preview"
    >
      <title>Minimal Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="20" y="30" width="90" height="7" fill="rgb(15, 23, 42)" />
      <rect x="20" y="42" width="70" height="3" fill="rgb(100, 116, 139)" />
      <rect x="20" y="70" width="170" height="2" fill="rgb(226, 232, 240)" />
      <rect x="20" y="78" width="165" height="2" fill="rgb(226, 232, 240)" />
      <rect x="20" y="86" width="160" height="2" fill="rgb(226, 232, 240)" />
      <rect x="20" y="100" width="170" height="2" fill="rgb(226, 232, 240)" />
      <rect x="20" y="108" width="155" height="2" fill="rgb(226, 232, 240)" />
    </svg>
  )
}

// Creative Template Thumbnail
function CreativeThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Creative template preview"
    >
      <title>Creative Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="20" y="20" width="85" height="8" fill="rgb(139, 92, 246)" />
      <rect x="20" y="32" width="65" height="4" fill="rgb(20, 184, 166)" />
      <circle cx="25" cy="60" r="3" fill="rgb(139, 92, 246)" />
      <rect x="32" y="58" width="150" height="2" fill="rgb(229, 231, 235)" />
      <circle cx="25" cy="72" r="3" fill="rgb(20, 184, 166)" />
      <rect x="32" y="70" width="145" height="2" fill="rgb(229, 231, 235)" />
      <circle cx="25" cy="84" r="3" fill="rgb(139, 92, 246)" />
      <rect x="32" y="82" width="140" height="2" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Executive Template Thumbnail
function ExecutiveThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Executive template preview"
    >
      <title>Executive Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="20" y="25" width="95" height="10" fill="rgb(17, 24, 39)" />
      <rect x="20" y="40" width="75" height="4" fill="rgb(75, 85, 99)" />
      <rect x="20" y="48" width="85" height="3" fill="rgb(107, 114, 128)" />
      <rect x="20" y="70" width="50" height="6" fill="rgb(75, 85, 99)" />
      <rect x="20" y="82" width="170" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="90" width="165" height="3" fill="rgb(229, 231, 235)" />
      <rect x="20" y="98" width="160" height="3" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Two Column Template Thumbnail
function TwoColumnThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Two column template preview"
    >
      <title>Two Column Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="0" y="0" width="70" height="297" fill="rgb(79, 70, 229)" />
      <rect x="10" y="20" width="50" height="6" fill="white" opacity="0.9" />
      <rect x="10" y="35" width="45" height="3" fill="white" opacity="0.7" />
      <rect x="10" y="60" width="50" height="2" fill="white" opacity="0.6" />
      <rect x="10" y="68" width="48" height="2" fill="white" opacity="0.6" />
      <rect x="85" y="20" width="60" height="7" fill="rgb(17, 24, 39)" />
      <rect x="85" y="50" width="110" height="2" fill="rgb(229, 231, 235)" />
      <rect x="85" y="58" width="105" height="2" fill="rgb(229, 231, 235)" />
      <rect x="85" y="66" width="100" height="2" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Compact Template Thumbnail
function CompactThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Compact template preview"
    >
      <title>Compact Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="12" y="12" width="70" height="6" fill="rgb(17, 24, 39)" />
      <rect x="12" y="21" width="50" height="3" fill="rgb(107, 114, 128)" />
      <rect x="12" y="35" width="186" height="2" fill="rgb(229, 231, 235)" />
      <rect x="12" y="40" width="182" height="2" fill="rgb(229, 231, 235)" />
      <rect x="12" y="45" width="178" height="2" fill="rgb(229, 231, 235)" />
      <rect x="12" y="50" width="186" height="2" fill="rgb(229, 231, 235)" />
      <rect x="12" y="55" width="180" height="2" fill="rgb(229, 231, 235)" />
      <rect x="12" y="60" width="175" height="2" fill="rgb(229, 231, 235)" />
    </svg>
  )
}

// Elegant Template Thumbnail
function ElegantThumbnail() {
  return (
    <svg
      viewBox="0 0 210 297"
      className={css({ w: 'full', h: 'full' })}
      aria-label="Elegant template preview"
    >
      <title>Elegant Template Preview</title>
      <rect width="210" height="297" fill="white" />
      <rect x="50" y="30" width="110" height="12" fill="rgb(79, 70, 229)" />
      <rect x="65" y="47" width="80" height="4" fill="rgb(107, 114, 128)" />
      <line x1="80" y1="58" x2="130" y2="58" stroke="rgb(79, 70, 229)" strokeWidth="1" />
      <rect x="40" y="82" width="130" height="2" fill="rgb(229, 231, 235)" />
      <rect x="45" y="90" width="120" height="2" fill="rgb(229, 231, 235)" />
      <rect x="50" y="98" width="110" height="2" fill="rgb(229, 231, 235)" />
    </svg>
  )
}
