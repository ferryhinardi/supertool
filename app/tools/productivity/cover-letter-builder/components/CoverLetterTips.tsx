'use client'

import { CheckCircle2, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

export function CoverLetterTips() {
  const tips = [
    {
      title: 'Personalize Every Letter',
      description:
        'Research the company and reference specific details about their mission, culture, or recent achievements.',
    },
    {
      title: "Show, Don't Tell",
      description:
        'Use specific examples and metrics to demonstrate your qualifications instead of generic statements.',
    },
    {
      title: 'Keep It Concise',
      description:
        'Aim for 250-400 words (3-4 paragraphs). Hiring managers spend an average of 6 seconds reviewing each letter.',
    },
    {
      title: 'Mirror the Job Description',
      description:
        "Use keywords from the job posting to show you're a perfect fit and help pass ATS (Applicant Tracking Systems).",
    },
    {
      title: 'Strong Opening Hook',
      description:
        'Start with enthusiasm and immediately connect your experience to the role. Avoid clichés like "I am writing to apply..."',
    },
    {
      title: 'End with Action',
      description:
        'Close confidently with a clear call-to-action, expressing eagerness for next steps or an interview.',
    },
  ]

  const commonMistakes = [
    'Repeating your resume word-for-word',
    'Generic salutations like "To Whom It May Concern"',
    'Focusing only on what you want (salary, benefits)',
    'Typos and grammatical errors',
    'Being too modest or too arrogant',
    'Exceeding one page in length',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'lg' })}
        >
          <Lightbulb className={css({ w: '5', h: '5', color: 'yellow.500' })} />
          Tips & Best Practices
        </CardTitle>
      </CardHeader>
      <CardContent className={css({ spaceY: '4' })}>
        {/* Best Practices */}
        <div className={css({ spaceY: '3' })}>
          <div className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}>
            Best Practices
          </div>
          <div className={css({ spaceY: '3' })}>
            {tips.map((tip) => (
              <div
                key={tip.title}
                className={css({
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '2',
                  p: '3',
                  bg: 'gray.50',
                  rounded: 'md',
                  border: '1px solid',
                  borderColor: 'gray.200',
                })}
              >
                <CheckCircle2
                  className={css({ w: '4', h: '4', color: 'green.600', flexShrink: 0, mt: '0.5' })}
                />
                <div className={css({ flex: 1 })}>
                  <div
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.900',
                      mb: '1',
                    })}
                  >
                    {tip.title}
                  </div>
                  <div
                    className={css({ fontSize: 'xs', color: 'gray.700', lineHeight: 'relaxed' })}
                  >
                    {tip.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div
          className={css({ spaceY: '2', pt: '3', borderTop: '1px solid', borderColor: 'gray.200' })}
        >
          <div className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.300' })}>
            Common Mistakes to Avoid
          </div>
          <ul className={css({ pl: '4', spaceY: '1', listStyle: 'disc' })}>
            {commonMistakes.map((mistake) => (
              <li key={mistake} className={css({ fontSize: 'xs', color: 'gray.300' })}>
                {mistake}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Tip */}
        <div
          className={css({
            p: '3',
            bg: 'blue.50',
            rounded: 'md',
            border: '1px solid',
            borderColor: 'blue.200',
          })}
        >
          <div
            className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.900', mb: '1' })}
          >
            💡 Pro Tip
          </div>
          <div className={css({ fontSize: 'xs', color: 'blue.800', lineHeight: 'relaxed' })}>
            Before sending, read your cover letter out loud. This helps catch awkward phrasing and
            ensures your tone is professional yet conversational. Also, have someone else review it
            for a fresh perspective.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
