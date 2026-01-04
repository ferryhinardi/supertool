'use client'

import { motion } from 'framer-motion'
import { Copy, Download, ImageIcon, Lightbulb, Lock, Unlock, Upload } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { Suspense, useState } from 'react'
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
import { css } from '@/styled-system/css'

export const dynamic = 'force-dynamic'

type Mode = 'encode' | 'decode'

const faqs = [
  {
    question: 'What is Base64 encoding and why is it used?',
    answer:
      "Base64 is a binary-to-text encoding scheme that converts binary data into ASCII characters using 64 printable characters (A-Z, a-z, 0-9, +, /). It's widely used for transmitting data over text-based protocols like email and JSON, embedding images in HTML/CSS, storing credentials safely, and encoding binary files for APIs. Base64 ensures binary data remains intact during transmission without modification.",
  },
  {
    question: 'Can I encode files other than text with this tool?',
    answer:
      'Yes! Our Base64 encoder supports any file type - images (PNG, JPG, GIF), documents (PDF, DOCX), audio files (MP3, WAV), videos, and more. Simply upload your file using the file picker in encode mode. The tool converts the entire file into a Base64 string that you can embed in code, transmit via API, or store in databases.',
  },
  {
    question: 'How do I decode a Base64 string back to its original format?',
    answer:
      'Switch to "Decode" mode, paste your Base64 string into the input field, and click "Decode from Base64". The original text will appear in the output. For images, the tool automatically detects image data and displays a preview. You can download decoded content as a text file or copy it to your clipboard.',
  },
  {
    question: 'Is Base64 encoding secure for sensitive data?',
    answer:
      "No, Base64 is NOT encryption and provides no security. It's simply an encoding format that makes binary data text-safe. Anyone can easily decode Base64 strings. Never use Base64 alone for passwords, API keys, or sensitive information. For security, use proper encryption algorithms like AES-256 first, then optionally Base64 encode the encrypted output for transmission.",
  },
  {
    question: 'Why is my Base64 string so much longer than the original?',
    answer:
      'Base64 encoding increases data size by approximately 33% because it converts every 3 bytes of binary data into 4 ASCII characters. This overhead is the trade-off for text-safe transmission. For example, a 100KB image becomes ~133KB when Base64 encoded. This is normal and expected behavior for Base64 encoding.',
  },
  {
    question: 'Can I embed Base64-encoded images directly in HTML and CSS?',
    answer:
      'Yes! Base64-encoded images can be embedded directly using data URIs. In HTML: <img src="data:image/png;base64,YOUR_BASE64_STRING" />. In CSS: background-image: url(data:image/png;base64,YOUR_BASE64_STRING);. This eliminates HTTP requests but increases page size. Best for small images, icons, and logos under 10KB.',
  },
  {
    question: 'What does "Invalid Base64 string" error mean?',
    answer:
      'This error occurs when the input string contains invalid characters (not A-Z, a-z, 0-9, +, /, or =), incorrect padding (Base64 strings should be divisible by 4 with = padding), or corrupted data. Ensure you copied the entire Base64 string, including any = padding at the end. Remove any extra whitespace or line breaks.',
  },
  {
    question: 'How do I encode images for use in JSON APIs?',
    answer:
      'Upload your image file in encode mode. The tool generates a Base64 string starting with "data:image/[type];base64,". Copy this entire string (including the data URI prefix) and use it in your JSON payload. Most APIs accept Base64 images in request bodies. For large images, consider using direct file uploads instead to avoid large JSON payloads.',
  },
  {
    question: 'Can I decode Base64 images and preview them?',
    answer:
      'Yes! When decoding Base64 strings that contain image data (starting with "data:image/"), the tool automatically detects and displays an image preview. You can visually verify the decoded image before downloading or using it. This works for PNG, JPEG, GIF, WebP, and SVG formats.',
  },
  {
    question: 'What are common use cases for Base64 encoding?',
    answer:
      'Common uses include: embedding small images/fonts in CSS to reduce HTTP requests, transmitting binary files through JSON APIs, storing images in databases as text, email attachments (MIME encoding), data URIs in HTML, OAuth tokens and JWT payloads, encoding binary data for XML, and ensuring data integrity during text-based transmission. Base64 is essential for web development and API integration.',
  },
]

