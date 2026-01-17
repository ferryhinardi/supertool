import { Accordion } from '@ark-ui/react'
import { cx } from '@/lib/utils'
import { css } from '@/styled-system/css'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
  className?: string
}

export function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  return (
    <section
      className={cx(
        css({
          w: 'full',
          maxW: '4xl',
          mx: 'auto',
          mt: '12',
          mb: '8',
        }),
        className
      )}
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'fg.default',
          mb: '6',
          textAlign: 'center',
        })}
      >
        Frequently Asked Questions
      </h2>

      <Accordion.Root
        collapsible
        className={css({
          w: 'full',
          borderRadius: 'lg',
          bg: 'bg.surface',
          border: '1px solid',
          borderColor: 'border.default',
          overflow: 'hidden',
        })}
      >
        {faqs.map((faq, index) => (
          <Accordion.Item
            key={faq.question}
            value={`faq-${index}`}
            className={css({
              borderBottom: '1px solid',
              borderColor: 'border.default',
              _last: {
                borderBottom: 'none',
              },
            })}
          >
            <Accordion.ItemTrigger
              className={css({
                w: 'full',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '4',
                p: '4',
                md: {
                  p: '5',
                },
                bg: 'transparent',
                color: 'fg.default',
                fontSize: 'md',
                fontWeight: 'medium',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all',
                transitionDuration: '200ms',
                _hover: {
                  bg: 'bg.muted',
                },
                _focus: {
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'accent.default',
                  ringOffset: '2px',
                },
              })}
            >
              <span>{faq.question}</span>
              <Accordion.ItemIndicator
                className={css({
                  transition: 'transform',
                  transitionDuration: '200ms',
                  _open: {
                    transform: 'rotate(180deg)',
                  },
                })}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent
              className={css({
                overflow: 'hidden',
                fontSize: 'sm',
                color: 'fg.muted',
                lineHeight: 'relaxed',
              })}
            >
              <div
                className={css({
                  p: '4',
                  pt: '0',
                  md: {
                    px: '5',
                    pb: '5',
                  },
                })}
              >
                {faq.answer}
              </div>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  )
}
