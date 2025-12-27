import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('renders label with text content', () => {
    render(<Label>Username</Label>)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('renders as a label element', () => {
    const { container } = render(<Label>Email Address</Label>)
    const label = container.querySelector('label')
    expect(label).toBeInTheDocument()
  })

  it('applies htmlFor attribute correctly', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('associates with input via htmlFor', () => {
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>
    )

    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox')

    expect(label).toHaveAttribute('for', 'username')
    expect(input).toHaveAttribute('id', 'username')
  })

  it('accepts custom className', () => {
    const { container } = render(<Label className="custom-class">Custom Label</Label>)
    const label = container.querySelector('label')
    expect(label?.className).toContain('custom-class')
  })

  it('applies base styles', () => {
    const { container } = render(<Label>Styled Label</Label>)
    const label = container.querySelector('label')
    expect(label?.className).toBeTruthy()
  })

  it('merges custom className with base styles', () => {
    const { container } = render(<Label className="extra-styling">Merged Styles</Label>)
    const label = container.querySelector('label')
    const classes = label?.className || ''

    // Should have both base styles and custom class
    expect(classes).toContain('extra-styling')
    expect(classes.length).toBeGreaterThan('extra-styling'.length)
  })

  it('forwards additional props to label element', () => {
    render(
      <Label data-testid="custom-label" aria-label="Accessible Label">
        Test Label
      </Label>
    )

    const label = screen.getByTestId('custom-label')
    expect(label).toHaveAttribute('aria-label', 'Accessible Label')
  })

  it('renders with children components', () => {
    render(
      <Label>
        <span>Field Name</span>
        <span> (required)</span>
      </Label>
    )

    expect(screen.getByText(/Field Name/)).toBeInTheDocument()
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument()
  })

  it('handles empty children gracefully', () => {
    const { container } = render(<Label />)
    const label = container.querySelector('label')
    expect(label).toBeInTheDocument()
    expect(label?.textContent).toBe('')
  })

  it('supports onClick handler', () => {
    let clicked = false
    const handleClick = () => {
      clicked = true
    }

    render(<Label onClick={handleClick}>Clickable Label</Label>)
    const label = screen.getByText('Clickable Label')
    label.click()

    expect(clicked).toBe(true)
  })

  it('can be used in forms', () => {
    render(
      <form>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" name="email" />
      </form>
    )

    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')

    expect(label.tagName).toBe('LABEL')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('maintains accessibility with form controls', () => {
    render(
      <>
        <Label htmlFor="password">Password</Label>
        <input id="password" type="password" />
      </>
    )

    const label = screen.getByText('Password')
    const input = document.getElementById('password')

    // Label should point to input
    expect(label).toHaveAttribute('for', 'password')
    // Input should exist and be password type
    expect(input).toHaveAttribute('type', 'password')
  })

  it('supports multiple labels for same input', () => {
    render(
      <div>
        <Label htmlFor="multi-input">Primary Label</Label>
        <Label htmlFor="multi-input">Secondary Label</Label>
        <input id="multi-input" type="text" />
      </div>
    )

    const labels = screen.getAllByText(/Label$/)
    expect(labels).toHaveLength(2)
    labels.forEach((label) => {
      expect(label).toHaveAttribute('for', 'multi-input')
    })
  })

  it('works with disabled inputs', () => {
    render(
      <>
        <Label htmlFor="disabled-input">Disabled Field</Label>
        <input id="disabled-input" type="text" disabled />
      </>
    )

    const label = screen.getByText('Disabled Field')
    const input = document.getElementById('disabled-input')

    expect(label).toHaveAttribute('for', 'disabled-input')
    expect(input).toBeDisabled()
  })

  it('renders complex label content', () => {
    render(
      <Label htmlFor="complex">
        <strong>Important</strong> Field
      </Label>
    )

    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText(/Field/)).toBeInTheDocument()
  })

  it('preserves text formatting in children', () => {
    render(
      <Label>
        Line 1{'\n'}
        Line 2
      </Label>
    )

    const label = screen.getByText(/Line 1/)
    expect(label.textContent).toContain('Line 1')
    expect(label.textContent).toContain('Line 2')
  })
})