function Base64Content() {
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsStringEnum<Mode>(['encode', 'decode']).withDefault('encode')
  )
  const [input, setInput] = useQueryState('input', { defaultValue: '' })
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
    setMode('encode')
  }

  // Keyboard shortcuts
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts(
    {
      onExecute: mode === 'encode' ? handleEncode : handleDecode,
      onCopy: handleCopy,
      onSave: handleDownload,
      onReset: handleClear,
      onEscape: handleClear,
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
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4',
          textAlign: 'center',
          w: 'full',
          maxW: '1400px',
        })}
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
          <Lock className={css({ h: '5', w: '5', color: 'indigo.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'indigo.300' })}>
            Base64 Conversion
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'indigo.400',
              gradientVia: 'purple.400',
              gradientTo: 'pink.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Base64 Encoder & Decoder
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'white',
          })}
        >
          Convert text and files to Base64 encoding or decode Base64 strings back to original format
        </p>
      </motion.div>

      {/* Pro Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={css({ w: 'full', maxW: '1400px' })}
      >
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'cyan.500/20',
            bg: 'rgba(6, 182, 212, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'cyan.300',
            })}
          >
            Pro Tips
          </h3>
          <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Text & File Encoding:</strong> Convert any text or file to Base64 format.
              Supports images, documents, audio, video, and any file type up to browser memory
              limits - perfect for API payloads and data URIs.
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Binary-to-Text Conversion:</strong> Base64 encoding converts binary data into
              ASCII text using 64 printable characters (A-Z, a-z, 0-9, +, /), making it safe for
              text-based transmission protocols like JSON and email.
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Image Preview:</strong> Automatically detects and displays image previews when
              decoding Base64 strings with data URI format (data:image/...), supporting PNG, JPEG,
              GIF, WebP, and SVG formats.
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Data URI Support:</strong> Generate complete data URIs for direct embedding in
              HTML (img src) and CSS (background-image). Eliminates HTTP requests for small assets
              like icons and logos.
            </li>
            <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
              <strong>Browser-Only Processing:</strong> All encoding and decoding happens locally in
              your browser using native JavaScript APIs - your files and data never leave your
              device, ensuring complete privacy and security.
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={css({
          display: 'flex',
          justifyContent: 'center',
          gap: '2',
          w: 'full',
          maxW: '1400px',
        })}
      >
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('encode')
            handleClear()
          }}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            minH: '11',
            py: { base: '3', sm: '3.5', md: '4' },
          })}
        >
          <Lock className={css({ h: '4', w: '4' })} />
          Encode
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('decode')
            handleClear()
          }}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            minH: '11',
            py: { base: '3', sm: '3.5', md: '4' },
          })}
        >
          <Unlock className={css({ h: '4', w: '4' })} />
          Decode
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {/* Input */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
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
                className={css({
                  minH: '[300px]',
                  fontFamily: 'mono',
                  fontSize: 'sm',
                })}
              />

              {mode === 'encode' && (
                <div>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className={css({ cursor: 'pointer' })}
                    accept="*/*"
                  />
                  <p className={css({ mt: '2', fontSize: 'xs', color: 'white' })}>
                    Upload any file to encode
                  </p>
                </div>
              )}

              <Button
                onClick={mode === 'encode' ? handleEncode : handleDecode}
                className={css({
                  w: 'full',
                  gap: '2',
                  minH: '11',
                  py: { base: '3', sm: '3.5', md: '4' },
                })}
                disabled={!input}
              >
                {mode === 'encode' ? (
                  <Lock className={css({ h: '4', w: '4' })} />
                ) : (
                  <Unlock className={css({ h: '4', w: '4' })} />
                )}
                {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
          })}
        >
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
                className={css({
                  minH: '[300px]',
                  fontFamily: 'mono',
                  fontSize: 'sm',
                })}
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
                  <p
                    className={css({
                      mb: '2',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'white',
                    })}
                  >
                    Image Preview:
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Decoded base64"
                    className={css({
                      maxH: '64',
                      rounded: 'lg',
                      objectFit: 'contain',
                    })}
                  />
                </div>
              )}

              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className={css({
                    flex: '1',
                    gap: '2',
                    minH: '11',
                    py: { base: '3', sm: '3.5', md: '4' },
                  })}
                  disabled={!output}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  Copy
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className={css({
                    flex: '1',
                    gap: '2',
                    minH: '11',
                    py: { base: '3', sm: '3.5', md: '4' },
                  })}
                  disabled={!output}
                >
                  <Download className={css({ h: '4', w: '4' })} />
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
        transition={{ delay: 0.4 }}
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {[
          { icon: Lock, title: 'Text Encoding', desc: 'Convert text to Base64' },
          { icon: Upload, title: 'File Support', desc: 'Encode any file type' },
          { icon: ImageIcon, title: 'Image Preview', desc: 'Preview decoded images' },
          { icon: Download, title: 'Export', desc: 'Copy or download results' },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/30',
            })}
          >
            <CardContent withTopPadding>
              <div className={css({ p: '6' })}>
                <feature.icon
                  className={css({
                    mb: '3',
                    h: '8',
                    w: '8',
                    color: 'indigo.400',
                  })}
                />
                <h3
                  className={css({
                    mb: '2',
                    fontWeight: 'semibold',
                    color: 'gray.200',
                  })}
                >
                  {feature.title}
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white' })}>{feature.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={css({ w: 'full', maxW: '1400px' })}
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
              How to Use Base64 Encoder/Decoder
            </CardTitle>
            <CardDescription>
              Follow these simple steps to encode and decode Base64 data
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
                  Choose Encode or Decode Mode
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white', lineHeight: 'relaxed' })}>
                  Select "Encode" to convert text or files to Base64 format, or "Decode" to convert
                  Base64 strings back to their original format. The mode toggle switches between
                  both operations.
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
                  Enter Text or Upload File
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white', lineHeight: 'relaxed' })}>
                  Type or paste your text directly, or upload any file (images, documents, audio,
                  etc.) to encode. For decoding, paste the Base64 string including data URI prefix
                  if present.
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
                  Convert and View Results
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white', lineHeight: 'relaxed' })}>
                  Click the encode/decode button to convert. The result appears instantly in the
                  output panel. Images are automatically detected and previewed when decoding data
                  URIs.
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
                  Copy or Download Output
                </h3>
                <p className={css({ fontSize: 'sm', color: 'white', lineHeight: 'relaxed' })}>
                  Use the "Copy" button to copy the result to clipboard, or "Download" to save as a
                  text file. Perfect for embedding in code, APIs, data URIs, or data transmission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={css({ w: 'full', maxW: '1400px' })}
      >
        <SocialShare
          toolName="Base64 Encoder & Decoder"
          toolUrl="https://supertool.id/tools/base64"
          description="Convert text and files to Base64 encoding or decode Base64 strings with instant image preview - perfect for web development, APIs, and data transmission!"
          hashtags={['Base64', 'Encoding', 'WebDev', 'DataConversion']}
        />
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={css({ w: 'full', maxW: '1400px' })}
      >
        <FAQAccordion faqs={faqs} />
      </motion.div>

      {/* Related Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={css({ w: 'full', maxW: '1400px' })}
      >
        <RelatedTools currentToolPath="/tools/base64" category="converter" />
      </motion.div>

      {/* Tool Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className={css({ w: 'full', maxW: '1400px' })}
      >
        <ToolRating toolId="/tools/base64" toolName="Base64 Encoder & Decoder" />
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={shortcuts}
        toolName="Base64 Encoder"
      />
    </main>
  )
}

export default function Base64Page() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minH: 'screen',
            color: 'white',
          })}
        >
          Loading...
        </div>
      }
    >
      <Base64Content />
    </Suspense>
  )
}
