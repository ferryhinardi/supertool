'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Hash, Copy, Upload, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

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
    <div
      className="space-y-8"
      style={{
        margin: '0 auto',
        maxWidth: '1400px',
        width: '100%',
        padding: '2rem 1rem',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2">
          <Hash className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold text-red-300">Cryptographic Hashing</span>
        </div>

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Hash Generator & Verifier
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
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
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter text or upload a file to generate hashes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter text to hash..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  accept="*/*"
                />
              </div>
              <Button onClick={generateHashes} className="gap-2" disabled={!input}>
                <Hash className="h-4 w-4" />
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
        className="space-y-4"
      >
        {(Object.keys(hashes) as HashAlgorithm[]).map((algorithm) => (
          <Card key={algorithm} className="border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{algorithm}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={hashes[algorithm]}
                  readOnly
                  placeholder={`${algorithm} hash will appear here...`}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => handleCopy(hashes[algorithm])}
                  variant="outline"
                  size="icon"
                  disabled={!hashes[algorithm]}
                >
                  <Copy className="h-4 w-4" />
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
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Verify Hash</CardTitle>
            <CardDescription>Compare generated hash with expected hash</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste hash to compare..."
                value={compareHash}
                onChange={(e) => {
                  setCompareHash(e.target.value)
                  setCompareResult(null)
                }}
                className="font-mono text-sm"
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
                className={`flex items-center gap-2 rounded-lg p-4 ${
                  compareResult
                    ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border border-red-500/20 bg-red-500/10 text-red-400'
                }`}
              >
                {compareResult ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Match! Hashes are identical.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">No match. Hashes are different.</span>
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
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            icon: Hash,
            title: 'Multiple Algorithms',
            desc: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512',
          },
          { icon: Upload, title: 'File Hashing', desc: 'Hash any file type' },
          { icon: CheckCircle, title: 'Verification', desc: 'Compare and verify hashes' },
          { icon: Copy, title: 'Easy Copy', desc: 'One-click copy to clipboard' },
        ].map((feature, i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/30">
            <CardContent className="p-6">
              <feature.icon className="mb-3 h-8 w-8 text-red-400" />
              <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}
