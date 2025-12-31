'use client'

import { Activity, AlertCircle, Copy, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { css } from '@/styled-system/css'

export default function WebhookTesterPage() {
  const [webhookUrl] = useState('https://supertool.app/api/webhooks/[your-id]')

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook URL copied to clipboard!')
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
      {/* Header */}
      <div className={css({ textAlign: 'center', spaceY: '3' })}>
        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
          })}
        >
          <Activity className={css({ color: 'green.400', animation: 'pulse 2s infinite' })} />
          <span>Webhook Tester</span>
        </h1>
        <p className={css({ color: 'gray.400', fontSize: { base: 'sm', sm: 'base' } })}>
          Test and debug webhooks in real-time
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div
        className={css({
          p: '6',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderRadius: 'xl',
          textAlign: 'center',
        })}
      >
        <AlertCircle
          className={css({ w: '16', h: '16', mx: 'auto', mb: '4', color: 'blue.400' })}
        />
        <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '3' })}>Coming Soon! 🚀</h2>
        <p className={css({ color: 'gray.300', fontSize: 'lg', mb: '4' })}>
          The Webhook Tester is currently under development and will be available soon.
        </p>
        <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
          This tool will allow you to generate unique webhook URLs, inspect incoming requests in
          real-time, and customize responses.
        </p>
      </div>

      {/* Feature Preview */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
          gap: '4',
        })}
      >
        <div
          className={css({
            p: '6',
            bg: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            borderRadius: 'xl',
          })}
        >
          <Plus className={css({ w: '8', h: '8', mb: '3', color: 'purple.400' })} />
          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '2' })}>
            Generate URLs
          </h3>
          <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
            Create unique webhook endpoints instantly
          </p>
        </div>

        <div
          className={css({
            p: '6',
            bg: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            borderRadius: 'xl',
          })}
        >
          <Activity className={css({ w: '8', h: '8', mb: '3', color: 'green.400' })} />
          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '2' })}>
            Real-Time Updates
          </h3>
          <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
            See incoming requests as they happen
          </p>
        </div>

        <div
          className={css({
            p: '6',
            bg: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            borderRadius: 'xl',
          })}
        >
          <Copy className={css({ w: '8', h: '8', mb: '3', color: 'blue.400' })} />
          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '2' })}>
            Inspect & Debug
          </h3>
          <p className={css({ color: 'gray.400', fontSize: 'sm' })}>
            View headers, body, and query parameters
          </p>
        </div>
      </div>

      {/* Demo URL */}
      <div
        className={css({
          p: '4',
          bg: 'rgba(17, 24, 39, 0.8)',
          border: '2px solid',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          borderRadius: 'xl',
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '2',
          })}
        >
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
            Example Webhook URL
          </span>
          <button
            type="button"
            onClick={copyUrl}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              px: '3',
              py: '1.5',
              fontSize: 'sm',
              color: 'purple.400',
              bg: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderRadius: 'md',
              cursor: 'pointer',
              transition: 'all 0.2s',
              _hover: {
                bg: 'rgba(139, 92, 246, 0.2)',
              },
            })}
          >
            <Copy className={css({ w: '4', h: '4' })} />
            Copy
          </button>
        </div>
        <code
          className={css({
            display: 'block',
            p: '3',
            bg: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'md',
            fontFamily: 'mono',
            fontSize: 'sm',
            color: 'gray.300',
            wordBreak: 'break-all',
          })}
        >
          {webhookUrl}
        </code>
      </div>
    </main>
  )
}
