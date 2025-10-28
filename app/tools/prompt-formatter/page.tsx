'use client'

import { motion } from 'framer-motion'
import { Copy, Download, Sparkles, Wand2, Zap } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  category: 'basic' | 'advanced' | 'specialized'
}

const templates: PromptTemplate[] = [
  {
    id: 'few-shot',
    name: 'Few-Shot Learning',
    description: 'Provide examples to guide AI responses',
    category: 'basic',
    template: `Task: [Describe your task]

Examples:
1. Input: [Example 1]
   Output: [Expected result 1]

2. Input: [Example 2]
   Output: [Expected result 2]

Now handle this:
Input: [Your actual input]
Output:`,
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    description: 'Break down complex reasoning step by step',
    category: 'advanced',
    template: `Problem: [Your problem statement]

Let's solve this step by step:
1. First, identify [key aspect]
2. Then, analyze [another aspect]
3. Next, consider [additional factor]
4. Finally, conclude [solution]

Think through each step carefully and show your reasoning.`,
  },
  {
    id: 'role-based',
    name: 'Role-Based',
    description: 'Assign a specific role or persona to the AI',
    category: 'basic',
    template: `You are a [specific role/expert]. Your expertise includes [key areas].

Context: [Provide relevant background]

Task: [What you need help with]

Please respond as a [role] would, considering [specific factors].`,
  },
  {
    id: 'structured-output',
    name: 'Structured Output',
    description: 'Request responses in a specific format',
    category: 'advanced',
    template: `Task: [Your task]

Please provide your response in the following format:

**Summary**: [Brief overview]

**Key Points**:
- Point 1: [Details]
- Point 2: [Details]
- Point 3: [Details]

**Recommendations**: [Actionable suggestions]

**Additional Notes**: [Optional context]`,
  },
  {
    id: 'zero-shot',
    name: 'Zero-Shot',
    description: 'Direct instruction without examples',
    category: 'basic',
    template: `Objective: [Clearly state what you want]

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Context: [Relevant background information]

Please provide [desired output type].`,
  },
  {
    id: 'iterative-refinement',
    name: 'Iterative Refinement',
    description: 'Multi-stage prompting for better results',
    category: 'advanced',
    template: `Initial Task: [First request]

After you provide the initial response, I will ask you to:
1. Review and identify areas for improvement
2. Refine the response based on [specific criteria]
3. Provide a final polished version

Let's start with the initial task.`,
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Specialized for programming tasks',
    category: 'specialized',
    template: `Language: [Programming language]
Task: [What the code should do]

Requirements:
- [Technical requirement 1]
- [Technical requirement 2]
- [Best practices to follow]

Constraints:
- [Limitation 1]
- [Limitation 2]

Please provide:
1. Code implementation with comments
2. Usage example
3. Any important notes or considerations`,
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing',
    description: 'Optimized for creative content generation',
    category: 'specialized',
    template: `Genre: [Type of content]
Theme: [Main theme or topic]
Tone: [Desired tone - e.g., professional, casual, humorous]
Length: [Approximate word count]

Key elements to include:
- [Element 1]
- [Element 2]
- [Element 3]

Target audience: [Who this is for]

Please create [type of content] incorporating these elements.`,
  },
]

const aiModels = [
  { id: 'chatgpt', name: 'ChatGPT', tips: 'Works well with conversational, structured prompts' },
  { id: 'claude', name: 'Claude', tips: 'Excels with detailed context and step-by-step reasoning' },
  { id: 'gemini', name: 'Gemini', tips: 'Strong with multimodal inputs and creative tasks' },
  { id: 'general', name: 'General', tips: 'Universal format compatible with most AI models' },
]

