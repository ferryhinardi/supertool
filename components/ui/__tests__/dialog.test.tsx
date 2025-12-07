import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../dialog'

describe('Dialog', () => {
  it('renders dialog when open', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('renders dialog content', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <p>Dialog body content</p>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Dialog body content')).toBeInTheDocument()
  })
})
