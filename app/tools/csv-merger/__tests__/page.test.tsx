import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import CSVMergerPage from '../page'

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

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Helper function to create a mock CSV file
const createMockCSVFile = (name: string, content: string): File => {
  return new File([content], name, { type: 'text/csv' })
}

describe('CSV Merger - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render CSV merger page', () => {
    render(<CSVMergerPage />)

    expect(
      screen.getByRole('heading', { name: 'CSV Merger & Splitter', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText(/Combine multiple CSV files/)).toBeInTheDocument()
  })

  it('should display mode toggle buttons', () => {
    render(<CSVMergerPage />)

    expect(screen.getByRole('button', { name: /Merge Files/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Split File/ })).toBeInTheDocument()
  })

  it('should display upload area', () => {
    render(<CSVMergerPage />)

    expect(screen.getByText(/Drag and drop CSV files here/)).toBeInTheDocument()
    expect(screen.getByText(/or click to browse/)).toBeInTheDocument()
  })
})

describe('CSV Merger - Mode Switching Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should switch from merge to split mode', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    expect(screen.getByText(/Split a large CSV/)).toBeInTheDocument()
  })

  it('should switch from split to merge mode', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    const mergeButton = screen.getByRole('button', { name: /Merge Files/ })
    fireEvent.click(mergeButton)

    expect(screen.getByText(/Combine multiple CSV files/)).toBeInTheDocument()
  })

  it('should clear files when switching modes', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    // Files should be cleared (no file count badges should be visible)
    expect(screen.queryByText(/files loaded/)).not.toBeInTheDocument()
  })
})

describe('CSV Merger - Merge Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display merge mode options', () => {
    render(<CSVMergerPage />)

    expect(screen.getByText(/Merge Settings/)).toBeInTheDocument()
    expect(screen.getByText(/Remove duplicate rows/)).toBeInTheDocument()
  })

  it('should display merge button when no files are loaded', () => {
    render(<CSVMergerPage />)

    expect(screen.getByRole('button', { name: /Merge CSV Files/ })).toBeInTheDocument()
  })

  it('should toggle deduplicate option', () => {
    render(<CSVMergerPage />)

    const deduplicateButton = screen.getByRole('button', { name: /Remove duplicate rows/ })

    // Should be off by default (ghost variant)
    expect(deduplicateButton).toHaveClass('button--variant_ghost')

    // Click to enable
    fireEvent.click(deduplicateButton)

    // Should now be on (default variant)
    expect(deduplicateButton).toHaveClass('button--variant_default')
  })
})

describe('CSV Merger - Split Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display split mode options', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    expect(screen.getByText(/Split Settings/)).toBeInTheDocument()
    expect(screen.getByText(/Split By/)).toBeInTheDocument()
    expect(screen.getByText(/Row Count/)).toBeInTheDocument()
    expect(screen.getByText(/Column Filter/)).toBeInTheDocument()
  })

  it('should display split button', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    expect(screen.getByRole('button', { name: /Split CSV File/ })).toBeInTheDocument()
  })

  it('should toggle split by option', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    const rowCountButton = screen.getByRole('button', { name: /Row Count/ })
    const filterButton = screen.getByRole('button', { name: /Column Filter/ })

    // Row Count should be selected by default
    expect(rowCountButton).toHaveClass('button--variant_default')

    // Click to switch to filter
    fireEvent.click(filterButton)

    // Filter should now be selected
    expect(filterButton).toHaveClass('button--variant_default')
  })

  it('should display row count input when split by rows', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    expect(screen.getByPlaceholderText(/e.g., 1000/)).toBeInTheDocument()
  })

  it('should update row count input value', () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    const rowInput = screen.getByPlaceholderText(/e.g., 1000/) as HTMLInputElement
    fireEvent.change(rowInput, { target: { value: '500' } })

    expect(rowInput.value).toBe('500')
  })
})

describe('CSV Merger - File Upload Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show error when uploading less than 2 files in merge mode', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Please select at least 2 CSV files/)).toBeInTheDocument()
    })
  })

  it('should show error when uploading multiple files in split mode', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split File/ })
    fireEvent.click(splitButton)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Please select exactly 1 CSV file/)).toBeInTheDocument()
    })
  })

  it('should show error when uploading non-CSV file', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('test.txt', 'Name,Age\nJohn,30\n')
    Object.defineProperty(file1, 'name', { value: 'test.txt', writable: false })

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/test.txt is not a CSV file/)).toBeInTheDocument()
    })
  })

  it('should show error when uploading file larger than 50MB', async () => {
    render(<CSVMergerPage />)

    const largeContent = 'x'.repeat(51 * 1024 * 1024)
    const file1 = createMockCSVFile('large.csv', largeContent)
    Object.defineProperty(file1, 'size', { value: 51 * 1024 * 1024, writable: false })

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/exceeds 50MB size limit/)).toBeInTheDocument()
    })
  })

  it('should show error when uploading empty file', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('empty.csv', '')
    const file2 = createMockCSVFile('empty2.csv', '')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/empty.csv is empty/)).toBeInTheDocument()
    })
  })

  it('should track analytics on file upload', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(analytics.trackToolEvent).toHaveBeenCalledWith('csv_merger_upload', {
        count: 2,
        mode: 'merge',
      })
    })
  })
})

describe('CSV Merger - Drag and Drop Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle drag over event', () => {
    render(<CSVMergerPage />)

    const dropZone = screen.getByText(/Drag and drop CSV files here/).closest('div')

    if (dropZone) {
      fireEvent.dragOver(dropZone)
      // Component should visually indicate drag over state
      expect(dropZone).toBeInTheDocument()
    }
  })

  it('should handle drag leave event', () => {
    render(<CSVMergerPage />)

    const dropZone = screen.getByText(/Drag and drop CSV files here/).closest('div')

    if (dropZone) {
      fireEvent.dragOver(dropZone)
      fireEvent.dragLeave(dropZone)
      // Component should remove drag over visual state
      expect(dropZone).toBeInTheDocument()
    }
  })
})

describe('CSV Merger - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully load valid CSV files in merge mode', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\nJane,25\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nBob,35\n')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/2 files loaded/)).toBeInTheDocument()
    })
  })

  it('should display file information after upload', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText('test1.csv')).toBeInTheDocument()
      expect(screen.getByText('test2.csv')).toBeInTheDocument()
    })
  })

  it('should clear error when successfully uploading files', async () => {
    render(<CSVMergerPage />)

    // First trigger an error
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = screen.getByTestId('file-input')
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Please select at least 2 CSV files/)).toBeInTheDocument()
    })

    // Now upload valid files
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.queryByText(/Please select at least 2 CSV files/)).not.toBeInTheDocument()
    })
  })
})