function PromptFormatterContent() {
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('general')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    trackToolEvent('prompt_formatter_open', {})
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setInput(template.template)
      setOutput(template.template)
      toast.success(`Applied ${template.name} template`)
      trackToolEvent('prompt_formatter_template_apply', { template: templateId })
    }
  }

  const handleFormat = () => {
    if (!input.trim()) {
      toast.error('Please enter a prompt to format')
      return
    }

    let formatted = input.trim()

    // Add model-specific optimizations
    if (selectedModel === 'chatgpt') {
      formatted = `System: You are a helpful assistant that provides clear, accurate, and detailed responses.\n\n${formatted}`
    } else if (selectedModel === 'claude') {
      formatted = `Here is the task:\n\n${formatted}\n\nPlease think through this carefully and provide a comprehensive response.`
    } else if (selectedModel === 'gemini') {
      formatted = `Task:\n${formatted}\n\nPlease analyze this thoroughly and provide a well-structured response.`
    }

    // Enhance formatting
    formatted = formatted
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n\n')

    setOutput(formatted)
    toast.success('Prompt formatted successfully')
    trackToolEvent('prompt_formatter_format', {
      model: selectedModel,
      input_length: input.length,
    })
  }

  const handleCopy = () => {
    if (!output) {
      toast.error('No formatted prompt to copy')
      return
    }

    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard')
    trackToolEvent('prompt_formatter_copy', {})
  }

  const handleDownload = () => {
    if (!output) {
      toast.error('No formatted prompt to download')
      return
    }

    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Prompt downloaded')
    trackToolEvent('prompt_formatter_download', {})
  }

  const handleOptimize = () => {
    if (!input.trim()) {
      toast.error('Please enter a prompt to optimize')
      return
    }

    let optimized = input.trim()

    // Add clarity improvements
    if (!optimized.includes('Task:') && !optimized.includes('Objective:')) {
      optimized = `Task: ${optimized}`
    }

    // Add context section if missing
    if (!optimized.toLowerCase().includes('context:')) {
      optimized += '\n\nContext: [Add relevant background information here]'
    }

    // Add expected output format if missing
    if (
      !optimized.toLowerCase().includes('format:') &&
      !optimized.toLowerCase().includes('output:')
    ) {
      optimized += '\n\nExpected Output: [Describe the desired format or structure]'
    }

    setOutput(optimized)
    toast.success('Prompt optimized with structure')
    trackToolEvent('prompt_formatter_optimize', {})
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setSelectedTemplate('')
    toast.success('Cleared all fields')
    trackToolEvent('prompt_formatter_clear', {})
  }

  const basicTemplates = templates.filter((t) => t.category === 'basic')
  const advancedTemplates = templates.filter((t) => t.category === 'advanced')
  const specializedTemplates = templates.filter((t) => t.category === 'specialized')

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'purple.500/30',
            bg: 'purple.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            AI-Powered Prompt Engineering
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
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
          Prompt Formatter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Transform your AI prompts with professional templates and formatting. Optimize for
          ChatGPT, Claude, Gemini, and more. Get better results with structured, clear prompts.
        </p>
      </motion.div>

      {/* AI Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            <CardTitle>Select AI Model</CardTitle>
            <CardDescription>Choose your target AI model for optimized formatting</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: '3',
              })}
            >
              {aiModels.map((model) => {
                const isActive = selectedModel === model.id
                return (
                  <Button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id)
                      trackToolEvent('prompt_formatter_model_change', { model: model.id })
                    }}
                    className={css({
                      h: 'auto',
                      flexDirection: 'column',
                      gap: '2',
                      py: '4',
                      px: '3',
                      bg: isActive ? 'purple.500/20' : 'gray.800/50',
                      border: '1px solid',
                      borderColor: isActive ? 'purple.500/50' : 'gray.700/50',
                      color: isActive ? 'purple.300' : 'gray.400',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: isActive ? 'purple.500/30' : 'gray.800',
                        borderColor: isActive ? 'purple.500/70' : 'gray.600',
                        transform: 'translateY(-2px)',
                      },
                    })}
                  >
                    <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                      {model.name}
                    </span>
                    <span
                      className={css({ fontSize: 'xs', color: 'gray.500', textAlign: 'center' })}
                    >
                      {model.tips}
                    </span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prompt Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'pink.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Prompt Templates</CardTitle>
            <CardDescription>Start with a professional template or create your own</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Basic Templates */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge
                  className={css({
                    bg: 'green.500/20',
                    color: 'green.300',
                    border: '1px solid',
                    borderColor: 'green.500/30',
                  })}
                >
                  Basic
                </Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Essential prompt patterns
                </span>
              </div>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: '3',
                })}
              >
                {basicTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: '2',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor:
                        selectedTemplate === template.id ? 'purple.500/50' : 'gray.700/50',
                      bg: selectedTemplate === template.id ? 'purple.500/10' : 'gray.800/50',
                      p: '4',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    })}
                  >
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {template.name}
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Templates */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                  })}
                >
                  Advanced
                </Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Sophisticated prompt engineering
                </span>
              </div>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: '3',
                })}
              >
                {advancedTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: '2',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor:
                        selectedTemplate === template.id ? 'purple.500/50' : 'gray.700/50',
                      bg: selectedTemplate === template.id ? 'purple.500/10' : 'gray.800/50',
                      p: '4',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    })}
                  >
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {template.name}
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialized Templates */}
            <div className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Badge
                  className={css({
                    bg: 'purple.500/20',
                    color: 'purple.300',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                  })}
                >
                  Specialized
                </Badge>
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Task-specific templates
                </span>
              </div>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: '3',
                })}
              >
                {specializedTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: '2',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor:
                        selectedTemplate === template.id ? 'purple.500/50' : 'gray.700/50',
                      bg: selectedTemplate === template.id ? 'purple.500/10' : 'gray.800/50',
                      p: '4',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    })}
                  >
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.200' })}
                    >
                      {template.name}
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Input/Output */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1', lg: 'repeat(2, 1fr)' },
          gap: '6',
        })}
      >
        {/* Input */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Input Prompt</CardTitle>
            <CardDescription>Enter or paste your prompt here</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your prompt or select a template..."
              className={css({
                minH: '96',
                fontSize: 'sm',
                fontFamily: 'mono',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
                color: 'gray.200',
                resize: 'vertical',
                _focus: {
                  borderColor: 'blue.500',
                  ring: '2px',
                  ringColor: 'blue.500/20',
                },
              })}
            />
            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleFormat}
                className={css({
                  gap: '2',
                  bg: 'blue.500/20',
                  border: '1px solid',
                  borderColor: 'blue.500/50',
                  color: 'blue.300',
                  _hover: { bg: 'blue.500/30' },
                })}
              >
                <Wand2 className={css({ h: '4', w: '4' })} />
                Format
              </Button>
              <Button
                onClick={handleOptimize}
                className={css({
                  gap: '2',
                  bg: 'purple.500/20',
                  border: '1px solid',
                  borderColor: 'purple.500/50',
                  color: 'purple.300',
                  _hover: { bg: 'purple.500/30' },
                })}
              >
                <Zap className={css({ h: '4', w: '4' })} />
                Optimize
              </Button>
              <Button
                onClick={handleClear}
                className={css({
                  gap: '2',
                  bg: 'gray.800',
                  color: 'gray.400',
                  _hover: { bg: 'gray.700' },
                })}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
            <CardDescription>Your optimized prompt ready to use</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted prompt will appear here..."
              className={css({
                minH: '96',
                fontSize: 'sm',
                fontFamily: 'mono',
                bg: 'purple.500/10',
                border: '1px solid',
                borderColor: 'purple.500/30',
                color: 'purple.100',
                resize: 'vertical',
                cursor: 'default',
              })}
            />
            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleCopy}
                disabled={!output}
                className={css({
                  gap: '2',
                  bg: 'purple.500/20',
                  border: '1px solid',
                  borderColor: 'purple.500/50',
                  color: 'purple.300',
                  _hover: { bg: 'purple.500/30' },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!output}
                className={css({
                  gap: '2',
                  bg: 'pink.500/20',
                  border: '1px solid',
                  borderColor: 'pink.500/50',
                  color: 'pink.300',
                  _hover: { bg: 'pink.500/30' },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Prompt Engineering Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Be specific and clear about what you want the AI to do</li>
                  <li>• Provide context and relevant background information</li>
                  <li>• Use examples to guide the AI toward your desired output</li>
                  <li>• Break complex tasks into smaller, manageable steps</li>
                  <li>• Specify the format and structure of the expected response</li>
                  <li>• Iterate and refine your prompts based on the results</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

export default function PromptFormatterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptFormatterContent />
    </Suspense>
  )
}
