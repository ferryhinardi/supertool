'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'
import { Button } from './button'
import { Card, CardContent } from './card'

interface SocialShareProps {
  toolName: string
  toolUrl: string
  description: string
  hashtags?: string[]
}

export function SocialShare({ toolName, toolUrl, description, hashtags = [] }: SocialShareProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${toolUrl}` : toolUrl

  const handleTwitterShare = () => {
    const text = `${description} 🚀`
    const hashtagString = hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : ''
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}${hashtagString}`

    trackEvent({
      action: 'social_share',
      category: 'engagement',
      label: `twitter_${toolName}`,
    })

    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`

    trackEvent({
      action: 'social_share',
      category: 'engagement',
      label: `linkedin_${toolName}`,
    })

    window.open(linkedInUrl, '_blank', 'width=600,height=600')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      trackEvent({
        action: 'social_share',
        category: 'engagement',
        label: `copy_link_${toolName}`,
      })
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Card
      className={css({
        border: '1px solid',
        borderColor: 'purple.500/20',
        bg: 'gray.900/50',
        backdropFilter: 'blur(16px)',
        w: 'full',
      })}
    >
      <CardContent className={css({ py: '6' })}>
        <div className={css({ spaceY: '4' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
            <Share2 className={css({ h: '6', w: '6', color: 'purple.400' })} />
            <div>
              <h3
                className={css({
                  fontSize: { base: 'lg', md: 'xl' },
                  fontWeight: 'bold',
                  color: 'white',
                })}
              >
                Share This Tool
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>
                Help others discover this free tool
              </p>
            </div>
          </div>

          <div
            className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: '3',
            })}
          >
            <Button
              onClick={handleTwitterShare}
              variant="outline"
              className={css({
                flex: { base: '1 1 100%', sm: '1 1 auto' },
                h: '12',
                borderColor: 'blue.500/50',
                bg: 'blue.500/10',
                _hover: {
                  bg: 'blue.500/20',
                  borderColor: 'blue.500/70',
                },
              })}
            >
              <svg
                className={css({ h: '5', w: '5', mr: '2' })}
                fill="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="X (Twitter) logo"
              >
                <title>X (Twitter)</title>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X (Twitter)
            </Button>

            <Button
              onClick={handleLinkedInShare}
              variant="outline"
              className={css({
                flex: { base: '1 1 100%', sm: '1 1 auto' },
                h: '12',
                borderColor: 'blue.600/50',
                bg: 'blue.600/10',
                _hover: {
                  bg: 'blue.600/20',
                  borderColor: 'blue.600/70',
                },
              })}
            >
              <svg
                className={css({ h: '5', w: '5', mr: '2' })}
                fill="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="LinkedIn logo"
              >
                <title>LinkedIn</title>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className={css({
                flex: { base: '1 1 100%', sm: '0 1 auto' },
                h: '12',
                borderColor: 'gray.600',
                bg: 'gray.800/50',
                _hover: {
                  bg: 'gray.700/50',
                  borderColor: 'gray.500',
                },
              })}
            >
              <Share2 className={css({ h: '5', w: '5', mr: '2' })} />
              Copy Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
