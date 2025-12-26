'use client'

import { Check, Copy, Download, Palette, Sparkles, Trash2, Type, Wand2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type SignatureStyle = 'handwritten' | 'cursive' | 'modern' | 'elegant' | 'bold' | 'minimal'

interface SignatureConfig {
  name: string
  style: SignatureStyle
  color: string
  fontSize: number
  underline: boolean
  italic: boolean
  customText: string
}

const fonts: Record<SignatureStyle, string> = {
  handwritten: '"Dancing Script", cursive',
  cursive: '"Great Vibes", cursive',
  modern: '"Comfortaa", cursive',
  elegant: '"Playfair Display", serif',
  bold: '"Bebas Neue", sans-serif',
  minimal: '"Raleway", sans-serif',
}

const styleDescriptions: Record<SignatureStyle, string> = {
  handwritten: 'Natural handwritten style',
  cursive: 'Elegant flowing cursive',
  modern: 'Contemporary rounded',
  elegant: 'Classic serif elegance',
  bold: 'Strong and impactful',
  minimal: 'Clean and simple',
}

export default function SignatureGeneratorPage() {
  const [config, setConfig] = useState<SignatureConfig>({
    name: '',
    style: 'handwritten',
    color: '#000000',
    fontSize: 64,
    underline: false,
    italic: false,
    customText: '',
  })
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    trackToolEvent('signature_generator_view', {})
  }, [])

  const _drawSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set transparent background
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Configure text
    const text = config.customText || config.name
    if (!text) return

    ctx.fillStyle = config.color
    ctx.font = `${config.italic ? 'italic' : ''} ${config.fontSize}px ${fonts[config.style]}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw text
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    // Draw underline
    if (config.underline) {
      const metrics = ctx.measureText(text)
      const textWidth = metrics.width
      const x = canvas.width / 2 - textWidth / 2
      const y = canvas.height / 2 + config.fontSize / 3

      ctx.strokeStyle = config.color
      ctx.lineWidth = Math.max(2, config.fontSize / 20)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + textWidth, y)
      ctx.stroke()
    }
  }

  const downloadSignature = (format: 'png' | 'svg' | 'jpg') => {
    const canvas = canvasRef.current
    if (!canvas) return

    trackToolEvent('signature_generator_download', { format })

    if (format === 'svg') {
      downloadAsSVG()
      return
    }

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `signature-${Date.now()}.${format}`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Signature downloaded as ${format.toUpperCase()}`)
      },
      mimeType,
      format === 'jpg' ? 0.95 : undefined
    )
  }

  const downloadAsSVG = () => {
    const text = config.customText || config.name
    if (!text) return

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
  <text 
    x="400" 
    y="150" 
    fill="${config.color}" 
    font-family="${fonts[config.style]}" 
    font-size="${config.fontSize}" 
    ${config.italic ? 'font-style="italic"' : ''}
    text-anchor="middle" 
    dominant-baseline="middle"
  >${text}</text>`

    if (config.underline) {
      const estimatedWidth = text.length * (config.fontSize * 0.6)
      const x1 = 400 - estimatedWidth / 2
      const x2 = 400 + estimatedWidth / 2
      const y = 150 + config.fontSize / 3
      const strokeWidth = Math.max(2, config.fontSize / 20)

      svgContent += `
  <line 
    x1="${x1}" 
    y1="${y}" 
    x2="${x2}" 
    y2="${y}" 
    stroke="${config.color}" 
    stroke-width="${strokeWidth}"
  />`
    }

    svgContent += '\n</svg>'

    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `signature-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Signature downloaded as SVG')
  }

  const copyToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        trackToolEvent('signature_generator_copy', {})
        toast.success('Signature copied to clipboard')
      })
    } catch (_error) {
      toast.error('Failed to copy signature')
    }
  }

  const clearSignature = () => {
    setConfig({
      name: '',
      style: 'handwritten',
      color: '#000000',
      fontSize: 64,
      underline: false,
      italic: false,
      customText: '',
    })
    trackToolEvent('signature_generator_clear', {})
  }

  const randomizeStyle = () => {
    const styles: SignatureStyle[] = [
      'handwritten',
      'cursive',
      'modern',
      'elegant',
      'bold',
      'minimal',
    ]
    const colors = ['#000000', '#1a1a1a', '#2c3e50', '#34495e', '#8e44ad', '#2980b9', '#c0392b']

    setConfig({
      ...config,
      style: styles[Math.floor(Math.random() * styles.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      fontSize: Math.floor(Math.random() * 40) + 50,
      underline: Math.random() > 0.5,
      italic: Math.random() > 0.7,
    })
    trackToolEvent('signature_generator_randomize', {})
  }

  return (
    <div
      className={css({
        maxW: '6xl',
        mx: 'auto',
        px: { base: '4', md: '6' },
        py: { base: '8', md: '12' },
      })}
    >
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '8' })}>
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
            textAlign: 'center',
          })}
        >
          <div
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2',
              px: '3',
              py: '1',
              bg: 'purple.50',
              color: 'purple.600',
              borderRadius: 'full',
              fontSize: 'sm',
              fontWeight: 'medium',
              mx: 'auto',
            })}
          >
            <Sparkles className={css({ w: '4', h: '4' })} />
            New Tool
          </div>
          <h1
            className={css({
              fontSize: { base: '3xl', md: '4xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'pink.500',
              gradientTo: 'rose.500',
              bgClip: 'text',
            })}
          >
            Digital Signature Generator
          </h1>
          <p
            className={css({
              fontSize: 'lg',
              color: 'gray.600',
              maxW: '2xl',
              mx: 'auto',
            })}
          >
            Create beautiful digital signatures for documents, emails, and professional use. Choose
            from 6 elegant fonts and customize colors, size, and style.
          </p>
        </div>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: '1fr 1.5fr' },
            gap: '8',
            w: 'full',
          })}
        >
          {/* Controls */}
          <div
            className={css({
              bg: 'white',
              borderRadius: 'xl',
              boxShadow: 'lg',
              p: '6',
              h: 'fit',
            })}
          >
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
              <div>
                <FieldLabel htmlFor="name">Your Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="John Smith"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel htmlFor="customText">Custom Text (optional)</FieldLabel>
                <Input
                  id="customText"
                  placeholder="Override with custom text"
                  value={config.customText}
                  onChange={(e) => setConfig({ ...config, customText: e.target.value })}
                />
                <p className={css({ fontSize: 'sm', color: 'white', mt: '1' })}>
                  Leave empty to use your name
                </p>
              </div>

              <div>
                <FieldLabel>Signature Style</FieldLabel>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2',
                    mt: '2',
                  })}
                >
                  {(Object.keys(fonts) as SignatureStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setConfig({ ...config, style })}
                      className={css({
                        p: '3',
                        borderRadius: 'lg',
                        border: '2px solid',
                        borderColor: config.style === style ? 'pink.500' : 'gray.200',
                        bg: config.style === style ? 'pink.50' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: { borderColor: 'pink.300' },
                      })}
                    >
                      <div className={css({ fontWeight: 'medium', fontSize: 'sm', mb: '1' })}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'white' })}>
                        {styleDescriptions[style]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="color">Color</FieldLabel>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <input
                    type="color"
                    id="color"
                    value={config.color}
                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                    className={css({
                      w: '12',
                      h: '10',
                      borderRadius: 'md',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'gray.200',
                    })}
                  />
                  <Input
                    value={config.color}
                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="fontSize">Font Size: {config.fontSize}px</FieldLabel>
                <input
                  type="range"
                  id="fontSize"
                  min="30"
                  max="120"
                  value={config.fontSize}
                  onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value, 10) })}
                  className={css({ w: 'full', cursor: 'pointer' })}
                />
              </div>

              <div className={css({ display: 'flex', gap: '4' })}>
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
                    checked={config.underline}
                    onChange={(e) => setConfig({ ...config, underline: e.target.checked })}
                    className={css({ cursor: 'pointer' })}
                  />
                  <span className={css({ fontSize: 'sm' })}>Underline</span>
                </label>
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
                    checked={config.italic}
                    onChange={(e) => setConfig({ ...config, italic: e.target.checked })}
                    className={css({ cursor: 'pointer' })}
                  />
                  <span className={css({ fontSize: 'sm' })}>Italic</span>
                </label>
              </div>

              <Button onClick={randomizeStyle} className={css({ w: 'full' })}>
                <Wand2 className={css({ w: '4', h: '4', mr: '2' })} />
                Randomize Style
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
            <div
              className={css({
                bg: 'white',
                borderRadius: 'xl',
                boxShadow: 'lg',
                p: '8',
                minH: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'gray.200',
              })}
            >
              {config.name || config.customText ? (
                <canvas ref={canvasRef} className={css({ maxW: 'full', h: 'auto' })} />
              ) : (
                <div className={css({ textAlign: 'center', color: 'white' })}>
                  <Type className={css({ w: '16', h: '16', mx: 'auto', mb: '4' })} />
                  <p>Enter your name to generate signature</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {(config.name || config.customText) && (
              <div
                className={css({
                  bg: 'white',
                  borderRadius: 'xl',
                  boxShadow: 'lg',
                  p: '6',
                })}
              >
                <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                  <div>
                    <FieldLabel>Download As</FieldLabel>
                    <div className={css({ display: 'flex', gap: '2', mt: '2' })}>
                      <Button
                        onClick={() => downloadSignature('png')}
                        className={css({ flex: '1' })}
                      >
                        <Download className={css({ w: '4', h: '4', mr: '2' })} />
                        PNG
                      </Button>
                      <Button
                        onClick={() => downloadSignature('svg')}
                        className={css({ flex: '1' })}
                      >
                        <Download className={css({ w: '4', h: '4', mr: '2' })} />
                        SVG
                      </Button>
                      <Button
                        onClick={() => downloadSignature('jpg')}
                        className={css({ flex: '1' })}
                      >
                        <Download className={css({ w: '4', h: '4', mr: '2' })} />
                        JPG
                      </Button>
                    </div>
                  </div>

                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button onClick={copyToClipboard} className={css({ flex: '1' })}>
                      {copied ? (
                        <>
                          <Check className={css({ w: '4', h: '4', mr: '2' })} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button onClick={clearSignature} className={css({ flex: '1' })}>
                      <Trash2 className={css({ w: '4', h: '4', mr: '2' })} />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div
          className={css({
            bg: 'gray.50',
            borderRadius: 'xl',
            p: '8',
          })}
        >
          <h2
            className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '6', textAlign: 'center' })}
          >
            Why Use Our Signature Generator?
          </h2>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: '6',
              w: 'full',
            })}
          >
            {[
              {
                icon: Type,
                title: '6 Professional Fonts',
                description:
                  'Choose from handwritten, cursive, elegant, and modern signature styles',
              },
              {
                icon: Palette,
                title: 'Full Customization',
                description: 'Adjust colors, size, add underlines, and make it italic',
              },
              {
                icon: Download,
                title: 'Multiple Formats',
                description: 'Download as PNG, SVG (vector), or JPG for any use case',
              },
              {
                icon: Sparkles,
                title: 'Instant Preview',
                description: 'See your signature in real-time as you customize',
              },
              {
                icon: Wand2,
                title: 'Random Generator',
                description: 'Get instant style inspiration with one click',
              },
              {
                icon: Copy,
                title: 'Quick Copy',
                description: 'Copy to clipboard and paste directly into documents',
              },
            ].map((feature) => (
              <div key={feature.title} className={css({ textAlign: 'center' })}>
                <div
                  className={css({
                    w: '12',
                    h: '12',
                    bg: 'white',
                    borderRadius: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: '3',
                    boxShadow: 'md',
                  })}
                >
                  <feature.icon className={css({ w: '6', h: '6', color: 'pink.500' })} />
                </div>
                <h3 className={css({ fontWeight: 'semibold', mb: '2' })}>{feature.title}</h3>
                <p className={css({ fontSize: 'sm', color: 'gray.600' })}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div
          className={css({
            bg: 'white',
            borderRadius: 'xl',
            boxShadow: 'lg',
            p: '8',
          })}
        >
          <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '6' })}>
            Frequently Asked Questions
          </h2>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
            {[
              {
                q: 'Is this a legally valid signature?',
                a: "This tool creates digital signature images for visual use in documents, emails, and websites. For legally binding electronic signatures, you'll need specialized e-signature software like DocuSign or Adobe Sign.",
              },
              {
                q: 'What format should I download?',
                a: "PNG is best for general use and transparent backgrounds. SVG is perfect for scaling without quality loss (websites, print). JPG is good for documents that don't support PNG transparency.",
              },
              {
                q: 'Can I use this signature commercially?',
                a: 'Yes! All signatures generated are yours to use freely for personal or commercial purposes. The fonts used are free and open-source.',
              },
              {
                q: 'How do I add this to my email?',
                a: 'Download as PNG, then in your email settings, add it as an image signature. Most email clients allow image signatures in their signature settings.',
              },
              {
                q: 'Why should I use a digital signature?',
                a: "Digital signatures save time, look professional, and are eco-friendly. They're perfect for emails, PDFs, contracts, and any document that needs a personal touch.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className={css({ fontWeight: 'semibold', mb: '2' })}>{faq.q}</h3>
                <p className={css({ color: 'gray.600' })}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
