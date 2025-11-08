'use client'

import { motion } from 'framer-motion'
import {
  AlignLeft,
  ArrowUpDown,
  CaseLower,
  CaseSensitive,
  CaseUpper,
  Check,
  Copy,
  Download,
  Eraser,
  Hash,
  Minus,
  RemoveFormatting,
  Replace,
  RotateCcw,
  Search,
  Sparkles,
  Type,
} from 'lucide-react'
import { parseAsBoolean, parseAsString, useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { trackEvent, trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

export const dynamic = 'force-dynamic'

type TransformOperation =
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'sentencecase'
  | 'camelcase'
  | 'pascalcase'
  | 'snakecase'
  | 'kebabcase'
  | 'reverse'
  | 'removeDuplicateLines'
  | 'removeEmptyLines'
  | 'sortAsc'
  | 'sortDesc'
  | 'trimLines'
  | 'trimAll'
  | 'removeExtraSpaces'
  | 'addLineNumbers'
  | 'removeLineNumbers'

interface TransformButton {
  id: TransformOperation
  label: string
  icon: React.ElementType
  category: 'case' | 'clean' | 'sort' | 'modify'
  description: string
}

const transformButtons: TransformButton[] = [
  // Case transformations
  {
    id: 'uppercase',
    label: 'UPPERCASE',
    icon: CaseUpper,
    category: 'case',
    description: 'Convert all text to uppercase',
  },
  {
    id: 'lowercase',
    label: 'lowercase',
    icon: CaseLower,
    category: 'case',
    description: 'Convert all text to lowercase',
  },
  {
    id: 'titlecase',
    label: 'Title Case',
    icon: CaseSensitive,
    category: 'case',
    description: 'Capitalize First Letter Of Each Word',
  },
  {
    id: 'sentencecase',
    label: 'Sentence case',
    icon: CaseSensitive,
    category: 'case',
    description: 'Capitalize first letter of each sentence',
  },
  {
    id: 'camelcase',
    label: 'camelCase',
    icon: Type,
    category: 'case',
    description: 'Convert to camelCase format',
  },
  {
    id: 'pascalcase',
    label: 'PascalCase',
    icon: Type,
    category: 'case',
    description: 'Convert to PascalCase format',
  },
  {
    id: 'snakecase',
    label: 'snake_case',
    icon: Minus,
    category: 'case',
    description: 'Convert to snake_case format',
  },
  {
    id: 'kebabcase',
    label: 'kebab-case',
    icon: Minus,
    category: 'case',
    description: 'Convert to kebab-case format',
  },

  // Clean operations
  {
    id: 'removeDuplicateLines',
    label: 'Remove Duplicates',
    icon: RemoveFormatting,
    category: 'clean',
    description: 'Remove duplicate lines',
  },
  {
    id: 'removeEmptyLines',
    label: 'Remove Empty Lines',
    icon: RemoveFormatting,
    category: 'clean',
    description: 'Remove all empty lines',
  },
  {
    id: 'trimLines',
    label: 'Trim Lines',
    icon: Eraser,
    category: 'clean',
    description: 'Remove leading/trailing spaces from each line',
  },
  {
    id: 'trimAll',
    label: 'Trim All',
    icon: Eraser,
    category: 'clean',
    description: 'Remove all leading/trailing whitespace',
  },
  {
    id: 'removeExtraSpaces',
    label: 'Remove Extra Spaces',
    icon: RemoveFormatting,
    category: 'clean',
    description: 'Replace multiple spaces with single space',
  },

  // Sort operations
  {
    id: 'sortAsc',
    label: 'Sort A→Z',
    icon: ArrowUpDown,
    category: 'sort',
    description: 'Sort lines alphabetically ascending',
  },
  {
    id: 'sortDesc',
    label: 'Sort Z→A',
    icon: ArrowUpDown,
    category: 'sort',
    description: 'Sort lines alphabetically descending',
  },

  // Modify operations
  {
    id: 'reverse',
    label: 'Reverse Text',
    icon: RotateCcw,
    category: 'modify',
    description: 'Reverse character order',
  },
  {
    id: 'addLineNumbers',
    label: 'Add Line Numbers',
    icon: Hash,
    category: 'modify',
    description: 'Add line numbers to each line',
  },
  {
    id: 'removeLineNumbers',
    label: 'Remove Line Numbers',
    icon: Hash,
    category: 'modify',
    description: 'Remove line numbers from text',
  },
]

const faqs = [
  {
    question: 'What text transformations are available in this tool?',
    answer:
      'Our tool offers 20+ text transformations including: case conversions (UPPERCASE, lowercase, Title Case, Sentence case), programming formats (camelCase, PascalCase, snake_case, kebab-case), text operations (reverse, remove spaces, trim whitespace), sorting (alphabetical, reverse), duplicate removal, word/character counting, find and replace with regex support, and more.',
  },
  {
    question: 'How do I convert text to camelCase or snake_case?',
    answer:
      'Simply paste your text and select the desired format. For camelCase, spaces and special characters are removed with each word capitalized except the first (e.g., "hello world" becomes "helloWorld"). For snake_case, spaces are replaced with underscores and text is lowercased (e.g., "Hello World" becomes "hello_world"). Perfect for programming variable names.',
  },
  {
    question: 'Can I remove duplicate lines from my text?',
    answer:
      'Yes! Use the "Remove Duplicates" transformation to eliminate duplicate lines while preserving the original order. This is useful for cleaning up lists, removing redundant entries from logs, or deduplicating data exports. The tool performs case-sensitive comparison and preserves the first occurrence of each unique line.',
  },
  {
    question: 'Does the tool support find and replace with regular expressions?',
    answer:
      'Yes, our advanced find and replace feature supports full regex pattern matching. Use regex flags for case-insensitive search, multiline mode, and global replacement. This enables powerful text manipulation like removing patterns, extracting data, or reformatting complex text structures with precision.',
  },
  {
    question: 'Can I see word count and character count for my text?',
    answer:
      'Absolutely! The tool displays real-time statistics including total characters, characters without spaces, word count, line count, and sentence count. This is helpful for writers checking content length, students meeting assignment requirements, or developers analyzing text data before processing.',
  },
]

function TextTransformerContent() {
  const [inputText, setInputText] = useQueryState('text', { defaultValue: '' })
  const [findText, setFindText] = useQueryState('find', { defaultValue: '' })
  const [replaceText, setReplaceText] = useQueryState('replace', { defaultValue: '' })
  const [useRegex, setUseRegex] = useQueryState('regex', parseAsBoolean.withDefault(false))
  const [caseSensitive, setCaseSensitive] = useQueryState('case', parseAsBoolean.withDefault(false))
  const [selectedCategory, setSelectedCategory] = useQueryState(
    'category',
    parseAsString.withDefault('all')
  )
  const [copied, setCopied] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('text_transformer_open', {})
  }, [])

  // Text statistics
  const stats = useMemo(() => {
    const chars = inputText.length
    const charsNoSpaces = inputText.replace(/\s/g, '').length
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0
    const lines = inputText ? inputText.split('\n').length : 0
    const sentences = inputText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const paragraphs = inputText.split(/\n\n+/).filter((p) => p.trim().length > 0).length

    return { chars, charsNoSpaces, words, lines, sentences, paragraphs }
  }, [inputText])

  // Transform functions
  const transformText = (operation: TransformOperation): string => {
    if (!inputText) return ''

    switch (operation) {
      case 'uppercase':
        return inputText.toUpperCase()

      case 'lowercase':
        return inputText.toLowerCase()

      case 'titlecase':
        return inputText.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
        )

      case 'sentencecase':
        return inputText.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())

      case 'camelcase':
        return inputText
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, '')

      case 'pascalcase':
        return inputText
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '')

      case 'snakecase':
        return inputText
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map((word) => word.toLowerCase())
          .join('_')

      case 'kebabcase':
        return inputText
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map((word) => word.toLowerCase())
          .join('-')

      case 'reverse':
        return inputText.split('').reverse().join('')

      case 'removeDuplicateLines': {
        const lines = inputText.split('\n')
        const uniqueLines = [...new Set(lines)]
        return uniqueLines.join('\n')
      }

      case 'removeEmptyLines':
        return inputText
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .join('\n')

      case 'sortAsc':
        return inputText.split('\n').sort().join('\n')

      case 'sortDesc':
        return inputText.split('\n').sort().reverse().join('\n')

      case 'trimLines':
        return inputText
          .split('\n')
          .map((line) => line.trim())
          .join('\n')

      case 'trimAll':
        return inputText.trim()

      case 'removeExtraSpaces':
        return inputText.replace(/\s+/g, ' ')

      case 'addLineNumbers':
        return inputText
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n')

      case 'removeLineNumbers':
        return inputText
          .split('\n')
          .map((line) => line.replace(/^\d+\.\s*/, ''))
          .join('\n')

      default:
        return inputText
    }
  }

  const handleTransform = (operation: TransformOperation) => {
    const transformed = transformText(operation)
    setInputText(transformed)

    trackEvent({
      action: 'text_transformed',
      category: 'text_transformer',
      label: operation,
    })
  }

  const handleFindReplace = () => {
    if (!findText) return

    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(findText, flags)
        setInputText(inputText.replace(regex, replaceText))
      } else {
        const regex = new RegExp(
          findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          caseSensitive ? 'g' : 'gi'
        )
        setInputText(inputText.replace(regex, replaceText))
      }

      trackEvent({
        action: 'text_find_replace',
        category: 'text_transformer',
        label: useRegex ? 'regex' : 'text',
      })
    } catch (error) {
      console.error('Invalid regex pattern:', error)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    trackEvent({
      action: 'text_copied',
      category: 'text_transformer',
      label: 'copy_to_clipboard',
      value: inputText.length,
    })
  }

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transformed-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackEvent({
      action: 'text_downloaded',
      category: 'text_transformer',
      label: 'download_file',
      value: inputText.length,
    })
  }

  const handleReset = () => {
    setInputText('')
    setFindText('')
    setReplaceText('')
    setUseRegex(false)
    setCaseSensitive(false)
    setSelectedCategory('all')
  }

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'case', label: 'Case', icon: CaseSensitive },
    { id: 'clean', label: 'Clean', icon: Eraser },
    { id: 'sort', label: 'Sort', icon: ArrowUpDown },
    { id: 'modify', label: 'Modify', icon: AlignLeft },
  ]

  const filteredButtons =
    selectedCategory === 'all'
      ? transformButtons
      : transformButtons.filter((btn) => btn.category === selectedCategory)

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ spaceY: '4', textAlign: 'center' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'yellow.500/20',
            bg: 'yellow.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <Type className={css({ h: '5', w: '5', color: 'yellow.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'yellow.300' })}>
            20+ Text Transformations
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
              gradientFrom: 'yellow.400',
              gradientVia: 'orange.400',
              gradientTo: 'red.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Text Transformer & Counter
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
          Powerful text manipulation tool with case conversion, duplicate removal, word/character
          counting, sorting, trimming, and find-replace with regex support
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        })}
      >
        {[
          { label: 'Characters', value: stats.chars, from: 'purple.500', to: 'pink.500' },
          {
            label: 'No Spaces',
            value: stats.charsNoSpaces,
            from: 'pink.500',
            to: 'rose.500',
          },
          { label: 'Words', value: stats.words, from: 'blue.500', to: 'cyan.500' },
          { label: 'Lines', value: stats.lines, from: 'green.500', to: 'emerald.500' },
          { label: 'Sentences', value: stats.sentences, from: 'orange.500', to: 'red.500' },
          {
            label: 'Paragraphs',
            value: stats.paragraphs,
            from: 'yellow.500',
            to: 'amber.500',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
                backdropFilter: 'blur(4px)',
              })}
            >
              <CardContent>
                <div
                  className={css({
                    p: '4',
                    textAlign: 'center',
                  })}
                >
                  <div
                    className={css({
                      mb: '2',
                      bgGradient: 'to-r',
                      gradientFrom: stat.from,
                      gradientTo: stat.to,
                      bgClip: 'text',
                      color: 'transparent',
                      fontSize: '3xl',
                      fontWeight: 'bold',
                    })}
                    style={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <div className={css({ fontSize: 'xs', color: 'gray.400' })}>{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
        })}
      >
        {/* Main Text Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({ gridColumn: { lg: 'span 2' } })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '4',
                  })}
                >
                  <div>
                    <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <Type className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                      Text Input
                    </CardTitle>
                    <CardDescription>Enter or paste your text below</CardDescription>
                  </div>
                  <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!inputText}
                      className={css({ gap: '2' })}
                    >
                      {copied ? (
                        <>
                          <Check className={css({ h: '4', w: '4' })} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className={css({ h: '4', w: '4' })} />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!inputText}
                      className={css({ gap: '2' })}
                    >
                      <Download className={css({ h: '4', w: '4' })} />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!inputText}
                      className={css({ gap: '2' })}
                    >
                      <RotateCcw className={css({ h: '4', w: '4' })} />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Start typing or paste your text here..."
                  className={css({
                    minH: '[400px]',
                    fontFamily: 'mono',
                    fontSize: 'base',
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Find & Replace */}
          <Card
            className={css({
              mt: '6',
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Search className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  Find & Replace
                </CardTitle>
                <CardDescription>Search and replace text with regex support</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gap: '4',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    w: 'full',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="find-text"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
                      Find
                    </label>
                    <Input
                      id="find-text"
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      placeholder="Search text or regex pattern"
                      className={css({ fontFamily: 'mono' })}
                    />
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="replace-text"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                    >
                      Replace with
                    </label>
                    <Input
                      id="replace-text"
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      placeholder="Replacement text"
                      className={css({ fontFamily: 'mono' })}
                    />
                  </div>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '4',
                  })}
                >
                  <label
                    className={css({
                      display: 'flex',
                      cursor: 'pointer',
                      alignItems: 'center',
                      gap: '2',
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={useRegex}
                      onChange={(e) => setUseRegex(e.target.checked)}
                      className={css({
                        h: '4',
                        w: '4',
                        rounded: 'default',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        color: 'blue.500',
                        _focus: {
                          ring: '2',
                          ringColor: 'blue.500',
                          ringOffset: '0',
                        },
                      })}
                    />
                    <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Use Regex</span>
                  </label>
                  <label
                    className={css({
                      display: 'flex',
                      cursor: 'pointer',
                      alignItems: 'center',
                      gap: '2',
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className={css({
                        h: '4',
                        w: '4',
                        rounded: 'default',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                        color: 'blue.500',
                        _focus: {
                          ring: '2',
                          ringColor: 'blue.500',
                          ringOffset: '0',
                        },
                      })}
                    />
                    <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                      Case Sensitive
                    </span>
                  </label>
                  <Button
                    onClick={handleFindReplace}
                    disabled={!findText || !inputText}
                    className={css({
                      gap: '2',
                      bg: 'blue.600',
                      _hover: {
                        bg: 'blue.700',
                      },
                    })}
                  >
                    <Replace className={css({ h: '4', w: '4' })} />
                    Replace All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transform Operations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Sparkles className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                  Transformations
                </CardTitle>
                <CardDescription>Apply text transformations instantly</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
                {/* Category Filter */}
                <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = selectedCategory === cat.id
                    return (
                      <Button
                        key={cat.id}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={css({
                          gap: '1.5',
                          border: '1px solid',
                          borderColor: isSelected ? 'yellow.500/50' : 'gray.700',
                          bg: isSelected ? 'yellow.500/20' : 'transparent',
                          color: isSelected ? 'yellow.200' : 'inherit',
                        })}
                      >
                        <Icon className={css({ h: '3.5', w: '3.5' })} />
                        {cat.label}
                      </Button>
                    )
                  })}
                </div>

                {/* Transform Buttons */}
                <div className={css({ spaceY: '2' })}>
                  {filteredButtons.map((btn) => {
                    const Icon = btn.icon
                    return (
                      <Button
                        key={btn.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransform(btn.id)}
                        disabled={!inputText}
                        className={css({
                          w: 'full',
                          justifyContent: 'start',
                          gap: '2',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          _hover: {
                            borderColor: 'yellow.500/50',
                            bg: 'yellow.500/10',
                          },
                        })}
                        title={btn.description}
                      >
                        <Icon className={css({ h: '4', w: '4', color: 'gray.400' })} />
                        <span className={css({ flex: '1', textAlign: 'left' })}>{btn.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/text-transformer" category="productivity" />
      <ToolRating toolId="/tools/text-transformer" toolName="Text Transformer" />
    </main>
  )
}

export default function TextTransformerPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: 'flex',
            h: 'screen',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <div className={css({ color: 'gray.400' })}>Loading...</div>
        </div>
      }
    >
      <TextTransformerContent />
    </Suspense>
  )
}
