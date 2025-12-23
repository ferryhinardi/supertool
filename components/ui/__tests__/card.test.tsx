import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

describe('Card Component', () => {
  it('renders card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Content</p>
        </CardContent>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = screen.getByText('Content').closest('div')?.parentElement
    expect(card).toHaveClass('custom-class')
  })

  it('renders without optional parts', () => {
    render(
      <Card>
        <CardContent>Only content</CardContent>
      </Card>
    )

    expect(screen.getByText('Only content')).toBeInTheDocument()
  })

  it('CardContent has no top padding by default (for use with CardHeader)', () => {
    render(
      <Card>
        <CardContent data-testid="card-content">Content</CardContent>
      </Card>
    )

    const content = screen.getByTestId('card-content')
    expect(content).toHaveClass('p_6', 'pt_0')
  })

  it('CardContent has top padding when withTopPadding is true', () => {
    render(
      <Card>
        <CardContent withTopPadding data-testid="card-content">
          Content
        </CardContent>
      </Card>
    )

    const content = screen.getByTestId('card-content')
    expect(content).toHaveClass('p_6', 'pt_6')
  })

  it('CardFooter has no top padding by default', () => {
    render(
      <Card>
        <CardFooter data-testid="card-footer">Footer</CardFooter>
      </Card>
    )

    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveClass('p_6', 'pt_0')
  })

  it('CardFooter has top padding when withTopPadding is true', () => {
    render(
      <Card>
        <CardFooter withTopPadding data-testid="card-footer">
          Footer
        </CardFooter>
      </Card>
    )

    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveClass('p_6', 'pt_6')
  })
})
