'use client'

import { BookOpen, Copy, Gauge, GraduationCap, Info, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  analyzeReadability,
  getFleschInterpretation,
  type ReadabilityResult,
  sampleTexts,
  scoreExplanations,
} from './utils'

export default function ReadabilityCheckerPage() {
  const [text, setText] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  // Calculate readability in real-time
  const result: ReadabilityResult = useMemo(() => analyzeReadability(text), [text])
  const fleschInterpretation = useMemo(
    () => getFleschInterpretation(result.scores.fleschReadingEase),
    [result.scores.fleschReadingEase]
  )

  const handleTextChange = (value: string) => {
    setText(value)
    if (value.length > 0) {
      trackToolEvent('readability_checker_text_changed', {
        wordCount: value.split(/\s+/).filter((w) => w.length > 0).length,
      })
    }
  }

  const handleClear = () => {
    setText('')
    trackToolEvent('readability_checker_cleared')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      trackToolEvent('readability_checker_copied', { textLength: text.length })
    } catch {
      // Silently fail
    }
  }

  const handleLoadSample = (sample: keyof typeof sampleTexts) => {
    setText(sampleTexts[sample].text)
    trackToolEvent('readability_checker_sample_loaded', { sample })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green.400'
      case 'medium':
        return 'yellow.400'
      case 'hard':
        return 'orange.400'
      case 'very-hard':
        return 'red.400'
      default:
        return 'gray.400'
    }
  }

  const getScoreColor = (score: number, isGrade: boolean = false) => {
    if (isGrade) {
      // For grade levels: lower is easier
      if (score <= 6) return 'green.400'
      if (score <= 10) return 'yellow.400'
      if (score <= 14) return 'orange.400'
      return 'red.400'
    }
    // For Flesch Reading Ease: higher is easier
    if (score >= 70) return 'green.400'
    if (score >= 50) return 'yellow.400'
    if (score >= 30) return 'orange.400'
    return 'red.400'
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
          <Gauge className={css({ w: 10, h: 10, color: 'emerald.400' })} />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'emerald.400',
              gradientTo: 'teal.400',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Readability Checker
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
          Analyze your text with multiple readability formulas including Flesch-Kincaid, Gunning
          Fog, SMOG, and more
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: { base: 6, lg: 8 },
          alignItems: 'start',
          w: 'full',
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
              {Object.entries(sampleTexts).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLoadSample(key as keyof typeof sampleTexts)}
                  className={css({
                    px: 3,
                    py: 1.5,
                    fontSize: 'sm',
                    bg: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    rounded: 'lg',
                    color: 'gray.300',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'emerald.400/50',
                    },
                  })}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste or type your text here to analyze its readability..."
            className={css({
              w: 'full',
              minH: '300px',
              p: 4,
              bg: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'lg',
              color: 'white',
              fontSize: 'md',
              lineHeight: '1.7',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
              _focus: {
                borderColor: 'emerald.400/50',
              },
              _placeholder: {
                color: 'gray.500',
              },
            })}
          />

          <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2,
                bg: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rounded: 'lg',
                color: 'gray.300',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'rgba(255, 255, 255, 0.1)',
                },
                _disabled: {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              })}
            >
              <Copy className={css({ w: 4, h: 4 })} />
              Copy
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!text}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 4,
                py: 2,
                bg: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rounded: 'lg',
                color: 'gray.300',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'rgba(255, 255, 255, 0.1)',
                },
                _disabled: {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              })}
            >
              <RotateCcw className={css({ w: 4, h: 4 })} />
              Clear
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className={css({ spaceY: 6 })}>
          {/* Overall Score Card */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              textAlign: 'center',
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 4,
              })}
            >
              <GraduationCap className={css({ w: 6, h: 6, color: 'emerald.400' })} />
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                Overall Assessment
              </h3>
            </div>

            <div
              className={css({
                fontSize: '5xl',
                fontWeight: 'bold',
                color: text ? getDifficultyColor(result.difficulty) : 'gray.500',
                mb: 2,
              })}
            >
              {text ? result.scores.fleschReadingEase : '--'}
            </div>
            <div className={css({ fontSize: 'sm', color: 'gray.400', mb: 4 })}>
              Flesch Reading Ease Score
            </div>

            {text && (
              <>
                <div
                  className={css({
                    display: 'inline-block',
                    px: 4,
                    py: 2,
                    bg: 'rgba(255, 255, 255, 0.05)',
                    rounded: 'full',
                    mb: 3,
                  })}
                >
                  <span
                    className={css({
                      color: getDifficultyColor(result.difficulty),
                      fontWeight: 'semibold',
                    })}
                  >
                    {fleschInterpretation.label}
                  </span>
                </div>
                <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Suitable for: {fleschInterpretation.audience}
                </div>
                <div
                  className={css({
                    mt: 4,
                    pt: 4,
                    borderTop: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  })}
                >
                  <div className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                    {result.overallGradeLevel}
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Average Grade Level
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Text Statistics */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 4,
              })}
            >
              <BookOpen className={css({ w: 5, h: 5, color: 'emerald.400' })} />
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                Text Statistics
              </h3>
            </div>

            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 4,
              })}
            >
              <StatItem label="Words" value={result.stats.wordCount} />
              <StatItem label="Sentences" value={result.stats.sentenceCount} />
              <StatItem label="Syllables" value={result.stats.syllableCount} />
              <StatItem label="Complex Words" value={result.stats.complexWordCount} />
              <StatItem
                label="Avg Words/Sentence"
                value={result.stats.avgWordsPerSentence.toFixed(1)}
              />
              <StatItem label="Reading Time" value={`${result.readingTime} min`} />
            </div>
          </div>

          {/* Readability Scores */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 4,
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
                <Gauge className={css({ w: 5, h: 5, color: 'emerald.400' })} />
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  Readability Scores
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className={css({
                  p: 2,
                  rounded: 'lg',
                  color: showInfo ? 'emerald.400' : 'gray.400',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'rgba(255, 255, 255, 0.05)',
                  },
                })}
                title="Show formula information"
              >
                <Info className={css({ w: 4, h: 4 })} />
              </button>
            </div>

            <div className={css({ spaceY: 3 })}>
              <ScoreItem
                label="Flesch-Kincaid Grade"
                value={result.scores.fleschKincaidGrade}
                suffix="grade"
                color={getScoreColor(result.scores.fleschKincaidGrade, true)}
                showInfo={showInfo}
                info={scoreExplanations.fleschKincaidGrade}
              />
              <ScoreItem
                label="Gunning Fog Index"
                value={result.scores.gunningFog}
                suffix="years"
                color={getScoreColor(result.scores.gunningFog, true)}
                showInfo={showInfo}
                info={scoreExplanations.gunningFog}
              />
              <ScoreItem
                label="SMOG Index"
                value={result.scores.smog}
                suffix="years"
                color={getScoreColor(result.scores.smog, true)}
                showInfo={showInfo}
                info={scoreExplanations.smog}
              />
              <ScoreItem
                label="Coleman-Liau Index"
                value={result.scores.colemanLiau}
                suffix="grade"
                color={getScoreColor(result.scores.colemanLiau, true)}
                showInfo={showInfo}
                info={scoreExplanations.colemanLiau}
              />
              <ScoreItem
                label="Automated Readability"
                value={result.scores.automatedReadabilityIndex}
                suffix="grade"
                color={getScoreColor(result.scores.automatedReadabilityIndex, true)}
                showInfo={showInfo}
                info={scoreExplanations.automatedReadabilityIndex}
              />
            </div>
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
        })}
      >
        <h3
          className={css({
            fontSize: 'xl',
            fontWeight: 'semibold',
            color: 'white',
            mb: 4,
          })}
        >
          Tips for Improving Readability
        </h3>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
            w: 'full',
          })}
        >
          <TipCard
            title="Use Shorter Sentences"
            description="Aim for an average of 15-20 words per sentence. Break long sentences into shorter ones."
          />
          <TipCard
            title="Choose Simple Words"
            description="Replace complex words with simpler alternatives. Use everyday vocabulary your audience understands."
          />
          <TipCard
            title="Use Active Voice"
            description="Write in active voice instead of passive. 'The dog bit the man' is clearer than 'The man was bitten.'"
          />
          <TipCard
            title="Avoid Jargon"
            description="Unless writing for experts, avoid technical jargon. Define specialized terms when you must use them."
          />
          <TipCard
            title="Use Transition Words"
            description="Words like 'however', 'therefore', and 'for example' help readers follow your logic."
          />
          <TipCard
            title="Break Up Text"
            description="Use headings, bullet points, and short paragraphs to make text easier to scan and digest."
          />
        </div>
      </div>
    </main>
  )
}

