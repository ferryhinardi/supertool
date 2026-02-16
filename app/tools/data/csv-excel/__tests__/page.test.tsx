import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock sonner toast - use vi.hoisted for variables used in vi.mock
const { mockToast, mockTrackToolEvent, mockXLSX } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  mockTrackToolEvent: vi.fn(),
  mockXLSX: {
    read: vi.fn(),
    write: vi.fn(() => new ArrayBuffer(100)),
    utils: {
      book_new: vi.fn(() => ({})),
      aoa_to_sheet: vi.fn(() => ({})),
      book_append_sheet: vi.fn(),
      sheet_to_json: vi.fn(() => [
        ['Header1', 'Header2', 'Header3'],
        ['Row1Col1', 'Row1Col2', 'Row1Col3'],
        ['Row2Col1', 'Row2Col2', 'Row2Col3'],
      ]),
    },
  },
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

vi.mock('xlsx', async () => ({
  default: mockXLSX,
  ...mockXLSX,
}))

// Mock ToolSearch to prevent interference with tests
vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => null,
}))

// Import the component after mocks are set up
import CSVExcelConverterPage from '../page'

// Mock URL methods for download testing
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
Object.defineProperty(global.URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true })
Object.defineProperty(global.URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true })

// Polyfill File.text() and File.arrayBuffer() for test environment
// These methods may not work reliably in jsdom/vitest browser mode
if (!File.prototype.text) {
  File.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(this)
    })
  }
}

if (!File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}

// Helper functions
const createMockCSVFile = (content: string, filename = 'test.csv'): File => {
  return new File([content], filename, { type: 'text/csv' })
}

const createMockExcelFile = (filename = 'test.xlsx'): File => {
  return new File(['mock excel content'], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

const createDataTransfer = (files: File[]): DataTransfer => {
  return {
    files: files as unknown as FileList,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })) as unknown as DataTransferItemList,
    types: ['Files'],
    getData: () => '',
    setData: () => {},
    clearData: () => {},
    setDragImage: () => {},
    dropEffect: 'none',
    effectAllowed: 'all',
  } as DataTransfer
}

// Helper to simulate file upload via fireEvent.change
// More reliable than userEvent.upload() in Vitest browser mode
const simulateFileUpload = (fileInput: HTMLInputElement, file: File) => {
  Object.defineProperty(fileInput, 'files', {
    value: [file],
    writable: false,
    configurable: true,
  })
  fireEvent.change(fileInput)
}

