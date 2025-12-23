'use client'

import { motion } from 'framer-motion'
import { Check, Copy, Lightbulb, Loader2, MessageSquare, Sparkles, Type, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface RewriteResult {
  variants: string[]
  improvements: string[]
  tone: string
  style: string
  originalLength: number
}

type ToneType =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'persuasive'
  | 'creative'
  | 'concise'
  | 'detailed'
  | 'humorous'
  | 'empathetic'

type StyleType = 'simple' | 'balanced' | 'advanced'

const TONES: { value: ToneType; label: string; description: string; icon: typeof Sparkles }[] = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Business-appropriate and formal',
    icon: Sparkles,
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Conversational and relaxed',
    icon: MessageSquare,
  },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable', icon: Sparkles },
  { value: 'formal', label: 'Formal', description: 'Structured and academic', icon: Type },
  {
    value: 'persuasive',
    label: 'Persuasive',
    description: 'Compelling and convincing',
    icon: Wand2,
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Imaginative and expressive',
    icon: Lightbulb,
  },
  { value: 'concise', label: 'Concise', description: 'Brief and to-the-point', icon: Type },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Comprehensive and thorough',
    icon: MessageSquare,
  },
  { value: 'humorous', label: 'Humorous', description: 'Witty and entertaining', icon: Sparkles },
  {
    value: 'empathetic',
    label: 'Empathetic',
    description: 'Understanding and compassionate',
    icon: Wand2,
  },
]

const STYLES: { value: StyleType; label: string; description: string }[] = [
  { value: 'simple', label: 'Simple', description: 'Easy-to-understand language' },
  { value: 'balanced', label: 'Balanced', description: 'Clear and professional' },
  { value: 'advanced', label: 'Advanced', description: 'Sophisticated vocabulary' },
]

const EXAMPLES = [
  {
    text: 'We need to discuss the project timeline and budget constraints at our next meeting.',
    tone: 'casual' as ToneType,
    label: 'Business Email',
  },
  {
    text: 'The system encountered an unexpected error during data processing. Please contact support.',
    tone: 'friendly' as ToneType,
    label: 'Error Message',
  },
  {
    text: 'Our innovative solution helps businesses streamline operations and reduce costs significantly.',
    tone: 'persuasive' as ToneType,
    label: 'Marketing Copy',
  },
]

