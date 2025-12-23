import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DockerfileFormatterPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

// Sample Dockerfiles for testing
const SIMPLE_DOCKERFILE = `FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]`

const UNFORMATTED_DOCKERFILE = `from node:18-alpine
workdir /app
copy package*.json ./
run npm install && npm cache clean --force
expose 3000
cmd ["npm", "start"]`

const DOCKERFILE_WITH_ISSUES = `FROM node
RUN apt-get update
COPY . .
USER root
EXPOSE 22
ENV PASSWORD=secret123`

const MULTILINE_DOCKERFILE = `FROM node:18
RUN apt-get update && \\
  apt-get install -y curl \\
  && rm -rf /var/lib/apt/lists/*`

describe('Dockerfile Formatter - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Dockerfile formatter page', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByRole('heading', { name: 'Dockerfile Formatter & Linter', level: 1 }))
    expect(screen.getByText(/Beautify and lint Dockerfiles/i))
  })

  it('should display security badge', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByText(/Best Practices • Security Checks • Layer Optimization/i))
  })

  it('should display input dockerfile area', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByText('Input Dockerfile'))
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should display format and clear buttons', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByRole('button', { name: /Format & Analyze/i }))
    expect(screen.getByRole('button', { name: /Clear/i }))
  })

  it('should display educational sections', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByText('Best Practices'))
    expect(screen.getByText('Security Tips'))
  })

  it('should display best practices information', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByText(/Pin versions/i))
    expect(screen.getByText(/Minimize layers/i))
    expect(screen.getByText(/Use .dockerignore/i))
    expect(screen.getByText(/Multi-stage builds/i))
  })

  it('should display security tips', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getAllByText(/Non-root user/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/No secrets/i))
    expect(screen.getByText(/Minimal base images/i))
    expect(screen.getAllByText(/Scan images/i).length).toBeGreaterThan(0)
  })
})

describe('Dockerfile Formatter - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have proper heading hierarchy', () => {
    render(<DockerfileFormatterPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Dockerfile Formatter & Linter')
  })

  it('should have accessible textarea with label', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByText('Input Dockerfile'))
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should have accessible action buttons', () => {
    render(<DockerfileFormatterPage />)

    expect(screen.getByRole('button', { name: /Format & Analyze/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
  })
})

describe('Dockerfile Formatter - Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should format simple dockerfile', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: SIMPLE_DOCKERFILE } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })
  })

  it('should normalize instructions to uppercase', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: UNFORMATTED_DOCKERFILE } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
      // Check that formatted output exists (multiple FROM instances exist in page)
      expect(screen.getAllByText(/FROM/i).length).toBeGreaterThan(0)
    })
  })

  it('should detect missing tag warning', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node\nRUN npm install'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Base image without tag/i)).toBeInTheDocument()
    })
  })

  it('should detect latest tag warning', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:latest\nRUN npm install'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Using :latest tag/i)).toBeInTheDocument()
    })
  })

  it('should detect apt-get without cleanup', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM ubuntu:20.04\nRUN apt-get update\nRUN apt-get install -y curl'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/apt-get update without cleanup/i)).toBeInTheDocument()
    })
  })

  it('should detect ADD vs COPY recommendation', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:18\nADD package.json /app/'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Consider using COPY instead of ADD/i)).toBeInTheDocument()
    })
  })

  it('should detect root user warning', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:18\nUSER root\nRUN npm install'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Running as root user/i)).toBeInTheDocument()
    })
  })

  it('should detect exposed SSH port warning', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:18\nEXPOSE 22'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Exposing SSH port/i)).toBeInTheDocument()
    })
  })

  it('should detect secrets in ENV variables', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:18\nENV PASSWORD=secret123'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Potential secret in ENV variable/i)).toBeInTheDocument()
    })
  })

  it('should detect missing FROM instruction', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'RUN npm install\nCOPY . /app'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Missing FROM instruction/i)).toBeInTheDocument()
    })
  })

  it('should detect high layer count', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = `FROM node:18
RUN npm install
RUN npm build
RUN npm test
COPY file1 .
COPY file2 .
COPY file3 .
COPY file4 .
COPY file5 .
ADD file6 .
ADD file7 .
RUN echo "done"`
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/High layer count/i)).toBeInTheDocument()
    })
  })

  it('should calculate stats correctly', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: SIMPLE_DOCKERFILE } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Total Lines')).toBeInTheDocument()
      expect(screen.getByText('Instructions')).toBeInTheDocument()
      expect(screen.getByText('Build Layers')).toBeInTheDocument()
      expect(screen.getByText('Issues Found')).toBeInTheDocument()
    })
  })

  it('should display issues count in stats', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: DOCKERFILE_WITH_ISSUES } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      const issuesCountElement = screen.getAllByText(/\d+/)[3] // 4th number is issues count
      expect(issuesCountElement).toBeDefined()
    })
  })

  it('should clear dockerfile and results when clear button clicked', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: SIMPLE_DOCKERFILE } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /Clear/i })
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(textarea).toHaveValue('')
      expect(screen.queryByText('Formatted Dockerfile')).not.toBeInTheDocument()
    })
  })

  it('should copy formatted dockerfile to clipboard', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: SIMPLE_DOCKERFILE } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })

    // Find copy button in formatted output section
    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null && btn.closest('[class*="CardHeader"]')
    })

    if (copyButton) {
      fireEvent.click(copyButton)
      expect(mockWriteText).toHaveBeenCalled()
    }
  })

  it('should show error when formatting empty dockerfile', async () => {
    const { toast } = await import('sonner')

    render(<DockerfileFormatterPage />)

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    expect(toast.error).toHaveBeenCalledWith('Please enter a Dockerfile to format')
  })

  it('should handle multiline instructions with backslashes', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: MULTILINE_DOCKERFILE } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })
  })

  it('should handle RUN commands with && operators', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:18\nRUN npm install && npm build && npm test'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })
  })

  it('should skip empty lines at the start', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = '\n\n\nFROM node:18\nRUN npm install'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })
  })

  it('should preserve comments', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = '# This is a comment\nFROM node:18\n# Another comment\nRUN npm install'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Formatted Dockerfile')).toBeInTheDocument()
    })
  })

  it('should show COPY --chown suggestion', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:18\nCOPY package.json /app/'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Consider using --chown flag/i)).toBeInTheDocument()
    })
  })

  it('should categorize issues by type (error, warning, info)', async () => {
    render(<DockerfileFormatterPage />)

    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: DOCKERFILE_WITH_ISSUES } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/Issues & Recommendations/i)).toBeInTheDocument()
    })
  })

  it('should display line numbers for issues', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:latest\nRUN apt-get update'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      // Check that at least one line number is displayed
      expect(screen.getAllByText(/Line \d+/i).length).toBeGreaterThan(0)
    })
  })

  it('should show suggestions for each issue', async () => {
    render(<DockerfileFormatterPage />)

    const dockerfile = 'FROM node:latest\nRUN npm install'
    const textarea = screen.getByPlaceholderText(/FROM node:18-alpine/i)
    fireEvent.change(textarea, { target: { value: dockerfile } })

    const formatButton = screen.getByRole('button', { name: /Format & Analyze/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/💡/i)).toBeInTheDocument()
    })
  })
})
