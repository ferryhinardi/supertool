// Classic Cover Letter Template
// Traditional business letter format with timeless elegance

import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate } from '../../types'

interface ClassicTemplateProps {
  data: CoverLetterData
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { personal, recipient, position, content, date, salutation, signature } = data

  return (
    <div
      className={css({
        w: 'full',
        maxW: '210mm',
        minH: '297mm',
        mx: 'auto',
        bg: 'white',
        p: '20',
        fontFamily: 'Georgia, serif',
        color: 'black',
        lineHeight: '1.8',
        fontSize: 'sm',
      })}
    >
      {/* Header - Traditional format */}
      <div className={css({ mb: '8', textAlign: 'left' })}>
        <div className={css({ fontSize: 'lg', fontWeight: '600', mb: '2' })}>
          {personal.fullName}
        </div>
        {personal.location && <div>{personal.location}</div>}
        {personal.phone && <div>{personal.phone}</div>}
        {personal.email && <div>{personal.email}</div>}
        {personal.linkedin && <div className={css({ fontSize: 'xs' })}>{personal.linkedin}</div>}
      </div>

      {/* Date */}
      <div className={css({ mb: '8' })}>{formatDate(date)}</div>

      {/* Recipient address */}
      {recipient.companyName && (
        <div className={css({ mb: '8', lineHeight: '1.6' })}>
          {recipient.hiringManagerName && (
            <div>
              {recipient.hiringManagerName}
              {recipient.hiringManagerTitle && <>, {recipient.hiringManagerTitle}</>}
            </div>
          )}
          <div>{recipient.companyName}</div>
          {recipient.department && <div>{recipient.department}</div>}
          {recipient.companyAddress && <div>{recipient.companyAddress}</div>}
        </div>
      )}

      {/* Subject line (optional) */}
      {position && (
        <div className={css({ mb: '6', fontWeight: '600' })}>
          Re: Application for {position} Position
        </div>
      )}

      {/* Salutation */}
      <div className={css({ mb: '6' })}>{salutation},</div>

      {/* Opening paragraph */}
      {content.opening && (
        <p className={css({ mb: '6', textAlign: 'justify', textIndent: '2em' })}>
          {content.opening}
        </p>
      )}

      {/* Body content - preserve paragraphs */}
      {content.body && (
        <div className={css({ mb: '6', whiteSpace: 'pre-wrap' })}>
          {content.body.split('\n\n').map((paragraph) => (
            <p
              key={paragraph.substring(0, 50)}
              className={css({ mb: '6', textAlign: 'justify', textIndent: '2em' })}
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Closing paragraph */}
      {content.closing && (
        <p className={css({ mb: '6', textAlign: 'justify', textIndent: '2em' })}>
          {content.closing}
        </p>
      )}

      {/* Call to action */}
      {content.callToAction && (
        <p className={css({ mb: '8', textAlign: 'justify', textIndent: '2em' })}>
          {content.callToAction}
        </p>
      )}

      {/* Signature */}
      <div className={css({ mt: '12' })}>
        <div className={css({ mb: '16' })}>{signature},</div>
        <div className={css({ fontWeight: '600' })}>{personal.fullName}</div>
      </div>
    </div>
  )
}
