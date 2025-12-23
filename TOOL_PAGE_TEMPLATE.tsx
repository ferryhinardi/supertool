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
 *
 * Reference: /tools/unit-converter/page.tsx for detailed example
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Copy, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export default function ToolPageTemplate() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleProcess = async () => {
    if (!input.trim()) {
      toast.error('Please enter input')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Replace 'json_beautify' with your actual tool event
      trackToolEvent('json_beautify', {
        success: true,
        input_length: input.length,
      })
      // TODO: Add your processing logic here
      setOutput('Processed result')
      toast.success('Success! ✓')
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
      toast.success('Copied to clipboard! ✓')
      // TODO: Replace 'json_copy' with your actual tool event
      trackToolEvent('json_copy', { length: output.length })
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleReset = () => {
    setInput('')
    setOutput('')
    // TODO: Replace 'split_bill_reset' with your actual tool event
    trackToolEvent('split_bill_reset', {})
  }

  const animationVariants = shouldReduceMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

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
      <motion.div
        initial={animationVariants.initial}
        animate={animationVariants.animate}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'purple.500/10',
            px: '4',
            py: '2',
          })}
        >
          <Sparkles
            className={css({
              h: '4',
              w: '4',
              color: 'purple.400',
              flexShrink: '0',
            })}
          />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'purple.300',
            })}
          >
            Tool Name
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'blue.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tool Title
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'base', sm: 'lg' },
            color: 'gray.400',
          })}
        >
          Clear description of what this tool does and how it helps users
        </p>
      </motion.div>

      {/* Main Tool Section */}
      <motion.div
        initial={animationVariants.initial}
        animate={animationVariants.animate}
        transition={{ delay: 0.1, duration: 0.5 }}
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
                  color: 'gray.300',
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
                  bg: 'gray.800/50',
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
      </motion.div>

      {/* Output Section */}
      {output && (
        <motion.div
          initial={animationVariants.initial}
          animate={animationVariants.animate}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'cyan.500/20',
              bg: 'cyan.500/5',
              backdropFilter: 'blur(16px)',
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
                    minH: '10',
                    minW: '10',
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
                  bg: 'gray.800/50',
                  p: '4',
                  fontSize: { base: 'sm', sm: 'base' },
                  color: 'gray.200',
                  wordBreak: 'break-word',
                  maxH: '400px',
                  overflow: 'auto',
                })}
              >
                {output}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info/Help Section */}
      <motion.div
        initial={animationVariants.initial}
        animate={animationVariants.animate}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className={css({ spaceY: '3' })}>
            <ul
              className={css({
                spaceY: '2',
                listStyleType: 'disc',
                pl: '5',
                fontSize: { base: 'sm', sm: 'base' },
                color: 'gray.300',
              })}
            >
              <li>Step 1: Enter your input</li>
              <li>Step 2: Click Process button</li>
              <li>Step 3: Copy or download result</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
