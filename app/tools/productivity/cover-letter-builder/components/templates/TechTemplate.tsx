import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate, formatPhoneNumber } from '../../utils'

interface TechTemplateProps {
  data: CoverLetterData
}

export function TechTemplate({ data }: TechTemplateProps) {
  const { personal, recipient, content, date, salutation, signature } = data

  return (
    <div
      className={css({
        w: '210mm',
        minH: '297mm',
        bg: 'white',
        color: '#1a202c',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        p: '20mm 25mm',
        fontSize: '10.5pt',
        lineHeight: '1.7',
      })}
    >
      {/* Header with accent bar */}
      <div className={css({ mb: '8' })}>
        <div
          className={css({
            h: '1',
            w: '60px',
            bg: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            mb: '4',
          })}
        />
        <h1
          className={css({
            fontSize: '26pt',
            fontWeight: 'bold',
            color: '#1a202c',
            mb: '3',
            letterSpacing: '-0.5px',
          })}
        >
          {personal.fullName}
        </h1>
        <div className={css({ fontSize: '10pt', color: '#4a5568', lineHeight: '1.8' })}>
          <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap', mb: '1' })}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{formatPhoneNumber(personal.phone)}</span>}
          </div>
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedin && (
            <div className={css({ color: '#3b82f6' })}>{personal.linkedin}</div>
          )}
          {personal.portfolio && (
            <div className={css({ color: '#8b5cf6' })}>{personal.portfolio}</div>
          )}
        </div>
      </div>

      {/* Date */}
      {date && (
        <div className={css({ mb: '6', fontSize: '9.5pt', color: '#718096' })}>
          {formatDate(date)}
        </div>
      )}

      {/* Recipient */}
      {(recipient.hiringManagerName || recipient.companyName) && (
        <div className={css({ mb: '6', fontSize: '10pt', lineHeight: '1.6', color: '#2d3748' })}>
          {recipient.hiringManagerName && (
            <div className={css({ fontWeight: 'semibold' })}>{recipient.hiringManagerName}</div>
          )}
          {recipient.hiringManagerTitle && <div>{recipient.hiringManagerTitle}</div>}
          {recipient.companyName && (
            <div className={css({ fontWeight: 'bold', color: '#1a202c' })}>
              {recipient.companyName}
            </div>
          )}
          {recipient.department && <div>{recipient.department}</div>}
          {recipient.companyAddress && (
            <div className={css({ fontSize: '9.5pt' })}>{recipient.companyAddress}</div>
          )}
        </div>
      )}

      {/* Salutation */}
      {salutation && (
        <div
          className={css({ mb: '6', fontWeight: 'semibold', fontSize: '11pt', color: '#1a202c' })}
        >
          {salutation},
        </div>
      )}

      {/* Opening paragraph */}
      {content.opening && (
        <div className={css({ mb: '6', textAlign: 'justify' })}>{content.opening}</div>
      )}

      {/* Body paragraphs - with subtle left border */}
      {content.body && (
        <div
          className={css({
            mb: '6',
            whiteSpace: 'pre-wrap',
            pl: '4',
            borderLeft: '3px solid',
            borderColor: '#e2e8f0',
          })}
        >
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
        <div className={css({ mb: '8', textAlign: 'justify', fontWeight: 'medium' })}>
          {content.callToAction}
        </div>
      )}

      {/* Signature with accent */}
      <div className={css({ mt: '8' })}>
        {signature && <div className={css({ mb: '16', color: '#4a5568' })}>{signature},</div>}
        {personal.fullName && (
          <div>
            <div
              className={css({ fontWeight: 'bold', fontSize: '12pt', color: '#1a202c', mb: '1' })}
            >
              {personal.fullName}
            </div>
            <div
              className={css({
                h: '0.5',
                w: '40px',
                bg: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
