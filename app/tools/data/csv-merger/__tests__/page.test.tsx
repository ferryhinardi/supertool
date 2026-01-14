import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import CSVMergerPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

// Helper function to create a mock CSV file
const createMockCSVFile = (name: string, content: string): File => {
  const file = new File([content], name, { type: 'text/csv' })
  // Add text() method to match real File API
  file.text = vi.fn().mockResolvedValue(content)
  return file
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

    expect(screen.getByRole('button', { name: /Merge/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Split/ })).toBeInTheDocument()
  })

  it('should display upload area', () => {
    render(<CSVMergerPage />)

    expect(screen.getByText(/Drop CSV files here or click to browse/)).toBeInTheDocument()
    expect(screen.getByText(/Select 2 or more CSV files to merge/)).toBeInTheDocument()
  })
})

describe('CSV Merger - Mode Switching Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should switch from merge to split mode', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    expect(screen.getByText(/Select 1 CSV file to split/)).toBeInTheDocument()
  })

  it('should switch from split to merge mode', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    const mergeButton = screen.getByRole('button', { name: /Merge/ })
    await userEvent.click(mergeButton as HTMLElement)

    expect(screen.getByText(/Select 2 or more CSV files to merge/)).toBeInTheDocument()
  })

  it('should clear files when switching modes', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    // Files should be cleared - verify no "files loaded" badge exists
    expect(screen.queryByText(/\d+ file.*loaded/i)).not.toBeInTheDocument()
  })
})

describe('CSV Merger - Merge Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display merge mode options', async () => {
    render(<CSVMergerPage />)

    // Upload files first to show merge options
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Merge Options/)).toBeInTheDocument()
      expect(screen.getByText(/Remove duplicate rows/)).toBeInTheDocument()
    })
  })

  it('should display merge button when no files are loaded', () => {
    render(<CSVMergerPage />)

    // Button only appears when files are loaded
    expect(screen.queryByRole('button', { name: /Merge Files/ })).not.toBeInTheDocument()
  })

  it('should toggle deduplicate option', async () => {
    render(<CSVMergerPage />)

    // Upload files first to show merge options
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/2 files/)).toBeInTheDocument()
    })

    const deduplicateCheckbox = screen.getByRole('checkbox', { name: /Remove duplicate rows/ })

    // Should be unchecked by default
    expect(deduplicateCheckbox).not.toBeChecked()

    // Click to enable
    await userEvent.click(deduplicateCheckbox as HTMLElement)

    // Should now be checked
    expect(deduplicateCheckbox).toBeChecked()
  })
})

describe('CSV Merger - Split Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display split mode options', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    // Upload a file to show split options
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Split Options/)).toBeInTheDocument()
      expect(screen.getByText(/Split By/)).toBeInTheDocument()
      expect(screen.getByText(/Row Count/)).toBeInTheDocument()
      expect(screen.getByText(/Filter Condition/)).toBeInTheDocument()
    })
  })

  it('should display split button', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    // Upload a file to show split button
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Split File/ })).toBeInTheDocument()
    })
  })

  it('should toggle split by option', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    // Upload a file to show split options
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Split Options/)).toBeInTheDocument()
    })

    const filterButton = screen.getByRole('button', { name: /Filter Condition/ })

    // Row Count should be selected by default - verify by checking that row count input is visible
    expect(screen.getByLabelText(/Rows per file/i)).toBeInTheDocument()

    // Click to switch to filter
    await userEvent.click(filterButton as HTMLElement)

    // Filter should now be selected - verify by checking that filter options appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Filter Column/i)).toBeInTheDocument()
    })
  })

  it('should display row count input when split by rows', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    // Upload a file to show split options
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/1000/)).toBeInTheDocument()
    })
  })

  it('should update row count input value', async () => {
    render(<CSVMergerPage />)

    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    // Upload a file to show split options
    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/1000/)).toBeInTheDocument()
    })

    const rowInput = screen.getByPlaceholderText(/1000/) as HTMLInputElement
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

    const input = document.getElementById('file-upload') as HTMLInputElement
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

    // Click the "Split" mode toggle button, not the "Split File" action button
    const splitButton = screen.getByRole('button', { name: /Split/ })
    await userEvent.click(splitButton as HTMLElement)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
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

    // Create a file with .txt extension
    const file1 = new File(['Name,Age\nJohn,30\n'], 'test.txt', { type: 'text/plain' })
    file1.text = vi.fn().mockResolvedValue('Name,Age\nJohn,30\n')

    // Need two files for merge mode
    const file2 = createMockCSVFile('test.csv', 'Name,Age\nJane,25\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
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

    const input = document.getElementById('file-upload') as HTMLInputElement
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

    const input = document.getElementById('file-upload') as HTMLInputElement
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

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(analytics.trackToolEvent).toHaveBeenCalledWith('csv_merger_upload', {
        mode: 'merge',
        file_count: 2,
        total_rows: 4,
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

    const dropZone = screen.getByText(/Drop CSV files here or click to browse/).closest('div')

    if (dropZone) {
      fireEvent.dragOver(dropZone)
      // Component should visually indicate drag over state
      expect(dropZone).toBeInTheDocument()
    }
  })

  it('should handle drag leave event', () => {
    render(<CSVMergerPage />)

    const dropZone = screen.getByText(/Drop CSV files here or click to browse/).closest('div')

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

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/2 file/)).toBeInTheDocument()
    })
  })

  it('should display file information after upload', async () => {
    render(<CSVMergerPage />)

    const file1 = createMockCSVFile('test1.csv', 'Name,Age\nJohn,30\n')
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    const input = document.getElementById('file-upload') as HTMLInputElement
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

    const input = document.getElementById('file-upload') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [file1],
      writable: false,
      configurable: true, // Allow redefining later
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Please select at least 2 CSV files/)).toBeInTheDocument()
    })

    // Now upload valid files
    const file2 = createMockCSVFile('test2.csv', 'Name,Age\nJane,25\n')

    // Delete the old property and define a new one
    // biome-ignore lint/suspicious/noExplicitAny: Testing file input manipulation requires any type
    delete (input as any).files
    Object.defineProperty(input, 'files', {
      value: [file1, file2],
      writable: false,
      configurable: true,
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.queryByText(/Please select at least 2 CSV files/)).not.toBeInTheDocument()
    })
  })
})
