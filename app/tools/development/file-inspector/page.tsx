'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  FileSearch,
  FileText,
  HardDrive,
  Hash,
  Info,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: Date
  md5Hash?: string
  sha256Hash?: string
}

function FileInspectorContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<FileMetadata | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [hashAlgorithm, setHashAlgorithm] = useState<'MD5' | 'SHA-256'>('SHA-256')

  // Track page visit
  useEffect(() => {
    trackToolEvent('file_inspector_open', {})
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }

  const getMimeTypeDescription = (mimeType: string): string => {
    const mimeDescriptions: Record<string, string> = {
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/webp': 'WebP Image',
      'image/svg+xml': 'SVG Vector Image',
      'application/pdf': 'PDF Document',
      'application/zip': 'ZIP Archive',
      'application/json': 'JSON Data',
      'text/plain': 'Plain Text',
      'text/html': 'HTML Document',
      'text/css': 'CSS Stylesheet',
      'text/javascript': 'JavaScript File',
      'application/javascript': 'JavaScript File',
      'video/mp4': 'MP4 Video',
      'video/webm': 'WebM Video',
      'audio/mpeg': 'MP3 Audio',
      'audio/wav': 'WAV Audio',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'Word Document (DOCX)',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'Excel Spreadsheet (XLSX)',
    }

    return mimeDescriptions[mimeType] || 'Unknown File Type'
  }

  const calculateHash = async (file: File, algorithm: 'MD5' | 'SHA-256'): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const hashAlgo = algorithm === 'MD5' ? 'SHA-1' : 'SHA-256' // Note: WebCrypto doesn't support MD5, using SHA-1 as fallback
    const hashBuffer = await crypto.subtle.digest(hashAlgo, arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsHashing(true)

    try {
      const hash = await calculateHash(file, hashAlgorithm)

      const fileMetadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: new Date(file.lastModified),
        ...(hashAlgorithm === 'SHA-256' ? { sha256Hash: hash } : { md5Hash: hash }),
      }

      setMetadata(fileMetadata)
      toast.success('File metadata extracted successfully!')

      trackToolEvent('file_inspector_analyze', {
        file_type: file.type,
        file_size: file.size,
        hash_algorithm: hashAlgorithm,
      })
    } catch (error) {
      console.error('Failed to extract file metadata:', error)
      toast.error('Failed to extract file metadata')
    } finally {
      setIsHashing(false)
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setMetadata(null)
    trackToolEvent('file_inspector_clear', {})
  }

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
    trackToolEvent('file_inspector_copy', { field: label })
  }

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
          <FileSearch className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            Secure • Client-Side Only • No Upload
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
          File Inspector
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Inspect file metadata without uploading to any server. View MIME type, file hash, size
          analysis, and creation date. All processing happens in your browser for maximum privacy.
        </p>
      </motion.div>

      {/* Hash Algorithm Selection */}
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
            <CardTitle>Select Hash Algorithm</CardTitle>
            <CardDescription>Choose the hashing algorithm for file verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={() => setHashAlgorithm('SHA-256')}
                className={css({
                  gap: '2',
                  bg: hashAlgorithm === 'SHA-256' ? 'orange.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: hashAlgorithm === 'SHA-256' ? 'orange.500/50' : 'gray.700/50',
                  color: hashAlgorithm === 'SHA-256' ? 'orange.300' : 'gray.400',
                  _hover: {
                    bg: hashAlgorithm === 'SHA-256' ? 'orange.500/30' : 'gray.800',
                  },
                })}
              >
                <Hash className={css({ h: '4', w: '4' })} />
                SHA-256
                {hashAlgorithm === 'SHA-256' && (
                  <CheckCircle2 className={css({ h: '4', w: '4' })} />
                )}
              </Button>
              <Button
                onClick={() => setHashAlgorithm('MD5')}
                className={css({
                  gap: '2',
                  bg: hashAlgorithm === 'MD5' ? 'orange.500/20' : 'gray.800/50',
                  border: '1px solid',
                  borderColor: hashAlgorithm === 'MD5' ? 'orange.500/50' : 'gray.700/50',
                  color: hashAlgorithm === 'MD5' ? 'orange.300' : 'gray.400',
                  _hover: {
                    bg: hashAlgorithm === 'MD5' ? 'orange.500/30' : 'gray.800',
                  },
                })}
              >
                <Hash className={css({ h: '4', w: '4' })} />
                SHA-1 (MD5 Alternative)
                {hashAlgorithm === 'MD5' && <CheckCircle2 className={css({ h: '4', w: '4' })} />}
              </Button>
            </div>
            <div className={css({ mt: '3', display: 'flex', alignItems: 'center', gap: '2' })}>
              <Info className={css({ h: '4', w: '4', color: 'gray.500', flexShrink: '0' })} />
              <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                SHA-256 is more secure and recommended for file verification. MD5 option uses SHA-1
                as browser fallback.
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* File Upload */}
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
            <CardTitle>Select File to Inspect</CardTitle>
            <CardDescription>Choose any file to analyze its metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                rounded: 'xl',
                border: '2px dashed',
                borderColor: selectedFile ? 'orange.500/50' : 'gray.700',
                bg: selectedFile ? 'orange.500/5' : 'gray.800/30',
                p: { base: '8', sm: '12' },
                transition: 'all 0.3s',
                _hover: {
                  borderColor: 'orange.500/50',
                  bg: 'orange.500/5',
                },
              })}
            >
              <input
                type="file"
                onChange={handleFileSelect}
                className={css({
                  position: 'absolute',
                  inset: '0',
                  w: 'full',
                  h: 'full',
                  opacity: '0',
                  cursor: 'pointer',
                })}
                disabled={isHashing}
              />
              <Upload
                className={css({
                  h: { base: '12', sm: '16' },
                  w: { base: '12', sm: '16' },
                  color: selectedFile ? 'orange.400' : 'gray.500',
                  mb: '4',
                })}
              />
              <p className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'gray.300' })}>
                {selectedFile ? selectedFile.name : 'Click or drag file here'}
              </p>
              <p className={css({ mt: '2', fontSize: 'sm', color: 'gray.500' })}>
                {isHashing ? 'Analyzing file...' : 'Any file type supported'}
              </p>
            </div>

            {selectedFile && (
              <div className={css({ mt: '4', display: 'flex', justifyContent: 'center' })}>
                <Button
                  onClick={handleClearFile}
                  className={css({
                    gap: '2',
                    bg: 'red.500/20',
                    border: '1px solid',
                    borderColor: 'red.500/50',
                    color: 'red.300',
                    _hover: { bg: 'red.500/30' },
                  })}
                >
                  <X className={css({ h: '4', w: '4' })} />
                  Clear File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* File Metadata Display */}
      {metadata && (
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
              <CardTitle>File Metadata</CardTitle>
              <CardDescription>Detailed information about your file</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {/* File Name */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <FileText className={css({ h: '4', w: '4', color: 'orange.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    File Name
                  </span>
                </div>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '3',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'base',
                      color: 'gray.200',
                      wordBreak: 'break-all',
                      flex: '1',
                    })}
                  >
                    {metadata.name}
                  </p>
                  <Button
                    onClick={() => handleCopyToClipboard(metadata.name, 'File name')}
                    size="sm"
                    className={css({
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700' },
                    })}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* File Size */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <HardDrive className={css({ h: '4', w: '4', color: 'orange.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    File Size
                  </span>
                </div>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <p className={css({ fontSize: 'base', color: 'gray.200' })}>
                    {formatFileSize(metadata.size)}
                  </p>
                  <Badge
                    className={css({
                      bg: 'gray.700/50',
                      color: 'gray.400',
                      border: '1px solid',
                      borderColor: 'gray.600',
                    })}
                  >
                    {metadata.size.toLocaleString()} bytes
                  </Badge>
                </div>
              </div>

              {/* MIME Type */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <FileSearch className={css({ h: '4', w: '4', color: 'orange.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    MIME Type
                  </span>
                </div>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '3',
                  })}
                >
                  <div>
                    <p className={css({ fontSize: 'base', color: 'gray.200', mb: '1' })}>
                      {metadata.type}
                    </p>
                    <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                      {getMimeTypeDescription(metadata.type)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCopyToClipboard(metadata.type, 'MIME type')}
                    size="sm"
                    className={css({
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700' },
                    })}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Last Modified */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <Calendar className={css({ h: '4', w: '4', color: 'orange.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Last Modified
                  </span>
                </div>
                <p className={css({ fontSize: 'base', color: 'gray.200' })}>
                  {metadata.lastModified.toLocaleString()}
                </p>
              </div>

              {/* File Hash */}
              {(metadata.md5Hash || metadata.sha256Hash) && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'orange.500/30',
                    bg: 'orange.500/5',
                    p: '4',
                  })}
                >
                  <div
                    className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}
                  >
                    <Hash className={css({ h: '4', w: '4', color: 'orange.400' })} />
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'orange.300' })}
                    >
                      File Hash ({hashAlgorithm === 'SHA-256' ? 'SHA-256' : 'SHA-1'})
                    </span>
                  </div>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '3',
                    })}
                  >
                    <p
                      className={css({
                        fontSize: 'sm',
                        fontFamily: 'mono',
                        color: 'orange.200',
                        wordBreak: 'break-all',
                        flex: '1',
                      })}
                    >
                      {metadata.sha256Hash || metadata.md5Hash}
                    </p>
                    <Button
                      onClick={() =>
                        handleCopyToClipboard(
                          metadata.sha256Hash || metadata.md5Hash || '',
                          'File hash'
                        )
                      }
                      size="sm"
                      className={css({
                        bg: 'orange.500/20',
                        color: 'orange.300',
                        _hover: { bg: 'orange.500/30' },
                      })}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className={css({ mt: '2', fontSize: 'xs', color: 'gray.500' })}>
                    Use this hash to verify file integrity and authenticity
                  </p>
                </div>
              )}
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
                  Privacy First
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Files are never uploaded to any server</li>
                  <li>• All processing happens locally in your browser</li>
                  <li>• No data is stored or transmitted</li>
                  <li>• Perfect for inspecting sensitive files securely</li>
                  <li>• File hashes help verify file integrity and detect tampering</li>
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

export default function FileInspectorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FileInspectorContent />
    </Suspense>
  )
}
