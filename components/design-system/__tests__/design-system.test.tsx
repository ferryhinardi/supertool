import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandMark } from '@/components/design-system/BrandMark'
import { Eyebrow } from '@/components/design-system/Eyebrow'
import { PrivacySection } from '@/components/design-system/PrivacySection'
import { ProofStrip } from '@/components/design-system/ProofStrip'
import { accentForCategory, palette } from '@/lib/design-system'

describe('design system tokens', () => {
  it('uses the revamp canvas and violet', () => {
    expect(palette.canvas).toBe('#07090e')
    expect(palette.violet).toBe('#8b6cff')
  })

  it('maps categories to accents', () => {
    expect(accentForCategory('security')).toBe('amber')
    expect(accentForCategory('media')).toBe('mint')
    expect(accentForCategory('unknown')).toBe('violet')
  })
})

describe('design system components', () => {
  it('renders the brand name treatment pieces', () => {
    render(
      <div>
        <BrandMark />
        <Eyebrow>111 tools</Eyebrow>
      </div>
    )
    expect(screen.getByText('111 tools')).toBeInTheDocument()
  })

  it('renders proof facts', () => {
    render(<ProofStrip items={[{ value: '111', label: 'free tools' }]} />)
    expect(screen.getByRole('region', { name: 'SuperTool facts' })).toBeInTheDocument()
    expect(screen.getByText('free tools')).toBeInTheDocument()
  })

  it('renders the privacy promise', () => {
    render(<PrivacySection />)
    expect(screen.getByRole('heading', { name: 'Your work stays yours.' })).toBeInTheDocument()
    expect(screen.getByText('Nothing uploaded')).toBeInTheDocument()
  })
})
