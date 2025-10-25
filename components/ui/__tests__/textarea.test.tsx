import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  it('renders textarea field', () => {
    render(<Textarea placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="Type here" />)

    const textarea = screen.getByPlaceholderText('Type here')
    await user.type(textarea, 'Hello World\nMultiline text')

    expect(textarea).toHaveValue('Hello World\nMultiline text')
  })

  it('applies disabled state', () => {
    render(<Textarea disabled placeholder="Disabled" />)
    const textarea = screen.getByPlaceholderText('Disabled')
    expect(textarea).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" placeholder="Custom" />)
    const textarea = screen.getByPlaceholderText('Custom')
    expect(textarea).toHaveClass('custom-textarea')
  })

  it('handles onChange event', async () => {
    const user = userEvent.setup()
    let value = ''
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      value = e.target.value
    }

    render(<Textarea onChange={handleChange} placeholder="Change me" />)
    const textarea = screen.getByPlaceholderText('Change me')

    await user.type(textarea, 'Test')
    expect(value).toBe('Test')
  })

  it('accepts default value', () => {
    render(<Textarea defaultValue="Default text" />)
    const textarea = screen.getByDisplayValue('Default text')
    expect(textarea).toHaveValue('Default text')
  })

  it('applies rows attribute', () => {
    render(<Textarea rows={5} placeholder="Rows" />)
    const textarea = screen.getByPlaceholderText('Rows')
    expect(textarea).toHaveAttribute('rows', '5')
  })
})
