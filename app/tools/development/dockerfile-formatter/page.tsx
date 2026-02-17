'use client'

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  Info,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface DockerfileIssue {
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

interface FormattingStats {
  totalLines: number
  instructions: number
  layers: number
  issues: number
}

function DockerfileFormatterContent() {
  const [dockerfile, setDockerfile] = useState('')
  const [formattedDockerfile, setFormattedDockerfile] = useState('')
  const [issues, setIssues] = useState<DockerfileIssue[]>([])
  const [stats, setStats] = useState<FormattingStats>({
    totalLines: 0,
    instructions: 0,
    layers: 0,
    issues: 0,
  })

  // Track page visit
  useEffect(() => {
    trackToolEvent('dockerfile_formatter_open', {})
  }, [])

  const formatDockerfile = (content: string): string => {
    const lines = content.split('\n')
    const formatted: string[] = []
    let inMultiLine = false
    let currentInstruction = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Skip empty lines at the start
      if (trimmed === '' && formatted.length === 0) {
        continue
      }

      // Handle comments
      if (trimmed.startsWith('#')) {
        formatted.push(trimmed)
        continue
      }

      // Check if line ends with backslash (continuation)
      if (trimmed.endsWith('\\')) {
        inMultiLine = true
        currentInstruction += `${trimmed}\n`
        continue
      }

      // Handle multi-line continuation
      if (inMultiLine) {
        currentInstruction += trimmed
        inMultiLine = false

        // Format the multi-line instruction
        const parts = currentInstruction.split('\\')
        const instruction = parts[0].split(/\s+/)[0].toUpperCase()
        const formattedParts = [`${instruction} ${parts[0].substring(instruction.length).trim()}`]

        for (let j = 1; j < parts.length; j++) {
          const part = parts[j].trim()
          if (part) {
            formattedParts.push(`  ${part}${j < parts.length - 1 ? ' \\' : ''}`)
          }
        }

        formatted.push(formattedParts.join('\n'))
        currentInstruction = ''
        continue
      }

      // Format single-line instruction
      if (trimmed !== '') {
        const instruction = trimmed.split(/\s+/)[0].toUpperCase()
        const rest = trimmed.substring(instruction.length).trim()

        // Special formatting for specific instructions
        if (instruction === 'RUN' && rest.includes('&&')) {
          const commands = rest.split('&&').map((cmd) => cmd.trim())
          formatted.push(
            instruction +
              ' ' +
              commands.map((cmd, idx) => (idx === 0 ? cmd : `  && ${cmd}`)).join(' \\\n')
          )
        } else if (instruction === 'COPY' || instruction === 'ADD') {
          formatted.push(`${instruction} ${rest}`)
        } else {
          formatted.push(`${instruction} ${rest}`)
        }
      }
    }

    return formatted.join('\n')
  }

  const analyzeDockerfile = (content: string): DockerfileIssue[] => {
    const lines = content.split('\n')
    const detectedIssues: DockerfileIssue[] = []
    let hasFrom = false
    let layerCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineNum = i + 1

      // Skip empty lines and comments
      if (line === '' || line.startsWith('#')) continue

      const instruction = line.split(/\s+/)[0].toUpperCase()

      // Check for FROM instruction
      if (instruction === 'FROM') {
        hasFrom = true
        if (!line.includes(':')) {
          detectedIssues.push({
            line: lineNum,
            type: 'warning',
            message: 'Base image without tag (using latest)',
            suggestion: 'Always specify a version tag for reproducible builds',
          })
        }
        if (line.toLowerCase().includes(':latest')) {
          detectedIssues.push({
            line: lineNum,
            type: 'warning',
            message: 'Using :latest tag',
            suggestion: 'Pin to a specific version for production builds',
          })
        }
      }

      // Count layers (RUN, COPY, ADD)
      if (['RUN', 'COPY', 'ADD'].includes(instruction)) {
        layerCount++
      }

      // Check for apt-get update without clean
      if (instruction === 'RUN' && line.includes('apt-get update')) {
        if (!line.includes('apt-get clean') && !line.includes('rm -rf /var/lib/apt/lists/*')) {
          detectedIssues.push({
            line: lineNum,
            type: 'warning',
            message: 'apt-get update without cleanup',
            suggestion: 'Add && rm -rf /var/lib/apt/lists/* to reduce image size',
          })
        }
      }

      // Check for COPY --chown usage
      if (instruction === 'COPY' && !line.includes('--chown') && !line.includes('WORKDIR /')) {
        detectedIssues.push({
          line: lineNum,
          type: 'info',
          message: 'Consider using --chown flag',
          suggestion: 'COPY --chown=user:group improves security and performance',
        })
      }

      // Check for ADD instead of COPY
      if (instruction === 'ADD' && !line.includes('.tar') && !line.includes('http')) {
        detectedIssues.push({
          line: lineNum,
          type: 'info',
          message: 'Consider using COPY instead of ADD',
          suggestion: 'ADD has implicit behavior; use COPY unless you need tar extraction',
        })
      }

      // Check for root user
      if (instruction === 'USER' && line.includes('USER root')) {
        detectedIssues.push({
          line: lineNum,
          type: 'warning',
          message: 'Running as root user',
          suggestion: 'Create and use a non-root user for security',
        })
      }

      // Check for exposed ports
      if (instruction === 'EXPOSE' && line.includes('22')) {
        detectedIssues.push({
          line: lineNum,
          type: 'warning',
          message: 'Exposing SSH port (22)',
          suggestion: 'Avoid SSH in containers; use docker exec instead',
        })
      }

      // Check for secrets in ENV
      if (instruction === 'ENV' && /password|secret|key|token/i.test(line)) {
        detectedIssues.push({
          line: lineNum,
          type: 'error',
          message: 'Potential secret in ENV variable',
          suggestion: 'Use Docker secrets or build-time arguments instead',
        })
      }

      // Check for WORKDIR
      if (instruction === 'WORKDIR' && line.includes('cd ')) {
        detectedIssues.push({
          line: lineNum,
          type: 'info',
          message: 'Using cd in WORKDIR',
          suggestion: 'WORKDIR automatically creates directories if needed',
        })
      }
    }

    // Check if FROM exists
    if (!hasFrom) {
      detectedIssues.push({
        line: 0,
        type: 'error',
        message: 'Missing FROM instruction',
        suggestion: 'Every Dockerfile must start with FROM (except ARG before FROM)',
      })
    }

    // Check layer count
    if (layerCount > 10) {
      detectedIssues.push({
        line: 0,
        type: 'info',
        message: `High layer count (${layerCount} layers)`,
        suggestion: 'Consider combining RUN commands with && to reduce layers',
      })
    }

    return detectedIssues
  }

  const calculateStats = (content: string): FormattingStats => {
    const lines = content.split('\n').filter((line) => line.trim() !== '')
    const instructions = lines.filter((line) => {
      const trimmed = line.trim()
      return trimmed !== '' && !trimmed.startsWith('#')
    })
    const layers = instructions.filter((line) => {
      const instruction = line.trim().split(/\s+/)[0].toUpperCase()
      return ['RUN', 'COPY', 'ADD'].includes(instruction)
    })

    return {
      totalLines: lines.length,
      instructions: instructions.length,
      layers: layers.length,
      issues: issues.length,
    }
  }

  const handleFormat = () => {
    if (!dockerfile.trim()) {
      toast.error('Please enter a Dockerfile to format')
      return
    }

    try {
      const formatted = formatDockerfile(dockerfile)
      const detectedIssues = analyzeDockerfile(dockerfile)

      setFormattedDockerfile(formatted)
      setIssues(detectedIssues)
      setStats(calculateStats(formatted))

      toast.success('Dockerfile formatted successfully!')
      trackToolEvent('dockerfile_formatter_format', {
        lines: formatted.split('\n').length,
        issues: detectedIssues.length,
      })
    } catch (error) {
      toast.error('Failed to format Dockerfile')
      console.error(error)
    }
  }

  const handleClear = () => {
    setDockerfile('')
    setFormattedDockerfile('')
    setIssues([])
    setStats({
      totalLines: 0,
      instructions: 0,
      layers: 0,
      issues: 0,
    })
    trackToolEvent('dockerfile_formatter_clear', {})
  }

  const handleCopy = () => {
    if (formattedDockerfile) {
      navigator.clipboard.writeText(formattedDockerfile)
      toast.success('Copied to clipboard!')
      trackToolEvent('dockerfile_formatter_copy', {})
    }
  }

  const getIssueIcon = (type: DockerfileIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className={css({ h: '4', w: '4', color: 'red.400' })} />
      case 'warning':
        return <AlertTriangle className={css({ h: '4', w: '4', color: 'orange.400' })} />
      case 'info':
        return <Info className={css({ h: '4', w: '4', color: 'blue.400' })} />
    }
  }

  const getIssueColor = (type: DockerfileIssue['type']) => {
    switch (type) {
      case 'error':
        return { border: 'red.500/30', bg: 'red.500/10', text: 'red.300' }
      case 'warning':
        return { border: 'orange.500/30', bg: 'orange.500/10', text: 'orange.300' }
      case 'info':
        return { border: 'blue.500/30', bg: 'blue.500/10', text: 'blue.300' }
    }
  }

  return (
    <main
      className={css({
        maxW: '7xl',
        mx: 'auto',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'cyan.500/30',
            bg: 'cyan.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Shield className={css({ h: '5', w: '5', color: 'cyan.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'cyan.300' })}>
            Best Practices • Security Checks • Layer Optimization
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            background:
              'linear-gradient(to right, var(--colors-cyan-400), var(--colors-blue-400), var(--colors-indigo-400))',
            backgroundClip: 'text',
          })}
          style={{ WebkitTextFillColor: 'transparent' }}
        >
          Dockerfile Formatter & Linter
        </h1>

        <p
          className={css({
            maxW: '3xl',
            mx: 'auto',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Beautify and lint Dockerfiles with intelligent formatting, best practice recommendations,
          and security checks. Optimize your container builds.
        </p>
      </div>

      {/* Input Section */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Input Dockerfile</CardTitle>
            <CardDescription>Paste your Dockerfile content below</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <textarea
              value={dockerfile}
              onChange={(e) => setDockerfile(e.target.value)}
              placeholder={`FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]`}
              className={css({
                w: 'full',
                minH: '64',
                p: '4',
                border: '1px solid',
                borderColor: 'gray.700',
                borderRadius: 'md',
                bg: 'gray.800/50',
                color: 'gray.100',
                fontSize: 'sm',
                fontFamily: 'mono',
                resize: 'vertical',
                _focus: {
                  outline: 'none',
                  borderColor: 'cyan.500',
                  ring: '2px',
                  ringColor: 'cyan.500/20',
                },
              })}
            />

            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleFormat}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Sparkles className={css({ h: '4', w: '4' })} />
                Format & Analyze
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <X className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      {formattedDockerfile && (
        <div
          className={css({
            display: 'grid',
            gap: '4',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0,
          })}
        >
          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <FileText
                className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'cyan.400' })}
              />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {stats.totalLines}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Total Lines</div>
            </CardContent>
          </Card>

          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <Zap className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'blue.400' })} />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {stats.instructions}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Instructions</div>
            </CardContent>
          </Card>

          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <Shield
                className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'indigo.400' })}
              />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {stats.layers}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Build Layers</div>
            </CardContent>
          </Card>

          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <AlertTriangle
                className={css({
                  h: '8',
                  w: '8',
                  mx: 'auto',
                  mb: '2',
                  color: stats.issues > 0 ? 'orange.400' : 'green.400',
                })}
              />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {stats.issues}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Issues Found</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issues Section */}
      {issues.length > 0 && (
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'orange.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ fontSize: 'lg' })}>
                Issues & Recommendations ({issues.length})
              </CardTitle>
              <CardDescription>Best practices and security suggestions</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              {issues.map((issue, idx) => {
                const colors = getIssueColor(issue.type)
                return (
                  <div
                    key={`issue-${issue.line}-${idx}`}
                    className={css({
                      p: '4',
                      border: '1px solid',
                      borderColor: colors.border,
                      bg: colors.bg,
                      borderRadius: 'md',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                      {getIssueIcon(issue.type)}
                      <div className={css({ flex: '1', spaceY: '1' })}>
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                          {issue.line > 0 && (
                            <span
                              className={css({
                                fontSize: 'xs',
                                fontFamily: 'mono',
                                color: 'white',
                              })}
                            >
                              Line {issue.line}
                            </span>
                          )}
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: colors.text,
                            })}
                          >
                            {issue.message}
                          </span>
                        </div>
                        {issue.suggestion && (
                          <p className={css({ fontSize: 'xs', color: 'white' })}>
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formatted Output Section */}
      {formattedDockerfile && (
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.4s',
            opacity: 0,
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <CardTitle className={css({ fontSize: 'lg' })}>Formatted Dockerfile</CardTitle>
                </div>
                <Button onClick={handleCopy} variant="ghost" size="sm">
                  <Copy className={css({ h: '4', w: '4' })} />
                </Button>
              </div>
              <CardDescription>Optimized and formatted output</CardDescription>
            </CardHeader>
            <CardContent>
              <pre
                className={css({
                  p: '4',
                  bg: 'gray.800/50',
                  borderRadius: 'md',
                  overflowX: 'auto',
                  fontSize: 'sm',
                  fontFamily: 'mono',
                  color: 'gray.100',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                })}
              >
                {formattedDockerfile}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Section */}
      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.5s',
          opacity: 0,
        })}
      >
        <Card className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}>
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3', fontSize: 'sm', color: 'white' })}>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Pin versions:</strong> Always use
                  specific image tags, never :latest
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Minimize layers:</strong> Combine RUN
                  commands with && to reduce image size
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Use .dockerignore:</strong> Exclude
                  unnecessary files from build context
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Multi-stage builds:</strong> Use
                  multiple FROM statements to reduce final image size
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}>
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3', fontSize: 'sm', color: 'white' })}>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Shield
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'cyan.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Non-root user:</strong> Always run
                  containers as non-root users
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Shield
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'cyan.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>No secrets:</strong> Never hardcode
                  secrets in Dockerfiles or images
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Shield
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'cyan.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Minimal base images:</strong> Use
                  alpine or distroless for smaller attack surface
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Shield
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'cyan.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Scan images:</strong> Regularly scan
                  images for vulnerabilities with tools like Trivy
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={null}>
        <ToolSearch />
      </Suspense>
    </main>
  )
}

export default function DockerfileFormatterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DockerfileFormatterContent />
    </Suspense>
  )
}
