import { describe, expect, it } from 'vitest'

import {
  type Alignment,
  addColumn,
  addRow,
  createEmptyTable,
  escapeMarkdownCell,
  generateCSV,
  generateHTMLTable,
  generateJSON,
  generateMarkdownTable,
  parseCSV,
  parseJSON,
  removeColumn,
  removeRow,
  type TableData,
  updateAlignment,
  updateCell,
  updateHeader,
} from '../utils'

describe('escapeMarkdownCell', () => {
  it('should return empty string for empty input', () => {
    expect(escapeMarkdownCell('')).toBe('')
  })

  it('should escape pipe characters', () => {
    expect(escapeMarkdownCell('foo|bar')).toBe('foo\\|bar')
  })

  it('should replace newlines with spaces', () => {
    expect(escapeMarkdownCell('foo\nbar')).toBe('foo bar')
  })

  it('should trim whitespace', () => {
    expect(escapeMarkdownCell('  hello  ')).toBe('hello')
  })

  it('should handle multiple escapes', () => {
    expect(escapeMarkdownCell('  a|b\nc  ')).toBe('a\\|b c')
  })
})

describe('generateMarkdownTable', () => {
  it('should return empty string for empty table', () => {
    const data: TableData = { headers: [], rows: [], alignments: [] }
    expect(generateMarkdownTable(data)).toBe('')
  })

  it('should generate a simple markdown table', () => {
    const data: TableData = {
      headers: ['Name', 'Age'],
      rows: [
        ['Alice', '30'],
        ['Bob', '25'],
      ],
      alignments: ['left', 'right'],
    }
    const result = generateMarkdownTable(data)
    expect(result).toContain('| Name | Age |')
    expect(result).toContain('| :--- | ---: |')
    expect(result).toContain('| Alice | 30 |')
    expect(result).toContain('| Bob | 25 |')
  })

  it('should handle center alignment', () => {
    const data: TableData = {
      headers: ['Name'],
      rows: [['Alice']],
      alignments: ['center'],
    }
    const result = generateMarkdownTable(data)
    expect(result).toContain('| :---: |')
  })

  it('should pad rows with fewer cells than headers', () => {
    const data: TableData = {
      headers: ['A', 'B', 'C'],
      rows: [['1']],
      alignments: ['left', 'left', 'left'],
    }
    const result = generateMarkdownTable(data)
    expect(result).toContain('| 1 |  |  |')
  })
})

describe('generateHTMLTable', () => {
  it('should return empty string for empty table', () => {
    const data: TableData = { headers: [], rows: [], alignments: [] }
    expect(generateHTMLTable(data)).toBe('')
  })

  it('should generate valid HTML table structure', () => {
    const data: TableData = {
      headers: ['Name'],
      rows: [['Alice']],
      alignments: ['left'],
    }
    const result = generateHTMLTable(data)
    expect(result).toContain('<table>')
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')
    expect(result).toContain('<th')
    expect(result).toContain('<td')
  })

  it('should escape HTML special characters', () => {
    const data: TableData = {
      headers: ['<script>'],
      rows: [['&test']],
      alignments: ['left'],
    }
    const result = generateHTMLTable(data)
    expect(result).toContain('&lt;script&gt;')
    expect(result).toContain('&amp;test')
  })

  it('should apply alignment styles', () => {
    const data: TableData = {
      headers: ['Left', 'Center', 'Right'],
      rows: [['a', 'b', 'c']],
      alignments: ['left', 'center', 'right'],
    }
    const result = generateHTMLTable(data)
    expect(result).toContain('text-align: left;')
    expect(result).toContain('text-align: center;')
    expect(result).toContain('text-align: right;')
  })
})

describe('generateCSV', () => {
  it('should return empty string for empty table', () => {
    const data: TableData = { headers: [], rows: [], alignments: [] }
    expect(generateCSV(data)).toBe('')
  })

  it('should generate CSV with default comma delimiter', () => {
    const data: TableData = {
      headers: ['Name', 'Age'],
      rows: [['Alice', '30']],
      alignments: ['left', 'left'],
    }
    const result = generateCSV(data)
    expect(result).toBe('Name,Age\nAlice,30')
  })

  it('should handle custom delimiter', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
      alignments: ['left', 'left'],
    }
    const result = generateCSV(data, ';')
    expect(result).toBe('A;B\n1;2')
  })

  it('should quote values containing delimiter', () => {
    const data: TableData = {
      headers: ['Name'],
      rows: [['foo,bar']],
      alignments: ['left'],
    }
    const result = generateCSV(data)
    expect(result).toContain('"foo,bar"')
  })

  it('should escape quotes within values', () => {
    const data: TableData = {
      headers: ['Quote'],
      rows: [['say "hello"']],
      alignments: ['left'],
    }
    const result = generateCSV(data)
    expect(result).toContain('"say ""hello"""')
  })
})

