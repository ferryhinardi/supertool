'use client'

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Table,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  type Alignment,
  addColumn,
  addRow,
  createEmptyTable,
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
} from './utils'

type ExportFormat = 'markdown' | 'html' | 'json' | 'csv'
type ImportMode = 'csv' | 'json'

export default function MarkdownTablePage() {
  const [tableData, setTableData] = useState<TableData>(() => createEmptyTable(3, 3))
  const [importText, setImportText] = useState('')
  const [importMode, setImportMode] = useState<ImportMode>('csv')
  const [showImport, setShowImport] = useState(false)

  // Generate outputs
  const outputs = useMemo(() => {
    return {
      markdown: generateMarkdownTable(tableData),
      html: generateHTMLTable(tableData),
      json: generateJSON(tableData),
      csv: generateCSV(tableData),
    }
  }, [tableData])

  // Stats
  const stats = useMemo(() => {
    return {
      rows: tableData.rows.length,
      columns: tableData.headers.length,
      cells: tableData.rows.length * tableData.headers.length,
    }
  }, [tableData])

  // Handlers
  const handleAddColumn = useCallback(() => {
    setTableData((prev) => addColumn(prev))
    trackToolEvent('markdown_table_add_column', { columns: tableData.headers.length + 1 })
  }, [tableData.headers.length])

  const handleRemoveColumn = useCallback((index: number) => {
    setTableData((prev) => removeColumn(prev, index))
    trackToolEvent('markdown_table_remove_column', {})
  }, [])

  const handleAddRow = useCallback(() => {
    setTableData((prev) => addRow(prev))
    trackToolEvent('markdown_table_add_row', { rows: tableData.rows.length + 1 })
  }, [tableData.rows.length])

  const handleRemoveRow = useCallback((index: number) => {
    setTableData((prev) => removeRow(prev, index))
    trackToolEvent('markdown_table_remove_row', {})
  }, [])

  const handleHeaderChange = useCallback((index: number, value: string) => {
    setTableData((prev) => updateHeader(prev, index, value))
  }, [])

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setTableData((prev) => updateCell(prev, rowIndex, colIndex, value))
  }, [])

  const handleAlignmentChange = useCallback((index: number, alignment: Alignment) => {
    setTableData((prev) => updateAlignment(prev, index, alignment))
    trackToolEvent('markdown_table_alignment', { alignment })
  }, [])

  const handleImport = useCallback(() => {
    try {
      const parsed = importMode === 'csv' ? parseCSV(importText) : parseJSON(importText)
      if (parsed.headers.length === 0) {
        toast.error('No data found in input')
        return
      }
      setTableData(parsed)
      setShowImport(false)
      setImportText('')
      toast.success(`Imported ${parsed.rows.length} rows from ${importMode.toUpperCase()}`)
      trackToolEvent('markdown_table_import', { format: importMode, rows: parsed.rows.length })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse input')
    }
  }, [importText, importMode])

  const handleCopy = useCallback(
    async (format: ExportFormat) => {
      const output = outputs[format]
      await navigator.clipboard.writeText(output)
      toast.success(`${format.toUpperCase()} copied to clipboard`)
      trackToolEvent('markdown_table_copy', { format, length: output.length })
    },
    [outputs]
  )

  const handleDownload = useCallback(
    (format: ExportFormat) => {
      const output = outputs[format]
      const mimeTypes: Record<ExportFormat, string> = {
        markdown: 'text/markdown',
        html: 'text/html',
        json: 'application/json',
        csv: 'text/csv',
      }
      const extensions: Record<ExportFormat, string> = {
        markdown: 'md',
        html: 'html',
        json: 'json',
        csv: 'csv',
      }

      const blob = new Blob([output], { type: mimeTypes[format] })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `table-${Date.now()}.${extensions[format]}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as ${format.toUpperCase()}`)
      trackToolEvent('markdown_table_download', { format, size_kb: Math.round(blob.size / 1024) })
    },
    [outputs]
  )

  const handleReset = useCallback(() => {
    setTableData(createEmptyTable(3, 3))
    setImportText('')
    setShowImport(false)
    toast.success('Table reset to default')
    trackToolEvent('markdown_table_reset', {})
  }, [])

  const AlignmentButton = ({
    alignment,
    current,
    onChange,
  }: {
    alignment: Alignment
    current: Alignment
    onChange: (a: Alignment) => void
  }) => {
    const icons = {
      left: AlignLeft,
      center: AlignCenter,
      right: AlignRight,
    }
    const Icon = icons[alignment]
    return (
      <button
        type="button"
        onClick={() => onChange(alignment)}
        className={css({
          p: '1',
          rounded: 'md',
          transition: 'all 0.2s',
          bg: current === alignment ? 'purple.500/30' : 'transparent',
          color: current === alignment ? 'purple.300' : 'gray.400',
          _hover: { bg: 'purple.500/20', color: 'purple.300' },
        })}
        title={`Align ${alignment}`}
      >
        <Icon className={css({ h: '4', w: '4' })} />
      </button>
    )
  }

  return (
    <TooltipProvider>
      <main
        className={css({
          mx: 'auto',
          maxW: '1400px',
          w: 'full',
          px: { base: '4', sm: '6', md: '8' },
          py: { base: '6', sm: '8', md: '10' },
          spaceY: { base: '4', sm: '6', md: '8' },
        })}
      >
        {/* Header */}
        <div className={css({ spaceY: '3' })}>
          <div
            className={css({ display: 'flex', alignItems: 'center', gap: { base: '3', sm: '4' } })}
          >
            <div
              className={css({
                animation: 'pulse',
                rounded: { base: 'xl', sm: '2xl' },
                bgGradient: 'to-br',
                gradientFrom: 'purple.600',
                gradientVia: 'pink.600',
                gradientTo: 'fuchsia.700',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.6)',
              })}
              style={{ animationDuration: '2s' }}
            >
              <Table
                className={css({
                  h: { base: '6', sm: '8' },
                  w: { base: '6', sm: '8' },
                  color: 'white',
                })}
              />
            </div>
            <div>
              <h1
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.300',
                  gradientVia: 'pink.400',
                  gradientTo: 'fuchsia.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  color: 'transparent',
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Markdown Table Generator
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Create and edit tables visually, export to multiple formats
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(168, 85, 247, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: '0 20px 25px rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              alignItems: { base: 'start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { base: '3', sm: '4' },
            })}
          >
            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'purple.500/50',
                  bg: 'purple.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'purple.200',
                })}
              >
                {stats.columns} columns
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'pink.500/50',
                  bg: 'pink.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'pink.200',
                })}
              >
                {stats.rows} rows
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'fuchsia.500/50',
                  bg: 'fuchsia.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'fuchsia.200',
                })}
              >
                {stats.cells} cells
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: { base: '2', sm: '3' },
          })}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowImport(!showImport)}
                size="lg"
                variant={showImport ? 'default' : 'outline'}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                })}
              >
                <Upload className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })} />
                Import
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import from CSV or JSON</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handleCopy('markdown')}
                size="lg"
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                })}
              >
                <Copy className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })} />
                Copy Markdown
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Markdown to clipboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handleDownload('markdown')}
                size="lg"
                variant="default"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                })}
              >
                <Download
                  className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })}
                />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as Markdown file</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: { base: 'sm', sm: 'base' },
                })}
              >
                <RefreshCw
                  className={css({ h: { base: '4', sm: '5' }, w: { base: '4', sm: '5' } })}
                />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset table to default</TooltipContent>
          </Tooltip>
        </div>

        {/* Import Section */}
        {showImport && (
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'purple.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '4' })}>
              <h3
                className={css({
                  fontSize: { base: 'base', sm: 'lg' },
                  fontWeight: 'semibold',
                  color: 'purple.300',
                })}
              >
                Import Data
              </h3>
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={() => setImportMode('csv')}
                  size="sm"
                  variant={importMode === 'csv' ? 'default' : 'outline'}
                  className={css({ display: 'flex', alignItems: 'center', gap: '1' })}
                >
                  <FileSpreadsheet className={css({ h: '4', w: '4' })} />
                  CSV
                </Button>
                <Button
                  onClick={() => setImportMode('json')}
                  size="sm"
                  variant={importMode === 'json' ? 'default' : 'outline'}
                  className={css({ display: 'flex', alignItems: 'center', gap: '1' })}
                >
                  <FileJson className={css({ h: '4', w: '4' })} />
                  JSON
                </Button>
              </div>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                importMode === 'csv'
                  ? 'Paste CSV data here...\nname,age,city\nJohn,30,NYC\nJane,25,LA'
                  : 'Paste JSON array here...\n[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
              }
              className={css({
                w: 'full',
                h: '150px',
                rounded: 'lg',
                border: '2px solid',
                borderColor: 'gray.700',
                bg: 'rgba(17, 24, 39, 0.7)',
                px: '4',
                py: '3',
                color: 'white',
                fontFamily: 'mono',
                fontSize: 'sm',
                resize: 'vertical',
                _focus: {
                  borderColor: 'purple.500',
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'rgba(168, 85, 247, 0.3)',
                },
                _placeholder: { color: 'gray.500' },
              })}
            />
            <div className={css({ display: 'flex', gap: '2', mt: '3' })}>
              <Button onClick={handleImport} disabled={!importText.trim()}>
                Import Data
              </Button>
              <Button variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Visual Table Editor */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'rgba(168, 85, 247, 0.05)',
              px: { base: '4', sm: '6' },
              py: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'sm', sm: 'base' },
                fontWeight: 'semibold',
                color: 'purple.300',
              })}
            >
              Table Editor
            </h3>
            <div className={css({ display: 'flex', gap: '2' })}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={handleAddColumn}>
                    <Plus className={css({ h: '4', w: '4', mr: '1' })} />
                    Column
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new column</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={handleAddRow}>
                    <Plus className={css({ h: '4', w: '4', mr: '1' })} />
                    Row
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new row</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className={css({ overflowX: 'auto', p: { base: '4', sm: '6' } })}>
            <table className={css({ w: 'full', borderCollapse: 'collapse' })}>
              <thead>
                <tr>
                  <th className={css({ w: '40px', p: '2' })} />
                  {tableData.headers.map((header, colIndex) => (
                    <th
                      // biome-ignore lint/suspicious/noArrayIndexKey: table columns are identified by index position
                      key={`header-${colIndex}`}
                      className={css({
                        p: '2',
                        borderBottom: '2px solid',
                        borderColor: 'purple.500/30',
                      })}
                    >
                      <div className={css({ spaceY: '2' })}>
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                          className={css({
                            w: 'full',
                            minW: '100px',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'rgba(17, 24, 39, 0.7)',
                            px: '3',
                            py: '2',
                            color: 'white',
                            fontWeight: 'semibold',
                            fontSize: 'sm',
                            textAlign: tableData.alignments[colIndex] || 'left',
                            _focus: {
                              borderColor: 'purple.500',
                              outline: 'none',
                            },
                          })}
                        />
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1',
                          })}
                        >
                          <div className={css({ display: 'flex', gap: '0.5' })}>
                            <AlignmentButton
                              alignment="left"
                              current={tableData.alignments[colIndex]}
                              onChange={(a) => handleAlignmentChange(colIndex, a)}
                            />
                            <AlignmentButton
                              alignment="center"
                              current={tableData.alignments[colIndex]}
                              onChange={(a) => handleAlignmentChange(colIndex, a)}
                            />
                            <AlignmentButton
                              alignment="right"
                              current={tableData.alignments[colIndex]}
                              onChange={(a) => handleAlignmentChange(colIndex, a)}
                            />
                          </div>
                          {tableData.headers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColumn(colIndex)}
                              className={css({
                                p: '1',
                                rounded: 'md',
                                color: 'gray.500',
                                _hover: { bg: 'red.500/20', color: 'red.400' },
                              })}
                              title="Remove column"
                            >
                              <Trash2 className={css({ h: '3.5', w: '3.5' })} />
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: table rows are identified by index position
                    key={`row-${rowIndex}`}
                  >
                    <td className={css({ p: '2', textAlign: 'center' })}>
                      {tableData.rows.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(rowIndex)}
                          className={css({
                            p: '1',
                            rounded: 'md',
                            color: 'gray.500',
                            _hover: { bg: 'red.500/20', color: 'red.400' },
                          })}
                          title="Remove row"
                        >
                          <Trash2 className={css({ h: '3.5', w: '3.5' })} />
                        </button>
                      )}
                    </td>
                    {tableData.headers.map((_, colIndex) => (
                      <td
                        // biome-ignore lint/suspicious/noArrayIndexKey: table cells are identified by row and column index
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={css({
                          p: '2',
                          borderBottom: '1px solid',
                          borderColor: 'gray.800',
                        })}
                      >
                        <input
                          type="text"
                          value={row[colIndex] || ''}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className={css({
                            w: 'full',
                            minW: '100px',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'rgba(17, 24, 39, 0.5)',
                            px: '3',
                            py: '2',
                            color: 'white',
                            fontSize: 'sm',
                            textAlign: tableData.alignments[colIndex] || 'left',
                            _focus: {
                              borderColor: 'purple.500',
                              outline: 'none',
                            },
                          })}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Markdown Preview */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'pink.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'pink.500/20',
              bg: 'rgba(236, 72, 153, 0.05)',
              px: { base: '4', sm: '6' },
              py: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'sm', sm: 'base' },
                fontWeight: 'semibold',
                color: 'pink.300',
              })}
            >
              Markdown Output
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy('markdown')}
              className={css({ display: 'flex', alignItems: 'center', gap: '1' })}
            >
              <Copy className={css({ h: '4', w: '4' })} />
              Copy
            </Button>
          </div>
          <pre
            className={css({
              p: { base: '4', sm: '6' },
              fontFamily: 'mono',
              fontSize: 'sm',
              color: 'white',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
            })}
          >
            {outputs.markdown}
          </pre>
        </div>

        {/* Export Options */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'fuchsia.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '4',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'fuchsia.300',
            })}
          >
            Export Options
          </h3>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: '3',
            })}
          >
            {(
              [
                { format: 'markdown', label: 'Markdown', icon: FileSpreadsheet },
                { format: 'html', label: 'HTML', icon: FileSpreadsheet },
                { format: 'json', label: 'JSON', icon: FileJson },
                { format: 'csv', label: 'CSV', icon: FileSpreadsheet },
              ] as const
            ).map(({ format, label, icon: Icon }) => (
              <div
                key={format}
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  p: '4',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    mb: '3',
                    color: 'white',
                  })}
                >
                  <Icon className={css({ h: '5', w: '5' })} />
                  <span className={css({ fontWeight: 'medium' })}>{label}</span>
                </div>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(format)}
                    className={css({ flex: '1' })}
                  >
                    <Copy className={css({ h: '4', w: '4', mr: '1' })} />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(format)}
                    className={css({ flex: '1' })}
                  >
                    <Download className={css({ h: '4', w: '4', mr: '1' })} />
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ToolSearch />
      </main>
    </TooltipProvider>
  )
}
