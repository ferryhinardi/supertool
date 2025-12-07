import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ToolRating } from '../tool-rating'

// Mock rating service
vi.mock('@/lib/rating-service', () => ({
  getRatingStats: vi.fn().mockResolvedValue({
    averageRating: 4.5,
    totalRatings: 100,
    ratingDistribution: { 5: 60, 4: 30, 3: 5, 2: 3, 1: 2 },
  }),
  submitRating: vi.fn().mockResolvedValue({ success: true }),
  generateBrowserFingerprint: vi.fn().mockReturnValue('test-fingerprint'),
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('ToolRating', () => {
  it('renders rating component', async () => {
    render(<ToolRating toolId="test-tool" toolName="Test Tool" />)

    // Wait for async loading
    expect(await screen.findByText(/Rate this tool/i)).toBeInTheDocument()
  })

  it('displays average rating when available', async () => {
    render(<ToolRating toolId="test-tool" toolName="Test Tool" />)

    // Should show the average rating
    expect(await screen.findByText(/4.5/)).toBeInTheDocument()
    expect(screen.getByText(/100 ratings/)).toBeInTheDocument()
  })

  it('displays rating distribution', async () => {
    render(<ToolRating toolId="test-tool" toolName="Test Tool" />)

    // Should show rating distribution heading
    expect(await screen.findByText(/rating distribution/i)).toBeInTheDocument()
  })

  it('shows prompt to rate the tool', async () => {
    render(<ToolRating toolId="test-tool" toolName="Test Tool" />)

    // Should ask user to rate
    expect(await screen.findByText(/How would you rate/i)).toBeInTheDocument()
  })
})
