'use client'

import { AlertCircle, Lightbulb, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { css } from '@/styled-system/css'

type FeedbackType = 'idea' | 'issue'

export function FeedbackDialog() {
  const [open, setOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('idea')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast.error('Please enter your feedback')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          email: email || 'anonymous',
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send feedback')
      }

      toast.success("Thank you for your feedback! We'll review it soon.")
      setMessage('')
      setEmail('')
      setFeedbackType('idea')
      setOpen(false)
    } catch (error) {
      console.error('Error sending feedback:', error)
      toast.error('Failed to send feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(details) => setOpen(details.open)}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className={css({
            gap: '2',
            bgGradient: 'to-r',
            gradientFrom: 'purple.500',
            gradientTo: 'pink.500',
            color: 'white',
            fontWeight: 'semibold',
            fontSize: 'md',
            shadow: 'lg',
            px: '6',
            py: '2.5',
            _hover: {
              transform: 'scale(1.05)',
              shadow: 'xl',
            },
          })}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(168, 85, 247, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(168, 85, 247, 0.5)'
          }}
        >
          <MessageSquare style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          maxWidth: '500px',
          padding: '1.5rem',
        }}
      >
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share your ideas or report issues to help us improve SuperTool.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* Feedback Type Selection */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setFeedbackType('idea')}
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: feedbackType === 'idea' ? 'rgb(59, 130, 246)' : 'rgb(64, 64, 64)',
                backgroundColor:
                  feedbackType === 'idea' ? 'rgba(59, 130, 246, 0.1)' : 'rgb(38, 38, 38)',
                color: feedbackType === 'idea' ? 'rgb(59, 130, 246)' : 'rgb(163, 163, 163)',
                padding: '0.75rem',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
            >
              <Lightbulb style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontWeight: 500 }}>Idea</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('issue')}
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: feedbackType === 'issue' ? 'rgb(239, 68, 68)' : 'rgb(64, 64, 64)',
                backgroundColor:
                  feedbackType === 'issue' ? 'rgba(239, 68, 68, 0.1)' : 'rgb(38, 38, 38)',
                color: feedbackType === 'issue' ? 'rgb(239, 68, 68)' : 'rgb(163, 163, 163)',
                padding: '0.75rem',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
            >
              <AlertCircle style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontWeight: 500 }}>Issue</span>
            </button>
          </div>

          {/* Email Input (Optional) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="email"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(229, 229, 229)' }}
            >
              Email <span style={{ color: 'rgb(115, 115, 115)' }}>(optional)</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderColor: 'rgb(64, 64, 64)',
                backgroundColor: 'rgb(38, 38, 38)',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'rgb(115, 115, 115)' }}>
              Provide your email if you&apos;d like us to follow up with you.
            </p>
          </div>

          {/* Message Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="message"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(229, 229, 229)' }}
            >
              {feedbackType === 'idea' ? 'Your Idea' : 'Describe the Issue'}
            </label>
            <Textarea
              id="message"
              placeholder={
                feedbackType === 'idea'
                  ? 'Share your idea for a new feature or improvement...'
                  : 'Describe the issue you encountered...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                minHeight: '120px',
                borderColor: 'rgb(64, 64, 64)',
                backgroundColor: 'rgb(38, 38, 38)',
              }}
              required
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              style={{
                borderColor: 'rgb(64, 64, 64)',
                backgroundColor: 'rgb(38, 38, 38)',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingTop: '0.125rem',
                paddingBottom: '0.125rem',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(168, 85, 247))',
                color: 'white',
                border: 'none',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingTop: '0.125rem',
                paddingBottom: '0.125rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '9999px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send style={{ width: '1rem', height: '1rem' }} />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
