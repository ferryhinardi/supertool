/**
 * CSV-Excel Converter Utility Functions
 *
 * These utilities handle CSV parsing, generation, and file validation
 * for the CSV ↔ Excel conversion tool.
 */

export type ConversionMode = 'csv-to-excel' | 'excel-to-csv'

export interface FileInfo {
  name: string
  size: number
  type: string
}

export interface SheetData {
  name: string
  data: string[][] // 2D array of cell values
  rowCount: number
  columnCount: number
}

export interface ConversionResult {
  sheets: SheetData[]
  fileInfo: FileInfo
}

/**
 * Parse CSV text into a 2D array of strings.
 * Handles:
 * - Quoted fields containing commas
 * - Escaped quotes ("" becomes ")
 * - Windows and Unix line endings
 * - Empty lines (filtered out)
 *
 * @param text - Raw CSV text content
 * @returns 2D array where each inner array is a row of cell values
 */
export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const data: string[][] = []

  for (const line of lines) {
    const row: string[] = []
    let cell = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          cell += '"'
          i++
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // End of cell
        row.push(cell)
        cell = ''
      } else {
        cell += char
      }
    }
    // Push the last cell
    row.push(cell)
    data.push(row)
  }

  return data
}

/**
 * Convert a 2D array to CSV string with proper escaping.
 * Cells containing commas, quotes, or newlines are quoted.
 * Quotes within cells are escaped as "".
 *
 * @param data - 2D array of cell values
 * @returns CSV formatted string
 */
export function convertToCSVString(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell)
          // Escape cells containing commas, quotes, or newlines
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(',')
    )
    .join('\n')
}

/**
 * Get file extension from filename (lowercase).
 *
 * @param filename - Name of the file
 * @returns Lowercase extension without dot, or empty string if none
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/i)
  return match ? match[1].toLowerCase() : ''
}

/**
 * Validate file type based on conversion mode.
 *
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 * @param mode - Current conversion mode
 * @returns Object with valid flag and optional error message
 */
export function validateFileType(
  filename: string,
  mimeType: string,
  mode: ConversionMode
): { valid: boolean; error?: string } {
  if (mode === 'csv-to-excel') {
    if (!filename.endsWith('.csv') && !mimeType.includes('csv')) {
      return { valid: false, error: 'Please select a CSV file' }
    }
  } else {
    if (!filename.match(/\.(xlsx|xls)$/i)) {
      return { valid: false, error: 'Please select an Excel file (.xlsx or .xls)' }
    }
  }
  return { valid: true }
}

/**
 * Format file size in human-readable format.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "256 KB", "100 B")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Generate output filename based on conversion mode.
 *
 * @param originalName - Original filename
 * @param mode - Conversion mode
 * @param sheetName - Optional sheet name for multi-sheet Excel files
 * @returns New filename with appropriate extension
 */
export function generateOutputFilename(
  originalName: string,
  mode: ConversionMode,
  sheetName?: string
): string {
  if (mode === 'csv-to-excel') {
    return originalName.replace(/\.csv$/i, '.xlsx')
  }
  // excel-to-csv
  const baseName = originalName.replace(/\.(xlsx|xls)$/i, '')
  if (sheetName) {
    return `${baseName}-${sheetName}.csv`
  }
  return `${baseName}.csv`
}

/**
 * Create SheetData object from parsed CSV data.
 *
 * @param data - 2D array of cell values
 * @param sheetName - Name for the sheet
 * @returns SheetData object
 */
export function createSheetData(data: string[][], sheetName = 'Sheet1'): SheetData {
  return {
    name: sheetName,
    data,
    rowCount: data.length,
    columnCount: data[0]?.length || 0,
  }
}

/**
 * Validate that CSV data is not empty.
 *
 * @param data - Parsed CSV data
 * @returns Object with valid flag and optional error message
 */
export function validateCSVData(data: string[][]): { valid: boolean; error?: string } {
  if (data.length === 0) {
    return { valid: false, error: 'CSV file is empty' }
  }
  return { valid: true }
}

/**
 * Get MIME type for output file based on conversion mode.
 *
 * @param mode - Conversion mode
 * @returns Appropriate MIME type string
 */
export function getOutputMimeType(mode: ConversionMode): string {
  if (mode === 'csv-to-excel') {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
  return 'text/csv'
}
