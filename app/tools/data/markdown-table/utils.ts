export type Alignment = 'left' | 'center' | 'right'

export interface TableData {
  headers: string[]
  rows: string[][]
  alignments: Alignment[]
}

/**
 * Escape special Markdown characters in a cell value
 */
export function escapeMarkdownCell(value: string): string {
  if (!value) return ''
  // Escape pipe characters and trim whitespace
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim()
}

/**
 * Generate alignment separator for Markdown table
 */
function getAlignmentSeparator(alignment: Alignment): string {
  switch (alignment) {
    case 'left':
      return ':---'
    case 'center':
      return ':---:'
    case 'right':
      return '---:'
    default:
      return '---'
  }
}

/**
 * Generate a Markdown table from TableData
 */
export function generateMarkdownTable(data: TableData): string {
  if (data.headers.length === 0) return ''

  const lines: string[] = []

  // Header row
  const headerCells = data.headers.map((h) => escapeMarkdownCell(h))
  lines.push(`| ${headerCells.join(' | ')} |`)

  // Alignment row
  const alignmentCells = data.alignments.map((a) => getAlignmentSeparator(a))
  lines.push(`| ${alignmentCells.join(' | ')} |`)

  // Data rows
  for (const row of data.rows) {
    const cells = row.map((cell) => escapeMarkdownCell(cell))
    // Ensure row has same number of cells as headers
    while (cells.length < data.headers.length) {
      cells.push('')
    }
    lines.push(`| ${cells.slice(0, data.headers.length).join(' | ')} |`)
  }

  return lines.join('\n')
}

/**
 * Generate an HTML table from TableData
 */
export function generateHTMLTable(data: TableData): string {
  if (data.headers.length === 0) return ''

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const getAlignStyle = (alignment: Alignment): string => {
    return `text-align: ${alignment};`
  }

  const lines: string[] = []
  lines.push('<table>')

  // Header
  lines.push('  <thead>')
  lines.push('    <tr>')
  data.headers.forEach((header, i) => {
    const style = getAlignStyle(data.alignments[i] || 'left')
    lines.push(`      <th style="${style}">${escapeHtml(header)}</th>`)
  })
  lines.push('    </tr>')
  lines.push('  </thead>')

  // Body
  lines.push('  <tbody>')
  for (const row of data.rows) {
    lines.push('    <tr>')
    data.headers.forEach((_, i) => {
      const style = getAlignStyle(data.alignments[i] || 'left')
      const cellValue = row[i] || ''
      lines.push(`      <td style="${style}">${escapeHtml(cellValue)}</td>`)
    })
    lines.push('    </tr>')
  }
  lines.push('  </tbody>')

  lines.push('</table>')

  return lines.join('\n')
}

/**
 * Generate CSV from TableData
 */
export function generateCSV(data: TableData, delimiter = ','): string {
  if (data.headers.length === 0) return ''

  const escapeCSVCell = (value: string): string => {
    if (!value) return ''
    // If value contains delimiter, quotes, or newlines, wrap in quotes
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const lines: string[] = []

  // Header row
  lines.push(data.headers.map(escapeCSVCell).join(delimiter))

  // Data rows
  for (const row of data.rows) {
    const cells = data.headers.map((_, i) => escapeCSVCell(row[i] || ''))
    lines.push(cells.join(delimiter))
  }

  return lines.join('\n')
}

/**
 * Generate JSON from TableData
 */
export function generateJSON(data: TableData): string {
  if (data.headers.length === 0) return '[]'

  const objects = data.rows.map((row) => {
    const obj: Record<string, string> = {}
    data.headers.forEach((header, i) => {
      obj[header] = row[i] || ''
    })
    return obj
  })

  return JSON.stringify(objects, null, 2)
}

/**
 * Parse CSV string into TableData
 */
export function parseCSV(csvString: string, delimiter = ','): TableData {
  if (!csvString.trim()) {
    return { headers: [], rows: [], alignments: [] }
  }

  // Simple CSV parser that handles quoted fields
  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === delimiter) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
    }

    result.push(current.trim())
    return result
  }

  // Split by newlines, handling both \r\n and \n
  const lines = csvString
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [], alignments: [] }
  }

  const headers = parseRow(lines[0])
  const rows = lines.slice(1).map(parseRow)
  const alignments: Alignment[] = headers.map(() => 'left')

  return { headers, rows, alignments }
}

