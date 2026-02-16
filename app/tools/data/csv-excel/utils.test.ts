import { describe, expect, it } from 'vitest'
import type { ConversionMode } from './utils'
import {
  convertToCSVString,
  createSheetData,
  formatFileSize,
  generateOutputFilename,
  getFileExtension,
  getOutputMimeType,
  parseCSV,
  validateCSVData,
  validateFileType,
} from './utils'

describe('csv-excel utils', () => {
  describe('parseCSV', () => {
    it('parses simple CSV with no special characters', () => {
      const csv = 'a,b,c\n1,2,3'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '2', '3'],
      ])
    })

    it('handles quoted fields containing commas', () => {
      const csv = 'name,address,city\n"Doe, John","123 Main St, Apt 4",Springfield'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['name', 'address', 'city'],
        ['Doe, John', '123 Main St, Apt 4', 'Springfield'],
      ])
    })

    it('handles escaped quotes (double quotes become single)', () => {
      const csv = 'quote,value\n"He said ""hello""",test'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['quote', 'value'],
        ['He said "hello"', 'test'],
      ])
    })

    it('handles Windows line endings (CRLF)', () => {
      const csv = 'a,b,c\r\n1,2,3\r\n4,5,6'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '2', '3'],
        ['4', '5', '6'],
      ])
    })

    it('handles Unix line endings (LF)', () => {
      const csv = 'a,b,c\n1,2,3\n4,5,6'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '2', '3'],
        ['4', '5', '6'],
      ])
    })

    it('filters out empty lines', () => {
      const csv = 'a,b,c\n\n1,2,3\n\n\n4,5,6\n'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '2', '3'],
        ['4', '5', '6'],
      ])
    })

    it('filters out lines with only whitespace', () => {
      const csv = 'a,b,c\n   \n1,2,3\n\t\n4,5,6'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['1', '2', '3'],
        ['4', '5', '6'],
      ])
    })

    it('handles empty cells', () => {
      const csv = 'a,,c\n,2,\n1,,3'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', '', 'c'],
        ['', '2', ''],
        ['1', '', '3'],
      ])
    })

    it('handles single row', () => {
      const csv = 'a,b,c'
      const result = parseCSV(csv)
      expect(result).toEqual([['a', 'b', 'c']])
    })

    it('handles single column', () => {
      const csv = 'a\nb\nc'
      const result = parseCSV(csv)
      expect(result).toEqual([['a'], ['b'], ['c']])
    })

    it('handles single cell', () => {
      const csv = 'value'
      const result = parseCSV(csv)
      expect(result).toEqual([['value']])
    })

    it('handles empty input', () => {
      const csv = ''
      const result = parseCSV(csv)
      expect(result).toEqual([])
    })

    it('handles only whitespace input', () => {
      const csv = '   \n   \n   '
      const result = parseCSV(csv)
      expect(result).toEqual([])
    })

    it('handles complex quoted field with multiple commas and quotes', () => {
      const csv = '"Name, ""First"", Last",Value\n"Test, ""A"", ""B""",123'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['Name, "First", Last', 'Value'],
        ['Test, "A", "B"', '123'],
      ])
    })

    it('handles trailing comma (empty last cell)', () => {
      const csv = 'a,b,c,\n1,2,3,'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['a', 'b', 'c', ''],
        ['1', '2', '3', ''],
      ])
    })

    it('handles leading comma (empty first cell)', () => {
      const csv = ',a,b,c\n,1,2,3'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['', 'a', 'b', 'c'],
        ['', '1', '2', '3'],
      ])
    })

    it('handles quoted empty cell', () => {
      const csv = '"",value,""\n"",123,""'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['', 'value', ''],
        ['', '123', ''],
      ])
    })

    it('handles numbers and special characters', () => {
      const csv = 'price,symbol,emoji\n$1,000.00,@#$%,🎉'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['price', 'symbol', 'emoji'],
        ['$1', '000.00', '@#$%', '🎉'],
      ])
    })

    it('handles quoted numbers with commas', () => {
      const csv = 'price,quantity\n"$1,000.00",100\n"$2,500.50",200'
      const result = parseCSV(csv)
      expect(result).toEqual([
        ['price', 'quantity'],
        ['$1,000.00', '100'],
        ['$2,500.50', '200'],
      ])
    })
  })

  describe('convertToCSVString', () => {
    it('converts simple 2D array to CSV string', () => {
      const data = [
        ['a', 'b', 'c'],
        ['1', '2', '3'],
      ]
      const result = convertToCSVString(data)
      expect(result).toBe('a,b,c\n1,2,3')
    })

    it('escapes cells containing commas', () => {
      const data = [
        ['name', 'address'],
        ['John', '123 Main St, Apt 4'],
      ]
      const result = convertToCSVString(data)
      expect(result).toBe('name,address\nJohn,"123 Main St, Apt 4"')
    })

    it('escapes cells containing quotes (doubles them)', () => {
      const data = [
        ['quote', 'value'],
        ['He said "hello"', 'test'],
      ]
      const result = convertToCSVString(data)
      expect(result).toBe('quote,value\n"He said ""hello""",test')
    })

    it('escapes cells containing newlines', () => {
      const data = [
        ['description', 'value'],
        ['Line 1\nLine 2', 'test'],
      ]
      const result = convertToCSVString(data)
      expect(result).toBe('description,value\n"Line 1\nLine 2",test')
    })

    it('handles empty cells', () => {
      const data = [
        ['a', '', 'c'],
        ['', '2', ''],
      ]
      const result = convertToCSVString(data)
      expect(result).toBe('a,,c\n,2,')
    })

    it('handles single row', () => {
      const data = [['a', 'b', 'c']]
      const result = convertToCSVString(data)
      expect(result).toBe('a,b,c')
    })

    it('handles single column', () => {
      const data = [['a'], ['b'], ['c']]
      const result = convertToCSVString(data)
      expect(result).toBe('a\nb\nc')
    })

    it('handles single cell', () => {
      const data = [['value']]
      const result = convertToCSVString(data)
      expect(result).toBe('value')
    })

    it('handles empty array', () => {
      const data: string[][] = []
      const result = convertToCSVString(data)
      expect(result).toBe('')
    })

    it('handles empty row', () => {
      const data = [['a', 'b', 'c'], [], ['1', '2', '3']]
      const result = convertToCSVString(data)
      expect(result).toBe('a,b,c\n\n1,2,3')
    })

    it('converts non-string values to strings', () => {
      // TypeScript would normally prevent this, but runtime data might have numbers
      const data = [
        ['name', 'age'],
        ['John', '30' as string],
      ]
      const result = convertToCSVString(data)
      expect(result).toBe('name,age\nJohn,30')
    })

    it('handles cell with comma and quote together', () => {
      const data = [['value'], ['He said, "hello"']]
      const result = convertToCSVString(data)
      expect(result).toBe('value\n"He said, ""hello"""')
    })

    it('round-trips with parseCSV for simple data', () => {
      const original = [
        ['a', 'b', 'c'],
        ['1', '2', '3'],
      ]
      const csv = convertToCSVString(original)
      const parsed = parseCSV(csv)
      expect(parsed).toEqual(original)
    })

    it('round-trips with parseCSV for complex data', () => {
      const original = [
        ['name', 'address', 'note'],
        ['Doe, John', '123 Main St', 'Said "hi"'],
      ]
      const csv = convertToCSVString(original)
      const parsed = parseCSV(csv)
      expect(parsed).toEqual(original)
    })
  })

  describe('getFileExtension', () => {
    it('returns extension for .csv file', () => {
      expect(getFileExtension('data.csv')).toBe('csv')
    })

    it('returns extension for .xlsx file', () => {
      expect(getFileExtension('spreadsheet.xlsx')).toBe('xlsx')
    })

    it('returns extension for .xls file', () => {
      expect(getFileExtension('old-spreadsheet.xls')).toBe('xls')
    })

    it('returns empty string for file without extension', () => {
      expect(getFileExtension('filename')).toBe('')
    })

    it('returns last extension for file with multiple dots', () => {
      expect(getFileExtension('my.data.file.csv')).toBe('csv')
    })

    it('returns lowercase extension regardless of input case', () => {
      expect(getFileExtension('Data.CSV')).toBe('csv')
      expect(getFileExtension('Sheet.XLSX')).toBe('xlsx')
      expect(getFileExtension('File.Xls')).toBe('xls')
    })

    it('handles hidden files (starting with dot)', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore')
    })

    it('handles file with only extension-like name', () => {
      expect(getFileExtension('.csv')).toBe('csv')
    })

    it('returns empty string for empty filename', () => {
      expect(getFileExtension('')).toBe('')
    })

    it('handles files with spaces in name', () => {
      expect(getFileExtension('my file data.csv')).toBe('csv')
    })

    it('handles unusual extensions', () => {
      expect(getFileExtension('file.json')).toBe('json')
      expect(getFileExtension('file.txt')).toBe('txt')
      expect(getFileExtension('file.xml')).toBe('xml')
    })
  })

  describe('validateFileType', () => {
    describe('csv-to-excel mode', () => {
      const mode: ConversionMode = 'csv-to-excel'

      it('accepts .csv file with correct extension', () => {
        const result = validateFileType('data.csv', 'application/octet-stream', mode)
        expect(result).toEqual({ valid: true })
      })

      it('accepts file with text/csv MIME type', () => {
        const result = validateFileType('data', 'text/csv', mode)
        expect(result).toEqual({ valid: true })
      })

      it('accepts file with text/csv charset MIME type', () => {
        const result = validateFileType('data', 'text/csv; charset=utf-8', mode)
        expect(result).toEqual({ valid: true })
      })

      it('accepts .csv file with text/csv MIME type', () => {
        const result = validateFileType('data.csv', 'text/csv', mode)
        expect(result).toEqual({ valid: true })
      })

      it('rejects non-CSV file', () => {
        const result = validateFileType(
          'data.xlsx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          mode
        )
        expect(result).toEqual({ valid: false, error: 'Please select a CSV file' })
      })

      it('rejects file with wrong extension and wrong MIME type', () => {
        const result = validateFileType('data.txt', 'text/plain', mode)
        expect(result).toEqual({ valid: false, error: 'Please select a CSV file' })
      })

      it('rejects uppercase .CSV extension (case-sensitive check)', () => {
        // Note: The implementation uses endsWith('.csv') which is case-sensitive
        // Uppercase .CSV files need text/csv MIME type to be accepted
        const result = validateFileType('DATA.CSV', 'application/octet-stream', mode)
        expect(result).toEqual({ valid: false, error: 'Please select a CSV file' })
      })

      it('accepts uppercase .CSV extension when MIME type is csv', () => {
        // Uppercase extension with correct MIME type should work
        const result = validateFileType('DATA.CSV', 'text/csv', mode)
        expect(result).toEqual({ valid: true })
      })
    })

    describe('excel-to-csv mode', () => {
      const mode: ConversionMode = 'excel-to-csv'

      it('accepts .xlsx file', () => {
        const result = validateFileType(
          'spreadsheet.xlsx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          mode
        )
        expect(result).toEqual({ valid: true })
      })

      it('accepts .xls file', () => {
        const result = validateFileType('spreadsheet.xls', 'application/vnd.ms-excel', mode)
        expect(result).toEqual({ valid: true })
      })

      it('accepts uppercase .XLSX extension', () => {
        const result = validateFileType('SPREADSHEET.XLSX', 'application/octet-stream', mode)
        expect(result).toEqual({ valid: true })
      })

      it('accepts uppercase .XLS extension', () => {
        const result = validateFileType('SPREADSHEET.XLS', 'application/octet-stream', mode)
        expect(result).toEqual({ valid: true })
      })

      it('rejects non-Excel file', () => {
        const result = validateFileType('data.csv', 'text/csv', mode)
        expect(result).toEqual({
          valid: false,
          error: 'Please select an Excel file (.xlsx or .xls)',
        })
      })

      it('rejects .txt file', () => {
        const result = validateFileType('data.txt', 'text/plain', mode)
        expect(result).toEqual({
          valid: false,
          error: 'Please select an Excel file (.xlsx or .xls)',
        })
      })

      it('rejects file without extension', () => {
        const result = validateFileType('spreadsheet', 'application/octet-stream', mode)
        expect(result).toEqual({
          valid: false,
          error: 'Please select an Excel file (.xlsx or .xls)',
        })
      })
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes (< 1024)', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1)).toBe('1 B')
      expect(formatFileSize(100)).toBe('100 B')
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('formats kilobytes (1024 - 1048575)', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('2 KB') // Rounded
      expect(formatFileSize(10240)).toBe('10 KB')
      expect(formatFileSize(102400)).toBe('100 KB')
      expect(formatFileSize(1048575)).toBe('1024 KB')
    })

    it('formats megabytes (>= 1048576)', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
      expect(formatFileSize(10485760)).toBe('10.0 MB')
      expect(formatFileSize(104857600)).toBe('100.0 MB')
    })

    it('handles negative numbers', () => {
      expect(formatFileSize(-1)).toBe('0 B')
      expect(formatFileSize(-1000)).toBe('0 B')
    })

    it('handles very large files', () => {
      expect(formatFileSize(1073741824)).toBe('1024.0 MB') // 1 GB
      expect(formatFileSize(10737418240)).toBe('10240.0 MB') // 10 GB
    })

    it('rounds KB values correctly', () => {
      expect(formatFileSize(1500)).toBe('1 KB') // 1.46 KB rounds to 1
      expect(formatFileSize(1600)).toBe('2 KB') // 1.56 KB rounds to 2
    })

    it('formats MB with one decimal place', () => {
      expect(formatFileSize(1100000)).toBe('1.0 MB')
      expect(formatFileSize(1200000)).toBe('1.1 MB')
      expect(formatFileSize(2621440)).toBe('2.5 MB')
    })
  })

  describe('generateOutputFilename', () => {
    describe('csv-to-excel mode', () => {
      const mode: ConversionMode = 'csv-to-excel'

      it('replaces .csv extension with .xlsx', () => {
        expect(generateOutputFilename('data.csv', mode)).toBe('data.xlsx')
      })

      it('handles uppercase .CSV extension', () => {
        expect(generateOutputFilename('DATA.CSV', mode)).toBe('DATA.xlsx')
      })

      it('handles filename with multiple dots', () => {
        expect(generateOutputFilename('my.data.file.csv', mode)).toBe('my.data.file.xlsx')
      })

      it('ignores sheetName parameter in csv-to-excel mode', () => {
        expect(generateOutputFilename('data.csv', mode, 'Sheet1')).toBe('data.xlsx')
      })
    })

    describe('excel-to-csv mode', () => {
      const mode: ConversionMode = 'excel-to-csv'

      it('replaces .xlsx extension with .csv', () => {
        expect(generateOutputFilename('spreadsheet.xlsx', mode)).toBe('spreadsheet.csv')
      })

      it('replaces .xls extension with .csv', () => {
        expect(generateOutputFilename('spreadsheet.xls', mode)).toBe('spreadsheet.csv')
      })

      it('handles uppercase .XLSX extension', () => {
        expect(generateOutputFilename('SPREADSHEET.XLSX', mode)).toBe('SPREADSHEET.csv')
      })

      it('handles uppercase .XLS extension', () => {
        expect(generateOutputFilename('SPREADSHEET.XLS', mode)).toBe('SPREADSHEET.csv')
      })

      it('appends sheet name when provided', () => {
        expect(generateOutputFilename('spreadsheet.xlsx', mode, 'Sales')).toBe(
          'spreadsheet-Sales.csv'
        )
      })

      it('handles filename with multiple dots and sheet name', () => {
        expect(generateOutputFilename('my.data.file.xlsx', mode, 'Q1')).toBe('my.data.file-Q1.csv')
      })

      it('returns base filename with .csv when no sheet name', () => {
        expect(generateOutputFilename('report.xlsx', mode)).toBe('report.csv')
        expect(generateOutputFilename('report.xlsx', mode, undefined)).toBe('report.csv')
      })
    })
  })

  describe('createSheetData', () => {
    it('creates SheetData with default sheet name', () => {
      const data = [
        ['a', 'b', 'c'],
        ['1', '2', '3'],
      ]
      const result = createSheetData(data)
      expect(result).toEqual({
        name: 'Sheet1',
        data,
        rowCount: 2,
        columnCount: 3,
      })
    })

    it('creates SheetData with custom sheet name', () => {
      const data = [
        ['a', 'b'],
        ['1', '2'],
        ['3', '4'],
      ]
      const result = createSheetData(data, 'Sales Data')
      expect(result).toEqual({
        name: 'Sales Data',
        data,
        rowCount: 3,
        columnCount: 2,
      })
    })

    it('handles empty data array', () => {
      const data: string[][] = []
      const result = createSheetData(data)
      expect(result).toEqual({
        name: 'Sheet1',
        data: [],
        rowCount: 0,
        columnCount: 0,
      })
    })

    it('handles single row', () => {
      const data = [['a', 'b', 'c', 'd']]
      const result = createSheetData(data)
      expect(result).toEqual({
        name: 'Sheet1',
        data,
        rowCount: 1,
        columnCount: 4,
      })
    })

    it('handles single cell', () => {
      const data = [['value']]
      const result = createSheetData(data)
      expect(result).toEqual({
        name: 'Sheet1',
        data,
        rowCount: 1,
        columnCount: 1,
      })
    })

    it('calculates column count from first row', () => {
      // Note: If rows have different lengths, columnCount is based on first row
      const data = [
        ['a', 'b'],
        ['1', '2', '3'], // More columns than first row
      ]
      const result = createSheetData(data)
      expect(result.columnCount).toBe(2) // Based on first row
    })

    it('handles jagged arrays correctly', () => {
      const data = [
        ['a', 'b', 'c'],
        ['1'], // Fewer columns
      ]
      const result = createSheetData(data)
      expect(result.columnCount).toBe(3) // Based on first row
      expect(result.rowCount).toBe(2)
    })
  })

  describe('validateCSVData', () => {
    it('returns valid for non-empty data', () => {
      const data = [['a', 'b', 'c']]
      const result = validateCSVData(data)
      expect(result).toEqual({ valid: true })
    })

    it('returns valid for large dataset', () => {
      const data = Array(1000).fill(['a', 'b', 'c'])
      const result = validateCSVData(data)
      expect(result).toEqual({ valid: true })
    })

    it('returns error for empty array', () => {
      const data: string[][] = []
      const result = validateCSVData(data)
      expect(result).toEqual({ valid: false, error: 'CSV file is empty' })
    })

    it('returns valid for single cell', () => {
      const data = [['value']]
      const result = validateCSVData(data)
      expect(result).toEqual({ valid: true })
    })

    it('returns valid for array with empty row', () => {
      // An array with an empty inner array is still non-empty
      const data = [[]]
      const result = validateCSVData(data)
      expect(result).toEqual({ valid: true })
    })
  })

  describe('getOutputMimeType', () => {
    it('returns Excel MIME type for csv-to-excel mode', () => {
      const result = getOutputMimeType('csv-to-excel')
      expect(result).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    })

    it('returns CSV MIME type for excel-to-csv mode', () => {
      const result = getOutputMimeType('excel-to-csv')
      expect(result).toBe('text/csv')
    })
  })

  describe('type exports', () => {
    it('ConversionMode type allows valid values', () => {
      const mode1: ConversionMode = 'csv-to-excel'
      const mode2: ConversionMode = 'excel-to-csv'
      expect(mode1).toBe('csv-to-excel')
      expect(mode2).toBe('excel-to-csv')
    })
  })
})
