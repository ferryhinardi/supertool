import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate, formatPhoneNumber } from '../../utils'

interface ExecutiveTemplateProps {
  data: CoverLetterData
}

export function ExecutiveTemplate({ data }: ExecutiveTemplateProps) {
  const { personal, recipient, content, date, salutation, signature } = data

  return (
    <div
      className={css({
        w: '210mm',
        minH: '297mm',
        bg: 'white',
        color: 'black',
        fontFamily: 'Georgia, serif',
        p: '20mm 25mm',
        fontSize: '11pt',
        lineHeight: '1.6',
      })}
    >
      {/* Header with name and contact */}
      <div
        className={css({
          mb: '8',
          pb: '4',
          borderBottom: '3px solid',
          borderColor: '#1a365d',
        })}
      >
        <h1
          className={css({
            fontSize: '28pt',
            fontWeight: 'bold',
            color: '#1a365d',
            mb: '2',
            letterSpacing: '0.5px',
          })}
        >
          {personal.fullName}
        </h1>
        <div className={css({ fontSize: '10pt', color: '#2d3748', lineHeight: '1.8' })}>
          {personal.location && <div>{personal.location}</div>}
          <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap' })}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{formatPhoneNumber(personal.phone)}</span>}
          </div>
          {personal.linkedin && (
            <div className={css({ fontSize: '9pt', color: '#4a5568' })}>{personal.linkedin}</div>
          )}
        </div>
      </div>

      {/* Date */}
      {date && (
        <div className={css({ mb: '6', fontSize: '10pt', color: '#2d3748' })}>
          {formatDate(date)}
        </div>
      )}

      {/* Recipient */}
      {(recipient.hiringManagerName || recipient.companyName) && (
        <div className={css({ mb: '6', fontSize: '10pt', lineHeight: '1.6' })}>
          {recipient.hiringManagerName && (
            <div className={css({ fontWeight: 'bold' })}>{recipient.hiringManagerName}</div>
          )}
          {recipient.hiringManagerTitle && <div>{recipient.hiringManagerTitle}</div>}
          {recipient.companyName && (
            <div className={css({ fontWeight: 'semibold', color: '#1a365d' })}>
              {recipient.companyName}
            </div>
          )}
          {recipient.department && <div>{recipient.department}</div>}
          {recipient.companyAddress && <div>{recipient.companyAddress}</div>}
        </div>
      )}

      {/* Salutation */}
      {salutation && (
        <div className={css({ mb: '6', fontWeight: 'semibold', fontSize: '11pt' })}>
          {salutation},
        </div>
      )}

      {/* Opening paragraph */}
      {content.opening && (
        <div className={css({ mb: '6', textAlign: 'justify' })}>{content.opening}</div>
      )}

      {/* Body paragraphs */}
      {content.body && (
        <div className={css({ mb: '6', whiteSpace: 'pre-wrap' })}>
          {content.body.split('\n\n').map((paragraph) => (
            <p key={paragraph.substring(0, 50)} className={css({ mb: '6', textAlign: 'justify' })}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Closing paragraph */}
      {content.closing && (
        <div className={css({ mb: '6', textAlign: 'justify' })}>{content.closing}</div>
      )}

      {/* Call to action */}
      {content.callToAction && (
        <div className={css({ mb: '8', textAlign: 'justify' })}>{content.callToAction}</div>
      )}

      {/* Signature */}
      <div className={css({ mt: '8' })}>
        {signature && <div className={css({ mb: '16' })}>{signature},</div>}
        {personal.fullName && (
          <div className={css({ fontWeight: 'bold', fontSize: '12pt', color: '#1a365d' })}>
            {personal.fullName}
          </div>
        )}
      </div>
    </div>
  )
}
