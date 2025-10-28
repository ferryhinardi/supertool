import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import IPLookupPage from '../page'

describe('IPLookupPage', () => {
  it('renders the page title', () => {
    render(<IPLookupPage />)
    expect(screen.getByText(/IP Address Lookup/i)).toBeInTheDocument()
  })

  it('renders the lookup button', () => {
    render(<IPLookupPage />)
    expect(screen.getByRole('button', { name: /Lookup/i })).toBeInTheDocument()
  })

  it('renders the my ip button', () => {
    render(<IPLookupPage />)
    expect(screen.getByRole('button', { name: /My IP/i })).toBeInTheDocument()
  })
})
