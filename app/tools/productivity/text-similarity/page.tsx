'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Copy, FileText, GitCompare, Sparkles, Trash2 } from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type AlgorithmType = 'cosine' | 'levenshtein' | 'jaccard'

interface SimilarityResult {
  score: number
  algorithm: AlgorithmType
  details: {
    matches?: number
    total?: number
    distance?: number
    maxLength?: number
  }
}

// NLP Algorithm Implementations
function cosineSimilarity(text1: string, text2: string): SimilarityResult {
  // Tokenize and create word frequency vectors
  const words1 = text1.toLowerCase().match(/\w+/g) || []
  const words2 = text2.toLowerCase().match(/\w+/g) || []

  // Create vocabulary
  const vocabulary = new Set([...words1, ...words2])

  // Create term frequency vectors
  const vector1: number[] = []
  const vector2: number[] = []

  vocabulary.forEach((word) => {
    vector1.push(words1.filter((w) => w === word).length)
    vector2.push(words2.filter((w) => w === word).length)
  })

  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))

  const similarity = magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0

  return {
    score: similarity * 100,
    algorithm: 'cosine',
    details: {
      matches: dotProduct,
      total: vocabulary.size,
    },
  }
}

function levenshteinDistance(text1: string, text2: string): SimilarityResult {
  const s1 = text1.toLowerCase()
  const s2 = text2.toLowerCase()
  const len1 = s1.length
  const len2 = s2.length

  // Create distance matrix
  const matrix: number[][] = []
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  const distance = matrix[len1][len2]
  const maxLength = Math.max(len1, len2)
  const similarity = maxLength > 0 ? ((maxLength - distance) / maxLength) * 100 : 0

  return {
    score: similarity,
    algorithm: 'levenshtein',
    details: {
      distance,
      maxLength,
    },
  }
}

function jaccardSimilarity(text1: string, text2: string): SimilarityResult {
  const words1 = new Set(text1.toLowerCase().match(/\w+/g) || [])
  const words2 = new Set(text2.toLowerCase().match(/\w+/g) || [])

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  const similarity = union.size > 0 ? (intersection.size / union.size) * 100 : 0

  return {
    score: similarity,
    algorithm: 'jaccard',
    details: {
      matches: intersection.size,
      total: union.size,
    },
  }
}

const examplePairs = [
  {
    name: 'Similar Articles',
    text1: 'Artificial intelligence is revolutionizing the technology industry.',
    text2: 'AI is transforming how we approach technology and innovation.',
  },
  {
    name: 'Duplicate Detection',
    text1: 'The quick brown fox jumps over the lazy dog.',
    text2: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    name: 'Paraphrased Content',
    text1: 'Climate change poses significant challenges to our environment.',
    text2: 'Environmental issues related to global warming are becoming critical.',
  },
]

