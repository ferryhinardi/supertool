'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface KeywordData {
  keyword: string
  count: number
  density: number
}

interface AnalysisResult {
  totalWords: number
  totalCharacters: number
  uniqueWords: number
  keywords: KeywordData[]
  twoWordPhrases: KeywordData[]
  threeWordPhrases: KeywordData[]
  seoScore: number
  warnings: string[]
  recommendations: string[]
}

function analyzeText(text: string): AnalysisResult {
  // Clean and tokenize text
  const cleanText = text.toLowerCase().trim()
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0)
  const totalWords = words.length
  const totalCharacters = text.length

  // Stop words to exclude from keyword analysis
  const stopWords = new Set([
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'i',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'this',
    'but',
    'his',
    'by',
    'from',
    'they',
    'we',
    'say',
    'her',
    'she',
    'or',
    'an',
    'will',
    'my',
    'one',
    'all',
    'would',
    'there',
    'their',
    'what',
    'so',
    'up',
    'out',
    'if',
    'about',
    'who',
    'get',
    'which',
    'go',
    'me',
    'when',
    'make',
    'can',
    'like',
    'time',
    'no',
    'just',
    'him',
    'know',
    'take',
    'people',
    'into',
    'year',
    'your',
    'good',
    'some',
    'could',
    'them',
    'see',
    'other',
    'than',
    'then',
    'now',
    'look',
    'only',
    'come',
    'its',
    'over',
    'think',
    'also',
    'back',
    'after',
    'use',
    'two',
    'how',
    'our',
    'work',
    'first',
    'well',
    'way',
    'even',
    'new',
    'want',
    'because',
    'any',
    'these',
    'give',
    'day',
    'most',
    'us',
    'is',
    'was',
    'are',
    'been',
    'has',
    'had',
    'were',
    'said',
    'did',
    'having',
    'may',
    'should',
  ])

  // Count single word frequencies (excluding stop words)
  const wordFreq = new Map<string, number>()
  const allWordsFreq = new Map<string, number>()

  for (const word of words) {
    // Remove punctuation
    const cleanWord = word.replace(/[^\w]/g, '')
    if (cleanWord.length === 0) continue

    // Track all words for total count
    allWordsFreq.set(cleanWord, (allWordsFreq.get(cleanWord) || 0) + 1)

    // Track meaningful words for keyword analysis
    if (!stopWords.has(cleanWord) && cleanWord.length > 2) {
      wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1)
    }
  }

  const uniqueWords = allWordsFreq.size

  // Calculate density for single words
  const keywords: KeywordData[] = Array.from(wordFreq.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: (count / totalWords) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Two-word phrases
  const twoWordFreq = new Map<string, number>()
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i].replace(/[^\w]/g, '')
    const word2 = words[i + 1].replace(/[^\w]/g, '')
    if (word1.length > 2 && word2.length > 2) {
      const phrase = `${word1} ${word2}`
      twoWordFreq.set(phrase, (twoWordFreq.get(phrase) || 0) + 1)
    }
  }

  const twoWordPhrases: KeywordData[] = Array.from(twoWordFreq.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: (count / (totalWords - 1)) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Three-word phrases
  const threeWordFreq = new Map<string, number>()
  for (let i = 0; i < words.length - 2; i++) {
    const word1 = words[i].replace(/[^\w]/g, '')
    const word2 = words[i + 1].replace(/[^\w]/g, '')
    const word3 = words[i + 2].replace(/[^\w]/g, '')
    if (word1.length > 2 && word2.length > 2 && word3.length > 2) {
      const phrase = `${word1} ${word2} ${word3}`
      threeWordFreq.set(phrase, (threeWordFreq.get(phrase) || 0) + 1)
    }
  }

  const threeWordPhrases: KeywordData[] = Array.from(threeWordFreq.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: (count / (totalWords - 2)) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // SEO Analysis
  const warnings: string[] = []
  const recommendations: string[] = []
  let seoScore = 100

  // Check for keyword stuffing
  const highDensityKeywords = keywords.filter((k) => k.density > 5)
  if (highDensityKeywords.length > 0) {
    warnings.push(
      `Keyword stuffing detected: "${highDensityKeywords[0].keyword}" appears ${highDensityKeywords.length} times (${highDensityKeywords[0].density.toFixed(2)}% density). Aim for 2-5% for main keywords.`
    )
    seoScore -= 20
  }

  // Check content length
  if (totalWords < 300) {
    warnings.push(
      `Content is too short (${totalWords} words). Aim for at least 300 words for better SEO.`
    )
    seoScore -= 15
  } else if (totalWords > 2000) {
    recommendations.push(
      'Long-form content detected. Consider breaking it into sections for better readability.'
    )
  }

  // Check keyword diversity
  if (uniqueWords < totalWords * 0.3) {
    warnings.push(
      'Low keyword diversity. Using more varied vocabulary can improve SEO and readability.'
    )
    seoScore -= 10
  }

  // Recommendations
  if (keywords.length > 0 && keywords[0].density < 2) {
    recommendations.push(
      `Main keyword "${keywords[0].keyword}" has low density (${keywords[0].density.toFixed(2)}%). Consider using it more naturally throughout your content.`
    )
  }

  if (twoWordPhrases.length > 0) {
    recommendations.push(
      `Top phrase: "${twoWordPhrases[0].keyword}" appears ${twoWordPhrases[0].count} times. Use related phrases to improve topic coverage.`
    )
  }

  if (warnings.length === 0 && totalWords >= 300) {
    recommendations.push('Content looks well-optimized! Keep monitoring keyword distribution.')
  }

  return {
    totalWords,
    totalCharacters,
    uniqueWords,
    keywords,
    twoWordPhrases,
    threeWordPhrases,
    seoScore: Math.max(0, seoScore),
    warnings,
    recommendations,
  }
}

function KeywordDensityContent() {
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('keyword_density_open', {})
  }, [])

  // Analyze text
  const handleAnalyze = () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    const result = analyzeText(text)
    setAnalysis(result)
    toast.success('Analysis complete!')

    trackToolEvent('keyword_density_analyze', {
      word_count: result.totalWords,
      keyword_count: result.keywords.length,
    })
  }

  // Clear all
  const handleClear = () => {
    setText('')
    setAnalysis(null)
    toast.success('Cleared')

    trackToolEvent('keyword_density_clear', {})
  }

  // Copy results as text
  const handleCopy = () => {
    if (!analysis) return

    let copyText = `KEYWORD DENSITY ANALYSIS\n\n`
    copyText += `Total Words: ${analysis.totalWords}\n`
    copyText += `Unique Words: ${analysis.uniqueWords}\n`
    copyText += `SEO Score: ${analysis.seoScore}/100\n\n`
    copyText += `TOP KEYWORDS:\n`
    analysis.keywords.slice(0, 10).forEach((k, i) => {
      copyText += `${i + 1}. ${k.keyword} - ${k.count} times (${k.density.toFixed(2)}%)\n`
    })

    navigator.clipboard.writeText(copyText)
    toast.success('Copied to clipboard!')

    trackToolEvent('keyword_density_copy', {})
  }

  // Export as CSV
  const handleExport = () => {
    if (!analysis) return

    let csv = 'Type,Keyword/Phrase,Count,Density (%)\n'

    analysis.keywords.forEach((k) => {
      csv += `Single Word,"${k.keyword}",${k.count},${k.density.toFixed(2)}\n`
    })

    analysis.twoWordPhrases.forEach((k) => {
      csv += `Two Words,"${k.keyword}",${k.count},${k.density.toFixed(2)}\n`
    })

    analysis.threeWordPhrases.forEach((k) => {
      csv += `Three Words,"${k.keyword}",${k.count},${k.density.toFixed(2)}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-density-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Exported as CSV!')

    trackToolEvent('keyword_density_export', {})
  }

  // Calculate max count for bar chart scaling
  const maxCount = useMemo(() => {
    if (!analysis || analysis.keywords.length === 0) return 1
    return Math.max(...analysis.keywords.map((k) => k.count))
  }, [analysis])

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
            borderColor: 'orange.500/30',
            bg: 'orange.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <BarChart3 className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            SEO Optimization Tool
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'red.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Keyword Density Analyzer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Analyze keyword usage and density in your content for SEO optimization. Track keyword
          frequency, identify overuse, and get suggestions for better content balance.
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Enter Your Content</CardTitle>
            <CardDescription>Paste your text or content to analyze keyword density</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ spaceY: '2' })}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your content here... (minimum 100 characters for meaningful analysis)"
                className={css({
                  w: 'full',
                  minH: '64',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  px: '4',
                  py: '3',
                  fontSize: 'base',
                  color: 'gray.200',
                  resize: 'vertical',
                  transition: 'all 0.2s',
                  _placeholder: { color: 'gray.500' },
                  _focus: {
                    outline: 'none',
                    borderColor: 'orange.500',
                    ring: '2px',
                    ringColor: 'orange.500/20',
                  },
                })}
              />
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <span className={css({ fontSize: 'sm', color: 'gray.500' })}>
                  {text.length} characters •{' '}
                  {
                    text
                      .trim()
                      .split(/\s+/)
                      .filter((w) => w).length
                  }{' '}
                  words
                </span>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={handleClear}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'gray.400',
                      _hover: { bg: 'gray.700', color: 'red.400' },
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                    Clear
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!text.trim()}
                    className={css({
                      gap: '2',
                      bg: 'orange.500',
                      color: 'white',
                      _hover: { bg: 'orange.600' },
                      _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                    })}
                  >
                    <TrendingUp className={css({ h: '4', w: '4' })} />
                    Analyze
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {analysis && (
        <>
          {/* SEO Score & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: '4',
              })}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor:
                    analysis.seoScore >= 80
                      ? 'green.500/20'
                      : analysis.seoScore >= 60
                        ? 'yellow.500/20'
                        : 'red.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '6', textAlign: 'center' })}>
                  <div
                    className={css({
                      fontSize: '3xl',
                      fontWeight: 'bold',
                      color:
                        analysis.seoScore >= 80
                          ? 'green.400'
                          : analysis.seoScore >= 60
                            ? 'yellow.400'
                            : 'red.400',
                    })}
                  >
                    {analysis.seoScore}
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                    SEO Score
                  </div>
                </CardContent>
              </Card>

              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'blue.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '6', textAlign: 'center' })}>
                  <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.400' })}>
                    {analysis.totalWords}
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                    Total Words
                  </div>
                </CardContent>
              </Card>

              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'purple.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '6', textAlign: 'center' })}>
                  <div
                    className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'purple.400' })}
                  >
                    {analysis.uniqueWords}
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                    Unique Words
                  </div>
                </CardContent>
              </Card>

              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'cyan.500/20',
                  bg: 'gray.900/50',
                })}
              >
                <CardContent className={css({ pt: '6', textAlign: 'center' })}>
                  <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'cyan.400' })}>
                    {((analysis.uniqueWords / analysis.totalWords) * 100).toFixed(1)}%
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                    Diversity
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Warnings & Recommendations */}
          {(analysis.warnings.length > 0 || analysis.recommendations.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: '1fr' },
                gap: '4',
              })}
            >
              {analysis.warnings.length > 0 && (
                <Card
                  className={css({
                    border: '1px solid',
                    borderColor: 'red.500/20',
                    bg: 'red.500/5',
                  })}
                >
                  <CardHeader>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <AlertTriangle className={css({ h: '5', w: '5', color: 'red.400' })} />
                      <CardTitle className={css({ color: 'red.400' })}>Warnings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.300' })}>
                      {analysis.warnings.map((warning) => (
                        <li key={warning}>• {warning}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.recommendations.length > 0 && (
                <Card
                  className={css({
                    border: '1px solid',
                    borderColor: 'green.500/20',
                    bg: 'green.500/5',
                  })}
                >
                  <CardHeader>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                      <CardTitle className={css({ color: 'green.400' })}>Recommendations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.300' })}>
                      {analysis.recommendations.map((rec) => (
                        <li key={rec}>• {rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Top Keywords */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'orange.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <div>
                    <CardTitle>Top Keywords</CardTitle>
                    <CardDescription>
                      Most frequent words (excluding common stop words)
                    </CardDescription>
                  </div>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'gray.400',
                        _hover: { bg: 'gray.700', color: 'blue.400' },
                      })}
                    >
                      <Copy className={css({ h: '4', w: '4' })} />
                      Copy
                    </Button>
                    <Button
                      onClick={handleExport}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'orange.500',
                        color: 'white',
                        _hover: { bg: 'orange.600' },
                      })}
                    >
                      <Download className={css({ h: '4', w: '4' })} />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ spaceY: '3' })}>
                  {analysis.keywords.slice(0, 10).map((keyword, index) => (
                    <div key={keyword.keyword} className={css({ spaceY: '1' })}>
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        })}
                      >
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                          <Badge
                            className={css({
                              bg: 'orange.500/20',
                              color: 'orange.300',
                              minW: '8',
                              justifyContent: 'center',
                            })}
                          >
                            {index + 1}
                          </Badge>
                          <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                            {keyword.keyword}
                          </span>
                        </div>
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
                          <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                            {keyword.count} times
                          </span>
                          <Badge
                            className={css({
                              bg:
                                keyword.density > 5
                                  ? 'red.500/20'
                                  : keyword.density > 2
                                    ? 'green.500/20'
                                    : 'yellow.500/20',
                              color:
                                keyword.density > 5
                                  ? 'red.300'
                                  : keyword.density > 2
                                    ? 'green.300'
                                    : 'yellow.300',
                            })}
                          >
                            {keyword.density.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                      {/* Bar Chart */}
                      <div
                        className={css({
                          w: 'full',
                          h: '2',
                          rounded: 'full',
                          bg: 'gray.800',
                          overflow: 'hidden',
                        })}
                      >
                        <div
                          className={css({
                            h: 'full',
                            rounded: 'full',
                            bg:
                              keyword.density > 5
                                ? 'red.500'
                                : keyword.density > 2
                                  ? 'green.500'
                                  : 'yellow.500',
                            transition: 'width 0.5s ease-in-out',
                          })}
                          style={{ width: `${(keyword.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Two-Word Phrases */}
          {analysis.twoWordPhrases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'blue.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>Top Two-Word Phrases</CardTitle>
                  <CardDescription>Most frequent keyword combinations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: {
                        base: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: '3',
                    })}
                  >
                    {analysis.twoWordPhrases.slice(0, 9).map((phrase) => (
                      <div
                        key={phrase.keyword}
                        className={css({
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '3',
                        })}
                      >
                        <div className={css({ fontSize: 'sm', fontWeight: 'medium', mb: '1' })}>
                          {phrase.keyword}
                        </div>
                        <div
                          className={css({
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 'xs',
                            color: 'gray.400',
                          })}
                        >
                          <span>{phrase.count} times</span>
                          <span>{phrase.density.toFixed(2)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Three-Word Phrases */}
          {analysis.threeWordPhrases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'purple.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>Top Three-Word Phrases</CardTitle>
                  <CardDescription>Longer keyword sequences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={css({ spaceY: '2' })}>
                    {analysis.threeWordPhrases.slice(0, 6).map((phrase, index) => (
                      <div
                        key={phrase.keyword}
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '3',
                        })}
                      >
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                          <Badge
                            className={css({
                              bg: 'purple.500/20',
                              color: 'purple.300',
                              minW: '6',
                              justifyContent: 'center',
                            })}
                          >
                            {index + 1}
                          </Badge>
                          <span className={css({ fontSize: 'sm' })}>{phrase.keyword}</span>
                        </div>
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                          <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                            {phrase.count}x
                          </span>
                          <span className={css({ fontSize: 'sm', color: 'purple.400' })}>
                            {phrase.density.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: analysis ? 0.7 : 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  SEO Best Practices
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Target keyword density should be between 2-5% for main keywords</li>
                  <li>• Aim for at least 300 words for blog posts, 500+ for landing pages</li>
                  <li>
                    • Use varied vocabulary to improve keyword diversity (30-40% unique words)
                  </li>
                  <li>• Include related two and three-word phrases for better topic coverage</li>
                  <li>• Avoid keyword stuffing - it can hurt your SEO ranking</li>
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

export default function KeywordDensityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KeywordDensityContent />
    </Suspense>
  )
}
