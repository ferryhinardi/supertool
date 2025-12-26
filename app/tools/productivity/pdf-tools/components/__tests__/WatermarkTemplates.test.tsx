import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WatermarkTemplates, watermarkPresets } from '../WatermarkTemplates'

describe('WatermarkTemplates', () => {
  it('should render the component with title', () => {
    const onSelectTemplate = vi.fn()
    render(<WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />)

    expect(screen.getByText('Quick Templates')).toBeInTheDocument()
  })

  it('should render all preset templates', () => {
    const onSelectTemplate = vi.fn()
    render(<WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />)

    // Check that all 6 presets are rendered
    expect(screen.getByText('Confidential')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Sample')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Urgent')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('should highlight the current template', () => {
    const onSelectTemplate = vi.fn()
    render(
      <WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Confidential" />
    )

    const confidentialButton = screen.getByText('Confidential').closest('button')
    expect(confidentialButton).toHaveClass('bg-red-600')
  })

  it('should call onSelectTemplate when a template is clicked', async () => {
    const user = userEvent.setup()
    const onSelectTemplate = vi.fn()
    render(<WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />)

    const draftButton = screen.getByText('Draft').closest('button')
    if (draftButton) {
      await user.click(draftButton)
    }

    expect(onSelectTemplate).toHaveBeenCalledTimes(1)
    expect(onSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Draft',
        text: 'DRAFT',
      })
    )
  })

  it('should render template icons', () => {
    const onSelectTemplate = vi.fn()
    const { container } = render(
      <WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />
    )

    // Check that SVG icons are present (lucide-react icons render as SVGs)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('should allow clicking on different templates', async () => {
    const user = userEvent.setup()
    const onSelectTemplate = vi.fn()
    render(<WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />)

    // Click multiple templates
    const confidentialButton = screen.getByText('Confidential').closest('button')
    const copyButton = screen.getByText('Copy').closest('button')

    if (confidentialButton) await user.click(confidentialButton)
    if (copyButton) await user.click(copyButton)

    expect(onSelectTemplate).toHaveBeenCalledTimes(2)
  })

  describe('watermarkPresets', () => {
    it('should have 6 preset templates', () => {
      expect(watermarkPresets).toHaveLength(6)
    })

    it('should have all required properties for each preset', () => {
      watermarkPresets.forEach((preset) => {
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('text')
        expect(preset).toHaveProperty('opacity')
        expect(preset).toHaveProperty('rotation')
        expect(preset).toHaveProperty('position')
        expect(preset).toHaveProperty('color')
        expect(preset).toHaveProperty('fontSize')
        expect(preset).toHaveProperty('pattern')
        expect(preset).toHaveProperty('icon')
      })
    })

    it('should have valid opacity values (0-1)', () => {
      watermarkPresets.forEach((preset) => {
        expect(preset.opacity).toBeGreaterThanOrEqual(0)
        expect(preset.opacity).toBeLessThanOrEqual(1)
      })
    })

    it('should have valid rotation values', () => {
      watermarkPresets.forEach((preset) => {
        expect(preset.rotation).toBeGreaterThanOrEqual(-180)
        expect(preset.rotation).toBeLessThanOrEqual(180)
      })
    })

    it('should have valid font sizes', () => {
      watermarkPresets.forEach((preset) => {
        expect(preset.fontSize).toBeGreaterThan(0)
        expect(preset.fontSize).toBeLessThanOrEqual(100)
      })
    })

    it('should have valid position values', () => {
      const validPositions = [
        'top-left',
        'top',
        'top-right',
        'left',
        'center',
        'right',
        'bottom-left',
        'bottom',
        'bottom-right',
        'diagonal',
      ]

      watermarkPresets.forEach((preset) => {
        expect(validPositions).toContain(preset.position)
      })
    })

    it('should have valid color hex codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

      watermarkPresets.forEach((preset) => {
        expect(preset.color).toMatch(hexColorRegex)
      })
    })

    it('should have non-empty text', () => {
      watermarkPresets.forEach((preset) => {
        expect(preset.text).toBeTruthy()
        expect(preset.text.length).toBeGreaterThan(0)
      })
    })

    it('should have Confidential preset with pattern enabled', () => {
      const confidential = watermarkPresets.find((p) => p.name === 'Confidential')
      expect(confidential?.pattern).toBe(true)
    })

    it('should have Draft preset with specific properties', () => {
      const draft = watermarkPresets.find((p) => p.name === 'Draft')
      expect(draft).toBeDefined()
      expect(draft?.text).toBe('DRAFT')
      expect(draft?.color).toBe('#ff9800')
    })

    it('should have Copy preset with diagonal position', () => {
      const copy = watermarkPresets.find((p) => p.name === 'Copy')
      expect(copy?.position).toBe('diagonal')
    })

    it('should have Custom preset', () => {
      const custom = watermarkPresets.find((p) => p.name === 'Custom')
      expect(custom).toBeDefined()
      expect(custom?.text).toBe('CUSTOM TEXT')
    })

    it('should have Urgent preset', () => {
      const urgent = watermarkPresets.find((p) => p.name === 'Urgent')
      expect(urgent).toBeDefined()
      expect(urgent?.text).toBe('URGENT')
    })
  })

  describe('responsive layout', () => {
    it('should render in a grid layout', () => {
      const onSelectTemplate = vi.fn()
      const { container } = render(
        <WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />
      )

      // Check that the grid container exists
      const gridContainer = container.querySelector('[class*="grid"]')
      expect(gridContainer).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible button roles', () => {
      const onSelectTemplate = vi.fn()
      render(<WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(6) // 6 template buttons
    })

    it('should render template names as text', () => {
      const onSelectTemplate = vi.fn()
      render(<WatermarkTemplates onSelectTemplate={onSelectTemplate} currentTemplate="Custom" />)

      watermarkPresets.forEach((preset) => {
        expect(screen.getByText(preset.name)).toBeInTheDocument()
      })
    })
  })
})
