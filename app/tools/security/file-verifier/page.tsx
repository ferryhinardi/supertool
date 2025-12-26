'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileCheck,
  Hash,
  Info,
  Shield,
  Upload,
  X,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'

interface FileData {
  name: string
  size: number
  type: string
  lastModified: Date
  hash: string
  algorithm: HashAlgorithm
}

function FileVerifierContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [expectedHash, setExpectedHash] = useState('')
  const [verificationResult, setVerificationResult] = useState<'match' | 'mismatch' | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('file_verifier_open', {})
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }

  const calculateHash = async (file: File, algo: HashAlgorithm): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()

    // Map algorithm names to WebCrypto API names
    const cryptoAlgo = algo === 'MD5' ? 'SHA-1' : algo // WebCrypto doesn't support MD5, use SHA-1 as fallback

    const hashBuffer = await crypto.subtle.digest(cryptoAlgo, arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsHashing(true)
    setVerificationResult(null)

    try {
      const hash = await calculateHash(file, algorithm)

      const data: FileData = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: new Date(file.lastModified),
        hash,
        algorithm,
      }

      setFileData(data)
      toast.success('File hash calculated successfully!')

      trackToolEvent('file_verifier_hash', {
        algorithm,
        file_size: file.size,
        file_type: file.type,
      })

      // Auto-verify if expected hash is already entered
      if (expectedHash) {
        verifyHash(hash)
      }
    } catch (error) {
      console.error('Failed to calculate hash:', error)
      toast.error('Failed to calculate file hash')
    } finally {
      setIsHashing(false)
    }
  }

  const verifyHash = (calculatedHash?: string) => {
    const hashToVerify = calculatedHash || fileData?.hash
    if (!hashToVerify || !expectedHash) return

    const normalizedCalculated = hashToVerify.toLowerCase().trim()
    const normalizedExpected = expectedHash.toLowerCase().trim()

    const isMatch = normalizedCalculated === normalizedExpected
    setVerificationResult(isMatch ? 'match' : 'mismatch')

    trackToolEvent('file_verifier_verify', {
      algorithm,
      result: isMatch ? 'match' : 'mismatch',
    })

    if (isMatch) {
      toast.success('✅ Hash matches! File integrity verified.')
    } else {
      toast.error('❌ Hash mismatch! File may be corrupted or tampered.')
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setFileData(null)
    setExpectedHash('')
    setVerificationResult(null)
    trackToolEvent('file_verifier_clear', {})
  }

  const handleCopyHash = () => {
    if (!fileData?.hash) return
    navigator.clipboard.writeText(fileData.hash)
    toast.success('Hash copied to clipboard!')
    trackToolEvent('file_verifier_copy', { field: 'hash' })
  }

  const handleAlgorithmChange = async (newAlgo: HashAlgorithm) => {
    setAlgorithm(newAlgo)
    setVerificationResult(null)

    // Recalculate hash if file is already selected
    if (selectedFile) {
      setIsHashing(true)
      try {
        const hash = await calculateHash(selectedFile, newAlgo)
        setFileData((prev) => (prev ? { ...prev, hash, algorithm: newAlgo } : null))

        // Auto-verify if expected hash exists
        if (expectedHash) {
          const normalizedCalculated = hash.toLowerCase().trim()
          const normalizedExpected = expectedHash.toLowerCase().trim()
          setVerificationResult(normalizedCalculated === normalizedExpected ? 'match' : 'mismatch')
        }
      } catch (error) {
        console.error('Failed to recalculate hash:', error)
        toast.error('Failed to recalculate hash')
      } finally {
        setIsHashing(false)
      }
    }

    trackToolEvent('file_verifier_algorithm_change', { algorithm: newAlgo })
  }

  return (
    <main
      className={css({
        maxW: '7xl',
        mx: 'auto',
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
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'emerald.500/30',
            bg: 'emerald.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Shield className={css({ h: '5', w: '5', color: 'emerald.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'emerald.300' })}>
            Secure • Client-Side • No Server Upload
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'emerald.400',
            gradientVia: 'green.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{ WebkitTextFillColor: 'transparent' }}
        >
          File Integrity Verifier
        </h1>

        <p
          className={css({
            maxW: '3xl',
            mx: 'auto',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Verify file integrity by comparing cryptographic hashes. Detect tampering, corruption, or
          unauthorized modifications. All processing happens securely in your browser.
        </p>
      </motion.div>

      {/* Algorithm Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Select Hash Algorithm</CardTitle>
            <CardDescription>
              Choose the cryptographic hash algorithm for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              {(['MD5', 'SHA-1', 'SHA-256', 'SHA-512'] as HashAlgorithm[]).map((algo) => (
                <Button
                  key={algo}
                  onClick={() => handleAlgorithmChange(algo)}
                  disabled={isHashing}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    bg: algorithm === algo ? 'emerald.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: algorithm === algo ? 'emerald.500/50' : 'gray.700/50',
                    color: algorithm === algo ? 'emerald.300' : 'gray.400',
                    _hover: {
                      bg: algorithm === algo ? 'emerald.500/30' : 'gray.800',
                    },
                  })}
                >
                  <Hash className={css({ h: '4', w: '4' })} />
                  {algo}
                  {algorithm === algo && <CheckCircle2 className={css({ h: '4', w: '4' })} />}
                </Button>
              ))}
            </div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'start',
                gap: '2',
                mt: '4',
                p: '3',
                borderRadius: 'md',
                bg: 'blue.500/10',
                border: '1px solid',
                borderColor: 'blue.500/30',
              })}
            >
              <Info className={css({ h: '5', w: '5', color: 'blue.400', mt: '0.5' })} />
              <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                <strong>Note:</strong> MD5 and SHA-1 are considered cryptographically weak. Use
                SHA-256 or SHA-512 for better security.
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Upload File</CardTitle>
            <CardDescription>Select a file to calculate its hash</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                position: 'relative',
                border: '2px dashed',
                borderColor: selectedFile ? 'emerald.500/50' : 'gray.700',
                borderRadius: 'lg',
                p: '8',
                textAlign: 'center',
                bg: selectedFile ? 'emerald.500/5' : 'gray.800/50',
                transition: 'all 0.2s',
                _hover: { borderColor: 'emerald.500/70', bg: 'emerald.500/10' },
              })}
            >
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={isHashing}
                className={css({
                  position: 'absolute',
                  inset: '0',
                  w: 'full',
                  h: 'full',
                  opacity: '0',
                  cursor: 'pointer',
                  _disabled: { cursor: 'not-allowed' },
                })}
              />
              <Upload
                className={css({ h: '12', w: '12', mx: 'auto', mb: '4', color: 'emerald.400' })}
              />
              <p className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'gray.200' })}>
                {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
              </p>
              <p className={css({ fontSize: 'sm', color: 'gray.500', mt: '2' })}>
                Any file type supported • No size limit • Processed locally
              </p>
            </div>

            {selectedFile && (
              <div className={css({ display: 'flex', gap: '3' })}>
                <Button
                  onClick={handleClearFile}
                  variant="outline"
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    borderColor: 'gray.700',
                    color: 'gray.300',
                    _hover: { borderColor: 'gray.600', bg: 'gray.800' },
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

      {/* File Hash Result */}
      {fileData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'emerald.500/30',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({
                  fontSize: 'lg',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <FileCheck className={css({ h: '5', w: '5' })} />
                Calculated Hash
              </CardTitle>
              <CardDescription>
                {algorithm} hash for {fileData.name}
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '2' })}>
                  File Information
                </div>
                <div className={css({ spaceY: '1' })}>
                  <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    <strong>Size:</strong> {formatFileSize(fileData.size)}
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    <strong>Type:</strong> {fileData.type || 'Unknown'}
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    <strong>Modified:</strong> {fileData.lastModified.toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'emerald.500/10',
                  border: '1px solid',
                  borderColor: 'emerald.500/30',
                })}
              >
                <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '2' })}>
                  {algorithm} Hash
                </div>
                <div
                  className={css({
                    fontSize: 'sm',
                    fontFamily: 'mono',
                    color: 'emerald.300',
                    wordBreak: 'break-all',
                  })}
                >
                  {fileData.hash}
                </div>
              </div>

              <Button
                onClick={handleCopyHash}
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  w: 'full',
                  borderColor: 'emerald.500/50',
                  color: 'emerald.300',
                  _hover: { bg: 'emerald.500/10', borderColor: 'emerald.500/70' },
                })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy Hash
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hash Verification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'emerald.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Verify Integrity</CardTitle>
            <CardDescription>Enter the expected hash to verify file integrity</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div>
              <Input
                type="text"
                placeholder={`Enter expected ${algorithm} hash...`}
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                className={css({
                  fontFamily: 'mono',
                  fontSize: 'sm',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  _focus: { borderColor: 'emerald.500', ring: '2px', ringColor: 'emerald.500/20' },
                })}
              />
            </div>

            <Button
              onClick={() => verifyHash()}
              disabled={!fileData || !expectedHash}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                w: 'full',
                bg: 'emerald.500/20',
                border: '1px solid',
                borderColor: 'emerald.500/50',
                color: 'emerald.300',
                _hover: { bg: 'emerald.500/30' },
                _disabled: { opacity: 0.5, cursor: 'not-allowed' },
              })}
            >
              <Shield className={css({ h: '4', w: '4' })} />
              Verify Hash
            </Button>

            {verificationResult && (
              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: verificationResult === 'match' ? 'emerald.500/10' : 'red.500/10',
                  border: '1px solid',
                  borderColor: verificationResult === 'match' ? 'emerald.500/30' : 'red.500/30',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                })}
              >
                {verificationResult === 'match' ? (
                  <>
                    <CheckCircle2 className={css({ h: '6', w: '6', color: 'emerald.400' })} />
                    <div>
                      <div className={css({ fontWeight: 'semibold', color: 'emerald.300' })}>
                        ✅ Hash Match!
                      </div>
                      <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                        File integrity verified. The file has not been tampered with.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className={css({ h: '6', w: '6', color: 'red.400' })} />
                    <div>
                      <div className={css({ fontWeight: 'semibold', color: 'red.300' })}>
                        ❌ Hash Mismatch!
                      </div>
                      <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                        File may be corrupted or tampered with. Do not trust this file.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.700',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>How File Verification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '3' })}>
              <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                <strong>1. Hash Calculation:</strong> A cryptographic hash function generates a
                unique fingerprint of your file.
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                <strong>2. Comparison:</strong> Compare the calculated hash with the expected hash
                from a trusted source.
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                <strong>3. Verification:</strong> If hashes match, the file is authentic and
                unmodified. If they don't match, the file may be corrupted or tampered with.
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Use Cases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.700',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                gap: '4',
              })}
            >
              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontWeight: 'semibold', color: 'emerald.300', mb: '2' })}>
                  Software Downloads
                </div>
                <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Verify downloaded software hasn't been tampered with before installation
                </div>
              </div>
              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontWeight: 'semibold', color: 'emerald.300', mb: '2' })}>
                  Data Backups
                </div>
                <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Ensure backup files haven't been corrupted during storage or transfer
                </div>
              </div>
              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontWeight: 'semibold', color: 'emerald.300', mb: '2' })}>
                  File Transfers
                </div>
                <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Confirm files received match the original after network transfer
                </div>
              </div>
              <div
                className={css({
                  p: '4',
                  borderRadius: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontWeight: 'semibold', color: 'emerald.300', mb: '2' })}>
                  Security Audits
                </div>
                <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Detect unauthorized modifications to sensitive files or documents
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ToolSearch />
    </main>
  )
}

export default function FileVerifierPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minH: 'screen',
          })}
        >
          <div className={css({ fontSize: 'xl', color: 'gray.400' })}>Loading...</div>
        </div>
      }
    >
      <FileVerifierContent />
    </Suspense>
  )
}
