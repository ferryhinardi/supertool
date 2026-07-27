'use client'

import { AlertCircle, CheckCircle2, Loader2, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { PaywallModal } from '@/components/features/monetization/PaywallModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/auth/supabaseClient'
import type { ToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import type { AIContentResponse, ResumeData } from '../types'

type ResumeAISuggestionEvent = Extract<
  ToolEvent,
  'resume_ai_suggestion_requested' | 'resume_ai_suggestion_applied'
>

interface AISuggestionsPanelProps {
  resume: ResumeData
  onApplySummary: (summary: string) => void
  onAnalyticsEvent?: (event: ResumeAISuggestionEvent, data?: Record<string, unknown>) => void
}

interface PaywallState {
  open: boolean
  reason: 'quota-exceeded' | 'anonymous-blocked'
  remaining?: number
}

export function AISuggestionsPanel({
  resume,
  onApplySummary,
  onAnalyticsEvent,
}: AISuggestionsPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIContentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null)
  const [paywallState, setPaywallState] = useState<PaywallState>({
    open: false,
    reason: 'quota-exceeded',
  })

  const callAI = async () => {
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    const response = await fetch('/api/ai-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        type: 'summary',
        context: {
          role: resume.personal.professionalTitle,
          currentContent: resume.personal.summary,
          yearsOfExperience: resume.experience.length,
          skills: resume.skills.flatMap((group) => group.skills).slice(0, 12),
        },
      }),
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

    return responseData.data as AIContentResponse
  }

  const generateSummary = async () => {
    setLoading(true)
    onAnalyticsEvent?.('resume_ai_suggestion_requested', { type: 'summary' })

    try {
      const data = await callAI()
      if (data) {
        setResult(data)
      }
    } catch (err) {
      console.error('Error generating resume summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestion')
    } finally {
      setLoading(false)
    }
  }

  const applySummary = () => {
    const summary = result?.suggestions?.[0]
    if (!summary) {
      return
    }

    onApplySummary(summary)
    onAnalyticsEvent?.('resume_ai_suggestion_applied', { type: 'summary' })
    setResult(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle
            className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'lg' })}
          >
            <Sparkles className={css({ w: '5', h: '5', color: 'purple.500' })} />
            AI Resume Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className={css({ spaceY: '4' })}>
          <Button
            onClick={generateSummary}
            disabled={loading}
            variant="outline"
            size="sm"
            className={css({ w: 'full', justifyContent: 'flex-start' })}
          >
            {loading ? (
              <Loader2 className={css({ w: '4', h: '4', mr: '2', animation: 'spin' })} />
            ) : (
              <Wand2 className={css({ w: '4', h: '4', mr: '2' })} />
            )}
            Generate AI Summary
          </Button>

          {typeof remainingQuota === 'number' && (
            <div className={css({ fontSize: 'sm', color: 'gray.600' })}>
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
              {result.suggestions?.[0] && (
                <div className={css({ spaceY: '2' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.900' })}
                  >
                    Suggested Summary:
                  </div>
                  <div
                    className={css({ fontSize: 'sm', color: 'gray.700', whiteSpace: 'pre-wrap' })}
                  >
                    {result.suggestions[0]}
                  </div>
                  <Button onClick={applySummary} size="sm" className={css({ mt: '2' })}>
                    Apply Summary
                  </Button>
                </div>
              )}

              {result.keywords?.length ? (
                <div className={css({ spaceY: '1' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.800' })}
                  >
                    Suggested Keywords:
                  </div>
                  <div className={css({ fontSize: 'sm', color: 'gray.700' })}>
                    {result.keywords.join(', ')}
                  </div>
                </div>
              ) : null}

              {result.improvements?.length ? (
                <div className={css({ spaceY: '1' })}>
                  <div
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'green.800' })}
                  >
                    Improvements:
                  </div>
                  <ul
                    className={css({
                      pl: '4',
                      listStyle: 'disc',
                      fontSize: 'sm',
                      color: 'gray.700',
                    })}
                  >
                    {result.improvements.map((improvement) => (
                      <li key={improvement}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button
                onClick={() => setResult(null)}
                variant="ghost"
                size="sm"
                className={css({ w: 'full', mt: '2' })}
              >
                <CheckCircle2 className={css({ w: '4', h: '4', mr: '2' })} />
                Close
              </Button>
            </div>
          )}

          <div
            className={css({
              fontSize: 'xs',
              color: 'gray.500',
              pt: '2',
              borderTop: '1px solid',
              borderColor: 'gray.200',
            })}
          >
            AI suggestions use only the active resume context for this request. Review before
            applying.
          </div>
        </CardContent>
      </Card>

      <PaywallModal
        open={paywallState.open}
        onOpenChange={(open) => setPaywallState((currentState) => ({ ...currentState, open }))}
        reason={paywallState.reason}
        toolSlug="resume-builder"
        remaining={paywallState.remaining}
      />
    </>
  )
}
