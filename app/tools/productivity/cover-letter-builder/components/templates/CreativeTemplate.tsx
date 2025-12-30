// Creative Cover Letter Template
// Bold design for creative industries and startups

import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate } from '../../types'

interface CreativeTemplateProps {
  data: CoverLetterData
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { personal, recipient, position, content, date, salutation, signature } = data

  return (
    <div
      className={css({
        w: 'full',
        maxW: '210mm',
        minH: '297mm',
        mx: 'auto',
        bg: 'white',
        p: '16',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'gray.900',
        lineHeight: '1.7',
      })}
    >
      {/* Creative header with gradient */}
      <div
        className={css({
          bg: 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(239, 68, 68) 50%, rgb(245, 158, 11) 100%)',
          color: 'white',
          p: '8',
          mb: '8',
          borderRadius: 'lg',
          textAlign: 'center',
        })}
      >
        <h1
          className={css({ fontSize: '3xl', fontWeight: 'bold', mb: '3', letterSpacing: 'tight' })}
        >
          {personal.fullName}
        </h1>
        <div className={css({ fontSize: 'sm', opacity: '0.95' })}>
          {personal.email} {personal.phone && `• ${personal.phone}`}
        </div>
        {personal.location && (
          <div className={css({ fontSize: 'sm', opacity: '0.9', mt: '1' })}>
            {personal.location}
          </div>
        )}
      </div>

      {/* Date with accent */}
      <div
        className={css({ mb: '6', fontSize: 'sm', color: 'rgb(236, 72, 153)', fontWeight: '600' })}
      >
        {formatDate(date)}
      </div>

      {/* Recipient in card */}
      {recipient.companyName && (
        <div
          className={css({
            mb: '6',
            p: '5',
            bg: 'linear-gradient(135deg, rgb(254, 202, 202) 0%, rgb(254, 215, 170) 100%)',
            borderRadius: 'lg',
            fontSize: 'sm',
          })}
        >
          {recipient.hiringManagerName && (
            <div className={css({ fontWeight: '700', fontSize: 'md', color: 'rgb(239, 68, 68)' })}>
              {recipient.hiringManagerName}
              {recipient.hiringManagerTitle && (
                <span className={css({ fontWeight: '400' })}>, {recipient.hiringManagerTitle}</span>
              )}
            </div>
          )}
          <div className={css({ fontWeight: '600', color: 'rgb(245, 158, 11)' })}>
            {recipient.companyName}
          </div>
          {recipient.department && (
            <div className={css({ color: 'gray.700', mt: '1' })}>{recipient.department}</div>
          )}
        </div>
      )}

      {/* Position badge */}
      {position && (
        <div
          className={css({
            display: 'inline-block',
            mb: '6',
            px: '4',
            py: '2',
            bg: 'rgb(236, 72, 153)',
            color: 'white',
            borderRadius: 'full',
            fontSize: 'sm',
            fontWeight: '600',
          })}
        >
          Applying for: {position}
        </div>
      )}

      {/* Salutation */}
      <div
        className={css({ mb: '5', fontSize: 'lg', fontWeight: '600', color: 'rgb(239, 68, 68)' })}
      >
        {salutation} 👋
      </div>

      {/* Content */}
      {content.opening && <p className={css({ mb: '5', fontSize: 'md' })}>{content.opening}</p>}

      {content.body && (
        <div className={css({ mb: '5', whiteSpace: 'pre-wrap', fontSize: 'md' })}>
          {content.body}
        </div>
      )}

      {content.closing && <p className={css({ mb: '5', fontSize: 'md' })}>{content.closing}</p>}

      {content.callToAction && (
        <p
          className={css({
            mb: '8',
            fontSize: 'md',
            fontWeight: '500',
            color: 'rgb(245, 158, 11)',
          })}
        >
          {content.callToAction}
        </p>
      )}

      {/* Creative signature */}
      <div className={css({ mt: '12' })}>
        <div className={css({ mb: '2', fontSize: 'md' })}>{signature},</div>
        <div
          className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'rgb(236, 72, 153)',
          })}
        >
          {personal.fullName}
        </div>
      </div>
    </div>
  )
}