// Stat Item Component
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'white' })}>{value}</div>
      <div className={css({ fontSize: 'sm', color: 'gray.400' })}>{label}</div>
    </div>
  )
}

// Score Item Component
function ScoreItem({
  label,
  value,
  suffix,
  color,
  showInfo,
  info,
}: {
  label: string
  value: number
  suffix: string
  color: string
  showInfo: boolean
  info: { name: string; description: string; formula: string }
}) {
  return (
    <div
      className={css({
        p: 3,
        bg: 'rgba(0, 0, 0, 0.2)',
        rounded: 'lg',
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        })}
      >
        <span className={css({ fontSize: 'sm', color: 'gray.300' })}>{label}</span>
        <span className={css({ fontSize: 'lg', fontWeight: 'bold', color })}>
          {value} <span className={css({ fontSize: 'xs', fontWeight: 'normal' })}>{suffix}</span>
        </span>
      </div>
      {showInfo && (
        <div
          className={css({
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.05)',
          })}
        >
          <p className={css({ fontSize: 'xs', color: 'gray.500', mb: 1 })}>{info.description}</p>
          <code
            className={css({
              fontSize: 'xs',
              color: 'gray.600',
              fontFamily: 'mono',
            })}
          >
            {info.formula}
          </code>
        </div>
      )}
    </div>
  )
}

// Tip Card Component
function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={css({
        p: 4,
        bg: 'rgba(0, 0, 0, 0.2)',
        rounded: 'lg',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      })}
    >
      <h4 className={css({ fontSize: 'md', fontWeight: 'semibold', color: 'white', mb: 2 })}>
        {title}
      </h4>
      <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: '1.6' })}>{description}</p>
    </div>
  )
}
