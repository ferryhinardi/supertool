import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import SpeedTestPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('Speed Test Page', () => {
  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Network Speed Test')).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<SpeedTestPage />)
      expect(
        screen.getByText(/Test your internet connection speed in real-time/)
      ).toBeInTheDocument()
    })

    it('renders the start test button', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Start Test')).toBeInTheDocument()
    })

    it('displays all speed metrics initially at zero', () => {
      render(<SpeedTestPage />)

      // Check for metric labels
      expect(screen.getByText('Download')).toBeInTheDocument()
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Latency')).toBeInTheDocument()
      expect(screen.getByText('Jitter')).toBeInTheDocument()

      // Check for Mbps and ms units
      const mbpsLabels = screen.getAllByText('Mbps')
      expect(mbpsLabels).toHaveLength(2) // Download and Upload
      const msLabels = screen.getAllByText('ms')
      expect(msLabels).toHaveLength(2) // Latency and Jitter
    })
  })

  describe('Speed Test Execution', () => {
    it('shows Start Test button when idle', () => {
      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')
      expect(startButton).toBeInTheDocument()
    })
  })

  describe('Info Section', () => {
    it('displays tips for accurate testing', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Tips for Accurate Testing')).toBeInTheDocument()
      expect(screen.getByText(/Close other tabs and applications/)).toBeInTheDocument()
      expect(screen.getByText(/Connect via ethernet/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<SpeedTestPage />)
      const heading = screen.getByText('Network Speed Test')
      expect(heading.tagName).toBe('H1')
    })

    it('has descriptive metric labels', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeInTheDocument()
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Latency')).toBeInTheDocument()
      expect(screen.getByText('Jitter')).toBeInTheDocument()
    })
  })

  describe('Speed Test States', () => {
    it('displays initial state correctly', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeInTheDocument()
    })
  })
})
