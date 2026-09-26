'use client'

/**
 * STANDARDIZED TOOL PAGE TEMPLATE
 *
 * Copy this template for new tools. It includes:
 * - Mobile-first responsive layout
 * - Proper touch targets (44px minimum)
 * - Accessibility best practices (ARIA labels, semantic HTML)
 * - Modern UX patterns (loading states, error handling)
 * - Panda CSS styling (no Tailwind utilities)
 * - Analytics tracking
 * - Website Revamp tokens (brand.surface, brand.ink, display titles)
 *
 * Visual source of truth: docs/design-system.md and /design-system
 */

import { Copy, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eyebrow } from '@/components/design-system'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export default function ToolPageTemplate() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleProcess = async () => {
    if (!input.trim()) {
      toast.error('Please enter input')
      return
    }

    setIsLoading(true)
    try {
      // Example analytics event. Rename this when creating a real tool page.
      trackToolEvent('json_beautify', {
        success: true,
        input_length: input.length,
      })
      // Example placeholder result. Replace with the tool's actual processing flow.
      setOutput('Processed result')
      toast.success('Success!')
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
      trackToolEvent('json_beautify', { success: false, error: 'unknown' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Copied to clipboard!')
      // Example analytics event. Rename this when creating a real tool page.
      trackToolEvent('json_copy', { length: output.length })
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleReset = () => {
    setInput('')
    setOutput('')
    // Example analytics event. Rename this when creating a real tool page.
    trackToolEvent('json_history_clear', {})
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
      {/* Header Section */}
      <div className={css({ textAlign: 'center', spaceY: '4', animation: 'fadeIn 0.5s ease-out' })}>
        <div className={css({ display: 'flex', justifyContent: 'center' })}>
          <Eyebrow icon={Sparkles}>Tool Name</Eyebrow>
        </div>

        <h1
          className={css({
            fontFamily: 'display',
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'extrabold',
            color: 'brand.ink',
            letterSpacing: '-0.03em',
          })}
        >
          Tool Title
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'base', sm: 'lg' },
            color: 'brand.muted',
          })}
        >
          Clear description of what this tool does
        </p>
      </div>

      {/* Main Tool Section */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        <Card>
          <CardHeader>
            <CardTitle>Input & Settings</CardTitle>
            <CardDescription>Configure your options</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Input Field */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="input-field"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'brand.muted',
                })}
              >
                Input
              </label>
              <Input
                id="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                disabled={isLoading}
                className={css({
                  h: '11', // 44px for touch targets
                  bg: 'brand.canvas',
                  borderColor: 'brand.line',
                  color: 'brand.ink',
                  fontSize: { base: 'base', sm: 'sm' },
                })}
              />
            </div>

            {/* Action Buttons */}
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                gap: { base: '2', sm: '3' },
                justifyContent: 'center',
              })}
            >
              <Button
                onClick={handleProcess}
                disabled={isLoading || !input.trim()}
                className={css({
                  w: { base: 'full', sm: 'auto' },
                  minH: '11', // 44px minimum touch target
                  px: { base: '6', sm: '8' },
                })}
                aria-label="Process input"
              >
                {isLoading ? 'Processing...' : 'Process'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading || !input}
                className={css({
                  w: { base: 'full', sm: 'auto' },
                  minH: '11', // 44px minimum touch target
                  px: { base: '6', sm: '8' },
                })}
                aria-label="Reset form"
              >
                <RotateCcw className={css({ h: '4', w: '4', mr: '2' })} />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      {output && (
        <div className={css({ animation: 'fadeIn 0.3s ease-out' })}>
          <Card
            className={css({
              borderColor: 'rgba(78, 224, 174, 0.28)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '2',
                })}
              >
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>Your processed result</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className={css({
                    minH: '11',
                    minW: '11',
                    px: '2',
                  })}
                  aria-label="Copy output"
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre
                className={css({
                  rounded: 'lg',
                  bg: 'brand.canvas',
                  p: '4',
                  fontFamily: 'mono',
                  fontSize: { base: 'sm', sm: 'base' },
                  color: 'brand.ink',
                  wordBreak: 'break-word',
                  maxH: '400px',
                  overflow: 'auto',
                })}
              >
                {output}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