function TextSimilarityContent() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('cosine')
  const [showAllAlgorithms, setShowAllAlgorithms] = useState(false)

  // Track page visit
  useEffect(() => {
    trackToolEvent('text_similarity_open', {})
  }, [])

  // Calculate similarity results
  const results = useMemo(() => {
    if (!text1.trim() || !text2.trim()) {
      return null
    }

    const cosine = cosineSimilarity(text1, text2)
    const levenshtein = levenshteinDistance(text1, text2)
    const jaccard = jaccardSimilarity(text1, text2)

    trackToolEvent('text_similarity_compare', {
      algorithm: showAllAlgorithms ? 'all' : selectedAlgorithm,
      text1_length: text1.length,
      text2_length: text2.length,
    })

    return { cosine, levenshtein, jaccard }
  }, [text1, text2, selectedAlgorithm, showAllAlgorithms])

  const handleClear = () => {
    setText1('')
    setText2('')
    toast.success('Text cleared')
    trackToolEvent('text_similarity_clear', {})
  }

  const handleLoadExample = (example: (typeof examplePairs)[0]) => {
    setText1(example.text1)
    setText2(example.text2)
    toast.success(`Loaded example: ${example.name}`)
    trackToolEvent('text_similarity_load_example', { example: example.name })
  }

  const handleCopyResult = (result: SimilarityResult) => {
    const resultText = `Similarity Score: ${result.score.toFixed(2)}%\nAlgorithm: ${result.algorithm.toUpperCase()}\n${
      result.details.distance !== undefined
        ? `Distance: ${result.details.distance}\nMax Length: ${result.details.maxLength}`
        : `Matches: ${result.details.matches}\nTotal: ${result.details.total}`
    }`

    navigator.clipboard.writeText(resultText)
    toast.success('Result copied to clipboard!')
    trackToolEvent('text_similarity_copy_result', { algorithm: result.algorithm })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 50) return 'yellow'
    return 'red'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Nearly Identical'
    if (score >= 80) return 'Very Similar'
    if (score >= 60) return 'Moderately Similar'
    if (score >= 40) return 'Somewhat Similar'
    return 'Different'
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
            borderColor: 'indigo.500/30',
            bg: 'indigo.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <GitCompare className={css({ h: '5', w: '5', color: 'indigo.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'indigo.300' })}>
            3 NLP Algorithms • Real-time Analysis
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'indigo.400',
            gradientVia: 'purple.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Text Similarity Checker
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Compare text blocks and measure similarity using advanced NLP algorithms. Perfect for
          detecting duplicate content, plagiarism, and text variations.
        </p>
      </motion.div>

      {/* Algorithm Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'indigo.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Select Algorithm</CardTitle>
            <CardDescription>Choose how to measure text similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '4' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: '3',
                })}
              >
                <Button
                  onClick={() => setSelectedAlgorithm('cosine')}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '4',
                    px: '3',
                    bg: selectedAlgorithm === 'cosine' ? 'indigo.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: selectedAlgorithm === 'cosine' ? 'indigo.500/50' : 'gray.700/50',
                    color: selectedAlgorithm === 'cosine' ? 'indigo.300' : 'gray.400',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: selectedAlgorithm === 'cosine' ? 'indigo.500/30' : 'gray.800',
                      borderColor: selectedAlgorithm === 'cosine' ? 'indigo.500/70' : 'gray.600',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                    Cosine Similarity
                  </span>
                  <span className={css({ fontSize: 'xs', color: 'gray.500', textAlign: 'center' })}>
                    Best for semantic similarity
                  </span>
                </Button>

                <Button
                  onClick={() => setSelectedAlgorithm('levenshtein')}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '4',
                    px: '3',
                    bg: selectedAlgorithm === 'levenshtein' ? 'purple.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor:
                      selectedAlgorithm === 'levenshtein' ? 'purple.500/50' : 'gray.700/50',
                    color: selectedAlgorithm === 'levenshtein' ? 'purple.300' : 'gray.400',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: selectedAlgorithm === 'levenshtein' ? 'purple.500/30' : 'gray.800',
                      borderColor:
                        selectedAlgorithm === 'levenshtein' ? 'purple.500/70' : 'gray.600',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                    Levenshtein Distance
                  </span>
                  <span className={css({ fontSize: 'xs', color: 'gray.500', textAlign: 'center' })}>
                    Best for character-level edits
                  </span>
                </Button>

                <Button
                  onClick={() => setSelectedAlgorithm('jaccard')}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '4',
                    px: '3',
                    bg: selectedAlgorithm === 'jaccard' ? 'pink.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: selectedAlgorithm === 'jaccard' ? 'pink.500/50' : 'gray.700/50',
                    color: selectedAlgorithm === 'jaccard' ? 'pink.300' : 'gray.400',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: selectedAlgorithm === 'jaccard' ? 'pink.500/30' : 'gray.800',
                      borderColor: selectedAlgorithm === 'jaccard' ? 'pink.500/70' : 'gray.600',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                    Jaccard Index
                  </span>
                  <span className={css({ fontSize: 'xs', color: 'gray.500', textAlign: 'center' })}>
                    Best for word overlap
                  </span>
                </Button>
              </div>

              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <input
                  type="checkbox"
                  id="show-all"
                  checked={showAllAlgorithms}
                  onChange={(e) => setShowAllAlgorithms(e.target.checked)}
                  className={css({
                    h: '4',
                    w: '4',
                    rounded: 'sm',
                    cursor: 'pointer',
                  })}
                />
                <label
                  htmlFor="show-all"
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.400',
                    cursor: 'pointer',
                  })}
                >
                  Show results from all algorithms
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Text Input Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'indigo.500/20',
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
              <div>
                <CardTitle>Compare Texts</CardTitle>
                <CardDescription>Enter two text blocks to compare</CardDescription>
              </div>
              <Button
                onClick={handleClear}
                size="sm"
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'gray.400',
                  _hover: { bg: 'red.500/20', color: 'red.400' },
                })}
              >
                <Trash2 className={css({ h: '4', w: '4' })} />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Text 1 */}
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <label
                  htmlFor="text1"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Text 1
                </label>
                <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                  {text1.length} characters
                </span>
              </div>
              <textarea
                id="text1"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Paste or type the first text here..."
                className={css({
                  w: 'full',
                  minH: '40',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  px: '4',
                  py: '3',
                  fontSize: 'sm',
                  color: 'gray.200',
                  resize: 'vertical',
                  _focus: {
                    outline: 'none',
                    borderColor: 'indigo.500',
                    ring: '2px',
                    ringColor: 'indigo.500/20',
                  },
                  _placeholder: { color: 'gray.500' },
                })}
              />
            </div>

            {/* Divider */}
            <div className={css({ position: 'relative', py: '2' })}>
              <div
                className={css({
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  alignItems: 'center',
                })}
              >
                <div
                  className={css({ w: 'full', borderTop: '1px solid', borderColor: 'gray.700' })}
                />
              </div>
              <div
                className={css({ position: 'relative', display: 'flex', justifyContent: 'center' })}
              >
                <span
                  className={css({ bg: 'gray.900', px: '3', fontSize: 'xs', color: 'gray.500' })}
                >
                  VS
                </span>
              </div>
            </div>

            {/* Text 2 */}
            <div className={css({ spaceY: '3' })}>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <label
                  htmlFor="text2"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Text 2
                </label>
                <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                  {text2.length} characters
                </span>
              </div>
              <textarea
                id="text2"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Paste or type the second text here..."
                className={css({
                  w: 'full',
                  minH: '40',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800/50',
                  px: '4',
                  py: '3',
                  fontSize: 'sm',
                  color: 'gray.200',
                  resize: 'vertical',
                  _focus: {
                    outline: 'none',
                    borderColor: 'indigo.500',
                    ring: '2px',
                    ringColor: 'indigo.500/20',
                  },
                  _placeholder: { color: 'gray.500' },
                })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle>Similarity Results</CardTitle>
              <CardDescription>Analysis based on selected algorithm(s)</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {showAllAlgorithms ? (
                // Show all algorithm results
                <div className={css({ display: 'grid', gap: '4' })}>
                  {[results.cosine, results.levenshtein, results.jaccard].map((result) => {
                    const color = getScoreColor(result.score)
                    return (
                      <div
                        key={result.algorithm}
                        className={css({
                          rounded: 'lg',
                          border: '1px solid',
                          borderColor: `${color}.500/20`,
                          bg: `${color}.500/5`,
                          p: '6',
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: '4',
                          })}
                        >
                          <div>
                            <h3
                              className={css({
                                fontSize: 'lg',
                                fontWeight: 'semibold',
                                color: `${color}.300`,
                                textTransform: 'capitalize',
                              })}
                            >
                              {result.algorithm} Similarity
                            </h3>
                            <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
                              {getScoreLabel(result.score)}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleCopyResult(result)}
                            size="sm"
                            className={css({
                              gap: '2',
                              bg: 'gray.800',
                              color: 'gray.400',
                              _hover: { bg: 'gray.700', color: 'white' },
                            })}
                          >
                            <Copy className={css({ h: '4', w: '4' })} />
                            Copy
                          </Button>
                        </div>

                        <div className={css({ spaceY: '3' })}>
                          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                            <span
                              className={css({
                                fontSize: '4xl',
                                fontWeight: 'bold',
                                color: `${color}.300`,
                              })}
                            >
                              {result.score.toFixed(2)}%
                            </span>
                            <Badge
                              className={css({
                                bg: `${color}.500/20`,
                                color: `${color}.300`,
                                border: '1px solid',
                                borderColor: `${color}.500/30`,
                              })}
                            >
                              {getScoreLabel(result.score)}
                            </Badge>
                          </div>

                          <div
                            className={css({
                              w: 'full',
                              h: '2',
                              rounded: 'full',
                              bg: 'gray.700',
                              overflow: 'hidden',
                            })}
                          >
                            <div
                              className={css({
                                h: 'full',
                                bg: `${color}.500`,
                                transition: 'width 0.5s',
                                rounded: 'full',
                              })}
                              style={{ width: `${result.score}%` }}
                            />
                          </div>

                          <div
                            className={css({
                              display: 'flex',
                              gap: '4',
                              fontSize: 'sm',
                              color: 'gray.400',
                            })}
                          >
                            {result.details.matches !== undefined && (
                              <span>Matches: {result.details.matches}</span>
                            )}
                            {result.details.total !== undefined && (
                              <span>Total: {result.details.total}</span>
                            )}
                            {result.details.distance !== undefined && (
                              <span>Edit Distance: {result.details.distance}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Show single selected algorithm result
                (() => {
                  const result = results[selectedAlgorithm]
                  const color = getScoreColor(result.score)
                  return (
                    <div
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: `${color}.500/20`,
                        bg: `${color}.500/5`,
                        p: '8',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: '6',
                        })}
                      >
                        <div>
                          <h3
                            className={css({
                              fontSize: '2xl',
                              fontWeight: 'bold',
                              color: `${color}.300`,
                              textTransform: 'capitalize',
                            })}
                          >
                            {result.algorithm} Similarity
                          </h3>
                          <p className={css({ fontSize: 'base', color: 'gray.400', mt: '1' })}>
                            {getScoreLabel(result.score)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCopyResult(result)}
                          className={css({
                            gap: '2',
                            bg: 'gray.800',
                            color: 'gray.400',
                            _hover: { bg: 'gray.700', color: 'white' },
                          })}
                        >
                          <Copy className={css({ h: '4', w: '4' })} />
                          Copy Result
                        </Button>
                      </div>

                      <div className={css({ spaceY: '4' })}>
                        <div className={css({ display: 'flex', alignItems: 'baseline', gap: '3' })}>
                          <span
                            className={css({
                              fontSize: '6xl',
                              fontWeight: 'extrabold',
                              color: `${color}.300`,
                            })}
                          >
                            {result.score.toFixed(2)}%
                          </span>
                          <Badge
                            className={css({
                              bg: `${color}.500/20`,
                              color: `${color}.300`,
                              border: '1px solid',
                              borderColor: `${color}.500/30`,
                              fontSize: 'base',
                              px: '3',
                              py: '1',
                            })}
                          >
                            {getScoreLabel(result.score)}
                          </Badge>
                        </div>

                        <div
                          className={css({
                            w: 'full',
                            h: '3',
                            rounded: 'full',
                            bg: 'gray.700',
                            overflow: 'hidden',
                          })}
                        >
                          <div
                            className={css({
                              h: 'full',
                              bg: `${color}.500`,
                              transition: 'width 0.5s',
                              rounded: 'full',
                            })}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>

                        <div
                          className={css({
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '4',
                            pt: '2',
                          })}
                        >
                          {result.details.matches !== undefined && (
                            <div>
                              <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                Matches
                              </span>
                              <p
                                className={css({
                                  fontSize: 'lg',
                                  fontWeight: 'semibold',
                                  color: 'gray.300',
                                })}
                              >
                                {result.details.matches}
                              </p>
                            </div>
                          )}
                          {result.details.total !== undefined && (
                            <div>
                              <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                Total Items
                              </span>
                              <p
                                className={css({
                                  fontSize: 'lg',
                                  fontWeight: 'semibold',
                                  color: 'gray.300',
                                })}
                              >
                                {result.details.total}
                              </p>
                            </div>
                          )}
                          {result.details.distance !== undefined && (
                            <div>
                              <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                Edit Distance
                              </span>
                              <p
                                className={css({
                                  fontSize: 'lg',
                                  fontWeight: 'semibold',
                                  color: 'gray.300',
                                })}
                              >
                                {result.details.distance}
                              </p>
                            </div>
                          )}
                          {result.details.maxLength !== undefined && (
                            <div>
                              <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                Max Length
                              </span>
                              <p
                                className={css({
                                  fontSize: 'lg',
                                  fontWeight: 'semibold',
                                  color: 'gray.300',
                                })}
                              >
                                {result.details.maxLength}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!text1 && !text2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '8', pb: '8' })}>
              <div className={css({ textAlign: 'center', spaceY: '4' })}>
                <FileText className={css({ h: '12', w: '12', color: 'gray.600', mx: 'auto' })} />
                <div>
                  <h3
                    className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'gray.400' })}
                  >
                    No Texts to Compare
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'gray.500', mt: '2' })}>
                    Enter two text blocks above or try one of the examples below
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Example Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
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
            <CardTitle>Example Text Pairs</CardTitle>
            <CardDescription>Click to load and test with sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ display: 'grid', gap: '3' })}>
              {examplePairs.map((example) => (
                <button
                  key={example.name}
                  type="button"
                  onClick={() => handleLoadExample(example)}
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.800', borderColor: 'purple.500/50' },
                  })}
                >
                  <h4
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'semibold',
                      color: 'purple.300',
                      mb: '2',
                    })}
                  >
                    {example.name}
                  </h4>
                  <div className={css({ spaceY: '1' })}>
                    <p className={css({ fontSize: 'xs', color: 'gray.400', truncate: true })}>
                      Text 1: {example.text1}
                    </p>
                    <p className={css({ fontSize: 'xs', color: 'gray.400', truncate: true })}>
                      Text 2: {example.text2}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>
                    <strong className={css({ color: 'gray.300' })}>Cosine Similarity:</strong> Best
                    for comparing meaning and semantic content, regardless of word order
                  </li>
                  <li>
                    <strong className={css({ color: 'gray.300' })}>Levenshtein Distance:</strong>{' '}
                    Perfect for detecting typos and character-level differences
                  </li>
                  <li>
                    <strong className={css({ color: 'gray.300' })}>Jaccard Index:</strong> Ideal for
                    measuring word overlap and set-based similarity
                  </li>
                  <li>
                    • Use &quot;Show all algorithms&quot; to compare different similarity metrics
                  </li>
                  <li>
                    • All processing happens in your browser - your data never leaves your device
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Warning for Long Texts */}
      {(text1.length > 10000 || text2.length > 10000) && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'yellow.500/20',
              bg: 'yellow.500/5',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '4', pb: '4' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <AlertCircle className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                <p className={css({ fontSize: 'sm', color: 'yellow.300' })}>
                  Processing large texts may take a moment. Consider using shorter excerpts for
                  faster results.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}

export default function TextSimilarityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextSimilarityContent />
    </Suspense>
  )
}