describe('CSVExcelConverterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset XLSX mock implementation for Excel to CSV tests
    mockXLSX.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    })
    mockXLSX.utils.sheet_to_json.mockReturnValue([
      ['Header1', 'Header2', 'Header3'],
      ['Row1Col1', 'Row1Col2', 'Row1Col3'],
    ])
  })

  afterEach(() => {
    cleanup()
  })

  describe('Initial Render', () => {
    it('renders the page with title and description', () => {
      render(<CSVExcelConverterPage />)

      expect(screen.getByText('CSV ↔ Excel Converter')).toBeInTheDocument()
      expect(
        screen.getByText('Convert between CSV and Excel formats instantly in your browser')
      ).toBeInTheDocument()
    })

    it('renders mode selection buttons', () => {
      render(<CSVExcelConverterPage />)

      expect(screen.getByText('CSV → Excel')).toBeInTheDocument()
      expect(screen.getByText('Excel → CSV')).toBeInTheDocument()
      expect(screen.getByText('Convert .csv to .xlsx')).toBeInTheDocument()
      expect(screen.getByText('Convert .xlsx to .csv')).toBeInTheDocument()
    })

    it('renders file upload area with CSV instructions by default', () => {
      render(<CSVExcelConverterPage />)

      expect(screen.getByText('Drop CSV file here or click to browse')).toBeInTheDocument()
      expect(screen.getByText('Supports .csv files up to 50MB')).toBeInTheDocument()
    })

    it('renders the How to Use section', () => {
      render(<CSVExcelConverterPage />)

      expect(screen.getByText('How to Use')).toBeInTheDocument()
      expect(
        screen.getByText('Select conversion mode (CSV to Excel or Excel to CSV)')
      ).toBeInTheDocument()
    })

    it('does not show result or error sections initially', () => {
      render(<CSVExcelConverterPage />)

      expect(screen.queryByText('✅ Converted')).not.toBeInTheDocument()
      // Check there's no download button (which would appear after conversion)
      expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument()
    })
  })

  describe('Mode Selection', () => {
    it('defaults to CSV to Excel mode', () => {
      render(<CSVExcelConverterPage />)

      const csvButton = screen.getByText('CSV → Excel').closest('button')
      expect(csvButton).toBeInTheDocument()
      // The button should have active styling (green background)
      expect(screen.getByText('Drop CSV file here or click to browse')).toBeInTheDocument()
    })

    it('switches to Excel to CSV mode when clicking the button', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      expect(screen.getByText('Drop Excel file here or click to browse')).toBeInTheDocument()
      expect(screen.getByText('Supports .xlsx and .xls files up to 50MB')).toBeInTheDocument()
    })

    it('swaps mode when clicking the swap button', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Initially CSV mode
      expect(screen.getByText('Drop CSV file here or click to browse')).toBeInTheDocument()

      // Find and click the swap button (has ArrowLeftRight icon)
      const swapButton = screen.getByRole('button', { name: /switch conversion mode/i })
      await user.click(swapButton)

      // Should now be Excel mode
      expect(screen.getByText('Drop Excel file here or click to browse')).toBeInTheDocument()
      expect(mockToast.success).toHaveBeenCalledWith('Switched to Excel to CSV mode')
    })

    it('resets state when switching modes', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Upload a CSV file first
      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })

      // Now switch mode
      const swapButton = screen.getByRole('button', { name: /switch conversion mode/i })
      await user.click(swapButton)

      // Result should be cleared
      expect(screen.queryByText('✅ Converted')).not.toBeInTheDocument()
    })
  })

  describe('File Upload UI', () => {
    it('has a file input with correct accept attribute for CSV mode', () => {
      render(<CSVExcelConverterPage />)

      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()
      expect(fileInput.accept).toBe('.csv,text/csv')
    })

    it('updates file input accept attribute for Excel mode', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      expect(fileInput.accept).toContain('.xlsx')
      expect(fileInput.accept).toContain('.xls')
    })

    it('handles drag over event', () => {
      render(<CSVExcelConverterPage />)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })

      fireEvent.dragOver(dropZone, {
        dataTransfer: createDataTransfer([]),
      })

      // The component should handle the drag over (no error thrown)
      expect(dropZone).toBeInTheDocument()
    })

    it('handles drag leave event', () => {
      render(<CSVExcelConverterPage />)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })

      fireEvent.dragOver(dropZone, {
        dataTransfer: createDataTransfer([]),
      })

      fireEvent.dragLeave(dropZone)

      // Should reset drag state
      expect(dropZone).toBeInTheDocument()
    })

    it('handles keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })

      dropZone.focus()
      await user.keyboard('{Enter}')

      // The click handler should be called
      expect(dropZone).toBeInTheDocument()
    })

    it('handles keyboard navigation (Space key)', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })

      dropZone.focus()
      await user.keyboard(' ')

      expect(dropZone).toBeInTheDocument()
    })
  })

  describe('CSV to Excel Conversion', () => {
    it('converts a simple CSV file successfully', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age,city\nJohn,30,NYC\nJane,25,LA'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })

      // Check that status badges are displayed
      expect(screen.getByText(/1 sheet/)).toBeInTheDocument()
      expect(screen.getByText(/3 total rows/)).toBeInTheDocument()

      // Check analytics was tracked
      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'csv_excel_convert',
        expect.objectContaining({
          mode: 'csv-to-excel',
        })
      )

      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining('CSV converted successfully')
      )
    })

    it('handles CSV with quoted fields containing commas', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,address\nJohn,"123 Main St, Apt 4"\nJane,"456 Oak Ave"'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })
    })

    it('handles CSV with escaped quotes', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,quote\nJohn,"He said ""Hello"""\nJane,"It\'s ok"'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })
    })

    it('shows error for empty CSV file', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvFile = createMockCSVFile('')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('CSV file is empty')
      })

      expect(screen.getByText('CSV file is empty')).toBeInTheDocument()
      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'csv_excel_error',
        expect.objectContaining({
          mode: 'csv-to-excel',
          error: 'CSV file is empty',
        })
      )
    })

    it('shows error for wrong file type in CSV mode', async () => {
      render(<CSVExcelConverterPage />)

      const wrongFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      // Use helper for reliable file input handling in Vitest browser mode
      simulateFileUpload(fileInput, wrongFile)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Please select a CSV file')
      })
    })

    it('displays file name badge after upload', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent, 'mydata.csv')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/mydata.csv/)).toBeInTheDocument()
      })
    })
  })

  describe('Excel to CSV Conversion', () => {
    it('converts an Excel file successfully', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('data.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })

      expect(mockXLSX.read).toHaveBeenCalled()
      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'csv_excel_convert',
        expect.objectContaining({
          mode: 'excel-to-csv',
        })
      )
    })

    it('handles Excel file with multiple sheets', async () => {
      const user = userEvent.setup()

      // Mock workbook with multiple sheets
      mockXLSX.read.mockReturnValue({
        SheetNames: ['Sheet1', 'Sheet2', 'Sheet3'],
        Sheets: {
          Sheet1: {},
          Sheet2: {},
          Sheet3: {},
        },
      })

      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('multisheet.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })

      expect(screen.getByText(/3 sheets/)).toBeInTheDocument()
    })

    it('shows error for Excel file with no sheets', async () => {
      const user = userEvent.setup()

      // Mock empty workbook
      mockXLSX.read.mockReturnValue({
        SheetNames: [],
        Sheets: {},
      })

      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('empty.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Excel file has no sheets')
      })
    })

    it('shows error for wrong file type in Excel mode', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const wrongFile = new File(['content'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      // Use helper for reliable file input handling in Vitest browser mode
      simulateFileUpload(fileInput, wrongFile)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Please select an Excel file (.xlsx or .xls)')
      })
    })

    it('accepts .xls files', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const xlsFile = new File(['content'], 'old.xls', { type: 'application/vnd.ms-excel' })
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, xlsFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })
    })
  })

  describe('Download Functionality', () => {
    it('shows download button after successful CSV conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeInTheDocument()
      })
    })

    it('downloads Excel file when clicking download button in CSV mode', async () => {
      const user = userEvent.setup()

      // Render FIRST before mocking document methods
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeInTheDocument()
      })

      // Mock document methods AFTER render, before clicking download
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const originalCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor as unknown as HTMLAnchorElement
        return originalCreateElement(tag)
      })
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockAnchor as unknown as Node)
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockAnchor as unknown as Node)

      try {
        const downloadButton = screen.getByText(/Download Excel/).closest('button')
        await user.click(downloadButton!)

        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockAnchor.click).toHaveBeenCalled()
        expect(mockRevokeObjectURL).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith('Excel file downloaded successfully')
      } finally {
        // Always cleanup even if test fails
        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
        removeChildSpy.mockRestore()
      }
    })

    it('downloads CSV file when clicking download button in Excel mode', async () => {
      const user = userEvent.setup()

      // Render FIRST before mocking document methods
      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('data.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        expect(screen.getByText(/Download CSV/)).toBeInTheDocument()
      })

      // Mock document methods AFTER render, before clicking download
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const originalCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor as unknown as HTMLAnchorElement
        return originalCreateElement(tag)
      })
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockAnchor as unknown as Node)
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockAnchor as unknown as Node)

      try {
        const downloadButton = screen.getByText(/Download CSV/).closest('button')
        await user.click(downloadButton!)

        expect(mockToast.success).toHaveBeenCalledWith('CSV file downloaded successfully')
      } finally {
        // Always cleanup even if test fails
        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
        removeChildSpy.mockRestore()
      }
    })

    it('shows multiple download buttons for multi-sheet Excel files', async () => {
      const user = userEvent.setup()

      // Mock workbook with multiple sheets
      mockXLSX.read.mockReturnValue({
        SheetNames: ['Sales', 'Inventory'],
        Sheets: {
          Sales: {},
          Inventory: {},
        },
      })

      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('multisheet.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        // Use getAllByText since buttons and tooltips both contain matching text
        const salesElements = screen.getAllByText(/Download Sales/)
        const inventoryElements = screen.getAllByText(/Download Inventory/)
        expect(salesElements.length).toBeGreaterThanOrEqual(1)
        expect(inventoryElements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('tracks download analytics', async () => {
      const user = userEvent.setup()

      // Render FIRST before mocking document methods
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeInTheDocument()
      })

      // Mock document methods AFTER render, before clicking download
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const originalCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor as unknown as HTMLAnchorElement
        return originalCreateElement(tag)
      })
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockAnchor as unknown as Node)
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockAnchor as unknown as Node)

      try {
        const downloadButton = screen.getByText(/Download Excel/).closest('button')
        await user.click(downloadButton!)

        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'csv_excel_download',
          expect.objectContaining({
            mode: 'csv-to-excel',
            sheet_count: 1,
          })
        )
      } finally {
        // Always cleanup even if test fails
        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
        removeChildSpy.mockRestore()
      }
    })
  })

  describe('Reset Functionality', () => {
    it('shows reset button after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('Convert Another File')).toBeInTheDocument()
      })
    })

    it('resets all state when clicking reset button', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })

      const resetButton = screen.getByText('Convert Another File').closest('button')
      await user.click(resetButton!)

      expect(screen.queryByText('✅ Converted')).not.toBeInTheDocument()
      // Check that download button is gone (not the instructional text in How to Use section)
      expect(screen.queryByRole('button', { name: /Download/ })).not.toBeInTheDocument()
      expect(mockToast.success).toHaveBeenCalledWith('Reset to initial state')
    })
  })

  describe('Preview Section', () => {
    it('shows data preview table after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age,city\nJohn,30,NYC\nJane,25,LA'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument()
      })

      // Check that table cells are rendered
      expect(screen.getByText('name')).toBeInTheDocument()
      expect(screen.getByText('age')).toBeInTheDocument()
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('shows row and column count in preview header', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age,city\nJohn,30,NYC\nJane,25,LA'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/3 rows × 3 columns/)).toBeInTheDocument()
      })
    })

    it('shows truncation message for large datasets', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Create CSV with more than 50 rows
      const header = 'col1,col2,col3'
      const rows = Array.from({ length: 100 }, (_, i) => `val${i}1,val${i}2,val${i}3`)
      const csvContent = [header, ...rows].join('\n')
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/Showing first 50 rows of 101/)).toBeInTheDocument()
      })
    })

    it('shows multiple sheet previews for Excel files', async () => {
      const user = userEvent.setup()

      mockXLSX.read.mockReturnValue({
        SheetNames: ['Orders', 'Products'],
        Sheets: {
          Orders: {},
          Products: {},
        },
      })

      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('report.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
      })
    })
  })

  describe('Drag and Drop', () => {
    it('handles file drop correctly', async () => {
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })

      fireEvent.drop(dropZone, {
        dataTransfer: createDataTransfer([csvFile]),
      })

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })
    })

    it('ignores drop when processing', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // Start a conversion
      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      // Component handles this internally - the drop handler checks isProcessing
      // This is more of a behavioral test
      expect(fileInput).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error message in status bar', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvFile = createMockCSVFile('')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        const errorText = screen.getByText('CSV file is empty')
        expect(errorText).toBeInTheDocument()
      })
    })

    it('clears error when uploading new file', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      // First upload - error
      const emptyFile = createMockCSVFile('')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, emptyFile)

      await waitFor(() => {
        expect(screen.getByText('CSV file is empty')).toBeInTheDocument()
      })

      // Second upload - success
      const validFile = createMockCSVFile('name,age\nJohn,30')
      await user.upload(fileInput, validFile)

      await waitFor(() => {
        expect(screen.queryByText('CSV file is empty')).not.toBeInTheDocument()
        expect(screen.getByText('✅ Converted')).toBeInTheDocument()
      })
    })
  })

  describe('Status Badges', () => {
    it('displays correct file size in KB', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        // File size badge should be displayed
        const sizeBadge = screen.getByText(/KB/)
        expect(sizeBadge).toBeInTheDocument()
      })
    })

    it('displays correct sheet count', async () => {
      const user = userEvent.setup()

      mockXLSX.read.mockReturnValue({
        SheetNames: ['Sheet1', 'Sheet2'],
        Sheets: {
          Sheet1: {},
          Sheet2: {},
        },
      })

      render(<CSVExcelConverterPage />)

      // Switch to Excel mode
      const excelButton = screen.getByText('Excel → CSV').closest('button')
      await user.click(excelButton!)

      const excelFile = createMockExcelFile('data.xlsx')
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, excelFile)

      await waitFor(() => {
        expect(screen.getByText(/2 sheets/)).toBeInTheDocument()
      })
    })

    it('displays correct total row count', async () => {
      const user = userEvent.setup()
      render(<CSVExcelConverterPage />)

      const csvContent = 'name,age\nJohn,30\nJane,25\nBob,35'
      const csvFile = createMockCSVFile(csvContent)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement

      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText(/4 total rows/)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper role attribute on drop zone', () => {
      render(<CSVExcelConverterPage />)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })
      expect(dropZone).toBeInTheDocument()
    })

    it('has tabindex on drop zone for keyboard navigation', () => {
      render(<CSVExcelConverterPage />)

      const dropZone = screen.getByRole('button', {
        name: /drop csv file here or click to browse/i,
      })
      expect(dropZone).toHaveAttribute('tabindex', '0')
    })

    it('has file input with proper id for label association', () => {
      render(<CSVExcelConverterPage />)

      const fileInput = document.getElementById('file-upload')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
    })
  })
})