/**
 * Parse JSON array into TableData
 */
export function parseJSON(jsonString: string): TableData {
  if (!jsonString.trim()) {
    return { headers: [], rows: [], alignments: [] }
  }

  try {
    const parsed = JSON.parse(jsonString)

    if (!Array.isArray(parsed)) {
      throw new Error('JSON must be an array of objects')
    }

    if (parsed.length === 0) {
      return { headers: [], rows: [], alignments: [] }
    }

    // Extract headers from all objects (union of all keys)
    const headerSet = new Set<string>()
    for (const obj of parsed) {
      if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
          headerSet.add(key)
        }
      }
    }

    const headers = Array.from(headerSet)
    const alignments: Alignment[] = headers.map(() => 'left')

    const rows = parsed.map((obj) => {
      if (typeof obj !== 'object' || obj === null) {
        return headers.map(() => '')
      }
      return headers.map((header) => {
        const value = (obj as Record<string, unknown>)[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
      })
    })

    return { headers, rows, alignments }
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Create an empty table with specified dimensions
 */
export function createEmptyTable(cols: number, rows: number): TableData {
  const headers = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`)
  const dataRows = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''))
  const alignments: Alignment[] = Array.from({ length: cols }, () => 'left')

  return { headers, rows: dataRows, alignments }
}

/**
 * Add a new column to the table
 */
export function addColumn(data: TableData, position?: number): TableData {
  const pos = position ?? data.headers.length
  const newHeaders = [...data.headers]
  newHeaders.splice(pos, 0, `Column ${data.headers.length + 1}`)

  const newAlignments = [...data.alignments]
  newAlignments.splice(pos, 0, 'left')

  const newRows = data.rows.map((row) => {
    const newRow = [...row]
    newRow.splice(pos, 0, '')
    return newRow
  })

  return { headers: newHeaders, rows: newRows, alignments: newAlignments }
}

/**
 * Remove a column from the table
 */
export function removeColumn(data: TableData, position: number): TableData {
  if (data.headers.length <= 1) return data

  const newHeaders = data.headers.filter((_, i) => i !== position)
  const newAlignments = data.alignments.filter((_, i) => i !== position)
  const newRows = data.rows.map((row) => row.filter((_, i) => i !== position))

  return { headers: newHeaders, rows: newRows, alignments: newAlignments }
}

/**
 * Add a new row to the table
 */
export function addRow(data: TableData, position?: number): TableData {
  const pos = position ?? data.rows.length
  const newRow = Array.from({ length: data.headers.length }, () => '')
  const newRows = [...data.rows]
  newRows.splice(pos, 0, newRow)

  return { ...data, rows: newRows }
}

/**
 * Remove a row from the table
 */
export function removeRow(data: TableData, position: number): TableData {
  const newRows = data.rows.filter((_, i) => i !== position)
  return { ...data, rows: newRows }
}

/**
 * Update a cell value
 */
export function updateCell(
  data: TableData,
  rowIndex: number,
  colIndex: number,
  value: string
): TableData {
  const newRows = data.rows.map((row, ri) => {
    if (ri !== rowIndex) return row
    const newRow = [...row]
    newRow[colIndex] = value
    return newRow
  })

  return { ...data, rows: newRows }
}

/**
 * Update a header value
 */
export function updateHeader(data: TableData, colIndex: number, value: string): TableData {
  const newHeaders = [...data.headers]
  newHeaders[colIndex] = value
  return { ...data, headers: newHeaders }
}

/**
 * Update column alignment
 */
export function updateAlignment(
  data: TableData,
  colIndex: number,
  alignment: Alignment
): TableData {
  const newAlignments = [...data.alignments]
  newAlignments[colIndex] = alignment
  return { ...data, alignments: newAlignments }
}
