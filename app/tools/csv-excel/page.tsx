'use client'

import {
  AlertCircle,
  ArrowLeftRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

// Dynamically import XLSX to reduce initial bundle size (~600KB)
const loadXLSX = async () => {
  const XLSX = await import('xlsx')
  return XLSX
}

type ConversionMode = 'csv-to-excel' | 'excel-to-csv'

interface FileInfo {
  name: string
  size: number
  type: string
}

interface ConversionResult {
  sheets: SheetData[]
  fileInfo: FileInfo
}

interface SheetData {
  name: string
  data: string[][] // 2D array of cell values
  rowCount: number
  columnCount: number
}

export default function CSVExcelConverterPage() {
  const [mode, setMode] = useState<ConversionMode>('csv-to-excel')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = async (selectedFile: File) => {
    setError(null)
    setResult(null)
    setFile(selectedFile)
    setIsProcessing(true)

    try {
      // Validate file type based on mode
      if (mode === 'csv-to-excel') {
        if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('csv')) {
          throw new Error('Please select a CSV file')
        }
        await processCSVToExcel(selectedFile)
      } else {
        if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
          throw new Error('Please select an Excel file (.xlsx or .xls)')
        }
        await processExcelToCSV(selectedFile)
      }

      trackToolEvent('csv_excel_convert', {
        mode,
        file_size_kb: Math.round(selectedFile.size / 1024),
        file_type: selectedFile.type,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file'
      setError(errorMessage)
      toast.error(errorMessage)
      trackToolEvent('csv_excel_error', { mode, error: errorMessage })
    } finally {
      setIsProcessing(false)
    }
  }

  const processCSVToExcel = async (csvFile: File) => {
    const text = await csvFile.text()

    // Parse CSV - simple implementation that handles quotes
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
            cell += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          row.push(cell)
          cell = ''
        } else {
          cell += char
        }
      }
      row.push(cell)
      data.push(row)
    }

    if (data.length === 0) {
      throw new Error('CSV file is empty')
    }

    const sheetData: SheetData = {
      name: 'Sheet1',
      data,
      rowCount: data.length,
      columnCount: data[0]?.length || 0,
    }

    setResult({
      sheets: [sheetData],
      fileInfo: {
        name: csvFile.name.replace('.csv', '.xlsx'),
        size: csvFile.size,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

    toast.success(
      `CSV converted successfully: ${data.length} rows, ${data[0]?.length || 0} columns`
    )
  }

  const processExcelToCSV = async (excelFile: File) => {
    const XLSX = await loadXLSX()
    const arrayBuffer = await excelFile.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    if (workbook.SheetNames.length === 0) {
      throw new Error('Excel file has no sheets')
    }

    const sheets: SheetData[] = workbook.SheetNames.map((sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: true,
      })

      // Convert to string array
      const data: string[][] = jsonData.map((row) =>
        (row as unknown[]).map((cell) => (cell === null || cell === undefined ? '' : String(cell)))
      )

      // Calculate actual dimensions
      const rowCount = data.length
      const columnCount = Math.max(...data.map((row) => row.length), 0)

      return {
        name: sheetName,
        data,
        rowCount,
        columnCount,
      }
    })

    setResult({
      sheets,
      fileInfo: {
        name: excelFile.name.replace(/\.(xlsx|xls)$/i, '.csv'),
        size: excelFile.size,
        type: 'text/csv',
      },
    })

    const totalRows = sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0)
    toast.success(
      `Excel converted successfully: ${sheets.length} sheet${sheets.length > 1 ? 's' : ''}, ${totalRows} total rows`
    )
  }

  const handleDownload = async (sheetIndex = 0) => {
    if (!result) {
      toast.error('No conversion result to download')
      return
    }

    try {
      if (mode === 'csv-to-excel') {
        // Create Excel file from CSV data
        const XLSX = await loadXLSX()
        const workbook = XLSX.utils.book_new()

        for (const sheet of result.sheets) {
          const worksheet = XLSX.utils.aoa_to_sheet(sheet.data)
          XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
        }

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([excelBuffer], { type: result.fileInfo.type })

        downloadBlob(blob, result.fileInfo.name)
        toast.success('Excel file downloaded successfully')
      } else {
        // Create CSV file from Excel data
        const sheet = result.sheets[sheetIndex]

        // Convert data to CSV format
        const csvContent = sheet.data
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

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const fileName =
          result.sheets.length > 1
            ? result.fileInfo.name.replace('.csv', `-${sheet.name}.csv`)
            : result.fileInfo.name

        downloadBlob(blob, fileName)
        toast.success('CSV file downloaded successfully')
      }

      trackToolEvent('csv_excel_download', {
        mode,
        sheet_count: result.sheets.length,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file'
      toast.error(errorMessage)
    }
  }

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    toast.success('Reset to initial state')
  }

  const handleSwapMode = () => {
    setMode(mode === 'csv-to-excel' ? 'excel-to-csv' : 'csv-to-excel')
    handleReset()
    toast.success(`Switched to ${mode === 'csv-to-excel' ? 'Excel to CSV' : 'CSV to Excel'} mode`)
  }

  const _handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isProcessing) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (isProcessing) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClickUpload = () => {
    document.getElementById('file-upload')?.click()
  }

  const acceptedFileTypes =
    mode === 'csv-to-excel'
      ? '.csv,text/csv'
      : '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

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
              className="animate-pulse rounded-xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-700 p-2.5 shadow-2xl shadow-green-500/60 sm:rounded-2xl sm:p-4"
              style={{ animationDuration: '2s' }}
            >
              <FileSpreadsheet className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-green-300 via-teal-400 to-emerald-300 bg-clip-text text-2xl font-extrabold text-transparent drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                CSV ↔ Excel Converter
              </h1>
              <p className="text-sm text-gray-200 sm:text-base md:text-lg">
                Convert between CSV and Excel formats instantly in your browser
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'green.500/30',
            bg: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Conversion Mode</CardTitle>
            <CardDescription>Select the direction of conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({ display: 'flex', flexWrap: 'wrap', gap: '3', alignItems: 'center' })}
            >
              <Button
                onClick={() => setMode('csv-to-excel')}
                className={css({
                  flex: '1',
                  minW: '200px',
                  h: 'auto',
                  py: '4',
                  px: '6',
                  flexDirection: 'column',
                  gap: '2',
                  bg: mode === 'csv-to-excel' ? 'green.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: mode === 'csv-to-excel' ? 'green.500/50' : 'gray.700/50',
                  color: mode === 'csv-to-excel' ? 'green.300' : 'gray.400',
                  _hover: {
                    bg: mode === 'csv-to-excel' ? 'green.500/30' : 'gray.800',
                  },
                })}
              >
                <span className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>CSV → Excel</span>
                <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                  Convert .csv to .xlsx
                </span>
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSwapMode}
                    className={css({
                      rounded: 'full',
                      p: '3',
                      bg: 'green.500/20',
                      border: '1px solid',
                      borderColor: 'green.500/50',
                      _hover: {
                        bg: 'green.500/30',
                        transform: 'rotate(180deg)',
                        transition: 'all 0.3s',
                      },
                    })}
                  >
                    <ArrowLeftRight className={css({ h: '5', w: '5', color: 'green.300' })} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch conversion mode</TooltipContent>
              </Tooltip>

              <Button
                onClick={() => setMode('excel-to-csv')}
                className={css({
                  flex: '1',
                  minW: '200px',
                  h: 'auto',
                  py: '4',
                  px: '6',
                  flexDirection: 'column',
                  gap: '2',
                  bg: mode === 'excel-to-csv' ? 'teal.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: mode === 'excel-to-csv' ? 'teal.500/50' : 'gray.700/50',
                  color: mode === 'excel-to-csv' ? 'teal.300' : 'gray.400',
                  _hover: {
                    bg: mode === 'excel-to-csv' ? 'teal.500/30' : 'gray.800',
                  },
                })}
              >
                <span className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Excel → CSV</span>
                <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                  Convert .xlsx to .csv
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        {(result || error) && (
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: error ? 'red.500/30' : 'green.500/30',
              bg: error ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              p: { base: '4', sm: '5', md: '6' },
              shadow: 'xl',
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
              {error ? (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              ) : result ? (
                <>
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
                      className="border-green-500/50 bg-green-500/10 px-2.5 py-1.5 text-xs text-green-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
                    >
                      📄 {result.sheets.length} sheet{result.sheets.length > 1 ? 's' : ''}
                    </Badge>
                    <Badge
                      variant="outline"
                      size="sm"
                      className="border-teal-500/50 bg-teal-500/10 px-2.5 py-1.5 text-xs text-teal-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
                    >
                      📊 {result.sheets.reduce((sum, s) => sum + s.rowCount, 0)} total rows
                    </Badge>
                    <Badge
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
                    >
                      💾 {Math.round(result.fileInfo.size / 1024)} KB
                    </Badge>
                  </div>

                  <Badge
                    variant="success"
                    size="sm"
                    className="animate-pulse bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-500/50 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
                  >
                    ✅ Converted
                  </Badge>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* File Upload */}
        {/* biome-ignore lint/a11y/useSemanticElements: drag-drop functionality requires div element */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClickUpload()
            }
          }}
          role="button"
          tabIndex={0}
          className={css({
            position: 'relative',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px dashed',
            borderColor: isDragOver ? 'green.500' : 'green.500/30',
            bg: isDragOver ? 'rgba(16, 185, 129, 0.1)' : 'rgba(17, 24, 39, 0.5)',
            transition: 'all 0.3s',
            backdropFilter: 'blur(16px)',
            transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
            shadow: isDragOver ? 'xl' : 'none',
            opacity: isProcessing ? 0.5 : 1,
            _hover: {
              borderColor: 'green.500/50',
              bg: 'rgba(17, 24, 39, 0.7)',
            },
          })}
        >
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileInputChange}
            disabled={isProcessing}
            className={css({
              position: 'absolute',
              inset: '0',
              w: 'full',
              h: 'full',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: 0,
            })}
            id="file-upload"
          />
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4',
              py: { base: '8', sm: '12' },
              pointerEvents: 'none',
            })}
          >
            <div
              className={css({
                rounded: 'full',
                bg: 'green.500/10',
                p: '6',
                border: '2px dashed',
                borderColor: 'green.500/30',
              })}
            >
              <Upload className={css({ h: '12', w: '12', color: 'green.400' })} />
            </div>
            <div className={css({ textAlign: 'center', spaceY: '2' })}>
              <p className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'gray.200' })}>
                {mode === 'csv-to-excel'
                  ? 'Drop CSV file here or click to browse'
                  : 'Drop Excel file here or click to browse'}
              </p>
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                {mode === 'csv-to-excel'
                  ? 'Supports .csv files up to 50MB'
                  : 'Supports .xlsx and .xls files up to 50MB'}
              </p>
            </div>
            {file && (
              <Badge
                className={css({
                  bg: 'green.500/20',
                  color: 'green.300',
                  px: '4',
                  py: '2',
                  fontSize: 'sm',
                })}
              >
                📎 {file.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {result && (
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: { base: '2', sm: '3' } })}>
            {result.sheets.map((sheet, index) => (
              <Tooltip key={sheet.name}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleDownload(index)}
                    size="lg"
                    variant="default"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: { base: 'sm', sm: 'base' },
                    })}
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    Download{' '}
                    {result.sheets.length > 1
                      ? `${sheet.name}`
                      : mode === 'csv-to-excel'
                        ? 'Excel'
                        : 'CSV'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Download {mode === 'csv-to-excel' ? 'as Excel file' : `${sheet.name} as CSV`}
                </TooltipContent>
              </Tooltip>
            ))}

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
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                  Convert Another File
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset and convert another file</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Preview Section */}
        {result && result.sheets.length > 0 && (
          <div className={css({ spaceY: '4' })}>
            {result.sheets.map((sheet) => (
              <Card
                key={sheet.name}
                className={css({
                  border: '2px solid',
                  borderColor: 'green.500/20',
                  bg: 'rgba(17, 24, 39, 0.5)',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <FileSpreadsheet className={css({ h: '5', w: '5', color: 'green.400' })} />
                    {sheet.name}
                  </CardTitle>
                  <CardDescription>
                    {sheet.rowCount} rows × {sheet.columnCount} columns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={css({
                      overflow: 'auto',
                      maxH: '400px',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.900/50',
                    })}
                  >
                    <table
                      className={css({
                        w: 'full',
                        fontSize: 'xs',
                        borderCollapse: 'collapse',
                      })}
                    >
                      <tbody>
                        {sheet.data.slice(0, 50).map((row, rowIndex) => (
                          <tr
                            key={`${rowIndex}-${row.join('|')}`}
                            className={css({
                              _even: { bg: 'gray.800/30' },
                            })}
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={`${rowIndex}-${cellIndex}-${cell}`}
                                className={css({
                                  px: '3',
                                  py: '2',
                                  border: '1px solid',
                                  borderColor: 'gray.700/30',
                                  color: rowIndex === 0 ? 'green.300' : 'gray.300',
                                  fontWeight: rowIndex === 0 ? 'semibold' : 'normal',
                                  maxW: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                })}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sheet.data.length > 50 && (
                      <div
                        className={css({
                          textAlign: 'center',
                          py: '3',
                          color: 'gray.500',
                          fontSize: 'xs',
                          borderTop: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      >
                        Showing first 50 rows of {sheet.rowCount}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'green.500/20',
            bg: 'rgba(16, 185, 129, 0.05)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
              <li className="text-sm sm:text-base">
                Select conversion mode (CSV to Excel or Excel to CSV)
              </li>
              <li className="text-sm sm:text-base">Drag and drop your file or click to browse</li>
              <li className="text-sm sm:text-base">
                Preview the converted data in the table below
              </li>
              <li className="text-sm sm:text-base">
                Download the converted file - multiple sheets are supported for Excel files
              </li>
              <li className="text-sm sm:text-base">
                All processing happens locally in your browser - files are never uploaded to a
                server
              </li>
              <li className="text-sm sm:text-base">
                Supports files up to 50MB with proper handling of special characters and formatting
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

        <ToolSearch />
      </main>
    </TooltipProvider>
  )
}
