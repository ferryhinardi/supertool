'use client'

import { Clock, Copy, FileText, Hash, Mic, RotateCcw, Type } from 'lucide-react'
import { useMemo, useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  analyzeText,
  calculateKeywordDensity,
  formatTime,
  type KeywordFrequency,
  sampleTexts,
  type TextStatistics,
} from './templates'

export default function WordCounterPage() {
  const [text, setText] = useState('')
  const [showKeywords, setShowKeywords] = useState(false)

  // Calculate statistics in real-time
  const stats: TextStatistics = useMemo(() => analyzeText(text), [text])
  const keywords: KeywordFrequency[] = useMemo(
    () => (showKeywords ? calculateKeywordDensity(text, 15) : []),
    [text, showKeywords]
  )

  const handleTextChange = (value: string) => {
    setText(value)
    if (value.length > 0) {
      trackToolEvent('word_counter_text_changed', {
        wordCount: value.split(/\s+/).filter((w) => w.length > 0).length,
      })
    }
  }

  const handleClear = () => {
    setText('')
    trackToolEvent('word_counter_cleared')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      trackToolEvent('word_counter_copied', { textLength: text.length })
    } catch {
      // Silently fail
    }
  }

  const handleLoadSample = (sample: keyof typeof sampleTexts) => {
    setText(sampleTexts[sample])
    trackToolEvent('word_counter_sample_loaded', { sample })
  }

  const handleToggleKeywords = () => {
    setShowKeywords(!showKeywords)
    if (!showKeywords) {
      trackToolEvent('word_counter_keywords_viewed')
    }
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
      <div className={css({ spaceY: 4, textAlign: 'center' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          })}
        >
          <FileText className={css({ w: 10, h: 10, color: 'blue.400' })} />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'blue.400',
              gradientTo: 'cyan.400',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Word Counter Pro
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
          Comprehensive text analysis tool with word count, character count, reading time, keyword
          density, and more
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: { base: 6, lg: 8 },
          alignItems: 'start',
        })}
      >
        {/* Text Input Area */}
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            rounded: 'xl',
            p: { base: 4, sm: 6 },
            spaceY: 4,
          })}
        >
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 3,
            })}
          >
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              Your Text
            </h2>
            <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
              <button
                type="button"
                onClick={() => handleLoadSample('short')}
                className={css({
                  px: 3,
                  py: 1.5,
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  rounded: 'lg',
                  bg: 'gray.800',
                  color: 'gray.300',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { bg: 'gray.700', borderColor: 'blue.500', color: 'blue.300' },
                })}
              >
                Short Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('medium')}
                className={css({
                  px: 3,
                  py: 1.5,
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  rounded: 'lg',
                  bg: 'gray.800',
                  color: 'gray.300',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { bg: 'gray.700', borderColor: 'blue.500', color: 'blue.300' },
                })}
              >
                Medium Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('long')}
                className={css({
                  px: 3,
                  py: 1.5,
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  rounded: 'lg',
                  bg: 'gray.800',
                  color: 'gray.300',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { bg: 'gray.700', borderColor: 'blue.500', color: 'blue.300' },
                })}
              >
                Long Sample
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste or type your text here to analyze..."
            className={css({
              w: 'full',
              minH: '96',
              p: 4,
              fontSize: 'base',
              bg: 'gray.900',
              color: 'white',
              border: '1px solid',
              borderColor: 'gray.700',
              rounded: 'lg',
              resize: 'vertical',
              outline: 'none',
              _focus: {
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'rgba(59, 130, 246, 0.3)',
              },
              _placeholder: { color: 'gray.500' },
            })}
          />

          <div className={css({ display: 'flex', gap: 3, flexWrap: 'wrap' })}>
            <button
              type="button"
              onClick={handleCopy}
              disabled={text.length === 0}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2,
                fontSize: 'sm',
                fontWeight: 'medium',
                rounded: 'lg',
                bg: 'blue.600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: { bg: 'blue.500' },
                _disabled: { opacity: 0.5, cursor: 'not-allowed', _hover: { bg: 'blue.600' } },
              })}
            >
              <Copy className={css({ w: 4, h: 4 })} />
              Copy Text
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={text.length === 0}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2,
                fontSize: 'sm',
                fontWeight: 'medium',
                rounded: 'lg',
                bg: 'gray.700',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: { bg: 'gray.600' },
                _disabled: { opacity: 0.5, cursor: 'not-allowed', _hover: { bg: 'gray.700' } },
              })}
            >
              <RotateCcw className={css({ w: 4, h: 4 })} />
              Clear
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className={css({ spaceY: 4 })}>
          {/* Basic Stats */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Statistics
            </h3>
            <div className={css({ display: 'grid', gridTemplateColumns: '1fr', gap: 3 })}>
              <StatItem
                icon={Type}
                label="Words"
                value={stats.words.toLocaleString()}
                color="blue"
              />
              <StatItem
                icon={Hash}
                label="Characters"
                value={stats.characters.toLocaleString()}
                color="cyan"
              />
              <StatItem
                icon={Hash}
                label="Characters (no spaces)"
                value={stats.charactersNoSpaces.toLocaleString()}
                color="teal"
              />
              <StatItem
                icon={FileText}
                label="Sentences"
                value={stats.sentences.toLocaleString()}
                color="green"
              />
              <StatItem
                icon={FileText}
                label="Paragraphs"
                value={stats.paragraphs.toLocaleString()}
                color="emerald"
              />
              <StatItem
                icon={FileText}
                label="Lines"
                value={stats.lines.toLocaleString()}
                color="lime"
              />
            </div>
          </div>

          {/* Reading/Speaking Time */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Time Estimates
            </h3>
            <div className={css({ display: 'grid', gridTemplateColumns: '1fr', gap: 3 })}>
              <StatItem
                icon={Clock}
                label="Reading Time"
                value={formatTime(stats.readingTime)}
                color="purple"
                subtitle="~200 words/min"
              />
              <StatItem
                icon={Mic}
                label="Speaking Time"
                value={formatTime(stats.speakingTime)}
                color="pink"
                subtitle="~130 words/min"
              />
            </div>
          </div>

          {/* Additional Stats */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Additional Stats
            </h3>
            <div className={css({ spaceY: 3 })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Average Word Length
                </span>
                <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'white' })}>
                  {stats.averageWordLength > 0 ? `${stats.averageWordLength} chars` : '—'}
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Longest Word</span>
                <span
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    color: 'white',
                    maxW: '40',
                    truncate: true,
                  })}
                  title={stats.longestWord}
                >
                  {stats.longestWord || '—'}
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Longest Word Length
                </span>
                <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'white' })}>
                  {stats.longestWordLength > 0 ? `${stats.longestWordLength} chars` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Density */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                Keyword Density
              </h3>
              <button
                type="button"
                onClick={handleToggleKeywords}
                disabled={text.length === 0}
                className={css({
                  px: 3,
                  py: 1.5,
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  rounded: 'lg',
                  bg: showKeywords ? 'blue.600' : 'gray.700',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { bg: showKeywords ? 'blue.500' : 'gray.600' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                {showKeywords ? 'Hide' : 'Show'}
              </button>
            </div>

            {showKeywords && keywords.length > 0 && (
              <div className={css({ spaceY: 2, maxH: '80', overflowY: 'auto' })}>
                {keywords.map((keyword, index) => (
                  <div
                    key={keyword.word}
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      rounded: 'lg',
                      bg: 'gray.900',
                      border: '1px solid',
                      borderColor: 'gray.800',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                      <span
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          color: 'gray.500',
                          minW: 6,
                        })}
                      >
                        #{index + 1}
                      </span>
                      <span
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        {keyword.word}
                      </span>
                    </div>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: 3 })}>
                      <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
                        {keyword.count}× ({keyword.percentage}%)
                      </span>
                      <div
                        className={css({
                          w: 16,
                          h: 1.5,
                          bg: 'gray.800',
                          rounded: 'full',
                          overflow: 'hidden',
                        })}
                      >
                        <div
                          className={css({ h: 'full', bg: 'blue.500', rounded: 'full' })}
                          style={{ width: `${Math.min(keyword.percentage * 10, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showKeywords && keywords.length === 0 && (
              <p className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', py: 4 })}>
                No keywords found. Try entering more text.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div
        className={css({
          bg: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          rounded: 'xl',
          p: { base: 4, sm: 6 },
          spaceY: 4,
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
          Tips & Features
        </h3>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
          })}
        >
          <TipCard
            title="Real-time Analysis"
            description="All statistics update instantly as you type or paste text"
          />
          <TipCard
            title="Reading Time"
            description="Estimated at 200 words per minute, the average adult reading speed"
          />
          <TipCard
            title="Speaking Time"
            description="Estimated at 130 words per minute, the average speaking pace"
          />
          <TipCard
            title="Keyword Density"
            description="Shows most frequent words (excluding common stop words)"
          />
          <TipCard
            title="Sample Texts"
            description="Click the sample buttons to test with different text lengths"
          />
          <TipCard
            title="Privacy First"
            description="All processing happens locally in your browser. No data is sent to servers."
          />
        </div>
      </div>
    </main>
  )
}

// Stat Item Component
function StatItem({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  subtitle?: string
}) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        p: 3,
        rounded: 'lg',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
      })}
    >
      <Icon className={css({ w: 5, h: 5, color: `${color}.400`, flexShrink: 0 })} />
      <div className={css({ flex: 1, minW: 0 })}>
        <div className={css({ fontSize: 'xs', color: 'gray.400', truncate: true })}>{label}</div>
        {subtitle && <div className={css({ fontSize: '2xs', color: 'gray.600' })}>{subtitle}</div>}
      </div>
      <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'white', flexShrink: 0 })}>
        {value}
      </div>
    </div>
  )
}

// Tip Card Component
function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={css({
        p: 4,
        rounded: 'lg',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
        spaceY: 2,
      })}
    >
      <h4 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.400' })}>
        {title}
      </h4>
      <p className={css({ fontSize: 'xs', color: 'gray.400', lineHeight: 'relaxed' })}>
        {description}
      </p>
    </div>
  )
}