describe('generateJSON', () => {
  it('should return empty array for empty table', () => {
    const data: TableData = { headers: [], rows: [], alignments: [] }
    expect(generateJSON(data)).toBe('[]')
  })

  it('should generate JSON array of objects', () => {
    const data: TableData = {
      headers: ['name', 'age'],
      rows: [
        ['Alice', '30'],
        ['Bob', '25'],
      ],
      alignments: ['left', 'left'],
    }
    const result = JSON.parse(generateJSON(data))
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ name: 'Alice', age: '30' })
    expect(result[1]).toEqual({ name: 'Bob', age: '25' })
  })
})

describe('parseCSV', () => {
  it('should return empty table for empty input', () => {
    const result = parseCSV('')
    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('should parse simple CSV', () => {
    const csv = 'Name,Age\nAlice,30\nBob,25'
    const result = parseCSV(csv)
    expect(result.headers).toEqual(['Name', 'Age'])
    expect(result.rows).toEqual([
      ['Alice', '30'],
      ['Bob', '25'],
    ])
  })

  it('should handle quoted fields', () => {
    const csv = 'Name,Description\nAlice,"Hello, World"'
    const result = parseCSV(csv)
    expect(result.rows[0][1]).toBe('Hello, World')
  })

  it('should handle escaped quotes in quoted fields', () => {
    const csv = 'Quote\n"say ""hello"""'
    const result = parseCSV(csv)
    expect(result.rows[0][0]).toBe('say "hello"')
  })

  it('should handle custom delimiter', () => {
    const csv = 'A;B\n1;2'
    const result = parseCSV(csv, ';')
    expect(result.headers).toEqual(['A', 'B'])
    expect(result.rows[0]).toEqual(['1', '2'])
  })

  it('should handle Windows line endings', () => {
    const csv = 'A,B\r\n1,2\r\n3,4'
    const result = parseCSV(csv)
    expect(result.rows).toHaveLength(2)
  })

  it('should set all alignments to left', () => {
    const csv = 'A,B,C\n1,2,3'
    const result = parseCSV(csv)
    expect(result.alignments).toEqual(['left', 'left', 'left'])
  })
})

describe('parseJSON', () => {
  it('should return empty table for empty input', () => {
    const result = parseJSON('')
    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('should return empty table for empty array', () => {
    const result = parseJSON('[]')
    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('should parse JSON array of objects', () => {
    const json = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ])
    const result = parseJSON(json)
    expect(result.headers).toContain('name')
    expect(result.headers).toContain('age')
    expect(result.rows).toHaveLength(2)
  })

  it('should handle objects with different keys', () => {
    const json = JSON.stringify([{ a: 1 }, { b: 2 }, { a: 3, c: 4 }])
    const result = parseJSON(json)
    expect(result.headers).toContain('a')
    expect(result.headers).toContain('b')
    expect(result.headers).toContain('c')
  })

  it('should convert nested objects to JSON strings', () => {
    const json = JSON.stringify([{ data: { nested: true } }])
    const result = parseJSON(json)
    expect(result.rows[0][0]).toBe('{"nested":true}')
  })

  it('should handle null and undefined values', () => {
    const json = JSON.stringify([{ a: null, b: 'test' }])
    const result = parseJSON(json)
    const aIndex = result.headers.indexOf('a')
    const bIndex = result.headers.indexOf('b')
    expect(result.rows[0][aIndex]).toBe('')
    expect(result.rows[0][bIndex]).toBe('test')
  })

  it('should throw error for non-array JSON', () => {
    expect(() => parseJSON('{"not": "array"}')).toThrow('JSON must be an array of objects')
  })

  it('should throw error for invalid JSON', () => {
    expect(() => parseJSON('invalid json')).toThrow('Invalid JSON')
  })
})

describe('createEmptyTable', () => {
  it('should create table with specified dimensions', () => {
    const result = createEmptyTable(3, 2)
    expect(result.headers).toHaveLength(3)
    expect(result.rows).toHaveLength(2)
    expect(result.alignments).toHaveLength(3)
  })

  it('should create headers with column numbers', () => {
    const result = createEmptyTable(3, 1)
    expect(result.headers).toEqual(['Column 1', 'Column 2', 'Column 3'])
  })

  it('should create empty cells', () => {
    const result = createEmptyTable(2, 2)
    expect(result.rows[0]).toEqual(['', ''])
    expect(result.rows[1]).toEqual(['', ''])
  })

  it('should set all alignments to left', () => {
    const result = createEmptyTable(3, 1)
    expect(result.alignments).toEqual(['left', 'left', 'left'])
  })
})

describe('addColumn', () => {
  it('should add column at the end by default', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
      alignments: ['left', 'left'],
    }
    const result = addColumn(data)
    expect(result.headers).toHaveLength(3)
    expect(result.headers[2]).toBe('Column 3')
    expect(result.rows[0]).toHaveLength(3)
    expect(result.alignments).toHaveLength(3)
  })

  it('should add column at specified position', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
      alignments: ['left', 'right'],
    }
    const result = addColumn(data, 1)
    expect(result.headers).toEqual(['A', 'Column 3', 'B'])
    expect(result.rows[0]).toEqual(['1', '', '2'])
    expect(result.alignments).toEqual(['left', 'left', 'right'])
  })
})

