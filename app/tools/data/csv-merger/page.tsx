'use client'

import { AlertCircle, FileSpreadsheet, Layers, Scissors, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { TooltipProvider } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type Mode = 'merge' | 'split'

interface CSVFile {
  name: string
  data: string[][]
  rowCount: number
  columnCount: number
}

export default function CSVMergerPage() {
  const [mode, setMode] = useState<Mode>('merge')
  const [files, setFiles] = useState<CSVFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Merge mode state
  const [deduplicate, setDeduplicate] = useState(false)

  // Split mode state
  const [splitBy, setSplitBy] = useState<'rows' | 'filter'>('rows')
  const [rowsPerFile, setRowsPerFile] = useState('1000')
  const [filterColumn, setFilterColumn] = useState('')

  const parseCSV = (text: string): string[][] => {
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

    return data
  }

  const handleFileSelect = async (selectedFiles: FileList) => {
    setError(null)
    setIsProcessing(true)

    try {
      if (mode === 'merge' && selectedFiles.length < 2) {
        throw new Error('Please select at least 2 CSV files to merge')
      }

      if (mode === 'split' && selectedFiles.length !== 1) {
        throw new Error('Please select exactly 1 CSV file to split')
      }

      const parsedFiles: CSVFile[] = []

      for (const file of Array.from(selectedFiles)) {
        if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
          throw new Error(`${file.name} is not a CSV file`)
        }

        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 50MB size limit`)
        }

        const text = await file.text()
        const data = parseCSV(text)

        if (data.length === 0) {
          throw new Error(`${file.name} is empty`)
        }

        parsedFiles.push({
          name: file.name,
          data,
          rowCount: data.length,
          columnCount: data[0]?.length || 0,
        })
      }

      setFiles(parsedFiles)
      toast.success(
        mode === 'merge'
          ? `${parsedFiles.length} CSV files loaded successfully`
          : 'CSV file loaded successfully'
      )

      trackToolEvent('csv_merger_upload', {
        mode,
        file_count: parsedFiles.length,
        total_rows: parsedFiles.reduce((sum, f) => sum + f.rowCount, 0),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process files'
      setError(errorMessage)
      toast.error(errorMessage)
      trackToolEvent('csv_merger_error', { mode, error: errorMessage })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMerge = () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 CSV files to merge')
      return
    }

    try {
      // Get all unique column headers from all files
      const allHeaders = new Set<string>()
      for (const file of files) {
        if (file.data.length > 0) {
          for (const header of file.data[0]) {
            allHeaders.add(header)
          }
        }
      }

      const finalHeaders = Array.from(allHeaders)
      const mergedData: string[][] = [finalHeaders]

      // Merge all files
      for (const file of files) {
        const fileHeaders = file.data[0] || []
        const dataRows = file.data.slice(1)

        for (const row of dataRows) {
          const newRow = finalHeaders.map((header) => {
            const index = fileHeaders.indexOf(header)
            return index >= 0 ? row[index] || '' : ''
          })
          mergedData.push(newRow)
        }
      }

      // Deduplicate if enabled
      let finalData = mergedData
      if (deduplicate && mergedData.length > 1) {
        const seen = new Set<string>()
        finalData = [mergedData[0]] // Keep headers
        for (let i = 1; i < mergedData.length; i++) {
          const rowKey = mergedData[i].join('|')
          if (!seen.has(rowKey)) {
            seen.add(rowKey)
            finalData.push(mergedData[i])
          }
        }
      }

      downloadCSV(finalData, 'merged.csv')
      toast.success(
        `Successfully merged ${files.length} files into ${finalData.length - 1} rows${deduplicate ? ' (duplicates removed)' : ''}`
      )

      trackToolEvent('csv_merger_merge', {
        file_count: files.length,
        output_rows: finalData.length - 1,
        deduplicated: deduplicate,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to merge files'
      toast.error(errorMessage)
      trackToolEvent('csv_merger_error', { mode: 'merge', error: errorMessage })
    }
  }

  const handleSplit = () => {
    if (files.length !== 1) {
      toast.error('Please upload exactly 1 CSV file to split')
      return
    }

    try {
      const file = files[0]
      const headers = file.data[0] || []
      const dataRows = file.data.slice(1)

      let splitFiles: { name: string; data: string[][] }[] = []

      if (splitBy === 'rows') {
        const rows = Number.parseInt(rowsPerFile, 10)
        if (Number.isNaN(rows) || rows <= 0) {
          throw new Error('Please enter a valid number of rows')
        }

        // Split by row count
        for (let i = 0; i < dataRows.length; i += rows) {
          const chunk = dataRows.slice(i, i + rows)
          splitFiles.push({
            name: `split_${Math.floor(i / rows) + 1}.csv`,
            data: [headers, ...chunk],
          })
        }
      } else {
        // Split by filter
        if (!filterColumn) {
          throw new Error('Please select a column to filter by')
        }

        const columnIndex = headers.indexOf(filterColumn)
        if (columnIndex === -1) {
          throw new Error(`Column "${filterColumn}" not found`)
        }

        // Group rows by unique values in filter column
        const groups: { [key: string]: string[][] } = {}
        for (const row of dataRows) {
          const value = row[columnIndex] || 'empty'
          if (!groups[value]) {
            groups[value] = []
          }
          groups[value].push(row)
        }

        // Create split files
        splitFiles = Object.entries(groups).map(([value, rows]) => ({
          name: `split_${value.replace(/[^a-z0-9]/gi, '_')}.csv`,
          data: [headers, ...rows],
        }))
      }

      // Download all split files
      for (const splitFile of splitFiles) {
        downloadCSV(splitFile.data, splitFile.name)
      }

      toast.success(`Successfully split into ${splitFiles.length} files`)

      trackToolEvent('csv_merger_split', {
        split_by: splitBy,
        file_count: splitFiles.length,
        original_rows: dataRows.length,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to split file'
      toast.error(errorMessage)
      trackToolEvent('csv_merger_error', { mode: 'split', error: errorMessage })
    }
  }

  const downloadCSV = (data: string[][], fileName: string) => {
    const csvContent = data
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell)
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackToolEvent('csv_merger_download', { mode, file_name: fileName })
  }

  const handleReset = () => {
    setFiles([])
    setError(null)
    toast.success('Reset to initial state')
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    toast.success('File removed')
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

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles)
    }
  }

  const handleClickUpload = () => {
    document.getElementById('file-upload')?.click()
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
                animationDuration: '2s',
                rounded: { base: 'xl', sm: '2xl' },
                bgGradient: 'to-br',
                gradientFrom: 'teal.500',
                gradientTo: 'emerald.500',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgb(20 184 166 / 0.6)',
              })}
            >
              <FileSpreadsheet
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
                  gradientFrom: 'teal.300',
                  gradientVia: 'emerald.400',
                  gradientTo: 'green.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  color: 'transparent',
                  dropShadow: 'lg',
                })}
              >
                CSV Merger & Splitter
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Merge multiple CSV files or split large CSVs by rules
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'teal.500/30',
            bg: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Select Mode</CardTitle>
            <CardDescription>Choose whether to merge or split CSV files</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: { base: 'grid', sm: 'flex' },
                gridTemplateColumns: { base: '1fr' },
                flexWrap: 'wrap',
                gap: '3',
              })}
            >
              <Button
                onClick={() => {
                  setMode('merge')
                  handleReset()
                }}
                className={css({
                  flex: '1',
                  minW: { base: '0', sm: '200px' },
                  w: { base: 'full', sm: 'auto' },
                  h: 'auto',
                  py: '4',
                  px: '6',
                  flexDirection: 'column',
                  gap: '2',
                  bg: mode === 'merge' ? 'teal.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: mode === 'merge' ? 'teal.500/50' : 'gray.700/50',
                  color: mode === 'merge' ? 'teal.300' : 'gray.400',
                  _hover: {
                    bg: mode === 'merge' ? 'teal.500/30' : 'gray.800',
                  },
                })}
              >
                <Layers className={css({ h: '6', w: '6' })} />
                <span className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Merge</span>
                <span className={css({ fontSize: 'xs', color: 'white' })}>
                  Combine multiple CSV files
                </span>
              </Button>

              <Button
                onClick={() => {
                  setMode('split')
                  handleReset()
                }}
                className={css({
                  flex: '1',
                  minW: '200px',
                  h: 'auto',
                  py: '4',
                  px: '6',
                  flexDirection: 'column',
                  gap: '2',
                  bg: mode === 'split' ? 'emerald.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: mode === 'split' ? 'emerald.500/50' : 'gray.700/50',
                  color: mode === 'split' ? 'emerald.300' : 'gray.400',
                  _hover: {
                    bg: mode === 'split' ? 'emerald.500/30' : 'gray.800',
                  },
                })}
              >
                <Scissors className={css({ h: '6', w: '6' })} />
                <span className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Split</span>
                <span className={css({ fontSize: 'xs', color: 'white' })}>
                  Divide large CSV files
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        {(files.length > 0 || error) && (
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: error ? 'red.500/30' : 'teal.500/30',
              bg: error ? 'rgba(239, 68, 68, 0.05)' : 'rgba(20, 184, 166, 0.05)',
              p: { base: '4', sm: '5', md: '6' },
              shadow: 'xl',
              backdropFilter: 'blur(16px)',
            })}
          >
            {error ? (
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <AlertCircle className={css({ h: '5', w: '5', color: 'red.400' })} />
                <span className={css({ fontSize: 'sm', color: 'red.300' })}>{error}</span>
              </div>
            ) : (
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
                    borderColor: 'teal.500/50',
                    bg: 'teal.500/10',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    color: 'teal.200',
                  })}
                >
                  📄 {files.length} file{files.length > 1 ? 's' : ''}
                </Badge>
                <Badge
                  variant="outline"
                  size="sm"
                  className={css({
                    borderColor: 'emerald.500/50',
                    bg: 'emerald.500/10',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    color: 'emerald.200',
                  })}
                >
                  📊 {files.reduce((sum, f) => sum + f.rowCount, 0)} total rows
                </Badge>
                <Badge
                  variant="success"
                  size="sm"
                  className={css({
                    animation: 'pulse',
                    bgGradient: 'to-r',
                    gradientFrom: 'teal.500',
                    gradientTo: 'emerald.600',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    fontWeight: 'semibold',
                    color: 'white',
                    shadow: 'lg',
                    boxShadow: '0 10px 15px -3px rgb(20 184 166 / 0.5)',
                  })}
                >
                  ✅ Loaded
                </Badge>
              </div>
            )}
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
            borderColor: isDragOver ? 'teal.500' : 'teal.500/30',
            bg: isDragOver ? 'rgba(20, 184, 166, 0.1)' : 'rgba(17, 24, 39, 0.5)',
            transition: 'all 0.3s',
            backdropFilter: 'blur(16px)',
            transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
            shadow: isDragOver ? 'xl' : 'none',
            opacity: isProcessing ? 0.5 : 1,
            _hover: {
              borderColor: 'teal.500/50',
              bg: 'rgba(17, 24, 39, 0.7)',
            },
          })}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInputChange}
            disabled={isProcessing}
            multiple={mode === 'merge'}
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
                bg: 'teal.500/10',
                p: '6',
                border: '2px dashed',
                borderColor: 'teal.500/30',
              })}
            >
              <Upload className={css({ h: '12', w: '12', color: 'teal.400' })} />
            </div>
            <div className={css({ textAlign: 'center', spaceY: '2' })}>
              <p className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'gray.200' })}>
                {mode === 'merge'
                  ? 'Drop CSV files here or click to browse'
                  : 'Drop CSV file here or click to browse'}
              </p>
              <p className={css({ fontSize: 'sm', color: 'white' })}>
                {mode === 'merge'
                  ? 'Select 2 or more CSV files to merge'
                  : 'Select 1 CSV file to split'}
              </p>
            </div>
          </div>
        </div>

        {/* Loaded Files List */}
        {files.length > 0 && (
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'teal.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Loaded Files</CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={css({
                    display: 'flex',
                    flexDirection: { base: 'column', sm: 'row' },
                    alignItems: { base: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                  })}
                >
                  <div
                    className={css({ display: 'flex', alignItems: 'center', gap: '3', minW: '0' })}
                  >
                    <FileSpreadsheet className={css({ h: '5', w: '5', color: 'teal.400' })} />
                    <div className={css({ minW: '0' })}>
                      <p
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.200',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        })}
                      >
                        {file.name}
                      </p>
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        {file.rowCount} rows × {file.columnCount} columns
                      </p>
                    </div>
                  </div>
                  {mode === 'merge' && (
                    <Button
                      onClick={() => handleRemoveFile(index)}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'transparent',
                        color: 'white',
                        _hover: { bg: 'red.500/20', color: 'red.400' },
                      })}
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Merge Options */}
        {mode === 'merge' && files.length > 0 && (
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'teal.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Merge Options</CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  cursor: 'pointer',
                })}
              >
                <input
                  type="checkbox"
                  checked={deduplicate}
                  onChange={(e) => setDeduplicate(e.target.checked)}
                  className={css({
                    w: '4',
                    h: '4',
                    rounded: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.600',
                    bg: 'gray.800',
                    cursor: 'pointer',
                  })}
                />
                <span className={css({ fontSize: 'sm', color: 'white' })}>
                  Remove duplicate rows
                </span>
              </label>

              <Button
                onClick={handleMerge}
                size="lg"
                className={css({
                  w: 'full',
                  gap: '2',
                  bg: 'teal.500',
                  color: 'white',
                  _hover: { bg: 'teal.600' },
                })}
              >
                <Layers className={css({ h: '5', w: '5' })} />
                Merge Files
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Split Options */}
        {mode === 'split' && files.length > 0 && (
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'emerald.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Split Options</CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div className={css({ spaceY: '3' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Split By
                </div>
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: { base: 'column', sm: 'row' },
                    gap: '3',
                  })}
                >
                  <Button
                    onClick={() => setSplitBy('rows')}
                    className={css({
                      flex: '1',
                      bg: splitBy === 'rows' ? 'emerald.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: splitBy === 'rows' ? 'emerald.500/50' : 'gray.700/50',
                      color: splitBy === 'rows' ? 'emerald.300' : 'gray.400',
                      _hover: {
                        bg: splitBy === 'rows' ? 'emerald.500/30' : 'gray.800',
                      },
                    })}
                  >
                    Row Count
                  </Button>
                  <Button
                    onClick={() => setSplitBy('filter')}
                    className={css({
                      flex: '1',
                      bg: splitBy === 'filter' ? 'emerald.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: splitBy === 'filter' ? 'emerald.500/50' : 'gray.700/50',
                      color: splitBy === 'filter' ? 'emerald.300' : 'gray.400',
                      _hover: {
                        bg: splitBy === 'filter' ? 'emerald.500/30' : 'gray.800',
                      },
                    })}
                  >
                    Filter Condition
                  </Button>
                </div>
              </div>

              {splitBy === 'rows' ? (
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="rows-per-file"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                  >
                    Rows per file
                  </label>
                  <Input
                    id="rows-per-file"
                    type="number"
                    min="1"
                    value={rowsPerFile}
                    onChange={(e) => setRowsPerFile(e.target.value)}
                    placeholder="1000"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      color: 'gray.200',
                    })}
                  />
                </div>
              ) : (
                <>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="filter-column"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                    >
                      Filter Column
                    </label>
                    <select
                      id="filter-column"
                      value={filterColumn}
                      onChange={(e) => setFilterColumn(e.target.value)}
                      className={css({
                        w: 'full',
                        h: '10',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        px: '3',
                        color: 'gray.200',
                        cursor: 'pointer',
                      })}
                    >
                      <option value="">Select a column</option>
                      {files[0]?.data[0]?.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className={css({ fontSize: 'xs', color: 'white' })}>
                    Files will be split based on unique values in the selected column
                  </p>
                </>
              )}

              <Button
                onClick={handleSplit}
                size="lg"
                className={css({
                  w: 'full',
                  gap: '2',
                  bg: 'emerald.500',
                  color: 'white',
                  _hover: { bg: 'emerald.600' },
                })}
              >
                <Scissors className={css({ h: '5', w: '5' })} />
                Split File
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {files.length > 0 && (
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'teal.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Showing first 50 rows of the first file</CardDescription>
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
                    {files[0].data.slice(0, 50).map((row, rowIndex) => (
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
                              color: rowIndex === 0 ? 'teal.300' : 'gray.300',
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
                {files[0].data.length > 50 && (
                  <div
                    className={css({
                      textAlign: 'center',
                      py: '3',
                      color: 'white',
                      fontSize: 'xs',
                      borderTop: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    Showing first 50 rows of {files[0].rowCount}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

        <ToolSearch />
      </main>
    </TooltipProvider>
  )
}
