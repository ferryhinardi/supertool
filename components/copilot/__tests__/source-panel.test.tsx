import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LocalFileInfo } from '@/lib/services/local-files'

import { SourcePanel } from '../source-panel'

// Mock child components to isolate SourcePanel tests
vi.mock('../github-panel', () => ({
  GitHubPanel: () => <div data-testid="github-panel">GitHub Panel</div>,
}))

vi.mock('../local-file-browser', () => ({
  LocalFileBrowser: (props: { files?: LocalFileInfo[] }) => (
    <div data-testid="local-file-browser">
      Local File Browser - Files: {props.files?.length ?? 0}
    </div>
  ),
}))

// Mock data
const mockLocalFiles: LocalFileInfo[] = [
  {
    path: 'test.ts',
    name: 'test.ts',
    type: 'text/typescript',
    size: 1024,
    extension: 'ts',
    modifiedAt: Date.now(),
    isDirectory: false,
    relativePath: 'test.ts',
  },
]

describe('SourcePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Default Rendering', () => {
    it('renders with GitHub tab active by default', () => {
      render(<SourcePanel />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      expect(githubTab).toHaveAttribute('aria-selected', 'true')
    })

    it('renders GitHub panel content by default', () => {
      render(<SourcePanel />)

      expect(screen.getByTestId('github-panel')).toBeInTheDocument()
    })

    it('does not render Local panel content by default', () => {
      render(<SourcePanel />)

      expect(screen.queryByTestId('local-file-browser')).not.toBeInTheDocument()
    })
  })

  describe('Initial Source Prop', () => {
    it('renders with Local tab active when initialSource is local', () => {
      render(<SourcePanel initialSource="local" />)

      const localTab = screen.getByRole('tab', { name: /local/i })
      expect(localTab).toHaveAttribute('aria-selected', 'true')
    })

    it('renders Local panel content when initialSource is local', () => {
      render(<SourcePanel initialSource="local" />)

      expect(screen.getByTestId('local-file-browser')).toBeInTheDocument()
    })

    it('does not render GitHub panel when initialSource is local', () => {
      render(<SourcePanel initialSource="local" />)

      expect(screen.queryByTestId('github-panel')).not.toBeInTheDocument()
    })

    it('renders with GitHub tab active when initialSource is github', () => {
      render(<SourcePanel initialSource="github" />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      expect(githubTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Tab Switching', () => {
    it('switches to Local tab when clicked', async () => {
      const user = userEvent.setup()
      render(<SourcePanel />)

      const localTab = screen.getByRole('tab', { name: /local/i })
      await user.click(localTab)

      expect(localTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('local-file-browser')).toBeInTheDocument()
    })

    it('switches to GitHub tab when clicked', async () => {
      const user = userEvent.setup()
      render(<SourcePanel initialSource="local" />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      await user.click(githubTab)

      expect(githubTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('github-panel')).toBeInTheDocument()
    })

    it('calls onSourceChange callback when tab changes', async () => {
      const user = userEvent.setup()
      const onSourceChange = vi.fn()
      render(<SourcePanel onSourceChange={onSourceChange} />)

      const localTab = screen.getByRole('tab', { name: /local/i })
      await user.click(localTab)

      expect(onSourceChange).toHaveBeenCalledWith('local')
    })

    it('calls onSourceChange with github when switching to GitHub tab', async () => {
      const user = userEvent.setup()
      const onSourceChange = vi.fn()
      render(<SourcePanel initialSource="local" onSourceChange={onSourceChange} />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      await user.click(githubTab)

      expect(onSourceChange).toHaveBeenCalledWith('github')
    })

    it('does not call onSourceChange when clicking already active tab', async () => {
      const user = userEvent.setup()
      const onSourceChange = vi.fn()
      render(<SourcePanel onSourceChange={onSourceChange} />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      await user.click(githubTab)

      // Should not be called since github is already active
      expect(onSourceChange).not.toHaveBeenCalled()
    })
  })

  describe('Tab Panel Content', () => {
    it('renders correct tabpanel for GitHub source', () => {
      render(<SourcePanel initialSource="github" />)

      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toBeInTheDocument()
      expect(screen.getByTestId('github-panel')).toBeInTheDocument()
    })

    it('renders correct tabpanel for Local source', () => {
      render(<SourcePanel initialSource="local" />)

      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toBeInTheDocument()
      expect(screen.getByTestId('local-file-browser')).toBeInTheDocument()
    })
  })

  describe('ARIA Attributes', () => {
    it('has role="tablist" for tab container', () => {
      render(<SourcePanel />)

      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('has role="tab" for each tab', () => {
      render(<SourcePanel />)

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(2)
    })

    it('has aria-selected attribute on tabs', () => {
      render(<SourcePanel />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      const localTab = screen.getByRole('tab', { name: /local/i })

      expect(githubTab).toHaveAttribute('aria-selected', 'true')
      expect(localTab).toHaveAttribute('aria-selected', 'false')
    })

    it('has role="tabpanel" for content area', () => {
      render(<SourcePanel />)

      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('updates aria-selected when tab changes', async () => {
      const user = userEvent.setup()
      render(<SourcePanel />)

      const githubTab = screen.getByRole('tab', { name: /github/i })
      const localTab = screen.getByRole('tab', { name: /local/i })

      // Initially GitHub is selected
      expect(githubTab).toHaveAttribute('aria-selected', 'true')
      expect(localTab).toHaveAttribute('aria-selected', 'false')

      // Click Local tab
      await user.click(localTab)

      // Now Local is selected
      expect(githubTab).toHaveAttribute('aria-selected', 'false')
      expect(localTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Props Passing', () => {
    it('passes localFiles prop to LocalFileBrowser', () => {
      render(<SourcePanel initialSource="local" localFiles={mockLocalFiles} />)

      // Our mock displays the file count
      expect(screen.getByText(/Local File Browser - Files: 1/)).toBeInTheDocument()
    })

    it('passes empty array when no localFiles provided', () => {
      render(<SourcePanel initialSource="local" />)

      expect(screen.getByText(/Local File Browser - Files: 0/)).toBeInTheDocument()
    })
  })

  describe('Callback Props', () => {
    it('handles undefined onSourceChange gracefully', async () => {
      const user = userEvent.setup()
      render(<SourcePanel />)

      const localTab = screen.getByRole('tab', { name: /local/i })

      // Should not throw
      await user.click(localTab)

      expect(localTab).toHaveAttribute('aria-selected', 'true')
    })

    it('handles undefined onLocalFilesSelect gracefully', () => {
      render(<SourcePanel initialSource="local" />)

      expect(screen.getByTestId('local-file-browser')).toBeInTheDocument()
    })

    it('handles undefined onLocalFilesUpload gracefully', () => {
      render(<SourcePanel initialSource="local" />)

      expect(screen.getByTestId('local-file-browser')).toBeInTheDocument()
    })
  })

  describe('Tab Labels', () => {
    it('displays GitHub label on GitHub tab', () => {
      render(<SourcePanel />)

      expect(screen.getByRole('tab', { name: /github/i })).toBeInTheDocument()
    })

    it('displays Local label on Local tab', () => {
      render(<SourcePanel />)

      expect(screen.getByRole('tab', { name: /local/i })).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('allows tab selection with Enter key', async () => {
      const user = userEvent.setup()
      const onSourceChange = vi.fn()
      render(<SourcePanel onSourceChange={onSourceChange} />)

      const localTab = screen.getByRole('tab', { name: /local/i })
      localTab.focus()

      await user.keyboard('{Enter}')

      expect(onSourceChange).toHaveBeenCalledWith('local')
    })

    it('allows tab selection with Space key', async () => {
      const user = userEvent.setup()
      const onSourceChange = vi.fn()
      render(<SourcePanel onSourceChange={onSourceChange} />)

      const localTab = screen.getByRole('tab', { name: /local/i })
      localTab.focus()

      await user.keyboard(' ')

      expect(onSourceChange).toHaveBeenCalledWith('local')
    })
  })
})
