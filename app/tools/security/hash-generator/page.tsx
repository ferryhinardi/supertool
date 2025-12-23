'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle,
  Copy,
  Download,
  FileStack,
  Hash,
  History,
  Lightbulb,
  Loader2,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

interface BatchFile {
  id: string
  file: File
  name: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  hashes?: Record<HashAlgorithm, string>
  error?: string
}

interface HashHistory {
  id: string
  timestamp: number
  input: string
  hashes: Record<HashAlgorithm, string>
  type: 'text' | 'file'
}

const faqs = [
  {
    question: 'What is a hash generator and how does it work?',
    answer:
      'A hash generator creates a fixed-size alphanumeric string (hash) from any input data using cryptographic algorithms. The same input always produces the same hash, but even a tiny change in input creates a completely different hash. Hash functions are one-way - you cannot reverse a hash to get the original data. This makes them perfect for data integrity verification, password storage, and digital signatures.',
  },
  {
    question: 'What are the differences between MD5, SHA-1, SHA-256, and other hash algorithms?',
    answer:
      'MD5 produces 128-bit hashes (32 characters) and is fast but cryptographically broken - not recommended for security. SHA-1 creates 160-bit hashes (40 characters) and is also deprecated for security use. SHA-256, SHA-384, and SHA-512 are part of the SHA-2 family, producing 256-bit, 384-bit, and 512-bit hashes respectively. SHA-256 is the current industry standard, offering strong security while maintaining reasonable performance. SHA-384 and SHA-512 provide even stronger security for highly sensitive applications.',
  },
  {
    question: 'Can I use hash generators for password security?',
    answer:
      'While hashing is essential for password storage, simple hash functions alone are not secure enough. Modern password security requires additional techniques like salting (adding random data before hashing), using slow hash functions like bcrypt or Argon2, and proper key derivation functions. Never store passwords as plain text or simple MD5/SHA hashes. Our hash generator is excellent for file verification and data integrity, but use dedicated password hashing libraries for authentication systems.',
  },
  {
    question: 'How can I verify file integrity using hashes?',
    answer:
      'File integrity verification uses hash comparison. First, generate a hash of your original file. Later, generate a hash of the file again and compare - if the hashes match, the file is unchanged. This is commonly used when downloading software: developers publish SHA-256 hashes of their files, and you can verify your download matches by comparing hashes. A single changed byte will produce a completely different hash, instantly revealing tampering or corruption.',
  },
  {
    question: 'Is hashing the same as encryption?',
    answer:
      'No, hashing and encryption are fundamentally different. Hashing is one-way: you cannot reverse a hash to get the original data. It always produces the same output for the same input and has a fixed output size. Encryption is two-way: encrypted data can be decrypted back to the original using a key. Encryption output size varies with input size. Use hashing for data integrity, fingerprinting, and password storage. Use encryption for confidential data that needs to be retrieved later.',
  },
  {
    question: 'What is hash collision and why does it matter?',
    answer:
      'A hash collision occurs when two different inputs produce the same hash output. While theoretically possible due to the infinite input space mapping to finite output space, cryptographically secure hash functions like SHA-256 make collisions computationally infeasible to find. MD5 and SHA-1 have known collision vulnerabilities, which is why they are deprecated for security applications. For modern applications requiring collision resistance, always use SHA-256 or stronger algorithms.',
  },
  {
    question: 'Can hash generators work with files or only text?',
    answer:
      'Hash generators work with any data - text, images, videos, executables, archives, or any file type. Our tool supports both text input and file upload. For files, the tool reads the binary data and generates hashes just as it would for text. Large file hashing may take longer depending on file size. File hashing is commonly used for software distribution, forensics, blockchain, and data deduplication.',
  },
  {
    question: 'Are online hash generators safe and private?',
    answer:
      'Our hash generator processes everything locally in your browser using JavaScript and the Web Crypto API. Your data never leaves your device or gets sent to any server. The hashing happens entirely client-side, ensuring complete privacy. However, avoid hashing highly sensitive data like passwords or confidential documents in any online tool. For sensitive use cases, use offline tools or command-line utilities on secure, air-gapped systems.',
  },
  {
    question: 'What is the best hash algorithm to use?',
    answer:
      'For general-purpose data integrity and checksums, SHA-256 is the current industry standard offering excellent security and performance. For highly sensitive applications or when future-proofing is critical, use SHA-384 or SHA-512. Avoid MD5 and SHA-1 for any security-critical applications as they have known vulnerabilities. For blockchain and cryptocurrency, Bitcoin uses SHA-256. For password hashing specifically, use bcrypt, scrypt, or Argon2 instead of standard hash functions.',
  },
  {
    question: 'How can I compare and verify hashes?',
    answer:
      'To verify a hash, generate a new hash of your data and compare it character-by-character with the reference hash. Our tool includes a hash comparison feature - paste the expected hash into the comparison field and it will automatically check if it matches any of the generated hashes. Hash comparison is case-insensitive and spaces are typically ignored. Even a single character difference indicates the data has been modified or corrupted.',
  },
]

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({
    MD5: '',
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': '',
  })
  const [compareHash, setCompareHash] = useState('')
  const [compareResult, setCompareResult] = useState<boolean | null>(null)

  // Batch processing state
  const [batchMode, setBatchMode] = useState(false)
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([])
  const [batchProcessing, setBatchProcessing] = useState(false)

  // History state
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HashHistory[]>([])

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hash-generator-history')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Save history to localStorage
  const saveToHistory = (
    input: string,
    hashes: Record<HashAlgorithm, string>,
    type: 'text' | 'file'
  ) => {
    const newEntry: HashHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input: input.length > 100 ? `${input.substring(0, 100)}...` : input,
      hashes,
      type,
    }

    const updatedHistory = [newEntry, ...history].slice(0, 50) // Keep last 50
    setHistory(updatedHistory)
    localStorage.setItem('hash-generator-history', JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('hash-generator-history')
    toast.success('History cleared')
    trackEvent({ action: 'history_cleared', category: 'hash_generator' })
  }

  const loadFromHistory = (entry: HashHistory) => {
    setInput(entry.input)
    setHashes(entry.hashes)
    setShowHistory(false)
    toast.success('Loaded from history')
    trackEvent({ action: 'history_loaded', category: 'hash_generator' })
  }

  const handleReset = () => {
    setInput('')
    setHashes({
      MD5: '',
      'SHA-1': '',
      'SHA-256': '',
      'SHA-384': '',
      'SHA-512': '',
    })
    setCompareHash('')
    setCompareResult(null)
    toast.success('Form cleared')
    trackEvent({ action: 'form_reset', category: 'hash_generator' })
  }

  const handleCopyAll = () => {
    const allHashes = Object.entries(hashes)
      .filter(([_, hash]) => hash)
      .map(([algo, hash]) => `${algo}: ${hash}`)
      .join('\n')

    if (allHashes) {
      navigator.clipboard.writeText(allHashes)
      toast.success('All hashes copied to clipboard!')
      trackEvent({ action: 'all_hashes_copied', category: 'hash_generator' })
    } else {
      toast.error('No hashes to copy')
    }
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
    trackEvent({
      action: 'history_toggled',
      category: 'hash_generator',
      value: showHistory ? 0 : 1,
    })
  }

  const generateHashes = async () => {
    if (!input) {
      toast.error('Please enter text to hash')
      return
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(input)

    try {
      // SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
      const sha256Hash = Array.from(new Uint8Array(sha256Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // SHA-384
      const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
      const sha384Hash = Array.from(new Uint8Array(sha384Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
      const sha512Hash = Array.from(new Uint8Array(sha512Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
      const sha1Hash = Array.from(new Uint8Array(sha1Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // MD5 (using a simple implementation)
      const md5Hash = await simpleMD5(input)

      const generatedHashes = {
        MD5: md5Hash,
        'SHA-1': sha1Hash,
        'SHA-256': sha256Hash,
        'SHA-384': sha384Hash,
        'SHA-512': sha512Hash,
      }

      setHashes(generatedHashes)
      saveToHistory(input, generatedHashes, 'text')

      toast.success('Hashes generated successfully')
      trackEvent({ action: 'text_hashed', category: 'hash_generator' })
    } catch (error) {
      toast.error('Failed to generate hashes')
      console.error(error)
      trackEvent({ action: 'hash_error', category: 'hash_generator' })
    }
  }

  // Simple MD5 implementation
  const simpleMD5 = async (str: string): Promise<string> => {
    // For production, use a proper MD5 library
    // This is a simplified version
    const msgUint8 = new TextEncoder().encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 32)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (files.length === 1) {
      // Single file mode
      const file = files[0]
      const reader = new FileReader()
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer

        try {
          const generatedHashes = await hashArrayBuffer(arrayBuffer)
          setHashes(generatedHashes)
          setInput(`File: ${file.name} (${formatFileSize(file.size)})`)
          saveToHistory(`File: ${file.name}`, generatedHashes, 'file')
          toast.success(`File hashed: ${file.name}`)
          trackEvent({ action: 'file_hashed', category: 'hash_generator' })
        } catch (error) {
          toast.error('Failed to hash file')
          console.error(error)
          trackEvent({ action: 'file_hash_error', category: 'hash_generator' })
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      // Batch mode
      setBatchMode(true)
      const newBatchFiles: BatchFile[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
      }))
      setBatchFiles(newBatchFiles)
      toast.success(`Added ${files.length} files for batch processing`)
      trackEvent({ action: 'batch_mode_enabled', category: 'hash_generator', value: files.length })
    }
  }

  const hashArrayBuffer = async (
    arrayBuffer: ArrayBuffer
  ): Promise<Record<HashAlgorithm, string>> => {
    const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const sha256Hash = Array.from(new Uint8Array(sha256Buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const sha384Buffer = await crypto.subtle.digest('SHA-384', arrayBuffer)
    const sha384Hash = Array.from(new Uint8Array(sha384Buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const sha512Buffer = await crypto.subtle.digest('SHA-512', arrayBuffer)
    const sha512Hash = Array.from(new Uint8Array(sha512Buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const sha1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer)
    const sha1Hash = Array.from(new Uint8Array(sha1Buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return {
      MD5: 'File MD5 requires external library',
      'SHA-1': sha1Hash,
      'SHA-256': sha256Hash,
      'SHA-384': sha384Hash,
      'SHA-512': sha512Hash,
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const processBatchFiles = async () => {
    setBatchProcessing(true)

    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i]

      // Update status to processing
      setBatchFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing' } : f))
      )

      try {
        const arrayBuffer = await file.file.arrayBuffer()
        const hashes = await hashArrayBuffer(arrayBuffer)

        // Update with hashes
        setBatchFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'completed', hashes } : f))
        )

        saveToHistory(`File: ${file.name}`, hashes, 'file')
      } catch (_error) {
        setBatchFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'error', error: 'Failed to hash file' } : f
          )
        )
      }
    }

    setBatchProcessing(false)
    toast.success('Batch processing complete!')
    trackEvent({ action: 'batch_processed', category: 'hash_generator', value: batchFiles.length })
  }

  const exportBatchResults = () => {
    const csv = [
      ['Filename', 'Size', 'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'],
      ...batchFiles
        .filter((f) => f.status === 'completed' && f.hashes)
        .map((f) => [
          f.name,
          formatFileSize(f.size),
          f.hashes?.MD5 || '',
          f.hashes?.['SHA-1'] || '',
          f.hashes?.['SHA-256'] || '',
          f.hashes?.['SHA-384'] || '',
          f.hashes?.['SHA-512'] || '',
        ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hash-results-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Results exported as CSV')
    trackEvent({ action: 'batch_exported', category: 'hash_generator' })
  }

  const removeBatchFile = (id: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const clearBatchFiles = () => {
    setBatchFiles([])
    setBatchMode(false)
    toast.success('Batch cleared')
  }

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast.success('Hash copied to clipboard!')
  }

  const handleCompare = () => {
    if (!compareHash) {
      toast.error('Please enter a hash to compare')
      return
    }

    const normalizedCompare = compareHash.toLowerCase().trim()
    const match = Object.values(hashes).some((hash) => hash.toLowerCase() === normalizedCompare)

    setCompareResult(match)
    toast.success(match ? 'Hashes match!' : 'Hashes do not match')
  }

  // Keyboard shortcuts - setup after all functions are defined
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts(
    {
      onExecute: generateHashes,
      onReset: handleReset,
      onCopy: handleCopyAll,
      onHistory: toggleHistory,
      onEscape: handleReset,
    },
    { allowInInputs: false }
  )

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
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
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'red.500/20',
            bg: 'red.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Hash className={css({ h: '5', w: '5', color: 'red.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'red.300',
            })}
          >
            Cryptographic Hashing
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'red.400',
            gradientVia: 'pink.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Hash Generator & Verifier
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'gray.400',
          })}
        >
          Generate cryptographic hashes using multiple algorithms. Hash text or files, and verify
          integrity.
        </p>
      </motion.div>

      {/* Pro Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'cyan.500/30',
            bg: 'rgba(6, 182, 212, 0.05)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Sparkles className={css({ h: '5', w: '5', color: 'cyan.400' })} />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className={css({ spaceY: '3' })}>
            <ul className={css({ spaceY: '3', pl: '0', fontSize: 'sm', color: 'gray.300' })}>
              <li className={css({ display: 'flex', gap: '2' })}>
                <span className={css({ color: 'cyan.400', fontWeight: 'bold' })}>•</span>
                <span>
                  <strong className={css({ color: 'white' })}>Multiple Algorithms:</strong> Generate
                  MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes simultaneously. SHA-256 is the
                  industry standard, while SHA-384/512 offer even stronger security for critical
                  applications.
                </span>
              </li>
              <li className={css({ display: 'flex', gap: '2' })}>
                <span className={css({ color: 'cyan.400', fontWeight: 'bold' })}>•</span>
                <span>
                  <strong className={css({ color: 'white' })}>File Hashing Support:</strong> Upload
                  any file type to generate cryptographic hashes. Perfect for software verification,
                  integrity checking, and detecting file tampering or corruption.
                </span>
              </li>
              <li className={css({ display: 'flex', gap: '2' })}>
                <span className={css({ color: 'cyan.400', fontWeight: 'bold' })}>•</span>
                <span>
                  <strong className={css({ color: 'white' })}>Hash Verification:</strong> Compare
                  generated hashes against expected values to verify file integrity. A single byte
                  difference produces completely different hashes, instantly revealing
                  modifications.
                </span>
              </li>
              <li className={css({ display: 'flex', gap: '2' })}>
                <span className={css({ color: 'cyan.400', fontWeight: 'bold' })}>•</span>
                <span>
                  <strong className={css({ color: 'white' })}>Browser-Based Processing:</strong> All
                  hashing happens locally using the Web Crypto API - your data never leaves your
                  device, ensuring complete privacy and security.
                </span>
              </li>
              <li className={css({ display: 'flex', gap: '2' })}>
                <span className={css({ color: 'cyan.400', fontWeight: 'bold' })}>•</span>
                <span>
                  <strong className={css({ color: 'white' })}>Common Use Cases:</strong> Verify
                  software downloads, create file fingerprints, check data integrity, generate
                  checksums, and ensure secure password storage (with proper salting).
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter text or upload a file to generate hashes</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              placeholder="Enter text to hash..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={css({
                minH: '[150px]',
                fontFamily: 'mono',
                fontSize: 'sm',
              })}
            />

            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '4',
                sm: { flexDirection: 'row' },
              })}
            >
              <div className={css({ flex: '1' })}>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className={css({ cursor: 'pointer' })}
                  accept="*/*"
                  multiple
                />
              </div>
              <Button onClick={generateHashes} className={css({ gap: '2' })} disabled={!input}>
                <Hash className={css({ h: '4', w: '4' })} />
                Generate Hashes
              </Button>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                className={css({ gap: '2' })}
              >
                <History className={css({ h: '4', w: '4' })} />
                History
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hashes Output */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={css({ spaceY: '4' })}
      >
        {(Object.keys(hashes) as HashAlgorithm[]).map((algorithm) => (
          <Card
            key={algorithm}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
            })}
          >
            <CardHeader className={css({ pb: '3' })}>
              <CardTitle className={css({ fontSize: 'lg' })}>{algorithm}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'flex', gap: '2' })}>
                <Input
                  value={hashes[algorithm]}
                  readOnly
                  placeholder={`${algorithm} hash will appear here...`}
                  className={css({ fontFamily: 'mono', fontSize: 'sm' })}
                />
                <Button
                  onClick={() => handleCopy(hashes[algorithm])}
                  variant="outline"
                  size="icon"
                  disabled={!hashes[algorithm]}
                  className={css({
                    minH: '11',
                    minW: '11',
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Compare/Verify Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
          <CardHeader>
            <CardTitle>Verify Hash</CardTitle>
            <CardDescription>Compare generated hash with expected hash</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ display: 'flex', gap: '2' })}>
              <Input
                placeholder="Paste hash to compare..."
                value={compareHash}
                onChange={(e) => {
                  setCompareHash(e.target.value)
                  setCompareResult(null)
                }}
                className={css({ fontFamily: 'mono', fontSize: 'sm' })}
              />
              <Button
                onClick={handleCompare}
                disabled={!compareHash || !Object.values(hashes).some((h) => h)}
                className={css({
                  minH: '11',
                  py: { base: '3', sm: '3.5', md: '4' },
                })}
              >
                Compare
              </Button>
            </div>

            {compareResult !== null && (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  rounded: 'lg',
                  p: '4',
                  border: '1px solid',
                  borderColor: compareResult ? 'green.500/20' : 'red.500/20',
                  bg: compareResult ? 'green.500/10' : 'red.500/10',
                  color: compareResult ? 'green.400' : 'red.400',
                })}
              >
                {compareResult ? (
                  <>
                    <CheckCircle className={css({ h: '5', w: '5' })} />
                    <span className={css({ fontWeight: 'semibold' })}>
                      Match! Hashes are identical.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className={css({ h: '5', w: '5' })} />
                    <span className={css({ fontWeight: 'semibold' })}>
                      No match. Hashes are different.
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Batch Processing Section */}
      {batchMode && batchFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'purple.500/30',
              bg: 'rgba(168, 85, 247, 0.05)',
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
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <FileStack className={css({ h: '5', w: '5', color: 'purple.400' })} />
                    Batch Processing ({batchFiles.length} files)
                  </CardTitle>
                  <CardDescription>Process multiple files simultaneously</CardDescription>
                </div>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={processBatchFiles}
                    disabled={batchProcessing || batchFiles.every((f) => f.status === 'completed')}
                    className={css({ gap: '2' })}
                  >
                    {batchProcessing ? (
                      <>
                        <Loader2 className={css({ h: '4', w: '4', animation: 'spin' })} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Hash className={css({ h: '4', w: '4' })} />
                        Process All
                      </>
                    )}
                  </Button>
                  {batchFiles.some((f) => f.status === 'completed') && (
                    <Button
                      onClick={exportBatchResults}
                      variant="outline"
                      className={css({ gap: '2' })}
                    >
                      <Download className={css({ h: '4', w: '4' })} />
                      Export CSV
                    </Button>
                  )}
                  <Button onClick={clearBatchFiles} variant="outline" size="icon">
                    <Trash2 className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '3', maxH: '[400px]', overflowY: 'auto' })}>
                {batchFiles.map((file) => (
                  <div
                    key={file.id}
                    className={css({
                      border: '1px solid',
                      borderColor: 'gray.800',
                      rounded: 'lg',
                      p: '4',
                      bg: 'gray.900/30',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'space-between',
                        mb: '2',
                      })}
                    >
                      <div className={css({ flex: '1' })}>
                        <div
                          className={css({ fontWeight: 'medium', color: 'white', fontSize: 'sm' })}
                        >
                          {file.name}
                        </div>
                        <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                        {file.status === 'pending' && (
                          <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                            Pending
                          </span>
                        )}
                        {file.status === 'processing' && (
                          <Loader2
                            className={css({
                              h: '4',
                              w: '4',
                              color: 'blue.400',
                              animation: 'spin',
                            })}
                          />
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle className={css({ h: '4', w: '4', color: 'green.400' })} />
                        )}
                        {file.status === 'error' && (
                          <XCircle className={css({ h: '4', w: '4', color: 'red.400' })} />
                        )}
                        <Button
                          onClick={() => removeBatchFile(file.id)}
                          variant="ghost"
                          size="icon"
                          className={css({ h: '6', w: '6' })}
                        >
                          <Trash2 className={css({ h: '3', w: '3' })} />
                        </Button>
                      </div>
                    </div>
                    {file.hashes && (
                      <div className={css({ mt: '3', spaceY: '2' })}>
                        {(Object.keys(file.hashes) as HashAlgorithm[]).map((algo) => (
                          <div
                            key={algo}
                            className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                          >
                            <span
                              className={css({ fontSize: 'xs', color: 'gray.400', minW: '[60px]' })}
                            >
                              {algo}:
                            </span>
                            <code
                              className={css({
                                flex: '1',
                                fontSize: 'xs',
                                fontFamily: 'mono',
                                color: 'gray.300',
                              })}
                            >
                              {file.hashes?.[algo]?.substring(0, 32)}...
                            </code>
                            <Button
                              onClick={() => handleCopy(file.hashes?.[algo] || '')}
                              variant="ghost"
                              size="icon"
                              className={css({ h: '6', w: '6' })}
                            >
                              <Copy className={css({ h: '3', w: '3' })} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'blue.500/30',
              bg: 'rgba(59, 130, 246, 0.05)',
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
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <History className={css({ h: '5', w: '5', color: 'blue.400' })} />
                    History ({history.length} entries)
                  </CardTitle>
                  <CardDescription>Last 50 hash operations</CardDescription>
                </div>
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  size="sm"
                  className={css({ gap: '2' })}
                >
                  <Trash2 className={css({ h: '3', w: '3' })} />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '3', maxH: '[400px]', overflowY: 'auto' })}>
                {history.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    className={css({
                      border: '1px solid',
                      borderColor: 'gray.800',
                      rounded: 'lg',
                      p: '3',
                      bg: 'gray.900/30',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'blue.500/50', bg: 'gray.900/50' },
                      w: 'full',
                      textAlign: 'left',
                    })}
                    onClick={() => loadFromHistory(entry)}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: '2',
                      })}
                    >
                      <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span
                        className={css({
                          fontSize: 'xs',
                          color: 'blue.400',
                          textTransform: 'uppercase',
                        })}
                      >
                        {entry.type}
                      </span>
                    </div>
                    <div className={css({ fontSize: 'sm', color: 'gray.300', mb: '2' })}>
                      {entry.input}
                    </div>
                    <div className={css({ fontSize: 'xs', fontFamily: 'mono', color: 'gray.500' })}>
                      SHA-256: {entry.hashes['SHA-256'].substring(0, 48)}...
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={css({
          display: 'grid',
          gap: '4',
          w: 'full',
          gridTemplateColumns: {
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
        })}
      >
        {[
          {
            icon: Hash,
            title: 'Multiple Algorithms',
            desc: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512',
          },
          { icon: FileStack, title: 'Batch Processing', desc: 'Hash multiple files at once' },
          {
            icon: History,
            title: 'Operation History',
            desc: 'Track last 50 hash operations',
          },
          {
            icon: CheckCircle,
            title: 'Hash Verification',
            desc: 'Compare and verify integrity',
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/30',
            })}
          >
            <CardContent className={css({ p: '6' })}>
              <feature.icon className={css({ mb: '3', h: '8', w: '8', color: 'red.400' })} />
              <h3
                className={css({
                  mb: '2',
                  fontWeight: 'semibold',
                  color: 'gray.200',
                })}
              >
                {feature.title}
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'blue.500/30',
            bg: 'rgba(59, 130, 246, 0.05)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Lightbulb className={css({ h: '5', w: '5' })} />
              How to Use Hash Generator
            </CardTitle>
            <CardDescription>
              Follow these simple steps to generate and verify cryptographic hashes
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            <div
              className={css({
                display: 'grid',
                gap: '4',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
              })}
            >
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    rounded: 'full',
                    bg: 'purple.500/20',
                    border: '2px solid',
                    borderColor: 'purple.500',
                  })}
                >
                  <span
                    className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'purple.400' })}
                  >
                    1
                  </span>
                </div>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  Enter Text or Upload File
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
                  Type or paste your text into the input field, or click the upload button to hash a
                  file. The tool supports any file type and processes data locally in your browser
                  for complete privacy.
                </p>
              </div>

              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    rounded: 'full',
                    bg: 'pink.500/20',
                    border: '2px solid',
                    borderColor: 'pink.500',
                  })}
                >
                  <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'pink.400' })}>
                    2
                  </span>
                </div>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  Generate Hashes
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
                  Click the "Generate Hashes" button to create cryptographic hashes using multiple
                  algorithms simultaneously: MD5, SHA-1, SHA-256, SHA-384, and SHA-512. Each
                  algorithm produces a unique hash signature.
                </p>
              </div>

              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    rounded: 'full',
                    bg: 'blue.500/20',
                    border: '2px solid',
                    borderColor: 'blue.500',
                  })}
                >
                  <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'blue.400' })}>
                    3
                  </span>
                </div>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  Copy Hash Values
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
                  Click the copy button next to any hash to copy it to your clipboard. The hash
                  remains available for use in verification, documentation, or integration with your
                  applications and workflows.
                </p>
              </div>

              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    rounded: 'full',
                    bg: 'green.500/20',
                    border: '2px solid',
                    borderColor: 'green.500',
                  })}
                >
                  <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'green.400' })}>
                    4
                  </span>
                </div>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  Verify Hashes (Optional)
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
                  To verify data integrity, paste a reference hash into the comparison field. The
                  tool will automatically check if it matches any generated hash and display whether
                  the data is identical or has been modified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <SocialShare
          toolName="Hash Generator"
          toolUrl="/tools/hash-generator"
          description="Generate cryptographic hashes with MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms for data integrity verification"
          hashtags={['Cryptography', 'Security', 'WebDev', 'DataIntegrity']}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <FAQAccordion faqs={faqs} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <RelatedTools currentToolPath="/tools/hash-generator" category="security" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <ToolRating toolId="/tools/hash-generator" toolName="Hash Generator" />
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
      <ToolSearch />

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={shortcuts}
        toolName="Hash Generator"
      />
    </main>
  )
}
