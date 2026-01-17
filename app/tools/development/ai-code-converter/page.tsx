'use client'

import hljs from 'highlight.js'
import { ArrowRight, Check, Copy, Download, Info, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import 'highlight.js/styles/atom-one-dark.css'
import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  type ConversionOptions,
  type ConversionResponse,
  getLanguageById,
  getLanguageExtension,
  LANGUAGES,
} from './templates'

export default function AICodeConverterPage() {
  const [sourceCode, setSourceCode] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('javascript')
  const [targetLanguage, setTargetLanguage] = useState('python')
  const [convertedCode, setConvertedCode] = useState('')
  const [explanation, setExplanation] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Conversion options
  const [options, setOptions] = useState<ConversionOptions>({
    addComments: true,
    preserveStructure: false,
    optimizeCode: false,
  })

  const sourceCodeRef = useRef<HTMLPreElement>(null)
  const convertedCodeRef = useRef<HTMLPreElement>(null)

  // Track page open
  useEffect(() => {
    trackToolEvent('code_converter_open', { category: 'development' })
  }, [])

  // Apply syntax highlighting
  useEffect(() => {
    if (sourceCodeRef.current && sourceCode) {
      const sourceLang = getLanguageById(sourceLanguage)
      if (sourceLang) {
        const highlighted = hljs.highlight(sourceCode, {
          language: sourceLang.highlightLanguage,
        })
        sourceCodeRef.current.innerHTML = highlighted.value
      }
    }
  }, [sourceCode, sourceLanguage])

  useEffect(() => {
    if (convertedCodeRef.current && convertedCode) {
      const targetLang = getLanguageById(targetLanguage)
      if (targetLang) {
        const highlighted = hljs.highlight(convertedCode, {
          language: targetLang.highlightLanguage,
        })
        convertedCodeRef.current.innerHTML = highlighted.value
      }
    }
  }, [convertedCode, targetLanguage])

  const handleConvert = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter source code to convert')
      return
    }

    if (sourceLanguage === targetLanguage) {
      toast.error('Please select different source and target languages')
      return
    }

    setIsConverting(true)
    setConvertedCode('')
    setExplanation('')
    setWarnings([])

    try {
      trackToolEvent('code_converter_convert', {
        category: 'development',
        sourceLanguage,
        targetLanguage,
        codeLength: sourceCode.length,
      })

      const response = await fetch('/api/ai-code-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode,
          sourceLanguage,
          targetLanguage,
          options,
        }),
      })

      const data: ConversionResponse | { error: string } = await response.json()

      if (!response.ok) {
        throw new Error('error' in data ? data.error : 'Failed to convert code')
      }

      if ('convertedCode' in data) {
        setConvertedCode(data.convertedCode)
        setExplanation(data.explanation || '')
        setWarnings(data.warnings || [])
        toast.success('Code converted successfully!')

        trackToolEvent('code_converter_success', {
          category: 'development',
          sourceLanguage,
          targetLanguage,
        })
      }
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to convert code')

      trackToolEvent('code_converter_error', {
        category: 'development',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsConverting(false)
    }
  }

  const handleCopy = async () => {
    if (!convertedCode) {
      toast.error('No converted code to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(convertedCode)
      setCopied(true)
      toast.success('Converted code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)

      trackToolEvent('code_converter_copy', {
        category: 'development',
        targetLanguage,
      })
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    if (!convertedCode) {
      toast.error('No converted code to download')
      return
    }

    const targetLang = getLanguageById(targetLanguage)
    const extension = targetLang ? getLanguageExtension(targetLanguage) : '.txt'
    const fileName = `converted_code${extension}`

    const blob = new Blob([convertedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Downloaded as ${fileName}`)

    trackToolEvent('code_converter_download', {
      category: 'development',
      targetLanguage,
      format: extension,
    })
  }

  const swapLanguages = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
    setSourceCode(convertedCode)
    setConvertedCode('')

    trackToolEvent('code_converter_swap', {
      category: 'development',
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
      <div className={css({ textAlign: 'center', spaceY: '3' })}>
        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
          })}
        >
          <Sparkles className={css({ color: 'yellow.400', animation: 'pulse 2s infinite' })} />
          <span>AI Code Converter</span>
        </h1>
        <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
          Convert code between 12+ programming languages instantly with AI
        </p>
      </div>

      {/* Language Selection */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: '1fr auto 1fr' },
          gap: '4',
          alignItems: 'center',
        })}
      >
        {/* Source Language */}
        <div>
          <label
            htmlFor="source-language"
            className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.300',
              mb: '2',
            })}
          >
            From
          </label>
          <select
            id="source-language"
            value={sourceLanguage}
            onChange={(e) => {
              setSourceLanguage(e.target.value)
              trackToolEvent('code_converter_source_select', {
                category: 'development',
                language: e.target.value,
              })
            }}
            className={css({
              w: 'full',
              px: '4',
              py: '3',
              bg: 'rgba(17, 24, 39, 0.8)',
              border: '2px solid',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderRadius: 'xl',
              color: 'white',
              fontSize: 'base',
              fontWeight: 'medium',
              cursor: 'pointer',
              transition: 'all 0.2s',
              _hover: { borderColor: 'rgba(139, 92, 246, 0.5)' },
              _focus: {
                outline: 'none',
                borderColor: 'purple.500',
                boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
              },
            })}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={swapLanguages}
          className={css({
            display: { base: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            w: '12',
            h: '12',
            bg: 'rgba(139, 92, 246, 0.2)',
            border: '2px solid',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            borderRadius: 'full',
            color: 'purple.400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            mt: '8',
            _hover: {
              bg: 'rgba(139, 92, 246, 0.3)',
              transform: 'rotate(180deg)',
            },
          })}
          aria-label="Swap languages"
        >
          <ArrowRight className={css({ w: '6', h: '6' })} />
        </button>

        {/* Target Language */}
        <div>
          <label
            htmlFor="target-language"
            className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.300',
              mb: '2',
            })}
          >
            To
          </label>
          <select
            id="target-language"
            value={targetLanguage}
            onChange={(e) => {
              setTargetLanguage(e.target.value)
              trackToolEvent('code_converter_target_select', {
                category: 'development',
                language: e.target.value,
              })
            }}
            className={css({
              w: 'full',
              px: '4',
              py: '3',
              bg: 'rgba(17, 24, 39, 0.8)',
              border: '2px solid',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderRadius: 'xl',
              color: 'white',
              fontSize: 'base',
              fontWeight: 'medium',
              cursor: 'pointer',
              transition: 'all 0.2s',
              _hover: { borderColor: 'rgba(139, 92, 246, 0.5)' },
              _focus: {
                outline: 'none',
                borderColor: 'purple.500',
                boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
              },
            })}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversion Options */}
      <div
        className={css({
          p: '4',
          bg: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid',
          borderColor: 'rgba(139, 92, 246, 0.2)',
          borderRadius: 'xl',
        })}
      >
        <h3 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300', mb: '3' })}>
          Conversion Options
        </h3>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
            gap: '3',
          })}
        >
          <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <input
              type="checkbox"
              checked={options.addComments}
              onChange={(e) => {
                setOptions({ ...options, addComments: e.target.checked })
                trackToolEvent('code_converter_option_toggle', {
                  category: 'development',
                  option: 'addComments',
                  value: e.target.checked,
                })
              }}
              className={css({
                w: '4',
                h: '4',
                accentColor: 'purple.500',
                cursor: 'pointer',
              })}
            />
            <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Add Comments</span>
          </label>

          <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <input
              type="checkbox"
              checked={options.preserveStructure}
              onChange={(e) => {
                setOptions({ ...options, preserveStructure: e.target.checked })
                trackToolEvent('code_converter_option_toggle', {
                  category: 'development',
                  option: 'preserveStructure',
                  value: e.target.checked,
                })
              }}
              className={css({
                w: '4',
                h: '4',
                accentColor: 'purple.500',
                cursor: 'pointer',
              })}
            />
            <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Preserve Structure</span>
          </label>

          <label className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <input
              type="checkbox"
              checked={options.optimizeCode}
              onChange={(e) => {
                setOptions({ ...options, optimizeCode: e.target.checked })
                trackToolEvent('code_converter_option_toggle', {
                  category: 'development',
                  option: 'optimizeCode',
                  value: e.target.checked,
                })
              }}
              className={css({
                w: '4',
                h: '4',
                accentColor: 'purple.500',
                cursor: 'pointer',
              })}
            />
            <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Optimize Code</span>
          </label>
        </div>
      </div>

      {/* Code Editors */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: '4',
        })}
      >
        {/* Source Code */}
        <div>
          <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2' })}>
            <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              Source Code
            </span>
            <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
              {sourceCode.length} / 10,000 characters
            </span>
          </div>
          <div className={css({ position: 'relative' })}>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste your code here..."
              className={css({
                w: 'full',
                h: '96',
                p: '4',
                bg: 'rgba(17, 24, 39, 0.95)',
                border: '2px solid',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                borderRadius: 'xl',
                color: 'white',
                fontFamily: 'mono',
                fontSize: 'sm',
                resize: 'vertical',
                _focus: {
                  outline: 'none',
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                },
                _placeholder: {
                  color: 'gray.500',
                },
              })}
            />
          </div>
        </div>

        {/* Converted Code */}
        <div>
          <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2' })}>
            <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              Converted Code
            </span>
            {convertedCode && (
              <div className={css({ display: 'flex', gap: '2' })}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1',
                    px: '2',
                    py: '1',
                    fontSize: 'xs',
                    color: 'purple.400',
                    bg: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 'md',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'rgba(139, 92, 246, 0.2)',
                    },
                  })}
                >
                  {copied ? (
                    <Check className={css({ w: '3', h: '3' })} />
                  ) : (
                    <Copy className={css({ w: '3', h: '3' })} />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1',
                    px: '2',
                    py: '1',
                    fontSize: 'xs',
                    color: 'purple.400',
                    bg: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 'md',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'rgba(139, 92, 246, 0.2)',
                    },
                  })}
                >
                  <Download className={css({ w: '3', h: '3' })} />
                  Download
                </button>
              </div>
            )}
          </div>
          <div
            className={css({
              w: 'full',
              h: '96',
              p: '4',
              bg: 'rgba(17, 24, 39, 0.95)',
              border: '2px solid',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderRadius: 'xl',
              color: 'white',
              fontFamily: 'mono',
              fontSize: 'sm',
              overflowY: 'auto',
            })}
          >
            {isConverting ? (
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  h: 'full',
                  gap: '3',
                })}
              >
                <Loader2
                  className={css({
                    w: '8',
                    h: '8',
                    color: 'purple.400',
                    animation: 'spin 1s linear infinite',
                  })}
                />
                <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
                  Converting your code...
                </p>
              </div>
            ) : convertedCode ? (
              <pre
                ref={convertedCodeRef}
                className={css({ m: '0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' })}
              >
                {convertedCode}
              </pre>
            ) : (
              <p className={css({ color: 'gray.500', textAlign: 'center', mt: '20' })}>
                Converted code will appear here
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Convert Button */}
      <div className={css({ display: 'flex', justifyContent: 'center' })}>
        <button
          type="button"
          onClick={handleConvert}
          disabled={isConverting || !sourceCode.trim()}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: '8',
            py: '4',
            fontSize: 'lg',
            fontWeight: 'bold',
            color: 'white',
            bg: 'linear-gradient(to right, #8b5cf6, #ec4899)',
            border: 'none',
            borderRadius: 'xl',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
            _hover: {
              transform: 'translateY(-2px)',
              boxShadow: '0 15px 30px rgba(139, 92, 246, 0.4)',
            },
            _active: {
              transform: 'translateY(0)',
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
              transform: 'none',
            },
          })}
        >
          {isConverting ? (
            <>
              <Loader2 className={css({ w: '5', h: '5', animation: 'spin 1s linear infinite' })} />
              Converting...
            </>
          ) : (
            <>
              <Sparkles className={css({ w: '5', h: '5' })} />
              Convert Code
            </>
          )}
        </button>
      </div>

      {/* Explanation & Warnings */}
      {(explanation || warnings.length > 0) && (
        <div className={css({ spaceY: '4' })}>
          {explanation && (
            <div
              className={css({
                p: '4',
                bg: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderRadius: 'xl',
              })}
            >
              <h3
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'blue.400',
                  mb: '2',
                })}
              >
                <Info className={css({ w: '4', h: '4' })} />
                Explanation
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.300' })}>{explanation}</p>
            </div>
          )}

          {warnings.length > 0 && (
            <div
              className={css({
                p: '4',
                bg: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid',
                borderColor: 'rgba(251, 191, 36, 0.3)',
                borderRadius: 'xl',
              })}
            >
              <h3
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'yellow.400',
                  mb: '2',
                })}
              >
                <Info className={css({ w: '4', h: '4' })} />
                Warnings
              </h3>
              <ul className={css({ listStyleType: 'disc', pl: '5', spaceY: '1' })}>
                {warnings.map((warning, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: warnings are static strings without unique identifiers
                  <li key={index} className={css({ fontSize: 'sm', color: 'gray.300' })}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Pro Tips */}
      <div
        className={css({
          p: '4',
          bg: 'rgba(139, 92, 246, 0.05)',
          border: '1px solid',
          borderColor: 'rgba(139, 92, 246, 0.2)',
          borderRadius: 'xl',
        })}
      >
        <h3
          className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.400', mb: '3' })}
        >
          💡 Pro Tips
        </h3>
        <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
          <li>• Use "Add Comments" for detailed explanations of complex conversions</li>
          <li>• Enable "Preserve Structure" to keep the original code organization</li>
          <li>• Try "Optimize Code" to get performance improvements in the target language</li>
          <li>• Maximum code length: 10,000 characters</li>
          <li>• AI may take 5-15 seconds to convert complex code</li>
        </ul>
      </div>
    </main>
  )
}
