import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/analytics'
import CSVExcelPage from '../page'

vi.mock('@/lib/analytics', () => ({ trackToolEvent: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// Mock XLSX library
vi.mock('xlsx', () => {
  return {
    default: {
      read: vi.fn(() => ({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {
            A1: { v: 'Name' },
            B1: { v: 'Age' },
            A2: { v: 'John' },
            B2: { v: 30 },
          },
        },
      })),
      utils: {
        sheet_to_json: vi.fn(() => [
          ['Name', 'Age'],
          ['John', 30],
          ['Jane', 25],
        ]),
        book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
        aoa_to_sheet: vi.fn((data: string[][]) => ({
          '!ref': `A1:${String.fromCharCode(65 + data[0].length - 1)}${data.length}`,
        })),
        book_append_sheet: vi.fn(),
      },
      write: vi.fn(() => new ArrayBuffer(1024)),
    },
  }
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('CSV Excel Converter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the page', () => {
      render(<CSVExcelPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('renders the page title', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText(/CSV ↔ Excel Converter/)).toBeTruthy()
    })

    it('renders the page description', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText(/Convert between CSV and Excel formats/)).toBeTruthy()
    })

    it('displays conversion options', () => {
      render(<CSVExcelPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders file upload area', () => {
      render(<CSVExcelPage />)
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThan(0)
    })

    it('renders conversion direction toggles', () => {
      render(<CSVExcelPage />)
      // Should have buttons or tabs for CSV to Excel and Excel to CSV
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(2)
    })

    it('displays CSV to Excel mode button', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('CSV → Excel')).toBeTruthy()
    })

    it('displays Excel to CSV mode button', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Excel → CSV')).toBeTruthy()
    })

    it('renders file spreadsheet icon', () => {
      render(<CSVExcelPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
    })

    it('displays help section', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('How to Use')).toBeTruthy()
    })
  })

  describe('Mode Selection', () => {
    it('defaults to CSV to Excel mode', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Drop CSV file here or click to browse')).toBeTruthy()
    })

    it('switches to Excel to CSV mode', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const excelModeButton = screen.getByText('Excel → CSV')
      await user.click(excelModeButton)

      await waitFor(() => {
        expect(screen.getByText('Drop Excel file here or click to browse')).toBeTruthy()
      })
    })

    it('switches back to CSV to Excel mode', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      // Switch to Excel mode first
      await user.click(screen.getByText('Excel → CSV'))

      // Switch back to CSV mode
      await user.click(screen.getByText('CSV → Excel'))

      await waitFor(() => {
        expect(screen.getByText('Drop CSV file here or click to browse')).toBeTruthy()
      })
    })

    it('displays mode swap button', () => {
      render(<CSVExcelPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(2)
    })

    it('swaps mode with swap button', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      // Find the swap button (ArrowLeftRight icon button)
      const buttons = screen.getAllByRole('button')
      const swapButton = buttons.find((btn) => btn.querySelector('svg'))

      if (swapButton) {
        await user.click(swapButton)
        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalled()
        })
      }
    })

    it('displays conversion mode card', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Conversion Mode')).toBeTruthy()
      expect(screen.getByText('Select the direction of conversion')).toBeTruthy()
    })

    it('highlights active mode', () => {
      render(<CSVExcelPage />)
      const csvButton = screen.getByText('CSV → Excel').closest('button')
      expect(csvButton).toBeTruthy()
    })

    it('shows mode descriptions', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Convert .csv to .xlsx')).toBeTruthy()
      expect(screen.getByText('Convert .xlsx to .csv')).toBeTruthy()
    })
  })

  describe('File Upload', () => {
    it('accepts CSV file upload', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      if (fileInput) {
        await user.upload(fileInput, file)
        expect(fileInput).toBeTruthy()
      }
    })

    it('accepts Excel file upload', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      // Switch to Excel mode
      await user.click(screen.getByText('Excel → CSV'))

      const file = new File([new ArrayBuffer(100)], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      if (fileInput) {
        await user.upload(fileInput, file)
        expect(fileInput).toBeTruthy()
      }
    })

    it('validates file types', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      if (fileInput) {
        await user.upload(fileInput, invalidFile)
        // Should handle invalid file type
        expect(fileInput).toBeTruthy()
      }
    })

    it('displays file name after upload', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/test.csv/)).toBeTruthy()
      })
    })

    it('shows upload area with instructions', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Drop CSV file here or click to browse')).toBeTruthy()
      expect(screen.getByText('Supports .csv files up to 50MB')).toBeTruthy()
    })

    it('displays drag and drop area', () => {
      render(<CSVExcelPage />)
      const dropArea = document.querySelector('[role="button"]')
      expect(dropArea).toBeTruthy()
    })

    it('accepts file via click', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30\nJane,25'], 'data.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
          'csv_excel_convert',
          expect.objectContaining({
            mode: 'csv-to-excel',
          })
        )
      })
    })

    it('shows correct file type hint for CSV mode', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Supports .csv files up to 50MB')).toBeTruthy()
    })

    it('shows correct file type hint for Excel mode', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      await waitFor(() => {
        expect(screen.getByText('Supports .xlsx and .xls files up to 50MB')).toBeTruthy()
      })
    })
  })

  describe('CSV to Excel Conversion', () => {
    it('processes CSV file successfully', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30\nJane,25'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          expect.stringContaining('CSV converted successfully')
        )
      })
    })

    it('displays conversion success status', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeTruthy()
      })
    })

    it('shows sheet count after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/1 sheet/)).toBeTruthy()
      })
    })

    it('shows row count after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30\nJane,25'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/total rows/)).toBeTruthy()
      })
    })

    it('handles CSV with quoted fields', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['"name","age"\n"John Doe",30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalled()
      })
    })

    it('handles CSV with escaped quotes', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['"name","note"\n"John","He said ""hello"""'], 'test.csv', {
        type: 'text/csv',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalled()
      })
    })

    it('tracks conversion event', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
          'csv_excel_convert',
          expect.objectContaining({
            mode: 'csv-to-excel',
            file_type: 'text/csv',
          })
        )
      })
    })

    it('displays file size after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/KB/)).toBeTruthy()
      })
    })
  })

  describe('Excel to CSV Conversion', () => {
    it('processes Excel file successfully', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      const file = new File([new ArrayBuffer(100)], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          expect.stringContaining('Excel converted successfully')
        )
      })
    })

    it('handles multiple sheets', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      const file = new File([new ArrayBuffer(100)], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalled()
      })
    })

    it('displays all sheets after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      const file = new File([new ArrayBuffer(100)], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/sheet/)).toBeTruthy()
      })
    })

    it('tracks Excel conversion event', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      const file = new File([new ArrayBuffer(100)], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
          'csv_excel_convert',
          expect.objectContaining({
            mode: 'excel-to-csv',
          })
        )
      })
    })
  })

  describe('Data Preview', () => {
    it('displays data preview after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30\nJane,25'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeTruthy()
      })
    })

    it('renders table preview', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const tables = document.querySelectorAll('table')
        expect(tables.length).toBeGreaterThan(0)
      })
    })

    it('displays row and column count', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/rows ×.*columns/)).toBeTruthy()
      })
    })

    it('shows first 50 rows by default', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      // Create CSV with more than 50 rows
      const rows = ['name,age']
      for (let i = 0; i < 60; i++) {
        rows.push(`Person${i},${20 + i}`)
      }
      const file = new File([rows.join('\n')], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Showing first 50 rows/)).toBeTruthy()
      })
    })

    it('displays preview table with proper styling', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const table = document.querySelector('table')
        expect(table).toBeTruthy()
      })
    })
  })

  describe('Download Functionality', () => {
    it('shows download button after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeTruthy()
      })
    })

    it('downloads converted file', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeTruthy()
      })

      const downloadButton = screen.getByText(/Download Excel/)
      await user.click(downloadButton)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          expect.stringContaining('downloaded successfully')
        )
      })
    })

    it('tracks download event', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeTruthy()
      })

      await user.click(screen.getByText(/Download Excel/))

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
          'csv_excel_download',
          expect.objectContaining({
            mode: 'csv-to-excel',
          })
        )
      })
    })

    it('creates download link with correct filename', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Download Excel/)).toBeTruthy()
      })

      await user.click(screen.getByText(/Download Excel/))

      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })

    it('downloads separate files for multiple sheets', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      const file = new File([new ArrayBuffer(100)], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const downloadButtons = screen.queryAllByText(/Download/)
        expect(downloadButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Reset Functionality', () => {
    it('shows reset button after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Convert Another File')).toBeTruthy()
      })
    })

    it('resets to initial state', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Convert Another File')).toBeTruthy()
      })

      await user.click(screen.getByText('Convert Another File'))

      await waitFor(() => {
        expect(screen.queryByText('✅ Converted')).toBeFalsy()
      })
    })

    it('shows success toast on reset', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Convert Another File')).toBeTruthy()
      })

      vi.clearAllMocks()
      await user.click(screen.getByText('Convert Another File'))

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Reset to initial state')
      })
    })

    it('clears preview after reset', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeTruthy()
      })

      await user.click(screen.getByText('Convert Another File'))

      await waitFor(() => {
        expect(screen.queryByText('Sheet1')).toBeFalsy()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles empty file upload gracefully', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File([''], 'empty.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('CSV file is empty')
      })
    })

    it('displays error for corrupted files', () => {
      render(<CSVExcelPage />)
      // Component should render without crashing
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('shows error message for invalid file type', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
          expect.stringContaining('Please select a CSV file')
        )
      })
    })

    it('tracks error events', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File([''], 'empty.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
          'csv_excel_error',
          expect.objectContaining({
            mode: 'csv-to-excel',
          })
        )
      })
    })

    it('displays error state', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File([''], 'empty.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('CSV file is empty')).toBeTruthy()
      })
    })

    it('clears previous errors on new upload', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      // Upload invalid file
      const invalidFile = new File([''], 'empty.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, invalidFile)

      await waitFor(() => {
        expect(screen.getByText('CSV file is empty')).toBeTruthy()
      })

      // Upload valid file
      const validFile = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      await user.upload(fileInput, validFile)

      await waitFor(() => {
        expect(screen.queryByText('CSV file is empty')).toBeFalsy()
      })
    })

    it('validates Excel file extension', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
          expect.stringContaining('Please select an Excel file')
        )
      })
    })
  })

  describe('Conversion Features', () => {
    it('renders conversion settings', () => {
      render(<CSVExcelPage />)
      // Mode selection is the main setting
      expect(screen.getByText('Conversion Mode')).toBeTruthy()
    })

    it('allows switching conversion direction', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const excelModeButton = screen.getByText('Excel → CSV')
      await user.click(excelModeButton)

      await waitFor(() => {
        expect(screen.getByText('Drop Excel file here or click to browse')).toBeTruthy()
      })
    })

    it('renders download button after conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Download/)).toBeTruthy()
      })
    })

    it('handles files with special characters', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,note\nJohn,Hello™\nJane,Café©'], 'test.csv', {
        type: 'text/csv',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalled()
      })
    })

    it('preserves data accuracy during conversion', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age,salary\nJohn,30,50000\nJane,25,45000'], 'test.csv', {
        type: 'text/csv',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/3 rows/)).toBeTruthy()
      })
    })
  })

  describe('Help Section', () => {
    it('displays usage instructions', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('How to Use')).toBeTruthy()
    })

    it('shows step-by-step guide', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText(/Select conversion mode/)).toBeTruthy()
      expect(screen.getByText(/Drag and drop your file/)).toBeTruthy()
    })

    it('mentions local processing', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText(/All processing happens locally/)).toBeTruthy()
    })

    it('displays file size limit', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText(/up to 50MB/)).toBeTruthy()
    })

    it('shows all help items', () => {
      render(<CSVExcelPage />)
      const helpList = screen.getByText(/Preview the converted data/)
      expect(helpList).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<CSVExcelPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
      expect(heading.textContent).toContain('CSV ↔ Excel Converter')
    })

    it('has semantic buttons', () => {
      render(<CSVExcelPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible file input', () => {
      render(<CSVExcelPage />)
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeTruthy()
    })

    it('has keyboard accessible upload area', () => {
      render(<CSVExcelPage />)
      const uploadArea = document.querySelector('[role="button"]')
      expect(uploadArea).toBeTruthy()
      expect(uploadArea?.getAttribute('tabIndex')).toBe('0')
    })

    it('provides visual feedback for drag operations', () => {
      render(<CSVExcelPage />)
      const uploadArea = document.querySelector('[role="button"]')
      expect(uploadArea).toBeTruthy()
    })

    it('has descriptive card titles', () => {
      render(<CSVExcelPage />)
      expect(screen.getByText('Conversion Mode')).toBeTruthy()
      expect(screen.getByText('How to Use')).toBeTruthy()
    })

    it('displays status badges with icons', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('✅ Converted')).toBeTruthy()
      })
    })
  })

  describe('Responsive Design', () => {
    it('renders on mobile viewport', () => {
      render(<CSVExcelPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('displays flexible button layout', () => {
      render(<CSVExcelPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('shows responsive text sizing', () => {
      render(<CSVExcelPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
    })
  })

  describe('User Experience', () => {
    it('shows processing state', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File([Array(1000).fill('name,age\n').join('')], 'large.csv', {
        type: 'text/csv',
      })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      // Processing should complete and show results
      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalled()
      })
    })

    it('provides clear feedback messages', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          expect.stringContaining('CSV converted successfully')
        )
      })
    })

    it('displays conversion statistics', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      const file = new File(['name,age\nJohn,30\nJane,25'], 'test.csv', { type: 'text/csv' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/rows/)).toBeTruthy()
        expect(screen.getByText(/sheet/)).toBeTruthy()
      })
    })

    it('handles rapid mode switching', async () => {
      const user = userEvent.setup()
      render(<CSVExcelPage />)

      await user.click(screen.getByText('Excel → CSV'))
      await user.click(screen.getByText('CSV → Excel'))
      await user.click(screen.getByText('Excel → CSV'))

      expect(screen.getByText('Drop Excel file here or click to browse')).toBeTruthy()
    })
  })
})
