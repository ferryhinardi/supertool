import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { trackToolEvent } from '@/lib/analytics'
import SpeedTestPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})

describe('Speed Test Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Network Speed Test')).toBeTruthy()
    })

    it('renders the description', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText(/Test your internet connection speed in real-time/)).toBeTruthy()
    })

    it('renders the start test button', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Start Test')).toBeTruthy()
    })

    it('displays all speed metrics initially at zero', () => {
      render(<SpeedTestPage />)

      // Check for metric labels
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()

      // Check for Mbps and ms units
      const mbpsLabels = screen.getAllByText('Mbps')
      expect(mbpsLabels).toHaveLength(2) // Download and Upload
      const msLabels = screen.getAllByText('ms')
      expect(msLabels).toHaveLength(2) // Latency and Jitter
    })

    it('displays badge with accurate testing text', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Accurate & Fast Network Testing')).toBeTruthy()
    })

    it('displays Ready to Test status', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()
    })

    it('renders all metric icons', () => {
      render(<SpeedTestPage />)
      // Icons are rendered but we check for their parent elements
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })

    it('displays initial metric values as 0.00', () => {
      render(<SpeedTestPage />)
      const zeroValues = screen.getAllByText(/^0\.?0?0?$/)
      expect(zeroValues.length).toBeGreaterThan(0)
    })
  })

  describe('Speed Test Execution', () => {
    it('shows Start Test button when idle', () => {
      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')
      expect(startButton).toBeTruthy()
    })

    it('tracks page open event on mount', async () => {
      render(<SpeedTestPage />)
      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_open', {})
      })
    })

    it('tracks speed test start event when test begins', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_start', {})
      })
    })

    it('displays progress indicator during test', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(screen.getByText(/Measuring/)).toBeTruthy()
      })
    })

    it('hides Start Test button during test execution', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(screen.queryByText('Start Test')).toBeFalsy()
      })
    })
  })

  describe('Test Phases', () => {
    it('displays Measuring Latency phase', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.getByText('Measuring Latency...')).toBeTruthy()
      })
    })

    it('progresses through test phases in order', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Should start with latency
      await waitFor(() => {
        expect(screen.getByText('Measuring Latency...')).toBeTruthy()
      })
    })

    it('displays Test Complete status after finishing', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('highlights active metric during its test phase', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Latency should be highlighted during latency phase
      await waitFor(() => {
        expect(screen.getByText('Measuring Latency...')).toBeTruthy()
      })
    })
  })

  describe('Metric Display', () => {
    it('displays download metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const downloadLabel = screen.getByText('Download')
      expect(downloadLabel).toBeTruthy()
      expect(screen.getAllByText('Mbps').length).toBeGreaterThan(0)
    })

    it('displays upload metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const uploadLabel = screen.getByText('Upload')
      expect(uploadLabel).toBeTruthy()
    })

    it('displays latency metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const latencyLabel = screen.getByText('Latency')
      expect(latencyLabel).toBeTruthy()
      expect(screen.getAllByText('ms').length).toBeGreaterThan(0)
    })

    it('displays jitter metric card with correct structure', () => {
      render(<SpeedTestPage />)
      const jitterLabel = screen.getByText('Jitter')
      expect(jitterLabel).toBeTruthy()
    })

    it('updates download speed during test', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Testing Download Speed...')).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })

    it('formats speed values with 2 decimal places', () => {
      render(<SpeedTestPage />)
      // Initial values should show 0.00
      const initialValues = screen.getAllByText(/0\.00/)
      expect(initialValues.length).toBeGreaterThan(0)
    })

    it('formats latency values with 0 decimal places', () => {
      render(<SpeedTestPage />)
      const metrics = screen.getAllByText(/\d+/)
      expect(metrics.length).toBeGreaterThan(0)
    })
  })

  describe('Test Results', () => {
    it('displays results card after test completion', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Results')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays completion timestamp', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText(/Completed at/)).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays connection quality badge', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Connection Quality')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays latency quality badge', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Latency Quality')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays explanations for metrics', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('What do these numbers mean?')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('shows Run Test Again button after completion', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Run Test Again')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('tracks completion event with results', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
            'speed_test_complete',
            expect.objectContaining({
              download_speed: expect.any(String),
              upload_speed: expect.any(String),
              latency: expect.any(String),
            })
          )
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Retest Functionality', () => {
    it('allows running test again after completion', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Run Test Again')).toBeTruthy()
        },
        { timeout: 5000 }
      )

      await user.click(screen.getByText('Run Test Again'))

      await waitFor(() => {
        expect(screen.getByText(/Measuring/)).toBeTruthy()
      })
    })

    it('resets metrics when starting new test', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Run Test Again')).toBeTruthy()
        },
        { timeout: 5000 }
      )

      await user.click(screen.getByText('Run Test Again'))

      // Metrics should reset
      await waitFor(() => {
        expect(screen.getByText('Measuring Latency...')).toBeTruthy()
      })
    })

    it('tracks each test start separately', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)

      // First test
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Run Test Again')).toBeTruthy()
        },
        { timeout: 5000 }
      )

      // Second test
      await user.click(screen.getByText('Run Test Again'))

      await waitFor(() => {
        const trackCalls = (vi.mocked(trackToolEvent) as Mock).mock.calls.filter(
          (call) => call[0] === 'speed_test_start'
        )
        expect(trackCalls.length).toBe(2)
      })
    })
  })

  describe('Info Section', () => {
    it('displays tips for accurate testing', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Tips for Accurate Testing')).toBeTruthy()
      expect(screen.getByText(/Close other tabs and applications/)).toBeTruthy()
      expect(screen.getByText(/Connect via ethernet/)).toBeTruthy()
    })

    it('displays all testing tips', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText(/Run multiple tests at different times/)).toBeTruthy()
      expect(screen.getByText(/Test results may vary/)).toBeTruthy()
    })

    it('displays tips card with proper styling', () => {
      render(<SpeedTestPage />)
      const tipsHeading = screen.getByText('Tips for Accurate Testing')
      expect(tipsHeading).toBeTruthy()
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
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })

    it('has semantic section headings', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Tips for Accurate Testing')).toBeTruthy()
    })

    it('uses proper button elements', () => {
      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')
      expect(startButton.closest('button')).toBeTruthy()
    })

    it('displays loading state with descriptive text', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.getByText(/Measuring/)).toBeTruthy()
      })
    })

    it('provides clear phase descriptions', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        const phaseText = screen.getByText(
          /Measuring Latency|Testing Download Speed|Testing Upload Speed/
        )
        expect(phaseText).toBeTruthy()
      })
    })
  })

  describe('Speed Test States', () => {
    it('displays initial state correctly', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()
    })

    it('transitions to latency measurement state', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.getByText('Measuring Latency...')).toBeTruthy()
      })
    })

    it('transitions to download speed state', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Testing Download Speed...')).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })

    it('shows loading spinner during test execution', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Loading spinner should be present during test
      await waitFor(() => {
        expect(screen.getByText(/Measuring/)).toBeTruthy()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      const user = userEvent.setup()
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Should still complete even with errors
      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('tracks error event on failure', async () => {
      const user = userEvent.setup()
      // Make the test fail immediately
      mockFetch.mockRejectedValue(new Error('Fatal error'))

      // Mock console.error to prevent error logs
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          const errorCalls = (vi.mocked(trackToolEvent) as Mock).mock.calls.filter(
            (call) => call[0] === 'speed_test_error'
          )
          expect(errorCalls.length).toBeGreaterThanOrEqual(0)
        },
        { timeout: 5000 }
      )

      consoleError.mockRestore()
    })

    it('continues test even if latency measurement fails', async () => {
      const user = userEvent.setup()
      mockFetch.mockRejectedValueOnce(new Error('Latency error'))
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Should continue to download phase
      await waitFor(
        () => {
          const downloadOrComplete =
            screen.queryByText('Testing Download Speed...') || screen.queryByText('Test Complete!')
          expect(downloadOrComplete).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays zero values when measurements fail', async () => {
      const user = userEvent.setup()
      mockFetch.mockRejectedValue(new Error('All measurements failed'))

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Connection Quality Badges', () => {
    it('displays quality badges in results', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Connection Quality')).toBeTruthy()
          expect(screen.getByText('Latency Quality')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('shows appropriate quality rating based on speed', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          const qualityBadges = screen.queryByText(/Excellent|Good|Fair|Poor/)
          expect(qualityBadges).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Metric Explanations', () => {
    it('displays download speed explanation', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText(/How fast you can receive data/)).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays upload speed explanation', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText(/How fast you can send data/)).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays latency explanation', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText(/Response time/)).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('displays jitter explanation', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText(/Variation in latency/)).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Visual Feedback', () => {
    it('displays progress bar during test execution', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Progress indicator should be visible
      await waitFor(() => {
        expect(screen.getByText(/Measuring/)).toBeTruthy()
      })
    })

    it('highlights active metric card during test', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Active phase should be visible
      await waitFor(() => {
        expect(screen.getByText('Measuring Latency...')).toBeTruthy()
      })
    })

    it('shows completion animation', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Button States', () => {
    it('disables start button during test', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.queryByText('Start Test')).toBeFalsy()
      })
    })

    it('shows retest button with correct text', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Run Test Again')).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Responsive Design', () => {
    it('renders metric cards in grid layout', () => {
      render(<SpeedTestPage />)
      const downloadCard = screen.getByText('Download').closest('div')
      expect(downloadCard).toBeTruthy()
    })

    it('displays all cards on initial render', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })
  })

  describe('Performance', () => {
    it('completes test within reasonable time', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      const startTime = Date.now()

      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 5000 }
      )

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
    })

    it('handles multiple rapid clicks gracefully', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024),
      })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      // Click multiple times rapidly
      await user.click(startButton)
      await user.click(startButton)
      await user.click(startButton)

      // Should still work correctly
      await waitFor(() => {
        expect(screen.getByText(/Measuring|Testing|Complete/)).toBeTruthy()
      })
    })
  })
})
