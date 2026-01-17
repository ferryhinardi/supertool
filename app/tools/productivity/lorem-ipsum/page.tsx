'use client'

import { Copy, FileText, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  generateLoremIpsum,
  getCharacterCount,
  getParagraphCount,
  getSentenceCount,
  getWordCount,
  type OutputType,
} from './templates'

export default function LoremIpsumPage() {
  const [outputType, setOutputType] = useState<OutputType>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [htmlFormat, setHtmlFormat] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const text = generateLoremIpsum({
      type: outputType,
      count,
      startWithLorem,
      htmlFormat,
    })
    setGeneratedText(text)
    trackToolEvent('lorem_ipsum_generated', { type: outputType, count, htmlFormat })
    toast.success('Text generated successfully!')
  }

  const handleCopy = async () => {
    if (!generatedText) {
      toast.error('No text to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackToolEvent('lorem_ipsum_copied', { length: generatedText.length })
      toast.success('Copied to clipboard!')
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleClear = () => {
    setGeneratedText('')
    trackToolEvent('lorem_ipsum_cleared')
    toast.success('Text cleared')
  }

  // Calculate statistics
  const stats = generatedText
    ? {
        characters: getCharacterCount(generatedText, false),
        charactersNoSpaces: getCharacterCount(generatedText, true),
        words: getWordCount(generatedText),
        sentences: getSentenceCount(generatedText),
        paragraphs: getParagraphCount(generatedText),
      }
    : null

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
      <div className={css({ spaceY: 3, textAlign: 'center' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          })}
        >
          <FileText className={css({ w: 10, h: 10, color: 'purple.400' })} />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientVia: 'pink.400',
              gradientTo: 'blue.400',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Lorem Ipsum Generator
          </h1>
        </div>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Generate placeholder text for your designs and mockups
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          gap: 6,
          w: 'full',
        })}
      >
        {/* Settings */}
        <div
          className={css({
            spaceY: 6,
            p: 6,
            rounded: 'xl',
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(8px)',
            h: 'fit-content',
          })}
        >
          <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'gray.200' })}>
            Settings
          </h2>

          {/* Output Type */}
          <div className={css({ spaceY: 3 })}>
            <div className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}>
              Output Type
            </div>
            <div className={css({ display: 'grid', gridTemplateColumns: '1fr', gap: 2 })}>
              {(['paragraphs', 'sentences', 'words'] as OutputType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOutputType(type)}
                  className={css({
                    px: 4,
                    py: 2.5,
                    rounded: 'lg',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: '1px solid',
                    borderColor: outputType === type ? 'purple.500' : 'gray.700',
                    bg: outputType === type ? 'rgba(139, 92, 246, 0.1)' : 'gray.900',
                    color: outputType === type ? 'purple.300' : 'gray.400',
                    _hover: {
                      borderColor: 'purple.500',
                      bg: 'rgba(139, 92, 246, 0.1)',
                      color: 'purple.300',
                    },
                  })}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className={css({ spaceY: 3 })}>
            <label
              htmlFor="count"
              className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}
            >
              Count: {count}
            </label>
            <input
              id="count"
              type="range"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={css({
                w: 'full',
                cursor: 'pointer',
              })}
            />
          </div>

          {/* Options */}
          <div className={css({ spaceY: 3 })}>
            <div className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}>
              Options
            </div>
            <div className={css({ spaceY: 2 })}>
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                })}
              >
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className={css({
                    w: 4,
                    h: 4,
                    rounded: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.600',
                    bg: 'gray.800',
                    cursor: 'pointer',
                  })}
                />
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Start with "Lorem ipsum..."
                </span>
              </label>
              <label
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                })}
              >
                <input
                  type="checkbox"
                  checked={htmlFormat}
                  onChange={(e) => setHtmlFormat(e.target.checked)}
                  className={css({
                    w: 4,
                    h: 4,
                    rounded: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.600',
                    bg: 'gray.800',
                    cursor: 'pointer',
                  })}
                />
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  HTML format {htmlFormat && '(<p> tags)'}
                </span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className={css({
              w: 'full',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              px: 6,
              py: 3,
              rounded: 'lg',
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'white',
              bgGradient: 'to-r',
              gradientFrom: 'purple.600',
              gradientTo: 'pink.600',
              transition: 'all 0.2s',
              cursor: 'pointer',
              _hover: {
                transform: 'scale(1.02)',
                shadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
              },
              _active: {
                transform: 'scale(0.98)',
              },
            })}
          >
            <Sparkles className={css({ w: 4, h: 4 })} />
            Generate Text
          </button>
        </div>

        {/* Output */}
        <div className={css({ lg: { gridColumn: 'span 2' }, spaceY: 4 })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 3,
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'gray.200' })}>
              Generated Text
            </h2>
            <div className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
              {generatedText && (
                <>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 3,
                      py: 1.5,
                      rounded: 'md',
                      fontSize: 'xs',
                      fontWeight: 'medium',
                      color: copied ? 'green.400' : 'gray.400',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      _hover: {
                        color: copied ? 'green.400' : 'purple.400',
                        bg: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      },
                    })}
                  >
                    <Copy className={css({ w: 3.5, h: 3.5 })} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 3,
                      py: 1.5,
                      rounded: 'md',
                      fontSize: 'xs',
                      fontWeight: 'medium',
                      color: 'gray.400',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      _hover: { color: 'red.400', bg: 'rgba(239, 68, 68, 0.1)' },
                    })}
                  >
                    <RotateCcw className={css({ w: 3.5, h: 3.5 })} />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Text Output */}
          <div
            className={css({
              w: 'full',
              minH: '96',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.900',
              p: 4,
              fontSize: 'sm',
              fontFamily: 'mono',
              color: 'gray.100',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
            })}
          >
            {generatedText || (
              <span className={css({ color: 'gray.500' })}>
                Generated text will appear here. Click "Generate Text" to start.
              </span>
            )}
          </div>

          {/* Statistics */}
          {stats && (
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' },
                gap: 3,
                p: 4,
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'rgba(17, 24, 39, 0.5)',
              })}
            >
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'purple.400' })}>
                  {stats.characters}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.500' })}>Characters</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'pink.400' })}>
                  {stats.charactersNoSpaces}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.500' })}>Chars (no spaces)</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'blue.400' })}>
                  {stats.words}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.500' })}>Words</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'cyan.400' })}>
                  {stats.sentences}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.500' })}>Sentences</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'green.400' })}>
                  {stats.paragraphs}
                </div>
                <div className={css({ fontSize: 'xs', color: 'gray.500' })}>Paragraphs</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div
        className={css({
          p: 6,
          rounded: 'xl',
          border: '1px solid',
          borderColor: 'gray.800',
          bg: 'rgba(17, 24, 39, 0.5)',
          spaceY: 4,
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.200' })}>
          💡 Tips
        </h3>
        <ul
          className={css({
            spaceY: 2,
            pl: 5,
            listStyleType: 'disc',
            color: 'gray.400',
            fontSize: 'sm',
          })}
        >
          <li>Use paragraphs for long-form content placeholders in designs</li>
          <li>Use sentences for shorter text blocks like captions or descriptions</li>
          <li>Use words for testing typography and character limits</li>
          <li>Enable HTML format to get text wrapped in {'<p>'} tags for easy copy-paste</li>
          <li>Disable "Start with Lorem ipsum" for more varied placeholder text</li>
        </ul>
      </div>
    </main>
  )
}
