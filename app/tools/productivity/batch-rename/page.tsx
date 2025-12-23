'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  FolderEdit,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface FileItem {
  id: string
  file: File
  originalName: string
  newName: string
  error?: string
}

type CaseTransform = 'none' | 'lowercase' | 'uppercase' | 'capitalize' | 'camelCase' | 'kebabCase'

interface RenamePattern {
  prefix: string
  suffix: string
  findText: string
  replaceText: string
  useRegex: boolean
  sequenceStart: number
  sequenceStep: number
  sequencePadding: number
  caseTransform: CaseTransform
}

const applyRenamePattern = (
  fileName: string,
  pattern: RenamePattern,
  sequenceNumber: number
): string => {
  // Split filename and extension
  const lastDotIndex = fileName.lastIndexOf('.')
  let name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName
  const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : ''

  // Apply find & replace
  if (pattern.findText) {
    if (pattern.useRegex) {
      try {
        const regex = new RegExp(pattern.findText, 'g')
        name = name.replace(regex, pattern.replaceText)
      } catch (error) {
        console.error('Invalid regex:', error)
      }
    } else {
      name = name.split(pattern.findText).join(pattern.replaceText)
    }
  }

  // Apply case transformation
  switch (pattern.caseTransform) {
    case 'lowercase':
      name = name.toLowerCase()
      break
    case 'uppercase':
      name = name.toUpperCase()
      break
    case 'capitalize':
      name = name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      break
    case 'camelCase':
      name = name
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
      break
    case 'kebabCase':
      name = name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
      break
  }

  // Add prefix
  if (pattern.prefix) {
    name = pattern.prefix + name
  }

  // Add suffix
  if (pattern.suffix) {
    name = name + pattern.suffix
  }

  // Add sequence number
  const paddedSequence = sequenceNumber.toString().padStart(pattern.sequencePadding, '0')
  name = name.replace(/\{n\}/g, paddedSequence)

  return name + ext
}

const validateFileName = (fileName: string): string | undefined => {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/g
  if (invalidChars.test(fileName)) {
    return 'Contains invalid characters: < > : " / \\ | ? *'
  }

  // Check if filename is empty
  if (!fileName.trim()) {
    return 'Filename cannot be empty'
  }

  return undefined
}

