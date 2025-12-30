/**
 * Error Boundary for Resume Templates
 * Catches and handles errors during template rendering
 * Provides graceful fallback UI when templates fail to load
 */

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class TemplateErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error('Template Error Boundary caught an error:', error, errorInfo)

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div
          className={css({
            w: 'full',
            h: 'full',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'white',
            p: '8',
            textAlign: 'center',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '16',
              h: '16',
              rounded: 'full',
              bg: 'red.100',
              mb: '4',
            })}
          >
            <AlertCircle className={css({ w: '8', h: '8', color: 'red.600' })} />
          </div>

          <h3
            className={css({
              fontSize: 'lg',
              fontWeight: 'semibold',
              color: 'gray.900',
              mb: '2',
            })}
          >
            Template Failed to Load
          </h3>

          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.600',
              mb: '4',
              maxW: 'md',
            })}
          >
            Something went wrong while rendering this template. Try selecting a different template
            or refreshing the page.
          </p>

          <Button onClick={this.handleReset} variant="outline" size="sm">
            <RefreshCw className={css({ w: '4', h: '4', mr: '2' })} />
            Try Again
          </Button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              className={css({
                mt: '6',
                p: '4',
                bg: 'gray.100',
                rounded: 'md',
                textAlign: 'left',
                maxW: 'full',
                overflow: 'auto',
              })}
            >
              <summary
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.700',
                  cursor: 'pointer',
                })}
              >
                Error Details (Development Only)
              </summary>
              <pre
                className={css({
                  mt: '2',
                  fontSize: 'xs',
                  color: 'red.700',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                })}
              >
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
