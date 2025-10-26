'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Lock, Unlock, Copy, Download, Upload, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { css } from '@/styled-system/css'

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
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
          width: '100%',
          maxWidth: '1400px',
        }}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'indigo.500/20',
            bg: 'indigo.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Lock className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-300">Base64 Conversion</span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Base64 Encoder & Decoder
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'gray.400',
          })}
        >
          Convert text and files to Base64 encoding or decode Base64 strings back to original format
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          maxWidth: '1400px',
        }}
      >
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('encode')
            handleClear()
          }}
          className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
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
          className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
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
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: '1fr',
          width: '100%',
          maxWidth: '1400px',
        }}
        className="lg:grid-cols-2"
      >
        {/* Input */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <CardTitle>{mode === 'encode' ? 'Original Text/File' : 'Base64 String'}</CardTitle>
              <CardDescription>
                {mode === 'encode'
                  ? 'Enter text or upload a file to encode'
                  : 'Paste Base64 string to decode'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
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
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <CardTitle>{mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}</CardTitle>
              <CardDescription>
                {output ? 'Result ready for use' : 'Result will appear here'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
              <Textarea
                value={output}
                readOnly
                placeholder="Output will appear here..."
                className="min-h-[300px] font-mono text-sm"
              />

              {imagePreview && mode === 'decode' && (
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.800',
                    bg: 'gray.950',
                    p: '4',
                  })}
                >
                  <p className="mb-2 text-sm font-medium text-gray-400">Image Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Decoded base64 image"
                    className="max-h-64 rounded-lg object-contain"
                  />
                </div>
              )}

              <div className={css({ display: 'flex', gap: '2' })}>
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr',
          width: '100%',
          maxWidth: '1400px',
        }}
        className="sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { icon: Lock, title: 'Text Encoding', desc: 'Convert text to Base64' },
          { icon: Upload, title: 'File Support', desc: 'Encode any file type' },
          { icon: ImageIcon, title: 'Image Preview', desc: 'Preview decoded images' },
          { icon: Download, title: 'Export', desc: 'Copy or download results' },
        ].map((feature, i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/30">
            <CardContent>
              <div className={css({ p: '6' })}>
                <feature.icon className="mb-3 h-8 w-8 text-indigo-400" />
                <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </main>
  )
}
