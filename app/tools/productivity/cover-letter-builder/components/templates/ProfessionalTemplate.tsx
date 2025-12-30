// Professional Cover Letter Template
// Corporate-ready design with structured layout

import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate } from '../../types'

interface ProfessionalTemplateProps {
  data: CoverLetterData
}

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
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
        fontFamily: 'Arial, sans-serif',
        color: 'gray.900',
        lineHeight: '1.6',
        fontSize: 'sm',
      })}
    >
      {/* Header with navy accent */}
      <div
        className={css({
          bg: 'rgb(30, 58, 138)',
          color: 'white',
          p: '6',
          mb: '8',
          borderRadius: 'sm',
        })}
      >
        <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>
          {personal.fullName}
        </h1>
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '3',
            fontSize: 'xs',
            opacity: '0.9',
          })}
        >
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>|</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>|</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </div>

      {/* Date */}
      <div className={css({ mb: '6', fontSize: 'sm', color: 'gray.600' })}>{formatDate(date)}</div>

      {/* Recipient */}
      {recipient.companyName && (
        <div
          className={css({ mb: '6', p: '4', bg: 'gray.50', borderRadius: 'sm', fontSize: 'sm' })}
        >
          {recipient.hiringManagerName && (
            <div className={css({ fontWeight: '600' })}>
              {recipient.hiringManagerName}
              {recipient.hiringManagerTitle && `, ${recipient.hiringManagerTitle}`}
            </div>
          )}
          <div className={css({ fontWeight: '600' })}>{recipient.companyName}</div>
          {recipient.department && (
            <div className={css({ color: 'gray.600' })}>{recipient.department}</div>
          )}
        </div>
      )}

      {/* Position header */}
      {position && (
        <div
          className={css({
            mb: '6',
            p: '3',
            bg: 'rgb(219, 234, 254)',
            borderLeft: '4px solid',
            borderColor: 'rgb(30, 58, 138)',
            fontWeight: '600',
            fontSize: 'sm',
          })}
        >
          RE: {position}
        </div>
      )}

      {/* Salutation */}
      <div className={css({ mb: '4', fontWeight: '600' })}>{salutation},</div>

      {/* Content sections */}
      {content.opening && (
        <p className={css({ mb: '4', textAlign: 'justify' })}>{content.opening}</p>
      )}

      {content.body && (
        <div className={css({ mb: '4', textAlign: 'justify', whiteSpace: 'pre-wrap' })}>
          {content.body}
        </div>
      )}

      {content.closing && (
        <p className={css({ mb: '4', textAlign: 'justify' })}>{content.closing}</p>
      )}

      {content.callToAction && (
        <p className={css({ mb: '8', textAlign: 'justify' })}>{content.callToAction}</p>
      )}

      {/* Signature */}
      <div className={css({ mt: '10' })}>
        <div className={css({ mb: '1' })}>{signature},</div>
        <div className={css({ fontWeight: '700', fontSize: 'lg', color: 'rgb(30, 58, 138)' })}>
          {personal.fullName}
        </div>
      </div>
    </div>
  )
}
