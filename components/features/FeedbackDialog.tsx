'use client'

import { useState } from 'react'
import { MessageSquare, Lightbulb, AlertCircle, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

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
          size="lg"
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/60"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share your ideas or report issues to help us improve SuperTool.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFeedbackType('idea')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                feedbackType === 'idea'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              <span className="font-medium">Idea</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('issue')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                feedbackType === 'issue'
                  ? 'border-red-500 bg-red-500/10 text-red-500'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Issue</span>
            </button>
          </div>

          {/* Email Input (Optional) */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-neutral-200">
              Email <span className="text-neutral-500">(optional)</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-neutral-700 bg-neutral-800"
            />
            <p className="text-xs text-neutral-500">
              Provide your email if you&apos;d like us to follow up with you.
            </p>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-neutral-200">
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
              className="min-h-[120px] border-neutral-700 bg-neutral-800"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
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
