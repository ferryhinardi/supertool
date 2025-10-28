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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
          <Type className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-300">20+ Text Transformations</span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
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
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        {[
          { label: 'Characters', value: stats.chars, gradient: 'from-purple-500 to-pink-500' },
          {
            label: 'No Spaces',
            value: stats.charsNoSpaces,
            gradient: 'from-pink-500 to-rose-500',
          },
          { label: 'Words', value: stats.words, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Lines', value: stats.lines, gradient: 'from-green-500 to-emerald-500' },
          { label: 'Sentences', value: stats.sentences, gradient: 'from-orange-500 to-red-500' },
          {
            label: 'Paragraphs',
            value: stats.paragraphs,
            gradient: 'from-yellow-500 to-amber-500',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardContent>
                <div
                  className={css({
                    p: '4',
                    textAlign: 'center',
                  })}
                >
                  <div
                    className={`mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-3xl font-bold text-transparent`}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
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
          gridTemplateColumns: { base: '1', lg: 'repeat(3, 1fr)' },
        })}
      >
        {/* Main Text Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({ gridColumn: { lg: 'span 2' } })}
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
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
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5 text-yellow-400" />
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
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!inputText}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!inputText}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
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
                  className="min-h-[400px] font-mono text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Find & Replace */}
          <Card
            className={css({
              mt: '6',
              border: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-400" />
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
                    gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)' },
                  })}
                >
                  <div className="space-y-2">
                    <label htmlFor="find-text" className="text-sm font-medium text-gray-300">
                      Find
                    </label>
                    <Input
                      id="find-text"
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      placeholder="Search text or regex pattern"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="replace-text" className="text-sm font-medium text-gray-300">
                      Replace with
                    </label>
                    <Input
                      id="replace-text"
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      placeholder="Replacement text"
                      className="font-mono"
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
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useRegex}
                      onChange={(e) => setUseRegex(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">Use Regex</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">Case Sensitive</span>
                  </label>
                  <Button
                    onClick={handleFindReplace}
                    disabled={!findText || !inputText}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Replace className="h-4 w-4" />
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
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
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
                    return (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`gap-1.5 ${
                          selectedCategory === cat.id
                            ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-200'
                            : 'border-gray-700'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
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
                        className="w-full justify-start gap-2 border-gray-700 hover:border-yellow-500/50 hover:bg-yellow-500/10"
                        title={btn.description}
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-left">{btn.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}

export default function TextTransformerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextTransformerContent />
    </Suspense>
  )
}
