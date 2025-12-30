// Modern Cover Letter Template
// Clean design with contemporary typography and blue accent colors

import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate } from '../../types'

interface ModernTemplateProps {
  data: CoverLetterData
}

export function ModernTemplate({ data }: ModernTemplateProps) {
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
        lineHeight: '1.6',
      })}
    >
      {/* Header with name and contact info */}
      <div
        className={css({
          borderBottom: '3px solid',
          borderColor: 'blue.500',
          pb: '4',
          mb: '6',
        })}
      >
        <h1
          className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'blue.600',
            mb: '2',
          })}
        >
          {personal.fullName}
        </h1>
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4',
            fontSize: 'sm',
            color: 'gray.700',
          })}
        >
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>•</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>•</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
        {(personal.linkedin || personal.portfolio) && (
          <div
            className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4',
              fontSize: 'sm',
              color: 'blue.600',
              mt: '1',
            })}
          >
            {personal.linkedin && <span>{personal.linkedin}</span>}
            {personal.portfolio && personal.linkedin && <span>•</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* Date */}
      <div className={css({ mb: '6', fontSize: 'sm', color: 'gray.700' })}>{formatDate(date)}</div>

      {/* Recipient info */}
      {recipient.companyName && (
        <div className={css({ mb: '6', fontSize: 'sm', lineHeight: '1.8' })}>
          {recipient.hiringManagerName && (
            <div className={css({ fontWeight: '500' })}>
              {recipient.hiringManagerName}
              {recipient.hiringManagerTitle && `, ${recipient.hiringManagerTitle}`}
            </div>
          )}
          <div className={css({ fontWeight: '500' })}>{recipient.companyName}</div>
          {recipient.department && <div>{recipient.department}</div>}
          {recipient.companyAddress && <div>{recipient.companyAddress}</div>}
        </div>
      )}

      {/* Salutation */}
      <div className={css({ mb: '4', fontWeight: '500' })}>{salutation},</div>

      {/* Opening paragraph */}
      {content.opening && (
        <p className={css({ mb: '4', textAlign: 'justify' })}>{content.opening}</p>
      )}

      {/* Body content */}
      {content.body && (
        <div className={css({ mb: '4', textAlign: 'justify', whiteSpace: 'pre-wrap' })}>
          {content.body}
        </div>
      )}

      {/* Closing paragraph */}
      {content.closing && (
        <p className={css({ mb: '4', textAlign: 'justify' })}>{content.closing}</p>
      )}

      {/* Call to action */}
      {content.callToAction && (
        <p className={css({ mb: '6', textAlign: 'justify' })}>{content.callToAction}</p>
      )}

      {/* Signature */}
      <div className={css({ mt: '8' })}>
        <div className={css({ mb: '1' })}>{signature},</div>
        <div className={css({ fontWeight: '600', color: 'blue.600' })}>{personal.fullName}</div>
      </div>

      {/* Position reference */}
      {position && (
        <div
          className={css({
            mt: '8',
            pt: '4',
            borderTop: '1px solid',
            borderColor: 'gray.200',
            fontSize: 'xs',
            color: 'gray.500',
            textAlign: 'center',
          })}
        >
          Application for: {position} at {recipient.companyName}
        </div>
      )}
    </div>
  )
}
