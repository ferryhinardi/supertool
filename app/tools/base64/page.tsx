'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Lock, Unlock, Copy, Download, Upload, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

type Mode = 'encode' | 'decode'

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleEncode = () => {
    try {
      const encoded = btoa(input)
      setOutput(encoded)
      toast.success('Text encoded to Base64')
    } catch (error) {
      toast.error('Failed to encode. Check your input.')
      console.error(error)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = atob(input)
      setOutput(decoded)
      toast.success('Base64 decoded successfully')

      // Check if it's an image
      if (input.startsWith('data:image/')) {
        setImagePreview(input)
      } else {
        setImagePreview(null)
      }
    } catch (error) {
      toast.error('Invalid Base64 string')
      console.error(error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (mode === 'encode') {
        setInput(result)
        setOutput(result) // Base64 is already in result for readAsDataURL
        toast.success(`File encoded: ${file.name}`)
      }
    }

    if (mode === 'encode') {
      reader.readAsDataURL(file)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setImagePreview(null)
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
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2">
          <Lock className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-300">Base64 Conversion</span>
        </div>

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Base64 Encoder & Decoder
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Convert text and files to Base64 encoding or decode Base64 strings back to original format
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-2"
      >
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('encode')
            handleClear()
          }}
          className="gap-2"
        >
          <Lock className="h-4 w-4" />
          Encode
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('decode')
            handleClear()
          }}
          className="gap-2"
        >
          <Unlock className="h-4 w-4" />
          Decode
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Input */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>{mode === 'encode' ? 'Original Text/File' : 'Base64 String'}</CardTitle>
            <CardDescription>
              {mode === 'encode'
                ? 'Enter text or upload a file to encode'
                : 'Paste Base64 string to decode'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={
                mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string to decode...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            {mode === 'encode' && (
              <div>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  accept="*/*"
                />
                <p className="mt-2 text-xs text-gray-500">Upload any file to encode</p>
              </div>
            )}

            <Button
              onClick={mode === 'encode' ? handleEncode : handleDecode}
              className="w-full gap-2"
              disabled={!input}
            >
              {mode === 'encode' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>{mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}</CardTitle>
            <CardDescription>
              {output ? 'Result ready for use' : 'Result will appear here'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="min-h-[300px] font-mono text-sm"
            />

            {imagePreview && mode === 'decode' && (
              <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                <p className="mb-2 text-sm font-medium text-gray-400">Image Preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Decoded base64 image"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!output}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!output}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { icon: Lock, title: 'Text Encoding', desc: 'Convert text to Base64' },
          { icon: Upload, title: 'File Support', desc: 'Encode any file type' },
          { icon: ImageIcon, title: 'Image Preview', desc: 'Preview decoded images' },
          { icon: Download, title: 'Export', desc: 'Copy or download results' },
        ].map((feature, i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/30">
            <CardContent className="p-6">
              <feature.icon className="mb-3 h-8 w-8 text-indigo-400" />
              <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}
