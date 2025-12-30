// Minimal Cover Letter Template
// Simple and elegant with maximum readability

import { css } from '@/styled-system/css'
import type { CoverLetterData } from '../../types'
import { formatDate } from '../../types'

interface MinimalTemplateProps {
  data: CoverLetterData
}

export function MinimalTemplate({ data }: MinimalTemplateProps) {
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
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'black',
        lineHeight: '1.8',
        fontSize: 'sm',
      })}
    >
      {/* Minimal header */}
      <div
        className={css({ mb: '10', pb: '6', borderBottom: '1px solid', borderColor: 'gray.200' })}
      >
        <h1 className={css({ fontSize: 'xl', fontWeight: '400', mb: '3', letterSpacing: 'wide' })}>
          {personal.fullName}
        </h1>
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4',
            fontSize: 'xs',
            color: 'gray.600',
          })}
        >
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </div>

      {/* Date */}
      <div className={css({ mb: '8', fontSize: 'xs', color: 'gray.500' })}>{formatDate(date)}</div>

      {/* Recipient */}
      {recipient.companyName && (
        <div className={css({ mb: '8', fontSize: 'xs', lineHeight: '1.6', color: 'gray.700' })}>
          {recipient.hiringManagerName && (
            <div>
              {recipient.hiringManagerName}
              {recipient.hiringManagerTitle && `, ${recipient.hiringManagerTitle}`}
            </div>
          )}
          <div>{recipient.companyName}</div>
          {recipient.department && <div>{recipient.department}</div>}
        </div>
      )}

      {/* Salutation */}
      <div className={css({ mb: '6', color: 'black' })}>{salutation},</div>

      {/* Content - clean and simple */}
      {content.opening && (
        <p className={css({ mb: '6', textAlign: 'justify', color: 'gray.800' })}>
          {content.opening}
        </p>
      )}

      {content.body && (
        <div
          className={css({
            mb: '6',
            textAlign: 'justify',
            whiteSpace: 'pre-wrap',
            color: 'gray.800',
          })}
        >
          {content.body}
        </div>
      )}

      {content.closing && (
        <p className={css({ mb: '6', textAlign: 'justify', color: 'gray.800' })}>
          {content.closing}
        </p>
      )}

      {content.callToAction && (
        <p className={css({ mb: '10', textAlign: 'justify', color: 'gray.800' })}>
          {content.callToAction}
        </p>
      )}

      {/* Minimal signature */}
      <div className={css({ mt: '16', pt: '6', borderTop: '1px solid', borderColor: 'gray.200' })}>
        <div className={css({ mb: '2', fontSize: 'xs', color: 'gray.600' })}>{signature},</div>
        <div className={css({ fontWeight: '400', letterSpacing: 'wide' })}>{personal.fullName}</div>
      </div>

      {/* Position reference - subtle */}
      {position && (
        <div
          className={css({
            mt: '12',
            pt: '6',
            borderTop: '1px solid',
            borderColor: 'gray.100',
            fontSize: 'xs',
            color: 'gray.400',
            textAlign: 'center',
          })}
        >
          {position} • {recipient.companyName}
        </div>
      )}
    </div>
  )
}