export default function BatchRenamePage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [pattern, setPattern] = useState<RenamePattern>({
    prefix: '',
    suffix: '',
    findText: '',
    replaceText: '',
    useRegex: false,
    sequenceStart: 1,
    sequenceStep: 1,
    sequencePadding: 3,
    caseTransform: 'none',
  })

  // Track page visit
  useEffect(() => {
    trackToolEvent('batch_rename_open', {})
  }, [])

  // Update preview when pattern changes
  useEffect(() => {
    setFiles((prevFiles) => {
      if (prevFiles.length === 0) return prevFiles

      const updatedFiles = prevFiles.map((fileItem, index) => {
        const sequenceNum = pattern.sequenceStart + index * pattern.sequenceStep
        const newName = applyRenamePattern(fileItem.originalName, pattern, sequenceNum)
        const error = validateFileName(newName)

        return {
          ...fileItem,
          newName,
          error,
        }
      })

      // Check for duplicate names
      const nameCount = new Map<string, number>()
      updatedFiles.forEach((item) => {
        const count = nameCount.get(item.newName) || 0
        nameCount.set(item.newName, count + 1)
      })

      // Mark duplicates
      const finalFiles = updatedFiles.map((item) => {
        const count = nameCount.get(item.newName) ?? 0
        if (count > 1 && !item.error) {
          return { ...item, error: 'Duplicate filename' }
        }
        return item
      })

      return finalFiles
    })
  }, [pattern])

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      originalName: file.name,
      newName: file.name,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`Added ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`)

    trackToolEvent('batch_rename_upload', { file_count: selectedFiles.length })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    trackToolEvent('batch_rename_remove_file', {})
  }

  const handleClearAll = () => {
    setFiles([])
    trackToolEvent('batch_rename_clear', {})
  }

  const handleReset = () => {
    setPattern({
      prefix: '',
      suffix: '',
      findText: '',
      replaceText: '',
      useRegex: false,
      sequenceStart: 1,
      sequenceStep: 1,
      sequencePadding: 3,
      caseTransform: 'none',
    })
    trackToolEvent('batch_rename_reset', {})
  }

  const handleApplyRename = () => {
    const hasErrors = files.some((f) => f.error)
    if (hasErrors) {
      toast.error('Please fix errors before applying')
      return
    }

    if (files.length === 0) {
      toast.error('No files to rename')
      return
    }

    // Create and download renamed files
    files.forEach((fileItem) => {
      const blob = new Blob([fileItem.file], { type: fileItem.file.type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileItem.newName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })

    toast.success(
      `Successfully downloaded ${files.length} renamed file${files.length > 1 ? 's' : ''}`
    )
    trackToolEvent('batch_rename_apply', { file_count: files.length })
  }

  const hasErrors = files.some((f) => f.error)
  const hasChanges = files.some((f) => f.originalName !== f.newName)

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'orange.500/30',
            bg: 'orange.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <FolderEdit className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            Pattern Rules • Find & Replace • Sequential Numbers
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'red.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Batch File Renamer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Rename multiple files at once with powerful pattern rules. Add prefix/suffix, find &
          replace, sequential numbering, and case transformations. All processing happens in your
          browser.
        </p>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Select or drag & drop files to rename. Files are processed locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* biome-ignore lint/a11y/useSemanticElements: drag-drop functionality requires div element */}
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className={css({
                border: '2px dashed',
                borderColor: isDragging ? 'orange.500' : 'gray.700',
                bg: isDragging ? 'orange.500/10' : 'gray.800/50',
                rounded: 'lg',
                p: '8',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: { borderColor: 'orange.500/50', bg: 'gray.800' },
              })}
            >
              <Upload
                className={css({
                  mx: 'auto',
                  mb: '4',
                  h: '12',
                  w: '12',
                  color: isDragging ? 'orange.400' : 'gray.500',
                })}
              />
              <p
                className={css({
                  fontSize: 'lg',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Drop files here or click to browse
              </p>
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                Supports all file types • No file size limit
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className={css({ display: 'none' })}
              />
            </div>

            {files.length > 0 && (
              <div className={css({ mt: '4', display: 'flex', gap: '3' })}>
                <Badge
                  className={css({
                    bg: 'orange.500/20',
                    color: 'orange.300',
                    border: '1px solid',
                    borderColor: 'orange.500/30',
                  })}
                >
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </Badge>
                <Button
                  onClick={handleClearAll}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
                    _hover: { bg: 'red.500/20', color: 'red.400' },
                  })}
                >
                  <Trash2 className={css({ h: '4', w: '4' })} />
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pattern Configuration */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div>
                  <CardTitle>Rename Pattern</CardTitle>
                  <CardDescription>Configure how you want to rename your files</CardDescription>
                </div>
                <Button
                  onClick={handleReset}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <RefreshCw className={css({ h: '4', w: '4' })} />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Prefix & Suffix */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '4',
                })}
              >
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="prefix"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Prefix
                  </label>
                  <Input
                    id="prefix"
                    type="text"
                    value={pattern.prefix}
                    onChange={(e) => setPattern((p) => ({ ...p, prefix: e.target.value }))}
                    placeholder="Add prefix to filename"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _focus: {
                        borderColor: 'orange.500',
                        ring: '2px',
                        ringColor: 'orange.500/20',
                      },
                    })}
                  />
                </div>

                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="suffix"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Suffix
                  </label>
                  <Input
                    id="suffix"
                    type="text"
                    value={pattern.suffix}
                    onChange={(e) => setPattern((p) => ({ ...p, suffix: e.target.value }))}
                    placeholder="Add suffix to filename"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _focus: {
                        borderColor: 'orange.500',
                        ring: '2px',
                        ringColor: 'orange.500/20',
                      },
                    })}
                  />
                </div>
              </div>

              {/* Find & Replace */}
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Find & Replace
                  </span>
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
                      checked={pattern.useRegex}
                      onChange={(e) => setPattern((p) => ({ ...p, useRegex: e.target.checked }))}
                      className={css({ cursor: 'pointer' })}
                    />
                    <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Use Regex</span>
                  </label>
                </div>

                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <Input
                    type="text"
                    value={pattern.findText}
                    onChange={(e) => setPattern((p) => ({ ...p, findText: e.target.value }))}
                    placeholder="Find text"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _focus: {
                        borderColor: 'orange.500',
                        ring: '2px',
                        ringColor: 'orange.500/20',
                      },
                    })}
                  />
                  <Input
                    type="text"
                    value={pattern.replaceText}
                    onChange={(e) => setPattern((p) => ({ ...p, replaceText: e.target.value }))}
                    placeholder="Replace with"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _focus: {
                        borderColor: 'orange.500',
                        ring: '2px',
                        ringColor: 'orange.500/20',
                      },
                    })}
                  />
                </div>
              </div>

              {/* Sequential Numbering */}
              <div className={css({ spaceY: '3' })}>
                <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Sequential Numbering
                  <span className={css({ ml: '2', fontSize: 'xs', color: 'gray.500' })}>
                    Use {'{n}'} in prefix/suffix
                  </span>
                </span>

                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="seq-start"
                      className={css({ fontSize: 'xs', color: 'gray.400' })}
                    >
                      Start
                    </label>
                    <Input
                      id="seq-start"
                      type="number"
                      value={pattern.sequenceStart}
                      onChange={(e) =>
                        setPattern((p) => ({ ...p, sequenceStart: Number(e.target.value) }))
                      }
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: {
                          borderColor: 'orange.500',
                          ring: '2px',
                          ringColor: 'orange.500/20',
                        },
                      })}
                    />
                  </div>

                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="seq-step"
                      className={css({ fontSize: 'xs', color: 'gray.400' })}
                    >
                      Step
                    </label>
                    <Input
                      id="seq-step"
                      type="number"
                      value={pattern.sequenceStep}
                      onChange={(e) =>
                        setPattern((p) => ({ ...p, sequenceStep: Number(e.target.value) }))
                      }
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: {
                          borderColor: 'orange.500',
                          ring: '2px',
                          ringColor: 'orange.500/20',
                        },
                      })}
                    />
                  </div>

                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="seq-padding"
                      className={css({ fontSize: 'xs', color: 'gray.400' })}
                    >
                      Padding
                    </label>
                    <Input
                      id="seq-padding"
                      type="number"
                      min="0"
                      value={pattern.sequencePadding}
                      onChange={(e) =>
                        setPattern((p) => ({ ...p, sequencePadding: Number(e.target.value) }))
                      }
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _focus: {
                          borderColor: 'orange.500',
                          ring: '2px',
                          ringColor: 'orange.500/20',
                        },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Case Transform */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="case-transform"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Case Transform
                </label>
                <select
                  id="case-transform"
                  value={pattern.caseTransform}
                  onChange={(e) =>
                    setPattern((p) => ({ ...p, caseTransform: e.target.value as CaseTransform }))
                  }
                  className={css({
                    w: 'full',
                    h: '10',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '3',
                    fontSize: 'base',
                    color: 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    _focus: {
                      outline: 'none',
                      borderColor: 'orange.500',
                      ring: '2px',
                      ringColor: 'orange.500/20',
                    },
                  })}
                >
                  <option value="none">None</option>
                  <option value="lowercase">lowercase</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="capitalize">Capitalize Each Word</option>
                  <option value="camelCase">camelCase</option>
                  <option value="kebabCase">kebab-case</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div>
                  <CardTitle>Preview Changes</CardTitle>
                  <CardDescription>
                    Review the new filenames before applying. Files will be downloaded with new
                    names.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleApplyRename}
                  disabled={hasErrors || !hasChanges}
                  className={css({
                    gap: '2',
                    bg: hasErrors || !hasChanges ? 'gray.800' : 'orange.500',
                    color: hasErrors || !hasChanges ? 'gray.500' : 'white',
                    _hover: {
                      bg: hasErrors || !hasChanges ? 'gray.800' : 'orange.600',
                    },
                    cursor: hasErrors || !hasChanges ? 'not-allowed' : 'pointer',
                  })}
                >
                  <Download className={css({ h: '4', w: '4' })} />
                  Download Renamed Files
                </Button>
              </div>

              {hasErrors && (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'red.500/30',
                    bg: 'red.500/10',
                    p: '3',
                    mt: '3',
                  })}
                >
                  <AlertCircle
                    className={css({ h: '5', w: '5', color: 'red.400', flexShrink: '0' })}
                  />
                  <p className={css({ fontSize: 'sm', color: 'red.300' })}>
                    Please fix validation errors before applying
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className={css({ overflowX: 'auto' })}>
                <table className={css({ w: 'full', fontSize: 'sm' })}>
                  <thead>
                    <tr
                      className={css({
                        borderBottom: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    >
                      <th
                        className={css({
                          px: '4',
                          py: '3',
                          textAlign: 'left',
                          fontWeight: 'semibold',
                          color: 'gray.400',
                        })}
                      >
                        Original Name
                      </th>
                      <th
                        className={css({
                          px: '4',
                          py: '3',
                          textAlign: 'center',
                          fontWeight: 'semibold',
                          color: 'gray.400',
                          w: '12',
                        })}
                      ></th>
                      <th
                        className={css({
                          px: '4',
                          py: '3',
                          textAlign: 'left',
                          fontWeight: 'semibold',
                          color: 'gray.400',
                        })}
                      >
                        New Name
                      </th>
                      <th
                        className={css({
                          px: '4',
                          py: '3',
                          textAlign: 'center',
                          fontWeight: 'semibold',
                          color: 'gray.400',
                          w: '16',
                        })}
                      >
                        Status
                      </th>
                      <th
                        className={css({
                          px: '4',
                          py: '3',
                          textAlign: 'center',
                          fontWeight: 'semibold',
                          color: 'gray.400',
                          w: '20',
                        })}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((fileItem) => (
                      <tr
                        key={fileItem.id}
                        className={css({
                          borderBottom: '1px solid',
                          borderColor: 'gray.800',
                          transition: 'all 0.2s',
                          _hover: { bg: 'gray.800/30' },
                        })}
                      >
                        <td className={css({ px: '4', py: '3', color: 'gray.400' })}>
                          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                            <FileText className={css({ h: '4', w: '4', flexShrink: '0' })} />
                            <span className={css({ wordBreak: 'break-all' })}>
                              {fileItem.originalName}
                            </span>
                          </div>
                        </td>
                        <td className={css({ px: '4', py: '3', textAlign: 'center' })}>
                          {fileItem.originalName !== fileItem.newName && (
                            <span className={css({ color: 'orange.400' })}>→</span>
                          )}
                        </td>
                        <td
                          className={css({
                            px: '4',
                            py: '3',
                            color: fileItem.error ? 'red.400' : 'orange.300',
                            fontWeight:
                              fileItem.originalName !== fileItem.newName ? 'medium' : 'normal',
                          })}
                        >
                          <span className={css({ wordBreak: 'break-all' })}>
                            {fileItem.newName}
                          </span>
                          {fileItem.error && (
                            <p className={css({ fontSize: 'xs', color: 'red.400', mt: '1' })}>
                              {fileItem.error}
                            </p>
                          )}
                        </td>
                        <td className={css({ px: '4', py: '3', textAlign: 'center' })}>
                          {fileItem.error ? (
                            <AlertCircle
                              className={css({ h: '4', w: '4', color: 'red.400', mx: 'auto' })}
                            />
                          ) : fileItem.originalName !== fileItem.newName ? (
                            <CheckCircle2
                              className={css({ h: '4', w: '4', color: 'green.400', mx: 'auto' })}
                            />
                          ) : (
                            <span className={css({ color: 'gray.600' })}>—</span>
                          )}
                        </td>
                        <td className={css({ px: '4', py: '3', textAlign: 'center' })}>
                          <Button
                            onClick={() => handleRemoveFile(fileItem.id)}
                            size="sm"
                            className={css({
                              gap: '2',
                              bg: 'transparent',
                              color: 'gray.500',
                              _hover: { bg: 'red.500/20', color: 'red.400' },
                            })}
                          >
                            <Trash2 className={css({ h: '4', w: '4' })} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'orange.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'orange.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3
                  className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'orange.300' })}
                >
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>
                    • Use {'{n}'} in prefix or suffix to add sequential numbers (e.g., "file-{'{n}'}
                    .jpg")
                  </li>
                  <li>• Enable regex for advanced find & replace patterns</li>
                  <li>• Preview all changes before downloading to avoid mistakes</li>
                  <li>• All files are processed locally in your browser - nothing is uploaded</li>
                  <li>• Sequential numbering supports padding (e.g., 001, 002, 003)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
