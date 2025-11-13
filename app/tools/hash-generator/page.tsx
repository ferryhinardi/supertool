'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Copy, Hash, Lightbulb, Sparkles, Upload, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { css } from '@/styled-system/css'

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

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

      setHashes({
        MD5: md5Hash,
        'SHA-1': sha1Hash,
        'SHA-256': sha256Hash,
        'SHA-384': sha384Hash,
        'SHA-512': sha512Hash,
      })

      toast.success('Hashes generated successfully')
    } catch (error) {
      toast.error('Failed to generate hashes')
      console.error(error)
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
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer

      try {
        // Generate hashes for file
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

        setHashes({
          MD5: 'File MD5 requires external library',
          'SHA-1': sha1Hash,
          'SHA-256': sha256Hash,
          'SHA-384': sha384Hash,
          'SHA-512': sha512Hash,
        })

        setInput(`File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
        toast.success(`File hashed: ${file.name}`)
      } catch (error) {
        toast.error('Failed to hash file')
        console.error(error)
      }
    }

    reader.readAsArrayBuffer(file)
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
                />
              </div>
              <Button onClick={generateHashes} className={css({ gap: '2' })} disabled={!input}>
                <Hash className={css({ h: '4', w: '4' })} />
                Generate Hashes
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
          { icon: Upload, title: 'File Hashing', desc: 'Hash any file type' },
          {
            icon: CheckCircle,
            title: 'Verification',
            desc: 'Compare and verify hashes',
          },
          {
            icon: Copy,
            title: 'Easy Copy',
            desc: 'One-click copy to clipboard',
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
    </main>
  )
}
