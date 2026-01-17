'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQItem[]
  title?: string
  description?: string
}

export function FAQSection({
  faqs,
  title = 'Frequently Asked Questions',
  description,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <Card
      className={css({
        borderColor: 'gray.800',
        bg: 'gray.900/50',
        backdropFilter: 'blur(4px)',
      })}
    >
      <CardHeader>
        <CardTitle
          className={css({
            fontSize: { base: 'xl', sm: '2xl' },
            fontWeight: 'bold',
            color: 'white',
          })}
        >
          {title}
        </CardTitle>
        {description && (
          <p
            className={css({
              color: 'gray.400',
              fontSize: 'sm',
              mt: '2',
            })}
          >
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={css({
            p: { base: '4', sm: '5', md: '6' },
            spaceY: '4',
          })}
        >
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className={css({
                borderWidth: '1',
                borderColor: 'gray.800',
                borderRadius: 'lg',
                overflow: 'hidden',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'gray.700',
                },
              })}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className={css({
                  w: 'full',
                  p: '4',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '3',
                  textAlign: 'left',
                  bg: openIndex === index ? 'gray.800/50' : 'transparent',
                  transition: 'background-color 0.2s',
                  _hover: {
                    bg: 'gray.800/30',
                  },
                  cursor: 'pointer',
                })}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span
                  className={css({
                    fontSize: { base: 'sm', sm: 'base' },
                    fontWeight: 'semibold',
                    color: 'white',
                    flex: '1',
                  })}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={css({
                    w: '5',
                    h: '5',
                    color: 'gray.400',
                    flexShrink: '0',
                    transition: 'transform 0.2s',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  })}
                />
              </button>

              {openIndex === index && (
                <section
                  id={`faq-answer-${index}`}
                  className={css({
                    p: '4',
                    pt: '0',
                    color: 'gray.300',
                    fontSize: { base: 'sm', sm: 'base' },
                    lineHeight: 'relaxed',
                    animation: 'fadeIn 0.2s ease-in',
                  })}
                  aria-labelledby={`faq-question-${index}`}
                >
                  {faq.answer}
                </section>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact FAQ component for use in sidebars or smaller spaces
 */
export function CompactFAQSection({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={css({ spaceY: '2' })}>
      {faqs.map((faq, index) => (
        <div
          key={faq.question}
          className={css({
            borderWidth: '1',
            borderColor: 'gray.800',
            borderRadius: 'md',
            overflow: 'hidden',
          })}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className={css({
              w: 'full',
              p: '3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: '2',
              textAlign: 'left',
              bg: 'transparent',
              transition: 'background-color 0.2s',
              _hover: {
                bg: 'gray.800/30',
              },
              cursor: 'pointer',
            })}
          >
            <span
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'white',
                flex: '1',
              })}
            >
              {faq.question}
            </span>
            <ChevronDown
              className={css({
                w: '4',
                h: '4',
                color: 'gray.400',
                flexShrink: '0',
                transition: 'transform 0.2s',
                transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
              })}
            />
          </button>

          {openIndex === index && (
            <div
              className={css({
                px: '3',
                pb: '3',
                color: 'gray.400',
                fontSize: 'xs',
                lineHeight: 'relaxed',
              })}
            >
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
