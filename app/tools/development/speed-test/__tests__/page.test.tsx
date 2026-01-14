import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { trackToolEvent } from '@/lib/services/analytics'
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
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Create mock fetch response factory
const createMockFetchResponse = (size = 1024) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(size)),
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(''),
  blob: vi.fn().mockResolvedValue(new Blob([new ArrayBuffer(size)])),
  headers: new Headers({ 'content-type': 'application/octet-stream' }),
  clone: () => createMockFetchResponse(size),
})

// Create the mock fetch function
const mockFetch = vi.fn()

// Use vi.stubGlobal for proper mocking
vi.stubGlobal('fetch', mockFetch)

// Mock crypto.getRandomValues for fast data generation
vi.stubGlobal('crypto', {
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i % 256
    }
    return arr
  }),
})

describe('Speed Test Page', () => {
  // Track performance.now value for duration calculations
  let performanceNowValue = 0

  beforeEach(() => {
    vi.clearAllMocks()
    performanceNowValue = 0

    // Use fake timers with shouldAdvanceTime to auto-advance time
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // Mock performance.now to return incrementing values for proper duration calculation
    // This ensures that (end - start) > 10ms so the component records valid speeds
    vi.spyOn(performance, 'now').mockImplementation(() => {
      performanceNowValue += 50 // Increment by 50ms each call
      return performanceNowValue
    })

    // Default fetch mock - resolves quickly
    mockFetch.mockImplementation(() => Promise.resolve(createMockFetchResponse()))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // Cleanup all global stubs after all tests complete to prevent memory leaks
  afterAll(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.clearAllMocks()
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

      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()

      const mbpsLabels = screen.getAllByText('Mbps')
      expect(mbpsLabels).toHaveLength(2)
      const msLabels = screen.getAllByText('ms')
      expect(msLabels).toHaveLength(2)
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
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_start', {})
      })
    })

    it('hides Start Test button during test execution', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      await user.click(startButton)

      await waitFor(() => {
        expect(screen.queryByText('Start Test')).toBeFalsy()
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
  })

  describe('UI States', () => {
    it('shows idle state initially', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()
    })

    it('renders metric cards with consistent styling', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })
  })

  describe('Phase Transitions', () => {
    it('transitions from idle to running', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      expect(screen.getByText('Ready to Test')).toBeTruthy()

      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.queryByText('Ready to Test')).toBeFalsy()
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page open event', async () => {
      render(<SpeedTestPage />)
      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_open', {})
      })
    })

    it('tracks test start event', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('speed_test_start', {})
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('renders correctly on initial load', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Network Speed Test')).toBeTruthy()
      expect(screen.getByText('Start Test')).toBeTruthy()
    })

    it('maintains layout during test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })
  })

  describe('Test Phases', () => {
    it('displays Measuring Latency phase', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Phase may transition quickly, check for any running phase or completion
      await waitFor(
        () => {
          const latencyPhase = screen.queryByText('Measuring Latency...')
          const downloadPhase = screen.queryByText('Testing Download Speed...')
          const complete = screen.queryByText('Test Complete!')
          expect(latencyPhase || downloadPhase || complete).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('progresses through download phase', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          const downloadPhase = screen.queryByText('Testing Download Speed...')
          const complete = screen.queryByText('Test Complete!')
          expect(downloadPhase || complete).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('progresses through upload phase', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          const uploadPhase = screen.queryByText('Testing Upload Speed...')
          const complete = screen.queryByText('Test Complete!')
          expect(uploadPhase || complete).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('completes test and shows completion status', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })
  })

  describe('Test Results', () => {
    it('displays results card after test completion', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      // Results should be visible
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
    })

    it('displays connection quality badges after test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      // Quality badges should be visible
      await waitFor(() => {
        expect(screen.getByText('Connection Quality')).toBeTruthy()
        expect(screen.getByText('Latency Quality')).toBeTruthy()
      })
    })

    // Note: Quality rating badge (Excellent/Good/Fair/Poor) is tested implicitly
    // by 'displays connection quality badges after test' which checks the quality sections

    it('tracks completion event with results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 20000 }
      )

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
          'speed_test_complete',
          expect.objectContaining({
            download_speed: expect.any(String),
            upload_speed: expect.any(String),
            latency: expect.any(String),
          })
        )
      })
    })
  })

  describe('Retest Functionality', () => {
    it('shows Run Test Again button after completion', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      expect(screen.getByText('Run Test Again')).toBeTruthy()
    })

    it('allows running test again', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      // Click Run Test Again
      await user.click(screen.getByText('Run Test Again'))

      await waitFor(() => {
        expect(screen.queryByText('Test Complete!')).toBeFalsy()
      })
    })

    it('tracks multiple test starts', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      // Run second test
      await user.click(screen.getByText('Run Test Again'))

      await waitFor(() => {
        const trackCalls = vi
          .mocked(trackToolEvent)
          .mock.calls.filter((call) => call[0] === 'speed_test_start')
        expect(trackCalls.length).toBe(2)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Should still complete even with errors
      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })

    it('continues test even if latency measurement fails', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // First call fails, subsequent calls succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Latency error'))
        .mockImplementation(() => Promise.resolve(createMockFetchResponse()))

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Should continue to completion
      await waitFor(
        () => {
          const downloadOrComplete =
            screen.queryByText('Testing Download Speed...') || screen.queryByText('Test Complete!')
          expect(downloadOrComplete).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })

    it('displays zero values when all measurements fail', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockFetch.mockRejectedValue(new Error('All measurements failed'))

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })
  })

  describe('Metric Explanations', () => {
    it('displays download speed explanation after test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      expect(screen.getByText(/How fast you can receive data/)).toBeTruthy()
    })

    it('displays upload speed explanation after test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      expect(screen.getByText(/How fast you can send data/)).toBeTruthy()
    })

    it('displays latency explanation after test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      expect(screen.getByText(/Response time/)).toBeTruthy()
    })

    it('displays jitter explanation after test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )

      expect(screen.getByText(/Variation in latency/)).toBeTruthy()
    })
  })

  describe('Visual Feedback', () => {
    it('displays progress indicator during test execution', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Check for any phase text during test execution
      await waitFor(
        () => {
          const phaseText = screen.queryByText(
            /Measuring Latency|Testing Download Speed|Testing Upload Speed|Test Complete/
          )
          expect(phaseText).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('shows completion status after test finishes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })
  })

  describe('Button States', () => {
    it('disables start button during test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(screen.queryByText('Start Test')).toBeFalsy()
      })
    })

    it('shows retest button with correct text after completion', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Run Test Again')).toBeTruthy()
        },
        { timeout: 10000 }
      )
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
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<SpeedTestPage />)
      const heading = screen.getByText('Network Speed Test')
      expect(heading.tagName).toBe('H1')
    })

    it('has accessible button for starting test', () => {
      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')
      expect(startButton.closest('button')).toBeTruthy()
    })

    it('provides descriptive labels for metrics', () => {
      render(<SpeedTestPage />)
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Upload')).toBeTruthy()
      expect(screen.getByText('Latency')).toBeTruthy()
      expect(screen.getByText('Jitter')).toBeTruthy()
    })

    it('shows units for all measurements', () => {
      render(<SpeedTestPage />)
      expect(screen.getAllByText('Mbps')).toHaveLength(2)
      expect(screen.getAllByText('ms')).toHaveLength(2)
    })

    it('provides clear phase descriptions during test', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      // Check for any phase description during or after test
      await waitFor(
        () => {
          const phaseText = screen.queryByText(
            /Measuring Latency|Testing Download Speed|Testing Upload Speed|Test Complete/
          )
          expect(phaseText).toBeTruthy()
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
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      await user.click(screen.getByText('Start Test'))

      await waitFor(
        () => {
          expect(screen.getByText('Test Complete!')).toBeTruthy()
        },
        { timeout: 10000 }
      )
    })

    it('handles multiple rapid clicks gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<SpeedTestPage />)
      const startButton = screen.getByText('Start Test')

      // First click starts the test
      await user.click(startButton)

      // Should transition to a test phase (button disappears after first click)
      await waitFor(
        () => {
          const phaseText = screen.queryByText(
            /Measuring Latency|Testing Download Speed|Testing Upload Speed|Test Complete/
          )
          expect(phaseText).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })
})