function AITextRewriterContent() {
  const [inputText, setInputText] = useState('')
  const [selectedTone, setSelectedTone] = useState<ToneType>('professional')
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('balanced')
  const [numVariants, setNumVariants] = useState(1)
  const [result, setResult] = useState<RewriteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('ai_text_rewriter_open', {})
  }, [])

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to rewrite')
      return
    }

    if (inputText.length > 5000) {
      toast.error('Text is too long. Maximum 5000 characters allowed.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai-text-rewriter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText.trim(),
          tone: selectedTone,
          style: selectedStyle,
          variants: numVariants,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite text')
      }

      setResult({
        variants: data.variants,
        improvements: data.improvements,
        tone: data.tone,
        style: data.style,
        originalLength: data.originalLength,
      })

      toast.success('Text rewritten successfully!')

      trackToolEvent('ai_text_rewriter_rewrite', {
        tone: selectedTone,
        style: selectedStyle,
        variants: numVariants,
        text_length: inputText.length,
      })
    } catch (error) {
      console.error('Error rewriting text:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to rewrite text'
      toast.error(errorMessage)

      trackToolEvent('ai_text_rewriter_error', {
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('Copied to clipboard!')

      trackToolEvent('ai_text_rewriter_copy', {
        variant_index: index,
      })

      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    trackToolEvent('ai_text_rewriter_clear', {})
  }

  const loadExample = (example: (typeof EXAMPLES)[0]) => {
    setInputText(example.text)
    setSelectedTone(example.tone)
    trackToolEvent('ai_text_rewriter_load_example', {
      example_label: example.label,
    })
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
            borderColor: 'violet.500/30',
            bg: 'violet.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'violet.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'violet.300',
            })}
          >
            AI-Powered Text Rewriting
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'violet.400',
            gradientVia: 'fuchsia.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Text Rewriter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Transform your text with AI-powered tone and style control. Rewrite content for different
          audiences, adjust formality, or make your writing more engaging.
        </p>
      </motion.div>

      {/* Example Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'violet.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Quick Start Examples</CardTitle>
            <CardDescription>Try these examples to see how it works</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                w: 'full',
                gap: '3',
                gridTemplateColumns: {
                  base: '1fr',
                  sm: 'repeat(3, 1fr)',
                },
              })}
            >
              {EXAMPLES.map((example) => (
                <Button
                  key={example.label}
                  onClick={() => loadExample(example)}
                  variant="outline"
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    alignItems: 'start',
                    gap: '2',
                    p: '4',
                    textAlign: 'left',
                    whiteSpace: 'normal',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _hover: {
                      bg: 'violet.500/10',
                      borderColor: 'violet.500/50',
                    },
                  })}
                >
                  <span
                    className={css({
                      fontSize: 'xs',
                      fontWeight: 'bold',
                      color: 'violet.400',
                    })}
                  >
                    {example.label}
                  </span>
                  <span
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.300',
                      lineClamp: '3',
                    })}
                  >
                    {example.text}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'violet.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
            <CardDescription>
              Enter the text you want to rewrite (max 5000 characters)
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ position: 'relative' })}>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here... For example: 'We need to discuss the project timeline at our next meeting.'"
                className={css({
                  minH: '48',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  fontSize: 'base',
                  resize: 'vertical',
                  _focus: {
                    borderColor: 'violet.500',
                    ring: '2px',
                    ringColor: 'violet.500/20',
                  },
                })}
              />
              <div
                className={css({
                  position: 'absolute',
                  bottom: '2',
                  right: '2',
                  fontSize: 'xs',
                  color: inputText.length > 5000 ? 'red.400' : 'gray.500',
                })}
              >
                {inputText.length} / 5000
              </div>
            </div>

            {inputText.length > 5000 && (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  rounded: 'md',
                  bg: 'red.500/10',
                  border: '1px solid',
                  borderColor: 'red.500/30',
                  p: '3',
                  fontSize: 'sm',
                  color: 'red.300',
                })}
              >
                <Wand2 className={css({ h: '4', w: '4', flexShrink: '0' })} />
                Text exceeds 5000 character limit. Please shorten your text.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tone Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'violet.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Tone Selection</CardTitle>
            <CardDescription>Choose the tone for your rewritten text</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                w: 'full',
                gap: '3',
                gridTemplateColumns: {
                  base: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(5, 1fr)',
                },
              })}
            >
              {TONES.map((tone) => {
                const Icon = tone.icon
                const isSelected = selectedTone === tone.value
                return (
                  <Button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={css({
                      h: 'auto',
                      flexDirection: 'column',
                      gap: '2',
                      py: '4',
                      px: '3',
                      bg: isSelected ? 'violet.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: isSelected ? 'violet.500/50' : 'gray.700',
                      color: isSelected ? 'violet.300' : 'gray.400',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: isSelected ? 'violet.500/30' : 'gray.800',
                        borderColor: isSelected ? 'violet.500/70' : 'gray.600',
                        transform: 'translateY(-2px)',
                      },
                    })}
                  >
                    <Icon className={css({ h: '5', w: '5' })} />
                    <div className={css({ textAlign: 'center', spaceY: '1' })}>
                      <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                        {tone.label}
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {tone.description}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Style & Variants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'violet.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Style & Options</CardTitle>
            <CardDescription>Customize the complexity and number of variants</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Style Selection */}
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Language Style
              </div>
              <div
                className={css({
                  display: 'grid',
                  w: 'full',
                  gap: '3',
                  gridTemplateColumns: {
                    base: '1fr',
                    sm: 'repeat(3, 1fr)',
                  },
                })}
              >
                {STYLES.map((style) => {
                  const isSelected = selectedStyle === style.value
                  return (
                    <Button
                      key={style.value}
                      onClick={() => setSelectedStyle(style.value)}
                      className={css({
                        h: 'auto',
                        flexDirection: 'column',
                        gap: '1',
                        py: '3',
                        bg: isSelected ? 'violet.500/20' : 'gray.800/50',
                        border: '1px solid',
                        borderColor: isSelected ? 'violet.500/50' : 'gray.700',
                        color: isSelected ? 'violet.300' : 'gray.400',
                        _hover: {
                          bg: isSelected ? 'violet.500/30' : 'gray.800',
                          borderColor: isSelected ? 'violet.500/70' : 'gray.600',
                        },
                      })}
                    >
                      <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                        {style.label}
                      </div>
                      <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {style.description}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Number of Variants */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="variants"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Number of Variants: {numVariants}
              </label>
              <input
                id="variants"
                type="range"
                min="1"
                max="3"
                value={numVariants}
                onChange={(e) => setNumVariants(Number(e.target.value))}
                className={css({
                  w: 'full',
                  h: '2',
                  rounded: 'full',
                  appearance: 'none',
                  bg: 'gray.700',
                  outline: 'none',
                  cursor: 'pointer',
                  _hover: {
                    bg: 'gray.600',
                  },
                  '&::-webkit-slider-thumb': {
                    appearance: 'none',
                    w: '5',
                    h: '5',
                    rounded: 'full',
                    bg: 'violet.500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'violet.400',
                      transform: 'scale(1.2)',
                    },
                  },
                  '&::-moz-range-thumb': {
                    w: '5',
                    h: '5',
                    rounded: 'full',
                    bg: 'violet.500',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'violet.400',
                      transform: 'scale(1.2)',
                    },
                  },
                })}
              />
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                Generate {numVariants} different {numVariants > 1 ? 'versions' : 'version'} of the
                rewritten text
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', sm: 'row' },
          gap: '3',
          justifyContent: 'center',
        })}
      >
        <Button
          onClick={handleRewrite}
          disabled={loading || !inputText.trim() || inputText.length > 5000}
          size="lg"
          className={css({
            gap: '2',
            minH: '12',
            px: '8',
            bg: 'violet.500/20',
            border: '1px solid',
            borderColor: 'violet.500/50',
            color: 'violet.300',
            fontWeight: 'semibold',
            _hover: {
              bg: 'violet.500/30',
              borderColor: 'violet.500/70',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s',
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
              transform: 'none',
            },
          })}
        >
          {loading ? (
            <>
              <Loader2 className={css({ h: '5', w: '5', animation: 'spin' })} />
              Rewriting...
            </>
          ) : (
            <>
              <Wand2 className={css({ h: '5', w: '5' })} />
              Rewrite Text
            </>
          )}
        </Button>

        <Button
          onClick={handleClear}
          disabled={!inputText && !result}
          variant="outline"
          size="lg"
          className={css({
            gap: '2',
            minH: '12',
            px: '8',
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
          })}
        >
          Clear All
        </Button>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={css({ spaceY: '4' })}
        >
          {/* Improvements */}
          {result.improvements.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'green.500/5',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardContent className={css({ pt: '4', pb: '4' })}>
                <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                  <Lightbulb
                    className={css({
                      h: '5',
                      w: '5',
                      color: 'green.400',
                      flexShrink: '0',
                      mt: '0.5',
                    })}
                  />
                  <div className={css({ spaceY: '2' })}>
                    <h3
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: 'green.300',
                      })}
                    >
                      Key Improvements
                    </h3>
                    <ul className={css({ spaceY: '1', fontSize: 'sm', color: 'gray.300' })}>
                      {result.improvements.map((improvement) => (
                        <li key={improvement}>• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rewritten Variants */}
          {result.variants.map((variant, variantIndex) => (
            <Card
              key={`variant-${variantIndex}-${variant.substring(0, 50)}`}
              className={css({
                border: '1px solid',
                borderColor: 'violet.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
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
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <CardTitle>
                      {result.variants.length > 1
                        ? `Variant ${variantIndex + 1}`
                        : 'Rewritten Text'}
                    </CardTitle>
                    <Badge
                      className={css({
                        bg: 'violet.500/20',
                        color: 'violet.300',
                        border: '1px solid',
                        borderColor: 'violet.500/30',
                      })}
                    >
                      {result.tone}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleCopy(variant, variantIndex)}
                    size="sm"
                    variant="ghost"
                    className={css({
                      gap: '2',
                      _hover: {
                        bg: 'violet.500/10',
                      },
                    })}
                  >
                    {copiedIndex === variantIndex ? (
                      <>
                        <Check className={css({ h: '4', w: '4', color: 'green.400' })} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className={css({ h: '4', w: '4' })} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={css({
                    fontSize: 'base',
                    lineHeight: '1.7',
                    color: 'gray.200',
                    whiteSpace: 'pre-wrap',
                  })}
                >
                  {variant}
                </p>
                <div
                  className={css({
                    mt: '4',
                    pt: '4',
                    borderTop: '1px solid',
                    borderColor: 'gray.800',
                    fontSize: 'xs',
                    color: 'gray.500',
                  })}
                >
                  {variant.length} characters ({result.originalLength} original)
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles
                className={css({
                  h: '6',
                  w: '6',
                  color: 'cyan.400',
                  flexShrink: '0',
                })}
              />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>
                    • Experiment with different tones to find the perfect voice for your audience
                  </li>
                  <li>
                    • Use the "Concise" tone to shorten lengthy text while preserving key
                    information
                  </li>
                  <li>• Generate multiple variants to compare different writing approaches</li>
                  <li>
                    • The "Creative" tone is great for marketing copy and engaging social media
                    posts
                  </li>
                  <li>
                    • All text processing happens securely through OpenAI's API with no data storage
                  </li>
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

export default function AITextRewriterPage() {
  return <AITextRewriterContent />
}
