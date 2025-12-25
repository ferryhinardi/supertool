'use client'

import { BookOpen, Brain, FileText, Lightbulb, Sparkles, Tag, TrendingUp, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

interface SummarizationResult {
  summary: string
  keyPoints: string[]
  documentType: string
  mainTopics: string[]
  actionItems: string[]
  technicalTerms: string[]
  pageAnalysis: string
  metadata: {
    fileName: string
    pageCount: number
    wordCount: number
    charCount: number
    estimatedReadingTime: number
  }
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface SummarizationDialogProps {
  isOpen: boolean
  onClose: () => void
  result: SummarizationResult | null
  isLoading: boolean
}

export function SummarizationDialog({
  isOpen,
  onClose,
  result,
  isLoading,
}: SummarizationDialogProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  if (!isOpen) return null

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const exportSummary = () => {
    if (!result) return

    const text = `
PDF SUMMARY REPORT
==================

Document: ${result.metadata.fileName}
Type: ${result.documentType}
Pages: ${result.metadata.pageCount}
Word Count: ${result.metadata.wordCount}
Estimated Reading Time: ${result.metadata.estimatedReadingTime} minutes

SUMMARY
-------
${result.summary}

KEY POINTS
----------
${result.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

MAIN TOPICS
-----------
${result.mainTopics.map((topic) => `• ${topic}`).join('\n')}

${result.actionItems.length > 0 ? `ACTION ITEMS\n-----------\n${result.actionItems.map((item) => `☑ ${item}`).join('\n')}\n\n` : ''}
${result.technicalTerms.length > 0 ? `TECHNICAL TERMS\n---------------\n${result.technicalTerms.join(', ')}\n\n` : ''}
${result.pageAnalysis ? `DOCUMENT ANALYSIS\n-----------------\n${result.pageAnalysis}` : ''}
`

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.metadata.fileName.replace('.pdf', '')}-summary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Modal overlay is interactive backdrop for closing
    <div
      role="presentation"
      className={css({
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'black/80',
        backdropFilter: 'blur(4px)',
        p: 4,
      })}
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Dialog container prevents backdrop click propagation */}
      <div
        role="dialog"
        aria-labelledby="summarization-dialog-title"
        className={css({
          maxW: '4xl',
          w: 'full',
          maxH: '90vh',
          overflowY: 'auto',
          bg: 'gray.900',
          border: '1px solid',
          borderColor: 'gray.800',
          rounded: 'lg',
          shadow: '2xl',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 6,
            borderBottom: '1px solid',
            borderColor: 'gray.800',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: 3 })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: 10,
                h: 10,
                rounded: 'full',
                bg: 'purple.500/20',
              })}
            >
              <Sparkles className={css({ w: 5, h: 5, color: 'purple.400' })} />
            </div>
            <div>
              <h2
                id="summarization-dialog-title"
                className={css({ fontSize: 'xl', fontWeight: 'bold' })}
              >
                AI-Powered PDF Summary
              </h2>
              {result && (
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  {result.metadata.fileName}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={onClose}
            className={css({
              w: 8,
              h: 8,
              rounded: 'full',
              bg: 'gray.800',
              _hover: { bg: 'gray.700' },
            })}
          >
            <X className={css({ w: 4, h: 4 })} />
          </Button>
        </div>

        {/* Content */}
        <div className={css({ p: 6, spaceY: 6 })}>
          {isLoading && (
            <div className={css({ textAlign: 'center', py: 12 })}>
              <div
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  px: 6,
                  py: 3,
                  rounded: 'full',
                  bg: 'purple.500/20',
                })}
              >
                <Brain className={css({ w: 5, h: 5, color: 'purple.400', animation: 'pulse' })} />
                <span className={css({ color: 'purple.300' })}>Analyzing your PDF...</span>
              </div>
            </div>
          )}

          {!isLoading && result && (
            <>
              {/* Metadata Cards */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: 4,
                  w: 'full',
                })}
              >
                <Card className={css({ bg: 'gray.800/50', borderColor: 'gray.700' })}>
                  <CardContent className={css({ p: 4, textAlign: 'center' })}>
                    <Tag className={css({ w: 5, h: 5, mx: 'auto', mb: 2, color: 'blue.400' })} />
                    <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {result.documentType}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Document Type</div>
                  </CardContent>
                </Card>

                <Card className={css({ bg: 'gray.800/50', borderColor: 'gray.700' })}>
                  <CardContent className={css({ p: 4, textAlign: 'center' })}>
                    <FileText
                      className={css({ w: 5, h: 5, mx: 'auto', mb: 2, color: 'green.400' })}
                    />
                    <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {result.metadata.pageCount} pages
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.400' })}>
                      {result.metadata.wordCount.toLocaleString()} words
                    </div>
                  </CardContent>
                </Card>

                <Card className={css({ bg: 'gray.800/50', borderColor: 'gray.700' })}>
                  <CardContent className={css({ p: 4, textAlign: 'center' })}>
                    <BookOpen
                      className={css({ w: 5, h: 5, mx: 'auto', mb: 2, color: 'purple.400' })}
                    />
                    <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {result.metadata.estimatedReadingTime} min
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Reading Time</div>
                  </CardContent>
                </Card>

                <Card className={css({ bg: 'gray.800/50', borderColor: 'gray.700' })}>
                  <CardContent className={css({ p: 4, textAlign: 'center' })}>
                    <TrendingUp
                      className={css({ w: 5, h: 5, mx: 'auto', mb: 2, color: 'orange.400' })}
                    />
                    <div className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {result.keyPoints.length} points
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.400' })}>Key Highlights</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Summary */}
              <Card className={css({ bg: 'gray.800/30', borderColor: 'gray.700' })}>
                <CardHeader>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                    <Brain className={css({ w: 5, h: 5, color: 'purple.400' })} />
                    Summary
                  </CardTitle>
                  <CardDescription>AI-generated overview of your document</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={css({ color: 'gray.300', lineHeight: '1.8', fontSize: 'sm' })}>
                    {result.summary}
                  </p>
                  <Button
                    onClick={() => copyToClipboard(result.summary, 'summary')}
                    className={css({ mt: 4 })}
                    size="sm"
                    variant="outline"
                  >
                    {copiedSection === 'summary' ? 'Copied!' : 'Copy Summary'}
                  </Button>
                </CardContent>
              </Card>

              {/* Key Points */}
              {result.keyPoints.length > 0 && (
                <Card className={css({ bg: 'gray.800/30', borderColor: 'gray.700' })}>
                  <CardHeader>
                    <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                      <Lightbulb className={css({ w: 5, h: 5, color: 'yellow.400' })} />
                      Key Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className={css({ spaceY: 3 })}>
                      {result.keyPoints.map((point, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Key points are static and order matters
                        <li
                          key={index}
                          className={css({
                            display: 'flex',
                            gap: 3,
                            fontSize: 'sm',
                            color: 'gray.300',
                          })}
                        >
                          <span
                            className={css({
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              w: 6,
                              h: 6,
                              rounded: 'full',
                              bg: 'yellow.500/20',
                              color: 'yellow.400',
                              fontSize: 'xs',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            })}
                          >
                            {index + 1}
                          </span>
                          <span className={css({ lineHeight: '1.6' })}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Main Topics */}
              {result.mainTopics.length > 0 && (
                <Card className={css({ bg: 'gray.800/30', borderColor: 'gray.700' })}>
                  <CardHeader>
                    <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                      <Tag className={css({ w: 5, h: 5, color: 'blue.400' })} />
                      Main Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={css({ display: 'flex', flexWrap: 'wrap', gap: 2 })}>
                      {result.mainTopics.map((topic, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Topics are static and order matters
                        <span
                          key={index}
                          className={css({
                            px: 3,
                            py: 1.5,
                            rounded: 'full',
                            bg: 'blue.500/20',
                            color: 'blue.300',
                            fontSize: 'sm',
                            border: '1px solid',
                            borderColor: 'blue.500/30',
                          })}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Items */}
              {result.actionItems.length > 0 && (
                <Card className={css({ bg: 'gray.800/30', borderColor: 'gray.700' })}>
                  <CardHeader>
                    <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                      <Sparkles className={css({ w: 5, h: 5, color: 'green.400' })} />
                      Action Items & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className={css({ spaceY: 2 })}>
                      {result.actionItems.map((item, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Action items are static and order matters
                        <li
                          key={index}
                          className={css({
                            display: 'flex',
                            alignItems: 'start',
                            gap: 2,
                            fontSize: 'sm',
                            color: 'gray.300',
                          })}
                        >
                          <span className={css({ color: 'green.400', mt: 0.5 })}>☑</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Technical Terms */}
              {result.technicalTerms.length > 0 && (
                <Card className={css({ bg: 'gray.800/30', borderColor: 'gray.700' })}>
                  <CardHeader>
                    <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                      <Brain className={css({ w: 5, h: 5, color: 'purple.400' })} />
                      Technical Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={css({ display: 'flex', flexWrap: 'wrap', gap: 2 })}>
                      {result.technicalTerms.map((term, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Technical terms are static and order matters
                        <span
                          key={index}
                          className={css({
                            px: 3,
                            py: 1,
                            rounded: 'md',
                            bg: 'purple.500/10',
                            color: 'purple.300',
                            fontSize: 'xs',
                            fontFamily: 'mono',
                            border: '1px solid',
                            borderColor: 'purple.500/20',
                          })}
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Page Analysis */}
              {result.pageAnalysis && (
                <Card className={css({ bg: 'gray.800/30', borderColor: 'gray.700' })}>
                  <CardHeader>
                    <CardTitle>Document Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={css({ color: 'gray.300', fontSize: 'sm', lineHeight: '1.6' })}>
                      {result.pageAnalysis}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className={css({ display: 'flex', gap: 3, justifyContent: 'flex-end', pt: 4 })}>
                <Button onClick={exportSummary} variant="outline">
                  Export Summary
                </Button>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      `${result.summary}\n\nKey Points:\n${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
                      'all'
                    )
                  }
                  variant="default"
                >
                  {copiedSection === 'all' ? 'Copied!' : 'Copy All'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
