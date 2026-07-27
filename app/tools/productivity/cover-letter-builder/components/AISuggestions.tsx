'use client'

import { AlertCircle, CheckCircle2, Loader2, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { PaywallModal } from '@/components/features/monetization/PaywallModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/auth/supabaseClient'
import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../types'

interface AISuggestionsProps {
  coverLetter: CoverLetterData
  onApplySuggestion: (field: string, value: string) => void
  onAnalyticsEvent?: (event: string, data?: Record<string, unknown>) => void
}

type SuggestionType = 'opening' | 'body' | 'closing' | 'improve' | 'tone'

interface AIResponse {
  opening?: string
  body?: string
  closing?: string
  improved?: string
  suggestions?: string[]
  score?: number
  tone?: string
  strengths?: string[]
}

interface PaywallState {
  open: boolean
  reason: 'quota-exceeded' | 'anonymous-blocked'
  remaining?: number
}

export function AISuggestions({
  coverLetter,
  onApplySuggestion,
  onAnalyticsEvent,
}: AISuggestionsProps) {
  const [loading, setLoading] = useState<SuggestionType | null>(null)
  const [result, setResult] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null)
  const [paywallState, setPaywallState] = useState<PaywallState>({
    open: false,
    reason: 'quota-exceeded',
  })

  const callAI = async (action: string, data: Record<string, unknown>) => {
    try {
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/ai-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ action, data }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (response.status === 402 && responseData.status === 'paywall') {
          setPaywallState({
            open: true,
            reason: responseData.reason,
            remaining:
              typeof responseData.remaining === 'number' ? responseData.remaining : undefined,
          })
          return null
        }

        throw new Error(responseData.error || 'Failed to get AI suggestion')
      }

      setPaywallState((currentState) => ({ ...currentState, open: false }))
      setRemainingQuota(typeof responseData.remaining === 'number' ? responseData.remaining : null)

      return responseData.data as AIResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI suggestion'
      setError(errorMessage)
      throw err
    }
  }

  const generateOpening = async () => {
    setLoading('opening')
    onAnalyticsEvent?.('cover_letter_ai_suggestion_requested', { type: 'opening' })

    try {
      const data = await callAI('generate-opening', {
        position: coverLetter.position,
        companyName: coverLetter.recipient.companyName,
        fullName: coverLetter.personal.fullName,
        context: 'relevant experience and qualifications',
      })

      if (data) {
        setResult(data)
      }
    } catch (err) {
      console.error('Error generating opening:', err)
    } finally {
      setLoading(null)
    }
  }

  const generateBody = async () => {
    setLoading('body')
    onAnalyticsEvent?.('cover_letter_ai_suggestion_requested', { type: 'body' })

    try {
      const data = await callAI('generate-body', {
        position: coverLetter.position,
        companyName: coverLetter.recipient.companyName,
        department: coverLetter.recipient.department,
        context: 'relevant experience, achievements, and skills',
      })

      if (data) {
        setResult(data)
      }
    } catch (err) {
      console.error('Error generating body:', err)
    } finally {
      setLoading(null)
    }
  }

  const generateClosing = async () => {
    setLoading('closing')
    onAnalyticsEvent?.('cover_letter_ai_suggestion_requested', { type: 'closing' })

    try {
      const data = await callAI('generate-closing', {
        position: coverLetter.position,
        companyName: coverLetter.recipient.companyName,
        hiringManagerName: coverLetter.recipient.hiringManagerName,
      })

      if (data) {
        setResult(data)
      }
    } catch (err) {
      console.error('Error generating closing:', err)
    } finally {
      setLoading(null)
    }
  }

  const improveContent = async () => {
    setLoading('improve')
    onAnalyticsEvent?.('cover_letter_ai_content_improved', {})

    try {
      const fullContent = `${coverLetter.content.opening}\n\n${coverLetter.content.body}\n\n${coverLetter.content.closing}`
      const data = await callAI('improve-content', {
        content: fullContent,
        position: coverLetter.position,
        companyName: coverLetter.recipient.companyName,
      })

      if (data) {
        setResult(data)
      }
    } catch (err) {
      console.error('Error improving content:', err)
    } finally {
      setLoading(null)
    }
  }

  const checkTone = async () => {
    setLoading('tone')
    onAnalyticsEvent?.('cover_letter_ai_tone_checked', {})

    try {
      const fullContent = `${coverLetter.content.opening}\n\n${coverLetter.content.body}\n\n${coverLetter.content.closing}`
      const data = await callAI('check-tone', {
        content: fullContent,
        companyName: coverLetter.recipient.companyName,
        department: coverLetter.recipient.department,
      })

      if (data) {
        setResult(data)
      }
    } catch (err) {
      console.error('Error checking tone:', err)
    } finally {
      setLoading(null)
    }
  }

  const applyOpeningSuggestion = () => {
    if (result?.opening) {
      onApplySuggestion('content.opening', result.opening)
      onAnalyticsEvent?.('cover_letter_ai_suggestion_applied', { type: 'opening' })
      setResult(null)
    }
  }

  const applyBodySuggestion = () => {
    if (result?.body) {
      onApplySuggestion('content.body', result.body)
      onAnalyticsEvent?.('cover_letter_ai_suggestion_applied', { type: 'body' })
      setResult(null)
    }
  }

  const applyClosingSuggestion = () => {
    if (result?.closing) {
      onApplySuggestion('content.closing', result.closing)
      onAnalyticsEvent?.('cover_letter_ai_suggestion_applied', { type: 'closing' })
      setResult(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle
            className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'lg' })}
          >
            <Sparkles className={css({ w: '5', h: '5', color: 'purple.500' })} />
            AI Writing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className={css({ spaceY: '4' })}>
          <div className={css({ spaceY: '2' })}>
            <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              Generate Content
            </div>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
              <Button
                onClick={generateOpening}
                disabled={loading !== null}
                variant="outline"
                size="sm"
                className={css({ w: 'full', justifyContent: 'flex-start' })}
              >
                {loading === 'opening' ? (
                  <Loader2 className={css({ w: '4', h: '4', mr: '2', animation: 'spin' })} />
                ) : (
                  <Wand2 className={css({ w: '4', h: '4', mr: '2' })} />
                )}
                Generate Opening
              </Button>
              <Button
                onClick={generateBody}
                disabled={loading !== null}
                variant="outline"
                size="sm"
                className={css({ w: 'full', justifyContent: 'flex-start' })}
              >
                {loading === 'body' ? (
                  <Loader2 className={css({ w: '4', h: '4', mr: '2', animation: 'spin' })} />
                ) : (
                  <Wand2 className={css({ w: '4', h: '4', mr: '2' })} />
                )}
                Generate Body
              </Button>
              <Button
                onClick={generateClosing}
                disabled={loading !== null}
                variant="outline"
                size="sm"
                className={css({ w: 'full', justifyContent: 'flex-start' })}
              >
                {loading === 'closing' ? (
                  <Loader2 className={css({ w: '4', h: '4', mr: '2', animation: 'spin' })} />
                ) : (
                  <Wand2 className={css({ w: '4', h: '4', mr: '2' })} />
                )}
                Generate Closing
              </Button>
            </div>
          </div>

          <div className={css({ spaceY: '2' })}>
            <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              Improve & Analyze
            </div>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
              <Button
                onClick={improveContent}
                disabled={loading !== null || !coverLetter.content.opening}
                variant="outline"
                size="sm"
                className={css({ w: 'full', justifyContent: 'flex-start' })}
              >
                {loading === 'improve' ? (
                  <Loader2 className={css({ w: '4', h: '4', mr: '2', animation: 'spin' })} />
                ) : (
                  <Sparkles className={css({ w: '4', h: '4', mr: '2' })} />
                )}
                Improve Content
              </Button>
              <Button
                onClick={checkTone}
                disabled={loading !== null || !coverLetter.content.opening}
                variant="outline"
                size="sm"
                className={css({ w: 'full', justifyContent: 'flex-start' })}
              >
                {loading === 'tone' ? (
                  <Loader2 className={css({ w: '4', h: '4', mr: '2', animation: 'spin' })} />
                ) : (
                  <CheckCircle2 className={css({ w: '4', h: '4', mr: '2' })} />
                )}
                Check Tone
              </Button>
            </div>
          </div>

          {typeof remainingQuota === 'number' && (
            <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
              Remaining free AI uses today: {remainingQuota}
            </div>
          )}

          {error && (
            <div
              className={css({
                p: '3',
                bg: 'red.50',
                border: '1px solid',
                borderColor: 'red.200',
                borderRadius: 'md',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '2',
              })}
            >
              <AlertCircle
                className={css({ w: '4', h: '4', color: 'red.600', flexShrink: 0, mt: '0.5' })}
              />
              <div className={css({ fontSize: 'sm', color: 'red.800' })}>{error}</div>
            </div>
          )}

          {result && (
            <div
              className={css({
                p: '4',
                bg: 'purple.50',
                border: '1px solid',
                borderColor: 'purple.200',
                borderRadius: 'md',
                spaceY: '3',
              })}
            >
              {result.opening && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.900' })}
                  >
                    Suggested Opening:
                  </div>
                  <div
                    className={css({ fontSize: 'sm', color: 'gray.300', whiteSpace: 'pre-wrap' })}
                  >
                    {result.opening}
                  </div>
                  <Button onClick={applyOpeningSuggestion} size="sm" className={css({ mt: '2' })}>
                    Apply Opening
                  </Button>
                </div>
              )}

              {result.body && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.900' })}
                  >
                    Suggested Body:
                  </div>
                  <div
                    className={css({ fontSize: 'sm', color: 'gray.300', whiteSpace: 'pre-wrap' })}
                  >
                    {result.body}
                  </div>
                  <Button onClick={applyBodySuggestion} size="sm" className={css({ mt: '2' })}>
                    Apply Body
                  </Button>
                </div>
              )}

              {result.closing && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.900' })}
                  >
                    Suggested Closing:
                  </div>
                  <div
                    className={css({ fontSize: 'sm', color: 'gray.300', whiteSpace: 'pre-wrap' })}
                  >
                    {result.closing}
                  </div>
                  <Button onClick={applyClosingSuggestion} size="sm" className={css({ mt: '2' })}>
                    Apply Closing
                  </Button>
                </div>
              )}

              {result.improved && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.900' })}
                  >
                    Improved Version:
                  </div>
                  <div
                    className={css({ fontSize: 'sm', color: 'gray.300', whiteSpace: 'pre-wrap' })}
                  >
                    {result.improved}
                  </div>
                  {result.score && (
                    <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                      Original score: {result.score}/10
                    </div>
                  )}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className={css({ spaceY: '1' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'purple.800',
                        })}
                      >
                        Improvements made:
                      </div>
                      <ul
                        className={css({
                          pl: '4',
                          listStyle: 'disc',
                          fontSize: 'sm',
                          color: 'gray.300',
                        })}
                      >
                        {result.suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.tone && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.900' })}
                  >
                    Tone Analysis:
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.300' })}>{result.tone}</div>
                  {result.score && (
                    <div className={css({ fontSize: 'sm', color: 'gray.300' })}>
                      Tone score: {result.score}/10
                    </div>
                  )}
                  {result.strengths && result.strengths.length > 0 && (
                    <div className={css({ spaceY: '1' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.800',
                        })}
                      >
                        Strengths:
                      </div>
                      <ul
                        className={css({
                          pl: '4',
                          listStyle: 'disc',
                          fontSize: 'sm',
                          color: 'gray.300',
                        })}
                      >
                        {result.strengths.map((strength) => (
                          <li key={strength}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className={css({ spaceY: '1' })}>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'purple.800',
                        })}
                      >
                        Suggestions:
                      </div>
                      <ul
                        className={css({
                          pl: '4',
                          listStyle: 'disc',
                          fontSize: 'sm',
                          color: 'gray.300',
                        })}
                      >
                        {result.suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => setResult(null)}
                variant="ghost"
                size="sm"
                className={css({ w: 'full', mt: '2' })}
              >
                Close
              </Button>
            </div>
          )}

          <div
            className={css({
              fontSize: 'xs',
              color: 'gray.400',
              pt: '2',
              borderTop: '1px solid',
              borderColor: 'gray.200',
            })}
          >
            AI suggestions are generated based on your job details. Review and edit before applying.
          </div>
        </CardContent>
      </Card>

      <PaywallModal
        open={paywallState.open}
        onOpenChange={(open) => setPaywallState((currentState) => ({ ...currentState, open }))}
        reason={paywallState.reason}
        toolSlug="cover-letter-builder"
        remaining={paywallState.remaining}
      />
    </>
  )
}
