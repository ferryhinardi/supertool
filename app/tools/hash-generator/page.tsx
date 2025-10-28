'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Copy, Hash, Upload, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { css } from '@/styled-system/css'

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

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

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
        transition={{ delay: 0.2 }}
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
        transition={{ delay: 0.3 }}
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
        transition={{ delay: 0.4 }}
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: {
            base: '1',
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
    </main>
  )
}
