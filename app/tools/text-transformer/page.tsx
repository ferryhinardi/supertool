'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Type,
  Copy,
  RotateCcw,
  Download,
  Check,
  CaseSensitive,
  CaseUpper,
  CaseLower,
  RemoveFormatting,
  ArrowUpDown,
  Eraser,
  Search,
  Replace,
  Minus,
  Hash,
  AlignLeft,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { trackEvent } from '@/lib/analytics'

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

export default function TextTransformerPage() {
  const [inputText, setInputText] = useState('')
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Track page visit
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'text_transformer',
      label: 'tool_opened',
    })
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
    <div className="container mx-auto max-w-7xl space-y-8 p-4 py-8 sm:p-6 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 backdrop-blur-sm">
          <Type className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-300">20+ Text Transformations</span>
        </div>

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Text Transformer & Counter
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Powerful text manipulation tool with case conversion, duplicate removal, word/character
          counting, sorting, trimming, and find-replace with regex support
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
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
              <CardContent className="p-4 text-center">
                <div
                  className={`mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-3xl font-bold text-transparent`}
                >
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Text Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-yellow-400" />
                    Text Input
                  </CardTitle>
                  <CardDescription>Enter or paste your text below</CardDescription>
                </div>
                <div className="flex gap-2">
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
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                className="min-h-[400px] font-mono text-base"
              />
            </CardContent>
          </Card>

          {/* Find & Replace */}
          <Card className="mt-6 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-400" />
                Find & Replace
              </CardTitle>
              <CardDescription>Search and replace text with regex support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Find</label>
                  <Input
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="Search text or regex pattern"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Replace with</label>
                  <Input
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replacement text"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
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
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Transformations
              </CardTitle>
              <CardDescription>Apply text transformations instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
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
              <div className="space-y-2">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