describe('removeColumn', () => {
  it('should remove column at specified position', () => {
    const data: TableData = {
      headers: ['A', 'B', 'C'],
      rows: [['1', '2', '3']],
      alignments: ['left', 'center', 'right'],
    }
    const result = removeColumn(data, 1)
    expect(result.headers).toEqual(['A', 'C'])
    expect(result.rows[0]).toEqual(['1', '3'])
    expect(result.alignments).toEqual(['left', 'right'])
  })

  it('should not remove last column', () => {
    const data: TableData = {
      headers: ['A'],
      rows: [['1']],
      alignments: ['left'],
    }
    const result = removeColumn(data, 0)
    expect(result.headers).toEqual(['A'])
  })
})

describe('addRow', () => {
  it('should add row at the end by default', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
      alignments: ['left', 'left'],
    }
    const result = addRow(data)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[1]).toEqual(['', ''])
  })

  it('should add row at specified position', () => {
    const data: TableData = {
      headers: ['A'],
      rows: [['1'], ['2']],
      alignments: ['left'],
    }
    const result = addRow(data, 1)
    expect(result.rows).toHaveLength(3)
    expect(result.rows[1]).toEqual([''])
    expect(result.rows[2]).toEqual(['2'])
  })
})

describe('removeRow', () => {
  it('should remove row at specified position', () => {
    const data: TableData = {
      headers: ['A'],
      rows: [['1'], ['2'], ['3']],
      alignments: ['left'],
    }
    const result = removeRow(data, 1)
    expect(result.rows).toHaveLength(2)
    expect(result.rows).toEqual([['1'], ['3']])
  })

  it('should handle removing all rows', () => {
    const data: TableData = {
      headers: ['A'],
      rows: [['1']],
      alignments: ['left'],
    }
    const result = removeRow(data, 0)
    expect(result.rows).toHaveLength(0)
  })
})

describe('updateCell', () => {
  it('should update cell at specified position', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [
        ['1', '2'],
        ['3', '4'],
      ],
      alignments: ['left', 'left'],
    }
    const result = updateCell(data, 1, 0, 'updated')
    expect(result.rows[1][0]).toBe('updated')
    expect(result.rows[0][0]).toBe('1') // Other cells unchanged
  })
})

describe('updateHeader', () => {
  it('should update header at specified position', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [],
      alignments: ['left', 'left'],
    }
    const result = updateHeader(data, 0, 'New Header')
    expect(result.headers[0]).toBe('New Header')
    expect(result.headers[1]).toBe('B') // Other header unchanged
  })
})

describe('updateAlignment', () => {
  it('should update alignment at specified position', () => {
    const data: TableData = {
      headers: ['A', 'B'],
      rows: [],
      alignments: ['left', 'left'],
    }
    const result = updateAlignment(data, 1, 'center')
    expect(result.alignments[1]).toBe('center')
    expect(result.alignments[0]).toBe('left') // Other alignment unchanged
  })

  it('should handle all alignment types', () => {
    const data: TableData = {
      headers: ['A'],
      rows: [],
      alignments: ['left'],
    }

    const alignments: Alignment[] = ['left', 'center', 'right']
    for (const alignment of alignments) {
      const result = updateAlignment(data, 0, alignment)
      expect(result.alignments[0]).toBe(alignment)
    }
  })
})
